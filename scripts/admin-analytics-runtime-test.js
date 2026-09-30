const {spawn}=require('child_process');const fs=require('fs'),path=require('path'),os=require('os'),assert=require('assert');
const port=19340+Math.floor(Math.random()*300);const dir=fs.mkdtempSync(path.join(os.tmpdir(),'waypoint-admin-analytics-'));
const child=spawn(process.execPath,['server.js'],{cwd:process.cwd(),env:{...process.env,PORT:String(port),WAYPOINT_DATA_FILE:path.join(dir,'sync.json'),WAYPOINT_ADMIN_DATA_FILE:path.join(dir,'admin.json'),WAYPOINT_ADMIN_EMAIL:'admin@example.com',WAYPOINT_ADMIN_PASSWORD:'TestPassword!234'},stdio:['ignore','ignore','inherit']});
const base=`http://127.0.0.1:${port}`;const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function wait(){for(let i=0;i<60;i++){try{const r=await fetch(base+'/health');if(r.ok)return;}catch(e){}await sleep(100)}throw new Error('server start timeout')}
(async()=>{try{await wait();
 let r=await fetch(base+'/api/telemetry/ping',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({installationId:'wpi-test-installation-123456',platform:'web',appMode:'browser',lang:'es'})});assert.equal(r.status,200);
 r=await fetch(base+'/api/admin/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:'admin@example.com',password:'TestPassword!234'})});assert.equal(r.status,200);const cookie=(r.headers.get('set-cookie')||'').split(';')[0];assert(cookie.includes('waypoint_admin_session='));
 r=await fetch(base+'/api/admin/analytics?days=7',{headers:{cookie}});assert.equal(r.status,200);const a=await r.json();assert(a.snapshot.totalInstallations>=1);assert(a.snapshot.activeNow>=1);assert.equal(a.daily.length,7);
 r=await fetch(base+'/api/admin/live',{headers:{cookie}});assert.equal(r.status,200);const l=await r.json();assert(l.sessions.length>=1);assert.equal(l.sessions[0].platform,'web');
 console.log('PASS runtime telemetry, admin analytics and live presence');
}finally{child.kill('SIGTERM');setTimeout(()=>fs.rmSync(dir,{recursive:true,force:true}),100)}})().catch(e=>{console.error('FAIL',e);child.kill('SIGTERM');process.exitCode=1});
