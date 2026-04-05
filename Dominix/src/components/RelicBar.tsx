import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ALL_RELICS } from "@/engine/relics";

interface RelicBarProps {
  relicIds: string[];
}

export default function RelicBar({ relicIds }: RelicBarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (relicIds.length === 0) return null;

  const relics = ALL_RELICS.filter((r) => relicIds.includes(r.id));
  const hoveredRelic = relics.find((r) => r.id === hoveredId);

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <span className="text-xs text-accent-silver/40 uppercase tracking-wider">
        Reliquias ({relics.length})
      </span>
      <div className="flex flex-wrap justify-center gap-2">
        <AnimatePresence mode="popLayout">
          {relics.map((relic, i) => (
            <motion.div
              key={relic.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 400, damping: 25 }}
              onMouseEnter={() => setHoveredId(relic.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={[
                "px-3 py-1.5 rounded-md border text-xs cursor-default transition-colors",
                hoveredId === relic.id
                  ? "bg-surface-600 border-accent-gold/40 text-accent-gold"
                  : "bg-surface-700 border-accent-silver/20 text-accent-silver",
              ].join(" ")}
            >
              {relic.name}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {hoveredRelic && (
          <motion.div
            key={hoveredRelic.id}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="text-xs text-accent-silver/60 text-center max-w-sm"
          >
            {hoveredRelic.description}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
