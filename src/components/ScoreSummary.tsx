import type { ScoreBreakdown } from "@/engine/score";
import { useTranslation } from "@/engine/i18n";

/** Only the existing chain breakdown; run effects remain in the authoritative total. */
export default function ScoreSummary({ breakdown: b, patternBonus = 1, scoreMultiplier = 1 }: {
  breakdown: ScoreBreakdown; patternBonus?: number; scoreMultiplier?: number;
}) {
  const { t } = useTranslation();
  return <div role="group" aria-label={t("score.summaryHint")} title={t("score.summaryHint")}
    className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-1.5 rounded-lg text-[11px] font-mono tabular-nums">
    <span className="text-accent-silver/85">{t("score.summary")}:</span>
    <span className="text-accent-silver">{t("score.base")} {b.baseScore}</span>
    {b.lengthBonus > 0 && <span className="text-blue-300">+ {t("score.length")} {b.lengthBonus}</span>}
    {b.patternAnalysis.totalBonus > 0 && <span className="text-cyan-300">+ {t("score.patterns")} {Math.floor(b.patternAnalysis.totalBonus * patternBonus)}</span>}
    {b.relicBonus > 0 && <span className="text-purple-300">+ {t("score.relics")} {b.relicBonus}</span>}
    {b.multiplier > 1 && <span className="text-accent-gold">×{b.multiplier.toFixed(2)}</span>}
    {scoreMultiplier !== 1 && <span className="text-green-300">×{scoreMultiplier}</span>}
  </div>;
}
