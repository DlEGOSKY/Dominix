# Recompensas y resultados — 9 de noviembre de 2026

Continuación de [UI_POLISH_2026-11-09.md](UI_POLISH_2026-11-09.md). Rama `codex/dominix-stability-polish`, base `f2a8677d54ffdfa9c97cb55db0f12081c1369db2`. Cambios locales, sin commit, push ni despliegue.

## Criterio visual

Se conservan las tarjetas, composición, iconos de reliquias, tipografía sans y paleta original. El pulido añade información útil para decidir y mejora contraste, foco y lectura en pantallas estrechas. No se generan imágenes nuevas ni se consumen créditos de Higgsfield en esta tanda; los recursos anteriores permanecen integrados.

## Hallazgos y correcciones

| Evidencia | Hallazgo | Resultado |
| --- | --- | --- |
| Demostrado por el handler de GameBoard; aviso verificado con datos QA | Si hay dos consumibles, elegir otro elimina el más antiguo sin explicarlo antes. | La tarjeta avisa de los huecos llenos y nombra el consumible que se reemplazará. GameBoard aporta el nombre según el inventario real; la UI no decide qué eliminar. La política de inventario no cambia. |
| Lectura y revisión visual QA/producción | La familia figuraba como etiqueta; completar una sinergia no era visible al comparar recompensas. | Se muestra el avance hasta tres reliquias y el bonus al alcanzar el umbral. Distingue «Activa sinergia» de «Sinergia ya activa», sin anunciar otro bonus al superar tres. Usa `getFamilyCounts` del motor. |
| Decisión de presentación | La opción central se agrandaba por su posición, sin criterio táctico que la recomendase. | Todas las opciones parten de la misma escala; rareza y familia conservan sus colores. |
| Demostrado por lectura y reproducido en QA | Los resultados estaban montados con opacidad cero durante el recap; sus botones podían recibir foco. | El contenido se monta al terminar las presentaciones. En el resumen activo, la consulta real encontró cero botones «Nueva Run». Al llegar a resultados, el foco pasa al título. |
| Demostrado por código y verificado en navegador | El gráfico era únicamente visual, con rótulos pequeños y una demora creciente de 60 ms por ronda. | Tabla desplegable accesible con los valores exactos y profundidades reales; también para una sola ronda y scores cero. El gráfico largo se desplaza dentro del panel y su aparición termina en aproximadamente un segundo, independientemente del número de barras. Con movimiento reducido, las barras se muestran directamente. |
| Revisión visual y lectura de código | Etiquetas de resultados muy atenuadas; cifras grandes y botones sin ajuste suficiente para vistas estrechas. La barra de XP simulaba un inicio en el nivel final restando toda la XP ganada. | Contraste mayor, cifras/acciones adaptables y barra del estado final real con semántica de progreso. Se conserva la etiqueta de XP ganada; no se inventa una transición entre niveles. |

Las reliquias ofrecidas usan su contenido localizado. Los textos nuevos están en español e inglés. Quedan traducciones antiguas de consumibles, poderes, algunos rótulos de iconos y celestes: no se afirma una localización completa.

## Comprobaciones realizadas

- **150 pruebas / ocho archivos**, incluidas cuatro regresiones nuevas en `RewardResults.test.tsx`: completar o tener ya activa una familia, aviso de sustitución, ausencia de navegación invisible durante el resumen y scores cero con profundidades reales. Son comprobaciones de salida HTML con React DOM Server; las interacciones se comprobaron aparte en navegador.
- Lint, TypeScript de producción, TypeScript independiente de QA, build y `git diff --check`: correctos. Sin nuevas dependencias ni cambios del lockfile. Sigue el aviso existente de Browserslist anticuado.
- Build final: JS principal **453,86 kB / 121,66 kB gzip**; chunk de resultados **33,73 kB / 8,79 kB gzip**; CSS **123,98 kB / 19,25 kB gzip**. No se midieron FPS, memoria ni rendimiento en un teléfono físico.
- Producción local: Endless, Arquitecto, semilla `LSQ74H`; colocación 0|0, score 35, cierre y entrada en recompensas. Colmillo Triple y Hexagrama Sagrado muestran 0/3 → 1/3 en sus familias. Entrar en Convertir número y cancelar conserva las tres opciones y devuelve el foco al título. Consola sin errores ni avisos capturados. No se terminó esa partida ni se añadió un resultado de prueba al progreso.
- QA, seis recompensas preparadas: Corona Alta completa Número 2/3 → 3/3 y anuncia +30 por ronda; Impulso Inicial pasa de Fuerza 0/3 → 1/3. Espejo avisa que reemplaza Recarga. Tab mueve el foco al consumible, lo desplaza a la vista y permite leer el aviso antes de elegirlo. El callback de esta vista es de muestra: no acredita una sustitución natural de inventario completo.
- QA, resultados normales: tabla con `[153, 211, 1731, 3857, 1412, 0]` en profundidades `[2, 3, 4, 5, 6, 7]`, suma 7364 y media 1227. Las seis entradas son consultables; la última conserva el cero. Esta fixture reutiliza cifras conocidas con profundidades preparadas; no es una nueva partida semanal natural.
- QA, resultado vacío: una ronda con score 0, cero rondas completadas y +0 XP. QA largo: **80 entradas**, tabla de 81 filas con cabecera, última profundidad 81 y score 0; total **39.010.200**. Son datos artificiales para layout, no evidencia de balance ni de XP obtenida jugando 80 rondas.
- Revisión a **1280 × 720**, **1280 × 900** y **390 × 844**, medidas sobre el viewport real. En móvil largo: documento de 386 px y ancho desplazable 386 px; gráfico de 960 px dentro de un panel de 321 px con scroll propio. No desborda horizontalmente la página. Las opciones numerosas necesitan desplazamiento vertical dentro de recompensas.
- Movimiento reducido: resultados sin recap, texto completo y barras ya visibles; con movimiento normal se comprobó el resumen activo, su botón Saltar y la llegada a resultados con foco en el título. No se certificó el recorrido de todos los overlays de victoria y desbloqueos.
- QA final sin errores de aplicación capturados; queda el aviso informativo de Framer Motion de que movimiento reducido está habilitado. Hubo un error de importación en la preparación inicial de la fixture, corregido antes de estas comprobaciones; no forma parte de la build.

## Evidencias

En `outputs/dominix-review`, fuera del repositorio:

- `recompensas-partida-real-final.jpg`: las tres opciones dentro de la partida de producción descrita.
- `recompensas-contexto-escritorio.jpg`, `recompensas-contexto-movil.jpg`, `recompensas-consumible-reemplazo.jpg`, `recompensas-reemplazo-movil.jpg`: componentes reales con datos QA, no partidas naturales.
- `resultados-resumen-escritorio.jpg`, `resultados-detalle-escritorio.jpg`, `resultados-detalle-movil.jpg`, `resultados-cero.jpg`, `resultados-80-rondas.jpg`, `resultados-largos-movil.jpg`: resultados QA preparados.
- `recompensas-resultados-consola.json`: registros finales capturados.

Algunas capturas QA incluyen su cabecera de pruebas, que no existe en el producto. Los resultados largos verifican distribución y consulta de datos; no deben presentarse como una victoria real. Para revisar la progresión sin tocar el juego, la vista QA prepara 493 XP/nivel 3 únicamente en su origen `127.0.0.1:5178`; no escribe los guardados de `127.0.0.1:5176`.

## Archivos y siguiente paso

Archivos de producto: `RewardScreen.tsx`, `GameOverScreen.tsx`, dos props de contexto en `GameBoard.tsx` e `i18n.ts`. Verificación: `RewardResults.test.tsx`, `qa/ui.tsx`, `qa/uiFixtures.ts` y su documentación. No se alteran reglas de puntuación, guardados ni cálculos de XP.

Siguen pendientes una sustitución de consumible con inventario lleno en una partida natural, el balance prolongado y la revisión completa de las pantallas de mutación y recompensa de jefe. Reanudar partidas, PWA offline y traducción/accesibilidad completas siguen en el informe general. El siguiente paso de UI es pulir los selectores de fichas y conversión de números, manteniendo su funcionamiento y composición; no se implementa aquí ese cambio.
