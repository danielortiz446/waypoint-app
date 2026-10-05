# External integrations still requiring your provider/store setup

Waypoint 12.3.0 includes safe hooks and UI states, but does not falsely mark external services as enabled.

## Native subscriptions
Requires products/subscriptions created in Apple App Store Connect and Google Play Console, plus a native purchase plugin and receipt/entitlement verification. The existing Stripe flow remains for supported web checkout.

## Background push notifications
Browser/local notification permission exists, but true background push requires APNs/FCM or a Web Push provider, device token registration, credentials and production testing.

## Native biometric Wallet unlock
The Wallet already uses AES-GCM encryption and auto-locks when the app is hidden. Face ID/Touch ID/Android biometric unlock requires installing and testing a Capacitor biometric plugin in native projects and should be used to unwrap a locally protected key rather than replacing encryption.

## Flight status
Live status depends on `AIRLABS_API_KEY` and the capabilities/limits of the configured AirLabs plan. Waypoint continues to show a last-checked timestamp and manual airline verification path.
