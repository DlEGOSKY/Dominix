import { motion } from "framer-motion";

interface OrbitingRaysProps {
  /** Number of rays. Default 12. */
  rays?: number;
  /** Color of the rays. Defaults to gold gradient. */
  color?: string;
  /** Length of each ray in pixels. Default 360. */
  length?: number;
  /** Width of each ray in pixels. Default 4. */
  width?: number;
  /** Rotation duration (full revolution) in seconds. Default 12. */
  duration?: number;
  /** Direction of rotation. Default clockwise. */
  reverse?: boolean;
}

/**
 * Halo of slim rays of light radiating from the center, slowly rotating.
 * Creates the feeling of a divine / celestial moment. Pairs with a gold
 * tone for victory cinematics or premium reveals.
 */
export default function OrbitingRays({
  rays = 12,
  color = "rgba(252,211,77,0.5)",
  length = 360,
  width = 4,
  duration = 12,
  reverse = false,
}: OrbitingRaysProps) {
  return (
    <motion.div
      aria-hidden
      animate={{ rotate: reverse ? -360 : 360 }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
      className="absolute inset-0 pointer-events-none flex items-center justify-center"
    >
      {Array.from({ length: rays }, (_, i) => {
        const angle = (360 / rays) * i;
        return (
          <span
            key={i}
            className="absolute"
            style={{
              width,
              height: length,
              background: `linear-gradient(180deg, transparent 0%, ${color} 35%, ${color} 65%, transparent 100%)`,
              transform: `rotate(${angle}deg) translateY(-${length / 2}px)`,
              transformOrigin: "center",
              borderRadius: width,
              filter: `blur(0.5px)`,
            }}
          />
        );
      })}
    </motion.div>
  );
}
