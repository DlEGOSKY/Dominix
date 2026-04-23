import type { RewardOption } from "@/types/reward";
import type { SavedData } from "@/types/domino";
import { ALL_RELICS, getRelicRarity } from "./relics";
import { isRelicUnlocked } from "./unlocks";
import { getGlobalRNG } from "./rng";
import { ALL_ACTIVE_MUTATIONS } from "./activeMutations";
import { rollRandomConsumable } from "./consumables";
import { rollRandomCelestial } from "./celestial";

export interface RewardGenOptions {
  /** When true, biases relics toward rare/legendary (elite rounds). */
  eliteBoost?: boolean;
  /** Multiplier applied to legendary weight (ascension). Defaults 1. */
  legendaryWeightMultiplier?: number;
}

export function generateRewardOptions(
  excludeRelicIds: string[],
  savedData?: SavedData,
  round: number = 1,
  ownedMutationIds: string[] = [],
  opts: RewardGenOptions = {},
  ownedCelestialIds: string[] = [],
): RewardOption[] {
  let availableRelics = ALL_RELICS.filter((r) => !excludeRelicIds.includes(r.id));

  if (savedData) {
    availableRelics = availableRelics.filter((r) => isRelicUnlocked(r.id, savedData));
  }

  // Weighted shuffle by rarity. Elite rounds heavily boost rare/legendary.
  const rng = getGlobalRNG();
  const legMul = opts.legendaryWeightMultiplier ?? 1;
  const weightFor = (r: typeof availableRelics[number]): number => {
    const rarity = getRelicRarity(r);
    if (opts.eliteBoost) {
      if (rarity === "legendary") return 8 * legMul;
      if (rarity === "rare") return 5;
      return 1;
    }
    if (rarity === "legendary") return 1 * legMul;
    if (rarity === "rare") return 2;
    return 4;
  };
  // Produce a weighted random order
  const shuffled = [...availableRelics]
    .map((r) => ({ r, k: -Math.log(1 - rng.next()) / weightFor(r) }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.r);
  const relics = shuffled.slice(0, 2);

  const options: RewardOption[] = relics.map((relic) => ({
    id: `relic-${relic.id}`,
    name: relic.name,
    description: relic.description,
    reward: { type: "relic", relic },
  }));

  const mutations: RewardOption[] = [
    {
      id: "remove_tile",
      name: "Eliminar ficha",
      description: "Quita una ficha debil de tu set",
      reward: { type: "remove_tile" },
    },
    {
      id: "duplicate_tile",
      name: "Duplicar ficha",
      description: "Duplica una ficha poderosa de tu set",
      reward: { type: "duplicate_tile" },
    },
    {
      id: "convert_number",
      name: "Convertir numero",
      description: "Cambia un numero de una ficha por otro",
      reward: { type: "convert_number" },
    },
  ];

  const randomMutation = mutations[Math.floor(getGlobalRNG().next() * mutations.length)]!;
  options.push(randomMutation);

  // Active mutation reward (from round 3+, if not all owned)
  if (round >= 3) {
    const availableMuts = ALL_ACTIVE_MUTATIONS.filter((m) => !ownedMutationIds.includes(m.id));
    if (availableMuts.length > 0) {
      const picked = availableMuts[Math.floor(getGlobalRNG().next() * availableMuts.length)]!;
      options.push({
        id: `active-${picked.id}`,
        name: picked.name,
        description: `Poder activo: ${picked.description}`,
        reward: { type: "active_mutation", mutationId: picked.id },
      });
    }
  }

  // Consumable reward (from round 2+, 40% chance; elite boosts to 70%)
  if (round >= 2) {
    const chance = opts.eliteBoost ? 0.7 : 0.4;
    if (getGlobalRNG().next() < chance) {
      const c = rollRandomConsumable(opts.eliteBoost);
      options.push({
        id: `consumable-${c.id}`,
        name: c.name,
        description: `Consumible: ${c.description}`,
        reward: { type: "consumable", consumableId: c.id },
      });
    }
  }

  // Celestial card (from round 3+, 20% chance; elite boosts to 40%)
  if (round >= 3) {
    const chance = opts.eliteBoost ? 0.4 : 0.2;
    if (getGlobalRNG().next() < chance) {
      const c = rollRandomCelestial(ownedCelestialIds);
      options.push({
        id: `celestial-${c.id}`,
        name: c.name,
        description: `Celeste: ${c.description}`,
        reward: { type: "celestial", celestialId: c.id },
      });
    }
  }

  return options;
}
