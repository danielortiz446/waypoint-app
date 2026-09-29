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
