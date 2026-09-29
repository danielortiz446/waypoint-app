# Waypoint V10.5.3 — Simplified experience and navigation audit

- Consistent five-button trip navigation (Today, Plan, AI, Map, More) in both planning and Travel Mode. All former sections retained in one organized More menu; no trip state migration.
- Removes duplicated AI / Wallet / Flights / Assistance toolbar without removing features.
- Travel Mode no longer forces users away from the itinerary, polls or overview; it remains explicitly activated only from its own screen.
- Home search no longer re-renders on every keystroke and steals keyboard focus; results update as the user types.
- Prevents one trip card from changing the body Travel Mode style for all other trips.
- Opens trips on the Today overview (with actionable readiness tasks).
- Keyboard focus styles, button state and small-screen tap targets improved.
- Existing travel data, sharing, admin roles, server endpoints, API keys, Wallet ciphertext, service-worker data cache and Railway storage paths unchanged.

## Limits
The iOS Capacitor project is a development shell and requires Xcode and actual-device tests. Live Google Gemini, Places, AirLabs, notification permission and third-party payment/ad review are not asserted tested. Never delete Railway /data or user browser storage.
