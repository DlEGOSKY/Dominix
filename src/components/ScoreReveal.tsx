import { motion } from "framer-motion";
import type { ScoreBreakdown } from "@/engine/score";
import { ALL_PATTERNS } from "@/engine/patterns";
import { getPatternIcon } from "@/engine/patternIcons";
import Tooltip, { PatternTooltipContent } from "./Tooltip";
import { localizePatternById } from "@/engine/i18nContent";
import { useTranslation, t as translate } from "@/engine/i18n";

export interface ScoreRevealExtras {
  editionFlat?: number;
  editionMultiplier?: number;
  talentFlat?: number;
  talentMultiplier?: number;
  familyFlat?: number;
  familyMultiplier?: number;
  characterBonus?: number;
}

interface RevealLine {
  label: string;
  value: string;
  color: string;
  isMult?: boolean;
  indent?: boolean;
  patternId?: string;
}

interface ScoreRevealProps {
  breakdown: ScoreBreakdown;
  finalScore: number;
  target: number;
  won: boolean;
  extras?: ScoreRevealExtras;
}

export default function ScoreReveal({ breakdown, finalScore, target, won, extras = {} }: ScoreRevealProps) {
  // Subscribe to lang changes so per-pattern labels refresh on switch.
  useTranslation();
  const lines: RevealLine[] = [];

  // --- Base ---
  lines.push({ label: translate("scoreReveal.base"), value: `+${breakdown.baseScore}`, color: "text-white" });

  if (breakdown.lengthBonus > 0) {
    lines.push({
      label: `${translate("scoreReveal.length")} (${breakdown.patternAnalysis ? "+" : ""}${breakdown.lengthBonus})`,
      value: `+${breakdown.lengthBonus}`,
      color: "text-blue-300",
    });
  }

  // --- Patrones individuales ---
  if (breakdown.patternAnalysis.patterns.length > 0) {
    for (const p of breakdown.patternAnalysis.patterns) {
      const locName = localizePatternById(p.id, p.name).name;
      if (p.bonus > 0) {
        lines.push({ label: locName, value: `+${p.bonus}`, color: "text-cyan-300", indent: true, patternId: p.id });
      }
      if (p.multiplier > 1) {
        lines.push({ label: `${locName} ×`, value: `x${p.multiplier.toFixed(2)}`, color: "text-cyan-400", indent: true, isMult: true, patternId: p.id });
      }
    }
    if (breakdown.patternAnalysis.combo) {
      lines.push({
        label: translate("scoreReveal.combo", { name: breakdown.patternAnalysis.combo.name }),
        value: `+${breakdown.patternAnalysis.combo.bonus}`,
        color: "text-violet-300",
        indent: true,
      });
    }
  }

  // --- Reliquias ---
  if (breakdown.relicBonus > 0) {
    lines.push({ label: translate("scoreReveal.relicsFlat"), value: `+${breakdown.relicBonus}`, color: "text-purple-300" });
  }
  if (breakdown.relicMultiplier > 1) {
    lines.push({ label: translate("scoreReveal.relicsMult"), value: `x${breakdown.relicMultiplier.toFixed(2)}`, color: "text-purple-400", isMult: true });
  }

  // --- Ediciones ---
  if (extras.editionFlat && extras.editionFlat > 0) {
    lines.push({ label: translate("scoreReveal.editionsFlat"), value: `+${extras.editionFlat}`, color: "text-pink-300" });
  }
  if (extras.editionMultiplier && extras.editionMultiplier > 1) {
    lines.push({ label: translate("scoreReveal.editionsMult"), value: `x${extras.editionMultiplier.toFixed(2)}`, color: "text-pink-400", isMult: true });
  }

  // --- Talents / Familia ---
  if (extras.talentFlat && extras.talentFlat > 0) {
    lines.push({ label: translate("scoreReveal.talents"), value: `+${extras.talentFlat}`, color: "text-amber-300" });
  }
  if (extras.familyFlat && extras.familyFlat > 0) {
    lines.push({ label: translate("scoreReveal.familyFlat"), value: `+${extras.familyFlat}`, color: "text-emerald-300" });
  }
  if (extras.familyMultiplier && extras.familyMultiplier > 1) {
    lines.push({ label: translate("scoreReveal.familyMult"), value: `x${extras.familyMultiplier.toFixed(2)}`, color: "text-emerald-400", isMult: true });
  }
  if (extras.characterBonus && extras.characterBonus > 0) {
    lines.push({ label: translate("scoreReveal.characterPassive"), value: `+${extras.characterBonus}`, color: "text-accent-gold" });
  }

  // --- Multiplicador total ---
  if (breakdown.multiplier > 1) {
    lines.push({ label: translate("scoreReveal.globalMult"), value: `x${breakdown.multiplier.toFixed(2)}`, color: "text-accent-gold", isMult: true });
  }

  // Adaptive stagger so a 16-line late-game breakdown doesn't hijack the
  // pacing for 2+ seconds. Reveal target stays under ~1.4s total but
  // never goes faster than 0.05s per line for short breakdowns.
  const MAX_REVEAL = 1.4;
  const STEP = lines.length > 0 ? Math.max(0.05, Math.min(0.13, MAX_REVEAL / lines.length)) : 0.13;
  const totalDelay = 0.15 + lines.length * STEP + 0.15;

  return (
    <div className="flex flex-col gap-1.5 w-full max-w-md px-4 py-3 rounded-xl bg-surface-800/60 border border-surface-600/30 backdrop-blur-sm">
      {lines.map((line, i) => {
        const patternDef = line.patternId ? ALL_PATTERNS.find((p) => p.id === line.patternId) : null;
        const Icon = line.patternId ? getPatternIcon(line.patternId) : null;
        const labelEl = (
          <span className="flex items-center gap-1.5 text-[11px] text-accent-silver/50 truncate flex-1 min-w-0 mr-2">
            {Icon && <Icon className="text-cyan-400/80 flex-shrink-0" size={12} />}
            <span className="truncate">{line.label}</span>
          </span>
        );
        return (
          <motion.div
            key={`${line.label}-${i}`}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * STEP, duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={["flex items-center justify-between", line.indent ? "pl-4 border-l border-surface-600/30" : ""].join(" ")}
          >
            {patternDef ? (
              <Tooltip
                content={(() => {
                  const loc = localizePatternById(patternDef.id, patternDef.name, patternDef.description);
                  return (
                    <PatternTooltipContent
                      name={loc.name}
                      description={loc.description}
                      bonus={patternDef.bonus}
                      multiplier={patternDef.multiplier}
                    />
                  );
                })()}
                placement="left"
                delay={150}
              >
                {labelEl}
              </Tooltip>
            ) : labelEl}
            <motion.span
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * STEP, duration: 0.2, type: "spring", stiffness: 500 }}
              className={[
                "font-mono font-bold text-sm shrink-0",
                line.isMult ? "text-base" : "",
                line.color,
              ].join(" ")}
            >
              {line.value}
            </motion.span>
          </motion.div>
        );
      })}

      {/* Divider */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: totalDelay - 0.1, duration: 0.35 }}
        className="h-px bg-gradient-to-r from-transparent via-accent-silver/20 to-transparent origin-left mt-1"
      />

      {/* Total */}
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: totalDelay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-between pt-0.5"
      >
        <span className="text-[10px] font-bold text-accent-silver/40 uppercase tracking-[0.18em]">{translate("scoreReveal.total")}</span>
        <div className="flex items-center gap-2">
          <motion.span
            initial={{ scale: 0.8 }}
            animate={{ scale: [0.8, 1.15, 1] }}
            transition={{ delay: totalDelay + 0.05, duration: 0.5, ease: "easeOut" }}
            className={[
              "font-mono font-black tabular-nums",
              won
                ? finalScore >= target * 1.5
                  ? "text-4xl text-accent-gold"
                  : "text-4xl text-green-400"
                : "text-3xl text-red-400",
            ].join(" ")}
            style={{
              textShadow: won
                ? finalScore >= target * 1.5
                  ? "0 0 32px rgba(212,168,83,0.6), 0 0 64px rgba(212,168,83,0.25)"
                  : "0 0 24px rgba(74,222,128,0.5), 0 0 6px rgba(74,222,128,0.3)"
                : "0 0 24px rgba(239,68,68,0.5), 0 0 6px rgba(239,68,68,0.3)",
            }}
          >
            {finalScore.toLocaleString()}
          </motion.span>
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-[9px] text-accent-silver/25 font-mono uppercase tracking-widest">{translate("scoreReveal.target")} {target}</span>
            {won ? (
              <span className="text-[10px] font-mono font-bold text-green-400/70">+{(finalScore - target).toLocaleString()}</span>
            ) : (
              <span className="text-[10px] font-mono font-bold text-red-400/70">-{(target - finalScore).toLocaleString()}</span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Win/lose progress bar */}
      <div className="relative w-full h-1 rounded-full bg-surface-700/60 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((finalScore / target) * 100, 100)}%` }}
          transition={{ delay: totalDelay + 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={`h-full rounded-full ${won ? "bg-green-400/60" : "bg-red-400/50"}`}
        />
      </div>
    </div>
  );
}
