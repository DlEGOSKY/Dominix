# Cuatro mundos, una mesa · 14 de noviembre de 2026

> Informe histórico del lote de retratos. La asignación personaje/valor descrita aquí fue retirada tras la revisión del usuario. La implementación vigente usa [composiciones numéricas y una galería sin rangos](NUMERIC_SKINS_2026-11-14.md), con 317 pruebas. Los retratos, prompts y datos de procedencia se conservan; el ZIP original documenta aquella primera versión.

Rama `codex/dominix-stability-polish`; base `f2a8677d54ffdfa9c97cb55db0f12081c1369db2`. Entrega local completa del lote solicitado: cuatro colecciones equipables, 28 retratos y 25 skins en el catálogo total. No se publica ni se modifica una selección guardada al incorporar el lote.

## Colecciones integradas

| ID | Colección | Valores 0, 1, 2, 3, 4, 5, 6 |
| --- | --- | --- |
| `among_us` | Among Us · Tripulación | Fantasma, Tripulante, Científico, Ingeniero, Detective, Ángel guardián, Impostor |
| `hollow_knight` | Hollow Knight · Hallownest | La Sombra, El Caballero, Hornet, Quirrel, Zote, Cloth, Grimm |
| `one_piece` | One Piece · Sombrero de Paja | Brook, Luffy, Zoro, Nami, Sanji, Chopper, Robin |
| `roma_eterna` | Roma Eterna | La Loba, Legionario, Gladiador, Centurión, Vestal, Senador, Emperador |

Están disponibles desde el inicio en Colección → Skins → Personajes. Todas son cosméticas: no añaden oro, poderes, cambios de puntuación o bonificaciones. Las skins previas, sus IDs, selección e inventarios se conservan. No se migran los guardados ni se altera el ruleset mecánico.

Dirección: retratos de pixel art con contornos claros, fondos azul tinta y acentos de marfil/oro. Cada colección tiene siluetas y colores propios. Los nombres/descripciones están en ES/EN; los valores siguen siendo etiquetas HTML. Roma Eterna utiliza I–VI y 0 en esas etiquetas, mientras la descripción accesible y los detalles conservan números ordinarios. Imperium material permanece independiente.

Las ilustraciones sobreviven a comodín, dorada, espejo, bomba, bloqueo y ediciones. Tipo, edición y Pacto conservan sus indicadores. Se aprovechan el visor de siete caras, prueba de acabados y equipamiento explícito existentes; se amplía el contenido de la interfaz actual.

## Herramientas y procedencia

Se aplicaron las habilidades de gestión de plugins y generación de imágenes. Se comprobó la integración real de Higgsfield: saldo **6 créditos**, plan free, prueba expirada el 11 de noviembre; sin ilimitado de imágenes disponible. El modelo GPT Image 2.6 en `quality: high`, resolución 2K, cuadrado, cotizó **2,75 créditos por lámina**, 11 para cuatro. Se consultaron sus parámetros y recomendaciones, sin enviar ninguna generación ni realizar compras en ese servicio.

Se utilizaron **cuatro generaciones nuevas de ImageGen integrado**, una por colección, enviadas como lote paralelo. El modo integrado no requiere clave API ni consume el saldo de Higgsfield. No se usó fallback CLI ni se instaló un proveedor o paquete adicional. No se atribuye un modelo comercial concreto al generador integrado: la herramienta no lo identifica en su resultado.

Cada fuente real es PNG RGB de **1254 × 1254**, con cuadrícula 3×3: las siete primeras celdas contienen retratos y las dos últimas permanecen vacías. Se inspeccionaron las cuatro láminas y los atlas resultantes. No se copian sprites oficiales; las tres colecciones de franquicias son ilustraciones generadas de sus personajes, no colaboraciones oficiales confirmadas. Roma Eterna representa personajes originales de ambientación romana. No se afirma una cesión de derechos sobre personajes de terceros ni exclusividad de la salida.

Prompts exactos de generación, sin referencias de imagen externas:

- [Among Us](art/among_us-portraits-v1.prompt.txt)
- [Hollow Knight](art/hollow_knight-portraits-v1.prompt.txt)
- [One Piece](art/one_piece-portraits-v1.prompt.txt)
- [Roma Eterna](art/roma_eterna-portraits-v1.prompt.txt)

Los originales se copiaron al workspace en `outputs/dominix-review/skins-collections-2026-11-14/`, conservando las fuentes del generador en su ubicación original. La integración referencia exclusivamente archivos dentro de `src/assets/skins/`.

## Preparación y peso

`tools/prepare_collection_atlases.mjs` recorta mecánicamente las siete celdas, reduce por vecino más próximo y codifica WebP con Canvas de Chrome a calidad 0,96. No redibuja personajes. Cada atlas mide **896×128**, siete cuadros de 128×128. La codificación es con pérdida; no se describe como lossless. La misma exportación entrega los 28 retratos individuales en el paquete de arte, sin cargarlos por separado en el juego.

| Archivo de producto | PNG fuente | WebP integrado |
| --- | ---: | ---: |
| `among-us-portraits-v1.webp` | 1.474.561 bytes | 40.186 bytes |
| `hollow-knight-portraits-v1.webp` | 1.496.066 bytes | 38.684 bytes |
| `one-piece-portraits-v1.webp` | 1.995.926 bytes | 65.424 bytes |
| `roma-eterna-portraits-v1.webp` | 1.924.441 bytes | 57.252 bytes |

Los cuatro recursos suman **201.546 bytes**, frente a 6.890.994 de los originales. Se carga un atlas por colección, compartido entre sus caras. El worker de compilación los incorpora a su lista de preparación offline. No se añaden animaciones de sprites, timers o peticiones externas para estas ilustraciones.

## Verificación

- **305 pruebas correctas en 19 archivos**, 14 casos nuevos: disponibilidad sin ventajas, selección previa conservada, siete valores explícitos para las cuatro skins, seis tipos especiales en ambos tamaños con edición/Pacto, numeración romana/cero y nombres ES/EN sin equipamiento al explorar.
- Lint completo, TypeScript/compilación de producción, TypeScript de QA y `git diff --check`: correctos. Continúa el aviso previo de Browserslist antiguo. No se cambian package.json ni lockfile.
- Chrome aislado en producción local: cuatro colecciones × ES/EN × 1280/390 px, **16 combinaciones de vista**. Se seleccionaron sus siete caras; se comprobó imagen 896×128 con siete cuadros visualmente distintos, ausencia de desbordamiento horizontal, selección global intacta al explorar y Espejo + edición negativa + Pacto en tamaño normal/pequeño.
- En español se **equipó y jugó cada una de las cuatro colecciones**, se realizó una colocación real, se guardó/salió, se recargó y se continuó **sin conexión**. Puntuación/estado de juego y cursor RNG se conservaron; la skin del checkpoint se mantuvo. No se terminó una campaña ni se probó cada especial en una partida natural.
- Cero errores de consola/pageerror en esos flujos. Se inspeccionaron la vista conjunta de las 28 caras y capturas de partidas, incluida Roma con numerales romanos.
- Build: entrada **54,26 kB / 17,52 kB gzip**, App **468,49 kB / 132,76 kB gzip**, Colección **24,13 kB / 8,20 kB gzip** y CSS **136,49 kB / 21,26 kB gzip**, además de chunks compartidos y recursos separados. Los PNG fuente, caras individuales y láminas de documentación no forman parte de la descarga del producto.

Los scripts reutilizaron los servidores existentes 5176/5178 y perfiles temporales de Chrome, sin usar guardados personales. La vista conjunta es una galería QA que renderiza los componentes reales; las capturas de partida corresponden a producción local.

## Entrega y archivos

Motor/presentación: nuevo `src/engine/collectionPortraits.tsx`; `tileSkins.tsx`, `skinCharacters.ts`, `i18nContent.ts`, `i18n.ts`, `progression.ts`. UI: `TileView.tsx` y `SkinShowcase.tsx`. Pruebas: nuevo `CollectionPacks.test.tsx`. QA: `collections.html`, `collections.tsx`, `collectionPacks.browser.mjs`. Preparación: `tools/prepare_collection_atlases.mjs`. Cuatro WebP en `src/assets/skins/`, cuatro prompts y documentación.

En `outputs/dominix-review/`:

- `colecciones-completas-2026-11-14.jpg`: vista conjunta con retratos y fichas reales.
- `skin-{id}-{es,en}-{1280,390}-2026-11-14.jpg`: visor de cada colección.
- `skin-{id}-partida-2026-11-14.jpg`: colocación real con cada colección.
- `colecciones-verificacion-2026-11-14.json`: resultados del navegador.
- `skins-collections-assets-2026-11-14.json`: fuentes, dimensiones, pesos y caras individuales.
- `skins-collections-2026-11-14/`: cuatro PNG originales, cuatro atlas, 28 WebP individuales, prompts, manifiesto portable y vista conjunta.
- `DOMINIX-CUATRO-COLECCIONES-2026-11-14.zip`: paquete completo de arte para revisar o conservar.

## Límites y siguiente paso

El pixel art generado no constituye una réplica exacta de modelos oficiales: puede contener interpretaciones de detalles de personajes, ropa o accesorios. No se verificó fidelidad canónica exhaustiva, todas las ediciones en todos los dispositivos ni rendimiento en un móvil físico. Las comprobaciones no acreditan nuevos derechos o colaboraciones con las franquicias.

No se añaden variantes de prestigio, desbloqueos por desafíos o reglas especiales en esta entrega. Siguiente paso recomendado: elegir las variantes de prestigio del lote a partir de la legibilidad y preferencia del usuario, manteniendo separadas las recompensas cosméticas de los efectos mecánicos.
