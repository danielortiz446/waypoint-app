const CACHE='waypoint-v4.9.2-global-collab';
const SHELL=['/','/index.html','/manifest.webmanifest','/privacy.html','/terms.html','/assets/icons/icon-192.png','/assets/icons/icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const req=event.request;
  const url=new URL(req.url);
  if(req.method!=='GET' || url.pathname.startsWith('/api/')) return;
  event.respondWith(fetch(req).then(res=>{
    const copy=res.clone();
    caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});
    return res;
  }).catch(()=>caches.match(req).then(r=>r||caches.match('/index.html'))));
});
