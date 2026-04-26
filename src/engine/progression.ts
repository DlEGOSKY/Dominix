import { getTalentBonuses } from "./talents";

const PROG_KEY = "dominix_progression";

export interface PlayerProgression {
  xp: number;
  level: number;
  unlockedRewards: string[];
}

export interface LevelReward {
  id: string;
  level: number;
  name: string;
  description: string;
  type: "starting_relic" | "starting_gold" | "hand_size" | "tile_skin" | "starting_golden";
  value: string | number;
}

export const LEVEL_REWARDS: LevelReward[] = [
  { id: "lv2_gold", level: 2, name: "Bolsillo Inicial", description: "Empiezas cada run con 10 de oro", type: "starting_gold", value: 10 },
  { id: "lv3_skin_obsidian", level: 3, name: "Skin: Obsidiana", description: "Desbloquea el estilo Obsidiana para fichas", type: "tile_skin", value: "obsidian" },
  { id: "lv4_relic", level: 4, name: "Reliquia Inicial", description: "Empiezas con Impulso Inicial equipado", type: "starting_relic", value: "impulso_inicial" },
  { id: "lv5_golden", level: 5, name: "Ficha Dorada", description: "Una ficha aleatoria empieza dorada", type: "starting_golden", value: 1 },
  { id: "lv6_skin_emerald", level: 6, name: "Skin: Esmeralda", description: "Desbloquea el estilo Esmeralda para fichas", type: "tile_skin", value: "emerald" },
  { id: "lv7_gold2", level: 7, name: "Bolsa de Oro", description: "Empiezas cada run con 20 de oro", type: "starting_gold", value: 20 },
  { id: "lv8_skin_pacto", level: 8, name: "Skin: Pacto", description: "Fichas marcadas en sangre con runas y glifos rituales", type: "tile_skin", value: "pacto" },
  { id: "lv9_relic2", level: 9, name: "Reliquia Extra", description: "Empiezas con Precision equipado", type: "starting_relic", value: "precision" },
  { id: "lv10_skin_ruby", level: 10, name: "Skin: Rubi", description: "Desbloquea el estilo Rubi para fichas", type: "tile_skin", value: "ruby" },
  { id: "lv11_golden2", level: 11, name: "Doble Dorada", description: "Dos fichas aleatorias empiezan doradas", type: "starting_golden", value: 2 },
  { id: "lv12_skin_ivory", level: 12, name: "Skin: Marfil", description: "Desbloquea el estilo Marfil clasico para fichas", type: "tile_skin", value: "ivory" },
  { id: "lv13_skin_reliquia", level: 13, name: "Skin: Reliquia", description: "Fichas envejecidas marcadas con sello antiguo", type: "tile_skin", value: "reliquia" },
  { id: "lv14_hand", level: 14, name: "Mano Amplia", description: "+1 ficha en la mano inicial", type: "hand_size", value: 1 },
  { id: "lv15_skin_void", level: 15, name: "Skin: Vacio", description: "Desbloquea el estilo Vacio para fichas", type: "tile_skin", value: "void" },
  { id: "lv16_skin_cosmos", level: 16, name: "Skin: Cosmos", description: "Fichas talladas con estrellas — un mapa del cielo", type: "tile_skin", value: "cosmos" },
  { id: "lv17_gold3", level: 17, name: "Cofre de Oro", description: "Empiezas cada run con 35 de oro", type: "starting_gold", value: 35 },
  { id: "lv18_skin_neon", level: 18, name: "Skin: Neon", description: "Desbloquea el estilo Neon cibernetico para fichas", type: "tile_skin", value: "neon" },
  { id: "lv19_relic3", level: 19, name: "Tercera Reliquia", description: "Empiezas con Mano Firme equipado", type: "starting_relic", value: "mano_firme" },
  { id: "lv20_skin_gold", level: 20, name: "Skin: Dorado", description: "Desbloquea el estilo Dorado premium para fichas", type: "tile_skin", value: "gold" },
  { id: "lv21_skin_bestiario", level: 21, name: "Skin: Bestiario", description: "Siete criaturas ilustradas — fantasma, ojo, serpiente, bruja, caballero, dragon, lich", type: "tile_skin", value: "bestiario" },
  { id: "lv22_skin_tarot", level: 22, name: "Skin: Tarot", description: "Arcanos del tarot ilustrados en cada valor de ficha", type: "tile_skin", value: "tarot" },
  { id: "lv23_skin_astral", level: 23, name: "Skin: Astral", description: "Planetas del sistema solar — cada valor, un mundo", type: "tile_skin", value: "astral" },
  { id: "lv24_skin_naturaleza", level: 24, name: "Skin: Naturaleza", description: "Bosque ritual — bellotas, hongos, mariposas, lobos", type: "tile_skin", value: "naturaleza" },
  { id: "lv25_skin_mecanico", level: 25, name: "Skin: Mecanico", description: "Forja arcana — engranajes, atomos, golems mecanicos", type: "tile_skin", value: "mecanico" },
];

// XP curve: each level requires more XP
// Level N requires: 50 * N * (N + 1) / 2 total XP
function xpForLevel(level: number): number {
  return 50 * level * (level + 1) / 2;
}

export function getLevelFromXP(xp: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) {
    level++;
  }
  return level;
}

export function getXPForNextLevel(xp: number): { current: number; needed: number; progress: number } {
  const level = getLevelFromXP(xp);
  const currentLevelXP = xpForLevel(level);
  const nextLevelXP = xpForLevel(level + 1);
  const progressXP = xp - currentLevelXP;
  const neededXP = nextLevelXP - currentLevelXP;
  return {
    current: progressXP,
    needed: neededXP,
    progress: neededXP > 0 ? progressXP / neededXP : 0,
  };
}

// XP earned from a run
export function calculateRunXP(rounds: number, score: number, bossesDefeated: number, patternsActivated: number): number {
  let xp = 0;
  xp += rounds * 15;              // 15 XP per round
  xp += Math.floor(score / 50);   // 1 XP per 50 score
  xp += bossesDefeated * 25;      // 25 XP per boss
  xp += patternsActivated * 3;    // 3 XP per pattern
  return xp;
}

export function loadProgression(): PlayerProgression {
  try {
    const raw = localStorage.getItem(PROG_KEY);
    if (!raw) return { xp: 0, level: 1, unlockedRewards: [] };
    return JSON.parse(raw) as PlayerProgression;
  } catch {
    return { xp: 0, level: 1, unlockedRewards: [] };
  }
}

export function saveProgression(prog: PlayerProgression): void {
  localStorage.setItem(PROG_KEY, JSON.stringify(prog));
}

export function addXP(amount: number): { newLevel: boolean; progression: PlayerProgression; newRewards: LevelReward[] } {
  const prog = loadProgression();
  const oldLevel = prog.level;
  prog.xp += amount;
  prog.level = getLevelFromXP(prog.xp);

  // Check for new rewards
  const newRewards: LevelReward[] = [];
  for (const reward of LEVEL_REWARDS) {
    if (reward.level <= prog.level && !prog.unlockedRewards.includes(reward.id)) {
      prog.unlockedRewards.push(reward.id);
      newRewards.push(reward);
    }
  }

  saveProgression(prog);

  return {
    newLevel: prog.level > oldLevel,
    progression: prog,
    newRewards,
  };
}

// Get active bonuses based on current progression
export function getProgressionBonuses(prog: PlayerProgression): {
  startingGold: number;
  startingRelics: string[];
  startingGoldenTiles: number;
  handSizeBonus: number;
  unlockedSkins: string[];
} {
  const result = {
    startingGold: 0,
    startingRelics: [] as string[],
    startingGoldenTiles: 0,
    handSizeBonus: 0,
    unlockedSkins: [] as string[],
  };

  for (const rewardId of prog.unlockedRewards) {
    const reward = LEVEL_REWARDS.find((r) => r.id === rewardId);
    if (!reward) continue;

    switch (reward.type) {
      case "starting_gold":
        result.startingGold = Math.max(result.startingGold, reward.value as number);
        break;
      case "starting_relic":
        result.startingRelics.push(reward.value as string);
        break;
      case "starting_golden":
        result.startingGoldenTiles = Math.max(result.startingGoldenTiles, reward.value as number);
        break;
      case "hand_size":
        result.handSizeBonus += reward.value as number;
        break;
      case "tile_skin":
        result.unlockedSkins.push(reward.value as string);
        break;
    }
  }

  // Merge in talent bonuses
  const tb = getTalentBonuses();
  result.startingGold += tb.startGold;
  result.handSizeBonus += tb.handSize;
  result.startingRelics = Array.from(new Set([...result.startingRelics, ...tb.startingRelics]));

  return result;
}

const SKIN_KEY = "dominix_active_skin";

export function saveActiveSkin(skin: string): void {
  localStorage.setItem(SKIN_KEY, skin);
}

export function loadActiveSkin(): string {
  return localStorage.getItem(SKIN_KEY) ?? "default";
}
