const assert=require('assert/strict'),fs=require('fs'),path=require('path'),os=require('os'),crypto=require('crypto'),{spawn}=require('child_process');
(async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'waypoint-stripe-'));
 const status=path.join(dir,'stripe-status.txt');fs.writeFileSync(status,'active');
 const port=19000+Math.floor(Math.random()*1000),base=`http://127.0.0.1:${port}`;
 const env={...process.env,PORT:String(port),WAYPOINT_DATA_FILE:path.join(dir,'rooms.json'),WAYPOINT_ADMIN_DATA_FILE:path.join(dir,'admin.json'),WAYPOINT_FILE_DIR:path.join(dir,'files'),WAYPOINT_PUBLIC_URL:'https://waypoint.example',STRIPE_SECRET_KEY:'sk_test_waypoint',STRIPE_WEBHOOK_SECRET:'whsec_waypointtest',STRIPE_PRICE_MONTHLY:'price_waypointmonth',STRIPE_PRICE_YEARLY:'price_waypointyear',STRIPE_MOCK_STATUS_FILE:status};
 const cp=spawn(process.execPath,['-r',path.join(__dirname,'mock-stripe-provider.cjs'),path.join(__dirname,'../server.js')],{env,stdio:['ignore','pipe','pipe']});
 let err='';cp.stderr.on('data',d=>err+=String(d));
 async function request(route,opt={}){const r=await fetch(base+route,opt);return {status:r.status,data:await r.json()};}
 async function webhook(type,obj,id='evt_waypointdemo'){
  const body=JSON.stringify({id,type,data:{object:obj}}),ts=Math.floor(Date.now()/1000);
  const signature=crypto.createHmac('sha256',env.STRIPE_WEBHOOK_SECRET).update(ts+'.'+body).digest('hex');
  return request('/api/billing/stripe/webhook',{method:'POST',headers:{'Content-Type':'application/json','stripe-signature':`t=${ts},v1=${signature}`},body});
 }
 try{
  let ready=false;for(let i=0;i<70;i++){if(cp.exitCode!==null)break;try{let h=await request('/health');if(h.status===200){ready=true;break;}}catch(e){}await new Promise(r=>setTimeout(r,100));}assert(ready,err);
  let r=await request('/api/billing/config');assert.equal(r.data.webCheckoutConfigured,true);
  r=await request('/api/billing/stripe/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({interval:'month'})});assert.equal(r.status,401);
  r=await request('/api/client/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({clientId:'wc-testwaypoint123456789',clientSecret:'a'.repeat(64),displayName:'Test'})});assert.equal(r.status,200);const user=r.data.user;
  const headers={'Content-Type':'application/json','X-Waypoint-Client-Id':'wc-testwaypoint123456789','X-Waypoint-Client-Secret':'a'.repeat(64)};
  r=await request('/api/billing/stripe/checkout',{method:'POST',headers,body:JSON.stringify({interval:'month'})});assert.equal(r.status,200);assert(r.data.url.includes('checkout.stripe.com'));
  r=await request('/api/client/status',{headers});assert.equal(r.data.user.plan,'free');
  r=await request('/api/billing/stripe/webhook',{method:'POST',headers:{'Content-Type':'application/json','stripe-signature':'t=1,v1=deadbeef'},body:'{}'});assert.equal(r.status,400);
  r=await webhook('checkout.session.completed',{id:'cs_test_waypoint_demo',mode:'subscription',subscription:'sub_waypointdemo',customer:'cus_waypoint',metadata:{waypointId:user.waypointId}});assert.equal(r.status,200,JSON.stringify(r));
  r=await request('/api/client/status',{headers});assert.equal(r.data.user.plan,'premium');assert.equal(r.data.user.entitlementSource,'stripe');
  fs.writeFileSync(status,'canceled');r=await webhook('customer.subscription.deleted',{id:'sub_waypointdemo'},'evt_waypointcancel');assert.equal(r.status,200);
  r=await request('/api/client/status',{headers});assert.equal(r.data.user.plan,'free');
  console.log('PASS Stripe: signed webhook required; Checkout does not grant Premium before webhook; verified active grants and canceled revokes');
 }finally{cp.kill('SIGTERM');await new Promise(r=>setTimeout(r,150));fs.rmSync(dir,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exit(1)});
