import { useState } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "framer-motion";
import ShopScreen from "../src/components/ShopScreen";
import SanctuaryScreen from "../src/components/SanctuaryScreen";
import EventScreen from "../src/components/EventScreen";
import RewardScreen from "../src/components/RewardScreen";
import GameOverScreen from "../src/components/GameOverScreen";
import IdentityPreview from "./uiIdentity";
import MaterialComparison from "./uiMaterials";
import TacticalPreview from "./uiTactical";
import CraftPreview from "./uiCraft";
import { saveProgression } from "../src/engine/progression";
import { qaOwnedRelics, qaRewards, qaResults } from "./uiFixtures";
import { generateShopItems } from "../src/engine/shop";
import { ALL_EVENTS } from "../src/engine/events";
import { setGlobalRNG } from "../src/engine/rng";
import { setLanguage, useTranslation } from "../src/engine/i18n";
import { useReduceMotion, useSettings } from "../src/hooks/useSettings";
import "../src/index.css";

setLanguage("es");
const createItems = () => { setGlobalRNG(12345); return generateShopItems(["impulso_inicial"], 4); };
function Preview() {
  const [scene, setScene] = useState<"shop" | "event" | "sanctuary" | "reward" | "results" | "identity" | "materials" | "tactical" | "craft">(() => new URLSearchParams(location.search).get("scene") === "tactical" ? "tactical" : "shop");
  const [revision, setRevision] = useState(0);
  const [resultVariant, setResultVariant] = useState<"normal" | "zero" | "long">("normal");
  const [items, setItems] = useState(createItems);
  const [gold, setGold] = useState(60);
  const [feedback, setFeedback] = useState("");
  const [settings, updateSettings] = useSettings();
  const reducedMotion = useReduceMotion();
  const { lang, setLang } = useTranslation();
  return <MotionConfig reducedMotion={reducedMotion ? "always" : "user"}>
    <header className="p-3 border-b border-amber-500/30 bg-surface-800 text-amber-100 text-sm">
      <p className="text-center mb-3">Vista QA de UI · datos de ejemplo · origen separado del juego</p>
      <nav aria-label="Pantallas de revisión" className="flex flex-wrap gap-2 justify-center items-center">
        {([['shop', 'Tienda'], ['sanctuary', 'Santuario'], ['event', 'Evento'], ['reward', 'Recompensas'], ['results', 'Resultados'], ['identity', 'Iconos y skins'], ['materials', 'Materiales A/B'], ['tactical', 'Mesa táctica'], ['craft', 'Acabados']] as const).map(([id, label]) => <button key={id} className="px-3 py-2 border rounded" aria-pressed={scene === id} onClick={() => {
          if (id === "results") saveProgression({ xp: 493, level: 3, unlockedRewards: [] });
          setScene(id); setFeedback("");
        }}>{label}</button>)}
        <button className="px-3 py-2 border rounded" aria-pressed={settings.reduceMotion} onClick={() => updateSettings({ reduceMotion: !settings.reduceMotion })}>Movimiento reducido</button>
        <select className="p-2 bg-surface-800 border rounded" aria-label="Idioma de vista QA" value={lang} onChange={e => setLang(e.target.value as "es" | "en")}><option value="es">Español</option><option value="en">English</option></select>
        <button className="px-3 py-2 border rounded" onClick={() => { setGold(60); setItems(createItems()); setFeedback(""); setRevision(r => r + 1); }}>Reiniciar vista</button>
        <select className="p-2 bg-surface-800 border rounded" aria-label="Caso de resultados QA" value={resultVariant} onChange={e => setResultVariant(e.target.value as typeof resultVariant)}><option value="normal">Resultados: normal</option><option value="zero">Resultados: cero</option><option value="long">Resultados: 80 rondas</option></select>
      </nav>
      {feedback && <p role="status" className="text-center mt-2">{feedback}</p>}
    </header>
    {scene === "craft" ? <CraftPreview /> : scene === "tactical" ? <TacticalPreview /> : scene === "materials" ? <MaterialComparison /> : scene === "identity" ? <IdentityPreview /> : scene === "reward" ? <RewardScreen key={revision} options={qaRewards} ownedRelicIds={qaOwnedRelics} replacedConsumableName="Recarga" onSkip={() => setScene("shop")} onSelect={option => { setFeedback(`Elección QA: ${option.name}`); setScene("shop"); }} />
      : scene === "results" ? <GameOverScreen key={`${revision}-${resultVariant}-${reducedMotion}`} stats={qaResults(resultVariant)} finalRound={resultVariant === "long" ? 81 : resultVariant === "zero" ? 2 : 7} relicIds={qaOwnedRelics} isNewBest={false} onHome={() => setScene("shop")} onRestart={() => setScene("reward")} />
      : scene === "shop" ? <ShopScreen key={revision} items={items} gold={gold} onBuy={item => {
      if (gold < item.cost || !items.some(i => i.id === item.id)) return false;
      setGold(g => g - item.cost); setItems(all => all.filter(i => i.id !== item.id)); return true;
    }} onSkip={() => setFeedback("Salida registrada en esta vista QA")} rerollCost={5} onReroll={() => { if (gold >= 5) { setGold(g => g - 5); setItems(createItems()); } }} />
      : scene === "sanctuary" ? <SanctuaryScreen goldReward={55} extraActions={3} onSelect={() => setFeedback("Elección registrada en esta vista QA")} />
      : <EventScreen event={ALL_EVENTS.find(e => e.effect.type === "choice")!} onContinue={() => setFeedback("Elección registrada en esta vista QA")} />}
  </MotionConfig>;
}
const root = createRoot(document.getElementById("root")!);
root.render(<Preview />);
if (import.meta.hot) import.meta.hot.dispose(() => root.unmount());
