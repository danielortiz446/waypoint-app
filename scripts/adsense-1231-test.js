const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const tag='pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1755628880712670';
function read(p){return fs.readFileSync(path.join(root,p),'utf8')}
for(const p of ['public/index.html','public/privacy.html','public/terms.html']){
  const s=read(p); if(!s.includes(tag)) throw Error('Missing AdSense tag: '+p);
  if((s.match(new RegExp(tag.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'))||[]).length!==1) throw Error('AdSense tag count !=1: '+p);
  const h=s.toLowerCase(); const tagPos=s.indexOf(tag); if(tagPos<h.indexOf('<head>')||tagPos>h.indexOf('</head>')) throw Error('AdSense tag not in head: '+p);
}
for(const p of ['ios-capacitor/www/index.html','android-capacitor/www/index.html']) if(read(p).includes(tag)) throw Error('Web AdSense tag leaked into native bundle: '+p);
const ads=read('public/ads.txt').trim(); if(ads!=='google.com, pub-1755628880712670, DIRECT, f08c47fec0942fa0') throw Error('ads.txt mismatch');
if(read('public/admin.html').includes(tag)) throw Error('Admin should not load ads');
console.log('PASS AdSense 12.3.1 web/native separation');
