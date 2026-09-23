const {spawn}=require('child_process');
const fs=require('fs');
const os=require('os');
const path=require('path');
const http=require('http');

const port=18987;
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'waypoint-test-'));
const dataFile=path.join(tmp,'data.json');
const child=spawn(process.execPath,['server.js'],{cwd:path.join(__dirname,'..'),env:{...process.env,PORT:String(port),HOST:'127.0.0.1',WAYPOINT_DATA_FILE:dataFile},stdio:['ignore','pipe','pipe']});

const base=`http://127.0.0.1:${port}`;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function ready(){
  for(let i=0;i<50;i++){
    try{const r=await fetch(base+'/health');if(r.ok)return;}catch{}
    await wait(100);
  }
  throw new Error('server did not start');
}
async function sseNext(id,key){
  return await new Promise((resolve,reject)=>{
    const req=http.get(`${base}/api/trips/${encodeURIComponent(id)}/events?key=${encodeURIComponent(key)}`,res=>{
      let buf='';
      res.on('data',chunk=>{
        buf+=chunk.toString();
        const blocks=buf.split('\n\n');
        buf=blocks.pop();
        for(const block of blocks){
          if(block.includes('event: revision')){
            const line=block.split('\n').find(x=>x.startsWith('data: '));
            if(line){ try{resolve(JSON.parse(line.slice(6)));req.destroy();}catch(e){reject(e);} }
          }
        }
      });
    });
    req.on('error',reject);
    setTimeout(()=>{req.destroy();reject(new Error('SSE timeout'));},4000);
  });
}
(async()=>{
  const results=[];
  try{
    await ready();
    let r=await fetch(base+'/');
    results.push(['static index',r.ok&&(await r.text()).includes('Waypoint')]);
    r=await fetch(base+'/manifest.webmanifest');
    results.push(['manifest',r.ok&&(await r.json()).name.includes('Waypoint')]);
    r=await fetch(base+'/health');
    results.push(['health',r.ok&&(await r.json()).version==='4.5.2']);

    const id='trip-test',key='secret-edit-key';
    r=await fetch(base+`/api/trips/${id}`,{method:'PUT',headers:{'content-type':'application/json','x-edit-key':key},body:JSON.stringify({clientRevision:0,data:{waypointLive:1,trip:{name:'QA Trip'},days:[],bookings:[]}})});
    const created=await r.json();
    results.push(['create',r.ok&&created.revision===1]);

    r=await fetch(base+`/api/trips/${id}?key=${encodeURIComponent(key)}`);
    const got=await r.json();
    results.push(['read',r.ok&&got.data.trip.name==='QA Trip']);

    r=await fetch(base+`/api/trips/${id}?key=wrong`);
    results.push(['invalid key',r.status===403]);

    r=await fetch(base+`/api/trips/${id}`,{method:'PUT',headers:{'content-type':'application/json','x-edit-key':key},body:JSON.stringify({clientRevision:0,data:{trip:{name:'stale'}}})});
    results.push(['revision conflict',r.status===409]);

    const sse=sseNext(id,key);
    await wait(150);
    r=await fetch(base+`/api/trips/${id}`,{method:'PUT',headers:{'content-type':'application/json','x-edit-key':key},body:JSON.stringify({clientRevision:1,data:{waypointLive:1,trip:{name:'QA Trip Updated'},days:[],bookings:[]}})});
    const event=await sse;
    results.push(['live SSE event',r.ok&&event.revision===2]);

    r=await fetch(base+`/api/trips/${id}/chat`,{method:'POST',headers:{'content-type':'application/json','x-edit-key':key},body:JSON.stringify({text:'Hello from QA',name:'QA User',participantId:'qa-user'})});
    const sent=await r.json();
    results.push(['chat send',r.status===201&&sent.message&&sent.message.text==='Hello from QA']);

    r=await fetch(base+`/api/trips/${id}/chat?key=${encodeURIComponent(key)}`);
    const chat=await r.json();
    results.push(['chat read',r.ok&&Array.isArray(chat.messages)&&chat.messages.length===1&&chat.messages[0].name==='QA User']);

    r=await fetch(base+`/api/trips/${id}/chat?key=wrong`);
    results.push(['chat invalid key',r.status===403]);

    r=await fetch(base+`/api/trips/${id}/participants`,{method:'POST',headers:{'content-type':'application/json','x-edit-key':key},body:JSON.stringify({name:'QA User',participantId:'qa-participant'})});
    const participants=await r.json();
    results.push(['participant identity',r.ok&&participants.participants.some(p=>p.name==='QA User')]);

    r=await fetch(base+`/api/trips/${id}/participants?key=${encodeURIComponent(key)}`);
    const participantList=await r.json();
    results.push(['participant list',r.ok&&participantList.participants.length===1]);



    child.kill('SIGTERM');
    const failed=results.filter(x=>!x[1]);
    for(const [name,ok] of results) console.log(`${ok?'PASS':'FAIL'} ${name}`);
    if(failed.length) process.exit(1);
  }catch(e){
    child.kill('SIGTERM');
    console.error(e);
    process.exit(1);
  }
})();
