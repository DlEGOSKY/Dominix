/**
 * Tile Editions — Balatro-inspired visual+mechanical modifiers layered on top
 * of any tile type (normal/wild/golden/etc).
 *
 * An edition adds both a distinctive visual effect (shader-less CSS) and a
 * small scoring bonus. Editions drop rarely and create identity moments.
 */

import type { ChainState, Tile, TileEdition } from "@/types/domino";
import { getGlobalRNG } from "./rng";

export interface EditionDefinition {
  id: TileEdition;
  name: string;
  description: string;
  color: string;
  /** Chance weight when rolling a random edition */
  weight: number;
}

export const ALL_EDITIONS: EditionDefinition[] = [
  {
    id: "foil",
    name: "Foil",
    description: "+30 score plano al jugar esta ficha.",
    color: "blue",
    weight: 6,
  },
  {
    id: "holo",
    name: "Holografica",
    description: "x1.15 al score total si esta ficha esta en la cadena.",
    color: "purple",
    weight: 4,
  },
  {
    id: "polychrome",
    name: "Policromada",
    description: "x1.30 al score total (solo una ficha policromada puede estar activa).",
    color: "pink",
    weight: 2,
  },
  {
    id: "negative",
    name: "Negativa",
    description: "+1 accion disponible esta ronda mientras esta en la cadena.",
    color: "slate",
    weight: 3,
  },
];

export function getEdition(id: TileEdition): EditionDefinition | null {
  return ALL_EDITIONS.find((e) => e.id === id) ?? null;
}

/** Pick a random edition using weighted selection. */
export function rollRandomEdition(): TileEdition {
  const rng = getGlobalRNG();
  const total = ALL_EDITIONS.reduce((s, e) => s + e.weight, 0);
  let roll = rng.next() * total;
  for (const e of ALL_EDITIONS) {
    roll -= e.weight;
    if (roll <= 0) return e.id;
  }
  return ALL_EDITIONS[0]!.id;
}

/** Return a new tile with the given edition applied. */
export function applyEdition(tile: Tile, edition: TileEdition): Tile {
  return { ...tile, edition };
}

export interface EditionScoreContribution {
  /** Flat points added before multipliers */
  flatBonus: number;
  /** Additional multiplier applied at the end */
  multiplier: number;
  /** Extra actions during the round */
  extraActions: number;
}

/**
 * Summarize the contribution of all editions present in the chain.
 * polychrome is capped: only one instance applies even if multiple are placed.
 */
export function summarizeChainEditions(chain: ChainState): EditionScoreContribution {
  const contrib: EditionScoreContribution = {
    flatBonus: 0,
    multiplier: 1,
    extraActions: 0,
  };
  let polychromeApplied = false;
  for (const p of chain.placed) {
    const ed = p.tile.edition;
    if (!ed) continue;
    switch (ed) {
      case "foil":
        contrib.flatBonus += 30;
        break;
      case "holo":
        contrib.multiplier *= 1.15;
        break;
      case "polychrome":
        if (!polychromeApplied) {
          contrib.multiplier *= 1.30;
          polychromeApplied = true;
        }
        break;
      case "negative":
        contrib.extraActions += 1;
        break;
    }
  }
  return contrib;
}

// ---- Discovery persistence (collection) ----
const DISCOVERY_KEY = "dominix_editions_discovered_v1";

export function loadDiscoveredEditions(): Set<TileEdition> {
  try {
    const raw = localStorage.getItem(DISCOVERY_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as TileEdition[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

export function discoverEdition(id: TileEdition): void {
  try {
    const current = loadDiscoveredEditions();
    if (current.has(id)) return;
    current.add(id);
    localStorage.setItem(DISCOVERY_KEY, JSON.stringify([...current]));
  } catch {
    // ignore
  }
}
