const fs=require('fs');
const files=['public/index.html','ios-capacitor/www/index.html','android-capacitor/www/index.html'];
for(const f of files){
 const s=fs.readFileSync(f,'utf8');
 const checks=['viewWaypointToolbox','wpCurrencyCalc','wpTipCalc','wpUnitConvert','wpFuelCalc','wpLuggageCalc','wpSplitBill','wpEtaCalc','wpTimezoneCalc',"['tools','🧰'",'WAYPOINT TOOLBOX','WAYPOINT AI TOOLS'];
 for(const c of checks){if(!s.includes(c)) throw new Error(`${f} missing ${c}`)}
 console.log('PASS toolbox parity',f);
}
