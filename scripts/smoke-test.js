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
    results.push(['health',r.ok&&(await r.json()).version==='8.0.1']);

    const id='trip-test',key='secret-edit-key',viewKey='secret-view-key';
    r=await fetch(base+`/api/trips/${id}`,{method:'PUT',headers:{'content-type':'application/json','x-edit-key':key,'x-view-key':viewKey},body:JSON.stringify({clientRevision:0,data:{waypointLive:1,trip:{name:'QA Trip'},days:[],bookings:[]}})});
    const created=await r.json();
    results.push(['create',r.ok&&created.revision===1]);

    r=await fetch(base+`/api/trips/${id}?key=${encodeURIComponent(key)}`);
    const got=await r.json();
    results.push(['read',r.ok&&got.data.trip.name==='QA Trip']);

    r=await fetch(base+`/api/trips/${id}?key=${encodeURIComponent(viewKey)}`);
    const viewerGot=await r.json();
    results.push(['viewer read access',r.ok&&viewerGot.data.trip.name==='QA Trip']);

    r=await fetch(base+`/api/trips/${id}`,{method:'PUT',headers:{'content-type':'application/json','x-edit-key':viewKey},body:JSON.stringify({clientRevision:1,data:{trip:{name:'Viewer should not edit'}}})});
    results.push(['viewer write blocked',r.status===403]);

    r=await fetch(base+`/api/trips/${id}?key=wrong`);
    results.push(['invalid key',r.status===403]);

    r=await fetch(base+`/api/trips/${id}`,{method:'PUT',headers:{'content-type':'application/json','x-edit-key':key},body:JSON.stringify({clientRevision:0,data:{trip:{name:'stale'}}})});
    results.push(['revision conflict',r.status===409]);

    const sse=sseNext(id,key);
    await wait(150);
    r=await fetch(base+`/api/trips/${id}`,{method:'PUT',headers:{'content-type':'application/json','x-edit-key':key},body:JSON.stringify({clientRevision:1,data:{waypointLive:1,trip:{name:'QA Trip Updated'},days:[],bookings:[]}})});
    const event=await sse;
    results.push(['live SSE event',r.ok&&event.revision===2]);

    r=await fetch(base+`/api/trips/${id}/participants`,{method:'POST',headers:{'content-type':'application/json','x-edit-key':key},body:JSON.stringify({name:'QA User',participantId:'qa-user'})});
    results.push(['participant preregistration',r.ok]);
r=await fetch(base+'/api/giphy-config');
    const giphyCfg=await r.json();
    results.push(['giphy config endpoint',r.ok&&typeof giphyCfg.enabled==='boolean']);


    r=await fetch(base+`/api/trips/${id}/participants`,{method:'POST',headers:{'content-type':'application/json','x-edit-key':key},body:JSON.stringify({name:'QA User',participantId:'qa-participant'})});
    const participants=await r.json();
    results.push(['participant identity',r.ok&&participants.participants.some(p=>p.name==='QA User')]);

    r=await fetch(base+`/api/trips/${id}/participants?key=${encodeURIComponent(key)}`);
    const participantList=await r.json();
    results.push(['participant list',r.ok&&participantList.participants.length===2]);

    r=await fetch(base+`/api/trips/${id}/participants`,{method:'POST',headers:{'content-type':'application/json','x-access-key':viewKey},body:JSON.stringify({name:'View User',participantId:'qa-viewer',role:'viewer'})});
    results.push(['viewer participant registration',r.ok]);
    r=await fetch(base+`/api/trips/${id}/chat?key=${encodeURIComponent(viewKey)}`);
    results.push(['viewer chat read',r.ok]);
    r=await fetch(base+`/api/trips/${id}/chat`,{method:'POST',headers:{'content-type':'application/json','x-edit-key':viewKey},body:JSON.stringify({text:'viewer cannot send',participantId:'qa-viewer'})});
    results.push(['viewer chat send blocked',r.status===403]);


    r=await fetch(base+`/api/trips/${id}/participants`,{method:'POST',headers:{'content-type':'application/json','x-edit-key':key},body:JSON.stringify({name:'Reader',participantId:'qa-reader'})});
    results.push(['read receipt participant',r.ok]);

    r=await fetch(base+`/api/trips/${id}/chat`,{method:'POST',headers:{'content-type':'application/json','x-edit-key':key},body:JSON.stringify({text:'Read me',participantId:'qa-user',clientMessageId:'read-me-1'})});
    const readMsg=await r.json();

    r=await fetch(base+`/api/trips/${id}/read`,{method:'POST',headers:{'content-type':'application/json','x-edit-key':key},body:JSON.stringify({participantId:'qa-reader',lastMessageId:readMsg.message.id,lastReadAt:readMsg.message.createdAt})});
    const readReceipt=await r.json();
    const reader=readReceipt.participants.find(p=>p.participantId==='qa-reader');
    results.push(['chat read receipt',r.ok&&reader&&reader.lastMessageId===readMsg.message.id&&reader.lastReadAt===readMsg.message.createdAt]);

    r=await fetch(base+`/api/trips/${id}/chat`,{method:'POST',headers:{'content-type':'application/json','x-edit-key':key},body:JSON.stringify({text:'Spoof attempt',name:'Fake Name',participantId:'qa-user',clientMessageId:'client-1'})});
    const trustedNameMsg=await r.json();
    results.push(['chat trusted participant name',r.ok&&trustedNameMsg.message&&trustedNameMsg.message.name==='QA User']);

    r=await fetch(base+`/api/trips/${id}/chat/${trustedNameMsg.message.id}/reactions`,{method:'POST',headers:{'content-type':'application/json','x-edit-key':key},body:JSON.stringify({participantId:'qa-user',emoji:'❤️'})});
    const reacted=await r.json();
    results.push(['chat reactions',r.ok&&reacted.message&&Array.isArray(reacted.message.reactions['❤️'])&&reacted.message.reactions['❤️'].includes('qa-user')]);

    const tinyPng='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z2S8AAAAASUVORK5CYII=';
    r=await fetch(base+`/api/trips/${id}/chat`,{method:'POST',headers:{'content-type':'application/json','x-edit-key':key},body:JSON.stringify({kind:'photo',photoData:tinyPng,photoName:'pixel.png',participantId:'qa-user',clientMessageId:'photo-1',replyToId:trustedNameMsg.message.id})});
    const photoMsg=await r.json();
    results.push(['chat photo and reply',r.ok&&photoMsg.message&&photoMsg.message.kind==='photo'&&photoMsg.message.replyToId===trustedNameMsg.message.id]);

    r=await fetch(base+'/api/weather?location=Miami');
    const weather=await r.json();
    results.push(['weather config gate',r.ok&&weather.enabled===false&&weather.provider==='WeatherAPI.com']);

    r=await fetch(base+`/api/trips/${id}/chat`,{method:'POST',headers:{'content-type':'application/json','x-edit-key':key},body:JSON.stringify({text:'Spoof attempt',name:'Another Name',participantId:'qa-user',clientMessageId:'client-1'})});
    const duplicateMsg=await r.json();
    results.push(['chat idempotent duplicate',r.ok&&duplicateMsg.duplicate===true&&duplicateMsg.message&&duplicateMsg.message.id===trustedNameMsg.message.id]);

    r=await fetch(base+`/api/trips/${id}/chat`,{method:'POST',headers:{'content-type':'application/json','x-edit-key':key},body:JSON.stringify({text:'Unregistered',participantId:'unknown-user'})});
    results.push(['chat rejects unregistered sender',r.status===403]);

    r=await fetch(base+`/api/trips/${id}/typing`,{method:'POST',headers:{'content-type':'application/json','x-edit-key':key},body:JSON.stringify({participantId:'qa-user',typing:true})});
    results.push(['typing indicator endpoint',r.ok]);



    // Waypoint V7: owner-managed individual invitations and revocation.
    r=await fetch(base+`/api/trips/${id}/invites`,{method:'POST',headers:{'content-type':'application/json','x-owner-key':'wrong-owner'},body:JSON.stringify({label:'QA Invite',role:'viewer',expiresDays:7})});
    results.push(['invite owner auth',r.status===403]);

    const ownerTrip='trip-owner-test',ownerEdit='owner-edit-key',ownerSecret='owner-secret-key',ownerView='owner-view-key';
    r=await fetch(base+`/api/trips/${ownerTrip}`,{method:'PUT',headers:{'content-type':'application/json','x-edit-key':ownerEdit,'x-owner-key':ownerSecret,'x-view-key':ownerView},body:JSON.stringify({clientRevision:0,data:{waypointLive:3,trip:{name:'Owner QA'},days:[],bookings:[]}})});
    results.push(['owner room create',r.ok]);

    r=await fetch(base+`/api/trips/${ownerTrip}/invites`,{method:'POST',headers:{'content-type':'application/json','x-owner-key':ownerSecret},body:JSON.stringify({label:'Jessica QA',role:'viewer',expiresDays:7})});
    const inviteCreated=await r.json();
    results.push(['individual invite create',r.ok&&Boolean(inviteCreated.token)&&inviteCreated.invite?.role==='viewer']);
    const inviteToken=inviteCreated.token;

    r=await fetch(base+`/api/trips/${ownerTrip}?key=${encodeURIComponent(inviteToken)}`);
    const inviteRead=await r.json();
    results.push(['individual invite read access',r.ok&&inviteRead.accessRole==='viewer']);

    r=await fetch(base+`/api/trips/${ownerTrip}/participants`,{method:'POST',headers:{'content-type':'application/json','x-access-key':inviteToken},body:JSON.stringify({name:'Jessica QA',participantId:'invite-user',role:'editor'})});
    const invitedParticipant=await r.json();
    results.push(['invite role enforced',r.ok&&invitedParticipant.participants.some(p=>p.participantId==='invite-user'&&p.role==='viewer')]);

    r=await fetch(base+`/api/trips/${ownerTrip}/participants/invite-user`,{method:'PATCH',headers:{'content-type':'application/json','x-owner-key':ownerSecret},body:JSON.stringify({role:'editor'})});
    const changedRole=await r.json();
    results.push(['owner participant role change',r.ok&&changedRole.participant?.role==='editor']);

    r=await fetch(base+`/api/trips/${ownerTrip}/security-log`,{headers:{'x-owner-key':ownerSecret}});
    const sec=await r.json();
    results.push(['security log',r.ok&&Array.isArray(sec.events)&&sec.events.length>=2]);

    r=await fetch(base+`/api/trips/${ownerTrip}/invites/${inviteCreated.invite.id}`,{method:'DELETE',headers:{'x-owner-key':ownerSecret}});
    results.push(['invite revoke',r.ok]);

    r=await fetch(base+`/api/trips/${ownerTrip}?key=${encodeURIComponent(inviteToken)}`);
    results.push(['revoked invite blocked',r.status===403]);


    // V7.0.5: removed participants cannot keep editing with a generic editor key.
    const revokeTrip='trip-revoke-test',revokeEdit='revoke-edit-key',revokeOwner='revoke-owner-key';
    r=await fetch(base+`/api/trips/${revokeTrip}`,{method:'PUT',headers:{'content-type':'application/json','x-edit-key':revokeEdit,'x-owner-key':revokeOwner},body:JSON.stringify({clientRevision:0,data:{waypointLive:3,trip:{name:'Revoke QA'},days:[],bookings:[]}})});
    results.push(['revoke room create',r.ok]);
    r=await fetch(base+`/api/trips/${revokeTrip}/participants`,{method:'POST',headers:{'content-type':'application/json','x-access-key':revokeEdit,'x-owner-key':revokeOwner},body:JSON.stringify({name:'Owner QA',participantId:'revoke-owner-client',role:'owner'})});
    results.push(['revoke owner register',r.ok]);
    r=await fetch(base+`/api/trips/${revokeTrip}/participants`,{method:'POST',headers:{'content-type':'application/json','x-access-key':revokeEdit},body:JSON.stringify({name:'Editor QA',participantId:'revoke-editor-client',role:'editor'})});
    results.push(['revoke editor register',r.ok]);
    r=await fetch(base+`/api/trips/${revokeTrip}/participants/revoke-editor-client`,{method:'DELETE',headers:{'x-owner-key':revokeOwner}});
    results.push(['participant remove',r.ok]);
    r=await fetch(base+`/api/trips/${revokeTrip}`,{method:'PUT',headers:{'content-type':'application/json','x-edit-key':revokeEdit,'x-participant-id':'revoke-editor-client'},body:JSON.stringify({clientRevision:1,data:{waypointLive:3,trip:{name:'Should fail'},days:[],bookings:[]}})});
    results.push(['removed participant write blocked',r.status===403]);
    r=await fetch(base+`/api/trips/${revokeTrip}`,{method:'PUT',headers:{'content-type':'application/json','x-edit-key':revokeEdit},body:JSON.stringify({clientRevision:1,data:{waypointLive:3,trip:{name:'Missing participant should fail'},days:[],bookings:[]}})});
    results.push(['missing participant write blocked',r.status===403]);


    // V8.0.1: security headers and health privacy.
    r=await fetch(base+'/health');
    const healthQa=await r.json();
    results.push(['V8 health version',r.ok&&healthQa.version==='8.0.1']);
    results.push(['health hides room count',!Object.prototype.hasOwnProperty.call(healthQa,'rooms')]);
    results.push(['security nosniff',String(r.headers.get('x-content-type-options')||'').toLowerCase()==='nosniff']);
    results.push(['security CSP',Boolean(r.headers.get('content-security-policy'))]);

    // API rate limiting should not interfere with ordinary traffic.
    let normalRateOk=true;
    for(let i=0;i<5;i++){const rr=await fetch(base+'/health');if(!rr.ok)normalRateOk=false;}
    results.push(['normal API traffic allowed',normalRateOk]);



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
