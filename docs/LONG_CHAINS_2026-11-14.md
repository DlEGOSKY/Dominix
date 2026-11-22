# Dominix · cadenas largas y activaciones consecutivas

14 de noviembre de 2026, Europe/Berlin. Rama local `codex/dominix-stability-polish`, base `f2a8677d54ffdfa9c97cb55db0f12081c1369db2`. Continúa [acabados y colocación](MATERIAL_CRAFT_2026-11-14.md), conservando UI, materiales y reglas. Sin publicación ni modificación de guardados.

## Qué cambia

- Desde siete fichas se muestran posiciones discretas 1…N para seguir el orden al saltar de fila. La descripción accesible identifica posición, longitud y dirección de lectura.
- Las fichas primera y última tienen marcas pequeñas de extremo con el valor real expuesto. No se sustituyen sus números impresos: Espejo y Comodín pueden tener extremos distintos. Los valores expuestos también forman parte del nombre accesible del grupo.
- El destello de patrón pasa a escala máxima 1,04 y brillo 1,35, frente a 1,15/2,2. La duración es 360 ms con escalonado limitado a 120 ms: la última ficha termina en un máximo configurado de 480 ms, incluso con cadenas largas. Antes, 28 fichas podían acumular 1,35 s de demora más 550 ms de animación.
- **Fallo reproducido y corregido:** dos activaciones consecutivas del contador de patrón producían escalas máximas observadas 1,03988 y 1; la segunda no repetía el destello. La animación ahora se dispara mediante un efecto dependiente del contador y captura únicamente las fichas presentes en esa activación. No depende de volver a asignar los mismos valores a `animate`.
- Al cambiar de preferencia o desmontar, se detiene y restablece el efecto. Con movimiento reducido no se dispara. La entrada de ficha y el pulso de colocación siguen siendo independientes.

No se añade otra mecánica ni una nueva forma de puntuar. La posición es el orden visual de cadena, no el orden temporal de colocación.

## Verificación

**248 pruebas correctas, 15 archivos.** Tres regresiones nuevas: orden de una cadena de 28 fichas, extremos de Espejo frente a valores impresos y traducción/ausencia de índices en cadena corta. La ejecución con procesos completó las 248 pruebas pero avisó de EPERM/timeout al cerrar un worker de balance; la repetición `--pool=threads --maxWorkers=2` completó las 248 sin ese aviso.

Lint, compilación de producción, TypeScript de QA y `git diff --check` correctos. Sigue el aviso anterior de LF/CRLF en HomeScreen y Browserslist antiguo. Build: índice 494,08 kB / 139,75 kB gzip, Framer Motion 127,52 kB / 42,66 kB gzip, CSS 132,31 kB / 20,66 kB gzip. `useAnimate` utiliza la dependencia existente; no se instaló otra. No se midieron FPS ni memoria en dispositivos modestos.

El escenario independiente `qa/longChain.html` usa Chain y placeTile reales sobre un set artificial repetido de 28 fichas normales, sin build, economía o guardados. Permite añadir por ambos lados, restaurar historial y activar patrones de muestra. Estos botones de patrón no son detecciones naturales de patrones; su finalidad es verificar el contador visual.

Navegador aislado:

- 28→29 por izquierda, extremo izquierdo 6; 29→30 por derecha, extremo derecho 6. Dos deshacer QA restauran exactamente el texto inicial de cantidad, extremos y puntuación de cadena. No acredita el handler de deshacer de GameBoard.
- Dos activaciones de patrón corregidas: escala observada 1,04 en ambas; después del margen de comprobación de 600 ms todas las fichas están a escala 1. Con movimiento reducido, ambas activaciones permanecen a escala 1. No hubo excepciones `pageerror` registradas.
- Capturas a 1280 px y 390×844, inspeccionando la imagen móvil y su orden completo 1–28. Sin desbordamiento horizontal en móvil. La cadena larga requiere desplazamiento vertical; no se reduce el tamaño de las fichas para encajar todo en una pantalla.

Se usó Playwright ya instalado con Chrome y perfiles vacíos. La consola completa no se recopila en este script; no se declara libre de todos los avisos. El intento de arrancar otro servidor detectó que 5178 ya estaba ocupado y se reutilizó el servidor de revisión existente.

## Archivos y capturas

Producto: `src/components/Chain.tsx`, `src/index.css`, `src/engine/i18n.ts`. Pruebas: nuevo `ChainReadability.test.tsx`. QA: nuevos `qa/longChain.html`, `qa/longChain.tsx`, `qa/longChain.browser.mjs`; el script recibe módulo Playwright, ejecutable Chrome y carpeta de salida, como los anteriores.

En `outputs/dominix-review/`: `cadena-larga-escritorio-2026-11-14.jpg`, `cadena-larga-movil-2026-11-14.jpg`, `cadena-larga-verificacion-2026-11-14.json` y el ejecutor externo `verify-long-chain-2026-11-14.mjs`. Son evidencias QA, no capturas de una run natural. No se generaron imágenes ni consumieron créditos.

## Pendiente

No se completó una partida natural con 28 fichas ni un jefe en esta tanda. Quedan las combinaciones completas de tipos/reliquias, posibles recortes de ayudas dentro de la mesa, lector de pantalla, dispositivos físicos y rendimiento sostenido. Los pendientes generales anteriores siguen vigentes.

Siguiente paso lógico: probar esta lectura en una run con build real y patrones sucesivos antes de ampliar el lenguaje de efectos a recompensas o nuevos sonidos.
