# Among Us: arte nuevo y contacto de colocación · 15 de noviembre de 2026

Rama `codex/dominix-stability-polish`, base `f2a8677d54ffdfa9c97cb55db0f12081c1369db2`. Cambios locales, sin publicación o migración. Continúa la valoración del usuario: Among Us aún no transmitía la identidad buscada; el recorrido mano–mesa gustó y se pidió más calidad de arte y movimiento usando las herramientas disponibles.

## Dirección y recursos reales

Las últimas pasadas habían reutilizado un atlas y aplicado SVG/CSS. No habían generado arte nuevo en Higgsfield. Se reconoció esa limitación y se produjeron dos propuestas ilustradas nuevas, diseñadas para la cara de la ficha, con espacio reservado para puntos exactos dibujados por código.

| Propuesta | Herramienta / resultado | Preparación y destino |
| --- | --- | --- |
| Metal de nave | Higgsfield, `nano_banana_2_1`, 2K, `thinking_level: high`; trabajo `b91b1edb-61d5-4e02-8c77-b68ad1267f25`, completado | PNG 2048×2048, 5.518.303 bytes; atlas 896×128, 28.512 bytes en `qa/assets/among-salvage-nano-v1.webp`. Comparación, excluida del producto. |
| Traje de esmalte | ImageGen integrado, una generación completada; la herramienta no identifica un modelo comercial | PNG 1254×1254, 1.890.845 bytes; atlas 896×128, **40.766 bytes**, integrado como `src/assets/skins/among-suit-enamel-v2.webp`. |

Higgsfield devolvió saldo **6 créditos**, plan free y prueba vencida el 11 de noviembre. Se cotizaron GPT Image 2.6 high/2K (2,75) y Nano Banana 2.1 2K/high (2). El primer envío fue rechazado con **«Requires basic plan or higher.»**, sin ID de trabajo. Nano sí se ejecutó. Tras completarlo se volvió a consultar el saldo: **4 créditos**. El consumo confirmado de esta entrega es **2 créditos**, sin compra ni cambio de plan. Los usos gratuitos devueltos corresponden a otros flujos, no a una concesión general de imágenes.

Al revisar Nano se encontró una composición dominada por el marco gris. Se elaboró una segunda dirección en el generador integrado: el traje y el visor ocupan la propia cara, con esmalte saturado, desgaste y reflejos amplios. Se eligió provisionalmente esa versión por aprovechar mejor los 36 px y diferenciar las siluetas/colores; la aprobación artística del usuario sigue pendiente. Se conserva la salida real de Higgsfield para comparar. **Los prompts difieren: se comparan direcciones y rutas, no es un benchmark de modelos con encargo idéntico.**

Ambas fuentes usan cuadrícula 3×3; se extraen las siete primeras celdas. Las dos sobrantes se ignoran, aunque Nano también dibujó marcos en ellas. `prepare_collection_atlases.mjs` admite ahora suavizado de alta calidad opcional para ilustración pintada; su valor por defecto conserva la reducción por vecino más próximo de los atlas anteriores. Codificación WebP con pérdida, calidad 0,96. Los originales permanecen archivados fuera del producto y no se sobrescriben las fuentes anteriores.

La versión integrada llena la mitad de la ficha con el traje, sin la placa interna de la iteración anterior. Los puntos marfil se colocan en formaciones de dos filas en la zona inferior; no forman una barra de progreso. Cada valor tiene exactamente 0–6 puntos y un personaje/motivo diferente. El cero usa una hendidura vacía. Las cantidades siguen siendo UI y valores del motor, nunca números pintados por la IA. Se actualizan nombres y ayudas ES/EN. Los tipos, ediciones, Pacto y ayudas centrales mantienen sus posiciones.

El atlas sustituye la referencia de Among Us anterior: pasa de 40.186 a 40.766 bytes (**+580 bytes** de imagen de producto). El archivo anterior se conserva como histórico y no se importa en la compilación final. Nano y sus fuentes grandes no aparecen en `dist`. Las **21 caras de Roma, Hollow Knight y One Piece coinciden byte a byte** con las exportaciones v3, bajo las mismas condiciones de Chrome. No se rediseñan las otras pantallas.

Prompts: [Higgsfield](art/among-salvage-v1.prompt.txt) y [generador integrado](art/among-suit-enamel-v2.prompt.txt). Son interpretaciones generadas de Among Us para este proyecto local, no sprites oficiales o una colaboración confirmada. No se afirma cesión de derechos sobre los personajes ni exclusividad de la salida.

## Llegada, sonido y conexión

Se verificó un desfase en la implementación anterior: `TileView` disparaba `tile_place` al pulsar, antes del recorrido; las flechas de extremo y el atajo numérico no usaban ese mismo camino de sonido. Ahora Hand suprime ese sonido temprano y el controlador confirma la llegada para todos esos caminos de entrada.

Al finalizar un vuelo válido se revela la ficha, se reproduce **un solo contacto** y se aplica una compresión vertical leve con recuperación (190 ms; 110 en modo rápido). La unión correcta pulsa durante 300/160 ms: a la izquierda se usa la unión de la ficha nueva; a la derecha, la de su vecina anterior. El resplandor de llegada se activa explícitamente, sin reproducirse por montar una cadena guardada.

El sonido combina un golpe seco y una resonancia breve sintetizados con Web Audio, con perfiles piedra, metal y cristal. Among Us y las skins mecánicas usan metal; las gemas, cristal; el resto, piedra. Se respetan silencio y volumen, y se reutiliza un buffer corto de ruido determinista. No se usa el RNG de la run, no se crea o desbloquea AudioContext fuera de un gesto y no se añaden archivos de audio a la descarga del juego.

Los vuelos cancelados por Deshacer, nueva jugada, scroll, resize o desmontaje no emiten una llegada tardía. Si no hay animación o se usa movimiento reducido, se confirma directamente con sonido, sin efecto espacial. Los efectos terminados se limpian; una nueva colocación cancela el contacto anterior. El recorrido conserva los 380/180 ms y la partida sigue actualizándose inmediatamente, con controles disponibles.

El cálculo, estadísticas, guardado y cursor RNG no dependen de estas animaciones. La actividad de patrones y sus sonidos siguen su secuencia anterior: esta entrega coordina contacto y conexión, no toda la coreografía del score, pactos o jefes.

## Verificación realizada

- **331 pruebas correctas en 21 archivos**, diez casos nuevos de material, confirmación con movimiento reducido, fallback sin API y ausencia de creación de contexto de audio. Se mantienen los conteos/ceros, referencias, tipos y guardados anteriores.
- TypeScript/compilación de producción, lint, TypeScript QA y `git diff --check`: correctos. Permanece el aviso previo de Browserslist antiguo. Sin dependencias nuevas.
- Chrome: **16 comprobaciones de colocación**, incluyendo cero sonidos antes de llegar, un contacto después, ausencia de sonidos de vuelos cancelados, unión correcta en ambos extremos y limpieza final de animaciones; además de trayectoria, Deshacer, rapidez, resize/scroll, desmontaje, movimiento reducido y fallback. Clip de tres colocaciones a velocidad normal en el escenario QA de componentes reales.
- Comparación artística a 1440/390 px: dos propuestas, siete valores, caras a 80/48/36 px y puntos exactos. La fila de fichas usa el TileView real. Sin desbordamiento horizontal o errores de consola en esas vistas.
- Galería táctica: 336 mitades a 1440/390/320, cantidades y límites sin ayudas; 384 inspecciones con especiales/ediciones/Pacto sin insignias sobre los puntos. Exportadas 28 caras de 128×128, 501.744 bytes de material de revisión, fuera del producto.
- Producción local: visor ES/EN a 1280/390; equipar, colocar, guardar/salir, recargar y continuar offline con las cuatro skins conservando estado y RNG. Prueba adicional por teclado con Among Us mientras el vuelo estaba pausado: la jugada ya estaba comprometida; tras continuar offline no se repitió el vuelo. Sin errores de consola/pageerror en los recorridos finales.
- Web Audio real en OfflineAudioContext: muestra de piedra/metal/cristal, 48 kHz, 1,3 s, WAV PCM mono de 16 bits. Picos 0,1344 / 0,1648 / 0,1625, sin clipping de la muestra; con silencio activado, pico **0**. Esto comprueba señal y silencio, no preferencias de escucha o latencia en altavoces físicos. El vídeo de Playwright no incluye audio; la muestra se entrega por separado.

La instrumentación inicial de sonido en QA importaba un módulo separado por la caché de desarrollo y no observaba las llamadas reales. Se movió al propio fixture, junto al audio utilizado por los componentes; no era un fallo de la llamada de llegada del producto.

Build: entrada 55,48 kB / 18,00 gzip; App 483,31 / 136,89; Colección 26,37 / 8,83; CSS 137,28 / 21,36, más recursos/chunks separados. No se acredita FPS, memoria o rendimiento en un móvil físico. Quedan pendientes reconocimiento con jugadores nuevos, gusto artístico del usuario y todas las combinaciones de pactos, patrones y jefes en una campaña prolongada.

## Archivos y continuidad

Arte: nuevo WebP de producto y WebP de QA; `collectionPortraits.tsx`, `crewBadgeFace.tsx`, `skinCharacters.ts`, `tileSkins.tsx`, `i18n.ts`, `i18nContent.ts`; dos prompts y preparación de atlas.

Contacto: nuevo `src/engine/tileArrival.ts` y su prueba; `tileFlight.ts`, `audio.ts`, `useTileFlight.ts`, `GameBoard.tsx`, `Hand.tsx`, `TileView.tsx`, `Chain.tsx`, `index.css`. QA: nuevos `amongArt.html/tsx/browser.mjs` y `contactAudio.browser.mjs`; extensión del fixture y regresión de colocación.

Evidencias en `outputs/dominix-review/among-salvage-2026-11-15/`: dos fuentes y catorce caras recortadas, `generation-receipt.json`, `atlas-report.json`, comparación en dos anchos, `among-trajes-esmalte-final.jpg`, capturas de producción, vídeo `colocacion-mano-mesa.webm`, muestra `contactos-piedra-metal-cristal.wav` y JSON de arte, audio, geometría, continuidad y colocación. Se conservan los paquetes anteriores.

Siguiente paso lógico: validar la dirección de Among Us a tamaño de mano real. Las siguientes mejoras de movimiento con mayor utilidad serían robo desde la reserva, descarte/deshacer con continuidad espacial y una onda de patrón limitada a sus fichas participantes. No están implementadas en esta entrega.
