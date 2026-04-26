import { motion } from "framer-motion";

interface RadialFlashProps {
  /** Color of the flash. Defaults to white. */
  color?: string;
  /** Peak opacity at the brightest moment. Default 0.7. */
  intensity?: number;
  /** Total duration in seconds. Default 0.55. */
  duration?: number;
  /** Initial delay. Default 0. */
  delay?: number;
}

/**
 * Single quick burst of light from the center, fading out fast. Use as the
 * "impact" moment of a cinematic — pairs naturally with Shockwave and
 * RadialParticles to sell the feeling of something powerful happening.
 */
export default function RadialFlash({
  color = "rgba(255,255,255,1)",
  intensity = 0.7,
  duration = 0.55,
  delay = 0,
}: RadialFlashProps) {
  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{
        opacity: [0, intensity, 0],
        scale: [0.4, 1.2, 1.6],
      }}
      transition={{
        duration,
        delay,
        ease: "easeOut",
        times: [0, 0.25, 1],
      }}
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(circle at center, ${color} 0%, transparent 35%)`,
      }}
    />
  );
}
