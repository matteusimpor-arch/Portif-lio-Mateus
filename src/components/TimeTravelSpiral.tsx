import React, { useEffect, useRef, useState } from 'react';
import { FastForward } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface TimeTravelSpiralProps {
  onComplete: () => void;
  onSkip?: () => void;
}

interface PixelBlock {
  col: number;
  row: number;
  originX: number;
  originY: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  color: string;
  isEdge: boolean;
  detachTime: number; // 0 to 1 progress trigger
  detached: boolean;
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
  const [yearOpacity, setYearOpacity] = useState<number>(0);
  const animationFrameId = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Duration: 5.8 seconds of clean, narrative, cinematic space travel
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

    const isMobile = width < 768;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const cx = width / 2;
    const cy = (height - 48) / 2; // Center matching desktop usable area

    // =========================================================================
    // 1. GENERATE PIXEL-ART "M" STRUCTURE (80x88 GRID BLOCKS)
    // =========================================================================
    // Discrete bitmap mask representing the geometric pixel "M"
    // 20 columns x 22 rows
    const M_MASK = [
      "11110000000000001111",
      "11110000000000001111",
      "11111000000000011111",
      "11111100000000111111",
      "11111110000001111111",
      "11110111000011101111",
      "11110011100111001111",
      "11110001111110001111",
      "11110000111100001111",
      "11110000011000001111",
      "11110000000000001111",
      "11110000000000001111",
      "11110000000000001111",
      "11110000000000001111",
      "11110000000000001111",
      "11110000000000001111",
      "11110000000000001111",
      "11110000000000001111",
      "11110000000000001111",
      "11110000000000001111",
      "11110000000000001111",
      "11110000000000001111"
    ];

    const blockSize = isMobile ? 5 : 7;
    const mCols = M_MASK[0].length;
    const mRows = M_MASK.length;
    const mWidth = mCols * blockSize;
    const mHeight = mRows * blockSize;
    const mStartX = cx - mWidth / 2;
    const mStartY = cy - mHeight / 2;

    const pixelBlocks: PixelBlock[] = [];

    for (let r = 0; r < mRows; r++) {
      for (let c = 0; c < mCols; c++) {
        if (M_MASK[r][c] === '1') {
          // Check if this pixel is on outer edge
          const isEdge =
            r === 0 || r === mRows - 1 || c === 0 || c === mCols - 1 ||
            (r > 0 && M_MASK[r - 1][c] === '0') ||
            (r < mRows - 1 && M_MASK[r + 1][c] === '0') ||
            (c > 0 && M_MASK[r][c - 1] === '0') ||
            (c < mCols - 1 && M_MASK[r][c + 1] === '0');

          const pxX = mStartX + c * blockSize;
          const pxY = mStartY + r * blockSize;

          // Color nuance in classic 2000s palette
          let color = '#ffffff';
          if (c < 4 || c >= mCols - 4) {
            color = r % 2 === 0 ? '#ffffff' : '#e0f2fe';
          } else if (r > 6) {
            color = '#38bdf8';
          } else {
            color = '#bae6fd';
          }

          // Random detach progression (outer edge pixels detach first, inner detach later)
          const detachBase = isEdge ? 0.20 + Math.random() * 0.12 : 0.28 + Math.random() * 0.15;

          const angle = Math.atan2(pxY - cy, pxX - cx) + (Math.random() - 0.5) * 0.8;
          const speed = (Math.random() * 3 + 1.5) * (isEdge ? 1.4 : 1.0);

          pixelBlocks.push({
            col: c,
            row: r,
            originX: pxX,
            originY: pxY,
            x: pxX,
            y: pxY,
            z: 0,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            vz: Math.random() * 4 + 2,
            size: blockSize,
            color,
            isEdge,
            detachTime: detachBase,
            detached: false,
          });
        }
      }
    }

    // =========================================================================
    // 2. INITIALIZE 3D STARFIELD
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
        // Desktop Teal to Deep Cosmic Navy/Black
        const darkProgress = p / 0.20;
        ctx.fillStyle = `rgba(0, 2, 8, ${0.4 + darkProgress * 0.6})`;
        ctx.fillRect(0, 0, width, height);
      } else {
        // Pure deep space with subtle motion trails
        ctx.fillStyle = p > 0.75 ? 'rgba(0, 2, 8, 0.45)' : 'rgba(0, 2, 8, 0.32)';
        ctx.fillRect(0, 0, width, height);
      }

      // =======================================================================
      // B. STARS / WARP STREAKS (Appears softly in Phase 2, surges in Phase 3)
      // =======================================================================
      const starVisibility = Math.min(1, Math.max(0, (p - 0.15) / 0.15));

      if (starVisibility > 0) {
        let speed = 2;
        let isStreak = false;

        if (p < 0.35) {
          // Stars multiply and begin moving
          speed = 2 + ((p - 0.15) / 0.20) * 12;
        } else if (p < 0.68) {
          // WARP ACCELERATION & PEAK SPEED (STAR STREAKS)
          const warpP = (p - 0.35) / 0.33;
          speed = 14 + Math.sin(warpP * Math.PI * 0.5) * 88;
          isStreak = true;
        } else if (p < 0.88) {
          // DECELERATION (Streaks contract smoothly back to points)
          const slowP = (p - 0.68) / 0.20;
          speed = 102 - Math.sin(slowP * Math.PI * 0.5) * 98;
          isStreak = slowP < 0.45;
        } else {
          // GENTLE ARRIVAL DRIFT (Matching Space Wallpaper Stars)
          speed = 2.5;
          isStreak = false;
        }

        ctx.save();
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
          const px = currentCX + star.x * k;
          const py = currentCY + star.y * k;

          // Skip off-screen
          if (px < -60 || px > width + 60 || py < -60 || py > height + 60) continue;

          const prevK = FOV / star.prevZ;
          const prevPx = currentCX + star.x * prevK;
          const prevPy = currentCY + star.y * prevK;

          const alpha = Math.min(1, (MAX_Z - star.z) / (MAX_Z * 0.6)) * starVisibility;

          if (isStreak && (Math.abs(px - prevPx) > 1.2 || Math.abs(py - prevPy) > 1.2)) {
            // Render luminous Star Streak
            ctx.beginPath();
            ctx.strokeStyle = star.color;
            ctx.lineWidth = star.size * (FOV / star.z) * 0.38;
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
        ctx.restore();
      }

      // =======================================================================
      // C. THE CENTRAL "M" SYMBOL & ORBIT TRANSFORMATION
      // =======================================================================
      // Opacity starts at watermark 0.15 -> 0.30 -> 0.60 -> 1.00 at p = 0.18
      let symbolOpacity = 1;
      if (p < 0.18) {
        symbolOpacity = 0.15 + (p / 0.18) * 0.85;
      } else if (p > 0.55) {
        // Complete dissolution by p = 0.65
        symbolOpacity = Math.max(0, 1 - (p - 0.55) / 0.15);
      }

      if (symbolOpacity > 0.01) {
        ctx.save();
        ctx.globalAlpha = symbolOpacity;

        // 1. ROTATING RETRO ORBIT (Accelerates smoothly then fragments)
        if (p < 0.48) {
          const orbitFade = p < 0.35 ? 1 : 1 - (p - 0.35) / 0.13;
          ctx.globalAlpha = symbolOpacity * orbitFade;

          const orbitRx = isMobile ? 80 : 125;
          const orbitRy = isMobile ? 32 : 48;
          
          // Rotation speed accelerates from 0.5 to 12 rad/s
          const orbitSpin = p < 0.18 
            ? elapsed * 0.001 
            : 0.18 * TOTAL_DURATION_MS * 0.001 + Math.pow((p - 0.18) / 0.30, 2) * 14;

          ctx.save();
          ctx.translate(currentCX, currentCY);
          ctx.rotate(-0.48); // Baseline 2000s angle

          // Pixelated / dashed orbit ring
          ctx.beginPath();
          ctx.ellipse(0, 0, orbitRx, orbitRy, 0, 0, Math.PI * 2);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = isMobile ? 1.5 : 2;
          ctx.setLineDash([8, 6, 2, 6]);
          ctx.stroke();

          // Orbit Beacon 1
          const b1X = Math.cos(orbitSpin) * orbitRx;
          const b1Y = Math.sin(orbitSpin) * orbitRy;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(b1X - 3, b1Y - 3, 6, 6);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(b1X - 4.5, b1Y - 4.5, 9, 9);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(b1X - 2, b1Y - 2, 4, 4);

          // Orbit Beacon 2
          const b2X = Math.cos(orbitSpin + Math.PI) * orbitRx;
          const b2Y = Math.sin(orbitSpin + Math.PI) * orbitRy;
          ctx.fillStyle = '#60a5fa';
          ctx.fillRect(b2X - 2.5, b2Y - 2.5, 5, 5);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(b2X - 1.5, b2Y - 1.5, 3, 3);

          ctx.restore();
        }

        // 2. PIXEL "M" BLOCKS RENDERING & FRAGMENTATION
        for (let i = 0; i < pixelBlocks.length; i++) {
          const pb = pixelBlocks[i];

          // Trigger detachment based on progress
          if (p >= pb.detachTime && !pb.detached) {
            pb.detached = true;
          }

          if (!pb.detached) {
            // Static / intact crisp pixel block
            ctx.fillStyle = pb.color;
            ctx.fillRect(pb.originX, pb.originY, pb.size - 0.5, pb.size - 0.5);
          } else {
            // Detaching pixel fragment -> Quantum dust particle
            const detachAge = p - pb.detachTime;
            
            // Physics update
            pb.x += pb.vx * (1 + detachAge * 4);
            pb.y += pb.vy * (1 + detachAge * 4);
            pb.z += pb.vz * (1 + detachAge * 6);

            // In Phase 4 (p >= 0.70), gently converge particles towards center
            if (p >= 0.70) {
              const convRate = (p - 0.70) / 0.30;
              const targetX = currentCX + (Math.sin(i) * 140);
              const targetY = currentCY - 80 + (Math.cos(i) * 35);
              pb.x += (targetX - pb.x) * convRate * 0.12;
              pb.y += (targetY - pb.y) * convRate * 0.12;
            }

            // Shrink from square pixel to fine point of light
            const currentSize = Math.max(1.2, pb.size * Math.max(0.2, 1 - detachAge * 2.5));
            const pAlpha = Math.max(0, 1 - detachAge * 1.8);

            ctx.fillStyle = pb.color;
            ctx.globalAlpha = symbolOpacity * pAlpha;

            if (detachAge < 0.15) {
              // Square pixel block
              ctx.fillRect(pb.x, pb.y, currentSize, currentSize);
            } else {
              // Glowing circular particle point
              ctx.beginPath();
              ctx.arc(pb.x, pb.y, currentSize * 0.8, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        ctx.restore();
      }

      // =======================================================================
      // D. PURE NUMERIC YEARS DISPLAY (2000 -> 2026)
      // Only numbers, no descriptions. Dissolves completely by p = 0.38
      // =======================================================================
      if (p < 0.38) {
        const yearProgress = p / 0.35;
        const yVal = Math.floor(2000 + yearProgress * 26);
        setCurrentYear(Math.min(2026, yVal));

        if (p < 0.18) {
          setYearOpacity(p / 0.18);
        } else if (p < 0.28) {
          setYearOpacity(1);
        } else {
          // Dissolve smoothly with blur + opacity into pure warp space
          const fade = (p - 0.28) / 0.10;
          setYearOpacity(Math.max(0, 1 - fade));
        }
      } else {
        setYearOpacity(0);
      }

      // =======================================================================
      // E. ARRIVAL TRANSITION FLASH / HARMONIC CONVERGENCE (p >= 0.88)
      // =======================================================================
      if (p >= 0.88) {
        const exitP = (p - 0.88) / 0.12;
        const flashAlpha = Math.sin(exitP * Math.PI) * 0.55;
        ctx.fillStyle = '#061826';
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
