# Dominix · cierre más directo y aprendizaje práctico

**Revisión posterior:** la cifra de ~70 ms de este documento usa el timestamp de rAF y no acredita latencia real. Queda sustituida por las trazas y la interpretación de [aplicación de prioridades](PRIORITIES_IMPLEMENTATION_2026-11-15.md), que también completa el catálogo de patrones y amplía la verificación de guardados. Los resultados antiguos se conservan como registro histórico.

15 de noviembre de 2026, Europe/Berlin. Rama `codex/dominix-stability-polish`, base `f2a8677d54ffdfa9c97cb55db0f12081c1369db2`. Continúa [feedback de acciones](ACTION_MOTION_2026-11-15.md). Se conservan menú, skins y paleta aprobados. Sin dependencias, generación de imágenes, compras, publicación ni migraciones del inventario.

## Diagnóstico

El usuario informó de una sensación de lag al aparecer Ronda superada. La lectura del código demostró retrasos de un segundo para las acciones y una revelación escalonada que seguía creciendo con las filas, incluso con modo rápido; había varios desenfoques superpuestos. Esto demuestra espera artificial, no por sí solo un diagnóstico de todos los tirones.

El tutorial anterior mostraba diez tarjetas, textos solo en español y resaltados situados por clases fijas de pantalla, sin observar los elementos reales. Los campos `action` no verificaban ejercicios. Cómo jugar contenía puntuaciones preparadas como 8 para 3|5, metas históricas y ejemplos de patrón insuficientes. Son discrepancias demostradas contra el motor actual.

## Cierre de ronda

- Total y acciones presentes desde el primer render, sin esperar la animación del desglose. El desglose completo queda en un desplegable nativo; no se elimina información.
- Barra corta por transformación: 240 ms normal, 120 ms rápido, sin desplazamiento en reducido. Se eliminan las animaciones independientes de cada cifra/fila y los desenfoques del panel de resultado/desglose.
- Celebración de victoria con 8 partículas normales/4 rápidas frente a la solicitud anterior de 32 (limitada internamente a 24). Menos sacudida de toda la mesa; la aberración ya no se añade al cierre. Se conserva feedback de jefe y gran score de manera acotada.
- Una clave ronda/fase/resultado impide repetir la celebración por cambios secundarios o al reanudar un resultado ya guardado. Título enfocable y encabezado de derrota localizado.
- Transición normal de ronda: 400 ms de exposición + 150 de salida; rápido 180+80. Jefe: 850+180 o 400+100. Reducido: omitida. Se puede continuar pulsando. El fin está protegido contra callbacks duplicados en StrictMode. No compite con la transición de acto, y los atajos no actúan detrás de ella.

### Medición y límite importante

`resolutionProfile.browser.mjs` guarda una partida temporal de Endless antes de cerrar y reutiliza el mismo checkpoint después. Chrome headless, 1280×1000, CPU ralentizada ×4. Se mide cuándo la opacidad de la acción/total ya está lista, sin garantizar que el elemento esté dentro de la ventana visible ni medir una pulsación humana.

| Muestra única | Acción lista | Total listo | p95 de intervalo rAF | Long tasks |
|---|---:|---:|---:|---:|
| Antes | 1467 ms | 987 ms | 14 ms | 160 ms |
| Después | 70,5 ms | 70,5 ms | 7,1 ms | 253 ms |

Los JSON y la captura conservan la evidencia, incluidos los valores desfavorables. La espera de controles mejora claramente; **no se afirma que todo el lag esté corregido**, ni que esto mida FPS de un móvil. Persiste un pico de trabajo que requiere una traza más detallada y varias muestras. Los servidores tuvieron que reiniciarse al dejar de responder; se identificaron únicamente los dos procesos de Vite de esta tarea y se recuperaron en los mismos puertos. Las mediciones no son un benchmark estadístico controlado del sistema completo.

## Práctica guiada

La nueva práctica usa una mesa independiente, un estado fijo y `playRoundTile`, `drawRoundTile`, `discardRoundTile` y `closeRound` reales. No consume RNG, no modifica la partida del jugador, no descubre recursos y no da XP. La meta preparada de 60 se identifica como meta de práctica; no cambia la meta normal de ronda 1.

El recorrido contiene bienvenida, abrir con 3|5, conectar 5|2, formar Cadena Simple con 2|6, robar, descartar 1|1, usar el 6|6 robado, cerrar, elegir una reliquia y revisar el ciclo. No se avanza con Siguiente sin realizar la acción. Una conexión inválida conserva mano/acciones y explica el error. Se enseña que los números sirven para conectar y que la base normal es 10, no la suma de pips; descartar no roba automáticamente. La reliquia conserva el score cerrado y afecta a jugadas posteriores.

Se abre en el primer combate si falta la marca de tutorial, y se puede repetir desde Cómo jugar. Cerrar/Escape permite omitirla como antes. La práctica manual no cambia la marca de completado ni otros datos; el primer tutorial escribe la misma clave histórica al terminar/omitir. Los índices antiguos no negativos abren la práctica desde el principio, sin alterar la partida. El progreso interno de la práctica es efímero y se reinicia al salir/recargar.

El diálogo nativo proporciona fondo inerte, Escape y retorno del foco. Controles táctiles de práctica de 44 px, recursos y fichas de producción, instrucciones ES/EN, reinicio sin penalización y una consigna corta que permanece visible al desplazarse por pantallas pequeñas. No se usa la geometría falsa del tablero real del tutorial anterior.

## Cómo jugar y coherencia de reglas

Las tres demostraciones calculan el score con cadenas válidas y `calculateScore`, sin cifras de score preparadas. Se corrige una bomba del ejemplo especial para que conecte tras Espejo, y el texto de Espejo ya no dice que cambia ambos extremos. Las demos se pausan al abrir un diálogo/ocultarse el documento; en reducido arrancan pausadas.

Se corrigen las etiquetas que sumaban pips, metas 2/3/4 a través de `getTarget`, el ejemplo de Escalera a cuatro fichas, los bonos de Cadena Simple/Doble Doble y los combos explicados. El catálogo usado por tooltips se reconcilia con cuatro detectores: Cadena Simple, Dominio, Cierre Exacto y Escalera, con pruebas. **No se ha reconciliado todo el catálogo**; queda una discrepancia concreta de Triple Doble en [prioridades](NEXT_PRIORITIES_2026-11-15.md). No se cambia ninguna fórmula de puntuación o condición del detector.

## Verificación

- **419 pruebas correctas en 25 archivos**: doce casos nuevos de aprendizaje real, errores sin coste, cierre/reliquia, aislamiento de almacenamiento y RNG, metadatos de cuatro patrones y tiempos de transición. TypeScript/compilación, lint y TypeScript QA correctos.
- `training.browser.mjs`: 21 comprobaciones agregadas, ES/EN y cuatro preferencias de movimiento; cuatro tamaños iniciales y recorridos completos también a 320 px/horizontal. Error de conexión, score real, robo/descarte/cierre/recompensa, repetición, retorno de foco, almacenamiento inalterado y tutorial inicial que conserva juego/RNG, persiste su finalización y permite jugar después. La demo de fondo no sigue avanzando bajo el modal. La pasada final queda en `tutorial-verificacion.json`.
- `resolutionChecks.browser.mjs`: 18 comprobaciones agregadas. Desglose de una cadena QA de 30 fichas a 1280/390/320, total siempre presente; transiciones normal/rápida/reducida, omisión manual y finalización una sola vez bajo StrictMode. Sin errores de consola tras declarar el icono de la página QA.
- Regresión `actionMotion.browser.mjs`: 40 comprobaciones, incluidas acciones/teclado/diálogos/reanudación offline; juego y RNG conservados, sin repetir los efectos de acción. Sin errores de consola en los recorridos finales de estas suites.
- Build: 571 módulos. Los tamaños exactos y las advertencias de Browserslist/LF-CRLF se conservan en la salida de compilación; no se derivan FPS del peso del bundle.

Perfiles aislados de Chrome, servidores 5176/5178, sin datos personales. El perfil de rendimiento y las capturas de práctica/cierre son producto compilado; el escenario de 30 fichas es QA y no demuestra una campaña jugada.

## Archivos y continuación

Nuevos: `TrainingPractice.tsx`, `TrainingPractice.css`, `engine/training.ts`, `training.test.ts`, `presentationTiming.ts`; scripts/fixtures QA de entrenamiento, perfil y resolución. Modificados: `GameBoard`, `ScoreReveal`, `RoundTransition`, `TutorialOverlay`, `HowToPlayScreen`, `AnimatedDemo`, `tutorial.ts`, `howToPlayContent.ts`, `i18n.ts`, metadatos de `patterns.ts` e `i18nContent.ts`.

Evidencias en `outputs/dominix-review/tutorial-resolution-2026-11-15/`. Pendientes: traza del pico de trabajo, móvil físico, lector de pantalla, ciclo completo de jefes/campaña, aprendizaje contextual del mapa/tienda y resto del catálogo. Las propuestas de skins nuevas se documentan sin generarlas: primero coherencia y rendimiento, después expansión artística. [Prioridades actualizadas](NEXT_PRIORITIES_2026-11-15.md).
