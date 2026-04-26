import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import TileView from "./TileView";
import AnimatedDemo from "./AnimatedDemo";
import RelicCard from "./RelicCard";
import type { Tile } from "@/types/domino";
import { useTranslation } from "@/engine/i18n";
import { getHowToPlayContent } from "@/engine/howToPlayContent";

interface HowToPlayScreenProps {
  onBack: () => void;
}

// Section icons stay numeric (no translation); titles come from
// howToPlayContent so the navigation and footer stay live with language.
const SECTION_ICONS = ["1", "2", "3", "4", "5"];

// Demo tiles for examples
const DEMO_TILES: Record<string, Tile> = {
  "3-3": { id: "demo-3-3", top: 3, bottom: 3 },
  "3-5": { id: "demo-3-5", top: 3, bottom: 5 },
  "5-2": { id: "demo-5-2", top: 5, bottom: 2 },
  "2-6": { id: "demo-2-6", top: 2, bottom: 6 },
  "6-6": { id: "demo-6-6", top: 6, bottom: 6 },
  "1-1": { id: "demo-1-1", top: 1, bottom: 1 },
  "4-4": { id: "demo-4-4", top: 4, bottom: 4 },
  "wild": { id: "demo-wild", top: 0, bottom: 0, type: "wild" },
  "golden": { id: "demo-golden", top: 5, bottom: 3, type: "golden" },
  "locked": { id: "demo-locked", top: 2, bottom: 4, type: "locked" },
  "mirror": { id: "demo-mirror", top: 1, bottom: 4, type: "mirror" },
  "bomb": { id: "demo-bomb", top: 3, bottom: 6, type: "bomb" },
};

function SectionBasics() {
  const c = getHowToPlayContent().basics;
  return (
    <div className="flex flex-col gap-8">
      {/* What is a domino tile */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-white">{c.tilesHeading}</h3>
        <p className="text-accent-silver/70 leading-relaxed">
          {renderInline(c.tilesIntro)}
        </p>
        
        <div className="flex items-center justify-center gap-8 py-6">
          <div className="flex flex-col items-center gap-3">
            <TileView tile={DEMO_TILES["3-5"]!} disabled size="md" animate={false} />
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-accent-silver/50">{c.tile35Label}</span>
              <span className="text-xs text-accent-gold">{c.tile35Value}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-3">
            <TileView tile={DEMO_TILES["6-6"]!} disabled size="md" animate={false} />
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-accent-silver/50">{c.tile66Label}</span>
              <span className="text-xs text-accent-gold">{c.tile66Value}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-3">
            <TileView tile={DEMO_TILES["1-1"]!} disabled size="md" animate={false} />
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-accent-silver/50">{c.tile11Label}</span>
              <span className="text-xs text-accent-gold">{c.tile11Value}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Animated connection demo */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-white">{c.connectHeading}</h3>
        <p className="text-accent-silver/70 leading-relaxed">
          {renderInline(c.connectIntro)}
        </p>

        <AnimatedDemo
          steps={[
            {
              hand: [DEMO_TILES["3-5"]!, DEMO_TILES["5-2"]!, DEMO_TILES["2-6"]!, DEMO_TILES["1-1"]!],
              chain: [],
              score: 0,
              label: c.demoStart,
              highlight: "demo-3-5",
            },
            {
              hand: [DEMO_TILES["5-2"]!, DEMO_TILES["2-6"]!, DEMO_TILES["1-1"]!],
              chain: [DEMO_TILES["3-5"]!],
              score: 8,
              label: c.demoPlayFirst,
            },
            {
              hand: [DEMO_TILES["2-6"]!, DEMO_TILES["1-1"]!],
              chain: [DEMO_TILES["3-5"]!, DEMO_TILES["5-2"]!],
              score: 15,
              label: c.demoConnectFive,
              highlight: "demo-5-2",
            },
            {
              hand: [DEMO_TILES["1-1"]!],
              chain: [DEMO_TILES["3-5"]!, DEMO_TILES["5-2"]!, DEMO_TILES["2-6"]!],
              score: 23,
              label: c.demoConnectTwo,
            },
            {
              hand: [DEMO_TILES["1-1"]!],
              chain: [DEMO_TILES["3-5"]!, DEMO_TILES["5-2"]!, DEMO_TILES["2-6"]!],
              score: 38,
              label: c.demoPattern,
            },
          ]}
          intervalMs={2200}
        />
      </div>

      {/* Invalid connection */}
      <div className="flex flex-col items-center gap-4 py-4 px-4 rounded-xl bg-red-500/5 border border-red-500/20">
        <div className="flex items-center gap-2">
          <TileView tile={DEMO_TILES["3-5"]!} disabled size="sm" animate={false} />
          <div className="w-8 h-8 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center">
            <span className="text-red-400 text-lg">X</span>
          </div>
          <TileView tile={DEMO_TILES["1-1"]!} disabled size="sm" animate={false} />
        </div>
        <p className="text-sm text-red-400/70">
          {c.invalidHint}
        </p>
      </div>
    </div>
  );
}

/**
 * Render a string with **bold** segments. We accept Markdown-light syntax in
 * the bilingual content registry so paragraph-level emphasis ports between
 * languages without sprinkling React fragments through the data file.
 */
function renderInline(s: string): React.ReactNode {
  const parts = s.split(/\*\*([^*]+)\*\*/g);
  return parts.map((segment, i) =>
    i % 2 === 1
      ? <span key={i} className="text-white font-semibold">{segment}</span>
      : <span key={i}>{segment}</span>
  );
}

function SectionGameplay() {
  const c = getHowToPlayContent().gameplay;
  return (
    <div className="flex flex-col gap-8">
      {/* Goal */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-white">{c.goalHeading}</h3>
        <p className="text-accent-silver/70 leading-relaxed">
          {renderInline(c.goalIntro)}
        </p>
        
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-full max-w-xs">
            <div className="flex justify-between text-xs text-accent-silver/50 mb-2">
              <span>Ronda 1</span>
              <span>Meta: 80</span>
            </div>
            <div className="relative w-full h-4 rounded-full bg-surface-700 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "75%" }}
                transition={{ delay: 0.3, duration: 1 }}
                className="h-full rounded-full bg-gradient-to-r from-accent-gold to-amber-400"
              />
            </div>
            <div className="flex justify-center mt-2">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
                className="font-mono font-bold text-2xl text-white"
              >
                60 / 80
              </motion.span>
            </div>
          </div>
          <p className="text-sm text-accent-silver/50">
            {c.goalNeedMore}
          </p>
        </div>
      </div>

      {/* Animated round demo */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-white">{c.roundDemoHeading}</h3>
        <p className="text-accent-silver/70 leading-relaxed">
          {renderInline(c.roundDemoIntro)}
        </p>

        <AnimatedDemo
          steps={[
            {
              hand: [DEMO_TILES["3-3"]!, DEMO_TILES["3-5"]!, DEMO_TILES["5-2"]!, DEMO_TILES["2-6"]!, DEMO_TILES["6-6"]!],
              chain: [],
              score: 0,
              label: c.roundDemoStep1,
              highlight: "demo-3-3",
            },
            {
              hand: [DEMO_TILES["3-5"]!, DEMO_TILES["5-2"]!, DEMO_TILES["2-6"]!, DEMO_TILES["6-6"]!],
              chain: [DEMO_TILES["3-3"]!],
              score: 6,
              label: c.roundDemoStep2,
            },
            {
              hand: [DEMO_TILES["5-2"]!, DEMO_TILES["2-6"]!, DEMO_TILES["6-6"]!],
              chain: [DEMO_TILES["3-3"]!, DEMO_TILES["3-5"]!],
              score: 14,
              label: c.roundDemoStep3,
              highlight: "demo-3-5",
            },
            {
              hand: [DEMO_TILES["2-6"]!, DEMO_TILES["6-6"]!],
              chain: [DEMO_TILES["3-3"]!, DEMO_TILES["3-5"]!, DEMO_TILES["5-2"]!],
              score: 21,
              label: c.roundDemoStep4,
            },
            {
              hand: [DEMO_TILES["6-6"]!],
              chain: [DEMO_TILES["3-3"]!, DEMO_TILES["3-5"]!, DEMO_TILES["5-2"]!, DEMO_TILES["2-6"]!],
              score: 29,
              label: c.roundDemoStep5,
            },
            {
              hand: [],
              chain: [DEMO_TILES["3-3"]!, DEMO_TILES["3-5"]!, DEMO_TILES["5-2"]!, DEMO_TILES["2-6"]!, DEMO_TILES["6-6"]!],
              score: 86,
              label: c.roundDemoStep6,
            },
          ]}
          intervalMs={2500}
        />
      </div>

      {/* Rounds progression */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-white">{c.progressionHeading}</h3>
        <p className="text-accent-silver/70 leading-relaxed">
          {renderInline(c.progressionIntro)}
        </p>
        
        <div className="flex items-center justify-center gap-3 py-4">
          {[
            { round: 1, target: 80, status: "done" },
            { round: 2, target: 140, status: "done" },
            { round: 3, target: 220, status: "current" },
            { round: 4, target: 320, status: "future" },
          ].map((r, i) => (
            <motion.div
              key={r.round}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className={[
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg border",
                r.status === "done" ? "bg-green-500/10 border-green-500/30" :
                r.status === "current" ? "bg-accent-gold/10 border-accent-gold/30" :
                "bg-surface-800/50 border-surface-600/30 opacity-50"
              ].join(" ")}
            >
              <span className={[
                "text-xs font-bold",
                r.status === "done" ? "text-green-400" :
                r.status === "current" ? "text-accent-gold" :
                "text-accent-silver/40"
              ].join(" ")}>R{r.round}</span>
              <span className="text-xs text-accent-silver/50">{r.target}</span>
            </motion.div>
          ))}
          <span className="text-accent-silver/30">...</span>
        </div>
      </div>
    </div>
  );
}

function SectionPatterns() {
  const c = getHowToPlayContent().patterns;
  const patterns = [
    {
      name: c.chainSimpleName,
      description: c.chainSimpleDesc,
      bonus: "+15",
      example: ["3-5", "5-2", "2-6"],
    },
    {
      name: c.doubleDoubleName,
      description: c.doubleDoubleDesc,
      bonus: "+20",
      example: ["3-3", "3-5", "5-5"],
    },
    {
      name: c.dominionName,
      description: c.dominionDesc,
      bonus: "+25",
      example: ["5-5", "5-2", "2-5"],
    },
    {
      name: c.ladderName,
      description: c.ladderDesc,
      bonus: "+30",
      example: ["1-2", "2-3", "3-4"],
    },
  ];

  const [activePattern, setActivePattern] = useState(0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-white">{c.sectionHeading}</h3>
        <p className="text-accent-silver/70 leading-relaxed">
          {renderInline(c.sectionIntro)}
        </p>
      </div>

      {/* Pattern selector */}
      <div className="flex flex-wrap gap-2">
        {patterns.map((p, i) => (
          <button
            key={p.name}
            onClick={() => setActivePattern(i)}
            className={[
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              activePattern === i
                ? "bg-accent-gold/20 text-accent-gold border border-accent-gold/30"
                : "bg-surface-800 text-accent-silver/60 border border-surface-600/30 hover:border-surface-600"
            ].join(" ")}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Active pattern display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePattern}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-surface-800/50 border border-surface-600/30"
        >
          <div className="flex items-center gap-3">
            <span className="font-bold text-lg text-white">{patterns[activePattern]!.name}</span>
            <span className="px-2 py-0.5 rounded-md bg-green-500/20 text-green-400 text-sm font-mono font-bold">
              {patterns[activePattern]!.bonus}
            </span>
          </div>
          
          <p className="text-sm text-accent-silver/60">
            {patterns[activePattern]!.description}
          </p>
          
          <div className="flex items-center gap-2 py-2">
            {patterns[activePattern]!.example.map((tileKey, i) => {
              const [top, bottom] = tileKey.split("-").map(Number);
              const tile: Tile = { id: `pattern-${i}`, top: top!, bottom: bottom! };
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <TileView tile={tile} disabled size="sm" animate={false} />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Combo system */}
      <div className="flex flex-col gap-4 p-5 rounded-2xl bg-purple-500/5 border border-purple-500/20">
        <h4 className="font-bold text-white flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-400 text-xs font-bold">{c.comboBadge}</span>
          {c.comboHeading}
        </h4>
        <p className="text-sm text-accent-silver/60 leading-relaxed">
          {renderInline(c.comboIntro)}
        </p>
        <div className="flex items-center gap-3 text-sm">
          <span className="px-2 py-1 rounded-lg bg-surface-800 text-accent-silver/60">{c.combo2}</span>
          <span className="px-2 py-1 rounded-lg bg-surface-800 text-accent-silver/60">{c.combo3}</span>
          <span className="px-2 py-1 rounded-lg bg-surface-800 text-accent-silver/60">{c.combo4}</span>
        </div>
      </div>
    </div>
  );
}

function SectionAdvanced() {
  const c = getHowToPlayContent().advanced;
  return (
    <div className="flex flex-col gap-8">
      {/* Special tiles */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-white">{c.specialTilesHeading}</h3>
        <p className="text-accent-silver/70 leading-relaxed">
          {c.specialTilesIntro}
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
            <TileView tile={DEMO_TILES["wild"]!} disabled size="sm" animate={false} />
            <span className="font-bold text-purple-400">{c.wildName}</span>
            <p className="text-xs text-accent-silver/50 text-center">
              {c.wildDesc}
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
            <TileView tile={DEMO_TILES["golden"]!} disabled size="sm" animate={false} />
            <span className="font-bold text-yellow-400">{c.goldenName}</span>
            <p className="text-xs text-accent-silver/50 text-center">
              {c.goldenDesc}
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-surface-700/30 border border-surface-600/30">
            <TileView tile={DEMO_TILES["locked"]!} disabled size="sm" animate={false} />
            <span className="font-bold text-accent-silver/60">{c.lockedName}</span>
            <p className="text-xs text-accent-silver/50 text-center">
              {c.lockedDesc}
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
            <TileView tile={DEMO_TILES["mirror"]!} disabled size="sm" animate={false} />
            <span className="font-bold text-cyan-400">{c.mirrorName}</span>
            <p className="text-xs text-accent-silver/50 text-center">
              {c.mirrorDesc}
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
            <TileView tile={DEMO_TILES["bomb"]!} disabled size="sm" animate={false} />
            <span className="font-bold text-red-400">{c.bombName}</span>
            <p className="text-xs text-accent-silver/50 text-center">
              {c.bombDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Animated special tiles demo */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-white">{c.specialDemoHeading}</h3>
        <AnimatedDemo
          steps={[
            {
              hand: [DEMO_TILES["mirror"]!, DEMO_TILES["bomb"]!, DEMO_TILES["wild"]!],
              chain: [DEMO_TILES["3-5"]!],
              score: 8,
              label: c.specialDemoStep1,
              highlight: "demo-mirror",
            },
            {
              hand: [DEMO_TILES["bomb"]!, DEMO_TILES["wild"]!],
              chain: [DEMO_TILES["3-5"]!, DEMO_TILES["mirror"]!],
              score: 16,
              label: c.specialDemoStep2,
            },
            {
              hand: [DEMO_TILES["wild"]!],
              chain: [DEMO_TILES["3-5"]!, DEMO_TILES["mirror"]!, DEMO_TILES["bomb"]!],
              score: 40,
              label: c.specialDemoStep3,
            },
            {
              hand: [],
              chain: [DEMO_TILES["3-5"]!, DEMO_TILES["mirror"]!, DEMO_TILES["bomb"]!, DEMO_TILES["wild"]!],
              score: 48,
              label: c.specialDemoStep4,
            },
          ]}
          intervalMs={2800}
        />
      </div>

      {/* Relics */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-white">{c.relicsHeading}</h3>
        <p className="text-accent-silver/70 leading-relaxed">
          {renderInline(c.relicsIntro)}
        </p>

        {/* Relic card showcase */}
        <div className="flex flex-wrap justify-center gap-3 py-4">
          <div className="flex flex-col items-center gap-2">
            <RelicCard relicId="cadena_tensa" size="sm" showName={true} />
            <span className="text-[10px] text-accent-silver/40">Patron · Rara</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <RelicCard relicId="seis_dorado" size="sm" showName={true} />
            <span className="text-[10px] text-accent-silver/40">Numero · Comun</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <RelicCard relicId="dominio_total" size="sm" showName={true} />
            <span className="text-[10px] text-accent-silver/40">Fuerza · Legendaria</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <RelicCard relicId="maestro_cadenas" size="sm" showName={true} />
            <span className="text-[10px] text-accent-silver/40">Cadena · Legendaria</span>
          </div>
        </div>

        {/* Family bonuses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { label: c.familyPatron, color: "text-amber-300 bg-amber-900/30 border-amber-400/20", bonus: c.familyPatronBonus },
            { label: c.familyNumero, color: "text-blue-300 bg-blue-900/30 border-blue-400/20", bonus: c.familyNumeroBonus },
            { label: c.familyFuerza, color: "text-red-300 bg-red-900/30 border-red-400/20", bonus: c.familyFuerzaBonus },
            { label: c.familyCadena, color: "text-purple-300 bg-purple-900/30 border-purple-400/20", bonus: c.familyCadenaBonus },
            { label: c.familyAccion, color: "text-emerald-300 bg-emerald-900/30 border-emerald-400/20", bonus: c.familyAccionBonus },
          ].map((f) => (
            <div key={f.label} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${f.color}`}>
              <span className={`text-xs font-bold uppercase tracking-widest ${f.color.split(" ")[0]}`}>{f.label}</span>
              <span className="text-xs text-accent-silver/50 flex-1">{f.bonus}</span>
              <span className="text-[10px] text-accent-silver/30">x3</span>
            </div>
          ))}
        </div>
      </div>

      {/* Active mutations */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-white">{c.activeMutationsHeading}</h3>
        <p className="text-accent-silver/70 leading-relaxed">
          {renderInline(c.activeMutationsIntro)}
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { name: c.mut1Name, cost: "3 acc", desc: c.mut1Desc },
            { name: c.mut2Name, cost: "2 acc", desc: c.mut2Desc },
            { name: c.mut3Name, cost: "2 acc", desc: c.mut3Desc },
            { name: c.mut4Name, cost: "20 pts", desc: c.mut4Desc },
            { name: c.mut5Name, cost: "1 acc", desc: c.mut5Desc },
            { name: c.mut6Name, cost: "2 acc", desc: c.mut6Desc },
          ].map((mut) => (
            <div key={mut.name} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-purple-500/5 border border-purple-500/15">
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium text-purple-300">{mut.name}</span>
                <span className="text-xs text-accent-silver/50">{mut.desc}</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-purple-400/60 whitespace-nowrap">{mut.cost}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Shop */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-white">{c.shopHeading}</h3>
        <p className="text-accent-silver/70 leading-relaxed">
          {renderInline(c.shopIntro)}
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <span className="text-sm font-medium text-purple-400">{c.shopRelics}</span>
          </div>
          <div className="px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <span className="text-sm font-medium text-yellow-400">{c.shopGild}</span>
          </div>
          <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <span className="text-sm font-medium text-red-400">{c.shopRemove}</span>
          </div>
          <div className="px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
            <span className="text-sm font-medium text-green-400">{c.shopReduce}</span>
          </div>
        </div>
      </div>

      {/* Bosses */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-white">{c.bossesHeading}</h3>
        <p className="text-accent-silver/70 leading-relaxed">
          {renderInline(c.bossesIntro)}
        </p>
        
        <div className="flex flex-col gap-2">
          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 text-xs font-bold">JEFE</span>
              <span className="font-bold text-white">{c.bossExampleSingleName}</span>
            </div>
            <p className="text-sm text-accent-silver/50">
              {c.bossExampleSingleDesc}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 text-xs font-bold">MULTI-FASE</span>
              <span className="font-bold text-white">{c.bossExampleMultiName}</span>
            </div>
            <p className="text-sm text-accent-silver/50">
              {c.bossExampleMultiDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Actions system */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-white">{c.actionsHeading}</h3>
        <p className="text-accent-silver/70 leading-relaxed">
          {renderInline(c.actionsIntro)}
        </p>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-800/50 border border-surface-600/30">
            <span className="font-mono font-bold text-lg text-white">12+</span>
            <span className="text-xs text-accent-silver/50 text-center">{c.actionsBaseLabel}</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
            <span className="font-mono font-bold text-lg text-red-400">2</span>
            <span className="text-xs text-accent-silver/50 text-center">{c.actionsDiscardLabel}</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
            <span className="font-mono font-bold text-lg text-blue-400">1-2</span>
            <span className="text-xs text-accent-silver/50 text-center">{c.actionsDrawLabel}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-white">{c.modesHeading}</h3>
        <div className="flex flex-col gap-3">
          <div className="p-4 rounded-xl bg-accent-gold/5 border border-accent-gold/20">
            <span className="font-bold text-accent-gold">{c.modeNewName}</span>
            <p className="text-sm text-accent-silver/50 mt-1">{c.modeNewDesc}</p>
          </div>
          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
            <span className="font-bold text-blue-400">{c.modeDailyName}</span>
            <p className="text-sm text-accent-silver/50 mt-1">{c.modeDailyDesc}</p>
          </div>
          <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
            <span className="font-bold text-purple-400">{c.modeEndlessName}</span>
            <p className="text-sm text-accent-silver/50 mt-1">{c.modeEndlessDesc}</p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="flex flex-col gap-4 p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20">
        <h4 className="font-bold text-blue-400">{c.tipsHeading}</h4>
        <ul className="flex flex-col gap-2 text-sm text-accent-silver/70">
          {[c.tip1, c.tip2, c.tip3, c.tip4, c.tip5, c.tip6].map((tip, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">{i + 1}.</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SectionMeta() {
  const c = getHowToPlayContent().meta;
  const blocks: { title: string; body: string; color: string; border: string; tag: string }[] = [
    { title: c.consumablesTitle, tag: c.consumablesTag, body: c.consumablesBody, color: "bg-blue-500/5",   border: "border-blue-500/25" },
    { title: c.editionsTitle,    tag: c.editionsTag,    body: c.editionsBody,    color: "bg-amber-500/5",  border: "border-amber-500/25" },
    { title: c.celestialTitle,   tag: c.celestialTag,   body: c.celestialBody,   color: "bg-cyan-500/5",   border: "border-cyan-500/25" },
    { title: c.alignmentsTitle,  tag: c.alignmentsTag,  body: c.alignmentsBody,  color: "bg-purple-500/5", border: "border-purple-500/25" },
    { title: c.pactTitle,        tag: c.pactTag,        body: c.pactBody,        color: "bg-red-500/5",    border: "border-red-500/25" },
    { title: c.chaosTitle,       tag: c.chaosTag,       body: c.chaosBody,       color: "bg-violet-500/5", border: "border-violet-500/25" },
    { title: c.codexTitle,       tag: c.codexTag,       body: c.codexBody,       color: "bg-indigo-500/5", border: "border-indigo-500/25" },
    { title: c.legacyTitle,      tag: c.legacyTag,      body: c.legacyBody,      color: "bg-emerald-500/5",border: "border-emerald-500/25" },
    { title: c.charactersTitle,  tag: c.charactersTag,  body: c.charactersBody,  color: "bg-teal-500/5",   border: "border-teal-500/25" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-bold text-white">{c.title}</h3>
        <p className="text-accent-silver/70 leading-relaxed">
          {c.intro}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {blocks.map((b) => (
          <div
            key={b.title}
            className={`p-4 rounded-xl border ${b.color} ${b.border}`}
          >
            <div className="flex items-baseline justify-between gap-2 mb-2">
              <h4 className="text-sm font-bold text-white">{b.title}</h4>
              <span className="text-[9px] uppercase tracking-widest font-bold text-accent-silver/40">
                {b.tag}
              </span>
            </div>
            <p className="text-xs text-accent-silver/65 leading-relaxed">{b.body}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 pt-4 border-t border-surface-700/30">
        <h4 className="text-sm font-bold text-accent-silver/80">{c.shortcutsHeading}</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface-800/60 border border-surface-600/30">
            <span className="text-accent-silver/60">1-7</span>
            <span className="text-accent-silver/80">{c.shortcutPlay}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface-800/60 border border-surface-600/30">
            <span className="text-accent-silver/60">R</span>
            <span className="text-accent-silver/80">{c.shortcutDraw}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface-800/60 border border-surface-600/30">
            <span className="text-accent-silver/60">U</span>
            <span className="text-accent-silver/80">{c.shortcutUndo}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HowToPlayScreen({ onBack }: HowToPlayScreenProps) {
  // Subscribe to language changes so all subsections re-render on switch.
  useTranslation();
  const c = getHowToPlayContent();
  const SECTIONS = c.sections.map((s, i) => ({ ...s, icon: SECTION_ICONS[i]! }));
  const [activeSection, setActiveSection] = useState("basics");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-surface-900/95 backdrop-blur-sm border-b border-surface-600/30">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-lg text-sm text-accent-silver/60 hover:text-accent-silver border border-surface-600/30 hover:border-surface-600 transition-all"
            >
              {c.back}
            </button>
            <h1 className="font-display font-black text-xl bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
              {c.title}
            </h1>
            <div className="w-20" />
          </div>
        </div>
      </div>

      {/* Section tabs */}
      <div className="sticky top-[73px] z-10 bg-surface-900/95 backdrop-blur-sm border-b border-surface-600/30">
        <div className="max-w-3xl mx-auto px-6 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={[
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                  activeSection === section.id
                    ? "bg-accent-gold/15 text-accent-gold border border-accent-gold/30"
                    : "bg-surface-800/50 text-accent-silver/50 border border-surface-600/30 hover:text-accent-silver/70"
                ].join(" ")}
              >
                <span className="w-5 h-5 rounded-full bg-surface-700 flex items-center justify-center text-xs font-bold">
                  {section.icon}
                </span>
                {section.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-3xl mx-auto px-6 py-8 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeSection === "basics" && <SectionBasics />}
            {activeSection === "gameplay" && <SectionGameplay />}
            {activeSection === "patterns" && <SectionPatterns />}
            {activeSection === "advanced" && <SectionAdvanced />}
            {activeSection === "meta" && <SectionMeta />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer navigation */}
      <div className="sticky bottom-0 bg-surface-900/95 backdrop-blur-sm border-t border-surface-600/30">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                const idx = SECTIONS.findIndex(s => s.id === activeSection);
                if (idx > 0) setActiveSection(SECTIONS[idx - 1]!.id);
              }}
              disabled={activeSection === SECTIONS[0]!.id}
              className="px-4 py-2 rounded-lg text-sm text-accent-silver/50 hover:text-accent-silver disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              {c.prev}
            </button>
            
            <div className="flex gap-1.5">
              {SECTIONS.map((section) => (
                <div
                  key={section.id}
                  className={[
                    "w-2 h-2 rounded-full transition-all",
                    activeSection === section.id ? "bg-accent-gold" : "bg-surface-600"
                  ].join(" ")}
                />
              ))}
            </div>
            
            {activeSection === SECTIONS[SECTIONS.length - 1]!.id ? (
              <button
                onClick={onBack}
                className="px-6 py-2 rounded-lg text-sm font-bold bg-accent-gold text-surface-900 hover:brightness-110 transition"
              >
                {c.startPlay}
              </button>
            ) : (
              <button
                onClick={() => {
                  const idx = SECTIONS.findIndex(s => s.id === activeSection);
                  if (idx < SECTIONS.length - 1) setActiveSection(SECTIONS[idx + 1]!.id);
                }}
                className="px-4 py-2 rounded-lg text-sm text-accent-gold hover:bg-accent-gold/10 transition-all"
              >
                {c.next}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
