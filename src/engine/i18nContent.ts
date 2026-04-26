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
// PATTERNS (filled later — placeholder so localizePattern can already be wired)
// =============================================================================

const PATTERN_EN: Record<string, { name: string; description?: string }> = {};

export function localizePattern(pattern: PatternInfo): { name: string; description?: string } {
  if (getLanguage() === "es") return { name: pattern.name, description: pattern.description };
  const t = PATTERN_EN[pattern.id];
  return t ?? { name: pattern.name, description: pattern.description };
}

export function localizePatternById(id: string, fallbackName: string, fallbackDescription?: string): { name: string; description?: string } {
  if (getLanguage() === "es") return { name: fallbackName, description: fallbackDescription };
  const t = PATTERN_EN[id];
  return t ?? { name: fallbackName, description: fallbackDescription };
}

// Hook so the patterns block (next commit) can register translations without
// re-exporting this whole module.
export function _registerPatternTranslations(map: Record<string, { name: string; description?: string }>) {
  Object.assign(PATTERN_EN, map);
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
export function useLocalizedPattern(pattern: PatternInfo): { name: string; description?: string } {
  useTranslation();
  return localizePattern(pattern);
}

/** Reactive variant of `localizePatternById`. */
export function useLocalizedPatternById(id: string, fallbackName: string, fallbackDescription?: string): { name: string; description?: string } {
  useTranslation();
  return localizePatternById(id, fallbackName, fallbackDescription);
}
