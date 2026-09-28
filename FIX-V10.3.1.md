# Waypoint V10.3.1 — Location & Tool Buttons Fix

- Corrected `Permissions-Policy` in both global HTML and API responses: `geolocation=(self)` rather than a blanket denial. HTTPS and the person’s location permission are still required.
- Location workflow separates obtaining location from sharing: user taps **Share link** after coordinates are available (preserving browser user-activation rules). Adds copy and manual-select fallbacks and useful errors.
- Travel tool buttons have clear selected/pressed styling, keyboard focus rings, and touch feedback. No trip data, Railway storage, or credentials changed.
- Update the **same** GitHub repository/Railway service. Keep the `/data` volume and current environment variables. Verify `GET /health` is 10.3.1. On iPhone allow location in iOS Settings and Safari site permissions. Native iOS permissions must be validated separately in Xcode.
