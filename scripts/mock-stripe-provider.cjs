const originalFetch=global.fetch;
global.fetch=async function(url,opts={}){
  if(String(url).startsWith('https://api.stripe.com/v1/')){
    const s=String(url),method=opts.method||'GET';
    if(s.endsWith('/checkout/sessions') && method==='POST'){
      return new Response(JSON.stringify({id:'cs_test_waypoint_demo',url:'https://checkout.stripe.com/c/pay/cs_test_waypoint_demo'}),{status:200,headers:{'Content-Type':'application/json'}});
    }
    if(s.endsWith('/subscriptions/sub_waypointdemo') && method==='GET'){
      const active=process.env.STRIPE_MOCK_STATUS_FILE && require('fs').readFileSync(process.env.STRIPE_MOCK_STATUS_FILE,'utf8').trim()==='active';
      return new Response(JSON.stringify({id:'sub_waypointdemo',status:active?'active':'canceled',current_period_end:Math.floor(Date.now()/1000)+2592000,metadata:{}}),{status:200,headers:{'Content-Type':'application/json'}});
    }
    throw new Error('Unexpected Stripe API call: '+method+' '+s);
  }
  return originalFetch(url,opts);
};
