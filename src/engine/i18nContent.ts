/**
 * i18nContent — gameplay content translations.
 *
 * The game's source of truth for relics, patterns, bosses, events and skins
 * lives in their respective engine files in Spanish. This module layers
 * English translations on top via id-keyed maps + small `localize*` helpers.
 *
 * Why a separate file (instead of inlining `nameEn`/`descriptionEn`):
 *  - Engine files stay focused on game logic, not localization
 *  - Translators can scan a single file to audit/extend coverage
 *  - Adding a third language only requires extending this file
 *
 * Fallback rule: if a key is missing for the active language, return the
 * original Spanish string (graceful degradation, never a broken UI).
 */

import { getLanguage, useTranslation, type Language } from "./i18n";
import type { Relic } from "@/types/relic";
import type { PatternInfo } from "./patterns";
import type { Boss } from "./boss";

// =============================================================================
// RELICS
// =============================================================================

interface ContentEntry {
  name: string;
  description: string;
}

const RELIC_EN: Record<string, ContentEntry> = {
  // ---- Number / score ----
  eco_par:           { name: "Even Echo",          description: "Even numbers grant +5 per appearance" },
  pulso_bajo:        { name: "Low Pulse",          description: "Numbers 0-3 grant +3 extra each" },
  corona_alta:       { name: "High Crown",         description: "Numbers 4-6 grant +4 extra each" },
  seis_dorado:       { name: "Golden Six",         description: "Each 6 in the chain grants +12" },
  cero_vacio:        { name: "Hollow Zero",        description: "Each 0 in the chain grants +14" },
  tres_magico:       { name: "Magic Three",        description: "Each 3 in the chain grants +10" },
  uno_solitario:     { name: "Lone One",           description: "Each 1 in the chain grants +9" },
  cuatro_estable:    { name: "Stable Four",        description: "Each 4 in the chain grants +8" },
  cinco_central:     { name: "Central Five",       description: "Each 5 in the chain grants +9" },
  dos_gemelos:       { name: "Twin Twos",          description: "Each 2 in the chain grants +8" },
  impar_salvaje:     { name: "Wild Odd",           description: "Odd numbers grant +4 each" },
  pisada_lobo:       { name: "Wolf's Step",        description: "Each 1 in the chain grants +12 (silent but fierce)" },
  mirada_vacio:      { name: "Gaze of the Void",   description: "Each 0 in the chain grants +22 (it stares back)" },

  // ---- Doubles ----
  doble_corona:      { name: "Double Crown",       description: "Doubles multiply x1.3" },
  doble_filo:        { name: "Double Edge",        description: "Doubles grant +25 each" },
  corona_rota:       { name: "Broken Crown",       description: "+50 score per double in the chain" },
  linaje_estable:    { name: "Steady Lineage",     description: "Doubles grant +18 each" },
  sangre_pactada:    { name: "Blood Pact",         description: "Doubles grant +35 each (iron oath)" },

  // ---- Per-tile / chain ----
  mano_firme:        { name: "Steady Hand",        description: "+5 score per tile played" },
  cadena_maestra:    { name: "Master Chain",       description: "+8 score per tile played" },
  estandarte_andante:{ name: "Walking Banner",     description: "+4 score per tile played" },

  // ---- Flat / multiplier ----
  impulso_inicial:   { name: "Initial Surge",      description: "+25 flat score" },
  base_solida:       { name: "Solid Base",         description: "+40 flat score" },
  fortuna:           { name: "Fortune",            description: "+60 flat score" },
  precision:         { name: "Precision",          description: "x1.15 global multiplier" },
  amplificador:      { name: "Amplifier",          description: "x1.25 global multiplier" },
  supernova:         { name: "Supernova",          description: "x1.4 global multiplier" },
  disciplina:        { name: "Discipline",         description: "x1.10 global multiplier" },
  filo_roto:         { name: "Broken Edge",        description: "x1.08 global multiplier. Splintered steel still cuts." },

  // ---- Pattern bonuses (flat) ----
  final_pesado:      { name: "Heavy Closure",      description: "Exact Closure grants +50 extra" },
  dominio_total:     { name: "Total Dominion",     description: "Dominion pattern grants +40 extra" },
  simple_efectivo:   { name: "Simply Effective",   description: "Simple Chain grants +20 extra" },
  escalador:         { name: "Climber",            description: "Stairs pattern grants +45 extra" },
  racha_imparable:   { name: "Unstoppable Streak", description: "High Streak grants +50 extra" },
  ritmo_perfecto:    { name: "Perfect Rhythm",     description: "Alternation grants +40 extra and x1.2" },
  reflejo:           { name: "Reflection",         description: "Mirror pattern grants +40 extra" },
  serpiente:         { name: "Serpent",            description: "Zigzag pattern grants +50 extra" },
  dedo_luminoso:     { name: "Luminous Finger",    description: "Constellation grants +70 extra" },
  coronacion:        { name: "Coronation",         description: "Crown grants +60 extra" },
  tres_lineas:       { name: "Three Lines",        description: "Trinity grants +40 extra" },
  eco_roto:          { name: "Broken Echo",        description: "Fractal grants +120 extra" },

  // ---- Pattern bonuses (multiplier) ----
  cadena_tensa:      { name: "Tense Chain",        description: "Long Chain grants additional x1.2" },
  doble_amenaza:     { name: "Double Threat",      description: "Double Double grants additional x1.3" },
  parejas_perfectas: { name: "Perfect Pairs",      description: "Pairs grants additional x1.4" },
  minimalista:       { name: "Minimalist",         description: "Low Streak grants additional x1.5" },
  maestro_cadenas:   { name: "Chainmaster",        description: "Maximum Chain grants additional x2" },
  pureza_doble:      { name: "Double Purity",      description: "All Doubles grants additional x1.5" },
  avalancha_total:   { name: "Total Avalanche",    description: "Avalanche grants additional x1.4" },
  caida_prolongada:  { name: "Prolonged Fall",     description: "Diminuendo grants additional x1.5" },
  hexagrama_sagrado: { name: "Sacred Hexagram",    description: "Hexagram grants additional x2.0" },
  armonia_divina:    { name: "Divine Harmony",     description: "Harmony grants additional x1.4" },
  reloj_quebrado:    { name: "Shattered Clock",    description: "Alternation grants additional x1.6" },

  // ---- Per-pattern stacking ----
  cascada_patrones:  { name: "Pattern Cascade",    description: "x1.15 multiplier per pattern activated" },
  lector_formas:     { name: "Form Reader",        description: "x1.06 multiplier per pattern activated" },
  eternidad:         { name: "Eternity",           description: "x1.18 multiplier per pattern activated" },

  // ---- Celestial / firmament ----
  sello_firmamento:  { name: "Firmament Seal",     description: "Empowers all celestial cards by 25%" },
  oraculo_cosmico:   { name: "Cosmic Oracle",      description: "Empowers all celestial cards by 18%" },

  // ---- Action economy ----
  reloj_arena:       { name: "Hourglass",          description: "+3 actions per round" },
  mano_larga:        { name: "Long Hand",          description: "+1 extra draw per round" },
  filtro:            { name: "Filter",             description: "+1 extra discard per round" },
  reciclador:        { name: "Recycler",           description: "+15 score per discarded tile" },
  explorador:        { name: "Scout",              description: "+20 score per drawn tile" },
  tactico:           { name: "Tactician",          description: "+4 actions per round" },
};

// =============================================================================
// HELPERS
// =============================================================================

function pickContent(map: Record<string, ContentEntry>, id: string, fallback: ContentEntry, lang: Language): ContentEntry {
  if (lang === "es") return fallback;
  const translated = map[id];
  if (!translated) return fallback;
  return translated;
}

/**
 * Returns the relic's name+description in the active language. Falls back to
 * the original Spanish strings if the relic id has no translation yet.
 *
 * Use this anywhere the UI displays `relic.name` / `relic.description`.
 */
export function localizeRelic(relic: Relic): { name: string; description: string } {
  return pickContent(RELIC_EN, relic.id, { name: relic.name, description: relic.description }, getLanguage());
}

/**
 * Stable lookup-by-id variant. Useful when only the id is in scope (e.g.
 * stats screens that store relic ids without the full object).
 */
export function localizeRelicById(id: string, fallbackName: string, fallbackDescription: string): { name: string; description: string } {
  return pickContent(RELIC_EN, id, { name: fallbackName, description: fallbackDescription }, getLanguage());
}

// =============================================================================
// PATTERNS
// =============================================================================

const PATTERN_EN: Record<string, ContentEntry> = {
  // ---- Chain length ----
  cadena_simple:  { name: "Simple Chain",       description: "Place 3+ tiles in the chain" },
  cadena_larga:   { name: "Long Chain",         description: "Place 5+ tiles in the chain" },
  cadena_maxima:  { name: "Maximum Chain",      description: "Place 7+ tiles in the chain" },

  // ---- Doubles ----
  doble_doble:    { name: "Double Double",      description: "Play 2 doubles in the chain" },
  triple_doble:   { name: "Triple Double",      description: "Play 3 doubles in the chain" },
  todo_dobles:    { name: "All Doubles",        description: "Every tile in the chain is a double (3+)" },

  // ---- Number / structure ----
  dominio:        { name: "Dominion",           description: "A number appears in 3+ connections" },
  cierre_exacto:  { name: "Exact Closure",      description: "The endpoints of the chain match" },
  trinidad:       { name: "Trinity",            description: "3+ consecutive tiles share a common number" },
  simetria:       { name: "Symmetry",           description: "Symmetrical chain with matching endpoints" },
  espejo:         { name: "Mirror",             description: "3+ consecutive tiles with inverted values" },
  puente:         { name: "Bridge",             description: "5+ tiles where first and last share a value" },
  cuna:           { name: "Cradle",             description: "First and last tile share the same total" },

  // ---- Pairs / streaks ----
  parejas:        { name: "Pairs",              description: "3+ pairs of consecutive tiles with the same sum" },
  racha_alta:     { name: "High Streak",        description: "3+ consecutive tiles with sum >= 8" },
  racha_baja:     { name: "Low Streak",         description: "4+ consecutive tiles with sum <= 4" },

  // ---- Sequences ----
  escalera:       { name: "Stairs",             description: "4+ connections form an ascending sequence" },
  zigzag:         { name: "Zigzag",             description: "5+ connections alternating up/down" },
  alternancia:    { name: "Alternation",        description: "4+ tiles alternating even/odd in sum" },
  avalancha:      { name: "Avalanche",          description: "4+ tiles with growing sums" },
  diminuendo:     { name: "Diminuendo",         description: "4+ tiles with strictly decreasing sums" },
  crescendo:      { name: "Crescendo",          description: "4+ consecutive tiles with strictly increasing sums" },

  // ---- Sums ----
  suma_exacta:    { name: "Exact Sum",          description: "Total chain sum is a multiple of 10" },
  suma_impar:     { name: "Odd Sum",            description: "4+ tiles where every sum is odd" },
  armonia:        { name: "Harmony",            description: "Total chain sum is a prime number" },

  // ---- Sacred / rare ----
  fractal:        { name: "Fractal",            description: "Every sum is a power of 2 (1, 2, 4, 8)" },
  constelacion:   { name: "Constellation",      description: "Chain of 5+ tiles with 6+ distinct numbers" },
  corona:         { name: "Crown",              description: "3+ doubles with consecutive values (e.g. 3|3, 4|4, 5|5)" },
  hexagrama:      { name: "Hexagram",           description: "Exactly 6 tiles with 6+ distinct numbers" },
  triple_filo:    { name: "Triple Edge",        description: "Chain of 6+ with 3 even and 3 odd tiles (balance)" },
  ouroboros:      { name: "Ouroboros",          description: "Exact closure + chain of 7+ tiles (rare)" },
};

export function localizePattern(pattern: PatternInfo): { name: string; description: string } {
  return pickContent(PATTERN_EN, pattern.id, { name: pattern.name, description: pattern.description }, getLanguage());
}

export function localizePatternById(id: string, fallbackName: string, fallbackDescription = ""): { name: string; description: string } {
  return pickContent(PATTERN_EN, id, { name: fallbackName, description: fallbackDescription }, getLanguage());
}

// =============================================================================
// BOSSES
// =============================================================================

interface BossEntry extends ContentEntry {
  /** Per-phase descriptions, in order. Optional — only multi-phase bosses use this. */
  phases?: string[];
}

const BOSS_EN: Record<string, BossEntry> = {
  // ---- S1 — base ----
  guardian:        { name: "Guardian of the Chain", description: "Target x1.6. You cannot use doubles." },
  coloso:          { name: "Colossus",              description: "Target x2. No restrictions, pure power." },
  minimalista:     { name: "The Minimalist",        description: "Target x1.4. Maximum 5 tiles in the chain." },
  maestro:         { name: "Pattern Master",        description: "Target x1.5. Activate at least 2 patterns." },
  purificador:     { name: "The Purifier",          description: "Target x1.8. Wild tiles do not work." },
  espejista:       { name: "The Mirage",            description: "Target x1.5. Doubles only." },
  susurro:         { name: "The Whisper",           description: "Target x1.4. Only tiles with sum 6 or less." },
  arquitecto:      { name: "The Architect",         description: "Target x1.6. The chain must have at least 5 tiles to win." },
  caos:            { name: "Agent of Chaos",        description: "Target x1.7. You cannot connect the same number twice in a row." },
  titan:           { name: "The Titan",             description: "Target x2.2. No restrictions. Pure brute force." },
  fantasma:        { name: "The Phantom",           description: "Target x1.5. Only tiles with sum 4 or less." },
  perfeccionista:  { name: "The Perfectionist",     description: "Target x1.8. You must activate at least 3 patterns." },

  // ---- S5/S6 — multi-phase ----
  inquisidor: {
    name: "The Inquisitor",
    description: "Target x1.7. No wilds and at least 4 tiles.",
    phases: ["Phase 1: No wilds", "Phase 2: Minimum 4 tiles"],
  },
  verdugo: {
    name: "The Executioner",
    description: "Target x2. Doubles only and at least 2 patterns.",
    phases: ["Phase 1: Doubles only", "Phase 2: 2 patterns"],
  },
  abismo:        { name: "The Abyss",        description: "Target x1.6. Only low tiles and no repeating numbers." },
  coleccionista: { name: "The Collector",    description: "Target x1.7. Only 1 double allowed in the entire chain." },
  equinoccio:    { name: "The Equinox",      description: "Target x1.5. Only tiles with even sum are valid." },
  ritual:        { name: "The Ritual",       description: "Target x1.7. The chain must have exactly 6 tiles." },

  // ---- S7 ----
  astrologo:     { name: "The Astrologer",   description: "Target x1.8. The chain must have exactly 7 tiles." },
  heresiarca: {
    name: "The Heresiarch",
    description: "Target x1.9. Two phases: no doubles, then an exact chain of 6.",
    phases: ["Phase 1: No doubles", "Phase 2: Chain of 6"],
  },
  desvanecido: {
    name: "The Vanished",
    description: "Target x1.7. Two phases: doubles only, then no number repeats.",
    phases: ["Phase 1: Doubles only", "Phase 2: No repeating numbers"],
  },

  // ---- S8 — three-phase mythics ----
  sirena: {
    name: "The Siren",
    description: "Target x1.6. Three phases: lows, doubles, no doubles. Adapt or perish.",
    phases: ["Phase 1: Only tiles with sum <= 4", "Phase 2: Doubles only", "Phase 3: No doubles"],
  },
  tejedor: {
    name: "Star Weaver",
    description: "Target x1.8. Three phases: 2 patterns, chain 6+, 3 patterns. For ritual masters.",
    phases: ["Phase 1: Activate 2+ patterns", "Phase 2: Chain of 6+ tiles", "Phase 3: Activate 3+ patterns"],
  },
};

/** Localized boss — name, description, and per-phase descriptions if present. */
export function localizeBoss(boss: Boss): { name: string; description: string; phases?: string[] } {
  if (getLanguage() === "es") {
    return {
      name: boss.name,
      description: boss.description,
      phases: boss.phases?.map((p) => p.description),
    };
  }
  const entry = BOSS_EN[boss.id];
  if (!entry) {
    return {
      name: boss.name,
      description: boss.description,
      phases: boss.phases?.map((p) => p.description),
    };
  }
  return {
    name: entry.name,
    description: entry.description,
    phases: entry.phases ?? boss.phases?.map((p) => p.description),
  };
}

/** id-keyed lookup for callers that only have a boss id in scope. */
export function localizeBossById(id: string, fallbackName: string, fallbackDescription: string): { name: string; description: string } {
  return pickContent(BOSS_EN, id, { name: fallbackName, description: fallbackDescription }, getLanguage());
}

// =============================================================================
// REACTIVE HOOKS
// =============================================================================
// Components that render localized gameplay content should use these hooks
// (instead of the bare `localize*` functions) so they re-render when the user
// flips language at runtime.

/** Reactive variant of `localizeRelic` — subscribes the caller to lang changes. */
export function useLocalizedRelic(relic: Relic): { name: string; description: string } {
  // Subscribing via useTranslation guarantees a re-render on setLanguage().
  // We don't actually use `t` here, but the hook call is what matters.
  useTranslation();
  return localizeRelic(relic);
}

/** Reactive variant of `localizeRelicById`. */
export function useLocalizedRelicById(id: string, fallbackName: string, fallbackDescription: string): { name: string; description: string } {
  useTranslation();
  return localizeRelicById(id, fallbackName, fallbackDescription);
}

/** Reactive variant of `localizePattern`. */
export function useLocalizedPattern(pattern: PatternInfo): { name: string; description: string } {
  useTranslation();
  return localizePattern(pattern);
}

/** Reactive variant of `localizePatternById`. */
export function useLocalizedPatternById(id: string, fallbackName: string, fallbackDescription = ""): { name: string; description: string } {
  useTranslation();
  return localizePatternById(id, fallbackName, fallbackDescription);
}

/** Reactive variant of `localizeBoss` — name + description + phases. */
export function useLocalizedBoss(boss: Boss): { name: string; description: string; phases?: string[] } {
  useTranslation();
  return localizeBoss(boss);
}
