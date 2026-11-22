import type { ScoreExplanation } from "@/engine/scoreExplanation";
import { useTranslation } from "@/engine/i18n";
import { ALL_RELICS } from "@/engine/relics";
import { localizePatternById, localizeRelic } from "@/engine/i18nContent";
const signed = (n: number) => `${n >= 0 ? "+" : ""}${n}`;
export default function ScoreExplanationView({ explanation: e }: { explanation: ScoreExplanation }) {
  const { t } = useTranslation();
  const { breakdown: b, relicIds, tiles, patternBonusFactor } = e.sources;
  const rawMultiplier = b.patternAnalysis.totalMultiplier * b.relicMultiplier;
  const multiplier = (n: number) => Number(n.toFixed(3));
  return <div className="text-accent-silver text-xs">
    <p className="text-lg font-bold text-white font-mono mb-3">{e.before} → {e.after} <span className={e.delta < 0 ? "text-red-300" : "text-accent-gold"}>({signed(e.delta)})</span></p>
    <p className="leading-relaxed mb-4">{t("explain.note")}</p>
    <table className="w-full text-left tabular-nums"><caption className="text-left font-bold text-white mb-2">{t("explain.steps")}</caption>
      <thead><tr className="text-accent-silver"><th scope="col">{t("explain.effect")}</th><th scope="col" className="text-right">{t("explain.change")}</th><th scope="col" className="text-right">{t("explain.subtotal")}</th></tr></thead>
      <tbody>{e.steps.map((step, i)=><tr key={`${step.id}-${i}`} className="border-t border-surface-600"><th scope="row" className="py-2 pr-2 font-normal">{t(`explain.stage.${step.id}`)}</th><td className="text-right pr-3 font-mono">{signed(step.after-step.before)}</td><td className="text-right font-mono text-white">{step.after}</td></tr>)}</tbody>
    </table>
    <details className="mt-5 border-t border-surface-600 pt-2" data-score-sources>
      <summary className="min-h-11 py-3 cursor-pointer font-bold text-accent-gold">{t("explain.sources")}</summary>
      <p className="my-3 leading-relaxed">{t("explain.tiles", {n:tiles, points:b.baseScore})}</p>
      <h3 className="text-white font-bold mb-2">{t("explain.stage.patterns")}</h3>
      {b.patternAnalysis.patterns.length ? <ul className="space-y-2 mb-3">{b.patternAnalysis.patterns.map(pattern => <li key={pattern.id} className="flex justify-between gap-3"><span>{localizePatternById(pattern.id, pattern.name).name}</span><span className="font-mono whitespace-nowrap">{signed(pattern.bonus)} · ×{pattern.multiplier}</span></li>)}</ul> : <p className="mb-3">{t("explain.noPatterns")}</p>}
      {b.patternAnalysis.combo && <p className="mb-3">{t("explain.combo")} <span className="font-mono">+{b.patternAnalysis.combo.bonus} · ×{b.patternAnalysis.combo.multiplier}</span></p>}
      <p className="mb-4 leading-relaxed">{t("explain.patternFactor", {n:multiplier(patternBonusFactor)})}</p>
      <h3 className="text-white font-bold mb-2">{t("explain.equippedRelics")}</h3>
      <p className="mb-2 leading-relaxed">{ALL_RELICS.filter(relic => relicIds.includes(relic.id)).map(relic => localizeRelic(relic).name).join(" · ") || t("explain.noRelics")}</p>
      <p className="mb-4 leading-relaxed">{t("explain.relicTotals", {points:b.relicBonus, mult:multiplier(b.relicMultiplier)})}</p>
      <p className="font-mono text-white mb-2">{b.subtotal} × {multiplier(b.multiplier)} → {b.total}</p>
      {rawMultiplier > b.multiplier && <p className="mb-2 leading-relaxed">{t("explain.softCap", {raw:multiplier(rawMultiplier), effective:multiplier(b.multiplier)})}</p>}
      <p className="leading-relaxed">{t("explain.sourceNote")}</p>
    </details>
  </div>;
}
