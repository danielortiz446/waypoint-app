const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const cp=require('node:child_process');
const os=require('node:os');
const path=require('node:path');
const crypto=require('node:crypto');
const html=fs.readFileSync('public/index.html','utf8');
const snippet=html.substring(html.indexOf('const WAYPOINT_BACKUP_MAX_BYTES='),html.indexOf('function exportData(){'));
assert(snippet.includes('function waypointValidateBackup'));
const ctx=vm.createContext({JSON,Blob,Error,Array});
vm.runInContext(snippet+';globalThis.validate=waypointValidateBackup;globalThis.portable=waypointPortableBackup;',ctx);
const valid={trips:[{id:'trip1',destination:'Bogota'}],expenses:[],profile:{name:'Test'},monetization:{plan:'premium',waypointId:'STOLEN'},offlineSnapshots:[{private:'cached'}],pendingChat:[{message:'private'}]};
const actual=ctx.validate(valid);
assert.equal(actual.monetization,undefined,'premium entitlement never imported');
assert.equal(actual.offlineSnapshots,undefined,'old local snapshots not imported');
assert.equal(actual.pendingChat,undefined,'pending chat not imported');
assert.equal(actual.trips[0].id,'trip1');
const wrapped=ctx.validate({format:'waypoint-portable-backup',version:1,data:valid});
assert.equal(wrapped.monetization,undefined);
assert.throws(()=>ctx.validate({trips:'bad'}));
assert.throws(()=>ctx.validate({trips:[{id:1}]}));
assert.throws(()=>ctx.validate({trips:[],expenses:{bad:1}}));
for(const name of ['ios-capacitor/www/index.html','android-capacitor/www/index.html']){
 const body=fs.readFileSync(name,'utf8');assert(body.includes('waypointValidateBackup')&&body.includes('10.9.3'),name);
}
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'wp1091-'));
const port=19200+Math.floor(Math.random()*15000),base=`http://127.0.0.1:${port}`;
const child=cp.spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'..'),env:{...process.env,HOST:'127.0.0.1',PORT:String(port),WAYPOINT_DATA_FILE:path.join(dir,'rooms.json'),WAYPOINT_ADMIN_DATA_FILE:path.join(dir,'admin.json'),WAYPOINT_FILE_DIR:path.join(dir,'files')},stdio:'ignore'});
async function request(url,options){let response=await fetch(base+url,options);return [response.status,await response.json()];}
(async()=>{try{
 let ready=false;
 for(let i=0;i<70;i++){try{const r=await fetch(base+'/health');if(r.ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,70));}
 assert(ready,'server must start');
 const creds={clientId:'wc-'+crypto.randomBytes(18).toString('hex'),clientSecret:crypto.randomBytes(32).toString('hex')};
 const [status,reg]=await request('/api/client/register',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(creds)});
 assert.equal(status,200);
 const id=reg.user.waypointId;
 const auth={'X-Waypoint-Client-Id':creds.clientId,'X-Waypoint-Client-Secret':creds.clientSecret};
 const [codeStatus,code]=await request('/api/client/recovery-code',{method:'POST',headers:auth});assert.equal(codeStatus,200);
 const replacement={clientId:'wc-'+crypto.randomBytes(18).toString('hex'),clientSecret:crypto.randomBytes(32).toString('hex')};
 const recover=async(token)=>request('/api/client/recover',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({waypointId:id,recoveryCode:token,...replacement})});
 for(let i=0;i<8;i++){const [st]=await recover('F'.repeat(64));assert.equal(st,403);}
 const [blocked]=await recover(code.recoveryCode);assert.equal(blocked,429,'valid code throttled after repeated failures');
 const [stillValid]=await request('/api/client/status',{headers:auth});assert.equal(stillValid,200,'original account remains active');
 console.log('PASS portable backup legacy+v1, no Premium identity import, invalid backup rejection, both mobile shells');
 console.log('PASS server 8-attempt recovery throttle and original ID preserved');
} finally{child.kill('SIGTERM');fs.rmSync(dir,{recursive:true,force:true});}})().catch(e=>{console.error(e);process.exitCode=1;});
