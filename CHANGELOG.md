## 10.9.3 — Sync safety
- Prevent cloud pulls from overwriting pending local edits.
- Serialize in-flight uploads; expose retry/status.
- Keep failed changes pending, and synchronize on reconnection.

# Waypoint — historial de versiones
Documento de referencia para cambios históricos. La versión entregada es V10.8.3.

---

## RELEASE-V10.3.0

# Waypoint V10.3.0 — incremental functional release

## Included and working in code

- Trip navigation now includes **Waypoint AI**, **Flights**, **Assistance** and existing Docs/Wallet.
- AI planner UI asks about an existing trip. The backend uses the OpenAI Responses API only if explicitly enabled with an API key in Railway. The key never goes to the browser. It sends question, destination, dates, currency, budget, limited activity names — no files/chat/contacts or payment details. Responses are labeled as generated and not verified. Includes 19-second upstream timeout, output cap, request cap (3 requests per IP per 10 minutes), and shared daily cap (default 30, adjustable). This is a cost limit, NOT production-grade bot defense and NOT a paid-user entitlement system.
- Encrypted local **text-only** Vault in Docs/Wallet: new passphrase-based AES-GCM + PBKDF2 (310,000 iterations) protection, with lock on leaving the tab or when the app becomes hidden; stored ciphertext only, included in user-initiated backups but deliberately excluded from collaborative sync. The ordinary Docs/Wallet entries remain **unencrypted**; Face ID unlocking and secure attachment encryption are NOT present. Losing the passphrase means losing access to the encrypted notes.
- Flights: manually save airline, flight number, date, route and notes; edit by removing/readding; entries are available offline and synchronized for live shared trips; trip export/import covers saved flights. External “Check” link is a *search*, not real-time monitoring or alerting.
- Assistance: destination emergency number from existing country resolver/manual override; click-to-call only for numeric numbers; find hospitals/pharmacies/consulates through map searches; location is accessed only when pressing Share location, subject to device permission. No external directory verification; this is **not an emergency service**.
- Existing collaboration, shared costs, polls, map-by-day, saved documents and offline shell are preserved.
- Privacy disclosure updated; app requires fresh legal acceptance (v1.2) before use; user data storage is not wiped.
- Protected administrator /admin and Google ads.txt preserved. AdSense verification setup is unchanged; live ads and Premium ad suppression have not been activated.

## To enable AI on the EXISTING Railway project

Add these Railway service **Variables** (NOT GitHub secrets, NOT public JavaScript):

```
OPENAI_API_KEY = <your real OpenAI API key>
WAYPOINT_AI_ENABLED = true
WAYPOINT_AI_MODEL = gpt-4.1-mini
WAYPOINT_AI_DAILY_LIMIT = 30
```

The first value is confidential. Set a low provider-side usage budget/alerts too. Never share this key. No new Railway service, repo, database, or domain is required. With no key, the feature visibly explains how to configure AI without contacting the provider. The API is reachable from the public web app and has basic quotas; get user-level auth and financial guards before a large public launch.

After deploying, check `/health` reports **10.3.0**, `/api/ai/status` shows `configured:true` if enabled, and `/ads.txt` shows your publisher entry. Test real AI with a low-value prompt and examine API billing. These checks can't be performed against your private Railway environment from this package.

## Web + iOS

This ZIP preserves `ios-capacitor/`, a **development web-shell** that loads your existing HTTPS Railway frontend. Open on a Mac with Node and Xcode. It does **not** yet include a compiled IPA, an independently functioning offline-native UI, Apple Push Notification entitlement, Face ID secured encrypted vault, WidgetKit target, ActivityKit target, flight data provider, Apple developer signing, or AdMob SDK. You must perform Xcode builds on macOS and register for Apple Developer for release. An iOS web shell is not by itself proof of App Store compliance.

## Next development milestones

1. Native offline app-shell and secure local data migration for the iOS bundle, add Keychain and Face ID for the encrypted note vault, and add separate encrypted attachments (not simply hiding a web tab).
2. Real provider-backed flight status, rate limits, change polling, notifications and user consent (needs a data API/key and operating budget).
3. Native APNs push server and signed notifications, permission management and delivery tests on real iPhone; WidgetKit and ActivityKit native targets.
4. Improve existing maps, balances and polls with end-to-end tests and role-specific UX; AI structured itinerary drafts with explicit user confirmation before writing to trips.
5. App Store release testing, App Store disclosures, AdMob test SDK & UMP, verified Premium entitlements and payment processor integration, human QA/security review.

**Do not reset browser storage or remove the existing Railway `/data` volume. Export a backup before rollout.**


---

## RELEASE-V10.3.4

# Waypoint V10.3.4 — Gemini intermittent availability fix

- Retry up to 2 times for Google Gemini HTTP 500, 502, 503 and 504 with 700ms/1700ms backoff; also retry transient network timeout/connection failures.
- Do not retry HTTP 429, 401, 403, 400 or 404; do not switch to OpenAI.
- Better bilingual messages for temporary errors, and server logs include attempt number.
- Preserve existing Railway backend, `/data` volume, web frontend and iOS starter.
- No Google API key is embedded in the archive; retain `GEMINI_API_KEY` in Railway.
- Not validated against Google's live network nor iOS/Xcode.


---

## RELEASE-V10.3.5

# Waypoint 10.3.5 — AI suggestions → itinerary

- Gemini answers may contain structured suggestions (title, location, date, time) separated from the explanatory text on the server.
- The user can choose a date and optional time and add each suggestion to an existing or new itinerary day with one button.
- Viewer permissions are enforced, duplicate activities for the same day/location are blocked, and no suggestion is saved automatically.
- Existing local/cloud sync handles the activity after explicit save. The original AI prompt/answer is not synced.
- Dates are validated within the trip, and AI suggestions must be verified by the traveler.
- Preserves existing Gemini-only integration and retry logic. Google API access is required for new suggestions.

## Verification
Run `node scripts/ai-suggestions-test.js`, `npm test`, and inspect the iOS and deployed Railway experience separately. Model output may sometimes lack structured suggestions; in that case the text answer still appears, without add buttons. This is a model/provider limitation, not an automatic trip modification.


---

## RELEASE-V10.3.6

# Waypoint v10.3.6 — Wallet de viaje

- Tarjetas de viaje cifradas por dispositivo: categorías, referencia, búsqueda, edición, mostrar/ocultar y copia bajo acción explícita.
- Mantiene la lectura y edición de notas antiguas (`label`/`value`) sin migrar ni alterar el ciphertext hasta que el usuario guarde cambios.
- Cifrado AES-GCM + PBKDF2 existente. Se bloquea al ocultar la app o salir del viaje.
- No contiene Face ID, adjuntos cifrados ni sincronización privada entre dispositivos. Los documentos normales del viaje siguen sin cifrar.
- La app iOS en `ios-capacitor/www` es una instantánea web de referencia; sigue necesitando Xcode, pruebas y cambios nativos para publicación.
- Despliega en el Railway existente, conserva `/data` y no borres el almacenamiento local.


---

## RELEASE-V10.3.7

# Waypoint 10.3.7 — Direcciones de lugares sugeridos por IA

Las sugerencias de Gemini ahora pueden consultar Google Places API (New) con `GOOGLE_PLACES_API_KEY` en Railway. Las coincidencias de nombre y destino muestran la dirección normalizada y un enlace a Maps. Si falta la clave, no hay coincidencia clara o falla el proveedor, se muestra "dirección sin verificar" y la búsqueda manual de Google Maps. La dirección obtenida se copia al itinerario **solo al pulsar Agregar**.

## Configuración (opcional y con facturación)
1. En Google Cloud, activar **Places API (New)** y habilitar facturación, cuotas y restricciones sobre la clave.
2. Agregar la variable Railway `GOOGLE_PLACES_API_KEY` con la clave exclusiva de Places API, restringida a la API. Nunca incluirla en el HTML ni en GitHub.
3. Mantener `GEMINI_API_KEY`, `WAYPOINT_AI_ENABLED=true`, `WAYPOINT_AI_PROVIDER=gemini` y `WAYPOINT_AI_MODEL` válidos. No usa OpenAI.
4. Desplegar el repositorio actual y verificar `/health` versión `10.3.7`. Pedir sugerencias de un viaje; confirmar dirección y botón Google Maps antes de añadir.

Se realizan hasta ocho búsquedas Places por respuesta de IA (potencialmente facturables), con timeout de 5s por búsqueda, tres búsquedas concurrentes por tanda; configurar cuotas estrictas en Google Cloud. Estas direcciones provienen de un proveedor de mapas, no son una certificación de que el establecimiento siga abierto ni de acceso a una entrada específica. Revisar los términos de Google Maps Platform antes de almacenar, redistribuir o sincronizar su contenido en itinerarios.

Sin una clave de Places, Gemini y el itinerario siguen funcionando pero Waypoint **no afirma poseer dirección postal exacta**.


---

## RELEASE-V10.3.8

# Waypoint 10.3.8 — AI ideas, international emergency contacts, legal refresh

- Gemini-only assistant: interactive topic chips, up to 10 proposed locations, short reasons and safe rich-text display. Manual addition to itinerary retained; no location is automatically saved.
- Emergency contacts: request explicit country calling prefix (+57, +1 etc.), retain older saved numbers and correct tel URI, do not alter national emergency number.
- Privacy and Terms v1.3 (English & Spanish) identify Gemini and optional Google Places. Fresh legal acceptance is requested; no site storage is cleared.
- For Google Places on existing Railway: create a Cloud project, attach billing, enable Places API (New), issue a restricted server key, save as GOOGLE_PLACES_API_KEY, deploy. Only exact addresses returned by Google Places are shown as verified. Google charges according to SKU and quota.
- Preserve existing Railway service, /data volume, variables, and browser storage. Smoke-test and syntax-test before publishing.
- iOS Capacitor starter still requires Xcode and on-device verification; no native biometric ads or push claims.


---

## RELEASE-V10.3.9

# Waypoint V10.3.9 — AI suggestions, bilingual sharing and travel purposes

- The More ideas button now calls Gemini directly and cycles detailed suggestion themes, asking for 8–10 new places, timing, cost estimates and practical details. It excludes names from the previous response. Each click consumes an AI request and optional Places lookups. No guaranteed prices or exact addresses are invented.
- Guest shared-trip join form adds an Español / English switch, preserving typed names; supplementary name prompts respect the selected language.
- Trip type now indicates **purpose** (leisure/vacation, business, visiting family/friends, romantic, family vacation, events, wellness, study, volunteer, stopover, other); existing beach/city/adventure/winter selections remain selectable under legacy options. Saved trip values are not migrated or overwritten.
- Web and Capacitor www are kept identical; existing Railway persistent volume and variables stay unchanged.
- Test on browser and iPhone before public launch; Xcode not compiled in this environment.


---

## RELEASE-V10.4.0

# Waypoint V10.4.0 — iterative enhancement

## Implemented and available in web/PWA (and existing Capacitor remote shell)
- Waypoint AI: select multiple suggested places, edit dates/times, explicitly confirm bulk addition, reject invalid dates and duplicates, copy venue address; richer itinerary prompt context includes travel purpose. No automatic changes.
- Places: linked verified Google Places addresses / directions through existing optional server key. Does not fabricate missing addresses. No real photos or opening hours are added.
- Shared trips: optional RSVPs (Going / Maybe / Not going) for itinerary activities on editable shared trips; counts saved inside activities and sent by existing collaboration sync. Concurrent changes may have last-writer issues. Existing polls and expense settlement preserved.
- Reminders: configurable 10/30/60/120-minute lead. Browser reminders only while application is running; **no remote push**.
- Wallet: encrypted card category filter + search, existing local encryption/legacy compatibility kept. **No native Face ID**.
- Offline: existing cache preparation maintained and descriptions clarified; external maps, flights, AI remain online.
- Flights: on-demand real status lookup through AirLabs v9 when `AIRLABS_API_KEY` is set on Railway. Provider may return a different date for a given flight number. There is no background monitoring, automatic alerts, or guaranteed coverage. Without key, existing manual saved flights remain available.

## Deferred native or paid integrations
- Real APNs push, widgets/Live Activities, Face ID and native AdMob require actual native iOS Xcode project (and Apple Developer account for distribution), cannot be tested in Linux container.
- Fully verified place photo/ratings/operating-hours cards require additional Google Places fields, display attributions and review of licensing/billing.
- Flight alerts/push require background scheduler and flight-provider subscription, not included here.

## Deployment
Replace project files in the **existing** GitHub repository / Railway service. Preserve Railway volume `/data`, all env vars and all browser storage. `AIRLABS_API_KEY` is optional and secret. Confirm `/health` is `10.4.0` and test on real devices. Do not deploy this as a second Railway project.


---

## RELEASE-V10.5.0

# Waypoint V10.5.0 — Planning readiness and launch hardening

## Delivered
- New bilingual trip preparation checklist in the Hoy/Today tab with 6 derived planning indicators and direct navigation to the relevant sections.
- Warning alerts for budget overspend, incomplete packing, undated bookings and unscheduled place-based itinerary activities.
- Uses only previously saved trip data. No data migration, schema changes, location access, external requests or new API keys.
- Accessible progressbar and keyboard-focus states; responsive mobile layout.
- Existing v10.4.0 Gemini/Google Places, collaboration, encrypted local Wallet, reminders, manual live flight checks and Capacitor project retained.

## Not finished or guaranteed
- This is planning completion, NOT actual booking verification, travel safety clearance or a real-time alerts system.
- Native APNs push, Face ID, widgets/Live Activities, native AdMob, Android project and App Store publication still require additional engineering, Apple/Google enrollment and physical-device tests.
- Gemini, Places and AirLabs live-service responses cannot be verified without the operator's credentials.
- Ads/paid Premium entitlements do not provide live purchase processing. Financial / platform claims must not be made from admin desired flags.
- iOS Capacitor is an initial wrapper and may require additional native UX to pass App Store Review.

## Deployment
Replace contents of the SAME GitHub repository backing the existing Railway service. Preserve Railway volume /data and existing secrets/variables; do not delete browser storage. Confirm /health version 10.5.0. Run npm test and npm run test:phase1040 (legacy script name) locally. Test UI on physical iPhone and desktop before inviting users.


---

## RELEASE-V10.5.1

# Waypoint V10.5.1 — Trip type cleanup

- The Trip type / Tipo de viaje dropdown now lists only trip purposes (leisure, business, family visit, romantic, etc.).
- The old Beach / City / Adventure / Winter choices are no longer shown in the creation/edit dropdown.
- Previously saved legacy types remain in storage unchanged until the owner saves an edited trip; the form displays Leisure / Vacation for legacy types, which will then be saved as the new purpose. This does not touch any itineraries, checklist items, reservations, or other data.
- Legacy display labels no longer say `(previous category)` / `(categoría anterior)` anywhere.
- Web and iOS mirrored HTML updated; service worker cache incremented.

Deploy to the existing repository and Railway service; retain /data and the site's local data.


---

## RELEASE-V10.5.2

# Waypoint V10.5.2 — Validation and data-preserving travel types

## Changes
- Prevents silently reclassifying pre-existing `beach`, `city`, `adventure`, and `winter` journeys as Leisure/Vacation when the user saves unrelated edits. The dropdown no longer exposes those deprecated choices; an existing stored type remains unchanged until a new purpose is deliberately selected.
- Requires a valid purpose for new trips, and validates date order and nonnegative finite budget before any state mutation.
- Preserves legacy trip data, collaboration state, documents, and cached records; no database migration.
- Version and PWA cache advanced to 10.5.2. The iOS Capacitor web source mirrors the revised form.

- Unknown `/api/*` routes now return a JSON 404 instead of silently returning the PWA HTML, making integration failures diagnosable and preventing API consumers from parsing HTML as JSON.

## Scope
- No real-device/browser E2E testing or live provider account validation is included.
- Keep the same Railway service, existing environment variables, volume at `/data`, and browser data. Export your trips before deployment.


---

## RELEASE-V10.5.3

# Waypoint V10.5.3 — Simplified experience and navigation audit

- Consistent five-button trip navigation (Today, Plan, AI, Map, More) in both planning and Travel Mode. All former sections retained in one organized More menu; no trip state migration.
- Removes duplicated AI / Wallet / Flights / Assistance toolbar without removing features.
- Travel Mode no longer forces users away from the itinerary, polls or overview; it remains explicitly activated only from its own screen.
- Home search no longer re-renders on every keystroke and steals keyboard focus; results update as the user types.
- Prevents one trip card from changing the body Travel Mode style for all other trips.
- Opens trips on the Today overview (with actionable readiness tasks).
- Keyboard focus styles, button state and small-screen tap targets improved.
- Existing travel data, sharing, admin roles, server endpoints, API keys, Wallet ciphertext, service-worker data cache and Railway storage paths unchanged.

## Limits
The iOS Capacitor project is a development shell and requires Xcode and actual-device tests. Live Google Gemini, Places, AirLabs, notification permission and third-party payment/ad review are not asserted tested. Never delete Railway /data or user browser storage.


---

## RELEASE-V10.6.0

# Waypoint V10.6.0 — Easy Planning & Reliability

## Finished in this release
- One-click itinerary planning using the existing Gemini endpoint. The generated plan remains a draft until the user explicitly adds selected activities.
- Smarter Today screen with four quick actions: build itinerary, import booking, verify offline, and review schedule conflicts.
- Conflict detection across trip dates with an optional, confirmed action to shift the next item. Nothing is changed automatically.
- Verifiable offline check for this device (service worker + cached shell + local trip data) and a visible verification timestamp.
- Data reliability card with local-save, collaboration sync, offline state, and backup export access.
- Reservation import from pasted text and local TXT/EML/ICS/CSV/JSON text files. Raw confirmation text is not retained after saving; only bounded structured fields are stored.
- Existing Railway backend, Gemini, Google Places, collaboration data, Wallet, PWA and Capacitor project are preserved.

## Pending / intentionally not claimed as complete
- PDF/image OCR reservation import.
- Native iOS push notifications, Face ID, Widgets and Live Activities.
- True offline map tiles and external API results. Google Maps, Gemini, Places, flights and live chat still need internet.
- Automatic conflict resolution based on live travel-time data. The current correction uses saved duration + travel buffer and requires confirmation.
- App Store / TestFlight validation and real-device Xcode build.
- Browser visual E2E validation in this build environment.

## Data compatibility
No migration deletes or rewrites existing trips. V10.6.0 adds optional per-trip fields `offlineVerified` and `offlineVerifiedAt`; older data continues to load.


---

## RELEASE-V10.6.1

# Waypoint V10.6.1 — Clear summary & receipt photo reader

- Renamed the misleading **Recuerdos / Recap** trip-menu entry to **Resumen del viaje / Trip summary**, matching actual totals and export functions. No saved memories/gallery data was deleted or changed.
- Receipt OCR now works with the **existing Gemini API configuration** (`WAYPOINT_AI_ENABLED=true`, `GEMINI_API_KEY`, `WAYPOINT_AI_MODEL`) when `OCR_API_URL` is not configured. Existing custom OCR integration, if configured, is retained.
- Receipt photo upload accepts JPEG, PNG and WebP up to 3 MB, checks image types on client and server, rate-limits requests, uses a fixed transcription instruction and requires user review before saving the expense. The receipt image is forwarded to the provider only when the user explicitly selects a photo and taps Read photo; it is not saved on the Waypoint server.
- Improved Spanish/English error messages and privacy policy notices. Reading photos requires a network connection and provider availability, is not guaranteed accurate, and may consume the Gemini free quota.
- Existing Railway volume, user data, admin controls, web/PWA, and initial Capacitor project remain unchanged.
- Known limits: do not enter payment details or other sensitive documents; no automatic receipt categorization or guaranteed extraction. Browser-on-device, real Gemini and Xcode verification remain outstanding.


---

## RELEASE-V10.7.0

# Waypoint 10.7.0 — Multi-platform and web billing preparation

## Implemented
- The **existing** Node/Railway server now provides a Stripe Checkout route (`POST /api/billing/stripe/checkout`), requiring registered Waypoint installation credentials. A private secret and official Stripe Price IDs are needed.
- Webhook endpoint (`POST /api/billing/stripe/webhook`) rejects unverified signatures and checks subscription state with Stripe before granting/revoking Stripe entitlements. Status is not granted on a user-supplied success URL.
- Web Premium screen offers monthly/yearly Stripe Checkout only when the server is configured and the browser is not a native Capacitor WebView.
- Development-only Capacitor 8 Android remote shell added without creating a second Railway service.
- Dashboard billing flag is ON **only if** all Stripe environment variables are supplied, but that does not prove an end-to-end successful charge or that the account is approved. Ads remain OFF: AdSense snippet is merely verification, not consented ad serving.

## Not implemented; do not label these production-ready
- Native iOS/Android in-app purchases, secure store receipt validation or account linking across devices.
- Native AdMob SDK and consent management; AdSense approved serving, CMP/TCF; these still show OFF.
- App Store / Google Play signing, build, publication, native-device QA. Android is a remote URL *testing shell*.
- Subscription management portal, refunds/chargebacks reconciliation, advanced fraud rules, comprehensive payment provider webhook/event reconciliation, durable job queue.
- Full native offline app or native file encryption.

## Security notes
- Stripe key must be test mode first. Only webhook can activate billing-related Premium.
- Signed webhooks must be delivered to `/api/billing/stripe/webhook`; `WAYPOINT_PUBLIC_URL` is an HTTPS origin ending without a path; protect `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
- Device-local Waypoint ID is not a verified cross-device user identity. Do not expose cross-device purchase restoration without implementing account linkage.
- Existing Premium granted by admin/promo is not overwritten by Stripe events.
- Test cancellation, renewal, recovery, refund handling, expiry, two concurrent checkouts and multi-replica deployments before accepting production payments.

## Legal and consent
Bilingual privacy/terms updated to v1.6 for optional Stripe web checkout, with fresh acceptance. **Not legal advice:** review merchant identity, refund, support, tax handling and subscription terms before taking live payments.


---

## RELEASE-V10.8.0

# Waypoint V10.8.0 — Free y Premium verificables

**Añadido:** cuotas persistidas y revisadas en Railway para Gemini (Free 4/día, Premium 18/día) y OCR (Free 1/día, Premium 8/día); planificación completa con un clic protegida por el servidor y solo Premium; importación por lote de sugerencias para Premium en el cliente; pantalla de planes coherente, avisos y saldo de cuota desde la API; revocación inmediata.

**Conservado:** viajes locales y colaborativos, servidor Railway y volumen, IA Gemini exclusivamente, Places opcional, Wallet, web/PWA, scaffolds de iOS y Android, Stripe verificado por webhook. No se exigen nuevas credenciales.

**Advertencia:** Sin identidad Waypoint registrada se usa el plan Gratis; las cuotas se comparten por origen de conexión. Son límites de producto separados del límite global `WAYPOINT_AI_DAILY_LIMIT`, el antiabuso existente y los límites de Google. Respuestas fallidas pueden consumir cuota. El sitio debe informar sus límites y condiciones antes de cobrar. El contador por día usa UTC.

**No implementado:** publicidad en producción, validación de compras iOS/Android, un sistema seguro de cuentas universales, pruebas en dispositivos iOS/Android, verificación real de Gemini/Stripe. No declarar esos servicios activos.

**Pruebas:** `node scripts/premium-benefits-1080-test.js`, `npm test`, `npm run test:validation`, `npm run test:phase1040`, `npm run test:ux`, `npm run test:phase1060`, `node scripts/stripe-checkout-mocked-test.js`. Véase `PREMIUM-TEST-GUIDE.md`.


---

## RELEASE-V10.8.1

# Waypoint V10.8.1 — Planes claros y auditoría Premium

## Incluido en Gratis

Viajes, días, itinerarios, rutas/mapas y direcciones cuando estén disponibles, reservas, vuelos guardados, presupuestos y gastos compartidos, colaboración/chat/encuestas, Wallet local cifrado, equipaje, asistencia, modo offline preparado, 4 solicitudes Gemini por día y 1 OCR de recibos por día. Agregar sugerencias individuales al itinerario.

## Beneficios actuales adicionales de Premium

Todas las funciones anteriores, 18 solicitudes Gemini diarias, 8 lecturas OCR de recibos diarias, planificación completa con un clic, selección múltiple de actividades sugeridas y **nueva auditoría inteligente de itinerario**.

El usuario entra en un viaje > AI > «Auditar mi viaje». Si existe al menos una actividad, Gemini recibe destino, fechas, motivo, presupuesto y nombres de actividades seleccionadas del itinerario (hasta 12 días, 7 por día) y propone cambios de prioridades, distribución por días, solapamientos potenciales y precauciones, sin alterar datos automáticamente. No verifica horarios o tiempos de tráfico en vivo. Usa una de las solicitudes diarias del plan y requiere conexión a Internet.

**Control en servidor:** la modalidad `trip_audit` solo funciona con la credencial de instalación Premium verificada, al igual que `full_plan`. Free recibe HTTP 403 sin consumir cuota; después de revocar Premium vuelve a recibir 403. No usa OpenAI: requiere Gemini.

## Limitaciones importantes

- Las cuotas diarias por instalación y plan son un máximo, no una garantía de servicio. También rigen el límite global `WAYPOINT_AI_DAILY_LIMIT`, un máximo de 3 peticiones cada 10 minutos por instalación y las cuotas de Gemini.
- La selección múltiple de sugerencias es una limitación de interfaz/local, no una protección de pagos en servidor. No se debe comercializar como restricción estricta.
- El Premium verificado todavía está ligado a Waypoint ID de instalación; no existe cuenta universal de usuario.
- **Anuncios reales, Apple/Google in-app purchases, pagos Stripe en producción y ausencia de anuncios no están aún validados**. La descripción de Premium sin anuncios es un compromiso futuro condicionado a activación de anuncios y compras.
- Ningún cambio automático se aplica al itinerario sin aprobación del usuario.
- No se han realizado pruebas con credenciales reales ni compilación en iOS/Android.

## Despliegue

Actualiza los archivos del **mismo** repositorio GitHub y servicio Railway. Conserva las variables existentes, `WAYPOINT_DATA_FILE`, `WAYPOINT_ADMIN_DATA_FILE`, el volumen `/data` y los datos locales de los usuarios. Consulta `/health` para confirmar `10.8.1`. Usa dos Waypoint ID en perfiles de navegador diferentes; concede y revoca Premium desde `/admin`, comprueba las cuotas y prueba «Auditar mi viaje».


---

## RELEASE-V10.8.2

# Waypoint V10.8.2 — Premium Travel Desk

## Assessment and position
V10.8.1 has useful Premium features (18 Gemini/day, 8 OCR/day, full itineraries, AI audit), but these are concentrated in initial planning and do not yet justify a strong recurring-price proposition for many travelers. V10.8.2 adds three offline-compatible convenience features without reducing essential Free functionality.

## New Premium tools
1. **Actionable readiness desk in Today:** uses locally saved activities, booking dates, packing tasks, conflicts and spending to list meaningful next actions with direct navigation to the appropriate section. Shows only on verified Premium status; Free has a clear invitation without blocking core planning.
2. **Budget what-if:** dynamically recalculates projected spend, remaining budget and average remainder per entire trip day when entering a hypothetical cost. Nothing is charged or stored; the daily amount is an illustrative arithmetic division, NOT a forecast of spending.
3. **Privacy-conscious printable briefing:** creates a per-day schedule including booked times and available locations, budget balance and priority action list using saved information; deliberately excludes encrypted Wallet content and reservation confirmation numbers. Can be printed or saved as PDF using the device's print dialog.

Free remains complete for itinerary, map, travel and emergency information, budget, trip sharing, Wallet and offline basics. Existing Premium AI/OCR quotas and server-verified audit remain unchanged. New offline tools are client-side gated, not tamperproof access controls; do not misrepresent them as secure premium paywalls or as data verification services.

## Limitations / follow-ups
- Not yet verified on a real phone or against provider APIs. Offline features work on stored trip data but must not be mistaken for live verified opening hours/traffic.
- Server-side API usage and Premium status are verified server-side, but the new local-only tools are checked on the client. Native App Store/Google Play purchases, ads, and Stripe production are pending.
- `WAYPOINT_AI_DAILY_LIMIT` global default of 30 and upstream provider limits may prevent all users from consuming the advertised 18 requests each. Increase only with budget and abuse controls; don't promise unlimited usage.
- No universal cross-device user account; subscriptions are tied to installation.

## Deploy
Update the same repository and Railway service. Preserve /data volumes and all variables and client browser storage. Confirm /health reports 10.8.2. Grant Premium to a dedicated test Waypoint ID in /admin, refresh the client, and open Hoy > Premium Travel Desk. Test no-location, missing booking date, expense simulation, PDF/print, and revocation. Never delete local data or reset the Railway volume.


---

## FIX-V10.3.3

Waypoint V10.3.3: se elimina por completo el fallback y la llamada a OpenAI del endpoint de IA; Gemini es el único proveedor. Modelo predeterminado: gemini-2.5-flash-lite. Sin cambios en datos persistentes, estructura de viajes, AdSense o demás funciones.


---

## FIX-V10.3.1

# Waypoint V10.3.1 — Location & Tool Buttons Fix

- Corrected `Permissions-Policy` in both global HTML and API responses: `geolocation=(self)` rather than a blanket denial. HTTPS and the person’s location permission are still required.
- Location workflow separates obtaining location from sharing: user taps **Share link** after coordinates are available (preserving browser user-activation rules). Adds copy and manual-select fallbacks and useful errors.
- Travel tool buttons have clear selected/pressed styling, keyboard focus rings, and touch feedback. No trip data, Railway storage, or credentials changed.
- Update the **same** GitHub repository/Railway service. Keep the `/data` volume and current environment variables. Verify `GET /health` is 10.3.1. On iPhone allow location in iOS Settings and Safari site permissions. Native iOS permissions must be validated separately in Xcode.


## 10.9.2
- Encrypted portable trip backups and authenticated import, without transferring Waypoint ID or Premium entitlements.
- Secure-context checks, corrected offline snapshot count, updated web/mobile assets.
