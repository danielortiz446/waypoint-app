const fs=require('fs'),vm=require('vm'),assert=require('assert');
for(const filename of ['public/index.html','ios-capacitor/www/index.html','android-capacitor/www/index.html']){
 const source=fs.readFileSync(filename,'utf8');
 const slice=source.slice(source.indexOf('function destinationClock('),source.indexOf('function destinationNow('));
 const ctx={Intl,Date,todayIsoLocal:()=> '2026-09-29',tripTimezone:tr=>tr.timezone,state:{lang:'es'},scheduleConflicts:()=>[],escapeHtml:x=>String(x)};
 vm.createContext(ctx);vm.runInContext(slice,ctx);
 const t=new Date('2026-09-30T02:15:00Z');
 assert.deepStrictEqual(JSON.parse(JSON.stringify(ctx.destinationClock({timezone:'America/New_York'},t))),{date:'2026-09-29',minutes:22*60+15});
 assert.deepStrictEqual(JSON.parse(JSON.stringify(ctx.destinationClock({timezone:'Asia/Tokyo'},t))),{date:'2026-09-30',minutes:11*60+15});
 assert(source.includes('detailedScheduleAlerts(tr,d.date||\'\')'));
 assert(source.includes('date===destinationClock(tr).date'));
 console.log('PASS destination date/time and detailed conflicts:',filename);
}
