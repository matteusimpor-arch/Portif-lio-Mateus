import React, { useEffect, useRef, useState } from 'react';

export type ScreensaverType =
  | 'matrix_rain'
  | 'particle_name'
  | 'crt_terminal'
  | 'particle_orbit'
  | 'starfield'
  | 'retro_bounce'
  | 'flying_windows';

interface ScreensaverCanvasProps {
  onWakeUp: () => void;
  reduceMotion?: boolean;
}

export const ScreensaverCanvas: React.FC<ScreensaverCanvasProps> = ({
  onWakeUp,
  reduceMotion = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Random screensaver selection with priority for signature modes
  const [activeMode] = useState<ScreensaverType>(() => {
    const signatureModes: ScreensaverType[] = ['starfield', 'particle_name', 'particle_orbit'];
    const otherModes: ScreensaverType[] = [
      'matrix_rain',
      'crt_terminal',
      'retro_bounce',
      'flying_windows'
    ];
    // 65% chance for signature blue space modes
    if (Math.random() < 0.65) {
      return signatureModes[Math.floor(Math.random() * signatureModes.length)];
    }
    return otherModes[Math.floor(Math.random() * otherModes.length)];
  });

  useEffect(() => {
    // Listen for any wake up event
    const handleActivity = () => {
      onWakeUp();
    };

    window.addEventListener('mousemove', handleActivity, { once: true });
    window.addEventListener('mousedown', handleActivity, { once: true });
    window.addEventListener('keydown', handleActivity, { once: true });
    window.addEventListener('touchstart', handleActivity, { once: true });
    window.addEventListener('wheel', handleActivity, { once: true });

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('wheel', handleActivity);
    };
  }, [onWakeUp]);

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

    const startTime = Date.now();

    // =========================================================================
    // 1. MATRIX DIGITAL RAIN → MATEUS ARAUJO STATE
    // =========================================================================
    const matrixChars = '01MATEUSARAUJO2026XYZ89#*+<>/~_$%&@=';
    const matrixFontSize = 15;
    const columns = Math.floor(width / matrixFontSize);
    const drops = Array.from({ length: columns }, () => Math.random() * -100);
    const dropSpeeds = Array.from({ length: columns }, () => Math.random() * 0.8 + 0.6);

    // Target positions for MATEUS \n ARAUJO convergence
    const nameOffscreen = document.createElement('canvas');
    nameOffscreen.width = width;
    nameOffscreen.height = height;
    const nameCtx = nameOffscreen.getContext('2d');
    const nameTargets: { x: number; y: number }[] = [];

    if (nameCtx) {
      const fontSize = Math.min(width / 7.5, 95);
      nameCtx.font = `900 ${fontSize}px 'VT323', monospace, sans-serif`;
      nameCtx.fillStyle = '#ffffff';
      nameCtx.textAlign = 'center';
      nameCtx.textBaseline = 'middle';
      nameCtx.fillText('MATEUS', width / 2, height / 2 - fontSize * 0.45);
      nameCtx.fillText('ARAUJO', width / 2, height / 2 + fontSize * 0.45);

      const imgData = nameCtx.getImageData(0, 0, width, height).data;
      for (let y = 0; y < height; y += 4) {
        for (let x = 0; x < width; x += 4) {
          if (imgData[(y * width + x) * 4 + 3] > 140) {
            nameTargets.push({ x, y });
          }
        }
      }
    }

    // =========================================================================
    // 2. PARTICLE NAME SCREENSAVER STATE (BLUE SPACE PALETTE)
    // =========================================================================
    const particleCount = Math.min(600, nameTargets.length || 300);
    const blueParticles = Array.from({ length: particleCount }, (_, i) => {
      const target = nameTargets[i % (nameTargets.length || 1)] || { x: width / 2, y: height / 2 };
      const startAngle = Math.random() * Math.PI * 2;
      const startDist = Math.random() * Math.max(width, height) * 0.7 + 100;
      return {
        x: width / 2 + Math.cos(startAngle) * startDist,
        y: height / 2 + Math.sin(startAngle) * startDist,
        targetX: target.x,
        targetY: target.y,
        originX: width / 2 + Math.cos(startAngle) * startDist,
        originY: height / 2 + Math.sin(startAngle) * startDist,
        size: Math.random() * 2 + 1.2,
        color: ['#38bdf8', '#22d3ee', '#60a5fa', '#3b82f6', '#93c5fd', '#bae6fd'][Math.floor(Math.random() * 6)],
        alpha: Math.random() * 0.4 + 0.6
      };
    });

    // =========================================================================
    // 3. RETRO BOUNCE STATE
    // =========================================================================
    let bounceX = width / 2;
    let bounceY = height / 2;
    let bounceVx = 2.4;
    let bounceVy = 1.8;
    const bounceColors = ['#38bdf8', '#22d3ee', '#60a5fa', '#3b82f6', '#e0f2fe'];
    let bounceColorIdx = 0;

    // =========================================================================
    // 4. STARFIELD STATE (DEEP BLUE SPACE)
    // =========================================================================
    const stars = Array.from({ length: 320 }, () => ({
      x: (Math.random() - 0.5) * width * 2,
      y: (Math.random() - 0.5) * height * 2,
      z: Math.random() * 1000 + 1
    }));

    // =========================================================================
    // 5. FLYING WINDOWS STATE
    // =========================================================================
    const windowTitles = ['MATEUS OS 2000', 'MATEUS.EXE', 'SPACE_2026.SYS', 'LOGISTICS_AI', 'PROMPT_ENG', '2000 ➔ 2026'];
    const flyingWindows = Array.from({ length: 7 }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      w: 160,
      h: 110,
      title: windowTitles[i % windowTitles.length],
      color: ['#38bdf8', '#60a5fa', '#3b82f6'][i % 3]
    }));

    // =========================================================================
    // MAIN RENDER LOOP FOR ALL SCREENSAVERS
    // =========================================================================
    const render = () => {
      const elapsed = (Date.now() - startTime) / 1000;

      // Deep Blue Outer Space background with motion blur
      ctx.fillStyle = 'rgba(0, 2, 6, 0.22)';
      ctx.fillRect(0, 0, width, height);

      switch (activeMode) {
        // ---------------------------------------------------------------------
        // MATRIX DIGITAL RAIN (RETRO GREEN)
        // ---------------------------------------------------------------------
        case 'matrix_rain': {
          const cycleTime = elapsed % 24;
          const isConverging = cycleTime >= 7 && cycleTime <= 19;
          const convergenceProgress = isConverging ? Math.min(1, (cycleTime - 7) / 3.5) : 0;
          const dissolveProgress = cycleTime > 19 ? Math.min(1, (cycleTime - 19) / 4) : 0;

          ctx.font = `${matrixFontSize}px 'VT323', monospace`;

          for (let i = 0; i < drops.length; i++) {
            const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
            const x = i * matrixFontSize;
            const y = drops[i] * matrixFontSize;

            const isLeading = Math.random() > 0.88;
            ctx.fillStyle = isLeading ? '#a3e635' : (i % 3 === 0 ? '#14b8a6' : '#10b981');
            ctx.globalAlpha = isLeading ? 0.95 : Math.max(0.2, 0.8 - (y / height) * 0.4);

            ctx.fillText(char, x, y);

            if (drops[i] * matrixFontSize > height && Math.random() > 0.975) {
              drops[i] = 0;
            }
            drops[i] += dropSpeeds[i];
          }

          if (isConverging && nameTargets.length > 0) {
            const pulse = 1 + Math.sin(elapsed * 4) * 0.03;
            const alpha = dissolveProgress > 0 ? (1 - dissolveProgress) : convergenceProgress;
            ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

            const sampleStep = width < 640 ? 3 : 2;
            for (let i = 0; i < nameTargets.length; i += sampleStep) {
              const target = nameTargets[i];
              const tX = width / 2 + (target.x - width / 2) * pulse;
              const tY = height / 2 + (target.y - height / 2) * pulse;

              const originX = (i % columns) * matrixFontSize;
              const originY = ((i * 13) % Math.floor(height / matrixFontSize)) * matrixFontSize;

              const currX = originX + (tX - originX) * convergenceProgress;
              const currY = originY + (tY - originY) * convergenceProgress;

              ctx.fillStyle = target.y < height / 2 ? '#2dd4bf' : '#84cc16';
              ctx.fillRect(currX, currY, 2.5, 2.5);
            }
          }
          break;
        }

        // ---------------------------------------------------------------------
        // PARTICLE NAME SCREENSAVER (BLUE SPACE)
        // ---------------------------------------------------------------------
        case 'particle_name': {
          const cycleTime = elapsed % 18;
          let gather = 0;

          if (cycleTime < 6) {
            gather = cycleTime / 6;
          } else if (cycleTime < 13) {
            gather = 1;
          } else {
            gather = 1 - (cycleTime - 13) / 5;
          }

          const pulse = 1 + Math.sin(elapsed * 2.5) * 0.02;

          for (let i = 0; i < blueParticles.length; i++) {
            const p = blueParticles[i];
            const targetX = width / 2 + (p.targetX - width / 2) * pulse;
            const targetY = height / 2 + (p.targetY - height / 2) * pulse;

            const orbitAngle = elapsed * 0.5 + i;
            const orbitRadius = 140 + Math.sin(elapsed + i) * 60;
            const floatX = width / 2 + Math.cos(orbitAngle) * (width * 0.35 + orbitRadius);
            const floatY = height / 2 + Math.sin(orbitAngle) * (height * 0.3 + orbitRadius);

            const currX = floatX + (targetX - floatX) * gather;
            const currY = floatY + (targetY - floatY) * gather;

            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha * (0.4 + gather * 0.6);
            ctx.fillRect(currX - p.size / 2, currY - p.size / 2, Math.max(1, p.size), Math.max(1, p.size));
          }
          break;
        }

        // ---------------------------------------------------------------------
        // CRT TERMINAL SCREENSAVER
        // ---------------------------------------------------------------------
        case 'crt_terminal': {
          ctx.fillStyle = '#010511';
          ctx.fillRect(0, 0, width, height);

          // CRT Scanlines
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.08)';
          ctx.lineWidth = 1;
          for (let y = 0; y < height; y += 3) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
          }

          // Terminal text typing effect
          const terminalLines = [
            'MATEUS SPACE 2026 // BLUE SPACE ENGINE',
            'STATUS: IDLE SCREENSAVER ACTIVE [ONLINE]',
            'ORBITAL ROVER: DIGITAL SPACE CORE SYNCHRONIZED',
            'USER: MATEUS ARAUJO [PORTFOLIO 2026]',
            '8 MODULES READY FOR DISCOVERY',
            'MOVE CURSOR OR TOUCH SCREEN TO RETURN...'
          ];

          ctx.font = "18px 'VT323', monospace";
          ctx.fillStyle = '#38bdf8';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#0284c7';

          const lineCount = Math.min(terminalLines.length, Math.floor(elapsed * 1.5) + 1);
          for (let l = 0; l < lineCount; l++) {
            ctx.fillText(`> ${terminalLines[l]}`, 40, 80 + l * 32);
          }

          // Blinking cursor
          if (Math.floor(elapsed * 2) % 2 === 0) {
            ctx.fillRect(40 + (terminalLines[Math.min(lineCount - 1, terminalLines.length - 1)]?.length || 0) * 11 + 10, 80 + (lineCount - 1) * 32 - 14, 10, 16);
          }
          ctx.shadowBlur = 0;
          break;
        }

        // ---------------------------------------------------------------------
        // PARTICLE ORBIT SCREENSAVER (BLUE SPACE GYRO)
        // ---------------------------------------------------------------------
        case 'particle_orbit': {
          const ringCount = 5;
          const centerX = width / 2;
          const centerY = height / 2;

          for (let r = 0; r < ringCount; r++) {
            const radiusX = (width * 0.15) * (r + 1);
            const radiusY = (height * 0.12) * (r + 1);
            const tilt = (r % 2 === 0 ? 0.3 : -0.3);

            ctx.strokeStyle = `rgba(56, 189, 248, ${0.18 - r * 0.025})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, Math.max(0.1, radiusX), Math.max(0.1, radiusY), tilt + elapsed * 0.05, 0, Math.PI * 2);
            ctx.stroke();

            // Orbiting nodes on this ring
            const nodeAngle = elapsed * (0.8 / (r + 1)) + r;
            const nodeX = centerX + Math.cos(nodeAngle) * radiusX;
            const nodeY = centerY + Math.sin(nodeAngle) * radiusY;

            ctx.fillStyle = r % 2 === 0 ? '#38bdf8' : '#60a5fa';
            ctx.beginPath();
            ctx.arc(nodeX, nodeY, 4, 0, Math.PI * 2);
            ctx.fill();
          }

          // Center Logo
          ctx.font = "28px 'VT323', monospace";
          ctx.fillStyle = '#38bdf8';
          ctx.textAlign = 'center';
          ctx.fillText('MATEUS SPACE 2026', centerX, centerY);
          break;
        }

        // ---------------------------------------------------------------------
        // STARFIELD / HYPERSPACE SCREENSAVER (DEEP BLUE SPACE)
        // ---------------------------------------------------------------------
        case 'starfield': {
          const centerX = width / 2;
          const centerY = height / 2;

          for (let i = 0; i < stars.length; i++) {
            const s = stars[i];
            s.z -= 4.5;
            if (s.z <= 0) {
              s.z = 1000;
              s.x = (Math.random() - 0.5) * width * 2;
              s.y = (Math.random() - 0.5) * height * 2;
            }

            const k = 280 / s.z;
            const px = s.x * k + centerX;
            const py = s.y * k + centerY;

            if (px >= 0 && px <= width && py >= 0 && py <= height) {
              const size = Math.max(0.1, (1 - s.z / 1000) * 3.2 + 0.8);
              ctx.fillStyle = s.z < 300 ? '#e0f2fe' : (s.z < 650 ? '#38bdf8' : '#2563eb');
              ctx.globalAlpha = Math.max(0, Math.min(1, 1 - s.z / 1000));
              ctx.beginPath();
              ctx.arc(px, py, size, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          break;
        }

        // ---------------------------------------------------------------------
        // RETRO BOUNCE SCREENSAVER (BLUE SPACE)
        // ---------------------------------------------------------------------
        case 'retro_bounce': {
          bounceX += bounceVx;
          bounceY += bounceVy;

          const boxW = 220;
          const boxH = 50;

          if (bounceX <= 0 || bounceX + boxW >= width) {
            bounceVx *= -1;
            bounceColorIdx = (bounceColorIdx + 1) % bounceColors.length;
          }
          if (bounceY <= 0 || bounceY + boxH >= height) {
            bounceVy *= -1;
            bounceColorIdx = (bounceColorIdx + 1) % bounceColors.length;
          }

          ctx.strokeStyle = bounceColors[bounceColorIdx];
          ctx.lineWidth = 2;
          ctx.strokeRect(bounceX, bounceY, boxW, boxH);

          ctx.fillStyle = bounceColors[bounceColorIdx];
          ctx.font = "bold 20px 'VT323', monospace";
          ctx.textAlign = 'center';
          ctx.fillText('MATEUS SPACE 2026', bounceX + boxW / 2, bounceY + boxH / 2 + 6);
          break;
        }

        // ---------------------------------------------------------------------
        // FLYING WINDOWS SCREENSAVER
        // ---------------------------------------------------------------------
        case 'flying_windows': {
          flyingWindows.forEach((win) => {
            win.x += win.vx;
            win.y += win.vy;

            if (win.x < 0 || win.x + win.w > width) win.vx *= -1;
            if (win.y < 0 || win.y + win.h > height) win.vy *= -1;

            ctx.fillStyle = 'rgba(2, 8, 24, 0.88)';
            ctx.strokeStyle = win.color;
            ctx.lineWidth = 1.5;
            ctx.fillRect(win.x, win.y, win.w, win.h);
            ctx.strokeRect(win.x, win.y, win.w, win.h);

            // Title bar
            ctx.fillStyle = win.color;
            ctx.fillRect(win.x, win.y, win.w, 18);
            ctx.fillStyle = '#000000';
            ctx.font = "11px 'VT323', monospace";
            ctx.textAlign = 'left';
            ctx.fillText(win.title, win.x + 6, win.y + 13);
          });
          break;
        }
      }

      ctx.globalAlpha = 1;
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeMode, reduceMotion]);

  return (
    <div
      onClick={onWakeUp}
      className="fixed inset-0 z-50 bg-[#000206] flex flex-col justify-between cursor-pointer animate-fadeIn select-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Discreet Wakeup Prompt Ticker (Bottom) */}
      <div className="relative z-10 p-3 text-center text-[11px] font-mono text-sky-400/70 bg-black/40 backdrop-blur-xs border-t border-sky-950/40">
        [ DESCANSO DE TELA ATIVO • MOVA O MOUSE OU TOQUE NA TELA PARA RETORNAR ]
      </div>
    </div>
  );
};
