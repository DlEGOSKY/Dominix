import type { Relic } from "@/types/relic";
import { getRandomRelics } from "./relics";

export interface ShopItem {
  id: string;
  type: "relic" | "tile_upgrade" | "remove_tile" | "heal" | "wild_tile" | "extra_hand" | "forge_edition";
  name: string;
  description: string;
  cost: number;
  relic?: Relic;
}

export interface ShopState {
  items: ShopItem[];
  gold: number;
}

export function generateShopItems(
  ownedRelicIds: string[],
  round: number,
  relicDiscount: number = 0,
  relicCostMultiplier: number = 1,
): ShopItem[] {
  const items: ShopItem[] = [];

  // 2 random relics
  const availableRelics = getRandomRelics(2, ownedRelicIds);
  const baseRelicCost = 30 + round * 5;
  const discountedRelicCost = Math.max(5, Math.round(baseRelicCost * (1 - relicDiscount) * relicCostMultiplier));
  for (const relic of availableRelics) {
    items.push({
      id: `shop-relic-${relic.id}`,
      type: "relic",
      name: relic.name,
      description: relic.description,
      cost: discountedRelicCost,
      relic,
    });
  }

  // Tile upgrade (convert normal to golden)
  items.push({
    id: "shop-upgrade",
    type: "tile_upgrade",
    name: "Dorar Ficha",
    description: "Convierte una ficha normal en dorada (x2 puntos)",
    cost: 25,
  });

  // Remove tile
  items.push({
    id: "shop-remove",
    type: "remove_tile",
    name: "Eliminar Ficha",
    description: "Quita una ficha de tu pool",
    cost: 15,
  });

  // Heal (reduce next target)
  if (round >= 3) {
    items.push({
      id: "shop-heal",
      type: "heal",
      name: "Respiro",
      description: "Reduce la meta de la siguiente ronda un 10%",
      cost: 20,
    });
  }

  // Wild tile (from round 4)
  if (round >= 4) {
    items.push({
      id: "shop-wild",
      type: "wild_tile",
      name: "Ficha Salvaje",
      description: "Convierte una ficha de tu pool en wild",
      cost: 35 + round * 3,
    });
  }

  // Extra hand size (from round 5)
  if (round >= 5) {
    items.push({
      id: "shop-extra-hand",
      type: "extra_hand",
      name: "Mano Grande",
      description: "+1 ficha en tu mano la proxima ronda",
      cost: 30,
    });
  }

  // Edition forge (from round 4, rare: 30% chance appears)
  if (round >= 4 && Math.random() < 0.35) {
    items.push({
      id: "shop-forge-edition",
      type: "forge_edition",
      name: "Forja Misteriosa",
      description: "Transforma una ficha de tu pool en edicion aleatoria (foil / holo / polychrome / negativa)",
      cost: 60 + round * 4,
    });
  }

  return items;
}

export function getRerollCost(timesRerolled: number): number {
  return 5 + timesRerolled * 5;
}

export function calculateGoldEarned(roundScore: number, round: number): number {
  // Base gold + bonus for high scores
  const base = 10 + round * 3;
  const scoreBonus = Math.floor(roundScore / 50) * 5;
  return base + scoreBonus;
}
