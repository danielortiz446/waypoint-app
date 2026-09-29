# Waypoint release roadmap — realistic delivery gates

## A. Quality and data safety
1. Staging environment using only anonymized sample trips, regression tests in real Chromium/Safari, iOS WKWebView tests and accessibility review.
2. Backups of Railway's persistent volume with restore drills; encrypted recovery flows for user-local Vault that do not leak keys to server.
3. Conflict-resolution strategy for collaborative field-level updates, explicit link revocation, account recovery and storage retention policy.
4. Server-side rate limiting with trusted-proxy configuration and operational monitoring / alerts; ensure no secrets in diagnostics.

## B. Places, AI and flight intelligence
1. Google Places API (New) key with billing enabled, restricted scope, quotas and cost alert; show place attribution and only actual verified data.
2. AI trip proposal preview, multi-select confirm and in-place revisions, explicit user consent for data sent to Google.
3. AirLabs paid or free-plan check; date-aware flight lookup, provider caveats, and scheduled background polling with bounded quotas before alerts are promised.

## C. Native iOS and Android
1. Xcode compile of Capacitor iOS shell, fix safe areas / permissions / secure storage, device QA and offline functional tests.
2. Face ID with secure keychain-backed cryptographic design; no claim that biometrics alone encrypts browser localStorage.
3. APNs push entitlements + provider token lifecycle and consent, remote notification delivery, widgets and Live Activities built in Swift/WidgetKit.
4. Android project and equivalent notifications/key storage using platform SDKs.
5. Developer accounts, store listing assets, testing via TestFlight / Google Play tracks, review submission.

## D. Monetization, legal and operations
1. AdSense site approval and CMP consent for web. AdMob native SDK integration only when native app is ready; use test ad units during development.
2. Apple StoreKit / Google Play Billing or applicable purchase flow, server-side purchase verification and subscription lifecycle.
3. Revise bilingual policies with actual vendor, data processing and retention; obtain legal review for launch jurisdictions.
4. Clear spend caps, secrets rotation and customer support / deletion processes.
