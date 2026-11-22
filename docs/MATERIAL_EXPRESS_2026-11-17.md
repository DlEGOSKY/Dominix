# Dominix · materiales, Expreso y correcciones de feedback

17 de noviembre de 2026. Rama `codex/dominix-stability-polish`, commit base `f2a8677d54ffdfa9c97cb55db0f12081c1369db2`. Se conserva el trabajo local anterior. Esta entrega aplica el lote de [la revisión de pendientes](REVIEW_BACKLOG_ART_2026-11-15.md); no sustituye la interfaz ni certifica el juego completo.

## Resultado visual

**31 skins**, incluidos seis mundos originales. Nueva colección gratuita **Expreso de medianoche**: la ficha es un panel de vagón, con madera oscura, latón y ventanas ámbar. Cada mitad contiene exactamente 0–6 ventanas encendidas en posiciones de dominó. Cero es una placa vacía, sin seis ventanas apagadas ni personajes que haya que memorizar como rangos. Tiene superficie propia, siete caras SVG, lectura ES/EN, probador, favoritos y equipamiento explícito. Se conservan las señales de tipos, ediciones y pacto, los valores accesibles y los desbloqueos anteriores.

Los seis materiales reutilizan sus WebP de 96 × 192 y añaden dibujo periférico: marfil satinado, talla verde, facetas de diamante, fracturas de obsidiana, montura de rubí y desgaste de Imperium. Tres variantes de grano se eligen de forma estable por ID de ficha; no consumen RNG ni se sortean al renderizar. El centro permanece disponible para valores y puntos. **Roma Eterna conserva su arte**; Imperium es el acabado material romano, distinto de aquella colección ilustrada.

Dirección: paleta original azul tinta/violeta y oro de acciones; Inter y JetBrains Mono existentes. Madera y latón se limitan al Expreso, sin cambiar la portada, navegación o fondos. No hay texto rasterizado ni nuevas fuentes. SVG/CSS permiten controlar conteo, tamaño y señales con exactitud, sin dependencias o servicios adicionales. [Procedencia](ASSET_PROVENANCE.md).

## Movimiento y presupuesto

| Acabado | Contacto normal | Lectura del contacto |
|---|---:|---|
| Marfil | 170 ms | Asentamiento firme, satinado tenue |
| Esmeralda | 200 ms | Pequeño asentamiento y reflejo verde |
| Diamante | 150 ms | Contacto más seco y reflejo claro |
| Obsidiana | 140 ms | Golpe mínimo, reflejo frío |
| Rubí | 190 ms | Contacto corto y montura cálida |
| Imperium | 160 ms | Asentamiento seco sobre el grabado |
| Expreso | 180 ms | Asentamiento leve de madera y latón |

Modo rápido: contacto al 55 %, reflejo 120 ms, unión 160 ms. Normal: reflejo 240 ms y unión 300 ms. El recorrido mano–mesa anterior sigue en 380/180 ms. Como máximo, tres efectos locales nuevos: contacto, reflejo y unión; un solo clon de vuelo. Cancelación y limpieza conservadas. Los reflejos reposan en opacidad cero, sin bucles por ficha. Movimiento reducido omite estos efectos espaciales y la cinemática de victoria, conservando el resultado y la confirmación sonora.

El Expreso añade una cuarta familia de contacto sonoro, madera, sintetizada con Web Audio. No se añade un archivo de audio ni se abre un contexto antes del gesto. Se verifican las invocaciones; esta entrega no incluye valoración auditiva en altavoces físicos.

Las ventanas comparten geometría mediante SVG `use`; caras y superficies estáticas se memorizan para evitar repetir su construcción cuando cambian otras fichas. Esto reduce repetición de dibujo/React; no demuestra por sí solo una mejora de latencia.

## Errores corregidos y evidencia

| Hallazgo | Clasificación y comprobación | Corrección |
|---|---|---|
| Dos propietarios de la celebración del jefe | Demostrado por lectura en la revisión anterior. QA de componentes reales comprueba una invocación bajo StrictMode y ante render del padre | La cinemática es el único propietario; anuncio y cierre se protegen por victoria |
| Enter podía atravesar el cierre de la cinemática y activar el botón inferior | Reproducido en navegador en el escenario QA: una confirmación abría una segunda victoria | Foco en el diálogo, consumo del evento en captura y restauración de foco. Cierre manual/temporizador una sola vez |
| Temporizador sensible al callback del padre y modo rápido incompleto | Demostrado mediante lectura; probado con render del padre, salida manual, rápida y reducida | Callback por ref; 2200/1000/0 ms, retrasos del contenido ajustados al modo rápido y rótulo ES/EN |
| Historial anunciaba copia aunque faltase API o se rechazase la promesa | Demostrado por ejecución aislada el 15/11; ahora probado en navegador con promesa pendiente/rechazada, API ausente y permiso nativo denegado | Esperar confirmación, botón ocupado, éxito solo tras resolver, error, resumen seleccionable y reintento |
| Copia de semilla sin gestionar API/rechazo | Demostrado por lectura; probado con Clipboard API real, permiso denegado de Chromium y API ausente controlada | Helper compartido y aviso accesible con la semilla visible cuando falla |

Se deniega el permiso mediante CDP en el **contexto aislado correcto**, verificando que `navigator.permissions` informa `denied`. Las pruebas negativas ES/EN de promesa pendiente/API ausente usan stubs explícitos; no se confunden con una denegación del navegador. Se prepara un historial de prueba, sin tocar el perfil personal.

## Validación

Evidencia fuera del repositorio, relativa a la raíz del espacio de trabajo: `outputs/dominix-review/material-express-2026-11-17/`. Los JSON conservan escenarios y errores; las capturas QA se identifican como tales. Partida, armario y probador proceden del producto compilado con perfiles temporales.

- **478 pruebas en 28 archivos**: portapapeles, valores 0–6, tipos/ediciones/pacto en ambos tamaños, variación sin RNG, contactos y regresiones previas.
- TypeScript de producto, build, TypeScript QA y lint correctos; sin dependencias nuevas. Aviso informativo de Browserslist desactualizado; no se modifica el lockfile por este lote.
- **35 comprobaciones agrupadas**: muestrario ES/EN en 1280, 390, 320 y 844 px horizontal; seis acabados, contactos normal/rápido/reducido, StrictMode, temporizador y copia con espera/error/reintento.
- **68 del armario y mundos**: seis colecciones, tipos/acabados, filtros, favoritos, foco, navegación sin equipar, seis colocaciones y reanudaciones offline. Puntuación igual al explicador y RNG guardado igual al reanudar.
- **16 de colocación**: origen/destino, extremos de cadena de 30, cancelación por nueva jugada/deshacer/resize/scroll/desmontaje, API ausente/error, normal/rápido/reducido y clip.
- **21 escenarios de cadenas QA**: siete acabados × 7/15/30 fichas, CPU ×4, dos colocaciones por escenario. Máximo tres efectos locales, un clon y dos contactos; sin efectos o fichas ocultas al terminar.
- **40 de acciones del producto**: Expreso normal, Rubí rápido, Obsidiana con reducción de la app e Imperium con reducción del sistema; teclado/modal, colocar/deshacer, robo/descarte, cierre y continuidad offline. Cuatro ventanas por configuración y clip real sin audio capturado.
- **4 de permiso de copia**: copia real de semilla, escritura nativa denegada, API ausente controlada y resumen del historial con permiso nativo denegado.
- **20 de las cuatro colecciones ilustradas anteriores**: Among Us, Hollow Knight, One Piece y Roma Eterna en ES/EN, escritorio/móvil, retratos distintos, estados especiales y cuatro partidas/reanudaciones offline.

En total, **204 comprobaciones/escenarios agrupados de navegador**, sin errores de consola o excepciones de página en las pasadas completadas. No equivalen a una campaña completa ni a pruebas en móvil físico.

### Reproducción y capturas

```powershell
node ./node_modules/vitest/vitest.mjs run --pool=threads
npm run build
npm run lint
node ./node_modules/typescript/bin/tsc --project qa/tsconfig.json --noEmit
```

Los scripts de navegador reciben ruta de módulo Playwright, ejecutable Chrome y directorio de evidencia; se ejecutan con `node --preserve-symlinks`. Servidores: `vite preview --host 127.0.0.1 --port 5176 --strictPort` para producto y `vite --config qa/vite.config.mjs --host 127.0.0.1 --port 5178 --strictPort` para fixtures. La instrumentación de celebración solo está en esta configuración QA, nunca en producción.

Scripts: `materialExpress.browser.mjs`, `worldWardrobe.browser.mjs`, `tileFlight.browser.mjs`, `materialChains.browser.mjs`, `actionMotion.browser.mjs`, `clipboardPermission.browser.mjs` y `collectionPacks.browser.mjs`, todos bajo `qa/`. El de acciones y el de vuelo aceptan un quinto argumento con la carpeta de navegadores/FFmpeg para grabar vídeo.

Capturas representativas: `acabados-expreso-1280.png` y `acabados-expreso-390.png` son muestrarios QA de componentes reales; `midnight_express-mesa-{1280,390}.jpg` son el probador del producto y `midnight_express-partida.jpg` una colocación real. `acciones/acciones-reales.webm` muestra acciones del Expreso normal en producto; `colocacion-mano-mesa.webm` usa el escenario QA de Roma. No contienen audio capturado. El resto de imágenes/JSON conserva los casos y límites de cada prueba.

## Rendimiento y pendientes

Las cadenas QA de colocación con CPU ×4 siguen observando tareas largas, incluso con efectos limitados: máximo **356 ms en la pasada final**. Las capturas intermedias alcanzaron 457 y 479 ms. Son muestras únicas sobre servidor de desarrollo y un host compartido; no forman una comparación controlada ni miden el cierre de ronda. No se atribuye una mejora porcentual a SVG/memo ni se afirma haber eliminado el lag. Los **348 ms de resolución** de la entrega anterior corresponden a otra prueba y siguen abiertos.

Build final: fragmento App de aproximadamente **493,75 kB / 141,08 kB gzip**; CSS principal **130,88 / 20,89 kB gzip**. Las seis texturas conservan sus **7.768 bytes** y se incluyen como recursos pequeños inline. El Expreso añade código vectorial, sin atlas nuevo ni peticiones de imágenes. No hay medición equivalente de consumo GPU/energía.

Prioridades siguientes: perfilar React/layout/composición en cadenas largas antes de aumentar espectáculo; proteger liquidación de perfil ante muerte de proceso; tutorial contextual de mapa/tienda/jefes; revisar siluetas de reliquias a 16 px. Compartir/importar una run reproducible continúa desconectado; el historial copia un resumen. Pendientes también móvil físico, lector de pantalla real y revisión auditiva. Las decisiones de balance y de patrones acumulables no se cambian en este lote.

## Archivos principales

- Arte: `src/engine/expressSkinArt.tsx`, `materialArt.tsx`, `worldSkinArt.tsx`, `tileSkins.tsx`, `src/components/TileView.tsx`, `src/index.css`.
- Movimiento y sonido: `src/engine/tileArrival.ts`, `audio.ts`, `src/components/BossDefeatedOverlay.tsx`, `GameBoard.tsx`.
- Copia: `src/engine/clipboard.ts`, `src/hooks/useClipboard.ts`, `src/components/StatsScreen.tsx`.
- Registro y textos: `src/engine/progression.ts`, `i18n.ts`, `i18nContent.ts`.
- Regresiones: `clipboard.test.ts`, `tileArrival.test.ts`, `MaterialSkins.test.tsx` y contrato de mundos existente; fixtures/scripts `qa/materialExpress*`, `materialChains.browser.mjs`, `clipboardPermission.browser.mjs` y herramientas anteriores actualizadas.

Sin migración de guardado, publicación, commit, gastos o generaciones en Higgsfield. No se han sustituido los recursos ilustrados aprobados.
