import React, { useEffect, useRef } from 'react';
import { SpaceThemeId } from '../types';

interface ParticleTextCanvasProps {
  isCompact?: boolean;
  reduceMotion?: boolean;
  theme?: SpaceThemeId;
}

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  r: number;
  g: number;
  b: number;
  alpha: number;
  baseAlpha: number;
  isEdge: boolean;
  isAccent: boolean;
  isDust: boolean;
  driftAngle?: number;
  driftSpeed?: number;
  driftRadius?: number;
  sparkleOffset: number;
}

export const ParticleTextCanvas: React.FC<ParticleTextCanvasProps> = ({
  isCompact = false,
  reduceMotion = false,
  theme = 'space-blue',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; radius: number }>({
    x: -2000,
    y: -2000,
    radius: 75,
  });
  const animFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const shimmerRef = useRef<{ active: boolean; startTime: number; period: number }>({
    active: true,
    startTime: Date.now(),
    period: 8000, // Light sweep every 8 seconds
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = isCompact ? 60 : Math.min(window.innerHeight * 0.38, 190));

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = isCompact ? 60 : Math.min(window.innerHeight * 0.38, 190);
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    // Color gradient interpolation based on active Space Theme
    const getGradientColor = (ratio: number): { r: number; g: number; b: number } => {
      const clamped = Math.max(0, Math.min(1, ratio));

      let c1 = { r: 56, g: 189, b: 248 }; // #38BDF8
      let c2 = { r: 96, g: 165, b: 250 }; // #60A5FA
      let c3 = { r: 207, g: 250, b: 254 }; // #CFFAFE

      if (theme === 'aurora') {
        c1 = { r: 0, g: 245, b: 160 }; // #00F5A0 (emerald green)
        c2 = { r: 34, g: 211, b: 238 }; // #22D3EE (cyan)
        c3 = { r: 240, g: 253, b: 244 }; // Ice white/mint
      } else if (theme === 'void') {
        c1 = { r: 148, g: 163, b: 184 }; // #94A3B8
        c2 = { r: 203, g: 213, b: 225 }; // #CBD5E1
        c3 = { r: 255, g: 255, b: 255 }; // Pure white
      } else if (theme === 'violet') {
        c1 = { r: 168, g: 85, b: 247 }; // #A855F7
        c2 = { r: 129, g: 140, b: 248 }; // #818CF8
        c3 = { r: 224, g: 231, b: 255 }; // #E0E7FF
      } else if (theme === 'light-space') {
        c1 = { r: 2, g: 132, b: 199 }; // #0284C7
        c2 = { r: 37, g: 99, b: 235 }; // #2563EB
        c3 = { r: 56, g: 189, b: 248 }; // #38BDF8
      }

      if (clamped < 0.5) {
        const t = clamped / 0.5;
        return {
          r: Math.round(c1.r + (c2.r - c1.r) * t),
          g: Math.round(c1.g + (c2.g - c1.g) * t),
          b: Math.round(c1.b + (c2.b - c1.b) * t),
        };
      } else {
        const t = (clamped - 0.5) / 0.5;
        return {
          r: Math.round(c2.r + (c3.r - c2.r) * t),
          g: Math.round(c2.g + (c3.g - c2.g) * t),
          b: Math.round(c2.b + (c3.b - c2.b) * t),
        };
      }
    };

    const initParticles = () => {
      const offscreen = document.createElement('canvas');
      offscreen.width = width;
      offscreen.height = height;
      const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
      if (!offCtx) return;

      offCtx.fillStyle = '#ffffff';
      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';

      // Modern geometric font with sleek proportions
      const fontSize = Math.min(width / 13.5, Math.min(height * 0.44, 52));
      offCtx.font = `700 ${fontSize}px 'Orbitron', 'Space Grotesk', 'Michroma', -apple-system, sans-serif`;

      // Draw text with refined letter spacing
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
      const particles: Particle[] = [];

      const step = 2;
      const boundsMinX = (width - totalWidth) / 2;
      const boundsMaxX = boundsMinX + totalWidth;

      // 1. TEXT PARTICLES (PARTICLE GLASS LAYER)
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const idx = (y * width + x) * 4;
          const alpha = data[idx + 3];

          if (alpha > 85) {
            let isEdge = false;
            if (
              x <= step ||
              x >= width - step ||
              y <= step ||
              y >= height - step ||
              data[idx - step * 4 + 3] < 60 ||
              data[idx + step * 4 + 3] < 60 ||
              data[((y - step) * width + x) * 4 + 3] < 60 ||
              data[((y + step) * width + x) * 4 + 3] < 60
            ) {
              isEdge = true;
            }

            const xRatio = (x - boundsMinX) / Math.max(1, totalWidth);
            const baseColor = getGradientColor(xRatio);

            const isAccent = Math.random() < 0.035;
            const size = isAccent ? 1.6 : isEdge ? 1.15 : 0.95;
            const baseAlpha = isAccent ? 0.95 : isEdge ? 0.9 : 0.75;

            particles.push({
              x: x + (Math.random() - 0.5) * 0.8,
              y: y + (Math.random() - 0.5) * 0.8,
              originX: x,
              originY: y,
              vx: 0,
              vy: 0,
              size,
              baseSize: size,
              r: isAccent ? 255 : baseColor.r,
              g: isAccent ? 255 : baseColor.g,
              b: isAccent ? 255 : baseColor.b,
              alpha: baseAlpha,
              baseAlpha,
              isEdge,
              isAccent,
              isDust: false,
              sparkleOffset: Math.random() * Math.PI * 2,
            });
          }
        }
      }

      // 2. DIGITAL DUST (AMBIENT EXTERNAL LAYER AROUND THE NAME)
      if (!isCompact) {
        const dustCount = Math.min(120, Math.floor(particles.length * 0.09));
        for (let i = 0; i < dustCount; i++) {
          const randP = particles[Math.floor(Math.random() * particles.length)];
          if (randP) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 32 + 6;
            const originX = randP.originX + Math.cos(angle) * distance;
            const originY = randP.originY + Math.sin(angle) * distance;

            const xRatio = (originX - boundsMinX) / Math.max(1, totalWidth);
            const dustColor = getGradientColor(xRatio);

            particles.push({
              x: originX,
              y: originY,
              originX,
              originY,
              vx: 0,
              vy: 0,
              size: Math.random() * 0.8 + 0.5,
              baseSize: Math.random() * 0.8 + 0.5,
              r: dustColor.r,
              g: dustColor.g,
              b: dustColor.b,
              alpha: Math.random() * 0.25 + 0.15,
              baseAlpha: Math.random() * 0.25 + 0.15,
              isEdge: false,
              isAccent: false,
              isDust: true,
              driftAngle: angle,
              driftSpeed: (Math.random() - 0.5) * 0.015,
              driftRadius: Math.random() * 12 + 3,
              sparkleOffset: Math.random() * Math.PI * 2,
            });
          }
        }
      }

      particlesRef.current = particles;
    };

    if (document.fonts) {
      document.fonts.ready.then(() => {
        initParticles();
      });
    } else {
      initParticles();
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      const particles = particlesRef.current;
      const now = Date.now();

      const shimmerElapsed = (now - shimmerRef.current.startTime) % shimmerRef.current.period;
      const shimmerDuration = 1400;
      const isShimmering = shimmerElapsed < shimmerDuration;
      const shimmerX = isShimmering
        ? (shimmerElapsed / shimmerDuration) * (width + 200) - 100
        : -9999;
      const shimmerWidth = 85;

      const friction = 0.85;
      const ease = 0.08;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!reduceMotion) {
          if (
            p.isDust &&
            p.driftAngle !== undefined &&
            p.driftSpeed !== undefined &&
            p.driftRadius !== undefined
          ) {
            p.driftAngle += p.driftSpeed;
            const targetX = p.originX + Math.cos(p.driftAngle) * p.driftRadius;
            const targetY = p.originY + Math.sin(p.driftAngle) * p.driftRadius;
            p.x += (targetX - p.x) * 0.05;
            p.y += (targetY - p.y) * 0.05;
          }

          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius && dist > 0) {
            const force = (mouse.radius - dist) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            p.vx -= Math.cos(angle) * force * 1.6;
            p.vy -= Math.sin(angle) * force * 1.6;
          }

          if (!p.isDust) {
            const hx = p.originX - p.x;
            const hy = p.originY - p.y;
            p.vx += hx * ease;
            p.vy += hy * ease;
          }

          p.vx *= friction;
          p.vy *= friction;

          p.x += p.vx;
          p.y += p.vy;
        } else {
          p.x = p.originX;
          p.y = p.originY;
        }

        let brightness = 1;
        let sizeMultiplier = 1;
        if (isShimmering) {
          const beamDist = Math.abs(p.x - shimmerX);
          if (beamDist < shimmerWidth) {
            const beamFactor = Math.cos((beamDist / shimmerWidth) * (Math.PI / 2));
            brightness = 1 + beamFactor * 0.8;
            sizeMultiplier = 1 + beamFactor * 0.35;
          }
        }

        let alpha = p.baseAlpha;
        if (p.isAccent) {
          alpha = Math.min(1, p.baseAlpha + Math.sin(now * 0.003 + p.sparkleOffset) * 0.2);
        }

        const r = Math.min(255, Math.round(p.r * brightness));
        const g = Math.min(255, Math.round(p.g * brightness));
        const b = Math.min(255, Math.round(p.b * brightness));

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.min(1, alpha * (isShimmering ? brightness : 1))})`;

        const currentSize = p.size * sizeMultiplier;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, currentSize / 2), 0, Math.PI * 2);
        ctx.fill();

        if (p.isAccent && brightness > 1.2) {
          ctx.save();
          ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.6)`;
          ctx.shadowBlur = 4;
          ctx.fill();
          ctx.restore();
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [isCompact, reduceMotion, theme]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current.x = e.clientX - rect.left;
    mouseRef.current.y = e.clientY - rect.top;
  };

  const handleMouseLeave = () => {
    mouseRef.current.x = -2000;
    mouseRef.current.y = -2000;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !e.touches[0]) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current.x = e.touches[0].clientX - rect.left;
    mouseRef.current.y = e.touches[0].clientY - rect.top;
  };

  return (
    <div
      id="particle-text-wrapper"
      className="w-full flex items-center justify-center relative select-none py-1"
    >
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseLeave}
        className="cursor-default max-w-full touch-none filter drop-shadow-[0_0_16px_rgba(56,189,248,0.25)]"
      />
    </div>
  );
};
