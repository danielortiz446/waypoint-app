const fs=require('fs');let ok=true;const fail=m=>{console.error('FAIL',m);ok=false},pass=m=>console.log('PASS',m);
for(const f of ['public/index.html','ios-capacitor/www/index.html','android-capacitor/www/index.html']){
 const s=fs.readFileSync(f,'utf8');
 for(const [name,needle] of [
  ['version','waypoint-version" content="12.3.0"'],['support center','Support & diagnostics'],['diagnostics','waypointDiagnosticsObject'],['travel readiness','wp123ProductionCard'],['airport dataset','WAYPOINT_AIRPORTS'],['airport datalist','wp-airport-list'],['error telemetry','waypointSendError'],['legal 1.9',"WAYPOINT_LEGAL_VERSION='1.9'"]
 ]) s.includes(needle)?pass(`${f} ${name}`):fail(`${f} ${name}`);
}
const server=fs.readFileSync('server.js','utf8');
for(const [name,needle] of [['server version',"version:'12.3.0'"],['public config',"/api/public-config"],['error endpoint',"/api/telemetry/error"],['version analytics','byVersion'],['support env','WAYPOINT_SUPPORT_EMAIL']]) server.includes(needle)?pass(name):fail(name);
const sw=fs.readFileSync('public/service-worker.js','utf8');sw.includes('waypoint-v12.3.0-travel-center')?pass('PWA cache bump'):fail('PWA cache bump');
if(!ok)process.exit(1);
