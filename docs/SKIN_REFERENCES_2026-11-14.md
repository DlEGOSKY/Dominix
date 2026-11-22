# Referencias distintas por valor · 14 de noviembre de 2026

Valoración posterior del usuario y continuación: [colocación y ensayo ilustrado del 15 de noviembre](TILE_PLACEMENT_SKINS_2026-11-15.md). Los SVG simplificados de Among Us de esta etapa fueron retirados tras su rechazo artístico. Se conservan sus evidencias históricas v3; Roma, Hollow Knight y One Piece mantienen su arte.

Rama `codex/dominix-stability-polish`, base `f2a8677d54ffdfa9c97cb55db0f12081c1369db2`. Ajuste de las tres colecciones a partir de la revisión del usuario: mejorar Among Us, dar a cada valor de Hollow Knight una referencia distinta y eliminar la repetición del fondo de Luffy. Roma Eterna se conserva.

## Criterio e implementación

La [revisión numérica anterior](NUMERIC_SKINS_2026-11-14.md) resolvió el conteo, pero repetía una misma referencia dentro de cada colección: tripulante rojo, luz de alma y Luffy de fondo. Era una decisión visual mejorable, no un error de puntuación. Se mantiene la cantidad explícita y se cambia la identidad del símbolo o retrato según el valor de **cada mitad**, independientemente de la otra mitad.

| Valor | Among Us: unidad contable | Hollow Knight: máscara contable | One Piece: fondo, conservando las monedas |
| --- | --- | --- | --- |
| 0 | Fantasma, sin tripulantes vivos | Sombra y círculo vacío | Brook y bolsa vacía |
| 1 | Tripulante rojo, brote | Caballero | Luffy |
| 2 | Científico marfil, antena/visor dividido | Hornet | Zoro |
| 3 | Ingeniero ámbar, casco | Quirrel | Nami |
| 4 | Detective violeta, sombrero | Zote | Sanji |
| 5 | Guardián verde agua, alas/halo | Cloth | Chopper |
| 6 | Impostor carmesí, dientes/cuernos | Grimm | Robin |

En Among Us y Hollow Knight se dibujan exactamente N unidades para N=1–6. Las figuras distintas aportan identidad; la cantidad comunica el valor. No se atribuyen poderes, jerarquías o rangos a los personajes. Las máscaras son emblemas interpretados para esta skin. Los retratos de Hollow Knight también varían por valor, al 15% de opacidad, conservando el tono oscuro de la colección.

Among Us usa seis símbolos SVG nuevos con una silueta de traje consistente y variación de color/accesorio. Hollow Knight usa seis máscaras SVG nuevas con contornos y rasgos diferentes; el reconocimiento no depende únicamente del color. One Piece reutiliza los siete cuadros ya integrados y mantiene sus monedas, posiciones y contraste. El visor ES/EN explica las referencias. Los retratos de colección siguen disponibles en su galería.

Las fichas conservan las ayudas y las insignias en la separación central. No se alteran puntuación, RNG, tipos, ediciones, Pacto, dimensiones de ficha, desbloqueos, IDs o esquemas de guardado. No se modifica la composición de Roma.

## Recursos y herramientas

Doce emblemas propios en `src/engine/collectionValueMarks.tsx`, construidos como SVG/JSX. Se reutilizan los atlas WebP existentes, **201.546 bytes** entre las cuatro colecciones. Sin imágenes nuevas de IA, servicios de pago, dependencias, filtros SVG, temporizadores o animaciones añadidos. Se elige código vectorial para controlar siluetas y lectura en las celdas de 36/48 px. No se usa Higgsfield ni se gastan créditos en esta pasada.

Los retratos mantienen la procedencia y condiciones documentadas en [ASSET_PROVENANCE.md](ASSET_PROVENANCE.md). Los emblemas de franquicias son interpretaciones para el prototipo local, sin afirmar colaboración oficial. Se exportan 28 PNG de revisión a 128×128, **343.097 bytes**; el producto continúa componiendo las caras y no carga esos PNG.

## Verificación

- **321 pruebas en 20 archivos**, incluidos seis perfiles distintos por colección, cantidades exactas, ceros y selección independiente de referencias en una ficha mixta 2–5. Se ajusta la prueba de nombres para reconocer el apóstrofo HTML escapado de “The Knight's mask”; no era un fallo de la interfaz.
- Lint, compilación/TypeScript de producción, TypeScript QA y diff correctos. Continúa el aviso previo de Browserslist antiguo. Build: entrada 55,50 kB / 18,02 gzip; App 478,55 / 134,95; Colección 26,42 / 8,86; CSS 137,09 / 21,33. No son medidas de FPS o memoria.
- Exportación real desde Chrome: 28 caras a 128×128. **Las siete caras de Roma coinciden byte a byte con los PNG v2 aprobados**, bajo el mismo navegador y condiciones de exportación.
- Galería de componentes reales: 1440/390/320 px, 336 mitades inspeccionadas con ayudas ocultas; conteos, referencias por valor, límites de siluetas, numerales y ausencia de desbordamiento. Matriz adicional de 384 inspecciones con cuatro tipos, cuatro ediciones y Pacto: insignias dentro de la ficha y libres de los símbolos.
- Producción local: visor ES/EN a 1280/390, 16 combinaciones; selección de siete caras, indicadores especiales y exploración sin cambiar la skin guardada. Cuatro colocaciones reales, una por colección, seguidas de guardar/salir, recarga y continuación offline con estado/RNG/skin conservados en perfiles temporales. Cero errores de consola/pageerror en esos flujos.

Se inspeccionan capturas de las composiciones y de la aplicación. Las pruebas no demuestran reconocimiento inmediato de cada personaje a 36 px: los accesorios más pequeños pueden simplificarse visualmente, y la cantidad/posición sigue siendo la lectura primaria. Pendientes: valoración del usuario de esta dirección, prueba con jugadores nuevos y móvil físico. No se hace una campaña completa ni una medición de rendimiento en hardware modesto.

## Archivos y entrega

- Motor visual: nuevo `collectionValueMarks.tsx`; cambios en `numericCollectionFaces.tsx`, `skinCharacters.ts`, `tileSkins.tsx`, `i18n.ts`, `i18nContent.ts`.
- Pruebas: `NumericCollectionFaces.test.tsx`, `CollectionPacks.test.tsx`.
- QA: `numericFaces.tsx`, `numericFaces.browser.mjs`, `exportNumericFaces.browser.mjs`. El exportador admite versión y baseline de Roma; usa el mismo componente del juego.
- Documentación: este informe, README, procedencia y enlace desde el informe numérico anterior; informe acumulado externo actualizado.

Evidencias nuevas en `outputs/dominix-review/skin-references-v3/`, sin sustituir el paquete v2: `identidad-numerica-resumen-v3-2026-11-14.jpg`, capturas con/sin ayudas en tres anchos, visor ES/EN, partidas, `identidad-numerica-verificacion-2026-11-14.json`, `colecciones-verificacion-2026-11-14.json` y `numeric-skins-v3/manifest.json` con las 28 caras exportadas.

Paquete portable `DOMINIX-REFERENCIAS-V3-2026-11-14.zip` en esa carpeta: 34 archivos, incluidas las 28 caras, manifiesto, README, informe, vista conjunta y los dos JSON de verificación.

Siguiente paso lógico: revisar estas tres colecciones a tamaño de mano real y decidir si se aprueban sus símbolos antes de generar más ilustraciones. Roma permanece como referencia aprobada.
