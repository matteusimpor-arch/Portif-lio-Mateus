import React, { useEffect, useRef } from 'react';

interface SpaceGreenBackgroundCanvasProps {
  reduceMotion?: boolean;
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
}

export const SpaceGreenBackgroundCanvas: React.FC<SpaceGreenBackgroundCanvasProps> = ({
  reduceMotion = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; radius: number }>({ x: -1000, y: -1000, radius: 180 });
  const mouseParallaxRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<UniverseParticle[]>([]);

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
      // Dynamic count based on screen area (~400 to 750 particles for rich depth)
      const totalCount = Math.min(650, Math.max(300, Math.floor((width * height) / 4500)));
      const particles: UniverseParticle[] = [];

      // Tech-noir metallic green / emerald / teal / olive palette
      const distantColors = ['#062e1a', '#042217', '#083321', '#0a3d24'];
      const midColors = ['#10b981', '#059669', '#14b8a6', '#0d9488', '#22c55e'];
      const closeColors = ['#2dd4bf', '#34d399', '#4ade80', '#a3e635', '#bef264'];

      for (let i = 0; i < totalCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const rand = Math.random();

        let layer: 'distant' | 'mid' | 'close' = 'distant';
        let size = 0.8;
        let color = '#062e1a';
        let baseAlpha = 0.25;
        let driftSpeed = 0.05;

        if (rand < 0.55) {
          // CAMADA DISTANTE: 55% - tiny, darker, subtle points
          layer = 'distant';
          size = Math.random() * 0.9 + 0.5;
          color = distantColors[Math.floor(Math.random() * distantColors.length)];
          baseAlpha = Math.random() * 0.3 + 0.15;
          driftSpeed = Math.random() * 0.08 + 0.02;
        } else if (rand < 0.88) {
          // CAMADA MÉDIA: 33% - discrete green micro-points
          layer = 'mid';
          size = Math.random() * 1.3 + 0.9;
          color = midColors[Math.floor(Math.random() * midColors.length)];
          baseAlpha = Math.random() * 0.45 + 0.3;
          driftSpeed = Math.random() * 0.14 + 0.06;
        } else {
          // CAMADA PRÓXIMA: 12% - larger, luminous micro-pixels
          layer = 'close';
          size = Math.random() * 1.8 + 1.4;
          color = closeColors[Math.floor(Math.random() * closeColors.length)];
          baseAlpha = Math.random() * 0.5 + 0.5;
          driftSpeed = Math.random() * 0.25 + 0.1;
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
          pulseSpeed: Math.random() * 0.025 + 0.008,
          pulseAngle: Math.random() * Math.PI * 2,
          isSquare: Math.random() > 0.4
        });
      }

      particlesRef.current = particles;
    };

    initUniverseParticles();

    // Mouse listener on window for organic space ripple & parallax
    const handleGlobalMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      // Parallax offsets normalized from -1 to 1
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

      // 1. DEEP TECH-NOIR BASE: Deep Black (#000301) + Subtle Forest/Emerald/Teal Ambience
      const baseGrad = ctx.createLinearGradient(0, 0, width, height);
      baseGrad.addColorStop(0, '#000402');
      baseGrad.addColorStop(0.35, '#021209');
      baseGrad.addColorStop(0.7, '#04170d');
      baseGrad.addColorStop(1, '#000502');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, width, height);

      // Ambient radial lighting 1 (Dark Metallic Emerald in center)
      const glow1 = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45,
        0,
        width * 0.5,
        height * 0.45,
        Math.max(width, height) * 0.65
      );
      glow1.addColorStop(0, 'rgba(10, 48, 25, 0.4)');
      glow1.addColorStop(0.55, 'rgba(4, 25, 13, 0.2)');
      glow1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, width, height);

      // Ambient radial lighting 2 (Subtle Teal depth in bottom-right)
      const glow2 = ctx.createRadialGradient(
        width * 0.75,
        height * 0.8,
        0,
        width * 0.75,
        height * 0.8,
        width * 0.5
      );
      glow2.addColorStop(0, 'rgba(4, 48, 38, 0.28)');
      glow2.addColorStop(0.65, 'rgba(2, 22, 16, 0.08)');
      glow2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, width, height);

      // Ambient radial lighting 3 (Dark Olive nuance in upper-left)
      const glow3 = ctx.createRadialGradient(
        width * 0.2,
        height * 0.2,
        0,
        width * 0.2,
        height * 0.2,
        width * 0.45
      );
      glow3.addColorStop(0, 'rgba(24, 45, 14, 0.2)');
      glow3.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow3;
      ctx.fillRect(0, 0, width, height);

      // 2. Microparticles Universe with 3 Parallax Layers & Cursor Influence
      const mouse = mouseRef.current;
      const parallax = mouseParallaxRef.current;
      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Layer Parallax Multiplier
        let parallaxFactor = 3;
        if (p.layer === 'distant') parallaxFactor = 4;
        else if (p.layer === 'mid') parallaxFactor = 12;
        else if (p.layer === 'close') parallaxFactor = 24;

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

          // Digital pulsing
          p.pulseAngle += p.pulseSpeed;
          p.alpha = p.baseAlpha * (0.65 + Math.sin(p.pulseAngle) * 0.35);
        }

        // Draw particle with layer parallax offset
        const drawX = p.x + parallax.x * parallaxFactor;
        const drawY = p.y + parallax.y * parallaxFactor;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));

        if (p.isSquare) {
          ctx.fillRect(drawX - p.size / 2, drawY - p.size / 2, p.size, p.size);
        } else {
          ctx.beginPath();
          ctx.arc(drawX, drawY, p.size / 2, 0, Math.PI * 2);
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
