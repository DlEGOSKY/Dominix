# Dominix — un roguelike de dominó basado en cadenas, patrones y builds

Dominix toma la lógica reconocible del dominó y la transforma en un juego de runs, scoring, reliquias y decisiones tácticas.

## Jugar

```bash
npm install
npm run dev
```

Abre http://localhost:5173 en tu navegador.

## Estado del proyecto: COMPLETO

El juego está completamente funcional con todos los sistemas implementados.

## Características

### Sistemas de juego
- **15 patrones** detectables con bonus y multiplicadores
- **30 reliquias** con efectos variados y desbloqueo progresivo
- **3 tipos de mutaciones**: eliminar, duplicar, convertir fichas
- **3 tipos de fichas especiales**: comodin (wild), dorada (golden), bloqueada (locked)
- **Sistema de eventos** aleatorios entre rondas (bendiciones, maldiciones, elecciones)
- **Sistema de tienda** cada 3 rondas con oro ganado por rendimiento
- **Sistema de jefes** cada 5 rondas con restricciones y recompensas extra
- **Modo diario** con seed fija para comparar runs

### Meta-progresión
- **15 logros** desbloqueables con notificaciones
- **8 modificadores de run**: 4 dificultades + 4 variantes/desafíos
- **Estadísticas persistentes**: mejor ronda, mejor score, runs totales
- **Sistema de desbloqueo** progresivo de reliquias

### UI/UX
- **Animaciones fluidas** con Framer Motion
- **Efectos de partículas** al activar patrones
- **Score popups** animados al ganar puntos
- **Audio sintético** con Web Audio API (sin archivos externos)
- **Tutorial interactivo** para nuevos jugadores
- **Diseño responsivo** y accesible

## Stack técnico

- Vite + React 18
- TypeScript estricto
- Tailwind CSS
- Framer Motion
- Web Audio API
- localStorage para persistencia

## Estructura del código

```text
src/
├── types/           # Tipos TypeScript
│   ├── domino.ts    # Tile, TileType, GameState, RunStats
│   ├── relic.ts     # Relic, RelicEffect
│   └── reward.ts    # RewardOption
├── engine/          # Lógica del juego
│   ├── tiles.ts     # Generación de fichas + fichas especiales
│   ├── chain.ts     # Validación de cadena (wild, locked)
│   ├── score.ts     # Cálculo de puntuación (golden bonus)
│   ├── patterns.ts  # 15 patrones detectables
│   ├── relics.ts    # 30 reliquias
│   ├── rewards.ts   # Sistema de recompensas
│   ├── round.ts     # Metas de ronda
│   ├── storage.ts   # Persistencia localStorage
│   ├── audio.ts     # Sistema de sonido
│   ├── daily.ts     # Modo diario con seed
│   ├── unlocks.ts   # Desbloqueo de reliquias
│   ├── achievements.ts  # Sistema de logros
│   ├── modifiers.ts # Modificadores de run
│   ├── events.ts    # Eventos aleatorios
│   ├── tutorial.ts  # Tutorial interactivo
│   ├── shop.ts      # Tienda entre rondas
│   └── boss.ts      # Sistema de jefes
├── components/      # Componentes React
│   ├── HomeScreen.tsx
│   ├── GameBoard.tsx
│   ├── GameOverScreen.tsx
│   ├── AchievementsScreen.tsx
│   ├── TileView.tsx
│   ├── Hand.tsx
│   ├── Chain.tsx
│   ├── ScoreBar.tsx
│   ├── PatternDisplay.tsx
│   ├── RelicBar.tsx
│   ├── RewardScreen.tsx
│   ├── TileSelector.tsx
│   ├── NumberConverter.tsx
│   ├── ModifierSelect.tsx
│   ├── EventScreen.tsx
│   ├── ShopScreen.tsx
│   ├── BossIntro.tsx
│   ├── ScorePopup.tsx
│   ├── ParticleEffect.tsx
│   ├── AchievementToast.tsx
│   └── TutorialOverlay.tsx
└── App.tsx          # Flujo principal
```

## Patrones disponibles

| Patrón | Condición | Bonus |
|--------|-----------|-------|
| Cadena Simple | 3+ fichas | +15 pts |
| Cadena Larga | 5+ fichas | x1.5 |
| Cadena Maxima | 7+ fichas | +60 pts, x1.8 |
| Doble Doble | 2+ dobles | +30 pts |
| Triple Doble | 3+ dobles | +50 pts, x1.2 |
| Dominio | 4+ conexiones del mismo número | +25 pts |
| Cierre Exacto | Extremos iguales | x2 |
| Escalera | 3+ conexiones ascendentes/descendentes | +35 pts |
| Simetría | Cierre con doble central | +40 pts, x1.3 |
| Parejas | 2+ fichas consecutivas con misma suma | +30 pts, x1.15 |
| Racha Alta | 3+ fichas con suma >= 9 | +40 pts |
| Racha Baja | 4+ fichas con suma <= 4 | x1.4 |
| Alternancia | Dobles y no-dobles alternados | +35 pts, x1.1 |
| Suma Exacta | Suma = 21, 42 o 63 | x1.5 |
| Puente 0-6 | Extremos 0 y 6 | +45 pts |

## Fichas especiales

| Tipo | Aparece | Efecto |
|------|---------|--------|
| Comodin (wild) | Ronda 3+ | Conecta con cualquier número |
| Dorada (golden) | Ronda 2+ | x2 puntos base |
| Bloqueada (locked) | Ronda 5+ | No se puede jugar |

## Jefes (cada 5 rondas)

| Jefe | Restricción | Recompensa |
|------|-------------|------------|
| Guardian de la Cadena | No dobles | 50 oro |
| Coloso | Sin restricción, meta x2 | 40 oro + reliquia |
| El Minimalista | Max 5 fichas | 45 oro |
| Maestro de Patrones | Min 2 patrones | 55 oro + reliquia |
| El Purificador | Sin comodines, meta x1.8 | 60 oro |

## Metas de ronda

- Ronda 1: 80 pts
- Ronda 2: 140 pts
- Ronda 3: 220 pts
- Ronda 4: 320 pts
- Ronda 5+: +120 pts por ronda

## Build de producción

```bash
npm run build
npm run preview
```

Los archivos se generan en `/dist` (~104 KB gzipped).
