# Waypoint V10.8.3 — Premium Money Desk / Web + iOS + Android

Based on V10.8.2 without clearing saved trips or touching deployed Railway data.

## What is new
- Premium Money Desk in each trip's Budget section, with a day-by-day spending breakdown, category totals, transaction counts and saved-data settlement suggestions.
- Spreadsheet-ready CSV export of existing expenses including original currency and conversion information; escapes potential spreadsheet formula cells.
- Expanded Premium plan descriptions explaining these benefits, clearly identifying Trip Pass as a proposal rather than an active purchase.
- Updated version number in web server, service worker, package metadata and mirrored UI source for Capacitor iOS and Android.

## Existing features retained
Shared itineraries, trip collaboration and chat, multilingual interface, maps, bookings, packing, multimoneda, AI/Gemini, receipt OCR, offline basics, Wallet, Premium Travel Desk, admin, web billing integration scaffold and mobile shell projects.

## Availability and limitations
- The Premium Money Desk is a client-side convenience feature gated by previously verified session status; access is not cryptographically protected and does not constitute a billing enforcement boundary.
- CSV download must be tested with Safari on iPhone and Android WebView to confirm native file handling; Safari may offer a file preview/share option depending on OS version.
- No Apple/Google IAP configuration, signed iOS binary, Android APK or App Store/Play Store production release included. The ios-capacitor and android-capacitor folders are Capacitor starter projects and still need native project generation and signing.
- Trip Pass and offline maps are not implemented. Real-time flight status, subscription portability between devices and actual provider behavior remain dependent on external APIs and configuration.
- Do not replace Railway data volumes or local browser data while upgrading.

## Start
1. `npm install` (no external JS dependencies in root currently).
2. `npm start` and open the indicated local http URL.
3. Native apps: see `IOS-SETUP.md`, `MOBILE-PUBLISHING.md`, and `android-capacitor/README.md`. Set the HTTPS deployed URL before running `npx cap sync` and `npx cap open`.
4. `npm test && node scripts/premium-money-1083-test.js && node scripts/premium-travel-desk-1082-test.js`.
