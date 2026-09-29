# Historical QA reports

These reports document older validation runs and do not establish current release quality.

---

## QA-IOS-STATUS

```text
Waypoint iOS scaffold QA — 2026-09-28
- Source: Waypoint V10.2.0 complete ZIP.
- iOS project: capacitor.config.ts, package.json, placeholder www/index.html, README, setup guide.
- Remote target URL: read from WAYPOINT_IOS_URL; refused unless HTTPS origin.
- Original web source and backend: copied without modifications.
- Limitation: node dependencies not installed; no macOS/Xcode compilation or real iPhone run in this container.
- App Store: NOT production-ready; webview testing shell only; native capabilities, true offline and AdMob pending.

```

---

## QA-PHASE1

```text
Waypoint 10.2.0 phase 1 — QA notes
- 61 existing automated backend/smoke checks: PASS.
- Node parse checks: server.js, service-worker.js and inline public/index.html JavaScript: PASS.
- /health responds version 10.2.0: PASS during a local run.
- New map day selection: code/static validation only; not exercised by mobile automation.
- Offline cache acknowledgements: code/static validation only; must be tested in Chrome/Safari while online then with network disconnected. Browser headless run timed out, so no browser pass is claimed.
- Old project data model, Railway volume location, API routes and Capacitor remote target requirements remain unchanged.
- No App Store submission, macOS/Xcode build, Face ID, push, AdMob, flight provider or AI service in this version.

```

---

## QA-REPORT

```text
Waypoint V10.1.5 — Admin-only diagnostics QA

Changes:
- Removed diagnostic panel and provider/integration cards from public Settings.
- Kept consumer itinerary, backups, consent, profile and account settings unchanged.
- Added System diagnostics refresh button at /admin (requires logged-in administrator).
- Extended already-authenticated /api/admin/system response with configured-provider booleans (no API keys exposed).
- Preserved Google AdSense client ID and /ads.txt.
- Bumped server health, admin status, package, app label and service worker version to 10.1.5.

Checks:
- node --check server.js, service-worker.js, client inline JavaScript, admin inline JavaScript: PASS
- Existing npm test (scripts/smoke-test.js): PASS
- GET /api/admin/system without admin session: HTTP 401 PASS
- POST /api/admin/login and GET /api/admin/system with session: HTTP 200 PASS
- GET /ads.txt contains pub-1755628880712670: PASS
- Public /index.html lacks diagnostics UI: PASS
- GET /health shows 10.1.5: PASS

Limits: These automated checks do not replace real browser/mobile regression tests and Railway deployment tests. AdSense ownership verification does not enable ad serving. Do not delete /data volume or existing Railway environment variables.

```

---

## QA-V10.3.0

```text
Waypoint V10.3.0 — QA

PASS: node --check server.js
PASS: node --check public/service-worker.js
PASS: node --check extracted inline public/index.html script
PASS: npm test: 61 existing API smoke tests
PASS: node scripts/ai-integration-test.js: 6 assertions — health, AI disabled status, disabled request, cross-origin, ads.txt, admin guard
PASS: node scripts/ai-mocked-test.js: configured mode, simulated AI response, private field filtering, quota cut-off (no live provider charged)
PASS: node scripts/wallet-crypto-test.js: ciphertext, wrong passphrase and tamper detection
PASS: static checks for new UI/functions and service-worker version
NOT TESTED: live OpenAI request using user's API key, deployed Railway site, App Store build, iPhone and push notifications.
BLOCKER: graphical browser test attempt was blocked by environment administrator (net::ERR_BLOCKED_BY_ADMINISTRATOR). No claim of mobile browser E2E success.
LIMITATION: direct real-time flight tracking, native Face ID encrypted vault, APNs push, WidgetKit/ActivityKit, production iOS build, and AdMob still require implementation/infrastructure.

```

---

## QA-V10.3.1

```text
Waypoint 10.3.1 — geolocation and touch UI

Confirmed:
- 61 existing Node smoke tests passed.
- Vault AES-GCM test passed.
- Mocked AI integration test passed.
- Syntax checks passed: Node server, service worker, and extracted inline JavaScript.
- Local HTTP returned Permissions-Policy: geolocation=(self) (previously blocked).
- UI source now separates GPS retrieval from an explicit share action; provides copy link and manual selection.
- Tool buttons have accessible aria-pressed state, focus and touch feedback.

Not confirmed:
- Real GPS or native iPhone location permission, live Railway deployment, Safari share sheet, visual browser click through: browser in this environment blocked local URL navigation.
- AdMob/Apple push/widget/Live Activities are NOT implemented here.

Deploy to existing GitHub repo/Railway service; keep volume /data and credentials unchanged.

```

---

## QA-V10.3.6-WALLET

```text
Waypoint v10.3.6 — Wallet test report
- node --check server.js: PASS
- node --check public/service-worker.js: PASS
- client inline JS parse via HTMLParser and node --check: PASS
- existing suite: 61 PASS / 0 FAIL (version assertions updated to 10.3.6)
- dedicated Wallet VM/WebCrypto tests: 4 PASS / 0 FAIL
- legacy AES-GCM records read; details private by default; reveal/lock; encrypted create/update verified.
- Browser-device QA and Xcode build not performed.
- No native Face ID, no encrypted file attachments, no encrypted cross-device syncing.

```

---

## QA-V10.3.8

```text
Waypoint 10.3.8 — test report
- Node server JS syntax: PASS
- Client inline JS syntax: PASS
- Existing npm smoke test suite: 61 PASS, 0 FAIL
- New feature-test-1038.js: 4 PASS, 0 FAIL
- Verifications: escaped Gemini rich-text output, emergency international dial URI, legacy contact compatibility, max 10 AI suggestions and no OpenAI API credentials, legal v1.3 EN/ES
- Browser visual end-to-end test: NOT COMPLETED (headless Chromium timed out in container)
- Google Gemini / Places real service tests: NOT RUN (no access to user's private keys)
- iOS simulator/device and Railway deployment: NOT RUN (user must verify)
- No changes to data file storage paths or existing Railway volume

```

---

## QA-V10.4.0

```text
Waypoint V10.4.0 QA summary

PASS: 61 baseline Node server smoke checks.
PASS: AI user-selected batch add; date validation, duplicate prevention and verified-address reuse.
PASS: shared activity RSVP choice and toggle logic.
PASS: wallet category filter/offline summary UI existence.
PASS: AirLabs integration using mocked upstream responses: absent key 503, configured status sanitized, caching and invalid flight-number rejection.
PASS: mocked Gemini response, privacy-scrubbing, per-day request quota.
PASS: mocked Google Places verified address and graceful missing API key.
PASS: AES-GCM vault encryption, incorrect passphrase and tamper detection.
PASS: bilingual legal text change and international emergency contact numbers.
PASS: server/client/service-worker JavaScript syntax.
NOT VERIFIED: live AirLabs or Google Places against real API keys; on-device iOS; App Store/AdMob/native push; visual E2E browser (environment blocks localhost navigation).
LIMITATION: Flights on demand only; no background monitoring. Provider may return a different operating date for the saved flight number.
LIMITATION: local reminder notifications require app running, not native push. Wallet does not have Face ID. No native widgets / Live Activities.
LIMITATION: concurrent edits to the same RSVP activity on collaborative trips can have last-writer sync conflicts.

```

---

## QA-V10.5.0

```text
Waypoint V10.5.0 QA summary
PASS: Existing Node server smoke suite (all tests).
PASS: Existing v10.4.0 targeted suites: AI selection; shared RSVP; Wallet encryption; international emergency numbers; Google Places mocking; Gemini mocking; AirLabs mocking.
PASS: v10.5.0 readiness calculation: 6 conditions; warning triggers for overspending, undated bookings, unchecked baggage, unscheduled activities; bilingual rendering; travel mode navigation.
PASS: JavaScript syntax for server.js, service-worker.js, inline browser app and admin.html.
PASS: ZIP CRC/structure check.
UNVERIFIED: Live Google Gemini/Places/AirLabs, real Apple iPhone, Xcode build, browser visual end-to-end, Apple and Google store submission.
NO CLAIM: Native push, native biometric Wallet, AdMob, payments, background flight watches, widgets or Live Activities are finished.

```

---

## QA-V10.5.2

```text
Waypoint V10.5.2 — QA report

Implemented:
- No automatic conversion of existing legacy trip types during unrelated edits.
- Clear new travel purpose selection, validated against supported values.
- Return date cannot precede departure date; budget must be finite and nonnegative.
- Unknown /api/* paths return JSON 404, never the public PWA HTML.
- Web and iOS Capacitor source HTML kept in sync.

Automated tests:
- Existing server smoke: 61 PASS, 0 FAIL.
- Additional integration/regression suite: 18 PASS, 0 FAIL.
- New trip validation script: PASS.
- JavaScript syntax: server.js, service-worker.js, extracted main UI script: PASS.
- Local HTTP: /health => 10.5.2; /api/nonexistent-route => 404; /api/admin/system without session => 401; /ads.txt => 200; / => 200.
- ZIP integrity test: see completed package inspection.

Not verified:
- Chromium direct local browser navigation is blocked by execution environment; browser UI/device interactions not verified.
- Xcode/iOS build, live Railway, Gemini, Places, AirLabs, billing, payments or provider keys not validated.

Preservation:
No destructive storage migration. Do not delete /data or clear browser/PWA storage. Export a backup before deploying.

```

---

## QA-V10.5.3

```text
WAYPOINT V10.5.3 — Function review and usability simplification

PASS — Existing server smoke suite (61/61).
PASS — Existing additional component & provider-mock tests (AI structured suggestions, Gemini, Google Places, AirLabs, AES-GCM Wallet, emergency dialing, sharing RSVP, itinerary validation).
PASS — Legacy trip type preservation, date order and budget validation regression.
PASS — V10.5.3 usability/navigation regression: all tabs accessible in one grouped menu, no duplicate tool strip, Travel Mode does not force redirects, home search preserves typing focus, iOS HTML equals web HTML.
PASS — node --check: server.js, client inline script and public/service-worker.js.
PASS — Local HTTP: /health (10.5.3), / (200), /ads.txt (200), unknown API route (404 JSON), unauthenticated admin system endpoint (401).

NOT VERIFIED — End-to-end Chromium browser run (execution environment blocks local navigation; ERR_BLOCKED_BY_ADMINISTRATOR).
NOT VERIFIED — Real-device iPhone Xcode build, Android, real Railway deployment, real Gemini/Places/AirLabs requests or third-party billing. Do not call this launch-certified.

No data migration, no deleted trip features. All existing sensitive credentials remain Railway-only. Never remove Railway /data or clear user browser/PWA storage. Back up first.

```

---

## QA-V10.6.0

```text
Waypoint V10.6.0 QA Summary
============================
Source: Waypoint V10.5.3 simplified verified build.

Completed checks
- server.js syntax: PASS
- public client JS syntax: PASS
- service-worker.js syntax: PASS
- admin inline JS syntax: PASS
- 61 server smoke tests: PASS
- V10.5.2 validation regression: PASS
- 18 phase 10.4 / integrations / crypto / legal tests: PASS
- 4 V10.5.3 UX/navigation regression tests: PASS
- 11 V10.6.0 feature checks: PASS
- public/index.html == ios-capacitor/www/index.html: PASS

V10.6.0 implemented
- One-click Gemini itinerary draft using existing Railway /api/ai/plan.
- User review remains mandatory before AI suggestions are added to itinerary.
- Today quick actions for itinerary generation, booking import, offline verification and conflict review.
- Cross-date schedule-conflict detection using saved duration + travel buffer.
- Confirmed manual conflict adjustment; no silent schedule changes.
- Offline verification checks cached shell, active service worker and local trip presence.
- Data reliability card with local storage, collaboration sync, offline state and backup export.
- Reservation import from pasted text and TXT/EML/ICS/CSV/JSON text files.
- Raw imported confirmation text is discarded after structured fields are saved.
- Existing Railway, Gemini, Places, PWA, collaboration, Wallet and Capacitor structure preserved.

Not verified / pending
- No visual browser E2E run in this environment.
- No Xcode/iPhone build performed.
- No live Gemini/Google Places/AirLabs call made with the user's production keys.
- PDF/image OCR reservation import is not implemented.
- Offline third-party maps/AI/flight/chat data are not available without internet.
- Native iOS push, Face ID, widgets and Live Activities remain pending.

```

---

## QA-V10.8.0

```text
WAYPOINT V10.8.0 — LOCAL AUTOMATED QA

PASS: JavaScript syntax checks (server, extracted client script, service worker)
PASS: 61 existing smoke tests (see scripts/smoke-test.js)
PASS: V10.5.2 trip validation checks
PASS: existing integration suite (Gemini simulated, Places mock, encrypted Wallet, contact formats, travel changes)
PASS: simplified-navigation UX source checks
PASS: legacy phase 10.6 source assertions
PASS: Stripe test-mode provider simulation: verified webhook, no fake purchase, cancel/revoke
PASS: Premium end-to-end simulated provider: server-side Free quota, Premium plan route gate, upgraded OCR quotas, admin grant/revoke, bogus token cannot inherit Premium, persisted quota file
PASS: iOS and Android Capacitor HTML copies exactly match public/index.html
PASS: updated privacy disclosure of AI and OCR usage counters

NOT VERIFIED: live Gemini, live Stripe payment, AdSense/AdMob ads, actual device iOS/Android builds, visual E2E in Safari/Chromium, App Store/Google Play IAP.

Plan quotas: Free 4 AI calls and 1 receipt OCR photo per UTC day. Premium 18 AI calls and 8 receipt OCR photos per UTC day. The global WAYPOINT_AI_DAILY_LIMIT and short-window antiabuse limits remain independently enforced.

```

---

## QA-V10.8.1

```text
WAYPOINT V10.8.1 — VALIDACIÓN LOCAL
PASÓ: sintaxis de servidor, JS del cliente, service worker.
PASÓ: batería principal npm test.
PASÓ: validación de fechas y tipos.
PASÓ: pruebas de integraciones simuladas / fase 10.4.0.
PASÓ: pruebas UX e igualdad HTML web/iOS/Android.
PASÓ: 11 controles fase 10.6.0.
PASÓ: controles reales de servidor para Free/Premium, incl. auditoría (403 Free, 200 Premium simulado, 403 después de revocar) y límites.
NO PROBADO: Gemini o Stripe con claves reales; navegador visual; iPhone/Android físicos; compilación nativa; anuncios en producción.
LIMITACIÓN: 3 solicitudes / 10 min por instalación, límite global y cuotas del proveedor pueden impedir consumir toda la cuota diaria.

```

---

## QA-V10.8.2

```text
WAYPOINT V10.8.2 — PREMIUM TRAVEL DESK
Verified locally:
- JS syntax: server, client and service worker.
- Base test suite, dates and trip validation, mocked integrations and UX tests.
- Existing Free/Premium server entitlement checks (including grant/revoke).
- Stripe simulated signed-webhook tests.
- 11 phase1060 checks after updating expected release version.
- New Premium desk tests for actionable flags, expense scenario, validation, client code mirroring, privacy disclosure and premium guard.
Not validated in this environment:
- Visual browser navigation (Chromium reports ERR_BLOCKED_BY_ADMINISTRATOR).
- Actual Railway deployment, Apple Xcode/Android Studio builds, mobile devices, real Google Gemini/Places/Stripe/ads.
- Local Premium tools are client-gated, not server-protected.
- Global Gemini limit 30/day may reduce available per-person advertised 18/day.

```
