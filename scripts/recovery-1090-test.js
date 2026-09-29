const {spawn}=require('child_process');
const fs=require('fs'), os=require('os'), path=require('path'), assert=require('assert/strict'),crypto=require('crypto');
const data=fs.mkdtempSync(path.join(os.tmpdir(),'wp109-'));
const port=19000+Math.floor(Math.random()*18000),base=`http://127.0.0.1:${port}`;
const server=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'..'),env:{...process.env,PORT:String(port),HOST:'127.0.0.1',WAYPOINT_DATA_FILE:path.join(data,'rooms.json'),WAYPOINT_ADMIN_DATA_FILE:path.join(data,'admin.json'),WAYPOINT_FILE_DIR:path.join(data,'files'),WAYPOINT_AI_ENABLED:'false'},stdio:'ignore'});
async function api(route,method='GET',body,headers={}){const r=await fetch(base+route,{method,headers:{...headers,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,body:await r.json()};}
const token=n=>crypto.randomBytes(n).toString('hex');
(async()=>{try{
 let running=false;for(let i=0;i<60;i++){try{await fetch(base+'/health');running=true;break;}catch{await new Promise(r=>setTimeout(r,80));}}assert(running,'server failed to boot');
 const first={clientId:'wc-'+token(18),clientSecret:token(32)},h={'X-Waypoint-Client-Id':first.clientId,'X-Waypoint-Client-Secret':first.clientSecret};
 const created=await api('/api/client/register','POST',{...first,displayName:'Recovery tester'});assert.equal(created.status,200);
 const id=created.body.user.waypointId;
 const c=await api('/api/client/recovery-code','POST',undefined,h);assert.equal(c.status,200);assert.match(c.body.recoveryCode,/^[A-F0-9]{64}$/);
 const again=await api('/api/client/recovery-code','POST',undefined,h);assert.equal(again.status,200);assert.notEqual(c.body.recoveryCode,again.body.recoveryCode);
 const second={clientId:'wc-'+token(18),clientSecret:token(32)};
 assert.equal((await api('/api/client/recover','POST',{waypointId:id,recoveryCode:c.body.recoveryCode,...second})).status,403,'old backup code rejected');
 assert.equal((await api('/api/client/recover','POST',{waypointId:id,recoveryCode:'A'.repeat(64),...second})).status,403,'invalid code rejected');
 const recovered=await api('/api/client/recover','POST',{waypointId:id,recoveryCode:again.body.recoveryCode,...second});assert.equal(recovered.status,200);assert.equal(recovered.body.user.waypointId,id);
 assert.equal((await api('/api/client/status','GET',undefined,h)).status,401,'old device revoked');
 assert.equal((await api('/api/client/recover','POST',{waypointId:id,recoveryCode:again.body.recoveryCode,...first})).status,403,'recovery code one use');
 assert.equal((await api('/api/client/status','GET',undefined,{'X-Waypoint-Client-Id':second.clientId,'X-Waypoint-Client-Secret':second.clientSecret})).status,200,'new device works');
 for(const f of ['public/index.html','ios-capacitor/www/index.html','android-capacitor/www/index.html']){const h=fs.readFileSync(f,'utf8');assert(h.includes('recoverWaypointId()')&&h.includes('generateWaypointRecovery()'),f);}
 console.log('PASS: recovery issuance/rotation, bad codes, one-use, device credential revocation, web+iOS+Android UI');
 }finally{server.kill('SIGTERM');fs.rmSync(data,{recursive:true,force:true});}})().catch(e=>{console.error(e);process.exitCode=1;});
