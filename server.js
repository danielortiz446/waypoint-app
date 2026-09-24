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

function isEditKey(room,key){return Boolean(room&&key&&hash(key)===room.keyHash);}
function isViewKey(room,key){return Boolean(room&&key&&room.viewKeyHash&&hash(key)===room.viewKeyHash);}
function hasReadAccess(room,key){return isEditKey(room,key)||isViewKey(room,key);}
function accessKeyFromRequest(req){return String(req.headers['x-access-key']||req.headers['x-edit-key']||req.headers['x-view-key']||'');}

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

function arrayMapById(arr){
  const m=new Map();
  for(const x of (Array.isArray(arr)?arr:[])) if(x&&x.id)m.set(x.id,x);
  return m;
}
function shallowDifferent(a,b,keys){
  return keys.some(k=>JSON.stringify(a?.[k]??null)!==JSON.stringify(b?.[k]??null));
}
function flattenActivities(days){
  const out=[];
  for(const d of (days||[])) for(const a of (d.activities||[])) out.push({...a,dayId:d.id});
  return out;
}
function deriveActivityEvents(prev,next,actorName,actorId){
  if(!prev||!next)return [];
  const events=[], now=new Date().toISOString();
  const add=(type,meta={})=>events.push({id:crypto.randomUUID(),type,actorName:actorName||'Participant',actorId:actorId||'',createdAt:now,...meta});
  if(shallowDifferent(prev.trip,next.trip,['name','destination','tripType','start','end','budgetGoal','currency','passportExpiry','notes'])) add('trip_updated');

  const compare=(oldArr,newArr,types,labelKey,keys,extra)=>{
    const a=arrayMapById(oldArr), b=arrayMapById(newArr);
    for(const [id,x] of b){
      if(!a.has(id)) add(types.add,{label:String(x?.[labelKey]||'').slice(0,120),...(extra?extra(x):{})});
      else if(keys&&shallowDifferent(a.get(id),x,keys)) add(types.update,{label:String(x?.[labelKey]||'').slice(0,120),...(extra?extra(x):{})});
    }
    for(const id of a.keys()) if(!b.has(id)) add(types.remove);
  };

  compare(prev.days,next.days,{add:'day_added',update:null,remove:'day_removed'},'label',null);
  compare(flattenActivities(prev.days),flattenActivities(next.days),{add:'activity_added',update:'activity_updated',remove:'activity_removed'},'title',['title','time','location','dayId']);
  compare(prev.bookings,next.bookings,{add:'booking_added',update:'booking_updated',remove:'booking_removed'},'title',['title','date','time','provider','confirmation','location','notes','flightNumber','origin','destination']);
  compare(prev.expenses,next.expenses,{add:'expense_added',update:null,remove:'expense_removed'},'desc',null,x=>({amount:Number.isFinite(Number(x.amount))?String(Number(x.amount).toFixed(2)):''}));
  compare(prev.checklists,next.checklists,{add:'packing_added',update:'packing_updated',remove:'packing_removed'},'text',['text','done','category','qty','assignedTo']);
  compare(prev.docs,next.docs,{add:'note_added',update:'note_added',remove:'note_removed'},'label',['label','value']);
  compare(prev.ideas,next.ideas,{add:'idea_added',update:'idea_updated',remove:'idea_removed'},'title',['title','location','category']);
  compare(prev.polls,next.polls,{add:'poll_added',update:'poll_updated',remove:'poll_removed'},'question',['question','options','votes']);

  return events.filter(e=>e.type).slice(0,8);
}
function notifyActivity(id,events){
  if(!events||!events.length)return;
  const set=eventClients.get(id); if(!set)return;
  const msg=`event: activity\ndata: ${JSON.stringify({count:events.length,latest:events[events.length-1]})}\n\n`;
  for(const res of [...set]){try{res.write(msg);}catch(e){set.delete(res);}}
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


function notifyRead(id,participant){
  const set=eventClients.get(id); if(!set)return;
  const msg=`event: read\ndata: ${JSON.stringify({participantId:participant.participantId,name:participant.name,lastMessageId:participant.lastMessageId||null,lastReadAt:participant.lastReadAt||null})}\n\n`;
  for(const res of [...set]){try{res.write(msg);}catch(e){set.delete(res);}}
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

    if(req.method==='GET'&&u.pathname==='/health') return json(res,200,{ok:true,service:'waypoint',version:'6.0.3',time:new Date().toISOString()});

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
    if(req.method==='GET'&&u.pathname==='/api/weather'){
      const apiKey=String(process.env.WEATHERAPI_KEY||'').trim();
      const location=String(u.searchParams.get('location')||'').trim().slice(0,160);
      if(!apiKey) return json(res,200,{enabled:false,provider:'WeatherAPI.com',reason:'api_key_required'});
      if(!location) return json(res,400,{error:'location required'});
      try{
        const params=new URLSearchParams({
          key:apiKey,
          q:location,
          days:'3',
          aqi:'no',
          alerts:'no'
        });
        const wr=await fetch(`https://api.weatherapi.com/v1/forecast.json?${params.toString()}`,{
          headers:{'accept':'application/json','user-agent':'Waypoint/6.0.1'}
        });
        const data=await wr.json().catch(()=>({}));
        if(!wr.ok){
          const msg=String(data?.error?.message||'weather lookup failed').slice(0,160);
          return json(res,wr.status===400?400:502,{enabled:true,provider:'WeatherAPI.com',error:msg});
        }
        const cur=data.current||{}, loc=data.location||{}, forecast=Array.isArray(data?.forecast?.forecastday)?data.forecast.forecastday:[];
        const current={
          temperature_2m:Number(cur.temp_c),
          apparent_temperature:Number(cur.feelslike_c),
          precipitation:Number(cur.precip_mm||0),
          precipitation_probability:Number(forecast?.[0]?.day?.daily_chance_of_rain||0),
          weather_code:null,
          condition_text:String(cur?.condition?.text||''),
          condition_icon:String(cur?.condition?.icon||''),
          wind_speed_10m:Number(cur.wind_kph||0),
          humidity:Number(cur.humidity||0),
          is_day:Number(cur.is_day||0)
        };
        const days=forecast.map(d=>({
          date:d.date,
          max_c:Number(d?.day?.maxtemp_c),
          min_c:Number(d?.day?.mintemp_c),
          avg_c:Number(d?.day?.avgtemp_c),
          chance_of_rain:Number(d?.day?.daily_chance_of_rain||0),
          condition:String(d?.day?.condition?.text||''),
          icon:String(d?.day?.condition?.icon||'')
        }));
        return json(res,200,{
          enabled:true,
          provider:'WeatherAPI.com',
          attribution:'WeatherAPI.com',
          location:[loc.name,loc.region,loc.country].filter(Boolean).join(', '),
          latitude:loc.lat,
          longitude:loc.lon,
          localtime:loc.localtime||'',
          current,
          forecast:days
        });
      }catch(e){
        return json(res,502,{enabled:true,provider:'WeatherAPI.com',error:'weather lookup failed'});
      }
    }

    if(req.method==='GET'&&u.pathname==='/api/giphy-config'){
      const key=String(process.env.GIPHY_API_KEY||'').trim();
      return json(res,200,{enabled:Boolean(key),apiKey:key||null,provider:key?'GIPHY':null});
    }

    if(req.method==='GET'&&u.pathname==='/api/features'){
      return json(res,200,{giphy:Boolean(process.env.GIPHY_API_KEY),weather:Boolean(process.env.WEATHERAPI_KEY)});
    }

    const eventMatch=u.pathname.match(/^\/api\/trips\/([^/]+)\/events$/);
    if(req.method==='GET'&&eventMatch){
      const id=decodeURIComponent(eventMatch[1]);
      const room=rooms[id];
      if(!room) return json(res,404,{error:'trip not found'});
      const key=u.searchParams.get('key')||'';
      if(!hasReadAccess(room,key)) return json(res,403,{error:'invalid access key'});
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
        if(!hasReadAccess(room,key)) return json(res,403,{error:'invalid access key'});
        return json(res,200,{participants:Array.isArray(room.participants)?room.participants:[]});
      }
      if(req.method==='POST'){
        const accessKey=accessKeyFromRequest(req);
        if(!hasReadAccess(room,accessKey)) return json(res,403,{error:'invalid access key'});
        const incoming=await readBody(req);
        const participantId=String(incoming.participantId||'').trim().slice(0,100);
        const name=String(incoming.name||'').trim().slice(0,60);
        if(!participantId||!name) return json(res,400,{error:'participant identity required'});
        if(!Array.isArray(room.participants)) room.participants=[];
        const existing=room.participants.find(p=>p.participantId===participantId);
        const role=String(incoming.role||'editor')==='viewer'?'viewer':'editor';
        if(existing){ existing.name=name; existing.role=role; existing.lastSeenAt=new Date().toISOString(); }
        else room.participants.push({participantId,name,role,joinedAt:new Date().toISOString(),lastSeenAt:new Date().toISOString()});
        room.participants=room.participants.slice(-50);
        persist(); notifyParticipants(id);
        return json(res,200,{ok:true,participants:room.participants});
      }
      return json(res,405,{error:'method not allowed'});
    }



    const readMatch=u.pathname.match(/^\/api\/trips\/([^/]+)\/read$/);
    if(readMatch&&req.method==='POST'){
      const id=decodeURIComponent(readMatch[1]), room=rooms[id];
      if(!room)return json(res,404,{error:'trip not found'});
      const accessKey=accessKeyFromRequest(req);
      if(!hasReadAccess(room,accessKey))return json(res,403,{error:'invalid access key'});
      const incoming=await readBody(req);
      const participantId=String(incoming.participantId||'').trim().slice(0,100);
      const participant=(room.participants||[]).find(p=>p.participantId===participantId);
      if(!participant)return json(res,403,{error:'participant not registered'});
      const messages=Array.isArray(room.chat)?room.chat:[];
      const requestedId=String(incoming.lastMessageId||'').trim().slice(0,100);
      const message=messages.find(m=>m.id===requestedId)||messages[messages.length-1];
      if(!message)return json(res,200,{ok:true,participants:room.participants||[]});
      const nextReadAt=message.createdAt;
      const current=Date.parse(participant.lastReadAt||0);
      if(!current||Date.parse(nextReadAt)>=current){
        participant.lastMessageId=message.id;
        participant.lastReadAt=nextReadAt;
        participant.lastSeenAt=new Date().toISOString();
        persist();
        notifyRead(id,participant);
      }
      return json(res,200,{ok:true,participants:room.participants||[]});
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


    const reactionMatch=u.pathname.match(/^\/api\/trips\/([^/]+)\/chat\/([^/]+)\/reactions$/);
    if(reactionMatch&&req.method==='POST'){
      const id=decodeURIComponent(reactionMatch[1]), messageId=decodeURIComponent(reactionMatch[2]), room=rooms[id];
      if(!room)return json(res,404,{error:'trip not found'});
      const editKey=String(req.headers['x-edit-key']||'');
      if(!isEditKey(room,editKey))return json(res,403,{error:'invalid edit key'});
      const incoming=await readBody(req), participantId=String(incoming.participantId||'').trim().slice(0,100), emoji=String(incoming.emoji||'').trim();
      if(!participantId||(room.participants||[]).every(p=>p.participantId!==participantId))return json(res,403,{error:'participant not registered'});
      if(!['❤️','👍','😂','🔥','✈️','👏'].includes(emoji))return json(res,400,{error:'unsupported reaction'});
      const message=(room.chat||[]).find(m=>m.id===messageId);if(!message)return json(res,404,{error:'message not found'});
      message.reactions=message.reactions||{};
      const arr=Array.isArray(message.reactions[emoji])?message.reactions[emoji]:[];
      message.reactions[emoji]=arr.includes(participantId)?arr.filter(x=>x!==participantId):[...arr,participantId].slice(-50);
      persist();notifyChat(id,message);
      return json(res,200,{ok:true,message});
    }

    const chatMatch=u.pathname.match(/^\/api\/trips\/([^/]+)\/chat$/);
    if(chatMatch){
      const id=decodeURIComponent(chatMatch[1]);
      const room=rooms[id];
      if(!room) return json(res,404,{error:'trip not found'});
      if(req.method==='GET'){
        const key=u.searchParams.get('key')||'';
        if(!hasReadAccess(room,key)) return json(res,403,{error:'invalid access key'});
        return json(res,200,{messages:Array.isArray(room.chat)?room.chat:[],activity:Array.isArray(room.activity)?room.activity:[]});
      }
      if(req.method==='POST'){
        const editKey=String(req.headers['x-edit-key']||'');
        if(hash(editKey)!==room.keyHash) return json(res,403,{error:'invalid edit key'});
        const incoming=await readBody(req);
        const rawKind=String(incoming.kind||'text');
        const kind=rawKind==='gif'?'gif':rawKind==='photo'?'photo':'text';
        const textValue=String(incoming.text||'').trim();
        const gifId=String(incoming.gifId||'').trim().slice(0,120);
        const gifTitle=String(incoming.gifTitle||'GIF').trim().slice(0,160);
        const photoData=String(incoming.photoData||'');
        const photoName=String(incoming.photoName||'Photo').trim().slice(0,120);
        const replyToId=String(incoming.replyToId||'').trim().slice(0,100);
        const participantId=String(incoming.participantId||'').trim().slice(0,100);
        const clientMessageId=String(incoming.clientMessageId||'').trim().slice(0,100);
        if(kind==='text'&&!textValue) return json(res,400,{error:'message is empty'});
        if(kind==='text'&&textValue.length>500) return json(res,400,{error:'message too long'});
        if(kind==='gif'&&!/^[A-Za-z0-9_-]{1,120}$/.test(gifId)) return json(res,400,{error:'invalid gif id'});
        if(kind==='photo'&&(!/^data:image\/(?:jpeg|png|webp);base64,/.test(photoData)||photoData.length>450000)) return json(res,400,{error:'invalid photo'});
        if(kind==='photo'&&(room.chat||[]).filter(m=>m.kind==='photo').length>=30) return json(res,409,{error:'photo limit reached'});
        if(!participantId) return json(res,400,{error:'participant identity required'});
        const participant=(room.participants||[]).find(p=>p.participantId===participantId);
        if(!participant) return json(res,403,{error:'participant not registered'});
        if(!chatRateAllowed(id,participantId)) return json(res,429,{error:'too many messages'});
        if(!Array.isArray(room.chat)) room.chat=[];
        if(clientMessageId){
          const duplicate=room.chat.find(m=>m.clientMessageId===clientMessageId&&m.participantId===participantId);
          if(duplicate) return json(res,200,{ok:true,message:duplicate,duplicate:true});
        }
        const message={
          id:crypto.randomUUID(),clientMessageId,kind,
          text:kind==='text'?textValue:'',
          gifId:kind==='gif'?gifId:undefined,
          gifTitle:kind==='gif'?gifTitle:undefined,
          photoData:kind==='photo'?photoData:undefined,
          photoName:kind==='photo'?photoName:undefined,
          replyToId:replyToId&&room.chat.some(m=>m.id===replyToId)?replyToId:undefined,
          reactions:{},
          name:participant.name,participantId,createdAt:new Date().toISOString()
        };
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
        if(!hasReadAccess(room,key)) return json(res,403,{error:'invalid access key'});
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
        const viewKey=String(req.headers['x-view-key']||'');
        const participantId=String(req.headers['x-participant-id']||'').trim().slice(0,100);
        const participant=(existing?.participants||[]).find(p=>p.participantId===participantId);
        const newEvents=existing?deriveActivityEvents(existing.data||{},incoming.data||{},participant?.name||'Participant',participantId):[];
        const activity=[...(Array.isArray(existing?.activity)?existing.activity:[]),...newEvents].slice(-150);
        rooms[id]={
          keyHash:existing?.keyHash||hash(editKey),
          ownerKeyHash:existing?.ownerKeyHash||(ownerKey?hash(ownerKey):null),
          viewKeyHash:existing?.viewKeyHash||(viewKey?hash(viewKey):null),
          revision,updatedAt:new Date().toISOString(),data:incoming.data,
          chat:Array.isArray(existing?.chat)?existing.chat:[],
          activity,
          participants:Array.isArray(existing?.participants)?existing.participants:[]
        };
        persist(); notifyRevision(id,rooms[id]); notifyActivity(id,newEvents);
        return json(res,200,{ok:true,revision,updatedAt:rooms[id].updatedAt,activityAdded:newEvents.length});
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

server.listen(PORT,HOST,()=>console.log(`Waypoint 6.0.3 listening on http://${HOST}:${PORT}`));
