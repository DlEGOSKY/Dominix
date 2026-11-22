import { useEffect, useRef } from "react";
import { useSettings } from "@/hooks/useSettings";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface ParticleEffectProps {
  trigger: number;
  color?: string;
  count?: number;
}

const COLORS = ["#d4a853", "#f0c040", "#e8d090", "#ffffff"];

export default function ParticleEffect({ trigger, color, count = 12 }: ParticleEffectProps) {
  const [settings] = useSettings();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (trigger === 0 || settings.reduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Let the browser deliver the completed layout. Measuring a newly mounted
    // outcome here used to force a synchronous layout during React's commit.
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry || entry.contentRect.width <= 0 || entry.contentRect.height <= 0) return;
      observer.disconnect();
      const { width, height } = entry.contentRect;
      canvas.width = Math.round(width);
      canvas.height = Math.round(height);
      const cx = width / 2;
      const cy = height / 2;
      particlesRef.current = [];
      for (let i = 0; i < Math.min(count, 24); i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
        const speed = 1.5 + Math.random() * 3;
        const life = 30 + Math.random() * 30;
        particlesRef.current.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          life,
          maxLife: life,
          size: 2 + Math.random() * 3,
          color: color ?? COLORS[Math.floor(Math.random() * COLORS.length)]!,
        });
      }
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(animate);
    });

    function animate() {
      const ctx = canvas!.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas!.width, canvas!.height);

      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.life--;

        if (p.life <= 0) return false;

        const alpha = p.life / p.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();

        return p.life > 0;
      });

      ctx.globalAlpha = 1;

      if (particlesRef.current.length > 0) {
        rafRef.current = requestAnimationFrame(animate);
      }
    }

    observer.observe(canvas);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
      particlesRef.current = [];
    };
  }, [trigger, color, count, settings.reduceMotion]);

  return (
    <canvas
      aria-hidden="true"
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
