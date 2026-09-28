Waypoint 10.3.0 includes the optional web AI and local encrypted text vault once your EXISTING Railway service is updated. This folder remains a Capacitor *development remote shell*, not a compiled native iOS application. See ../RELEASE-V10.3.0.md.

# Waypoint iOS (Capacitor 8) — development scaffold

This subproject **does not replace** the existing Waypoint server or create any Railway deployment. It opens your existing HTTPS deployment in a Capacitor iOS webview for initial iPhone/Xcode testing. It does **not** include an Xcode `ios/` native project (generated on your Mac), native AdMob, native storage migration, or App Store approval. See `../IOS-SETUP.md` for exact setup.

> Warning: Remote-URL web wrappers can fail Apple's minimum-functionality guideline. Before App Store release, bundle/localize the app shell, validate offline and native capabilities and complete review/privacy compliance.
