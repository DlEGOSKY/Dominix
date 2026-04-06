export interface GameEvent {
  id: string;
  name: string;
  description: string;
  type: "blessing" | "curse" | "choice" | "shop";
  effect: EventEffect;
  minRound?: number;
}

export type EventEffect =
  | { type: "add_relic"; relicId: string }
  | { type: "remove_random_tile"; count: number }
  | { type: "add_tiles"; count: number }
  | { type: "bonus_score"; value: number }
  | { type: "reduce_target"; percent: number }
  | { type: "increase_target"; percent: number }
  | { type: "heal_hand"; count: number }
  | { type: "choice"; options: ChoiceOption[] };

export interface ChoiceOption {
  label: string;
  description: string;
  effect: Exclude<EventEffect, { type: "choice" }>;
}

export const ALL_EVENTS: GameEvent[] = [
  // Bendiciones
  {
    id: "lucky_draw",
    name: "Mano Afortunada",
    description: "Tu siguiente mano tendra una ficha extra",
    type: "blessing",
    effect: { type: "heal_hand", count: 1 },
  },
  {
    id: "easy_round",
    name: "Ronda Tranquila",
    description: "La meta de esta ronda se reduce un 15%",
    type: "blessing",
    effect: { type: "reduce_target", percent: 15 },
  },
  {
    id: "bonus_points",
    name: "Bonus Inesperado",
    description: "Empiezas la ronda con 25 puntos extra",
    type: "blessing",
    effect: { type: "bonus_score", value: 25 },
  },
  {
    id: "tile_gift",
    name: "Regalo del Destino",
    description: "Se añaden 2 fichas aleatorias a tu pool",
    type: "blessing",
    effect: { type: "add_tiles", count: 2 },
  },

  // Maldiciones
  {
    id: "hard_round",
    name: "Ronda Dificil",
    description: "La meta de esta ronda aumenta un 20%",
    type: "curse",
    effect: { type: "increase_target", percent: 20 },
    minRound: 3,
  },
  {
    id: "lost_tile",
    name: "Ficha Perdida",
    description: "Una ficha aleatoria desaparece de tu pool",
    type: "curse",
    effect: { type: "remove_random_tile", count: 1 },
    minRound: 2,
  },

  // Elecciones
  {
    id: "gamblers_choice",
    name: "Eleccion del Jugador",
    description: "Elige tu destino",
    type: "choice",
    effect: {
      type: "choice",
      options: [
        {
          label: "Riesgo",
          description: "Meta +25%, pero +40 puntos de bonus si ganas",
          effect: { type: "increase_target", percent: 25 },
        },
        {
          label: "Seguridad",
          description: "Meta -10%, sin bonus extra",
          effect: { type: "reduce_target", percent: 10 },
        },
      ],
    },
    minRound: 2,
  },
  {
    id: "sacrifice",
    name: "Sacrificio",
    description: "Sacrifica algo para ganar otra cosa",
    type: "choice",
    effect: {
      type: "choice",
      options: [
        {
          label: "Perder ficha",
          description: "Pierde 1 ficha, gana 30 puntos",
          effect: { type: "remove_random_tile", count: 1 },
        },
        {
          label: "Meta dificil",
          description: "Meta +15%, gana 2 fichas extra",
          effect: { type: "add_tiles", count: 2 },
        },
      ],
    },
    minRound: 3,
  },
  {
    id: "momentum",
    name: "Momentum",
    description: "Tu racha continua con fuerza",
    type: "blessing",
    effect: { type: "bonus_score", value: 40 },
    minRound: 4,
  },
  {
    id: "presion",
    name: "Bajo Presion",
    description: "La dificultad aumenta, pero tambien la recompensa",
    type: "choice",
    effect: {
      type: "choice",
      options: [
        {
          label: "Aceptar presion",
          description: "Meta +30%, pero +60 puntos de bonus",
          effect: { type: "increase_target", percent: 30 },
        },
        {
          label: "Rechazar",
          description: "Sin cambios",
          effect: { type: "bonus_score", value: 0 },
        },
      ],
    },
    minRound: 5,
  },
  {
    id: "segundo_aire",
    name: "Segundo Aire",
    description: "Recuperas energia para la siguiente ronda",
    type: "blessing",
    effect: { type: "heal_hand", count: 2 },
    minRound: 3,
  },
  {
    id: "tormenta",
    name: "Tormenta",
    description: "Una tormenta se acerca, las cosas se complican",
    type: "curse",
    effect: { type: "increase_target", percent: 25 },
    minRound: 6,
  },
];

export function getRandomEvent(round: number): GameEvent | null {
  // 30% de probabilidad de evento
  if (Math.random() > 0.3) return null;

  const availableEvents = ALL_EVENTS.filter(
    (e) => !e.minRound || round >= e.minRound
  );

  if (availableEvents.length === 0) return null;

  // Pesar eventos: bendiciones más comunes temprano, maldiciones más tarde
  const weights = availableEvents.map((e) => {
    if (e.type === "blessing") return round <= 3 ? 3 : 1;
    if (e.type === "curse") return round >= 4 ? 2 : 1;
    return 2; // choice siempre peso 2
  });

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < availableEvents.length; i++) {
    random -= weights[i]!;
    if (random <= 0) {
      return availableEvents[i]!;
    }
  }

  return availableEvents[0] ?? null;
}

export function applyEventEffect(
  effect: Exclude<EventEffect, { type: "choice" }>
): { targetModifier: number; scoreBonus: number; handBonus: number; tileChange: number } {
  const result = {
    targetModifier: 1,
    scoreBonus: 0,
    handBonus: 0,
    tileChange: 0,
  };

  switch (effect.type) {
    case "reduce_target":
      result.targetModifier = 1 - effect.percent / 100;
      break;
    case "increase_target":
      result.targetModifier = 1 + effect.percent / 100;
      break;
    case "bonus_score":
      result.scoreBonus = effect.value;
      break;
    case "heal_hand":
      result.handBonus = effect.count;
      break;
    case "add_tiles":
      result.tileChange = effect.count;
      break;
    case "remove_random_tile":
      result.tileChange = -effect.count;
      break;
  }

  return result;
}
