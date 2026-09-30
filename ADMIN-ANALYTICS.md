# Waypoint Admin Analytics

Waypoint 12.1.2 adds privacy-preserving product analytics to the existing Admin Control Center.

## Dashboard metrics
- Active now (heartbeat within 2 minutes)
- Active during the last 5 and 15 minutes
- Active today
- Active during the last 7 days
- Total installations seen by the server
- New installations today
- Registered vs guest devices currently online
- Web / iOS / Android mix
- Browser / PWA / native-shell mix
- Successful Gemini AI and OCR usage by day

## Live analytics
The **Live analytics** tab refreshes every 10 seconds while open. A device sends a lightweight heartbeat about every 30 seconds while the app is visible and online.

## What is collected
- pseudonymous installation hash
- platform (`web`, `ios`, `android`)
- app mode (`browser`, `pwa`, `native`)
- selected language
- plan type
- first/last activity timestamps
- Waypoint ID only when the device is already registered

## What is not collected for analytics
- itinerary content
- chat messages
- documents or receipt images
- expenses
- searches
- AI prompt or response text
- precise location

## Persistence
Analytics summaries are stored inside `WAYPOINT_ADMIN_DATA_FILE`. Use a persistent Railway volume at `/data` and configure:

`WAYPOINT_ADMIN_DATA_FILE=/data/waypoint-admin-data.json`

The real-time presence list is intentionally in memory and resets after a server restart; devices reappear automatically on their next heartbeat.
