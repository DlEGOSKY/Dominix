/**
 * Codex — progressive discovery log shared across runs. Persists encountered
 * patterns, bosses, celestial cards, and chaos twists so the player can see
 * their journey through Dominix's content.
 */
import { ALL_PATTERNS } from "./patterns";
import { ALL_BOSSES } from "./boss";
import { ALL_CELESTIAL } from "./celestial";
import { ALL_CHAOS_TWISTS } from "./chaos";

const KEYS = {
  patterns: "dominix_codex_patterns_v1",
  bosses: "dominix_codex_bosses_v1",
  celestial: "dominix_codex_celestial_v1",
  chaos: "dominix_codex_chaos_v1",
};

function loadSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveSet(key: string, set: Set<string>): void {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch {
    // Storage quota or disabled — fail silent
  }
}

export function discoverPattern(id: string): void {
  const s = loadSet(KEYS.patterns);
  if (!s.has(id)) {
    s.add(id);
    saveSet(KEYS.patterns, s);
  }
}

export function discoverBoss(id: string): void {
  const s = loadSet(KEYS.bosses);
  if (!s.has(id)) {
    s.add(id);
    saveSet(KEYS.bosses, s);
  }
}

export function discoverCelestial(id: string): void {
  const s = loadSet(KEYS.celestial);
  if (!s.has(id)) {
    s.add(id);
    saveSet(KEYS.celestial, s);
  }
}

export function discoverChaos(id: string): void {
  const s = loadSet(KEYS.chaos);
  if (!s.has(id)) {
    s.add(id);
    saveSet(KEYS.chaos, s);
  }
}

export interface CodexSummary {
  patterns: { total: number; discovered: number };
  bosses: { total: number; discovered: number };
  celestial: { total: number; discovered: number };
  chaos: { total: number; discovered: number };
  patternIds: Set<string>;
  bossIds: Set<string>;
  celestialIds: Set<string>;
  chaosIds: Set<string>;
}

export function loadCodex(): CodexSummary {
  const patternIds = loadSet(KEYS.patterns);
  const bossIds = loadSet(KEYS.bosses);
  const celestialIds = loadSet(KEYS.celestial);
  const chaosIds = loadSet(KEYS.chaos);
  return {
    patterns: { total: ALL_PATTERNS.length, discovered: patternIds.size },
    bosses: { total: ALL_BOSSES.length, discovered: bossIds.size },
    celestial: { total: ALL_CELESTIAL.length, discovered: celestialIds.size },
    chaos: { total: ALL_CHAOS_TWISTS.length, discovered: chaosIds.size },
    patternIds,
    bossIds,
    celestialIds,
    chaosIds,
  };
}
