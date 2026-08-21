import React, { useEffect, useRef } from 'react';
import { SpaceWallpaperId } from '../types';

interface SpaceBlueBackgroundCanvasProps {
  reduceMotion?: boolean;
  scrollProgress?: number;
  wallpaperId?: SpaceWallpaperId;
  effectsEnabled?: boolean;
}

interface StarParticle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  driftVx: number;
  driftVy: number;
  size: number;
  color: string;
  alpha: number;
  baseAlpha: number;
  layer: 'background' | 'midground' | 'foreground';
  twinkleSpeed: number;
  twinkleAngle: number;
  isDigitalSquare: boolean;
}

export const SpaceBlueBackgroundCanvas: React.FC<SpaceBlueBackgroundCanvasProps> = ({
  reduceMotion = false,
  scrollProgress = 0,
  wallpaperId = 'deep-space',
  effectsEnabled = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; radius: number }>({ x: -1000, y: -1000, radius: 180 });
  const mouseParallaxRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);
  const starsRef = useRef<StarParticle[]>([]);
  const scrollProgressRef = useRef<number>(scrollProgress);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    scrollProgressRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStarfield();
    };

    window.addEventListener('resize', handleResize);

    const initStarfield = () => {
      const baseArea = (width * height) / 4500;
      let totalStars = Math.floor(baseArea);
      if (wallpaperId === 'digital-void') {
        totalStars = Math.floor(totalStars * 0.2); // Sparse stars in void
      } else if (isMobile) {
        totalStars = Math.min(180, Math.max(90, Math.floor(totalStars * 0.45)));
      } else if (isTablet) {
        totalStars = Math.min(320, Math.max(160, Math.floor(totalStars * 0.7)));
      } else {
        totalStars = Math.min(550, Math.max(260, totalStars));
      }

      const stars: StarParticle[] = [];

      let bgColors = ['#0f172a', '#1e293b', '#0c1a38', '#13274f', '#062b55'];
      let midColors = ['#0a3a70', '#1d4ed8', '#2563eb', '#0284c7', '#008cff'];
      let fgColors = ['#35cfff', '#38bdf8', '#22d3ee', '#ffffff', '#e0f2fe'];

      if (wallpaperId === 'aurora-space') {
        bgColors = ['#022c22', '#064e3b', '#065f46', '#047857'];
        midColors = ['#059669', '#10b981', '#34d399', '#22d3ee'];
        fgColors = ['#00F5A0', '#6ee7b7', '#a7f3d0', '#ffffff'];
      } else if (wallpaperId === 'violet-galaxy') {
        bgColors = ['#1e1b4b', '#2e1065', '#3b0764', '#172554'];
        midColors = ['#7c3aed', '#8b5cf6', '#6366f1', '#3b82f6'];
        fgColors = ['#c084fc', '#e879f9', '#38bdf8', '#ffffff'];
      } else if (wallpaperId === 'digital-void') {
        bgColors = ['#334155', '#475569'];
        midColors = ['#64748b', '#94a3b8'];
        fgColors = ['#cbd5e1', '#f8fafc', '#ffffff'];
      }

      for (let i = 0; i < totalStars; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const rand = Math.random();

        let layer: 'background' | 'midground' | 'foreground' = 'background';
        let size = 0.7;
        let color = bgColors[0];
        let baseAlpha = 0.25;
        let driftSpeed = 0.03;

        if (rand < 0.65) {
          layer = 'background';
          size = Math.random() * 0.7 + 0.4;
          color = bgColors[Math.floor(Math.random() * bgColors.length)];
          baseAlpha = Math.random() * 0.35 + 0.15;
          driftSpeed = Math.random() * 0.04 + 0.01;
        } else if (rand < 0.90) {
          layer = 'midground';
          size = Math.random() * 0.9 + 1.0;
          color = midColors[Math.floor(Math.random() * midColors.length)];
          baseAlpha = Math.random() * 0.45 + 0.35;
          driftSpeed = Math.random() * 0.08 + 0.03;
        } else {
          layer = 'foreground';
          size = Math.random() * 1.2 + 1.6;
          color = fgColors[Math.floor(Math.random() * fgColors.length)];
          baseAlpha = Math.random() * 0.4 + 0.6;
          driftSpeed = Math.random() * 0.15 + 0.06;
        }

        const angle = Math.random() * Math.PI * 2;
        const isDigitalSquare = Math.random() < 0.08;

        stars.push({
          x,
          y,
          originX: x,
          originY: y,
          vx: 0,
          vy: 0,
          driftVx: Math.cos(angle) * driftSpeed,
          driftVy: Math.sin(angle) * driftSpeed,
          size,
          color,
          alpha: baseAlpha,
          baseAlpha,
          layer,
          twinkleSpeed: Math.random() * 0.025 + 0.008,
          twinkleAngle: Math.random() * Math.PI * 2,
          isDigitalSquare,
        });
      }

      starsRef.current = stars;
    };

    initStarfield();

    const handleMouseMove = (e: MouseEvent) => {
      if (reduceMotion || !effectsEnabled) return;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      const normX = (e.clientX / width - 0.5) * 2;
      const normY = (e.clientY / height - 0.5) * 2;
      mouseParallaxRef.current = { x: normX, y: normY };
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
      mouseParallaxRef.current = { x: 0, y: 0 };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    const render = () => {
      timeRef.current += 0.015;
      const t = timeRef.current;
      const canAnimate = effectsEnabled && !reduceMotion;

      ctx.clearRect(0, 0, width, height);

      // --- 1. BASE BACKGROUND FILL & PROCEDURAL WALLPAPER EFFECTS ---
      if (wallpaperId === 'digital-void') {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
      } else if (wallpaperId === 'blue-nebula') {
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, '#020617');
        bgGrad.addColorStop(0.4, '#071A35');
        bgGrad.addColorStop(0.8, '#0b2046');
        bgGrad.addColorStop(1, '#020617');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Soft celestial nebula clouds
        const neb1 = ctx.createRadialGradient(width * 0.3, height * 0.4, 40, width * 0.3, height * 0.4, width * 0.5);
        neb1.addColorStop(0, 'rgba(14, 165, 233, 0.12)');
        neb1.addColorStop(0.5, 'rgba(34, 211, 238, 0.05)');
        neb1.addColorStop(1, 'rgba(2, 6, 23, 0)');
        ctx.fillStyle = neb1;
        ctx.fillRect(0, 0, width, height);

        const neb2 = ctx.createRadialGradient(width * 0.75, height * 0.6, 60, width * 0.75, height * 0.6, width * 0.45);
        neb2.addColorStop(0, 'rgba(56, 189, 248, 0.10)');
        neb2.addColorStop(1, 'rgba(2, 6, 23, 0)');
        ctx.fillStyle = neb2;
        ctx.fillRect(0, 0, width, height);
      } else if (wallpaperId === 'aurora-space') {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, '#020B0A');
        bgGrad.addColorStop(0.6, '#031a17');
        bgGrad.addColorStop(1, '#020B0A');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Undulating Aurora Waves
        ctx.save();
        const waveOffset = canAnimate ? Math.sin(t * 0.5) * 40 : 0;
        const auroraGrad = ctx.createLinearGradient(0, height * 0.2 + waveOffset, width, height * 0.6);
        auroraGrad.addColorStop(0, 'rgba(0, 245, 160, 0.08)');
        auroraGrad.addColorStop(0.5, 'rgba(34, 211, 238, 0.12)');
        auroraGrad.addColorStop(1, 'rgba(4, 120, 87, 0.04)');
        ctx.fillStyle = auroraGrad;
        ctx.beginPath();
        ctx.moveTo(0, height * 0.4);
        ctx.bezierCurveTo(width * 0.3, height * 0.2 + waveOffset, width * 0.7, height * 0.5 - waveOffset, width, height * 0.3);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else if (wallpaperId === 'violet-galaxy') {
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, '#050816');
        bgGrad.addColorStop(0.5, '#1e1035');
        bgGrad.addColorStop(1, '#050816');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        const neb = ctx.createRadialGradient(width * 0.5, height * 0.45, 30, width * 0.5, height * 0.45, width * 0.55);
        neb.addColorStop(0, 'rgba(139, 92, 246, 0.14)');
        neb.addColorStop(0.5, 'rgba(56, 189, 248, 0.06)');
        neb.addColorStop(1, 'rgba(5, 8, 22, 0)');
        ctx.fillStyle = neb;
        ctx.fillRect(0, 0, width, height);
      } else if (wallpaperId === 'cyber-grid') {
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, width, height);

        // Perspective Digital Floor Grid
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.lineWidth = 1;
        const horizon = height * 0.55;
        const vX = width / 2;

        // Perspective Rays
        for (let x = -width; x <= width * 2; x += width / 12) {
          ctx.beginPath();
          ctx.moveTo(vX, horizon);
          ctx.lineTo(x, height);
          ctx.stroke();
        }

        // Horizontal lines with perspective distance
        for (let y = horizon; y <= height; y += Math.max(4, (y - horizon) * 0.25 + 6)) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        ctx.restore();
      } else {
        // 'deep-space' (default)
        const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width * 0.8);
        bgGrad.addColorStop(0, '#040d21');
        bgGrad.addColorStop(0.7, '#020617');
        bgGrad.addColorStop(1, '#000206');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // --- 2. MULTI-LAYERED STARFIELD ---
      const stars = starsRef.current;
      const mouse = mouseRef.current;
      const parallax = mouseParallaxRef.current;

      const friction = 0.88;
      const ease = 0.04;

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        let pFactor = 4;
        if (star.layer === 'midground') pFactor = 12;
        if (star.layer === 'foreground') pFactor = 24;

        const targetX = star.originX + parallax.x * pFactor;
        const targetY = star.originY + parallax.y * pFactor;

        if (canAnimate) {
          star.x += (targetX - star.x) * ease;
          star.y += (targetY - star.y) * ease;

          star.x += star.driftVx;
          star.y += star.driftVy;

          if (star.x < -20) star.x = width + 20;
          if (star.x > width + 20) star.x = -20;
          if (star.y < -20) star.y = height + 20;
          if (star.y > height + 20) star.y = -20;

          // Gentle mouse repulsion
          const dx = mouse.x - star.x;
          const dy = mouse.y - star.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius && dist > 0) {
            const force = (mouse.radius - dist) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            const repelStrength = star.layer === 'foreground' ? 3.0 : 1.2;
            star.vx -= Math.cos(angle) * force * repelStrength;
            star.vy -= Math.sin(angle) * force * repelStrength;
          }

          star.vx *= friction;
          star.vy *= friction;
          star.x += star.vx;
          star.y += star.vy;

          star.twinkleAngle += star.twinkleSpeed;
          star.alpha = star.baseAlpha + Math.sin(star.twinkleAngle) * 0.18;
        } else {
          star.x = star.originX;
          star.y = star.originY;
          star.alpha = star.baseAlpha;
        }

        ctx.fillStyle = star.color;
        ctx.globalAlpha = Math.max(0.05, Math.min(1, star.alpha));

        if (star.isDigitalSquare) {
          ctx.fillRect(star.x - star.size / 2, star.y - star.size / 2, star.size, star.size);
        } else {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1.0;
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [reduceMotion, wallpaperId, effectsEnabled]);

  return (
    <canvas
      ref={canvasRef}
      id="space-dynamic-wallpaper-canvas"
      className="fixed inset-0 pointer-events-none z-0 select-none"
    />
  );
};
