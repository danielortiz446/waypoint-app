const fs=require('fs'),assert=require('assert');
const s=fs.readFileSync('server.js','utf8'),h=fs.readFileSync('public/index.html','utf8'),and=fs.readFileSync('android-capacitor/capacitor.config.ts','utf8');
for(const token of ['verifyStripeWebhook(raw,req.headers','/api/billing/stripe/webhook','/api/billing/stripe/checkout','clientAuth(req)','reconcileStripeSubscription','WAYPOINT_PUBLIC_URL'])assert(s.includes(token),token);
assert(h.includes('waypointWebCheckout'));assert(h.includes("const WAYPOINT_LEGAL_VERSION='1.6'"));assert(and.includes('WAYPOINT_ANDROID_URL'));assert(and.includes('https:'));
assert.strictEqual(h,fs.readFileSync('ios-capacitor/www/index.html','utf8'));
assert(fs.readFileSync('public/ads.txt','utf8').includes('pub-1755628880712670'));
console.log('PASS 10.7.0: Stripe API/webhooks, iOS mirror, Android shell, privacy version, AdSense verification unchanged');
