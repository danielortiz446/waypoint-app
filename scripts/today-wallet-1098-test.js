const fs=require('fs'),vm=require('vm'),assert=require('assert');
const root=require('path').resolve(__dirname,'..');
const files=['public/index.html','ios-capacitor/www/index.html','android-capacitor/www/index.html'];
for(const file of files){
 const html=fs.readFileSync(require('path').join(root,file),'utf8');
 for(const token of ['setTodaySelectedDate','stepTodaySelectedDate','tripTodayMoneySummary','expenseLogFilterFields','wp1098-day-navigation','wp1098-expense-search']) assert(html.includes(token),`${file}: missing ${token}`);
 assert(!html.includes('class="countdown-card style='),'Malformed countdown card');
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
 for(const [,script] of scripts)if(script.trim())new vm.Script(script,{filename:file});
 console.log(`PASS UI feature parity and JS syntax: ${file}`);
}
const html=fs.readFileSync(require('path').join(root,files[0]),'utf8');
function extract(name,next){const start=html.indexOf(`function ${name}(`),end=html.indexOf(`\nfunction ${next}(`,start);assert(start>=0&&end>start,`Could not locate ${name}`);return html.slice(start,end);}
const ctx={ui:{},state:{expenses:[{tripId:'T',date:'2026-10-02',amount:20,paidBy:'Alice',category:'food',desc:'Lunch'},{tripId:'T',date:'2026-10-03',amount:30,paidBy:'Bob',category:'hotel',desc:'Hotel'}]},tr:{id:'T',start:'2026-10-01',end:'2026-10-05',budgetGoal:200,currency:'USD'},Date,console,
 tripById(id){return id==='T'?this.tr:null},
 destinationClock(){return {date:'2026-10-02',minutes:600}},
 tripSpent(id){return this.state.expenses.filter(e=>e.tripId===id).reduce((a,e)=>a+e.amount,0)},
 daysBetween(a,b){return Math.round((Date.parse(b+'T12:00:00Z')-Date.parse(a+'T12:00:00Z'))/86400000)},
 tripDurationDays(){return 5},roundMoney(n){return Math.round(n*100)/100},
 render(){this.rendered=(this.rendered||0)+1},
 tt(){return {budget:{cats:{food:'Food',hotel:'Hotel'}}}}, CATS:['food','hotel'],
 escapeHtml(s){return String(s)},
};ctx.globalThis=ctx;vm.createContext(ctx);
for(const [name,next] of [['setTodaySelectedDate','stepTodaySelectedDate'],['stepTodaySelectedDate','tripTodayMoneySummary'],['tripTodayMoneySummary','tripFocusDate'],['tripFocusDate','timelineNowClass'],['expenseAnalytics','setExpenseLogFilter'],['setExpenseLogFilter','expenseLogFilterFields'],['expenseLogFilterFields','updateExpenseFilterInPlace']])vm.runInContext(extract(name,next),ctx);
// vm function closure binding this differs for mock trip lookup, bind via closures instead
ctx.tripById=id=>id==='T'?ctx.tr:null;ctx.tripSpent=id=>ctx.state.expenses.filter(e=>e.tripId===id).reduce((a,e)=>a+e.amount,0);ctx.render=()=>ctx.rendered=(ctx.rendered||0)+1;
assert.equal(ctx.tripFocusDate(ctx.tr),'2026-10-02');
ctx.stepTodaySelectedDate('T',1);assert.equal(ctx.tripFocusDate(ctx.tr),'2026-10-03');
ctx.setTodaySelectedDate('T','2026-10-08');assert.equal(ctx.tripFocusDate(ctx.tr),'2026-10-03');
assert.equal(ctx.tripTodayMoneySummary(ctx.tr,'2026-10-02').spent,20);
const a=ctx.expenseAnalytics(ctx.tr);assert.equal(a.elapsed,2);assert.equal(a.forecast,125);
assert.equal(ctx.expenseLogFilterFields(ctx.tr,ctx.state.expenses).visible.length,2);
ctx.ui.expenseLogFilters={category:'food'};assert.equal(ctx.expenseLogFilterFields(ctx.tr,ctx.state.expenses).visible.length,1);
console.log('PASS focus date navigation, bounds, daily budget, destination-aware forecast and expense filtering');
