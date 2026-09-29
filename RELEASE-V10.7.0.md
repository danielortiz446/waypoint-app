# Waypoint 10.7.0 — Multi-platform and web billing preparation

## Implemented
- The **existing** Node/Railway server now provides a Stripe Checkout route (`POST /api/billing/stripe/checkout`), requiring registered Waypoint installation credentials. A private secret and official Stripe Price IDs are needed.
- Webhook endpoint (`POST /api/billing/stripe/webhook`) rejects unverified signatures and checks subscription state with Stripe before granting/revoking Stripe entitlements. Status is not granted on a user-supplied success URL.
- Web Premium screen offers monthly/yearly Stripe Checkout only when the server is configured and the browser is not a native Capacitor WebView.
- Development-only Capacitor 8 Android remote shell added without creating a second Railway service.
- Dashboard billing flag is ON **only if** all Stripe environment variables are supplied, but that does not prove an end-to-end successful charge or that the account is approved. Ads remain OFF: AdSense snippet is merely verification, not consented ad serving.

## Not implemented; do not label these production-ready
- Native iOS/Android in-app purchases, secure store receipt validation or account linking across devices.
- Native AdMob SDK and consent management; AdSense approved serving, CMP/TCF; these still show OFF.
- App Store / Google Play signing, build, publication, native-device QA. Android is a remote URL *testing shell*.
- Subscription management portal, refunds/chargebacks reconciliation, advanced fraud rules, comprehensive payment provider webhook/event reconciliation, durable job queue.
- Full native offline app or native file encryption.

## Security notes
- Stripe key must be test mode first. Only webhook can activate billing-related Premium.
- Signed webhooks must be delivered to `/api/billing/stripe/webhook`; `WAYPOINT_PUBLIC_URL` is an HTTPS origin ending without a path; protect `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
- Device-local Waypoint ID is not a verified cross-device user identity. Do not expose cross-device purchase restoration without implementing account linkage.
- Existing Premium granted by admin/promo is not overwritten by Stripe events.
- Test cancellation, renewal, recovery, refund handling, expiry, two concurrent checkouts and multi-replica deployments before accepting production payments.

## Legal and consent
Bilingual privacy/terms updated to v1.6 for optional Stripe web checkout, with fresh acceptance. **Not legal advice:** review merchant identity, refund, support, tax handling and subscription terms before taking live payments.
