import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  ALL_CHARACTERS,
  loadSelectedCharacter,
  loadUnlockedCharacters,
  saveSelectedCharacter,
} from "@/engine/characters";
import type { Character, CharacterId } from "@/engine/characters";
import {
  ASCENSION_LEVELS,
  loadAscension,
  getMaxSelectableAscension,
  setSelectedAscension,
} from "@/engine/ascension";
import {
  getMasteryProgress,
  getMasteryBonus,
  getLevelRewardText,
  MAX_MASTERY_LEVEL,
} from "@/engine/characterMastery";
import {
  getChallengesFor,
  loadCompletedChallenges,
  getChallengeProgress,
} from "@/engine/characterChallenges";

interface CharacterSelectScreenProps {
  onConfirm: (id: CharacterId, ascension: number) => void;
  onBack: () => void;
}

export default function CharacterSelectScreen({ onConfirm, onBack }: CharacterSelectScreenProps) {
  const unlocked = loadUnlockedCharacters();
  const [selected, setSelected] = useState<CharacterId>(() => {
    const saved = loadSelectedCharacter();
    return unlocked.has(saved) ? saved : "architect";
  });
  const character = ALL_CHARACTERS.find((c) => c.id === selected)!;

  // Order the grid: unlocked first, then by combined mastery + challenges
  // progress, then by original definition order. Identifies the "main"
  // (most-progressed) character so we can highlight it with a subtle badge.
  const { orderedCharacters, mainId } = useMemo(() => {
    const scored = ALL_CHARACTERS.map((c, index) => {
      const level = getMasteryProgress(c.id).level;
      const challengeProg = getChallengeProgress(c.id);
      const isUnlocked = unlocked.has(c.id);
      // Progress score: mastery weighted heavier than challenges; only
      // unlocked characters are eligible to be "main".
      const score = isUnlocked ? level * 10 + challengeProg.completed : -1;
      return { character: c, index, score, isUnlocked };
    });
    const sorted = [...scored].sort((a, b) => {
      if (a.isUnlocked !== b.isUnlocked) return a.isUnlocked ? -1 : 1;
      if (b.score !== a.score) return b.score - a.score;
      return a.index - b.index;
    });
    const top = sorted[0];
    const main = top && top.isUnlocked && top.score >= 10 ? top.character.id : null;
    return { orderedCharacters: sorted.map((s) => s.character), mainId: main };
  }, [unlocked]);

  const maxAsc = getMaxSelectableAscension();
  const [ascLevel, setAscLevel] = useState<number>(() => {
    const st = loadAscension();
    return Math.min(maxAsc, st.selected);
  });

  function handleConfirm() {
    saveSelectedCharacter(selected);
    setSelectedAscension(ascLevel);
    onConfirm(selected, ascLevel);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="text-accent-silver/60 hover:text-white transition-colors text-sm"
        >
          ← Volver
        </button>
        <h1 className="text-2xl font-bold text-white">Elige tu personaje</h1>
        <div className="w-16" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-8">
        {orderedCharacters.map((c) => {
          const isUnlocked = unlocked.has(c.id);
          const isSelected = selected === c.id;
          return (
            <CharacterCard
              key={c.id}
              character={c}
              unlocked={isUnlocked}
              selected={isSelected}
              isMain={mainId === c.id}
              onClick={() => isUnlocked && setSelected(c.id)}
            />
          );
        })}
      </div>

      {/* Selected details */}
      <motion.div
        key={character.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-3xl rounded-2xl bg-surface-800/60 border border-surface-600/40 backdrop-blur-sm p-6 mb-6"
      >
        <div className="flex items-start gap-4 mb-4">
          <div className={`flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center ${bgColor(character.color)} border-2 ${borderColor(character.color)}`}>
            <CharacterIcon icon={character.icon} size={34} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{character.name}</h2>
            <p className={`text-xs uppercase tracking-widest font-bold ${textColor(character.color)}`}>{character.title}</p>
          </div>
        </div>
        <p className="text-sm text-accent-silver/70 leading-relaxed mb-4">{character.description}</p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Stat label="Mano" value={character.startingHandSize.toString()} />
          <Stat label="Oro" value={character.startingGold.toString()} />
          <Stat label="Reliquias" value={character.startingRelicIds.length.toString()} />
        </div>
        <MasteryPanel characterId={character.id} />
        <div className="mt-3">
          <ChallengesPanel characterId={character.id} />
        </div>
      </motion.div>

      {/* Ascension selector */}
      <div className="w-full max-w-3xl flex flex-col items-center gap-2 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] uppercase tracking-widest text-accent-silver/40 font-bold">Ascension</span>
          <span className="text-xs text-accent-silver/60">Max desbloqueada: {maxAsc}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 justify-center">
          <button
            onClick={() => setAscLevel(0)}
            className={[
              "w-8 h-8 rounded-md border text-xs font-mono font-bold transition-all",
              ascLevel === 0
                ? "bg-accent-silver/20 border-accent-silver/60 text-white"
                : "bg-surface-800/60 border-surface-600/40 text-accent-silver/50 hover:border-surface-500",
            ].join(" ")}
          >
            0
          </button>
          {ASCENSION_LEVELS.map((lv) => {
            const unlockedLevel = lv.level <= maxAsc;
            const active = ascLevel === lv.level;
            return (
              <button
                key={lv.level}
                disabled={!unlockedLevel}
                onClick={() => setAscLevel(lv.level)}
                title={`A${lv.level} ${lv.name}: ${lv.description}`}
                className={[
                  "w-8 h-8 rounded-md border text-xs font-mono font-bold transition-all",
                  !unlockedLevel && "bg-surface-900/40 border-surface-700/30 text-accent-silver/20 cursor-not-allowed",
                  unlockedLevel && active && "bg-red-500/20 border-red-400/60 text-red-200",
                  unlockedLevel && !active && "bg-surface-800/60 border-red-400/20 text-accent-silver/60 hover:border-red-400/50",
                ].filter(Boolean).join(" ")}
              >
                {lv.level}
              </button>
            );
          })}
        </div>
        {ascLevel > 0 && (
          <motion.div
            key={ascLevel}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center px-4 py-1.5 rounded-lg bg-red-500/5 border border-red-400/20 mt-1"
          >
            <span className="text-[10px] font-bold text-red-300 uppercase tracking-widest mr-2">A{ascLevel} · {ASCENSION_LEVELS[ascLevel - 1]!.name}</span>
            <span className="text-xs text-accent-silver/70">{ASCENSION_LEVELS[ascLevel - 1]!.description}</span>
          </motion.div>
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleConfirm}
        className="px-12 py-3 rounded-xl bg-accent-gold hover:bg-accent-gold/90 text-surface-900 font-bold transition-colors"
      >
        Iniciar run con {character.name}{ascLevel > 0 ? ` · A${ascLevel}` : ""}
      </motion.button>
    </div>
  );
}

interface CardProps {
  character: Character;
  unlocked: boolean;
  selected: boolean;
  isMain: boolean;
  onClick: () => void;
}

function CharacterCard({ character, unlocked, selected, isMain, onClick }: CardProps) {
  return (
    <motion.button
      disabled={!unlocked}
      onClick={onClick}
      whileHover={unlocked ? { scale: 1.03, y: -4 } : undefined}
      whileTap={unlocked ? { scale: 0.98 } : undefined}
      className={[
        "relative flex flex-col items-center gap-3 p-4 rounded-xl transition-all",
        unlocked
          ? `bg-surface-800/60 cursor-pointer ${selected ? `border-2 ${borderColor(character.color)} shadow-lg` : isMain ? "border border-accent-gold/50 hover:border-accent-gold/70 shadow-md shadow-accent-gold/10" : "border border-surface-600/30 hover:border-surface-500/50"}`
          : "bg-surface-900/40 border border-surface-700/30 cursor-not-allowed opacity-50",
      ].join(" ")}
    >
      {/* Soft golden halo around the \"main\" character (skipped when selected to avoid visual clash) */}
      {isMain && !selected && unlocked && (
        <div
          className="absolute -inset-0.5 rounded-xl pointer-events-none"
          style={{
            boxShadow: "inset 0 0 12px rgba(212,168,83,0.15)",
          }}
        />
      )}
      <div className={`w-14 h-14 rounded-full flex items-center justify-center ${unlocked ? bgColor(character.color) : "bg-surface-700/40"} border ${unlocked ? borderColor(character.color) : "border-surface-600/30"}`}>
        <CharacterIcon icon={character.icon} size={28} />
      </div>
      <div className="text-center">
        <div className={`text-sm font-bold ${unlocked ? "text-white" : "text-accent-silver/30"}`}>{character.name}</div>
        <div className={`text-[10px] uppercase tracking-widest mt-0.5 ${unlocked ? textColor(character.color) : "text-accent-silver/20"}`}>
          {character.title}
        </div>
      </div>
      {isMain && unlocked && (
        <div className="px-2 py-0.5 rounded-full bg-accent-gold/15 border border-accent-gold/40">
          <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-accent-gold">
            Main
          </span>
        </div>
      )}
      {!unlocked && character.unlockCondition && (
        <div className="text-[10px] text-accent-silver/40 text-center leading-tight">
          {unlockDescription(character.unlockCondition)}
        </div>
      )}
      {selected && unlocked && (
        <motion.div
          layoutId="char-selected"
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent-gold border-2 border-surface-900"
        />
      )}
      {unlocked && <CardMasteryChip characterId={character.id} />}
    </motion.button>
  );
}

/**
 * Tiny Lv.N pill in the corner of each character card, so the player can
 * see at a glance which characters they have invested time into.
 * Also shows the challenge completion ratio when any challenge has been cleared.
 */
function CardMasteryChip({ characterId }: { characterId: CharacterId }) {
  const level = getMasteryProgress(characterId).level;
  const prog = getChallengeProgress(characterId);
  const hasChallenges = prog.completed > 0;
  if (level < 2 && !hasChallenges) return null;
  return (
    <div className="absolute top-1.5 left-1.5 flex flex-col items-start gap-0.5">
      {level >= 2 && (
        <div className="px-1.5 py-0.5 rounded-md bg-accent-gold/15 border border-accent-gold/30 text-accent-gold text-[9px] font-bold tabular-nums">
          Lv {level}
        </div>
      )}
      {hasChallenges && (
        <div className="px-1.5 py-0.5 rounded-md bg-surface-950/80 border border-accent-gold/20 text-accent-gold/80 text-[9px] font-bold tabular-nums">
          {prog.completed}/{prog.total}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-surface-900/40 border border-surface-600/20">
      <span className="text-[9px] uppercase tracking-widest text-accent-silver/40 font-bold">{label}</span>
      <span className="text-lg font-mono font-bold text-white tabular-nums">{value}</span>
    </div>
  );
}

function CharacterIcon({ icon, size }: { icon: Character["icon"]; size: number }) {
  const stroke = 1.8;
  switch (icon) {
    case "compass":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={stroke} />
          <path d="M16 8l-3 5-5 3 3-5 5-3z" fill="currentColor" opacity="0.4" stroke="currentColor" strokeWidth={stroke} strokeLinejoin="round" />
          <circle cx="12" cy="12" r="1.3" fill="currentColor" />
        </svg>
      );
    case "sigma":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M6 5h12l-6 7 6 7H6l5-7-5-7z" stroke="currentColor" strokeWidth={stroke} strokeLinejoin="round" fill="currentColor" fillOpacity="0.2" />
        </svg>
      );
    case "flame":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M12 3c1 3 4 5 4 9a4 4 0 1 1-8 0c0-2 1-3 2-4 0 2 2 2 2-1 0-2 0-3 0-4z" stroke="currentColor" strokeWidth={stroke} strokeLinejoin="round" fill="currentColor" fillOpacity="0.3" />
        </svg>
      );
    case "coin":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth={stroke} fill="currentColor" fillOpacity="0.15" />
          <text x="12" y="16.5" textAnchor="middle" fontSize="12" fontWeight="bold" fill="currentColor">$</text>
        </svg>
      );
    case "flask":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M10 3v6l-5 9c-0.8 1.5 0.3 3 2 3h10c1.7 0 2.8-1.5 2-3l-5-9V3" stroke="currentColor" strokeWidth={stroke} strokeLinejoin="round" fill="currentColor" fillOpacity="0.2" />
          <path d="M9 3h6" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" />
          <circle cx="10" cy="17" r="0.8" fill="currentColor" />
          <circle cx="14" cy="15" r="0.6" fill="currentColor" />
        </svg>
      );
    case "eye":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth={stroke} strokeLinejoin="round" fill="currentColor" fillOpacity="0.15" />
          <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.7" />
          <circle cx="12" cy="12" r="1.2" fill="white" />
        </svg>
      );
    case "map":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6z" stroke="currentColor" strokeWidth={stroke} strokeLinejoin="round" fill="currentColor" fillOpacity="0.2" />
          <path d="M9 4v16M15 6v16" stroke="currentColor" strokeWidth={stroke * 0.7} strokeLinecap="round" opacity="0.6" />
        </svg>
      );
    case "moon":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" stroke="currentColor" strokeWidth={stroke} strokeLinejoin="round" fill="currentColor" fillOpacity="0.25" />
        </svg>
      );
  }
}

function bgColor(color: Character["color"]): string {
  switch (color) {
    case "gold": return "bg-accent-gold/20 text-accent-gold";
    case "blue": return "bg-blue-500/20 text-blue-300";
    case "red": return "bg-red-500/20 text-red-300";
    case "green": return "bg-green-500/20 text-green-300";
    case "purple": return "bg-purple-500/20 text-purple-300";
    case "cyan": return "bg-cyan-500/20 text-cyan-300";
    case "teal": return "bg-teal-500/20 text-teal-300";
    case "violet": return "bg-violet-500/20 text-violet-300";
  }
}

function borderColor(color: Character["color"]): string {
  switch (color) {
    case "gold": return "border-accent-gold/60";
    case "blue": return "border-blue-400/60";
    case "red": return "border-red-400/60";
    case "green": return "border-green-400/60";
    case "purple": return "border-purple-400/60";
    case "cyan": return "border-cyan-400/60";
    case "teal": return "border-teal-400/60";
    case "violet": return "border-violet-400/60";
  }
}

function textColor(color: Character["color"]): string {
  switch (color) {
    case "gold": return "text-accent-gold";
    case "blue": return "text-blue-300";
    case "red": return "text-red-300";
    case "green": return "text-green-300";
    case "purple": return "text-purple-300";
    case "cyan": return "text-cyan-300";
    case "teal": return "text-teal-300";
    case "violet": return "text-violet-300";
  }
}

function unlockDescription(cond: NonNullable<Character["unlockCondition"]>): string {
  if (cond.type === "reach_round") return `Alcanza ronda ${cond.value}`;
  if (cond.type === "defeat_boss") return `Derrota al jefe ${cond.value}`;
  if (cond.type === "achievement") return `Logro: ${cond.value}`;
  return "Bloqueado";
}

/**
 * Shows the mastery level bar for the currently selected character plus
 * the text of the next unlock. Mastery persists across runs and nudges
 * the player to rotate between characters.
 */
function MasteryPanel({ characterId }: { characterId: CharacterId }) {
  const progress = getMasteryProgress(characterId);
  const bonus = getMasteryBonus(progress.level);
  const nextLevelText = progress.maxed
    ? "Mastery maxima alcanzada"
    : getLevelRewardText(progress.level + 1);
  const xpToNext = progress.maxed ? 0 : progress.nextLevelXP - progress.xp;

  return (
    <div className="rounded-xl bg-surface-900/50 border border-surface-600/30 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold uppercase tracking-widest text-accent-silver/40">
            Mastery
          </span>
          <span className="px-1.5 py-0.5 rounded-md bg-accent-gold/15 border border-accent-gold/30 text-accent-gold text-[10px] font-bold tabular-nums">
            Lv {progress.level}/{MAX_MASTERY_LEVEL}
          </span>
          {bonus.badge && (
            <span className="text-[10px] font-bold text-accent-gold uppercase tracking-widest">
              {bonus.badge}
            </span>
          )}
        </div>
        <span className="text-[10px] text-accent-silver/40 tabular-nums">
          {progress.xp.toLocaleString()} XP
        </span>
      </div>
      <div className="relative h-1.5 bg-surface-950/80 rounded-full overflow-hidden mb-2">
        <motion.div
          key={`${characterId}-${progress.percent}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress.percent}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent-gold/60 to-accent-gold rounded-full"
        />
      </div>
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-accent-silver/50 italic">{nextLevelText}</span>
        {!progress.maxed && (
          <span className="text-accent-silver/40 tabular-nums">
            {xpToNext.toLocaleString()} XP restantes
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Per-character one-shot challenge list. Completed entries show a check;
 * hidden ones display as locked rows so the player knows something exists
 * without leaking the difficulty curve of the harder tiers.
 */
function ChallengesPanel({ characterId }: { characterId: CharacterId }) {
  const challenges = getChallengesFor(characterId);
  const completed = loadCompletedChallenges();
  const done = challenges.filter((c) => completed.has(c.id)).length;

  return (
    <div className="rounded-xl bg-surface-900/50 border border-surface-600/30 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-bold uppercase tracking-widest text-accent-silver/40">
          Desafios
        </span>
        <span className="text-[10px] font-mono text-accent-silver/50 tabular-nums">
          {done}/{challenges.length}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {challenges.map((c) => {
          const isDone = completed.has(c.id);
          return (
            <div
              key={c.id}
              className={[
                "flex items-center justify-between gap-2 px-2 py-1.5 rounded-md border text-[11px]",
                isDone
                  ? "bg-accent-gold/10 border-accent-gold/30"
                  : "bg-surface-950/40 border-surface-700/30",
              ].join(" ")}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={[
                    "w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0",
                    isDone
                      ? "bg-accent-gold/25 border border-accent-gold/60 text-accent-gold"
                      : "border border-surface-600/60 text-accent-silver/30",
                  ].join(" ")}
                >
                  {isDone ? "✓" : ""}
                </span>
                <div className="flex flex-col min-w-0">
                  <span className={isDone ? "font-bold text-white" : "font-bold text-accent-silver/70"}>
                    {c.title}
                  </span>
                  <span className="text-[10px] text-accent-silver/45 truncate">
                    {c.description}
                  </span>
                </div>
              </div>
              <span
                className={[
                  "font-mono tabular-nums shrink-0",
                  isDone ? "text-accent-gold" : "text-accent-silver/35",
                ].join(" ")}
              >
                +{c.xpReward}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
