import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Sparkles, Trophy, RefreshCw, Zap, Flag, Bomb, Flame, Rocket, Smartphone } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../utils/soundEffects';

// Dedicated Sub-Games
import { SolitaireGame } from '../games/SolitaireGame';
import { SoccerGame } from '../games/SoccerGame';
import { KartGame } from '../games/KartGame';

type GameTab = 'solitaire' | 'soccer' | 'kart' | 'minesweeper' | 'pinball' | 'snake';

export const ExperimentsApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GameTab>('solitaire');

  // ==========================================
  // 1. MINESWEEPER (CAMPO MINADO 2000) STATE
  // ==========================================
  const GRID_SIZE_MS = 8;
  const MINES_COUNT = 9;
  type Cell = { mine: boolean; revealed: boolean; flagged: boolean; count: number };

  const [msGrid, setMsGrid] = useState<Cell[][]>([]);
  const [msStatus, setMsStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [msMinesLeft, setMsMinesLeft] = useState<number>(MINES_COUNT);
  const [msTimer, setMsTimer] = useState<number>(0);
  const [msFlagMode, setMsFlagMode] = useState<boolean>(false);

  const initMinesweeper = () => {
    try {
      soundFx.playClick();
    } catch (e) {}

    const grid: Cell[][] = Array.from({ length: GRID_SIZE_MS }, () =>
      Array.from({ length: GRID_SIZE_MS }, () => ({
        mine: false,
        revealed: false,
        flagged: false,
        count: 0,
      }))
    );

    // Place mines randomly
    let placed = 0;
    while (placed < MINES_COUNT) {
      const rx = Math.floor(Math.random() * GRID_SIZE_MS);
      const ry = Math.floor(Math.random() * GRID_SIZE_MS);
      if (!grid[ry][rx].mine) {
        grid[ry][rx].mine = true;
        placed++;
      }
    }

    // Calculate neighbor mine counts
    for (let r = 0; r < GRID_SIZE_MS; r++) {
      for (let c = 0; c < GRID_SIZE_MS; c++) {
        if (grid[r][c].mine) continue;
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < GRID_SIZE_MS && nc >= 0 && nc < GRID_SIZE_MS) {
              if (grid[nr][nc].mine) count++;
            }
          }
        }
        grid[r][c].count = count;
      }
    }

    setMsGrid(grid);
    setMsStatus('playing');
    setMsMinesLeft(MINES_COUNT);
    setMsTimer(0);
  };

  useEffect(() => {
    initMinesweeper();
  }, []);

  // Timer interval for Minesweeper
  useEffect(() => {
    if (msStatus !== 'playing') return;
    const timer = setInterval(() => {
      setMsTimer((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [msStatus]);

  const handleCellClick = (r: number, c: number) => {
    if (msStatus !== 'playing') return;
    const grid = msGrid.map((row) => row.map((cell) => ({ ...cell })));
    const target = grid[r][c];

    if (msFlagMode) {
      if (target.revealed) return;
      try {
        soundFx.playClick();
      } catch (e) {}
      target.flagged = !target.flagged;
      setMsMinesLeft((prev) => (target.flagged ? prev - 1 : prev + 1));
      setMsGrid(grid);
      return;
    }

    if (target.flagged || target.revealed) return;

    if (target.mine) {
      try {
        soundFx.playError();
      } catch (e) {}
      target.revealed = true;
      grid.forEach((row) =>
        row.forEach((cell) => {
          if (cell.mine) cell.revealed = true;
        })
      );
      setMsGrid(grid);
      setMsStatus('lost');
      return;
    }

    try {
      soundFx.playClick();
    } catch (e) {}
    const revealEmpty = (row: number, col: number) => {
      if (row < 0 || row >= GRID_SIZE_MS || col < 0 || col >= GRID_SIZE_MS) return;
      const cell = grid[row][col];
      if (cell.revealed || cell.flagged) return;
      cell.revealed = true;
      if (cell.count === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr !== 0 || dc !== 0) revealEmpty(row + dr, col + dc);
          }
        }
      }
    };

    revealEmpty(r, c);

    let unrevealedNonMines = 0;
    grid.forEach((row) =>
      row.forEach((cell) => {
        if (!cell.mine && !cell.revealed) unrevealedNonMines++;
      })
    );

    if (unrevealedNonMines === 0) {
      setMsStatus('won');
      try {
        soundFx.playFanfare();
      } catch (e) {}
      confetti({ particleCount: 120, spread: 80 });
    }

    setMsGrid(grid);
  };

  const handleCellRightClick = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (msStatus !== 'playing') return;
    const grid = msGrid.map((row) => row.map((cell) => ({ ...cell })));
    const target = grid[r][c];
    if (target.revealed) return;

    try {
      soundFx.playClick();
    } catch (e) {}
    target.flagged = !target.flagged;
    setMsMinesLeft((prev) => (target.flagged ? prev - 1 : prev + 1));
    setMsGrid(grid);
  };

  // ==========================================
  // 2. 3D PINBALL SPACE CADET 2000 (CANVAS)
  // ==========================================
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pinScore, setPinScore] = useState<number>(0);
  const [pinLives, setPinLives] = useState<number>(3);
  const [pinActive, setPinActive] = useState<boolean>(false);
  const [pinMultiplier, setPinMultiplier] = useState<number>(1);
  const [pinRank, setPinRank] = useState<string>('Cadete Espacial');

  useEffect(() => {
    if (!pinActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let ballX = 150;
    let ballY = 220;
    let ballVx = 3;
    let ballVy = -4.5;
    const paddleWidth = 75;
    let paddleX = 115;
    let animId: number;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') paddleX = Math.max(10, paddleX - 25);
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') paddleX = Math.min(canvas.width - paddleWidth - 10, paddleX + 25);
    };

    window.addEventListener('keydown', handleKeyDown);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Deep space table gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, '#0a0d24');
      bgGrad.addColorStop(0.5, '#0e1538');
      bgGrad.addColorStop(1, '#050714');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Space Cadet table decorative orbits & lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(150, 90, 70, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(150, 90, 45, 0, Math.PI * 2);
      ctx.stroke();

      // Bumpers
      const bumpers = [
        { x: 90, y: 70, r: 18, color: '#38bdf8', glow: '#0284c7', pts: 100 },
        { x: 210, y: 70, r: 18, color: '#ec4899', glow: '#be185d', pts: 100 },
        { x: 150, y: 110, r: 22, color: '#facc15', glow: '#ca8a04', pts: 250 },
        { x: 50, y: 140, r: 14, color: '#a855f7', glow: '#7e22ce', pts: 75 },
        { x: 250, y: 140, r: 14, color: '#a855f7', glow: '#7e22ce', pts: 75 },
      ];

      bumpers.forEach((b) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.glow;
        ctx.shadowBlur = 10;
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // Bump center core
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r / 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        const dx = ballX - b.x;
        const dy = ballY - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < b.r + 8) {
          ballVx = (dx / dist) * 5.2;
          ballVy = (dy / dist) * 5.2;
          setPinScore((s) => {
            const next = s + b.pts;
            if (next > 3000) setPinRank('Comandante');
            else if (next > 1500) setPinRank('Tenente');
            else if (next > 600) setPinRank('Alferes');
            return next;
          });
          try {
            soundFx.playPowerup();
          } catch (e) {}
        }
      });

      // Hyperspace Launch Lane (Right edge)
      ctx.fillStyle = 'rgba(250, 204, 21, 0.2)';
      ctx.fillRect(canvas.width - 20, 0, 18, canvas.height);
      ctx.strokeStyle = '#facc15';
      ctx.strokeRect(canvas.width - 20, 0, 18, canvas.height);

      ballX += ballVx;
      ballY += ballVy;

      // Ball wall collisions
      if (ballX <= 8) {
        ballX = 8;
        ballVx = Math.abs(ballVx);
      }
      if (ballX >= canvas.width - 28) {
        ballX = canvas.width - 28;
        ballVx = -Math.abs(ballVx);
      }
      if (ballY <= 8) {
        ballY = 8;
        ballVy = Math.abs(ballVy);
      }

      // Flipper paddle collision
      if (ballY >= canvas.height - 32 && ballY <= canvas.height - 14) {
        if (ballX >= paddleX && ballX <= paddleX + paddleWidth) {
          ballVy = -Math.abs(ballVy) * 1.04;
          ballVx += (ballX - (paddleX + paddleWidth / 2)) * 0.12;
          setPinScore((s) => s + 20);
          try {
            soundFx.playClick();
          } catch (e) {}
        }
      }

      // Ball drain
      if (ballY > canvas.height + 25) {
        setPinLives((l) => {
          if (l <= 1) {
            setPinActive(false);
            try {
              soundFx.playError();
            } catch (e) {}
            return 0;
          }
          ballX = 150;
          ballY = 190;
          ballVx = 3;
          ballVy = -4.5;
          return l - 1;
        });
      }

      // Draw Shiny Steel Pinball
      ctx.save();
      ctx.beginPath();
      ctx.arc(ballX, ballY, 7.5, 0, Math.PI * 2);
      ctx.fillStyle = '#e2e8f0';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Pinball light reflection
      ctx.beginPath();
      ctx.arc(ballX - 2, ballY - 2, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();

      // Draw Flippers
      ctx.save();
      ctx.fillStyle = '#2563eb';
      ctx.shadowColor = '#60a5fa';
      ctx.shadowBlur = 6;
      ctx.fillRect(paddleX, canvas.height - 22, paddleWidth, 11);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(paddleX, canvas.height - 22, paddleWidth, 11);
      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(animId);
    };
  }, [pinActive]);

  const startPinball = () => {
    try {
      soundFx.playBootSound();
    } catch (e) {}
    setPinScore(0);
    setPinLives(3);
    setPinRank('Cadete Espacial');
    setPinActive(true);
  };

  // ==========================================
  // 3. NOKIA 3310 SNAKE II (ANO 2000) STATE
  // ==========================================
  const [snakeScore, setSnakeScore] = useState<number>(0);
  const [snakeHighScore, setSnakeHighScore] = useState<number>(140);
  const [snakeActive, setSnakeActive] = useState<boolean>(false);
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 },
  ]);
  const [food, setFood] = useState<{ x: number; y: number }>({ x: 8, y: 8 });
  const [dir, setDir] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT');
  const [snakeSpeed, setSnakeSpeed] = useState<number>(140);
  const GRID_SIZE_SNAKE = 14;

  const startSnake = () => {
    try {
      soundFx.playClick();
    } catch (e) {}
    setSnakeScore(0);
    setSnake([
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ]);
    setFood({
      x: Math.floor(Math.random() * GRID_SIZE_SNAKE),
      y: Math.floor(Math.random() * GRID_SIZE_SNAKE),
    });
    setDir('RIGHT');
    setSnakeActive(true);
  };

  useEffect(() => {
    if (!snakeActive) return;
    const interval = setInterval(() => {
      setSnake((prevSnake) => {
        const head = { ...prevSnake[0] };
        if (dir === 'UP') head.y -= 1;
        if (dir === 'DOWN') head.y += 1;
        if (dir === 'LEFT') head.x -= 1;
        if (dir === 'RIGHT') head.x += 1;

        // Wrap walls or collision
        if (head.x < 0 || head.x >= GRID_SIZE_SNAKE || head.y < 0 || head.y >= GRID_SIZE_SNAKE) {
          setSnakeActive(false);
          try {
            soundFx.playError();
          } catch (e) {}
          return prevSnake;
        }

        // Self-collision
        if (prevSnake.some((segment) => segment.x === head.x && segment.y === head.y)) {
          setSnakeActive(false);
          try {
            soundFx.playError();
          } catch (e) {}
          return prevSnake;
        }

        // Food collision
        if (head.x === food.x && head.y === food.y) {
          try {
            soundFx.playNotification();
          } catch (e) {}
          setSnakeScore((s) => {
            const next = s + 10;
            if (next > snakeHighScore) setSnakeHighScore(next);
            return next;
          });
          setFood({
            x: Math.floor(Math.random() * GRID_SIZE_SNAKE),
            y: Math.floor(Math.random() * GRID_SIZE_SNAKE),
          });
          return [head, ...prevSnake];
        }

        return [head, ...prevSnake.slice(0, -1)];
      });
    }, snakeSpeed);
    return () => clearInterval(interval);
  }, [snakeActive, dir, food, snakeSpeed, snakeHighScore]);

  return (
    <div className="space-y-4 font-sans text-slate-200">
      {/* Top Retro Game Center Banner */}
      <div className="bg-[#c0c0c0] p-3 border-2 border-white border-r-gray-800 border-b-gray-800 text-gray-900 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#000080] text-yellow-300 border border-white font-mono font-bold text-lg rounded-xs flex items-center gap-1.5 shadow">
            <Gamepad2 className="w-5 h-5 text-yellow-300" />
            <span>GAMES.EXE</span>
          </div>
          <div>
            <h1 className="text-base font-black font-mono tracking-tight text-gray-900">
              MATEUS ARCADE &amp; GAME CENTER 2000
            </h1>
            <p className="text-xs text-gray-700">
              Selecione um jogo clássico do ano 2000: Paciência 2000, Futebol 2000, Mario Kart 2000, Campo Minado, 3D Pinball Space Cadet e Nokia Snake II
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-1 bg-[#a0a0a0] p-1 border border-gray-600 rounded">
          <button
            onClick={() => {
              try { soundFx.playClick(); } catch (e) {}
              setActiveTab('solitaire');
            }}
            className={`px-3 py-1.5 text-xs font-mono font-bold border border-white border-r-gray-800 border-b-gray-800 cursor-pointer transition ${
              activeTab === 'solitaire'
                ? 'bg-[#000080] text-white font-black shadow-inner'
                : 'bg-[#c0c0c0] text-black hover:bg-[#d0d0d0]'
            }`}
          >
            ♠ Paciência 2000
          </button>
          <button
            onClick={() => {
              try { soundFx.playClick(); } catch (e) {}
              setActiveTab('soccer');
            }}
            className={`px-3 py-1.5 text-xs font-mono font-bold border border-white border-r-gray-800 border-b-gray-800 cursor-pointer transition ${
              activeTab === 'soccer'
                ? 'bg-[#000080] text-white font-black shadow-inner'
                : 'bg-[#c0c0c0] text-black hover:bg-[#d0d0d0]'
            }`}
          >
            ⚽ Futebol 2000
          </button>
          <button
            onClick={() => {
              try { soundFx.playClick(); } catch (e) {}
              setActiveTab('kart');
            }}
            className={`px-3 py-1.5 text-xs font-mono font-bold border border-white border-r-gray-800 border-b-gray-800 cursor-pointer transition ${
              activeTab === 'kart'
                ? 'bg-[#000080] text-white font-black shadow-inner'
                : 'bg-[#c0c0c0] text-black hover:bg-[#d0d0d0]'
            }`}
          >
            🏎️ Mario Kart 2000
          </button>
          <button
            onClick={() => {
              try { soundFx.playClick(); } catch (e) {}
              setActiveTab('minesweeper');
            }}
            className={`px-3 py-1.5 text-xs font-mono font-bold border border-white border-r-gray-800 border-b-gray-800 cursor-pointer transition ${
              activeTab === 'minesweeper'
                ? 'bg-[#000080] text-white font-black shadow-inner'
                : 'bg-[#c0c0c0] text-black hover:bg-[#d0d0d0]'
            }`}
          >
            💣 Campo Minado
          </button>
          <button
            onClick={() => {
              try { soundFx.playClick(); } catch (e) {}
              setActiveTab('pinball');
            }}
            className={`px-2.5 py-1.5 text-xs font-mono font-bold border border-white border-r-gray-800 border-b-gray-800 cursor-pointer transition ${
              activeTab === 'pinball'
                ? 'bg-[#000080] text-white font-black shadow-inner'
                : 'bg-[#c0c0c0] text-black hover:bg-[#d0d0d0]'
            }`}
          >
            🚀 3D Pinball Cadet
          </button>
          <button
            onClick={() => {
              try { soundFx.playClick(); } catch (e) {}
              setActiveTab('snake');
            }}
            className={`px-2.5 py-1.5 text-xs font-mono font-bold border border-white border-r-gray-800 border-b-gray-800 cursor-pointer transition ${
              activeTab === 'snake'
                ? 'bg-[#000080] text-white font-black shadow-inner'
                : 'bg-[#c0c0c0] text-black hover:bg-[#d0d0d0]'
            }`}
          >
            📱 Snake Nokia 3310
          </button>
        </div>
      </div>

      {/* ================= TAB: PACIÊNCIA 2000 ================= */}
      {activeTab === 'solitaire' && <SolitaireGame />}

      {/* ================= TAB: FUTEBOL 2000 ================= */}
      {activeTab === 'soccer' && <SoccerGame />}

      {/* ================= TAB: MARIO KART 2000 ================= */}
      {activeTab === 'kart' && <KartGame />}

      {/* ================= TAB: CAMPO MINADO 2000 ================= */}
      {activeTab === 'minesweeper' && (
        <div className="bg-[#c0c0c0] p-4 border-2 border-white border-r-gray-800 border-b-gray-800 text-gray-900 max-w-md mx-auto space-y-4 shadow-xl">
          <div className="bg-[#a0a0a0] p-2 border-2 border-gray-600 border-r-white border-b-white flex items-center justify-between font-mono font-bold">
            <div className="bg-black text-red-600 px-2 py-1 text-lg border border-gray-600 shadow-inner">
              {String(msMinesLeft).padStart(3, '0')}
            </div>

            <button
              onClick={initMinesweeper}
              className="w-10 h-10 bg-[#c0c0c0] border-2 border-white border-r-gray-800 border-b-gray-800 flex items-center justify-center text-xl cursor-pointer active:border-inset hover:bg-gray-200"
            >
              {msStatus === 'playing' ? '🙂' : msStatus === 'won' ? '😎' : '😵'}
            </button>

            <div className="bg-black text-red-600 px-2 py-1 text-lg border border-gray-600 shadow-inner">
              {String(msTimer).padStart(3, '0')}
            </div>
          </div>

          <div className="flex justify-between items-center text-xs font-mono font-bold">
            <button
              onClick={() => setMsFlagMode(!msFlagMode)}
              className={`px-3 py-1 border-2 border-white border-r-gray-800 border-b-gray-800 flex items-center gap-1.5 cursor-pointer ${
                msFlagMode ? 'bg-yellow-400 text-black font-black' : 'bg-[#d0d0d0] text-gray-800'
              }`}
            >
              <Flag className="w-3.5 h-3.5 text-red-600" />
              <span>Modo Bandeira: {msFlagMode ? 'ATIVO' : 'INATIVO'}</span>
            </button>
            <span className="text-gray-700 text-[10px]">Botão direito para marcar</span>
          </div>

          <div className="bg-[#808080] p-2 border-2 border-gray-800 border-r-white border-b-white grid grid-cols-8 gap-1 select-none">
            {msGrid.map((row, r) =>
              row.map((cell, c) => (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  onContextMenu={(e) => handleCellRightClick(e, r, c)}
                  className={`w-9 h-9 font-mono font-bold text-sm flex items-center justify-center transition-none cursor-pointer ${
                    cell.revealed
                      ? 'bg-[#c0c0c0] border border-gray-400 text-black'
                      : 'bg-[#c0c0c0] border-2 border-white border-r-gray-800 border-b-gray-800 active:border-inset'
                  }`}
                >
                  {cell.revealed ? (
                    cell.mine ? (
                      '💥'
                    ) : cell.count > 0 ? (
                      <span
                        className={
                          cell.count === 1
                            ? 'text-blue-700 font-extrabold'
                            : cell.count === 2
                            ? 'text-green-700 font-extrabold'
                            : cell.count === 3
                            ? 'text-red-700 font-extrabold'
                            : 'text-purple-800 font-extrabold'
                        }
                      >
                        {cell.count}
                      </span>
                    ) : (
                      ''
                    )
                  ) : cell.flagged ? (
                    '🚩'
                  ) : (
                    ''
                  )}
                </button>
              ))
            )}
          </div>

          {msStatus === 'won' && (
            <div className="bg-green-100 text-green-900 p-2 border-2 border-green-600 text-center text-xs font-mono font-bold animate-pulse">
              🎉 VOCÊ VENCEU O CAMPO MINADO 2000! PARABÉNS!
            </div>
          )}
          {msStatus === 'lost' && (
            <div className="bg-red-100 text-red-900 p-2 border-2 border-red-600 text-center text-xs font-mono font-bold">
              💥 BOMB! VOCÊ ACERTOU UMA MINA. CLIQUE NO SMILEY PARA RECOMEÇAR!
            </div>
          )}
        </div>
      )}

      {/* ================= TAB: 3D PINBALL SPACE CADET 2000 ================= */}
      {activeTab === 'pinball' && (
        <div className="bg-[#0b0f2a] p-4 border-2 border-white border-r-gray-800 border-b-gray-800 text-white space-y-4 max-w-md mx-auto rounded shadow-2xl">
          <div className="bg-slate-900/90 p-2.5 rounded border border-blue-500/50 flex justify-between items-center font-mono text-xs shadow-inner">
            <div className="flex items-center gap-1.5">
              <Rocket className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="font-bold text-yellow-300">SPACE CADET 2000</span>
            </div>
            <div className="text-cyan-300 font-bold bg-black/60 px-2 py-0.5 rounded border border-cyan-700">
              PONTOS: {pinScore}
            </div>
            <span className="text-red-400 font-bold">ESFERAS: {'⚪'.repeat(pinLives)}</span>
          </div>

          <div className="flex justify-between items-center text-[11px] font-mono px-1 text-slate-400">
            <span>Patente Atual: <strong className="text-amber-300">{pinRank}</strong></span>
            <span>Mesa: <strong className="text-cyan-400">Windows 2000 Edition</strong></span>
          </div>

          <div className="flex justify-center bg-black p-2 border-2 border-blue-900 rounded-lg shadow-inner">
            <canvas ref={canvasRef} width={300} height={340} className="border border-cyan-500/40 bg-black rounded" />
          </div>

          <div className="space-y-2 text-center">
            {!pinActive ? (
              <button
                onClick={startPinball}
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold font-mono text-xs py-3 rounded border border-white cursor-pointer shadow-lg active:scale-98 transition"
              >
                🚀 LANÇAR ESFERA / INICIAR MISSÃO ESPACIAL
              </button>
            ) : (
              <div className="text-xs font-mono text-cyan-300 bg-blue-950/60 p-2 rounded border border-blue-800">
                Use as teclas <code className="text-yellow-300 font-bold bg-black/50 px-1 py-0.5 rounded">A / D</code> ou <code className="text-yellow-300 font-bold bg-black/50 px-1 py-0.5 rounded">◄ ► Setas</code> para acionar as paletas!
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB: NOKIA 3310 SNAKE II (ANO 2000) ================= */}
      {activeTab === 'snake' && (
        <div className="bg-[#2d3748] p-5 border-4 border-[#4a5568] rounded-3xl text-gray-900 max-w-xs mx-auto space-y-4 shadow-2xl">
          {/* Nokia 3310 top branding */}
          <div className="text-center font-sans tracking-widest text-slate-300 font-bold text-sm">
            NOKIA 3310
          </div>

          {/* Authentic Green Phosphor LCD Matrix Screen */}
          <div className="bg-[#9bbc0f] p-3 border-4 border-[#8bac0f] rounded-lg shadow-inner font-mono">
            <div className="flex justify-between items-center text-[10px] text-[#0f380f] font-bold border-b border-[#8bac0f] pb-1 mb-1">
              <span>SNAKE II '00</span>
              <span>SCORE: {snakeScore}</span>
              <span>HI: {snakeHighScore}</span>
            </div>

            <div className="bg-[#8bac0f] p-1 border-2 border-[#0f380f] aspect-square grid grid-cols-14 gap-0.5">
              {Array.from({ length: GRID_SIZE_SNAKE * GRID_SIZE_SNAKE }).map((_, i) => {
                const x = i % GRID_SIZE_SNAKE;
                const y = Math.floor(i / GRID_SIZE_SNAKE);
                const isSnake = snake.some((s) => s.x === x && s.y === y);
                const isHead = snake[0].x === x && snake[0].y === y;
                const isFood = food.x === x && food.y === y;

                return (
                  <div
                    key={i}
                    className={`rounded-none ${
                      isHead
                        ? 'bg-[#0f380f]'
                        : isSnake
                        ? 'bg-[#0f380f]'
                        : isFood
                        ? 'bg-[#0f380f] animate-ping'
                        : 'bg-[#9bbc0f]'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Controls */}
          {!snakeActive ? (
            <div className="space-y-2">
              <button
                onClick={startSnake}
                className="w-full bg-[#1a202c] text-white font-mono font-bold text-xs py-2.5 rounded-full border border-gray-500 cursor-pointer hover:bg-black shadow-md transition"
              >
                🎮 INICIAR JOGO (TECLA 5)
              </button>
              <div className="flex justify-center gap-2 text-[10px] font-mono text-slate-300">
                <span>Velocidade:</span>
                <button
                  onClick={() => setSnakeSpeed(180)}
                  className={`px-2 py-0.5 rounded ${snakeSpeed === 180 ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-700'}`}
                >
                  Normal
                </button>
                <button
                  onClick={() => setSnakeSpeed(120)}
                  className={`px-2 py-0.5 rounded ${snakeSpeed === 120 ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-700'}`}
                >
                  Rápido
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-w-[170px] mx-auto text-xs font-mono">
              <div />
              <button
                onClick={() => setDir('UP')}
                className="bg-[#1a202c] text-white border border-gray-600 rounded-full py-2 font-bold hover:bg-black cursor-pointer shadow active:scale-95"
              >
                2 ▲
              </button>
              <div />
              <button
                onClick={() => setDir('LEFT')}
                className="bg-[#1a202c] text-white border border-gray-600 rounded-full py-2 font-bold hover:bg-black cursor-pointer shadow active:scale-95"
              >
                4 ◄
              </button>
              <button
                onClick={() => setDir('DOWN')}
                className="bg-[#1a202c] text-white border border-gray-600 rounded-full py-2 font-bold hover:bg-black cursor-pointer shadow active:scale-95"
              >
                8 ▼
              </button>
              <button
                onClick={() => setDir('RIGHT')}
                className="bg-[#1a202c] text-white border border-gray-600 rounded-full py-2 font-bold hover:bg-black cursor-pointer shadow active:scale-95"
              >
                6 ►
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
