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

interface GlyphParticle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  color: string;
  size: number;
  alpha: number;
}

export const TimeTravelSpiral: React.FC<TimeTravelSpiralProps> = ({ onComplete, onSkip }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentYear, setCurrentYear] = useState<number>(2000);
  const [yearOpacity, setYearOpacity] = useState<number>(1);
  const animationFrameId = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Total duration: 7.2 seconds of deep space travel
  const TOTAL_DURATION_MS = 7200;

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
    // 1. GENERATE "Mateus Araujo" GLYPH TARGET COORDINATES
    // =========================================================================
    const generateNameTargets = (): { x: number; y: number }[] => {
      const offscreen = document.createElement('canvas');
      offscreen.width = width;
      offscreen.height = height;
      const offCtx = offscreen.getContext('2d');
      if (!offCtx) return [];

      offCtx.fillStyle = '#ffffff';
      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';

      const fontSize = Math.min(width / 13.5, Math.min(height * 0.44, 52));
      offCtx.font = `700 ${fontSize}px 'Orbitron', 'Space Grotesk', 'Michroma', -apple-system, sans-serif`;

      const text = 'Mateus Araujo';
      const letterSpacing = Math.max(2, fontSize * 0.08);
      let totalWidth = 0;
      for (let i = 0; i < text.length; i++) {
        totalWidth += offCtx.measureText(text[i]).width + (i < text.length - 1 ? letterSpacing : 0);
      }
      let startX = (width - totalWidth) / 2;
      const centerY = height / 2;
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = offCtx.measureText(char).width;
        offCtx.fillText(char, startX + charWidth / 2, centerY);
        startX += charWidth + letterSpacing;
      }

      const imgData = offCtx.getImageData(0, 0, width, height);
      const data = imgData.data;
      const targets: { x: number; y: number }[] = [];

      const step = width < 640 ? 4 : 3;
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const idx = (y * width + x) * 4;
          if (data[idx + 3] > 110) {
            targets.push({
              x: x + (Math.random() - 0.5) * 2,
              y: y + (Math.random() - 0.5) * 2,
            });
          }
        }
      }
      return targets;
    };

    const nameTargets = generateNameTargets();

    // =========================================================================
    // 2. INITIALIZE 3D DEEP SPACE STARFIELD
    // =========================================================================
    const STAR_COUNT = width < 768 ? 450 : 850;
    const MAX_Z = 1600;
    const FOV = Math.min(width, height) * 0.8;

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
        size: layer === 'near' ? 2.2 : layer === 'mid' ? 1.4 : 0.8,
        layer,
      });
    }

    // =========================================================================
    // 3. INITIALIZE GLYPH PARTICLES (FOR CONVERGENCE AT ARRIVAL)
    // =========================================================================
    const glyphParticles: GlyphParticle[] = nameTargets.map((target) => {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * Math.max(width, height) * 0.8 + 200;
      return {
        x: width / 2 + Math.cos(angle) * dist,
        y: height / 2 + Math.sin(angle) * dist,
        targetX: target.x,
        targetY: target.y,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        size: Math.random() * 1.5 + 1.1,
        alpha: 0,
      };
    });

    // Main Animation Loop
    const render = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const p = Math.min(1, elapsed / TOTAL_DURATION_MS);

      const cx = width / 2;
      const cy = height / 2;

      // -----------------------------------------------------------------------
      // 1. YEARS PASSAGE (2000 -> 2026, dissolves with blur & fade by p = 0.28)
      // -----------------------------------------------------------------------
      if (p < 0.28) {
        const yearProgress = p / 0.28;
        const yVal = Math.floor(2000 + yearProgress * 26);
        setCurrentYear(Math.min(2026, yVal));

        if (p < 0.14) {
          setYearOpacity(1);
        } else {
          // Dissolve smoothly with blur + opacity
          const fade = (p - 0.14) / 0.14;
          setYearOpacity(Math.max(0, 1 - fade));
        }
      } else {
        setYearOpacity(0);
      }

      // -----------------------------------------------------------------------
      // 2. SPACE BACKGROUND TONE: DEEP SPACE BLACK & MIDNIGHT NAVY
      // -----------------------------------------------------------------------
      ctx.fillStyle = 'rgba(0, 2, 8, 0.35)'; // Motion trail blur
      ctx.fillRect(0, 0, width, height);

      // -----------------------------------------------------------------------
      // 3. VELOCITY PROFILE (FORWARD WARP TRAVEL)
      // -----------------------------------------------------------------------
      let speed = 4; // Initial gentle drift
      let isStreak = false;

      if (p < 0.22) {
        // Initial acceleration through early stars
        speed = 4 + (p / 0.22) * 12;
      } else if (p < 0.60) {
        // WARP ACCELERATION & PEAK SPEED (STAR STREAKS)
        const warpP = (p - 0.22) / 0.38;
        speed = 16 + Math.sin(warpP * Math.PI * 0.5) * 88; // Reaches ~104 speed
        isStreak = true;
      } else if (p < 0.82) {
        // DECELERATION (Streaks return to points)
        const slowP = (p - 0.60) / 0.22;
        speed = 104 - Math.sin(slowP * Math.PI * 0.5) * 98; // Drops to ~6
        isStreak = slowP < 0.6;
      } else {
        // GENTLE ARRIVAL DRIFT
        speed = 2.5;
        isStreak = false;
      }

      // -----------------------------------------------------------------------
      // 4. RENDER 3D STARS & STREAKS
      // -----------------------------------------------------------------------
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.prevZ = star.z;
        star.z -= speed * (star.layer === 'near' ? 1.3 : star.layer === 'mid' ? 1.0 : 0.6);

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
        if (px < -50 || px > width + 50 || py < -50 || py > height + 50) continue;

        const prevK = FOV / star.prevZ;
        const prevPx = cx + star.x * prevK;
        const prevPy = cy + star.y * prevK;

        const alpha = Math.min(1, (MAX_Z - star.z) / (MAX_Z * 0.65));

        if (isStreak && (Math.abs(px - prevPx) > 1 || Math.abs(py - prevPy) > 1)) {
          // Render luminous Star Streak
          ctx.beginPath();
          ctx.strokeStyle = star.color;
          ctx.lineWidth = star.size * (FOV / star.z) * 0.45;
          ctx.globalAlpha = alpha * 0.9;
          ctx.moveTo(prevPx, prevPy);
          ctx.lineTo(px, py);
          ctx.stroke();
        } else {
          // Render Point Star
          ctx.fillStyle = star.color;
          ctx.globalAlpha = alpha;
          const sz = Math.max(0.6, star.size * k * 0.5);
          ctx.beginPath();
          ctx.arc(px, py, sz, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // -----------------------------------------------------------------------
      // 5. CONVERGENCE OF PARTICLES INTO "Mateus Araujo" (p >= 0.75)
      // -----------------------------------------------------------------------
      if (p >= 0.75) {
        const convergeP = (p - 0.75) / 0.25;
        const easeConvergence = 1 - Math.pow(1 - convergeP, 3); // Cubic ease out

        for (let j = 0; j < glyphParticles.length; j++) {
          const gp = glyphParticles[j];
          const curX = gp.x + (gp.targetX - gp.x) * easeConvergence;
          const curY = gp.y + (gp.targetY - gp.y) * easeConvergence;
          const curAlpha = Math.min(1, convergeP * 1.3);

          ctx.fillStyle = gp.color;
          ctx.globalAlpha = curAlpha;
          ctx.beginPath();
          ctx.arc(curX, curY, gp.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;

      // -----------------------------------------------------------------------
      // 6. COMPLETE TRANSITION AT END
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
        className="absolute top-6 right-6 z-50 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-blue-950/80 border border-cyan-900/60 hover:border-cyan-400 text-cyan-300 font-mono text-xs flex items-center gap-1.5 backdrop-blur-md cursor-pointer transition shadow-lg active:scale-95"
      >
        <span>Pular</span>
        <FastForward className="w-3.5 h-3.5" />
      </button>

      {/* 
        PURE YEARS DISPLAY ONLY (2000 -> 2026) 
        No subtitles, no descriptions, no extra words.
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
