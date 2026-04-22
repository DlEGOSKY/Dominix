# DEVELOPMENT_PHASES.md — Dominix

## Filosofía
Primero validar que jugar una cadena y puntuarla se sienta bien.
Después agregar profundidad.

## Roadmap general

```text
Fase 1: Núcleo de cadena y score        → 2-3 días
Fase 2: Patrones base                   → 2 días
Fase 3: Reliquias y recompensas         → 2-3 días
Fase 4: Build de run y mutaciones       → 2 días
Fase 5: UI, feedback y polish           → 2-3 días
```

## FASE 1: Núcleo de cadena y score
### Objetivo
Tener una ronda jugable con:
- mano
- fichas
- extremos válidos
- score base
- meta simple
- victoria o derrota de ronda

### Tareas
- modelo de ficha
- mano inicial
- área de cadena
- validación de jugada
- score base por ficha
- fin de ronda
- reinicio

## FASE 2: Patrones base
### Objetivo
Hacer que el score ya tenga personalidad.

### Tareas
- detectar Cadena Simple
- detectar Cadena Larga
- detectar Doble Doble
- detectar Dominio
- detectar Cierre Exacto
- mostrar patrones activados

## FASE 3: Reliquias y recompensas
### Objetivo
Crear la sensación de build.

### Tareas
- reliquias base
- pantalla de recompensa
- aplicar efectos al score
- elegir una mejora entre rondas

## FASE 4: Build de run y mutaciones
### Objetivo
Dar manipulación real del set de fichas.

### Tareas
- eliminar ficha
- duplicar ficha
- mutar números
- reforzar categorías de score

## FASE 5: UI, feedback y polish
### Objetivo
Hacer que el juego se sienta realmente bueno.

### Tareas
- feedback visual de score
- animaciones de fichas
- highlight de patrones
- pantalla de run
- pacing

## FASE 6: Sistema de acciones
### Objetivo
Dar decisiones tácticas dentro de cada ronda.

### Tareas
- sistema de acciones por ronda (12 base + scaling)
- descarte de fichas (limitado, consume acción)
- robar fichas del pool (limitado, consume acción)
- indicador visual de acciones/descartes/robos restantes
- fin de ronda automático al agotar acciones

## FASE 7: Meta-contenido y colección
### Objetivo
Dar razones para seguir jugando más allá de la run.

### Tareas
- pantalla de colección (reliquias, patrones, skins)
- historial de runs con stats detallados
- pantalla de estadísticas con resumen global, records y reliquias favoritas
- pantalla de recompensa especial al derrotar jefes
- desglose visual del score en tiempo real
- curva de dificultad mejorada (8 rondas manuales + cuadrático)
- selector de skin en HomeScreen

## FASE 8: Balanceo, reliquias de acciones y QoL
### Objetivo
Conectar el sistema de acciones con todo el juego y pulir la experiencia.

### Tareas
- reliquias de acciones: Reloj de Arena, Mano Larga, Filtro, Reciclador, Explorador, Tactico
- bonus de reliquias aplicados a createActionState (acciones, descartes, robos)
- bonus de score por descarte (Reciclador) y robo (Explorador)
- eventos de acciones: Flujo Tactico, Manos Agiles, Bloqueo Temporal, Intercambio Tactico
- tipo de efecto bonus_actions en EventEffect
- aplicacion de bonus_actions en handleEventContinue
- tutorial actualizado con pasos de acciones, descarte y robar
- QoL mano: fichas jugables ordenadas primero, luego por suma
- desbloqueos para nuevas reliquias

## FASE 9: Score reveal, logros y modifiers de acciones
### Objetivo
Feedback satisfactorio al cerrar ronda y conectar acciones con todo el meta.

### Tareas
- ScoreReveal animado (breakdown linea por linea) en win/lose overlay
- HowToPlay actualizado con seccion de acciones
- 4 logros de descarte/robo (Descartador, Purga Total, Buscador, Explorador Nato)
- tilesDiscarded y tilesDrawn en RunStats
- 2 modifiers: Modo Rapido (-4 acciones, score x1.3), Modo Tactico (+6 acciones, metas +20%)
- actionBonus en ModifierConfig propagado a createActionState
