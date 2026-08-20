import React, { useEffect, useRef, useState } from 'react';
import { FastForward, Compass, Sparkles } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface TimeTravelSpiralProps {
  onComplete: () => void;
  onSkip?: () => void;
}

interface VortexParticle {
  angle: number;
  radius: number;
  speed: number;
  radialSpeed: number;
  size: number;
  colorIndex: number;
  alpha: number;
  z: number;
  vz: number;
  streakLength: number;
  isStreak: boolean;
}

export const TimeTravelSpiral: React.FC<TimeTravelSpiralProps> = ({ onComplete, onSkip }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentYear, setCurrentYear] = useState<number>(2000);
  const [progress, setProgress] = useState<number>(0);
  const [warpStatus, setWarpStatus] = useState<string>('INICIANDO VÓRTICE TEMPORAL');
  const animationFrameId = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // High-fidelity transition duration (approx 6.8s of cinematic warp flow)
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

    // RAINBOW COLOR PALETTE: Magenta, Violet, Blue, Cyan, Green, Yellow, Orange
    const rainbowColors = [
      { r: 236, g: 72, b: 153 },  // Magenta / Rosa (#ec4899)
      { r: 168, g: 85, b: 247 },  // Violet / Roxo (#a855f7)
      { r: 59, g: 130, b: 246 },  // Blue / Azul (#3b82f6)
      { r: 6, g: 182, b: 212 },   // Cyan (#06b6d4)
      { r: 34, g: 197, b: 94 },   // Green / Verde (#22c55e)
      { r: 234, g: 179, b: 8 },   // Yellow / Amarelo (#eab308)
      { r: 249, g: 115, b: 22 },  // Orange / Laranja (#f97316)
    ];

    // Deep Space Target Palette
    const spaceDeepNavy = { r: 6, g: 43, b: 85 };     // #062B55
    const spaceDarkBlue = { r: 3, g: 21, b: 45 };     // #03152D
    const spaceDeepBlack = { r: 2, g: 8, b: 23 };     // #020817
    const spacePureBlack = { r: 0, g: 0, b: 0 };      // #000000
    const spaceElectricBlue = { r: 0, g: 140, b: 255 }; // #008CFF
    const spaceLuminousCyan = { r: 53, g: 207, b: 255 }; // #35CFFF

    // Initialize 600 particles for high-density light streaks and vortex depth
    const particleCount = 550;
    const particles: VortexParticle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        radius: Math.random() * Math.max(width, height) * 0.95 + 10,
        speed: (Math.random() * 0.04 + 0.015) * (Math.random() > 0.5 ? 1 : 1),
        radialSpeed: Math.random() * 3 + 1,
        size: Math.random() * 2.6 + 1.0,
        colorIndex: Math.floor(Math.random() * rainbowColors.length),
        alpha: Math.random() * 0.7 + 0.3,
        z: Math.random() * 1000 + 10,
        vz: Math.random() * 15 + 8,
        streakLength: Math.random() * 30 + 10,
        isStreak: Math.random() > 0.35,
      });
    }

    let spiralRotation = 0;
    let cameraZoom = 1.0;

    const render = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const rawP = Math.min(1, elapsed / TOTAL_DURATION_MS);
      setProgress(rawP);

      const centerX = width / 2;
      const centerY = height / 2;

      // Nonlinear Year Progression with milestones
      let year = 2000;
      if (rawP < 0.25) {
        year = Math.floor(2000 + (rawP / 0.25) * 8); // 2000 - 2008
      } else if (rawP < 0.55) {
        year = Math.floor(2008 + ((rawP - 0.25) / 0.30) * 10); // 2008 - 2018
      } else if (rawP < 0.85) {
        year = Math.floor(2018 + ((rawP - 0.55) / 0.30) * 6); // 2018 - 2024
      } else {
        year = Math.min(2026, Math.floor(2024 + ((rawP - 0.85) / 0.15) * 2)); // 2024 - 2026
      }
      setCurrentYear(year);

      // Phase labels
      if (rawP < 0.20) {
        setWarpStatus('1. ATIVAÇÃO DO VÓRTICE & ESPIRAL MULTICOLOR');
      } else if (rawP < 0.45) {
        setWarpStatus('2. ZOOM CONTÍNUO & ACELERAÇÃO TEMPORAL');
      } else if (rawP < 0.75) {
        setWarpStatus('3. TÚNEL DE LUZ & HIPERESPAÇO');
      } else if (rawP < 0.90) {
        setWarpStatus('4. DESACELERAÇÃO & TRANSIÇÃO AZUL PROFUNDO');
      } else {
        setWarpStatus('5. CHEGADA AO MATEUS SPACE 2026');
      }

      // =========================================================================
      // 1. BACKGROUND COLOR DYNAMICS & CONTINUOUS EVOLUTION:
      // MULTICOLOR -> ROXO -> AZUL -> AZUL PROFUNDO -> AZUL ESCURO -> PRETO ESPACIAL
      // =========================================================================
      let bgAlpha = 0.28;
      let bgHex = '#000206';

      if (rawP < 0.25) {
        // Early vortex: dark backdrop with subtle colorful cosmic smoke
        const t = rawP / 0.25;
        ctx.fillStyle = `rgba(${Math.floor(10 * (1 - t))}, ${Math.floor(4 + 8 * t)}, ${Math.floor(18 + 15 * t)}, 0.25)`;
      } else if (rawP < 0.50) {
        // Violet / Royal Blue stage
        const t = (rawP - 0.25) / 0.25;
        ctx.fillStyle = `rgba(${Math.floor(15 * (1 - t))}, ${Math.floor(10 + 12 * t)}, ${Math.floor(35 + 25 * t)}, 0.28)`;
      } else if (rawP < 0.75) {
        // Deep Blue / Cobalt tunnel
        const t = (rawP - 0.50) / 0.25;
        ctx.fillStyle = `rgba(${Math.floor(6 - 3 * t)}, ${Math.floor(22 - 10 * t)}, ${Math.floor(60 - 25 * t)}, 0.26)`;
      } else if (rawP < 0.92) {
        // Dark Blue (#03152D -> #020817)
        const t = (rawP - 0.75) / 0.17;
        ctx.fillStyle = `rgba(${Math.floor(3 - 1 * t)}, ${Math.floor(12 - 6 * t)}, ${Math.floor(35 - 18 * t)}, 0.24)`;
      } else {
        // Pure Space Black (#000000 / #020817)
        ctx.fillStyle = 'rgba(0, 2, 8, 0.22)';
      }
      ctx.fillRect(0, 0, width, height);

      // Camera continuous forward zoom
      if (rawP < 0.85) {
        cameraZoom += 0.008 + rawP * 0.018;
      } else {
        // Smooth deceleration
        cameraZoom += 0.002 * (1 - (rawP - 0.85) / 0.15);
      }

      // Spiral rotation speed progression
      let rotSpeed = 0.02;
      if (rawP < 0.25) {
        rotSpeed = 0.02 + rawP * 0.12; // Accelerating
      } else if (rawP < 0.75) {
        rotSpeed = 0.05 + Math.sin(rawP * Math.PI) * 0.04; // Hyper speed
      } else {
        // Decelerating into zero-gravity float
        const decelP = (rawP - 0.75) / 0.25;
        rotSpeed = Math.max(0.004, 0.06 * (1 - decelP));
      }
      spiralRotation += rotSpeed;

      // =========================================================================
      // 2. DRAW VORTEX SPIRAL FILAMENTS (MULTICOLOR TO DEEP BLUE SPACE)
      // =========================================================================
      const numArms = 6;
      const maxSpiralRadius = Math.max(width, height) * (1.1 + cameraZoom * 0.3);
      const spiralFade = rawP > 0.85 ? Math.max(0, 1 - (rawP - 0.85) / 0.15) : 1.0;

      if (spiralFade > 0.01) {
        for (let arm = 0; arm < numArms; arm++) {
          ctx.beginPath();
          const baseArmAngle = (arm * Math.PI * 2) / numArms + spiralRotation;

          // Color calculation per arm transitioning from Rainbow to Electric Blue / Cyan / Navy
          const colObj = rainbowColors[arm % rainbowColors.length];
          let r = colObj.r;
          let g = colObj.g;
          let b = colObj.b;

          // Color evolution logic:
          if (rawP >= 0.25 && rawP < 0.55) {
            // Shift towards Violet / Blue
            const mix = (rawP - 0.25) / 0.30;
            r = Math.floor(r * (1 - mix) + 90 * mix);
            g = Math.floor(g * (1 - mix) + 120 * mix);
            b = Math.floor(b * (1 - mix) + 250 * mix);
          } else if (rawP >= 0.55 && rawP < 0.80) {
            // Shift to Deep Blue & Electric Cyan
            const mix = (rawP - 0.55) / 0.25;
            r = Math.floor(r * (1 - mix) + spaceElectricBlue.r * mix);
            g = Math.floor(g * (1 - mix) + spaceElectricBlue.g * mix);
            b = Math.floor(b * (1 - mix) + spaceElectricBlue.b * mix);
          } else if (rawP >= 0.80) {
            // Shift to Luminous Cyan and Deep Navy
            const mix = (rawP - 0.80) / 0.20;
            r = Math.floor(r * (1 - mix) + spaceLuminousCyan.r * mix);
            g = Math.floor(g * (1 - mix) + spaceLuminousCyan.g * mix);
            b = Math.floor(b * (1 - mix) + spaceLuminousCyan.b * mix);
          }

          const armAlpha = (0.55 + Math.sin(spiralRotation + arm) * 0.2) * spiralFade;
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${armAlpha})`;
          ctx.lineWidth = rawP > 0.5 ? 2.8 : 2.0;

          let firstPoint = true;
          for (let radius = 12; radius < maxSpiralRadius; radius += 8) {
            // Logarithmic spiral with depth perspective expansion
            const theta = baseArmAngle + (radius * 0.006) * (1 + (rawP * 0.8));
            const px = centerX + Math.cos(theta) * radius;
            const py = centerY + Math.sin(theta) * radius;

            if (firstPoint) {
              ctx.moveTo(px, py);
              firstPoint = false;
            } else {
              ctx.lineTo(px, py);
            }
          }
          ctx.stroke();
        }
      }

      // =========================================================================
      // 3. LIGHT STREAKS & WARP PARTICLES (TUNNEL DE LUZ)
      // =========================================================================
      const isHyperTunnel = rawP >= 0.35 && rawP < 0.85;
      const isSpaceArrival = rawP >= 0.85;

      particles.forEach((p) => {
        if (!isSpaceArrival) {
          // In Vortex & Tunnel mode: particles swirl and pull inwards, then shoot past camera
          p.angle += p.speed * (1 + rawP * 2.5);
          
          if (isHyperTunnel) {
            // Particle expands rapidly away from center creating light streaks
            p.radius += (p.radialSpeed * 5 + rawP * 16);
            if (p.radius > Math.max(width, height) * 0.9) {
              p.radius = Math.random() * 40 + 5;
              p.angle = Math.random() * Math.PI * 2;
            }
          } else {
            // Suction vortex pulling towards center
            p.radius -= (p.radialSpeed * 1.5 + rawP * 4);
            if (p.radius < 8) {
              p.radius = Math.max(width, height) * 0.85;
              p.angle = Math.random() * Math.PI * 2;
            }
          }
        } else {
          // Zero-gravity gentle cosmic floating
          p.angle += 0.002;
          p.radius += Math.sin(p.angle) * 0.3;
        }

        // Particle Color Morphing:
        const baseColor = rainbowColors[p.colorIndex];
        let pr = baseColor.r;
        let pg = baseColor.g;
        let pb = baseColor.b;

        if (rawP >= 0.30 && rawP < 0.65) {
          // Morph to violet / royal blue
          const m = (rawP - 0.30) / 0.35;
          pr = Math.floor(pr * (1 - m) + 80 * m);
          pg = Math.floor(pg * (1 - m) + 140 * m);
          pb = Math.floor(pb * (1 - m) + 255 * m);
        } else if (rawP >= 0.65) {
          // Morph to Deep Space Cyan / White-Blue
          const m = (rawP - 0.65) / 0.35;
          pr = Math.floor(pr * (1 - m) + 53 * m);
          pg = Math.floor(pg * (1 - m) + 207 * m);
          pb = Math.floor(pb * (1 - m) + 255 * m);
        }

        const posX = centerX + Math.cos(p.angle) * p.radius;
        const posY = centerY + Math.sin(p.angle) * p.radius;

        // Draw light streak if in hyper speed tunnel
        if (isHyperTunnel && p.isStreak) {
          const streakLen = p.streakLength * (1 + rawP * 2);
          const streakAngle = Math.atan2(posY - centerY, posX - centerX);
          const tailX = posX - Math.cos(streakAngle) * streakLen;
          const tailY = posY - Math.sin(streakAngle) * streakLen;

          const streakGrad = ctx.createLinearGradient(tailX, tailY, posX, posY);
          streakGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
          streakGrad.addColorStop(0.6, `rgba(${pr}, ${pg}, ${pb}, ${p.alpha * 0.4})`);
          streakGrad.addColorStop(1, `rgba(255, 255, 255, ${p.alpha * 0.9})`);

          ctx.strokeStyle = streakGrad;
          ctx.lineWidth = Math.max(1, p.size * 0.9);
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(posX, posY);
          ctx.stroke();
        } else {
          // Circular particle with subtle halo
          ctx.fillStyle = `rgba(${pr}, ${pg}, ${pb}, ${p.alpha})`;
          ctx.beginPath();
          ctx.arc(posX, posY, Math.max(0.6, p.size * (isSpaceArrival ? 0.9 : 1.2)), 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // =========================================================================
      // 4. CENTRAL SINGULARITY & VORTEX DEPTH GLOW
      // =========================================================================
      const coreRadius = isSpaceArrival 
        ? Math.max(20, 220 * (1 - (rawP - 0.85) / 0.15)) 
        : Math.min(180, 50 + rawP * 120);

      const coreGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(15, coreRadius));
      coreGlow.addColorStop(0, '#ffffff');

      if (rawP < 0.30) {
        // Rainbow singularity core
        coreGlow.addColorStop(0.2, '#f472b6'); // Pink
        coreGlow.addColorStop(0.5, '#38bdf8'); // Cyan
        coreGlow.addColorStop(0.8, '#a855f7'); // Violet
      } else if (rawP < 0.65) {
        // Electric Blue / Violet core
        coreGlow.addColorStop(0.25, '#38bdf8');
        coreGlow.addColorStop(0.6, '#3b82f6');
        coreGlow.addColorStop(0.9, 'rgba(30, 58, 138, 0.4)');
      } else {
        // Deep Space Cyan / Navy opening
        coreGlow.addColorStop(0.2, '#35CFFF');
        coreGlow.addColorStop(0.55, '#008CFF');
        coreGlow.addColorStop(0.85, 'rgba(6, 43, 85, 0.5)');
      }
      coreGlow.addColorStop(1, 'transparent');

      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, Math.max(10, coreRadius), 0, Math.PI * 2);
      ctx.fill();

      // Energy pulse wave around singularity
      const pulseWaveRadius = ((elapsed * 0.12) % (Math.max(width, height) * 0.75));
      if (pulseWaveRadius > 10 && rawP < 0.92) {
        ctx.strokeStyle = `rgba(53, 207, 255, ${Math.max(0, 0.6 - pulseWaveRadius / 600)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseWaveRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (rawP < 1) {
        animationFrameId.current = requestAnimationFrame(render);
      } else {
        // Transition gracefully into Space mode
        setTimeout(() => {
          onComplete();
        }, 300);
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

      {/* Top HUD Status Bar */}
      <div className="relative z-10 p-3 sm:p-4 flex items-center justify-between backdrop-blur-md bg-black/50 border-b border-cyan-500/20 font-mono">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-950/90 border border-cyan-400/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Compass className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-cyan-300 to-blue-400">
                TRAVEL • TEMPORAL WARP
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-900/80 text-cyan-300 border border-cyan-500/40">
                {currentYear}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-0.5">
              <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>{warpStatus}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSkip}
          className="px-3.5 py-1.5 rounded-xl bg-black/70 hover:bg-blue-950 border border-cyan-500/50 hover:border-cyan-300 text-cyan-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 transition backdrop-blur-md"
        >
          <FastForward className="w-3.5 h-3.5 text-cyan-400" />
          <span>Avançar</span>
        </button>
      </div>

      {/* Center Year Odometer */}
      <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none my-auto space-y-3 px-4">
        <div className="text-8xl sm:text-9xl md:text-[140px] font-black font-vt323 tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-200 to-blue-500 drop-shadow-[0_0_50px_rgba(53,207,255,0.9)] animate-pulse">
          {currentYear}
        </div>

        <p className="text-xs sm:text-sm font-mono text-cyan-200 font-semibold max-w-lg text-center bg-black/75 px-5 py-2.5 rounded-2xl border border-cyan-500/40 backdrop-blur-lg shadow-[0_0_30px_rgba(0,140,255,0.25)]">
          {currentYear < 2008
            ? 'Origens nos Anos 2000 • Curiosidade, computação clássica & criatividade'
            : currentYear < 2018
            ? 'Formação & Trajetória • Administração, Logística & Estrutura Operacional'
            : currentYear < 2024
            ? 'Exército Brasileiro • Gestão de Suprimentos & Operações em Escala'
            : currentYear < 2026
            ? 'Engenharia de Prompt, IA Aplicada & Arquitetura de Sistemas Digitais'
            : 'MATEUS SPACE 2026 • ESPAÇO PROFUNDO & INTERFACES FUTURISTAS'}
        </p>
      </div>

      {/* Bottom Progress Bar */}
      <div className="relative z-10 p-3 sm:p-4 backdrop-blur-md bg-black/50 border-t border-cyan-500/20 font-mono space-y-2">
        <div className="flex justify-between text-[11px] text-slate-300">
          <span>Origem: 2000 (Retro OS)</span>
          <span className="text-cyan-300 font-bold">Destino: 2026 (Deep Blue Space)</span>
        </div>
        <div className="w-full bg-black/80 h-2.5 rounded-full border border-cyan-900/80 overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-pink-500 via-cyan-400 to-blue-600 rounded-full transition-all duration-75 shadow-[0_0_15px_rgba(53,207,255,0.8)]"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
