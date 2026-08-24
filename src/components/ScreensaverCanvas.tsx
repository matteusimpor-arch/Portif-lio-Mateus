import React, { useEffect, useRef, useState } from 'react';

export type ScreensaverType =
  | 'pipes_3d'
  | 'starfield'
  | 'matrix_rain'
  | 'mystify'
  | 'retro_bounce'
  | 'flying_windows'
  | 'crt_terminal';

interface ScreensaverCanvasProps {
  onWakeUp: () => void;
  reduceMotion?: boolean;
  forcedMode?: ScreensaverType;
}

export const ScreensaverCanvas: React.FC<ScreensaverCanvasProps> = ({
  onWakeUp,
  reduceMotion = false,
  forcedMode
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Selected or Random screensaver mode
  const [activeMode] = useState<ScreensaverType>(() => {
    if (forcedMode) return forcedMode;
    const saved = typeof window !== 'undefined' ? localStorage.getItem('mateus_screensaver_pref') : null;
    if (saved && saved !== 'random') return saved as ScreensaverType;

    const allModes: ScreensaverType[] = [
      'pipes_3d',
      'starfield',
      'matrix_rain',
      'mystify',
      'retro_bounce',
      'flying_windows',
      'crt_terminal'
    ];
    return allModes[Math.floor(Math.random() * allModes.length)];
  });

  useEffect(() => {
    // Wake up listener on any user interaction
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
    // 1. PIPES 3D (CLASSIC WINDOWS 3D PIPES ENGINE)
    // =========================================================================
    const pipeColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];
    const pipeRadius = width < 640 ? 10 : 14;
    const gridSize = pipeRadius * 2.5;

    interface PipeWalker {
      x: number;
      y: number;
      dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
      color: string;
      lengthRemaining: number;
    }

    const spawnWalker = (): PipeWalker => {
      const snapX = Math.floor(Math.random() * (width / gridSize)) * gridSize + gridSize / 2;
      const snapY = Math.floor(Math.random() * (height / gridSize)) * gridSize + gridSize / 2;
      const dirs: Array<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'> = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
      return {
        x: snapX,
        y: snapY,
        dir: dirs[Math.floor(Math.random() * dirs.length)],
        color: pipeColors[Math.floor(Math.random() * pipeColors.length)],
        lengthRemaining: Math.floor(Math.random() * 25) + 15,
      };
    };

    let walkers: PipeWalker[] = [spawnWalker(), spawnWalker(), spawnWalker()];
    let pipeFrameCounter = 0;

    // Clear background initially for persistent 3D Pipes accumulation
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // =========================================================================
    // 2. STARFIELD STATE (3D HYPERSPACE)
    // =========================================================================
    const stars = Array.from({ length: 450 }, () => ({
      x: (Math.random() - 0.5) * width * 2,
      y: (Math.random() - 0.5) * height * 2,
      z: Math.random() * 1200 + 1,
      size: Math.random() * 2 + 1,
      color: ['#ffffff', '#bae6fd', '#38bdf8', '#60a5fa', '#fef08a'][Math.floor(Math.random() * 5)]
    }));

    // =========================================================================
    // 3. MATRIX RAIN STATE
    // =========================================================================
    const matrixFontSize = 16;
    const matrixCols = Math.floor(width / matrixFontSize);
    const matrixDrops = Array.from({ length: matrixCols }, () => Math.random() * -60);
    const matrixSpeeds = Array.from({ length: matrixCols }, () => Math.random() * 0.7 + 0.6);
    const matrixChars = '01MATEUSARAUJO2026XYZ89#*+<>/~_$%&@=アイウエオカキクケコサシスセソタチツテト';

    // =========================================================================
    // 4. MYSTIFY STATE (POLYGONAL RIBBONS)
    // =========================================================================
    interface MystifyPoint {
      x: number;
      y: number;
      vx: number;
      vy: number;
    }

    interface MystifyPolygon {
      p1: MystifyPoint;
      p2: MystifyPoint;
      p3: MystifyPoint;
      p4: MystifyPoint;
      history: Array<[MystifyPoint, MystifyPoint, MystifyPoint, MystifyPoint]>;
      hue: number;
    }

    const createMystifyPoly = (startHue: number): MystifyPolygon => {
      const rndSpeed = () => (Math.random() - 0.5) * 5;
      return {
        p1: { x: Math.random() * width, y: Math.random() * height, vx: rndSpeed(), vy: rndSpeed() },
        p2: { x: Math.random() * width, y: Math.random() * height, vx: rndSpeed(), vy: rndSpeed() },
        p3: { x: Math.random() * width, y: Math.random() * height, vx: rndSpeed(), vy: rndSpeed() },
        p4: { x: Math.random() * width, y: Math.random() * height, vx: rndSpeed(), vy: rndSpeed() },
        history: [],
        hue: startHue,
      };
    };

    const mystifyPolys: MystifyPolygon[] = [createMystifyPoly(0), createMystifyPoly(180)];

    // =========================================================================
    // 5. RETRO BOUNCE STATE (DVD STYLE)
    // =========================================================================
    let bounceX = width / 3;
    let bounceY = height / 3;
    const boxW = 200;
    const boxH = 54;
    let bounceVx = 2.8;
    let bounceVy = 2.2;
    const bounceColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];
    let bounceColorIndex = 0;

    // =========================================================================
    // 6. FLYING WINDOWS STATE
    // =========================================================================
    const windowTitles = ['MATEUS OS 2000', 'MATEUS.EXE', 'PROJETOS.SYS', 'LOGISTICS_AI', 'PROMPT_ENG', 'SPACE 2026'];
    const flyingWindows = Array.from({ length: 6 }, (_, i) => ({
      x: Math.random() * (width - 180),
      y: Math.random() * (height - 120),
      vx: (Math.random() - 0.5) * 2.2,
      vy: (Math.random() - 0.5) * 2.2,
      w: 170,
      h: 115,
      title: windowTitles[i % windowTitles.length],
      color: ['#000080', '#008080', '#1e3a8a', '#312e81', '#065f46'][i % 5],
      accent: ['#38bdf8', '#34d399', '#f472b6', '#fbbf24', '#a78bfa'][i % 5],
    }));

    // =========================================================================
    // MAIN RENDER LOOP
    // =========================================================================
    const render = () => {
      const elapsed = (Date.now() - startTime) / 1000;

      switch (activeMode) {
        // ---------------------------------------------------------------------
        // 1. 3D PIPES
        // ---------------------------------------------------------------------
        case 'pipes_3d': {
          pipeFrameCounter++;
          // Reset canvas every 70 seconds to rebuild a fresh labyrinth
          if (pipeFrameCounter % 3800 === 0) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, width, height);
            walkers = [spawnWalker(), spawnWalker(), spawnWalker()];
          }

          walkers.forEach((w, idx) => {
            const prevX = w.x;
            const prevY = w.y;
            const step = pipeRadius * 1.6;

            if (w.dir === 'UP') w.y -= step;
            if (w.dir === 'DOWN') w.y += step;
            if (w.dir === 'LEFT') w.x -= step;
            if (w.dir === 'RIGHT') w.x += step;

            // Draw pipe cylinder
            ctx.beginPath();
            ctx.strokeStyle = w.color;
            ctx.lineWidth = pipeRadius;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(w.x, w.y);
            ctx.stroke();

            // Draw shiny specular 3D core highlight
            ctx.beginPath();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = pipeRadius * 0.28;
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(w.x, w.y);
            ctx.stroke();

            w.lengthRemaining--;

            // Turn or bounce at walls
            const hitWall = w.x < pipeRadius * 2 || w.x > width - pipeRadius * 2 || w.y < pipeRadius * 2 || w.y > height - pipeRadius * 2;
            if (hitWall || w.lengthRemaining <= 0 || Math.random() < 0.12) {
              // Draw joint sphere/elbow
              ctx.beginPath();
              ctx.fillStyle = w.color;
              ctx.arc(w.x, w.y, pipeRadius * 0.8, 0, Math.PI * 2);
              ctx.fill();
              ctx.beginPath();
              ctx.fillStyle = '#ffffff';
              ctx.arc(w.x - 2, w.y - 2, pipeRadius * 0.25, 0, Math.PI * 2);
              ctx.fill();

              // Choose perpendicular direction
              const possibleDirs: Array<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'> =
                w.dir === 'UP' || w.dir === 'DOWN' ? ['LEFT', 'RIGHT'] : ['UP', 'DOWN'];
              w.dir = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
              w.lengthRemaining = Math.floor(Math.random() * 20) + 10;

              if (hitWall) {
                walkers[idx] = spawnWalker();
              }
            }
          });
          break;
        }

        // ---------------------------------------------------------------------
        // 2. 3D STARFIELD
        // ---------------------------------------------------------------------
        case 'starfield': {
          ctx.fillStyle = 'rgba(0, 2, 8, 0.28)';
          ctx.fillRect(0, 0, width, height);

          const cx = width / 2;
          const cy = height / 2;

          stars.forEach((s) => {
            s.z -= 6;
            if (s.z <= 0) {
              s.z = 1200;
              s.x = (Math.random() - 0.5) * width * 2;
              s.y = (Math.random() - 0.5) * height * 2;
            }

            const k = 320 / s.z;
            const px = cx + s.x * k;
            const py = cy + s.y * k;

            if (px >= 0 && px <= width && py >= 0 && py <= height) {
              const alpha = Math.min(1, (1200 - s.z) / 1000);
              const sz = Math.max(0.8, s.size * k * 0.6);

              ctx.fillStyle = s.color;
              ctx.globalAlpha = alpha;
              ctx.beginPath();
              ctx.arc(px, py, sz, 0, Math.PI * 2);
              ctx.fill();

              // Speed streak
              ctx.strokeStyle = s.color;
              ctx.lineWidth = sz * 0.6;
              ctx.beginPath();
              ctx.moveTo(px, py);
              ctx.lineTo(px + (px - cx) * 0.05, py + (py - cy) * 0.05);
              ctx.stroke();
            }
          });
          break;
        }

        // ---------------------------------------------------------------------
        // 3. MATRIX RAIN
        // ---------------------------------------------------------------------
        case 'matrix_rain': {
          ctx.fillStyle = 'rgba(0, 4, 2, 0.24)';
          ctx.fillRect(0, 0, width, height);

          ctx.font = `${matrixFontSize}px monospace, 'VT323', sans-serif`;

          for (let i = 0; i < matrixDrops.length; i++) {
            const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
            const x = i * matrixFontSize;
            const y = matrixDrops[i] * matrixFontSize;

            const isLead = Math.random() > 0.88;
            ctx.fillStyle = isLead ? '#ffffff' : (i % 2 === 0 ? '#22c55e' : '#15803d');
            ctx.globalAlpha = isLead ? 1 : 0.85;
            ctx.fillText(char, x, y);

            if (matrixDrops[i] * matrixFontSize > height && Math.random() > 0.975) {
              matrixDrops[i] = 0;
            }
            matrixDrops[i] += matrixSpeeds[i];
          }
          break;
        }

        // ---------------------------------------------------------------------
        // 4. MYSTIFY (CLASSIC WINDOWS RIBBONS)
        // ---------------------------------------------------------------------
        case 'mystify': {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
          ctx.fillRect(0, 0, width, height);

          mystifyPolys.forEach((poly) => {
            poly.hue = (poly.hue + 0.4) % 360;

            // Move points
            [poly.p1, poly.p2, poly.p3, poly.p4].forEach((pt) => {
              pt.x += pt.vx;
              pt.y += pt.vy;

              if (pt.x <= 0 || pt.x >= width) pt.vx *= -1;
              if (pt.y <= 0 || pt.y >= height) pt.vy *= -1;
            });

            // Save history for wireframe ribbon trails
            poly.history.push([
              { ...poly.p1 },
              { ...poly.p2 },
              { ...poly.p3 },
              { ...poly.p4 },
            ]);

            if (poly.history.length > 12) {
              poly.history.shift();
            }

            // Draw ribbon trail
            poly.history.forEach((pts, hIdx) => {
              const trailAlpha = (hIdx + 1) / poly.history.length;
              ctx.strokeStyle = `hsla(${poly.hue}, 90%, 65%, ${trailAlpha * 0.85})`;
              ctx.lineWidth = 1.6;

              ctx.beginPath();
              ctx.moveTo(pts[0].x, pts[0].y);
              ctx.lineTo(pts[1].x, pts[1].y);
              ctx.lineTo(pts[2].x, pts[2].y);
              ctx.lineTo(pts[3].x, pts[3].y);
              ctx.closePath();
              ctx.stroke();
            });
          });
          break;
        }

        // ---------------------------------------------------------------------
        // 5. RETRO BOUNCE (DVD LOGO)
        // ---------------------------------------------------------------------
        case 'retro_bounce': {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
          ctx.fillRect(0, 0, width, height);

          bounceX += bounceVx;
          bounceY += bounceVy;

          let bounced = false;
          if (bounceX <= 0 || bounceX + boxW >= width) {
            bounceVx *= -1;
            bounced = true;
          }
          if (bounceY <= 0 || bounceY + boxH >= height) {
            bounceVy *= -1;
            bounced = true;
          }

          if (bounced) {
            bounceColorIndex = (bounceColorIndex + 1) % bounceColors.length;
          }

          const currentColor = bounceColors[bounceColorIndex];

          ctx.strokeStyle = currentColor;
          ctx.lineWidth = 3;
          ctx.strokeRect(bounceX, bounceY, boxW, boxH);

          ctx.fillStyle = currentColor;
          ctx.font = "bold 20px 'VT323', monospace, sans-serif";
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('MATEUS OS 2000', bounceX + boxW / 2, bounceY + boxH / 2);
          break;
        }

        // ---------------------------------------------------------------------
        // 6. FLYING WINDOWS
        // ---------------------------------------------------------------------
        case 'flying_windows': {
          ctx.fillStyle = 'rgba(0, 4, 16, 0.25)';
          ctx.fillRect(0, 0, width, height);

          flyingWindows.forEach((win) => {
            win.x += win.vx;
            win.y += win.vy;

            if (win.x <= 0 || win.x + win.w >= width) win.vx *= -1;
            if (win.y <= 0 || win.y + win.h >= height) win.vy *= -1;

            // Window body
            ctx.fillStyle = '#c0c0c0';
            ctx.fillRect(win.x, win.y, win.w, win.h);

            // Title bar
            ctx.fillStyle = win.color;
            ctx.fillRect(win.x + 2, win.y + 2, win.w - 4, 20);

            // Window border bevel
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(win.x, win.y + win.h);
            ctx.lineTo(win.x, win.y);
            ctx.lineTo(win.x + win.w, win.y);
            ctx.stroke();

            ctx.strokeStyle = '#404040';
            ctx.beginPath();
            ctx.moveTo(win.x + win.w, win.y);
            ctx.lineTo(win.x + win.w, win.y + win.h);
            ctx.lineTo(win.x, win.y + win.h);
            ctx.stroke();

            // Title text
            ctx.fillStyle = '#ffffff';
            ctx.font = "bold 11px sans-serif";
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(win.title, win.x + 6, win.y + 12);

            // Content icon
            ctx.fillStyle = win.accent;
            ctx.beginPath();
            ctx.arc(win.x + win.w / 2, win.y + 65, 18, 0, Math.PI * 2);
            ctx.fill();
          });
          break;
        }

        // ---------------------------------------------------------------------
        // 7. CRT TERMINAL
        // ---------------------------------------------------------------------
        case 'crt_terminal': {
          ctx.fillStyle = '#010814';
          ctx.fillRect(0, 0, width, height);

          // Scanlines
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
          ctx.lineWidth = 1;
          for (let y = 0; y < height; y += 3) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
          }

          const terminalLines = [
            'MATEUS OS 2000 // CORE SYSTEM DIAGNOSTIC',
            'SYSTEM STATUS: NORMAL [PROTEÇÃO ATIVA]',
            'PROCESSADOR: SUPPLY CHAIN & AI PROMPT CORE ONLINE',
            'PORTFÓLIO: MATEUS ARAÚJO • 2000 ➔ 2026',
            'DISCOS DE ARMAZENAMENTO: FIRESTORE & LOCALSTORAGE OK',
            'MOVA O MOUSE OU TOQUE NA TELA PARA ACESSAR A ÁREA DE TRABALHO...'
          ];

          ctx.font = "17px 'VT323', monospace";
          ctx.fillStyle = '#38bdf8';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#0284c7';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';

          const lineCount = Math.min(terminalLines.length, Math.floor(elapsed * 1.8) + 1);
          for (let l = 0; l < lineCount; l++) {
            ctx.fillText(`> ${terminalLines[l]}`, 32, 50 + l * 32);
          }

          if (Math.floor(elapsed * 2) % 2 === 0) {
            const lastLine = terminalLines[Math.min(lineCount - 1, terminalLines.length - 1)] || '';
            ctx.fillRect(32 + lastLine.length * 10.5 + 8, 50 + (lineCount - 1) * 32, 10, 18);
          }
          ctx.shadowBlur = 0;
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
      className="fixed inset-0 z-50 bg-[#000000] flex flex-col justify-between cursor-pointer animate-fadeIn select-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Discreet Wakeup Prompt Ticker (Bottom) */}
      <div className="relative z-10 p-3 text-center text-[11px] font-mono text-cyan-400/80 bg-black/60 backdrop-blur-xs border-t border-cyan-950/60">
        [ DESCANSO DE TELA ATIVO • MOVA O MOUSE OU TOQUE NA TELA PARA RETORNAR AO MATEUS OS ]
      </div>
    </div>
  );
};
