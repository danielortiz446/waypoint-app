const cp=require('child_process');
const assert=require('node:assert/strict');
const fs=require('fs'),os=require('os'),path=require('path');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'waypoint-ai-test-'));
const port=18777;
const env={...process.env,HOST:'127.0.0.1',PORT:String(port),WAYPOINT_DATA_FILE:path.join(temp,'rooms.json'),WAYPOINT_ADMIN_DATA_FILE:path.join(temp,'admin.json')};
const server=cp.spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'..'),env,stdio:'ignore'});
const url=`http://127.0.0.1:${port}`;
async function run(){
 try{
  let ready=false;
  for(let i=0;i<70;i++){try{let r=await fetch(url+'/health');ready=r.ok; if(ready)break;}catch(e){}await new Promise(ok=>setTimeout(ok,75));}
  assert(ready,'Server did not start');
  let r=await fetch(url+'/health');assert.equal((await r.json()).version,'12.1.4');console.log('PASS health v12.1.4');
  r=await fetch(url+'/api/ai/status');assert.equal((await r.json()).configured,false);console.log('PASS AI disabled status without key');
  r=await fetch(url+'/api/ai/plan',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({question:'Find something interesting for tomorrow'})});assert.equal(r.status,503);console.log('PASS AI does not make live calls without key');
  r=await fetch(url+'/api/ai/plan',{method:'POST',headers:{origin:'https://evil.example','content-type':'application/json'},body:'{}'});assert.equal(r.status,403);console.log('PASS cross-origin AI request blocked');
  r=await fetch(url+'/ads.txt');assert(r.ok);assert.match(await r.text(),/pub-1755628880712670/);console.log('PASS AdSense ads.txt intact');
  r=await fetch(url+'/api/admin/system');assert.equal(r.status,401);console.log('PASS admin diagnostics protected');
 }finally{server.kill('SIGTERM');fs.rmSync(temp,{recursive:true,force:true});}
}
run().catch(e=>{console.error('FAIL',e);process.exitCode=1;server.kill('SIGTERM');});
