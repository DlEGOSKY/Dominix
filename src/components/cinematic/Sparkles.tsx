import { motion } from "framer-motion";
import { useMemo } from "react";

interface SparklesProps {
  /** Number of sparkles. Default 30. */
  count?: number;
  /** Sparkle color. Defaults to gold. */
  color?: string;
  /** Min/max size in pixels. Default [4, 10]. */
  sizeRange?: [number, number];
  /** Spread radius from center (in pixels). Default 320. */
  spread?: number;
  /** Continuous loop or one-shot. Default true (loops). */
  loop?: boolean;
  /** Random seed for deterministic placement. */
  seed?: number;
}

/**
 * Field of twinkling sparkles dispersed around the center of the parent.
 * Each sparkle randomly fades in/out at its own pace, creating a magical
 * shimmer. Use for "reveal", "unlock", "discovery" moments where you want
 * a constant ambient feel rather than a single-impact burst.
 */
export default function Sparkles({
  count = 30,
  color = "rgba(252,211,77,0.95)",
  sizeRange = [4, 10],
  spread = 320,
  loop = true,
  seed,
}: SparklesProps) {
  const dots = useMemo(() => {
    const baseSeed = seed ?? Math.random() * 1000;
    return Array.from({ length: count }, (_, i) => {
      const angle = ((baseSeed * (i + 1) * 7.31) % 1) * Math.PI * 2;
      const radius = ((baseSeed * (i + 11) * 3.14) % 1) * spread;
      const size = sizeRange[0] + ((baseSeed * (i + 17)) % 1) * (sizeRange[1] - sizeRange[0]);
      const delay = ((baseSeed * (i + 23)) % 1) * 1.5;
      const duration = 1.2 + ((baseSeed * (i + 29)) % 1) * 1.6;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        size,
        delay,
        duration,
      };
    });
  }, [count, spread, sizeRange, seed]);

  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {dots.map((d, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scale: 0, x: d.x, y: d.y }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: d.duration,
            delay: d.delay,
            repeat: loop ? Infinity : 0,
            repeatDelay: ((d.delay * 2.7) % 1) * 0.8,
            ease: "easeInOut",
          }}
          className="absolute rounded-full"
          style={{
            width: d.size,
            height: d.size,
            background: color,
            boxShadow: `0 0 ${d.size * 2}px ${color}`,
            translateX: d.x,
            translateY: d.y,
          }}
        />
      ))}
    </div>
  );
}
