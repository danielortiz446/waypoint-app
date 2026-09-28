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
