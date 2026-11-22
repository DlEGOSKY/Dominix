import { useState } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "framer-motion";
import Chain from "../src/components/Chain";
import { createEmptyChain, placeTile } from "../src/engine/chain";
import { calculateScore } from "../src/engine/score";
import { useReduceMotion, useSettings } from "../src/hooks/useSettings";
import type { PlacementSide } from "../src/types/domino";
import "../src/index.css";

function prepared(count: number) {
  let chain = createEmptyChain();
  for (let n = 0; n < count; n++) chain = placeTile(chain, { id: `prepared-${n}`, top: n % 7, bottom: (n + 1) % 7 }, "right");
  return chain;
}
function Preview() {
  const [history, setHistory] = useState(() => [prepared(28)]);
  const [flash, setFlash] = useState(0);
  const reduced = useReduceMotion();
  const [settings, update] = useSettings();
  const chain = history[history.length - 1]!;
  const add = (side: PlacementSide) => {
    const end = side === "left" ? chain.leftEnd! : chain.rightEnd!;
    const next = placeTile(chain, { id: `added-${side}-${history.length}`, top: side === "left" ? 6 : end, bottom: side === "left" ? end : 6 }, side);
    setHistory(all => [...all, next]);
  };
  return <MotionConfig reducedMotion={reduced ? "always" : "user"}><main className="max-w-3xl mx-auto px-3 py-6 text-accent-silver">
    <h1 className="text-xl font-bold text-white">Cadena larga · QA</h1>
    <p className="text-xs my-3">Set artificial con fichas repetidas. Chain y reglas de colocación reales; sin build, guardado ni recompensas. No acredita una run natural.</p>
    <nav className="flex flex-wrap gap-2 my-4" aria-label="Controles QA">
      <button className="p-2 border rounded" onClick={() => add("left")}>Añadir izquierda</button>
      <button className="p-2 border rounded" onClick={() => add("right")}>Añadir derecha</button>
      <button className="p-2 border rounded" disabled={history.length < 2} onClick={() => setHistory(all => all.slice(0, -1))}>Deshacer QA</button>
      <button className="p-2 border rounded" onClick={() => setFlash(n => n + 1)}>Patrón QA</button>
      <button className="p-2 border rounded" aria-pressed={settings.reduceMotion} onClick={() => update({reduceMotion: !settings.reduceMotion})}>Movimiento reducido</button>
    </nav>
    <p role="status">Fichas {chain.placed.length} · Extremos {chain.leftEnd}/{chain.rightEnd} · Score de cadena sin build {calculateScore(chain).total}</p>
    <div className="chain-surface p-3 mt-4 rounded-xl border border-surface-600"><Chain chain={chain} skin="imperium" patternFlash={flash} /></div>
  </main></MotionConfig>;
}
createRoot(document.getElementById("root")!).render(<Preview />);
