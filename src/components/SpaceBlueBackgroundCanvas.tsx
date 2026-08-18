import React, { useEffect, useRef } from 'react';

interface SpaceBlueBackgroundCanvasProps {
  reduceMotion?: boolean;
  scrollProgress?: number; // 0 (Hero) to 1 (Apps)
}

interface UniverseParticle {
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
  layer: 'distant' | 'mid' | 'close'; // 3 Parallax Depths
  pulseSpeed: number;
  pulseAngle: number;
  isSquare: boolean;
  twinkleFactor: number;
}

export const SpaceBlueBackgroundCanvas: React.FC<SpaceBlueBackgroundCanvasProps> = ({
  reduceMotion = false,
  scrollProgress = 0
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; radius: number }>({ x: -1000, y: -1000, radius: 190 });
  const mouseParallaxRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<UniverseParticle[]>([]);
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

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initUniverseParticles();
    };

    window.addEventListener('resize', handleResize);

    const initUniverseParticles = () => {
      // Dynamic count based on screen area (~350 to 700 particles for rich cosmic depth)
      const totalCount = Math.min(650, Math.max(320, Math.floor((width * height) / 4600)));
      const particles: UniverseParticle[] = [];

      // Deep Blue Space Palette: Deep Navy, Midnight Blue, Royal Blue, Electric Blue, Cyan, White-Blue
      const distantColors = ['#0f172a', '#1e293b', '#0c1a38', '#13274f', '#1e3a8a'];
      const midColors = ['#1d4ed8', '#2563eb', '#3b82f6', '#0284c7', '#0369a1'];
      const closeColors = ['#60a5fa', '#38bdf8', '#22d3ee', '#06b6d4', '#e0f2fe'];

      for (let i = 0; i < totalCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const rand = Math.random();

        let layer: 'distant' | 'mid' | 'close' = 'distant';
        let size = 0.8;
        let color = '#1e293b';
        let baseAlpha = 0.25;
        let driftSpeed = 0.05;

        if (rand < 0.58) {
          // CAMADA DISTANTE: 58% - tiny deep navy/indigo background cosmic dust
          layer = 'distant';
          size = Math.random() * 0.9 + 0.5;
          color = distantColors[Math.floor(Math.random() * distantColors.length)];
          baseAlpha = Math.random() * 0.35 + 0.15;
          driftSpeed = Math.random() * 0.06 + 0.02;
        } else if (rand < 0.88) {
          // CAMADA MÉDIA: 30% - electric blue / ocean micro-points
          layer = 'mid';
          size = Math.random() * 1.3 + 0.9;
          color = midColors[Math.floor(Math.random() * midColors.length)];
          baseAlpha = Math.random() * 0.45 + 0.35;
          driftSpeed = Math.random() * 0.12 + 0.05;
        } else {
          // CAMADA PRÓXIMA: 12% - bright cyan & white-blue stars
          layer = 'close';
          size = Math.random() * 1.8 + 1.3;
          color = closeColors[Math.floor(Math.random() * closeColors.length)];
          baseAlpha = Math.random() * 0.4 + 0.6;
          driftSpeed = Math.random() * 0.22 + 0.08;
        }

        const driftAngle = Math.random() * Math.PI * 2;

        particles.push({
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
          pulseSpeed: Math.random() * 0.03 + 0.01,
          pulseAngle: Math.random() * Math.PI * 2,
          isSquare: Math.random() > 0.45,
          twinkleFactor: Math.random() * 0.4 + 0.6
        });
      }

      particlesRef.current = particles;
    };

    initUniverseParticles();

    // Mouse listener on window for organic space ripple & parallax
    const handleGlobalMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseParallaxRef.current.x = (e.clientX / width - 0.5) * 2;
      mouseParallaxRef.current.y = (e.clientY / height - 0.5) * 2;
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        mouseRef.current.x = e.touches[0].clientX;
        mouseRef.current.y = e.touches[0].clientY;
        mouseParallaxRef.current.x = (e.touches[0].clientX / width - 0.5) * 2;
        mouseParallaxRef.current.y = (e.touches[0].clientY / height - 0.5) * 2;
      }
    };

    const handleGlobalLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
      mouseParallaxRef.current.x = 0;
      mouseParallaxRef.current.y = 0;
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('touchmove', handleGlobalTouchMove);
    window.addEventListener('mouseleave', handleGlobalLeave);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. DEEP BLUE OUTER SPACE BASE: Deep Black (#000206) + Midnight Blue + Deep Navy
      const baseGrad = ctx.createLinearGradient(0, 0, width, height);
      baseGrad.addColorStop(0, '#000206');
      baseGrad.addColorStop(0.35, '#020b18');
      baseGrad.addColorStop(0.7, '#06132b');
      baseGrad.addColorStop(1, '#00040a');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, width, height);

      // Ambient radial lighting 1 (Deep Royal / Midnight Blue in center)
      const glow1 = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45,
        0,
        width * 0.5,
        height * 0.45,
        Math.max(width, height) * 0.7
      );
      glow1.addColorStop(0, 'rgba(14, 42, 92, 0.45)');
      glow1.addColorStop(0.55, 'rgba(4, 18, 48, 0.22)');
      glow1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, width, height);

      // Ambient radial lighting 2 (Luminous Electric Cyan in bottom-right)
      const glow2 = ctx.createRadialGradient(
        width * 0.78,
        height * 0.82,
        0,
        width * 0.78,
        height * 0.82,
        Math.max(10, width * 0.55)
      );
      glow2.addColorStop(0, 'rgba(6, 182, 212, 0.22)');
      glow2.addColorStop(0.65, 'rgba(2, 56, 110, 0.08)');
      glow2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, width, height);

      // Ambient radial lighting 3 (Electric Blue nebula in upper-left)
      const glow3 = ctx.createRadialGradient(
        width * 0.18,
        height * 0.22,
        0,
        width * 0.18,
        height * 0.22,
        Math.max(10, width * 0.48)
      );
      glow3.addColorStop(0, 'rgba(37, 99, 235, 0.25)');
      glow3.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow3;
      ctx.fillRect(0, 0, width, height);

      // 2. Microparticles Universe with 3 Parallax Layers, Camera Depth & Cursor Influence
      const mouse = mouseRef.current;
      const parallax = mouseParallaxRef.current;
      const particles = particlesRef.current;
      const scrollP = scrollProgressRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Layer Parallax Multiplier
        let parallaxFactor = 3;
        let scrollDepthShift = 0;
        if (p.layer === 'distant') {
          parallaxFactor = 4;
          scrollDepthShift = scrollP * 30;
        } else if (p.layer === 'mid') {
          parallaxFactor = 12;
          scrollDepthShift = scrollP * 70;
        } else if (p.layer === 'close') {
          parallaxFactor = 26;
          scrollDepthShift = scrollP * 140;
        }

        if (!reduceMotion) {
          // Natural drift
          p.x += p.driftVx;
          p.y += p.driftVy;

          // Wrap edges smoothly
          if (p.x < -20) p.x = width + 20;
          if (p.x > width + 20) p.x = -20;
          if (p.y < -20) p.y = height + 20;
          if (p.y > height + 20) p.y = -20;

          // Cursor field of influence (repel + wave)
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius && dist > 0) {
            const force = (mouse.radius - dist) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            p.vx -= Math.cos(angle) * force * (p.layer === 'close' ? 3.2 : 1.8);
            p.vy -= Math.sin(angle) * force * (p.layer === 'close' ? 3.2 : 1.8);
          }

          // Damping and spring return to drift track
          p.vx *= 0.91;
          p.vy *= 0.91;
          p.x += p.vx;
          p.y += p.vy;

          // Digital pulsing / star twinkling
          p.pulseAngle += p.pulseSpeed;
          p.alpha = p.baseAlpha * (0.65 + Math.sin(p.pulseAngle) * 0.35 * p.twinkleFactor);
        }

        // Draw particle with layer parallax offset & camera scroll depth
        const drawX = p.x + parallax.x * parallaxFactor;
        const drawY = p.y + parallax.y * parallaxFactor - scrollDepthShift;

        // Wrap vertically if shifted by scroll
        let finalY = drawY;
        while (finalY < -20) finalY += height + 40;
        while (finalY > height + 20) finalY -= height + 40;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));

        if (p.isSquare) {
          ctx.fillRect(drawX - p.size / 2, finalY - p.size / 2, Math.max(1, p.size), Math.max(1, p.size));
        } else {
          ctx.beginPath();
          ctx.arc(drawX, finalY, Math.max(0.1, p.size / 2), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('mouseleave', handleGlobalLeave);
    };
  }, [reduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};
