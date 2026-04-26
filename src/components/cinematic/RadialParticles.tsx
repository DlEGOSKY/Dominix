import { motion } from "framer-motion";
import { useMemo } from "react";

interface RadialParticlesProps {
  /** Number of particles. Default 24. */
  count?: number;
  /** Particle color. Defaults to gold. */
  color?: string;
  /** Particle size in pixels. Default 6. */
  size?: number;
  /** Distance from center each particle travels. Default 320. */
  reach?: number;
  /** Total animation duration in seconds. Default 1.6. */
  duration?: number;
  /** Initial delay before particles fly out. Default 0.05. */
  delay?: number;
  /** Random seed for deterministic particle distribution. Default Math.random. */
  seed?: number;
}

/**
 * Burst of particles flying out radially from the center of the parent
 * container. Use for explosions, impacts, "burst from focal point" moments.
 *
 * Each particle gets a slight random angle offset and reach variation so
 * the burst feels organic rather than mechanical.
 */
export default function RadialParticles({
  count = 24,
  color = "rgba(252,211,77,0.95)",
  size = 6,
  reach = 320,
  duration = 1.6,
  delay = 0.05,
  seed,
}: RadialParticlesProps) {
  const particles = useMemo(() => {
    // Deterministic-ish: use seed if provided, otherwise random per-mount
    const baseSeed = seed ?? Math.random() * 1000;
    return Array.from({ length: count }, (_, i) => {
      const baseAngle = (Math.PI * 2 * i) / count;
      const jitter = (((baseSeed * (i + 1)) % 1) - 0.5) * 0.3; // ±~17deg
      const angle = baseAngle + jitter;
      const distance = reach * (0.7 + ((baseSeed * (i + 7)) % 1) * 0.6); // 0.7x..1.3x
      return {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        rotate: (baseSeed * (i + 13)) % 360,
        scale: 0.6 + ((baseSeed * (i + 5)) % 1) * 0.8,
      };
    });
  }, [count, reach, seed]);

  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
      {particles.map((p, i) => (
        <motion.span
          key={i}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
          animate={{
            x: p.x,
            y: p.y,
            opacity: [0, 1, 1, 0],
            scale: [0, p.scale, p.scale * 0.9, 0],
            rotate: p.rotate,
          }}
          transition={{
            duration,
            delay,
            ease: [0.22, 1, 0.36, 1],
            times: [0, 0.15, 0.7, 1],
          }}
          className="absolute rounded-full"
          style={{
            width: size,
            height: size,
            background: color,
            boxShadow: `0 0 ${size * 2}px ${color}`,
          }}
        />
      ))}
    </div>
  );
}
