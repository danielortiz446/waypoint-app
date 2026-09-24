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

## Collaborative trip chat

Live collaborative trips include a lightweight private chat. Messages are stored with the shared trip on the Waypoint sync server, limited to the latest 200 messages per trip, and delivered in near real time using the existing SSE connection. Access uses the same private collaboration edit key as the trip.

Chat messages are not included in ordinary local-only trips.

## Waypoint 4.5 collaboration controls

- The trip creator receives a private owner key that is never placed in invitation links.
- **Stop sharing** revokes the collaborative room and invalidates the old invitation for everyone while keeping the owner's local copy.
- Invitees receive a **Leave** action that stops synchronization only on their device and keeps a local copy.
- People identify themselves when they first open an invitation. That identity is used automatically by trip chat and appears in the participant list.


## Waypoint 4.6 professional chat

The collaboration chat now uses registered participant identities on the server, idempotent sends, anti-spam rate limiting, per-trip drafts, typing indicators, date separators, accessible live regions, mobile full-screen layout, and self-aware unread counters. The server no longer trusts a display name supplied with each message; it resolves the sender from the registered participant list.

## Emoji and GIF chat

Waypoint 4.7 adds:
- Built-in emoji picker (no external service required).
- GIPHY GIF search inside collaborative chat.
- GIF messages store only the GIPHY content ID in Waypoint; clients resolve the current media rendition directly from GIPHY.
- Visible `Powered by GIPHY` attribution in the picker.
- `GIPHY_API_KEY` must be configured in Railway for GIF search. The key is delivered to the web client at runtime because GIPHY requires search/media requests to be made directly client-side rather than proxied by Waypoint.

## Waypoint 4.8 chat media refinements

- Emoji picker is now a compact popover with categories and recent emojis instead of a large exposed grid.
- GIFs are available only through the configured GIPHY search.
- Direct/external GIF URLs are not accepted.
- GIF messages render inline in the collaborative chat.

## Flight reservations

Waypoint stores flight reservations as planning records: flight number, origin, destination, date/time, provider, confirmation and notes. Real-time flight-status notifications are intentionally not included in this version, so the app has no unfinished flight-alert controls or paid flight-data dependency.

## Waypoint 4.9 global trip chat

- Collaborative chat is now a trip-level feature rather than an itinerary-only control.
- A global chat launcher is available from every trip tab while collaboration is active.
- On desktop, chat opens as a non-blocking drawer so users can switch trip tabs while keeping the conversation open.
- Drafts remain local per trip.
- Read receipts are participant-based. Opening the chat marks messages through the latest visible/server-loaded message as read.
- Senders see `Read by <name>` / `Leído por <nombre>` and `Read by everyone` / `Leído por todos` when applicable.

## Waypoint 5.0 trip hub

Collaboration now synchronizes the major trip-planning areas: itinerary, bookings, expenses/budget data, packing items and travel notes. The collaborative chat acts as a trip hub by mixing normal participant messages with concise system activity events such as itinerary changes, new bookings, expenses, packing updates and notes.

Activity events identify the participant associated with the synchronized change and keep the latest 150 events per shared trip. The chat itself remains limited separately and retains read receipts, typing indicators, emoji/GIPHY support and participant identity.

## Waypoint 6.0 Complete Travel Suite

Waypoint 6.0 expands the trip workspace beyond planning:

- Today / Up Next timeline for activities and bookings.
- Trip Map hub with destination map, saved-place list and multi-stop Google Maps route handoff.
- Optional integrated weather using WeatherAPI.com (`WEATHERAPI_KEY`).
- Shared expenses with payer, participants, balances and settle-up suggestions.
- Packing assignment by participant.
- Collaboration roles: owner, editor and server-enforced view-only access.
- Dedicated shared activity-history view.
- Ideas/favorites that can be promoted into itinerary activities.
- Collaborative polls and voting.
- Chat replies, reactions, read receipts, GIPHY search and compressed photo attachments.
- Offline-first local editing with pending-sync recovery when connectivity returns.
- Local itinerary reminders (30-minute lead by default) using browser/PWA notifications when supported.
- Smart home dashboard for the next trip.
- Safe trip duplication as a fresh local template without copying collaboration credentials.
- Richer export/import covering bookings, expenses, packing, notes, ideas and polls.

### Important platform limits

Browser/PWA reminders are event-driven. On iOS and other platforms, the operating system can suspend or terminate an installed web app, so Waypoint cannot guarantee that a purely local reminder will wake a fully closed app at an exact future time. Waypoint checks reminders while running and when it returns to the foreground.

Chat photos are intentionally compressed and limited. The server accepts up to 30 photo messages per shared trip, with a small per-photo payload cap, to avoid uncontrolled growth of the Railway persistent volume.

### Weather licensing

Because Waypoint is intended to support a public/commercial deployment, the built-in weather proxy stays disabled unless `WEATHERAPI_KEY` is configured. Use an WeatherAPI.com API for a monetized deployment. The UI includes WeatherAPI.com attribution.

## Waypoint 6.0.1 weather provider

The integrated weather provider is now WeatherAPI.com. Configure `WEATHERAPI_KEY` in Railway. Waypoint calls the provider only from the Node server, so the API key is not embedded in the public HTML or exposed through `/api/features`.

The weather card displays current temperature, feels-like temperature, condition, chance of rain and humidity. The server also retrieves a three-day forecast for future UI use.

## Waypoint 6.0.2 cache refresh

This release keeps WeatherAPI.com as the weather provider and adds a stronger installed-PWA update path. The service worker is registered with `updateViaCache: "none"`, uses a versioned service-worker URL, immediately checks for updates, reloads when the new worker takes control, and requests navigation documents with `cache: "no-store"` before falling back to the offline cache.

If an installed iPhone PWA still shows the old Open-Meteo message after deploying 6.0.2, the public server is still serving an older build or the device has not loaded the new deployment yet.

## Waypoint 6.0.3 iPhone installed-PWA chat fix

The chat drawer now respects iOS safe areas when Waypoint is launched from the Home Screen. On mobile, the chat is inset from the top and bottom system areas, the chat header stays visible, the close button has a larger touch target, and the composer respects the bottom home-indicator area.

## Waypoint 6.0.4 participant list

Every shared trip now has a Participants button in the global collaboration bar. It opens a trip-scoped participant list showing display name, owner/editor/viewer role, whether the row is the current device, and recent activity. The list refreshes from the collaboration server and updates through participant SSE events. Participant lists remain isolated per shared trip.
