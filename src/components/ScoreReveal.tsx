import { motion } from "framer-motion";
import { useState } from "react";
import type { ScoreBreakdown } from "@/engine/score";
import { ALL_PATTERNS } from "@/engine/patterns";
import { getPatternIcon } from "@/engine/patternIcons";
import Tooltip, { PatternTooltipContent } from "./Tooltip";
import { localizePatternById } from "@/engine/i18nContent";
import { useTranslation, t as translate } from "@/engine/i18n";
import { useReduceMotion, useSettings } from "@/hooks/useSettings";

export interface ScoreRevealExtras {
  /** Net contribution of all layers beyond the isolated chain engine. */
  runAdjustment?: number;
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
  referenceOnly?: boolean;
}

export default function ScoreReveal({ breakdown, finalScore, target, won, extras = {}, referenceOnly = false }: ScoreRevealProps) {
  // Subscribe to lang changes so per-pattern labels refresh on switch.
  useTranslation();
  const reducedMotion = useReduceMotion();
  const [settings] = useSettings();
  const [expanded, setExpanded] = useState(false);
  const targetDifference = finalScore - target;
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

  if (extras.runAdjustment) {
    lines.push({
      label: translate("scoreReveal.runEffects"),
      value: `${extras.runAdjustment > 0 ? "+" : ""}${extras.runAdjustment}`,
      color: "text-amber-200",
    });
  }

  return (
    <div data-score-reveal className="flex flex-col gap-3 w-full max-w-md px-4 py-3 rounded-xl bg-surface-800/80 border border-surface-600/30">
      <div className="flex items-center justify-between gap-3" data-score-reveal-total>
        <span className="text-[10px] font-bold text-accent-silver/80 uppercase tracking-widest">{translate("scoreReveal.total")}</span>
        <div className="text-right min-w-0">
          <span className={`block font-mono font-black tabular-nums text-4xl break-all ${won ? "text-green-300" : "text-red-300"}`}>{finalScore.toLocaleString()}</span>
          <span className="text-[11px] font-mono text-accent-silver">{translate(referenceOnly ? "scoreReveal.reference" : "scoreReveal.target")} {target.toLocaleString()} · {targetDifference>=0?"+":""}{targetDifference.toLocaleString()}</span>
        </div>
      </div>
      {referenceOnly && <p className="text-xs text-accent-silver">{translate("score.endlessRule")}</p>}
      <div className="h-1 rounded-full bg-surface-700/60 overflow-hidden">
        <motion.div initial={reducedMotion ? false : {scaleX:0}} animate={{scaleX:Math.max(0,Math.min(finalScore/Math.max(1,target),1))}}
          transition={{duration:reducedMotion?0:settings.fastAnimations ? 0.12 : 0.24}}
          className={`h-full w-full origin-left ${won ? "bg-green-400/60" : "bg-red-400/50"}`}/>
      </div>
      <details data-score-breakdown onToggle={event => setExpanded(event.currentTarget.open)} className="border-t border-surface-600/40 pt-1">
        <summary className="cursor-pointer min-h-11 py-3 text-xs font-bold text-accent-gold">{translate("scoreReveal.details")}</summary>
        {expanded && <div className="flex flex-col gap-2 pb-2">
          {lines.map((line,i)=>{
            const patternDef=line.patternId?ALL_PATTERNS.find(p=>p.id===line.patternId):null;
            const Icon=line.patternId?getPatternIcon(line.patternId):null;
            const label=<span className="flex items-center gap-1.5 text-[11px] text-accent-silver/90 min-w-0">{Icon&&<Icon size={12} className="text-cyan-300 shrink-0"/>}<span>{line.label}</span></span>;
            return <div key={`${line.label}-${i}`} className={`flex items-start justify-between gap-3 ${line.indent?"pl-3 border-l border-surface-600/40":""}`}>
              {patternDef?<Tooltip content={<PatternTooltipContent {...localizePatternById(patternDef.id,patternDef.name,patternDef.description)} bonus={patternDef.bonus} multiplier={patternDef.multiplier}/>} placement="left" delay={150}>{label}</Tooltip>:label}
              <span className={`font-mono font-bold text-xs shrink-0 ${line.color}`}>{line.value}</span>
            </div>;
          })}
        </div>}
      </details>
    </div>
  );
}
