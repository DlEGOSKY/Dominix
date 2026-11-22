# Dominix · paneles de recursos y teclado

13 de noviembre de 2026. Rama `codex/dominix-stability-polish`, base `f2a8677d54ffdfa9c97cb55db0f12081c1369db2`. Continuación de [contraste e insignias](UI_DETAILS_2026-11-13.md). Cambios locales sin publicación ni modificación de guardados o reglas.

## Hallazgos y correcciones

La lectura de `MobileInfoBar` demuestra que la hoja anterior eran dos divs animados, sin diálogo accesible, Escape, contención ni devolución de foco. Son carencias demostradas por código; no se atribuye una reproducción interactiva a aquella versión anterior.

El nuevo `ResourceSheet` utiliza un diálogo nativo presentado con `showModal()` y un portal al cuerpo del documento, evitando depender de la geometría de los ancestros animados de la mesa. Mantiene fondo, bordes y posición inferior. El navegador hace inerte el fondo y contiene la navegación de foco. Se enfoca el primer control, Cerrar; Escape, Cerrar y clic en el fondo descartan la hoja. El foco vuelve al botón de origen si sigue conectado y visible. Se bloquea el desplazamiento del cuerpo mientras está abierta y se restaura su valor anterior al salir. Al alcanzar 640 px se cierra para no dejar un modal invisible en el diseño de escritorio.

Las pestañas anuncian que abren un diálogo y si están expandidas. La hoja tiene título accesible, límite de altura de 75dvh y margen de área segura. Se elimina el desplazamiento animado de entrada/salida: apertura inmediata, también con movimiento reducido. Se aclaran/traducen estados vacíos y Usar; sube el contraste de las descripciones. Los nombres y descripciones de consumibles/celestes/mutaciones mantienen sus fuentes anteriores; no se declara traducido todo su contenido.

No se reescribió Tooltip: su comportamiento de foco/Escape existente se comprobó en las ayudas de cadena. El contraste integral, lectores de pantalla y todas las ubicaciones de tooltip siguen pendientes.

## Verificación

- **241 pruebas existentes correctas en 14 archivos**. No se presentan como pruebas nuevas de foco: estas comprobaciones requieren navegador.
- Nuevo script de regresión **`qa/resourcePanels.browser.mjs`**, sin dependencia añadida. Dos escenarios completos ES/EN a 390×844, con preferencia reducida en ES y normal en EN. Comprueba estado vacío, título de diálogo, fondo inerte, Tab, Escape, devolución del foco, desbloqueo de desplazamiento, botón Cerrar, clic fuera, cierre al ampliar a 844×390 y callback de uso de un consumible de muestra. También abre/cierra una ayuda de cadena con foco/Escape.
- En la navegación con Tab se permite el foco intermedio del navegador/cuerpo; se comprueba que los controles de partida no reciban foco. No equivale a una auditoría con lector de pantalla.
- El consumible de QA registra el callback y desaparece de la muestra. **No aplica efectos de partida ni acredita la economía o el consumo real de GameBoard.** Los componentes de hoja/pestañas son los mismos del producto. Esta tanda prueba el flujo en el host QA; no se completa una partida natural ni se verifica el flujo de todas las mutaciones.
- Ninguna excepción `pageerror` en los dos escenarios. No se registra exhaustivamente la consola en este script; permanece conocido el 404 del favicon QA de la revisión anterior.
- `npm run lint`, compilación/TypeScript de producción y TypeScript de QA: correctos. `git diff --check`: sin errores; aviso anterior LF/CRLF en HomeScreen.
- Bundle principal: 491,69 kB / 139,01 kB gzip; CSS 131,49 kB / 20,46 kB gzip. No son mediciones de FPS. Se conserva el aviso de Browserslist antiguo.

Se intentó conectar el navegador integrado mediante CUA, pero agotó el tiempo de conexión. Se usó la alternativa de prueba aislada ya disponible, Playwright con Chrome local y perfiles temporales vacíos. No se utilizaron sesiones ni progreso personal. No hay compras, créditos consumidos ni imágenes generadas.

## Capturas y archivos

En `outputs/dominix-review/`, fuera del repositorio: `recursos-vacio-{es,en}-2026-11-13.jpg`, `recursos-reliquias-{es,en}-2026-11-13.jpg`, `recursos-consumible-{es,en}-2026-11-13.jpg` y `recursos-verificacion-2026-11-13.json`. Son capturas directas del host QA; no son capturas de una partida natural. Se inspeccionaron visualmente los casos españoles vacío y reliquias.

Producto: nuevo `src/components/ResourceSheet.tsx`, `MobileInfoBar.tsx`, `src/index.css`, `src/engine/i18n.ts`. QA: `qa/uiTactical.tsx`, nuevo `qa/resourcePanels.browser.mjs` y README de QA. Informes e índice actualizados. La vista QA permite preparar un consumible de muestra y deja explícito que su callback no altera la partida.

Siguiente paso: probar el panel durante una partida con inventario real, varias mejoras y contenido largo, incluyendo mutaciones bloqueadas por coste. Pendientes generales: traducción completa, dispositivos físicos, lector de pantalla, PWA, reanudación y balance prolongado. No se marcan resueltos en esta entrega.
