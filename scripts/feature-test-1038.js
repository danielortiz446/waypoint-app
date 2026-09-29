const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync('public/index.html','utf8');
const server=fs.readFileSync('server.js','utf8');
function slice(start,end){const i=html.indexOf(start),j=html.indexOf(end,i+start.length);assert(i>=0&&j>i,`missing ${start}`);return html.slice(i,j);}
const source=slice('function waypointAIMarkup(raw){','const WAYPOINT_IDEA_PROMPTS=') + '\n' + slice('function emergencyContactDialNumber(contact){','function addEmergencyContact(tripId){');
const ctx={escapeHtml:(s)=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')};vm.createContext(ctx);vm.runInContext(source,ctx);
let formatted=ctx.waypointAIMarkup('## Lugares\n**Hermoso**\n- Visita el centro\n<script>alert(1)</script>');
assert(formatted.includes('<h4 class="wp-ai-heading">Lugares</h4>'));assert(formatted.includes('<strong>Hermoso</strong>'));assert(!formatted.includes('<script>'));
assert.strictEqual(ctx.emergencyContactDialNumber({countryCode:'+57',phone:'321 456 7890'}),'+573214567890');
assert.strictEqual(ctx.emergencyContactDialNumber({phone:'+1 (407) 123-4567'}),'+14071234567');
assert(server.includes('at most 10 objects'));assert(server.includes('const date=clean(row.date,10),time=clean(row.time,5),reason=clean(row.reason,100)'));assert(!server.includes('process.env.OPENAI_API_KEY'));
assert(html.includes("WAYPOINT_LEGAL_VERSION='1.4'"));
for(const legal of ['public/privacy.html','public/terms.html']){const s=fs.readFileSync(legal,'utf8');assert(s.includes('Google Gemini'));assert(s.includes('Google Places'));assert(!s.includes('(OpenAI)'));assert(s.includes('1.4'));}
assert(html.includes('chooseWaypointAIIdea'));assert(html.includes('¿Qué quieres planificar?'));
console.log('PASS AI structured answer safe HTML');
console.log('PASS international dialing + legacy contacts');
console.log('PASS Gemini-only prompt and 10 suggestions');
console.log('PASS legal Gemini/Places v1.4 and interactive choices');
