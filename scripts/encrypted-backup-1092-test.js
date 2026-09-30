const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const crypto=require('node:crypto');
const html=fs.readFileSync('public/index.html','utf8');
const source=html.slice(html.indexOf('const WAYPOINT_BACKUP_MAX_BYTES='),html.indexOf('async function exportEncryptedData(){'));
const ctx=vm.createContext({crypto:crypto.webcrypto,TextEncoder,TextDecoder,Uint8Array,Array,JSON,Blob,btoa,atob,Error,String});
vm.runInContext(source+';globalThis.encrypt=waypointEncryptBackup;globalThis.decrypt=waypointDecryptBackup;globalThis.validate=waypointValidateBackup;',ctx);
(async()=>{
 const original={format:'waypoint-portable-backup',version:1,data:{trips:[{id:'test',destination:'Bogota'}],expenses:[],monetization:{plan:'premium',waypointId:'forged'}}};
 const serialized=JSON.stringify(original);
 const encrypted=await ctx.encrypt(serialized,'An example password 123');
 assert.equal(encrypted.format,'waypoint-encrypted-backup');
 assert(!JSON.stringify(encrypted).includes('Bogota'),'plaintext not visible in encrypted export');
 assert.equal(await ctx.decrypt(encrypted,'An example password 123'),serialized);
 await assert.rejects(()=>ctx.decrypt(encrypted,'Incorrect password 123'));
 const tampered={...encrypted,ciphertext:encrypted.ciphertext.slice(0,-8)+'AAAAAAAA'};
 await assert.rejects(()=>ctx.decrypt(tampered,'An example password 123'));
 const content=JSON.parse(await ctx.decrypt(encrypted,'An example password 123'));
 assert.equal(ctx.validate(content).monetization,undefined,'backup cannot import paid entitlement');
 assert.equal(ctx.validate(content).trips[0].destination,'Bogota');
 await assert.rejects(()=>ctx.encrypt(serialized,'short'));
 assert.throws(()=>ctx.validate({trips:'not array'}));
 for(const p of ['ios-capacitor/www/index.html','android-capacitor/www/index.html']){
  const body=fs.readFileSync(p,'utf8');assert(body.includes('waypointDecryptBackup')&&body.includes('Waypoint v12.1.0'));
 }
 console.log('PASS encrypted backup roundtrip, incorrect password, tampering protection, and minimum length');
 console.log('PASS portable backup validation removes forged Premium and mobile source parity');
})().catch(err=>{console.error(err);process.exitCode=1});
