# Waypoint 10.8.1 — Pruebas reales de Free y Premium

## Beneficios implementados

| Herramienta | Gratis | Premium |
|---|---|---|
| Viajes, itinerarios, mapas, colaboración, presupuesto y Wallet | Sí | Sí |
| Consultas a Gemini | 4/día por instalación registrada | 18/día por instalación registrada |
| Foto de recibo con OCR | 1/día | 8/día |
| Crear itinerario completo con un clic | No; botón invita a explorar Premium | Sí, Gemini genera propuesta revisable |
| Añadir lugares uno por uno | Sí | Sí |
| Agregar varias sugerencias de IA a la vez | No; botón invita a explorar Premium | Sí, con confirmación antes de guardar |
| Publicidad | No operativa todavía | No operativa todavía; sin anuncios cuando se activen |
| Stripe web | Solo si configurado y confirmado por webhook | Solo si configurado y confirmado por webhook |
| Compras en App Store / Google Play | Pendiente | Pendiente |

Las consultas son peticiones, no respuestas garantizadas: errores de Gemini también pueden consumir una cuota, y el límite global adicional `WAYPOINT_AI_DAILY_LIMIT` (por defecto 30 solicitudes para toda la app) continúa vigente. El límite antiabuso preexistente de 3 peticiones en 10 minutos por instalación continúa vigente. Los límites de uso del proveedor Gemini también son independientes. Los contadores son por día UTC y se conservan en `WAYPOINT_ADMIN_DATA_FILE`, preferiblemente dentro del volumen Railway `/data`. No borres ese volumen.

Para que los beneficios sean verificables, cada usuario debería crear el **Waypoint ID opcional** en Configuración. Las visitas sin ID siguen en Gratis y comparten una cuota de invitado por dirección de conexión. Las credenciales privadas del dispositivo nunca deben compartirse.

## Prueba de dos usuarios sin realizar pagos

1. Actualiza el **mismo repositorio** y espera a que `/health` responda `10.8.1`. No cambies ni borres el servicio ni el volumen `/data`.
2. Abre Waypoint en **dos perfiles de navegador distintos**. En cada perfil, entra a Configuración y crea un Waypoint ID, uno para Gratis y otro para Premium.
3. Abre `https://TU-DOMINIO/admin`, inicia sesión y ve a **Users & Premium**. Otorga 7 días al segundo ID.
4. En ambos perfiles, pulsa **Actualizar plan** en Configuración. En la pantalla Premium, abre «Uso disponible hoy» y pulsa Actualizar.
5. Cuenta las diferencias: Gratis 4 Gemini y 1 OCR; Premium 18 Gemini y 8 OCR. En el perfil Premium prueba «Crear mi itinerario» desde Hoy y después «Agregar selección» desde Waypoint AI.
6. En Gratis, prueba una consulta normal y agregar un lugar individual: funcionan. «Crear mi itinerario» y «Agregar selección» deben mostrar que requieren Premium.
7. En `/admin`, revoca la concesión Premium y actualiza el segundo perfil. El servidor vuelve a restringir la planificación completa; tus viajes no se eliminan.
8. Si usas Stripe, primero prueba compras con **Stripe Test Mode** y confirma que la activación ocurre solo después de un webhook validado. Las compras nativas y anuncios siguen pendientes.

## Verificación de API (no pegues secretos)

- `GET /api/premium/benefits` muestra cuotas Gratis si no hay credenciales.
- La aplicación envía las credenciales privadas almacenadas localmente, por HTTPS, como encabezados a `/api/premium/benefits`, `/api/ai/plan` y `/api/ocr/receipt`.
- `POST /api/ai/plan` con `mode=full_plan` requiere una identidad Premium validada en el servidor; de lo contrario devuelve `403 premium_required`.
- Los límites por plan son comprobados por el servidor y persisten en el archivo administrativo existente.
- No hay ninguna dependencia de `OPENAI_API_KEY`. Solo se utiliza `GEMINI_API_KEY` para Gemini.

## No declaramos listo aún

AdSense de producción, AdMob, pagos in-app, cuenta universal entre dispositivos, verificación real con las claves del operador, pruebas en teléfonos reales y aprobación de tiendas de apps. El Waypoint ID sigue ligado a la instalación; tener Premium en un dispositivo no autentica automáticamente otro dispositivo.


## Premium Travel Desk (10.8.2)

1. In the admin panel, grant 7 days to one Waypoint ID, refresh the plan on the client and open any trip > Hoy > Premium Travel Desk.
2. Expand the panel. Verify missing activity locations, undated bookings, packing items and detected scheduling overlaps display links to the corresponding section.
3. Enter an additional hypothetical expense. Verify the projected balance changes instantly, but the budget and expenses saved in the app DO NOT change.
4. Click Create travel briefing; verify the dates, activities and locations, try Print / Save PDF. Confirm Wallet secrets and reservation confirmation numbers are absent.
5. Revoke Premium, refresh plan, check the Free view shows an invitation and the Premium tools are no longer available.
6. Existing server-protected benefits: full itinerary, AI audit, 18 daily Gemini and 8 OCR (subject to global quota and upstream limits).

Security note: these three tools run on local trip information. Premium checks on these local tools are client-side and are not a cryptographic paywall.
