# Waypoint 10.9.5 — AI usage indicator repair

- The Gemini response now returns the server-authoritative usage balance after debit.
- The Waypoint AI screen immediately receives this balance after a successful response.
- The benefits endpoint explicitly disallows caching and the screen reports a failed refresh instead of silently presenting a stale balance as current.
- The UI handles a daily quota response by immediately setting remaining uses to zero.
- The web/PWA service worker version is advanced to refresh the app shell.
- Applied to public web and packaged iOS and Android web assets.

To apply on an existing public deployment, redeploy **server.js and public/** together. A ZIP downloaded to a device does not modify the server already running on Railway. If the displayed number remains 4 after a deployment, check that `/api/premium/benefits` returns the expected usage on the **same origin** serving `/api/ai/plan`; inspect persistence of `WAYPOINT_ADMIN_DATA_FILE` on the mounted volume. A server without persistent storage may reset the counter on redeploy. Changing VPN/IP can affect anonymous guest counts. Native releases need rebuilding through Capacitor.
