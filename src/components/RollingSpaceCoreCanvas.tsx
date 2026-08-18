import React, { useEffect, useRef } from 'react';

interface RollingSpaceCoreCanvasProps {
  scrollProgress: number; // 0.0 to 1.0
  scrollVelocity?: number; // delta speed
  reduceMotion?: boolean;
}

interface OrbitFragment {
  angle: number;
  radius: number;
  speed: number;
  tilt: number;
  size: number;
  color: string;
  alpha: number;
}

export const RollingSpaceCoreCanvas: React.FC<RollingSpaceCoreCanvasProps> = ({
  scrollProgress,
  scrollVelocity = 0,
  reduceMotion = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const progressRef = useRef<number>(scrollProgress);
  const velocityRef = useRef<number>(scrollVelocity);
  const rotationXRef = useRef<number>(0);
  const rotationYRef = useRef<number>(0);
  const fragmentsRef = useRef<OrbitFragment[]>([]);

  useEffect(() => {
    progressRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    velocityRef.current = scrollVelocity;
  }, [scrollVelocity]);

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
    };
    window.addEventListener('resize', handleResize);

    // Initialize orbiting cosmic fragments around the sphere
    const fragmentCount = 38;
    const colors = ['#38bdf8', '#22d3ee', '#60a5fa', '#3b82f6', '#93c5fd', '#bae6fd'];
    const fragments: OrbitFragment[] = [];

    for (let i = 0; i < fragmentCount; i++) {
      fragments.push({
        angle: Math.random() * Math.PI * 2,
        radius: Math.random() * 45 + 55, // relative to sphere radius
        speed: (Math.random() * 0.02 + 0.01) * (Math.random() > 0.5 ? 1 : -1),
        tilt: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 2.2 + 1.0,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.5,
      });
    }
    fragmentsRef.current = fragments;

    let prevTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min(32, now - prevTime) / 1000;
      prevTime = now;

      ctx.clearRect(0, 0, width, height);

      const p = progressRef.current;
      const vel = velocityRef.current;

      // Only render when the sphere is active (p > 0.05)
      if (p > 0.04) {
        // Continuous rolling rotation proportional to scroll progress & velocity
        const rollSpeed = (0.35 + Math.abs(vel) * 2.5) * (vel >= 0 ? 1 : -1);
        if (!reduceMotion) {
          rotationXRef.current += rollSpeed * dt * 2.5;
          rotationYRef.current += (0.4 + p * 0.6) * dt;
        }

        const rotX = rotationXRef.current;
        const rotY = rotationYRef.current;

        // Path and position of the Digital Space Core / Rover sphere
        // 0% -> top center deep in space
        // 50% -> center of screen, larger
        // 100% -> central background nexus behind apps
        const startX = width * 0.5;
        const startY = height * 0.15;
        const midX = width * 0.5;
        const midY = height * 0.5;
        const endX = width * 0.5;
        const endY = height * 0.48;

        let sphereX = midX;
        let sphereY = midY;
        let baseRadius = 75;
        let sphereAlpha = 1;

        if (p < 0.5) {
          const t = (p - 0.04) / 0.46; // 0 to 1
          sphereX = startX + (midX - startX) * t;
          sphereY = startY + (midY - startY) * t;
          baseRadius = 25 + t * 65; // scales up as it emerges
          sphereAlpha = Math.min(1, t * 1.5);
        } else {
          const t = (p - 0.5) / 0.5; // 0 to 1
          sphereX = midX + (endX - midX) * t;
          sphereY = midY + (endY - midY) * t;
          baseRadius = 90 - t * 15; // settles at ~75px radius
          sphereAlpha = 1;
        }

        const radius = Math.max(10, baseRadius);

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, sphereAlpha));

        // 1. OUTER ENERGY HALO & AMBIENT RADIAL GLOW
        const haloGrad = ctx.createRadialGradient(
          sphereX,
          sphereY,
          radius * 0.4,
          sphereX,
          sphereY,
          radius * 2.4
        );
        haloGrad.addColorStop(0, 'rgba(37, 99, 235, 0.45)');
        haloGrad.addColorStop(0.4, 'rgba(6, 182, 212, 0.25)');
        haloGrad.addColorStop(0.75, 'rgba(2, 56, 110, 0.08)');
        haloGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(sphereX, sphereY, radius * 2.4, 0, Math.PI * 2);
        ctx.fill();

        // 2. SCANNER PULSE RINGS (Echo waves expanding when moving)
        const pulseProgress = (now * 0.0012) % 1;
        const pulseR = radius * (1.1 + pulseProgress * 1.6);
        const pulseAlpha = (1 - pulseProgress) * 0.45;
        ctx.strokeStyle = `rgba(34, 211, 238, ${pulseAlpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(sphereX, sphereY, Math.max(0.1, pulseR), 0, Math.PI * 2);
        ctx.stroke();

        // Secondary echoing pulse
        const pulse2Progress = ((now * 0.0012) + 0.5) % 1;
        const pulse2R = radius * (1.1 + pulse2Progress * 1.6);
        const pulse2Alpha = (1 - pulse2Progress) * 0.3;
        ctx.strokeStyle = `rgba(96, 165, 250, ${pulse2Alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(sphereX, sphereY, Math.max(0.1, pulse2R), 0, Math.PI * 2);
        ctx.stroke();

        // 3. 3D DIGITAL SPHERE BODY: Deep Midnight Blue Sphere
        const bodyGrad = ctx.createRadialGradient(
          sphereX - radius * 0.35,
          sphereY - radius * 0.35,
          radius * 0.1,
          sphereX,
          sphereY,
          radius
        );
        bodyGrad.addColorStop(0, '#60a5fa');
        bodyGrad.addColorStop(0.3, '#1d4ed8');
        bodyGrad.addColorStop(0.7, '#0f172a');
        bodyGrad.addColorStop(1, '#020617');

        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.arc(sphereX, sphereY, radius, 0, Math.PI * 2);
        ctx.fill();

        // 4. 3D DIGITAL LONGITUDE & LATITUDE WIREFRAME LINES
        ctx.save();
        ctx.beginPath();
        ctx.arc(sphereX, sphereY, radius, 0, Math.PI * 2);
        ctx.clip(); // Keep wireframe strictly inside sphere bounds

        // Longitude Lines (Vertical Meridian Rings rotating in 3D)
        const meridianCount = 6;
        for (let m = 0; m < meridianCount; m++) {
          const baseAngle = (m * Math.PI) / meridianCount + rotY;
          const cosAngle = Math.cos(baseAngle);

          ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.ellipse(
            sphereX,
            sphereY,
            Math.max(0.1, radius * Math.abs(cosAngle)),
            radius,
            rotX * 0.3,
            0,
            Math.PI * 2
          );
          ctx.stroke();
        }

        // Latitude Lines (Horizontal Parallel Rings rolling vertically)
        const latCount = 5;
        for (let l = 1; l < latCount; l++) {
          const latFraction = (l / latCount) * 2 - 1; // -1 to 1
          const ringYOffset = latFraction * radius * 0.85;
          const ringRadius = Math.sqrt(Math.max(0, radius * radius - ringYOffset * ringYOffset));

          // Apply vertical roll tilt
          const tiltedY = sphereY + ringYOffset * Math.cos(rotX * 0.5);
          const tiltedRadiusY = ringRadius * 0.35 * Math.abs(Math.sin(rotX * 0.5) + 0.5);

          ctx.strokeStyle = 'rgba(34, 211, 238, 0.35)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(
            sphereX,
            tiltedY,
            Math.max(0.1, ringRadius),
            Math.max(0.1, tiltedRadiusY),
            0,
            0,
            Math.PI * 2
          );
          ctx.stroke();
        }

        // Inner Digital Glowing Core Point
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(sphereX - radius * 0.2, sphereY - radius * 0.2, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 5. SPHERE RIM HIGHLIGHT
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sphereX, sphereY, radius, 0, Math.PI * 2);
        ctx.stroke();

        // 6. EQUATORIAL ORBITAL RING (Tilted planetary gyro ring)
        ctx.save();
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.65)';
        ctx.lineWidth = 1.8;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.ellipse(
          sphereX,
          sphereY,
          radius * 1.55,
          radius * 0.42,
          -0.35 + Math.sin(rotY * 0.5) * 0.1,
          0,
          Math.PI * 2
        );
        ctx.stroke();
        ctx.restore();

        // 7. ORBITING PARTICLES & SATELLITE FRAGMENTS
        const fragments = fragmentsRef.current;
        for (let i = 0; i < fragments.length; i++) {
          const f = fragments[i];
          if (!reduceMotion) {
            f.angle += f.speed;
          }

          const currentR = radius + f.radius;
          const fx = sphereX + Math.cos(f.angle) * currentR;
          const fy = sphereY + Math.sin(f.angle) * currentR * (0.45 + f.tilt);

          ctx.fillStyle = f.color;
          ctx.globalAlpha = Math.max(0, Math.min(1, sphereAlpha * f.alpha));
          ctx.beginPath();
          ctx.arc(fx, fy, Math.max(0.1, f.size), 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [reduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10 select-none"
    />
  );
};
