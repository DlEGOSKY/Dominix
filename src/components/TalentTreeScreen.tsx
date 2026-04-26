import { motion } from "framer-motion";
import { useState } from "react";
import {
  ALL_TALENTS,
  loadTalents,
  buyTalent,
  canBuyTalent,
  getAvailablePoints,
  getBranchPoints,
  getTotalTalentPoints,
  resetTalents,
} from "@/engine/talents";
import type { Talent, TalentBranch, TalentState } from "@/engine/talents";
import { useTranslation, t as translate } from "@/engine/i18n";

interface TalentTreeScreenProps {
  onBack: () => void;
}

const BRANCH_DEFS: { id: TalentBranch; nameKey: string; descKey: string; color: string; icon: string }[] = [
  { id: "score",   nameKey: "talents.branch.score",   descKey: "talents.branchScore.desc",   color: "gold",   icon: "⬢" },
  { id: "chain",   nameKey: "talents.branch.chain",   descKey: "talents.branchChain.desc",   color: "blue",   icon: "◆" },
  { id: "tiles",   nameKey: "talents.branch.tiles",   descKey: "talents.branchTiles.desc",   color: "purple", icon: "✦" },
  { id: "economy", nameKey: "talents.branch.economy", descKey: "talents.branchEconomy.desc", color: "green",  icon: "◉" },
];

export default function TalentTreeScreen({ onBack }: TalentTreeScreenProps) {
  const { t } = useTranslation();
  const [state, setState] = useState<TalentState>(loadTalents);
  const [hoveredTalent, setHoveredTalent] = useState<Talent | null>(null);
  const total = getTotalTalentPoints();
  const available = getAvailablePoints(state);

  function handleBuy(talent: Talent) {
    const next = buyTalent(talent.id);
    if (next) setState(next);
  }

  function handleReset() {
    if (!confirm(translate("talents.confirmResetMsg"))) return;
    const next = resetTalents();
    setState(next);
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 pt-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-6">
        <button onClick={onBack} className="text-accent-silver/60 hover:text-white text-sm">
          ← {t("btn.back")}
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-bold text-white">{t("talents.tree.title")}</h1>
          <p className="text-xs text-accent-silver/50 mt-1">{t("talents.tree.subtitle")}</p>
        </div>
        <button
          onClick={handleReset}
          className="text-xs text-red-400/70 hover:text-red-400 transition-colors"
        >
          {t("talents.resetAction")}
        </button>
      </div>

      {/* Points bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-6 px-6 py-3 rounded-2xl bg-surface-800/60 border border-surface-600/30 mb-6"
      >
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-widest text-accent-silver/40 font-bold">{t("talents.available")}</span>
          <span className="text-3xl font-mono font-black text-accent-gold tabular-nums">{available}</span>
        </div>
        <div className="w-px h-10 bg-surface-600/30" />
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-widest text-accent-silver/40 font-bold">{t("talents.totalPts")}</span>
          <span className="text-lg font-mono font-bold text-accent-silver/70 tabular-nums">{total}</span>
        </div>
        <div className="w-px h-10 bg-surface-600/30" />
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-widest text-accent-silver/40 font-bold">{t("talents.spent")}</span>
          <span className="text-lg font-mono font-bold text-accent-silver/70 tabular-nums">{state.spent}</span>
        </div>
      </motion.div>

      {/* Branches */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
        {BRANCH_DEFS.map((branch) => {
          const branchTalents = ALL_TALENTS.filter((tal) => tal.branch === branch.id).sort((a, b) => a.tier - b.tier);
          const branchPoints = getBranchPoints(branch.id, state);
          return (
            <div
              key={branch.id}
              className={`flex flex-col gap-3 p-4 rounded-2xl bg-surface-800/40 border-2 ${borderColor(branch.color)}`}
            >
              {/* Branch header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-2xl ${textColor(branch.color)}`}>{branch.icon}</span>
                  <div className="flex flex-col">
                    <h3 className="text-base font-bold text-white">{t(branch.nameKey)}</h3>
                    <p className="text-[10px] text-accent-silver/40">{t(branch.descKey)}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] uppercase tracking-widest text-accent-silver/30 font-bold">{t("talents.branch.label")}</span>
                  <span className={`text-sm font-mono font-bold ${textColor(branch.color)}`}>{branchPoints}</span>
                </div>
              </div>

              {/* Talents */}
              <div className="flex flex-col gap-2">
                {branchTalents.map((talent) => {
                  const rank = state.ranks[talent.id] ?? 0;
                  const buyable = canBuyTalent(talent, state);
                  const maxed = rank >= talent.maxRank;
                  const locked = talent.requiresBranchPoints !== undefined && branchPoints < talent.requiresBranchPoints;
                  return (
                    <motion.button
                      key={talent.id}
                      disabled={!buyable}
                      whileHover={buyable ? { x: 2 } : undefined}
                      onMouseEnter={() => setHoveredTalent(talent)}
                      onMouseLeave={() => setHoveredTalent(null)}
                      onClick={() => handleBuy(talent)}
                      className={[
                        "flex flex-col gap-1 p-3 rounded-xl text-left transition-all",
                        "border",
                        maxed
                          ? `bg-surface-700/40 border-accent-gold/40`
                          : buyable
                            ? `bg-surface-700/30 border-surface-600/40 hover:${bgColor(branch.color)} hover:${borderColor(branch.color)} cursor-pointer`
                            : locked
                              ? "bg-surface-900/30 border-surface-700/30 opacity-40 cursor-not-allowed"
                              : "bg-surface-800/30 border-surface-600/20 opacity-60 cursor-not-allowed",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-white">{talent.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-accent-silver/40 font-mono">{rank}/{talent.maxRank}</span>
                          {!maxed && (
                            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${textColor(branch.color)} ${bgColor(branch.color)}`}>
                              {talent.costPerRank}p
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-accent-silver/60 leading-snug">{talent.description}</p>
                      {/* Rank pips */}
                      <div className="flex gap-1 mt-1">
                        {Array.from({ length: talent.maxRank }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full ${
                              i < rank ? `${bgColorSolid(branch.color)}` : "bg-surface-600/30"
                            }`}
                          />
                        ))}
                      </div>
                      {locked && (
                        <p className="text-[9px] text-red-400/60 mt-1">{t("talents.requires", { n: talent.requiresBranchPoints ?? 0 })}</p>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hover preview (hidden if nothing hovered) */}
      {hoveredTalent && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-surface-900/90 border border-surface-600/40 backdrop-blur-sm text-xs text-accent-silver/80 pointer-events-none"
        >
          <span className="font-bold text-white">{hoveredTalent.name}</span>
          <span className="text-accent-silver/40 ml-2">· {t("talents.tier", { n: hoveredTalent.tier })}</span>
        </motion.div>
      )}
    </div>
  );
}

function textColor(color: string): string {
  switch (color) {
    case "gold": return "text-accent-gold";
    case "blue": return "text-blue-300";
    case "purple": return "text-purple-300";
    case "green": return "text-green-300";
    default: return "text-white";
  }
}

function bgColor(color: string): string {
  switch (color) {
    case "gold": return "bg-accent-gold/10";
    case "blue": return "bg-blue-500/10";
    case "purple": return "bg-purple-500/10";
    case "green": return "bg-green-500/10";
    default: return "bg-surface-700/20";
  }
}

function bgColorSolid(color: string): string {
  switch (color) {
    case "gold": return "bg-accent-gold";
    case "blue": return "bg-blue-400";
    case "purple": return "bg-purple-400";
    case "green": return "bg-green-400";
    default: return "bg-white";
  }
}

function borderColor(color: string): string {
  switch (color) {
    case "gold": return "border-accent-gold/30";
    case "blue": return "border-blue-400/30";
    case "purple": return "border-purple-400/30";
    case "green": return "border-green-400/30";
    default: return "border-surface-600/30";
  }
}
