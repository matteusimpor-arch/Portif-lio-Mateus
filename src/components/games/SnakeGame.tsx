import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, RotateCcw, Trophy, Volume2, Sparkles, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Pause, Play, Shield } from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';
import { getGameHighScore, saveGameHighScore, setGameActiveStatus } from '../../utils/gameStorage';

interface SnakeGameProps {
  onBackToHub?: () => void;
  mode?: 'retro' | 'space';
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type BorderMode = 'WALL' | 'WRAP';

export const SnakeGame: React.FC<SnakeGameProps> = ({
  onBackToHub,
  mode = 'retro',
}) => {
  const GRID_SIZE = 18;
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([
    { x: 9, y: 9 },
    { x: 8, y: 9 },
    { x: 7, y: 9 },
  ]);
  const [food, setFood] = useState<{ x: number; y: number }>({ x: 13, y: 9 });
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => getGameHighScore('snake', 200));
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [borderMode, setBorderMode] = useState<BorderMode>('WALL');
  const [speed, setSpeed] = useState<number>(120);

  // Direction handling with queue to prevent double-key suicide
  const currentDir = useRef<Direction>('RIGHT');
  const nextDirQueue = useRef<Direction[]>([]);

  // Mobile touch gesture tracking
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  // Game container ref to keep focus and prevent scrolling
  const gameContainerRef = useRef<HTMLDivElement | null>(null);

  // Notify M-BOT
  useEffect(() => {
    setGameActiveStatus(true, 'Snake');
    return () => setGameActiveStatus(false);
  }, []);

  const generateFood = useCallback((currentSnake: { x: number; y: number }[]) => {
    let newFood: { x: number; y: number };
    let collision: boolean;
    let attempts = 0;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      collision = currentSnake.some((segment) => segment.x === newFood.x && segment.y === newFood.y);
      attempts++;
    } while (collision && attempts < 400);

    return newFood;
  }, [GRID_SIZE]);

  const startGame = () => {
    try {
      soundFx.playClick();
    } catch (e) {}

    const initialSnake = [
      { x: 9, y: 9 },
      { x: 8, y: 9 },
      { x: 7, y: 9 },
    ];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setScore(0);
    setSpeed(120);
    currentDir.current = 'RIGHT';
    nextDirQueue.current = [];
    setIsGameOver(false);
    setIsPaused(false);
    setIsActive(true);
  };

  const handleQueueDirection = (newDir: Direction) => {
    if (!isActive || isGameOver || isPaused) return;

    const lastDir = nextDirQueue.current.length > 0
      ? nextDirQueue.current[nextDirQueue.current.length - 1]
      : currentDir.current;

    // Prevent immediate 180 reverse
    if (
      (newDir === 'UP' && lastDir === 'DOWN') ||
      (newDir === 'DOWN' && lastDir === 'UP') ||
      (newDir === 'LEFT' && lastDir === 'RIGHT') ||
      (newDir === 'RIGHT' && lastDir === 'LEFT') ||
      newDir === lastDir
    ) {
      return;
    }

    if (nextDirQueue.current.length < 2) {
      nextDirQueue.current.push(newDir);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent page scrolling on game keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'Escape') {
        if (isActive && !isGameOver) {
          setIsPaused((p) => !p);
        }
        return;
      }

      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        handleQueueDirection('UP');
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        handleQueueDirection('DOWN');
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        handleQueueDirection('LEFT');
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        handleQueueDirection('RIGHT');
      } else if (e.code === 'Space') {
        if (!isActive || isGameOver) {
          startGame();
        } else {
          setIsPaused((p) => !p);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, isGameOver, isPaused]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartPos.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartPos.current.x;
    const dy = touch.clientY - touchStartPos.current.y;
    touchStartPos.current = null;

    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return; // ignore taps

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) handleQueueDirection('RIGHT');
      else handleQueueDirection('LEFT');
    } else {
      if (dy > 0) handleQueueDirection('DOWN');
      else handleQueueDirection('UP');
    }
  };

  // Main game tick loop
  useEffect(() => {
    if (!isActive || isGameOver || isPaused) return;

    const interval = setInterval(() => {
      if (nextDirQueue.current.length > 0) {
        currentDir.current = nextDirQueue.current.shift()!;
      }

      setSnake((prevSnake) => {
        let headX = prevSnake[0].x;
        let headY = prevSnake[0].y;
        const dir = currentDir.current;

        if (dir === 'UP') headY -= 1;
        if (dir === 'DOWN') headY += 1;
        if (dir === 'LEFT') headX -= 1;
        if (dir === 'RIGHT') headX += 1;

        // Border handling
        if (borderMode === 'WRAP') {
          if (headX < 0) headX = GRID_SIZE - 1;
          if (headX >= GRID_SIZE) headX = 0;
          if (headY < 0) headY = GRID_SIZE - 1;
          if (headY >= GRID_SIZE) headY = 0;
        } else {
          // Wall collision
          if (headX < 0 || headX >= GRID_SIZE || headY < 0 || headY >= GRID_SIZE) {
            setIsActive(false);
            setIsGameOver(true);
            try { soundFx.playError(); } catch (e) {}
            return prevSnake;
          }
        }

        const newHead = { x: headX, y: headY };

        // Self-collision (check all segments except the very tail if moving)
        const hitSelf = prevSnake.some((segment, idx) => {
          if (idx === prevSnake.length - 1) return false;
          return segment.x === newHead.x && segment.y === newHead.y;
        });

        if (hitSelf) {
          setIsActive(false);
          setIsGameOver(true);
          try { soundFx.playError(); } catch (e) {}
          return prevSnake;
        }

        // Eating food
        if (newHead.x === food.x && newHead.y === food.y) {
          try { soundFx.playPowerup(); } catch (e) {}
          const newScore = score + 10;
          setScore(newScore);
          saveGameHighScore('snake', newScore);
          setHighScore(getGameHighScore('snake', newScore));

          // Gradually increase speed
          setSpeed((prev) => Math.max(65, prev - 2));

          const expandedSnake = [newHead, ...prevSnake];
          setFood(generateFood(expandedSnake));
          return expandedSnake;
        }

        return [newHead, ...prevSnake.slice(0, -1)];
      });
    }, speed);

    return () => clearInterval(interval);
  }, [isActive, isGameOver, isPaused, borderMode, speed, food, score, generateFood, GRID_SIZE]);

  const isRetro = mode === 'retro';

  return (
    <div
      ref={gameContainerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="space-y-4 font-sans select-none text-slate-100 max-w-2xl mx-auto"
    >
      {/* Header Controls Bar */}
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
            🐍 {isRetro ? 'SNAKE NOKIA 3310' : 'COSMIC SNAKE 2026'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setBorderMode((m) => (m === 'WALL' ? 'WRAP' : 'WALL'))}
            className={`px-2 py-1 font-mono text-xs font-bold border rounded cursor-pointer transition ${
              isRetro
                ? 'bg-[#d4d0c8] text-gray-900 border-gray-600'
                : 'bg-slate-800 text-cyan-300 border-cyan-600'
            }`}
            title="Alternar colisão de borda"
          >
            BORDAS: {borderMode === 'WALL' ? 'PAREDE' : 'WRAP'}
          </button>

          {isActive && !isGameOver && (
            <button
              onClick={() => setIsPaused((p) => !p)}
              className="px-2.5 py-1 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-mono font-bold text-xs border border-yellow-600 rounded flex items-center gap-1 cursor-pointer shadow"
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? 'CONTINUAR' : 'PAUSAR'}</span>
            </button>
          )}

          <button
            onClick={startGame}
            className={`px-3 py-1 font-mono font-bold text-xs border-2 cursor-pointer flex items-center gap-1 shadow ${
              isRetro
                ? 'bg-[#d4d0c8] hover:bg-white text-black border-white border-r-gray-800 border-b-gray-800'
                : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 border-emerald-300 rounded'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isActive ? 'REINICIAR' : 'INICIAR JOGO'}</span>
          </button>
        </div>
      </div>

      {/* Info Status Bar */}
      <div
        className={`px-3 py-1.5 border text-xs font-mono flex flex-wrap items-center justify-between gap-2 shadow-inner ${
          isRetro
            ? 'bg-[#000080] border-white text-yellow-300'
            : 'bg-emerald-950/60 border-emerald-800/80 text-emerald-200 rounded'
        }`}
      >
        <span>
          <strong>CONTROLES:</strong> Setas / WASD / Swipe no celular | Espaço para iniciar/pausar
        </span>
        <div className="flex items-center gap-4 text-white">
          <span>Pontos: <strong className="text-yellow-300">{score}</strong></span>
          <span>Tamanho: <strong className="text-yellow-300">{snake.length}</strong></span>
          <span>Recorde: <strong className="text-yellow-300">{highScore}</strong></span>
        </div>
      </div>

      {/* Main Game Screen (Nokia 3310 LCD in Retro / Holographic Neon in Space) */}
      <div className="flex flex-col items-center justify-center p-2">
        <div
          className={`relative p-3 rounded-2xl border-4 shadow-2xl transition ${
            isRetro
              ? 'bg-[#97b483] border-[#556b46] shadow-[inset_0_0_20px_rgba(0,0,0,0.3)]'
              : 'bg-slate-950/90 border-emerald-500/50 shadow-[0_0_35px_rgba(16,185,129,0.25)] backdrop-blur-md'
          }`}
        >
          {/* LCD Frame Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/20 font-mono text-[11px] font-bold text-black/80 dark:text-emerald-400">
            <span>● BATTERY: [||||]</span>
            <span>NOKIA 3310</span>
            <span>SIGNAL: ▮▮▮▮</span>
          </div>

          {/* Grid Canvas representation */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
              width: 'min(80vw, 360px)',
              height: 'min(80vw, 360px)',
            }}
            className={`border-2 relative rounded overflow-hidden ${
              isRetro ? 'border-black/50 bg-[#8da879]' : 'border-emerald-500/40 bg-black/60'
            }`}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
              const x = index % GRID_SIZE;
              const y = Math.floor(index / GRID_SIZE);

              const isHead = snake[0].x === x && snake[0].y === y;
              const isBody = snake.slice(1).some((s) => s.x === x && s.y === y);
              const isFood = food.x === x && food.y === y;

              return (
                <div
                  key={index}
                  className={`w-full h-full flex items-center justify-center transition-all duration-75 ${
                    isHead
                      ? isRetro
                        ? 'bg-black rounded-sm'
                        : 'bg-emerald-400 rounded-sm shadow-[0_0_8px_#34d399]'
                      : isBody
                      ? isRetro
                        ? 'bg-black/90 rounded-[1px]'
                        : 'bg-emerald-600 rounded-[1px]'
                      : isFood
                      ? isRetro
                        ? 'bg-black animate-pulse rounded-full'
                        : 'bg-red-500 animate-ping rounded-full shadow-[0_0_10px_#ef4444]'
                      : 'border-[0.5px] border-black/5 dark:border-emerald-950/30'
                  }`}
                />
              );
            })}

            {/* Overlay if not active or paused */}
            {!isActive && !isGameOver && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-4 text-center z-10">
                <p className="font-mono text-sm font-bold text-white mb-2">PRESSIONE PARA JOGAR</p>
                <button
                  onClick={startGame}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono font-bold text-xs rounded cursor-pointer shadow transition"
                >
                  JOGAR AGORA
                </button>
              </div>
            )}

            {isPaused && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-4 text-center z-10">
                <p className="font-mono text-lg font-bold text-yellow-300 mb-2">JOGO PAUSADO</p>
                <button
                  onClick={() => setIsPaused(false)}
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-mono font-bold text-xs rounded cursor-pointer shadow transition"
                >
                  CONTINUAR
                </button>
              </div>
            )}
          </div>

          {/* D-Pad Virtual Controls for Mobile */}
          <div className="pt-4 flex flex-col items-center gap-1.5 select-none">
            <button
              onClick={() => handleQueueDirection('UP')}
              className="w-12 h-11 bg-black/80 text-white rounded-lg flex items-center justify-center active:scale-95 shadow active:bg-emerald-700 cursor-pointer"
              aria-label="Cima"
            >
              <ChevronUp className="w-6 h-6" />
            </button>
            <div className="flex gap-4">
              <button
                onClick={() => handleQueueDirection('LEFT')}
                className="w-12 h-11 bg-black/80 text-white rounded-lg flex items-center justify-center active:scale-95 shadow active:bg-emerald-700 cursor-pointer"
                aria-label="Esquerda"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => handleQueueDirection('DOWN')}
                className="w-12 h-11 bg-black/80 text-white rounded-lg flex items-center justify-center active:scale-95 shadow active:bg-emerald-700 cursor-pointer"
                aria-label="Baixo"
              >
                <ChevronDown className="w-6 h-6" />
              </button>
              <button
                onClick={() => handleQueueDirection('RIGHT')}
                className="w-12 h-11 bg-black/80 text-white rounded-lg flex items-center justify-center active:scale-95 shadow active:bg-emerald-700 cursor-pointer"
                aria-label="Direita"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
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
                : 'bg-slate-950 border-emerald-400 text-emerald-100'
            }`}
          >
            <div className="w-14 h-14 mx-auto rounded-full bg-red-600 flex items-center justify-center text-3xl shadow-lg animate-pulse">
              💥
            </div>
            <h2 className="text-2xl font-mono font-black tracking-wider text-red-600 dark:text-red-400">
              GAME OVER!
            </h2>
            <p className="text-sm font-mono leading-relaxed">
              A cobrinha colidiu com {borderMode === 'WALL' ? 'a parede ou com ela mesma' : 'seu próprio corpo'}!
            </p>

            <div className="p-3 bg-white/60 dark:bg-slate-900 rounded font-mono text-sm space-y-1">
              <div>Pontuação: <strong className="text-emerald-700 dark:text-emerald-300">{score}</strong></div>
              <div>Tamanho Final: <strong>{snake.length} segmentos</strong></div>
              <div>Recorde Salvo: <strong>{highScore}</strong></div>
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={startGame}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-mono font-bold text-xs rounded cursor-pointer shadow transition"
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
