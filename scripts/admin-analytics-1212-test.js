const fs=require('fs'),assert=require('assert');
const server=fs.readFileSync('server.js','utf8'),admin=fs.readFileSync('public/admin.html','utf8'),app=fs.readFileSync('public/index.html','utf8'),privacy=fs.readFileSync('public/privacy.html','utf8');
for(const x of ['/api/telemetry/ping','/api/admin/analytics','/api/admin/live','telemetrySnapshot','recordTelemetry'])assert(server.includes(x),x);
for(const x of ['Live analytics','analyticsMetrics','liveUsers','Last 14 days','loadAnalytics'])assert(admin.includes(x),x);
for(const x of ['waypointTelemetryPing','waypointInstallationId','/api/telemetry/ping'])assert(app.includes(x),x);
assert(privacy.includes('Privacy-preserving app analytics'));assert(privacy.includes('Analítica de uso con privacidad'));
assert(app.includes("WAYPOINT_LEGAL_VERSION='1.9'"));
console.log('PASS privacy-preserving admin analytics, live presence UI and legal disclosure');
