import { motion } from "framer-motion";
import { useState } from "react";
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
        {ALL_CHARACTERS.map((c) => {
          const isUnlocked = unlocked.has(c.id);
          const isSelected = selected === c.id;
          return (
            <CharacterCard
              key={c.id}
              character={c}
              unlocked={isUnlocked}
              selected={isSelected}
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
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Mano" value={character.startingHandSize.toString()} />
          <Stat label="Oro" value={character.startingGold.toString()} />
          <Stat label="Reliquias" value={character.startingRelicIds.length.toString()} />
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
  onClick: () => void;
}

function CharacterCard({ character, unlocked, selected, onClick }: CardProps) {
  return (
    <motion.button
      disabled={!unlocked}
      onClick={onClick}
      whileHover={unlocked ? { scale: 1.03, y: -4 } : undefined}
      whileTap={unlocked ? { scale: 0.98 } : undefined}
      className={[
        "relative flex flex-col items-center gap-3 p-4 rounded-xl transition-all",
        unlocked
          ? `bg-surface-800/60 cursor-pointer ${selected ? `border-2 ${borderColor(character.color)} shadow-lg` : "border border-surface-600/30 hover:border-surface-500/50"}`
          : "bg-surface-900/40 border border-surface-700/30 cursor-not-allowed opacity-50",
      ].join(" ")}
    >
      <div className={`w-14 h-14 rounded-full flex items-center justify-center ${unlocked ? bgColor(character.color) : "bg-surface-700/40"} border ${unlocked ? borderColor(character.color) : "border-surface-600/30"}`}>
        <CharacterIcon icon={character.icon} size={28} />
      </div>
      <div className="text-center">
        <div className={`text-sm font-bold ${unlocked ? "text-white" : "text-accent-silver/30"}`}>{character.name}</div>
        <div className={`text-[10px] uppercase tracking-widest mt-0.5 ${unlocked ? textColor(character.color) : "text-accent-silver/20"}`}>
          {character.title}
        </div>
      </div>
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
    </motion.button>
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
  }
}

function bgColor(color: Character["color"]): string {
  switch (color) {
    case "gold": return "bg-accent-gold/20 text-accent-gold";
    case "blue": return "bg-blue-500/20 text-blue-300";
    case "red": return "bg-red-500/20 text-red-300";
    case "green": return "bg-green-500/20 text-green-300";
  }
}

function borderColor(color: Character["color"]): string {
  switch (color) {
    case "gold": return "border-accent-gold/60";
    case "blue": return "border-blue-400/60";
    case "red": return "border-red-400/60";
    case "green": return "border-green-400/60";
  }
}

function textColor(color: Character["color"]): string {
  switch (color) {
    case "gold": return "text-accent-gold";
    case "blue": return "text-blue-300";
    case "red": return "text-red-300";
    case "green": return "text-green-300";
  }
}

function unlockDescription(cond: NonNullable<Character["unlockCondition"]>): string {
  if (cond.type === "reach_round") return `Alcanza ronda ${cond.value}`;
  if (cond.type === "defeat_boss") return `Derrota al jefe ${cond.value}`;
  if (cond.type === "achievement") return `Logro: ${cond.value}`;
  return "Bloqueado";
}
