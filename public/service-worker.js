const CACHE='waypoint-v4.6-professional-chat';
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

self.addEventListener('push',event=>{
  let data={};
  try{ data=event.data?event.data.json():{}; }catch(e){ data={title:'Waypoint',body:event.data?event.data.text():'Flight update'}; }
  const title=data.title||'Waypoint';
  const options={
    body:data.body||'Flight update',
    icon:'/assets/icons/icon-192.png',
    badge:'/assets/icons/icon-192.png',
    data:{url:data.url||'/'},
    tag:data.tag||'waypoint-flight',
    renotify:true
  };
  event.waitUntil(self.registration.showNotification(title,options));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const url=event.notification.data?.url||'/';
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
    for(const client of list){
      if('focus' in client){ client.navigate(url).catch(()=>{}); return client.focus(); }
    }
    if(clients.openWindow) return clients.openWindow(url);
  }));
});
