const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..');
const files=['public/index.html','ios-capacitor/www/index.html','android-capacitor/www/index.html'];
for(const file of files){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 for(const token of ['viewWaypointTravelCenter','viewWaypointAirportAssistant','wp122UpcomingAlerts','wp122BudgetSummary','travelcenter','airport','TRAVEL CENTER']) assert(html.includes(token),`${file}: missing ${token}`);
 assert(html.includes('waypoint-version" content="12.3.0"'),`${file}: wrong version`);
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
 for(const [,script] of scripts)if(script.trim())new vm.Script(script,{filename:file});
 console.log('PASS',file);
}
const web=fs.readFileSync(path.join(root,files[0]),'utf8');
assert(web.includes('Los tiempos son una ayuda de planificación')||web.includes('Times are planning aids'),'airport disclaimer missing');
assert(web.includes('waypoint-v12.3.0-travel-center')===false,'service worker token should not be embedded in index');
const sw=fs.readFileSync(path.join(root,'public/service-worker.js'),'utf8');
assert(sw.includes('waypoint-v12.3.0-travel-center'),'new cache key missing');
console.log('PASS Travel Center V12.3.0');
