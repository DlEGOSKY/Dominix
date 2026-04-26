import { motion } from "framer-motion";
import type { ShopItem } from "@/engine/shop";
import { useTranslation, t as translate } from "@/engine/i18n";
import RelicCard from "./RelicCard";

interface ShopScreenProps {
  items: ShopItem[];
  gold: number;
  onBuy: (item: ShopItem) => void;
  onSkip: () => void;
  rerollCost?: number;
  onReroll?: () => void;
}

function getItemAccent(type: ShopItem["type"]) {
  // labelKey → t() at render time, so the label is always live with the
  // current language. translate() (the static t() reference) keeps the call
  // self-contained outside React.
  switch (type) {
    case "relic":
      return { border: "border-purple-500/40", glow: "hover:shadow-[0_0_24px_rgba(147,51,234,0.2)]", badge: "bg-purple-500/20 text-purple-400 border-purple-500/30", label: translate("shop.tag.relic"), accent: "from-purple-500/10" };
    case "tile_upgrade":
      return { border: "border-yellow-500/40", glow: "hover:shadow-[0_0_24px_rgba(234,179,8,0.2)]", badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", label: translate("shop.tag.tile_upgrade"), accent: "from-yellow-500/10" };
    case "remove_tile":
      return { border: "border-red-500/30", glow: "hover:shadow-[0_0_24px_rgba(239,68,68,0.15)]", badge: "bg-red-500/20 text-red-400 border-red-500/30", label: translate("shop.tag.remove_tile"), accent: "from-red-500/8" };
    case "heal":
      return { border: "border-green-500/40", glow: "hover:shadow-[0_0_24px_rgba(34,197,94,0.2)]", badge: "bg-green-500/20 text-green-400 border-green-500/30", label: translate("shop.tag.heal"), accent: "from-green-500/10" };
    case "wild_tile":
      return { border: "border-violet-500/40", glow: "hover:shadow-[0_0_24px_rgba(139,92,246,0.2)]", badge: "bg-violet-500/20 text-violet-400 border-violet-500/30", label: translate("shop.tag.wild_tile"), accent: "from-violet-500/10" };
    case "extra_hand":
      return { border: "border-cyan-500/40", glow: "hover:shadow-[0_0_24px_rgba(6,182,212,0.2)]", badge: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30", label: translate("shop.tag.extra_hand"), accent: "from-cyan-500/10" };
    case "forge_edition":
      return { border: "border-pink-500/50", glow: "hover:shadow-[0_0_28px_rgba(236,72,153,0.25)]", badge: "bg-pink-500/20 text-pink-300 border-pink-500/40", label: translate("shop.tag.forge_edition"), accent: "from-pink-500/10" };
    default:
      return { border: "border-surface-600", glow: "", badge: "bg-surface-700 text-accent-silver/60 border-surface-600", label: translate("shop.tag.item"), accent: "from-surface-600/10" };
  }
}

export default function ShopScreen({ items, gold, onBuy, onSkip, rerollCost, onReroll }: ShopScreenProps) {
  // Subscribe to language changes so getItemAccent() re-renders on switch.
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-3 mb-10"
      >
        <div className="w-14 h-14 rounded-2xl bg-accent-gold/10 border border-accent-gold/30 flex items-center justify-center mb-1">
          <div className="w-6 h-6 rounded-full bg-accent-gold/70" />
        </div>
        <h2 className="font-display font-black text-3xl text-white tracking-tight">{t("shop.title")}</h2>
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-accent-gold/10 border border-accent-gold/20">
          <div className="w-3 h-3 rounded-full bg-accent-gold/80" />
          <span className="font-mono font-bold text-xl text-accent-gold">{gold}</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl w-full mb-10">
        {items.map((item, i) => {
          const canAfford = gold >= item.cost;
          const accent = getItemAccent(item.type);
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 300, damping: 25 }}
              whileHover={canAfford ? { scale: 1.03, y: -4 } : undefined}
              whileTap={canAfford ? { scale: 0.97 } : undefined}
              onClick={() => canAfford && onBuy(item)}
              disabled={!canAfford}
              className={[
                "relative p-5 rounded-2xl border-2 text-left overflow-hidden shop-card transition-shadow duration-300",
                canAfford ? accent.border : "border-surface-700/50",
                canAfford ? accent.glow : "opacity-40 cursor-not-allowed",
                canAfford ? "cursor-pointer" : "",
              ].join(" ")}
            >
              {/* Top accent glow */}
              <div className={`absolute top-0 left-0 right-0 h-12 bg-gradient-to-b ${accent.accent} to-transparent pointer-events-none`} />

              <div className="relative flex items-start justify-between gap-3 mb-3">
                <div className="flex flex-col gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest border ${accent.badge} w-fit`}>
                    {accent.label}
                  </span>
                  <span className="font-display font-bold text-white text-lg leading-tight">{item.name}</span>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span
                    className={[
                      "px-3 py-1 rounded-lg text-sm font-mono font-bold",
                      canAfford ? "bg-accent-gold/15 text-accent-gold border border-accent-gold/20" : "bg-surface-700 text-surface-500",
                    ].join(" ")}
                  >
                    {item.cost}g
                  </span>
                  {item.type === "relic" && item.relic && (
                    <RelicCard relicId={item.relic.id} size="sm" showName={false} />
                  )}
                </div>
              </div>
              <p className="relative text-sm text-accent-silver/50 leading-relaxed">{item.description}</p>
            </motion.button>
          );
        })}
      </div>

      <div className="flex gap-3">
        {onReroll && rerollCost !== undefined && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            onClick={gold >= rerollCost ? onReroll : undefined}
            disabled={gold < rerollCost}
            className={[
              "px-6 py-3 rounded-xl border font-medium text-sm transition-all",
              gold >= rerollCost
                ? "border-blue-500/40 text-blue-400 hover:bg-blue-500/10 cursor-pointer"
                : "border-surface-700/50 text-surface-500 opacity-40 cursor-not-allowed",
            ].join(" ")}
          >
            {t("shop.reroll", { n: rerollCost })}
          </motion.button>
        )}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={onSkip}
          className="px-8 py-3 rounded-xl border border-surface-600/50 text-accent-silver/50 font-medium hover:text-accent-silver/80 hover:border-surface-600 transition-all"
        >
          {t("shop.skip")}
        </motion.button>
      </div>
    </div>
  );
}
