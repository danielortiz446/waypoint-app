const fs=require('fs');
for(const f of ['public/index.html','ios-capacitor/www/index.html','android-capacitor/www/index.html']){
 const s=fs.readFileSync(f,'utf8');
 const checks=[
  ['smart back button',s.includes('onclick="goBackSmart()"')],
  ['smart back function',s.includes('function goBackSmart()')],
  ['trip history push',s.includes('ui.tripTabHistory.push(ui.tripSubTab)')],
  ['trip history reset',s.includes("ui.tripTabHistory=[];render();")],
  ['settings returns trip',s.includes("(ui.screen==='settings'||ui.screen==='premium')&&ui.currentTripId")],
  ['version 12.1.4',s.includes('waypoint-version" content="12.1.4"')]
 ];
 for(const [name,ok] of checks){if(!ok) throw new Error(`${f}: ${name}`)}
}
console.log('PASS navigation 12.1.4');
