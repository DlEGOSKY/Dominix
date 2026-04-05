# GAME_DESIGN.md — Dominix

## 1. Concepto central

Dominix es un roguelike de dominó donde cada ronda consiste en construir una cadena válida de fichas para superar una meta de score.

El juego mezcla:
- validez estructural de dominó
- patrones puntuables
- reliquias
- mutaciones de fichas
- progresión de run

## 2. Regla base de la ronda

El jugador recibe una mano de fichas.
Debe construir una cadena válida a partir de los extremos disponibles.
La ronda termina cuando:
- decide cerrar la cadena
- se queda sin jugadas útiles
- consume sus acciones disponibles
- cumple otra condición de fin de ronda según el modo

## 3. Objetivo de ronda

Cada ronda tiene una meta mínima de score.
Si la superas:
- avanzas
- ganas recompensa
- eliges mejora

Si no la superas:
- la run termina

## 4. Cómo se puntúa una cadena

El score total nace de:

### A. Score base
Cada ficha jugada aporta valor base.

### B. Longitud
Una cadena más larga suma más.

### C. Patrones
Se detectan estructuras especiales:
- dobles
- repeticiones
- dominancia de número
- cierres
- secuencias de suma
- espejos y simetrías

### D. Multiplicadores
Reliquias, mutaciones y ciertos patrones alteran el multiplicador final.

## 5. Estructura de la run

### Inicio
- set base de fichas
- mano inicial
- reliquia inicial simple o ninguna

### Ronda
- meta de score
- cadena
- puntuación
- resolución

### Recompensa
El jugador elige una opción:
- nueva reliquia
- mutación de ficha
- quitar ficha débil
- duplicar ficha
- alterar números de una ficha
- mejorar score base

### Escalada
Cada ronda aumenta:
- meta
- presión
- necesidad de sinergia

## 6. Sistemas del MVP

### Sistema de mano
- robar fichas
- jugar fichas válidas
- descartar limitado

### Sistema de cadena
- dos extremos activos
- cada ficha debe encajar por uno de sus valores
- los dobles cuentan como piezas especiales

### Sistema de score
- score base por ficha
- bonus por cadena
- detección de patrones
- multiplicador final

### Sistema de reliquias
- efectos pasivos
- efectos condicionales
- sinergias con patrones o números

## 7. Principios del juego

- el jugador debe entender por qué puntúa
- el juego debe recompensar construir build, no solo suerte
- las reliquias deben deformar la run sin destruir claridad
- cada partida debe permitir descubrimiento
- el dominó debe sentirse presente en la base del juego

## 8. Lo que define a Dominix

No gana por nostalgia del dominó.
Gana si logra que poner una ficha correcta en el momento exacto se sienta increíble.
