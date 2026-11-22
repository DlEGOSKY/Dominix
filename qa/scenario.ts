import type { GameState, Tile } from "../src/types/domino";
import { ALL_BOSSES } from "../src/engine/boss";
import { startNextRound } from "../src/engine/runState";
import { getTarget } from "../src/engine/round";
import { setGlobalRNG } from "../src/engine/rng";

export function qaBoss() { return ALL_BOSSES.find((b) => b.id === "inquisidor")!; }

export function qaState(base: GameState): GameState {
  setGlobalRNG(4567);
  const values = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [0, 6], [1, 1], [0, 0]];
  const runTiles: Tile[] = values.map(([top, bottom], i) => ({ id: `qa-${i}`, top: top!, bottom: bottom!, type: i === 7 ? "wild" : "normal" }));
  const next = startNextRound({ ...base, round: 64, runTiles, relics: ["impulso_inicial", "ritmo_acelerado", "tactico"], pendingRound: { hand: 2, actions: 3 } }, 0.001);
  return { ...next, stats: { ...next.stats, relicsCollected: next.relics.length }, target: Math.round(getTarget(65) * 0.001 * qaBoss().targetMultiplier), result: "boss_intro" };
}
