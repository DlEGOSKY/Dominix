import { motion } from "framer-motion";
import { useMemo } from "react";
import type { ActId } from "@/engine/acts";

interface AmbientParticlesProps {
  actId: ActId;
  intensity?: "low" | "medium" | "high";
}

/**
 * Ambient visual particles that float in the background based on the current act.
 * Each act has its own color scheme and particle behavior.
 */
export default function AmbientParticles({ actId, intensity = "medium" }: AmbientParticlesProps) {
  const config = useMemo(() => {
    const configs = {
      umbral: {
        color: "rgba(212,168,83,0.15)", // gold
        count: 12,
        size: [2, 4],
        speed: [8, 12],
      },
      travesia: {
        color: "rgba(59,130,246,0.15)", // blue
        count: 15,
        size: [2, 5],
        speed: [10, 15],
      },
      culminacion: {
        color: "rgba(168,85,247,0.15)", // purple
        count: 18,
        size: [3, 6],
        speed: [12, 18],
      },
      eco: {
        color: "rgba(34,197,94,0.15)", // green
        count: 10,
        size: [2, 4],
        speed: [6, 10],
      },
    };

    const base = configs[actId] || configs.umbral;
    const multiplier = intensity === "low" ? 0.6 : intensity === "high" ? 1.4 : 1;

    return {
      ...base,
      count: Math.round(base.count * multiplier),
    };
  }, [actId, intensity]);

  const particles = useMemo(() => {
    const rand = (seed: number) => {
      const x = Math.sin(seed * 9301 + 49297) * 233280;
      return x - Math.floor(x);
    };

    return Array.from({ length: config.count }, (_, i) => ({
      id: i,
      left: rand(i + 1) * 100,
      top: rand(i + 2) * 100,
      size: config.size[0]! + rand(i + 3) * (config.size[1]! - config.size[0]!),
      duration: config.speed[0]! + rand(i + 4) * (config.speed[1]! - config.speed[0]!),
      delay: rand(i + 5) * 4,
      driftX: (rand(i + 6) - 0.5) * 60,
      driftY: (rand(i + 7) - 0.5) * 60,
      opacity: 0.3 + rand(i + 8) * 0.4,
    }));
  }, [config]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: `radial-gradient(circle, ${config.color} 0%, transparent 70%)`,
            boxShadow: `0 0 ${p.size * 2}px ${config.color}`,
          }}
          animate={{
            x: [0, p.driftX, 0],
            y: [0, p.driftY, 0],
            opacity: [0, p.opacity, 0],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
