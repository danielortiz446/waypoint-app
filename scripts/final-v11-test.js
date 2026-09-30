const fs=require('fs'),assert=require('assert');
for(const f of ['public/index.html','ios-capacitor/www/index.html','android-capacitor/www/index.html']){
 const s=fs.readFileSync(f,'utf8');
 const checks=[
  ['v11 meta',s.includes('waypoint-version" content="11.0.0"')],
  ['shared tasks',s.includes('function viewTasksSub(')&&s.includes('state.tripTasks')],
  ['memories',s.includes('function viewMemoriesSub(')&&s.includes('printTripMemories')],
  ['route optimizer',s.includes('function optimizeTripRoute110(')&&s.includes('/api/route/optimize')],
  ['smart media booking',s.includes('function importBookingMedia110(')&&s.includes('/api/ai/booking-import')],
  ['command center',s.includes('function finalTripHealth110(')]
 ];
 for(const [n,ok] of checks)assert.ok(ok,`${f}: ${n}`);
}
const server=fs.readFileSync('server.js','utf8');
assert(server.includes("u.pathname==='/api/route/optimize'"));
assert(server.includes("u.pathname==='/api/ai/booking-import'"));
assert(server.includes("version:'11.0.0'"));
console.log('PASS Waypoint V11 final toolkit across web/iOS/Android + server gates');
