# Colocación mano–mesa y revisión artística · 15 de noviembre de 2026

Continuación posterior: [Among Us: ilustración nueva y contacto](AMONG_ENAMEL_CONTACT_2026-11-15.md). Sustituye el ensayo de placa de esta etapa, conserva el recorrido y añade sonido/impacto en la llegada. Incluye generación real de Higgsfield, comparación con la ruta integrada y 331 pruebas. Las evidencias de este informe se mantienen como histórico.

Rama `codex/dominix-stability-polish`; base `f2a8677d54ffdfa9c97cb55db0f12081c1369db2`. Continuación local, sin commit, publicación o cambios de guardados. Responde a dos observaciones del usuario: Among Us perdió calidad visual y faltaba el recorrido de la ficha desde la mano hasta la mesa.

## Diagnóstico

| Hallazgo | Evidencia y clasificación | Trabajo realizado |
| --- | --- | --- |
| La colocación no tenía continuidad espacial. | Lectura demostrada del código: Hand aplicaba salida con opacidad/escala/desplazamiento y Chain montaba una ficha con un rebote local. No había medición ni movimiento entre ambas posiciones. | Recorrido desde la geometría real de la ficha de mano hasta la ficha real de destino. |
| Los iconos SVG pequeños de Among Us perdieron el carácter del arte anterior. | Valoración artística explícita del usuario y revisión a tamaño real; no es un error mecánico. | Retirar los seis dibujos simplificados de tripulantes y probar una placa ilustrada. |
| Repetir símbolos y añadir un fondo tenue no resuelve por sí solo una skin coleccionable. | Interpretación de diseño de esta revisión, pendiente de validación con el usuario. | Dar espacio separado al retrato, al material y al registro numérico, usando Roma como referencia aprobada. |
| Deshacer durante un vuelo podía dejar su copia visual. | Error reproducido durante el desarrollo de esta animación. AnimatePresence retenía temporalmente la ficha retirada en el DOM. | Comprobar los IDs que realmente siguen en la cadena; cancelar el vuelo inmediatamente al deshacer. Regresión de navegador. |

La diferencia de calidad de las skins sigue siendo un problema artístico abierto. Este ensayo no acredita que la colección de Among Us esté aprobada. No se generan más colecciones en esta entrega.

## Colocación implementada

El controlador captura la geometría y la apariencia de la ficha después de validar la jugada. El motor coloca y puntúa inmediatamente. Tras el render, se mide la nueva posición de la cadena y se anima una copia visual, fuera de los contenedores que recortan la mesa. Es una capa inerte, oculta a accesibilidad y sin eventos de puntero; conserva ilustración, material, tipo y edición del aspecto de origen.

El recorrido dura **380 ms**, o **180 ms** con animaciones rápidas. Usa traslación/escala y una elevación breve, sin rotaciones fuertes ni bloqueos de entrada. La ficha de destino permanece reservada en el layout y oculta visualmente durante el vuelo; al llegar se revela y comienza el feedback de colocación existente. Se evita el rebote de montaje anterior que competía con el trayecto. El resto de fichas conserva su reordenación.

Se mantiene como máximo **una copia en vuelo**: una jugada nueva asienta la anterior. Deshacer, cambiar tamaño, desplazar la página, desmontar el tablero o activar movimiento reducido limpian la copia y revelan el destino. El controlador comprueba el estado real de la cadena, además de buscar los nodos de presentación. El fallo de la API de animación también revela el destino sin condicionar la jugada. El fallback sin API se prueba aisladamente: no supone compatibilidad global de Framer Motion con navegadores antiguos.

Respeta tanto la opción de movimiento reducido del juego como `prefers-reduced-motion`: en esos casos coloca directamente. El recorrido es efímero; no entra en el checkpoint, no modifica el RNG y no se reproduce al continuar una partida. No se añaden temporizadores de puntuación, restricciones tácticas o cambios en acciones/Deshacer.

## Ensayo de Among Us

Se reutiliza cada retrato real del atlas existente, grande y único por valor, dentro de una placa oscura con borde, sombras interiores y un registro inferior separado. El acabado de metal se construye en CSS; **no es una nueva textura raster generada**. El registro tiene exactamente 1–6 marcas luminosas; el cero conserva su fantasma con registro vacío. Los nombres ES/EN y las ayudas explican que la cantidad está en las marcas, sin atribuir un rango o poder al personaje.

Se retiran los seis SVG simplificados de `collectionValueMarks.tsx`; ese módulo conserva las máscaras existentes de Hollow Knight. **Las 21 caras exportadas de Roma, Hollow Knight y One Piece coinciden byte a byte con las exportaciones v3**, bajo el mismo navegador/condiciones. No se modifica su arte. Los atlas originales siguen sumando 201.546 bytes, sin nuevas imágenes, dependencias o consumo de créditos.

Este ensayo cambia la composición de Among Us y permite revisar el material/retrato a tamaño de mano. Las marcas pequeñas tienen un mínimo visual cercano a 3 px en la cara de 36 px; queda pendiente comparar su reconocimiento con las formaciones tradicionales de dominó y con jugadores nuevos. No se afirma una mejora artística aprobada por el usuario.

## Pruebas y evidencias

- **321 pruebas correctas en 20 archivos**. Se adapta la regresión de Among Us a un retrato por mitad y cantidades separadas, conservando ceros, nombres ES/EN, fichas mixtas y tipos especiales.
- Lint, TypeScript/compilación de producción, TypeScript QA y `git diff --check`: correctos. Se corrige también el uso de `String.replaceAll` en una prueba anterior, incompatible con el target TypeScript actual; se mantiene el target. Sigue el aviso previo de Browserslist antiguo.
- Regresión de navegador `tileFlight.browser.mjs`: **12 comprobaciones**. Geometría de salida, punto intermedio y llegada con tolerancia de 1,5 px; estado actualizado mientras la animación está pausada; dos jugadas rápidas con una copia máxima; Deshacer durante el recorrido; extremos izquierdo/derecho en una cadena sintética de 28–30 fichas; resize, scroll, desmontaje, movimiento reducido del juego/sistema, modo rápido, API ausente en prueba aislada, fallo de animación y clip a velocidad normal.
- En la prueba geométrica se pausa la animación deliberadamente; esas capturas no prueban el timing por sí solas. El clip `colocacion-mano-mesa.webm` registra tres colocaciones sin pausa en el escenario QA de componentes reales, sin progresión/recompensas. No se presenta como una run natural.
- **Producción local 5176**: una colocación real por teclado con Among Us. La ficha en vuelo tenía la skin correcta; mesa, mano y estadísticas se actualizaron antes de terminar el vuelo. Se guardó, salió, recargó y continuó offline; estado y cursor RNG conservados, sin repetir el vuelo. Las capturas de esa partida están separadas de las QA.
- Galería de caras: 336 mitades inspeccionadas a 1440/390/320 px, conteos, geometría sin ayudas y referencias correctas; 384 inspecciones de especiales/ediciones/Pacto sin indicadores sobre los símbolos. Exportadas 28 caras de 128×128: 441.668 bytes, material de revisión fuera del producto.
- Cero errores de consola/pageerror en los flujos finales descritos. Durante el desarrollo, una prueba que anulaba la API en un botón React interfería con Framer Motion; se sustituyó por una prueba aislada del controlador. También se corrigió la espera del checkpoint en el harness para respetar su escritura posterior al render.

Se reutilizan Chrome, Playwright y los servidores 5176/5178 con perfiles temporales, conservando los datos personales. Para grabar el clip faltaba el ejecutable de FFmpeg de Playwright: se descargó desde su CDN oficial (FFmpeg v1011 y Winldd v1007) en `outputs/dominix-review/qa-tools/browsers/`, sin modificar package.json, lockfile o ajustes globales. La captura usa ese directorio explícitamente.

Build final: entrada 55,51 kB / 18,01 gzip; App 480,33 / 135,85; Colección 26,38 / 8,85; CSS 137,16 / 21,35. No se mide FPS, consumo de memoria o rendimiento en un móvil físico. Tampoco una campaña completa, todas las skins/tipos bajo sacudidas de jefes o todas las transiciones de fin de ronda. El guardado puede actualizarse antes de que termine el feedback visual, de forma intencionada.

## Archivos principales

- Nuevos: `src/engine/tileFlight.ts`, `src/hooks/useTileFlight.ts`, `src/engine/crewBadgeFace.tsx`.
- Integración: `GameBoard.tsx`, `Chain.tsx`, `TileView.tsx`, `index.css`. Hand se conserva y se identifica su ficha por el nuevo atributo del propio TileView.
- Arte/texto: `numericCollectionFaces.tsx`, `collectionValueMarks.tsx`, `skinCharacters.ts`, `tileSkins.tsx`, `i18n.ts`, `i18nContent.ts`.
- Regresión: `NumericCollectionFaces.test.tsx`, `CollectionPacks.test.tsx`; nuevos `qa/tileFlight.html`, `tileFlight.tsx`, `tileFlight.browser.mjs`, `placementRun.browser.mjs`; actualización de la galería/exportador numéricos.

Evidencias nuevas en `outputs/dominix-review/tile-placement-2026-11-15/`: clip, capturas `colocacion-trayecto-{escritorio,movil}.jpg`, `colocacion-partida-real-trayecto.jpg`, `among-us-placa-partida-real.jpg`, `among-us-placa-tamanos-reales.jpg`, exportaciones v4 y JSON de colocación, partida, geometría y comparación del arte conservado. Los nombres heredados de la galería contienen la fecha 2026-11-14; la carpeta y este informe identifican la nueva revisión del día 15. No se sobrescriben los paquetes v2/v3 anteriores.

Siguiente paso lógico: revisar el ensayo de placa a tamaño real antes de producir más arte. Después, afinar la relación entre llegada, sonido y feedback de puntuación; el cálculo y el guardado deben continuar independientes de los efectos.
