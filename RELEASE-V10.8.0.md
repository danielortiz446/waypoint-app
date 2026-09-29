# Waypoint V10.8.0 — Free y Premium verificables

**Añadido:** cuotas persistidas y revisadas en Railway para Gemini (Free 4/día, Premium 18/día) y OCR (Free 1/día, Premium 8/día); planificación completa con un clic protegida por el servidor y solo Premium; importación por lote de sugerencias para Premium en el cliente; pantalla de planes coherente, avisos y saldo de cuota desde la API; revocación inmediata.

**Conservado:** viajes locales y colaborativos, servidor Railway y volumen, IA Gemini exclusivamente, Places opcional, Wallet, web/PWA, scaffolds de iOS y Android, Stripe verificado por webhook. No se exigen nuevas credenciales.

**Advertencia:** Sin identidad Waypoint registrada se usa el plan Gratis; las cuotas se comparten por origen de conexión. Son límites de producto separados del límite global `WAYPOINT_AI_DAILY_LIMIT`, el antiabuso existente y los límites de Google. Respuestas fallidas pueden consumir cuota. El sitio debe informar sus límites y condiciones antes de cobrar. El contador por día usa UTC.

**No implementado:** publicidad en producción, validación de compras iOS/Android, un sistema seguro de cuentas universales, pruebas en dispositivos iOS/Android, verificación real de Gemini/Stripe. No declarar esos servicios activos.

**Pruebas:** `node scripts/premium-benefits-1080-test.js`, `npm test`, `npm run test:validation`, `npm run test:phase1040`, `npm run test:ux`, `npm run test:phase1060`, `node scripts/stripe-checkout-mocked-test.js`. Véase `PREMIUM-TEST-GUIDE.md`.
