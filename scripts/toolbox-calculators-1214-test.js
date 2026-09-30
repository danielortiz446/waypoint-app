const fs=require('fs');
const files=['public/index.html','ios-capacitor/www/index.html','android-capacitor/www/index.html'];
for(const f of files){
 const s=fs.readFileSync(f,'utf8');
 const checks=[
  'wp-tip-currency','wp-split-currency','wp-fuel-currency','wp-lug-unit','wp-lug-preset','wpToolTimezoneOptions',
  'Kilómetros → millas','Millas + MPG + precio por galón','Maleta facturada común','Hora a la que debes llegar'
 ];
 for(const c of checks) if(!s.includes(c)) throw new Error(`${f}: missing ${c}`);
 console.log('PASS calculator UX',f);
}
