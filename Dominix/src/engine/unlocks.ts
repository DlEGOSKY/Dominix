import type { SavedData } from "@/types/domino";
import { ALL_RELICS } from "./relics";

export interface UnlockCondition {
  type: "rounds" | "runs" | "score";
  value: number;
}

export interface RelicUnlock {
  relicId: string;
  condition: UnlockCondition;
  description: string;
}

const RELIC_UNLOCKS: RelicUnlock[] = [
  { relicId: "eco_par", condition: { type: "runs", value: 0 }, description: "Disponible desde el inicio" },
  { relicId: "pulso_bajo", condition: { type: "runs", value: 0 }, description: "Disponible desde el inicio" },
  { relicId: "corona_alta", condition: { type: "runs", value: 0 }, description: "Disponible desde el inicio" },
  { relicId: "doble_corona", condition: { type: "runs", value: 0 }, description: "Disponible desde el inicio" },
  { relicId: "mano_firme", condition: { type: "runs", value: 0 }, description: "Disponible desde el inicio" },
  { relicId: "impulso_inicial", condition: { type: "runs", value: 0 }, description: "Disponible desde el inicio" },
  { relicId: "precision", condition: { type: "runs", value: 2 }, description: "Completa 2 runs" },
  { relicId: "seis_dorado", condition: { type: "runs", value: 2 }, description: "Completa 2 runs" },
  { relicId: "cero_vacio", condition: { type: "rounds", value: 3 }, description: "Alcanza ronda 3" },
  { relicId: "dominio_total", condition: { type: "rounds", value: 3 }, description: "Alcanza ronda 3" },
  { relicId: "final_pesado", condition: { type: "rounds", value: 4 }, description: "Alcanza ronda 4" },
  { relicId: "cadena_tensa", condition: { type: "rounds", value: 4 }, description: "Alcanza ronda 4" },
  { relicId: "tres_magico", condition: { type: "runs", value: 3 }, description: "Completa 3 runs" },
  { relicId: "uno_solitario", condition: { type: "runs", value: 3 }, description: "Completa 3 runs" },
  { relicId: "cuatro_estable", condition: { type: "rounds", value: 5 }, description: "Alcanza ronda 5" },
  { relicId: "cinco_central", condition: { type: "rounds", value: 5 }, description: "Alcanza ronda 5" },
  { relicId: "dos_gemelos", condition: { type: "score", value: 200 }, description: "Consigue 200 pts en una ronda" },
  { relicId: "amplificador", condition: { type: "score", value: 250 }, description: "Consigue 250 pts en una ronda" },
  { relicId: "base_solida", condition: { type: "rounds", value: 6 }, description: "Alcanza ronda 6" },
  { relicId: "cadena_maestra", condition: { type: "rounds", value: 6 }, description: "Alcanza ronda 6" },
  { relicId: "doble_filo", condition: { type: "runs", value: 5 }, description: "Completa 5 runs" },
  { relicId: "simple_efectivo", condition: { type: "runs", value: 5 }, description: "Completa 5 runs" },
  { relicId: "doble_amenaza", condition: { type: "score", value: 300 }, description: "Consigue 300 pts en una ronda" },
  { relicId: "impar_salvaje", condition: { type: "rounds", value: 8 }, description: "Alcanza ronda 8" },
];

export function isRelicUnlocked(relicId: string, savedData: SavedData): boolean {
  const unlock = RELIC_UNLOCKS.find((u) => u.relicId === relicId);
  if (!unlock) return true;

  switch (unlock.condition.type) {
    case "runs":
      return savedData.totalRuns >= unlock.condition.value;
    case "rounds":
      return savedData.bestRound >= unlock.condition.value;
    case "score":
      return savedData.bestScore >= unlock.condition.value;
    default:
      return true;
  }
}

export function getUnlockedRelics(savedData: SavedData): string[] {
  return ALL_RELICS
    .filter((r) => isRelicUnlocked(r.id, savedData))
    .map((r) => r.id);
}

export function getLockedRelics(savedData: SavedData): RelicUnlock[] {
  return RELIC_UNLOCKS.filter((u) => !isRelicUnlocked(u.relicId, savedData));
}

export function getNextUnlocks(savedData: SavedData, limit: number = 3): RelicUnlock[] {
  const locked = getLockedRelics(savedData);
  return locked.slice(0, limit);
}
