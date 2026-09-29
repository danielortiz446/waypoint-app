const {spawn}=require('node:child_process'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const folder=fs.mkdtempSync(path.join(os.tmpdir(),'wp-ai-mock-'));
const port=18778,base=`http://127.0.0.1:${port}`;
const child=spawn(process.execPath,['--require',path.resolve(__dirname,'mock-ai-provider.cjs'),'server.js'],{cwd:path.resolve(__dirname,'..'),env:{...process.env,HOST:'127.0.0.1',PORT:String(port),WAYPOINT_DATA_FILE:path.join(folder,'rooms.json'),WAYPOINT_ADMIN_DATA_FILE:path.join(folder,'admin.json'),WAYPOINT_AI_ENABLED:'true',GEMINI_API_KEY:'fake-gemini-key',WAYPOINT_AI_DAILY_LIMIT:'2'},stdio:'ignore'});
const body={question:'Sugiere actividades para tres días',trip:{destination:'Villavicencio',start:'2026-10-20',end:'2026-10-23',docs:'TOP_SECRET_TEST_MARKER',days:[{date:'2026-10-20',activities:['City tour']} ]}};
async function main(){try{
 let ok=false;for(let i=0;i<70;i++){try{ok=(await fetch(base+'/health')).ok;if(ok)break;}catch(e){}await new Promise(r=>setTimeout(r,60));}assert(ok);
 let r=await fetch(base+'/api/ai/status');assert.equal((await r.json()).configured,true);console.log('PASS configured AI status');
 for(let i=0;i<2;i++){
  r=await fetch(base+'/api/ai/plan',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
  assert.equal(r.status,200,'response was '+r.status);let j=await r.json();assert.match(j.answer,/three-day/);assert.equal(j.live,false);
 }console.log('PASS mock AI answers and privacy filter');
 r=await fetch(base+'/api/ai/plan',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});assert.equal(r.status,429);console.log('PASS daily quota stops runaway cost');
}finally{child.kill();fs.rmSync(folder,{recursive:true,force:true});}}
main().catch(e=>{console.error('FAIL',e);process.exitCode=1;child.kill();});
