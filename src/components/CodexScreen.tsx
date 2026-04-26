import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { loadCodex } from "@/engine/codex";
import { ALL_PATTERNS } from "@/engine/patterns";
import { ALL_BOSSES } from "@/engine/boss";
import { ALL_CELESTIAL, FIRMAMENT_META } from "@/engine/celestial";
import { ALL_CHAOS_TWISTS } from "@/engine/chaos";
import { localizePattern, localizeBoss } from "@/engine/i18nContent";
import { useTranslation } from "@/engine/i18n";

interface CodexScreenProps {
  onBack: () => void;
}

type Tab = "patterns" | "bosses" | "celestial" | "chaos";

const TABS: { id: Tab; label: string; description: string }[] = [
  { id: "patterns", label: "Patrones", description: "Combos descubiertos" },
  { id: "bosses", label: "Jefes", description: "Enemigos enfrentados" },
  { id: "celestial", label: "Celestes", description: "Cartas del firmamento" },
  { id: "chaos", label: "Caos", description: "Giros imprevistos" },
];

/**
 * Codex — progressive discovery log for content encountered across all runs.
 * Undiscovered entries are shown greyed out with "???" so the player sees
 * how much depth is still waiting.
 */
export default function CodexScreen({ onBack }: CodexScreenProps) {
  // Subscribe to lang changes so codex pattern names refresh on switch.
  useTranslation();
  const [tab, setTab] = useState<Tab>("patterns");
  const codex = useMemo(() => loadCodex(), []);

  const totalDiscovered =
    codex.patterns.discovered +
    codex.bosses.discovered +
    codex.celestial.discovered +
    codex.chaos.discovered;
  const totalEntries =
    codex.patterns.total + codex.bosses.total + codex.celestial.total + codex.chaos.total;

  return (
    <div className="min-h-screen bg-surface-900 text-white p-6 sm:p-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-[11px] uppercase tracking-widest text-accent-silver/50 hover:text-accent-silver/90 transition"
        >
          ← Volver
        </button>
        <div className="text-right">
          <h1 className="text-3xl font-display font-black tracking-tight">Codex</h1>
          <p className="text-[10px] uppercase tracking-widest text-accent-silver/40 mt-1">
            {totalDiscovered} / {totalEntries} descubiertos
          </p>
        </div>
      </div>

      {/* Overall progress */}
      <div className="mb-6 h-1.5 rounded-full bg-surface-700/60 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"
          initial={{ width: 0 }}
          animate={{ width: `${(totalDiscovered / Math.max(totalEntries, 1)) * 100}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {TABS.map((t) => {
          const summary = codex[t.id];
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={[
                "p-3 rounded-xl border-2 text-left transition-all",
                active
                  ? "border-accent-gold/50 bg-accent-gold/10 text-white"
                  : "border-surface-600/40 bg-surface-800/30 text-accent-silver/60 hover:border-surface-600/60",
              ].join(" ")}
            >
              <div className="text-xs font-bold uppercase tracking-wider">{t.label}</div>
              <div className="text-[9px] opacity-60 mt-0.5 leading-tight">{t.description}</div>
              <div className="text-[10px] font-mono mt-1.5 opacity-80">
                {summary.discovered}/{summary.total}
              </div>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {tab === "patterns" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {ALL_PATTERNS.map((p) => {
            const known = codex.patternIds.has(p.id);
            const loc = localizePattern(p);
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-xl border ${known ? "border-accent-gold/30 bg-accent-gold/5" : "border-surface-600/30 bg-surface-800/20"}`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className={`text-sm font-bold ${known ? "text-white" : "text-accent-silver/30"}`}>
                    {known ? loc.name : "???"}
                  </span>
                  {known && (
                    <span className="text-[10px] font-mono text-accent-gold/70 tabular-nums">
                      +{p.bonus} · x{p.multiplier}
                    </span>
                  )}
                </div>
                <p className={`text-[11px] leading-snug mt-1 ${known ? "text-accent-silver/60" : "text-accent-silver/20 italic"}`}>
                  {known ? loc.description : "Aun no descubierto"}
                </p>
              </motion.div>
            );
          })}
        </div>
      )}

      {tab === "bosses" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {ALL_BOSSES.map((b) => {
            const known = codex.bossIds.has(b.id);
            const loc = localizeBoss(b);
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-xl border ${known ? "border-red-400/40 bg-red-500/5" : "border-surface-600/30 bg-surface-800/20"}`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className={`text-sm font-bold ${known ? "text-red-200" : "text-accent-silver/30"}`}>
                    {known ? loc.name : "???"}
                  </span>
                  {known && (
                    <span className="text-[10px] font-mono text-red-300/70 tabular-nums">
                      x{b.targetMultiplier}
                    </span>
                  )}
                </div>
                <p className={`text-[11px] leading-snug mt-1 ${known ? "text-accent-silver/60" : "text-accent-silver/20 italic"}`}>
                  {known ? loc.description : "Aun no enfrentado"}
                </p>
              </motion.div>
            );
          })}
        </div>
      )}

      {tab === "celestial" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {ALL_CELESTIAL.map((c) => {
            const known = codex.celestialIds.has(c.id);
            const meta = FIRMAMENT_META[c.firmament];
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-xl border ${known ? meta.border + " " + meta.bg : "border-surface-600/30 bg-surface-800/20"}`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className={`text-sm font-bold ${known ? meta.text : "text-accent-silver/30"}`}>
                    {known ? c.name : "???"}
                  </span>
                  {known && (
                    <span className={`text-[10px] font-mono tabular-nums opacity-70 ${meta.text}`}>
                      +{Math.round(c.bonusMultiplier * 100)}%
                    </span>
                  )}
                </div>
                <p className={`text-[11px] leading-snug mt-1 ${known ? "text-accent-silver/60" : "text-accent-silver/20 italic"}`}>
                  {known ? c.description : "Aun no otorgada"}
                </p>
                {known && (
                  <span className={`inline-block mt-1 text-[8px] font-bold uppercase tracking-widest opacity-70 ${meta.text}`}>
                    {meta.label}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {tab === "chaos" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {ALL_CHAOS_TWISTS.map((t) => {
            const known = codex.chaosIds.has(t.id);
            const toneColor = t.tone === "good"
              ? "border-green-400/40 bg-green-500/5 text-green-200"
              : t.tone === "bad"
                ? "border-red-400/40 bg-red-500/5 text-red-200"
                : "border-violet-400/40 bg-violet-500/5 text-violet-200";
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-xl border ${known ? toneColor : "border-surface-600/30 bg-surface-800/20"}`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className={`text-sm font-bold ${known ? "" : "text-accent-silver/30"}`}>
                    {known ? t.name : "???"}
                  </span>
                  {known && (
                    <span className="text-[8px] uppercase font-bold tracking-widest opacity-70">
                      {t.tone === "good" ? "Buff" : t.tone === "bad" ? "Nerf" : "Raro"}
                    </span>
                  )}
                </div>
                <p className={`text-[11px] leading-snug mt-1 ${known ? "opacity-75" : "text-accent-silver/20 italic"}`}>
                  {known ? t.description : "Aun no vivido"}
                </p>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
