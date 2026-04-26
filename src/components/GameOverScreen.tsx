import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import type { RunStats } from "@/types/domino";
import { ALL_RELICS } from "@/engine/relics";
import { ALL_PATTERNS } from "@/engine/patterns";
import { calculateRunXP, loadProgression, getXPForNextLevel } from "@/engine/progression";
import { getActForRound } from "@/engine/acts";
import { getLevelRewardText, getMasteryProgress, MAX_MASTERY_LEVEL } from "@/engine/characterMastery";
import type { CharacterChallenge } from "@/engine/characterChallenges";
import { getCharacter, type CharacterId } from "@/engine/characters";
import { ALL_TILE_SKINS } from "@/engine/tileSkins";
import TileView, { type TileSkin } from "./TileView";
import RecapHighlights from "./RecapHighlights";
import SkinUnlockedOverlay from "./SkinUnlockedOverlay";
import VictoryOverlay from "./VictoryOverlay";

/**
 * Short poetic epilogue depending on how far the run went — gives the run
 * a feeling of having a "verdict" beyond raw numbers.
 */
function epilogueFor(finalRound: number, totalScore: number): string {
  if (finalRound <= 2) return "La ceremonia apenas habia comenzado.";
  if (finalRound <= 5) return "El umbral se cerro antes de tiempo.";
  if (finalRound <= 9) return "Caminaste la travesia. El dominio te probo.";
  if (finalRound <= 10) return "Sostuviste el ritual hasta que el peso te alcanzo.";
  if (finalRound <= 15) return "Llegaste a la culminacion. El eco recuerda tu nombre.";
  if (totalScore >= 10000) return "Atravesaste el eco. Ya no juegas, eres el juego.";
  return "Mas alla del dominio, solo queda lo que tu cadena dejo atras.";
}

interface GameOverScreenProps {
  stats: RunStats;
  relicIds: string[];
  finalRound: number;
  onRestart: () => void;
  onHome: () => void;
  isNewBest: boolean;
  /** Skin ids that were freshly unlocked by the level-ups this run produced. */
  unlockedSkins?: string[];
  mastery?: {
    characterId: CharacterId;
    xpGained: number;
    previousLevel: number;
    newLevel: number;
    leveledUp: boolean;
    challengesCompleted: CharacterChallenge[];
  };
}

function RoundScoreChart({ scores }: { scores: number[] }) {
  const W = 400;
  const H = 80;
  const PAD_X = 8;
  const PAD_Y = 8;
  const maxScore = Math.max(...scores, 1);
  const avg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
  const bestIdx = scores.indexOf(Math.max(...scores));
  const barW = Math.max(4, Math.floor((W - PAD_X * 2) / scores.length) - 3);
  const barSpacing = (W - PAD_X * 2) / scores.length;
  const avgY = PAD_Y + (1 - avg / maxScore) * (H - PAD_Y * 2);

  return (
    <div className="w-full overflow-x-auto">
      <svg width="100%" viewBox={`0 0 ${W} ${H + 18}`} className="overflow-visible">
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((frac) => {
          const y = PAD_Y + (1 - frac) * (H - PAD_Y * 2);
          return (
            <line key={frac} x1={PAD_X} y1={y} x2={W - PAD_X} y2={y}
              stroke="rgba(168,178,193,0.07)" strokeWidth="1" />
          );
        })}

        {/* Avg line */}
        <line x1={PAD_X} y1={avgY} x2={W - PAD_X} y2={avgY}
          stroke="rgba(212,168,83,0.35)" strokeWidth="1" strokeDasharray="4 3" />
        <text x={W - PAD_X - 2} y={avgY - 3} fill="rgba(212,168,83,0.5)"
          fontSize="7" textAnchor="end" fontFamily="monospace">avg {avg}</text>

        {/* Bars */}
        {scores.map((score, i) => {
          const x = PAD_X + i * barSpacing + (barSpacing - barW) / 2;
          const barH = Math.max(2, ((score / maxScore) * (H - PAD_Y * 2)));
          const y = H - PAD_Y - barH;
          const isBest = i === bestIdx;
          return (
            <g key={i}>
              <motion.rect
                x={x} y={H - PAD_Y} width={barW} height={0}
                rx={2}
                fill={isBest ? "rgba(74,222,128,0.7)" : "rgba(168,178,193,0.25)"}
                animate={{ y, height: barH }}
                transition={{ delay: 0.55 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
              {isBest && (
                <motion.rect
                  x={x} y={H - PAD_Y} width={barW} height={0}
                  rx={2}
                  fill="rgba(74,222,128,0.15)"
                  style={{ filter: "blur(4px)" }}
                  animate={{ y, height: barH }}
                  transition={{ delay: 0.55 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
              {/* Round label */}
              <text x={x + barW / 2} y={H + 10} fill="rgba(168,178,193,0.3)"
                fontSize="7" textAnchor="middle" fontFamily="monospace">
                {i + 1}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * Highlight card listing every skin freshly unlocked by this run's level-ups.
 * Shows a small TileView preview + name. Hidden if nothing was unlocked.
 */
function UnlockedSkinsCard({ skinIds }: { skinIds: string[] }) {
  if (!skinIds || skinIds.length === 0) return null;
  const skins = skinIds
    .map((id) => ALL_TILE_SKINS.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
  if (skins.length === 0) return null;

  const previewTile = { id: "unlock-preview", top: 3, bottom: 5 };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.6, type: "spring", stiffness: 280, damping: 22 }}
      className="w-full max-w-lg px-4 py-4 rounded-xl bg-gradient-to-b from-accent-gold/10 to-accent-gold/5 border border-accent-gold/30"
    >
      <p className="text-[10px] font-bold text-accent-gold/70 uppercase tracking-widest mb-3">
        {skins.length === 1 ? "Skin desbloqueada" : "Skins desbloqueadas"}
      </p>
      <div className="flex flex-wrap items-center gap-4">
        {skins.map((skin) => (
          <div key={skin.id} className="flex items-center gap-2.5">
            <TileView tile={previewTile} disabled skin={skin.id as TileSkin} size="sm" animate={false} />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white leading-tight">{skin.name}</span>
              <span className="text-[10px] italic text-accent-silver/55 leading-tight max-w-[180px]">{skin.flavor}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/**
 * Compact horizontal list of every pattern that triggered during the run,
 * with how many times each one fired. Hidden if the player triggered none.
 * Caps at 8 chips, rolling everything else into a single "Otros" tile so
 * the GameOverScreen does not become a wall of chips on long runs.
 */
function PatternBreakdown({ breakdown }: { breakdown: Record<string, number> }) {
  const entries = Object.entries(breakdown ?? {})
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) return null;

  const VISIBLE = 8;
  const top = entries.slice(0, VISIBLE);
  const rest = entries.slice(VISIBLE);
  const restSum = rest.reduce((s, [, n]) => s + n, 0);

  const nameOf = (id: string) =>
    ALL_PATTERNS.find((p) => p.id === id)?.name ?? id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.52 }}
      className="w-full max-w-lg px-4 py-4 rounded-xl bg-surface-800/60 border border-surface-600/30"
    >
      <p className="text-[10px] font-bold text-accent-silver/35 uppercase tracking-widest mb-3">
        Patrones activados
      </p>
      <div className="flex flex-wrap gap-1.5">
        {top.map(([id, count]) => (
          <span
            key={id}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-700/60 border border-surface-600/40 text-[11px] text-accent-silver/80"
          >
            <span className="font-medium">{nameOf(id)}</span>
            <span className="font-mono font-bold text-accent-gold">x{count}</span>
          </span>
        ))}
        {rest.length > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-700/40 border border-surface-600/30 text-[11px] text-accent-silver/55">
            <span className="font-medium">Otros</span>
            <span className="font-mono font-bold">x{restSum}</span>
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default function GameOverScreen({
  stats,
  relicIds,
  finalRound,
  onRestart,
  onHome,
  isNewBest,
  unlockedSkins,
  mastery,
}: GameOverScreenProps) {
  const relics = ALL_RELICS.filter((r) => relicIds.includes(r.id));
  // Victory cinematic plays first if the player crossed into El Eco (round 16+)
  // — it is the symbolic completion of Dominix's three-act structure.
  const isVictoryRun = finalRound >= 16;
  const [victoryDone, setVictoryDone] = useState(!isVictoryRun);
  const [recapDone, setRecapDone] = useState(false);
  // Skin overlay shows after recap, before the main stats screen
  const hasUnlockedSkins = (unlockedSkins?.length ?? 0) > 0;
  const [skinOverlayDone, setSkinOverlayDone] = useState(!hasUnlockedSkins);

  const xpData = useMemo(() => {
    const earned = calculateRunXP(finalRound, stats.totalScore, stats.bossesDefeated, stats.patternsActivated);
    const prog = loadProgression();
    const xpInfo = getXPForNextLevel(prog.xp);
    return { earned, level: prog.level, ...xpInfo };
  }, [finalRound, stats]);

  return (
    <>
      <AnimatePresence>
        {!victoryDone && (
          <VictoryOverlay
            finalRound={finalRound}
            totalScore={stats.totalScore}
            onContinue={() => setVictoryDone(true)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {victoryDone && !recapDone && (
          <RecapHighlights
            stats={stats}
            finalRound={finalRound}
            relicIds={relicIds}
            onFinished={() => setRecapDone(true)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {recapDone && !skinOverlayDone && hasUnlockedSkins && (
          <SkinUnlockedOverlay
            skinIds={unlockedSkins ?? []}
            onComplete={() => setSkinOverlayDone(true)}
          />
        )}
      </AnimatePresence>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: recapDone && skinOverlayDone ? 1 : 0 }}
      transition={{ delay: recapDone && skinOverlayDone ? 0.1 : 0, duration: 0.4 }}
      className="min-h-screen flex flex-col items-center justify-center gap-8 px-6"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
        className="flex flex-col items-center gap-4"
      >
        {isNewBest && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 15 }}
            className="px-5 py-1.5 rounded-full bg-accent-gold/15 border border-accent-gold/30"
          >
            <span className="text-accent-gold text-xs font-bold uppercase tracking-widest">Nuevo record</span>
          </motion.div>
        )}
        {(() => {
          const act = getActForRound(Math.max(1, finalRound));
          return (
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent-silver/45">
              {act.numeral} · {act.name}
            </span>
          );
        })()}
        <h2 className="font-display font-black text-4xl bg-gradient-to-b from-white via-white/80 to-accent-silver/40 bg-clip-text text-transparent">
          Fin del ritual
        </h2>
        <p className="italic text-center text-[13px] text-accent-silver/55 max-w-sm leading-relaxed">
          "{epilogueFor(finalRound, stats.totalScore)}"
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center gap-1"
      >
        <span
          className="text-7xl font-mono font-black text-white tabular-nums tracking-tighter"
          style={{ textShadow: "0 0 30px rgba(255,255,255,0.1)" }}
        >
          {finalRound}
        </span>
        <span className="text-[11px] font-bold text-accent-silver/40 uppercase tracking-widest">
          Rondas completadas
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mt-2 max-w-lg w-full"
      >
        {[
          { value: stats.totalScore, label: "Score total", color: "text-accent-gold" },
          { value: stats.tilesPlayed, label: "Fichas jugadas", color: "text-white" },
          { value: stats.patternsActivated, label: "Patrones", color: "text-blue-400" },
          { value: stats.highestRoundScore, label: "Mejor ronda", color: "text-green-400" },
          { value: stats.bossesDefeated, label: "Jefes", color: "text-red-400" },
          { value: stats.goldEarned, label: "Oro ganado", color: "text-yellow-400" },
          { value: stats.shopPurchases, label: "Compras", color: "text-cyan-400" },
          { value: stats.bestCombo, label: "Mejor combo", color: "text-purple-400" },
        ].filter((s) => s.value > 0).map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + i * 0.05 }}
            className="flex flex-col gap-1.5 p-4 rounded-xl bg-surface-800/80 border border-surface-600/40"
          >
            <span className={`font-mono font-bold text-2xl ${stat.color}`}>
              {stat.value}
            </span>
            <span className="text-[10px] font-bold text-accent-silver/40 uppercase tracking-wider">{stat.label}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Round score chart */}
      {stats.roundScores && stats.roundScores.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-lg px-4 py-4 rounded-xl bg-surface-800/60 border border-surface-600/30"
        >
          <p className="text-[10px] font-bold text-accent-silver/35 uppercase tracking-widest mb-3">Score por ronda</p>
          <RoundScoreChart scores={stats.roundScores} />
        </motion.div>
      )}

      {/* Pattern breakdown — what triggered, in context */}
      <PatternBreakdown breakdown={stats.patternBreakdown} />

      {/* Skins newly unlocked by this run — only shows if at least one fired */}
      <UnlockedSkinsCard skinIds={unlockedSkins ?? []} />

      {/* XP Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="flex flex-col items-center gap-3 w-full max-w-sm"
      >
        <div className="flex items-center justify-between w-full">
          <span className="text-[10px] font-bold text-accent-silver/40 uppercase tracking-widest">Nivel {xpData.level}</span>
          <span className="text-sm font-mono font-bold text-accent-gold">+{xpData.earned} XP</span>
        </div>
        <div className="relative w-full h-2.5 rounded-full bg-surface-700 overflow-hidden">
          <motion.div
            initial={{ width: `${Math.max(0, (xpData.current - xpData.earned) / xpData.needed) * 100}%` }}
            animate={{ width: `${Math.min(xpData.progress * 100, 100)}%` }}
            transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-accent-gold to-amber-400"
          />
        </div>
        <span className="text-[10px] font-mono text-accent-silver/30">{xpData.current}/{xpData.needed} XP</span>
      </motion.div>

      {mastery && mastery.xpGained > 0 && (
        <MasteryBlock info={mastery} />
      )}

      {relics.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center gap-3 mt-2"
        >
          <span className="text-[10px] font-bold text-accent-silver/40 uppercase tracking-widest">
            Reliquias obtenidas
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {relics.map((relic) => (
              <div
                key={relic.id}
                className="px-3 py-1.5 rounded-lg bg-surface-700/60 border border-accent-gold/15 text-xs text-accent-silver/70 font-medium"
                title={relic.description}
              >
                {relic.name}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex gap-4 mt-4"
      >
        <button
          onClick={onRestart}
          className="px-8 py-3 rounded-xl bg-gradient-to-b from-accent-gold to-amber-600 text-surface-900 font-bold text-sm tracking-wide hover:brightness-110 transition shadow-lg shadow-accent-gold/20"
        >
          Nueva Run
        </button>
        <button
          onClick={onHome}
          className="px-8 py-3 rounded-xl border border-surface-600/50 text-accent-silver/50 font-medium text-sm tracking-wide hover:text-accent-silver/80 hover:border-surface-600 transition-all"
        >
          Inicio
        </button>
      </motion.div>
    </motion.div>
    </>
  );
}

/**
 * Post-run mastery summary: animated XP bar, XP gained, and a celebratory
 * ribbon when the run pushes the character to a new mastery level.
 */
function MasteryBlock({
  info,
}: {
  info: {
    characterId: CharacterId;
    xpGained: number;
    previousLevel: number;
    newLevel: number;
    leveledUp: boolean;
    challengesCompleted: CharacterChallenge[];
  };
}) {
  const character = getCharacter(info.characterId);
  const progress = getMasteryProgress(info.characterId);
  const unlockText = info.leveledUp ? getLevelRewardText(info.newLevel) : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.75 }}
      className={[
        "flex flex-col items-center gap-3 w-full max-w-sm px-4 py-4 rounded-xl border",
        info.leveledUp
          ? "bg-accent-gold/10 border-accent-gold/40 shadow-lg shadow-accent-gold/10"
          : "bg-surface-800/60 border-surface-600/30",
      ].join(" ")}
    >
      {info.leveledUp && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.85, type: "spring", stiffness: 260, damping: 18 }}
          className="px-3 py-1 rounded-full bg-accent-gold/20 border border-accent-gold/50"
        >
          <span className="text-accent-gold text-[10px] font-bold uppercase tracking-widest">
            Mastery Lv {info.newLevel} desbloqueado
          </span>
        </motion.div>
      )}

      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-accent-silver/40 uppercase tracking-widest">
            {character.name}
          </span>
          <span className="px-1.5 py-0.5 rounded-md bg-surface-900/60 border border-surface-600/40 text-[10px] font-bold text-accent-gold tabular-nums">
            Lv {progress.level}/{MAX_MASTERY_LEVEL}
          </span>
        </div>
        <span className="text-sm font-mono font-bold text-accent-gold">+{info.xpGained} XP</span>
      </div>

      <div className="relative w-full h-2.5 rounded-full bg-surface-700 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress.percent}%` }}
          transition={{ delay: 0.9, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-accent-gold/60 to-accent-gold"
        />
      </div>

      {unlockText && (
        <span className="text-[11px] italic text-accent-gold/80 text-center leading-tight">
          {unlockText}
        </span>
      )}

      {info.challengesCompleted.length > 0 && (
        <div className="w-full flex flex-col gap-1.5 mt-1 pt-2 border-t border-accent-gold/20">
          <span className="text-[9px] font-bold uppercase tracking-widest text-accent-silver/40 text-center">
            Desafios completados
          </span>
          {info.challengesCompleted.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 + i * 0.12 }}
              className="flex items-center justify-between gap-2 text-[11px]"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-4 h-4 rounded-full bg-accent-gold/20 border border-accent-gold/50 flex items-center justify-center text-accent-gold text-[9px] font-bold">
                  ✓
                </span>
                <span className="text-white font-bold truncate">{c.title}</span>
              </div>
              <span className="font-mono text-accent-gold tabular-nums shrink-0">+{c.xpReward}</span>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
