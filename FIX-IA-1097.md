# Waypoint 10.9.7 — Gemini daily quota

- Quota is held during in-flight requests and charged **only after** Gemini produces a valid answer. Failures release the reservation without spending a daily request.
- Four successful free requests produce 3, 2, 1, 0 remaining; the fifth is refused until 00:00 UTC.
- UI displays both remaining and used requests, on web, iOS and Android shared frontend.
- PWA service worker cache version was increased so clients download updated scripts.
- Server and frontend must be deployed together. A durable `WAYPOINT_ADMIN_DATA_FILE` on a persistent disk is required or quotas can reset on restarts. Multi-replica production must use shared transactional quota storage: the present in-process reservation and JSON file are not suitable for concurrent independent server replicas.
- Clearing anonymous browser data can create a new guest identity; a registered identity is needed to strengthen enforcement across installations.
- No actual Gemini API charges were incurred by the mocked tests; physical device and live deployment verification still required.
