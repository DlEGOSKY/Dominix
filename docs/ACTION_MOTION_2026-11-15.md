# Dominix · feedback de acciones y seguridad del teclado

15 de noviembre de 2026, Europe/Berlin. Rama `codex/dominix-stability-polish`; base `f2a8677d54ffdfa9c97cb55db0f12081c1369db2`. Continúa [colección y mundos](WORLDS_WARDROBE_2026-11-15.md). Cambios locales, sin publicación, dependencias nuevas, migración, compras o generación de imágenes. Se conservan la interfaz y el arte aprobados.

## Diagnóstico y alcance

La colocación ya tenía trayecto de mano a mesa, contacto por material y pulso de unión. Robo, descarte y deshacer compartían animaciones genéricas de entrada/salida y no confirmaban explícitamente qué ficha cambió. Los cinco mundos nuevos usaban el contacto de piedra por defecto. Se amplía la presentación de acciones sin modificar sus costes, score, RNG o reglas.

**Error reproducido antes de la corrección:** dentro del diálogo de puntuación, pulsar R robaba una ficha detrás del modal. En un perfil temporal, la mano pasó de 7 a 8, la reserva de 21 a 20 y `tilesDrawn` de 0 a 1, permaneciendo abierto el diálogo. Evidencia: `atajo-modal-antes.json`. La inercia del diálogo nativo no impide que un listener global de window reciba el evento.

## Cambios implementados

### Acciones legibles

`getActionCue` reconoce transiciones ya confirmadas del motor: colocación, robo, descarte, restauración de deshacer y resolución de ronda. Contrasta IDs, mano/cadena, reserva y estadísticas; no interpreta simplemente un clic como éxito. Conserva el resultado real si el último robo/descarte/jugada también agota acciones. Rechazos, copias idénticas, cambios de ronda y salida de recompensa no generan confirmaciones falsas.

`useActionFeedback` conserva solo la última acción en memoria de UI, sin cola ni temporizador que decida la jugada. Una línea reservada, con anuncio `status` ES/EN, indica la ficha afectada, la reserva tras robar o el resultado al cerrar. Se limpia al entrar en otra ronda/fase; montar o reanudar no reproduce la última acción del guardado. No se añade nada al checkpoint.

### Lenguaje de movimiento

| Acción | Movimiento | Normal / rápido |
|---|---|---|
| Robo | Entrada corta desde arriba, 22 px, escala 0,94→1 | 280 / 140 ms |
| Deshacer | Regreso a mano, 16 px verticales y 8 laterales | 280 / 140 ms |
| Descarte | Salida lateral 26 px, 10 verticales, giro 5°, desvanecimiento | 220 / 110 ms |
| Contador implicado | Cambio breve de opacidad y desplazamiento de 3 px | 170 / 90 ms |
| Cierre | Borde interior de la mesa, oro/rojo según resultado real | 320 / 150 ms |

La colocación conserva su recorrido de 380/180 ms y el contacto anterior. El contenedor Hand controla la entrada/salida de sus fichas; `TileView` conserva hover y su ciclo normal en otros contenedores. Esto evita que una animación interior prolongue el descarte o deje controles invisibles esperando otra salida. Chain conserva su presencia anterior; la regresión de 30 fichas protege ambos extremos.

Con movimiento reducido del juego o sistema, estas nuevas transformaciones y pulsos se omiten, manteniendo texto y estado. Los efectos WAAPI se cancelan al cambiar estado/preferencias o desmontar; no se retienen clones nuevos ni se bloquean botones para esperar una animación. Los efectos anteriores del juego no han sido auditados exhaustivamente en esta entrega.

### Materiales y teclado

Vitrales y Gabinete de alquimia usan contacto de cristal; Reactor orbital y Forja del dragón, metal; Templo sumergido, piedra. Se reutilizan los sintetizadores existentes y sus preferencias de volumen/silencio, sin archivos de sonido o solicitudes externas nuevas.

Los atajos de partida se ignoran con diálogos modales abiertos, campos de edición/contenteditable, eventos ya consumidos, modificadores o repetición de tecla sostenida. Funcionan de nuevo al cerrar el modal. Robo y descarte también comprueban disponibilidad antes de invalidar Deshacer o emitir sonido; un intento no disponible no confirma una acción.

## Validación

- **407 pruebas correctas en 24 archivos**. Trece casos añadidos: ocho de señales ligadas a resultados reales y protección de atajos, cinco de materiales nuevos. Incluyen acciones rechazadas, restauración, ausencia de repetición, agotamiento y cierre que falla una restricción de jefe pese a tener score suficiente.
- TypeScript/compilación, lint y TypeScript QA correctos. Build de 567 módulos: índice 63,14 kB / 20,52 kB gzip; App 496,71 kB / 141,21 kB gzip. Sin nuevas dependencias. Permanecen los avisos anteriores de Browserslist antiguo y normalización LF/CRLF de HomeScreen.
- Compilación final con `actionMotion.browser.mjs`: **40 comprobaciones agregadas**, cero errores de consola/excepciones: cuatro configuraciones (ES normal, EN rápido, ES reducido por app, EN reducido por sistema), cuatro ventanas en cada una —1280×1000, 390×844, 320×568 y 844×390—, guardas del teclado, jugar/deshacer, robar, descarte, cierre y continuación offline. Las fichas, presupuestos, score, resultado y RNG se contrastan con el checkpoint real. Sin desbordamiento horizontal. Los pulsos nativos miden 170/90 y 320/150 ms; en reducido no se crean esos efectos. La pasada final queda registrada en `verificacion.json`.
- `tileFlight.browser.mjs`: **16 comprobaciones** correctas, sin errores de consola: origen/medio/destino, un contacto al llegar, jugadas rápidas/deshacer, cancelación sin sonido, cadena de 30 con ambos extremos y su unión correcta, scroll/resize/desmontaje, movimiento reducido, modo rápido, ausencia/fallo de API de animación y limpieza final. Incluye un clip QA de tres colocaciones.
- El primer intento de lectura tras colocar encontraba el autoguardado anterior porque se guarda con debounce de 150 ms. El script ahora usa el evento de guardado ya existente y excluye únicamente su marca de tiempo de las comparaciones; no se modificó el mecanismo de guardado para pasar la prueba.

Perfiles de Chrome aislados, producción local en 5176 y fixture de colocación en 5178. No se usaron datos personales. Las capturas `robo-*` y `descarte-*` son estados reales de la partida, no fotogramas reconstruidos. Los clips WebM son grabaciones a velocidad normal, sin audio capturado; se reutiliza FFmpeg de Playwright ya descargado en la revisión anterior, sin instalación nueva.

## Evidencias, archivos y pendientes

Evidencias en `outputs/dominix-review/action-motion-2026-11-15/`: reproducción anterior del modal, `verificacion.json`, `colocacion-verificacion.json`, capturas de escritorio/móvil, `acciones-reales.webm` de la prueba automática, `acciones-mesa-demo.webm` de la demostración y `colocacion-mano-mesa.webm` del escenario QA. El clip demo no modifica artificialmente el score o las fichas; usa otra partida temporal.

Nuevos: `src/engine/actionFeedback.ts`, `src/hooks/useActionFeedback.ts`, `src/components/ActionFeedback.tsx`, `qa/actionMotion.browser.mjs`, `qa/actionMotionDemo.browser.mjs`. Ampliados: `GameBoard.tsx`, `Hand.tsx`, `TileView.tsx`, `ActionHUD.tsx`, `tileArrival.ts`, `i18n.ts`, `runRegression.test.ts`, `tileArrival.test.ts`; el script de colocación añade un diagnóstico de destino ausente.

Pendientes: móvil físico, lector de pantalla real, medición de FPS/memoria y una campaña completa. La señal de agotamiento/restricción negativa está cubierta por pruebas de motor; el recorrido de navegador usa cierre ganador de Endless. No se afirma haber probado todos los jefes, consumibles o animaciones antiguas. Siguiente paso lógico: revisar el ritmo de este lote y después estudiar el feedback de activaciones concretas de reliquias/patrones, evitando apilar efectos. No se implementa ese siguiente lote aquí.
