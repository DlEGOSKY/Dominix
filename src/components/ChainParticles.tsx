import { motion } from "framer-motion";
import { useMemo } from "react";

interface ChainParticlesProps {
  /** Number of tiles currently placed in the chain. */
  tileCount: number;
  /** Whether to render at all. Provided explicitly so parent can gate it. */
  enabled?: boolean;
}

/**
 * Decorative golden dust that accumulates as the chain grows. Appears at 7+
 * tiles, intensifies at 9+ and 12+. Pure CSS/SVG, zero deps beyond framer.
 *
 * Particles loop independently with staggered delays and random horizontal
 * drift so the motion never looks synchronized. Positioned absolutely inside
 * the parent so the caller controls layering.
 */
export default function ChainParticles({ tileCount, enabled = true }: ChainParticlesProps) {
  const count = useMemo(() => {
    if (!enabled) return 0;
    if (tileCount >= 12) return 18;
    if (tileCount >= 9) return 12;
    if (tileCount >= 7) return 7;
    return 0;
  }, [tileCount, enabled]);

  const particles = useMemo(() => {
    const rand = (seed: number) => {
      // Deterministic pseudo-random based on index so re-renders keep positions
      const x = Math.sin(seed * 9301 + 49297) * 233280;
      return x - Math.floor(x);
    };
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: rand(i + 1) * 100,
      size: 2 + rand(i + 2) * 3,
      duration: 3 + rand(i + 3) * 2.5,
      delay: rand(i + 4) * 4,
      driftX: (rand(i + 5) - 0.5) * 40,
      opacity: 0.25 + rand(i + 6) * 0.35,
    }));
  }, [count]);

  if (count === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            bottom: "-10px",
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: "radial-gradient(circle, rgba(251,191,36,0.9) 0%, rgba(251,191,36,0.3) 60%, transparent 100%)",
            boxShadow: "0 0 6px rgba(251,191,36,0.5)",
          }}
          initial={{ y: 0, opacity: 0, x: 0 }}
          animate={{
            y: [0, -100, -180],
            x: [0, p.driftX * 0.5, p.driftX],
            opacity: [0, p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}
