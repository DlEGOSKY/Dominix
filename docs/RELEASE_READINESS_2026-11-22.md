# Dominix · evaluación de salida 0.2.0

22 de noviembre de 2026, Europe/Berlin. Rama local `codex/dominix-stability-polish`; HEAD/base `f2a8677d54ffdfa9c97cb55db0f12081c1369db2`. Se comprobó con GitHub y `git ls-remote` que `main` seguía en ese commit. La web pública respondió 200 y sirve los recursos antiguos. No se ha hecho commit, push, merge, tag o despliegue en esta evaluación.

## Dictamen

**Apta para preparar y subir como actualización 0.2.0 del juego en desarrollo, tras corregir el bloqueo de liquidación reproducido en esta auditoría.** No se certifica una versión 1.0, una campaña completa o todos los navegadores/dispositivos. Las puertas locales pasan; todavía debe ejecutarse CI sobre el commit que se suba y comprobarse el despliegue real antes de anunciar la publicación.

Todo el trabajo posterior al commit base permanece local, incluidos numerosos archivos nuevos de arte, pruebas y motor. Subir solo el último diff de archivos ya seguidos omitiría recursos necesarios. Se preparan un paquete completo de fuente, otro con `dist/` y un manifiesto de archivos/huellas fuera del repositorio. `node_modules`, cachés Python, perfiles de pruebas, capturas y credenciales no forman parte de esos paquetes.

## Bloqueo reproducido y corregido

El rollback anterior vivía en memoria. Se pausó la entrega real justo después de escribir la XP y se provocó un cierre del proceso de un Chrome aislado mediante CDP `Browser.crash`, dando dos segundos al servicio de almacenamiento para persistir las escrituras ya efectuadas. Al abrir de nuevo:

| Momento | Partidas | Entradas de historial | XP | Run activa |
|---|---:|---:|---:|---|
| Antes de terminar | 0 | 0 | 0 | Sí |
| Tras el cierre, antes de la corrección | 1 | 1 | 15 | Sí |
| Reintento antes de la corrección | 2 | 2 | 30 | No |
| Recuperación corregida antes de confirmar la entrega | 0 | 0 | 0 | Sí |
| Reintento corregido | 1 | 1 | 15 | No |

La corrección añade `dominix_profile_settlement_v1`, un registro interno previo a las escrituras y un recibo de confirmación. Al arrancar bajo el bloqueo exclusivo de la app, una entrega incompleta restaura los valores anteriores antes de cargar `App`. Una entrega confirmada conserva sus resultados y evita que una copia antigua de IndexedDB resucite la run. El recibo solo se retira tras sincronizar el journal; si el almacenamiento opcional no está disponible, se conserva para un siguiente inicio.

`App` prepara los resultados y devuelve su revelado; `GameBoard` lo ejecuta después de confirmar el registro. Un fallo de confirmación no muestra una entrega exitosa. Si la recuperación no puede completarse, la app conserva el registro, ofrece Reintentar y no abre otra partida sobre un perfil parcial. El título mantiene su semántica de encabezado y el anuncio de estado.

Se mantienen los nombres/formato de las claves de progreso existentes, la versión 3 de las copias exportadas y la versión 1 del checkpoint. El registro interno no se exporta como progreso ni se acepta como dato importado. Restablecer datos elimina también esta metainformación. No se promete durabilidad ante fallo de disco, apagado del sistema o expulsión de todos los datos del sitio.

## Pruebas nuevas y resultados

Evidencia relativa a la raíz del espacio de trabajo: `outputs/dominix-review/release-readiness-2026-11-22/`. Todos los perfiles son temporales/preparados, no perfiles personales. Los perfiles de cierre forzado se guardan en el temporal del sistema para evitar bloqueos de OneDrive sobre los archivos de control de Chrome.

| Comprobación | Resultado y alcance |
|---|---|
| Antes de corregir | 478 pruebas en 28 archivos correctas; el cierre real demuestra el fallo que no cubrían |
| `npm test` final | **491 pruebas en 29 archivos**, todas correctas; 13 regresiones nuevas de la transacción |
| TypeScript, lint, TypeScript QA | Correctos |
| `GITHUB_PAGES=true npm run build` | Correcto; se comparan los **49 archivos** de `dist/` con los de la candidata probada: idénticos |
| Cierre del proceso durante liquidación | Tres cortes: después de XP, después de retirar el checkpoint y después de confirmar. Los dos primeros permiten reintentar una sola entrega; el último conserva la entrega y no ofrece una run terminada |
| Perfil completo después de retirar el checkpoint | Igual al anterior a la liquidación, incluidas maestría y desbloqueos, antes del reintento |
| Recuperación/errores controlados | **6 casos**: fallo del recibo y reintento, registro corrupto bloqueado, reintento seguro, restauración denegada y recuperación posterior sin reset |
| Cuota real llena | `QuotaExceededError` real; perfil/checkpoint conservados; reintento acredita una partida, un historial, XP y maestría una sola vez |
| Actualización publicada → candidata | **5 casos**, descritos más abajo; perfil conservado y continuación offline con el mismo estado/RNG |
| PWA en `/Dominix/` | **6 comprobaciones agrupadas**: instalabilidad, caché completa, exclusión/handoff entre pestañas, uso offline, recarga cancelada si no guarda y avisos/recompensas utilizables |

Las pasadas finales de navegador terminan sin excepciones de página o errores de consola de la candidata. Se registró un 404 al cargar los recursos de la **versión pública anterior**; no se atribuye a la candidata ni se oculta ese diagnóstico. La prueba de actualización no detecta respuestas fallidas de la candidata.

El `npm test` inicial con el pool de procesos pasaba las 491 pruebas, pero el cierre de un worker producía `EPERM` en Windows. Se configura `pool: "threads"` en Vitest; el comando habitual y el de CI usan ahora el mismo modo y terminan sin ese error. No se añadieron dependencias; los cambios del lockfile son solo las dos versiones raíz 0.1.0 → 0.2.0.

## Actualización desde la web publicada

`qa/releaseServer.mjs` sirve exclusivamente en localhost. En modo anterior usa los recursos reales de `https://dlegosky.github.io/Dominix/`; en modo candidata sirve el build local, manteniendo origen y ruta `/Dominix/` durante la prueba. No cambia GitHub Pages ni envía el perfil de prueba al servidor público.

Se prepara un perfil válido con estadísticas, historial, 350 XP/nivel 3, personaje, skin y preferencias. Primero carga la versión antigua. Después cambia al build candidato y se verifican todos esos valores sin modificarlos, caché bajo `/Dominix/`, 31 skins, distribución a 1280/390 px y recarga sin red. Una nueva run puede colocar, guardar, salir y continuar offline con estado y RNG iguales.

La caché PWA medida contiene **46 solicitudes / 2.060.303 bytes** en este perfil. Incluye pantallas aún no visitadas, fuentes locales e iconos de instalación; las comprobaciones de instalabilidad no devuelven errores. La notificación de actualización de la prueba PWA se inyecta expresamente para probar el bloqueo de recarga ante fallo de guardado; la transición desde los recursos publicados sí cambia el service worker real servido por el host de prueba.

La versión pública anterior carecía de autoguardado de partida activa. Se conserva su perfil persistido; no se reconstruye una partida antigua que solo estuviese en RAM. La prueba no se presenta como migración de ese estado inexistente.

## Qué entra en 0.2.0

[CHANGELOG.md](../CHANGELOG.md) reúne las correcciones de reglas/continuidad y las mejoras acumuladas de menú, práctica, explicador, recompensas, colección, materiales, movimiento y PWA. Conserva la identidad visual aprobada. No se anuncian ranking global, sincronización de nube o importación jugable de runs, que no están integrados.

La evidencia de las 204 comprobaciones visuales/de juego del 17/11 sigue documentada en [MATERIAL_EXPRESS_2026-11-17.md](MATERIAL_EXPRESS_2026-11-17.md). Son pruebas anteriores, no 204 casos ejecutados de nuevo en esta auditoría.

## Limitaciones que no se han cerrado

- Tirones en cadenas largas: muestras anteriores de 348 ms al resolver y 356 ms al colocar con CPU ×4. Son escenarios distintos; no se vuelve a medir rendimiento ni se promete que esta corrección lo resuelva.
- Sin campaña natural completa, Safari/Firefox, móvil físico, lector de pantalla real o pruebas de energía/GPU en esta evaluación.
- Tutorial contextual avanzado y revisión óptica de iconos de HUD pendientes.
- Importación de una run reproducible desconectada y ranking local. Las colecciones de franquicias no son colaboraciones oficiales; se conserva el registro de procedencia existente.
- Sin CI de GitHub ejecutada sobre estos cambios todavía: no existe un commit remoto de la candidata.

## Publicación y vuelta atrás

1. Revisar y confirmar **todos** los archivos de la candidata, incluidos fuentes, imágenes optimizadas, licencias, pruebas y workflows. Los ZIP son material de revisión; no hay que meterlos dentro del repositorio.
2. Subir la rama, ejecutar la comprobación de PR y revisar su resultado. El workflow nuevo comprueba lint, pruebas y build; el despliegue desde `main` repite esas puertas y usa `GITHUB_PAGES=true`.
3. Integrar el commit revisado en `main`. Ese push dispara el despliegue público de Pages; crear el tag/notas solo para el commit realmente publicado.
4. Comprobar la URL pública, la revisión del worker, arranque/colección, partida, guardar/continuar y recarga offline en un perfil temporal. Solo entonces marcar publicada esta candidata.

Si el despliegue falla antes de publicarse, se mantiene la versión anterior. Si hace falta revertir después, preparar un commit de reversión y volver a desplegar pasando las comprobaciones. La versión antigua no entiende los checkpoints nuevos: una reversión conserva las claves de perfil, pero no promete poder continuar una run 0.2.0 en código 0.1.0. No borrar datos del jugador ni caches de otros proyectos como mecanismo de vuelta atrás.

## Archivos de esta evaluación

`profileTransaction.ts` y sus pruebas; integración en `saveSync.ts`, `runCheckpoint.ts`, `AppAccess.tsx`, `App.tsx`, `GameBoard.tsx` y textos ES/EN. Versiones en `package.json`/lockfile; pool en `vite.config.ts`; cachés Python excluidas en `.gitignore`. Scripts nuevos `qa/releaseServer.mjs`, `releaseUpgrade.browser.mjs`, `terminalCrash.browser.mjs`, `settlementSafety.browser.mjs`; ajustes de los recorridos PWA/cuota existentes. README, changelog e informe de salida.

No se ha cambiado el arte ni el balance en esta auditoría. No hubo compras, generación de imágenes, instalación de plugins, publicación o comunicaciones a terceros.
