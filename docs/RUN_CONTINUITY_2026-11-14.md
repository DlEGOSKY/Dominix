# Guardar y continuar · 14 de noviembre de 2026

Actualización posterior: [offline, pestañas y avisos](OFFLINE_TABS_2026-11-14.md) verifica offline y añade coordinación entre pestañas. Sustituye esos pendientes de esta entrega; conserva los límites de campañas largas, cierre forzoso e instalación física.

Rama `codex/dominix-stability-polish`, base `f2a8677d54ffdfa9c97cb55db0f12081c1369db2`. Cambios locales sobre el trabajo anterior, sin commit, publicación ni dependencias nuevas. Esta entrega trabaja continuidad y transiciones; conserva la identidad visual existente y no genera recursos gráficos ni consume créditos.

## Diagnóstico y correcciones

| Hallazgo | Evidencia | Resultado |
| --- | --- | --- |
| La partida activa desaparecía al recargar | Lectura: App iniciaba en portada, GameBoard mantenía el estado solo en memoria y exportSave no incluía una run | Checkpoint local versionado, autoguardado y botón Continuar |
| Guardar únicamente GameState perdería efectos, ofertas y decisiones | Lectura de los estados/ref de GameBoard | Se guardan también mapa, tiendas, elecciones, modificadores, bonos de progresión congelados, poderes, misiones, fase/presión de jefe, deshacer y registros |
| Volver a montar podía repetir efectos de inicio | Lectura de los efectos de ronda, legado, alineaciones y familias | Restauración salta inicialización de mazo/ronda/legado; refs se inicializan desde lo guardado. Inicio de ronda protegido frente a la repetición del setup de efectos |
| Un autoguardado tardío recuperaba una run ya finalizada | Reproducido en Chrome durante esta implementación: AnimatePresence conserva el tablero durante su salida | Guard síncrono de finalización bloquea escrituras pendientes y segundas notificaciones de resultados antes de que App elimine ambas copias. Regresión de navegador pasa |
| RoundTransition reiniciaba el temporizador al cambiar el callback y no limpiaba el segundo temporizador | Lectura del efecto anterior y prueba del componente corregido con callback cambiante cada 50 ms | Callback actualizado por ref, dependencias semánticas y limpieza de ambos temporizadores; movimiento reducido completa inmediatamente |
| Reanudar un reto antiguo podía registrar el resultado en el período actual | Lectura: se calculaba la fecha/semana en el momento de terminar | El resultado recibe la semilla original; si ya caducó no sobrescribe el reto vigente. Pruebas con reloj controlado |

La corrección de finalización corresponde a un fallo de la integración nueva, detectado y resuelto antes de entregarla. La prueba inicial de recuperación falló por intentar analizar la cadena deliberadamente dañada antes del siguiente autoguardado; se corrigió el lector del script. Un fixture inicial de jefe también tenía calor incompatible con su cadena vacía: se sustituyó por una cadena real y calor derivado de ella, sin alterar las reglas del juego para satisfacerlo.

## Comportamiento y datos

- Se mantiene una partida activa por navegador/origen. La portada ofrece Continuar y la mesa incorpora Guardar y salir; las elecciones y pantallas de encuentro también se autoguardan. Iniciar otra partida pide confirmación cuando existe una recuperable.
- El checkpoint incluye semilla y cursor del generador mulberry32. Restaurar no reconstruye la partida desde la semilla: recupera el punto exacto. Una prueba compara 10.000 extracciones con el generador anterior y otra compara repartos, ofertas, recompensas y mapas futuros.
- Los talentos, maestría y ascensión efectivos quedan congelados durante esa run. No se consumen de nuevo las ventajas de inicio o el legado al continuar. Los efectos puramente visuales en curso no se serializan; la cinematografía inicial tampoco se repite al cargar.
- Nuevas claves `dominix_active_run_v1` y `dominix_active_run_backup_v1`; no se migra ni se borra el progreso previo. Antes de reemplazar la copia principal se conserva la anterior válida. Un principal dañado no sustituye una copia buena. Al recuperar se avisa que puede faltar la última acción.
- Sobre con versión, checksum FNV-1a y reglas `dominix-2026-11-14-r1`; límite de dos millones de caracteres. Se validan estructura requerida, fichas, estadísticas, presupuestos, contexto de pantallas, bonos y listas. El checksum detecta corrupción accidental; no es una firma ni protección contra edición manual. No se promete validar exhaustivamente todo posible JSON malicioso.
- Las escrituras normales se agrupan con una espera de 150 ms; cambios de visibilidad y pagehide intentan guardar inmediatamente. Guardar y salir exige una escritura correcta. Los fallos muestran un aviso también en las pantallas de elección y mantienen abierta la run. No se garantiza la última acción ante un cierre abrupto del proceso.
- Exportación versión 3 incluye ambas copias. Importaciones anteriores 1/2 siguen admitidas; si no contienen partida activa, no reemplazan la que ya existe. Una copia con run inválida se rechaza antes de modificar el perfil. Finalizar elimina las dos generaciones de la run.
- Una partida de reto caducada continúa siendo jugable y registra sus resultados generales; no acredita el diario/semanal vigente. No se añade un archivo histórico de retos ni clasificación remota.

## Verificación realizada

- **276 pruebas correctas, 17 archivos**: doce casos nuevos de cursor RNG, futuro determinista, estado completo, recuperación, cuota de almacenamiento, corrupción/contextos incompletos, conservación del perfil, exportación/importación y cambio de día/semana. Suite ejecutada con `--pool=threads --maxWorkers=2`.
- Lint completo, TypeScript/compilación de producción y TypeScript de QA correctos. Build principal **515,33 kB / 146,84 kB gzip**; CSS **132,92 kB / 20,84 kB gzip**. Permanece el aviso previo de Browserslist antiguo; no se actualiza el lockfile.
- Chrome aislado sobre la compilación real local: Endless, colocación, Guardar y salir, continuar, recargar, deshacer limitado, cerrar y recuperar una recompensa pendiente, reclamar una reliquia y avanzar a ronda 2. Estado mecánico y cursor comparados antes/después. Un segundo perfil cargó el mismo checkpoint de recompensa y produjo exactamente el mismo siguiente estado y RNG. También se comprobó cancelar reemplazo, principal corrupto con recuperación, cuota simulada, recuperación de escritura y eliminación al finalizar. Sin errores de consola ni `pageerror` en ese flujo.
- Once **fixtures preparados**, con catálogos/componentes reales, recuperados desde la portada de producción: poderes preparados, tienda, mapa con interludio, evento con elección, santuario, presentación de jefe, fase de jefe con siete fichas y presión coherente, recompensa de jefe, eliminación, duplicación y conversión pendientes. Igualdad completa de estados/RNG después de montar y autoguardar. Sin `pageerror` ni desbordamiento horizontal, alternando 390/1280 px. No equivalen a llegar naturalmente a todos esos estados ni a resolver cada elección.
- RoundTransition aislado en StrictMode: ronda normal y jefe completan una vez pese a callbacks cambiantes; desmontar durante la salida no ejecuta el callback; movimiento reducido completa sin espera visible. Sin `pageerror`.
- Controles y capturas en español a 1440, 390 y 320 px, sin desbordamiento horizontal. Se inspeccionaron visualmente portada y mesa móvil en reposo. No se certifica toda la accesibilidad ni el rendimiento de móviles físicos.

Los servidores locales 5176 (producción) y 5178 (QA) ya estaban activos y se reutilizaron. Pruebas mediante Playwright existente y Chrome con perfiles temporales, sin tocar guardados personales ni instalar paquetes. El primer lanzamiento de Chrome dentro del sandbox no pudo acceder a localhost; funcionó con la ejecución local autorizada.

## Archivos principales

Motor: nuevos `src/engine/runCheckpoint.ts`, `runCheckpoint.test.ts`; cambios en `rng.ts`, `saveSync.ts`, `daily.ts`, `weekly.ts`. UI: `App.tsx`, `GameBoard.tsx`, `HomeScreen.tsx`, `RoundTransition.tsx`, `i18n.ts`. Documentación: README, auditoría y este informe.

QA: `runContinuity.browser.mjs`, `runCheckpointFixtures.ts`, `runCheckpointFixtures.browser.mjs`, `runContinuityScreens.browser.mjs`, `roundTransition.html`, `roundTransition.tsx`, `roundTransition.browser.mjs`; marcadores de inyección de `qa/vite.config.mjs` adaptados al inicializador recuperable. Los fixtures no forman parte de la entrada/build de producción.

Evidencias en `outputs/dominix-review/` del workspace:

- `continuidad-verificacion-2026-11-14.json`: diez comprobaciones del flujo real.
- `continuidad-fixtures-verificacion-2026-11-14.json`: once estados preparados, anchos y resultados.
- `transiciones-verificacion-2026-11-14.json`: cuatro modos de temporizador.
- `continuar-portada-es-2026-11-14.jpg`, `continuidad-es-{1440,390,320}-2026-11-14.jpg`: UI final en español.
- `continuidad-{prepared-effects,boss-phase,event-choice}-2026-11-14.jpg`: estados preparados, no campañas naturales.
- `continuidad-fixture-2026-11-14.json`: checkpoint de la partida de prueba usado como base de los fixtures, sin datos personales.

## Pendientes y siguiente paso

No se han verificado PWA instalada/offline, cierre forzoso del navegador, conflictos de escrituras entre dos pestañas, campañas largas ni todos los efectos en StrictMode de desarrollo. La protección del inicio de ronda no constituye una prueba de pureza de todos los actualizadores React con RNG. El esquema actual rechaza reglas futuras/desconocidas y conserva el progreso; una futura modificación de reglas exige diseñar su migración de runs o declarar su incompatibilidad.

La recuperación puede retroceder una generación; es una decisión explícita comunicada al jugador. No hay nube ni varias ranuras, indicador histórico de retos caducados o reinicio exacto de animaciones. No se ampliaron colecciones de skins en esta entrega.

Siguiente paso recomendado: verificar la PWA instalada y conflictos entre pestañas, antes de ampliar la campaña o nuevas mecánicas.
