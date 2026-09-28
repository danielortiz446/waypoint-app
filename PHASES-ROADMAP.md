# Waypoint — roadmap, beginning at 10.2.0

Current deployment: keep the existing GitHub repository, Railway service, environment variables and /data volume. Make backups before updates. Use the same existing backend. Capacitor iOS starter remains a development-only remote web wrapper, **not** a distributable App Store build.

## Phase 1: web/PWA — started
- Existing in v10.1.5: shared expenses and settlement suggestions, basic maps, group polls, local snapshots. No new backend schema.
- Delivered in v10.2.0: filter map stops by date, open day route, show route stop list; acknowledge service worker cache writes before claiming offline readiness, user retry action, honest caveats about internet-only services.
- Next: QA on actual devices and live room merge conflict scenarios, synchronization tests for votes/payments, encrypted offline document support; do not label cached map tiles available offline.

## Phase 2: Wallet / assistance
- Local device vault using native Keychain and protected file storage, opt-in Face ID, careful threat model; never treat a JavaScript boolean as protection.
- Server-assisted hospital/consulate search with verified providers, attribution and safety disclaimers. Never invent emergency phone numbers or pretend to offer emergency dispatch.

## Phase 3: iOS
- Replace Capacitor remote server.url development shell with bundled signed iOS assets and secure, configured Railway API origin; audit cookie/CORS/network strategy and migration of device-local data (web Safari localStorage is NOT automatically shared with WKWebView).
- APNs authorization and sender configuration, device token association, push payload privacy, opt out. Widgets via WidgetKit and Live Activities via ActivityKit, Face ID via LocalAuthentication and keychain. On-device testing and Apple developer membership for TestFlight/App Store.

## Phase 4: external services
- Flight status requires a licensed flight-data provider, update polling/webhooks and disclosure of data accuracy. AI needs server-side API secrets, rate limits, user opt in, consent and per-user cost quotas; never put AI secrets in the browser.

## Phase 5: Ads and Premium
- AdSense on public web after site approval/consent. AdMob SDK for real native iOS, only test ads until approved, app-ads.txt, region-appropriate consent. Purchases via App Store, server verification, and enforced no-ads eligibility. Admin switches are not billing.

### Upgrade & test procedure
`npm test`; check web console and local/offline behavior. Keep /data volume and existing secrets. Deploy files in existing GitHub repo, Railway redeploy, verify /health version 10.2.0. Avoid resetting localStorage; export a backup before updating.
