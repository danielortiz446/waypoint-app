# Waypoint V10.6.1 — Clear summary & receipt photo reader

- Renamed the misleading **Recuerdos / Recap** trip-menu entry to **Resumen del viaje / Trip summary**, matching actual totals and export functions. No saved memories/gallery data was deleted or changed.
- Receipt OCR now works with the **existing Gemini API configuration** (`WAYPOINT_AI_ENABLED=true`, `GEMINI_API_KEY`, `WAYPOINT_AI_MODEL`) when `OCR_API_URL` is not configured. Existing custom OCR integration, if configured, is retained.
- Receipt photo upload accepts JPEG, PNG and WebP up to 3 MB, checks image types on client and server, rate-limits requests, uses a fixed transcription instruction and requires user review before saving the expense. The receipt image is forwarded to the provider only when the user explicitly selects a photo and taps Read photo; it is not saved on the Waypoint server.
- Improved Spanish/English error messages and privacy policy notices. Reading photos requires a network connection and provider availability, is not guaranteed accurate, and may consume the Gemini free quota.
- Existing Railway volume, user data, admin controls, web/PWA, and initial Capacitor project remain unchanged.
- Known limits: do not enter payment details or other sensitive documents; no automatic receipt categorization or guaranteed extraction. Browser-on-device, real Gemini and Xcode verification remain outstanding.
