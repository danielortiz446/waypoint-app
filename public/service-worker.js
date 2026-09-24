const CACHE='waypoint-v10.0.5-travel-mode';
const DATA_CACHE='waypoint-v9-data-v1';
const SHELL=['/','/index.html','/manifest.webmanifest','/privacy.html','/terms.html','/assets/icons/icon-192.png','/assets/icons/icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>![CACHE,DATA_CACHE].includes(k)).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));

self.addEventListener('message',event=>{
  if(event.data?.type==='CACHE_TRIP'){
    const urls=Array.isArray(event.data.urls)?event.data.urls:[];
    event.waitUntil(caches.open(CACHE).then(async c=>{
      for(const u of urls){try{await c.add(new Request(u,{cache:'reload'}));}catch(e){}}
    }));
  }
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);

  // Cache selected read-only data APIs with stale fallback. Never cache collaboration/chat.
  const cacheableApi=url.origin===self.location.origin&&(
    url.pathname==='/api/weather'||
    url.pathname==='/api/fx/rate'||
    url.pathname==='/api/destination/search'||
    url.pathname==='/api/features'
  );
  if(cacheableApi){
    event.respondWith(fetch(req).then(res=>{
      if(res.ok){const copy=res.clone();caches.open(DATA_CACHE).then(c=>c.put(req,copy)).catch(()=>{});}
      return res;
    }).catch(()=>caches.match(req).then(r=>r||new Response(JSON.stringify({offline:true,error:'offline cache unavailable'}),{status:503,headers:{'content-type':'application/json'}}))));
    return;
  }

  if(url.origin!==self.location.origin)return;
  if(url.pathname.startsWith('/api/'))return;

  if(req.mode==='navigate'){
    event.respondWith(fetch(new Request(req,{cache:'no-store'})).then(res=>{
      if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put('/index.html',copy)).catch(()=>{});}
      return res;
    }).catch(()=>caches.match('/index.html').then(r=>r||caches.match('/'))));
    return;
  }

  event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{
    if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});}
    return res;
  })));
});

self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const target=event.notification.data?.url||'/';
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
    const existing=list.find(c=>c.url.startsWith(self.location.origin));
    if(existing){existing.focus();return existing.navigate(target);}
    return clients.openWindow(target);
  }));
});
