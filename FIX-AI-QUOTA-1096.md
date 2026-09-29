# Waypoint V10.9.6 — cuota Gemini

- Se asigna una cookie de invitado firmada por el servidor, con la misma identidad en consultas de saldo y generación AI/OCR.
- Las cuotas se siguen almacenando en `WAYPOINT_ADMIN_DATA_FILE`; este archivo requiere almacenamiento persistente y una sola fuente de verdad entre instancias.
- La interfaz ya no incrementa el saldo cuando llega una respuesta de consulta de saldo más antigua que la última generación confirmada.
- La cookie se mantiene un año en el dominio de la app; limpiar cookies/datos del sitio o usar navegadores diferentes crea invitado nuevo. Por tanto, no es un sistema infalible de prevención de abuso. Para cuotas sólidas entre equipos es necesario iniciar sesión/Waypoint ID y una base de datos compartida.
- Se mantienen 4 consultas diarias gratuitas y 18 Premium de manera predeterminada, con reinicio a las 00:00 UTC.
- Actualiza los archivos web **y** el servidor. En iOS/Android recompila la app. Verifica `WAYPOINT_ADMIN_DATA_FILE` en volumen persistente de Railway.

- El bloqueo antifrecuencia antes era de 3 solicitudes / 10 minutos; se elevó a 12 / 10 minutos para no contradecir la cuota gratuita de 4 al día.
