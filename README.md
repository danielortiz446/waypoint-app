# Waypoint 12.1.5

Waypoint is a cross-platform travel planner for Web/PWA, iOS (Capacitor) and Android (Capacitor).

## Included

- Itinerary, Today view, reservations, budget/Wallet, packing, notes and trip progress
- Live trip sharing, chat, participants, roles, polls and tasks
- Waypoint AI Assistant powered by Google Gemini when configured
- Free/Premium AI and OCR quotas enforced by the server
- Smart planning, schedule-conflict review and Premium route optimization
- Receipt OCR and Premium booking import
- Toolbox: currency, tips, units, time zones, fuel, luggage weight, bill split and departure-time calculator
- Memories, recap, travel assistance, emergency contacts and encrypted private vault
- Offline/PWA support, encrypted backups and Waypoint ID recovery
- Bilingual privacy/terms (English and Spanish)
- Admin Control Center with users, Premium grants, promo codes, feature flags, diagnostics, quotas, live usage analytics and privacy-preserving product metrics

## Run locally

Requires Node.js 18+.

```bash
npm install
npm test
npm start
```

Default local URL: `http://localhost:8787`

## Railway persistence

Recommended persistent paths:

- `WAYPOINT_DATA_FILE=/data/waypoint-sync-data.json`
- `WAYPOINT_ADMIN_DATA_FILE=/data/waypoint-admin-data.json`

Mount a persistent Railway volume at `/data` so collaboration state, entitlements, AI quotas and aggregate analytics survive redeployments.

## Important environment variables

See `.env.example`, `DEPLOY.md`, `GEMINI-SETUP.md`, `GOOGLE-PLACES-SETUP.md` and `ADMIN-ANALYTICS.md`.

## Privacy

Most trip data remains local unless the user enables sharing, chat or shared files. The admin analytics dashboard records only limited operational metadata (pseudonymous installation hash, platform/app mode, language, plan and timestamps). It does not collect itinerary content, chats, documents, expenses, searches or AI prompt text for analytics.

## Mobile

The `ios-capacitor/` and `android-capacitor/` folders mirror the current web UI. Native publishing, store billing and push notifications still require the developer's Apple/Google accounts, credentials and store configuration.


## Toolbox V12.1.5
All quick calculators use human-readable labels and mobile-safe controls.


### Flight Hub 12.1.6
The flight center now supports detailed flight records, local departure/arrival times and time zones, terminals/gates, baggage, seats, confirmation codes, manual status/check-in, and optional AirLabs status lookups. Always verify operational flight details with the airline.

Clean package notes:
- Redundant historical/release documentation removed.
- Runtime, deployment, integration setup, mobile publishing, tests, web, iOS and Android files retained.
