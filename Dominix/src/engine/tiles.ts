import type { Tile, TileType } from "@/types/domino";
import { getGlobalRNG } from "@/engine/rng";

let tileCounter = 0;

function makeTile(top: number, bottom: number, type: TileType = "normal"): Tile {
  tileCounter++;
  return { id: `t-${tileCounter}-${top}${bottom}`, top, bottom, type };
}

export function generateFullSet(): Tile[] {
  const tiles: Tile[] = [];
  for (let i = 0; i <= 6; i++) {
    for (let j = i; j <= 6; j++) {
      tiles.push(makeTile(i, j));
    }
  }
  return tiles;
}

export function addSpecialTiles(tiles: Tile[], round: number): Tile[] {
  const result = [...tiles];
  
  // Add wild tile starting from round 3 (10% chance per tile)
  if (round >= 3) {
    for (let i = 0; i < result.length; i++) {
      if (getGlobalRNG().next() < 0.03) {
        result[i] = { ...result[i]!, type: "wild" };
        break; // Only one wild per round
      }
    }
  }
  
  // Add golden tiles starting from round 2 (5% chance)
  if (round >= 2) {
    let goldenCount = 0;
    for (let i = 0; i < result.length; i++) {
      if (result[i]!.type === "normal" && getGlobalRNG().next() < 0.05 && goldenCount < 2) {
        result[i] = { ...result[i]!, type: "golden" };
        goldenCount++;
      }
    }
  }
  
  // Add locked tiles in higher rounds (makes game harder)
  if (round >= 5) {
    let lockedCount = 0;
    for (let i = 0; i < result.length; i++) {
      if (result[i]!.type === "normal" && getGlobalRNG().next() < 0.08 && lockedCount < 1) {
        result[i] = { ...result[i]!, type: "locked", lockedUntilRound: round + 1 };
        lockedCount++;
      }
    }
  }

  // Mirror tile: copies the end value it connects to (both sides become that value)
  if (round >= 4) {
    for (let i = 0; i < result.length; i++) {
      if (result[i]!.type === "normal" && getGlobalRNG().next() < 0.03) {
        result[i] = { ...result[i]!, type: "mirror" };
        break;
      }
    }
  }

  // Bomb tile: when played, removes adjacent tiles from hand for bonus score
  if (round >= 6) {
    for (let i = 0; i < result.length; i++) {
      if (result[i]!.type === "normal" && getGlobalRNG().next() < 0.025) {
        result[i] = { ...result[i]!, type: "bomb" };
        break;
      }
    }
  }
  
  return result;
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(getGlobalRNG().next() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

export function drawHand(count: number): Tile[] {
  const set = generateFullSet();
  const shuffled = shuffle(set);
  return shuffled.slice(0, count);
}

export function isDouble(tile: Tile): boolean {
  return tile.top === tile.bottom;
}
