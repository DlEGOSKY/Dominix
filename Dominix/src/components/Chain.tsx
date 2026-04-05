import { motion, AnimatePresence } from "framer-motion";
import type { ChainState } from "@/types/domino";
import TileView from "./TileView";

interface ChainProps {
  chain: ChainState;
}

export default function Chain({ chain }: ChainProps) {
  if (chain.placed.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-32 text-accent-silver/30 text-sm tracking-wide"
      >
        Juega una ficha para iniciar la cadena
      </motion.div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 min-h-[8rem] py-4">
      <AnimatePresence mode="popLayout">
        {chain.placed.map((p, i) => (
          <motion.div
            key={`${p.tile.id}-${i}`}
            layout
            initial={{ opacity: 0, scale: 0.5, x: i === 0 ? 0 : -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="flex items-center gap-1"
          >
            <TileView tile={p.tile} disabled size="sm" animate={false} />
            {i < chain.placed.length - 1 && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 6 }}
                className="h-0.5 bg-accent-silver/20 rounded"
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
