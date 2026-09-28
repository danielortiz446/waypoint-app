# Waypoint V10.3.0 — incremental functional release

## Included and working in code

- Trip navigation now includes **Waypoint AI**, **Flights**, **Assistance** and existing Docs/Wallet.
- AI planner UI asks about an existing trip. The backend uses the OpenAI Responses API only if explicitly enabled with an API key in Railway. The key never goes to the browser. It sends question, destination, dates, currency, budget, limited activity names — no files/chat/contacts or payment details. Responses are labeled as generated and not verified. Includes 19-second upstream timeout, output cap, request cap (3 requests per IP per 10 minutes), and shared daily cap (default 30, adjustable). This is a cost limit, NOT production-grade bot defense and NOT a paid-user entitlement system.
- Encrypted local **text-only** Vault in Docs/Wallet: new passphrase-based AES-GCM + PBKDF2 (310,000 iterations) protection, with lock on leaving the tab or when the app becomes hidden; stored ciphertext only, included in user-initiated backups but deliberately excluded from collaborative sync. The ordinary Docs/Wallet entries remain **unencrypted**; Face ID unlocking and secure attachment encryption are NOT present. Losing the passphrase means losing access to the encrypted notes.
- Flights: manually save airline, flight number, date, route and notes; edit by removing/readding; entries are available offline and synchronized for live shared trips; trip export/import covers saved flights. External “Check” link is a *search*, not real-time monitoring or alerting.
- Assistance: destination emergency number from existing country resolver/manual override; click-to-call only for numeric numbers; find hospitals/pharmacies/consulates through map searches; location is accessed only when pressing Share location, subject to device permission. No external directory verification; this is **not an emergency service**.
- Existing collaboration, shared costs, polls, map-by-day, saved documents and offline shell are preserved.
- Privacy disclosure updated; app requires fresh legal acceptance (v1.2) before use; user data storage is not wiped.
- Protected administrator /admin and Google ads.txt preserved. AdSense verification setup is unchanged; live ads and Premium ad suppression have not been activated.

## To enable AI on the EXISTING Railway project

Add these Railway service **Variables** (NOT GitHub secrets, NOT public JavaScript):

```
OPENAI_API_KEY = <your real OpenAI API key>
WAYPOINT_AI_ENABLED = true
WAYPOINT_AI_MODEL = gpt-4.1-mini
WAYPOINT_AI_DAILY_LIMIT = 30
```

The first value is confidential. Set a low provider-side usage budget/alerts too. Never share this key. No new Railway service, repo, database, or domain is required. With no key, the feature visibly explains how to configure AI without contacting the provider. The API is reachable from the public web app and has basic quotas; get user-level auth and financial guards before a large public launch.

After deploying, check `/health` reports **10.3.0**, `/api/ai/status` shows `configured:true` if enabled, and `/ads.txt` shows your publisher entry. Test real AI with a low-value prompt and examine API billing. These checks can't be performed against your private Railway environment from this package.

## Web + iOS

This ZIP preserves `ios-capacitor/`, a **development web-shell** that loads your existing HTTPS Railway frontend. Open on a Mac with Node and Xcode. It does **not** yet include a compiled IPA, an independently functioning offline-native UI, Apple Push Notification entitlement, Face ID secured encrypted vault, WidgetKit target, ActivityKit target, flight data provider, Apple developer signing, or AdMob SDK. You must perform Xcode builds on macOS and register for Apple Developer for release. An iOS web shell is not by itself proof of App Store compliance.

## Next development milestones

1. Native offline app-shell and secure local data migration for the iOS bundle, add Keychain and Face ID for the encrypted note vault, and add separate encrypted attachments (not simply hiding a web tab).
2. Real provider-backed flight status, rate limits, change polling, notifications and user consent (needs a data API/key and operating budget).
3. Native APNs push server and signed notifications, permission management and delivery tests on real iPhone; WidgetKit and ActivityKit native targets.
4. Improve existing maps, balances and polls with end-to-end tests and role-specific UX; AI structured itinerary drafts with explicit user confirmation before writing to trips.
5. App Store release testing, App Store disclosures, AdMob test SDK & UMP, verified Premium entitlements and payment processor integration, human QA/security review.

**Do not reset browser storage or remove the existing Railway `/data` volume. Export a backup before rollout.**
