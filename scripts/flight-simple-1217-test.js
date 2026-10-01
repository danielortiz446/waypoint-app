const fs=require('fs');
const files=['public/index.html','ios-capacitor/www/index.html','android-capacitor/www/index.html'];
let ok=true;
for(const f of files){
 const s=fs.readFileSync(f,'utf8');
 const checks=[
  ['version 12.1.7',s.includes('waypoint-version" content="12.1.7"')],
  ['simple flight copy',s.includes('Solo necesitas número de vuelo, fecha, origen y destino.')],
  ['optional details',s.includes("Detalles opcionales")],
  ['flight number required',s.includes('id="wp-flight-number"')],
  ['airport flexible parser',s.includes('function wpParseAirportInput')],
  ['origin accepts city',s.includes("BOG o Bogotá")],
  ['destination accepts city',s.includes("MIA o Miami")],
  ['live lookup preserved',s.includes('checkLiveFlight')],
  ['checkin preserved',s.includes('toggleFlightCheckin')],
  ['expandable saved details',s.includes("Ver detalles")]
 ];
 for(const [name,pass] of checks){console.log(pass?'PASS':'FAIL',f,name); if(!pass)ok=false;}
}
const server=fs.readFileSync('server.js','utf8');
if(!server.includes("version:'12.1.7'")){console.log('FAIL server version');ok=false}else console.log('PASS server version');
if(!ok)process.exit(1);
