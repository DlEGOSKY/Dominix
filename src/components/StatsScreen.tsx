import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { getAggregateStats, getRecentRuns, type RunRecord } from "@/engine/runHistory";
import { ALL_RELICS } from "@/engine/relics";
import { getRelicIcon } from "@/engine/relicIcons";
import Tooltip from "./Tooltip";
import { localizeRelic } from "@/engine/i18nContent";
import { useTranslation, t as translate } from "@/engine/i18n";

interface StatsScreenProps {
  onBack: () => void;
}

type Tab = "overview" | "history" | "records" | "graphs";

function StatCard({ label, value, color = "text-white", delay = 0 }: { label: string; value: string | number; color?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex flex-col gap-1.5 p-4 rounded-xl bg-surface-800/80 border border-surface-600/40"
    >
      <span className={`font-mono font-bold text-2xl tabular-nums ${color}`}>{value}</span>
      <span className="text-[10px] font-bold text-accent-silver/40 uppercase tracking-wider">{label}</span>
    </motion.div>
  );
}

function OverviewTab() {
  // Subscribe to lang changes so favorite relic names update on switch.
  const { t } = useTranslation();
  const stats = getAggregateStats();

  if (stats.totalRuns === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <span className="text-accent-silver/40 text-sm">{t("stats.empty.noStats")}</span>
        <span className="text-accent-silver/30 text-xs">{t("stats.empty.noStatsHint")}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Main stats */}
      <div>
        <h3 className="text-xs font-bold text-accent-silver/40 uppercase tracking-widest mb-4">{t("stats.section.global")}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label={t("stats.label.runs")} value={stats.totalRuns} color="text-white" delay={0.05} />
          <StatCard label={t("stats.label.totalScore")} value={stats.totalScore.toLocaleString()} color="text-accent-gold" delay={0.1} />
          <StatCard label={t("stats.label.totalTiles")} value={stats.totalTilesPlayed} color="text-white" delay={0.15} />
          <StatCard label={t("stats.label.totalPatterns")} value={stats.totalPatternsActivated} color="text-blue-400" delay={0.2} />
        </div>
      </div>

      {/* Records */}
      <div>
        <h3 className="text-xs font-bold text-accent-silver/40 uppercase tracking-widest mb-4">{t("stats.section.records")}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label={t("stats.label.bestRound")} value={stats.bestRound} color="text-green-400" delay={0.25} />
          <StatCard label={t("stats.label.bestScore")} value={stats.bestScore.toLocaleString()} color="text-accent-gold" delay={0.3} />
          <StatCard label={t("stats.label.bestCombo")} value={`x${stats.bestCombo}` } color="text-purple-400" delay={0.35} />
          <StatCard label={t("stats.label.bestSingle")} value={stats.bestSingleRoundScore} color="text-yellow-400" delay={0.4} />
        </div>
      </div>

      {/* Averages & streaks */}
      <div>
        <h3 className="text-xs font-bold text-accent-silver/40 uppercase tracking-widest mb-4">{t("stats.section.averages")}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label={t("stats.label.avgRounds")} value={stats.avgRounds} color="text-white" delay={0.45} />
          <StatCard label={t("stats.label.avgScore")} value={stats.avgScore.toLocaleString()} color="text-white" delay={0.5} />
          <StatCard label={t("stats.label.curStreak")} value={stats.currentWinStreak} color="text-green-400" delay={0.55} />
          <StatCard label={t("stats.label.bestStreak")} value={stats.longestWinStreak} color="text-accent-gold" delay={0.6} />
        </div>
      </div>

      {/* Economy & bosses */}
      <div>
        <h3 className="text-xs font-bold text-accent-silver/40 uppercase tracking-widest mb-4">{t("stats.section.economy")}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label={t("stats.label.totalGold")} value={stats.totalGoldEarned} color="text-accent-gold" delay={0.65} />
          <StatCard label={t("stats.label.shopPurchases")} value={stats.totalShopPurchases} color="text-yellow-400" delay={0.7} />
          <StatCard label={t("stats.label.bossesDefeated")} value={stats.totalBossesDefeated} color="text-red-400" delay={0.75} />
          <StatCard label={t("stats.label.totalRelics")} value={stats.totalRelicsCollected} color="text-purple-400" delay={0.8} />
        </div>
      </div>

      {/* Favorite relics */}
      {stats.favoriteRelics.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-accent-silver/40 uppercase tracking-widest mb-4">{t("stats.section.favoriteRelics")}</h3>
          <div className="flex flex-wrap gap-2">
            {stats.favoriteRelics.map((fav, i) => {
              const relic = ALL_RELICS.find((r) => r.id === fav.id);
              if (!relic) return null;
              const loc = localizeRelic(relic);
              return (
                <motion.div
                  key={fav.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.85 + i * 0.05 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-gold/10 border border-accent-gold/15"
                >
                  <span className="text-sm font-medium text-accent-gold">{loc.name}</span>
                  <span className="text-xs text-accent-silver/40 font-mono">{fav.count}x</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryTab() {
  // Subscribe to lang changes so per-run relic chip names refresh.
  const { t } = useTranslation();
  const runs = getRecentRuns(30);
  // Identify the best run by total score so we can highlight it
  const bestRunId = useMemo(() => {
    if (runs.length === 0) return null;
    return runs.reduce((best, r) => (r.totalScore > best.totalScore ? r : best), runs[0]!).id;
  }, [runs]);

  if (runs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <span className="text-accent-silver/40 text-sm">{t("stats.empty.noHistory")}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {runs.map((run, i) => (
        <RunRow key={run.id} run={run} index={i} isBest={run.id === bestRunId} />
      ))}
    </div>
  );
}

function shareRun(run: RunRecord): { ok: boolean; text: string } {
  const summary = `Dominix · R${run.rounds} · ${run.totalScore.toLocaleString()} pts · ${run.patternsActivated} patrones · ${run.relicsCollected} reliquias${run.modifier ? ` · ${run.modifier}` : ""}${run.isDaily ? " · Daily" : ""} · ${run.date}`;
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(summary);
    }
    return { ok: true, text: summary };
  } catch {
    return { ok: false, text: summary };
  }
}

function RunRow({ run, index, isBest }: { run: RunRecord; index: number; isBest: boolean }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [shared, setShared] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className={[
          "w-full text-left p-4 rounded-xl border transition-all",
          isBest
            ? "bg-gradient-to-r from-amber-500/12 to-amber-700/8 border-amber-400/40 hover:border-amber-400/60"
            : "bg-surface-800/60 border-surface-600/30 hover:border-surface-600/50",
        ].join(" ")}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={["font-mono font-bold text-lg tabular-nums", isBest ? "text-amber-300" : "text-white"].join(" ")}>{run.rounds}</span>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs text-accent-silver/40">{run.date}</span>
                {isBest && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-400/30">Best</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-accent-gold">{run.totalScore.toLocaleString()} pts</span>
                {run.isDaily && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-400">D</span>
                )}
                {run.modifier && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-500/20 text-green-400">{run.modifier}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-accent-silver/40">
            <span>{run.patternsActivated}p</span>
            <span>{run.relicsCollected}r</span>
            <span className="text-accent-silver/30">{expanded ? "▲" : "▼"}</span>
          </div>
        </div>
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-1 p-4 rounded-xl bg-surface-800/40 border border-surface-600/20"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="flex flex-col gap-1">
              <span className="font-mono font-bold text-sm text-white">{run.tilesPlayed}</span>
              <span className="text-[10px] text-accent-silver/40">{t("stats.run.tiles")}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono font-bold text-sm text-blue-400">{run.patternsActivated}</span>
              <span className="text-[10px] text-accent-silver/40">{t("stats.run.patterns")}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono font-bold text-sm text-accent-gold">{run.goldEarned}</span>
              <span className="text-[10px] text-accent-silver/40">{t("gameover.stat.gold")}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono font-bold text-sm text-red-400">{run.bossesDefeated}</span>
              <span className="text-[10px] text-accent-silver/40">{t("gameover.stat.bosses")}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono font-bold text-sm text-purple-400">x{run.bestCombo}</span>
              <span className="text-[10px] text-accent-silver/40">{t("stats.label.bestCombo")}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono font-bold text-sm text-yellow-400">{run.highestRoundScore}</span>
              <span className="text-[10px] text-accent-silver/40">{t("stats.label.bestRound")}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono font-bold text-sm text-green-400">{run.shopPurchases}</span>
              <span className="text-[10px] text-accent-silver/40">{t("gameover.stat.purchases")}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono font-bold text-sm text-accent-silver/60">{run.relicIds.length}</span>
              <span className="text-[10px] text-accent-silver/40">{t("reward.badge.relic")}</span>
            </div>
          </div>

          {run.relicIds.length > 0 && (
            <div className="mt-3 pt-3 border-t border-surface-600/20">
              <span className="text-[10px] uppercase tracking-widest text-accent-silver/40 font-bold">Build</span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {run.relicIds.map((id) => {
                  const relic = ALL_RELICS.find((r) => r.id === id);
                  if (!relic) return null;
                  const Icon = getRelicIcon(id);
                  const loc = localizeRelic(relic);
                  return (
                    <Tooltip
                      key={id}
                      content={
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-white text-xs">{loc.name}</span>
                          <span className="text-[10px] text-accent-silver/70">{loc.description}</span>
                        </div>
                      }
                      placement="top"
                      delay={120}
                    >
                      <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-surface-700/60 text-[10px] text-accent-silver/65 font-medium hover:bg-surface-700 transition-colors">
                        {Icon && <Icon size={11} className="text-accent-gold/80" />}
                        {loc.name}
                      </span>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-surface-600/20 flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const result = shareRun(run);
                setShared(result.ok);
                setTimeout(() => setShared(false), 1500);
              }}
              className="px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-surface-700/60 hover:bg-surface-700 text-accent-silver/70 hover:text-white transition-colors"
            >
              {shared ? t("stats.run.copied") : t("stats.run.share")}
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function RecordsTab() {
  const stats = getAggregateStats();
  const runs = getRecentRuns(100);

  if (runs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <span className="text-accent-silver/40 text-sm">{translate("stats.empty.noRecords")}</span>
      </div>
    );
  }

  // Find record runs
  const bestRoundRun = runs.reduce((best, r) => r.rounds > best.rounds ? r : best, runs[0]!);
  const bestScoreRun = runs.reduce((best, r) => r.totalScore > best.totalScore ? r : best, runs[0]!);
  const mostPatternsRun = runs.reduce((best, r) => r.patternsActivated > best.patternsActivated ? r : best, runs[0]!);
  const mostRelicsRun = runs.reduce((best, r) => r.relicsCollected > best.relicsCollected ? r : best, runs[0]!);
  const mostBossesRun = runs.reduce((best, r) => r.bossesDefeated > best.bossesDefeated ? r : best, runs[0]!);

  const records = [
    { title: translate("stats.records.longestRun"), value: translate("stats.unitRounds", { n: bestRoundRun.rounds }), date: bestRoundRun.date, color: "text-green-400" },
    { title: translate("stats.records.highestScore"), value: translate("stats.unitPts", { n: bestScoreRun.totalScore.toLocaleString() }), date: bestScoreRun.date, color: "text-accent-gold" },
    { title: translate("stats.records.mostPatterns"), value: translate("stats.unitPatterns", { n: mostPatternsRun.patternsActivated }), date: mostPatternsRun.date, color: "text-blue-400" },
    { title: translate("stats.records.mostRelics"), value: translate("stats.unitRelics", { n: mostRelicsRun.relicsCollected }), date: mostRelicsRun.date, color: "text-purple-400" },
    { title: translate("stats.records.mostBosses"), value: translate("stats.unitBosses", { n: mostBossesRun.bossesDefeated }), date: mostBossesRun.date, color: "text-red-400" },
    { title: translate("stats.records.bestCombo"), value: `x${stats.bestCombo}`, date: "", color: "text-yellow-400" },
    { title: translate("stats.records.bestSingle"), value: translate("stats.unitPts", { n: stats.bestSingleRoundScore }), date: "", color: "text-white" },
  ];

  return (
    <div className="flex flex-col gap-3">
      {records.map((record, i) => (
        <motion.div
          key={record.title}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center justify-between p-4 rounded-xl bg-surface-800/60 border border-surface-600/30"
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-accent-silver/70">{record.title}</span>
            {record.date && <span className="text-[10px] text-accent-silver/30">{record.date}</span>}
          </div>
          <span className={`font-mono font-bold text-lg ${record.color}`}>{record.value}</span>
        </motion.div>
      ))}
    </div>
  );
}

function GraphsTab() {
  const { t } = useTranslation();
  const runs = getRecentRuns(30);

  if (runs.length < 2) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <span className="text-accent-silver/40 text-sm">{t("stats.empty.needRuns")}</span>
      </div>
    );
  }

  const reversed = [...runs].reverse();
  const maxScore = Math.max(...reversed.map((r) => r.totalScore), 1);
  const maxRound = Math.max(...reversed.map((r) => r.rounds), 1);

  return (
    <div className="flex flex-col gap-8">
      {/* Score per run */}
      <div>
        <h3 className="text-xs font-bold text-accent-silver/40 uppercase tracking-widest mb-4">{t("stats.section.scorePerRun", { n: reversed.length })}</h3>
        <div className="flex items-end gap-1 h-40 p-3 rounded-xl bg-surface-800/50 border border-surface-600/30">
          {reversed.map((run, i) => {
            const height = Math.max(4, (run.totalScore / maxScore) * 100);
            return (
              <motion.div
                key={run.id}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: i * 0.03, duration: 0.4 }}
                className="flex-1 min-w-[6px] rounded-t bg-gradient-to-t from-accent-gold/60 to-accent-gold/90 relative group"
                title={`${run.totalScore.toLocaleString()} pts - R${run.rounds}`}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <span className="text-[8px] font-mono text-accent-gold whitespace-nowrap">{run.totalScore}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="flex justify-between mt-1 px-3">
          <span className="text-[9px] text-accent-silver/20">{t("stats.oldest")}</span>
          <span className="text-[9px] text-accent-silver/20">{t("stats.newest")}</span>
        </div>
      </div>

      {/* Rounds per run */}
      <div>
        <h3 className="text-xs font-bold text-accent-silver/40 uppercase tracking-widest mb-4">{t("stats.section.roundsPerRun")}</h3>
        <div className="flex items-end gap-1 h-32 p-3 rounded-xl bg-surface-800/50 border border-surface-600/30">
          {reversed.map((run, i) => {
            const height = Math.max(4, (run.rounds / maxRound) * 100);
            return (
              <motion.div
                key={run.id}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: i * 0.03, duration: 0.4 }}
                className="flex-1 min-w-[6px] rounded-t bg-gradient-to-t from-green-500/50 to-green-400/80 relative group"
                title={`R${run.rounds}`}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <span className="text-[8px] font-mono text-green-400 whitespace-nowrap">R{run.rounds}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Trend summary */}
      <div className="grid grid-cols-3 gap-3">
        {(() => {
          const recent5 = reversed.slice(-5);
          const older5 = reversed.slice(Math.max(0, reversed.length - 10), Math.max(0, reversed.length - 5));
          const recentAvg = recent5.length > 0 ? Math.round(recent5.reduce((s, r) => s + r.totalScore, 0) / recent5.length) : 0;
          const olderAvg = older5.length > 0 ? Math.round(older5.reduce((s, r) => s + r.totalScore, 0) / older5.length) : 0;
          const trend = older5.length > 0 ? recentAvg - olderAvg : 0;
          return (
            <>
              <StatCard label={t("stats.trend.recentAvg")} value={recentAvg.toLocaleString()} color="text-accent-gold" delay={0.3} />
              <StatCard label={t("stats.trend.olderAvg")} value={olderAvg.toLocaleString()} color="text-accent-silver/70" delay={0.35} />
              <StatCard
                label={t("stats.trend.label")}
                value={trend >= 0 ? `+${trend.toLocaleString()}` : trend.toLocaleString()}
                color={trend >= 0 ? "text-green-400" : "text-red-400"}
                delay={0.4}
              />
            </>
          );
        })()}
      </div>
    </div>
  );
}

export default function StatsScreen({ onBack }: StatsScreenProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("overview");

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: t("stats.tab.overview") },
    { id: "history", label: t("stats.tab.history") },
    { id: "records", label: t("stats.tab.records") },
    { id: "graphs", label: t("stats.tab.graphs") },
  ];

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
              {t("btn.back")}
            </button>
            <h1 className="font-display font-black text-xl bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
              {t("stats.title")}
            </h1>
            <div className="w-20" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-[73px] z-10 bg-surface-900/95 backdrop-blur-sm border-b border-surface-600/30">
        <div className="max-w-3xl mx-auto px-6 py-3">
          <div className="flex gap-2">
            {tabs.map((tabItem) => (
              <button
                key={tabItem.id}
                onClick={() => setTab(tabItem.id)}
                className={[
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                  tab === tabItem.id
                    ? "bg-accent-gold/15 text-accent-gold border border-accent-gold/30"
                    : "bg-surface-800/50 text-accent-silver/50 border border-surface-600/30 hover:text-accent-silver/70"
                ].join(" ")}
              >
                {tabItem.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-3xl mx-auto px-6 py-8 w-full">
        {tab === "overview" && <OverviewTab />}
        {tab === "history" && <HistoryTab />}
        {tab === "records" && <RecordsTab />}
        {tab === "graphs" && <GraphsTab />}
      </div>
    </div>
  );
}
