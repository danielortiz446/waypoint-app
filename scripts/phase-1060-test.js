const fs=require('fs');const assert=require('assert');
const html=fs.readFileSync('public/index.html','utf8');const server=fs.readFileSync('server.js','utf8');const sw=fs.readFileSync('public/service-worker.js','utf8');
const checks=[
 ['version meta',html.includes('waypoint-version" content="12.1.0')],
 ['health version',server.includes("version:'12.1.0'")],
 ['sw cache',sw.includes("waypoint-v12.1.0-final-toolkit")],
 ['one click planner',html.includes('function startOneClickPlan(')&&html.includes('ONE-CLICK PLANNING')],
 ['conflict review',html.includes('function allTripConflicts1060(')&&html.includes('shiftConflictNext1060')],
 ['offline verify',html.includes('function verifyOfflineTrip1060(')&&html.includes('offlineVerifiedAt')],
 ['reliability card',html.includes('function waypointReliabilityPanel1060(')&&html.includes('exportData()')],
 ['file reservation import',html.includes('function loadReservationFile(')&&html.includes('.txt,.eml,.ics,.csv,.json')],
 ['ics parsing',html.includes('function parseICSReservation1060(')&&html.includes('BEGIN:VEVENT')],
 ['raw import bounded',html.includes('slice(0,30000)')],
 ['ios mirror version',fs.readFileSync('ios-capacitor/www/index.html','utf8').includes('content="12.1.0"')]
];
for(const [name,ok] of checks){assert.ok(ok,name);console.log('✓',name)}
console.log(`phase1060: ${checks.length} checks passed`);
