import { getGlobalRNG } from "@/engine/rng";

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
  | { type: "bonus_actions"; actions: number; discards: number; draws: number }
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
  {
    id: "eco_dorado",
    name: "Eco Dorado",
    description: "Una ficha de tu pool se convierte en dorada",
    type: "blessing",
    effect: { type: "bonus_score", value: 35 },
    minRound: 3,
  },
  {
    id: "terremoto",
    name: "Terremoto",
    description: "El suelo tiembla y pierdes 2 fichas del pool",
    type: "curse",
    effect: { type: "remove_random_tile", count: 2 },
    minRound: 5,
  },
  {
    id: "vision_futura",
    name: "Vision del Futuro",
    description: "Elige entre prepararte o arriesgarte",
    type: "choice",
    effect: {
      type: "choice",
      options: [
        {
          label: "Preparacion",
          description: "Meta -15%, +1 ficha extra en mano",
          effect: { type: "reduce_target", percent: 15 },
        },
        {
          label: "Ambicion",
          description: "Meta +20%, pero +50 puntos de bonus",
          effect: { type: "bonus_score", value: 50 },
        },
      ],
    },
    minRound: 4,
  },
  {
    id: "lluvia_fichas",
    name: "Lluvia de Fichas",
    description: "El cielo se abre y caen fichas nuevas",
    type: "blessing",
    effect: { type: "add_tiles", count: 3 },
    minRound: 5,
  },
  {
    id: "flujo_tactico",
    name: "Flujo Tactico",
    description: "Tus reflejos se agudizan: +3 acciones esta ronda",
    type: "blessing",
    effect: { type: "bonus_actions", actions: 3, discards: 0, draws: 0 },
    minRound: 2,
  },
  {
    id: "manos_agiles",
    name: "Manos Agiles",
    description: "Puedes descartar y robar con mas libertad",
    type: "blessing",
    effect: { type: "bonus_actions", actions: 0, discards: 1, draws: 1 },
    minRound: 3,
  },
  {
    id: "bloqueo_temporal",
    name: "Bloqueo Temporal",
    description: "Tu energia se drena. Pierdes 3 acciones esta ronda",
    type: "curse",
    effect: { type: "bonus_actions", actions: -3, discards: 0, draws: 0 },
    minRound: 4,
  },
  {
    id: "intercambio_tactico",
    name: "Intercambio Tactico",
    description: "Cambia tu estilo de juego",
    type: "choice",
    effect: {
      type: "choice",
      options: [
        {
          label: "Mas acciones",
          description: "+4 acciones, pero -1 descarte",
          effect: { type: "bonus_actions", actions: 4, discards: -1, draws: 0 },
        },
        {
          label: "Mas flexibilidad",
          description: "+1 descarte y +1 robo, pero -2 acciones",
          effect: { type: "bonus_actions", actions: -2, discards: 1, draws: 1 },
        },
      ],
    },
    minRound: 4,
  },
  {
    id: "pacto_oscuro",
    name: "Pacto Oscuro",
    description: "Un poder oscuro te ofrece un trato",
    type: "choice",
    effect: {
      type: "choice",
      options: [
        {
          label: "Aceptar poder",
          description: "Meta +35%, pero +75 puntos de bonus",
          effect: { type: "bonus_score", value: 75 },
        },
        {
          label: "Rechazar",
          description: "Pierdes 1 ficha pero meta -10%",
          effect: { type: "reduce_target", percent: 10 },
        },
      ],
    },
    minRound: 7,
  },
  {
    id: "viajero_misterioso",
    name: "Viajero Misterioso",
    description: "Un extraño con una caja cerrada ofrece un intercambio",
    type: "choice",
    effect: {
      type: "choice",
      options: [
        {
          label: "Aceptar caja",
          description: "+3 fichas nuevas en el pool, pero meta +10%",
          effect: { type: "add_tiles", count: 3 },
        },
        {
          label: "Dar una ficha",
          description: "Pierdes 1 ficha, empiezas con +60 puntos",
          effect: { type: "bonus_score", value: 60 },
        },
      ],
    },
    minRound: 2,
  },
  {
    id: "astro_errante",
    name: "Astro Errante",
    description: "Una luz cruza el cielo y bendice tu juego con energia cosmica",
    type: "blessing",
    effect: { type: "bonus_score", value: 45 },
    minRound: 4,
  },
  {
    id: "apuesta_coleccionista",
    name: "Apuesta del Coleccionista",
    description: "Un coleccionista apuesta su fortuna contra la tuya",
    type: "choice",
    effect: {
      type: "choice",
      options: [
        {
          label: "Doblar apuesta",
          description: "Meta +50%, pero +120 puntos de bonus si ganas",
          effect: { type: "bonus_score", value: 120 },
        },
        {
          label: "Retirarse",
          description: "Meta -5% y no pierdes nada",
          effect: { type: "reduce_target", percent: 5 },
        },
      ],
    },
    minRound: 5,
  },
  {
    id: "duelo_sombras",
    name: "Duelo de Sombras",
    description: "Un eco de ti mismo te roba energia, pero deja una marca en sus manos",
    type: "curse",
    effect: { type: "bonus_actions", actions: -2, discards: 0, draws: 0 },
    minRound: 6,
  },
  {
    id: "ultimo_soplido",
    name: "Ultimo Soplido",
    description: "Una racha de viento agita las fichas y te da ventaja",
    type: "blessing",
    effect: { type: "bonus_actions", actions: 2, discards: 1, draws: 0 },
    minRound: 4,
  },
];

export function getRandomEvent(round: number): GameEvent | null {
  // 30% de probabilidad de evento
  if (getGlobalRNG().next() > 0.3) return null;

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
  let random = getGlobalRNG().next() * totalWeight;

  for (let i = 0; i < availableEvents.length; i++) {
    random -= weights[i]!;
    if (random <= 0) {
      return availableEvents[i]!;
    }
  }

  return availableEvents[0] ?? null;
}

export interface EventResult {
  targetModifier: number;
  scoreBonus: number;
  handBonus: number;
  tileChange: number;
  relicId?: string;
  actionBonus?: { actions: number; discards: number; draws: number };
}

export function applyEventEffect(
  effect: Exclude<EventEffect, { type: "choice" }>
): EventResult {
  const result: EventResult = {
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
    case "add_relic":
      result.relicId = effect.relicId;
      break;
    case "bonus_actions":
      result.actionBonus = { actions: effect.actions, discards: effect.discards, draws: effect.draws };
      break;
  }

  return result;
}
