# AGENTS.md — Dominix

## Propósito del proyecto
Construir Dominix como un roguelike de dominó basado en:
- cadenas válidas
- score
- patrones
- reliquias
- mutaciones
- builds de run

Dominix no debe sentirse como un dominó clásico con efectos pegados encima.
Debe sentirse como un juego propio, con identidad, profundidad y rejugabilidad.

## Fuente de verdad
Antes de implementar cualquier cambio, leer y respetar:
- README.md
- PROJECT_RULES.md
- docs/GAME_DESIGN.md
- docs/PATTERN_SYSTEM.md
- docs/RELIC_SYSTEM.md
- docs/DEVELOPMENT_PHASES.md
- docs/UI_SYSTEM.md
- docs/BALANCING.md

Si hay conflicto:
1. GAME_DESIGN.md manda en el loop central y reglas del juego
2. PATTERN_SYSTEM.md manda en cómo se puntúa
3. RELIC_SYSTEM.md manda en progresión y build
4. BALANCING.md manda en números
5. UI_SYSTEM.md manda en identidad visual
6. DEVELOPMENT_PHASES.md manda en el orden de construcción
7. README.md da la visión general

## Filosofía de trabajo
- primero loop jugable, luego complejidad
- primero claridad, luego espectáculo
- primero una run divertida, luego variedad extra
- no sobrecargar el juego de sistemas antes de validar la base
- toda mecánica nueva debe reforzar la decisión y la rejugabilidad

## Meta del producto
Dominix debe sentirse:
- táctico
- adictivo
- claro
- elegante
- con identidad propia
- satisfactorio al puntuar
- rejugable

## Reglas de implementación
- no convertir el juego en dominó clásico competitivo
- no copiar nomenclatura ni estructura de juegos de cartas
- no agregar sistemas que no mejoren el loop
- no refactorizar en masa sin pedirlo
- no agregar dependencias innecesarias
- mantener TypeScript estricto
- separar lógica de score, patrones y UI
- mantener patrones y reliquias como sistemas independientes y testeables

## Reglas de UI
- cero emojis
- cero estética casino pura
- cero look genérico de app casual
- foco visual en fichas, score y feedback de cadena
- números grandes y legibles
- la interfaz debe sentirse como mesa táctica premium, no como dashboard cualquiera

## Reglas de respuesta
Antes de codificar:
- explicar estrategia en 2-3 líneas
- decir qué módulo se tocará
- listar archivos a crear o modificar

Después de codificar:
- listar archivos tocados
- explicar qué quedó funcionando
- mencionar el siguiente paso lógico sin implementarlo
