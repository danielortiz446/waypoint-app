> **Current release: Waypoint V10.3.0.** See [RELEASE-V10.3.0.md](RELEASE-V10.3.0.md) and [QA-V10.3.0.txt](QA-V10.3.0.txt) for actual feature status; older notes below are historical.

# Deploy Waypoint to production

## Recommended shape

Deploy the entire repository as **one Docker web service** and attach a persistent volume at `/data`.

Waypoint automatically:
- listens on the hosting platform's `PORT`
- serves the PWA
- serves the collaboration API
- creates invite links pointing back to the same HTTPS origin
- stores collaboration data in `/data/waypoint-sync-data.json`

## Option A — Render

1. Put this folder in a GitHub repository.
2. In Render, create **New → Web Service** and connect that repository.
3. Choose Docker deployment (Render detects the `Dockerfile`).
4. Add a persistent disk and mount it at:
   `/data`
5. Set health check path:
   `/health`
6. Deploy.
7. Render provides an HTTPS `onrender.com` URL. You can add your own custom domain later.
8. Open `https://YOUR-DOMAIN/health` and confirm `"ok": true`.
9. Open the main URL on two devices and test live collaboration.

Important: do not run production collaboration without the `/data` persistent disk, because an ephemeral filesystem can lose shared trips on a redeploy.

## Option B — Railway

1. Put this folder in a GitHub repository.
2. Create a Railway project and deploy from the repository.
3. Attach a Railway Volume to the service at:
   `/data`
4. Under Networking, generate a public domain.
5. Waypoint reads Railway's `PORT` automatically.
6. Open `/health` and test collaboration on two devices.

## Custom domain

After the generated HTTPS domain works, add your custom domain in the provider dashboard and follow its DNS records. No Waypoint code change is required because collaboration links use the current HTTPS origin.

## Production verification

Test all of these from the final HTTPS domain:

- Web desktop: create/edit/delete a trip
- iPhone Safari: add to Home Screen
- Android Chrome: install PWA
- Print / Save PDF
- Share Center
- Create collaboration link
- Join link from second phone
- Add an activity on phone A and confirm it appears on phone B
- Edit on phone B and confirm it appears on phone A
- Turn airplane mode on/off and confirm local app shell still opens
- Restart/redeploy service and confirm the shared trip still exists

## Privacy before public launch

Replace the operator/contact placeholder text in:
- `public/privacy.html`
- `public/terms.html`

Also review those pages if you later add analytics, ads, accounts, payments, location tracking, or other third-party services.


## Railway Dockerfile note

Railway does not accept the Docker `VOLUME` instruction during Dockerfile validation. Persistent storage must be created in Railway and mounted at `/data`.

## Optional GIF search

Emoji chat works without external configuration.

For in-chat GIPHY search, add this Railway/hosting environment variable:

`GIPHY_API_KEY=...`

The GIPHY API key is delivered to the browser at runtime because GIPHY search is performed client-side.

## Optional integrated weather

For a monetized/public Waypoint deployment, configure a commercial WeatherAPI.com customer API key:

`WEATHERAPI_KEY=...`

Without this value the Weather card stays disabled instead of using WeatherAPI.com's non-commercial free endpoint.

### WeatherAPI.com

Add this Railway variable:

`WEATHERAPI_KEY=your_real_key_here`

Do not put the key in `public/index.html`, GitHub, or the collaboration link. Railway redeploys automatically after the variable is saved.


## Waypoint 10.1.0 — Admin Control Center setup

Keep using the existing Railway project/service and the same `/data` persistent volume.

Add these Railway Variables:

```text
WAYPOINT_ADMIN_EMAIL=your-admin-email@example.com
WAYPOINT_ADMIN_PASSWORD=USE_A_LONG_UNIQUE_PASSWORD
WAYPOINT_ADMIN_DATA_FILE=/data/waypoint-admin-data.json
```

Strongly recommended for two-factor authentication:

```text
WAYPOINT_ADMIN_TOTP_SECRET=YOUR_BASE32_TOTP_SECRET
```

Do not commit the admin email/password/TOTP secret into GitHub or into the client HTML.

Existing variables remain:

```text
WAYPOINT_DATA_FILE=/data/waypoint-sync-data.json
WAYPOINT_FILE_DIR=/data/waypoint-files
WEATHERAPI_KEY=...
GIPHY_API_KEY=...
GOOGLE_ROUTES_API_KEY=...
```

After deployment:
1. Open `/health` and confirm `10.1.0`.
2. Open `/admin`.
3. Sign in using the Railway admin credentials.
4. If TOTP is configured, enter the current six-digit authenticator code.
5. In the normal app, Settings → Create Waypoint ID.
6. Copy that public `WP-XXXX-XXXX` code.
7. Search the code under Admin → Users & Premium.
8. Grant 7 days, 30 days, 1 year, or permanent Premium.
9. In the user's app, tap Refresh plan or reopen Waypoint.

Admin data is written to `/data/waypoint-admin-data.json`, so the same persistent Railway volume must remain attached.

## Version 10.1.1 — shared-trip entry and monetization checks

Use the same repository and Railway service; do not create a second deployment. Publish the ZIP content at the repository root, keep the existing `/data` volume, and confirm `/health` reports `10.1.1`.

When someone opens a sharing link, the app now shows a mandatory English/Spanish name-entry screen. The user cannot open or locally save a newly shared trip until the participant registration has succeeded. Canceling leaves the link without importing the trip; on a failed registration the user can retry. Existing participants from an earlier version can still open a previously joined trip when the server confirms their stored name and participant ID.

In Settings the user can create a Waypoint ID. You can grant complimentary Premium through `/admin` → Users & Premium; the user then taps Refresh plan. Promo codes with duration 0 now grant permanent access, and internal admin notes do not appear in the user's API response.

This release does **not** enable Apple/Google/web purchases, real advertisements, affiliate conversions, or server-side Premium feature paywalls. Those providers and enforcement rules still require implementation. Do not announce that Waypoint collects real subscription revenue until they are integrated and verified.

For admin credentials, never include passwords in the repository. Continue using Railway `WAYPOINT_ADMIN_EMAIL`, `WAYPOINT_ADMIN_PASSWORD`, optional `WAYPOINT_ADMIN_TOTP_SECRET`, and persistent `WAYPOINT_ADMIN_DATA_FILE=/data/waypoint-admin-data.json`.


### Google AdSense verification — V10.1.4
Commit the `public/index.html`, `public/ads.txt`, `server.js`, `public/service-worker.js` and other changed files to your existing GitHub repo. Railway deploys them. Then open `https://YOUR-DOMAIN/ads.txt` to confirm the **text** appears (not Waypoint UI) and check View Source of `/` for `ca-pub-1755628880712670`. Verify site ownership and request review in AdSense. No account approval or revenue is implied.


### V10.1.5 — private diagnostics

Deploy the files to the **existing** GitHub repository and Railway service. Verify `/health` returns `10.1.5`, `/ads.txt` shows the authorized publisher line, and the Settings view no longer contains diagnostics. To run diagnostics, authenticate at `/admin`, then open **System** and choose **Run diagnostics**. `/api/admin/system` must return HTTP 401 without a logged-in admin session. Preserve `/data` and all existing Railway environment variables.

## Waypoint V10.5.0 additions (same Railway service)

1. Replace files in your existing GitHub repository; do **not** create another Railway project.
2. Keep `WAYPOINT_DATA_FILE`, `WAYPOINT_ADMIN_DATA_FILE`, `/data` volume and all existing variables unchanged. Do not clear browser/PWA local storage.
3. Confirm `https://YOUR-DOMAIN/health` reports `10.5.0` and `https://YOUR-DOMAIN/ads.txt` still contains your Google publisher line.
4. Google Gemini remains the only AI provider. `GEMINI_API_KEY`, `WAYPOINT_AI_ENABLED`, `WAYPOINT_AI_MODEL` and optional `GOOGLE_PLACES_API_KEY` work as before.
5. **Optional flight lookup:** create an AirLabs key for the documented Flight Information API at `https://www.airlabs.co/docs/flight`, then add the secret `AIRLABS_API_KEY` in Railway Variables. Optional `WAYPOINT_FLIGHT_DAILY_LIMIT=40` bounds upstream requests each UTC day. Never paste your key into the repository or public HTML.
6. Test AI: generate named venues, adjust dates/times, check/uncheck selection, confirm batch addition, confirm no duplicates in itinerary.
7. Test sharing: on an editable shared trip, open itinerary and RSVP; ask another participant to verify updates after sync. Concurrent edits to the same activity can conflict; coordinate edits.
8. Test flight on a saved flight using **Current status**. AirLabs returns the closest known flight number: verify its actual operation date against your booking; this is not an automatic flight alert.
9. Test encrypted Wallet category filter, offline summary text download, local reminders 10/30/60/120-minute settings, bilingual legal acceptance v1.4.
10. iOS folder remains the existing Capacitor **development shell**, not a compiled native app. Compile/test with Xcode on macOS; Face ID, native push, widgets and Live Activities are future phases.

### Tests run in the build environment

`npm test` (61 existing smoke checks), `npm run test:phase1040` (mocked Gemini/Places/AirLabs, wallet crypto and UI logic), syntax checks for server, service worker and browser code, ZIP integrity check. Browser navigation to localhost was blocked by the test environment; no successful visual E2E run or real-provider/Apple test is claimed.

## V10.5.2
Update same existing project. Trip type dropdown now excludes old destination category choices. Preserve /data and browser data. Confirm /health version 10.5.2.

## V10.5.3
Deploy to the EXISTING Railway service via your current GitHub repo. Keep all environment variables, /data volume and local browser storage. Check /health = 10.5.3. Verify Today, Plan, AI, Map, More (with Wallet, flights, assistance, bookings), shared trips and permissions manually on phone.


## V10.6.0 update
Deploy to the existing Railway service and keep the existing `/data` volume and environment variables. After deploy, verify `/health` reports `10.6.0`. Do not clear browser site data because trips may be stored locally.

## V10.6.1 update
Keep the existing Railway service, `/data` volume and environment variables. To read receipts with Gemini, configure `WAYPOINT_AI_ENABLED=true`, `GEMINI_API_KEY`, and a model accessible to your Google AI Studio project. Do not add `OCR_API_URL` unless intentionally using a separate OCR adapter. Confirm `/health` shows `10.6.1`. The new reader sends the selected image to the configured provider; obtain user consent before submitting sensitive receipts.

## V10.7.0 optional Stripe test-mode deployment
Do not enable payments until you review `BILLING-ADS-ANDROID-SETUP.md` and verify the payment integration end-to-end with Stripe test-mode webhooks, cancellations, renewals and a public HTTPS URL. Existing Railway volume `/data`, service, repository, provider keys and current trips must be kept unchanged. Unconfigured Stripe endpoints are gated and Premium checkout is disabled. Web ads remain unserved until consent and approved placements are implemented.
