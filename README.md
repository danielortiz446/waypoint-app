# Waypoint 4.0 — Production Release

Waypoint is ready to run as one deployable service: the web/PWA frontend and the live collaboration API are served from the same HTTPS origin.

## What is included

- Responsive web app for desktop, iPhone and Android browsers
- Installable PWA (manifest + service worker + app icons)
- 12-hour AM/PM itinerary time picker
- Itinerary, reservations, budget, preparation, packing and notes
- Print / Save as PDF view
- Share Center for system share, WhatsApp, SMS, email, copy and editable itinerary download
- Live collaboration with private invite links
- Near-real-time updates using Server-Sent Events (SSE), with polling fallback
- Revision conflict detection and merge support in the client
- Persistent collaboration storage through a mounted data volume
- Docker and Docker Compose deployment
- Health endpoint: `/health`
- Privacy and terms pages

## Run locally

Requires Node.js 18+.

```bash
npm start
```

Open:

`http://localhost:8787`

Run automated smoke tests:

```bash
npm test
```

## Run with Docker

```bash
docker build -t waypoint .
docker run -d   --name waypoint   -p 8787:8787   -v waypoint_data:/data   waypoint
```

Then open `http://localhost:8787`.

## Production hosting requirements

Use any Docker host that provides:

1. HTTPS
2. A public domain or subdomain
3. A persistent volume mounted at `/data`
4. The platform-provided `PORT` environment variable (Waypoint reads it automatically)

The collaboration database is stored at:

`/data/waypoint-sync-data.json`

Do **not** deploy collaboration production data to an ephemeral filesystem without a persistent volume.

## DNS / domain

Point your chosen domain to the hosting provider following that provider's DNS instructions. After HTTPS is active, open the domain and test:

- `/health`
- create a trip
- activate live collaboration
- open the invitation link on a second device
- edit from both devices

## iPhone and Android now

Once hosted on HTTPS, the same release can be installed immediately as a PWA:

### iPhone / iPad
Safari → Share → **Add to Home Screen**

### Android
Chrome → menu → **Install app** / **Add to Home screen**

This provides a standalone app-like experience without waiting for App Store / Google Play review.

## App Store / Google Play

Store publishing requires developer accounts and signing credentials owned by you. The recommended next packaging step is Capacitor, using this production web app as the shared codebase. Do not embed the Node server inside the mobile app: the iOS/Android clients should connect to the same public Waypoint HTTPS server for live collaboration.

## Before public/commercial launch

Update the operator/contact language in:

- `public/privacy.html`
- `public/terms.html`

Use a real support/privacy email and review the policies for your actual hosting, retention, analytics and advertising choices.

## Backups

Back up the mounted `/data` volume. The application also keeps private/local trip data in each device's browser storage unless a trip is explicitly enabled for live collaboration.

## Daily exchange rates

The Budget tab includes an automatic currency converter. The browser calls Waypoint's same-origin endpoint:

`/api/fx/rate?from=USD&to=COP`

The Waypoint server retrieves the current reference rate from Frankfurter and caches it for 30 minutes. Users may switch to Manual Rate mode if the provider or network is unavailable.

Reference exchange rates may differ from the final rate charged by a bank, credit card, ATM, money-transfer service, hotel, or merchant.

## Multi-currency converter

The Budget converter is not tied to USD/COP or any fixed pair. Users can select any supported source and destination currency, swap the direction, use automatic daily reference rates when available, or enter a manual rate. Recent currency pairs are kept in the UI for quick reuse.

The initial source currency follows the trip currency or the user's default currency. The destination currency remains user-selectable.
