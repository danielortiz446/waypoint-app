// Mock Gemini only. Never contacts the real provider.
const nativeFetch=global.fetch;
global.fetch=(url,options)=>{
 if(String(url).startsWith('https://generativelanguage.googleapis.com/v1beta/models/')){
  const payload=JSON.parse(options.body||'{}');
  if(JSON.stringify(payload).includes('TOP_SECRET_TEST_MARKER'))throw Error('Private documents leaked into Gemini request');
  if(options.headers?.['x-goog-api-key']!=='fake-gemini-key')throw Error('Gemini credential not sent');
  return Promise.resolve({ok:true,status:200,json:async()=>({candidates:[{content:{parts:[{text:'A bilingual three-day itinerary suggestion, not verified.'}]}}]})});
 }
 return nativeFetch(url,options);
};
