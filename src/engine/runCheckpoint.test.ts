import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { ACTIVE_RUN_KEY, ACTIVE_RUN_BACKUP_KEY, RUN_RULESET, type RunCheckpoint, encodeCheckpoint, decodeCheckpoint, isRunCheckpoint, saveRunCheckpoint, loadRunCheckpoint, clearRunCheckpoint } from "./runCheckpoint";
import { createRNG, getGlobalRNG, restoreGlobalRNG, setGlobalRNG } from "./rng";
import { createEmptyChain } from "./chain";
import { generateFullSet } from "./tiles";
import { createActionState } from "./actions";
import { getDefaultConfig } from "./modifiers";
import { getTalentBonuses } from "./talents";
import { getAccumulatedAscension } from "./ascension";
import { getMasteryBonus } from "./characterMastery";
import { generateRewardOptions } from "./rewards";
import { generateShopItems } from "./shop";
import { generateRunMap } from "./runMap";
import { startNextRound } from "./runState";
import { exportSave, importSave } from "./saveSync";
import { getDailyProgress, getDailySeedValue, saveDailyProgress } from "./daily";
import { getWeeklyRecord, getWeeklySeedValue, saveWeeklyResult } from "./weekly";
import { ALL_BOSSES } from "./boss";
function checkpoint(): RunCheckpoint {
    const tiles = generateFullSet();
    return {
        ruleset: RUN_RULESET, savedAt: Date.now(), mode: "endless", characterId: "architect", modifierIds: [],
        seed: 12345, rng: createRNG(12345).snapshot(), handSize: 7, modifierConfig: getDefaultConfig(), modifiers: getDefaultConfig(),
        runtime: { talentBonuses: getTalentBonuses({ ranks: {}, spent: 0 }), ascension: getAccumulatedAscension(0), masteryBonus: getMasteryBonus(1) },
        claimedRound: null, celebratedChallenges: [], pendingReward: null,
        states: {
            game: { runTiles: tiles, hand: tiles.slice(0, 7), tilePool: tiles.slice(7), chain: createEmptyChain(), round: 1, target: 80, score: 0, result: "playing", relics: [], actions: createActionState(1), stats: { roundsCompleted: 0, totalScore: 0, patternsActivated: 0, patternBreakdown: {}, relicsCollected: 0, tilesPlayed: 0, highestRoundScore: 0, bossesDefeated: 0, shopPurchases: 0, bestCombo: 0, goldEarned: 0, tilesDiscarded: 0, tilesDrawn: 0, roundScores: [] } },
            runMap: null, isEliteRound: false, sanctuaryCtx: null, rewardOptions: [], mutationMode: null, currentEvent: null, tutorialStep: -1, gold: 25, shopItems: [], shopRerolls: 0, currentBoss: null, bossPhase: 0, bossRewardData: null, activeSkin: "imperium", currentQuest: null, pendingInterlude: null, runFlatBonusPerTile: 0, ownedMutationIds: [], mutationStates: [], wildNextActive: false, freezeEndActive: false, doubleNextScoreActive: false, ownedConsumables: [], ownedCelestials: [], bossHeat: 0, bossRageCount: 0, chaosTwist: null, undoUsesLeft: 1, roundPatternLog: [], undoSnapshot: null,
        },
    };
}
beforeEach(() => { localStorage.clear(); setGlobalRNG(12345); });
afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });
describe("run continuity", () => {
    it("resumes a defeated boss reward without requiring an active boss or granting it twice", () => {
        const saved = checkpoint();
        saved.states.game.result = "boss_reward";
        saved.states.game.roundSettled = true;
        saved.states.game.stats.bossesDefeated = 1;
        saved.states.currentBoss = null;
        saved.states.bossRewardData = { boss: ALL_BOSSES[0]! };
        saved.claimedRound = "1:0";
        expect(saveRunCheckpoint(saved)).toBe(true);
        expect(loadRunCheckpoint()).toEqual({ data: saved, status: "ok" });
        expect(decodeCheckpoint(encodeCheckpoint(saved))).toEqual(saved);
        const missing = structuredClone(saved);
        missing.states.bossRewardData = null;
        expect(isRunCheckpoint(missing)).toBe(false);
        const corrupt = structuredClone(saved);
        delete (corrupt.states.bossRewardData!.boss as unknown as Record<string, unknown>).reward;
        expect(isRunCheckpoint(corrupt)).toBe(false);
    });
    it("keeps the original mulberry32 sequence and restores its exact cursor", () => {
        let oldState = 12345;
        const legacy = () => { let t = oldState += 0x6d2b79f5; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
        const rng = createRNG(12345);
        for (let i = 0; i < 10000; i++)
            expect(rng.next()).toBe(legacy());
        const resumed = createRNG(rng.seed, rng.snapshot().state);
        for (let i = 0; i < 100; i++)
            expect(resumed.next()).toBe(rng.next());
    });
    it("restores future deals, shop stock, rewards and map generation without rerolling", () => {
        const saved = checkpoint();
        for (let i = 0; i < 83; i++)
            getGlobalRNG().next();
        saved.rng = getGlobalRNG().snapshot();
        const future = () => ({ deal: startNextRound(saved.states.game), shop: generateShopItems([], 4), rewards: generateRewardOptions([], undefined, 4), map: generateRunMap(2) });
        const expected = future();
        restoreGlobalRNG(saved.rng);
        expect(future()).toEqual(expected);
    });
    it("round trips permanent upgrades, pending effects, undo, budgets and reward claims", () => {
        const saved = checkpoint();
        const s = saved.states;
        s.game.runTiles[2] = { ...s.game.runTiles[2]!, type: "golden", edition: "polychrome", pact: true };
        s.game.pendingRound = { score: 75, hand: 2, actions: 3, targetMultiplier: 0.85 };
        s.game.roundSettled = true;
        s.game.stats.roundScores = [228];
        s.game.stats.totalScore = 228;
        s.game.stats.roundsCompleted = 1;
        s.wildNextActive = true;
        s.doubleNextScoreActive = true;
        s.undoUsesLeft = 0;
        s.undoSnapshot = { game: structuredClone(s.game), wildNextActive: false, freezeEndActive: true, doubleNextScoreActive: false, patternLog: [], bossRageCount: 2 };
        s.rewardOptions = generateRewardOptions([], undefined, 1);
        s.game.result = "reward";
        saved.claimedRound = "1:0";
        expect(isRunCheckpoint(saved)).toBe(true);
        expect(decodeCheckpoint(encodeCheckpoint(saved))).toEqual(saved);
    });
    it("recovers the previous valid checkpoint without erasing damaged primary data", () => {
        const saved = checkpoint();
        expect(saveRunCheckpoint(saved)).toBe(true);
        const later = structuredClone(saved);
        later.states.gold = 50;
        expect(saveRunCheckpoint(later)).toBe(true);
        localStorage.setItem(ACTIVE_RUN_KEY, "damaged");
        expect(loadRunCheckpoint()).toEqual({ data: saved, status: "recovered" });
        expect(localStorage.getItem(ACTIVE_RUN_KEY)).toBe("damaged");
    });
    it("does not replace a good recovery copy with a damaged primary", () => {
        const saved = checkpoint();
        localStorage.setItem(ACTIVE_RUN_BACKUP_KEY, encodeCheckpoint(saved));
        localStorage.setItem(ACTIVE_RUN_KEY, "bad");
        const next = structuredClone(saved);
        next.states.gold = 80;
        expect(saveRunCheckpoint(next)).toBe(true);
        expect(decodeCheckpoint(localStorage.getItem(ACTIVE_RUN_BACKUP_KEY)!)).toEqual(saved);
    });
    it("preserves the last playable checkpoint when storage fills", () => {
        const saved = checkpoint();
        saveRunCheckpoint(saved);
        const previous = localStorage.getItem(ACTIVE_RUN_KEY);
        vi.spyOn(localStorage, "setItem").mockImplementation(() => { throw new Error("quota"); });
        expect(saveRunCheckpoint({ ...saved, savedAt: saved.savedAt + 1 })).toBe(false);
        expect(localStorage.getItem(ACTIVE_RUN_KEY)).toBe(previous);
    });
    it("rejects checksum damage, unknown rulesets and malformed required state", () => {
        const saved = checkpoint();
        const raw = encodeCheckpoint(saved);
        expect(decodeCheckpoint(raw.replace('12345', '12346'))).toBeNull();
        for (const change of [
            (v: RunCheckpoint) => { v.ruleset = "future" as typeof RUN_RULESET; },
            (v: RunCheckpoint) => { v.states.game.hand[0]!.top = 7; },
            (v: RunCheckpoint) => { v.states.game.stats.totalScore = NaN; },
            (v: RunCheckpoint) => { v.runtime.talentBonuses = {} as RunCheckpoint["runtime"]["talentBonuses"]; },
            (v: RunCheckpoint) => { v.states.rewardOptions = [null] as unknown as RunCheckpoint["states"]["rewardOptions"]; },
            (v: RunCheckpoint) => { v.states.game.result = "event"; },
            (v: RunCheckpoint) => { v.states.game.result = "map_select"; },
            (v: RunCheckpoint) => { v.states.game.result = "sanctuary"; },
        ]) {
            const invalid = structuredClone(saved);
            change(invalid);
            expect(decodeCheckpoint(encodeCheckpoint(invalid))).toBeNull();
        }
    });
    it("keeps profile saves while removing both active run generations", () => {
        saveRunCheckpoint(checkpoint());
        saveRunCheckpoint(checkpoint());
        localStorage.setItem("dominix_save", '{"bestRound":9}');
        expect(clearRunCheckpoint()).toBe(true);
        expect(loadRunCheckpoint().status).toBe("none");
        expect(localStorage.getItem("dominix_save")).toBe('{"bestRound":9}');
    });
    it("includes the active run in full exports and restores it without migration of old profiles", () => {
        const saved = checkpoint();
        saveRunCheckpoint(saved);
        const blob = exportSave();
        localStorage.clear();
        expect(importSave(blob).ok).toBe(true);
        expect(loadRunCheckpoint().data).toEqual(saved);
        expect(importSave(JSON.stringify({ magic: "dominix-save", version: 1, data: { dominix_lang: "es" } })).ok).toBe(true);
        expect(loadRunCheckpoint().data).toEqual(saved);
    });
    it("rejects damaged active run imports before changing the player's profile", () => {
        localStorage.setItem("dominix_lang", "en");
        expect(importSave(JSON.stringify({ magic: "dominix-save", version: 3, data: { dominix_lang: "es", [ACTIVE_RUN_KEY]: "bad" } })).ok).toBe(false);
        expect(localStorage.getItem("dominix_lang")).toBe("en");
    });
    it("does not award a resumed yesterday's challenge to today", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 10, 14, 12));
        const old = getDailySeedValue();
        vi.setSystemTime(new Date(2026, 10, 15, 12));
        saveDailyProgress(3, false);
        const today = getDailyProgress();
        saveDailyProgress(20, true, old);
        expect(getDailyProgress()).toEqual(today);
    });
    it("does not award a resumed last week's challenge to this week", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 10, 8, 12));
        const old = getWeeklySeedValue();
        vi.setSystemTime(new Date(2026, 10, 16, 12));
        saveWeeklyResult(300, 3);
        const current = getWeeklyRecord();
        saveWeeklyResult(9999, 20, old);
        expect(getWeeklyRecord()).toEqual(current);
    });
});
