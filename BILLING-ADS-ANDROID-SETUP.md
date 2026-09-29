# Waypoint advertising and paid plans — setup

## 1. Stripe Web Checkout (only web, test mode first)
Create a Stripe account, enable Stripe Checkout and two recurring USD products/prices (monthly/yearly). Do not copy the prices shown in Waypoint unless the Stripe prices match exactly.

Add these 5 variables to the **existing** Railway `waypoint-app` service:

- `STRIPE_SECRET_KEY=sk_test_...` (later production secret)
- `STRIPE_WEBHOOK_SECRET=whsec_...` from a webhook configured for **your endpoint**
- `STRIPE_PRICE_MONTHLY=price_...` monthly recurring ID
- `STRIPE_PRICE_YEARLY=price_...` yearly recurring ID
- `WAYPOINT_PUBLIC_URL=https://YOUR-ACTUAL-WAYPOINT-DOMAIN` (HTTPS origin, no trailing slash/path)

In Stripe Developers → Webhooks, create endpoint `https://YOUR-ACTUAL-WAYPOINT-DOMAIN/api/billing/stripe/webhook` and subscribe to `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, and `customer.subscription.deleted`. Confirm local test-key checkout, signed event delivery, plan activation and cancellation first. A success redirect is **not** proof of payment. Use actual Stripe Price IDs; never put secret keys in GitHub.

## 2. Web Ads (AdSense)
The project already includes the AdSense verification script for `ca-pub-1755628880712670` and an `ads.txt` file. This alone does **not** make ad serving live. Google site approval, verified privacy consent/CMP where applicable, valid placement and tested Premium suppression are still required. Admin ads provider stays OFF until those are built. Do not switch it ON just for appearance.

## 3. iOS & Android (native, NOT active)
Apple In-App Purchase and Google Play Billing are different from Stripe web checkout. Create app records and actual store products, implement native SDKs, server-side transaction verification and restore purchases, then test in TestFlight and Play internal testing. Create separate AdMob app IDs/ad units for each native platform; integrate Google Mobile Ads SDK or a maintained Capacitor 8 plugin, plus consent. Native digital-goods store payment policies apply, subject to platform/location-specific exceptions. The current remote-URL wrappers are for internal testing only, not app store submissions.

**For Android testing:** open `android-capacitor/README.md`. Do not touch the existing Railway `/data` volume; back it up before deployment.
