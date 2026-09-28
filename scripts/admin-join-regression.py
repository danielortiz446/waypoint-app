#!/usr/bin/env python3
"""Integration tests for Waypoint shared joins and server-side monetization."""
import json, os, subprocess, tempfile, time, urllib.request, urllib.error, http.cookiejar, sys
from pathlib import Path
root=Path(__file__).resolve().parent.parent
work=tempfile.TemporaryDirectory(prefix='wp-qa-')
port=19021
base=f'http://127.0.0.1:{port}'
env={**os.environ,'PORT':str(port),'HOST':'127.0.0.1',
     'WAYPOINT_DATA_FILE':work.name+'/rooms.json','WAYPOINT_ADMIN_DATA_FILE':work.name+'/admin.json',
     'WAYPOINT_FILE_DIR':work.name+'/files','WAYPOINT_ADMIN_EMAIL':'qa@waypoint.test',
     'WAYPOINT_ADMIN_PASSWORD':'test-super-secret-456-long'}
proc=subprocess.Popen(['node','server.js'],cwd=root,env=env,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
plain=urllib.request.build_opener(); cookiejar=http.cookiejar.CookieJar()
logged=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookiejar))
checks=[]
def call(method,path,payload=None,headers=None,opener=plain):
  body=None if payload is None else json.dumps(payload).encode()
  headers={**({'Content-Type':'application/json'} if payload is not None else {}),**(headers or {})}
  req=urllib.request.Request(base+path,body,headers,method=method)
  try:
    with opener.open(req,timeout=5) as resp:
      return resp.status,json.loads(resp.read().decode() or '{}')
  except urllib.error.HTTPError as exc:
    return exc.code,json.loads(exc.read().decode() or '{}')
def check(label,condition):
  good=bool(condition);checks.append(good)
  print(('PASS' if good else 'FAIL')+' '+label)
try:
  for _ in range(50):
    try:
      if call('GET','/health')[0]==200:break
    except Exception:time.sleep(.12)
  else:raise RuntimeError('server failed to start')
  st,_=call('PUT','/api/trips/join-test',{'clientRevision':0,'data':{'waypointLive':1,'trip':{'name':'Colombia con David'},'days':[],'bookings':[]}},
              {'X-Edit-Key':'test-editor','X-View-Key':'test-viewer'})
  check('shared test room created',st==200)
  for name in ['', ' ', '1', '123456', 'p-'+'a'*36]:
    st,_=call('POST','/api/trips/join-test/participants',{'name':name,'participantId':'guest1','role':'editor'},
              {'X-Access-Key':'test-viewer'})
    check('invalid join name rejected '+repr(name),st==400)
  st,j=call('POST','/api/trips/join-test/participants',{'name':'David','participantId':'guest1','role':'editor'},
              {'X-Access-Key':'test-viewer'})
  check('valid guest registered',st==200 and j.get('ok') and any(p.get('name')=='David' for p in j.get('participants',[])))
  check('viewer token cannot register as editor',next((p.get('role') for p in j.get('participants',[]) if p.get('participantId')=='guest1'),None)=='viewer')
  st,_=call('GET','/api/admin/users')
  check('admin users protected',st==401)
  st,_=call('POST','/api/admin/login',{'email':'qa@waypoint.test','password':'wrong'})
  check('wrong admin password rejected',st==401)
  st,j=call('POST','/api/admin/login',{'email':'qa@waypoint.test','password':'test-super-secret-456-long'},opener=logged)
  check('admin login',st==200 and j.get('ok'))
  def client(n):
    cid='wc-'+n*36;secret=n*64
    st,data=call('POST','/api/client/register',{'clientId':cid,'clientSecret':secret,'displayName':'User '+n})
    assert st==200,(st,data)
    return data['user']['waypointId'],{'X-Waypoint-Client-Id':cid,'X-Waypoint-Client-Secret':secret}
  u1,c1=client('a')
  st,j=call('PATCH',f'/api/admin/users/{u1}/premium',{'action':'grant','days':7,'reason':'Test'},opener=logged)
  check('admin grant seven days',st==200 and j['user']['plan']=='premium' and j['user']['premiumUntil'])
  st,j=call('PATCH',f'/api/admin/users/{u1}',{'note':'INTERNAL PRIVATE NOTE'},opener=logged)
  check('admin note saved',st==200 and j['user']['note']=='INTERNAL PRIVATE NOTE')
  st,j=call('GET','/api/client/status',headers=c1)
  check('client receives premium entitlement',st==200 and j['user']['plan']=='premium')
  check('private support note hidden from client','note' not in j.get('user',{}))
  st,j=call('POST','/api/admin/promo-codes',{'code':'FOREVERFREE','premiumDays':0,'maxUses':1},opener=logged)
  check('create permanent promo',st==201 and j['promoCode']['premiumDays']==0)
  u2,c2=client('b')
  st,j=call('POST','/api/client/redeem',{'code':'FOREVERFREE'},headers=c2)
  check('permanent promo grants without expiration',st==200 and j['user']['plan']=='premium' and j['user']['premiumUntil'] is None)
  st,_=call('POST','/api/client/redeem',{'code':'FOREVERFREE'},headers=c2)
  check('repeat promo blocked',st==409)
  u3,c3=client('c')
  st,_=call('POST','/api/client/redeem',{'code':'FOREVERFREE'},headers=c3)
  check('promo max redemptions enforced',st==410)
  st,j=call('PATCH',f'/api/admin/users/{u1}/premium',{'action':'revoke'},opener=logged)
  check('manual revoke',st==200 and j['user']['plan']=='free')
  st,j=call('GET','/api/client/status',headers=c1)
  check('revocation reaches client server status',st==200 and j['user']['plan']=='free')
  st,j=call('PUT','/api/admin/feature-flags',{'adsDesired':True,'premiumPurchasesDesired':True},opener=logged)
  st,j=call('GET','/api/features')
  check('no fictitious payments or advertising',st==200 and not j['ads'] and not j['premiumPurchases'] and j['desired']['ads'] and j['desired']['premiumPurchases'])
  st,j=call('GET','/api/admin/security-logs',opener=logged)
  check('administrative audit recorded',st==200 and len(j.get('logs',[]))>=5)
finally:
  proc.terminate()
  try:proc.wait(timeout=5)
  except Exception:proc.kill()
  work.cleanup()
print(f'RESULT {sum(checks)}/{len(checks)} passed')
sys.exit(0 if all(checks) else 1)
