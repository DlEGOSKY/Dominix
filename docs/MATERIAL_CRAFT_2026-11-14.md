# Dominix · acabados de material y colocación

14 de noviembre de 2026 (Europe/Berlin). Rama `codex/dominix-stability-polish`; base `f2a8677d54ffdfa9c97cb55db0f12081c1369db2`. Cambios locales, sin publicación. Continúa [paneles de recursos](RESOURCE_PANELS_2026-11-13.md) y desarrolla los materiales ya integrados.

## Dirección e implementación

Se conservan la UI, geometría de ficha, numeración, paleta y texturas de Higgsfield. Los acabados nuevos son SVG propios en `materialArt.tsx`, con trazos concentrados en bordes y esquinas:

- **Imperium:** herrajes de bronce, greca angular, hojas de laurel y pequeños remates laterales. Se sustituye su ornamentación vectorial anterior.
- **Marfil:** grabado fino y escuadras discretas, conservando puntos oscuros y centro claro.
- **Esmeralda:** biseles verdes y cortes laterales, sin trama nueva sobre los valores.
- **Diamante:** facetas periféricas y dos reflejos estáticos. No hay destellos continuos.

Los recursos se integran en `MaterialSurface`, usado por las fichas reales de mano/cadena y por Colección. La capa de material sigue al 20 % en tipos especiales para priorizar su señal táctica. Rubí/Obsidiana conservan sus superficies anteriores. No cambian desbloqueos, IDs, valores, puntuación, inventario ni guardados.

## Colocación

La ficha añadida entra desde una altura de 10 px y escala 0,94, con desplazamiento lateral según el borde; sustituye la entrada anterior de escala 0,5. Un contorno local aparece durante **340 ms**, una vez, con eventos de puntero desactivados. No añade temporizadores, partículas, bucles ambientales ni bloqueos de control. Las fichas ya montadas no vuelven a pulsar al actualizar controles. El brillo de patrón conserva su comportamiento anterior; se restablecen ambos ejes también en esa rama.

Con movimiento reducido se omiten entrada, redistribución y contorno. Existe además una regla CSS de protección para la preferencia del sistema. Esta revisión no añade audio de material ni nuevas colecciones.

## Comprobaciones y evidencia

- **245 pruebas correctas en 14 archivos:** cuatro casos nuevos de acabado cosmético/valores y ampliación del caso de cadena con movimiento reducido. El resto protege las reglas, progresión y materiales ya existentes.
- `npm run build`, lint y TypeScript de QA correctos. `git diff --check` sin errores; aviso anterior de LF/CRLF en HomeScreen. Continúa el aviso de Browserslist antiguo.
- Bundle principal **493,04 kB / 139,40 kB gzip**; CSS **131,96 kB / 20,58 kB gzip**. Incrementos aproximados frente a la entrega de recursos: +0,39 kB y +0,12 kB gzip. Sin nuevos mapas de bits ni peticiones de textura. No son medidas de FPS.
- Nuevo `qa/materialCraft.browser.mjs`, ejecutado con Playwright existente y Chrome aislado: compara muestras a 1280 y 390 px, captura texturas/acabados y estados especiales. La galería móvil no presenta desbordamiento horizontal. Las imágenes de Imperium y la galería móvil fueron inspeccionadas visualmente.
- QA con movimiento normal: una colocación izquierda 1|4 produce **un solo evento** `placement-settle`; los tres contornos montados terminan con opacidad cero e iteración única. Cambiar la restricción de comodín no reinicia el efecto. Con movimiento reducido no se monta ningún contorno ni se registran eventos de ese efecto. No equivale a validar todos los efectos con todas las preferencias.
- En ambas preferencias, previsualización +481, marcador 20→501 y deshacer→20. Es un escenario preparado con componentes/motor reales, no una partida natural.
- Partida natural adicional en compilación de producción, perfil temporal vacío, Colección→Imperium→Endless. Fichas 0|3, 0|2 y 3|6; deltas +35/+10/+35 y marcadores 35/45/80. Nueve acciones restantes. Capturas a 1440 px y 390×844; ancho móvil 390=390, sin desbordamiento horizontal. Sin excepciones ni errores de consola registrados. No se cerró la ronda ni se completó una run.
- En QA solo se registran excepciones `pageerror`, ninguna observada; no se declara toda la consola libre de avisos. El favicon faltante documentado anteriormente sigue pendiente.

La galería compara **la misma textura sin el SVG y con el SVG actual**; no es una comparación exacta entre dos versiones completas de Dominix, en particular en Imperium cuya ornamentación anterior se sustituyó. La cabecera identifica los datos QA. No se gastaron créditos ni se accedió a facturación de Higgsfield: para grabados precisos y capas ligeras se eligió código nativo, reutilizando las imágenes autorizadas anteriormente.

## Archivos y capturas

Producto: `src/engine/materialArt.tsx`, `src/components/Chain.tsx`, `src/index.css`. Pruebas: `MaterialSkins.test.tsx`, `TacticalTiles.test.tsx`. QA: nuevo `qa/uiCraft.tsx`, pestaña Acabados en `qa/ui.tsx`, nuevo `qa/materialCraft.browser.mjs` (mismos argumentos de módulo Playwright, ejecutable Chrome y carpeta de salida que el script de recursos). No se añaden dependencias.

Evidencias externas en `outputs/dominix-review/`:

- `imperium-taller-2026-11-14.jpg`, `materiales-taller-escritorio-2026-11-14.jpg`, `materiales-taller-movil-2026-11-14.jpg`: muestras QA.
- `materiales-taller-verificacion-2026-11-14.json`: eventos y resultados de movimiento normal/reducido.
- `imperium-craft-partida-escritorio-2026-11-14.jpg`, `imperium-craft-partida-movil-2026-11-14.jpg`: partida natural.
- `capture-craft-production-2026-11-14.mjs`, `craft-partida-captura-2026-11-14.json`: captura y resultados de producción. Los timestamps JSON están en UTC; la fecha de entrega es la local indicada arriba.

## Límites y siguiente paso

No se midieron rendimiento físico/FPS ni todas las combinaciones de materiales, ediciones, valores y jefes. La sensación del movimiento requiere valoración del jugador; se comprobaron duración, eventos y reglas, no satisfacción subjetiva. No se ha validado audio nuevo, reanudación ni desbloqueos cosméticos adicionales.

Siguiente paso lógico: valorar los acabados a tamaño real y probar la colocación en cadenas largas y ambos extremos antes de ampliar relieves o variantes. Los pendientes de accesibilidad completa, traducción, PWA y balance de los informes anteriores se conservan.
