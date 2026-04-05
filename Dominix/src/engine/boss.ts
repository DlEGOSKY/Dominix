export interface Boss {
  id: string;
  name: string;
  description: string;
  targetMultiplier: number;
  restriction?: BossRestriction;
  reward: BossReward;
}

export type BossRestriction =
  | { type: "no_doubles" }
  | { type: "max_tiles"; count: number }
  | { type: "min_patterns"; count: number }
  | { type: "no_wild" };

export interface BossReward {
  gold: number;
  extraRelic: boolean;
}

const ALL_BOSSES: Boss[] = [
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
];

export function getBossForRound(round: number): Boss | null {
  if (round % 5 !== 0 || round === 0) return null;
  const index = Math.floor((round / 5 - 1) % ALL_BOSSES.length);
  return ALL_BOSSES[index]!;
}

export function isBossRound(round: number): boolean {
  return round > 0 && round % 5 === 0;
}
