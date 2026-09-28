const {spawn}=require('child_process');
const fs=require('fs');const os=require('os');const path=require('path');
const assert=require('assert/strict');
const root=path.join(__dirname,'..');const temp=fs.mkdtempSync(path.join(os.tmpdir(),'wp-places-'));
const preload=path.join(temp,'mock.js');
fs.writeFileSync(preload,`
const orig=globalThis.fetch;
globalThis.fetch=async(input,opts)=>{
 if(String(input).includes('generativelanguage.googleapis.com'))return new Response(JSON.stringify({candidates:[{content:{parts:[{text:'Visita Parque Los Fundadores.\\nWAYPOINT_SUGGESTIONS_JSON_START\\n[{"title":"Parque Los Fundadores","location":"Villavicencio, Meta","date":"2026-10-06","time":"10:00"}]\\nWAYPOINT_SUGGESTIONS_JSON_END'}]}}]}),{status:200,headers:{'content-type':'application/json'}});
 if(String(input).includes('places.googleapis.com'))return new Response(JSON.stringify({places:[{id:'abc123',displayName:{text:'Parque Los Fundadores'},formattedAddress:'Av. 40, Villavicencio, Meta, Colombia',googleMapsUri:'https://www.google.com/maps/place/abc123'}]}),{status:200,headers:{'content-type':'application/json'}});
 return orig(input,opts);
};
`);
const port=19473;
const child=spawn(process.execPath,['--require',preload,'server.js'],{cwd:root,env:{...process.env,PORT:String(port),HOST:'127.0.0.1',WAYPOINT_DATA_FILE:path.join(temp,'d.json'),GEMINI_API_KEY:'mocked',GOOGLE_PLACES_API_KEY:'mocked',WAYPOINT_AI_ENABLED:'true'},stdio:['ignore','pipe','pipe']});
const base='http://127.0.0.1:'+port;
(async()=>{try{
 for(let n=0;n<60;n++){try{if((await fetch(base+'/health')).ok)break;}catch{}await new Promise(r=>setTimeout(r,70));}
 let r=await fetch(base+'/api/ai/plan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'Recomiéndame lugares para visitar en Villavicencio',trip:{destination:'Villavicencio, Meta, Colombia',start:'2026-10-05',end:'2026-10-12'}})});
 assert.equal(r.status,200);let data=await r.json();assert.equal(data.suggestions.length,1);assert.equal(data.suggestions[0].addressStatus,'verified');assert.equal(data.suggestions[0].address,'Av. 40, Villavicencio, Meta, Colombia');assert.equal(data.suggestions[0].mapsUrl,'https://www.google.com/maps/place/abc123');console.log('PASS Gemini mocked response + Places verified address + Maps URL');
 // Without provider key, should NOT claim exact address
 child.kill();await new Promise(r=>child.once('exit',r));
 const noKey=spawn(process.execPath,['--require',preload,'server.js'],{cwd:root,env:Object.assign({},process.env,{PORT:String(port),HOST:'127.0.0.1',WAYPOINT_DATA_FILE:path.join(temp,'d2.json'),GEMINI_API_KEY:'mocked',WAYPOINT_AI_ENABLED:'true',GOOGLE_PLACES_API_KEY:''}),stdio:['ignore','pipe','pipe']});
 try{for(let n=0;n<60;n++){try{if((await fetch(base+'/health')).ok)break;}catch{}await new Promise(r=>setTimeout(r,70));}r=await fetch(base+'/api/ai/plan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'Recomiéndame lugares para visitar en Villavicencio',trip:{destination:'Villavicencio, Meta, Colombia',start:'2026-10-05',end:'2026-10-12'}})});data=await r.json();assert.equal(data.suggestions[0].addressStatus,'not_configured');assert.equal(data.suggestions[0].address,'');console.log('PASS missing Places key does not invent an exact address');}finally{noKey.kill()}
 }catch(e){console.error(e);process.exitCode=1;}finally{child.kill()}
})();
