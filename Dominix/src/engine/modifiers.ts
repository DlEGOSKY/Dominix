export interface RunModifier {
  id: string;
  name: string;
  description: string;
  type: "difficulty" | "variant" | "challenge";
  effects: ModifierEffect[];
  unlockCondition?: { type: "rounds" | "runs"; value: number };
}

export interface ModifierEffect {
  type:
    | "target_multiplier"
    | "hand_size"
    | "starting_relics"
    | "pattern_bonus"
    | "no_mutations"
    | "limited_rerolls"
    | "score_multiplier";
  value: number | string;
}

export const ALL_MODIFIERS: RunModifier[] = [
  // Dificultades
  {
    id: "easy",
    name: "Facil",
    description: "Metas de ronda reducidas un 20%",
    type: "difficulty",
    effects: [{ type: "target_multiplier", value: 0.8 }],
  },
  {
    id: "normal",
    name: "Normal",
    description: "La experiencia estandar de Dominix",
    type: "difficulty",
    effects: [],
  },
  {
    id: "hard",
    name: "Dificil",
    description: "Metas de ronda aumentadas un 25%",
    type: "difficulty",
    effects: [{ type: "target_multiplier", value: 1.25 }],
    unlockCondition: { type: "rounds", value: 5 },
  },
  {
    id: "brutal",
    name: "Brutal",
    description: "Metas +50%, mano de 6 fichas",
    type: "difficulty",
    effects: [
      { type: "target_multiplier", value: 1.5 },
      { type: "hand_size", value: 6 },
    ],
    unlockCondition: { type: "rounds", value: 8 },
  },

  // Variantes
  {
    id: "blessed",
    name: "Bendecido",
    description: "Empiezas con una reliquia aleatoria",
    type: "variant",
    effects: [{ type: "starting_relics", value: 1 }],
    unlockCondition: { type: "runs", value: 3 },
  },
  {
    id: "pattern_master",
    name: "Maestro de Patrones",
    description: "Patrones dan +50% bonus, pero metas +30%",
    type: "variant",
    effects: [
      { type: "pattern_bonus", value: 1.5 },
      { type: "target_multiplier", value: 1.3 },
    ],
    unlockCondition: { type: "rounds", value: 6 },
  },
  {
    id: "purist",
    name: "Purista",
    description: "Sin mutaciones disponibles, pero score x1.2",
    type: "variant",
    effects: [
      { type: "no_mutations", value: 1 },
      { type: "score_multiplier", value: 1.2 },
    ],
    unlockCondition: { type: "runs", value: 5 },
  },

  // Desafios
  {
    id: "speedrun",
    name: "Contrarreloj",
    description: "Solo 5 fichas en mano, pero metas -15%",
    type: "challenge",
    effects: [
      { type: "hand_size", value: 5 },
      { type: "target_multiplier", value: 0.85 },
    ],
    unlockCondition: { type: "rounds", value: 4 },
  },
  {
    id: "glass_cannon",
    name: "Canon de Cristal",
    description: "Score x1.5, pero metas +40%",
    type: "challenge",
    effects: [
      { type: "score_multiplier", value: 1.5 },
      { type: "target_multiplier", value: 1.4 },
    ],
    unlockCondition: { type: "runs", value: 8 },
  },
];

export interface ModifierConfig {
  targetMultiplier: number;
  handSize: number;
  startingRelics: number;
  patternBonus: number;
  noMutations: boolean;
  scoreMultiplier: number;
}

export function getDefaultConfig(): ModifierConfig {
  return {
    targetMultiplier: 1,
    handSize: 7,
    startingRelics: 0,
    patternBonus: 1,
    noMutations: false,
    scoreMultiplier: 1,
  };
}

export function applyModifiers(modifierIds: string[]): ModifierConfig {
  const config = getDefaultConfig();

  for (const id of modifierIds) {
    const modifier = ALL_MODIFIERS.find((m) => m.id === id);
    if (!modifier) continue;

    for (const effect of modifier.effects) {
      switch (effect.type) {
        case "target_multiplier":
          config.targetMultiplier *= effect.value as number;
          break;
        case "hand_size":
          config.handSize = effect.value as number;
          break;
        case "starting_relics":
          config.startingRelics += effect.value as number;
          break;
        case "pattern_bonus":
          config.patternBonus *= effect.value as number;
          break;
        case "no_mutations":
          config.noMutations = true;
          break;
        case "score_multiplier":
          config.scoreMultiplier *= effect.value as number;
          break;
      }
    }
  }

  return config;
}

export function isModifierUnlocked(modifier: RunModifier, bestRound: number, totalRuns: number): boolean {
  if (!modifier.unlockCondition) return true;

  switch (modifier.unlockCondition.type) {
    case "rounds":
      return bestRound >= modifier.unlockCondition.value;
    case "runs":
      return totalRuns >= modifier.unlockCondition.value;
    default:
      return true;
  }
}

export function getUnlockedModifiers(bestRound: number, totalRuns: number): RunModifier[] {
  return ALL_MODIFIERS.filter((m) => isModifierUnlocked(m, bestRound, totalRuns));
}
