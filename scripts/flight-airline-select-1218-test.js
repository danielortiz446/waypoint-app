const fs=require('fs');
const files=['public/index.html','ios-capacitor/www/index.html','android-capacitor/www/index.html'];
let fail=0;
function check(ok,label){console.log((ok?'PASS ':'FAIL ')+label); if(!ok)fail++;}
for(const f of files){
 const s=fs.readFileSync(f,'utf8');
 check(s.includes('content="12.1.8"'),f+' version 12.1.8');
 check(s.includes('id="wp-flight-airline-select"'),f+' airline selector');
 check(s.includes("['AV','Avianca']")&&s.includes("['AA','American Airlines']")&&s.includes("['LA','LATAM Airlines']"),f+' airline catalog');
 check(s.includes('inputmode="numeric"')&&s.includes('maxlength="4"'),f+' numeric flight number');
 check(s.includes("const number=(airlineCode+flightDigits).toUpperCase()"),f+' composes IATA flight number');
 check(s.includes("airline:wpAirlineNameByCode(airlineCode)||airlineCode"),f+' stores airline name');
 check(s.includes('value="OTHER"'),f+' other airline fallback');
}
const server=fs.readFileSync('server.js','utf8');
check(server.includes("version:'12.1.8'"),'server version 12.1.8');
process.exit(fail?1:0);
