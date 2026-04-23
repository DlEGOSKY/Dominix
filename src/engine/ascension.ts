/**
 * Ascension System — persistent difficulty layers.
 *
 * After completing a run at ascension N, level N+1 unlocks.
 * Each level stacks an extra rule on top of the previous ones,
 * progressively harder. Acts as endgame and bragging rights.
 */

import type { ModifierConfig } from "./modifiers";

export type AscensionEffectKind =
  | "target_multiplier"
  | "hand_size_delta"
  | "action_bonus_delta"
  | "pattern_bonus_multiplier"
  | "shop_relic_cost_multiplier"
  | "reroll_cost_multiplier"
  | "legendary_weight_multiplier"
  | "boss_target_multiplier";

export interface AscensionEffect {
  kind: AscensionEffectKind;
  value: number;
}

export interface AscensionLevel {
  level: number;
  name: string;
  description: string;
  effects: AscensionEffect[];
}

export const ASCENSION_LEVELS: AscensionLevel[] = [
  {
    level: 1,
    name: "Umbral",
    description: "Metas +10% a partir de esta ronda.",
    effects: [{ kind: "target_multiplier", value: 1.10 }],
  },
  {
    level: 2,
    name: "Avaricia",
    description: "Reliquias en tienda cuestan 25% mas.",
    effects: [{ kind: "shop_relic_cost_multiplier", value: 1.25 }],
  },
  {
    level: 3,
    name: "Mano estrecha",
    description: "-1 ficha en tu mano inicial.",
    effects: [{ kind: "hand_size_delta", value: -1 }],
  },
  {
    level: 4,
    name: "Jefe tenaz",
    description: "Los jefes tienen +15% meta adicional.",
    effects: [{ kind: "boss_target_multiplier", value: 1.15 }],
  },
  {
    level: 5,
    name: "Premura",
    description: "-1 accion por ronda.",
    effects: [{ kind: "action_bonus_delta", value: -1 }],
  },
  {
    level: 6,
    name: "Presion",
    description: "Metas +10% adicionales.",
    effects: [{ kind: "target_multiplier", value: 1.10 }],
  },
  {
    level: 7,
    name: "Mercado cruel",
    description: "Re-rolls cuestan el doble.",
    effects: [{ kind: "reroll_cost_multiplier", value: 2 }],
  },
  {
    level: 8,
    name: "Patron debil",
    description: "Bonos de patron reducidos 20%.",
    effects: [{ kind: "pattern_bonus_multiplier", value: 0.80 }],
  },
  {
    level: 9,
    name: "Vacio",
    description: "Metas +10% adicionales.",
    effects: [{ kind: "target_multiplier", value: 1.10 }],
  },
  {
    level: 10,
    name: "Cima",
    description: "Reliquias legendarias son la mitad de comunes.",
    effects: [{ kind: "legendary_weight_multiplier", value: 0.5 }],
  },
  // ---- S7: endgame ascensions (11-15) ----
  {
    level: 11,
    name: "Voragine",
    description: "Bonos de patron reducidos 20% adicional.",
    effects: [{ kind: "pattern_bonus_multiplier", value: 0.80 }],
  },
  {
    level: 12,
    name: "Escasez",
    description: "-1 ficha adicional en tu mano inicial.",
    effects: [{ kind: "hand_size_delta", value: -1 }],
  },
  {
    level: 13,
    name: "Usurero",
    description: "Reliquias en tienda cuestan 25% mas (acumulado).",
    effects: [{ kind: "shop_relic_cost_multiplier", value: 1.25 }],
  },
  {
    level: 14,
    name: "Tirania",
    description: "Los jefes tienen +15% meta adicional.",
    effects: [{ kind: "boss_target_multiplier", value: 1.15 }],
  },
  {
    level: 15,
    name: "Abismo",
    description: "Metas +15% adicionales. El fin de toda ceremonia.",
    effects: [{ kind: "target_multiplier", value: 1.15 }],
  },
];

export interface AccumulatedAscension {
  targetMultiplier: number;
  handSizeDelta: number;
  actionBonusDelta: number;
  patternBonusMultiplier: number;
  shopRelicCostMultiplier: number;
  rerollCostMultiplier: number;
  legendaryWeightMultiplier: number;
  bossTargetMultiplier: number;
  activeLevel: number;
}

export function getAccumulatedAscension(level: number): AccumulatedAscension {
  const acc: AccumulatedAscension = {
    targetMultiplier: 1,
    handSizeDelta: 0,
    actionBonusDelta: 0,
    patternBonusMultiplier: 1,
    shopRelicCostMultiplier: 1,
    rerollCostMultiplier: 1,
    legendaryWeightMultiplier: 1,
    bossTargetMultiplier: 1,
    activeLevel: level,
  };
  for (let i = 0; i < Math.min(level, ASCENSION_LEVELS.length); i++) {
    const lv = ASCENSION_LEVELS[i]!;
    for (const eff of lv.effects) {
      switch (eff.kind) {
        case "target_multiplier": acc.targetMultiplier *= eff.value; break;
        case "hand_size_delta": acc.handSizeDelta += eff.value; break;
        case "action_bonus_delta": acc.actionBonusDelta += eff.value; break;
        case "pattern_bonus_multiplier": acc.patternBonusMultiplier *= eff.value; break;
        case "shop_relic_cost_multiplier": acc.shopRelicCostMultiplier *= eff.value; break;
        case "reroll_cost_multiplier": acc.rerollCostMultiplier *= eff.value; break;
        case "legendary_weight_multiplier": acc.legendaryWeightMultiplier *= eff.value; break;
        case "boss_target_multiplier": acc.bossTargetMultiplier *= eff.value; break;
      }
    }
  }
  return acc;
}

/**
 * Apply ascension effects on top of a base ModifierConfig.
 * Does NOT touch shop/reroll/legendary fields (those are consumed separately).
 */
export function applyAscensionToModifier(base: ModifierConfig, level: number): ModifierConfig {
  if (level <= 0) return base;
  const acc = getAccumulatedAscension(level);
  return {
    ...base,
    targetMultiplier: base.targetMultiplier * acc.targetMultiplier,
    handSize: Math.max(3, base.handSize + acc.handSizeDelta),
    actionBonus: base.actionBonus + acc.actionBonusDelta,
    patternBonus: base.patternBonus * acc.patternBonusMultiplier,
  };
}

// ---- Persistence: highest ascension cleared (global across characters for V1) ----

const ASCENSION_KEY = "dominix_ascension_v1";

export interface AscensionState {
  /** Highest level cleared (0 = none). Next playable = cleared + 1, capped at 10. */
  highestCleared: number;
  /** Currently selected for next run. */
  selected: number;
}

export function loadAscension(): AscensionState {
  try {
    const raw = localStorage.getItem(ASCENSION_KEY);
    if (!raw) return { highestCleared: 0, selected: 0 };
    const parsed = JSON.parse(raw) as AscensionState;
    return {
      highestCleared: Math.min(ASCENSION_LEVELS.length, Math.max(0, parsed.highestCleared ?? 0)),
      selected: Math.min(ASCENSION_LEVELS.length, Math.max(0, parsed.selected ?? 0)),
    };
  } catch {
    return { highestCleared: 0, selected: 0 };
  }
}

export function saveAscension(state: AscensionState): void {
  localStorage.setItem(ASCENSION_KEY, JSON.stringify(state));
}

export function setSelectedAscension(level: number): AscensionState {
  const state = loadAscension();
  const maxUnlocked = Math.min(ASCENSION_LEVELS.length, state.highestCleared + 1);
  const clamped = Math.min(maxUnlocked, Math.max(0, level));
  const next = { ...state, selected: clamped };
  saveAscension(next);
  return next;
}

/** Mark the given ascension level as cleared if it's newly beaten. */
export function markAscensionCleared(level: number): AscensionState {
  const state = loadAscension();
  if (level > state.highestCleared) {
    const next = { ...state, highestCleared: Math.min(ASCENSION_LEVELS.length, level) };
    saveAscension(next);
    return next;
  }
  return state;
}

export function getMaxSelectableAscension(): number {
  const state = loadAscension();
  return Math.min(ASCENSION_LEVELS.length, state.highestCleared + 1);
}
