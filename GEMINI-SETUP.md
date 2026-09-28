# Waypoint V10.3.3 — Solo Google Gemini

En tu servicio **existente** de Railway agrega o comprueba:

- `WAYPOINT_AI_ENABLED=true`
- `GEMINI_API_KEY=` tu clave privada real de Google AI Studio
- `WAYPOINT_AI_PROVIDER=gemini` (opcional; esta versión usa exclusivamente Gemini)
- `WAYPOINT_AI_MODEL=gemini-2.5-flash-lite` (opcional; es el modelo predeterminado)
- `WAYPOINT_AI_DAILY_LIMIT=30` (opcional; cuota local de Waypoint)

**`OPENAI_API_KEY` no se consulta nunca en V10.3.3**, aunque exista la variable. Puedes dejarla almacenada o borrarla de Railway si ya no la necesitas para ningún otro servicio. Waypoint no contiene fallback hacia OpenAI. Si Gemini no responde, se comunica un error, sin pasar a otro proveedor.

Después de desplegar, `/api/ai/status` debe indicar `provider: Gemini`, `model: gemini-2.5-flash-lite`, y `configured: true` si está activado y tiene clave. La respuesta `live: false` significa que el endpoint de estado no ha realizado una consulta real. Prueba desde la pantalla de IA de un viaje para comprobar acceso efectivo y cuota.

No publiques claves en GitHub ni capturas; respeta los límites y reglas de privacidad del plan gratuito de Google. Conserva tu Railway y su volumen `/data`.
