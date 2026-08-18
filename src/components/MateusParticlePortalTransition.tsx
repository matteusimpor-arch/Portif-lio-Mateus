import React, { useEffect, useRef, useState } from 'react';

export type TransitionType = 'open' | 'close' | 'switch';

export interface TransitionOriginRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ParticlePortalProps {
  isActive: boolean;
  transitionType: TransitionType;
  fromAppId: string | null;
  toAppId: string | null;
  toAppTitle?: string;
  originRect: TransitionOriginRect | null;
  onMidpointSwap: () => void;
  onComplete: () => void;
  reduceMotion?: boolean;
}

interface Particle3D {
  x: number;
  y: number;
  z: number; // 0 (background) to 1 (foreground)
  vx: number;
  vy: number;
  originX: number;
  originY: number;
  targetX: number;
  targetY: number;
  color: string;
  baseSize: number;
  currentSize: number;
  alpha: number;
  baseAlpha: number;
  curlOffset: number;
  speedMultiplier: number;
  layer: 'background' | 'midground' | 'foreground';
  isCharPoint?: boolean;
  isWireframePoint?: boolean;
  orbitAngle?: number;
  orbitRadius?: number;
}

// Metallic Tech-Noir Green Palette
const TECH_NOIR_COLORS = [
  '#10b981', // Emerald 500
  '#14b8a6', // Teal 500
  '#059669', // Emerald 600
  '#34d399', // Emerald 400
  '#2dd4bf', // Teal 400
  '#84cc16', // Lime 500
  '#a3e635', // Lime 400
  '#047857', // Emerald 700
  '#064e3b', // Deep Dark Green
  '#d1fae5', // Luminous Mint Highlight
  '#06b6d4', // Cyan 500
];

export const MateusParticlePortalTransition: React.FC<ParticlePortalProps> = ({
  isActive,
  transitionType,
  fromAppId,
  toAppId,
  toAppTitle = '',
  originRect,
  onMidpointSwap,
  onComplete,
  reduceMotion = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const hasSwappedRef = useRef<boolean>(false);
  const mousePosRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });

  // Display text state for particle letterforms
  const [activeGlitch, setActiveGlitch] = useState<boolean>(false);

  useEffect(() => {
    if (!isActive) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

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

    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Calculate Origin Point (x0, y0)
    let originX = width / 2;
    let originY = height / 2;
    if (originRect) {
      originX = originRect.x + originRect.width / 2;
      originY = originRect.y + originRect.height / 2;
    }

    // Determine Total Duration based on transition type
    let totalDuration = 950; // ms
    if (transitionType === 'close') totalDuration = 600;
    else if (transitionType === 'switch') totalDuration = 800;

    if (reduceMotion) {
      totalDuration = 400;
    }

    // Rasterize Target Title for Particle Text Formation (Phase 4)
    const titleText = toAppTitle || (toAppId ? toAppId.toUpperCase() : 'MATEUS SPACE');
    const textTargetPoints: { x: number; y: number }[] = [];

    if (transitionType !== 'close' && !reduceMotion) {
      const offCanvas = document.createElement('canvas');
      offCanvas.width = width;
      offCanvas.height = height;
      const offCtx = offCanvas.getContext('2d');
      if (offCtx) {
        const fontSize = Math.min(48, Math.max(24, Math.floor(width / 24)));
        offCtx.font = `900 ${fontSize}px "JetBrains Mono", monospace`;
        offCtx.fillStyle = '#ffffff';
        offCtx.textAlign = 'center';
        offCtx.textBaseline = 'middle';
        
        // Position title above center or top header area
        const titleY = height * 0.18;
        offCtx.fillText(titleText, width / 2, titleY);

        const imgData = offCtx.getImageData(0, 0, width, height);
        const gap = Math.max(4, Math.floor(width / 240));

        for (let py = 0; py < height; py += gap) {
          for (let px = 0; px < width; px += gap) {
            const index = (py * width + px) * 4;
            if (imgData.data[index + 3] > 140) {
              textTargetPoints.push({ x: px, y: py });
            }
          }
        }
      }
    }

    // Generate App-Specific Signature Formations (Nodes, Wireframes, Orbitals)
    const signaturePoints: { x: number; y: number; type: string }[] = [];
    const targetApp = toAppId || 'about';

    if (transitionType !== 'close' && !reduceMotion) {
      const centerX = width / 2;
      const centerY = height / 2;

      if (targetApp === 'about') {
        // Horizontal text/data scanlines
        for (let i = 0; i < 240; i++) {
          const row = i % 8;
          const col = Math.floor(i / 8);
          signaturePoints.push({
            x: centerX - 260 + col * 18,
            y: centerY - 80 + row * 24,
            type: 'scanline'
          });
        }
      } else if (targetApp === 'skills') {
        // Interconnected node matrix / neural constellation
        for (let i = 0; i < 180; i++) {
          const angle = (i / 180) * Math.PI * 4;
          const r = 50 + (i % 6) * 35;
          signaturePoints.push({
            x: centerX + Math.cos(angle) * r,
            y: centerY + Math.sin(angle) * (r * 0.65),
            type: 'network'
          });
        }
      } else if (targetApp === 'projects') {
        // Rectangular HUD brackets / bounding frame
        const wBox = Math.min(500, width * 0.65);
        const hBox = Math.min(320, height * 0.45);
        for (let i = 0; i < 200; i++) {
          const side = i % 4;
          const t = Math.random();
          let px = centerX;
          let py = centerY;
          if (side === 0) { px = centerX - wBox/2 + t * wBox; py = centerY - hBox/2; }
          else if (side === 1) { px = centerX + wBox/2; py = centerY - hBox/2 + t * hBox; }
          else if (side === 2) { px = centerX - wBox/2 + t * wBox; py = centerY + hBox/2; }
          else { px = centerX - wBox/2; py = centerY - hBox/2 + t * hBox; }
          signaturePoints.push({ x: px, y: py, type: 'bracket' });
        }
      } else if (targetApp === 'resume') {
        // Vertical cascading digital document
        for (let i = 0; i < 220; i++) {
          const col = (i % 12);
          const row = Math.floor(i / 12);
          signaturePoints.push({
            x: centerX - 180 + col * 30,
            y: centerY - 140 + row * 16,
            type: 'document'
          });
        }
      } else if (targetApp === 'now') {
        // Dual orbital vortex rings
        for (let i = 0; i < 240; i++) {
          const angle = (i / 120) * Math.PI * 2;
          const r = i < 120 ? 120 : 220;
          signaturePoints.push({
            x: centerX + Math.cos(angle) * r,
            y: centerY + Math.sin(angle) * (r * 0.5),
            type: 'orbit'
          });
        }
      } else if (targetApp === 'aims') {
        // Pulse communication waveform vectors
        for (let i = 0; i < 200; i++) {
          const x = centerX - 300 + (i / 200) * 600;
          const wave = Math.sin((i / 200) * Math.PI * 6) * 45;
          signaturePoints.push({ x, y: centerY + wave, type: 'pulse' });
        }
      } else if (targetApp === 'games') {
        // Retro pixel matrix dot array
        for (let i = 0; i < 200; i++) {
          const gx = (i % 20) * 16 - 160;
          const gy = Math.floor(i / 20) * 16 - 80;
          signaturePoints.push({ x: centerX + gx, y: centerY + gy, type: 'pixel' });
        }
      } else if (targetApp === 'contact') {
        // Radiant 360 communication rays
        for (let i = 0; i < 180; i++) {
          const angle = (i / 180) * Math.PI * 2;
          const r = 40 + (i % 4) * 50;
          signaturePoints.push({
            x: centerX + Math.cos(angle) * r,
            y: centerY + Math.sin(angle) * r,
            type: 'ray'
          });
        }
      }
    }

    // Initialize 3D Particles Pool
    const particleCount = reduceMotion ? 180 : Math.min(1800, Math.max(800, Math.floor((width * height) / 1200)));
    const particles: Particle3D[] = [];

    for (let i = 0; i < particleCount; i++) {
      const z = Math.random();
      let layer: 'background' | 'midground' | 'foreground' = 'midground';
      let baseSize = 2.0;
      let baseAlpha = 0.85;

      if (z < 0.35) {
        layer = 'background';
        baseSize = Math.random() * 1.4 + 0.8;
        baseAlpha = Math.random() * 0.4 + 0.3;
      } else if (z > 0.8) {
        layer = 'foreground';
        baseSize = Math.random() * 2.5 + 2.0;
        baseAlpha = Math.random() * 0.35 + 0.65;
      } else {
        layer = 'midground';
        baseSize = Math.random() * 1.8 + 1.4;
        baseAlpha = Math.random() * 0.4 + 0.55;
      }

      // Initial Bloom angle and explosive impulse out from origin
      const angle = Math.random() * Math.PI * 2;
      const initialDist = Math.random() * 25;
      const speed = Math.random() * 18 + 6;

      // Assign target: Title letterform point or signature formation point
      let targetX = width * 0.5 + (Math.random() - 0.5) * width * 0.8;
      let targetY = height * 0.5 + (Math.random() - 0.5) * height * 0.8;
      let isCharPoint = false;
      let isWireframePoint = false;

      if (textTargetPoints.length > 0 && i < textTargetPoints.length) {
        targetX = textTargetPoints[i].x;
        targetY = textTargetPoints[i].y;
        isCharPoint = true;
      } else if (signaturePoints.length > 0 && i < textTargetPoints.length + signaturePoints.length) {
        const sigIdx = i - textTargetPoints.length;
        targetX = signaturePoints[sigIdx].x;
        targetY = signaturePoints[sigIdx].y;
        isWireframePoint = true;
      }

      particles.push({
        x: originX + Math.cos(angle) * initialDist,
        y: originY + Math.sin(angle) * initialDist,
        z,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        originX,
        originY,
        targetX,
        targetY,
        color: TECH_NOIR_COLORS[Math.floor(Math.random() * TECH_NOIR_COLORS.length)],
        baseSize,
        currentSize: baseSize,
        alpha: baseAlpha,
        baseAlpha,
        curlOffset: Math.random() * Math.PI * 2,
        speedMultiplier: Math.random() * 0.6 + 0.7,
        layer,
        isCharPoint,
        isWireframePoint,
        orbitAngle: Math.random() * Math.PI * 2,
        orbitRadius: Math.random() * 180 + 40
      });
    }

    startTimeRef.current = performance.now();
    hasSwappedRef.current = false;

    // RENDER ANIMATION LOOP
    const renderLoop = (now: number) => {
      if (!startTimeRef.current) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(1, elapsed / totalDuration);

      // CLEAR WITH HIGH-PERFORMANCE BACKDROP
      ctx.clearRect(0, 0, width, height);

      // MIDPOINT SWAP TRIGGER: Peak Veil & Micro-Glitch (approx 50%-55% progress)
      if (progress >= 0.5 && !hasSwappedRef.current) {
        hasSwappedRef.current = true;
        onMidpointSwap();
        setActiveGlitch(true);
        setTimeout(() => setActiveGlitch(false), 120);
      }

      // 1. DIGITAL SHOCKWAVE / PULSE EXPANSION
      const maxRadius = Math.max(10, Math.sqrt(width * width + height * height) * 0.85);
      const waveProgress = Math.min(1, Math.max(0, progress * 2.0));
      const waveRadius = Math.max(0.1, waveProgress * maxRadius);
      const waveAlpha = Math.max(0, 1 - waveProgress) * 0.7;

      if (waveAlpha > 0.01 && !reduceMotion) {
        ctx.save();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = Math.max(2, 6 * (1 - waveProgress));
        ctx.globalAlpha = waveAlpha;
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 25;

        if (waveRadius > 0.5) {
          ctx.beginPath();
          ctx.arc(originX, originY, waveRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Secondary echoing pulse
        if (waveProgress > 0.2 && waveRadius * 0.7 > 0.5) {
          ctx.strokeStyle = '#14b8a6';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(originX, originY, Math.max(0.1, waveRadius * 0.7), 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 2. FULLSCREEN PARTICLE VEIL (Peak density at progress = 0.5)
      const veilOpacity = Math.max(0, Math.sin(progress * Math.PI));
      if (veilOpacity > 0.05) {
        const veilRadius = Math.max(10, Math.max(width, height) * 0.8);
        const grad = ctx.createRadialGradient(
          originX,
          originY,
          0,
          originX,
          originY,
          veilRadius
        );
        grad.addColorStop(0, `rgba(4, 30, 16, ${veilOpacity * 0.85})`);
        grad.addColorStop(0.5, `rgba(2, 18, 10, ${veilOpacity * 0.7})`);
        grad.addColorStop(1, `rgba(0, 4, 2, ${veilOpacity * 0.5})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      // 3. PARTICLE SIMULATION DYNAMICS
      const mouse = mousePosRef.current;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter'; // Additive Tech-Noir Glow

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // PHASE LOGIC
        if (progress < 0.45) {
          // PHASE 1 & 2: BLOOM & FLOW FIELD DISPERSION
          const bloomT = progress / 0.45;
          const curl = Math.sin(bloomT * 8 + p.curlOffset) * 2.8;
          
          p.x += (p.vx + curl) * p.speedMultiplier;
          p.y += (p.vy + Math.cos(bloomT * 6 + p.curlOffset) * 2.2) * p.speedMultiplier;
          p.vx *= 0.94;
          p.vy *= 0.94;

          // Shockwave ripple acceleration on impact
          const dxWave = p.x - originX;
          const dyWave = p.y - originY;
          const distWave = Math.sqrt(dxWave * dxWave + dyWave * dyWave);
          if (Math.abs(distWave - waveRadius) < 80) {
            const waveAngle = Math.atan2(dyWave, dxWave);
            p.vx += Math.cos(waveAngle) * 4;
            p.vy += Math.sin(waveAngle) * 4;
          }
        } else if (progress < 0.85) {
          // PHASE 3 & 4: CONVERGENCE TO TARGET COORDINATES (Letterforms & Structures)
          const convT = (progress - 0.45) / 0.4;
          const easeConv = 1 - Math.pow(1 - convT, 3); // Cubic Out

          // Pull towards targetX, targetY
          const dxTarget = p.targetX - p.x;
          const dyTarget = p.targetY - p.y;
          p.x += dxTarget * (0.14 + easeConv * 0.22);
          p.y += dyTarget * (0.14 + easeConv * 0.22);

          // Subtle orbital oscillation around target
          if (p.isCharPoint) {
            p.currentSize = p.baseSize * (1.1 + Math.sin(convT * 10 + p.curlOffset) * 0.2);
          }
        } else {
          // PHASE 5: DISSIPATION & RETURN TO SPACE UNIVERSE
          const dissT = (progress - 0.85) / 0.15;
          p.alpha = p.baseAlpha * (1 - dissT);
          p.x += (Math.random() - 0.5) * 1.5;
          p.y -= Math.random() * 2.0; // Gentle upward drift into space
        }

        // CURSOR MAGNETIC DEFLECTION
        const cdx = mouse.x - p.x;
        const cdy = mouse.y - p.y;
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
        if (cdist < 140 && cdist > 0) {
          const cforce = (140 - cdist) / 140;
          p.x -= (cdx / cdist) * cforce * 5;
          p.y -= (cdy / cdist) * cforce * 5;
        }

        // DRAW PARTICLE
        const drawAlpha = Math.max(0, Math.min(1, p.alpha * (p.layer === 'foreground' ? 1.2 : 0.8)));
        ctx.fillStyle = p.color;
        ctx.globalAlpha = drawAlpha;

        if (p.isCharPoint && progress > 0.5) {
          // High-luminous dot-matrix pixel for text letterforms
          ctx.shadowColor = '#2dd4bf';
          ctx.shadowBlur = 10;
          ctx.fillRect(p.x - p.currentSize / 2, p.y - p.currentSize / 2, p.currentSize * 1.3, p.currentSize * 1.3);
        } else {
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.8, p.currentSize), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 4. DRAW CONNECTIVE NEURAL LINES FOR 'SKILLS' / 'NETWORK'
      if (targetApp === 'skills' && progress > 0.55 && progress < 0.9) {
        ctx.strokeStyle = 'rgba(20, 184, 166, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let k = 0; k < Math.min(60, particles.length - 1); k += 3) {
          const p1 = particles[k];
          const p2 = particles[k + 1];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 90) {
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
          }
        }
        ctx.stroke();
      }

      ctx.restore();

      // 5. MICRO-GLITCH CANVAS SLICE DISTORTION (80ms at midpoint)
      if (progress >= 0.48 && progress <= 0.56 && !reduceMotion) {
        ctx.save();
        const sliceCount = 6;
        for (let s = 0; s < sliceCount; s++) {
          const sliceY = Math.random() * height;
          const sliceH = Math.random() * 24 + 10;
          const sliceOffset = (Math.random() - 0.5) * 22;
          ctx.drawImage(
            canvas,
            0, sliceY, width, sliceH,
            sliceOffset, sliceY, width, sliceH
          );
        }
        ctx.restore();
      }

      // CONTINUE LOOP OR COMPLETE
      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(renderLoop);
      } else {
        onComplete();
      }
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [
    isActive,
    transitionType,
    fromAppId,
    toAppId,
    toAppTitle,
    originRect,
    onMidpointSwap,
    onComplete,
    reduceMotion
  ]);

  if (!isActive) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] pointer-events-auto select-none overflow-hidden transition-all ${
        activeGlitch ? 'brightness-125 contrast-125' : ''
      }`}
      style={{ cursor: 'wait' }}
    >
      {/* Cinematic Tech-Noir Particle Portal Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />

      {/* Subtle Micro-Glitch Scanline Overlay */}
      {activeGlitch && (
        <div className="absolute inset-0 pointer-events-none bg-teal-500/10 mix-blend-screen animate-pulse" />
      )}
    </div>
  );
};
