# La Banda del Doble: primera skin de personajes equipable

Entrega posterior: [Chatarra de Lujo, visor de ambas colecciones y 37 emblemas propios](CHARACTER_COLLECTIONS_2026-11-09.md), con 184 pruebas. Este documento conserva las evidencias de la integración inicial de La Banda.

9 de noviembre de 2026. Rama `codex/dominix-stability-polish`, base `f2a8677d54ffdfa9c97cb55db0f12081c1369db2`. Cambios locales sin publicar. Continúa la [dirección artística y procedencia del concepto](ART_DIRECTION_2026-11-09.md), conservando la portada, tipografía, paleta y disposición originales.

## Resultado y alcance

La colección aprobada ya está registrada como `banda_doble`, disponible gratuitamente desde el inicio en **Colección → Skins** y en el selector de inicio. Siete retratos representan los valores 0–6; los números permanecen en HTML y no requieren reconocer al personaje. Es cosmética: no concede oro, XP, reliquias ni ventajas. No cambia los identificadores antiguos ni fuerza una selección. El perfil de prueba mostró 3/17 skins disponibles con su nivel previo.

Las fichas mantienen sus dimensiones, señales de conexión, estados de selección y descarte. El pack conserva retratos en comodines, doradas, espejos, bombas y bloqueadas, con señales de tipo encima. Espejo y bomba reciben etiquetas visibles; ediciones y pacto conservan sus indicadores. Los valores quedan cerca del separador para no coincidir con el pie de edición. Los números son de 10 px en ficha pequeña y 12 px en mediana para este pack.

Dos problemas adicionales demostrados por lectura del código y protegidos con regresiones: las miniaturas de Colección anidaban botones dentro de botones; ahora usan una vista estática accesible. Un identificador de skin desconocido podía activar el tratamiento ilustrado de la skin por defecto y ocultar sus puntos; ahora recupera la ficha clásica legible. No hubo migración ni cambio de clave de guardado (`dominix_active_skin`).

## Recurso real y procedencia

Se reutilizó la lámina aprobada, creada con **ImageGen integrado**, sin generaciones adicionales ni consumo nuevo de créditos de Higgsfield. El prompt original sigue en `docs/art/banda-del-doble-v1.prompt.txt`. No se afirma exclusividad ni una licencia adicional sobre la salida generada. Los iconos de biblioteca conservan sus atribuciones previas.

`src/assets/skins/banda-doble-portraits-v1.webp` es un atlas RGB de **672 × 96**, siete cuadros de 96 × 96, paleta de 128 colores y WebP sin pérdida de **36594 bytes**. Los recortes y la reducción mediante vecino más cercano son preparación mecánica, sin redibujo. No es una nueva lámina generada ni siete sprites redibujados individualmente. Los números y nombres no están incrustados en la imagen.

`tools/prepare_banda_atlas.py` reproduce la exportación con Pillow. El JSON contiguo documenta hash SHA-256 de la fuente, recortes y hashes de los siete cuadros distintos. La fuente exacta es `outputs/dominix-review/banda-del-doble-concept-v1.png` del workspace (1254 × 1254); el WebP documental no sustituye esa fuente para reproducir el atlas. La lámina de 243326 bytes queda en documentación y no se importa desde producto ni QA. Solo el atlas pequeño entra en la build.

## Pruebas automatizadas

- **171 pruebas en diez archivos**, todas correctas; incluye 19 regresiones nuevas del pack: disponibilidad sin ventajas, conservación de selección, valores 0–6, seis tipos en dos tamaños, cuatro ediciones con pacto, miniatura estática, compatibilidad de skins antiguas y recuperación de ID desconocido.
- Lint, TypeScript de producción, TypeScript QA y compilación correctos. Sin dependencias nuevas ni cambios al lockfile.
- Build: JS principal 462,21 kB / 124,38 kB gzip; CSS 125,17 kB / 19,39 kB gzip. Atlas separado de 36,59 kB. Permanece el aviso previo de Browserslist.

Estas pruebas verifican contratos y presentación renderizada; no certifican por sí solas legibilidad visual, balance ni rendimiento en un teléfono físico.

## Verificación real en navegador

Producción local `http://127.0.0.1:5176/`: se equipó el pack desde Colección, se volvió al inicio y se recargó para comprobar persistencia de la selección. Después se inició Endless con el Arquitecto, semilla **BQDK5D**.

1. Ronda 1: `1|2` dio 35; deshacer recuperó 0 puntos, 12 acciones y siete fichas. Repetir y conectar `1|1` a la izquierda y `2|4` a la derecha produjo 80, Cadena Simple y extremos 1/4. Robar consumió una acción y una ficha de la reserva sin alterar los 80; descartar `0|6` consumió una acción y un descarte. Cierre: pago 18, oro de 50 a 68 al continuar.
2. Ronda 2: dorada `2|2` con señal x2 produjo 45; deshacer recuperó el estado inicial. Se descartó pulsando su control con el puntero. `1|2` normal produjo 35; cierre y recompensa de 16, oro de 68 a 84. Es Endless: cerrar por debajo de la meta no valida una victoria normal.
3. Ronda 3 a **390 × 844**: siete fichas y catorce números explícitos; ancho del documento y desplazable de 386 px, sin desbordamiento horizontal. Colocar `1|6` produjo 35 y dejó seis fichas con conexiones legales. No se completó esta run ni se acreditaron nuevos XP o historial. La selección global se restauró a Clásica mediante el inicio; la pestaña de prueba conserva el pack en su partida activa. Las otras partidas abiertas se conservaron.

Consola de producción capturada sin avisos ni errores. La consola QA solo contiene el aviso informativo de Framer Motion por preferencia de movimiento reducido.

La galería **Iconos y skins** de `http://127.0.0.1:5178/qa/ui.html` utiliza ahora TileView real: siete valores en ambos tamaños, seis tipos y cuatro combinaciones de edición/pacto. Se inspeccionaron visualmente y se comprobó en el DOM que los pies de edición no intersectan los números y que los retratos comparten una URL de atlas. Estos son ejemplos artificiales de presentación, no partidas naturales con todos esos efectos.

## Evidencia guardada

Archivos en `outputs/dominix-review` del workspace:

- `banda-pack-fichas-reales.jpg`: galería del componente real y tipos especiales.
- `banda-pack-ediciones.jpg`: ediciones y pactos.
- `banda-pack-equipado-coleccion.jpg`: equipamiento en Colección de producción.
- `banda-pack-partida-real.jpg`: ronda 1, cadena y puntuación 80.
- `banda-pack-partida-movil.jpg`: partida real en ronda 3 a 390 × 844.
- `banda-pack-consola.json`: registros de consola separados de producción y QA.

## Archivos principales

`src/engine/bandaDobleArt.tsx`, `tileSkins.tsx`, `progression.ts`, `i18n.ts`, `i18nContent.ts`; `src/components/TileView.tsx`, `CollectionScreen.tsx`, `HomeScreen.tsx`, `BandaSkin.test.tsx`; atlas y metadatos en `src/assets/skins/`; exportador en `tools/`; galería en `qa/uiIdentity.tsx` y documentación enlazada.

## Pendientes y siguiente paso

Falta probar dispositivos físicos, medir FPS en hardware modesto y completar una run natural con el pack. La combinación exhaustiva de tipos, ediciones, talentos y jefes no queda acreditada por esta revisión. No se implementaron packs de invitados o nuevas colecciones. El siguiente paso lógico es una vista ampliada de los siete personajes dentro de la Colección, conservando su estructura; queda fuera de esta entrega.
