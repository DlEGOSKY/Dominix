import type { Relic } from "@/types/relic";
import { getRandomRelics } from "./relics";

export interface ShopItem {
  id: string;
  type: "relic" | "tile_upgrade" | "remove_tile" | "heal";
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
  round: number
): ShopItem[] {
  const items: ShopItem[] = [];

  // 2 random relics
  const availableRelics = getRandomRelics(2, ownedRelicIds);
  for (const relic of availableRelics) {
    items.push({
      id: `shop-relic-${relic.id}`,
      type: "relic",
      name: relic.name,
      description: relic.description,
      cost: 30 + round * 5,
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

  return items;
}

export function calculateGoldEarned(roundScore: number, round: number): number {
  // Base gold + bonus for high scores
  const base = 10 + round * 3;
  const scoreBonus = Math.floor(roundScore / 50) * 5;
  return base + scoreBonus;
}
