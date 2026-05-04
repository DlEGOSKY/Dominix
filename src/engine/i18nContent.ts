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
import type { GameEvent } from "./events";

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
  reloj_arena:       { name: "Hourglass",           description: "+3 actions per round" },
  mano_larga:        { name: "Long Hand",           description: "+1 extra draw per round" },
  filtro:            { name: "Filter",              description: "+1 extra discard per round" },
  reciclador:        { name: "Recycler",            description: "+15 score per discarded tile" },
  explorador:        { name: "Scout",               description: "+20 score per drawn tile" },
  tactico:           { name: "Tactician",           description: "+4 actions per round" },
  brazalete_tactico: { name: "Tactical Bracer",     description: "+2 actions and +2 discards per round" },
  bolsa_infinita:    { name: "Infinite Bag",        description: "+2 draws per round. The hand never runs dry." },

  // ---- S9: new number relics ----
  cuatro_cardinal:   { name: "Cardinal Four",       description: "Each 4 in the chain grants +14 (crossroads)" },
  cinco_vertice:     { name: "Fifth Vertex",        description: "Each 5 in the chain grants +14 (center of the board)" },

  // ---- S9: legendary per-pattern ----
  espiral_crescendo: { name: "Crescendo Spiral",    description: "Crescendo grants additional x2.0. The climb has no ceiling." },
  nudo_ouroboros:    { name: "Ouroboros Knot",      description: "Ouroboros grants +200 extra. The circle is complete." },

  // ---- Per-tile legendary ----
  ampolleta_maestra: { name: "Master Hourglass",    description: "+12 score per tile played (time is power)" },
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

  // ---- S9 ----
  ladron: {
    name: "The Number Thief",
    description: "Target x1.8. Even-sum tiles only. He steals the odd.",
    phases: ["Phase 1: Even-sum tiles only", "Phase 2: No repeating numbers"],
  },
  mutante: {
    name: "The Mutant",
    description: "Target x2.0. Exactly 5 tiles, then 3+ patterns, then no doubles.",
    phases: ["Phase 1: Exactly 5 tiles", "Phase 2: Activate 3+ patterns", "Phase 3: No doubles"],
  },
  corruptor: {
    name: "The Corruptor",
    description: "Target x2.2. No restrictions — then zero doubles allowed.",
    phases: ["Phase 1: No restrictions — target x2.2", "Phase 2: Zero doubles allowed"],
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
// EVENTS (blessings, curses, choices)
// =============================================================================

interface EventOptionEntry {
  label: string;
  description: string;
}

interface EventEntry extends ContentEntry {
  /** Per-option labels for choice events, in source order. */
  options?: EventOptionEntry[];
}

const EVENT_EN: Record<string, EventEntry> = {
  // ---- Blessings ----
  lucky_draw:    { name: "Lucky Draw",       description: "Your next hand will have one extra tile" },
  easy_round:    { name: "Calm Round",       description: "This round's target is reduced by 15%" },
  bonus_points:  { name: "Unexpected Bonus", description: "Start the round with 25 extra points" },
  tile_gift:     { name: "Gift of Fate",     description: "Two random tiles are added to your pool" },
  momentum:      { name: "Momentum",         description: "Your streak continues with force" },
  segundo_aire:  { name: "Second Wind",      description: "You recover energy for the next round" },
  eco_dorado:    { name: "Golden Echo",      description: "One tile in your pool turns golden" },
  lluvia_fichas: { name: "Rain of Tiles",    description: "The sky opens and new tiles fall" },
  flujo_tactico: { name: "Tactical Flow",    description: "Your reflexes sharpen: +3 actions this round" },
  manos_agiles:  { name: "Nimble Hands",     description: "You can discard and draw more freely" },
  astro_errante: { name: "Wandering Star",   description: "A light crosses the sky and blesses your play with cosmic energy" },
  ultimo_soplido:{ name: "Last Breath",      description: "A gust of wind stirs the tiles and gives you an edge" },
  cosecha_tardia:{ name: "Late Harvest",     description: "You have built a pact with the earth. You reap the rewards." },

  // ---- Curses ----
  hard_round:       { name: "Hard Round",      description: "This round's target increases by 20%" },
  lost_tile:        { name: "Lost Tile",       description: "A random tile vanishes from your pool" },
  tormenta:         { name: "Storm",           description: "A storm approaches; things get complicated" },
  terremoto:        { name: "Earthquake",      description: "The ground trembles and you lose 2 tiles from the pool" },
  bloqueo_temporal: { name: "Temporal Lock",   description: "Your energy drains. You lose 3 actions this round" },
  duelo_sombras:    { name: "Shadow Duel",     description: "An echo of yourself steals energy, but leaves a mark on its hands" },

  // ---- Choices ----
  gamblers_choice: {
    name: "Gambler's Choice",
    description: "Choose your fate",
    options: [
      { label: "Risk",   description: "Target +25%, but +40 bonus points if you win" },
      { label: "Safety", description: "Target -10%, no extra bonus" },
    ],
  },
  sacrifice: {
    name: "Sacrifice",
    description: "Sacrifice something to gain something else",
    options: [
      { label: "Lose a tile",  description: "Lose 1 tile, gain 30 points" },
      { label: "Hard target",  description: "Target +15%, gain 2 extra tiles" },
    ],
  },
  presion: {
    name: "Under Pressure",
    description: "Difficulty rises, but so does the reward",
    options: [
      { label: "Accept the pressure", description: "Target +30%, but +60 bonus points" },
      { label: "Refuse",              description: "No changes" },
    ],
  },
  vision_futura: {
    name: "Future Vision",
    description: "Choose between preparation or risk",
    options: [
      { label: "Preparation", description: "Target -15%, +1 extra tile in hand" },
      { label: "Ambition",    description: "Target +20%, but +50 bonus points" },
    ],
  },
  intercambio_tactico: {
    name: "Tactical Trade",
    description: "Change your playstyle",
    options: [
      { label: "More actions",     description: "+4 actions, but -1 discard" },
      { label: "More flexibility", description: "+1 discard and +1 draw, but -2 actions" },
    ],
  },
  pacto_oscuro: {
    name: "Dark Pact",
    description: "A dark power offers you a deal",
    options: [
      { label: "Accept the power", description: "Target +35%, but +75 bonus points" },
      { label: "Refuse",           description: "Lose 1 tile but target -10%" },
    ],
  },
  viajero_misterioso: {
    name: "Mysterious Traveler",
    description: "A stranger with a sealed box offers a trade",
    options: [
      { label: "Accept the box", description: "+3 new tiles in the pool, but target +10%" },
      { label: "Give a tile",    description: "Lose 1 tile, start with +60 points" },
    ],
  },
  apuesta_coleccionista: {
    name: "Collector's Wager",
    description: "A collector bets their fortune against yours",
    options: [
      { label: "Double down", description: "Target +50%, but +120 bonus points if you win" },
      { label: "Withdraw",    description: "Target -5% and you lose nothing" },
    ],
  },
  mercader_errante: {
    name: "Wandering Merchant",
    description: "A merchant offers trades. Choose wisely.",
    options: [
      { label: "Buy tiles",  description: "Lose half your points this round, gain 3 extra tiles" },
      { label: "Sell luck",  description: "Lose 1 tile from the pool, gain +60 bonus points" },
    ],
  },
  pacto_crepusculo: {
    name: "Twilight Pact",
    description: "Twilight offers power at a cost. Accept or refuse?",
    options: [
      { label: "Accept the pact", description: "Target +30%, gain +80 points at round start" },
      { label: "Refuse",          description: "Target -10%, no bonus" },
    ],
  },
  llave_caos: {
    name: "Key of Chaos",
    description: "A key that opens everything and nothing. Choose your opening.",
    options: [
      { label: "Path of tiles", description: "+2 tiles in hand and +1 extra draw" },
      { label: "Path of score", description: "Start with +50 points this round" },
      { label: "Path of order", description: "Target -20%, no other advantage" },
    ],
  },
  voz_pasado: {
    name: "Voice of the Past",
    description: "An echo whispers fragments of previous runs.",
    options: [
      { label: "Listen", description: "+45 bonus points, +2 actions this round" },
      { label: "Ignore", description: "Lose 1 tile but gain +90 bonus points" },
    ],
  },
};

// =============================================================================
// SKINS
// =============================================================================

interface SkinEntry {
  name: string;
  flavor: string;
}

const SKIN_EN: Record<string, SkinEntry> = {
  default:    { name: "Classic",    flavor: "The basic stone of the ritual." },
  obsidian:   { name: "Obsidian",   flavor: "Cut from the cold echo of the first pact." },
  emerald:    { name: "Emerald",    flavor: "The greenery that precedes every chain." },
  ruby:       { name: "Ruby",       flavor: "Heat that pushes the next move." },
  ivory:      { name: "Ivory",      flavor: "Tradition. Fine inlay, the strength of the classics." },
  void:       { name: "Void",       flavor: "No act is lost; all are devoured." },
  neon:       { name: "Neon",       flavor: "Modern echo of the dominion." },
  gold:       { name: "Gold",       flavor: "The privilege of those who close their ritual." },
  pacto:      { name: "Pact",       flavor: "Marked in blood. Each tile remembers what was promised." },
  reliquia:   { name: "Relic",      flavor: "Recovered from a previous ritual. Still bears its weight." },
  cosmos:     { name: "Cosmos",     flavor: "It carves the night with every connection." },
  bestiario:  { name: "Bestiary",   flavor: "Seven creatures. Seven values. Only one chain contains them." },
  naturaleza: { name: "Nature",     flavor: "The forest holds seven forms. Recognize them and the chain blooms." },
  mecanico:   { name: "Mechanical", flavor: "Forge, gear, discharge. The chain as a ritual machine." },
  tarot:      { name: "Tarot",      flavor: "Each value is an arcanum. Domino as oracle." },
  astral:     { name: "Astral",     flavor: "The solar system as a board. Each tile, a world." },
};

/** Localized skin display (name + flavor). Falls back to source strings. */
export function localizeSkin(skin: { id: string; name: string; flavor: string }): SkinEntry {
  if (getLanguage() === "es") return { name: skin.name, flavor: skin.flavor };
  const entry = SKIN_EN[skin.id];
  return entry ?? { name: skin.name, flavor: skin.flavor };
}

/** id-keyed lookup variant. */
export function localizeSkinById(id: string, fallbackName: string, fallbackFlavor: string): SkinEntry {
  if (getLanguage() === "es") return { name: fallbackName, flavor: fallbackFlavor };
  const entry = SKIN_EN[id];
  return entry ?? { name: fallbackName, flavor: fallbackFlavor };
}

/**
 * Localized event — name, description, and (for choice events) translated
 * option labels + descriptions in source order.
 */
export function localizeEvent(event: GameEvent): { name: string; description: string; options?: EventOptionEntry[] } {
  const sourceOptions = event.effect.type === "choice"
    ? event.effect.options.map((o) => ({ label: o.label, description: o.description }))
    : undefined;

  if (getLanguage() === "es") {
    return { name: event.name, description: event.description, options: sourceOptions };
  }
  const entry = EVENT_EN[event.id];
  if (!entry) {
    return { name: event.name, description: event.description, options: sourceOptions };
  }
  return {
    name: entry.name,
    description: entry.description,
    options: entry.options ?? sourceOptions,
  };
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

/** Reactive variant of `localizeEvent` — name + description + choice options. */
export function useLocalizedEvent(event: GameEvent): { name: string; description: string; options?: EventOptionEntry[] } {
  useTranslation();
  return localizeEvent(event);
}

/** Reactive variant of `localizeSkin`. */
export function useLocalizedSkin(skin: { id: string; name: string; flavor: string }): SkinEntry {
  useTranslation();
  return localizeSkin(skin);
}

/** Reactive variant of `localizeSkinById`. */
export function useLocalizedSkinById(id: string, fallbackName: string, fallbackFlavor: string): SkinEntry {
  useTranslation();
  return localizeSkinById(id, fallbackName, fallbackFlavor);
}
