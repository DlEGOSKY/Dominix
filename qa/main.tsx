import { useState } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "framer-motion";
import GameBoard from "../src/components/GameBoard";
import { getDefaultConfig } from "../src/engine/modifiers";
import type { RunStats } from "../src/types/domino";
import { useSettings, useReduceMotion } from "../src/hooks/useSettings";
import "../src/index.css";

function Scenario() {
  const [result, setResult] = useState<RunStats | null>(null);
  const [settings, updateSettings] = useSettings();
  const reducedMotion = useReduceMotion();
  return <MotionConfig reducedMotion={reducedMotion ? "always" : "user"}>
    <aside className="p-3 text-center text-sm text-amber-200 bg-surface-800 border-b border-amber-500/30">Escenario QA aislado · Inquisidor, ronda 65 · set preparado y metas ×0,001 · no acredita una partida natural</aside>
    <button className="block mx-auto p-2 border rounded text-amber-100 bg-surface-800" aria-pressed={settings.reduceMotion} onClick={() => updateSettings({ reduceMotion: !settings.reduceMotion })}>Movimiento reducido (QA)</button>
    {result ? <section className="p-6"><h1>Resultado QA</h1><pre aria-label="Estadísticas QA">{JSON.stringify(result, null, 2)}</pre></section>
      : <GameBoard isDaily modifierConfig={{ ...getDefaultConfig(), targetMultiplier: 0.001 }} onGameOver={setResult} />}
  </MotionConfig>;
}
const root = createRoot(document.getElementById("root")!);
root.render(<Scenario />);
if (import.meta.hot) import.meta.hot.dispose(() => root.unmount());
