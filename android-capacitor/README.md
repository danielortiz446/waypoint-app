# Android development shell (Capacitor 8)
This is **not an APK, AAB, or Play-ready app**. It opens the existing Railway web URL. No secrets in this folder.

1. Install Node.js, Android Studio, Android SDK and JDK on Windows or Mac.
2. Run `npm install` in this folder.
3. Create `www/index.html` with a local offline splash (not the full web app yet).
4. Set `WAYPOINT_ANDROID_URL=https://YOUR-ACTUAL-WAYPOINT-DOMAIN` in terminal (PowerShell: `$env:WAYPOINT_ANDROID_URL="https://..."`).
5. Run `npx cap add android`, then `npx cap sync android`, `npx cap open android`.
6. Open Android Studio, assign a unique application ID and test on a real device.

**Not yet included:** native AdMob SDK, Google Play Billing, push, native Wallet biometric, store signing, bundled offline web assets, or Play review. Do not enable production native purchases or ads until those native integrations and receipt verification are completed. Do not send Stripe Checkout links for digital upgrades from a Play-distributed app by default; review applicable Google Play payment rules and exceptions.
