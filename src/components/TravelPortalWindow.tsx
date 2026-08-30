import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, X, Minimize2, Maximize2, RotateCcw, ArrowRight, ArrowLeft } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface TravelPortalWindowProps {
  mode: 'retro' | 'space';
  onClose: () => void;
  onEnterPortal: () => void;
  botEntering?: boolean;
}

export const TravelPortalWindow: React.FC<TravelPortalWindowProps> = ({
  mode,
  onClose,
  onEnterPortal,
  botEntering = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotationSpeed, setRotationSpeed] = useState<number>(0.002);
  const [spiralDepth, setSpiralDepth] = useState<number>(0.4);
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'pulling'>('idle');
  const animFrameRef = useRef<number | null>(null);
  const angleRef = useRef<number>(0);

  // When bot arrives or starts entering, spin up the vortex
  useEffect(() => {
    if (botEntering) {
      setPhase('spinning');
      try {
        soundFx.playMBotCurious();
      } catch (e) {}

      // Accelerate vortex
      let currentSpeed = 0.005;
      const accelInterval = setInterval(() => {
        currentSpeed += 0.008;
        setRotationSpeed(Math.min(0.08, currentSpeed));
        setSpiralDepth((prev) => Math.min(1.2, prev + 0.08));
        if (currentSpeed >= 0.07) {
          clearInterval(accelInterval);
          setPhase('pulling');
        }
      }, 100);

      return () => clearInterval(accelInterval);
    }
  }, [botEntering]);

  // Render Blue / Cyan / White deep portal vortex
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 460);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 340);

    const isBackward = mode === 'space'; // Backward rotation if leaving space back to 2000

    // Concentric spiral particles
    const particleCount = 140;
    const particles = Array.from({ length: particleCount }, () => ({
      dist: Math.random() * Math.min(width, height) * 0.48,
      baseAngle: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.01,
      size: Math.random() * 2 + 1,
      color: ['#ffffff', '#bae6fd', '#38bdf8', '#0284c7', '#1e3a8a', '#0369a1'][
        Math.floor(Math.random() * 6)
      ],
      z: Math.random(),
    }));

    const render = () => {
      const cx = width / 2;
      const cy = height / 2;

      // Deep space portal background (Dark navy/black)
      ctx.fillStyle = 'rgba(2, 6, 23, 0.35)';
      ctx.fillRect(0, 0, width, height);

      // Advance rotation angle (clockwise for forward, counter-clockwise for backward)
      const dir = isBackward ? -1 : 1;
      angleRef.current += rotationSpeed * dir;

      // 1. Draw Deep Vortex Tunnel Spiral Arms (Navy, Royal Blue, Cyan, Pure White)
      const arms = 4;
      const maxRadius = Math.min(width, height) * 0.52;

      ctx.save();
      ctx.translate(cx, cy);

      for (let arm = 0; arm < arms; arm++) {
        const armAngle = (arm * (Math.PI * 2)) / arms + angleRef.current;
        ctx.beginPath();

        for (let r = 2; r < maxRadius; r += 4) {
          const twist = (r / 25) * spiralDepth * dir;
          const theta = armAngle + twist;
          const px = Math.cos(theta) * r;
          const py = Math.sin(theta) * r;

          if (r === 2) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }

        const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, maxRadius);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.2, '#38bdf8');
        grad.addColorStop(0.55, '#0284c7');
        grad.addColorStop(0.85, '#1e3a8a');
        grad.addColorStop(1, 'rgba(2, 6, 23, 0)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 3.5;
        ctx.globalAlpha = 0.85;
        ctx.stroke();
      }

      // 2. Draw Infalling particles towards vortex center
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.dist -= (phase === 'pulling' ? 3.5 : phase === 'spinning' ? 1.8 : 0.4) * (p.z + 0.5);

        if (p.dist <= 4) {
          p.dist = Math.min(width, height) * 0.48;
          p.baseAngle = Math.random() * Math.PI * 2;
        }

        const curAngle = p.baseAngle + (angleRef.current * 1.5 + (1 - p.dist / maxRadius) * 4) * dir;
        const px = Math.cos(curAngle) * p.dist;
        const py = Math.sin(curAngle) * p.dist;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.min(1, p.dist / 40);
        ctx.beginPath();
        const pSize = Math.max(0.8, p.size * (p.dist / maxRadius));
        ctx.arc(px, py, pSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Central Event Horizon / Void (Dark deep hole in center)
      const holeGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 40);
      holeGrad.addColorStop(0, '#000000');
      holeGrad.addColorStop(0.6, '#020617');
      holeGrad.addColorStop(0.85, 'rgba(2, 6, 23, 0.8)');
      holeGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');

      ctx.fillStyle = holeGrad;
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 40, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Cyan Rim around center hole
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [mode, phase, rotationSpeed, spiralDepth]);

  return (
    <div
      id="travel-portal-window"
      className={`fixed z-30 shadow-2xl rounded-sm overflow-hidden select-none pointer-events-auto flex flex-col ${
        mode === 'retro'
          ? 'bg-[#c0c0c0] border-2 border-white border-r-gray-800 border-b-gray-800 text-black'
          : 'bg-slate-950/95 border border-cyan-500/50 text-white rounded-2xl backdrop-blur-2xl shadow-[0_0_40px_rgba(6,182,212,0.3)]'
      }`}
      style={{
        left: 'calc(50% - 240px)',
        top: 'calc(50% - 200px)',
        width: '480px',
        maxWidth: '94vw',
        height: '380px',
      }}
    >
      {/* Titlebar */}
      <div
        className={`px-3 py-1.5 flex items-center justify-between font-bold text-xs ${
          mode === 'retro'
            ? 'bg-gradient-to-r from-[#000080] to-[#1084d0] text-white shadow-xs'
            : 'bg-slate-900/90 border-b border-cyan-500/30 text-cyan-300 font-mono tracking-wider'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-base animate-pulse">🌀</span>
          <span>
            {mode === 'retro'
              ? 'TRAVEL.EXE — Portal Temporal 2000 ➔ 2026'
              : 'CHRONO // PORTAL 2026 ➔ 2000'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onClose}
            className={`p-1 rounded-xs cursor-pointer flex items-center justify-center ${
              mode === 'retro'
                ? 'bg-[#c0c0c0] text-black border border-white border-r-black border-b-black active:border-black active:border-r-white active:border-b-white hover:bg-gray-200'
                : 'hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg'
            }`}
            title="Fechar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Vortex Canvas Container */}
      <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

        {/* Informational overlay label */}
        <div className="absolute top-3 inset-x-0 flex justify-center pointer-events-none z-10">
          <span
            className={`px-3 py-1 text-[11px] font-mono rounded-full backdrop-blur-md ${
              mode === 'retro'
                ? 'bg-blue-950/80 text-cyan-300 border border-cyan-500/40'
                : 'bg-black/60 text-cyan-300 border border-cyan-400/40'
            }`}
          >
            {mode === 'retro'
              ? '✦ DESTINO: MATEUS SPACE (ANO 2026) ✦'
              : '✦ RETORNO: MATEUS OS (ANO 2000) ✦'}
          </span>
        </div>

        {/* Portal Status bottom indicator */}
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-none z-10">
          <span className="text-[10px] font-mono text-cyan-400/80 bg-black/60 px-2 py-0.5 rounded border border-cyan-900/60">
            {phase === 'pulling' ? 'ENTRANDO NO VÓRTICE...' : phase === 'spinning' ? 'VÓRTICE ATIVO' : 'PORTAL EM ESPERA'}
          </span>
          <button
            onClick={onEnterPortal}
            className="pointer-events-auto px-3 py-1 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.6)] flex items-center gap-1.5 active:scale-95 transition"
          >
            <span>{mode === 'retro' ? 'Entrar no Portal' : 'Iniciar Retorno'}</span>
            {mode === 'retro' ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
