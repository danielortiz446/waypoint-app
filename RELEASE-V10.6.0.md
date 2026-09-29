# Waypoint V10.6.0 — Easy Planning & Reliability

## Finished in this release
- One-click itinerary planning using the existing Gemini endpoint. The generated plan remains a draft until the user explicitly adds selected activities.
- Smarter Today screen with four quick actions: build itinerary, import booking, verify offline, and review schedule conflicts.
- Conflict detection across trip dates with an optional, confirmed action to shift the next item. Nothing is changed automatically.
- Verifiable offline check for this device (service worker + cached shell + local trip data) and a visible verification timestamp.
- Data reliability card with local-save, collaboration sync, offline state, and backup export access.
- Reservation import from pasted text and local TXT/EML/ICS/CSV/JSON text files. Raw confirmation text is not retained after saving; only bounded structured fields are stored.
- Existing Railway backend, Gemini, Google Places, collaboration data, Wallet, PWA and Capacitor project are preserved.

## Pending / intentionally not claimed as complete
- PDF/image OCR reservation import.
- Native iOS push notifications, Face ID, Widgets and Live Activities.
- True offline map tiles and external API results. Google Maps, Gemini, Places, flights and live chat still need internet.
- Automatic conflict resolution based on live travel-time data. The current correction uses saved duration + travel buffer and requires confirmation.
- App Store / TestFlight validation and real-device Xcode build.
- Browser visual E2E validation in this build environment.

## Data compatibility
No migration deletes or rewrites existing trips. V10.6.0 adds optional per-trip fields `offlineVerified` and `offlineVerifiedAt`; older data continues to load.
