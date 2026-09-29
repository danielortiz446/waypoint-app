const {spawn}=require('node:child_process');
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const folder=fs.mkdtempSync(path.join(os.tmpdir(),'wp-ai-guest-'));
const port=18996,base=`http://127.0.0.1:${port}`;
const child=spawn(process.execPath,['--require',path.resolve(__dirname,'mock-ai-provider.cjs'),'server.js'],{cwd:path.resolve(__dirname,'..'),env:{...process.env,HOST:'127.0.0.1',PORT:String(port),WAYPOINT_DATA_FILE:path.join(folder,'rooms.json'),WAYPOINT_ADMIN_DATA_FILE:path.join(folder,'admin.json'),WAYPOINT_AI_ENABLED:'true',GEMINI_API_KEY:'fake-gemini-key',WAYPOINT_AI_DAILY_LIMIT:'30'},stdio:'ignore'});
const question={question:'Recomiéndame cinco ideas culturales para mi viaje',trip:{destination:'Bogotá',start:'2026-10-20',end:'2026-10-23'}};
async function main(){try{
 let ready=false;for(let i=0;i<80;i++){try{ready=(await fetch(base+'/health')).ok;if(ready)break;}catch{}await new Promise(r=>setTimeout(r,80));}assert(ready,'server ready');
 const first=await fetch(base+'/api/premium/benefits');assert.equal(first.status,200);
 const cookie=first.headers.get('set-cookie')?.split(';')[0];assert.match(cookie||'',/^wp_guest_v1=/);
 let benefit=await first.json();assert.equal(benefit.ai.remaining,4);console.log('PASS anonymous guest starts with 4');
 const headers={'content-type':'application/json','cookie':cookie};
 const failed=await fetch(base+'/api/ai/plan',{method:'POST',headers,body:JSON.stringify({...question,question:'FORCE_TEST_FAILURE: prueba del proveedor'})});
 assert.equal(failed.status,502,'failed Gemini request must return an error');
 const afterFailure=await fetch(base+'/api/premium/benefits',{headers:{cookie}});
 assert.equal((await afterFailure.json()).ai.remaining,4,'failed Gemini call must not reduce allowance');
 console.log('PASS failed Gemini request leaves all four requests available');
 for(let i=1;i<=4;i++){
   const r=await fetch(base+'/api/ai/plan',{method:'POST',headers,body:JSON.stringify(question)});
   assert.equal(r.status,200,`AI query ${i}: ${r.status}`);
   const j=await r.json();assert.equal(j.usage.remaining,4-i);
   const balance=await fetch(base+'/api/premium/benefits',{headers:{cookie}});
   assert.equal(balance.status,200);benefit=await balance.json();assert.equal(benefit.ai.remaining,4-i,`counter after query ${i}`);
 }console.log('PASS guest counter decreases 4→3→2→1→0 in API and balance');
 const denied=await fetch(base+'/api/ai/plan',{method:'POST',headers,body:JSON.stringify(question)});
 assert.equal(denied.status,429);assert.equal((await denied.json()).error,'premium_daily_limit');console.log('PASS fifth AI query blocked');
 const other=await fetch(base+'/api/premium/benefits');assert.equal((await other.json()).ai.remaining,4);console.log('PASS separate browser cookie starts separate guest');
 const tampered=await fetch(base+'/api/premium/benefits',{headers:{cookie:cookie.slice(0,-1)+'0'}});assert.match(tampered.headers.get('set-cookie')||'',/^wp_guest_v1=/);console.log('PASS invalid signed cookie replaced');
}finally{child.kill();fs.rmSync(folder,{recursive:true,force:true});}}
main().catch(e=>{console.error('FAIL',e);process.exitCode=1;child.kill();});
