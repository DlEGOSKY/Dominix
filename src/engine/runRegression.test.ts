import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GameState, Tile } from "@/types/domino";
import { createEmptyChain, placeTile } from "./chain";
import { generateFullSet } from "./tiles";
import { createActionState } from "./actions";
import type { CharacterId } from "./characters";
import { getCharacter, meetsCharacterUnlock } from "./characters";
import { getTalentBonuses } from "./talents";
import { explainTileScore } from "./scoreExplanation";
import { getActionCue, boardShortcutsBlocked } from "./actionFeedback";
import { calculateRunScore, type RunScoreContext } from "./runScore";
import { discardRoundTile, drawRoundTile, playRoundTile } from "./roundActions";
import { closeRound, getLegalPlacements } from "./roundRules";
import { duplicateRunTile, editRunTile, recordRound, removeRunTile, startNextRound, startBossPhase } from "./runState";
import { getLevelFromXP, getXPForNextLevel } from "./progression";
import { setGlobalRNG } from "./rng";
import { rollRandomCelestial } from "./celestial";
import { rollRandomConsumable } from "./consumables";
import { generateRewardOptions } from "./rewards";
import { generateShopItems } from "./shop";
import { ALL_RELICS, calculateRelicBonus, getFamilyCounts, computeFamilySetBonuses } from "./relics";
import { analyzePatterns } from "./patterns";
import { getRoundPayout } from "./shop";
import { saveBestData, loadSavedData } from "./storage";
import { ALL_EVENTS, applyEventEffect, applyEventToRun } from "./events";
import { ALL_QUESTS, checkQuestCompletion } from "./quests";

const tile = (id: string, top: number, bottom: number, extra: Partial<Tile> = {}): Tile => ({ id, top, bottom, type: "normal", ...extra });
const context = (character: CharacterId = "architect"): RunScoreContext => ({
  character: getCharacter(character), talents: getTalentBonuses({ ranks: {}, spent: 0 }),
  scoreMultiplier: 1, patternBonus: 1, celestials: [], celestialBoost: 1, chaosTwist: null, flatPerTile: 0,
});
function state(hand: Tile[] = generateFullSet()): GameState {
  return {
    runTiles: hand, hand, tilePool: [], chain: createEmptyChain(), relics: [],
    score: 0, round: 1, target: 80, result: "playing", actions: createActionState(1),
    stats: { roundsCompleted: 0, totalScore: 0, patternsActivated: 0, patternBreakdown: {}, relicsCollected: 0,
      tilesPlayed: 0, highestRoundScore: 0, bossesDefeated: 0, shopPurchases: 0, bestCombo: 0,
      goldEarned: 0, tilesDiscarded: 0, tilesDrawn: 0, roundScores: [] },
  };
}
beforeEach(() => { localStorage.clear(); setGlobalRNG(12345); });

describe("permanent run inventory", () => {
  it("preserves conversions, editions, pact, removal and duplication through several deals", () => {
    let game = state();
    const original = game.runTiles[10]!;
    game = editRunTile(game, original.id, (t) => ({ ...t, top: 6, bottom: 6, type: "golden", edition: "polychrome", pact: true }));
    game = duplicateRunTile(game, game.runTiles[10]!);
    game = removeRunTile(game, game.runTiles[0]!.id);
    for (let round = 0; round < 8; round++) {
      game = startNextRound(game);
      const all = [...game.hand, ...game.tilePool];
      expect(all).toHaveLength(28);
      expect(new Set(all.map((t) => t.id)).size).toBe(28);
      expect(all.filter((t) => t.edition === "polychrome")).toHaveLength(2);
      expect(all.find((t) => t.id === original.id)).toMatchObject({ top: 6, bottom: 6, type: "golden", pact: true });
      expect(all.some((t) => t.id === "t-0-0")).toBe(false);
    }
  });
  it("preserving a tile never duplicates it in the draw pool", () => {
    const game = state();
    const next = startNextRound(game, 1, 7, 0, 3);
    expect(next.hand).toHaveLength(7);
    expect([...next.hand, ...next.tilePool]).toHaveLength(28);
    expect(new Set([...next.hand, ...next.tilePool].map((t) => t.id)).size).toBe(28);
  });
  it("dealing cannot create score entries or increment completed rounds", () => {
    const game = recordRound({ ...state(), score: 241, result: "win" });
    expect(startNextRound(game).stats).toEqual(game.stats);
    expect(game.stats.roundScores).toEqual([241]);
    expect(game.stats.roundsCompleted).toBe(1);
  });
  it("applies event/shop/sanctuary boosts to exactly one future combat", () => {
    const game = { ...state(), pendingRound: { score: 75, targetMultiplier: 0.9, hand: 2, actions: 3, discards: 1, draws: 1 } };
    const next = startNextRound(game);
    expect(next).toMatchObject({ score: 75, roundBonus: 75, target: 108 });
    expect(next.hand).toHaveLength(9);
    expect(next.actions).toMatchObject({ maxActions: 15, maxDiscards: 3, maxDraws: 2 });
    const later = startNextRound(next);
    expect(later.hand).toHaveLength(7);
    expect(later.score).toBe(0);
    expect(later.actions?.maxActions).toBe(12);
  });
});

describe("authoritative scoring and settlement", () => {
  it("the preview transition, played score, manual closing and stored result agree", () => {
    const ctx = context();
    ctx.celestials = [rollRandomCelestial()!];
    ctx.chaosTwist = { id: "test", name: "Test", description: "", tone: "good", effect: { type: "score_multiplier", value: 1.5 } };
    let game = state([tile("a", 1, 2, { pact: true, edition: "foil" }), tile("b", 2, 3), tile("c", 3, 4)]);
    game.roundBonus = 25;
    game.score = 25;
    const preview = playRoundTile(game, game.hand[0]!, "right", ctx, { double: true });
    const played = playRoundTile(game, game.hand[0]!, "right", ctx, { double: true });
    expect(played.score).toBe(preview.score);
    game = playRoundTile(played, played.hand[0]!, "right", ctx);
    expect(game.roundBonus).toBeGreaterThanOrEqual(125);
    expect(calculateRunScore(game, ctx).total).toBe(game.score);
    const closed = closeRound(game);
    expect(closed.score).toBe(game.score);
    // A reward must not retroactively change this outcome.
    const rewarded = recordRound({ ...closed, relics: [...closed.relics, "doble_corona"] }, true);
    expect(rewarded.stats.roundScores).toEqual([closed.score]);
    expect(recordRound(rewarded, true)).toBe(rewarded);
  });
  it("instant points and costs persist across later placements", () => {
    const ctx = context();
    let game = state([tile("a", 1, 2), tile("b", 2, 3)]);
    game.roundBonus = 25 - 20;
    game = playRoundTile(game, game.hand[0]!, "right", ctx);
    const withBonus = game.score;
    expect(withBonus - calculateRunScore({ ...game, roundBonus: 0 }, ctx).total).toBe(5);
    game = playRoundTile(game, game.hand[0]!, "right", ctx);
    expect(game.score - calculateRunScore({ ...game, roundBonus: 0 }, ctx).total).toBe(5);
  });
  it("a failed round keeps its score and patterns but does not count as a victory", () => {
    const game = recordRound({ ...state(), score: 40, result: "lose" });
    expect(game.stats.totalScore).toBe(40);
    expect(game.stats.roundScores).toEqual([40]);
    expect(game.stats.roundsCompleted).toBe(0);
  });
  it("counts every boss phase once, while completing just one round", () => {
    const game = recordRound({ ...state(), phaseScore: 200, phasePatternIds: ["cadena_simple"], score: 400, result: "win" });
    expect(game.stats).toMatchObject({ totalScore: 600, roundScores: [600], roundsCompleted: 1, patternsActivated: 1 });
  });
  it("keeps combat-start hand and action budgets across phases without replaying one-shot points", () => {
    const first = startNextRound({ ...state(), round: 4, relics: ["tactico"], pendingRound: { hand: 2, actions: 3, discards: 1, draws: 1, score: 75 } });
    expect(first.hand).toHaveLength(9);
    expect(first.actions).toMatchObject({ maxActions: 20, maxDiscards: 3, maxDraws: 3 });
    const won = closeRound({ ...first, target: 100, score: 200, actions: { ...first.actions!, usedActions: 8, usedDiscards: 1, usedDraws: 1, maxActions: 21 } });
    const next = startBossPhase(won, 120);
    expect(next.hand).toHaveLength(9);
    expect(new Set([...next.hand, ...next.tilePool].map((t) => t.id)).size).toBe(28);
    expect(next.actions).toMatchObject({ maxActions: 20, usedActions: 0, maxDiscards: 3, usedDiscards: 0, maxDraws: 3, usedDraws: 0 });
    expect(next).toMatchObject({ round: 5, score: 0, roundBonus: 0, phaseScore: 200, target: 120 });
    expect(next.stats.roundScores).toEqual([]);
    const later = startNextRound(next);
    expect(later.hand).toHaveLength(7);
    expect(later.actions?.maxActions).toBe(17);
  });
  it("pays and records the aggregate of boss phases once, even if the final phase scores less", () => {
    const first = closeRound({ ...state(), round: 5, target: 80, score: 400 });
    const last = closeRound({ ...startBossPhase(first, 100), score: 200 });
    expect(getRoundPayout(last).gold).toBe(85);
    const settled = recordRound(last);
    expect(settled.stats).toMatchObject({ totalScore: 600, roundScores: [600], roundsCompleted: 1 });
    expect(getRoundPayout(settled).gold).toBe(85);
    expect(recordRound(settled)).toBe(settled);
  });
  it("applies a next-combat target discount throughout boss phases and clears it next round", () => {
    const first = startNextRound({ ...state(), round: 4, pendingRound: { targetMultiplier: 0.9 } });
    const phase = startBossPhase({ ...first, score: 200, result: "win" }, 120);
    expect(phase.target).toBe(108);
    expect(startNextRound(phase).roundTargetMultiplier).toBe(1);
  });
  it("speedrunner receives the actual remaining actions", () => {
    const ctx = context("speedrunner");
    const game = playRoundTile(state([tile("a", 1, 2)]), tile("a", 1, 2), "right", ctx);
    expect(game.score).toBe(10 + 11 * 10);
  });
  it("perfectionist loses the no-discard bonus after a discard", () => {
    const ctx = context("perfectionist");
    let game = playRoundTile(state([tile("a", 1, 2), tile("b", 2, 3)]), tile("a", 1, 2), "right", ctx);
    const before = game.score;
    game = discardRoundTile(game, game.hand[0]!, ctx);
    expect(game.score).toBeLessThan(before);
  });
});

describe("actions and restrictions", () => {
  it("a later boss phase needs its minimum chain even when the first tile beats the target", () => {
    let chain = createEmptyChain();
    const restriction = { type: "min_chain_length" as const, count: 4 };
    for (let n = 0; n < 4; n++) {
      chain = placeTile(chain, tile(String(n), n, n + 1), "right");
      const game = { ...state(), chain, score: 1000, target: 100 };
      expect(closeRound(game, restriction).result).toBe(n === 3 ? "win" : "lose");
    }
  });
  it("an empty Endless chain cannot grant a free cleared round", () => {
    expect(closeRound(state(), undefined, true).result).toBe("lose");
  });
  it.each(["draw", "discard"])("resolves the round when %s spends the last action", (kind) => {
    const game = state([tile("a", 1, 2)]);
    game.tilePool = [tile("b", 3, 4)];
    game.actions = { ...createActionState(1), usedActions: 11 };
    const next = kind === "draw" ? drawRoundTile(game, context()) : discardRoundTile(game, game.hand[0]!, context());
    expect(next.actions?.usedActions).toBe(12);
    expect(next.result).toBe("lose");
  });
  it("does not auto-close a blocked hand while tactical interventions remain", () => {
    const game = playRoundTile(state([tile("a", 1, 2), tile("b", 4, 5)]), tile("a", 1, 2), "right", context());
    expect(game.result).toBe("playing");
  });
  it("negative edition grants an action before checking exhaustion", () => {
    const game = state([tile("a", 1, 2, { edition: "negative" })]);
    game.actions = { ...createActionState(1), usedActions: 11 };
    const next = playRoundTile(game, game.hand[0]!, "right", context());
    expect(next.actions).toMatchObject({ maxActions: 13, usedActions: 12 });
    expect(next.result).toBe("playing");
  });
  it("freeze preserves the endpoint and the chain's effective values", () => {
    let game = state([tile("a", 1, 2), tile("b", 2, 3)]);
    game = playRoundTile(game, game.hand[0]!, "right", context());
    game = playRoundTile(game, game.hand[0]!, "right", context(), { freeze: true });
    expect(game.chain.rightEnd).toBe(2);
    expect(game.chain.placed[1]?.exposedRight).toBe(2);
  });
  it("UI legal placements and action reject the same prohibited boss tile", () => {
    const game = state([tile("a", 2, 2)]);
    expect(getLegalPlacements(game.chain, game.hand[0]!, { type: "no_doubles" })).toEqual([]);
    expect(playRoundTile(game, game.hand[0]!, "right", context(), { restriction: { type: "no_doubles" } })).toBe(game);
  });
  it("exact length is a mandatory win condition even above target", () => {
    const game = { ...state(), score: 1000, target: 80 };
    expect(closeRound(game, { type: "exact_chain_length", count: 5 }).result).toBe("lose");
  });
  it("a wild connection exposes matching inward values on either end", () => {
    const chain = placeTile(createEmptyChain(), tile("a", 3, 5), "right");
    const right = placeTile(chain, tile("b", 1, 2, { type: "wild" }), "right");
    expect(right.placed[1]?.exposedLeft).toBe(5);
    const left = placeTile(chain, tile("b", 1, 2, { type: "wild" }), "left");
    expect(left.placed[0]?.exposedRight).toBe(3);
  });
});

describe("progress and deterministic content", () => {
  it.each([0, 42, 149, 150, 299, 300, 499, 500])( "XP %i stays within the level bar without moving old thresholds", (xp) => {
    const bar = getXPForNextLevel(xp);
    expect(bar.current).toBeGreaterThanOrEqual(0);
    expect(bar.progress).toBeGreaterThanOrEqual(0);
    expect(bar.progress).toBeLessThan(1);
    expect(getLevelFromXP(150)).toBe(2);
    expect(getLevelFromXP(300)).toBe(3);
  });
  it("the same seed reproduces rewards, shop, celestial and consumable despite visual randomness", () => {
    const sample = () => {
      setGlobalRNG(12345);
      return [rollRandomCelestial(), rollRandomConsumable(), generateRewardOptions([], undefined, 7), generateShopItems([], 7)];
    };
    const original = sample();
    const random = vi.spyOn(Math, "random").mockReturnValue(0.99);
    try { expect(sample()).toEqual(original); } finally { random.mockRestore(); }
  });
});

describe("relic effects that were declared but disconnected", () => {
  it("counts explicitly declared families when activating a three-relic set", () => {
    const ids = ["tactico", "ritmo_acelerado", "pureza_tactica"];
    expect(getFamilyCounts(ids).accion).toBe(3);
    expect(computeFamilySetBonuses(ids).accionExtraActions).toBe(1);
  });
  it("duplicated or unknown ids cannot create a family bonus", () => {
    expect(getFamilyCounts(["ritmo_acelerado", "ritmo_acelerado", "missing"]).accion).toBe(1);
    expect(computeFamilySetBonuses(["ritmo_acelerado", "ritmo_acelerado", "missing"]).activeFamilies).toEqual([]);
  });
  const relicBonus = (id: string, chain: GameState["chain"], context = {}) => calculateRelicBonus(
    [ALL_RELICS.find((r) => r.id === id)!], chain, analyzePatterns(chain), context,
  );
  it("remaining actions are scored using the post-placement budget", () => {
    const game = { ...state([tile("a", 1, 2)]), relics: ["ritmo_acelerado"] };
    const next = playRoundTile(game, game.hand[0]!, "right", context());
    expect(next.score).toBe(10 + 11 * 15);
    expect(closeRound(next).score).toBe(next.score);
  });
  it("hand-size conditional bonuses use the actual remaining hand", () => {
    const chain = placeTile(createEmptyChain(), tile("a", 1, 2), "right");
    expect(relicBonus("mano_ligera", chain, { handSize: 3 }).bonus).toBe(40);
    expect(relicBonus("mano_ligera", chain, { handSize: 2 }).bonus).toBe(0);
  });
  it("purity multiplier stops after the first discard", () => {
    const chain = placeTile(createEmptyChain(), tile("a", 1, 2), "right");
    expect(relicBonus("pureza_tactica", chain, { discardsUsed: 0 }).multiplier).toBe(1.15);
    expect(relicBonus("pureza_tactica", chain, { discardsUsed: 1 }).multiplier).toBe(1);
  });
  it("counts odd pips and zeros, including both halves of a double", () => {
    expect(relicBonus("eco_impar", placeTile(createEmptyChain(), tile("a", 1, 3), "right")).bonus).toBe(8);
    expect(relicBonus("nucleo_cero", placeTile(createEmptyChain(), tile("a", 0, 0), "right")).bonus).toBe(16);
  });
  it("counts groups of three identical faces regardless of orientation", () => {
    let chain = placeTile(createEmptyChain(), tile("a", 2, 3), "right");
    chain = placeTile(chain, tile("b", 3, 2), "right");
    expect(relicBonus("colmillo_triple", chain).bonus).toBe(0);
    chain = placeTile(chain, tile("c", 2, 3), "right");
    expect(relicBonus("colmillo_triple", chain).bonus).toBe(25);
  });
  it("boosts the most recent tile bases by play order, including left placements", () => {
    let chain = placeTile(createEmptyChain(), tile("a", 1, 2, { type: "golden" }), "right");
    chain = placeTile(chain, tile("b", 2, 3), "right");
    chain = placeTile(chain, tile("c", 3, 4), "right");
    chain = placeTile(chain, tile("d", 1, 4, { type: "bomb" }), "left");
    expect(relicBonus("furia_final", chain).bonus).toBe(22.5);
  });
  it("adds eight base points per active pattern", () => {
    let chain = createEmptyChain();
    for (let n = 0; n < 5; n++) chain = placeTile(chain, tile(String(n), n, n + 1), "right");
    expect(relicBonus("bendicion_ancestral", chain).bonus).toBe(analyzePatterns(chain).patterns.length * 8);
  });
});

describe("result and payout invariants", () => {
  it("closing with a double uses the last placement, including the left end", () => {
    let chain = placeTile(createEmptyChain(), tile("a", 2, 3), "right");
    chain = placeTile(chain, tile("b", 2, 2), "left");
    const quest = ALL_QUESTS.find((q) => q.id === "close_with_double")!;
    expect(checkQuestCompletion(quest, { chain, score: 200, target: 80, patternsActivated: 1 })).toBe(true);
  });
  it("defeating the Guardian cannot unlock characters gated by other bosses", () => {
    const stats = { ...state().stats, bossesDefeated: 1, defeatedBossIds: ["guardian"] };
    expect(meetsCharacterUnlock(getCharacter("bomber"), stats, 5)).toBe(true);
    expect(meetsCharacterUnlock(getCharacter("alchemist"), stats, 5)).toBe(false);
    expect(meetsCharacterUnlock(getCharacter("perfectionist"), stats, 5)).toBe(false);
  });
  it("matches the gold forecast and keeps old round score after a new relic", () => {
    const game = { ...state(), round: 2, score: 1770 };
    expect(getRoundPayout(game).gold).toBe(191);
    expect(getRoundPayout({ ...game, relics: ["doble_corona"] }).gold).toBe(191);
  });
  it("keeps actual map depths without adding noncombat rounds", () => {
    let game = recordRound({ ...state(), round: 2, score: 1770, result: "win" });
    game = recordRound({ ...startNextRound(game), score: 3960, result: "win" });
    game = recordRound({ ...startNextRound(game), score: 0, result: "lose" });
    expect(game.stats.roundScores).toEqual([1770, 3960, 0]);
    expect(game.stats.roundNumbers).toEqual([2, 3, 4]);
    expect(game.stats).toMatchObject({ totalScore: 5730, roundsCompleted: 2 });
    saveBestData(game.round, game.stats.totalScore, game.stats.roundScores.length);
    expect(loadSavedData()).toMatchObject({ bestRound: 4, totalRoundsPlayed: 3, totalRuns: 1 });
  });
});

describe("event promises and consequences", () => {
  function choice(id: string, index: number) {
    const event = ALL_EVENTS.find((e) => e.id === id)!;
    if (event.effect.type !== "choice") throw new Error("Expected choice event");
    return event.effect.options[index]!.effect;
  }
  it.each([
    ["sacrifice", 0, { scoreBonus: 30, tileChange: -1 }],
    ["sacrifice", 1, { targetModifier: 1.15, tileChange: 2 }],
    ["presion", 0, { targetModifier: 1.3, scoreBonus: 60 }],
    ["vision_futura", 0, { targetModifier: 0.85, handBonus: 1 }],
    ["vision_futura", 1, { targetModifier: 1.2, scoreBonus: 50 }],
    ["pacto_oscuro", 0, { targetModifier: 1.35, scoreBonus: 75 }],
    ["pacto_oscuro", 1, { targetModifier: 0.9, tileChange: -1 }],
    ["viajero_misterioso", 0, { targetModifier: 1.1, tileChange: 3 }],
    ["viajero_misterioso", 1, { scoreBonus: 60, tileChange: -1 }],
    ["mercader_errante", 0, { scoreFactor: 0.5, tileChange: 3 }],
    ["mercader_errante", 1, { scoreBonus: 60, tileChange: -1 }],
    ["pacto_crepusculo", 0, { scoreBonus: 80, targetModifier: 1.3 }],
    ["llave_caos", 0, { handBonus: 2, actionBonus: { actions: 0, discards: 0, draws: 1 } }],
    ["voz_pasado", 0, { scoreBonus: 45, actionBonus: { actions: 2, discards: 0, draws: 0 } }],
    ["voz_pasado", 1, { scoreBonus: 90, tileChange: -1 }],
    ["archivista", 0, { scoreBonus: 70, tileChange: -1 }],
    ["ojo_dominix", 0, { scoreBonus: 100, targetModifier: 1.4 }],
    ["ofrenda_antigua", 0, { tileChange: -1, targetModifier: 0.8 }],
    ["ofrenda_antigua", 1, { tileChange: 2, targetModifier: 1.1 }],
    ["pacto_sombrio", 0, { scoreBonus: 100, tileChange: -2 }],
  ] as const)("%s option %i applies both sides of the choice", (id, index, expected) => {
    expect(applyEventEffect(choice(id, index))).toMatchObject(expected);
  });
  it("a dark pact removes permanent tiles and gives points to the next combat", () => {
    const game = { ...state(), score: 241, result: "reward" as const };
    const updated = applyEventToRun(game, choice("pacto_sombrio", 0));
    expect(updated.score).toBe(241);
    expect(updated.runTiles).toHaveLength(26);
    const next = startNextRound(updated);
    expect([...next.hand, ...next.tilePool]).toHaveLength(26);
    expect(next.score).toBe(100);
  });
  it("golden rain really adds three permanent golden tiles", () => {
    const effect = ALL_EVENTS.find((e) => e.id === "lluvia_dorada")!.effect;
    if (effect.type === "choice") throw new Error("Expected blessing");
    const game = applyEventToRun(state(), effect);
    expect(game.runTiles).toHaveLength(31);
    expect(game.runTiles.filter((t) => t.type === "golden")).toHaveLength(3);
    expect(startNextRound(game).runTiles.filter((t) => t.type === "golden")).toHaveLength(3);
  });
  it("a win-only bonus cannot turn a failed target into a win", () => {
    const game = startNextRound(applyEventToRun(state(), choice("gamblers_choice", 0)));
    expect(game.target).toBe(150);
    const failure = closeRound({ ...game, score: 140 });
    expect(failure).toMatchObject({ score: 140, result: "lose" });
    const success = closeRound({ ...game, score: 150 });
    expect(success).toMatchObject({ score: 190, result: "win" });
    expect(closeRound(success)).toBe(success);
  });
});


describe("feedback follows actual round actions", () => {
  it("identifies placement and undo from their committed result without changing either state", () => {
    const before=state([tile("a",1,2),tile("b",2,3)]);
    const after=playRoundTile(before,before.hand[0]!,"right",context());
    const snapshots=JSON.stringify([before,after]);
    expect(getActionCue(before,after)).toMatchObject({kind:"play",tile:{id:"a",top:1,bottom:2},score:after.score});
    expect(getActionCue(after,before)).toMatchObject({kind:"undo",tile:{id:"a",top:1,bottom:2},score:before.score});
    expect(JSON.stringify([before,after])).toBe(snapshots);
  });
  it("reports the drawn tile, remaining pool and real discard instead of the requested input", () => {
    const before={...state([tile("a",1,2)]),tilePool:[tile("drawn",3,4),tile("next",5,6)]};
    const drawn=drawRoundTile(before,context());
    expect(getActionCue(before,drawn)).toMatchObject({kind:"draw",tile:{id:"drawn",top:3,bottom:4},pool:1});
    const discarded=discardRoundTile(drawn,drawn.hand[1]!,context());
    expect(getActionCue(drawn,discarded)).toMatchObject({kind:"discard",tile:{id:"drawn",top:3,bottom:4}});
  });
  it("cannot confirm rejected draws, exhausted discards or a nonexistent tile", () => {
    const before={...state([tile("a",1,2)]),actions:{...createActionState(1),usedDiscards:2}};
    expect(getActionCue(before,drawRoundTile(before,context()))).toBeNull();
    expect(getActionCue(before,discardRoundTile(before,before.hand[0]!,context()))).toBeNull();
    expect(getActionCue(before,playRoundTile(before,tile("missing",1,2),"right",context()))).toBeNull();
  });
  it("never replays an action when restoring identical data or entering another round", () => {
    const before=state();
    expect(getActionCue(before,JSON.parse(JSON.stringify(before)))).toBeNull();
    expect(getActionCue(before,startNextRound(before))).toBeNull();
    const won=closeRound({...before,score:1000});
    expect(getActionCue(won,{...won,result:"reward"})).toBeNull();
  });
  it("reports the actual outcome including a failed boss requirement", () => {
    const before=playRoundTile(state([tile("a",1,2)]),tile("a",1,2),"right",context());
    const high={...before,score:1000};
    expect(getActionCue(high,closeRound(high,{type:"min_patterns",count:2}))).toMatchObject({kind:"close",outcome:"lose",score:1000});
    expect(getActionCue(high,closeRound(high))).toMatchObject({kind:"close",outcome:"win",score:1000});
  });
  it("keeps the last draw and exhaustion outcome together", () => {
    const opening=playRoundTile(state([tile("a",1,2)]),tile("a",1,2),"right",context());
    const before={...opening,target:1,tilePool:[tile("drawn",2,3)],actions:{...createActionState(1),usedActions:11}};
    const after=drawRoundTile(before,context());
    expect(getActionCue(before,after)).toMatchObject({kind:"draw",tile:{id:"drawn"},outcome:"win"});
  });
  it("does not mistake a bulk inventory edit for a draw", () => {
    const before=state([tile("a",1,2)]);
    expect(getActionCue(before,{...before,hand:[...before.hand,tile("x",3,4),tile("y",5,6)]})).toBeNull();
  });
  it("blocks shortcuts inside modals, editing, key repeat, modifiers and consumed events", () => {
    const event={defaultPrevented:false,repeat:false,altKey:false,ctrlKey:false,metaKey:false};
    expect(boardShortcutsBlocked(event,false,false)).toBe(false);
    expect(boardShortcutsBlocked(event,true,false)).toBe(true);
    expect(boardShortcutsBlocked(event,false,true)).toBe(true);
    for(const key of Object.keys(event))expect(boardShortcutsBlocked({...event,[key]:true},false,false)).toBe(true);
  });
});

describe("score explanation reconciliation", () => {
  it("identifies actual projected patterns and relic totals from the same calculation", () => {
    const ctx = context();
    ctx.patternBonus = 1.3;
    let game = {...state([tile("a",1,1), tile("b",1,2), tile("c",2,2)]), relics:["doble_corona","impulso_inicial"]};
    game = playRoundTile(game,game.hand[0]!,"right",ctx);
    game = playRoundTile(game,game.hand[0]!,"right",ctx);
    const before = JSON.stringify(game);
    const e = explainTileScore(game,game.hand[0]!,ctx)!;
    const actual = playRoundTile(game,game.hand[0]!,"right",ctx);
    expect(e.sources.breakdown).toEqual(calculateRunScore(actual,ctx).breakdown);
    expect(e.sources.tiles).toBe(3);
    expect(e.sources.patternBonusFactor).toBe(1.3);
    expect(e.sources.relicIds).toEqual(game.relics);
    expect(e.sources.breakdown.patternAnalysis.patterns.map(p=>p.id)).toEqual(expect.arrayContaining(["cadena_simple","doble_doble"]));
    expect(e.after).toBe(actual.score);
    expect(JSON.stringify(game)).toBe(before);
  });
  it.each(["foil","holo","polychrome","negative"] as const)("rebuilds the exact played total with %s, pact, build multipliers and accumulated points", edition => {
    const ctx = context();
    ctx.scoreMultiplier = 1.3;
    ctx.talents = {...ctx.talents, flatScoreBonus:37, extraPatternScore:11, scoreMultiplier:1.2};
    let game = state([tile("opening",1,4),tile("choice",1,4,{edition,pact:true})]);
    game = playRoundTile(game,game.hand[0]!,"right",ctx);
    game = {...game,roundBonus:123,roundScoreFactor:0.7};
    game.score = calculateRunScore(game,ctx).total;
    const saved = JSON.stringify(game);
    for(const side of ["left","right"] as const) {
      const e = explainTileScore(game,game.hand[0]!,ctx,{double:true},side)!;
      const next = playRoundTile(game,game.hand[0]!,side,ctx,{double:true});
      expect(e.after).toBe(next.score);
      expect(e.delta).toBe(next.score-game.score);
      let subtotal=0;
      for(const step of e.steps) { expect(step.before).toBe(subtotal); subtotal=step.after; }
      expect(subtotal).toBe(e.after);
      expect(e.steps.some(s=>s.id==="accumulated")).toBe(true);
      expect(calculateRunScore(next,ctx).total).toBe(calculateRunScore(next,ctx,true).total);
    }
    expect(JSON.stringify(game)).toBe(saved);
  });
  it("does not explain a prohibited or missing tile", () => {
    const game=state([tile("blocked",2,2)]);
    expect(explainTileScore(game,game.hand[0]!,context(),{restriction:{type:"no_doubles"}})).toBeNull();
    expect(explainTileScore(game,tile("missing",1,2),context())).toBeNull();
  });
  it("reconciles a negative accumulated bonus and the zero floor", () => {
    const game={...state([tile("zero",1,2)]),roundBonus:-1000};
    const explanation=explainTileScore(game,game.hand[0]!,context())!;
    expect(explanation.after).toBe(0);
    expect(explanation.steps[explanation.steps.length-1]?.after).toBe(0);
  });
});
