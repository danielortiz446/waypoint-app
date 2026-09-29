# Waypoint V10.4.0 — iterative enhancement

## Implemented and available in web/PWA (and existing Capacitor remote shell)
- Waypoint AI: select multiple suggested places, edit dates/times, explicitly confirm bulk addition, reject invalid dates and duplicates, copy venue address; richer itinerary prompt context includes travel purpose. No automatic changes.
- Places: linked verified Google Places addresses / directions through existing optional server key. Does not fabricate missing addresses. No real photos or opening hours are added.
- Shared trips: optional RSVPs (Going / Maybe / Not going) for itinerary activities on editable shared trips; counts saved inside activities and sent by existing collaboration sync. Concurrent changes may have last-writer issues. Existing polls and expense settlement preserved.
- Reminders: configurable 10/30/60/120-minute lead. Browser reminders only while application is running; **no remote push**.
- Wallet: encrypted card category filter + search, existing local encryption/legacy compatibility kept. **No native Face ID**.
- Offline: existing cache preparation maintained and descriptions clarified; external maps, flights, AI remain online.
- Flights: on-demand real status lookup through AirLabs v9 when `AIRLABS_API_KEY` is set on Railway. Provider may return a different date for a given flight number. There is no background monitoring, automatic alerts, or guaranteed coverage. Without key, existing manual saved flights remain available.

## Deferred native or paid integrations
- Real APNs push, widgets/Live Activities, Face ID and native AdMob require actual native iOS Xcode project (and Apple Developer account for distribution), cannot be tested in Linux container.
- Fully verified place photo/ratings/operating-hours cards require additional Google Places fields, display attributions and review of licensing/billing.
- Flight alerts/push require background scheduler and flight-provider subscription, not included here.

## Deployment
Replace project files in the **existing** GitHub repository / Railway service. Preserve Railway volume `/data`, all env vars and all browser storage. `AIRLABS_API_KEY` is optional and secret. Confirm `/health` is `10.4.0` and test on real devices. Do not deploy this as a second Railway project.
