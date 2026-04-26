import { motion } from "framer-motion";

interface ShockwaveProps {
  /** Hex/rgb color of the wave ring. Defaults to gold. */
  color?: string;
  /** How many concentric rings to render. Default 3. */
  rings?: number;
  /** Total visual reach in pixels (final radius). Default 800. */
  reach?: number;
  /** Animation duration per ring in seconds. Default 1.4. */
  duration?: number;
  /** Stagger between rings in seconds. Default 0.15. */
  stagger?: number;
}

/**
 * Concentric expanding rings emanating from the center of the parent.
 * Pure SVG + framer-motion, GPU-accelerated. Use for impact moments
 * (boss defeats, run completions, big rewards).
 *
 * Mount inside a relatively-positioned container; this component covers
 * the whole parent and is `pointer-events-none`.
 */
export default function Shockwave({
  color = "rgba(251,191,36,0.55)",
  rings = 3,
  reach = 800,
  duration = 1.4,
  stagger = 0.15,
}: ShockwaveProps) {
  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
      {Array.from({ length: rings }, (_, i) => (
        <motion.span
          key={i}
          initial={{ width: 20, height: 20, opacity: 0.9, borderWidth: 6 }}
          animate={{
            width: reach,
            height: reach,
            opacity: 0,
            borderWidth: 1,
          }}
          transition={{
            duration,
            delay: i * stagger,
            ease: [0.16, 1, 0.3, 1], // ease-out-expo-ish
          }}
          className="absolute rounded-full border"
          style={{ borderColor: color }}
        />
      ))}
    </div>
  );
}
