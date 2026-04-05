import type { RewardOption } from "@/types/reward";
import type { SavedData } from "@/types/domino";
import { ALL_RELICS } from "./relics";
import { isRelicUnlocked } from "./unlocks";

export function generateRewardOptions(excludeRelicIds: string[], savedData?: SavedData): RewardOption[] {
  let availableRelics = ALL_RELICS.filter((r) => !excludeRelicIds.includes(r.id));
  
  if (savedData) {
    availableRelics = availableRelics.filter((r) => isRelicUnlocked(r.id, savedData));
  }

  const shuffled = [...availableRelics].sort(() => Math.random() - 0.5);
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

  const randomMutation = mutations[Math.floor(Math.random() * mutations.length)]!;
  options.push(randomMutation);

  return options;
}
