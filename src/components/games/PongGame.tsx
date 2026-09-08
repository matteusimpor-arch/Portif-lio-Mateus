import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw, Trophy, Volume2, Sparkles, Play, Pause, ChevronUp, ChevronDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../utils/soundEffects';
import { getGameHighScore, saveGameHighScore, setGameActiveStatus } from '../../utils/gameStorage';

interface PongGameProps {
  onBackToHub?: () => void;
  mode?: 'retro' | 'space';
}

export const PongGame: React.FC<PongGameProps> = ({
  onBackToHub,
  mode = 'retro',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [scorePlayer, setScorePlayer] = useState<number>(0);
  const [scoreCpu, setScoreCpu] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [winner, setWinner] = useState<'player' | 'cpu' | null>(null);
  const [rallyCount, setRallyCount] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');

  // Notify M-BOT
  useEffect(() => {
    setGameActiveStatus(true, 'Pong');
    return () => setGameActiveStatus(false);
  }, []);

  const keys = useRef<{ up: boolean; down: boolean }>({ up: false, down: false });

  const stateRef = useRef({
    width: 600,
    height: 380,
    paddleHeight: 70,
    paddleWidth: 12,
    playerY: 155,
    cpuY: 155,
    playerSpeed: 6.5,
    cpuSpeed: 5.0,
    ballX: 300,
    ballY: 190,
    ballVx: 5,
    ballVy: 2,
    ballRadius: 7,
    rally: 0,
    isScoring: false,
  });

  const resetBall = (directionToPlayer: boolean) => {
    const s = stateRef.current;
    s.ballX = s.width / 2;
    s.ballY = s.height / 2;
    s.ballVx = directionToPlayer ? -4.5 : 4.5;
    s.ballVy = (Math.random() - 0.5) * 4;
    s.rally = 0;
    setRallyCount(0);
    s.isScoring = false;
  };

  const startNewGame = () => {
    try {
      soundFx.playClick();
    } catch (e) {}

    setScorePlayer(0);
    setScoreCpu(0);
    setWinner(null);
    setIsPaused(false);
    resetBall(Math.random() > 0.5);
    setIsPlaying(true);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'KeyW', 'KeyS', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'Escape') {
        setIsPaused((p) => !p);
        return;
      }

      if (['ArrowUp', 'KeyW'].includes(e.code)) keys.current.up = true;
      if (['ArrowDown', 'KeyS'].includes(e.code)) keys.current.down = true;
      if (e.code === 'Space') {
        if (!isPlaying || winner) startNewGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) keys.current.up = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) keys.current.down = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, winner]);

  // Touch drag on paddle
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touchY = e.touches[0].clientY - rect.top;
    const scaleY = stateRef.current.height / rect.height;
    stateRef.current.playerY = Math.max(
      0,
      Math.min(stateRef.current.height - stateRef.current.paddleHeight, touchY * scaleY - stateRef.current.paddleHeight / 2)
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

      if (isPlaying && !isPaused && !winner) {
        // Player paddle movement
        if (keys.current.up) {
          s.playerY = Math.max(0, s.playerY - s.playerSpeed);
        }
        if (keys.current.down) {
          s.playerY = Math.min(height - s.paddleHeight, s.playerY + s.playerSpeed);
        }

        // CPU paddle movement with reaction delay
        const cpuSpeedMap = { easy: 3.8, normal: 5.2, hard: 6.8 };
        const cpuMaxSpeed = cpuSpeedMap[difficulty];
        const cpuCenter = s.cpuY + s.paddleHeight / 2;
        const diffY = s.ballY - cpuCenter;

        if (Math.abs(diffY) > 10) {
          s.cpuY += Math.sign(diffY) * Math.min(Math.abs(diffY), cpuMaxSpeed);
          s.cpuY = Math.max(0, Math.min(height - s.paddleHeight, s.cpuY));
        }

        // Ball physics
        if (!s.isScoring) {
          s.ballX += s.ballVx;
          s.ballY += s.ballVy;

          // Top and Bottom wall collision
          if (s.ballY - s.ballRadius < 0) {
            s.ballY = s.ballRadius;
            s.ballVy = Math.abs(s.ballVy);
            try { soundFx.playBounce(300); } catch (e) {}
          }
          if (s.ballY + s.ballRadius > height) {
            s.ballY = height - s.ballRadius;
            s.ballVy = -Math.abs(s.ballVy);
            try { soundFx.playBounce(300); } catch (e) {}
          }

          // Player Paddle Collision (Left)
          const playerPaddleX = 28;
          if (
            s.ballX - s.ballRadius < playerPaddleX + s.paddleWidth &&
            s.ballX + s.ballRadius > playerPaddleX &&
            s.ballY >= s.playerY - 4 &&
            s.ballY <= s.playerY + s.paddleHeight + 4
          ) {
            s.ballX = playerPaddleX + s.paddleWidth + s.ballRadius;
            // Calculate hit position relative to paddle center (-1 to 1)
            const hitFactor = (s.ballY - (s.playerY + s.paddleHeight / 2)) / (s.paddleHeight / 2);
            s.ballVy = hitFactor * 6;

            // Rally speed increase
            s.rally++;
            setRallyCount(s.rally);
            const speed = Math.min(13, 5 + s.rally * 0.35);
            s.ballVx = speed;

            try { soundFx.playBounce(480); } catch (e) {}
          }

          // CPU Paddle Collision (Right)
          const cpuPaddleX = width - 28 - s.paddleWidth;
          if (
            s.ballX + s.ballRadius > cpuPaddleX &&
            s.ballX - s.ballRadius < cpuPaddleX + s.paddleWidth &&
            s.ballY >= s.cpuY - 4 &&
            s.ballY <= s.cpuY + s.paddleHeight + 4
          ) {
            s.ballX = cpuPaddleX - s.ballRadius;
            const hitFactor = (s.ballY - (s.cpuY + s.paddleHeight / 2)) / (s.paddleHeight / 2);
            s.ballVy = hitFactor * 6;

            s.rally++;
            setRallyCount(s.rally);
            const speed = Math.min(13, 5 + s.rally * 0.35);
            s.ballVx = -speed;

            try { soundFx.playBounce(480); } catch (e) {}
          }

          // Point to CPU (Left wall passed)
          if (s.ballX < 0) {
            s.isScoring = true;
            try { soundFx.playError(); } catch (e) {}
            setScoreCpu((c) => {
              const newC = c + 1;
              if (newC >= 7) {
                setWinner('cpu');
              } else {
                setTimeout(() => resetBall(false), 800);
              }
              return newC;
            });
          }

          // Point to Player (Right wall passed)
          if (s.ballX > width) {
            s.isScoring = true;
            try { soundFx.playNotification(); } catch (e) {}
            setScorePlayer((p) => {
              const newP = p + 1;
              if (newP >= 7) {
                setWinner('player');
                try { soundFx.playFanfare(); } catch (e) {}
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                saveGameHighScore('pong', newP * 100);
              } else {
                setTimeout(() => resetBall(true), 800);
              }
              return newP;
            });
          }
        }
      }

      // -------------------------------------------------------------
      // RENDERING CANVAS
      // -------------------------------------------------------------
      ctx.clearRect(0, 0, width, height);

      const isRetro = mode === 'retro';

      // Pitch Court Background
      ctx.fillStyle = isRetro ? '#021808' : '#030712';
      ctx.fillRect(0, 0, width, height);

      // Center Dotted Line
      ctx.strokeStyle = isRetro ? '#22c55e' : '#06b6d4';
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 12]);
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Top and Bottom Court Borders
      ctx.strokeStyle = isRetro ? '#16a34a' : '#0891b2';
      ctx.lineWidth = 3;
      ctx.strokeRect(4, 4, width - 8, height - 8);

      // Player Paddle (Left)
      ctx.fillStyle = isRetro ? '#4ade80' : '#22d3ee';
      ctx.fillRect(28, s.playerY, s.paddleWidth, s.paddleHeight);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(28, s.playerY, s.paddleWidth, s.paddleHeight);

      // CPU Paddle (Right)
      ctx.fillStyle = isRetro ? '#f87171' : '#f43f5e';
      ctx.fillRect(width - 28 - s.paddleWidth, s.cpuY, s.paddleWidth, s.paddleHeight);
      ctx.strokeRect(width - 28 - s.paddleWidth, s.cpuY, s.paddleWidth, s.paddleHeight);

      // Ball
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.ballX, s.ballY, s.ballRadius, 0, Math.PI * 2);
      ctx.fill();

      // Scanline CRT effect for retro mode
      if (isRetro) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        for (let y = 0; y < height; y += 4) {
          ctx.fillRect(0, y, width, 1.5);
        }
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isPaused, winner, difficulty, mode]);

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
            🏓 {isRetro ? 'PONG 1972 (ARCADE CLÁSSICO)' : 'LASER PONG 2026'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Difficulty selector */}
          <div className="flex items-center gap-1">
            {(['easy', 'normal', 'hard'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-2 py-0.5 font-mono text-[11px] font-bold border rounded cursor-pointer transition ${
                  difficulty === d
                    ? 'bg-emerald-600 text-white border-emerald-300'
                    : 'bg-slate-800 text-slate-300 border-slate-600'
                }`}
              >
                {d === 'easy' ? 'FÁCIL' : d === 'normal' ? 'MÉDIO' : 'PRO'}
              </button>
            ))}
          </div>

          <button
            onClick={startNewGame}
            className={`px-3 py-1 font-mono font-bold text-xs border-2 cursor-pointer flex items-center gap-1 shadow ${
              isRetro
                ? 'bg-[#d4d0c8] hover:bg-white text-black border-white border-r-gray-800 border-b-gray-800'
                : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 border-emerald-300 rounded'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>NOVO JOGO</span>
          </button>
        </div>
      </div>

      {/* Broadcast Scoreboard (First to 7) */}
      <div
        className={`px-6 py-2 border-2 rounded-lg flex items-center justify-between font-mono shadow-lg ${
          isRetro
            ? 'bg-[#000080] border-white text-white'
            : 'bg-slate-950/90 border-cyan-500/50 text-cyan-100 backdrop-blur-md'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="font-black text-sm">MATEUS (VOCÊ)</span>
          <span className="text-3xl font-black text-green-400">{scorePlayer}</span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[10px] text-white/70 tracking-widest font-bold">PRIMEIRO A 7 PONTOS</span>
          <span className="text-xs text-yellow-300">RALLY: {rallyCount}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-3xl font-black text-red-400">{scoreCpu}</span>
          <span className="font-black text-sm">CPU ({difficulty.toUpperCase()})</span>
        </div>
      </div>

      {/* Pong Canvas Cabinet */}
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
            height={380}
            onTouchMove={handleTouchMove}
            className="w-full max-w-[600px] h-auto rounded-lg border-2 border-slate-700 block shadow-inner bg-black cursor-ns-resize"
          />

          {/* Not playing pre-game overlay */}
          {!isPlaying && !winner && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-4 text-center z-10">
              <p className="font-mono text-lg font-bold text-white mb-3">PONG: PRIMEIRO A 7 PONTOS</p>
              <button
                onClick={startNewGame}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono font-bold text-sm rounded cursor-pointer shadow transition"
              >
                COMEÇAR PARTIDA 🏓
              </button>
            </div>
          )}

          {/* Mobile Touch Buttons */}
          <div className="pt-3 flex justify-center gap-4 select-none sm:hidden">
            <button
              onTouchStart={() => (keys.current.up = true)}
              onTouchEnd={() => (keys.current.up = false)}
              className="w-16 h-12 bg-black/80 text-white rounded-xl flex items-center justify-center active:bg-emerald-700 shadow"
            >
              <ChevronUp className="w-8 h-8" />
            </button>
            <button
              onTouchStart={() => (keys.current.down = true)}
              onTouchEnd={() => (keys.current.down = false)}
              className="w-16 h-12 bg-black/80 text-white rounded-xl flex items-center justify-center active:bg-emerald-700 shadow"
            >
              <ChevronDown className="w-8 h-8" />
            </button>
          </div>
        </div>
      </div>

      {/* Match Winner Modal */}
      {winner && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div
            className={`max-w-md w-full p-6 rounded-xl border-4 text-center space-y-4 shadow-2xl ${
              isRetro
                ? 'bg-[#c0c0c0] border-white text-slate-900 shadow-[8px_8px_0px_rgba(0,0,0,0.5)]'
                : 'bg-slate-950 border-cyan-400 text-cyan-100'
            }`}
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-yellow-400 flex items-center justify-center text-3xl shadow-lg">
              {winner === 'player' ? '🏆' : '🏓'}
            </div>
            <h2 className="text-2xl font-mono font-black tracking-wider text-green-700 dark:text-cyan-300">
              {winner === 'player' ? 'VITÓRIA DE MATEUS!' : 'VITÓRIA DO CPU!'}
            </h2>
            <p className="text-sm font-mono leading-relaxed">
              {winner === 'player'
                ? 'Você alcançou 7 pontos primeiro e venceu a partida épica de Pong!'
                : 'O CPU atingiu 7 pontos primeiro. Tente novamente!'}
            </p>

            <div className="p-3 bg-white/60 dark:bg-slate-900 rounded font-mono text-sm space-y-1">
              <div>Placar Final: <strong>{scorePlayer} X {scoreCpu}</strong></div>
              <div>Dificuldade: <strong>{difficulty.toUpperCase()}</strong></div>
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
