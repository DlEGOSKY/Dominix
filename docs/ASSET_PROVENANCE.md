# Recursos visuales de la revisión del 8 de noviembre de 2026

## Expreso y acabados · 17 de noviembre de 2026

`src/engine/expressSkinArt.tsx`: siete caras contables (0–6) y una superficie de vagón como SVG original asistido por Codex, dibujado en código, sin referencias de terceros ni generador raster. Madera, latón y ventanas ámbar; texto/valores y señales siguen siendo elementos accesibles del juego. Geometría de ventanas reutilizada con SVG `use`. No añade un atlas ni una descarga de imágenes.

`materialArt.tsx` amplía el trabajo nativo de borde/grabado a los seis materiales y añade tres variantes estables de grano; `index.css` aporta acabados y reflejos breves. Reutiliza sin editar las seis texturas existentes de Higgsfield (7.768 bytes en conjunto), con su procedencia anterior. Son ilustraciones 2D, no materiales físicamente renderizados. El sonido de madera es síntesis Web Audio propia en `audio.ts`, sin muestras externas.

Sin consumo de créditos, compras, licencias adicionales o dependencias nuevas. No se atribuye este lote a Higgsfield ni a ImageGen y no se afirma exclusividad jurídica. Los recursos anteriores conservan su atribución y condiciones. [Integración y pruebas](MATERIAL_EXPRESS_2026-11-17.md).

15 de noviembre, segunda pasada: [Among Us esmaltado y contacto](AMONG_ENAMEL_CONTACT_2026-11-15.md). Dos recursos nuevos reales: Nano Banana 2.1 en Higgsfield, trabajo `b91b1edb-61d5-4e02-8c77-b68ad1267f25`, **2 créditos**, PNG 2048×2048 y atlas QA de 28.512 bytes; ImageGen integrado, PNG 1254×1254 y atlas de producto `among-suit-enamel-v2.webp` de **40.766 bytes**. GPT Image 2.6 high/2K fue rechazado por el requisito de plan Basic. Saldo comprobado 6→4; sin compras. Se elige la dirección integrada para la mesa; son prompts/direcciones distintos, no un benchmark controlado. Fuentes, prompts y recibo conservados. El contacto sonoro es síntesis Web Audio propia; la muestra WAV es una exportación QA y no se carga en producto. Continúan las condiciones de las reinterpretaciones de franquicias descritas abajo.

15 de noviembre: [ensayo de placa de Among Us y colocación](TILE_PLACEMENT_SKINS_2026-11-15.md). Reutiliza su atlas original; placa y registro luminoso hechos en CSS/JSX, sin textura raster nueva, generaciones o créditos. Se retiran los seis SVG simplificados de tripulantes de la revisión anterior. Las 21 caras de Roma, Hollow Knight y One Piece permanecen idénticas en la comparación de exportaciones. El clip de colocación es una grabación local de los componentes reales, no vídeo generativo.

Referencias por valor del 14 de noviembre: doce emblemas nuevos SVG/JSX en `collectionValueMarks.tsx` (seis roles de tripulación y seis máscaras interpretativas), reutilizando los retratos existentes. One Piece y Hollow Knight seleccionan un retrato distinto por valor. Sin nuevas imágenes IA, créditos ni paquetes externos; Roma conserva sus siete caras, verificadas contra las exportaciones aprobadas. [Integración y verificación](SKIN_REFERENCES_2026-11-14.md).

Corrección numérica del 14 de noviembre: `numericCollectionFaces.tsx` reutiliza los atlas siguientes y añade luces, monedas, bolsa y sello SVG propios; `NumericTileRibbon.tsx` reutiliza/dibuja indicadores en código. Sin imágenes nuevas de IA, descargas, servicios adicionales ni gasto. Las 28 exportaciones PNG v2 proceden del render real a 128×128 y se conservan fuera del producto. Los retratos originales pasan a una galería sin rango numérico. [Análisis, cambios y verificación](NUMERIC_SKINS_2026-11-14.md).

## Lote ilustrado de cuatro colecciones · 14 de noviembre de 2026

Among Us · Tripulación, Hollow Knight · Hallownest, One Piece · Sombrero de Paja y Roma Eterna. Cuatro láminas nuevas con **ImageGen integrado**, 28 retratos, sin imágenes de referencia externas. Higgsfield se consultó para capacidades/saldo/precio; no se enviaron generaciones ni se consumieron créditos allí. Su saldo consultado fue 6 créditos, plan free y prueba expirada; GPT Image 2.6 high/2K cotizó 2,75 por lámina. El generador integrado no declara un nombre comercial de modelo en el resultado, por lo que no se le atribuye GPT Image 2.6.

Fuentes PNG 1254×1254 archivadas en `outputs/dominix-review/skins-collections-2026-11-14/`. Atlas de producto 896×128: `src/assets/skins/among-us-portraits-v1.webp` (40.186 bytes), `hollow-knight-portraits-v1.webp` (38.684), `one-piece-portraits-v1.webp` (65.424) y `roma-eterna-portraits-v1.webp` (57.252). Total 201.546 bytes. Extracción de celdas y reducción mecánica por Canvas, WebP con pérdida a calidad 0,96; no son archivos lossless. Se conservan también las 28 caras individuales en el paquete descargable, sin duplicarlas en el producto.

Las tres colecciones de franquicias son reinterpretaciones generadas de personajes existentes, no sprites oficiales descargados ni colaboraciones confirmadas. Roma Eterna usa personajes originales de ambientación romana. No se afirma exclusividad de la salida ni cesión de derechos sobre personajes de terceros. [Prompts exactos, inventario de recursos, pruebas y archivos](FOUR_COLLECTIONS_2026-11-14.md).

Ampliación del 14 de noviembre: grabado de Imperium/Marfil y biseles de Esmeralda/Diamante en `materialArt.tsx`, SVG propio sin recursos de terceros. Se reutilizan las seis texturas existentes de Higgsfield, sin nuevas generaciones ni gasto. [Integración, comparativa y pruebas](MATERIAL_CRAFT_2026-11-14.md).

Ampliación del 13 de noviembre: cuatro símbolos de edición dibujados en SVG en `src/components/EditionBadge.tsx` (faceta, anillos, prisma y marca negativa). Código propio, sin biblioteca de imágenes ni referencia externa, rasterización o consumo de créditos. Se reutilizan los materiales anteriores. [Revisión y capturas](UI_DETAILS_2026-11-13.md).

Ampliación más reciente del 10 de noviembre: [materiales e Imperium](MATERIALS_IMPERIUM_2026-11-10.md). Dos muestrarios reales de Higgsfield con el mismo prompt: GPT Image 2.6 alta y Recraft V4.1 Utility, por 2,75 créditos autorizados y verificados. Se eligió GPT para las seis texturas de producto (7768 bytes); Recraft permanece solo en QA. Numerales y ornamentación romana están en código. [Procedencia y hashes A/B](art/materials-ab-v1.json).

Entrega anterior del 10 de noviembre: **Invitados del Umbral**, generado realmente en Higgsfield con `gpt_image_2_6`, trabajo `7513bd72-4f7e-4e09-a80e-11bf38203148`, consumo autorizado y verificado de **0,25 créditos**. Atlas equipable de 42358 bytes, siete cuadros de 96 px. [Fuente, prompt, metadatos, integración y pruebas](HIGGSFIELD_INVITADOS_2026-11-10.md); [registro de procedencia](art/invitados-higgsfield-v1.json).

Se conservan **37 emblemas SVG originales**, La Banda del Doble (36594 bytes) y Chatarra de Lujo (43054 bytes), ambas con siete cuadros de 96 px. Estas dos láminas anteriores se generaron con ImageGen integrado, sin créditos de Higgsfield. [Preparación de Chatarra](CHARACTER_COLLECTIONS_2026-11-09.md), [atlas de La Banda](BANDA_PACK_2026-11-09.md) y [procedencia de su concepto](ART_DIRECTION_2026-11-09.md). Las láminas grandes permanecen en documentación; el producto solo importa los atlas optimizados.

La dirección final conserva la portada, composición, tipografía, colores de modos y fichas de Dominix. No incluye el rediseño editorial verde y serif mostrado durante la revisión: fue retirado tras la corrección de alcance del usuario.

## `src/assets/chain-surface-v1.webp`

- Material raster para el fondo de la cadena; no contiene interfaz, texto ni ilustraciones de fichas.
- Creado el 8 de noviembre de 2026 mediante la herramienta integrada ImageGen de esta sesión. No procede de Higgsfield ni de un banco de imágenes.
- Salida original: PNG RGB, 1254 × 1254. Copia de trabajo conservada fuera del repositorio en `outputs/dominix-review/chain-surface-imagegen-original.png`, respecto a la raíz del espacio de trabajo.
- Integración: WebP RGB, 768 × 768, 3836 bytes. Redimensionado y compresión mecánicos con Pillow, calidad 78, método 6. No se ha añadido una dependencia al juego.
- Uso: `src/index.css`, exclusivamente en `.chain-surface`, bajo un degradado oscuro para conservar el contraste. Vite emite un archivo separado mediante `?no-inline`.
- No se ha usado una imagen de referencia de terceros. Este registro documenta la generación, sin afirmar exclusividad ni garantías jurídicas sobre el resultado. El uso del servicio queda sujeto a sus condiciones aplicables; no se ha comprado una licencia adicional ni contratado servicios.

En la primera etapa Higgsfield se localizó sin conexión efectiva. Una primera solicitud conectada fue rechazada por el plan sin consumir créditos. Tras habilitarse la cuenta se completó el mismo encargo dentro de la autorización de 0,25 créditos. [Prompt exacto, historial y resultado](BOSS_ART_BRIEF.md).

## Fondo de presentación de jefe de Higgsfield

Una generación completada el 8 de noviembre de 2026 con `gpt_image_2_6`, trabajo `3f9e60fa-75c9-47ee-96e1-4eafce14cf30`. Consumo verificado: 0,25 créditos. PNG original RGB de 1344 × 752, archivado fuera del repo. Dos versiones optimizadas mediante redimensionado/compresión mecánicos con Pillow, WebP calidad 80 y método 6:

- `src/assets/boss-threshold-v1.webp`: 1280 × 716, 19214 bytes.
- `src/assets/boss-threshold-mobile-v1.webp`: 640 × 358, 6226 bytes.

Usadas únicamente por BossIntro con selección responsive, degradado oscuro y alt vacío. Sin texto generado, referencias ajenas, vídeo ni cambio de portada. Procedencia sujeta a las condiciones del proveedor; no se compró una licencia adicional ni se afirma exclusividad. El prompt completo está en el documento enlazado.

### Prompt exacto

```text
Use case: stylized-concept. Asset type: a quiet raster MATERIAL TEXTURE for the existing Dominix domino game board, not a UI mockup and not a redesign. Primary request: a premium dark domino play-surface texture with almost imperceptible physical depth. Square composition, top-down orthographic flat surface, continuous edge-to-edge charcoal black and dark ink navy, restrained violet undertones matching #0a0a0f, #12121a and #1a1a26. Finely brushed obsidian slate with microscopic soft grain and faint worn patina, carefully art-directed game material. Very uniform illumination, very low contrast, comfortably dark enough to sit behind white domino pips. No visible vignette, no central focal point, no dramatic lighting. Preserve the original game's dark blue-violet visual identity. No green, no beige, no gold ornament, no geometric diagrams, no magic circles, no runes, no objects, no domino tiles, no icons, no frame or border, absolutely no typography or UI. Do not create a landing page, website hero, product illustration or game screenshot. The entire output must be usable as a subtle background texture. Intended output 1024 by 1024 pixels.
```

La resolución entregada por la herramienta fue 1254 × 1254, distinta de la solicitada; la medida integrada se verificó sobre el archivo real.

## Fondos de tienda, santuario y eventos

Generados en la continuación del 8 de noviembre e integrados/verificados el 9 de noviembre de 2026. Tres trabajos completados de Higgsfield, modelo `gpt_image_2_6`, una imagen 16:9 por escena. Coste previamente autorizado y consumido: **0,75 créditos en total**. Sumando el jefe anterior, consumo de estos cuatro recursos: 1 crédito. Saldo consultado el 9 de noviembre: 109 créditos, plan plus; prueba marcada por el proveedor como `cancelled_by_user`, sin generación ilimitada disponible. No se cambió el plan, contrato ni configuración de facturación.

| Escena | Trabajo | Original PNG RGB, 1344 × 752 | WebP escritorio, 1280 × 716 | WebP móvil, 640 × 358 |
| --- | --- | --- | --- | --- |
| Tienda | `4d3480c9-9ceb-4f44-b5b8-4042fb3e98e3` | 1112238 bytes | `shop-ambient-v1.webp`, 20858 bytes | `shop-ambient-mobile-v1.webp`, 6540 bytes |
| Santuario | `f7c1b9a1-fc48-4bc4-80c2-d4a2537ea171` | 1033690 bytes | `sanctuary-ambient-v1.webp`, 18822 bytes | `sanctuary-ambient-mobile-v1.webp`, 5778 bytes |
| Evento | `afaa12ce-47c5-4ff0-b854-05dd020efb7a` | 1106693 bytes | `event-ambient-v1.webp`, 23556 bytes | `event-ambient-mobile-v1.webp`, 7572 bytes |

Los archivos integrados están en `src/assets/`; los originales se archivan fuera del repositorio en `outputs/dominix-review/{shop,sanctuary,event}-higgsfield-original.png`. Optimización mecánica con Pillow, WebP calidad 80 y método 6. Los seis recursos suman **83126 bytes**; cada pantalla usa una sola variante seleccionada por `<picture>`, no las seis imágenes como capas.

Brief artístico utilizado (resumen, no transcripción literal de los prompts): mantener el azul tinta/violeta y los materiales de obsidiana del fondo de jefe generado en esta sesión, usado como referencia propia. Tienda con mesa de trabajo, fichas de marfil sin texto, herramienta de latón a un lado y estantes al otro; santuario con agua tranquila y una forma lunar lateral; evento con dos caminos laterales. Centro oscuro y despejado, sin personajes, interfaz ni texto generado. No se incluyeron referencias ajenas ni imágenes personales del usuario.

`EncounterBackdrop.tsx` presenta cada escena como decoración con alt vacío y `aria-hidden`, sin eventos de puntero y con un degradado oscuro. El texto y los iconos siguen en HTML/SVG; no se incrustan títulos en imágenes. Se conservan la composición y la paleta original de la UI. No hay vídeos ni bucles de animación añadidos por estos fondos. [Validación visual y límites](UI_POLISH_2026-11-09.md).

Procedencia sujeta a las condiciones aplicables de Higgsfield y del modelo. No se compró una licencia adicional ni se afirma exclusividad o una garantía jurídica sobre la salida.

## Iconos de instalación y fuentes locales · 14 de noviembre de 2026

`public/icon.svg` es un recurso vectorial original creado en esta revisión: fichas azul/violeta y oro sobre fondo oscuro, sin texto. Se rasterizó con Canvas de Chrome mediante `qa/exportAppIcons.browser.mjs` para producir `icon-192.png` (27.001 bytes) e `icon-512.png` (121.744 bytes). SVG: 2.110 bytes. Sustituyen rutas de icono inexistentes del manifiesto; no reemplazan el título ni las ilustraciones existentes. No se utilizó un modelo generativo, recurso externo ni servicio de pago para este icono.

Se alojan las mismas familias que ya solicitaba index.html a Google Fonts, con sus archivos reales de distribución:

- Inter variable normal 400–900, subconjunto latino: `src/assets/fonts/inter-latin-variable.woff2`, 48.256 bytes. Fuente: [Google Fonts, archivo WOFF2](https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2). Autores: The Inter Project Authors. Licencia distribuida en `public/licenses/Inter-OFL.txt`, procedente de [Google Fonts/Inter](https://github.com/google/fonts/blob/main/ofl/inter/OFL.txt).
- JetBrains Mono variable normal 400–700, subconjunto latino: `src/assets/fonts/jetbrains-mono-latin-variable.woff2`, 31.432 bytes. Fuente: [Google Fonts, archivo WOFF2](https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbv2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKwBNntkaToggR7BYRbKPxDcwg.woff2). Autores: The JetBrains Mono Project Authors. Licencia distribuida en `public/licenses/JetBrainsMono-OFL.txt`, procedente de [Google Fonts/JetBrains Mono](https://github.com/google/fonts/blob/main/ofl/jetbrainsmono/OFL.txt).

Ambas conservan SIL Open Font License 1.1. Se descargaron los WOFF2 latinos oficiales sin editar sus glifos; cubren los textos ES/EN actuales. Los binarios y sus licencias se incluyen en la preparación offline. No se introdujo una nueva familia tipográfica ni un servicio de fuentes adicional.

## Mundos de dominó · 15 de noviembre de 2026

`src/engine/worldSkinArt.tsx`: arte SVG original asistido por Codex, integrado como código. Cinco superficies y 35 caras contables: Vitrales del eclipse, Reactor orbital, Templo sumergido, Forja del dragón y Gabinete de alquimia. No se usaron imágenes de referencia externas, texturas descargadas, un generador raster ni un servicio de pago. La estrella de favoritos es también un SVG nativo. No se añaden atribuciones o licencias de terceros por estos dibujos; las licencias de los recursos anteriores permanecen vigentes. No se afirma exclusividad jurídica. Véase [implementación y validación](WORLDS_WARDROBE_2026-11-15.md).
