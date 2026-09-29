const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawn}=require('node:child_process');
const assert=require('node:assert/strict');
const mockFile=path.join(os.tmpdir(),'waypoint-flight-provider-mock.cjs');
fs.writeFileSync(mockFile,`let calls=0;global.fetch=async(url)=>{if(!String(url).startsWith('https://airlabs.co/api/v9/flight'))throw Error('unexpected upstream '+url);calls++;return {ok:true,status:200,json:async()=>({response:{flight_iata:'AV12',status:'en-route',dep_iata:'BOG',arr_iata:'MIA',dep_terminal:'1',dep_gate:'B12',dep_delayed:25,updated:1751000000,secret:'should never appear'}})};};`);
const serverPath=path.join(__dirname,'..','server.js');
const runServer=async(key,port)=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'wp1040-server-'));
 const child=spawn(process.execPath,key?['--require',mockFile,serverPath]:[serverPath],{env:{...process.env,PORT:String(port),HOST:'127.0.0.1',WAYPOINT_DATA_FILE:path.join(tmp,'data.json'),AIRLABS_API_KEY:key||''},stdio:['ignore','pipe','pipe']});
 for(let i=0;i<55;i++){try{const r=await fetch('http://127.0.0.1:'+port+'/health');if(r.ok)return child;}catch{}await new Promise(r=>setTimeout(r,75));}
 child.kill();throw Error('server not ready');
};
(async()=>{
 let child=await runServer('',18988);
 let r=await fetch('http://127.0.0.1:18988/api/flights/status?number=AV12');assert.equal(r.status,503);assert.equal((await r.json()).error,'flight_provider_not_configured');child.kill();
 console.log('PASS missing AirLabs key fails closed without contacting upstream');
 child=await runServer('test-secret-that-must-not-leak',18989);
 try{
  r=await fetch('http://127.0.0.1:18989/api/flights/status?number=AV12');assert.equal(r.status,200);let x=await r.json();assert.equal(x.status,'en-route');assert.equal(x.gate,'B12');assert.equal(x.delay,25);assert.equal(x.live,true);assert(!JSON.stringify(x).includes('secret'));
  r=await fetch('http://127.0.0.1:18989/api/flights/status?number=AV12');x=await r.json();assert.equal(x.cached,true);
  r=await fetch('http://127.0.0.1:18989/api/flights/status?number=%3Csvg%3E');assert.equal(r.status,400);
  console.log('PASS AirLabs mocked data sanitized, validated and cached');
 }finally{child.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
