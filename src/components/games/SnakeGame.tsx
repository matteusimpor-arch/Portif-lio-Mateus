import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, RotateCcw, Smartphone, Trophy, Volume2, Sparkles, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';

interface SnakeGameProps {
  onBackToHub?: () => void;
  mode?: 'retro' | 'space';
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export const SnakeGame: React.FC<SnakeGameProps> = ({
  onBackToHub,
  mode = 'retro',
}) => {
  const GRID_SIZE = 16;
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([
    { x: 8, y: 8 },
    { x: 7, y: 8 },
    { x: 6, y: 8 },
  ]);
  const [food, setFood] = useState<{ x: number; y: number }>({ x: 12, y: 8 });
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(160);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(110);

  // Direction handling with input queue to prevent rapid double-key self collision
  const currentDir = useRef<Direction>('RIGHT');
  const nextDirQueue = useRef<Direction[]>([]);

  const generateFood = useCallback((currentSnake: { x: number; y: number }[]) => {
    let newFood: { x: number; y: number };
    let collision: boolean;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      collision = currentSnake.some((segment) => segment.x === newFood.x && segment.y === newFood.y);
    } while (collision);
    return newFood;
  }, [GRID_SIZE]);

  const startGame = () => {
    try {
      soundFx.playClick();
    } catch (e) {}

    const initialSnake = [
      { x: 8, y: 8 },
      { x: 7, y: 8 },
      { x: 6, y: 8 },
    ];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setScore(0);
    setSpeed(110);
    currentDir.current = 'RIGHT';
    nextDirQueue.current = [];
    setIsGameOver(false);
    setIsActive(true);
  };

  const handleQueueDirection = (newDir: Direction) => {
    const lastDir = nextDirQueue.current.length > 0
      ? nextDirQueue.current[nextDirQueue.current.length - 1]
      : currentDir.current;

    // Prevent immediate 180 reversal
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
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        handleQueueDirection('UP');
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        handleQueueDirection('DOWN');
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        handleQueueDirection('LEFT');
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        handleQueueDirection('RIGHT');
      } else if (e.code === 'Space' && !isActive) {
        e.preventDefault();
        startGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  // Main game tick loop
  useEffect(() => {
    if (!isActive || isGameOver) return;

    const interval = setInterval(() => {
      // Dequeue next direction if available
      if (nextDirQueue.current.length > 0) {
        currentDir.current = nextDirQueue.current.shift()!;
      }

      setSnake((prevSnake) => {
        const head = { ...prevSnake[0] };
        const dir = currentDir.current;

        if (dir === 'UP') head.y -= 1;
        if (dir === 'DOWN') head.y += 1;
        if (dir === 'LEFT') head.x -= 1;
        if (dir === 'RIGHT') head.x += 1;

        // Wall collision -> Game Over (Nokia classic)
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setIsActive(false);
          setIsGameOver(true);
          try {
            soundFx.playError();
          } catch (e) {}
          return prevSnake;
        }

        // Self collision -> Game Over
        if (prevSnake.some((seg) => seg.x === head.x && seg.y === head.y)) {
          setIsActive(false);
          setIsGameOver(true);
          try {
            soundFx.playError();
          } catch (e) {}
          return prevSnake;
        }

        // Eat food
        if (head.x === food.x && head.y === food.y) {
          try {
            soundFx.playNotification();
          } catch (e) {}

          const newScore = score + 10;
          setScore(newScore);
          if (newScore > highScore) setHighScore(newScore);

          // Speed up slightly as snake grows
          setSpeed((prev) => Math.max(65, prev - 2));
          setFood(generateFood([head, ...prevSnake]));

          return [head, ...prevSnake];
        }

        return [head, ...prevSnake.slice(0, -1)];
      });
    }, speed);

    return () => clearInterval(interval);
  }, [isActive, isGameOver, speed, food, score, highScore, generateFood]);

  return (
    <div className="space-y-4 font-sans select-none text-gray-900 max-w-md mx-auto">
      {/* Top Game Navigation Bar */}
      <div className="bg-[#c0c0c0] p-2.5 border-2 border-white border-r-gray-800 border-b-gray-800 flex flex-wrap items-center justify-between gap-3 shadow">
        <div className="flex items-center gap-2">
          {onBackToHub && (
            <button
              onClick={onBackToHub}
              className="px-3 py-1.5 bg-[#d4d0c8] hover:bg-white text-gray-900 font-mono font-bold text-xs border-2 border-white border-r-gray-800 border-b-gray-800 cursor-pointer flex items-center gap-1.5 active:border-gray-800 active:border-r-white active:border-b-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>VOLTAR AOS JOGOS</span>
            </button>
          )}
          <div className="font-mono font-black text-xs text-[#000080] flex items-center gap-1">
            <Smartphone className="w-4 h-4 text-emerald-800" />
            <span>NOKIA 3310 SNAKE II</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={startGame}
            className="px-3 py-1.5 bg-[#d4d0c8] hover:bg-white text-black font-mono font-bold text-xs border-2 border-white border-r-gray-800 border-b-gray-800 cursor-pointer flex items-center gap-1 shadow"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>REINICIAR</span>
          </button>
        </div>
      </div>

      {/* Control Instructions Banner */}
      <div className="bg-[#000080] text-yellow-300 px-3 py-1.5 border border-white text-xs font-mono flex flex-wrap items-center justify-between gap-2 shadow-inner">
        <span>
          <strong>CONTROLES:</strong> <code className="bg-black/60 px-1 py-0.5 rounded text-white">▲ ▼ ◄ ►</code> ou <code className="bg-black/60 px-1 py-0.5 rounded text-white">W A S D</code> ou D-Pad na tela
        </span>
        <span className="text-white">Nokia 3310 Edition</span>
      </div>

      {/* Nokia 3310 Realistic Phone Body */}
      <div className="bg-[#1f2937] p-5 sm:p-6 border-4 border-[#374151] rounded-3xl text-gray-900 shadow-2xl space-y-4 max-w-xs mx-auto">
        {/* Nokia Branding & Speaker Grill */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-1 bg-[#4b5563] rounded-full" />
          <div className="text-center font-sans tracking-widest text-slate-300 font-black text-sm">
            NOKIA 3310
          </div>
        </div>

        {/* Authentic Green Phosphor LCD Matrix Screen */}
        <div className="bg-[#9bbc0f] p-3 border-4 border-[#8bac0f] rounded-lg shadow-inner font-mono">
          <div className="flex justify-between items-center text-[10px] text-[#0f380f] font-black border-b border-[#8bac0f] pb-1 mb-1 tracking-wider">
            <span>SNAKE II</span>
            <span>PONTOS: {score}</span>
            <span>HI: {highScore}</span>
          </div>

          <div
            className="bg-[#8bac0f] p-1 border-2 border-[#0f380f] aspect-square grid gap-0.5 shadow-inner"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
              const x = i % GRID_SIZE;
              const y = Math.floor(i / GRID_SIZE);
              const isHead = snake[0].x === x && snake[0].y === y;
              const isSnake = snake.some((s) => s.x === x && s.y === y);
              const isFood = food.x === x && food.y === y;

              return (
                <div
                  key={i}
                  className={`rounded-none ${
                    isHead
                      ? 'bg-[#0f380f] border border-[#9bbc0f]'
                      : isSnake
                      ? 'bg-[#0f380f]'
                      : isFood
                      ? 'bg-[#0f380f] animate-pulse'
                      : 'bg-[#9bbc0f]'
                  }`}
                />
              );
            })}
          </div>

          {/* LCD In-Screen Status */}
          {isGameOver && (
            <div className="mt-2 text-center text-xs font-black text-[#0f380f] border-t border-[#8bac0f] pt-1">
              💀 GAME OVER! PONTOS: {score}
            </div>
          )}
        </div>

        {/* Action Button */}
        {!isActive ? (
          <button
            onClick={startGame}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-mono font-black text-xs rounded-xl shadow-lg cursor-pointer active:scale-98 transition flex items-center justify-center gap-1.5"
          >
            <span>{isGameOver ? 'JOGAR NOVAMENTE' : 'INICIAR SNAKE'}</span>
          </button>
        ) : null}

        {/* Nokia Blue Soft Keys & Virtual D-Pad for Mobile & Touch */}
        <div className="pt-2 flex flex-col items-center gap-2">
          <div className="w-12 h-12">
            <button
              onClick={() => handleQueueDirection('UP')}
              className="w-full h-full bg-[#374151] hover:bg-[#4b5563] active:bg-[#6b7280] text-slate-200 rounded-lg flex items-center justify-center shadow cursor-pointer active:scale-95 transition"
              title="Cima"
            >
              <ChevronUp className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleQueueDirection('LEFT')}
              className="w-12 h-12 bg-[#374151] hover:bg-[#4b5563] active:bg-[#6b7280] text-slate-200 rounded-lg flex items-center justify-center shadow cursor-pointer active:scale-95 transition"
              title="Esquerda"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={() => handleQueueDirection('DOWN')}
              className="w-12 h-12 bg-[#374151] hover:bg-[#4b5563] active:bg-[#6b7280] text-slate-200 rounded-lg flex items-center justify-center shadow cursor-pointer active:scale-95 transition"
              title="Baixo"
            >
              <ChevronDown className="w-6 h-6" />
            </button>

            <button
              onClick={() => handleQueueDirection('RIGHT')}
              className="w-12 h-12 bg-[#374151] hover:bg-[#4b5563] active:bg-[#6b7280] text-slate-200 rounded-lg flex items-center justify-center shadow cursor-pointer active:scale-95 transition"
              title="Direita"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
