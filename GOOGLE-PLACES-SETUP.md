# Google Places — Exact-address verification (Waypoint 10.3.8)

1. Sign in to Google Cloud Console and select or create your Waypoint project: https://console.cloud.google.com/.
2. Link an active Google Cloud billing account. Google Places API (New) is not an unlimited free API. Review pricing, free-usage allowances and quotas before enabling.
3. Enable **Places API (New)** (service `places-backend.googleapis.com`) at https://console.cloud.google.com/apis/library/places-backend.googleapis.com.
4. Visit https://console.cloud.google.com/apis/credentials and select **Create credentials -> API key**.
5. Edit the new key, restrict it to **Places API (New)** under **API restrictions**, and save. Waypoint makes this request from Railway's backend, not from the browser. A website/referrer restriction will prevent backend requests. Use a source-IP restriction only if your Railway deployment has a verified fixed outbound IP. Otherwise protect the key with API restrictions, low quotas, and monitoring until you can enforce server network restrictions.
6. In the **existing** Railway `waypoint-app` service: **Variables -> New Variable**. Set `VARIABLE_NAME` to `GOOGLE_PLACES_API_KEY` and `VALUE` to the actual key (do not publish it in GitHub/chat). Apply the changes/redeploy.
7. Leave your existing `GEMINI_API_KEY`, `WAYPOINT_AI_ENABLED=true`, `WAYPOINT_AI_PROVIDER=gemini`, `WAYPOINT_AI_MODEL` and `/data` volume untouched.
8. Confirm `/health` reports `10.3.8`. Open Waypoint AI, ask for a **specific named** location, and inspect the address card. Only a result that states it was found using Google Places is independently looked up. For ambiguous or absent places, Waypoint continues to show an unverified address or a Maps search link rather than making up an exact street number.
9. If it fails, check Railway logs for `[Waypoint Places] status=...`. `403` commonly points to API restrictions, permissions or billing; `429` points to quotas, and empty matches mean the service did not find a clear enough result.

Waypoint can attempt up to **10 Places API (New) text searches per AI answer** in this version. Field masks can alter billing SKU; review Google Places pricing and adjust your project quotas before enabling for all users. Cloud Billing budget alerts **do not automatically stop charges**. Never paste a credential into the HTML or iOS web assets.

Official docs:
- https://developers.google.com/maps/documentation/places/web-service/get-api-key
- https://developers.google.com/maps/documentation/places/web-service/usage-and-billing
