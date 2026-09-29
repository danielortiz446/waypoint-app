const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');
const html=fs.readFileSync('public/index.html','utf8');
const between=(a,b)=>{const i=html.indexOf(a),j=html.indexOf(b,i+a.length);assert(i>=0&&j>i,`missing ${a}`);return html.slice(i,j);};
const alerts=[],storeCalls=[];
const fields={};
for(const i of [0,1,2,3]){
 fields['wp-ai-date-'+i]={value:'2026-10-06'};
 fields['wp-ai-time-'+i]={value:'09:30'};
}
const ctx={
 state:{lang:'es',itineraries:{trip:[]},flightJournal:{},reminders:{},privateVault:{}},
 ui:{aiTripId:'trip',aiSuggestions:[
  {title:'Parque Los Fundadores',location:'Villavicencio',addressStatus:'verified',address:'Cra 40 Villavicencio'},
  {title:'Parque Los Fundadores',location:'Villavicencio',addressStatus:'verified',address:'Cra 40 Villavicencio'},
  {title:'Mirador',location:'Meta',addressStatus:'not_found'},
  {title:'Too Late',location:'Meta',addressStatus:'not_found'}
 ]},
 document:{getElementById:(x)=>fields[x],querySelectorAll:(x)=>x==='.wp-ai-select:checked'?[{dataset:{aiIndex:'0'}},{dataset:{aiIndex:'1'}},{dataset:{aiIndex:'2'}},{dataset:{aiIndex:'3'}}]:[]},
 tripById:id=>id==='trip'?{id:'trip',start:'2026-10-05',end:'2026-10-12',liveSync:true,collabParticipantId:'p123'}:null,
 isPremium:()=>true,canEditTrip:()=>true,uid:(()=>{let i=0;return()=>`id-${++i}`})(),
 showToast:s=>alerts.push(s),render:()=>{},saveState:()=>storeCalls.push('saved'),confirm:()=>true,
 chatParticipantId:()=> 'device123',escapeHtml:s=>s||'',
};
fields['wp-ai-date-3'].value='2026-10-15';
vm.createContext(ctx);
vm.runInContext(between('// Batch actions are explicitly confirmed','function flightEntries(tr)'),ctx);
ctx.addSelectedAISuggestions('trip');
assert.equal(storeCalls.length,1);
let acts=ctx.state.itineraries.trip.flatMap(d=>d.activities||[]);
assert.equal(acts.length,2,'should add two new valid items (skip one duplicate and invalid date)');
assert.equal(acts[0].location,'Cra 40 Villavicencio');
ctx.addSelectedAISuggestions('trip');assert.equal(storeCalls.length,1,'duplicates cannot trigger another save');
console.log('PASS AI multi-select, duplicate prevention, date bounds and address reuse');
vm.runInContext(between('function activityRsvpHtml(tr,day,activity){','function copyActivity(tripId,dayId,actId)'),ctx);
const tr=ctx.tripById('trip'),day=ctx.state.itineraries.trip[0],act=day.activities[0];
ctx.setActivityRsvp('trip',day.id,act.id,'yes');assert.equal(act.rsvp.p123,'yes');
ctx.setActivityRsvp('trip',day.id,act.id,'maybe');assert.equal(act.rsvp.p123,'maybe');
ctx.setActivityRsvp('trip',day.id,act.id,'maybe');assert.equal(act.rsvp.p123,undefined);
assert.equal(ctx.activityRsvpHtml(tr,day,act).includes('Asistencia'),true);
console.log('PASS shared-trip RSVP changes, counts and toggle-off');
assert(html.includes('id="wp-wallet-filter"'), 'wallet filter UI');
assert(html.includes('function exportTripEssentials('),'offline essentials export');
assert(html.includes('function checkLiveFlight('),'on demand flight controller');
console.log('PASS wallet category filter, offline essentials export and flight controls included');
