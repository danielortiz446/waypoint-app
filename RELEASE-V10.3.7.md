# Waypoint 10.3.7 — Direcciones de lugares sugeridos por IA

Las sugerencias de Gemini ahora pueden consultar Google Places API (New) con `GOOGLE_PLACES_API_KEY` en Railway. Las coincidencias de nombre y destino muestran la dirección normalizada y un enlace a Maps. Si falta la clave, no hay coincidencia clara o falla el proveedor, se muestra "dirección sin verificar" y la búsqueda manual de Google Maps. La dirección obtenida se copia al itinerario **solo al pulsar Agregar**.

## Configuración (opcional y con facturación)
1. En Google Cloud, activar **Places API (New)** y habilitar facturación, cuotas y restricciones sobre la clave.
2. Agregar la variable Railway `GOOGLE_PLACES_API_KEY` con la clave exclusiva de Places API, restringida a la API. Nunca incluirla en el HTML ni en GitHub.
3. Mantener `GEMINI_API_KEY`, `WAYPOINT_AI_ENABLED=true`, `WAYPOINT_AI_PROVIDER=gemini` y `WAYPOINT_AI_MODEL` válidos. No usa OpenAI.
4. Desplegar el repositorio actual y verificar `/health` versión `10.3.7`. Pedir sugerencias de un viaje; confirmar dirección y botón Google Maps antes de añadir.

Se realizan hasta ocho búsquedas Places por respuesta de IA (potencialmente facturables), con timeout de 5s por búsqueda, tres búsquedas concurrentes por tanda; configurar cuotas estrictas en Google Cloud. Estas direcciones provienen de un proveedor de mapas, no son una certificación de que el establecimiento siga abierto ni de acceso a una entrada específica. Revisar los términos de Google Maps Platform antes de almacenar, redistribuir o sincronizar su contenido en itinerarios.

Sin una clave de Places, Gemini y el itinerario siguen funcionando pero Waypoint **no afirma poseer dirección postal exacta**.
