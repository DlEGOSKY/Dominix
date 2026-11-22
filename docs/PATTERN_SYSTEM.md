# PATTERN_SYSTEM.md — Dominix

## Reglas vigentes · 15 de noviembre de 2026

Las cadenas deben ser válidas. Cada patrón se evalúa independientemente, como máximo una vez por evaluación; varios patrones pueden coexistir. El catálogo y los detectores comparten bonos y multiplicadores en `src/engine/patterns.ts`. Los textos ES/EN describen las condiciones actuales, sin modificar su balance.

Las sumas mencionadas aquí usan los valores impresos de las fichas. Dominio, Escalera y Zigzag usan las caras efectivas tras comodines/espejos; Cierre Exacto, Simetría, Puente y Ouroboros usan los extremos efectivos. La suma de puntos no sustituye a la base normal de 10 puntos por ficha.

| Patrón | Condición | Bono | Multiplicador |
|---|---|---:|---:|
| Cadena Simple | Coloca 3+ fichas en la cadena | +20 | ×1 |
| Cadena Larga | Coloca 5+ fichas en la cadena | +0 | ×1.5 |
| Cadena Maxima | Coloca 7+ fichas en la cadena | +60 | ×1.8 |
| Doble Doble | Juega 2 dobles en la cadena | +30 | ×1 |
| Triple Doble | Juega 3+ dobles en la cadena | +50 | ×1.2 |
| Todo Dobles | Toda la cadena son dobles (3+) | +0 | ×2 |
| Dominio | Cadena de 3+ fichas; un número aparece en 4+ caras efectivas | +25 | ×1 |
| Cierre Exacto | Cadena de 3+ fichas con extremos iguales | +0 | ×2 |
| Escalera | 4+ fichas; al menos 3 subidas o bajadas entre caras efectivas | +35 | ×1 |
| Simetria | 3+ fichas, cantidad impar, extremos iguales y doble en el centro | +40 | ×1.3 |
| Parejas | 4+ fichas; 2+ pares adyacentes con la misma suma (pueden solaparse) | +30 | ×1.15 |
| Racha Alta | 3+ fichas con suma de puntos >= 9, aunque estén separadas | +40 | ×1 |
| Racha Baja | 4+ fichas con suma de puntos <= 4, aunque estén separadas | +0 | ×1.4 |
| Alternancia | 4+ fichas; toda la cadena alterna doble y no doble | +35 | ×1.1 |
| Suma Exacta | 3+ fichas; la suma total de puntos es exactamente 21, 42 o 63 | +0 | ×1.5 |
| Puente 0-6 | 5+ fichas; los extremos efectivos son 0 y 6 | +45 | ×1 |
| Espejo | 4+ fichas; 2+ pares adyacentes con valores impresos invertidos (pueden solaparse) | +35 | ×1.2 |
| Zigzag | 5+ fichas; 3+ cambios de dirección entre caras efectivas | +40 | ×1.15 |
| Suma Impar | 4+ fichas donde todas suman impar | +30 | ×1.3 |
| Avalancha | 4+ fichas consecutivas con sumas estrictamente crecientes | +45 | ×1.25 |
| Trinidad | 3+ fichas consecutivas con un numero en comun | +45 | ×1.15 |
| Fractal | 4+ fichas; cada suma de puntos es 1, 2, 4 u 8 | +60 | ×1.2 |
| Armonia | 3+ fichas; suma total de puntos prima y >= 20 | +40 | ×1.35 |
| Constelacion | Cadena de 5+ fichas con 6+ numeros distintos | +55 | ×1.25 |
| Diminuendo | 4+ fichas consecutivas con sumas estrictamente decrecientes | +35 | ×1.3 |
| Corona | 3+ dobles con valores consecutivos (ej 3\|3, 4\|4, 5\|5) | +50 | ×1.2 |
| Hexagrama | Cadena exacta de 6 fichas con 6+ numeros distintos | +80 | ×1.5 |
| Triple Filo | 3+ fichas con suma par y 3+ con suma impar, en cualquier orden | +45 | ×1.2 |
| Crescendo | 4+ fichas consecutivas con sumas estrictamente crecientes | +50 | ×1.35 |
| Cuna | 3+ fichas; primera y última tienen la misma suma de puntos | +40 | ×1.3 |
| Ouroboros | Cierre exacto + cadena de 7+ fichas (raro) | +100 | ×1.6 |

## Acumulación

Se suman los bonos de los patrones y se multiplican sus multiplicadores. Se añade un solo combo, el nivel más alto alcanzado: 2 patrones +20/×1.15; 3 +40/×1.3; 4 +70/×1.5; 5 o más +100/×1.8. La composición con reliquias, ediciones y capas de run corresponde a `score.ts` y `runScore.ts`; la UI no debe recalcular reglas por su cuenta.

Avalancha y Crescendo comparten actualmente el requisito de cuatro sumas consecutivas estrictamente crecientes y se acumulan. Se conserva esta regla existente. Diferenciarlos requiere una decisión de balance explícita. Escalera cuenta subidas/bajadas entre caras efectivas; no es ese patrón de sumas.

## Barreras de regresión

`patternContract.test.ts` cubre los 31 patrones con ejemplos conectados y casos que deben rechazarse. `qa/patternContract.mjs` compara 2.031 cadenas deterministas, incluidas fichas espejo y comodines, contra una referencia capturada antes de reconciliar el catálogo. Se conservaron nombres dinámicos, orden de detección, bonos y acumulación. Las descripciones en inglés están en `i18nContent.ts`.

Priorizar claridad y decisiones tácticas antes de añadir más patrones. Nuevos diseños deben tener una condición legible, ejemplos válidos y un propósito distinto dentro del dominó.
