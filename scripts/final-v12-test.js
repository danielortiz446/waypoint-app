const fs=require('fs');
const paths=['public/index.html','ios-capacitor/www/index.html','android-capacitor/www/index.html'].filter(fs.existsSync);
let ok=true;
for(const p of paths){
 const s=fs.readFileSync(p,'utf8');
 for(const needle of ['Waypoint AI Assistant','viewTripGlobalSearch','viewTripTemplates','tripTemplates','applyTripTemplate']){
   if(!s.includes(needle)){console.error('FAIL',p,needle);ok=false;}
 }
 console.log('PASS parity markers',p);
}
const server=fs.readFileSync('server.js','utf8');
if(!server.includes("version:'12.1.6'")){console.error('FAIL server version');ok=false;}else console.log('PASS server version');
process.exit(ok?0:1);
