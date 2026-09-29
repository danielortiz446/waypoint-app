const fs=require('fs');const assert=require('assert');
const files=['public/index.html','ios-capacitor/www/index.html','android-capacitor/www/index.html'];
for(const name of files){
 const src=fs.readFileSync(name,'utf8');
 const pull=src.slice(src.indexOf('async function pullTripFromCloud(tr){'),src.indexOf('async function syncTripNow(id)'));
 const sync=src.slice(src.indexOf('async function syncTripNow(id)'),src.indexOf('/* Shared-trip entry:'));
 assert(pull.includes('if(tr.pendingSync&&canEditTrip(tr))return false;'),name+' pending upload guard');
 assert(sync.indexOf('await pushTripToCloud(tr)')<sync.indexOf('await pullTripFromCloud(tr)'),name+' upload before pull');
 assert(src.includes('const waypointSyncInflight=new Set()'),name+' concurrent sync lock');
 assert(src.includes('tr.syncError=true; tr.pendingSync=true'),name+' failed upload keeps pending');
 assert(src.includes('function syncStatusHtml(tr)')&&src.includes('aria-live="polite"'),name+' sync status accessible');
 console.log('PASS',name,'pending conflict guard / sync lock / manual retry / error state');
}
