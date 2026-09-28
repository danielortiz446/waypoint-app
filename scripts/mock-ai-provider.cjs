// Test-only AI HTTP stub: no external network calls occur.
const nativeFetch=global.fetch;
global.fetch=(url,options)=>{
 if(String(url)==='https://api.openai.com/v1/responses'){
  const payload=JSON.parse(options.body);
  if(!payload.store===false)throw Error('Store must be false');
  if(payload.input.includes('TOP_SECRET_TEST_MARKER'))throw Error('Private documents leaked into AI request');
  return Promise.resolve({ok:true,json:async()=>({output:[{type:'message',content:[{type:'output_text',text:'A bilingual three-day itinerary suggestion, not verified.'}]}]})});
 }
 return nativeFetch(url,options);
};
