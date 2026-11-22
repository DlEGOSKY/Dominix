# Dominix · explicación de puntuación y recibos de recompensa

14 de noviembre de 2026, Europe/Berlin. Rama `codex/dominix-stability-polish`, base `f2a8677d54ffdfa9c97cb55db0f12081c1369db2`. Cambios locales, sin publicación ni migraciones. Continúa [cadenas largas](LONG_CHAINS_2026-11-14.md). Se conserva la UI de mesa y las cartas de recompensa.

## Puntuación consultable

Los puntos previstos de una ficha ahora son un botón de consulta, separado del botón que la juega. Abre un diálogo con marcador actual, total previsto, diferencia y pasos ordenados hasta el nuevo total. Se puede cambiar de extremo entre los legales. Consultar/cerrar no consume acciones ni modifica la mano. Respeta desactivar previsualización; pierde la selección si la ficha desaparece o la ronda termina.

`calculateRunScore` admite un registro opcional de etapas. Se mantienen sus expresiones aritméticas, orden y redondeos; el cálculo habitual no crea filas de explicación. Las etapas incluyen base, longitud, patrones, reliquias, multiplicadores, bonos de build, edición, personaje, celestes, caos, factor de ronda y bonos acumulados/límite mínimo. Los pasos sin cambio se omiten.

`explainTileScore` usa `playRoundTile` con las mismas opciones de comodín, congelación, duplicación de score, jefe y restricciones que la jugada. Reconstruye el total posterior mediante el motor, sin estimación alternativa en UI. Las pruebas reconcilian los pasos desde cero hasta el total y el incremento con la jugada efectiva.

La explicación no atribuye una ganancia aislada a cada sistema: los multiplicadores se aplican secuencialmente y los bonos acumulados pueden incluir pactos, eventos y efectos de una sola vez. Esto se aclara en el diálogo. Los bonos planos de talentos/familias/partida están agrupados. No hay todavía una lista de contribución individual por reliquia ni una procedencia detallada de cada punto acumulado.

El diálogo reutiliza `ResourceSheet`, ampliado con un modo que permanece abierto en escritorio y se centra allí. Las hojas de recursos conservan su comportamiento móvil anterior. Mantiene cierre con Escape, fondo inerte y devolución de foco.

## Recompensas confirmadas

`GameBoard` guarda una intención de elección y observa el inventario/set después del cambio. `rewardWasDelivered` comprueba el tipo y el recurso seleccionado antes de mostrar `RewardReceipt`:

- Reliquia, celeste y mutación: aumento del recurso correspondiente.
- Consumible: nueva lista y último recurso correspondiente; reconoce reemplazos aunque todos los IDs sean iguales.
- Eliminación/duplicación: cambio de tamaño del set; conversión: valores realmente distintos.

El recibo indica el nombre y, cuando procede, el consumible sustituido. Usa anuncio de estado, botón Cerrar y desaparición a los seis segundos. Se muestra mediante portal también al entrar en tienda, evento o mapa. No añade un paso obligatorio a la partida ni concede recursos extra.

Se rechazan elecciones fuera de recompensa, opciones ajenas y solicitudes repetidas mientras otra está pendiente. Cancelar el selector o saltar limpia la intención. Un cambio sin efecto no genera recibo y tampoco bloquea la siguiente recompensa al salir de esa fase. Las reglas de recompensa y pago anteriores se mantienen.

## Verificación

- **264 pruebas correctas en 16 archivos**, con workers de hilos. Dieciséis casos nuevos: seis de reconciliación del score/estado inmutable, cuatro ediciones con pacto y multiplicadores, restricciones, recurso ausente y límite cero; diez casos de entrega real frente a inventario sin cambios, recurso equivocado, reemplazo y conversión sin efecto.
- Lint, compilación/TypeScript de producción, TypeScript de QA y `git diff --check`: correctos. Avisos anteriores de Browserslist antiguo y LF/CRLF en HomeScreen.
- Build final: índice **502,22 kB / 142,06 kB gzip**; CSS **132,88 kB / 20,83 kB gzip**. No se añadieron dependencias. No se midieron FPS ni memoria en dispositivo físico.
- `qa/scoreExplanation.browser.mjs`: ES/EN a 1280×900 y 390×900, desde la Mesa táctica preparada. Total 20→501, incremento +481 y última fila 501. Comprobados cambio de extremo, Escape, retorno del foco y marcador conservado en 20 tras consultar. Sin desbordamiento horizontal ni excepciones `pageerror`. No se declara una auditoría de toda la consola.
- Producción: perfil temporal vacío, Colección→Imperium→Endless. Jugadas 3|6, 4|6 y 3|4: marcadores 35/45/228, previsualizaciones coincidentes. Se cerró la ronda y se eligió **Double Crown**. Se observó inventario de dos reliquias frente a una inicial, recibo `Received: Double Crown`, avance a ronda 2 y cierre del recibo. Capturas de escritorio y móvil. No se completó una run ni se probó cada tipo de recompensa en producción.
- El primer intento del script de producción intentaba convertir todo el texto nuevo `+35 ?` a número y obtuvo NaN; se corrigió el lector del script para extraer el número. Ese intento no demuestra un fallo de puntuación.

Los servidores 5176/5178 ya estaban activos y se reutilizaron. Se utilizó Chrome aislado con Playwright existente, sin perfiles/guardados personales. No hubo gastos ni generación de imágenes.

## Archivos y evidencias

Motor: `runScore.ts`, nuevos `scoreExplanation.ts`, `rewardFeedback.ts`. UI: `Hand.tsx`, `GameBoard.tsx`, `ResourceSheet.tsx`, `RewardScreen.tsx` (atributo de tipo para inspección), nuevos `ScoreExplanationView.tsx` y `RewardReceipt.tsx`, `i18n.ts`, `index.css`.

Pruebas: `runRegression.test.ts`, nuevo `rewardFeedback.test.ts`. QA: `uiTactical.tsx` conecta el explicador real y nuevo `scoreExplanation.browser.mjs`, con los mismos argumentos de módulo Playwright, ejecutable Chrome y carpeta de capturas que los scripts anteriores.

En `outputs/dominix-review/`:

- `explicacion-{es,en}-{1280,390}-2026-11-14.jpg` y `explicacion-verificacion-2026-11-14.json`: escenario QA. Se inspeccionó visualmente la captura española móvil.
- `recompensa-confirmada-2026-11-14.jpg`, `recompensa-confirmada-movil-2026-11-14.jpg`, `recompensa-real-verificacion-2026-11-14.json` y `verify-reward-production-2026-11-14.mjs`: flujo natural de prueba. Las capturas conservan la transición a ronda 2 visible detrás del recibo; no representan un estado de mesa en reposo. La sincronización de esa transición queda pendiente.

## Límites y siguiente paso

Quedan por comprobar en navegador los casos de gran puntuación, deltas negativos, todas las combinaciones de jefe/mutaciones y la entrega de cada tipo de recompensa. Los reemplazos y cambios del set están protegidos por pruebas unitarias, sin acreditar su flujo completo de UI. La procedencia individual de bonos acumulados, traducción integral y accesibilidad con lector de pantalla siguen pendientes, junto con los pendientes generales de reanudación/PWA/balance.

Siguiente paso: recorrer consumibles y mejoras del set con inventario real y comprobar explicaciones con efectos negativos y jefes. No se añade otra colección ni otra mecánica en esta entrega.
