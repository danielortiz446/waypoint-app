const assert=require('node:assert/strict'),os=require('node:os'),fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'waypoint-premium-'));const port=19600+Math.floor(Math.random()*500);const base=`http://127.0.0.1:${port}`;
const child=spawn(process.execPath,['-r',path.join(__dirname,'mock-ai-provider.cjs'),path.join(__dirname,'../server.js')],{cwd:path.join(__dirname,'..'),env:{...process.env,PORT:String(port),HOST:'127.0.0.1',WAYPOINT_DATA_FILE:path.join(dir,'rooms.json'),WAYPOINT_ADMIN_DATA_FILE:path.join(dir,'admin.json'),WAYPOINT_AI_ENABLED:'true',GEMINI_API_KEY:'fake-gemini-key',WAYPOINT_AI_DAILY_LIMIT:'100',WAYPOINT_ADMIN_EMAIL:'admin@example.org',WAYPOINT_ADMIN_PASSWORD:'long-test-admin-password'},stdio:'ignore'});
const req=async(url,options={})=>{const r=await fetch(base+url,options),json=await r.json();return {status:r.status,json,headers:r.headers};};
const post=(url,obj,headers={})=>req(url,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(obj)});
(async()=>{try{
 let ready=false;for(let i=0;i<70;i++){try{if((await req('/health')).status===200){ready=true;break;}}catch(_){} await new Promise(r=>setTimeout(r,60));}assert(ready);
 const clientId='wc-premium-test-0123456789',clientSecret='z'.repeat(64);const auth={'X-Waypoint-Client-Id':clientId,'X-Waypoint-Client-Secret':clientSecret};
 let r=await post('/api/client/register',{clientId,clientSecret,displayName:'Tester'});assert.equal(r.status,200);const waypointId=r.json.user.waypointId;
 let limits=(await req('/api/premium/benefits',{headers:auth})).json;assert.equal(limits.ai.limit,4);assert.equal(limits.ocr.limit,1);assert.equal(limits.ai.fullPlanner,false);
 r=await post('/api/ai/plan',{question:'Create a full itinerary',mode:'full_plan',trip:{destination:'Villavicencio'}},auth);assert.equal(r.status,403);assert.equal(r.json.error,'premium_required');
 r=await post('/api/ai/plan',{question:'Audit my travel itinerary',mode:'trip_audit',trip:{destination:'Villavicencio'}},auth);assert.equal(r.status,403,'free audit blocked on server');
 let limits2=(await req('/api/premium/benefits',{headers:auth})).json;assert.equal(limits2.ai.used,0,'blocked premium action must not consume quota');
 const question={question:'Give three travel suggestions',trip:{destination:'Villavicencio'}};
 for(let i=0;i<3;i++){r=await post('/api/ai/plan',question,auth);assert.equal(r.status,200,'free AI '+i+': '+JSON.stringify(r.json));}
 // The pre-existing short-window safeguard limits to 3 requests/10 mins, independently of daily allowances.
 limits=(await req('/api/premium/benefits',{headers:auth})).json;assert.equal(limits.ai.used,3);assert.equal(limits.ai.remaining,1);
 const photo={imageDataUrl:'data:image/png;base64,AAAA'};r=await post('/api/ocr/receipt',photo,auth);assert.equal(r.status,429,'short-window throttle remains in effect for one device');
 // Reset server per-IP request window by giving isolated requests a controlled different socket identity is not possible in process;
 // instead test daily OCR in a separate signed-in user account.
 const oId='wc-ocr-user-0123456789',oSecret='y'.repeat(64),ocrAuth={'X-Waypoint-Client-Id':oId,'X-Waypoint-Client-Secret':oSecret};
 r=await post('/api/client/register',{clientId:oId,clientSecret:oSecret,displayName:'Photo tester'});assert.equal(r.status,200);const oWaypointId=r.json.user.waypointId;
 r=await post('/api/ocr/receipt',photo,ocrAuth);assert.equal(r.status,200,'first Free OCR request should work on another ID');
 r=await post('/api/ocr/receipt',photo,ocrAuth);assert.equal(r.status,429);assert.equal(r.json.error,'premium_daily_limit','second Free OCR request blocked by plan');
 // Admin grant does not require production billing.
 r=await post('/api/admin/login',{email:'admin@example.org',password:'long-test-admin-password'});assert.equal(r.status,200);
 const cookie=String(r.headers.get('set-cookie')||'').split(';')[0];
 r=await req('/api/admin/users/'+encodeURIComponent(oWaypointId)+'/premium',{method:'PATCH',headers:{'Content-Type':'application/json',Cookie:cookie},body:JSON.stringify({action:'grant',days:7})});assert.equal(r.status,200);
 r=await post('/api/ocr/receipt',photo,ocrAuth);assert.equal(r.status,200,'premium expands OCR quota from one to eight');
 r=await post('/api/ai/plan',{question:'Create a full itinerary',mode:'full_plan',trip:{destination:'Villavicencio'}},ocrAuth);assert.equal(r.status,200,'premium can generate a full plan using verified server credentials');
 r=await req('/api/admin/users/'+encodeURIComponent(oWaypointId)+'/premium',{method:'PATCH',headers:{'Content-Type':'application/json',Cookie:cookie},body:JSON.stringify({action:'revoke'})});assert.equal(r.status,200);
 r=await post('/api/ai/plan',{question:'Create a full itinerary',mode:'full_plan',trip:{destination:'Villavicencio'}},ocrAuth);assert.equal(r.status,403,'revocation immediately blocks paid planning on server');
 r=await post('/api/ai/plan',{question:'Audit my travel itinerary',mode:'trip_audit',trip:{destination:'Villavicencio'}},ocrAuth);assert.equal(r.status,403,'revocation immediately blocks audit on server');
 r=await post('/api/ocr/receipt',photo,ocrAuth);assert.equal(r.status,429,'revocation restores free OCR quota');
 r=await req('/api/admin/users/'+encodeURIComponent(waypointId)+'/premium',{method:'PATCH',headers:{'Content-Type':'application/json',Cookie:cookie},body:JSON.stringify({action:'grant',days:7})});assert.equal(r.status,200);assert.equal(r.json.user.plan,'premium');
 limits=(await req('/api/premium/benefits',{headers:auth})).json;assert.equal(limits.ai.limit,18);assert.equal(limits.ai.used,3);assert.equal(limits.ocr.limit,8);assert.equal(limits.ai.fullPlanner,true);
 r=await req('/api/premium/benefits');assert.equal(r.json.ai.plan,'free','no credentials must never inherit premium');
 r=await req('/api/premium/benefits',{headers:{'X-Waypoint-Client-Id':clientId,'X-Waypoint-Client-Secret':'wrong'}});assert.equal(r.json.ai.plan,'free','wrong credentials must not inherit premium');
 r=await req('/api/admin/users/'+encodeURIComponent(waypointId)+'/premium',{method:'PATCH',headers:{'Content-Type':'application/json',Cookie:cookie},body:JSON.stringify({action:'revoke'})});assert.equal(r.status,200);assert.equal(r.json.user.plan,'free');
 limits=(await req('/api/premium/benefits',{headers:auth})).json;assert.equal(limits.ai.limit,4);assert.equal(limits.ai.fullPlanner,false);
 const auditId='wc-audit-0123456789',auditSecret='a'.repeat(64),auditAuth={'X-Waypoint-Client-Id':auditId,'X-Waypoint-Client-Secret':auditSecret};
 r=await post('/api/client/register',{clientId:auditId,clientSecret:auditSecret,displayName:'Audit tester'});assert.equal(r.status,200);const auditWpId=r.json.user.waypointId;
 r=await post('/api/ai/plan',{question:'Audit my travel itinerary',mode:'trip_audit',trip:{destination:'Villavicencio'}},auditAuth);assert.equal(r.status,403,'Free audit must be blocked before quota use');
 r=await req('/api/admin/users/'+encodeURIComponent(auditWpId)+'/premium',{method:'PATCH',headers:{'Content-Type':'application/json',Cookie:cookie},body:JSON.stringify({action:'grant',days:7})});assert.equal(r.status,200);
 r=await post('/api/ai/plan',{question:'Audit my travel itinerary',mode:'trip_audit',trip:{destination:'Villavicencio'}},auditAuth);assert.equal(r.status,200,'Premium audit available with verified entitlement');
 r=await req('/api/admin/users/'+encodeURIComponent(auditWpId)+'/premium',{method:'PATCH',headers:{'Content-Type':'application/json',Cookie:cookie},body:JSON.stringify({action:'revoke'})});assert.equal(r.status,200);
 r=await post('/api/ai/plan',{question:'Audit my travel itinerary',mode:'trip_audit',trip:{destination:'Villavicencio'}},auditAuth);assert.equal(r.status,403,'Audit blocked again after revocation');
 const disk=JSON.parse(fs.readFileSync(path.join(dir,'admin.json')));assert(Object.keys(disk.premiumUsage||{}).length>0,'usage should persist on the Railway volume');
 console.log('PASS Premium V10.8.1: Free quotas, server-side full-plan restriction, quota accounting, no unpaid upgrades, protected admin grant/revoke, invalid credential downgrade, persisted usage, existing anti-abuse throttle');
}finally{child.kill();fs.rmSync(dir,{recursive:true,force:true});}})().catch(e=>{console.error('FAIL',e);process.exitCode=1;child.kill();});
