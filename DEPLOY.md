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
