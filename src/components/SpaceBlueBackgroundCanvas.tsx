import React, { useEffect, useRef } from 'react';

interface SpaceBlueBackgroundCanvasProps {
  reduceMotion?: boolean;
  scrollProgress?: number; // 0 (Hero) to 1 (Apps)
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
  layer: 'background' | 'midground' | 'foreground'; // 3 Strict Depth Layers
  twinkleSpeed: number;
  twinkleAngle: number;
  isDigitalSquare: boolean;
}

export const SpaceBlueBackgroundCanvas: React.FC<SpaceBlueBackgroundCanvasProps> = ({
  reduceMotion = false,
  scrollProgress = 0
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; radius: number }>({ x: -1000, y: -1000, radius: 180 });
  const mouseParallaxRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);
  const starsRef = useRef<StarParticle[]>([]);
  const scrollProgressRef = useRef<number>(scrollProgress);

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
      // Dynamic star count tailored for performance and depth (reduced on mobile)
      const baseArea = (width * height) / 4500;
      let totalStars = Math.floor(baseArea);
      if (isMobile) totalStars = Math.min(180, Math.max(90, Math.floor(totalStars * 0.45)));
      else if (isTablet) totalStars = Math.min(320, Math.max(160, Math.floor(totalStars * 0.7)));
      else totalStars = Math.min(550, Math.max(260, totalStars));

      const stars: StarParticle[] = [];

      // Space Palette Colors
      const bgColors = ['#0f172a', '#1e293b', '#0c1a38', '#13274f', '#062b55'];
      const midColors = ['#0a3a70', '#1d4ed8', '#2563eb', '#0284c7', '#008cff'];
      const fgColors = ['#35cfff', '#38bdf8', '#22d3ee', '#ffffff', '#e0f2fe'];

      for (let i = 0; i < totalStars; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const rand = Math.random();

        let layer: 'background' | 'midground' | 'foreground' = 'background';
        let size = 0.7; // MICRO
        let color = bgColors[0];
        let baseAlpha = 0.25;
        let driftSpeed = 0.03;

        if (rand < 0.65) {
          // 1. BACKGROUND (65%): Micro stars, very distant, almost imperceptible parallax
          layer = 'background';
          size = Math.random() * 0.7 + 0.4; // 0.4px - 1.1px
          color = bgColors[Math.floor(Math.random() * bgColors.length)];
          baseAlpha = Math.random() * 0.35 + 0.15;
          driftSpeed = Math.random() * 0.04 + 0.01;
        } else if (rand < 0.90) {
          // 2. MIDGROUND (25%): Small stars, intermediate depth, medium parallax
          layer = 'midground';
          size = Math.random() * 0.9 + 1.0; // 1.0px - 1.9px
          color = midColors[Math.floor(Math.random() * midColors.length)];
          baseAlpha = Math.random() * 0.45 + 0.35;
          driftSpeed = Math.random() * 0.08 + 0.03;
        } else {
          // 3. FOREGROUND (10%): Medium bright stars (never oversized), high parallax
          layer = 'foreground';
          size = Math.random() * 1.1 + 1.6; // 1.6px - 2.7px (capped to avoid oversized circles)
          color = fgColors[Math.floor(Math.random() * fgColors.length)];
          baseAlpha = Math.random() * 0.4 + 0.6;
          driftSpeed = Math.random() * 0.14 + 0.05;
        }

        const driftAngle = Math.random() * Math.PI * 2;

        stars.push({
          x,
          y,
          originX: x,
          originY: y,
          vx: 0,
          vy: 0,
          driftVx: Math.cos(driftAngle) * driftSpeed,
          driftVy: Math.sin(driftAngle) * driftSpeed,
          size,
          color,
          alpha: baseAlpha,
          baseAlpha,
          layer,
          twinkleSpeed: Math.random() * 0.03 + 0.01,
          twinkleAngle: Math.random() * Math.PI * 2,
          isDigitalSquare: Math.random() > 0.65,
        });
      }

      starsRef.current = stars;
    };

    initStarfield();

    // Mouse listener for Parallax Depth Movement
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      // Normalized offset from center: -1.0 to +1.0
      mouseParallaxRef.current.x = (e.clientX / width - 0.5) * 2;
      mouseParallaxRef.current.y = (e.clientY / height - 0.5) * 2;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        mouseRef.current.x = e.touches[0].clientX;
        mouseRef.current.y = e.touches[0].clientY;
        mouseParallaxRef.current.x = (e.touches[0].clientX / width - 0.5) * 2;
        mouseParallaxRef.current.y = (e.touches[0].clientY / height - 0.5) * 2;
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
      mouseParallaxRef.current.x = 0;
      mouseParallaxRef.current.y = 0;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // =========================================================================
      // 1. COSMIC BASE GRADIENT: PRETO (#000000) + AZUL MUITO ESCURO (#020817, #03152D)
      // =========================================================================
      const baseGrad = ctx.createLinearGradient(0, 0, 0, height);
      baseGrad.addColorStop(0, '#000000');
      baseGrad.addColorStop(0.35, '#020817');
      baseGrad.addColorStop(0.70, '#03152D');
      baseGrad.addColorStop(1, '#000000');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, width, height);

      // =========================================================================
      // 2. DISCREET DEEP BLUE & NAVY NEBULAS (LOW OPACITY COSMIC DEPTH)
      // =========================================================================
      // Nebula 1: Center-left Deep Navy (#062B55)
      const nebula1 = ctx.createRadialGradient(
        width * 0.28,
        height * 0.35,
        0,
        width * 0.28,
        height * 0.35,
        Math.max(width, height) * 0.55
      );
      nebula1.addColorStop(0, 'rgba(6, 43, 85, 0.28)');
      nebula1.addColorStop(0.6, 'rgba(3, 21, 45, 0.12)');
      nebula1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, width, height);

      // Nebula 2: Bottom-right Soft Cyan / Electric Blue (#008CFF)
      const nebula2 = ctx.createRadialGradient(
        width * 0.75,
        height * 0.72,
        0,
        width * 0.75,
        height * 0.72,
        Math.max(width, height) * 0.48
      );
      nebula2.addColorStop(0, 'rgba(0, 140, 255, 0.14)');
      nebula2.addColorStop(0.55, 'rgba(10, 58, 112, 0.08)');
      nebula2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, width, height);

      // Nebula 3: Top-right Subtle Luminous Cyan (#35CFFF)
      const nebula3 = ctx.createRadialGradient(
        width * 0.85,
        height * 0.20,
        0,
        width * 0.85,
        height * 0.20,
        Math.max(width, height) * 0.40
      );
      nebula3.addColorStop(0, 'rgba(53, 207, 255, 0.08)');
      nebula3.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebula3;
      ctx.fillRect(0, 0, width, height);

      // =========================================================================
      // 3. STARFIELD WITH 3 PARALLAX LAYERS (FOREGROUND, MIDGROUND, BACKGROUND)
      // When mouse moves right, stars shift left (inverse parallax for realistic 3D depth)
      // =========================================================================
      const mouse = mouseRef.current;
      const parallax = mouseParallaxRef.current;
      const stars = starsRef.current;
      const scrollP = scrollProgressRef.current;

      const parallaxStrength = isMobile ? 0.35 : 1.0;

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Layer Parallax Multipliers:
        // Foreground: large displacement (e.g. -24px)
        // Midground: moderate displacement (e.g. -10px)
        // Background: almost imperceptible (e.g. -2.5px)
        let parallaxFactor = 2.5;
        let scrollShift = scrollP * 25;

        if (star.layer === 'background') {
          parallaxFactor = 2.5 * parallaxStrength;
          scrollShift = scrollP * 20;
        } else if (star.layer === 'midground') {
          parallaxFactor = 9.0 * parallaxStrength;
          scrollShift = scrollP * 55;
        } else if (star.layer === 'foreground') {
          parallaxFactor = 22.0 * parallaxStrength;
          scrollShift = scrollP * 110;
        }

        if (!reduceMotion) {
          // Autonomous slow zero-gravity drift
          star.x += star.driftVx;
          star.y += star.driftVy;

          // Wrap edges smoothly
          if (star.x < -15) star.x = width + 15;
          if (star.x > width + 15) star.x = -15;
          if (star.y < -15) star.y = height + 15;
          if (star.y > height + 15) star.y = -15;

          // Subtle organic twinkling
          star.twinkleAngle += star.twinkleSpeed;
          star.alpha = star.baseAlpha * (0.7 + Math.sin(star.twinkleAngle) * 0.3);

          // Interactive cursor proximity ripple
          const dx = mouse.x - star.x;
          const dy = mouse.y - star.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius && dist > 0) {
            const force = (mouse.radius - dist) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            const repelMul = star.layer === 'foreground' ? 2.2 : 1.1;
            star.vx -= Math.cos(angle) * force * repelMul;
            star.vy -= Math.sin(angle) * force * repelMul;
          }

          // Damping
          star.vx *= 0.92;
          star.vy *= 0.92;
          star.x += star.vx;
          star.y += star.vy;
        }

        // Draw star with inverse parallax shift
        // When mouse moves right (+X), parallax.x is > 0, so subtract to shift left!
        const drawX = star.x - parallax.x * parallaxFactor;
        const drawY = star.y - parallax.y * parallaxFactor - scrollShift;

        // Wrap vertically if shifted by scroll
        let finalY = drawY;
        while (finalY < -15) finalY += height + 30;
        while (finalY > height + 15) finalY -= height + 30;

        ctx.fillStyle = star.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, star.alpha));

        if (star.isDigitalSquare && star.layer !== 'background') {
          ctx.fillRect(drawX - star.size / 2, finalY - star.size / 2, Math.max(1, star.size), Math.max(1, star.size));
        } else {
          ctx.beginPath();
          ctx.arc(drawX, finalY, Math.max(0.3, star.size / 2), 0, Math.PI * 2);
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
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [reduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};
