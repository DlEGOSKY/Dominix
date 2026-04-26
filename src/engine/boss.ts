export interface BossPhase {
  targetMultiplier: number;
  restriction?: BossRestriction;
  description: string;
}

export interface Boss {
  id: string;
  name: string;
  description: string;
  targetMultiplier: number;
  restriction?: BossRestriction;
  reward: BossReward;
  phases?: BossPhase[];
}

export type BossRestriction =
  | { type: "no_doubles" }
  | { type: "max_tiles"; count: number }
  | { type: "min_patterns"; count: number }
  | { type: "no_wild" }
  | { type: "only_doubles" }
  | { type: "only_low"; max: number }
  | { type: "min_chain_length"; count: number }
  | { type: "no_repeat_number" }
  | { type: "max_doubles"; count: number }
  | { type: "even_sum_only" }
  | { type: "exact_chain_length"; count: number };

export interface BossReward {
  gold: number;
  extraRelic: boolean;
}

export const ALL_BOSSES: Boss[] = [
  {
    id: "guardian",
    name: "Guardian de la Cadena",
    description: "Meta x1.6. No puedes usar dobles.",
    targetMultiplier: 1.6,
    restriction: { type: "no_doubles" },
    reward: { gold: 50, extraRelic: false },
  },
  {
    id: "coloso",
    name: "Coloso",
    description: "Meta x2. Sin restricciones, puro poder.",
    targetMultiplier: 2,
    reward: { gold: 40, extraRelic: true },
  },
  {
    id: "minimalista",
    name: "El Minimalista",
    description: "Meta x1.4. Maximo 5 fichas en la cadena.",
    targetMultiplier: 1.4,
    restriction: { type: "max_tiles", count: 5 },
    reward: { gold: 45, extraRelic: false },
  },
  {
    id: "maestro",
    name: "Maestro de Patrones",
    description: "Meta x1.5. Necesitas activar al menos 2 patrones.",
    targetMultiplier: 1.5,
    restriction: { type: "min_patterns", count: 2 },
    reward: { gold: 55, extraRelic: true },
  },
  {
    id: "purificador",
    name: "El Purificador",
    description: "Meta x1.8. Las fichas comodin no funcionan.",
    targetMultiplier: 1.8,
    restriction: { type: "no_wild" },
    reward: { gold: 60, extraRelic: false },
  },
  {
    id: "espejista",
    name: "El Espejista",
    description: "Meta x1.5. Solo puedes jugar dobles.",
    targetMultiplier: 1.5,
    restriction: { type: "only_doubles" },
    reward: { gold: 55, extraRelic: true },
  },
  {
    id: "susurro",
    name: "El Susurro",
    description: "Meta x1.4. Solo fichas con suma menor o igual a 6.",
    targetMultiplier: 1.4,
    restriction: { type: "only_low", max: 6 },
    reward: { gold: 50, extraRelic: false },
  },
  {
    id: "arquitecto",
    name: "El Arquitecto",
    description: "Meta x1.6. La cadena debe tener al menos 5 fichas para ganar.",
    targetMultiplier: 1.6,
    restriction: { type: "min_chain_length", count: 5 },
    reward: { gold: 55, extraRelic: false },
  },
  {
    id: "caos",
    name: "Agente del Caos",
    description: "Meta x1.7. No puedes conectar el mismo numero dos veces seguidas.",
    targetMultiplier: 1.7,
    restriction: { type: "no_repeat_number" },
    reward: { gold: 65, extraRelic: true },
  },
  {
    id: "titan",
    name: "El Titan",
    description: "Meta x2.2. Sin restricciones. Pura fuerza bruta.",
    targetMultiplier: 2.2,
    reward: { gold: 80, extraRelic: true },
  },
  {
    id: "fantasma",
    name: "El Fantasma",
    description: "Meta x1.5. Solo fichas con suma menor o igual a 4.",
    targetMultiplier: 1.5,
    restriction: { type: "only_low", max: 4 },
    reward: { gold: 60, extraRelic: false },
  },
  {
    id: "perfeccionista",
    name: "El Perfeccionista",
    description: "Meta x1.8. Debes activar al menos 3 patrones.",
    targetMultiplier: 1.8,
    restriction: { type: "min_patterns", count: 3 },
    reward: { gold: 70, extraRelic: true },
  },
  {
    id: "inquisidor",
    name: "El Inquisidor",
    description: "Meta x1.7. Sin comodines y al menos 4 fichas.",
    targetMultiplier: 1.7,
    restriction: { type: "no_wild" },
    reward: { gold: 65, extraRelic: false },
    phases: [
      { targetMultiplier: 1.7, restriction: { type: "no_wild" }, description: "Fase 1: Sin comodines" },
      { targetMultiplier: 1.4, restriction: { type: "min_chain_length", count: 4 }, description: "Fase 2: Minimo 4 fichas" },
    ],
  },
  {
    id: "verdugo",
    name: "El Verdugo",
    description: "Meta x2. Solo dobles y al menos 2 patrones.",
    targetMultiplier: 2,
    restriction: { type: "only_doubles" },
    reward: { gold: 85, extraRelic: true },
    phases: [
      { targetMultiplier: 2, restriction: { type: "only_doubles" }, description: "Fase 1: Solo dobles" },
      { targetMultiplier: 1.5, restriction: { type: "min_patterns", count: 2 }, description: "Fase 2: 2 patrones" },
    ],
  },
  {
    id: "abismo",
    name: "El Abismo",
    description: "Meta x1.6. Solo fichas bajas y sin repetir numero.",
    targetMultiplier: 1.6,
    restriction: { type: "only_low", max: 5 },
    reward: { gold: 75, extraRelic: true },
  },
  {
    id: "coleccionista",
    name: "El Coleccionista",
    description: "Meta x1.7. Solo 1 doble permitido en toda la cadena.",
    targetMultiplier: 1.7,
    restriction: { type: "max_doubles", count: 1 },
    reward: { gold: 70, extraRelic: true },
  },
  {
    id: "equinoccio",
    name: "El Equinoccio",
    description: "Meta x1.5. Solo fichas con suma par son validas.",
    targetMultiplier: 1.5,
    restriction: { type: "even_sum_only" },
    reward: { gold: 60, extraRelic: false },
  },
  {
    id: "ritual",
    name: "El Ritual",
    description: "Meta x1.7. La cadena debe tener exactamente 6 fichas.",
    targetMultiplier: 1.7,
    restriction: { type: "exact_chain_length", count: 6 },
    reward: { gold: 75, extraRelic: true },
  },
  // ---- S7: nuevos jefes ----
  {
    id: "astrologo",
    name: "El Astrologo",
    description: "Meta x1.8. La cadena debe tener exactamente 7 fichas.",
    targetMultiplier: 1.8,
    restriction: { type: "exact_chain_length", count: 7 },
    reward: { gold: 80, extraRelic: true },
  },
  {
    id: "heresiarca",
    name: "El Heresiarca",
    description: "Meta x1.9. Dos fases: sin dobles, luego cadena exacta de 6.",
    targetMultiplier: 1.9,
    restriction: { type: "no_doubles" },
    reward: { gold: 90, extraRelic: true },
    phases: [
      { targetMultiplier: 1.9, restriction: { type: "no_doubles" }, description: "Fase 1: Sin dobles" },
      { targetMultiplier: 1.5, restriction: { type: "exact_chain_length", count: 6 }, description: "Fase 2: Cadena de 6" },
    ],
  },
  {
    id: "desvanecido",
    name: "El Desvanecido",
    description: "Meta x1.7. Dos fases: solo dobles, luego sin repetir numero.",
    targetMultiplier: 1.7,
    restriction: { type: "only_doubles" },
    reward: { gold: 85, extraRelic: true },
    phases: [
      { targetMultiplier: 1.7, restriction: { type: "only_doubles" }, description: "Fase 1: Solo dobles" },
      { targetMultiplier: 1.4, restriction: { type: "no_repeat_number" }, description: "Fase 2: Sin repetir numero" },
    ],
  },
  // ---- S8: nuevos jefes ----
  {
    id: "sirena",
    name: "La Sirena",
    description: "Meta x1.6. Tres fases: bajos, dobles, sin dobles. Cambia tu juego o muere.",
    targetMultiplier: 1.6,
    restriction: { type: "only_low", max: 4 },
    reward: { gold: 100, extraRelic: true },
    phases: [
      { targetMultiplier: 1.6, restriction: { type: "only_low", max: 4 }, description: "Fase 1: Solo fichas de suma <= 4" },
      { targetMultiplier: 1.4, restriction: { type: "only_doubles" }, description: "Fase 2: Solo dobles" },
      { targetMultiplier: 1.3, restriction: { type: "no_doubles" }, description: "Fase 3: Sin dobles" },
    ],
  },
  {
    id: "tejedor",
    name: "El Tejedor de Astros",
    description: "Meta x1.8. Tres fases: 2 patrones, cadena 6+, 3 patrones. Para los que dominan el ritual.",
    targetMultiplier: 1.8,
    restriction: { type: "min_patterns", count: 2 },
    reward: { gold: 110, extraRelic: true },
    phases: [
      { targetMultiplier: 1.8, restriction: { type: "min_patterns", count: 2 }, description: "Fase 1: Activa 2+ patrones" },
      { targetMultiplier: 1.5, restriction: { type: "min_chain_length", count: 6 }, description: "Fase 2: Cadena de 6+ fichas" },
      { targetMultiplier: 1.3, restriction: { type: "min_patterns", count: 3 }, description: "Fase 3: Activa 3+ patrones" },
    ],
  },
];

export function getBossForRound(round: number): Boss | null {
  if (round % 5 !== 0 || round === 0) return null;
  const index = Math.floor((round / 5 - 1) % ALL_BOSSES.length);
  return ALL_BOSSES[index]!;
}

export function isBossRound(round: number): boolean {
  return round > 0 && round % 5 === 0;
}
