# Waypoint V10.8.2 — Premium Travel Desk

## Assessment and position
V10.8.1 has useful Premium features (18 Gemini/day, 8 OCR/day, full itineraries, AI audit), but these are concentrated in initial planning and do not yet justify a strong recurring-price proposition for many travelers. V10.8.2 adds three offline-compatible convenience features without reducing essential Free functionality.

## New Premium tools
1. **Actionable readiness desk in Today:** uses locally saved activities, booking dates, packing tasks, conflicts and spending to list meaningful next actions with direct navigation to the appropriate section. Shows only on verified Premium status; Free has a clear invitation without blocking core planning.
2. **Budget what-if:** dynamically recalculates projected spend, remaining budget and average remainder per entire trip day when entering a hypothetical cost. Nothing is charged or stored; the daily amount is an illustrative arithmetic division, NOT a forecast of spending.
3. **Privacy-conscious printable briefing:** creates a per-day schedule including booked times and available locations, budget balance and priority action list using saved information; deliberately excludes encrypted Wallet content and reservation confirmation numbers. Can be printed or saved as PDF using the device's print dialog.

Free remains complete for itinerary, map, travel and emergency information, budget, trip sharing, Wallet and offline basics. Existing Premium AI/OCR quotas and server-verified audit remain unchanged. New offline tools are client-side gated, not tamperproof access controls; do not misrepresent them as secure premium paywalls or as data verification services.

## Limitations / follow-ups
- Not yet verified on a real phone or against provider APIs. Offline features work on stored trip data but must not be mistaken for live verified opening hours/traffic.
- Server-side API usage and Premium status are verified server-side, but the new local-only tools are checked on the client. Native App Store/Google Play purchases, ads, and Stripe production are pending.
- `WAYPOINT_AI_DAILY_LIMIT` global default of 30 and upstream provider limits may prevent all users from consuming the advertised 18 requests each. Increase only with budget and abuse controls; don't promise unlimited usage.
- No universal cross-device user account; subscriptions are tied to installation.

## Deploy
Update the same repository and Railway service. Preserve /data volumes and all variables and client browser storage. Confirm /health reports 10.8.2. Grant Premium to a dedicated test Waypoint ID in /admin, refresh the client, and open Hoy > Premium Travel Desk. Test no-location, missing booking date, expense simulation, PDF/print, and revocation. Never delete local data or reset the Railway volume.
