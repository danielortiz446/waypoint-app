const fs=require('fs');
let fail=0;function check(v,m){console.log((v?'PASS ':'FAIL ')+m);if(!v)fail++;}
for(const f of ['public/index.html','ios-capacitor/www/index.html','android-capacitor/www/index.html']){
 const s=fs.readFileSync(f,'utf8');
 check(s.includes('content="12.1.9"'),f+' version 12.1.9');
 check(s.includes('wpOpenAirlinePicker()'),f+' custom airline picker trigger');
 check(s.includes('id="wp-airline-search-input"'),f+' airline search');
 check(s.includes("waypoint_recent_airlines"),f+' recent airlines');
 check(s.includes("'Populares':'Popular'"),f+' popular airlines section');
 check(s.includes("wpSetAirlineChoice('OTHER'"),f+' other airline fallback');
 check(!s.includes('<select id="wp-flight-airline-select"'),f+' native airline select removed');
 check(s.includes('id="wp-flight-airline-select" type="hidden"'),f+' airline code stored internally');
}
const sw=fs.readFileSync('public/service-worker.js','utf8');
check(sw.includes('waypoint-v12.1.9-airline-picker'),'new PWA cache key');
const server=fs.readFileSync('server.js','utf8');
check(server.includes("version:'12.1.9'"),'server version 12.1.9');
process.exit(fail?1:0);
