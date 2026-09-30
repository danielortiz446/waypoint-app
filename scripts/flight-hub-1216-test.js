const fs=require('fs');
const s=fs.readFileSync('public/index.html','utf8');
const server=fs.readFileSync('server.js','utf8');
const checks=[
 ['Flight Hub title',s.includes("'Centro de vuelos':'Flight Hub'")],
 ['origin destination',s.includes('wp-flight-origin')&&s.includes('wp-flight-destination')],
 ['departure arrival times',s.includes('wp-flight-departure-time')&&s.includes('wp-flight-arrival-time')],
 ['timezones',s.includes('wp-flight-departure-tz')&&s.includes('wp-flight-arrival-tz')],
 ['terminal gates',s.includes('wp-flight-arr-terminal')&&s.includes('wp-flight-arr-gate')],
 ['confirmation seat baggage',s.includes('wp-flight-confirmation')&&s.includes('wp-flight-seat')&&s.includes('wp-flight-baggage')],
 ['manual status checkin',s.includes('wp-flight-status')&&s.includes('toggleFlightCheckin')],
 ['route mismatch warning',s.includes('Returned route does not match your saved route')],
 ['richer AirLabs',server.includes('arrTerminal:clean(data.arr_terminal')&&server.includes('depTime:clean(data.dep_time')],
 ['version 12.1.6',s.includes('content="12.1.6"')&&server.includes("version:'12.1.6'")]
];
let ok=true;for(const [n,v] of checks){console.log((v?'PASS ':'FAIL ')+n);if(!v)ok=false;}process.exit(ok?0:1);
