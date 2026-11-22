import { ALL_RELICS, getRelicFamily } from "../src/engine/relics";
import { ALL_CONSUMABLES } from "../src/engine/consumables";
import { ALL_CELESTIAL } from "../src/engine/celestial";
import type { RewardOption } from "../src/types/reward";
import type { RunStats } from "../src/types/domino";

const numbers = ALL_RELICS.filter(r => getRelicFamily(r) === "numero");
export const qaOwnedRelics = numbers.slice(0, 2).map(r => r.id);
const sampleRelics = [numbers[2]!, ALL_RELICS.find(r => getRelicFamily(r) === "fuerza")!];
const consumable = ALL_CONSUMABLES[2]!;
const celestial = ALL_CELESTIAL[0]!;
export const qaRewards: RewardOption[] = [
  ...sampleRelics.map(relic => ({ id: `qa-reward-${relic.id}`, name: relic.name, description: relic.description, reward: { type: "relic" as const, relic } })),
  { id: "qa-duplicate", name: "Duplicar ficha", description: "Duplica una ficha poderosa de tu set", reward: { type: "duplicate_tile" } },
  { id: "qa-consumable", name: consumable.name, description: consumable.description, reward: { type: "consumable", consumableId: consumable.id } },
  { id: "qa-celestial", name: celestial.name, description: celestial.description, reward: { type: "celestial", celestialId: celestial.id } },
  { id: "qa-power", name: "Detonacion", description: "Suma 25 puntos instantaneos al score de la ronda", reward: { type: "active_mutation", mutationId: "detonacion" } },
];

export function qaResults(variant: "normal" | "zero" | "long"): RunStats {
  const roundScores = variant === "zero" ? [0] : variant === "long" ? Array.from({ length: 80 }, (_, i) => i === 79 ? 0 : (i + 1) * 12345) : [153, 211, 1731, 3857, 1412, 0];
  return { roundsCompleted: roundScores.filter(s => s > 0).length, totalScore: roundScores.reduce((s, n) => s + n, 0), patternsActivated: variant === "zero" ? 0 : 19, patternBreakdown: variant === "zero" ? {} : { cadena_simple: 8, doble_doble: 7, dominio: 4 }, relicsCollected: 3, tilesPlayed: variant === "zero" ? 0 : 22, highestRoundScore: Math.max(...roundScores), bossesDefeated: 0, shopPurchases: 0, bestCombo: 0, goldEarned: variant === "zero" ? 0 : 955, tilesDiscarded: 0, tilesDrawn: 0, roundScores, roundNumbers: roundScores.map((_, i) => i + 2) };
}
