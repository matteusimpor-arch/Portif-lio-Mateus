import React, { useEffect, useRef } from 'react';

export interface MorphAppItem {
  id: string;
  name: string;
  startX: number; // percentage (0-100)
  startY: number; // percentage (0-100)
  targetX: number; // percentage (0-100)
  targetY: number; // percentage (0-100)
  rotation: number; // degrees
  scale: number;
}

interface AppMorphingCanvasProps {
  items: MorphAppItem[];
  progress: number; // 0 to 1
  reduceMotion?: boolean;
}

interface MorphParticle {
  x: number;
  y: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  controlX: number;
  controlY: number;
  size: number;
  color: string;
  alpha: number;
  appIndex: number;
  swirlAngle: number;
  swirlRadius: number;
  isSquare: boolean;
  landingRadius: number;
  speedMultiplier: number;
}

export const AppMorphingCanvas: React.FC<AppMorphingCanvasProps> = ({
  items,
  progress,
  reduceMotion = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<MorphParticle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    const initParticles = () => {
      // 2800 particles distributed across the 8 apps (~350 per app)
      const particles: MorphParticle[] = [];
      const colors = ['#2dd4bf', '#14b8a6', '#10b981', '#34d399', '#22c55e', '#84cc16', '#a3e635', '#a7f3d0'];
      const particlesPerApp = Math.min(350, Math.floor(2800 / Math.max(1, items.length)));

      items.forEach((item, appIndex) => {
        const sX = (item.startX / 100) * width;
        const sY = (item.startY / 100) * height;
        const tX = (item.targetX / 100) * width;
        const tY = (item.targetY / 100) * height;

        for (let i = 0; i < particlesPerApp; i++) {
          // Dispersal cluster representing the text badge letters
          const textOffsetX = (Math.random() - 0.5) * 150;
          const textOffsetY = (Math.random() - 0.5) * 40;

          // Control point for smooth curved trajectories across digital space
          const midX = (sX + tX) / 2 + (Math.random() - 0.5) * width * 0.28;
          const midY = (sY + tY) / 2 + (Math.random() - 0.5) * height * 0.28;

          particles.push({
            x: sX + textOffsetX,
            y: sY + textOffsetY,
            startX: sX + textOffsetX,
            startY: sY + textOffsetY,
            targetX: tX + (Math.random() - 0.5) * 80,
            targetY: tY + (Math.random() - 0.5) * 80,
            controlX: midX,
            controlY: midY,
            size: Math.random() * 2.4 + 1.2,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: Math.random() * 0.5 + 0.5,
            appIndex,
            swirlAngle: Math.random() * Math.PI * 2,
            swirlRadius: Math.random() * 45 + 15,
            isSquare: Math.random() > 0.35,
            landingRadius: Math.random() * 50 + 20,
            speedMultiplier: Math.random() * 0.3 + 0.85
          });
        }
      });

      particlesRef.current = particles;
    };

    initParticles();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [items]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const particles = particlesRef.current;
    const t = Math.min(1, Math.max(0, progress));

    // When progress is active between 0.15 and 0.95, render the morphing streams
    if (t < 0.05) return;

    // Draw Bézier trajectory particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Custom eased interpolation per particle
      const adjustedT = Math.min(1, Math.max(0, t * p.speedMultiplier));
      const invT = 1 - adjustedT;
      let currX = invT * invT * p.startX + 2 * invT * adjustedT * p.controlX + adjustedT * adjustedT * p.targetX;
      let currY = invT * invT * p.startY + 2 * invT * adjustedT * p.controlY + adjustedT * adjustedT * p.targetY;

      // Swirl & dispersion during active transit
      if (!reduceMotion && adjustedT > 0.05 && adjustedT < 0.95) {
        const swirlStrength = Math.sin(adjustedT * Math.PI);
        const dynamicAngle = p.swirlAngle + adjustedT * 10;
        currX += Math.cos(dynamicAngle) * p.swirlRadius * swirlStrength;
        currY += Math.sin(dynamicAngle) * p.swirlRadius * swirlStrength;
      }

      // Landing orbital convergence as it approaches target (t > 0.8)
      if (adjustedT >= 0.8) {
        const landingT = (adjustedT - 0.8) / 0.2;
        const ringAngle = p.swirlAngle + landingT * Math.PI * 4;
        const currentRingRadius = p.landingRadius * (1 - landingT);
        currX += Math.cos(ringAngle) * currentRingRadius;
        currY += Math.sin(ringAngle) * currentRingRadius;
      }

      p.x = currX;
      p.y = currY;

      ctx.fillStyle = p.color;
      // High visibility during morphing
      const dynamicAlpha = p.alpha * (0.3 + Math.sin(t * Math.PI) * 0.7);
      ctx.globalAlpha = Math.max(0, Math.min(1, dynamicAlpha));

      if (p.isSquare) {
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Landing Aura around the 8 target apps when converging (t >= 0.7)
    if (t >= 0.7) {
      const auraAlpha = Math.min(1, (t - 0.7) / 0.3) * 0.4;
      items.forEach((item) => {
        const tX = (item.targetX / 100) * width;
        const tY = (item.targetY / 100) * height;

        const grad = ctx.createRadialGradient(tX, tY, 10, tX, tY, 70);
        grad.addColorStop(0, 'rgba(45, 212, 191, 0.35)');
        grad.addColorStop(0.5, 'rgba(16, 185, 129, 0.15)');
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.globalAlpha = auraAlpha;
        ctx.beginPath();
        ctx.arc(tX, tY, 70, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    ctx.globalAlpha = 1;
  }, [items, progress, reduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-15 select-none"
    />
  );
};

