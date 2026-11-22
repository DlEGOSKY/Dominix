# Dominix · aplicación de prioridades

15 de noviembre de 2026. Rama `codex/dominix-stability-polish`; HEAD/base `f2a8677d54ffdfa9c97cb55db0f12081c1369db2`. Trabajo sobre el árbol local conservando los cambios anteriores. Sin commit, publicación, dependencias, compras o generación de imágenes. Se mantiene la identidad visual y las 30 skins.

## Hallazgos y correcciones

| Hallazgo | Evidencia | Corrección |
|---|---|---|
| 14 patrones anunciaban números distintos de los detectores | Lectura y corpus anterior al cambio | Los 31 detectores y el catálogo comparten bonos/multiplicadores; condiciones, orden y puntuación se conservan |
| Descripciones ES/EN enseñaban reglas distintas | Lectura y cadenas válidas/casos que deben rechazarse | Textos corregidos: alternancia doble/no doble, sumas 21/42/63, rachas no necesariamente contiguas, parejas, espejo, mínimos y extremos efectivos |
| Una decisión mostraba evento en producción y otra recompensa en StrictMode | Reproducido en navegador, paso 2 del replay inicial | Sorteos/repartos y cambios de otros estados salen de los actualizadores funcionales de `setGame`: recompensas, fases, tienda, mapa, consumibles, mutaciones, santuario e interludios |
| Se rechazaba el guardado tras derrotar al jefe | Reproducido durante el recorrido; persistía el estado de victoria anterior | El validador usa `bossRewardData` en esa pantalla sin exigir un `currentBoss` activo; rechaza una recompensa incompleta |
| Se retiraba la run antes de completar XP/historial/desbloqueos | Riesgo demostrado por código; fallo parcial inyectado y cuota real comprobados en el flujo corregido | Retiro después del éxito; rollback de claves conocidas ante una excepción y reintento con una sola liquidación. Comprobación de maestría, desafíos y personajes persistidos |
| El bloqueo de datos mostraba instrucciones sobre HTTPS | Reproducido con el ajuste real de cookies de Chrome | Mensaje específico para permitir los datos del sitio y reintentar; no inicia una run sin acceso al almacenamiento |
| Copia primaria reciente ausente tras matar Chrome | Observado en perfil aislado, 650 ms después de acción/autoguardado | Journal adicional en IndexedDB, con durabilidad estricta y recuperación bajo el bloqueo exclusivo antes de cargar el perfil |
| Partículas y foco forzaban layout durante el cierre | Trazas CDP con pilas de llamadas | `ResizeObserver`, foco tras pintado y medición de posiciones dependiente de cambios reales de mano/cadena |
| Se montaba un desglose oculto y se duplicaba el estallido grande | Lectura y perfil con 30 fichas | Desglose montado al abrirlo; la victoria conserva tarjeta, barra, sonido y partículas locales, evitando otra explosión de 20 partículas DOM |
| Endless mostraba una meta obligatoria que el motor no exige | Regla demostrada y cierre reproducido | Referencia opcional e instrucciones de cierre ES/EN, conservando las reglas actuales, también en sus encuentros con jefe |
| Descarte táctil de 24 px sobre la ficha | Lectura y medición geométrica | Botón separado bajo la ficha, al menos 44 × 44 px; contención horizontal de la mano |

La primera aserción del cierre forzado inspeccionaba la **primaria**, no la secundaria: no demuestra por sí sola pérdida total de todos los guardados previos. La prueba final compara una copia jugable completa y RNG. Las pruebas específicas del journal verifican además recuperación eliminando ambas copias locales.

## Patrones y reglas

`patternContract.test.ts` cubre los 31 patrones con cadenas conectadas positivas y casos cercanos negativos, premios anteriores, acumulación y traducciones. El corpus determinista de `qa/patternContract.mjs` incluye comodines, espejos, ambos extremos, hasta 30 fichas y ejemplos de los 31 patrones: **2.031 resultados completos idénticos** antes y después, con SHA-256:

`60ff6d129cd4d31ab9174b3ae98eb1f3dadd58e28318bc95f07b1c1a67b91015`

Cero discrepancias numéricas del catálogo en ese corpus. [PATTERN_SYSTEM.md](PATTERN_SYSTEM.md) refleja las condiciones vigentes. Avalancha y Crescendo siguen compartiendo condición y acumulándose: diferenciarlos requiere una decisión de balance, no se cambia silenciosamente.

## Persistencia

Se conserva el formato local, checksum y ruleset existente. El journal no sustituye una copia local válida, aunque tenga fecha anterior. Si falta una copia jugable, valida el journal y lo recupera como backup; preserva la primaria dañada para diagnóstico. La UI informa de la recuperación.

Las escrituras del journal se ordenan. Borrar registra las generaciones retiradas contra su resurrección desde disco; no elimina una run distinta. Importar actualiza la copia de recuperación y reset la retira. Si IndexedDB falla/no existe, permanece la vía local compatible. No se promete durabilidad universal.

El cierre definitivo captura las claves conocidas antes de contabilizar. Ante una excepción elimina primero claves creadas parcialmente, restaura valores anteriores y mantiene la mesa abierta. La cuota real confirma un reintento que registra una sola run/historial, 15 XP y 15 XP de personaje. No equivale a una transacción atómica si se mata el proceso en mitad de la liquidación.

## Rendimiento: mejora parcial

**La cifra anterior de ~70 ms no acredita latencia real:** se usó el timestamp entregado por `requestAnimationFrame`, que puede preceder al trabajo pesado del mismo fotograma. Los scripts ahora observan el control con `performance.now()`. Esa observación incluye espera del automatizador antes del clic, por lo que la comparación aislada usa el evento `click` y la primera operación `Paint` posterior del mismo hilo.

Tres muestras por configuración, Chrome de escritorio sin ventana, CPU ×4:

| Escenario | Mediana tarea click | Mediana hasta primera operación Paint | Mediana de p95 de intervalos de fotograma |
|---|---:|---:|---:|
| Cadena pequeña anterior | 254 ms | 277 ms | no se compara como latencia |
| Cadena pequeña entrega | 158 ms | 238 ms | 7,4 ms |
| QA 30 fichas con explosión duplicada | 252 ms | 340 ms | 83,3 ms |
| QA 30 fichas entrega | 248 ms | 344 ms | 7,6 ms |

Mejora la continuidad de la animación, pero **no se resuelve el pico inicial de la cadena grande**: tareas de hasta 348 ms, sin mejora de su mediana de Paint. No son FPS de teléfono, presentación del compositor ni un estudio estadístico del juego completo. Las consultas de accesibilidad de la automatización añaden trabajo fuera del clic. Falta perfil JS/React más fino y móvil físico. El wrapper de liquidación definitiva se añadió después de estas trazas; no se ejecuta al cerrar una cadena.

## Verificación

- **460 pruebas en 27 archivos**, todas correctas; lint, TypeScript de aplicación y QA, compilación de producción correctos. Persiste un aviso no bloqueante de Browserslist desactualizado; no se actualizan dependencias por esta tarea.
- Corpus: 2.031 cadenas, mismo hash de resultados, cobertura de 31 patrones y cero diferencias numéricas con el catálogo.
- Replay: **67 estados** iguales en producción/StrictMode hasta ronda 13 con recargas, eventos, reliquias, renovaciones y cuatro compras. Termina con inventario de 33 fichas, 18 reliquias, 12 combates registrados y dos jefes. Mapa: **18 estados** hasta el acto siguiente. Sirena: **11 estados**, tres fases y recarga tras cada acción; recompensa sin doble registro.
- Mapa/Sirena usan metas bajas y mano ampliada explícitas de QA: verifican transiciones, restricciones, score y persistencia; **no acreditan balance o una campaña normal completa**.
- Arranques nuevos de partida normal, Endless y reto diario: estado/RNG iguales entre producción y StrictMode, controlando la fuente de semilla en el harness. No cubre todos los personajes/legados/modificadores/días.
- Journal: **7 casos reales de IndexedDB**, recuperación sin copias locales, prioridad de guardado existente, orden de escritura/borrado, conservar una run distinta, importación antigua, reset y corrupción.
- Almacenamiento real: `QuotaExceededError`, ambas copias conservadas, salida fallida mantiene mesa; liberar espacio/reintentar guarda la acción. Bloqueo `SecurityError` con indicaciones y reintento seguro.
- Cierre forzado: se mata solo Chrome del perfil QA y su árbol tras 650 ms de autoguardado; al reabrir coinciden checkpoint completo y RNG, sin repetir jugada. Chrome personal intacto.
- Cuota en Terminar run: perfil/checkpoint conservados; al liberar espacio se liquida una sola vez y se retira la run después del éxito.
- Regresiones: **40** comprobaciones de acciones/teclado/offline; **21** de práctica guiada; **18** de resolución/transición; **16** de vuelo mano–mesa. Sin errores de ejecución capturados en las pasadas correctas.
- Claridad móvil: **8** comprobaciones ES/EN en 390 × 844, 320 × 568 y 844 × 390: descarte de 44 px sin tapar ficha, sin desbordamiento y desglose bajo demanda.

Una pasada con varias pruebas simultáneas detectó desbordamiento; no se reprodujo al repetirla sola. Se contiene horizontalmente la mano y se conserva la aserción, sin garantizar todos los dispositivos. El 504 de dependencias optimizadas era del servidor QA: se separan las cachés Vite QA/replay y la colocación completa pasa después.

## Evidencia y archivos

Directorio externo al repositorio: `outputs/dominix-review/priorities-implementation-2026-11-15/`. Incluye `performance-comparison.json`, trazas `trace-*.json`, corpus anterior/final, replays, pruebas de cuota/journal/cierre, capturas, WebM y huellas SHA-256.

Capturas: `endless-es-390.png`, `hand-es-390.png`, `storage-blocked.png`, `crash-resumed.png`, `terminal-quota.png`, `terminal-retry-success.png`, `round-delivery-small.png`. Los perfiles Chrome son exclusivamente QA.

Archivos principales: `App.tsx`, `GameBoard.tsx`, `patterns.ts`, `runCheckpoint.ts`, nuevo `runJournal.ts`, `saveSync.ts`, `AppAccess.tsx`, `ParticleEffect.tsx`, `ScoreReveal.tsx`, `ScoreBar.tsx`, `Hand.tsx`, `Chain.tsx`, `index.css`, textos ES/EN y regresiones. Las skins conservan su arte.

## Siguientes prioridades

1. Pico inicial de cadenas grandes, perfil JS/React y móvil físico.
2. Durabilidad del perfil completo y liquidación exactamente una vez ante cierre del proceso **durante** XP/historial; no confundirlo con reabrir una run ya autoguardada.
3. Más semillas, personajes, modificadores, todos los jefes, acciones avanzadas e interludios. El contrato de pureza no demuestra determinismo universal.
4. Tutorial contextual opcional de mapa/tienda/eventos/fases/sinergias y lector de pantalla real. La práctica básica permanece verificada.
5. Objetivo de descarte con puntero fino, compartir/importar runs y ranking local; después profundizar materiales y las ideas de observatorio, expreso y autómatas, conservando conteo e identidad.
