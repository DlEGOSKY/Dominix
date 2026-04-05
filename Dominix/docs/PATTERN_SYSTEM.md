# PATTERN_SYSTEM.md — Dominix

## Objetivo
Definir qué estructuras de cadena generan score especial.

Los patrones son el equivalente al corazón expresivo del juego.
No deben sentirse arbitrarios.
Deben ser legibles, descubribles y emocionantes.

## Patrones base del MVP

### 1. Cadena Simple
Condición:
- jugar 3 o más fichas válidas

Efecto:
- bonus base por longitud

### 2. Cadena Larga
Condición:
- jugar 5 o más fichas

Efecto:
- multiplicador adicional

### 3. Doble Doble
Condición:
- incluir al menos 2 fichas dobles en la misma cadena

Efecto:
- bonus fuerte por precisión y rareza

### 4. Dominio
Condición:
- un mismo número aparece repetidamente como eje de conexión

Efecto:
- score por dominancia temática del número

### 5. Cierre Exacto
Condición:
- la cadena termina en una configuración exacta definida por extremos iguales o relación específica

Efecto:
- multiplicador de cierre

### 6. Espejo
Condición:
- la cadena presenta simetría lógica o repetición reflejada

Efecto:
- bonus elegante de patrón raro

### 7. Escalera de Sumas
Condición:
- la suma de fichas sigue una progresión simple o ascendente

Efecto:
- bonus por orden matemático

## Reglas del sistema
- el jugador debe poder ver qué patrones se activaron
- los patrones deben sumar al score de forma clara
- no usar demasiados patrones en el MVP
- es mejor 5 patrones sólidos que 20 irrelevantes

## Prioridad
Primero validar:
- Cadena Simple
- Cadena Larga
- Doble Doble
- Dominio
- Cierre Exacto
