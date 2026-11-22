# Dominix · contraste, idioma e insignias

13 de noviembre de 2026. Continúa [lectura táctica](TACTICAL_READABILITY_2026-11-13.md). Rama local `codex/dominix-stability-polish`, HEAD `f2a8677d54ffdfa9c97cb55db0f12081c1369db2`. Cambios sin commit ni publicación; los guardados y el motor de juego se conservan.

## Cambios implementados

- **Marcador:** ronda, meta, puntos restantes, exceso y anuncio accesible en ES/EN. Exactamente en la meta aparece «Meta alcanzada», sustituyendo «+0 sobre meta». Se elimina el porcentaje duplicado. Progreso accesible y limitado a su máximo, conservando el score real; meta cero no produce NaN. Rótulos/estado a 11 px y tonos más claros. Movimiento reducido omite entrada de ronda, crecimiento de barra y escalado del marcador.
- **Desglose:** `ScoreSummary` mantiene los valores anteriores, a 11 px con colores más legibles. Se identifica como desglose de cadena, con aclaración de que precede a otros efectos de partida. No sustituye al total ni al delta de ficha, que sí incluye el contexto de build. No se modifica el cálculo de puntuación.
- **Idioma y contraste:** cierre de cadena, robo, resultados, fin de run, acto y ayuda de semilla usan las traducciones existentes o nuevas. Se hace más visible Cerrar cadena, la semilla y el título de reliquias. Las pestañas móviles respetan el idioma y sus estados vacíos mantienen texto legible. Esto no constituye una traducción integral del juego.
- **Acciones:** nombres accesibles con recurso y cantidad. Huecos compactados sin reducir los números. Robar/Deshacer tienen altura mínima de 44 px. A 390 px comparten fila con los contadores; por debajo de 380 px el contador ocupa una fila y ambos botones comparten la siguiente.
- **Ediciones:** cuatro símbolos SVG propios sobre bandas opacas, conservando el color del acabado. Nombres breves Foil/Holo/Poli o Poly/Neg y ayuda con el nombre completo. El símbolo negativo identifica el acabado, no una penalización de puntos/acciones. Se mantienen reglas y valores de ficha.
- **Tipos:** rótulos de Comodín, Espejo y Bomba algo mayores. Abreviaturas en tamaño pequeño reservan espacio para el Pacto; el nombre accesible conserva el tipo completo.

Se conservan portada, paleta azul/violeta, tipografía, composición de mesa, tamaños de ficha y materiales. Sin pantallas nuevas de producto, dependencias, mecánicas ni compras.

## Evidencia de los problemas

| Clasificación | Problema y corrección |
| --- | --- |
| Demostrado en código y capturas anteriores | Textos directos en español aparecían junto a componentes traducidos. Se unifican las etiquetas intervenidas con i18n. |
| Observado visualmente | Desglose a 30–45 % de opacidad demasiado tenue. Se aumenta contraste/tamaño; no se afirma conformidad WCAG de toda la UI. |
| Reproducido en navegador durante el cambio | Bomba invadía Pacto en ficha de 50 px. Abreviatura Bom./Bomb; medición posterior sin intersección entre las insignias etiquetadas de tipo y Pacto en las muestras. |
| Reproducido en navegador durante el cambio | Deshacer quedaba solo en segunda fila a 390 px. Se compacta el contador y se define distribución para menos de 380 px. |
| Decisión de presentación | Símbolo y nombre breve por edición para distinguirlas sin depender exclusivamente del color. No se traducen IDs ni se migran guardados. |

## Verificación automática

- **241 pruebas correctas en 14 archivos**, incluidas 14 nuevas en `BoardReadability.test.tsx`: ES/EN, cantidades accesibles, meta alcanzada, progreso máximo/cero, primer render con movimiento reducido y conservación de valores/tipo/pacto bajo las insignias. Las comprobaciones antiguas de Wild se ajustan al texto español y a las abreviaturas, conservando el control de identidad por tipo.
- `npm run lint`, `npm run build` (incluye TypeScript) y TypeScript de QA: correctos.
- `git diff --check`: sin errores; aviso previo LF/CRLF en HomeScreen.
- Bundle principal final **490,63 kB / 138,52 kB gzip**; CSS **131,26 kB / 20,36 kB gzip**. Aproximadamente +1,12 kB gzip de JS y +0,04 kB de CSS frente a la tanda anterior. No son métricas de FPS/carga en teléfono. Sigue el aviso de Browserslist antiguo, sin actualizar dependencias.

## Navegador, partidas y capturas

Se reutiliza Playwright incluido en el runtime con **Chrome 157 headless**, perfiles temporales vacíos y preferencia de movimiento reducido. El control del navegador integrado sigue sin estar expuesto. No se utilizan sesiones ni guardados personales.

- QA: seis tipos en dos tamaños con edición/Pacto, a 1280 y 390 px, en ES y EN: **48 muestras**. Sin recortes del texto de edición ni invasión de Pacto por las insignias etiquetadas. Es una selección preparada, no la combinación exhaustiva de todas las skins/tipos/ediciones/valores. Capturas inspeccionadas visualmente.
- Producción: Colección → Skins → Imperium → Equipar → Endless en perfiles ES y EN separados. Mano y semilla naturales. Tres colocaciones por perfil: ES +35/+10/+35 y marcadores **35/45/80**; EN +35/+10/+246 y marcadores **35/45/291**. Nueve acciones restantes en ambos. Los incrementos coinciden con sus previsualizaciones. No se cierra la ronda ni se completa una run.
- Capturas a **1440×1000**, **390×844** y **320×740**. Revisión adicional a **844×390**. Sin desbordamiento horizontal en los estados observados. Robar/Deshacer miden 44 px de alto; a 390 px están en la misma fila y a 320 px comparten la segunda. Son viewports de navegador, no dispositivos físicos. La primera captura de 320 px tomada inmediatamente tras cambiar el tamaño mostraba parcialmente la última fila. Se repitió esperando el ajuste y desplazando la última ficha a la vista: su centro pasa la comprobación de visibilidad y la captura de la mano la muestra completa. Se conserva `ui-detalle-{es,en}-320-mano-2026-11-13.jpg` como evidencia adicional; no se atribuye aquel primer recorte al motor del juego.
- Producción: sin errores de aplicación ni consola en las páginas registradas. QA conserva el 404 conocido de `/favicon.ico`, ajeno a las texturas; su consola no se declara completamente limpia.

Evidencias externas en `outputs/dominix-review/`:

- `ui-detalle-es-escritorio-2026-11-13.jpg`, `ui-detalle-es-movil-2026-11-13.jpg`, `ui-detalle-es-320-2026-11-13.jpg`; equivalentes `ui-detalle-en-` para inglés.
- `ediciones-imperium-{es,en}-{1280,390}-2026-11-13.jpg`: recortes directos del componente QA, sin retoque.
- `verify-ui-detail-2026-11-13.mjs` y `ui-detalle-verificacion-2026-11-13.json`: automatización y resultados finales. Las imágenes no son renders generados ni composiciones.

## Archivos y procedencia

Producto: `ScoreBar.tsx`, nuevo `ScoreSummary.tsx`, `GameBoard.tsx`, `ActionHUD.tsx`, `MobileInfoBar.tsx`, `RelicBar.tsx`, `TileView.tsx`, nuevo `EditionBadge.tsx`, `TileDetails.tsx`, `src/engine/i18n.ts` y `src/index.css`.

Pruebas: nuevo `BoardReadability.test.tsx` y ajustes en `BandaSkin.test.tsx`. QA: `qa/uiMaterials.tsx` añade pares mediano/pequeño. Documentación: este informe, README, índice de auditoría y [procedencia](ASSET_PROVENANCE.md). Los cuatro símbolos se dibujan en código SVG, sin librería/referencia externa ni gasto de créditos.

## Límites y siguiente paso

Siguen pendientes traducción integral, contenidos internos de paneles, algunos textos narrativos y el enlace de salto principal. Nombres propios conservan su forma original. No se han validado lectores de pantalla, contraste de toda la interfaz, todas las animaciones con movimiento normal, dispositivos físicos/FPS, PWA instalada o runs completas en esta tanda. Se mantienen los pendientes generales de reanudación y balance.

Siguiente paso lógico: revisar ayudas y paneles de recursos al teclado/tacto, y después priorizar otra colección de skins a partir de esta evidencia. Esta entrega no rediseña esos paneles ni añade otra colección.
