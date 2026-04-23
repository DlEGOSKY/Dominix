/**
 * Legacy — at the end of each run, one artifact is stored to be inherited
 * by the next run. This creates a sense of continuity: every run is a
 * descendant of the previous one.
 *
 * Inheritance picks from what the player owned at the end: the "favourite"
 * celestial (first owned) + the top consumable in the list. Reliquias are
 * too impactful to inherit freely; celestials+consumables keep the balance
 * tight while giving a warm welcome to the next run.
 */
import type { CelestialCard } from "./celestial";
import { getCelestial } from "./celestial";
import type { Consumable } from "./consumables";
import { getConsumable } from "./consumables";

const LEGACY_KEY = "dominix_legacy_v1";

export interface LegacyData {
  celestialId?: string;
  consumableId?: string;
  /** Epoch ms when this legacy was stored (for UI display). */
  storedAt: number;
  /** Summary stats from the run that produced this legacy. */
  fromRound: number;
  fromScore: number;
}

/** Save a legacy snapshot at run end. Returns whether something was stored. */
export function saveLegacy(args: {
  celestials: CelestialCard[];
  consumables: Consumable[];
  finalRound: number;
  totalScore: number;
}): boolean {
  const { celestials, consumables, finalRound, totalScore } = args;
  if (celestials.length === 0 && consumables.length === 0) return false;

  // Inherit the first celestial the player chose (often most pivotal) and
  // the first consumable that wasn't used. This is a simple heuristic that
  // still feels meaningful.
  const data: LegacyData = {
    celestialId: celestials[0]?.id,
    consumableId: consumables[0]?.id,
    storedAt: Date.now(),
    fromRound: finalRound,
    fromScore: totalScore,
  };
  try {
    localStorage.setItem(LEGACY_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function loadLegacy(): LegacyData | null {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LegacyData;
    return parsed;
  } catch {
    return null;
  }
}

/** Consume the legacy — the next run picks it up and it's cleared. */
export function consumeLegacy(): LegacyData | null {
  const data = loadLegacy();
  if (!data) return null;
  try {
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    // ignore
  }
  return data;
}

export interface LegacyResolved {
  celestial?: CelestialCard;
  consumable?: Consumable;
  fromRound: number;
  fromScore: number;
}

/** Turn raw legacy IDs into full objects, filtering out unknown IDs. */
export function resolveLegacy(data: LegacyData | null): LegacyResolved | null {
  if (!data) return null;
  return {
    celestial: data.celestialId ? getCelestial(data.celestialId) : undefined,
    consumable: data.consumableId ? getConsumable(data.consumableId) : undefined,
    fromRound: data.fromRound,
    fromScore: data.fromScore,
  };
}
