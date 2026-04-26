import { useState, useRef, useCallback, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { IconType } from "react-icons";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

interface TooltipProps {
  content: ReactNode;
  placement?: TooltipPlacement;
  delay?: number;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

export default function Tooltip({
  content,
  placement = "top",
  delay = 300,
  disabled = false,
  children,
  className = "",
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    if (disabled) return;
    timerRef.current = setTimeout(() => setVisible(true), delay);
  }, [disabled, delay]);

  const hide = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setVisible(false);
  }, []);

  type PlacementEntry = { wrapper: string; initial: { opacity: number; y?: number; x?: number; scale: number } };
  const placementStyles: Record<TooltipPlacement, PlacementEntry> = {
    top: {
      wrapper: "bottom-full left-1/2 -translate-x-1/2 mb-2",
      initial: { opacity: 0, y: 6, scale: 0.94 },
    },
    bottom: {
      wrapper: "top-full left-1/2 -translate-x-1/2 mt-2",
      initial: { opacity: 0, y: -6, scale: 0.94 },
    },
    left: {
      wrapper: "right-full top-1/2 -translate-y-1/2 mr-2",
      initial: { opacity: 0, x: 6, scale: 0.94 },
    },
    right: {
      wrapper: "left-full top-1/2 -translate-y-1/2 ml-2",
      initial: { opacity: 0, x: -6, scale: 0.94 },
    },
  };

  const ps = placementStyles[placement];

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            key="tooltip"
            initial={ps.initial}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={ps.initial}
            transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute z-[9999] pointer-events-none ${ps.wrapper}`}
          >
            <div className="min-w-[10rem] max-w-[15rem] rounded-xl border border-surface-600/60 bg-surface-900/95 backdrop-blur-md px-3 py-2.5 shadow-2xl">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Convenience: Relic tooltip content                                 */
/* ------------------------------------------------------------------ */
interface RelicTooltipContentProps {
  name: string;
  description: string;
  family?: string | null;
  FamilyIcon?: IconType;
  familyColor?: string;
  rarity?: string;
}

export function RelicTooltipContent({
  name,
  description,
  family,
  FamilyIcon,
  familyColor,
  rarity,
}: RelicTooltipContentProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold text-white text-xs leading-tight">{name}</span>
        {rarity && rarity !== "common" && (
          <span className={`text-[9px] font-bold uppercase tracking-widest shrink-0 ${rarity === "legendary" ? "text-amber-300" : "text-blue-300"}`}>
            {rarity === "legendary" ? "Legendaria" : "Rara"}
          </span>
        )}
      </div>
      <p className="text-[10px] text-accent-silver/70 leading-snug">{description}</p>
      {family && (
        <span className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest mt-0.5 ${familyColor ?? "text-accent-silver/50"}`}>
          {FamilyIcon && <FamilyIcon size={10} />}
          <span>{family}</span>
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Convenience: Pattern tooltip content                               */
/* ------------------------------------------------------------------ */
interface PatternTooltipContentProps {
  name: string;
  description: string;
  bonus?: number;
  multiplier?: number;
}

export function PatternTooltipContent({ name, description, bonus, multiplier }: PatternTooltipContentProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-bold text-cyan-300 text-xs">{name}</span>
      <p className="text-[10px] text-accent-silver/70 leading-snug">{description}</p>
      <div className="flex gap-2 mt-0.5">
        {bonus !== undefined && bonus > 0 && (
          <span className="text-[10px] font-mono font-bold text-cyan-300">+{bonus} pts</span>
        )}
        {multiplier !== undefined && multiplier > 1 && (
          <span className="text-[10px] font-mono font-bold text-cyan-400">x{multiplier.toFixed(2)}</span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Convenience: Tile tooltip content (special tiles)                  */
/* ------------------------------------------------------------------ */
interface TileTooltipContentProps {
  type: string;
  typeLabel: string;
  typeColor: string;
  typeDesc: string;
  edition?: string | null;
  editionLabel?: string;
  editionDesc?: string;
  editionColor?: string;
  sum: number;
}

export function TileTooltipContent({
  typeLabel,
  typeColor,
  typeDesc,
  edition,
  editionLabel,
  editionDesc,
  editionColor,
  sum,
}: TileTooltipContentProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <span className={`font-bold text-xs ${typeColor}`}>{typeLabel}</span>
        <span className="text-[9px] font-mono text-accent-silver/40">suma {sum}</span>
      </div>
      <p className="text-[10px] text-accent-silver/70 leading-snug">{typeDesc}</p>
      {edition && editionLabel && (
        <div className="mt-0.5 pt-1 border-t border-surface-600/30">
          <span className={`text-[10px] font-bold ${editionColor ?? "text-pink-300"}`}>{editionLabel}</span>
          {editionDesc && (
            <p className="text-[10px] text-accent-silver/60 leading-snug mt-0.5">{editionDesc}</p>
          )}
        </div>
      )}
    </div>
  );
}
