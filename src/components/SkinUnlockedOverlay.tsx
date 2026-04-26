import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TileView from "./TileView";
import type { TileSkin } from "./TileView";
import { ALL_TILE_SKINS } from "@/engine/tileSkins";
import { celebrateAchievement } from "@/engine/celebrate";
import { audio } from "@/engine/audio";
import Sparkles from "./cinematic/Sparkles";
import RadialFlash from "./cinematic/RadialFlash";
import { useLocalizedSkin } from "@/engine/i18nContent";
import { useTranslation } from "@/engine/i18n";

interface SkinUnlockedOverlayProps {
  /** Ids of skins to celebrate, in order. */
  skinIds: string[];
  /** Called once the user dismisses the entire reveal sequence. */
  onComplete: () => void;
}

/**
 * Full-screen cinematic overlay shown when one or more skins are unlocked
 * at the end of a run. Steps through each skin one at a time. Each step
 * fires confetti + audio so the moment lands.
 */
export default function SkinUnlockedOverlay({ skinIds, onComplete }: SkinUnlockedOverlayProps) {
  const [index, setIndex] = useState(0);
  const current = skinIds[index];
  const def = current ? ALL_TILE_SKINS.find((s) => s.id === current) : null;

  // Trigger celebration each time a new skin reveals
  useEffect(() => {
    if (!current) return;
    celebrateAchievement();
    audio.play("pattern_mega");
  }, [current]);

  // Allow Escape / Enter / Space to advance
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onComplete();
      } else if (e.key === "Enter" || e.key === " ") {
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, skinIds.length]);

  const advance = () => {
    if (index < skinIds.length - 1) {
      setIndex(index + 1);
    } else {
      onComplete();
    }
  };

  // Hook order requires unconditional invocation.
  const loc = useLocalizedSkin(def ?? { id: current ?? "", name: "", flavor: "" });
  const { t } = useTranslation();
  if (!def || !current) return null;

  const isLast = index === skinIds.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        key={`skin-overlay-${current}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-[60] flex items-center justify-center backdrop-blur-md"
        style={{
          background: `radial-gradient(circle at center, ${def.accent}22 0%, rgba(0,0,0,0.92) 70%)`,
        }}
        onClick={advance}
      >
        {/* Soft flash on each new skin reveal — punctuates the moment */}
        <RadialFlash color={def.accent} intensity={0.45} duration={0.7} />

        {/* Continuous sparkle field around the skin preview */}
        <Sparkles
          count={26}
          color={def.accent}
          spread={400}
          sizeRange={[3, 9]}
          loop
          seed={(index + 1) * 137}
        />

        {/* Ambient pulse glow behind everything */}
        <motion.div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              `radial-gradient(circle at center, ${def.accent}44 0%, transparent 50%)`,
              `radial-gradient(circle at center, ${def.accent}22 0%, transparent 60%)`,
              `radial-gradient(circle at center, ${def.accent}44 0%, transparent 50%)`,
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative flex flex-col items-center gap-8 px-6 max-w-2xl">
          {/* Eyebrow */}
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[11px] font-bold uppercase tracking-[0.4em] text-white/50"
          >
            Skin desbloqueado
            {skinIds.length > 1 && (
              <span className="ml-3 text-white/30">
                {index + 1} / {skinIds.length}
              </span>
            )}
          </motion.span>

          {/* Tile preview — large, hovering */}
          <motion.div
            initial={{ opacity: 0, scale: 0.4, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.35, type: "spring", stiffness: 240, damping: 18 }}
            className="relative flex items-center -space-x-1.5"
          >
            {[
              { id: "skin-unlock-0", top: 3, bottom: 5 },
              { id: "skin-unlock-1", top: 5, bottom: 2 },
              { id: "skin-unlock-2", top: 2, bottom: 6 },
            ].map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ y: 24, opacity: 0 }}
                animate={{
                  y: i === 1 ? -10 : -3,
                  opacity: 1,
                  rotate: i === 0 ? -3 : i === 2 ? 3 : 0,
                }}
                transition={{ delay: 0.5 + i * 0.08, type: "spring", stiffness: 260, damping: 20 }}
                style={{ zIndex: i === 1 ? 2 : 1 }}
              >
                <div className="scale-150 sm:scale-[1.85]">
                  <TileView tile={t} disabled skin={def.id as TileSkin} size="sm" animate={false} />
                </div>
              </motion.div>
            ))}
            {/* Glow under the chain */}
            <motion.div
              aria-hidden
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.85, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="absolute -bottom-6 inset-x-0 h-12 rounded-full blur-2xl"
              style={{
                background: `radial-gradient(ellipse at center, ${def.accent} 0%, transparent 65%)`,
              }}
            />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.4 }}
            className="flex flex-col items-center gap-2 text-center"
          >
            <h2
              className="font-display font-black text-5xl sm:text-6xl tracking-tight"
              style={{
                color: def.accent,
                textShadow: `0 0 28px ${def.accent}99`,
              }}
            >
              {loc.name}
            </h2>
            <p className="text-sm sm:text-base italic text-white/60 max-w-md leading-relaxed">
              {loc.flavor}
            </p>
          </motion.div>

          {/* CTA hint */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            onClick={(e) => {
              e.stopPropagation();
              advance();
            }}
            className="mt-2 px-6 py-2 rounded-lg border border-white/20 text-xs uppercase tracking-[0.3em] font-bold text-white/70 hover:text-white hover:border-white/50 hover:bg-white/5 transition-all"
          >
            {isLast ? t("skinUnlock.continue") : t("skinUnlock.next")}
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
