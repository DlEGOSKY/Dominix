# Dominix · prioridades verificables

**Actualización del 22 de noviembre:** [evaluación de salida 0.2.0](RELEASE_READINESS_2026-11-22.md), candidata local sin publicar, 491 pruebas. Se reproduce y corrige la liquidación interrumpida: recuperación completa antes de cargar el perfil y entrega única tras el reintento, comprobadas con cierres reales del proceso. La limitación P0 histórica de este documento queda cerrada para esos cortes de navegador; no se amplía la garantía a fallos de disco/apagado o expulsión de datos. Pendiente ejecutar CI y comprobar el despliegue remoto.

**Actualización del 17 de noviembre:** [materiales y Expreso entregados](MATERIAL_EXPRESS_2026-11-17.md), 31 skins y 478 pruebas. Corregidos celebración duplicada, Enter tras la cinemática y confirmaciones de copia. Los conceptos/tablas artísticas de este documento conservan su fecha; Expreso y los seis acabados ya están implementados. El trabajo siguiente sigue siendo rendimiento de cadenas largas, durabilidad del perfil, tutorial contextual e iconos a tamaño de HUD.

**Revisión posterior de pendientes y arte:** [REVIEW_BACKLOG_ART_2026-11-15.md](REVIEW_BACKLOG_ART_2026-11-15.md), con la duplicación de celebración, confirmación de portapapeles y el brief del lote de materiales/Expreso. Son hallazgos y propuestas; no acabados nuevos ya integrados.

15 de noviembre de 2026. Actualizado tras [aplicar las prioridades](PRIORITIES_IMPLEMENTATION_2026-11-15.md): 460 pruebas correctas, catálogo reconciliado, correcciones de continuidad y nuevas pruebas de navegador. El informe enlazado distingue lo probado, los escenarios QA y lo pendiente. Las antiguas cifras de ~70 ms usaban una marca rAF inadecuada para latencia; se sustituyen por trazas de click/Paint.

## P0 · proteger datos y decisiones

Mantener como barrera las regresiones de inventario, score, XP, importación y reanudación. Se corrigen la divergencia reproducida de RNG bajo StrictMode, el guardado rechazado tras jefe y el orden inseguro de la liquidación. Hay journal adicional de run, recuperación tras cierre forzado y rollback/reintento ante cuota llena. Falta probar y proteger la durabilidad del perfil completo si el proceso se mata durante la liquidación de XP/historial; el rollback síncrono no promete atomicidad frente a ese cierre.

## P1 · estado técnico y trabajo restante

| Trabajo | Evidencia actual | Criterio de cierre |
|---|---|---|
| Reducir el pico de resolución | Trazas y tres muestras por configuración CPU ×4. Click pequeño: mediana 254 → 158 ms. Mejora de continuidad en 30 fichas al retirar explosión duplicada, pero persiste pico de hasta 348 ms | Perfil JS/React más fino y móvil físico; no afirmar que todo el lag desapareció |
| Catálogo de patrones | Completado para los 31: ejemplos/casos negativos, textos ES/EN y fuente compartida. Corpus de 2.031 cadenas conserva el hash jugable | Mantener contrato; decidir aparte si diferenciar Avalancha/Crescendo, que siguen acumulándose |
| Replay y jefes | 67 estados iguales hasta ronda 13 con eventos, reliquias, renovaciones y cuatro compras; mapa de un acto, Sirena de tres fases y recargas. Tres modos de arranque también iguales | Ampliar personajes/semillas/modificadores/jefes/interludios y balance de campaña normal; los fixtures de jefe/mapa usan metas bajas explícitas |
| Fallos reales de almacenamiento | Comprobados cuota real, bloqueo de datos, reintento de liquidación y cierre forzado tras autoguardado; siete casos de journal/import/reset | Ampliar navegadores y cierre durante escritura/contabilización, no solo después del autoguardado; perfil completo durable |

## P2 · claridad y aprendizaje

- **Tutorial contextual:** la práctica nueva enseña el ciclo básico con el motor real. Faltan lecciones opcionales del mapa, compras, eventos, restricciones/fases de jefe y sinergias avanzadas. La práctica se reinicia al cerrarla/recargar; no se anuncia progreso de lección guardado.
- **Endless:** presentación corregida: referencia opcional e instrucciones acordes al cierre de cualquier cadena no vacía. Se conservan las reglas existentes. Cualquier cambio de victoria requiere una decisión de producto separada.
- **Móvil y accesibilidad:** descarte táctil/ventana estrecha de 44 px separado de la ficha, comprobado ES/EN y horizontal. Pendientes: lector de pantalla real y ampliar el objetivo compacto con puntero fino. Mantener foco y pruebas de orientación/desbordamiento.
- **Herramientas de compartir:** `ShareRunScreen` sigue desconectado y conserva ejemplos/TODO según auditoría previa; volver a comprobar su estado antes de conectarlo. El ranking disponible es local, sin anunciar clasificación global.

## P3 · arte y expansión después de estabilizar

Dar más profundidad a las 30 skins actuales antes de llenar la colección: acabados específicos de material, variaciones de desgaste y un feedback de activación breve. Conservar el conteo visible y no añadir movimiento permanente a cada pip. Los favoritos y el probador ya permiten revisar propuestas a tamaño real.

Tres conceptos originales posibles, todavía no dibujados ni integrados:

| Colección | Objeto completo | Lenguaje numérico |
|---|---|---|
| Observatorio del Umbral | Instrumento astronómico de latón y esmalte | 1–6 estrellas claras; cero como apertura oscura |
| Expreso de Medianoche | Panel de vagón de madera y metal | 1–6 ventanas encendidas; cero como compartimento apagado |
| Taller de autómatas | Placa mecánica reparada | 1–6 contactos activos; cero como mecanismo desconectado |

Son direcciones para revisar, no recursos generados, colaboraciones de franquicia, nuevos desbloqueos ni compras autorizadas por este documento. No hacen falta servicios externos para prototipar su gramática con SVG. La prioridad sigue siendo que la ficha pueda leerse durante una run.
