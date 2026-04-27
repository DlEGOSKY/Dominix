# BALANCING.md — Dominix

## Objetivo
Definir una base numérica simple para el MVP.

## Valores base sugeridos

### Mano inicial
- 7 fichas

### Score base por ficha
- 10 puntos por ficha válida jugada

### Bonus por longitud
- 3 fichas: +0
- 4 fichas: +10
- 5 fichas: +25
- 6 fichas: +45
- 7+ fichas: escalar con curva creciente

### Meta inicial de ronda (rondas 1-10, fijas en `engine/round.ts`)
- ronda 1: 80
- ronda 2: 120
- ronda 3: 170
- ronda 4: 240
- ronda 5: 330
- ronda 6: 420
- ronda 7: 510
- ronda 8: 610
- ronda 9: 720
- ronda 10: 850

### Meta del Acto III en adelante (ronda 11+)
Curva paraboloide: `850 + (round-10) * 150 + (round-10)² * 22`
- ronda 11: 1022
- ronda 13: 1498
- ronda 15: 2150
- ronda 18: 3458
- ronda 20: 4550
- ronda 25: 8050

### Soft-cap del multiplicador total (`softCapMultiplier` en `engine/score.ts`)
Los multiplicadores de patrones se multiplican entre sí. Sin cap, 5+ patrones simultáneos producen x12-x16 que trivializa el late-game. Compresión hiperbólica arriba de x4 con asíntota en ~x10.7:
- x2 → x2.00 · x4 → x4.00 · x6 → x5.54 · x8 → x6.50
- x12 → x7.64 · x16 → x8.29 · x20 → x8.71 · x30 → x9.46
- x50 → x9.82 · x100 → x10.20

Por debajo de x4 es identidad, así que las runs casuales no se ven afectadas.

## Patrones base sugeridos
- Cadena Simple
- Cadena Larga
- Doble Doble
- Dominio
- Cierre Exacto

## Reliquias en MVP
- 10 a 15 máximo

## Señales de desbalance

### Si todo se gana solo por longitud
- los patrones no pesan suficiente

### Si todo depende de reliquias
- la base del dominó no está sosteniendo el juego

### Si los patrones son confusos
- el feedback es malo o las reglas son demasiado abstractas

### Si una run buena se siente automática
- falta tensión entre riesgo y consistencia

## Meta
El balance ideal debe lograr:
- comprensión rápida
- depth creciente
- runs distintas
- builds memorables
- derrotas que enseñan algo
