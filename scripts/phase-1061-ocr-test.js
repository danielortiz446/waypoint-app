'use strict';
const assert=require('node:assert/strict');
const cp=require('node:child_process');
const path=require('node:path');
const fs=require('node:fs');
const os=require('node:os');
const PORT=19161;
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'waypoint-ocr-test-'));
const mock=path.join(directory,'mock.js');
fs.writeFileSync(mock,`
const original=globalThis.fetch;
globalThis.fetch=async (url,options)=>{
 if(String(url).includes('generativelanguage.googleapis.com')){
   if(options?.headers?.['x-goog-api-key']!=='test-gemini-key')throw Error('no key');
   const body=JSON.parse(options.body);
   if(!body.contents?.[0]?.parts?.[1]?.inline_data?.data)throw Error('no inline image');
   return new Response(JSON.stringify({candidates:[{content:{parts:[{text:'TIENDA TEST\\nTOTAL $12.34\\n2026-09-29'}]}}]}),{status:200,headers:{'content-type':'application/json'}});
 }
 return original(url,options);
};
`);
const child=cp.spawn(process.execPath,['-r',mock,path.join(__dirname,'..','server.js')],{env:{...process.env,PORT:String(PORT),HOST:'127.0.0.1',WAYPOINT_DATA_FILE:path.join(directory,'data.json'),WAYPOINT_ADMIN_DATA_FILE:path.join(directory,'admin.json'),WAYPOINT_AI_ENABLED:'true',GEMINI_API_KEY:'test-gemini-key',WAYPOINT_AI_MODEL:'gemini-2.5-flash-lite',OCR_API_URL:'',WAYPOINT_AI_DAILY_LIMIT:'10'},stdio:'ignore'});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 try{
  for(let x=0;x<30;x++){try{const r=await fetch(`http://127.0.0.1:${PORT}/health`);if(r.ok)break;}catch(_){}await wait(150);}
  const url=`http://127.0.0.1:${PORT}/api/ocr/receipt`;
  const request=async(imageDataUrl)=>{const r=await fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({imageDataUrl})});return {status:r.status,body:await r.json()};};
  const bad=await request('data:text/html;base64,aGk=');assert.equal(bad.status,400);assert.equal(bad.body.error,'invalid_image');
  const ok=await request('data:image/png;base64,aGVsbG8=');assert.equal(ok.status,200);assert.equal(ok.body.provider,'Gemini');assert.match(ok.body.text,/TOTAL \$12\.34/);assert(!JSON.stringify(ok.body).includes('test-gemini-key'));
  const c=await request('data:image/png;base64,');assert.equal(c.status,400);
  const html=fs.readFileSync(path.join(__dirname,'..','public','index.html'),'utf8');assert(html.includes("'Resumen del viaje':'Trip summary'"));assert(!html.includes("'Recuerdos':'Recap'"));assert(html.includes('receipt-ocr-btn'));
  console.log('PASS OCR rejects invalid images');
  console.log('PASS OCR calls Gemini mock and returns extracted receipt text');
  console.log('PASS OCR response hides credentials');
  console.log('PASS recap menu labels match screen');
  console.log('PASS English/Spanish receipt UI present');
 }finally{child.kill();fs.rmSync(directory,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
