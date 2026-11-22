# Dominix · probador, colección y mundos de dominó

15 de noviembre de 2026, Europe/Berlin. Rama `codex/dominix-stability-polish`, base `f2a8677d54ffdfa9c97cb55db0f12081c1369db2`. Trabajo local sobre los cambios anteriores, sin commit, publicación, dependencias ni consumo de créditos.

## Alcance y criterio

Continúa la [jerarquía del menú](HOME_HIERARCHY_2026-11-15.md), aprobada por el usuario. Conserva portada, tipografía, fondo, animaciones, reglas y arte anterior. Se amplían el visor y el explicador de puntuación existentes. La petición actual autoriza las propuestas de probador, organización/favoritos, cinco mundos originales y explicación del score.

La ficha se trata como un objeto completo: los elementos contables dan su valor, sin asignar rangos arbitrarios a personajes. Marcos de bajo contraste y pips claros en las posiciones del dominó. El cero tiene un recipiente vacío propio de cada mundo. No se cambia Among Us, Hollow Knight, One Piece o Roma Eterna.

## Colección y probador

Se sustituye la duplicación de explorador/cuadrícula de equipamiento por un catálogo con búsqueda localizada insensible a tildes, cinco familias, filtros de disponibles y favoritas, recuento y estado vacío recuperable. Familias: materiales, mundos originales, colecciones ilustradas, símbolos/estilos, además de Todas. Probar y marcar favorita son controles independientes; solo Equipar cambia la skin. Las bloqueadas pueden probarse, sin poder equiparlas.

El probador reutiliza el diálogo nativo: Escape, fondo inerte y retorno del foco. Usa `TileView` real en sus tamaños de mesa/mano. Muestra una cadena fija válida de seis fichas, 0→6, y una mano de siete fichas que cubre todos los valores. No usa RNG ni inventario. Permite contrastar los tipos especiales juntos y aplicar los acabados/pacto de los controles anteriores. Tipo afecta a la mano; la cadena se mantiene normal para conservar su secuencia. Edición y pacto se muestran en ambas. El estado de los controles tiene una única fuente compartida con la mesa.

En móvil, filas equilibradas conservan el tamaño real de las fichas. El diálogo requiere desplazamiento vertical. Apariencia sigue abriendo Skins directamente y el resumen permite probar la skin equipada.

Favoritos usa la clave opcional `dominix_skin_favorites_v1`, incluida en exportación/importación y reinicio completo. Lectura tolerante de datos locales corruptos; importación validada antes de escribir; error de almacenamiento anunciado sin perder la selección previa. Copias antiguas aceptadas sin borrar favoritos ausentes, IDs futuros bien formados conservados. No se migra ni altera el esquema de la partida activa.

## Recursos y dirección artística

`src/engine/worldSkinArt.tsx` integra cinco superficies y 35 caras procedurales originales. SVG sin texto, imágenes incrustadas, filtros de desenfoque ni bucles de animación. Los nombres, instrucciones y descripciones accesibles siguen en HTML/localizables. No se ha usado Higgsfield, ImageGen, una compra o una biblioteca de personajes: los TSX son los recursos reales integrados. Las cinco skins están disponibles desde el inicio, nunca se equipan automáticamente y no conceden ventajas de juego.

| Skin | Material/paleta | Valores 1–6 | Cero |
|---|---|---|---|
| Vitrales del eclipse | Plomo, vidrio violeta/azul, ribete dorado | Estrellas claras | Eclipse vacío |
| Reactor orbital | Panel naval técnico, metal y cian | Indicadores encendidos | Escotilla apagada |
| Templo sumergido | Piedra verde, bronce, coral periférico | Perlas claras | Nicho vacío |
| Forja del dragón | Hierro oscuro, cobre, ámbar | Remaches calientes | Cavidad fría hexagonal |
| Gabinete de alquimia | Esmalte, latón, verde claro | Gotas luminosas | Frasco vacío |

La cinta compartida conserva tipo/pacto/edición y números de ayuda sin tapar los elementos contables. Las etiquetas accesibles describen los valores ordinarios. Las pruebas de conteo no sustituyen la valoración estética o la lectura humana del usuario.

## Problemas encontrados y correcciones

**Demostrado por lectura de código:** seis `unlockLevel` del registro no coincidían con `LEVEL_REWARDS`, que realmente concede cada desbloqueo. Se corrigen los avisos, sin mover premios ni modificar XP/guardados: Rubí 9→10, Marfil 11→12, Vacío 14→15, Neón 17→18, Tarot 21→22, Astral 22→23. Una regresión contrasta todos los premios cosméticos con el registro y su entrega real.

**Encontrados durante esta implementación:** una regla del resumen activo estiraba la ficha y afectaba a sus etiquetas; se limita al texto y se comprueba el ancho real. La cadena dejaba una pieza aislada en móvil; se ordena en filas de tres. Las etiquetas de filtros se separan de sus selectores para evitar nombres accesibles contaminados por las opciones. Se elimina la sincronización diferida por efecto entre controles y muestra, usando un único estado.

## Puntuación consultable

Se mantiene la tabla de etapas. Un desplegable añade número de fichas/base, patrones detectados con bonos/multiplicadores, combo, factor de bono de patrón, reliquias equipadas y efecto conjunto aplicado, subtotal y multiplicador efectivo. Explica la compresión por equilibrio cuando interviene.

Los datos proceden del mismo `ScoreBreakdown` calculado para la jugada prevista; no se crea una fórmula alternativa de UI. Una reliquia equipada puede no activar su condición. La operación de cadena precede a talentos/personaje/otras etapas de la tabla. No se atribuyen puntos individuales a cada reliquia ni ganancias aisladas a cada patrón después de todos los multiplicadores. Los factores se muestran a tres decimales, conservando precisión en el motor. Una regresión reconcilia las fuentes con una jugada efectiva de tres fichas con dobles, reliquias y factor de patrón.

## Verificación y límites

Resultados finales:

- **394 pruebas correctas en 24 archivos**, incluidos conteo exacto de las 35 caras, cero vacío, tipos/ediciones/pacto en dos tamaños, invariancia de progreso, validación/backup/fallo de almacenamiento de favoritos y coherencia de todos los niveles de desbloqueo. TypeScript/compilación, lint, TypeScript QA y `git diff --check` correctos.
- `qa/worldWardrobe.browser.mjs`: **57 comprobaciones agregadas**, sin errores de consola ni excepciones: 40 estados de distribución (cinco mundos × ES/EN × 1280×1000, 390×844, 320×568 y 844×390), dos tamaños reales de ficha en cada estado, diez pruebas de acabados/estado inmutable/foco, dos de catálogo y cinco de partida real. La búsqueda, favoritas persistidas tras recarga, filtros vacíos recuperables y bloqueo de Equipar para Marfil se comprueban en ambos idiomas. La imagen activa conserva 50 px de ancho.
- Cada nuevo mundo se equipó, entró en Endless, consultó puntos y jugó una ficha. El score coincide con lo previsto; Guardar y salir → recarga offline → Continuar conserva estado, skin y RNG en los cinco casos. No equivale a completar cinco runs.
- `qa/collectionPacks.browser.mjs`: **20 comprobaciones agregadas** de las cuatro colecciones anteriores, sin errores de consola: 16 vistas ES/EN a 1280/390 y cuatro partidas con colocación y reanudación offline. Los siete retratos de cada atlas siguen siendo distintos; acabados/pacto y selección persistida verificados. Sus nombres de captura/JSON conservan el sufijo antiguo 2026-11-14 por compatibilidad del script, pero se ejecutó sobre esta compilación el 15 de noviembre.
- `qa/scoreExplanation.browser.mjs`: cuatro escenarios QA ES/EN a 1280/390. Desplegable de fuentes abierto, marcador 20→501 (+481), última fila 501, consulta sin jugar, cambio de extremo, Escape/foco y ausencia de desbordamiento. Este escenario preparado no es una partida natural.
- Build final: 564 módulos; índice 62,48 kB / 20,36 kB gzip; App 492,24 kB / 139,74 kB gzip; fragmento Collection 29.301 bytes y su CSS 4.674 bytes. El arte fuente de los cinco mundos ocupa 6.934 bytes, sin descargas de texturas nuevas. No se deducen FPS de estos tamaños.

Las capturas del armario, probador y partidas corresponden al producto compilado; `cinco-mundos.jpg` es el muestrario de QA con las fichas reales. Se inspeccionaron visualmente armario de escritorio, probador móvil, los cinco mundos, una colocación natural con Vitrales y el desglose móvil. Perfiles temporales, sin datos personales. Servidores locales 5176 (producción) y 5178 (QA).

El primer intento de Vitest dentro del sandbox falló por EPERM al renombrar archivos temporales, antes de ejecutar pruebas; la ejecución posterior con workers de hilos fuera del sandbox completó los 394 casos. Los primeros scripts de navegador se ajustaron a los nuevos controles/modal y a esperar la actualización de muestra; sus fallos no acreditaban errores de puntuación o guardado. Se corrigieron los problemas de presentación/estado descritos arriba y se repitieron las comprobaciones finales. Permanecen los avisos previos de Browserslist antiguo y normalización LF/CRLF de HomeScreen.

Pendientes: móvil físico, lector de pantalla real, campaña completa, todas las combinaciones de jefes y mediciones de FPS/memoria en hardware modesto. No se acredita una auditoría exhaustiva de todos los materiales/ediciones antiguos ni una publicación remota. La preferencia estética del usuario queda por revisar.

## Archivos principales y continuidad

Nuevos: `SkinWardrobe.tsx`, `SkinWardrobe.css`, `SkinTablePreview.tsx`, `worldSkinArt.tsx`, `skinPreferences.ts`, pruebas `WorldSkins.test.tsx`/`skinPreferences.test.ts`, y QA `worlds.html`, `worlds.tsx`, `worldWardrobe.browser.mjs`.

Ampliados: `CollectionScreen.tsx`, `SkinShowcase.tsx`, `SkinTilePreview.tsx`, `TileView.tsx`, `tileSkins.tsx`, `progression.ts`, `saveSync.ts`, `scoreExplanation.ts`, `ScoreExplanationView.tsx`, `i18n.ts`, `i18nContent.ts`, `runRegression.test.ts`. Pruebas antiguas actualizadas a los niveles reales; scripts de Home/colecciones adaptados al probador modal.

Evidencias: `outputs/dominix-review/worlds-wardrobe-2026-11-15/`. Siguiente paso lógico: revisar los cinco mundos a tamaño real con el usuario antes de crear variantes, desbloqueos o animaciones específicas. No se añaden mecánicas nuevas por las skins.
