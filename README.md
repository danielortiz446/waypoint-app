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

## Waypoint 7.0 Collaboration & Travel Pro

This release adds owner-controlled participant management, individual expiring invitations, individual invite revocation, security logs, clearer sync state, notification center, trip calendar export, travel mode, destination timezone/practical information, trip recap, chat editing/deletion/pinning/mentions, category budgets, custom percentage splits and recorded settlements.

### Security model
Legacy editor/viewer links still work for compatibility. For revocable per-person access, create an individual invitation from Participants or Security. Individual invitation tokens are stored only as hashes on the server and can expire. Removing a participant also revokes that participant's individual invite when one is associated.

### Features intentionally not faked
Exact server push while an iPhone PWA is fully terminated, real-time driving/transit duration between places, native App Store/Play Store distribution, and an unlimited shared photo gallery require additional infrastructure or provider credentials. Waypoint does not pretend these capabilities are available when they are not.

## Waypoint 7.0.1 UI Cleanup + Smart Destination Data

- The trip navigation now keeps Overview, Today, Travel, Itinerary, Map and Bookings visible, with secondary tools under More.
- The collaboration bar is reduced to role/sync status, participant count, chat, Share and a More menu.
- Destructive Stop Sharing is moved into the More menu.
- WeatherAPI timezone (`tz_id`) now drives destination local time when the trip still has a device/default timezone.
- Exact country-only destinations such as Japan/Japón are normalized to an unambiguous capital-country query before WeatherAPI lookup.
- Weather responses now include resolved city/region/country, timezone and practical country metadata where Waypoint has a verified built-in profile.
- Practical information uses automatic destination data unless the traveler manually enters an override.
- Trip accounting currency remains separate from local destination currency to avoid silently changing an existing budget.

## Waypoint 7.0.2 fixes

- Replaced the More `<details>` dropdown with a JavaScript-controlled menu rendered outside the horizontally scrolling navigation container. This avoids the menu being clipped or failing to open in Safari/PWA layouts.
- Practical information is now conservative: WeatherAPI provides the detected location and timezone; country profiles may provide local currency and language; emergency and power/plug information are manual-only unless explicitly entered by the traveler.
- Local destination currency no longer falls back to the trip accounting currency.
- Country-only destination normalization is stricter, including `Japan`, `Japón` and `Japon` → `Tokyo, Japan`.
- The Travel view displays exactly how an ambiguous destination was interpreted.

## Waypoint 7.0.3 Automatic Practical Information

Practical travel information is now automatic. WeatherAPI resolves the destination and timezone, and Waypoint's built-in country profiles provide local currency, language, emergency numbers and plug/voltage information for supported destinations. Detected values are persisted into the trip so they remain available offline.

Manual fields remain available only as overrides. If the destination changes, Waypoint clears the previous detected profile and resolves the new destination automatically. Unsupported countries show `No disponible / Not available` instead of inventing values.

## Waypoint 7.0.4 iPhone More menu

On iPhone and other narrow screens, the More menu is now a native-style bottom sheet. It opens from the bottom with a dimmed/blurred backdrop, rounded top corners, a visual grabber, a close button, larger two-column touch targets, safe-area padding for the Home indicator, Escape/backdrop close behavior, and body scroll locking. Desktop keeps a compact anchored dropdown.

## Waypoint 7.0.5 QA-hardened release

This release fixes issues found during a pre-deployment audit rather than adding cosmetic features:

- Editing an existing trip now preserves the actual edited trip ID before closing the modal.
- Destination changes clear destination-specific cached/manual practical data and trigger a fresh automatic lookup.
- All advanced trip fields are actually saved from the edit form.
- Participant role changes received from the server immediately update local edit/view-only behavior.
- Existing collaboration rooms require an active registered participant for writes, blocking removed participants from continuing to edit with a generic editor key.
- Settlements and category budgets now sync through live collaboration.
- Editable itinerary import/export now restores advanced trip metadata, settlements and category budgets.
- Trip deletion/undo now includes settlements and category budgets.
- Navigation away from a trip always clears the iPhone More-sheet scroll lock.

## Waypoint 7.0.6 Destination Resolver

The destination field now resolves places explicitly instead of relying on a single free-text WeatherAPI match. Travelers can search for a destination and choose from city/region/country candidates. The selected latitude/longitude and canonical place name are stored with the trip.

Weather and timezone requests use the stored coordinates, eliminating most same-name-place ambiguity. If a new/edited destination has not been resolved, Save triggers destination search; ambiguous matches must be selected before the trip is saved. Destination coordinates and canonical metadata are included in live collaboration and rich import/export.

## Waypoint 8.0 Complete Travel Intelligence

Implemented in the existing PWA/server architecture:
- activity duration and travel-buffer fields
- schedule overlap/conflict detection
- trip countdown and next-activity countdown
- per-day Google Maps route handoff
- month calendar view plus .ics export
- smarter travel-day view
- smart packing suggestions using destination practical data and current weather
- richer important-document entries
- expanded booking types (train, rental car, restaurant)
- in-app diagnostics for server, weather, GIPHY and connectivity
- basic server-side rate limiting and security response headers
- retained collaboration, destination resolver, offline state, automatic practical information and the iPhone More bottom sheet

Not faked: exact live driving/transit durations, guaranteed push when iOS fully terminates the PWA, unlimited media storage, OCR receipt scanning and native App Store/Play Store binaries. Those require provider credentials, object storage, background push infrastructure or native packaging.

## Waypoint 8.0.1 Final QA Release

This is a QA-hardening release based on a second audit of Waypoint 8.0.0.

Corrections include:
- Calendar now correctly activates the More navigation state and localizes weekday labels.
- Schedule conflicts distinguish itinerary activities from bookings and support optional booking duration/travel buffers.
- Booking cards display schedule-duration metadata.
- Daily map routes cap intermediate waypoints.
- Smart packing avoids assuming the user's home country.
- Diagnostics are more robust and display the installed Waypoint version.
- Rate limiting targets API endpoints instead of static PWA assets, with a tighter destination-search limit.
- Public health metadata no longer exposes collaboration room counts.
- Security headers now include a Content-Security-Policy compatible with WeatherAPI, GIPHY/media and Google Maps embeds.
- All previous destination resolver, collaboration, viewer/editor permissions, chat, automatic practical information, PWA safe-area behavior and iPhone More sheet remain intact.

## Waypoint 8.0.2 Calendar navigation fix

- Removed the accidental duplicate Calendar entry inside the iPhone/compact More menu.
- The Today view still keeps its intentional Calendar quick-action button.
- Verified that the More menu itself contains each destination tab exactly once.

## Waypoint 8.0.3 Activity field clarity

- Replaced the two unlabeled itinerary numbers with clearly labeled controls:
  - ⏱ Duración / Duration
  - 🚗 Traslado / Travel
- Each value visibly includes the `min` unit.
- Added a short explanation directly under the activity-entry row.
- On iPhone and narrow screens, Activity and Place use full width, while Duration and Travel sit beneath them in two clear columns.

## Waypoint 9.0 — Travel OS + Offline

Major additions implemented without requiring new paid infrastructure:
- Offline-first PWA shell and stale-cache fallback for weather, FX, destination search and feature status.
- Explicit “Prepare offline” action for trips.
- Existing local trip data remains editable offline; live-collaboration changes retain pending-sync state.
- Chat messages can be queued offline and retried automatically when connectivity returns.
- Five rotating local backup snapshots with restore controls.
- Multicurrency expense entry with automatic FX when online, cached FX offline and manual-rate fallback.
- Spending forecast, daily average and totals by payer.
- Activity completion/skipped state, assignees, copy activity, copy day and repeat-daily creation.
- Emergency Mode with local emergency number, lodging/destination, important documents and traveler emergency contacts.
- Emergency contacts sync with collaboration.
- Quick local unit converter (temperature, distance and weight).
- Packing deadlines.
- Small offline document attachments (PDF/image) capped at 650 KB each.
- Home-country profile field improves international packing suggestions.

Infrastructure-dependent features are intentionally not faked:
- live traffic/transit ETAs and “leave now” alerts need a routing/traffic provider;
- guaranteed iOS push while the PWA is fully terminated needs push infrastructure;
- large/unlimited photo/document galleries need object storage;
- OCR receipt scanning needs an OCR/vision service;
- email reservation import needs a connected email provider;
- native App Store/Play Store binaries need native packaging/signing.

### Additional V9 quality controls
- Polls can have closing dates; voting is disabled after the deadline.
- Activities support local/synced comments/notes.
- Trip Book print/PDF view combines itinerary, reservations, practical info, important documents and emergency contacts.
- Emergency contacts are included in trip duplication/deletion/undo and collaboration payloads.
- Structured auto-backups deliberately omit large binary photos/files to reduce browser-storage failures.
- Offline attachments are limited to 650 KB each and 2 MB total per trip.
- Google/Apple Maps themselves are external services and are not made available offline by Waypoint; saved itinerary locations remain visible offline and navigation links resume when connectivity returns.

## Waypoint 10.0 — Cloud & Smart Travel

New production-ready capabilities:
- Shared server-side trip files (up to 5 MB each) stored on the persistent Waypoint data volume for live-collaboration trips.
- Small files remain available offline locally; larger shared files use server storage.
- Google Routes ETA adapter using `GOOGLE_ROUTES_API_KEY`; supports driving/walking/bicycle/transit requests and traffic-aware driving duration.
- Today view can calculate estimated travel time to the next located activity and derive an approximate leave time.
- Smart booking import from pasted email/SMS/confirmation text, with local parsing for flight number, IATA route, confirmation code, date, and time.
- Receipt import from pasted text with local merchant/amount/date extraction.
- Optional OCR adapter via `OCR_API_URL` and `OCR_API_KEY`; Waypoint expects a JSON response containing `text`.
- Integration status cards in Diagnostics expose what is truly configured versus unavailable.
- Feature flags explicitly report traffic, cloud files, OCR, push, direct email import, and smart text import.

Intentionally not faked:
- Server push remains disabled until a real push provider/backend is connected.
- Direct Gmail/Outlook import remains disabled until an authenticated email connector is connected.
- Cloud file storage currently uses the persistent Waypoint/Railway volume, not S3/R2. It is suitable for the current architecture but should migrate to object storage for larger scale.
- Google Routes and OCR cannot be live-tested without the operator's provider credentials; the application falls back cleanly when they are not configured.

### V10 integrity details
- Removing a document that points to a shared cloud file also removes that server-side file when online.
- Automated QA covers shared-file upload/read/delete and verifies that traffic, OCR, push, and direct-email features fail closed or report unconfigured instead of pretending to work.

## Waypoint 10.0.1 Final QA hardening

- Cloud-file upload/delete now enforces the same active-participant checks as collaborative trip edits.
- Removed/revoked participants cannot use a retained generic edit credential to modify cloud files.
- Shared files are opened through authenticated `fetch` + Blob URLs so trip access credentials are not placed in the visible browser URL/history.
- Fixed a legacy destination-coordinate edge case where `null` coordinates could be treated as numeric `0,0`.
- Added regression tests for cloud-file participant security and retained all V10 smart/offline features.

## Waypoint 10.0.2 — Day Copy Button UI Fix

- Fixed the itinerary day-header Copy button overflowing into the Delete button.
- Copy now has a dedicated content-sized control on normal screens.
- On narrow mobile screens it automatically becomes an icon-only 30px button, with accessible title/aria-label retained.
- Added a tooltip/accessibility label to the day Delete button.
- No itinerary behavior changed; this is a responsive UI correction on top of V10.0.1.

## Waypoint 10.0.3 — Mandatory Privacy & Use Consent

- Added a mandatory first-use privacy/use consent gate.
- The app remains blocked until the user checks the acceptance box and selects “Accept and continue.”
- Acceptance is stored only on the current device under legal version `1.0`, with an acceptance timestamp.
- If the legal version changes in a future release, Waypoint can require consent again.
- The notice accurately distinguishes local device storage, live-collaboration/server storage, external providers, and sharing-link responsibility.
- Added direct links to Privacy Policy and Terms of Use.
- Added a Settings panel showing legal version and acceptance timestamp.
- The existing V10.0.2 Copy button fix and all V10 smart/offline/security features remain intact.

## Waypoint 10.0.4 — Bilingual Legal Pages
- Complete Privacy Policy in English and Spanish.
- Complete Terms of Use in English and Spanish.
- EN / ES switcher on both legal pages.
- Legal pages automatically follow Waypoint language when available, otherwise browser language.
- First-use consent remains bilingual.
