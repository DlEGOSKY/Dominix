# Offline, pestañas y avisos · 14 de noviembre de 2026

Rama `codex/dominix-stability-polish`, base `f2a8677d54ffdfa9c97cb55db0f12081c1369db2`. Cambios locales sobre el trabajo anterior; sin commit, publicación, dependencias nuevas ni consumo de créditos. Continúa [guardar y continuar](RUN_CONTINUITY_2026-11-14.md).

## Hallazgos y correcciones

| Problema | Clasificación y comprobación | Cambio |
| --- | --- | --- |
| Varias pestañas podían guardar una run o modificar el perfil simultáneamente | Demostrado por lectura: los escritores anteriores no coordinaban acceso | Acceso exclusivo del navegador antes de montar App. Segunda pestaña espera; al cerrar la primera abre el estado reciente |
| Iconos de instalación inexistentes | Demostrado por lectura del manifiesto y listado de public | SVG original y PNG reales de 192/512 px; favicon SVG y manifiesto con orientación libre |
| La caché inicial no incluía pantallas sin visitar | Demostrado por lectura: solo HTML/manifiesto en instalación | Lista generada de todos los chunks, CSS, fuentes e imágenes de cada build |
| Colección precargada fallaba offline | Reproducido en Chrome, con error de importación y respuesta 503. El servidor enviaba `Vary: Origin` | Para recursos estáticos idénticos, las búsquedas ignoran esa variación entre precarga y peticiones de módulos/fuentes. Regresión de worker y navegador |
| La instalación incompleta podía tomar control; errores HTTP podían quedar en caché; recursos ausentes podían recibir HTML | Demostrado por lectura del worker anterior | La nueva instalación solo toma control tras cachear todo; no almacena errores ni acepta HTML como JS/imagen; un recurso ausente recibe error explícito |
| La activación borraba recursos de la versión que aún ejecutaban pestañas abiertas | Demostrado por lectura de la limpieza anterior | Conserva una generación anterior del mismo despliegue y puede leer cachés antiguas sin borrarlas. Cachés nuevas separadas por scope |
| Recargar por actualización no comprobaba el guardado | Demostrado por lectura de UpdatePrompt | Recarga cancelable: GameBoard guarda primero y cancela si falla. Prueba con cuota simulada |
| Error de guardado tapaba Recargar | Reproducido durante la prueba, con intercepción real del clic | `SystemNotice` apila errores, actualización, instalación y recibos. Comprobados separación geométrica y clics reales |
| Historial de patrones invadía la cabecera | Reproducido visualmente en captura de 1280 px | Panel en el margen exterior cuando hay espacio (1280+). Encabezado traducido y ayudas accesibles por teclado |

Los fallos de caché y avisos se encontraron al verificar esta entrega y se corrigieron antes de finalizarla. No se considera que una compilación o un archivo existente basten para validar una función.

## Acceso a los datos

`AppAccess` solicita el bloqueo `dominix-player-session-v1` mediante Web Locks. Monta App solo al obtenerlo y carga su módulo entonces, para leer el perfil reciente. El bloqueo protege toda la aplicación, incluidos progreso, importación y reinicios; continúa activo aunque la pestaña quede en segundo plano o esté en portada. Cerrar el documento libera el acceso y permite continuar automáticamente a la siguiente pestaña. Se verificó también cerrar justo después de otra colocación, sin esperar al autoguardado de 150 ms: pagehide conservó esa jugada para la siguiente pestaña.

Es una decisión de producto: una sola instancia escribe por origen, también en ventanas distintas de la misma sesión del navegador. No se añadió expulsión forzosa ni un modo de consulta simultáneo. Otros perfiles/orígenes mantienen sus datos independientes, como antes. Pestañas de versiones antiguas que no implementan el bloqueo deben cerrarse o actualizarse; no se les fuerza una recarga que pudiera perder una partida.

Si falta el API o falla el acceso, se muestra un mensaje y Reintentar sin montar el juego ni alterar el guardado. Requiere un navegador compatible en HTTPS o localhost. Se comprobó la ausencia simulada y la recuperación del acceso en ES/EN a 320 px. La protección no utiliza temporizadores de caducidad que pudieran permitir dos escritores al suspenderse una pestaña.

## Offline y actualizaciones

`offlineBuild.mjs` emite `offline-assets.json` y una revisión de `sw.js` derivada de los bytes de la compilación, HTML, worker y recursos públicos requeridos. Las pruebas protegen cambios de HTML incluso si no cambian nombres de archivos. No depende de recordar incrementar una versión manual.

El worker instala una copia completa o conserva la anterior si falta un recurso. La navegación usa red cuando está disponible y el shell precargado de su propia revisión al fallar. No sustituye ese shell por HTML de otra compilación a medio instalar. Los módulos estáticos se sirven desde caché y se conservan respuestas correctas de red cuando procede; fallar al escribir caché no inutiliza una respuesta de red válida. No devuelve la portada como si fuera un módulo o JSON. La limpieza respeta otros despliegues y conserva una generación anterior; no garantiza mantener indefinidamente pestañas abiertas durante muchas publicaciones consecutivas.

Inter y JetBrains Mono son las mismas familias anteriores, ahora en WOFF2 local (48.256 y 31.432 bytes, variantes latinas ES/EN), con licencias SIL OFL 1.1 distribuidas. Se eliminó la petición a Google Fonts en cada apertura. Los iconos originales usan la paleta azul/violeta y oro del juego; no contienen texto rasterizado. SVG 2.110 bytes, PNG 192: 27.001, PNG 512: 121.744. No se reemplaza el título de la portada ni se añade una colección de skins. [Procedencia y licencias](ASSET_PROVENANCE.md).

Los avisos de actualización/instalación usan ES/EN y objetivos de 44 px. Se limpia el temporizador pendiente de instalación y se da prioridad a una actualización para evitar dos propuestas simultáneas. Una recarga ofrecida por la app guarda sin esperar al debounce; si falla, conserva la mesa y muestra el error. Esto no puede cancelar un cierre forzoso del sistema.

## Verificación

- **291 pruebas correctas en 18 archivos**, frente a 276 de la entrega anterior. Se sustituyeron dos casos de worker por catorce de integridad offline y se añadieron tres de revisión de build. Lint completo, TypeScript de producción, TypeScript de QA y `git diff --check` correctos.
- Compilación de raíz y compilación con `GITHUB_PAGES=true` bajo `/Dominix/`, ambas sobre producción local. Sin publicación remota. La salida de prueba de subruta está en outputs, fuera del árbol de producción; no se vació ni se borró ningún directorio previo.
- Chrome con perfiles temporales normales: manifiesto válido y **sin errores de instalabilidad**. Un primer ensayo en contexto de incógnito devolvió `in-incognito`, una limitación del ensayo; se usó después un perfil normal aislado. No se instaló la app en el sistema operativo personal ni se acredita una PWA instalada en móvil físico.
- Dos pestañas: la segunda no monta el juego ni modifica la run. Al cerrar la propietaria recupera el estado/RNG reciente, incluida la última colocación inmediatamente anterior al cierre. Cerrar una pestaña que espera no bloquea las siguientes.
- Red desactivada después de completar instalación: recargar, continuar y colocar otra ficha; guardar/salir; entrar por primera vez en Colección/skins y consultar Imperium. Fuentes locales disponibles. El flujo pasa en `/` y `/Dominix/` con cero errores de consola/pageerror.
- Aviso de actualización simulado mediante el mismo mensaje del worker: se cancela Recargar con cuota de almacenamiento simulada, los avisos no se solapan y el clic funciona al restaurar las escrituras. La nueva carga conserva la run. También se reclamó una reliquia real offline, comprobando que su recibo y el aviso de actualización sean independientes y se pueda cerrar el recibo.
- La caché contiene 40 respuestas, aproximadamente **1,78 MB de cuerpos leídos por Cache API**, incluidas pantallas sin visitar, fuentes e iconos. No es una medida del espacio físico en disco ni de memoria/FPS. No hace falta haber visitado cada pantalla antes de desconectar; sí haber completado la instalación inicial con red.
- Build de raíz: entrada **53,98 kB / 17,40 kB gzip**, App **465,67 kB / 131,93 kB gzip**, más chunks compartidos y diferidos; CSS **133,4 kB aprox. / 20,99 kB gzip**. La división entrada/App no elimina la descarga de App cuando se obtiene el acceso. Continúa el aviso de Browserslist antiguo.

Los primeros ensayos descubrieron la variación de cabeceras y la intercepción de clics descritas arriba. Un servidor lanzado dentro del sandbox no era accesible para Chrome externo; la prueba de subruta se repitió en el servidor local autorizado de 5181. Se usaron herramientas existentes, sin instalar paquetes ni tocar perfiles personales.

## Archivos y evidencias

Nuevos `src/components/AppAccess.tsx`, `SystemNotice.tsx`, `tools/offlineBuild.mjs`, `src/engine/offlineBuild.test.mjs`, `public/icon.svg`, `icon-192.png`, `icon-512.png`, fuentes en `src/assets/fonts/` y licencias en `public/licenses/`.

Modificados `main.tsx`, `GameBoard.tsx`, `PatternLog.tsx`, `RewardReceipt.tsx`, `UpdatePrompt.tsx`, `PWAInstallPrompt.tsx`, `runCheckpoint.ts`, `i18n.ts`, `index.css`, `index.html`, `manifest.json`, `sw.js`, `serviceWorker.test.mjs`, `vite.config.ts` y documentación.

QA: `qa/pwaSafety.browser.mjs`, `appAccess.browser.mjs`, `exportAppIcons.browser.mjs`. El primero recibe módulo Playwright, ejecutable Chrome, carpeta de evidencias y URL opcional. El exportador rasteriza el SVG propio en los tamaños del manifiesto, sin generación de pago.

En `outputs/dominix-review/` del workspace:

- `pwa-verificacion-{root,subpath}-2026-11-14.json`: flujos reales y resultados de instalabilidad.
- `pwa-cache-{root,subpath}-2026-11-14.json`: recursos y cabecera `Vary` observada.
- `pwa-acceso-verificacion-2026-11-14.json`: API no disponible/reintento, ES/EN.
- `pwa-partida-offline-escritorio-2026-11-14.jpg`: partida real offline, historial fuera de la cabecera.
- `pwa-partida-offline-{root,subpath}-2026-11-14.jpg` y `pwa-coleccion-offline-{root,subpath}-2026-11-14.jpg`.
- `pwa-espera-{root,subpath}-2026-11-14.jpg`, `pwa-avisos-{root,subpath}-2026-11-14.jpg` y `pwa-recibo-avisos-{root,subpath}-2026-11-14.jpg`: coordinación y mensajes.

## Límites y siguiente paso

No se verificaron instalación física en Windows/Android/iOS, cierre forzoso del proceso, evicción de caché por el sistema, todas las rutas/jefes durante una campaña offline, ni una actualización completa entre dos despliegues remotos reales. La activación, conservación de versiones y rechazo de instalaciones incompletas se protegen con pruebas del worker; el botón de actualización se comprobó con mensaje simulado. Tampoco se certifica compatibilidad con todos los navegadores o todas las pestañas de versiones antiguas.

Siguiente paso recomendado: una campaña más larga con eventos, tienda y jefe multifase, comprobando a la vez balance, feedback y recuperación. Las pruebas de instalabilidad no sustituyen una revisión posterior en una PWA instalada en dispositivo físico.

Referencias técnicas consultadas: [Web Locks](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API), [ciclo de vida y caché del service worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers), [iconos del manifiesto](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/icons).
