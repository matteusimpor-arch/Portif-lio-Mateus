import React, { useEffect, useRef, useState } from 'react';
import { FastForward } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface TimeTravelSpiralProps {
  onComplete: () => void;
  onSkip?: () => void;
  direction?: 'forward' | 'backward';
}

interface WarpStar {
  x: number;
  y: number;
  z: number;
  prevZ: number;
  color: string;
  size: number;
  layer: 'distant' | 'mid' | 'near';
}

export const TimeTravelSpiral: React.FC<TimeTravelSpiralProps> = ({
  onComplete,
  onSkip,
  direction = 'forward',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentYear, setCurrentYear] = useState<number>(direction === 'forward' ? 2000 : 2026);
  const [yearOpacity, setYearOpacity] = useState<number>(0);
  const animationFrameId = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Duration: 5.6 seconds of clean, narrative, cinematic space travel
  const TOTAL_DURATION_MS = 5600;

  useEffect(() => {
    try {
      if (direction === 'forward') {
        soundFx.playFanfare();
      } else {
        soundFx.playMBotCurious();
      }
    } catch (e) {}

    startTimeRef.current = Date.now();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isMobile = width < 768;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const cx = width / 2;
    const cy = (height - 48) / 2;

    // =========================================================================
    // 1. INITIALIZE 3D STARFIELD
    // =========================================================================
    const STAR_COUNT = isMobile ? 420 : 850;
    const MAX_Z = 1600;
    const FOV = Math.min(width, height) * 0.85;

    const starColors = ['#ffffff', '#bae6fd', '#38bdf8', '#60a5fa', '#93c5fd', '#e0f2fe', '#0284c7'];

    const stars: WarpStar[] = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      const z = Math.random() * MAX_Z + 10;
      const layerRand = Math.random();
      const layer: 'distant' | 'mid' | 'near' =
        layerRand < 0.55 ? 'distant' : layerRand < 0.85 ? 'mid' : 'near';

      stars.push({
        x: (Math.random() - 0.5) * width * 3.5,
        y: (Math.random() - 0.5) * height * 3.5,
        z,
        prevZ: z,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        size: layer === 'near' ? 2.4 : layer === 'mid' ? 1.5 : 0.9,
        layer,
      });
    }

    // M-BOT Transformation Particles in Warp Tunnel
    const botParticleCount = 90;
    const botParticles = Array.from({ length: botParticleCount }, () => ({
      x: (Math.random() - 0.5) * 80,
      y: (Math.random() - 0.5) * 80,
      angle: Math.random() * Math.PI * 2,
      dist: Math.random() * 60 + 10,
      speed: Math.random() * 0.08 + 0.04,
      color: Math.random() < 0.5 ? '#38bdf8' : '#ffffff',
      size: Math.random() * 2.5 + 1.2,
    }));

    // Main Canvas Render Loop
    const render = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const p = Math.min(1, elapsed / TOTAL_DURATION_MS);

      const currentCX = width / 2;
      const currentCY = (height - 48) / 2;

      // =======================================================================
      // A. CLEAR SCREEN / GRADUAL DARKENING TO DEEP COSMIC SPACE
      // =======================================================================
      if (p < 0.20) {
        const darkProgress = p / 0.20;
        ctx.fillStyle = `rgba(0, 2, 8, ${0.4 + darkProgress * 0.6})`;
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.fillStyle = p > 0.75 ? 'rgba(0, 2, 8, 0.45)' : 'rgba(0, 2, 8, 0.32)';
        ctx.fillRect(0, 0, width, height);
      }

      // =======================================================================
      // B. STARS / WARP STREAKS (Forward or Reverse)
      // =======================================================================
      const starVisibility = Math.min(1, Math.max(0, (p - 0.15) / 0.15));

      if (starVisibility > 0) {
        let speed = 2;
        let isStreak = false;

        if (p < 0.35) {
          speed = 2 + ((p - 0.15) / 0.20) * 12;
        } else if (p < 0.68) {
          const warpP = (p - 0.35) / 0.33;
          speed = 14 + Math.sin(warpP * Math.PI * 0.5) * 88;
          isStreak = true;
        } else if (p < 0.88) {
          const slowP = (p - 0.68) / 0.20;
          speed = 102 - Math.sin(slowP * Math.PI * 0.5) * 98;
          isStreak = slowP < 0.45;
        } else {
          speed = 2.5;
          isStreak = false;
        }

        const isReverse = direction === 'backward';

        ctx.save();
        for (let i = 0; i < stars.length; i++) {
          const star = stars[i];
          star.prevZ = star.z;

          if (!isReverse) {
            star.z -= speed * (star.layer === 'near' ? 1.35 : star.layer === 'mid' ? 1.0 : 0.65);
            if (star.z <= 0) {
              star.z = MAX_Z;
              star.prevZ = MAX_Z;
              star.x = (Math.random() - 0.5) * width * 3.5;
              star.y = (Math.random() - 0.5) * height * 3.5;
            }
          } else {
            // Reverse warp (stars moving inward)
            star.z += speed * (star.layer === 'near' ? 1.35 : star.layer === 'mid' ? 1.0 : 0.65);
            if (star.z >= MAX_Z) {
              star.z = 10;
              star.prevZ = 10;
              star.x = (Math.random() - 0.5) * width * 3.5;
              star.y = (Math.random() - 0.5) * height * 3.5;
            }
          }

          const k = FOV / Math.max(1, star.z);
          const px = currentCX + star.x * k;
          const py = currentCY + star.y * k;

          if (px < -60 || px > width + 60 || py < -60 || py > height + 60) continue;

          const prevK = FOV / Math.max(1, star.prevZ);
          const prevPx = currentCX + star.x * prevK;
          const prevPy = currentCY + star.y * prevK;

          const alpha = Math.min(1, (MAX_Z - star.z) / (MAX_Z * 0.6)) * starVisibility;

          if (isStreak && (Math.abs(px - prevPx) > 1.2 || Math.abs(py - prevPy) > 1.2)) {
            ctx.beginPath();
            ctx.strokeStyle = star.color;
            ctx.lineWidth = star.size * (FOV / Math.max(1, star.z)) * 0.38;
            ctx.globalAlpha = alpha * 0.92;
            ctx.moveTo(prevPx, prevPy);
            ctx.lineTo(px, py);
            ctx.stroke();
          } else {
            ctx.fillStyle = star.color;
            ctx.globalAlpha = alpha;
            const sz = Math.max(0.6, star.size * k * 0.45);
            ctx.beginPath();
            ctx.arc(px, py, sz, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      }

      // =======================================================================
      // C. M-BOT TRANSFORMATION PARTICLES IN WARP TUNNEL (p between 0.35 and 0.85)
      // =======================================================================
      if (p >= 0.35 && p <= 0.85) {
        const botP = (p - 0.35) / 0.50;
        ctx.save();
        ctx.translate(currentCX, currentCY);

        // Core glow
        const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 45);
        coreGrad.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
        coreGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 45, 0, Math.PI * 2);
        ctx.fill();

        for (let i = 0; i < botParticles.length; i++) {
          const bp = botParticles[i];
          bp.angle += bp.speed * (direction === 'backward' ? -1 : 1);
          const currentDist = bp.dist * (1 + Math.sin(botP * Math.PI) * 0.5);
          const bx = Math.cos(bp.angle) * currentDist;
          const by = Math.sin(bp.angle) * currentDist;

          ctx.fillStyle = bp.color;
          ctx.globalAlpha = Math.sin(botP * Math.PI) * 0.8;
          ctx.beginPath();
          ctx.arc(bx, by, bp.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // =======================================================================
      // D. PURE NUMERIC YEARS DISPLAY (2000 -> 2026 or 2026 -> 2000)
      // =======================================================================
      if (p < 0.38) {
        const yearProgress = p / 0.35;
        if (direction === 'forward') {
          const yVal = Math.floor(2000 + yearProgress * 26);
          setCurrentYear(Math.min(2026, yVal));
        } else {
          const yVal = Math.floor(2026 - yearProgress * 26);
          setCurrentYear(Math.max(2000, yVal));
        }

        if (p < 0.18) {
          setYearOpacity(p / 0.18);
        } else if (p < 0.28) {
          setYearOpacity(1);
        } else {
          const fade = (p - 0.28) / 0.10;
          setYearOpacity(Math.max(0, 1 - fade));
        }
      } else {
        setYearOpacity(0);
      }

      // =======================================================================
      // E. ARRIVAL FLASH (p >= 0.88)
      // =======================================================================
      if (p >= 0.88) {
        const exitP = (p - 0.88) / 0.12;
        const flashAlpha = Math.sin(exitP * Math.PI) * 0.55;
        ctx.fillStyle = direction === 'forward' ? '#061826' : '#001b2a';
        ctx.globalAlpha = flashAlpha;
        ctx.fillRect(0, 0, width, height);
      }

      ctx.globalAlpha = 1;

      // =======================================================================
      // F. COMPLETION
      // =======================================================================
      if (p >= 1) {
        onComplete();
        return;
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [onComplete, direction]);

  return (
    <div
      id="time-travel-container"
      className="fixed inset-0 z-50 bg-[#000208] text-white flex items-center justify-center overflow-hidden select-none font-sans"
    >
      {/* 3D Deep Space Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Discrete Skip Button */}
      <button
        id="skip-travel-btn"
        onClick={() => {
          try {
            soundFx.playClick();
          } catch (e) {}
          if (onSkip) onSkip();
          else onComplete();
        }}
        className="absolute top-6 right-6 z-50 px-4 py-2 rounded-full bg-black/60 hover:bg-blue-950/80 border border-cyan-900/60 hover:border-cyan-400 text-cyan-300 font-mono text-xs flex items-center gap-1.5 backdrop-blur-md cursor-pointer transition shadow-lg active:scale-95"
      >
        <span>Pular Viagem</span>
        <FastForward className="w-3.5 h-3.5" />
      </button>

      {/* 
        PURE YEARS DISPLAY ONLY (2000 -> 2026 or 2026 -> 2000) 
        Dissolves with blur + opacity into pure warp space.
      */}
      {yearOpacity > 0 && (
        <div
          id="travel-year-display"
          style={{
            opacity: yearOpacity,
            filter: `blur(${(1 - yearOpacity) * 8}px)`,
            transform: `scale(${1 + (1 - yearOpacity) * 0.15})`,
          }}
          className="relative z-30 pointer-events-none flex flex-col items-center justify-center transition-all duration-75"
        >
          <span className="text-6xl sm:text-8xl md:text-9xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-200 to-blue-400 tracking-wider drop-shadow-[0_0_40px_rgba(6,182,212,0.7)]">
            {currentYear}
          </span>
        </div>
      )}
    </div>
  );
};
