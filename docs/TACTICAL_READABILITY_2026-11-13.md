# Dominix · lectura de fichas y decisiones tácticas

Fecha: 13 de noviembre de 2026. Rama local `codex/dominix-stability-polish`; HEAD `f2a8677d54ffdfa9c97cb55db0f12081c1369db2`. Esta continuación y las anteriores siguen sin commit ni publicación.

Continúa [materiales e Imperium](MATERIALS_IMPERIUM_2026-11-10.md). Se conserva la UI original: paleta, tipografía, portada, mesa, proporciones de las fichas y catálogo de skins. La dirección de esta tanda es facilitar la lectura de las skins dentro de una partida y comparar decisiones sin depender del hover. No añade mecánicas ni modifica puntuación, inventario o guardados.

## Hallazgos y cambios

Todos los hallazgos siguientes están demostrados por lectura del código. Las comprobaciones automáticas indicadas abajo no sustituyen una reproducción interactiva en navegador.

| Hallazgo | Cambio y evidencia |
| --- | --- |
| Las fichas de cadena se renderizaban como botones deshabilitados, con una clase de opacidad reducida. La animación también fija opacidad en línea: no se da por reproducida una pérdida de contraste solo por encontrar esa clase. | La cadena utiliza `staticView`, con rol de imagen, sin botón deshabilitado ni clase de atenuación. Prueba de HTML renderizado, incluidos los numerales de Imperium. Contraste visual pendiente. |
| Mano y cadena duplicaban explicaciones; Bomba prometía «detonar efectos» aunque `calculateScore` aporta +15 a su base y exige conectar números. | `TileDetails.tsx` comparte nombres, efectos, edición y pacto entre mano y mesa. Prueba del texto junto a un resultado base de 25 y rechazo de conexión inválida por el motor. |
| El Pacto de la mano decía «dentro de patrón», y el Pacto por sí solo no activaba la ayuda de cadena. | Se explica el bono único al colocar, el bono por **patrón nuevo** y el de edición, con la excepción de Alineación Cósmica. Las fichas colocadas ofrecen consulta de teclado y descripción accesible, también sin tipo especial. Pruebas de descripción y premios de 200/300 del motor. |
| Las puntuaciones de ambos extremos aparecían en `title`, poco útil al tacto, y un callback ausente se presentaba como cero. | Cada botón de extremo muestra su delta y lo incluye en el nombre accesible. Deltas negativos conservan signo y color. Callback ausente/nulo omite el dato. No se presenta un cero inventado. |
| Ocultar la previsualización no evitaba calcular el delta principal. | Mano omite la consulta al callback cuando la preferencia está desactivada. Prueba con callback observado. El cálculo de GameBoard conserva el extremo predeterminado derecho cuando ambos son legales. |
| Entrada, salida y redistribución de mano/cadena y movimiento de ayudas seguían definidos con movimiento reducido. | Se omiten esas entradas/salidas y redistribuciones, se desactiva el crecimiento animado de conectores y se hace inmediato el tooltip. El brillo vuelve explícitamente a 1 tras un destello de patrón. Las pruebas de render inicial comprueban mano/cadena visibles, sin la transformación de entrada. No constituyen medición de animación en ejecución. |

Las ayudas nuevas se traducen a español e inglés. También precisan el comportamiento de Espejo cuando abre una cadena y el alcance de Dorada, Holo, Polychrome y Negative. Las ayudas de mesa respetan `showHints`. Los controles de extremo mantienen el acento dorado existente y pasan a 44 px de altura; no se ha comprobado todavía su ajuste en todas las anchuras ni su conformidad integral de accesibilidad.

## Verificación realizada

- `node node_modules/vitest/vitest.mjs run`: **227 pruebas correctas en 13 archivos**, incluidas 11 nuevas en `TacticalTiles.test.tsx`. Las pruebas de componentes usan render estático y callbacks observados; no simulan clics, foco real, lectores de pantalla ni animación en ejecución.
- `npm run lint`: correcto, sin diagnósticos.
- `npm run build`: correcto; incluye TypeScript de producción y Vite.
- `node node_modules/typescript/bin/tsc --project qa/tsconfig.json --noEmit`: correcto, incluida la nueva vista QA.
- `git diff --check`: sin errores de espacios. Aviso previo de conversión LF/CRLF en HomeScreen.
- Servidores locales arrancados: producción `http://127.0.0.1:5176/`; QA `http://127.0.0.1:5178/qa/ui.html?scene=tactical`. Respuesta HTTP 200 de ambas entradas y del módulo transformado `qa/uiTactical.tsx`. Esto verifica servicio y transformación, no ejecución del cliente.
- El primer intento de Vitest dentro del aislamiento falló al renombrar su caché temporal (EPERM), antes de ejecutar pruebas. La ejecución posterior autorizada fuera del aislamiento completó la suite.

Bundle principal: 486,21 kB / 137,40 kB gzip; CSS: 130,92 kB / 20,32 kB gzip. Frente a la tanda anterior, aproximadamente +0,33 kB gzip de JS y +0,05 kB de CSS. Son tamaños de compilación, no métricas de FPS o carga en dispositivo. Continúa el aviso de Browserslist desactualizado; no se actualizaron dependencias.

## Vista QA preparada y revisión pendiente

La pestaña **Mesa táctica** usa `Hand` y `Chain` del producto. Ofrece Clásica, Marfil, Esmeralda, Diamante, Imperium y Banda del Doble sobre un estado artificial: cadena con extremos 1/4, ficha para ambos extremos con Pacto/Foil, comodín, espejo, bomba, dorada/Negative, bloqueada y una ficha que no conecta. Colocar, descartar, restringir comodines y consultar deltas utiliza `playRoundTile`, `discardRoundTile`, `getLegalPlacements` y el contexto real de puntuación. Deshacer restaura un estado anterior de esta vista; no verifica el handler de deshacer de GameBoard. No escribe resultados ni progreso del jugador. No se incluye en la build de publicación.

En la primera entrega no estaban expuestas las herramientas de control del navegador integrado/Node REPL; la apertura del panel devolvió `queued`. No se atribuyó a esa primera entrega una inspección visual. Al solicitar después el usuario las capturas se comprobó una alternativa: **Playwright ya incluido en el runtime, con Chrome 157 headless y perfil temporal vacío**. No se instalaron dependencias ni se utilizaron sesiones o guardados personales. La verificación adicional que sigue sustituye el pendiente de capturas, sin acreditar el resto de pruebas manuales de la lista.

### Verificación adicional y capturas reales

- QA: 1280×900 y emulación móvil 390×844 con tacto, escala 1 y preferencia de movimiento reducido. Se inspeccionaron visualmente las imágenes. Ancho cliente y contenido coinciden en 1280 y 390 px, respectivamente. Los botones de extremo miden 36×44 px. La cabecera de revisión y sus controles son exclusivos del escenario QA.
- QA: la ficha 1|4 con Pacto/Foil anuncia +481 en ambos extremos. Un clic a la izquierda cambia 20→501; deshacer restaura 20. Se repitió a la derecha: 20→501 y deshacer→20. Ambos deltas coinciden en este caso; no se acredita aquí un caso interactivo con resultados distintos por extremo.
- Consola QA: ningún `pageerror`. Un mensaje 404 de `http://127.0.0.1:5178/favicon.ico` en escritorio; no corresponde a una textura del juego. La emulación móvil no produjo errores de consola. No se cambió el producto para ocultar ese aviso.
- Producción: navegación real Colección→Skins→Imperium→Equipar→Endless, omitiendo el tutorial mediante su botón. Partida natural dentro del perfil vacío, con la compilación de producción y sin fixtures. Tres colocaciones: 0|2, 0|3 y 2|5; deltas previstos +35/+10/+35 y marcadores 35/45/80. Nueve acciones restantes; no se cerró la ronda ni se completó la run. También se encontró durante otra tentativa una mano sin conexiones tras abrir con 0|0; se mostró el aviso de robar/mejorar/cerrar. El script inicial agotó su espera al buscar otra previsualización; eso no demuestra un fallo del juego y se corrigió la suposición del script.
- Capturas de producción a 1440×1000 y anchura móvil 390×844, esta última por cambio de viewport de la misma página. No equivalen a dispositivo físico. Sin errores `pageerror`/consola en la captura final. Ancho móvil 390=390, sin desbordamiento horizontal. Se esperó a la habilitación de Cerrar cadena y al cierre de ayudas antes de capturar.
- Scripts/evidencia en `outputs/dominix-review/`, fuera del repositorio: `capture-tactical-2026-11-13.mjs`, `inspect-production-2026-11-13.mjs`, `capturas-mesa-2026-11-13.json` y `partida-captura-2026-11-13.json`.
- Imágenes: `mesa-tactica-escritorio-2026-11-13.jpg`, `mesa-tactica-movil-2026-11-13.jpg` (QA); `imperium-partida-escritorio-2026-11-13.jpg`, `imperium-partida-movil-2026-11-13.jpg` (partida natural). Son capturas directas del navegador, sin retoque ni composición.

La suite sigue siendo la anterior de 227 pruebas; esta continuación de capturas solo modifica documentación y scripts de evidencia externos. No se presenta como nueva ejecución de la suite. Siguen pendientes foco/Escape/lector de pantalla, deltas negativos interactivos, movimiento con preferencia normal, todas las skins y rendimiento de dispositivo físico.

Revisión manual preparada para 390×844, escritorio y horizontal:

1. Comparar ambos deltas de 1|4 con el cambio real de puntuación al jugar; deshacer y probar el otro extremo.
2. Revisar Imperium y Diamante en mano y cadena; confirmar números, tipo, edición y pacto sin recortes.
3. Activar «sin comodín»: ayuda de bloqueo por jefe; revisar bloqueo normal, falta de conexión y liberación por patrón.
4. Desactivar previsualización y ayudas: ausencia de números previstos y de paradas de foco para consultar la cadena.
5. Recorrer por teclado las fichas colocadas, abrir ayudas y cerrarlas con Escape. Comprobar lectores de pantalla y límites de pantalla del tooltip.
6. Activar movimiento reducido: colocar, descartar, deshacer y abrir ayudas. Revisar consola, posibles saltos y rendimiento en dispositivo modesto.
7. Repetir los flujos en el GameBoard de producción, donde intervienen todos los efectos, jefes y cierre de ronda. El escenario QA no acredita ese flujo completo.

## Recursos y archivos

No se generaron ni compraron imágenes nuevas, no se consumieron créditos de Higgsfield y no se instalaron dependencias/plugins. Se reutilizan las texturas y atlas anteriores, cuya procedencia permanece en [ASSET_PROVENANCE.md](ASSET_PROVENANCE.md).

Archivos de producto: `src/components/Hand.tsx`, `Chain.tsx`, `TileView.tsx`, `Tooltip.tsx`, nuevo `TileDetails.tsx`, `src/engine/i18n.ts` y `src/index.css`. Pruebas: nuevo `src/components/TacticalTiles.test.tsx`. Revisión: nuevo `qa/uiTactical.tsx`, `qa/ui.tsx`, `qa/README.md`, README e índice de auditoría.

Siguiente paso: completar la revisión de foco, ayudas y estados de edición sobre esta evidencia, y después decidir la próxima colección de skins. Siguen pendientes las limitaciones generales anteriores: reanudación de partida, traducción completa, accesibilidad integral, PWA instalada/offline y balance de runs prolongadas. No se vuelven a declarar resueltas aquí.
