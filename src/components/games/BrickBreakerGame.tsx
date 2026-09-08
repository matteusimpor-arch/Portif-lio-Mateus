import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw, Trophy, Volume2, Sparkles, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../utils/soundEffects';
import { getGameHighScore, saveGameHighScore, setGameActiveStatus } from '../../utils/gameStorage';

interface BrickBreakerGameProps {
  onBackToHub?: () => void;
  mode?: 'retro' | 'space';
}

interface Brick {
  x: number;
  y: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  color: string;
}

interface PowerUp {
  x: number;
  y: number;
  type: 'wide' | 'slow' | 'life';
  radius: number;
}

export const BrickBreakerGame: React.FC<BrickBreakerGameProps> = ({
  onBackToHub,
  mode = 'retro',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => getGameHighScore('brickbreaker', 2500));
  const [lives, setLives] = useState<number>(3);
  const [level, setLevel] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [hasWonGame, setHasWonGame] = useState<boolean>(false);

  // Notify M-BOT
  useEffect(() => {
    setGameActiveStatus(true, 'Brick Breaker');
    return () => setGameActiveStatus(false);
  }, []);

  const keys = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });

  const stateRef = useRef({
    width: 600,
    height: 480,
    paddleW: 90,
    paddleH: 14,
    paddleX: 255,
    paddleSpeed: 8,
    ballX: 300,
    ballY: 420,
    ballVx: 3.5,
    ballVy: -4.5,
    ballRadius: 7,
    isBallStuck: true,
    bricks: [] as Brick[],
    powerUps: [] as PowerUp[],
    score: 0,
    lives: 3,
    level: 1,
  });

  const createLevelBricks = (lvl: number): Brick[] => {
    const bricks: Brick[] = [];
    const rows = 4 + lvl;
    const cols = 8;
    const bW = 60;
    const bH = 20;
    const paddingX = 12;
    const paddingY = 10;
    const startX = 25;
    const startY = 45;

    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#8b5cf6'];

    for (let r = 0; r < rows; r++) {
      const hp = r === 0 && lvl > 1 ? 2 : 1;
      const color = colors[r % colors.length];
      for (let c = 0; c < cols; c++) {
        bricks.push({
          x: startX + c * (bW + paddingX),
          y: startY + r * (bH + paddingY),
          w: bW,
          h: bH,
          hp,
          maxHp: hp,
          color,
        });
      }
    }
    return bricks;
  };

  const resetBall = () => {
    const s = stateRef.current;
    s.paddleX = (s.width - s.paddleW) / 2;
    s.ballX = s.width / 2;
    s.ballY = 420;
    s.ballVx = (Math.random() > 0.5 ? 1 : -1) * 3.8;
    s.ballVy = -4.5;
    s.isBallStuck = true;
  };

  const launchBall = () => {
    if (stateRef.current.isBallStuck) {
      stateRef.current.isBallStuck = false;
      try { soundFx.playBounce(440); } catch (e) {}
    }
  };

  const startNewGame = () => {
    try {
      soundFx.playClick();
    } catch (e) {}

    const s = stateRef.current;
    s.score = 0;
    s.lives = 3;
    s.level = 1;
    s.paddleW = 90;
    s.powerUps = [];
    s.bricks = createLevelBricks(1);

    setScore(0);
    setLives(3);
    setLevel(1);
    setIsGameOver(false);
    setHasWonGame(false);
    setIsPaused(false);

    resetBall();
    setIsPlaying(true);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'Escape') {
        setIsPaused((p) => !p);
        return;
      }

      if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.current.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keys.current.right = true;
      if (e.code === 'Space') {
        if (!isPlaying || isGameOver || hasWonGame) {
          startNewGame();
        } else if (stateRef.current.isBallStuck) {
          launchBall();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.current.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keys.current.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, isGameOver, hasWonGame]);

  // Mouse / Touch paddle control
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const scaleX = stateRef.current.width / rect.width;
    stateRef.current.paddleX = Math.max(
      0,
      Math.min(stateRef.current.width - stateRef.current.paddleW, mouseX * scaleX - stateRef.current.paddleW / 2)
    );
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const scaleX = stateRef.current.width / rect.width;
    stateRef.current.paddleX = Math.max(
      0,
      Math.min(stateRef.current.width - stateRef.current.paddleW, touchX * scaleX - stateRef.current.paddleW / 2)
    );
  };

  // Main RAF Physics and Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const { width, height } = stateRef.current;

    const gameLoop = () => {
      const s = stateRef.current;

      if (isPlaying && !isPaused && !isGameOver && !hasWonGame) {
        // Paddle movement via keyboard
        if (keys.current.left) {
          s.paddleX = Math.max(0, s.paddleX - s.paddleSpeed);
        }
        if (keys.current.right) {
          s.paddleX = Math.min(width - s.paddleW, s.paddleX + s.paddleSpeed);
        }

        // Ball movement
        if (s.isBallStuck) {
          s.ballX = s.paddleX + s.paddleW / 2;
          s.ballY = height - 42;
        } else {
          s.ballX += s.ballVx;
          s.ballY += s.ballVy;

          // Prevent exact horizontal lock with angle nudge
          if (Math.abs(s.ballVy) < 1.2) {
            s.ballVy = Math.sign(s.ballVy || 1) * 1.6;
          }

          // Left and Right walls
          if (s.ballX - s.ballRadius < 0) {
            s.ballX = s.ballRadius;
            s.ballVx = Math.abs(s.ballVx);
            try { soundFx.playBounce(320); } catch (e) {}
          }
          if (s.ballX + s.ballRadius > width) {
            s.ballX = width - s.ballRadius;
            s.ballVx = -Math.abs(s.ballVx);
            try { soundFx.playBounce(320); } catch (e) {}
          }

          // Ceiling
          if (s.ballY - s.ballRadius < 0) {
            s.ballY = s.ballRadius;
            s.ballVy = Math.abs(s.ballVy);
            try { soundFx.playBounce(320); } catch (e) {}
          }

          // Paddle collision
          const paddleY = height - 30;
          if (
            s.ballY + s.ballRadius >= paddleY &&
            s.ballY - s.ballRadius <= paddleY + s.paddleH &&
            s.ballX >= s.paddleX - 4 &&
            s.ballX <= s.paddleX + s.paddleW + 4 &&
            s.ballVy > 0
          ) {
            s.ballY = paddleY - s.ballRadius;
            // Angle based on hit location
            const hitOffset = (s.ballX - (s.paddleX + s.paddleW / 2)) / (s.paddleW / 2);
            s.ballVx = hitOffset * 6.5;
            s.ballVy = -Math.max(3.8, Math.sqrt(36 - s.ballVx ** 2));
            try { soundFx.playBounce(500); } catch (e) {}
          }

          // Brick collision
          for (let i = s.bricks.length - 1; i >= 0; i--) {
            const b = s.bricks[i];
            if (
              s.ballX + s.ballRadius > b.x &&
              s.ballX - s.ballRadius < b.x + b.w &&
              s.ballY + s.ballRadius > b.y &&
              s.ballY - s.ballRadius < b.y + b.h
            ) {
              // Hit brick
              s.ballVy = -s.ballVy;
              b.hp--;

              s.score += 50;
              setScore(s.score);
              saveGameHighScore('brickbreaker', s.score);
              setHighScore((h) => Math.max(h, s.score));
              try { soundFx.playBounce(600); } catch (e) {}

              if (b.hp <= 0) {
                // Drop power-up randomly (15% chance)
                if (Math.random() < 0.18) {
                  const types: ('wide' | 'slow' | 'life')[] = ['wide', 'slow', 'life'];
                  const picked = types[Math.floor(Math.random() * types.length)];
                  s.powerUps.push({
                    x: b.x + b.w / 2,
                    y: b.y + b.h / 2,
                    type: picked,
                    radius: 8,
                  });
                }
                s.bricks.splice(i, 1);
              }

              // Check level cleared
              if (s.bricks.length === 0) {
                if (s.level >= 3) {
                  setHasWonGame(true);
                  try { soundFx.playFanfare(); } catch (e) {}
                  confetti({ particleCount: 160, spread: 90, origin: { y: 0.6 } });
                } else {
                  s.level++;
                  setLevel(s.level);
                  s.bricks = createLevelBricks(s.level);
                  resetBall();
                  try { soundFx.playPowerup(); } catch (e) {}
                }
              }
              break;
            }
          }

          // Bottom drain (lose ball)
          if (s.ballY > height + 10) {
            s.lives--;
            setLives(s.lives);
            try { soundFx.playError(); } catch (e) {}

            if (s.lives <= 0) {
              setIsGameOver(true);
            } else {
              resetBall();
            }
          }
        }

        // Power-ups physics
        for (let p = s.powerUps.length - 1; p >= 0; p--) {
          const pu = s.powerUps[p];
          pu.y += 2.2;

          // Paddle catch
          const paddleY = height - 30;
          if (
            pu.y + pu.radius >= paddleY &&
            pu.x >= s.paddleX &&
            pu.x <= s.paddleX + s.paddleW
          ) {
            try { soundFx.playPowerup(); } catch (e) {}
            if (pu.type === 'wide') {
              s.paddleW = Math.min(150, s.paddleW + 30);
            } else if (pu.type === 'slow') {
              s.ballVx *= 0.75;
              s.ballVy *= 0.75;
            } else if (pu.type === 'life') {
              s.lives = Math.min(5, s.lives + 1);
              setLives(s.lives);
            }
            s.powerUps.splice(p, 1);
            continue;
          }

          // Off bottom
          if (pu.y > height) {
            s.powerUps.splice(p, 1);
          }
        }
      }

      // -------------------------------------------------------------
      // RENDERING CANVAS
      // -------------------------------------------------------------
      ctx.clearRect(0, 0, width, height);

      const isRetro = mode === 'retro';

      // Background
      ctx.fillStyle = isRetro ? '#0f172a' : '#020617';
      ctx.fillRect(0, 0, width, height);

      // Bricks
      s.bricks.forEach((b) => {
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.w, b.h, [3]);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 2-HP brick indicator
        if (b.hp > 1) {
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('★', b.x + b.w / 2, b.y + b.h / 2 + 3);
        }
      });

      // Paddle
      const paddleY = height - 30;
      ctx.fillStyle = isRetro ? '#38bdf8' : '#06b6d4';
      ctx.beginPath();
      ctx.roundRect(s.paddleX, paddleY, s.paddleW, s.paddleH, [5]);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Ball
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.ballX, s.ballY, s.ballRadius, 0, Math.PI * 2);
      ctx.fill();

      // Power-ups
      s.powerUps.forEach((pu) => {
        ctx.fillStyle = pu.type === 'wide' ? '#22c55e' : pu.type === 'slow' ? '#3b82f6' : '#ec4899';
        ctx.beginPath();
        ctx.arc(pu.x, pu.y, pu.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      });

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isPaused, isGameOver, hasWonGame, mode]);

  const isRetro = mode === 'retro';

  return (
    <div className="space-y-4 font-sans select-none text-slate-100 max-w-3xl mx-auto">
      {/* Top Header Controls Bar */}
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
            🧱 {isRetro ? 'BRICK BREAKER 2000' : 'QUANTUM BREAKOUT 2026'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={startNewGame}
            className={`px-3 py-1 font-mono font-bold text-xs border-2 cursor-pointer flex items-center gap-1 shadow ${
              isRetro
                ? 'bg-[#d4d0c8] hover:bg-white text-black border-white border-r-gray-800 border-b-gray-800'
                : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 border-cyan-300 rounded'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>NOVO JOGO</span>
          </button>
        </div>
      </div>

      {/* Info Status Bar */}
      <div
        className={`px-4 py-2 border-2 rounded-lg flex items-center justify-between font-mono shadow-lg ${
          isRetro
            ? 'bg-[#000080] border-white text-white'
            : 'bg-slate-950/90 border-cyan-500/50 text-cyan-100 backdrop-blur-md'
        }`}
      >
        <div className="flex items-center gap-4">
          <span>Pontos: <strong className="text-yellow-300">{score}</strong></span>
          <span>Fase: <strong className="text-yellow-300">{level} / 3</strong></span>
        </div>

        <div className="flex items-center gap-4">
          <span>Vidas: <strong className="text-red-400">{'❤️ '.repeat(Math.max(0, lives))}</strong></span>
          <span>Recorde: <strong className="text-yellow-300">{highScore}</strong></span>
        </div>
      </div>

      {/* Canvas Cabinet */}
      <div className="flex flex-col items-center justify-center p-1 relative">
        <div
          className={`relative p-2.5 rounded-2xl border-4 shadow-2xl ${
            isRetro
              ? 'bg-[#1e293b] border-gray-400 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]'
              : 'bg-slate-950 border-cyan-500/50 shadow-[0_0_35px_rgba(6,182,212,0.25)]'
          }`}
        >
          <canvas
            ref={canvasRef}
            width={600}
            height={480}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            onClick={launchBall}
            className="w-full max-w-[600px] h-auto rounded-lg border-2 border-slate-700 block shadow-inner bg-black cursor-crosshair"
          />

          {/* Not playing pre-game overlay */}
          {!isPlaying && !isGameOver && !hasWonGame && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-4 text-center z-10">
              <p className="font-mono text-lg font-bold text-white mb-3">DESTRUA TODOS OS BLOCOS</p>
              <button
                onClick={startNewGame}
                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold text-sm rounded cursor-pointer shadow transition"
              >
                JOGAR AGORA 🧱
              </button>
            </div>
          )}

          {/* Virtual Mobile Controls */}
          <div className="pt-3 flex justify-between gap-4 select-none sm:hidden">
            <div className="flex gap-2">
              <button
                onTouchStart={() => (keys.current.left = true)}
                onTouchEnd={() => (keys.current.left = false)}
                className="w-16 h-12 bg-black/80 text-white rounded-xl flex items-center justify-center active:bg-cyan-700 shadow"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onTouchStart={() => (keys.current.right = true)}
                onTouchEnd={() => (keys.current.right = false)}
                className="w-16 h-12 bg-black/80 text-white rounded-xl flex items-center justify-center active:bg-cyan-700 shadow"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>
            <button
              onClick={launchBall}
              className="px-6 py-3 bg-yellow-500 active:bg-yellow-400 text-slate-950 font-mono font-bold text-xs rounded-xl shadow"
            >
              LANÇAR BOLA
            </button>
          </div>
        </div>
      </div>

      {/* Game Over / Victory Modal */}
      {(isGameOver || hasWonGame) && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div
            className={`max-w-md w-full p-6 rounded-xl border-4 text-center space-y-4 shadow-2xl ${
              isRetro
                ? 'bg-[#c0c0c0] border-white text-slate-900 shadow-[8px_8px_0px_rgba(0,0,0,0.5)]'
                : 'bg-slate-950 border-cyan-400 text-cyan-100'
            }`}
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-yellow-400 flex items-center justify-center text-3xl shadow-lg">
              {hasWonGame ? '🏆' : '💥'}
            </div>
            <h2
              className={`text-2xl font-mono font-black tracking-wider ${
                hasWonGame ? 'text-green-700 dark:text-cyan-300' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {hasWonGame ? 'PARABÉNS! VITÓRIA TOTAL!' : 'GAME OVER!'}
            </h2>
            <p className="text-sm font-mono leading-relaxed">
              {hasWonGame
                ? 'Você destruiu todos os blocos em todas as 3 fases!'
                : 'Suas vidas acabaram! Tente novamente para quebrar o recorde.'}
            </p>

            <div className="p-3 bg-white/60 dark:bg-slate-900 rounded font-mono text-sm space-y-1">
              <div>Pontuação Final: <strong>{score}</strong></div>
              <div>Recorde Salvo: <strong>{highScore}</strong></div>
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={startNewGame}
                className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white font-mono font-bold text-xs rounded cursor-pointer shadow transition"
              >
                JOGAR NOVAMENTE
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
