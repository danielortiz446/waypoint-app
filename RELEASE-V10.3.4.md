# Waypoint V10.3.4 — Gemini intermittent availability fix

- Retry up to 2 times for Google Gemini HTTP 500, 502, 503 and 504 with 700ms/1700ms backoff; also retry transient network timeout/connection failures.
- Do not retry HTTP 429, 401, 403, 400 or 404; do not switch to OpenAI.
- Better bilingual messages for temporary errors, and server logs include attempt number.
- Preserve existing Railway backend, `/data` volume, web frontend and iOS starter.
- No Google API key is embedded in the archive; retain `GEMINI_API_KEY` in Railway.
- Not validated against Google's live network nor iOS/Xcode.
