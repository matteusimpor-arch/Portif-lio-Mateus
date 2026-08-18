import React, { useEffect, useRef } from 'react';

interface ParticleTextCanvasProps {
  isCompact?: boolean;
  reduceMotion?: boolean;
}

interface TextParticle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  baseAlpha: number;
  isSquare: boolean;
  isHalo?: boolean;
  orbitAngle?: number;
  orbitRadius?: number;
  orbitSpeed?: number;
}

export const ParticleTextCanvas: React.FC<ParticleTextCanvasProps> = ({
  isCompact = false,
  reduceMotion = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; radius: number }>({ x: -1000, y: -1000, radius: 130 });
  const animationFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<TextParticle[]>([]);
  const glitchRef = useRef<{ active: boolean; offsetY: number; height: number; shiftX: number; endTime: number }>({
    active: false,
    offsetY: 0,
    height: 0,
    shiftX: 0,
    endTime: 0
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    // Grand, high-impact canvas height for MATEUS \n ARAUJO
    let height = (canvas.height = isCompact ? 90 : Math.min(window.innerHeight * 0.58, 440));

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = isCompact ? 90 : Math.min(window.innerHeight * 0.58, 440);
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    const initParticles = () => {
      const offscreen = document.createElement('canvas');
      offscreen.width = width;
      offscreen.height = height;
      const offCtx = offscreen.getContext('2d');
      if (!offCtx) return;

      offCtx.fillStyle = '#ffffff';
      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';

      if (isCompact) {
        // Compact single-line signature when apps are open
        const fontSize = Math.min(width / 11, 44);
        offCtx.font = `900 ${fontSize}px 'VT323', monospace, sans-serif`;
        offCtx.fillText('MATEUS ARAUJO', width / 2, height / 2);
      } else {
        // Grand 2-line Hero: MATEUS \n ARAUJO (Significantly larger)
        const fontSize = Math.min(width / 6.2, Math.min(height * 0.44, 135));
        offCtx.font = `900 ${fontSize}px 'VT323', monospace, sans-serif`;
        const lineSpacing = fontSize * 0.88;
        offCtx.fillText('MATEUS', width / 2, height / 2 - lineSpacing / 2);
        offCtx.fillText('ARAUJO', width / 2, height / 2 + lineSpacing / 2);
      }

      const imgData = offCtx.getImageData(0, 0, width, height);
      const data = imgData.data;
      const particles: TextParticle[] = [];

      const step = width < 640 ? 3 : 2; // high-density dot matrix sampling

      // Color interpolation: EMERALD -> TEAL -> DIGITAL GREEN -> LIME
      const getDotMatrixColor = (yPos: number, xPos: number) => {
        const factor = Math.max(0, Math.min(1, yPos / height + (xPos / width) * 0.2 - 0.1));
        const jitter = (Math.random() - 0.5) * 0.15;
        const adjustedFactor = Math.max(0, Math.min(1, factor + jitter));

        if (adjustedFactor < 0.35) {
          const tealPalette = ['#2dd4bf', '#14b8a6', '#06b6d4', '#5eead4', '#38bdf8'];
          return tealPalette[Math.floor(Math.random() * tealPalette.length)];
        } else if (adjustedFactor < 0.7) {
          const greenPalette = ['#10b981', '#34d399', '#22c55e', '#4ade80', '#059669'];
          return greenPalette[Math.floor(Math.random() * greenPalette.length)];
        } else {
          const limePalette = ['#a3e635', '#84cc16', '#bef264', '#d9f99d', '#65a30d'];
          return limePalette[Math.floor(Math.random() * limePalette.length)];
        }
      };

      // 1. Core Dot Matrix Particles
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const index = (y * width + x) * 4;
          const alpha = data[index + 3];

          if (alpha > 120) {
            const color = getDotMatrixColor(y, x);
            const baseAlpha = Math.random() * 0.35 + 0.65;
            particles.push({
              x: x + (Math.random() - 0.5) * 6,
              y: y + (Math.random() - 0.5) * 6,
              originX: x,
              originY: y,
              vx: 0,
              vy: 0,
              size: Math.random() * 1.8 + 1.2,
              color,
              alpha: baseAlpha,
              baseAlpha,
              isSquare: Math.random() > 0.35,
              isHalo: false
            });
          }
        }
      }

      // 2. Halo of ambient floating particles around letters (escaping, breathing, orbiting)
      if (!isCompact) {
        const haloCount = Math.min(180, Math.floor(particles.length * 0.12));
        for (let i = 0; i < haloCount; i++) {
          const baseIndex = Math.floor(Math.random() * particles.length);
          const baseP = particles[baseIndex];
          if (baseP) {
            const orbitRadius = Math.random() * 28 + 6;
            const orbitAngle = Math.random() * Math.PI * 2;
            const orbitSpeed = (Math.random() - 0.5) * 0.035;

            particles.push({
              x: baseP.originX + Math.cos(orbitAngle) * orbitRadius,
              y: baseP.originY + Math.sin(orbitAngle) * orbitRadius,
              originX: baseP.originX,
              originY: baseP.originY,
              vx: 0,
              vy: 0,
              size: Math.random() * 1.4 + 0.8,
              color: baseP.color,
              alpha: Math.random() * 0.4 + 0.25,
              baseAlpha: Math.random() * 0.4 + 0.25,
              isSquare: Math.random() > 0.5,
              isHalo: true,
              orbitAngle,
              orbitRadius,
              orbitSpeed
            });
          }
        }
      }

      particlesRef.current = particles;
    };

    initParticles();

    // Micro Glitch Generator (100ms - 250ms duration, every 4 - 7 seconds)
    const glitchInterval = setInterval(() => {
      if (reduceMotion || Math.random() > 0.7) return;
      const glitchHeight = Math.random() * 32 + 15;
      const glitchY = Math.random() * (height - glitchHeight);
      const shift = (Math.random() - 0.5) * 16;
      const duration = Math.random() * 150 + 100;

      glitchRef.current = {
        active: true,
        offsetY: glitchY,
        height: glitchHeight,
        shiftX: shift,
        endTime: Date.now() + duration
      };
    }, 4500);

    // Physics Render Loop: Spring Physics + Magnetic Repulsion + Dot Matrix Drawing
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      const particles = particlesRef.current;
      const friction = 0.87;
      const ease = 0.08;
      const now = Date.now();

      const glitch = glitchRef.current;
      if (glitch.active && now > glitch.endTime) {
        glitch.active = false;
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!reduceMotion) {
          if (p.isHalo && p.orbitAngle !== undefined && p.orbitRadius !== undefined && p.orbitSpeed !== undefined) {
            // Halo breathing & orbiting
            p.orbitAngle += p.orbitSpeed;
            const targetX = p.originX + Math.cos(p.orbitAngle) * p.orbitRadius;
            const targetY = p.originY + Math.sin(p.orbitAngle) * p.orbitRadius;
            p.x += (targetX - p.x) * 0.1;
            p.y += (targetY - p.y) * 0.1;
          }

          // Magnetic cursor repulsion
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouse.radius && distance > 0) {
            const force = (mouse.radius - distance) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            p.vx -= Math.cos(angle) * force * 5.8;
            p.vy -= Math.sin(angle) * force * 5.8;
          }

          // Spring return to origin
          if (!p.isHalo) {
            const homeDx = p.originX - p.x;
            const homeDy = p.originY - p.y;
            p.vx += homeDx * ease;
            p.vy += homeDy * ease;
          }

          p.vx *= friction;
          p.vy *= friction;

          p.x += p.vx;
          p.y += p.vy;
        } else {
          p.x = p.originX;
          p.y = p.originY;
        }

        // Apply Micro Glitch displacement if within glitch slice
        let drawX = p.x;
        let drawY = p.y;
        let currentAlpha = p.alpha;

        if (glitch.active && p.originY >= glitch.offsetY && p.originY <= glitch.offsetY + glitch.height) {
          drawX += glitch.shiftX;
          currentAlpha = Math.min(1, p.alpha * 1.3);
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentAlpha;

        if (p.isSquare) {
          ctx.fillRect(drawX - p.size / 2, drawY - p.size / 2, p.size, p.size);
        } else {
          ctx.beginPath();
          ctx.arc(drawX, drawY, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      clearInterval(glitchInterval);
      window.removeEventListener('resize', handleResize);
    };
  }, [isCompact, reduceMotion]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current.x = e.clientX - rect.left;
    mouseRef.current.y = e.clientY - rect.top;
  };

  const handleMouseLeave = () => {
    mouseRef.current.x = -1000;
    mouseRef.current.y = -1000;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !e.touches[0]) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current.x = e.touches[0].clientX - rect.left;
    mouseRef.current.y = e.touches[0].clientY - rect.top;
  };

  return (
    <div className="w-full flex items-center justify-center relative select-none">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseLeave}
        className="cursor-pointer max-w-full touch-none filter drop-shadow-[0_0_45px_rgba(20,184,166,0.55)]"
      />
    </div>
  );
};
