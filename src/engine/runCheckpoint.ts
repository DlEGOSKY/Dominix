import type { TileSkin } from "@/components/TileView";
import type { GameState } from "@/types/domino";
import type { ModifierConfig } from "./modifiers";
import { ALL_CHARACTERS, type CharacterId } from "./characters";
import type { TalentBonuses } from "./talents";
import type { AccumulatedAscension } from "./ascension";
import type { MasteryBonus } from "./characterMastery";
import type { RNGState } from "./rng";
import type { RunMap } from "./runMap";
import type { RewardOption } from "@/types/reward";
import type { GameEvent } from "./events";
import type { ShopItem } from "./shop";
import type { Boss } from "./boss";
import type { QuestDefinition } from "./quests";
import type { Interlude } from "./interludes";
import type { ActiveMutationState } from "./activeMutations";
import type { Consumable } from "./consumables";
import type { CelestialCard } from "./celestial";
import type { ChaosTwist } from "./chaos";
import type { PendingReward } from "./rewardFeedback";
import { queueRunJournal, readRunJournal } from "./runJournal";
export const ACTIVE_RUN_KEY = "dominix_active_run_v1";
export const SAVE_BEFORE_RELOAD_EVENT = "dominix-save-before-reload";
export const ACTIVE_RUN_BACKUP_KEY = "dominix_active_run_backup_v1";
export const RUN_RULESET = "dominix-2026-11-14-r1";
export type RunMode = "playing" | "daily" | "endless" | "weekly";
type PatternLog = Array<{
    id: string;
    patternId: string;
    name: string;
    bonus: number;
}>;
export interface CheckpointStates {
    game: GameState;
    runMap: RunMap | null;
    isEliteRound: boolean;
    sanctuaryCtx: {
        gold: number;
        actions: number;
    } | null;
    rewardOptions: RewardOption[];
    mutationMode: null | "remove" | "duplicate" | "convert";
    currentEvent: GameEvent | null;
    tutorialStep: number;
    gold: number;
    shopItems: ShopItem[];
    shopRerolls: number;
    currentBoss: Boss | null;
    bossPhase: number;
    bossRewardData: {
        boss: Boss;
        bonusRelicId?: string;
    } | null;
    activeSkin: TileSkin;
    currentQuest: QuestDefinition | null;
    pendingInterlude: Interlude | null;
    runFlatBonusPerTile: number;
    ownedMutationIds: string[];
    mutationStates: ActiveMutationState[];
    wildNextActive: boolean;
    freezeEndActive: boolean;
    doubleNextScoreActive: boolean;
    ownedConsumables: Consumable[];
    ownedCelestials: CelestialCard[];
    bossHeat: number;
    bossRageCount: number;
    chaosTwist: ChaosTwist | null;
    undoUsesLeft: number;
    roundPatternLog: PatternLog;
    undoSnapshot: {
        game: GameState;
        wildNextActive: boolean;
        freezeEndActive: boolean;
        doubleNextScoreActive: boolean;
        patternLog: PatternLog;
        bossRageCount: number;
    } | null;
}
export interface RunCheckpoint {
    ruleset: typeof RUN_RULESET;
    savedAt: number;
    mode: RunMode;
    characterId: CharacterId;
    modifierIds: string[];
    modifierConfig: ModifierConfig;
    modifiers: ModifierConfig;
    seed: number;
    rng: RNGState;
    handSize: number;
    runtime: {
        talentBonuses: TalentBonuses;
        ascension: AccumulatedAscension;
        masteryBonus: MasteryBonus;
    };
    states: CheckpointStates;
    claimedRound: string | null;
    celebratedChallenges: string[];
    pendingReward: PendingReward | null;
}
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const finite = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const integer = (v: unknown) => finite(v) && Number.isInteger(v);
const list = (v: unknown): v is unknown[] => Array.isArray(v) && v.length <= 10000;
const strings = (v: unknown) => list(v) && v.every(x => typeof x === "string");
const numbers = (v: unknown, keys: string[]) => object(v) && keys.every(k => finite(v[k]));
const named = (v: unknown) => object(v) && typeof v.id === "string" && typeof v.name === "string";
const patternLog = (v: unknown) => list(v) && v.every(p => object(p) && typeof p.id === "string" && typeof p.patternId === "string" && typeof p.name === "string" && finite(p.bonus));
function rewardOption(v: unknown): boolean {
    if (!named(v) || !object(v) || !object(v.reward))
        return false;
    const r = v.reward;
    if (r.type === "relic")
        return named(r.relic) && object(r.relic) && object(r.relic.effect);
    if (["remove_tile", "duplicate_tile", "convert_number"].includes(String(r.type)))
        return true;
    return ["active_mutation", "consumable", "celestial"].includes(String(r.type)) && typeof r[r.type === "active_mutation" ? "mutationId" : r.type === "consumable" ? "consumableId" : "celestialId"] === "string";
}
function tiles(v: unknown): boolean {
    return list(v) && v.length <= 512 && v.every(t => object(t) && typeof t.id === "string" && integer(t.top) && (t.top as number) >= 0 && (t.top as number) <= 6 && integer(t.bottom) && (t.bottom as number) >= 0 && (t.bottom as number) <= 6 && (t.type === undefined || ["normal", "wild", "golden", "mirror", "bomb", "locked"].includes(String(t.type))) && (t.edition === undefined || ["foil", "holo", "polychrome", "negative"].includes(String(t.edition))));
}
function game(v: unknown): boolean {
    if (!object(v) || !tiles(v.runTiles) || !tiles(v.hand) || !tiles(v.tilePool) || !strings(v.relics) || !object(v.chain) || !list(v.chain.placed) || !object(v.stats))
        return false;
    if (!integer(v.round) || (v.round as number) < 1 || !finite(v.score) || !finite(v.target) || !["playing", "win", "lose", "reward", "event", "shop", "boss_intro", "boss_reward", "map_select", "sanctuary"].includes(String(v.result)))
        return false;
    if (!v.chain.placed.every(p => object(p) && tiles([p.tile]) && (p.order === undefined || integer(p.order)) && [p.exposedLeft, p.exposedRight].every(n => integer(n) && (n as number) >= 0 && (n as number) <= 6)))
        return false;
    if (![v.chain.leftEnd, v.chain.rightEnd].every(n => n === null || (integer(n) && (n as number) >= 0 && (n as number) <= 6)))
        return false;
    if (!list(v.stats.roundScores) || !v.stats.roundScores.every(finite) || !object(v.stats.patternBreakdown))
        return false;
    if (!numbers(v.stats, ["roundsCompleted", "totalScore", "patternsActivated", "relicsCollected", "tilesPlayed", "highestRoundScore", "bossesDefeated", "shopPurchases", "bestCombo", "goldEarned", "tilesDiscarded", "tilesDrawn"]) || !Object.values(v.stats.patternBreakdown).every(finite))
        return false;
    for (const key of ["pendingRound", "roundStartResources"])
        if (v[key] !== undefined && (!object(v[key]) || !Object.values(v[key]).every(finite)))
            return false;
    for (const key of ["roundBonus", "roundWinBonus", "roundScoreFactor", "roundTargetMultiplier", "bossRages", "phaseScore"])
        if (v[key] !== undefined && !finite(v[key]))
            return false;
    if (v.actions && (!object(v.actions) || !["maxActions", "usedActions", "maxDiscards", "usedDiscards", "maxDraws", "usedDraws"].every(k => integer((v.actions as Record<string, unknown>)[k]) && ((v.actions as Record<string, number>)[k] ?? -1) >= 0)))
        return false;
    return true;
}
export function isRunCheckpoint(v: unknown): v is RunCheckpoint {
    if (!object(v) || v.ruleset !== RUN_RULESET || !finite(v.savedAt) || !["playing", "daily", "endless", "weekly"].includes(String(v.mode)) || !ALL_CHARACTERS.some(c => c.id === v.characterId) || !strings(v.modifierIds))
        return false;
    if (!object(v.rng) || !integer(v.rng.seed) || !integer(v.rng.state) || v.rng.seed !== v.seed || !integer(v.handSize) || !object(v.modifierConfig) || !object(v.modifiers) || !object(v.runtime))
        return false;
    if (![v.modifierConfig, v.modifiers].every(c => ["targetMultiplier", "handSize", "actionBonus", "scoreMultiplier", "patternBonus"].every(k => finite(c[k]))))
        return false;
    if (!numbers(v.runtime.talentBonuses, ["flatScoreBonus", "scoreMultiplier", "extraPatternScore", "startGold", "handSize", "goldMultiplier", "relicDiscount", "actionBonus", "tilePreserve"]) || !object(v.runtime.talentBonuses) || !strings(v.runtime.talentBonuses.startingRelics))
        return false;
    if (!numbers(v.runtime.ascension, ["targetMultiplier", "handSizeDelta", "actionBonusDelta", "patternBonusMultiplier", "shopRelicCostMultiplier", "rerollCostMultiplier", "legendaryWeightMultiplier", "bossTargetMultiplier", "activeLevel"]) || !numbers(v.runtime.masteryBonus, ["startGold", "actionBonus"]))
        return false;
    const s = v.states;
    if (!object(s) || !game(s.game))
        return false;
    if (!["isEliteRound", "wildNextActive", "freezeEndActive", "doubleNextScoreActive"].every(k => typeof s[k] === "boolean"))
        return false;
    if (!["gold", "shopRerolls", "bossPhase", "runFlatBonusPerTile", "bossHeat", "bossRageCount", "undoUsesLeft", "tutorialStep"].every(k => finite(s[k])))
        return false;
    if (!["rewardOptions", "shopItems", "mutationStates", "ownedConsumables", "ownedCelestials", "roundPatternLog"].every(k => list(s[k])) || !strings(s.ownedMutationIds) || typeof s.activeSkin !== "string")
        return false;
    if (!(s.rewardOptions as unknown[]).every(rewardOption) || !(s.shopItems as unknown[]).every(i => named(i) && object(i) && finite(i.cost) && (i.type !== "relic" || named(i.relic))))
        return false;
    if (!(s.ownedConsumables as unknown[]).every(c => named(c) && object(c) && object(c.effect)) || !(s.ownedCelestials as unknown[]).every(c => named(c) && object(c) && typeof c.patternId === "string" && finite(c.bonusMultiplier)))
        return false;
    if (!(s.mutationStates as unknown[]).every(m => object(m) && typeof m.mutationId === "string" && integer(m.usesLeft)) || !patternLog(s.roundPatternLog))
        return false;
    if (![null, "remove", "duplicate", "convert"].includes(s.mutationMode as null))
        return false;
    if (!["runMap", "sanctuaryCtx", "currentEvent", "currentBoss", "bossRewardData", "currentQuest", "pendingInterlude", "chaosTwist", "undoSnapshot"].every(k => s[k] === null || object(s[k])))
        return false;
    if (s.undoSnapshot && (!object(s.undoSnapshot) || !game(s.undoSnapshot.game) || !patternLog(s.undoSnapshot.patternLog) || !["wildNextActive", "freezeEndActive", "doubleNextScoreActive"].every(k => typeof (s.undoSnapshot as Record<string, unknown>)[k] === "boolean")))
        return false;
    if ((s.game as unknown as GameState).result === "map_select" && !object(s.runMap))
        return false;
    if (object(s.runMap) && (!integer(s.runMap.act) || !list(s.runMap.rows) || !s.runMap.rows.every(row => list(row) && row.every(n => object(n) && typeof n.id === "string" && strings(n.next) && numbers(n, ["row", "col", "round"]) && ["normal", "elite", "event", "shop", "sanctuary", "boss"].includes(String(n.type)))) || !strings(s.runMap.visitedNodeIds)))
        return false;
    if ((s.game as unknown as GameState).result === "boss_intro" && !object(s.currentBoss))
        return false;
    // The defeated boss is deliberately removed from currentBoss. Its reward
    // screen resumes from bossRewardData, without reactivating the encounter.
    if ((s.game as unknown as GameState).result === "boss_reward" && !object(s.bossRewardData))
        return false;
    if (object(s.bossRewardData) && (!named(s.bossRewardData.boss) || !object(s.bossRewardData.boss) || !numbers(s.bossRewardData.boss, ["targetMultiplier"]) || !numbers(s.bossRewardData.boss.reward, ["gold"]) || (s.bossRewardData.bonusRelicId !== undefined && typeof s.bossRewardData.bonusRelicId !== "string")))
        return false;
    if ((s.game as unknown as GameState).result === "event" && !object(s.currentEvent))
        return false;
    if (object(s.currentEvent) && (!named(s.currentEvent) || !object(s.currentEvent.effect)))
        return false;
    if (object(s.currentBoss) && (!named(s.currentBoss) || !numbers(s.currentBoss, ["targetMultiplier"]) || !numbers(s.currentBoss.reward, ["gold"])))
        return false;
    if (object(s.currentQuest) && (!object(s.currentQuest.reward) || !finite(s.currentQuest.reward.amount)))
        return false;
    if (object(s.chaosTwist) && !object(s.chaosTwist.effect))
        return false;
    if (object(s.pendingInterlude) && (!strings(s.pendingInterlude.body) || !list(s.pendingInterlude.choices) || !s.pendingInterlude.choices.every(c => object(c) && object(c.outcome) && object(c.outcome.effects))))
        return false;
    if ((s.game as unknown as GameState).result === "sanctuary" && !numbers(s.sanctuaryCtx, ["gold", "actions"]))
        return false;
    if ((s.game as unknown as GameState).result === "boss_reward" && (!object(s.bossRewardData) || !named(s.bossRewardData.boss)))
        return false;
    if (v.pendingReward !== null && (!object(v.pendingReward) || !rewardOption(v.pendingReward.option) || !object(v.pendingReward.before) || !strings(v.pendingReward.before.relics) || !tiles(v.pendingReward.before.tiles) || !strings(v.pendingReward.before.mutations) || !list(v.pendingReward.before.consumables) || !list(v.pendingReward.before.celestials)))
        return false;
    return (v.claimedRound === null || typeof v.claimedRound === "string") && strings(v.celebratedChallenges);
}
function checksum(text: string): string { let hash = 2166136261; for (let i = 0; i < text.length; i++)
    hash = Math.imul(hash ^ text.charCodeAt(i), 16777619); return (hash >>> 0).toString(16); }
export function encodeCheckpoint(value: RunCheckpoint): string { const body = JSON.stringify(value); return JSON.stringify({ version: 1, body, checksum: checksum(body) }); }
export function decodeCheckpoint(raw: string): RunCheckpoint | null {
    try {
        if (raw.length > 2000000)
            return null;
        const box = JSON.parse(raw);
        if (box.version !== 1 || typeof box.body !== "string" || box.checksum !== checksum(box.body))
            return null;
        const data: unknown = JSON.parse(box.body);
        return isRunCheckpoint(data) ? data : null;
    }
    catch {
        return null;
    }
}
export function loadRunCheckpoint(): {
    data: RunCheckpoint | null;
    status: "none" | "ok" | "recovered" | "invalid" | "unavailable";
} {
    try {
        const raw = localStorage.getItem(ACTIVE_RUN_KEY);
        const backup = localStorage.getItem(ACTIVE_RUN_BACKUP_KEY);
        const data = raw ? decodeCheckpoint(raw) : null;
        if (data)
            return { data, status: "ok" };
        const recovered = backup ? decodeCheckpoint(backup) : null;
        return recovered ? { data: recovered, status: "recovered" } : { data: null, status: raw || backup ? "invalid" : "none" };
    }
    catch {
        return { data: null, status: "unavailable" };
    }
}
export function saveRunCheckpoint(data: RunCheckpoint): boolean {
    if (!isRunCheckpoint(data))
        return false;
    try {
        const encoded = encodeCheckpoint(data);
        if (encoded.length > 2000000)
            return false;
        const old = localStorage.getItem(ACTIVE_RUN_KEY);
        if (old && decodeCheckpoint(old))
            localStorage.setItem(ACTIVE_RUN_BACKUP_KEY, old);
        localStorage.setItem(ACTIVE_RUN_KEY, encoded);
        void queueRunJournal(encoded);
        return true;
    }
    catch {
        return false;
    }
}
export function clearRunCheckpoint(): boolean { try {
    const cleared = [localStorage.getItem(ACTIVE_RUN_KEY), localStorage.getItem(ACTIVE_RUN_BACKUP_KEY)].filter((raw): raw is string => raw !== null);
    localStorage.removeItem(ACTIVE_RUN_KEY);
    localStorage.removeItem(ACTIVE_RUN_BACKUP_KEY);
    void queueRunJournal(null, cleared);
    return true;
}
catch {
    return false;
} }

/** Called under the app's exclusive lock, before loading any player state. */
export async function recoverRunJournal(): Promise<void> {
    const entry = await readRunJournal();
    if (!entry) return;
    try {
        if (entry.raw === null) {
            // A completed clear must not resurrect a pre-clear disk snapshot.
            // Never delete an unrelated/newer imported or newly started run.
            for (const key of [ACTIVE_RUN_KEY, ACTIVE_RUN_BACKUP_KEY]) {
                const raw = localStorage.getItem(key);
                if (raw && entry.cleared.includes(raw)) localStorage.removeItem(key);
            }
        } else if (decodeCheckpoint(entry.raw) && !loadRunCheckpoint().data) {
            // Keep a damaged primary intact for diagnosis. The existing loader
            // reports recovery and the next autosave rebuilds the primary.
            localStorage.setItem(ACTIVE_RUN_BACKUP_KEY, entry.raw);
        }
    } catch { /* Existing storage warnings handle quota or blocked access. */ }
}

export function journalCurrentRun(): Promise<boolean> {
    const data = loadRunCheckpoint().data;
    return queueRunJournal(data ? encodeCheckpoint(data) : null);
}
