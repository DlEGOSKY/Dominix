import { motion } from "framer-motion";
import type { ShopItem } from "@/engine/shop";

interface ShopScreenProps {
  items: ShopItem[];
  gold: number;
  onBuy: (item: ShopItem) => void;
  onSkip: () => void;
}

export default function ShopScreen({ items, gold, onBuy, onSkip }: ShopScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-2 mb-8"
      >
        <h2 className="font-display font-bold text-3xl text-white">TIENDA</h2>
        <div className="flex items-center gap-2">
          <span className="text-2xl">💰</span>
          <span className="font-mono font-bold text-2xl text-accent-gold">{gold}</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full mb-8">
        {items.map((item, i) => {
          const canAfford = gold >= item.cost;
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => canAfford && onBuy(item)}
              disabled={!canAfford}
              className={[
                "p-4 rounded-xl border text-left transition-all",
                canAfford
                  ? "bg-surface-800 border-surface-600 hover:border-accent-gold/50 cursor-pointer"
                  : "bg-surface-800/50 border-surface-700 opacity-50 cursor-not-allowed",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="font-semibold text-white">{item.name}</span>
                <span
                  className={[
                    "px-2 py-0.5 rounded text-sm font-mono font-bold",
                    canAfford ? "bg-accent-gold/20 text-accent-gold" : "bg-surface-700 text-surface-400",
                  ].join(" ")}
                >
                  {item.cost}
                </span>
              </div>
              <p className="text-sm text-accent-silver/60">{item.description}</p>
              {item.type === "relic" && (
                <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  Reliquia
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={onSkip}
        className="px-6 py-3 rounded-xl border border-accent-silver/30 text-accent-silver font-medium hover:bg-surface-700 transition"
      >
        Continuar sin comprar
      </motion.button>
    </div>
  );
}
