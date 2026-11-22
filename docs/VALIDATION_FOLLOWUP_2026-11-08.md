# Continuación: primer acto semanal y jefes multifase

8 de noviembre de 2026. Misma base `f2a8677d54ffdfa9c97cb55db0f12081c1369db2`, rama local `codex/dominix-stability-polish`. Esta continuación respeta la corrección del usuario: la identidad y composición de la UI original se mantienen.

## Correcciones nuevas

| Hallazgo | Evidencia | Cambio |
| --- | --- | --- |
| Una fase intermedia se anunciaba como jefe derrotado y mostraba el premio, aunque el handler todavía no pagaba | Demostrado por lectura de la UI y del handler; verificado después en el escenario real de GameBoard | Se muestra Fase superada / Continuar fase, y el premio solo aparece en la fase final. |
| El pago monetario de un jefe multifase ignoraba los puntos de fases previas | Demostrado en `getRoundPayout`: usaba `game.score`, mientras el historial ya sumaba `phaseScore` | Oro calculado a partir de ambas cantidades. Prueba con fase final de menor puntuación y comprobación manual de saldo. |
| Los presupuestos temporales de mano, acciones, descartes y robos desaparecían al pasar de fase | Demostrado en el reparto de fase, que reconstruía solo la configuración base | `roundStartResources` conserva el presupuesto inicial del combate. La edición negativa ganada durante una fase no se replica como una ventaja adicional en la siguiente. |
| Un descuento/penalización para el próximo combate afectaba solo a la primera fase | Demostrado al comparar meta inicial y cálculo de fases posteriores | `roundTargetMultiplier` conserva ese factor durante el encuentro y se restablece en el siguiente combate. Prueba específica de descuento del 10%. |
| Endless permitía terminar desde el cierre de un jefe antes de procesar su recompensa y registro de derrota | Demostrado por lectura del botón y del callback | Ese botón solo se ofrece en cierres sin jefe. El jefe debe pasar por su liquidación; no se convierte una fase intermedia en una ronda completada mediante esa salida. Esta ruta concreta no se jugó manualmente en Endless. |
| El semanal carecía de identificación de modo en la mesa | Observado en la partida semanal | Pequeña etiqueta Semanal / Weekly con el verde de su botón original. |
| BossIntro seguía revelando letras y ejecutando barridos/destellos con movimiento reducido | Demostrado por código; después comprobado en navegador | Nombre completo inmediato, sin cursor, barridos, anillos repetidos ni brillos de botones. Vigneta estática y botón disponible sin demora de entrada. |
| Tooltip no aceptaba la referencia que Framer Motion necesita para `popLayout` | Advertencia de React reproducida en consola de desarrollo al activar patrones | `forwardRef` al contenedor real y limpieza de temporizadores. La misma activación se repitió sin el error. |

No hubo una modificación de la portada, cambio de tipografía ni nueva paleta. Las modificaciones visuales de esta continuación comunican estado o respetan una preferencia del jugador.

## Partida semanal natural

Se jugó desde el inicio en la build de producción, sin alterar reglas, puntos ni inventario. Semana 45 de 2026, tema Tumba de Seis, semilla numérica 202645 / visible `4CD1`, modificador -1 ficha en mano, Arquitecto y 30 de oro. El perfil local ya tenía progresión; no se aplicaron sus ventajas al comienzo del desafío.

| Ronda | Score congelado | Oro obtenido | Observaciones |
| --- | ---: | ---: | --- |
| 1 | 153 | 28 | 0|0 → 0|5 → 5|5. Preview final +108: 45 → 153. Regalo del Destino añade dos fichas al set. |
| 2 | 211 | 66 | 2|6 → 4|6 → 4|4; se probó robo después de colocar. Incluye +30 de reto por cerrar con doble. |
| 3 | 1731 | 214 | 1|3 → 0|1 → 0|5 → 5|6 → 2|6. Incluye +25 del reto. Tienda entra con 338 de oro. |
| 4 | 3857 | 407 | Meta 216 por Respiro; cadena completa de seis fichas con comodín y dorada. |
| 5, Guardián | 1412 | 190 + 50 | Dobles desactivados. Maldición previa eleva meta inicial a 634 y la furia a 697. La ficha bloqueada se habilita al activar patrones y se usa después. |
| 6 | 0 | 0 | Llegada natural al Acto II; cierre vacío deliberado para verificar resultados y guardado. No se intentó completar este acto. |

Compras: Bendición Ancestral 45, Respiro 20, Dorar Ficha 25. Saldo de tienda 338 → 293 → 273 → 248. Tras rondas 4–5: 248 + 407 + 190 + 50 = **895**. Oro ganado de toda la partida: **955**. El regalo del evento volvió a añadir dos fichas antes de ronda 4: set de **32**, mano 6 y reserva 26.

Resultados y exportación coinciden: total **7364**, cinco combates ganados, seis jugados, 22 fichas colocadas, 19 patrones, seis reliquias, tres compras y un jefe. Historial: `[153, 211, 1731, 3857, 1412, 0]` y profundidades `[1, 2, 3, 4, 5, 6]`. El registro semanal guarda un intento, mejor score 7364 y ronda alcanzada 6, conservados tras recargar.

La partida otorgó **304 XP** globales y **227 XP** de maestría. Progresión local: 493 XP, nivel 3, 193/200 dentro del nivel. Los personajes guardados son únicamente Arquitecto y Bombardero: el Guardián no desbloqueó los requisitos de otros jefes. La ascensión permaneció `{ highestCleared: 0, selected: 0 }`.

Tras ganar esa progresión y desbloqueos se inició otra vez el semanal: misma semilla, meta, seis fichas y 30 de oro. Mano observada antes y después: `0|0, 1|1, 0|5, 2|6, 5|5, 4|6`. Esta prueba acredita el inicio reproducible y el recorrido descrito; no demuestra reproducción de todas las semanas ni independencia de futuras versiones.

## Encuentro multifase aislado

El primer jefe multifase de la rotación aparece en ronda 65. Para probar su UI sin confundir una prueba técnica con una victoria natural, se creó el servidor de desarrollo explícito de [qa/README.md](../qa/README.md). Usa GameBoard y sus handlers reales con estado inicial preparado: Inquisidor, nueve fichas, tres reliquias y metas ×0,001. No ejecuta el guardado de resultados de App. No está importado por el entrypoint de producción; se comprobó que la build no incluye el host ni su código de preparación.

Resultados reproducidos dos veces:

- Fase 1: meta 129, comodín desactivado, nueve fichas y 35 acciones. Una colocación y cierre: **545** puntos. Pantalla Phase cleared / Next phase, **sin premio monetario**.
- Fase 2: conserva nueve fichas y 35 acciones, score reiniciado a cero; comodín ahora permitido y condición mínima de cuatro fichas. Secuencia 0|1 → 1|2 → 2|3 → 3|4: **3262** puntos. La furia lleva meta de 106 a 117.
- Cierre final: **3807** puntos acumulados, anticipo de **585** de oro más **65** del jefe. Saldo **30 → 680**. El siguiente combate ya tiene mano base 7 y 32 acciones, sin conservar los bonus temporales.
- Tras el evento Sacrificio y una derrota deliberada en ronda 66, el callback entrega una ronda ganada, un Inquisidor derrotado, `roundScores: [3807, 30]`, `roundNumbers: [65, 66]`, total 3837 y 650 de oro ganado. Las fases no crean dos entradas ni dos victorias.

No se afirma que el encuentro sea superable con esa build y metas naturales en ronda 65. Tampoco sustituye una prueba de balance del resto de jefes. El tope mínimo de cuatro fichas, aun superando la meta con una sola, está protegido por una prueba del motor.

Movimiento reducido se comprobó en el mismo host: nombre completo como un único texto, cero letras animadas y cero líneas de barrido, con la clase de preferencia aplicada. La consola de desarrollo posterior al arreglo del tooltip no registra errores; queda la advertencia informativa de Framer Motion de que movimiento reducido está habilitado. Los avisos anteriores de referencia y del remontaje del host durante HMR fueron corregidos; se distinguen de esa ejecución final.

## Guardados y descarga

Se exportó el progreso local tras la partida, se analizaron los datos visibles en el textarea y se contrastaron con la pantalla de resultados. Además se descargó realmente `dominix-backup-2026-11-08.txt`: **4008 bytes**, idéntico al código de copia de seguridad visible. Se conserva una copia de evidencia fuera del repositorio. No se borraron datos del sitio público ni se importó el escenario QA a ese origen.

## Higgsfield: acceso confirmado y recurso integrado

La integración se conectó durante esta continuación y respondió a saldo, estimación y generación. Una imagen 16:9 con el modelo predeterminado se cotizó en **0,25 créditos**, importe autorizado por el usuario. La ejecución respondió `Requires basic plan or higher.`. No devolvió trabajo ni archivo; el saldo posterior seguía en **10 créditos**. No se contrató ningún servicio ni se activó una prueba.

Tras habilitarse la cuenta se confirmó la elegibilidad del modelo y se volvió a cotizar el mismo encargo en 0,25 créditos. Con la autorización existente se completó **una sola imagen**, trabajo `3f9e60fa-75c9-47ee-96e1-4eafce14cf30`, y se verificó ese consumo. El [registro actualizado](BOSS_ART_BRIEF.md) conserva el prompt y ambos resultados reales.

El fondo se integra únicamente en BossIntro, sin cambiar portada ni composición. Se optimizó a WebP 1280 × 716, 19214 bytes, y 640 × 358, 6226 bytes. Se comprobó en navegador que `<picture>` carga cada versión a su tamaño, la legibilidad de los textos, el recorte vertical y la entrada al combate. Capturas: `higgsfield-jefe-escritorio.jpg` y `higgsfield-jefe-movil.jpg`; son vistas del componente en QA, no una victoria natural. La textura de mesa de ImageGen se conserva.

## Verificaciones y archivos

- **146 pruebas / siete archivos** correctos; cuatro regresiones nuevas sobre presupuestos de fases, pago agregado, longitud mínima y factor de meta.
- TypeScript estricto y build de Vite correctos; lint correcto. El host QA también pasa su comprobación TypeScript independiente con `node node_modules/typescript/bin/tsc --project qa/tsconfig.json --noEmit`.
- `git diff --check` correcto. La build no contiene los identificadores del host QA.
- Mesa semanal final a 390 × 844: ancho de documento 386 y ancho desplazable 386, sin desbordamiento horizontal; etiqueta Semanal visible. Consola de producción del recorrido semanal: cero avisos y errores capturados.
- Build final con el fondo de Higgsfield: JavaScript principal 448,74 kB / 119,80 kB gzip; CSS 123,38 kB / 19,05 kB gzip; textura 3,84 kB y fondos de jefe 19,21 / 6,23 kB separados. Se repitieron test (146 correctos), build, lint y TypeScript QA tras integrar los archivos. Sigue el aviso de antigüedad de Browserslist. No son mediciones de FPS o memoria.
- No se añadieron dependencias ni se modificó el lockfile. Cambios locales, sin commit, push ni despliegue.

Archivos principales de esta continuación: `runState.ts`, `shop.ts`, `runRegression.test.ts`, `domino.ts`, `GameBoard.tsx`, `BossIntro.tsx`, `Tooltip.tsx`, `i18n.ts`, el host `qa/` y esta documentación. El listado de la revisión anterior continúa en el informe principal.

## Evidencias y pendientes

En `outputs/dominix-review`, fuera del repositorio: `semanal-guardian-derrotado.jpg`, `semanal-resultados-7364.jpg`, `semanal-registro-persistente.jpg`, `semanal-identificado-final.jpg`, `semanal-movil-final.jpg`, `semanal-guardado-verificado.json`, `semanal-repeticion.json`, `semanal-copia-descargada.txt`, `semanal-consola-final.json`, `qa-inquisidor-total-final.jpg`, `qa-inquisidor-estadisticas-final.json`, `qa-inquisidor-resultados-final.jpg`, `qa-jefe-movimiento-reducido.jpg` y `qa-consola-final.json`.

Pendientes: una partida natural más allá del Acto II y hasta El Eco; jefe multifase con metas naturales; semanal prolongado y cambio de semana; Endless prolongado y su salida tras jefes; PWA instalada/offline; dispositivos físicos modestos; accesibilidad y traducción completas. La reanudación de partida activa y compartir runs siguen sin implementar. El siguiente paso lógico es elegir entre reanudación de partida y verificación PWA, sin mezclarlo con un rediseño.
