const http=require('http');
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');

const PORT=Number(process.env.PORT||8787);
const HOST=process.env.HOST||'0.0.0.0';
const PUBLIC_DIR=path.join(__dirname,'public');
const DATA_FILE=process.env.WAYPOINT_DATA_FILE||path.join(__dirname,'data','waypoint-sync-data.json');
const rooms=loadRooms();
const eventClients=new Map();
const chatRate=new Map();
const typingState=new Map();
function chatRateAllowed(roomId,participantId){
  const key=roomId+'|'+participantId, now=Date.now();
  const arr=(chatRate.get(key)||[]).filter(t=>now-t<60000);
  if(arr.length>=30) return false;
  arr.push(now); chatRate.set(key,arr); return true;
}
function notifyTyping(id){
  const set=eventClients.get(id); if(!set)return;
  const room=rooms[id], active=typingState.get(id)||new Map(), now=Date.now();
  const names=[];
  for(const [pid,until] of [...active]){
    if(until<=now){active.delete(pid);continue;}
    const p=(room?.participants||[]).find(x=>x.participantId===pid); if(p?.name)names.push(p.name);
  }
  const msg=`event: typing\ndata: ${JSON.stringify({names:names.slice(0,5)})}\n\n`;
  for(const res of [...set]){try{res.write(msg);}catch(e){set.delete(res);}}
}

const fxCache=new Map();

const FLIGHT_DATA_FILE=process.env.WAYPOINT_FLIGHT_DATA_FILE||path.join(path.dirname(DATA_FILE),'waypoint-flight-watches.json');
let webpush=null;
try{ webpush=require('web-push'); }catch(e){ console.warn('web-push not installed; push notifications disabled'); }
const flightStore=loadFlightStore();
let vapidKeys=loadVapidKeys();

function loadFlightStore(){
  try{ return JSON.parse(fs.readFileSync(FLIGHT_DATA_FILE,'utf8'))||{watches:{}}; }catch(e){ return {watches:{}}; }
}
function persistFlightStore(){
  ensureDataDir();
  const tmp=FLIGHT_DATA_FILE+'.tmp';
  fs.writeFileSync(tmp,JSON.stringify(flightStore,null,2));
  fs.renameSync(tmp,FLIGHT_DATA_FILE);
}
function loadVapidKeys(){
  const file=path.join(path.dirname(DATA_FILE),'waypoint-vapid-keys.json');
  try{
    const keys=JSON.parse(fs.readFileSync(file,'utf8'));
    if(keys.publicKey&&keys.privateKey){ configureWebPush(keys); return keys; }
  }catch(e){}
  if(!webpush) return null;
  const keys=webpush.generateVAPIDKeys();
  try{ ensureDataDir(); fs.writeFileSync(file,JSON.stringify(keys,null,2)); }catch(e){}
  configureWebPush(keys);
  return keys;
}
function configureWebPush(keys){
  if(!webpush||!keys) return;
  const subject=process.env.VAPID_SUBJECT||'mailto:support@waypoint.local';
  webpush.setVapidDetails(subject,keys.publicKey,keys.privateKey);
}
async function sendPush(subscription,payload){
  if(!webpush||!subscription) return false;
  try{ await webpush.sendNotification(subscription,JSON.stringify(payload)); return true; }
  catch(e){ console.error('web push failed',e.statusCode||'',e.message); return false; }
}
function flightAwareHeaders(){ return {'x-apikey':process.env.FLIGHTAWARE_API_KEY||'','content-type':'application/json','accept':'application/json'}; }
async function createFlightAwareAlert(watch,baseUrl){
  const apiKey=process.env.FLIGHTAWARE_API_KEY||'';
  if(!apiKey) throw Object.assign(new Error('flight_provider_not_configured'),{status:503});
  const secret=watch.webhookSecret;
  const target=`${baseUrl.replace(/\/$/,'')}/api/flightaware/webhook?watch=${encodeURIComponent(watch.id)}&secret=${encodeURIComponent(secret)}`;
  const payload={
    ident:watch.flightNumber,
    max_weekly:1000,
    impending_departure:[60,30,15],
    impending_arrival:[30,15],
    events:{arrival:true,cancelled:true,departure:true,diverted:true,out:true,off:true,on:true,in:true},
    target_url:target
  };
  if(watch.origin) payload.origin=watch.origin;
  if(watch.destination) payload.destination=watch.destination;
  if(watch.date) payload.start=watch.date;
  let r=await fetch('https://aeroapi.flightaware.com/aeroapi/alerts',{method:'POST',headers:flightAwareHeaders(),body:JSON.stringify(payload)});
  let data=await r.json().catch(()=>({}));
  // FlightAware recommends avoiding same-day start issues. Retry without start if necessary.
  if(!r.ok&&watch.date===new Date().toISOString().slice(0,10)){
    delete payload.start;
    r=await fetch('https://aeroapi.flightaware.com/aeroapi/alerts',{method:'POST',headers:flightAwareHeaders(),body:JSON.stringify(payload)});
    data=await r.json().catch(()=>({}));
  }
  if(!r.ok) throw Object.assign(new Error(data.detail||data.reason||'flight_alert_failed'),{status:r.status||502,provider:data});
  watch.providerAlertId=String(data.id||data.alert_id||data.alert_id_str||'');
  return data;
}
async function deleteFlightAwareAlert(watch){
  if(!watch?.providerAlertId||!process.env.FLIGHTAWARE_API_KEY) return;
  try{ await fetch(`https://aeroapi.flightaware.com/aeroapi/alerts/${encodeURIComponent(watch.providerAlertId)}`,{method:'DELETE',headers:flightAwareHeaders()}); }catch(e){}
}
async function fetchFlightStatus(ident,date){
  if(!process.env.FLIGHTAWARE_API_KEY) return null;
  try{
    const r=await fetch(`https://aeroapi.flightaware.com/aeroapi/flights/${encodeURIComponent(ident)}`,{headers:flightAwareHeaders()});
    if(!r.ok) return null;
    const j=await r.json(); const flights=Array.isArray(j.flights)?j.flights:[];
    if(!flights.length) return null;
    let f=flights[0];
    if(date){
      const target=Date.parse(date+'T12:00:00Z');
      f=flights.slice().sort((a,b)=>Math.abs(Date.parse(a.scheduled_out||a.scheduled_off||0)-target)-Math.abs(Date.parse(b.scheduled_out||b.scheduled_off||0)-target))[0]||f;
    }
    return f;
  }catch(e){ return null; }
}
function flightNotificationBody(watch,event,status){
  const parts=[watch.flightNumber];
  const eventName=String(event||status?.status||'Flight update').replace(/_/g,' ');
  parts.push(eventName);
  if(status?.gate_origin) parts.push(`Gate ${status.gate_origin}`);
  if(status?.terminal_origin) parts.push(`Terminal ${status.terminal_origin}`);
  if(status?.estimated_out&&status?.scheduled_out&&status.estimated_out!==status.scheduled_out) parts.push('Departure time updated');
  if(status?.cancelled===true) parts.push('Cancelled');
  return parts.filter(Boolean).join(' · ');
}


function ensureDataDir(){ fs.mkdirSync(path.dirname(DATA_FILE),{recursive:true}); }
function loadRooms(){
  try{ return JSON.parse(fs.readFileSync(DATA_FILE,'utf8'))||{}; }catch(e){ return {}; }
}
function persist(){
  ensureDataDir();
  const tmp=DATA_FILE+'.tmp';
  fs.writeFileSync(tmp,JSON.stringify(rooms,null,2));
  fs.renameSync(tmp,DATA_FILE);
}
function hash(v){ return crypto.createHash('sha256').update(String(v||'')).digest('hex'); }
function securityHeaders(){
  return {
    'X-Content-Type-Options':'nosniff',
    'Referrer-Policy':'strict-origin-when-cross-origin',
    'Permissions-Policy':'camera=(self), microphone=(), geolocation=()',
    'Cross-Origin-Opener-Policy':'same-origin-allow-popups'
  };
}
function json(res,status,obj,extra={}){
  res.writeHead(status,{...securityHeaders(),'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...extra});
  res.end(status===204?'':JSON.stringify(obj));
}
function text(res,status,body,type='text/plain; charset=utf-8',cache='no-cache'){
  res.writeHead(status,{...securityHeaders(),'Content-Type':type,'Cache-Control':cache});
  res.end(body);
}
function readBody(req){
  return new Promise((resolve,reject)=>{
    let data=''; let ended=false;
    req.on('data',chunk=>{
      if(ended) return;
      data+=chunk;
      if(Buffer.byteLength(data,'utf8')>3_000_000){ ended=true; reject(Object.assign(new Error('payload too large'),{status:413})); req.destroy(); }
    });
    req.on('end',()=>{ if(ended)return; try{resolve(JSON.parse(data||'{}'));}catch(e){reject(Object.assign(new Error('invalid json'),{status:400}));}});
    req.on('error',reject);
  });
}
function mime(file){
  const ext=path.extname(file).toLowerCase();
  return ({'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.webmanifest':'application/manifest+json; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.txt':'text/plain; charset=utf-8'})[ext]||'application/octet-stream';
}
function safePublicPath(urlPath){
  const clean=decodeURIComponent(urlPath.split('?')[0]).replace(/^\/+/,'');
  const full=path.resolve(PUBLIC_DIR,clean||'index.html');
  return full.startsWith(path.resolve(PUBLIC_DIR)+path.sep)||full===path.resolve(PUBLIC_DIR,'index.html')?full:null;
}
function notifyRevision(id,room){
  const set=eventClients.get(id);
  if(!set) return;
  const msg=`event: revision\ndata: ${JSON.stringify({revision:room.revision,updatedAt:room.updatedAt})}\n\n`;
  for(const res of [...set]){ try{res.write(msg);}catch(e){set.delete(res);} }
}

function notifyChat(id,message){
  const set=eventClients.get(id);
  if(!set) return;
  const msg=`event: chat\ndata: ${JSON.stringify({id:message.id,createdAt:message.createdAt,name:message.name,participantId:message.participantId})}\n\n`;
  for(const res of [...set]){ try{res.write(msg);}catch(e){set.delete(res);} }
}


function notifyParticipants(id){
  const set=eventClients.get(id); if(!set) return;
  const room=rooms[id];
  const msg=`event: participants\ndata: ${JSON.stringify({participants:Array.isArray(room?.participants)?room.participants:[]})}\n\n`;
  for(const res of [...set]){ try{res.write(msg);}catch(e){set.delete(res);} }
}

function addEventClient(id,res){
  if(!eventClients.has(id)) eventClients.set(id,new Set());
  eventClients.get(id).add(res);
}
function removeEventClient(id,res){
  const set=eventClients.get(id); if(!set)return;
  set.delete(res); if(!set.size) eventClients.delete(id);
}

const server=http.createServer(async(req,res)=>{
  try{
    const u=new URL(req.url,'http://localhost');

    if(req.method==='GET'&&u.pathname==='/health') return json(res,200,{ok:true,service:'waypoint',version:'4.6.0',time:new Date().toISOString()});

    if(req.method==='GET'&&u.pathname==='/api/fx/rate'){
      const from=String(u.searchParams.get('from')||'').trim().toUpperCase();
      const to=String(u.searchParams.get('to')||'').trim().toUpperCase();
      if(!/^[A-Z]{3,4}$/.test(from)||!/^[A-Z]{3,4}$/.test(to)) return json(res,400,{error:'invalid currency code'});
      if(from===to) return json(res,200,{base:from,quote:to,rate:1,date:new Date().toISOString().slice(0,10),source:'identity'});
      const cacheKey=`${from}/${to}`;
      const cached=fxCache.get(cacheKey);
      if(cached&&Date.now()-cached.ts<30*60*1000) return json(res,200,{...cached.data,cached:true});
      try{
        const upstream=await fetch(`https://api.frankfurter.dev/v2/rate/${encodeURIComponent(from.toLowerCase())}/${encodeURIComponent(to.toLowerCase())}`,{
          headers:{'accept':'application/json','user-agent':'Waypoint/4.1'}
        });
        if(!upstream.ok) return json(res,502,{error:'exchange rate provider unavailable',status:upstream.status});
        const data=await upstream.json();
        let rate=Number(data.rate);
        if(!rate&&data.rates) rate=Number(data.rates[to]||data.rates[to.toLowerCase()]);
        if(!rate&&Array.isArray(data)){
          const row=data.find(x=>String(x.base||'').toUpperCase()===from&&String(x.quote||'').toUpperCase()===to)||data[0];
          rate=Number(row?.rate);
        }
        if(!Number.isFinite(rate)||rate<=0) return json(res,502,{error:'rate missing from provider'});
        const payload={base:from,quote:to,rate,date:data.date||new Date().toISOString().slice(0,10),source:'Frankfurter'};
        fxCache.set(cacheKey,{ts:Date.now(),data:payload});
        return json(res,200,payload);
      }catch(e){
        return json(res,502,{error:'exchange rate lookup failed'});
      }
    }



    if(req.method==='GET'&&u.pathname==='/api/features'){
      return json(res,200,{flightAlerts:Boolean(process.env.FLIGHTAWARE_API_KEY&&webpush&&vapidKeys),webPush:Boolean(webpush&&vapidKeys),provider:process.env.FLIGHTAWARE_API_KEY?'FlightAware':null});
    }
    if(req.method==='GET'&&u.pathname==='/api/notifications/vapid-public-key'){
      if(!webpush||!vapidKeys) return json(res,503,{error:'push_not_configured'});
      return json(res,200,{publicKey:vapidKeys.publicKey});
    }
    if(req.method==='POST'&&u.pathname==='/api/flight-watches'){
      if(!webpush||!vapidKeys) return json(res,503,{error:'push_not_configured'});
      if(!process.env.FLIGHTAWARE_API_KEY) return json(res,503,{error:'flight_provider_not_configured'});
      const incoming=await readBody(req);
      const flightNumber=String(incoming.flightNumber||'').trim().toUpperCase();
      const date=String(incoming.date||'').trim();
      const token=String(incoming.token||'').trim();
      const subscription=incoming.subscription;
      if(!/^[A-Z0-9]{2,8}$/.test(flightNumber)||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!token||!subscription?.endpoint) return json(res,400,{error:'invalid_flight_watch'});
      const id=crypto.randomUUID();
      const watch={
        id,tokenHash:hash(token),flightNumber,date,
        origin:String(incoming.origin||'').trim().toUpperCase().slice(0,4),
        destination:String(incoming.destination||'').trim().toUpperCase().slice(0,4),
        bookingTitle:String(incoming.bookingTitle||flightNumber).trim().slice(0,120),
        subscription,createdAt:new Date().toISOString(),status:'creating',
        webhookSecret:crypto.randomBytes(24).toString('hex')
      };
      flightStore.watches[id]=watch; persistFlightStore();
      const proto=String(req.headers['x-forwarded-proto']||'https').split(',')[0].trim();
      const baseUrl=(process.env.PUBLIC_BASE_URL||`${proto}://${req.headers.host}`).replace(/\/$/,'');
      try{
        await createFlightAwareAlert(watch,baseUrl);
        watch.status='active'; watch.updatedAt=new Date().toISOString(); persistFlightStore();
        return json(res,201,{ok:true,id,status:'active',provider:'FlightAware'});
      }catch(e){
        delete flightStore.watches[id]; persistFlightStore();
        return json(res,e.status||502,{error:e.message||'flight_alert_failed'});
      }
    }
    const flightWatchMatch=u.pathname.match(/^\/api\/flight-watches\/([^/]+)$/);
    if(flightWatchMatch){
      const id=decodeURIComponent(flightWatchMatch[1]); const watch=flightStore.watches[id];
      if(!watch) return json(res,404,{error:'watch_not_found'});
      const token=String(req.headers['x-watch-token']||u.searchParams.get('token')||'');
      if(hash(token)!==watch.tokenHash) return json(res,403,{error:'invalid_watch_token'});
      if(req.method==='DELETE'){
        await deleteFlightAwareAlert(watch);
        delete flightStore.watches[id]; persistFlightStore();
        return json(res,200,{ok:true,deleted:true});
      }
      if(req.method==='GET') return json(res,200,{id:watch.id,flightNumber:watch.flightNumber,date:watch.date,status:watch.status,lastEvent:watch.lastEvent||null,lastUpdated:watch.lastUpdated||null});
      return json(res,405,{error:'method not allowed'});
    }
    if(req.method==='POST'&&u.pathname==='/api/flightaware/webhook'){
      const id=String(u.searchParams.get('watch')||''); const secret=String(u.searchParams.get('secret')||'');
      const watch=flightStore.watches[id];
      if(!watch||!secret||secret!==watch.webhookSecret) return text(res,403,'Forbidden');
      const incoming=await readBody(req);
      const eventName=incoming.event||incoming.type||incoming.status||incoming.event_type||'Flight update';
      const status=await fetchFlightStatus(watch.flightNumber,watch.date);
      watch.lastEvent=eventName; watch.lastUpdated=new Date().toISOString(); watch.lastPayload=incoming; persistFlightStore();
      await sendPush(watch.subscription,{
        title:`✈ ${watch.flightNumber} — Waypoint`,
        body:flightNotificationBody(watch,eventName,status),
        url:'/',
        tag:`flight-${watch.id}`
      });
      return text(res,200,'OK');
    }

    const eventMatch=u.pathname.match(/^\/api\/trips\/([^/]+)\/events$/);
    if(req.method==='GET'&&eventMatch){
      const id=decodeURIComponent(eventMatch[1]);
      const room=rooms[id];
      if(!room) return json(res,404,{error:'trip not found'});
      const key=u.searchParams.get('key')||'';
      if(hash(key)!==room.keyHash) return json(res,403,{error:'invalid edit key'});
      res.writeHead(200,{...securityHeaders(),'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'});
      res.write(`event: ready\ndata: ${JSON.stringify({revision:room.revision})}\n\n`);
      addEventClient(id,res);
      const heartbeat=setInterval(()=>{ try{res.write(`: ping ${Date.now()}\n\n`);}catch(e){} },25000);
      req.on('close',()=>{clearInterval(heartbeat);removeEventClient(id,res);});
      return;
    }



    const participantMatch=u.pathname.match(/^\/api\/trips\/([^/]+)\/participants$/);
    if(participantMatch){
      const id=decodeURIComponent(participantMatch[1]); const room=rooms[id];
      if(!room) return json(res,404,{error:'trip not found'});
      if(req.method==='GET'){
        const key=u.searchParams.get('key')||'';
        if(hash(key)!==room.keyHash) return json(res,403,{error:'invalid edit key'});
        return json(res,200,{participants:Array.isArray(room.participants)?room.participants:[]});
      }
      if(req.method==='POST'){
        const editKey=String(req.headers['x-edit-key']||'');
        if(hash(editKey)!==room.keyHash) return json(res,403,{error:'invalid edit key'});
        const incoming=await readBody(req);
        const participantId=String(incoming.participantId||'').trim().slice(0,100);
        const name=String(incoming.name||'').trim().slice(0,60);
        if(!participantId||!name) return json(res,400,{error:'participant identity required'});
        if(!Array.isArray(room.participants)) room.participants=[];
        const existing=room.participants.find(p=>p.participantId===participantId);
        if(existing){ existing.name=name; existing.lastSeenAt=new Date().toISOString(); }
        else room.participants.push({participantId,name,joinedAt:new Date().toISOString(),lastSeenAt:new Date().toISOString()});
        room.participants=room.participants.slice(-50);
        persist(); notifyParticipants(id);
        return json(res,200,{ok:true,participants:room.participants});
      }
      return json(res,405,{error:'method not allowed'});
    }


    const typingMatch=u.pathname.match(/^\/api\/trips\/([^/]+)\/typing$/);
    if(typingMatch&&req.method==='POST'){
      const id=decodeURIComponent(typingMatch[1]), room=rooms[id]; if(!room)return json(res,404,{error:'trip not found'});
      const editKey=String(req.headers['x-edit-key']||''); if(hash(editKey)!==room.keyHash)return json(res,403,{error:'invalid edit key'});
      const incoming=await readBody(req), participantId=String(incoming.participantId||'').trim().slice(0,100);
      if(!participantId||(room.participants||[]).every(p=>p.participantId!==participantId)) return json(res,403,{error:'participant not registered'});
      if(!typingState.has(id))typingState.set(id,new Map());
      const map=typingState.get(id); if(incoming.typing)map.set(participantId,Date.now()+3500); else map.delete(participantId);
      notifyTyping(id); return json(res,200,{ok:true});
    }

    const chatMatch=u.pathname.match(/^\/api\/trips\/([^/]+)\/chat$/);
    if(chatMatch){
      const id=decodeURIComponent(chatMatch[1]);
      const room=rooms[id];
      if(!room) return json(res,404,{error:'trip not found'});
      if(req.method==='GET'){
        const key=u.searchParams.get('key')||'';
        if(hash(key)!==room.keyHash) return json(res,403,{error:'invalid edit key'});
        return json(res,200,{messages:Array.isArray(room.chat)?room.chat:[]});
      }
      if(req.method==='POST'){
        const editKey=String(req.headers['x-edit-key']||'');
        if(hash(editKey)!==room.keyHash) return json(res,403,{error:'invalid edit key'});
        const incoming=await readBody(req);
        const textValue=String(incoming.text||'').trim();
        const participantId=String(incoming.participantId||'').trim().slice(0,100);
        const clientMessageId=String(incoming.clientMessageId||'').trim().slice(0,100);
        if(!textValue) return json(res,400,{error:'message is empty'});
        if(textValue.length>500) return json(res,400,{error:'message too long'});
        if(!participantId) return json(res,400,{error:'participant identity required'});
        const participant=(room.participants||[]).find(p=>p.participantId===participantId);
        if(!participant) return json(res,403,{error:'participant not registered'});
        if(!chatRateAllowed(id,participantId)) return json(res,429,{error:'too many messages'});
        if(!Array.isArray(room.chat)) room.chat=[];
        if(clientMessageId){
          const duplicate=room.chat.find(m=>m.clientMessageId===clientMessageId&&m.participantId===participantId);
          if(duplicate) return json(res,200,{ok:true,message:duplicate,duplicate:true});
        }
        const message={id:crypto.randomUUID(),clientMessageId,text:textValue,name:participant.name,participantId,createdAt:new Date().toISOString()};
        room.chat.push(message);
        if(room.chat.length>200) room.chat=room.chat.slice(-200);
        participant.lastSeenAt=new Date().toISOString();
        persist(); notifyChat(id,message);
        return json(res,201,{ok:true,message});
      }
      return json(res,405,{error:'method not allowed'});
    }

    const apiMatch=u.pathname.match(/^\/api\/trips\/([^/]+)$/);
    if(apiMatch){
      const id=decodeURIComponent(apiMatch[1]);
      if(!id||id.length>180) return json(res,400,{error:'invalid trip id'});
      if(req.method==='GET'){
        const room=rooms[id];
        if(!room) return json(res,404,{error:'trip not found'});
        const key=u.searchParams.get('key')||'';
        if(hash(key)!==room.keyHash) return json(res,403,{error:'invalid edit key'});
        return json(res,200,{revision:room.revision,updatedAt:room.updatedAt,data:room.data});
      }
      if(req.method==='PUT'){
        const editKey=String(req.headers['x-edit-key']||'');
        if(!editKey) return json(res,401,{error:'missing edit key'});
        const incoming=await readBody(req);
        if(!incoming.data||typeof incoming.data!=='object') return json(res,400,{error:'missing data'});
        const existing=rooms[id];
        if(existing&&hash(editKey)!==existing.keyHash) return json(res,403,{error:'invalid edit key'});
        const clientRevision=Number(incoming.clientRevision||0);
        if(existing&&incoming.force!==true&&clientRevision!==Number(existing.revision||0)){
          return json(res,409,{error:'revision_conflict',revision:existing.revision,updatedAt:existing.updatedAt,data:existing.data});
        }
        const revision=(existing?.revision||0)+1;
        const ownerKey=String(req.headers['x-owner-key']||'');
        rooms[id]={
          keyHash:existing?.keyHash||hash(editKey),
          ownerKeyHash:existing?.ownerKeyHash||(ownerKey?hash(ownerKey):null),
          revision,updatedAt:new Date().toISOString(),data:incoming.data,
          chat:Array.isArray(existing?.chat)?existing.chat:[],
          participants:Array.isArray(existing?.participants)?existing.participants:[]
        };
        persist(); notifyRevision(id,rooms[id]);
        return json(res,200,{ok:true,revision,updatedAt:rooms[id].updatedAt});
      }
      if(req.method==='DELETE'){
        const existing=rooms[id];
        if(!existing) return json(res,404,{error:'trip not found'});
        const ownerKey=String(req.headers['x-owner-key']||'');
        const editKey=String(req.headers['x-edit-key']||'');
        if(existing.ownerKeyHash){
          if(!ownerKey||hash(ownerKey)!==existing.ownerKeyHash) return json(res,403,{error:'owner authorization required'});
        }else{
          if(!editKey||hash(editKey)!==existing.keyHash) return json(res,403,{error:'invalid edit key'});
        }
        delete rooms[id]; persist();
        return json(res,200,{ok:true,deleted:true});
      }
      return json(res,405,{error:'method not allowed'});
    }

    if(req.method!=='GET'&&req.method!=='HEAD') return json(res,405,{error:'method not allowed'});
    let file=safePublicPath(u.pathname);
    if(!file) return json(res,400,{error:'invalid path'});
    if(!fs.existsSync(file)||fs.statSync(file).isDirectory()){
      // SPA fallback for navigation routes.
      if(!path.extname(u.pathname)) file=path.join(PUBLIC_DIR,'index.html');
      else return json(res,404,{error:'not found'});
    }
    const type=mime(file);
    const cache=(file.endsWith('service-worker.js')||file.endsWith('index.html'))?'no-cache':(file.includes(`${path.sep}assets${path.sep}`)?'public, max-age=604800, immutable':'public, max-age=3600');
    res.writeHead(200,{...securityHeaders(),'Content-Type':type,'Cache-Control':cache});
    if(req.method==='HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  }catch(e){
    console.error(e);
    if(!res.headersSent) json(res,e.status||500,{error:(e.status&&e.message)||'server error'});
    else res.end();
  }
});

server.listen(PORT,HOST,()=>console.log(`Waypoint 4.6.0 listening on http://${HOST}:${PORT}`));
