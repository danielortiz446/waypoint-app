> **Current release: Waypoint V10.3.0.** See [RELEASE-V10.3.0.md](RELEASE-V10.3.0.md) and [QA-V10.3.0.txt](QA-V10.3.0.txt) for actual feature status; older notes below are historical.

# Waypoint V10.3.0 → iOS with Capacitor (development baseline)

## Qué incluye y qué NO

- El ZIP conserva la **aplicación web y servidor V10.3.0** en la raíz (GitHub / Railway actual). `ios-capacitor/` es un proyecto secundario para preparar una app iOS de prueba. No cambies el servicio ni el volumen de Railway.
- La primera compilación iOS abre el **sitio HTTPS existente**, con las mismas rutas de API, chat y sincronización. Esto es una **envoltura de desarrollo**, NO una compilación App Store lista y NO es offline autónoma. Si Railway está caído o no hay internet, este modo depende de la página en caché y puede fallar.
- No incluye un proyecto Xcode generado, porque `npx cap add ios` debe ejecutarse en macOS con dependencias instaladas. No instalé ni compilé dependencias nativas en este entorno.
- No se incorporó AdMob aún: primero necesitas una app iOS nativa probada, los App ID y ad unit de AdMob, consentimiento UMP y una estrategia de publicidad que excluya Premium.

## 1. Apple Developer (desde Windows o Mac)

Visita https://developer.apple.com/programs/enroll/ y crea tu Apple Account/membresía. Puedes **probar inicialmente en dispositivo personal con Xcode** sin membresía de pago utilizando un equipo Personal Team con restricciones, pero para TestFlight y App Store tendrás que unirte al Apple Developer Program. Antes de producción decide si distribuirás como Individual u Organization; para una cuenta Individual se muestra el nombre legal del titular como vendedor. Completa los acuerdos y formularios vigentes.

## 2. No pierdas tu proyecto web actual

Descomprime el ZIP en otra carpeta, no encima de una copia local con cambios propios. Para Railway continúa subiendo solo la raíz web/servidor (Dockerfile, server.js, public/, etc). Puedes mantener ios-capacitor/ en el mismo repositorio, **pero no alteres las variables ni volumen /data**. No borres la PWA instalada: sus datos locales no se migran automáticamente a la nueva app nativa.

## 3. Mac — herramientas

Instala Xcode estable desde Mac App Store, abre Xcode una vez, instala sus componentes/command-line tools; instala Node.js LTS, npm y herramientas de desarrollo necesarias. En Terminal:

```bash
cd /RUTA/A/waypoint/ios-capacitor
npm install
```

### Configura TU dominio real antes de sincronizar

Escribe la URL HTTPS pública **sin barra final ni rutas**, por ejemplo `https://tu-servicio.up.railway.app`; el nombre es un ejemplo y debes usar el dominio real. Comprueba en el navegador `https://TU_DOMINIO/health` (la app debe indicar v10.3.0).

macOS Terminal (reemplaza la URL):

```bash
export WAYPOINT_IOS_URL='https://TU_DOMINIO_REAL'
npx cap add ios
npx cap sync ios
npx cap open ios
```

`capacitor.config.ts` exige la variable y falla intencionalmente cuando falta. Si después cambias el dominio, vuelve a exportar la variable y corre `npx cap sync ios`. No exportes una URL con `/admin`, `/api` ni `/health`.

En Xcode: selecciona App (target) → Signing & Capabilities → Team (tu Apple Account/Developer Team), actualiza Bundle Identifier (`com.waypoint.travelplanner` es **provisional** y puede estar ocupado), selecciona un iPhone/simulador → Run. En un iPhone real habilita Developer Mode si iOS lo solicita. Es recomendable usar primero simulador y después un dispositivo físico.

**Windows:** edita y organiza código con VS Code/GitHub y prueba la web. Para compilar, firmar y enviar la app iOS necesitas la Mac con Xcode (o un sistema de builds de macOS autorizado); Windows por sí solo no ejecuta Xcode.

## 4. Prueba funcional obligatoria

- Apertura, navegación y buen ajuste de pantalla, menú Más y modo viaje.
- Crear/editar viaje local, salir y volver a entrar sin pérdida de datos.
- Colaboración/chat con otra persona, presencia, invitaciones y enlaces que se abran correctamente dentro/fuera de iOS.
- Clima, moneda, fotos, carga de documentos, permisos y exportación/impresión.
- Cambiar entre Wi-Fi y sin conexión: **marcar como pendiente de resolver cualquier dependencia del sitio remoto**. No afirmar que la app es offline nativa por el mero hecho de usar Capacitor.
- Comprobar que los diagnósticos no aparezcan al público y que `/admin` exija autenticación.
- Revisar *Review Guidelines* 4.2 de Apple: este primer build es una webview de prueba y puede ser rechazado para App Store si no se añade una experiencia con valor nativo.

## 5. Preparar realmente una futura versión App Store

1. Definir ID definitivo, nombre, iconos/splash, ficha App Store Connect, clasificación y capturas.
2. Diseñar una versión **bundled/local** y adaptar todas las llamadas `/api` para que usen el origen de Railway sin romper SSE, autenticación ni links compartidos. Ese trabajo aún no está realizado.
3. Mejorar integraciones nativas (compartir, archivos, notificaciones si se implementan) y persistencia. No migrar silenciosamente datos sensibles entre orígenes web/nativo.
4. Revisión legal: privacidad, política de anuncios, permisos, declaraciones de App Privacy; completar datos de contacto reales.
5. TestFlight y pruebas reales de iPhone, y luego envío a revisión; Apple decide la aprobación.

## 6. AdMob, **después** de la versión nativa operativa

1. Crear AdMob → Apps → Add App → iOS → app no publicada.
2. Crear **banner test** y obtener `ca-app-pub-...~...` (App ID) y `ca-app-pub-.../...` (ad unit ID); son **distintos** del `ca-pub-...` de AdSense.
3. Evaluar plugin compatible con tu versión de Capacitor, por ejemplo `@capacitor-community/admob` compatible con Capacitor 8; añadir las entradas requeridas al Info.plist, identificadores SKAdNetwork y permiso ATT si corresponde.
4. Configurar Privacy & Messaging / UMP, solicitar consentimiento y mostrar anuncios solo cuando `canRequestAds` sea verdadero y la elegibilidad Free esté verificada. Nunca mostrar banners sobre navegación/acciones de emergencia.
5. Primero anuncios de prueba, sin clics reales; tras registro de la tienda e inspección por AdMob, publicar `app-ads.txt` en el dominio de desarrollador cuando corresponda.
6. **No** presentar el script de AdSense de la web como sustituto del SDK nativo de AdMob.

## Referencias

- Apple Developer: https://developer.apple.com/programs/enroll/
- Apple Review 4.2: https://developer.apple.com/app-store/review/guidelines/
- Capacitor iOS: https://capacitorjs.com/docs/ios
- Capacitor configuration: https://capacitorjs.com/docs/config
- Capacitor AdMob community plugin: https://github.com/capacitor-community/admob
- Consent Google UMP: https://developers.google.com/admob/ios/privacy
