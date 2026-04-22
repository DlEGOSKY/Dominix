/**
 * Seeded RNG based on mulberry32.
 * Deterministic random number generator for reproducible runs.
 */

export interface SeededRNG {
  next(): number; // 0..1
  seed: number;
}

function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createRNG(seed: number): SeededRNG {
  const gen = mulberry32(seed);
  return { next: gen, seed };
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 2147483647) + 1;
}

export function seedToString(seed: number): string {
  return seed.toString(36).toUpperCase();
}

export function stringToSeed(str: string): number | null {
  const n = parseInt(str, 36);
  if (isNaN(n) || n <= 0) return null;
  return n;
}

/** Global RNG instance — set per run */
let globalRNG: SeededRNG | null = null;

export function setGlobalRNG(seed: number): SeededRNG {
  globalRNG = createRNG(seed);
  return globalRNG;
}

export function getGlobalRNG(): SeededRNG {
  if (!globalRNG) {
    globalRNG = createRNG(randomSeed());
  }
  return globalRNG;
}

export function getGlobalSeed(): number {
  return getGlobalRNG().seed;
}
