const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..');
const files=['public/index.html','ios-capacitor/www/index.html','android-capacitor/www/index.html'];
for(const file of files){
  const html=fs.readFileSync(path.join(root,file),'utf8');
  for(const token of ['prepareReceiptImageDataUrl','12_000_000','Sugerencias inteligentes para este viaje','setWaypointLegalLanguage','ui.aiFullPlanPending=true']) assert(html.includes(token),`${file}: missing ${token}`);
  assert(html.includes("items.push({id:uid(),text,category:suggestion.category||'other'"),`${file}: smart packing still not writing text`);
  const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
  for(const [,script] of scripts) if(script.trim()) new vm.Script(script,{filename:file});
  console.log('PASS UI 10.9.9:',file);
}
for(const file of ['public/privacy.html','public/terms.html','ios-capacitor/www/privacy.html','ios-capacitor/www/terms.html','android-capacitor/www/privacy.html','android-capacitor/www/terms.html']){
  const html=fs.readFileSync(path.join(root,file),'utf8');
  assert(html.includes('data-lang-btn="en"')&&html.includes('data-lang-btn="es"'),`${file}: missing bilingual toggle`);
  assert(html.includes("URLSearchParams(location.search).get('lang')"),`${file}: missing lang query support`);
}
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
assert(server.includes("looksLikeFullItineraryRequest(question)"));
assert(server.includes("ent.plan!=='premium'&&looksLikeFullItineraryRequest(question)"));
assert(server.includes('imageBuffer.length>5_000_000'));
const start=server.indexOf('function looksLikeFullItineraryRequest('), end=server.indexOf('\nfunction ',start+10);
const ctx={};vm.createContext(ctx);vm.runInContext(server.slice(start,end),ctx);
for(const q of ['Create a full itinerary for my trip','Crea un itinerario completo para mi viaje','Plan 5 days in Madrid','Organiza mi viaje de 4 dias con un itinerario']) assert(ctx.looksLikeFullItineraryRequest(q),`not detected: ${q}`);
for(const q of ['Recommend cheap restaurants','Dame lugares para comer','What should I pack?']) assert(!ctx.looksLikeFullItineraryRequest(q),`false positive: ${q}`);
console.log('PASS premium full-itinerary gate, receipt capacity, bilingual legal pages, smart packing fix');
