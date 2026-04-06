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
