# Waypoint v10.3.6 — Wallet de viaje

- Tarjetas de viaje cifradas por dispositivo: categorías, referencia, búsqueda, edición, mostrar/ocultar y copia bajo acción explícita.
- Mantiene la lectura y edición de notas antiguas (`label`/`value`) sin migrar ni alterar el ciphertext hasta que el usuario guarde cambios.
- Cifrado AES-GCM + PBKDF2 existente. Se bloquea al ocultar la app o salir del viaje.
- No contiene Face ID, adjuntos cifrados ni sincronización privada entre dispositivos. Los documentos normales del viaje siguen sin cifrar.
- La app iOS en `ios-capacitor/www` es una instantánea web de referencia; sigue necesitando Xcode, pruebas y cambios nativos para publicación.
- Despliega en el Railway existente, conserva `/data` y no borres el almacenamiento local.
