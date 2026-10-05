const fs=require('fs'),vm=require('vm');
for(const p of ['public/index.html','ios-capacitor/www/index.html','android-capacitor/www/index.html']){
 const s=fs.readFileSync(p,'utf8');
 const checks=[
  ['currency function',s.includes('async function wpCurrencyCalc')],
  ['server fx route call',s.includes('/api/fx/rate?from=')],
  ['frankfurter fallback',s.includes('api.frankfurter.dev/v2/rate/')],
  ['localized parser',s.includes('function wpParseLocalizedNumber')],
  ['integer aware money',s.includes('const hasDecimals=Math.abs(value-Math.round(value))')],
  ['timezone technical label',s.includes('`${z} — ${l}`')],
  ['timezone wording',s.includes('Selecciona una zona horaria. La ciudad se muestra solo como referencia.')],
  ['money text input',s.includes('id="wp-fx-amount" type="text" inputmode="decimal"')],
  ['version',s.includes('waypoint-version" content="12.2.0"')]
 ];
 for(const [n,ok] of checks){if(!ok){console.error('FAIL',p,n);process.exitCode=1;}}
 if(!process.exitCode) console.log('PASS',p);
}
