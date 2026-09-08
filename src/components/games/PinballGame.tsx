import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw, Trophy, Volume2, Sparkles, Play, Pause } from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';
import { getGameHighScore, saveGameHighScore, setGameActiveStatus } from '../../utils/gameStorage';

interface PinballGameProps {
  onBackToHub?: () => void;
  mode?: 'retro' | 'space';
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isStuck: boolean;
}

interface Bumper {
  x: number;
  y: number;
  radius: number;
  points: number;
  color: string;
  glow: number;
}

interface Flipper {
  x: number;
  y: number;
  length: number;
  baseAngle: number;
  activeAngle: number;
  currentAngle: number;
  isLeft: boolean;
  isPressed: boolean;
}

export const PinballGame: React.FC<PinballGameProps> = ({
  onBackToHub,
  mode = 'retro',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => getGameHighScore('pinball', 15000));
  const [ballsLeft, setBallsLeft] = useState<number>(3);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  // Notify M-BOT
  useEffect(() => {
    setGameActiveStatus(true, 'Space Cadet Pinball');
    return () => setGameActiveStatus(false);
  }, []);

  // Internal mutable state for high performance RAF 60 FPS physics
  const gameStateRef = useRef({
    ball: {
      x: 360,
      y: 520,
      vx: 0,
      vy: 0,
      radius: 8,
      isStuck: true,
    } as Ball,
    bumpers: [
      { x: 150, y: 160, radius: 24, points: 500, color: '#f59e0b', glow: 0 },
      { x: 250, y: 160, radius: 24, points: 500, color: '#f59e0b', glow: 0 },
      { x: 200, y: 240, radius: 28, points: 1000, color: '#ef4444', glow: 0 },
      { x: 100, y: 320, radius: 18, points: 250, color: '#3b82f6', glow: 0 },
      { x: 300, y: 320, radius: 18, points: 250, color: '#3b82f6', glow: 0 },
    ] as Bumper[],
    flippers: [
      {
        x: 125,
        y: 540,
        length: 65,
        baseAngle: 0.45,
        activeAngle: -0.55,
        currentAngle: 0.45,
        isLeft: true,
        isPressed: false,
      },
      {
        x: 275,
        y: 540,
        length: 65,
        baseAngle: Math.PI - 0.45,
        activeAngle: Math.PI + 0.55,
        currentAngle: Math.PI - 0.45,
        isLeft: false,
        isPressed: false,
      },
    ] as Flipper[],
    slingshots: [
      { x1: 75, y1: 420, x2: 110, y2: 490, x3: 75, y3: 490 },
      { x1: 325, y1: 420, x2: 290, y2: 490, x3: 325, y3: 490 },
    ],
    score: 0,
    ballsLeft: 3,
    isPlungerPressed: false,
    plungerCharge: 0,
    gravity: 0.22,
    friction: 0.995,
  });

  const launchBall = () => {
    const s = gameStateRef.current;
    if (s.ball.isStuck) {
      s.ball.isStuck = false;
      s.ball.vx = (Math.random() - 0.5) * 1.5;
      s.ball.vy = -14 - Math.random() * 4;
      try {
        soundFx.playBoost();
      } catch (e) {}
    }
  };

  const resetBall = () => {
    const s = gameStateRef.current;
    s.ball.x = 365;
    s.ball.y = 520;
    s.ball.vx = 0;
    s.ball.vy = 0;
    s.ball.isStuck = true;
  };

  const startNewGame = () => {
    try {
      soundFx.playClick();
    } catch (e) {}
    gameStateRef.current.score = 0;
    gameStateRef.current.ballsLeft = 3;
    setScore(0);
    setBallsLeft(3);
    setIsGameOver(false);
    setIsPaused(false);
    setGameStarted(true);
    resetBall();
    launchBall();
  };

  // Input handlers
  const setLeftFlipper = (pressed: boolean) => {
    const flipper = gameStateRef.current.flippers[0];
    if (flipper.isPressed !== pressed) {
      flipper.isPressed = pressed;
      if (pressed) {
        try { soundFx.playBounce(320); } catch (e) {}
      }
    }
  };

  const setRightFlipper = (pressed: boolean) => {
    const flipper = gameStateRef.current.flippers[1];
    if (flipper.isPressed !== pressed) {
      flipper.isPressed = pressed;
      if (pressed) {
        try { soundFx.playBounce(320); } catch (e) {}
      }
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'Space', 'KeyZ', 'KeyM', 'Slash'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'Escape') {
        setIsPaused((p) => !p);
        return;
      }

      if (['ArrowLeft', 'KeyZ', 'KeyA'].includes(e.code)) {
        setLeftFlipper(true);
      }
      if (['ArrowRight', 'KeyM', 'Slash', 'KeyD'].includes(e.code)) {
        setRightFlipper(true);
      }
      if (['Space', 'ArrowDown'].includes(e.code)) {
        if (!gameStarted || isGameOver) {
          startNewGame();
        } else if (gameStateRef.current.ball.isStuck) {
          launchBall();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyZ', 'KeyA'].includes(e.code)) {
        setLeftFlipper(false);
      }
      if (['ArrowRight', 'KeyM', 'Slash', 'KeyD'].includes(e.code)) {
        setRightFlipper(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStarted, isGameOver]);

  // Main RAF Physics loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const WIDTH = 400;
    const HEIGHT = 620;

    const gameLoop = () => {
      if (!isPaused && !isGameOver) {
        const state = gameStateRef.current;
        const ball = state.ball;

        // Flipper rotation physics
        state.flippers.forEach((f) => {
          const target = f.isPressed ? f.activeAngle : f.baseAngle;
          f.currentAngle += (target - f.currentAngle) * 0.45;
        });

        // Ball physics
        if (!ball.isStuck) {
          ball.vy += state.gravity;
          ball.vx *= state.friction;
          ball.vy *= state.friction;

          ball.x += ball.vx;
          ball.y += ball.vy;

          // Wall bounds
          // Left Wall
          if (ball.x - ball.radius < 25) {
            ball.x = 25 + ball.radius;
            ball.vx = Math.abs(ball.vx) * 0.8;
            try { soundFx.playBounce(220); } catch (e) {}
          }
          // Right launcher lane separator
          if (ball.x + ball.radius > 340 && ball.y > 180) {
            if (ball.vx > 0 && ball.x < 345) {
              ball.x = 340 - ball.radius;
              ball.vx = -Math.abs(ball.vx) * 0.8;
            }
          }
          // Extreme Right Wall
          if (ball.x + ball.radius > 385) {
            ball.x = 385 - ball.radius;
            ball.vx = -Math.abs(ball.vx) * 0.8;
          }
          // Top curved dome
          if (ball.y - ball.radius < 30) {
            ball.y = 30 + ball.radius;
            ball.vy = Math.abs(ball.vy) * 0.8;
          }

          // Top arch curvature
          if (ball.y < 120) {
            const archCenterX = 200;
            const archCenterY = 120;
            const dist = Math.hypot(ball.x - archCenterX, ball.y - archCenterY);
            if (dist > 180) {
              const angle = Math.atan2(ball.y - archCenterY, ball.x - archCenterX);
              ball.x = archCenterX + Math.cos(angle) * (180 - ball.radius);
              ball.y = archCenterY + Math.sin(angle) * (180 - ball.radius);
              const speed = Math.hypot(ball.vx, ball.vy) * 0.85;
              ball.vx = -Math.cos(angle) * speed;
              ball.vy = -Math.sin(angle) * speed;
            }
          }

          // Bumpers collision
          state.bumpers.forEach((b) => {
            const dx = ball.x - b.x;
            const dy = ball.y - b.y;
            const dist = Math.hypot(dx, dy);

            if (dist < ball.radius + b.radius) {
              // Hit bumper!
              const angle = Math.atan2(dy, dx);
              const bouncePower = 9;
              ball.vx = Math.cos(angle) * bouncePower;
              ball.vy = Math.sin(angle) * bouncePower;
              b.glow = 1.0;

              state.score += b.points;
              setScore(state.score);
              saveGameHighScore('pinball', state.score);
              setHighScore((h) => Math.max(h, state.score));

              try {
                soundFx.playBounce(b.points > 500 ? 587 : 440);
              } catch (e) {}
            }

            if (b.glow > 0) {
              b.glow = Math.max(0, b.glow - 0.08);
            }
          });

          // Flippers collision
          state.flippers.forEach((f) => {
            const endX = f.x + Math.cos(f.currentAngle) * f.length;
            const endY = f.y + Math.sin(f.currentAngle) * f.length;

            // Line segment to ball distance
            const l2 = (endX - f.x) ** 2 + (endY - f.y) ** 2;
            let t = ((ball.x - f.x) * (endX - f.x) + (ball.y - f.y) * (endY - f.y)) / l2;
            t = Math.max(0, Math.min(1, t));

            const projX = f.x + t * (endX - f.x);
            const projY = f.y + t * (endY - f.y);
            const dist = Math.hypot(ball.x - projX, ball.y - projY);

            if (dist < ball.radius + 8) {
              // Ball hits flipper
              const angleNormal = f.currentAngle - Math.PI / 2;
              const flipPower = f.isPressed ? 14 : 5;

              ball.vx = Math.cos(angleNormal) * flipPower + (Math.random() - 0.5) * 2;
              ball.vy = Math.sin(angleNormal) * flipPower;
              ball.y = projY - ball.radius - 2;

              try {
                soundFx.playBounce(520);
              } catch (e) {}
            }
          });

          // Bottom drain
          if (ball.y > HEIGHT + 20) {
            state.ballsLeft -= 1;
            setBallsLeft(state.ballsLeft);
            try { soundFx.playError(); } catch (e) {}

            if (state.ballsLeft <= 0) {
              setIsGameOver(true);
            } else {
              resetBall();
              setTimeout(() => {
                launchBall();
              }, 700);
            }
          }
        }
      }

      // -------------------------------------------------------------
      // RENDERING CANVAS
      // -------------------------------------------------------------
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      const isRetro = mode === 'retro';

      // Table Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      if (isRetro) {
        bgGrad.addColorStop(0, '#0f172a');
        bgGrad.addColorStop(0.5, '#1e293b');
        bgGrad.addColorStop(1, '#020617');
      } else {
        bgGrad.addColorStop(0, '#050b1a');
        bgGrad.addColorStop(0.5, '#02182b');
        bgGrad.addColorStop(1, '#000814');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Neon table markings / space vector grid
      ctx.strokeStyle = isRetro ? 'rgba(59, 130, 246, 0.15)' : 'rgba(6, 182, 212, 0.2)';
      ctx.lineWidth = 1;
      for (let i = 40; i < WIDTH; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 40);
        ctx.lineTo(i, HEIGHT - 80);
        ctx.stroke();
      }

      // Outer Boundary Walls
      ctx.strokeStyle = isRetro ? '#3b82f6' : '#22d3ee';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(25, HEIGHT);
      ctx.lineTo(25, 140);
      ctx.arc(200, 140, 175, Math.PI, 0);
      ctx.lineTo(375, HEIGHT);
      ctx.stroke();

      // Launcher lane separator
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(340, 180);
      ctx.lineTo(340, HEIGHT);
      ctx.stroke();

      // Bottom Slingshots
      const state = gameStateRef.current;
      ctx.fillStyle = isRetro ? '#1e3a8a' : '#083344';
      ctx.strokeStyle = isRetro ? '#60a5fa' : '#38bdf8';
      ctx.lineWidth = 2;
      state.slingshots.forEach((s) => {
        ctx.beginPath();
        ctx.moveTo(s.x1, s.y1);
        ctx.lineTo(s.x2, s.y2);
        ctx.lineTo(s.x3, s.y3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });

      // Bumpers
      state.bumpers.forEach((b) => {
        ctx.save();
        if (b.glow > 0) {
          ctx.shadowColor = b.color;
          ctx.shadowBlur = 20 * b.glow;
        }

        const bGrad = ctx.createRadialGradient(b.x - 6, b.y - 6, 2, b.x, b.y, b.radius);
        bGrad.addColorStop(0, '#ffffff');
        bGrad.addColorStop(0.4, b.color);
        bGrad.addColorStop(1, '#1e293b');

        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();

        // Bumper Point Label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(b.points), b.x, b.y);
      });

      // Flippers
      state.flippers.forEach((f) => {
        const endX = f.x + Math.cos(f.currentAngle) * f.length;
        const endY = f.y + Math.sin(f.currentAngle) * f.length;

        ctx.save();
        ctx.strokeStyle = isRetro ? '#ef4444' : '#f43f5e';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(f.x, f.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Pivot joint
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(f.x, f.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Ball
      const ball = state.ball;
      ctx.save();
      ctx.shadowColor = isRetro ? 'rgba(255, 255, 255, 0.6)' : 'rgba(34, 211, 238, 0.8)';
      ctx.shadowBlur = 10;

      const ballGrad = ctx.createRadialGradient(
        ball.x - 2,
        ball.y - 2,
        1,
        ball.x,
        ball.y,
        ball.radius
      );
      ballGrad.addColorStop(0, '#ffffff');
      ballGrad.addColorStop(0.5, '#cbd5e1');
      ballGrad.addColorStop(1, '#475569');

      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [isGameOver, isPaused, mode]);

  const isRetro = mode === 'retro';

  return (
    <div className="space-y-4 font-sans select-none text-slate-100 max-w-xl mx-auto">
      {/* Header Bar */}
      <div
        className={`p-2.5 border-2 flex flex-wrap items-center justify-between gap-2 shadow ${
          isRetro
            ? 'bg-[#c0c0c0] border-white border-r-gray-800 border-b-gray-800 text-gray-900'
            : 'bg-slate-900/90 border-cyan-500/40 text-cyan-200 rounded-lg backdrop-blur-md'
        }`}
      >
        <div className="flex items-center gap-2">
          {onBackToHub && (
            <button
              onClick={onBackToHub}
              className={`px-3 py-1.5 font-mono font-bold text-xs border-2 cursor-pointer flex items-center gap-1.5 transition ${
                isRetro
                  ? 'bg-[#d4d0c8] hover:bg-white text-gray-900 border-white border-r-gray-800 border-b-gray-800'
                  : 'bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 border-cyan-600 rounded'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>VOLTAR AO ARCADE</span>
            </button>
          )}
          <span className="font-mono font-black text-xs text-blue-900 dark:text-cyan-300">
            🎯 {isRetro ? 'SPACE CADET PINBALL 3D' : 'NEON PINBALL 2026'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {gameStarted && !isGameOver && (
            <button
              onClick={() => setIsPaused((p) => !p)}
              className="px-2.5 py-1 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-mono font-bold text-xs border border-yellow-600 rounded flex items-center gap-1 cursor-pointer shadow"
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? 'CONTINUAR' : 'PAUSAR'}</span>
            </button>
          )}

          <button
            onClick={startNewGame}
            className={`px-3 py-1 font-mono font-bold text-xs border-2 cursor-pointer flex items-center gap-1 shadow ${
              isRetro
                ? 'bg-[#d4d0c8] hover:bg-white text-black border-white border-r-gray-800 border-b-gray-800'
                : 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 rounded'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>NOVO JOGO</span>
          </button>
        </div>
      </div>

      {/* Info Status Bar */}
      <div
        className={`px-3 py-1.5 border text-xs font-mono flex flex-wrap items-center justify-between gap-2 shadow-inner ${
          isRetro
            ? 'bg-[#000080] border-white text-yellow-300'
            : 'bg-slate-900 border-cyan-800/80 text-cyan-200 rounded'
        }`}
      >
        <span>
          <strong>CONTROLES:</strong> Z / Seta Esq (Flipper E) | M / Seta Dir (Flipper D) | Espaço (Lançador)
        </span>
        <div className="flex items-center gap-4 text-white">
          <span>Pontos: <strong className="text-yellow-300">{score}</strong></span>
          <span>Bolas: <strong className="text-yellow-300">{'●'.repeat(Math.max(0, ballsLeft))}</strong></span>
          <span>Recorde: <strong className="text-yellow-300">{highScore}</strong></span>
        </div>
      </div>

      {/* Canvas Arcade Cabinet */}
      <div className="flex flex-col items-center justify-center p-2">
        <div
          className={`relative p-2.5 rounded-2xl border-4 shadow-2xl ${
            isRetro
              ? 'bg-[#1e293b] border-gray-400 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]'
              : 'bg-slate-950 border-cyan-500/50 shadow-[0_0_35px_rgba(6,182,212,0.25)]'
          }`}
        >
          <canvas
            ref={canvasRef}
            width={400}
            height={620}
            className="w-full max-w-[380px] h-auto rounded-lg border-2 border-slate-700 bg-black block"
          />

          {/* Touch Controls Bar for Mobile */}
          <div className="pt-3 grid grid-cols-3 gap-2 select-none">
            <button
              onTouchStart={() => setLeftFlipper(true)}
              onTouchEnd={() => setLeftFlipper(false)}
              onMouseDown={() => setLeftFlipper(true)}
              onMouseUp={() => setLeftFlipper(false)}
              className="py-3 px-2 bg-rose-700 active:bg-rose-500 text-white font-mono font-bold text-xs rounded-xl border border-rose-400 active:scale-95 shadow cursor-pointer text-center"
            >
              FLIPPER ESQ
            </button>
            <button
              onClick={() => {
                if (!gameStarted || isGameOver) startNewGame();
                else launchBall();
              }}
              className="py-3 px-2 bg-yellow-500 active:bg-yellow-400 text-slate-950 font-mono font-bold text-xs rounded-xl border border-yellow-300 active:scale-95 shadow cursor-pointer text-center"
            >
              LANÇAR 🚀
            </button>
            <button
              onTouchStart={() => setRightFlipper(true)}
              onTouchEnd={() => setRightFlipper(false)}
              onMouseDown={() => setRightFlipper(true)}
              onMouseUp={() => setRightFlipper(false)}
              className="py-3 px-2 bg-rose-700 active:bg-rose-500 text-white font-mono font-bold text-xs rounded-xl border border-rose-400 active:scale-95 shadow cursor-pointer text-center"
            >
              FLIPPER DIR
            </button>
          </div>
        </div>
      </div>

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div
            className={`max-w-md w-full p-6 rounded-xl border-4 text-center space-y-4 shadow-2xl ${
              isRetro
                ? 'bg-[#c0c0c0] border-white text-slate-900 shadow-[8px_8px_0px_rgba(0,0,0,0.5)]'
                : 'bg-slate-950 border-cyan-400 text-cyan-100'
            }`}
          >
            <div className="w-14 h-14 mx-auto rounded-full bg-yellow-400 flex items-center justify-center text-3xl shadow-lg">
              🎯
            </div>
            <h2 className="text-2xl font-mono font-black tracking-wider text-rose-600 dark:text-rose-400">
              FIM DE JOGO
            </h2>
            <p className="text-sm font-mono leading-relaxed">
              Todas as 3 bolas foram drenadas pelo fliperama!
            </p>

            <div className="p-3 bg-white/60 dark:bg-slate-900 rounded font-mono text-sm space-y-1">
              <div>Pontuação Final: <strong className="text-rose-700 dark:text-rose-400">{score}</strong></div>
              <div>Recorde Salvo: <strong>{highScore}</strong></div>
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={startNewGame}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs rounded cursor-pointer shadow transition"
              >
                NOVA FICHA
              </button>
              {onBackToHub && (
                <button
                  onClick={onBackToHub}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white font-mono font-bold text-xs rounded cursor-pointer shadow transition"
                >
                  VOLTAR AO ARCADE
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
