import { motion } from "framer-motion";
import { ALL_RELICS, getRelicFamily, getRelicRarity } from "@/engine/relics";
import { getRelicIcon } from "@/engine/relicIcons";
import { useLocalizedRelic } from "@/engine/i18nContent";
import type { RelicFamily, RelicRarity } from "@/types/relic";

interface RelicCardProps {
  relicId: string;
  size?: "xs" | "sm" | "md" | "lg";
  showName?: boolean;
  showDescription?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  locked?: boolean;
}

const FAMILY_THEME: Record<RelicFamily, {
  bg: string;
  border: string;
  iconColor: string;
  glow: string;
  pattern: string;
  label: string;
  labelColor: string;
}> = {
  patron: {
    bg: "bg-gradient-to-br from-amber-900/40 via-[#1a1408] to-[#0d0a04]",
    border: "border-amber-400/40",
    iconColor: "text-amber-300",
    glow: "shadow-[0_0_22px_rgba(212,168,83,0.35),inset_0_0_18px_rgba(212,168,83,0.12)]",
    pattern: "before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_0%,rgba(212,168,83,0.18),transparent_70%)] before:pointer-events-none",
    label: "Patron",
    labelColor: "text-amber-300/80 bg-amber-950/60 border-amber-400/30",
  },
  numero: {
    bg: "bg-gradient-to-br from-blue-900/40 via-[#080c1c] to-[#04060f]",
    border: "border-blue-400/40",
    iconColor: "text-blue-300",
    glow: "shadow-[0_0_22px_rgba(96,165,250,0.3),inset_0_0_18px_rgba(96,165,250,0.1)]",
    pattern: "before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_0%,rgba(96,165,250,0.15),transparent_70%)] before:pointer-events-none",
    label: "Numero",
    labelColor: "text-blue-300/80 bg-blue-950/60 border-blue-400/30",
  },
  fuerza: {
    bg: "bg-gradient-to-br from-red-900/40 via-[#1a0608] to-[#0d0404]",
    border: "border-red-400/40",
    iconColor: "text-red-300",
    glow: "shadow-[0_0_22px_rgba(248,113,113,0.3),inset_0_0_18px_rgba(248,113,113,0.1)]",
    pattern: "before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_0%,rgba(248,113,113,0.15),transparent_70%)] before:pointer-events-none",
    label: "Fuerza",
    labelColor: "text-red-300/80 bg-red-950/60 border-red-400/30",
  },
  cadena: {
    bg: "bg-gradient-to-br from-purple-900/40 via-[#0e0820] to-[#07040f]",
    border: "border-purple-400/40",
    iconColor: "text-purple-300",
    glow: "shadow-[0_0_22px_rgba(192,132,252,0.3),inset_0_0_18px_rgba(192,132,252,0.1)]",
    pattern: "before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_0%,rgba(192,132,252,0.15),transparent_70%)] before:pointer-events-none",
    label: "Cadena",
    labelColor: "text-purple-300/80 bg-purple-950/60 border-purple-400/30",
  },
  accion: {
    bg: "bg-gradient-to-br from-emerald-900/40 via-[#041a12] to-[#040d08]",
    border: "border-emerald-400/40",
    iconColor: "text-emerald-300",
    glow: "shadow-[0_0_22px_rgba(74,222,128,0.3),inset_0_0_18px_rgba(74,222,128,0.1)]",
    pattern: "before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_0%,rgba(74,222,128,0.15),transparent_70%)] before:pointer-events-none",
    label: "Accion",
    labelColor: "text-emerald-300/80 bg-emerald-950/60 border-emerald-400/30",
  },
};

const RARITY_THEME: Record<RelicRarity, { ring: string; badge: string; label: string; extraClass: string }> = {
  common: {
    ring: "",
    badge: "",
    label: "",
    extraClass: "",
  },
  rare: {
    ring: "ring-1 ring-blue-300/40",
    badge: "bg-blue-500/30 border-blue-400/50 text-blue-100",
    label: "Rara",
    extraClass: "",
  },
  legendary: {
    ring: "ring-2 ring-amber-300/60",
    badge: "bg-gradient-to-r from-amber-500/40 to-yellow-400/40 border-amber-300/60 text-amber-100",
    label: "Legendaria",
    extraClass: "edition-holo",
  },
};

const SIZE_CONFIG = {
  xs: { card: "w-10 h-14", icon: 22, name: "text-[8px]", desc: "text-[7px]", badge: "text-[6px] px-1 py-0.5", label: "text-[6px]" },
  sm: { card: "w-14 h-20", icon: 28, name: "text-[9px]", desc: "text-[8px]", badge: "text-[7px] px-1 py-0.5", label: "text-[7px]" },
  md: { card: "w-24 h-36", icon: 44, name: "text-xs", desc: "text-[10px]", badge: "text-[9px] px-1.5 py-0.5", label: "text-[8px]" },
  lg: { card: "w-32 h-48", icon: 56, name: "text-sm", desc: "text-[11px]", badge: "text-[10px] px-2 py-0.5", label: "text-[9px]" },
};

export default function RelicCard({
  relicId,
  size = "md",
  showName = true,
  showDescription = false,
  onClick,
  disabled = false,
  locked = false,
}: RelicCardProps) {
  const relic = ALL_RELICS.find((r) => r.id === relicId);
  // Hook order requires us to call useLocalizedRelic unconditionally; we pass
  // a placeholder relic when the id is unknown and bail out below.
  const localized = useLocalizedRelic(relic ?? { id: relicId, name: "", description: "", trigger: "passive", effect: { type: "bonus_flat", value: 0 } } as never);
  if (!relic) return null;

  const family = getRelicFamily(relic) ?? "fuerza";
  const rarity = getRelicRarity(relic);
  const Icon = getRelicIcon(relicId);
  const fam = FAMILY_THEME[family];
  const rare = RARITY_THEME[rarity];
  const cfg = SIZE_CONFIG[size];

  const content = (
    <div
      className={[
        "relative flex flex-col items-center rounded-xl border-2 overflow-hidden",
        cfg.card,
        fam.bg,
        fam.border,
        fam.glow,
        fam.pattern,
        rare.ring,
        rare.extraClass,
        locked ? "opacity-40 grayscale" : "",
        onClick && !disabled ? "cursor-pointer" : "",
      ].join(" ")}
    >
      {/* Family label top */}
      <div className={["absolute top-0 left-0 right-0 text-center py-0.5 border-b uppercase tracking-widest font-bold", cfg.label, fam.labelColor].join(" ")}>
        {fam.label}
      </div>

      {/* Icon center */}
      <div className="flex-1 flex items-center justify-center w-full pt-3">
        {Icon ? (
          <Icon size={cfg.icon} className={[fam.iconColor, "drop-shadow-[0_0_8px_currentColor]"].join(" ")} />
        ) : (
          <div className={["rounded-full bg-current opacity-50", fam.iconColor].join(" ")} style={{ width: cfg.icon * 0.6, height: cfg.icon * 0.6 }} />
        )}
      </div>

      {/* Name */}
      {showName && (
        <div className={["text-center px-1 w-full font-bold text-white/90 leading-tight truncate", cfg.name].join(" ")}>
          {locked ? "???" : localized.name}
        </div>
      )}

      {/* Description */}
      {showDescription && !locked && (
        <div className={["text-center px-1.5 pb-2 w-full text-accent-silver/70 leading-tight mt-0.5", cfg.desc].join(" ")}>
          {localized.description}
        </div>
      )}

      {!showDescription && <div className="h-1.5" />}

      {/* Rarity badge */}
      {rarity !== "common" && !locked && (
        <div className={["absolute top-5 right-1 border rounded-md font-bold uppercase tracking-wider", cfg.badge, rare.badge].join(" ")}>
          {rare.label.charAt(0)}
        </div>
      )}
    </div>
  );

  if (onClick && !disabled) {
    return (
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        className="focus:outline-none"
      >
        {content}
      </motion.button>
    );
  }

  return content;
}
