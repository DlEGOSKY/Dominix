import { useState } from "react";
import { explainTileScore } from "../src/engine/scoreExplanation";
import Chain from "../src/components/Chain";
import Hand from "../src/components/Hand";
import MobileInfoBar from "../src/components/MobileInfoBar";
import { ALL_CONSUMABLES } from "../src/engine/consumables";
import type { TileSkin } from "../src/components/TileView";
import type { GameState, PlacementSide, Tile } from "../src/types/domino";
import { createActionState, canDiscard } from "../src/engine/actions";
import { createEmptyChain, placeTile } from "../src/engine/chain";
import { getCharacter } from "../src/engine/characters";
import { getTalentBonuses } from "../src/engine/talents";
import { calculateRunScore, type RunScoreContext } from "../src/engine/runScore";
import { playRoundTile, discardRoundTile } from "../src/engine/roundActions";
import { getLegalPlacements } from "../src/engine/roundRules";

const context: RunScoreContext = {
  character: getCharacter("architect"), talents: getTalentBonuses({ ranks: {}, spent: 0 }),
  scoreMultiplier: 1, patternBonus: 1, celestials: [], celestialBoost: 1, chaosTwist: null, flatPerTile: 0,
};
function initialState(): GameState {
  const hand: Tile[] = [
    { id: "both", top: 1, bottom: 4, pact: true, edition: "foil" },
    { id: "wild", top: 0, bottom: 5, type: "wild" }, { id: "mirror", top: 2, bottom: 6, type: "mirror" },
    { id: "bomb", top: 1, bottom: 3, type: "bomb" }, { id: "golden", top: 4, bottom: 5, type: "golden", edition: "negative" },
    { id: "locked", top: 1, bottom: 6, type: "locked" }, { id: "mismatch", top: 6, bottom: 6 },
  ];
  const chain = placeTile(placeTile(createEmptyChain(), { id: "a", top: 1, bottom: 2 }, "right"), { id: "b", top: 2, bottom: 4 }, "right");
  const state: GameState = {
    runTiles: [...chain.placed.map(p => p.tile), ...hand], hand, tilePool: [], chain,
    score: 0, round: 1, target: 10000, result: "playing", relics: [], actions: createActionState(1),
    stats: { roundsCompleted: 0, totalScore: 0, patternsActivated: 0, patternBreakdown: {}, relicsCollected: 0,
      tilesPlayed: 2, highestRoundScore: 0, bossesDefeated: 0, shopPurchases: 0, bestCombo: 0,
      goldEarned: 0, tilesDiscarded: 0, tilesDrawn: 0, roundScores: [] },
  };
  return { ...state, score: calculateRunScore(state, context).total };
}

export default function TacticalPreview() {
  const [history, setHistory] = useState<GameState[]>(() => [initialState()]);
  const [skin, setSkin] = useState<TileSkin>("imperium");
  const [restrictWild, setRestrictWild] = useState(false);
  const [sampleConsumable, setSampleConsumable] = useState(false);
  const [resourceFeedback, setResourceFeedback] = useState("");
  const state = history[history.length - 1]!;
  const restriction = restrictWild ? { type: "no_wild" as const } : undefined;
  const commit = (next: GameState) => { if (next !== state) setHistory(all => [...all, next]); };
  const preview = (tile: Tile, side?: PlacementSide) => {
    const sides = getLegalPlacements(state.chain, tile, restriction);
    const chosen = side ?? (sides.includes("right") ? "right" : sides[0]);
    return !chosen || state.result !== "playing" ? null : playRoundTile(state, tile, chosen, context, { restriction }).score - state.score;
  };
  return <section className="max-w-3xl mx-auto px-3 py-6 text-accent-silver">
    <h1 className="text-xl font-bold text-white">Mesa · lectura táctica</h1>
    <p className="text-xs my-3">Estado preparado, sin guardado ni recompensas. Mano y cadena de producto; colocación, puntuación y descarte usan el motor real. Deshacer restaura únicamente este escenario QA.</p>
    <div className="flex flex-wrap gap-3 mb-4 items-center">
      <label>Skin <select className="p-2 bg-surface-800 border rounded" value={skin} onChange={e => setSkin(e.target.value as TileSkin)}>
        {(["default", "ivory", "emerald", "diamond", "imperium", "banda_doble"] as const).map(id => <option key={id}>{id}</option>)}
      </select></label>
      <button className="p-2 border rounded" onClick={() => setHistory([initialState()])}>Reiniciar mesa QA</button>
      <button className="p-2 border rounded disabled:opacity-40" disabled={history.length < 2} onClick={() => setHistory(all => all.slice(0, -1))}>Deshacer QA</button>
      <button className="p-2 border rounded" aria-pressed={restrictWild} onClick={() => setRestrictWild(v => !v)}>Restricción QA: sin comodín</button>
    </div>
    <p role="status" className="font-mono text-sm">Score {state.score} · Extremos {state.chain.leftEnd} / {state.chain.rightEnd} · Acciones {state.actions!.maxActions - state.actions!.usedActions} · {state.result}</p>
    <button className="p-2 border rounded my-3" onClick={() => { setSampleConsumable(true); setResourceFeedback(""); }}>Preparar consumible QA</button>
    {resourceFeedback && <p role="status">{resourceFeedback}</p>}
    <MobileInfoBar relicIds={["impulso_inicial"]} consumables={sampleConsumable ? [ALL_CONSUMABLES[0]!] : []} celestials={[]} mutationStates={[]} game={state}
      onUseConsumable={() => { setSampleConsumable(false); setResourceFeedback("Consumible usado en QA: callback registrado, sin efecto de partida"); }} onActivateMutation={() => {}} />
    <Chain chain={state.chain} skin={skin} />
    <Hand tiles={state.hand} chain={state.chain} skin={skin} disabled={state.result !== "playing"}
      getPlacements={tile => getLegalPlacements(state.chain, tile, restriction)} getScorePreview={preview} getScoreExplanation={(tile,side)=>explainTileScore(state,tile,context,{restriction},side)}
      onPlay={(tile, side) => commit(playRoundTile(state, tile, side, context, { restriction }))}
      onDiscard={tile => commit(discardRoundTile(state, tile, context, { restriction }))} canDiscard={canDiscard(state.actions!)} />
  </section>;
}
