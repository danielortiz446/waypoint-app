const CACHE='waypoint-v6.0.2-weatherapi-refresh';
const SHELL=['/','/index.html','/manifest.webmanifest','/privacy.html','/terms.html','/assets/icons/icon-192.png','/assets/icons/icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const req=event.request;
  const url=new URL(req.url);
  if(req.method!=='GET' || url.pathname.startsWith('/api/')) return;
  const fetchReq=req.mode==='navigate'?new Request(req,{cache:'no-store'}):req;
  event.respondWith(fetch(fetchReq).then(res=>{
    const copy=res.clone();
    caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});
    return res;
  }).catch(()=>caches.match(req).then(r=>r||caches.match('/index.html'))));
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
