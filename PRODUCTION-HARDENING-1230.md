# Waypoint 12.3.0 — Production hardening

Implemented in this package:
- Support and diagnostics center with privacy-safe diagnostic export.
- Support/privacy contact configuration via `WAYPOINT_SUPPORT_EMAIL` and `WAYPOINT_PRIVACY_EMAIL`.
- Privacy-preserving client error counters and active app-version analytics in Admin.
- Travel Readiness card with verifiable offline preparation status.
- Improved flight airport entry with searchable IATA/city/airport suggestions and automatic timezone/name fill for common airports.
- Notification permission/status controls in Settings.
- Legal acceptance version bumped to 1.9.
- Web/iOS/Android assets synchronized and PWA cache/version bumped to 12.3.0.

External configuration still required for features that cannot be completed safely without provider/store credentials:
- Apple App Store / Google Play native subscriptions and products.
- True background push notifications (APNs/FCM/Web Push provider credentials).
- Native biometric unlock (requires adding and testing a Capacitor biometric plugin in Xcode/Android Studio).
- Live flight changes depend on the configured AirLabs plan/API availability.

The app does not pretend these external integrations are active when they are not configured.
