import React, { useEffect, useRef, useState } from 'react';
import { FastForward, Compass } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface TimeTravelSpiralProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export const TimeTravelSpiral: React.FC<TimeTravelSpiralProps> = ({ onComplete, onSkip }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentYear, setCurrentYear] = useState<number>(2000);
  const [progress, setProgress] = useState<number>(0);
  const animationFrameId = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const [isFragmenting, setIsFragmenting] = useState<boolean>(false);

  const TOTAL_DURATION_MS = 6800;

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

    // Microparticles vortex evolving dynamically into Blue Space
    const particleCount = 420;
    const particles: {
      angle: number;
      distance: number;
      speed: number;
      size: number;
      color: string;
      alpha: number;
      z: number;
      isDigitalSquare: boolean;
      burstVx: number;
      burstVy: number;
    }[] = [];

    for (let i = 0; i < particleCount; i++) {
      const burstAngle = Math.random() * Math.PI * 2;
      const burstSpeed = Math.random() * 8 + 2;
      particles.push({
        angle: Math.random() * Math.PI * 2,
        distance: Math.random() * Math.max(width, height) * 0.9 + 20,
        speed: 0.015 + Math.random() * 0.035,
        size: 1 + Math.random() * 2.8,
        color: '#38bdf8',
        alpha: 0.3 + Math.random() * 0.7,
        z: Math.random() * 1000,
        isDigitalSquare: Math.random() > 0.45,
        burstVx: Math.cos(burstAngle) * burstSpeed,
        burstVy: Math.sin(burstAngle) * burstSpeed
      });
    }

    let rotationAngle = 0;
    let pulseWave = 0;

    const render = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const rawProgress = Math.min(1, elapsed / TOTAL_DURATION_MS);
      setProgress(rawProgress);

      // Nonlinear temporal progression: smooth acceleration through years
      let calculatedYear = 2000;
      if (rawProgress < 0.35) {
        // 2000 - 2014 (Retro phase)
        calculatedYear = Math.floor(2000 + (rawProgress / 0.35) * 14);
      } else if (rawProgress < 0.6) {
        // 2015 - 2019 (Deep Blue transformation begins at 2015)
        const p = (rawProgress - 0.35) / 0.25;
        calculatedYear = Math.floor(2015 + p * 4);
      } else if (rawProgress < 0.85) {
        // 2020 - 2023 (Deep Blue Space increases)
        const p = (rawProgress - 0.6) / 0.25;
        calculatedYear = Math.floor(2020 + p * 3);
      } else {
        // 2024 - 2026 (Electric Blue & Cyan Warp & 2026 Arrival)
        const p = (rawProgress - 0.85) / 0.15;
        calculatedYear = Math.min(2026, Math.floor(2024 + p * 2));
      }

      setCurrentYear(calculatedYear);

      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Background color palette evolution into Deep Blue Outer Space
      if (calculatedYear < 2015) {
        ctx.fillStyle = 'rgba(2, 6, 23, 0.28)';
      } else if (calculatedYear < 2020) {
        ctx.fillStyle = 'rgba(2, 12, 32, 0.28)';
      } else if (calculatedYear < 2024) {
        ctx.fillStyle = 'rgba(1, 8, 24, 0.28)';
      } else {
        ctx.fillStyle = 'rgba(0, 3, 10, 0.26)';
      }
      ctx.fillRect(0, 0, width, height);

      // Deceleration and fragmentation near 2026 (rawProgress >= 0.92)
      const isNearEnd = rawProgress >= 0.92;
      if (isNearEnd && !isFragmenting) {
        setIsFragmenting(true);
      }

      const rotSpeed = isNearEnd
        ? 0.01 // Spiral decelerates
        : calculatedYear >= 2024
        ? 0.05
        : calculatedYear >= 2020
        ? 0.035
        : 0.02;

      rotationAngle += rotSpeed;

      // 2. Draw Evolving Temporal Spiral Structure
      const spiralArms = 4;
      const maxRadius = Math.max(width, height) * 0.9;
      const spiralAlpha = isNearEnd ? Math.max(0, 1 - (rawProgress - 0.92) / 0.08) : 1;

      if (spiralAlpha > 0.02) {
        for (let arm = 0; arm < spiralArms; arm++) {
          ctx.beginPath();
          const baseAngle = (arm * Math.PI * 2) / spiralArms + rotationAngle;

          for (let r = 18; r < maxRadius; r += 6) {
            const theta = baseAngle + r * 0.0075;
            const x = centerX + Math.cos(theta) * r;
            const y = centerY + Math.sin(theta) * r;

            if (r === 18) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }

          // Strict color rules per year:
          if (calculatedYear < 2015) {
            // 2000-2014: Retro cyan, purple, and classic digital blue
            ctx.strokeStyle = arm % 2 === 0 ? `rgba(6, 182, 212, ${0.45 * spiralAlpha})` : `rgba(168, 85, 247, ${0.45 * spiralAlpha})`;
            ctx.lineWidth = 1.5;
          } else if (calculatedYear < 2020) {
            // 2015-2019: Introduction of deep blue, midnight navy, and cyan lines
            ctx.strokeStyle = arm % 2 === 0 ? `rgba(37, 99, 235, ${0.55 * spiralAlpha})` : `rgba(6, 182, 212, ${0.55 * spiralAlpha})`;
            ctx.lineWidth = 1.8;
          } else if (calculatedYear < 2024) {
            // 2020-2023: Royal Blue, Electric Blue, Technological reflections
            ctx.strokeStyle = arm % 2 === 0 ? `rgba(59, 130, 246, ${0.7 * spiralAlpha})` : `rgba(34, 211, 238, ${0.7 * spiralAlpha})`;
            ctx.lineWidth = 2.2;
          } else {
            // 2024-2026: Deep Space Blue structure + Electric Blue + Luminous Cyan highlights
            ctx.strokeStyle = arm % 2 === 0 ? `rgba(96, 165, 250, ${0.85 * spiralAlpha})` : `rgba(34, 211, 238, ${0.85 * spiralAlpha})`;
            ctx.lineWidth = 2.8;
          }

          ctx.stroke();
        }
      }

      // 3. Swirling Microparticles and Digital Pixels
      particles.forEach((p) => {
        if (!isNearEnd) {
          p.angle += p.speed * (calculatedYear >= 2024 ? 1.6 : 1.0);
          p.distance -= (calculatedYear >= 2024 ? 4.8 : 2.4);

          if (p.distance < 12) {
            p.distance = Math.max(width, height) * 0.85;
            p.angle = Math.random() * Math.PI * 2;
          }
        } else {
          // Fragmentation: particles release into the viewport
          p.distance += Math.sqrt(p.burstVx * p.burstVx + p.burstVy * p.burstVy) * 3;
          p.angle += 0.005;
        }

        // Particle color evolution:
        if (calculatedYear < 2015) {
          // Retro cyan / purple / white
          const retroPalette = ['#38bdf8', '#818cf8', '#c084fc', '#ffffff'];
          p.color = retroPalette[Math.floor(Math.random() * retroPalette.length)];
        } else if (calculatedYear < 2020) {
          // Royal Blue / Deep Navy / Cyan
          const transPalette = ['#2563eb', '#1d4ed8', '#0284c7', '#38bdf8', '#60a5fa'];
          p.color = transPalette[Math.floor(Math.random() * transPalette.length)];
        } else {
          // 2020-2026: Electric Blue, Royal Blue, Luminous Cyan, White-Blue highlights
          const spacePalette = ['#60a5fa', '#38bdf8', '#22d3ee', '#3b82f6', '#93c5fd', '#e0f2fe'];
          p.color = spacePalette[Math.floor(Math.random() * spacePalette.length)];
        }

        const spiralRadius = p.distance;
        const spiralX = centerX + Math.cos(p.angle) * spiralRadius;
        const spiralY = centerY + Math.sin(p.angle) * spiralRadius;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;

        if (p.isDigitalSquare && calculatedYear >= 2018) {
          ctx.fillRect(spiralX - p.size / 2, spiralY - p.size / 2, Math.max(1, p.size), Math.max(1, p.size));
        } else {
          ctx.beginPath();
          ctx.arc(spiralX, spiralY, Math.max(0.1, p.size), 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 4. Center Singularity Vortex Glow & 2026 Energy Pulse
      const coreRadius = isNearEnd ? 160 : 90;
      const coreGlow = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, Math.max(10, coreRadius));
      coreGlow.addColorStop(0, '#ffffff');

      if (calculatedYear < 2015) {
        coreGlow.addColorStop(0.3, '#38bdf8');
        coreGlow.addColorStop(0.8, 'rgba(168, 85, 247, 0.25)');
      } else if (calculatedYear < 2020) {
        coreGlow.addColorStop(0.3, '#3b82f6');
        coreGlow.addColorStop(0.8, 'rgba(29, 78, 216, 0.3)');
      } else {
        coreGlow.addColorStop(0.3, '#38bdf8');
        coreGlow.addColorStop(0.6, '#2563eb');
        coreGlow.addColorStop(0.9, 'rgba(6, 182, 212, 0.35)');
      }
      coreGlow.addColorStop(1, 'transparent');

      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, Math.max(0.1, coreRadius), 0, Math.PI * 2);
      ctx.fill();

      // Energy Pulse at 2026
      if (calculatedYear === 2026) {
        pulseWave += 0.05;
        const pulseR = (pulseWave * 80) % (Math.max(width, height) * 0.7);
        if (pulseR > 0.5) {
          ctx.strokeStyle = `rgba(56, 189, 248, ${Math.max(0, 0.65 - pulseR / 600)})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, Math.max(0.1, pulseR), 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      if (rawProgress < 1) {
        animationFrameId.current = requestAnimationFrame(render);
      } else {
        // Thousands of particles disperse smoothly into the Deep Blue Space background
        setTimeout(() => {
          onComplete();
        }, 400);
      }
    };

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [onComplete]);

  const handleSkip = () => {
    try { soundFx.playClick(); } catch (e) {}
    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#000206] text-white flex flex-col justify-between overflow-hidden select-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Top Minimalist Header */}
      <div className="relative z-10 p-3.5 sm:p-5 flex items-center justify-between backdrop-blur-md bg-black/40 border-b border-sky-500/20 font-mono">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-950/80 border border-sky-500/40 text-sky-300">
            <Compass className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-sky-300 flex items-center gap-2">
              <span>SALTO TEMPORAL</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-cyan-300 border border-blue-700">
                {currentYear < 2015 ? 'RETRO 2000' : currentYear < 2024 ? 'TRANSFORMAÇÃO DIGITAL' : 'MATEUS SPACE 2026'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">Origem: 2000 ➔ Destino: 2026</div>
          </div>
        </div>

        <button
          onClick={handleSkip}
          className="px-3 py-1.5 rounded bg-black/60 hover:bg-blue-950 border border-sky-900 hover:border-sky-500 text-sky-300 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 transition"
        >
          <FastForward className="w-3.5 h-3.5 text-cyan-400" />
          <span>Avançar</span>
        </button>
      </div>

      {/* Big Center Temporal Year Odometer with Dot Matrix & Micro Particles */}
      <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none my-auto space-y-3">
        <div className="text-8xl sm:text-9xl md:text-[150px] font-black font-vt323 tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-sky-300 to-cyan-400 drop-shadow-[0_0_55px_rgba(56,189,248,0.95)] animate-pulse">
          {currentYear}
        </div>

        <p className="text-xs sm:text-sm font-mono text-cyan-300 font-bold max-w-md text-center bg-black/80 px-4 py-2 rounded-xl border border-sky-500/30 backdrop-blur-md">
          {currentYear < 2015
            ? 'Origens nos anos 2000 • Início da curiosidade computacional'
            : currentYear < 2020
            ? 'Início da evolução tecnológica e novos horizontes digitais'
            : currentYear < 2024
            ? 'Exército Brasileiro & Tecnologia em Logística'
            : currentYear < 2026
            ? 'Engenharia de Prompt & Automações com Inteligência Artificial'
            : 'MATEUS SPACE 2026 • DEEP BLUE SPACE'}
        </p>
      </div>

      {/* Bottom Progress Bar */}
      <div className="relative z-10 p-3.5 sm:p-5 backdrop-blur-md bg-black/40 border-t border-sky-500/20 font-mono space-y-2">
        <div className="w-full bg-black/80 h-2.5 rounded-full border border-sky-900 overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-sky-400 to-cyan-300 rounded-full transition-all duration-75 shadow-[0_0_15px_rgba(56,189,248,0.7)]"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
