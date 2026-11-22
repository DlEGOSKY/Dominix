# Identidad numérica de las cuatro colecciones · 14 de noviembre de 2026

Revisión posterior del usuario: [referencias distintas por valor](SKIN_REFERENCES_2026-11-14.md). Mantiene el conteo, varía roles/máscaras y retratos en las tres primeras colecciones, y conserva Roma Eterna. El presente informe y el ZIP v2 documentan la etapa anterior.

Rama `codex/dominix-stability-polish`, base `f2a8677d54ffdfa9c97cb55db0f12081c1369db2`. Corrección local del lote anterior a partir de la observación del usuario: el personaje elegido para cada valor no explicaba ese valor. Se conserva la interfaz azul/violeta/oro, las cuatro skins equipables y el catálogo de 25. Sin publicación, migraciones, dependencias nuevas ni cambios de reglas.

## Diagnóstico y criterio

| Hallazgo | Evidencia / clasificación | Resolución |
| --- | --- | --- |
| Un personaje diferente para cada 0–6 exigía memorizar una asociación arbitraria. | Problema de diseño señalado por el usuario y demostrado en el registro: el índice del retrato determinaba el valor. No es un fallo del cálculo de puntos. | Separar la composición numérica de las ilustraciones de invitados. |
| Las pruebas anteriores comprobaban etiquetas, siete cuadros y conservación de partidas. | Lectura de la cobertura: no acreditaban que el dibujo comunicara una cantidad. | Añadir regresiones de cantidades, ceros, numerales y geometría en navegador. |
| Los números auxiliares en esquinas podían cubrir el último símbolo de una composición contable. Las insignias superiores/inferiores también ocupaban espacio de sus mitades. | Solapamiento localizado al revisar las capturas de las fichas. Afectaba a la nueva composición. | Cinta central para las cuatro skins; liberar ambas mitades. En los selectores del visor, poner la etiqueta debajo del dibujo. |
| Jerarquizar personajes por fuerza, fama o posición de tripulación no garantiza una asociación numérica clara. | Decisión de diseño; no existe aquí un ranking canónico validado. | Unidades contables y numerales, sin atribuir rangos a los personajes. |

No se intenta resolverlo aumentando solamente el número auxiliar: el dibujo principal debe aportar una regla consistente. Repetir pequeños retratos complejos de todos los personajes introduciría ruido a 36 px. Se reutiliza el tripulante como unidad de silueta sencilla, y símbolos propios para las otras cantidades.

## Regla visual implementada

| Colección | Cero | Valores 1–6 | Personaje / ilustración |
| --- | --- | --- | --- |
| Among Us · Tripulación | Fantasma: ningún tripulante vivo | Exactamente 1–6 tripulantes rojos, en formaciones de dominó | Misma figura por unidad; los demás roles quedan en la galería. |
| Hollow Knight · Hallownest | Círculo vacío | Exactamente 1–6 luces de alma, SVG propio | Caballero tenue y fijo como motivo de fondo. No implica que Hornet sea un 2. |
| One Piece · Sombrero de Paja | Bolsa vacía | Exactamente 1–6 monedas, SVG propio | Luffy tenue y fijo como motivo de fondo. Las monedas representan el valor, no oro de la run. |
| Roma Eterna | Sello vacío | Numeral principal I, II, III, IV, V o VI | Emperador de fondo, independiente del valor. No es un ranking de profesiones romanas. |

Los 28 retratos originales siguen disponibles en el visor, con nombres y descripciones ES/EN, bajo «Personajes de la colección · sin valor asignado». La galería usa `frame` de arte, no un campo `value`. Las siete caras jugables tienen nombres numéricos propios. La separación se realiza con `valueFace` (mesa) y `valueIcon` (ilustración de colección), sin modificar IDs persistidos.

Las posiciones de las unidades son convencionales de dominó; el tamaño se adapta a la cantidad. Las caras no dependen de un número de esquina. La ficha normal conserva una ayuda numérica compacta en la separación central. Con edición, ese espacio central muestra su símbolo, con los valores completos en la descripción accesible y los detalles de ficha. Pacto ocupa la izquierda y el tipo especial la derecha. El dorado mantiene `x2`; comodín, espejo y bomba tienen indicadores distintos. Las skins anteriores mantienen su presentación.

## Recursos y rendimiento

Se reutilizan los cuatro atlas reales de 896×128: **201.546 bytes en total**, sin volver a generar o descargar imágenes. Luces, monedas, bolsa y sello están dibujados en SVG/JSX. No se consume saldo de Higgsfield ni se llama a ImageGen en esta corrección. No se añaden timers, animaciones o solicitudes de red para las composiciones.

La procedencia de los retratos y sus límites siguen en [ASSET_PROVENANCE.md](ASSET_PROVENANCE.md) y en el [informe histórico del lote](FOUR_COLLECTIONS_2026-11-14.md). Los motivos generados de franquicias no se presentan como colaboraciones oficiales. Los PNG nuevos del paquete v2 son **exportaciones del componente real**, no nuevas generaciones de IA; no forman parte de la descarga del juego.

Compilación final: entrada 55,45 kB / 17,98 kB gzip; App 474,68 / 133,77; Colección 26,23 / 8,76; CSS 137,09 / 21,33. Son tamaños de archivos/chunks, no una medición de FPS o memoria.

## Verificación realizada

- **317 pruebas correctas en 20 archivos.** Doce casos nuevos protegen las cantidades 0–6 de las tres composiciones contables, el cero, la unidad de tripulante consistente, el fondo independiente del valor, los numerales principales, los nombres separados de invitados y el conteo con tipos especiales/edición/Pacto. Se refuerzan también las pruebas del lote anterior.
- Lint, TypeScript/compilación de producción, TypeScript de QA y `git diff --check`: correctos. Sigue el aviso previo de Browserslist antiguo. No se cambian dependencias.
- Navegador Chrome aislado, galería QA con **los componentes reales**: 4 colecciones × 7 valores × 2 tamaños × 2 mitades × 3 anchos (1440, 390, 320), **336 mitades inspeccionadas**. Cantidades exactas con las ayudas ocultas; ceros diferenciados, sin unidades recortadas o solapadas. Numerales dentro de su lienzo, fichas dentro del panel y sin desbordamiento horizontal.
- Matriz QA de **128 combinaciones por ancho, 384 inspecciones**: cuatro colecciones × dos tamaños × cuatro tipos (comodín/dorada/espejo/bomba) × cuatro ediciones, siempre con Pacto. Las tres insignias permanecen dentro de cada ficha, sin tapar símbolos ni tocarse entre sí. Las ayudas de las fichas normales se comprueban separadas de los símbolos.
- Producción local en `http://127.0.0.1:5176/`: cuatro colecciones × ES/EN × 1280/390 px, **16 combinaciones del visor**. Selección de sus siete caras, etiquetas fuera del dibujo, comprobación de Espejo + negativa + Pacto, exploración sin equipar automáticamente y sin desbordamiento horizontal.
- Se equipa cada una de las cuatro skins, se hace una colocación real, se guarda/sale, se recarga y se continúa **sin conexión** en perfiles temporales. Se conservan skin, estado de juego y cursor RNG. No se usan los guardados personales ni se completa una campaña.
- Cero errores de consola/pageerror en los flujos de navegador descritos. Inspección visual de la vista conjunta, muestras en ambos tamaños y capturas de producción. Exportadas 28 caras PNG de **128×128**, con dimensiones verificadas y manifiesto ES/EN.

Estos resultados verifican estructura y comportamiento; no sustituyen una prueba de reconocimiento con jugadores sin explicación previa. No se acredita rendimiento/FPS en móvil físico, fidelidad canónica exhaustiva ni todas las combinaciones durante una campaña prolongada. Las luces de alma son un símbolo interpretado para esta skin, no un nuevo recurso de juego. El fantasma del cero y las monedas se explican en el visor: conviene validar si su significado resulta inmediato para jugadores nuevos.

## Archivos y evidencias

Implementación: `src/engine/numericCollectionFaces.tsx`, `tileSkins.tsx`, `skinCharacters.ts`, `i18n.ts`, `i18nContent.ts`; `src/components/TileView.tsx`, `NumericTileRibbon.tsx`, `EditionBadge.tsx`, `SkinShowcase.tsx`. Regresión: `NumericCollectionFaces.test.tsx`, `CollectionPacks.test.tsx`.

QA: `qa/numericFaces.html`, `numericFaces.tsx`, `numericFaces.browser.mjs`, `exportNumericFaces.browser.mjs`, `collections.tsx`, `collectionPacks.browser.mjs`. La galería y el exportador usan el host QA 5178; los flujos de partida usan la compilación 5176.

En `outputs/dominix-review/`:

- `identidad-numerica-resumen-v2-2026-11-14.jpg`: vista conjunta compacta sin números auxiliares, no una pantalla nueva del producto.
- `identidad-numerica-sin-ayudas-{1440,390,320}-2026-11-14.jpg`: composiciones y fichas reales sin ayudas.
- `identidad-numerica-con-ayudas-2026-11-14.jpg`: tamaños de ficha y ayudas centrales.
- `identidad-numerica-verificacion-2026-11-14.json`: conteos, geometría e indicadores.
- `skin-{id}-{es,en}-{1280,390}-2026-11-14.jpg` y `skin-{id}-partida-2026-11-14.jpg`: visor y partidas reales de la versión corregida.
- `colecciones-verificacion-2026-11-14.json`: flujos del visor, equipamiento y continuidad offline.
- `numeric-skins-v2/`: 28 caras PNG, manifiesto, informe y captura portable para el nuevo ZIP. El ZIP anterior se conserva como evidencia histórica de los retratos.
- `DOMINIX-IDENTIDAD-NUMERICA-V2-2026-11-14.zip`: 34 archivos, incluidas las 28 caras de 128×128, manifiesto, informe, README, captura y dos JSON de verificación. Los PNG suman 348.538 bytes; su uso es revisión/exportación, no sustituir el render del producto.

Siguiente paso lógico: una revisión de reconocimiento a tamaño de mano real con jugadores nuevos, antes de producir más colecciones o variantes de prestigio. No se añade otra colección en esta entrega.
