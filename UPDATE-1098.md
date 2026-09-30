# Waypoint V10.9.8 — Today & Budget usability

## Changes implemented
- Today: go to previous/next destination-date within the trip, choose a date, or reset to the current destination date (or departure date for non-active trips).
- Today: show money spent on the selected date, number of expenses, and amount remaining from the total trip budget.
- Today: hide countdown-to-next-activity on days other than the destination's current day.
- Budget: expense-log search by description/date/payer and category filtering. Filters affect the displayed entries, not the totals of the entire trip.
- Spending projection: now uses the destination calendar instead of the viewer's device date, and does not project spending before departure.
- Bilingual copy, mobile-friendly layout, and matching front-end snapshots for browser, iOS, Android.
- Bumped server health version and PWA service worker cache name.

## Scope and safety
The changes are to display logic and navigation; trip data, reservation data, encrypted vaults, sharing permissions, AI limits, and existing server storage formats remain unchanged. No new database migration or environment variable is required. Day summary is based on expenses already recorded, in the trip's reporting currency. Currency conversion remains governed by existing app logic.

This ZIP is source code, not an App Store / Google Play binary. iOS and Android still need native builds and on-device QA. Native payment integration, push notifications, comprehensive offline maps, and robust simultaneous-edit conflict resolution remain separate work. Existing unit/smoke tests cannot prove that every device or third-party integration works.

## Deployment
1. Back up the live deployment and Railway persistent volume. Retain existing secret environment variables and existing mounted `/data` volume.
2. Upload changed project source to the deployment repository, including `server.js` and `public/`.
3. Redeploy Railway and verify `/health` reports `10.9.8`, test Today navigation / Budget filters, and check AI quota still decrements correctly.
4. To ship native apps, rebuild the Capacitor projects from the updated web assets. Validate on physical devices.

## Tests
- `node scripts/today-wallet-1098-test.js`
- `npm test`
- `node scripts/timezone-1094-test.js`
- `node scripts/ai-guest-quota-1096-test.js`
- `node scripts/sync-safety-1093-test.js`
- `node scripts/premium-money-1083-test.js`
