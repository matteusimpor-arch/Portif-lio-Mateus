import React, { useEffect, useRef, useState } from 'react';
import { FastForward } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface TimeTravelSpiralProps {
  onComplete: () => void;
  onSkip?: () => void;
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

export const TimeTravelSpiral: React.FC<TimeTravelSpiralProps> = ({ onComplete, onSkip }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentYear, setCurrentYear] = useState<number>(2000);
  const [yearOpacity, setYearOpacity] = useState<number>(1);
  const animationFrameId = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Duration: 5.8 seconds of clean, cinematic warp space travel
  const TOTAL_DURATION_MS = 5800;

  useEffect(() => {
    try {
      soundFx.playFanfare();
    } catch (e) {}

    startTimeRef.current = Date.now();
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
    };
    window.addEventListener('resize', handleResize);

    // =========================================================================
    // INITIALIZE 3D DEEP SPACE STARFIELD
    // =========================================================================
    const STAR_COUNT = width < 768 ? 500 : 950;
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

    // Main Animation Loop
    const render = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const p = Math.min(1, elapsed / TOTAL_DURATION_MS);

      const cx = width / 2;
      const cy = height / 2;

      // -----------------------------------------------------------------------
      // 1. YEARS PASSAGE (2000 -> 2026)
      // -----------------------------------------------------------------------
      if (p < 0.32) {
        const yearProgress = p / 0.32;
        const yVal = Math.floor(2000 + yearProgress * 26);
        setCurrentYear(Math.min(2026, yVal));

        if (p < 0.16) {
          setYearOpacity(1);
        } else {
          // Dissolve smoothly with blur + opacity
          const fade = (p - 0.16) / 0.16;
          setYearOpacity(Math.max(0, 1 - fade));
        }
      } else {
        setYearOpacity(0);
      }

      // -----------------------------------------------------------------------
      // 2. SPACE BACKGROUND TONE
      // -----------------------------------------------------------------------
      ctx.fillStyle = 'rgba(0, 2, 8, 0.3)'; // Motion trail blur
      ctx.fillRect(0, 0, width, height);

      // -----------------------------------------------------------------------
      // 3. VELOCITY PROFILE (FORWARD WARP TRAVEL)
      // -----------------------------------------------------------------------
      let speed = 4;
      let isStreak = false;

      if (p < 0.2) {
        // Initial acceleration
        speed = 4 + (p / 0.2) * 16;
      } else if (p < 0.65) {
        // WARP ACCELERATION & PEAK SPEED (STAR STREAKS)
        const warpP = (p - 0.2) / 0.45;
        speed = 20 + Math.sin(warpP * Math.PI * 0.5) * 95;
        isStreak = true;
      } else if (p < 0.88) {
        // DECELERATION (Streaks return to calm points)
        const slowP = (p - 0.65) / 0.23;
        speed = 115 - Math.sin(slowP * Math.PI * 0.5) * 110;
        isStreak = slowP < 0.4;
      } else {
        // GENTLE ARRIVAL DRIFT
        speed = 3;
        isStreak = false;
      }

      // -----------------------------------------------------------------------
      // 4. RENDER 3D STARS & STREAKS
      // -----------------------------------------------------------------------
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.prevZ = star.z;
        star.z -= speed * (star.layer === 'near' ? 1.35 : star.layer === 'mid' ? 1.0 : 0.65);

        if (star.z <= 0) {
          star.z = MAX_Z;
          star.prevZ = MAX_Z;
          star.x = (Math.random() - 0.5) * width * 3.5;
          star.y = (Math.random() - 0.5) * height * 3.5;
        }

        const k = FOV / star.z;
        const px = cx + star.x * k;
        const py = cy + star.y * k;

        // Skip off-screen
        if (px < -60 || px > width + 60 || py < -60 || py > height + 60) continue;

        const prevK = FOV / star.prevZ;
        const prevPx = cx + star.x * prevK;
        const prevPy = cy + star.y * prevK;

        const alpha = Math.min(1, (MAX_Z - star.z) / (MAX_Z * 0.6));

        if (isStreak && (Math.abs(px - prevPx) > 1.2 || Math.abs(py - prevPy) > 1.2)) {
          // Render luminous Star Streak
          ctx.beginPath();
          ctx.strokeStyle = star.color;
          ctx.lineWidth = star.size * (FOV / star.z) * 0.4;
          ctx.globalAlpha = alpha * 0.92;
          ctx.moveTo(prevPx, prevPy);
          ctx.lineTo(px, py);
          ctx.stroke();
        } else {
          // Render Point Star
          ctx.fillStyle = star.color;
          ctx.globalAlpha = alpha;
          const sz = Math.max(0.6, star.size * k * 0.45);
          ctx.beginPath();
          ctx.arc(px, py, sz, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // -----------------------------------------------------------------------
      // 5. ARRIVAL TRANSITION FLASH (CLEAN HYPERSPACE FLASH at p >= 0.88)
      // -----------------------------------------------------------------------
      if (p >= 0.88) {
        const exitP = (p - 0.88) / 0.12;
        const flashAlpha = Math.sin(exitP * Math.PI) * 0.65;
        ctx.fillStyle = '#061826';
        ctx.globalAlpha = flashAlpha;
        ctx.fillRect(0, 0, width, height);
      }

      ctx.globalAlpha = 1;

      // -----------------------------------------------------------------------
      // 6. COMPLETE TRANSITION
      // -----------------------------------------------------------------------
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
  }, [onComplete]);

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
        PURE YEARS DISPLAY ONLY (2000 -> 2026) 
        Dissolves with blur + opacity as warp speed picks up.
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
