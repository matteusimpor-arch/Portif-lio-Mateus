import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, RotateCcw, Trophy, Flag, Timer, AlertOctagon, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../utils/soundEffects';
import { getGameHighScore, saveGameHighScore, setGameActiveStatus } from '../../utils/gameStorage';

interface MinesweeperGameProps {
  onBackToHub?: () => void;
  mode?: 'retro' | 'space';
}

interface Difficulty {
  name: string;
  rows: number;
  cols: number;
  mines: number;
}

const DIFFICULTIES: Record<'easy' | 'medium' | 'hard', Difficulty> = {
  easy: { name: 'Fácil (9x9)', rows: 9, cols: 9, mines: 10 },
  medium: { name: 'Médio (16x16)', rows: 16, cols: 16, mines: 40 },
  hard: { name: 'Difícil (16x30)', rows: 16, cols: 30, mines: 99 },
};

interface Cell {
  row: number;
  col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

export const MinesweeperGame: React.FC<MinesweeperGameProps> = ({
  onBackToHub,
  mode = 'retro',
}) => {
  const [difficultyKey, setDifficultyKey] = useState<'easy' | 'medium' | 'hard'>('easy');
  const currentDiff = DIFFICULTIES[difficultyKey];

  const [grid, setGrid] = useState<Cell[][]>([]);
  const [isFirstClick, setIsFirstClick] = useState<boolean>(true);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [flagsPlaced, setFlagsPlaced] = useState<number>(0);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [flagModeMobile, setFlagModeMobile] = useState<boolean>(false);
  const [faceEmotion, setFaceEmotion] = useState<'normal' | 'scared' | 'dead' | 'cool'>('normal');

  const triggeredMineRef = useRef<{ row: number; col: number } | null>(null);

  // Notify M-BOT
  useEffect(() => {
    setGameActiveStatus(true, 'Campo Minado');
    return () => setGameActiveStatus(false);
  }, []);

  // Timer interval
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isTimerRunning && !gameOver && !hasWon) {
      timer = setInterval(() => {
        setTimeElapsed((t) => Math.min(999, t + 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTimerRunning, gameOver, hasWon]);

  // Create empty initial grid
  const createEmptyGrid = useCallback((rows: number, cols: number): Cell[][] => {
    const newGrid: Cell[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < cols; c++) {
        row.push({
          row: r,
          col: c,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0,
        });
      }
      newGrid.push(row);
    }
    return newGrid;
  }, []);

  // Initialize fresh board
  const initBoard = useCallback(() => {
    try {
      soundFx.playClick();
    } catch (e) {}

    const empty = createEmptyGrid(currentDiff.rows, currentDiff.cols);
    setGrid(empty);
    setIsFirstClick(true);
    setGameOver(false);
    setHasWon(false);
    setFlagsPlaced(0);
    setTimeElapsed(0);
    setIsTimerRunning(false);
    setFaceEmotion('normal');
    triggeredMineRef.current = null;
  }, [createEmptyGrid, currentDiff]);

  useEffect(() => {
    initBoard();
  }, [initBoard]);

  // Generate mines with GUARANTEED FIRST CLICK SAFETY (3x3 cleared safety zone around click)
  const populateMinesSafe = (startR: number, startC: number, currentBoard: Cell[][]): Cell[][] => {
    const { rows, cols, mines } = currentDiff;
    const board = currentBoard.map((row) => row.map((cell) => ({ ...cell })));

    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);

      // Keep safe 3x3 box around first click
      const isSafeZone = Math.abs(r - startR) <= 1 && Math.abs(c - startC) <= 1;

      if (!board[r][c].isMine && !isSafeZone) {
        board[r][c].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate neighbor mines for each cell
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (board[r][c].isMine) continue;
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isMine) {
              count++;
            }
          }
        }
        board[r][c].neighborMines = count;
      }
    }

    return board;
  };

  // Flood Fill algorithm to reveal empty areas
  const floodReveal = (startR: number, startC: number, board: Cell[][]) => {
    const rows = board.length;
    const cols = board[0].length;
    const queue: [number, number][] = [[startR, startC]];

    board[startR][startC].isRevealed = true;

    while (queue.length > 0) {
      const [r, c] = queue.shift()!;

      // If this cell has 0 neighboring mines, expand to all 8 neighbors
      if (board[r][c].neighborMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (
              nr >= 0 &&
              nr < rows &&
              nc >= 0 &&
              nc < cols &&
              !board[nr][nc].isRevealed &&
              !board[nr][nc].isFlagged
            ) {
              board[nr][nc].isRevealed = true;
              if (board[nr][nc].neighborMines === 0) {
                queue.push([nr, nc]);
              }
            }
          }
        }
      }
    }
  };

  // Check victory condition
  const checkVictory = (board: Cell[][]): boolean => {
    const { rows, cols, mines } = currentDiff;
    let revealedCount = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (board[r][c].isRevealed) revealedCount++;
      }
    }
    return revealedCount === rows * cols - mines;
  };

  // Handle Cell Click (Reveal)
  const handleCellClick = (r: number, c: number) => {
    if (gameOver || hasWon) return;

    // Mobile flag mode toggle
    if (flagModeMobile) {
      handleToggleFlag(r, c);
      return;
    }

    let board = grid;

    // First click initialization
    if (isFirstClick) {
      board = populateMinesSafe(r, c, grid);
      setIsFirstClick(false);
      setIsTimerRunning(true);
    }

    const cell = board[r][c];
    if (cell.isRevealed || cell.isFlagged) return;

    const newBoard = board.map((row) => row.map((item) => ({ ...item })));

    // Triggered a mine!
    if (newBoard[r][c].isMine) {
      triggeredMineRef.current = { row: r, col: c };
      setGameOver(true);
      setIsTimerRunning(false);
      setFaceEmotion('dead');
      try {
        soundFx.playExplosion();
      } catch (e) {}

      // Reveal all mines
      for (let row = 0; row < currentDiff.rows; row++) {
        for (let col = 0; col < currentDiff.cols; col++) {
          if (newBoard[row][col].isMine) {
            newBoard[row][col].isRevealed = true;
          }
        }
      }
      setGrid(newBoard);
      return;
    }

    // Safe reveal
    try {
      soundFx.playClick();
    } catch (e) {}
    floodReveal(r, c, newBoard);
    setGrid(newBoard);

    // Check if won
    if (checkVictory(newBoard)) {
      setHasWon(true);
      setIsTimerRunning(false);
      setFaceEmotion('cool');
      try {
        soundFx.playFanfare();
      } catch (e) {}
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });

      const score = Math.max(10, 1000 - timeElapsed * 2);
      saveGameHighScore(`minesweeper_${difficultyKey}`, score);
    }
  };

  // Handle Right Click / Flag Toggle
  const handleToggleFlag = (r: number, c: number, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (gameOver || hasWon) return;

    const cell = grid[r][c];
    if (cell.isRevealed) return;

    try {
      soundFx.playKeypress();
    } catch (e) {}

    const newBoard = grid.map((row) => row.map((item) => ({ ...item })));
    const target = newBoard[r][c];
    target.isFlagged = !target.isFlagged;

    setFlagsPlaced((prev) => (target.isFlagged ? prev + 1 : prev - 1));
    setGrid(newBoard);
  };

  const isRetro = mode === 'retro';
  const remainingMines = Math.max(0, currentDiff.mines - flagsPlaced);

  // Text color per neighbor count
  const getNumberColor = (num: number): string => {
    switch (num) {
      case 1: return 'text-blue-600 font-black';
      case 2: return 'text-emerald-600 font-black';
      case 3: return 'text-red-600 font-black';
      case 4: return 'text-indigo-900 font-black';
      case 5: return 'text-amber-900 font-black';
      case 6: return 'text-teal-700 font-black';
      case 7: return 'text-black font-black';
      case 8: return 'text-gray-600 font-black';
      default: return 'text-transparent';
    }
  };

  return (
    <div className="space-y-4 font-sans select-none text-slate-100 max-w-4xl mx-auto">
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
            💣 {isRetro ? 'CAMPO MINADO 2000' : 'QUANTUM MINESWEEPER'}
          </span>
        </div>

        {/* Difficulty Selector */}
        <div className="flex items-center gap-1.5">
          {(['easy', 'medium', 'hard'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => {
                setDifficultyKey(diff);
              }}
              className={`px-2.5 py-1 font-mono text-xs font-bold border rounded cursor-pointer transition ${
                difficultyKey === diff
                  ? isRetro
                    ? 'bg-[#000080] text-white border-white'
                    : 'bg-cyan-600 text-slate-950 border-cyan-300'
                  : isRetro
                  ? 'bg-[#d4d0c8] text-gray-900 border-gray-600'
                  : 'bg-slate-800 text-cyan-300 border-cyan-800'
              }`}
            >
              {diff === 'easy' ? 'FÁCIL' : diff === 'medium' ? 'MÉDIO' : 'DIFÍCIL'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Minesweeper Shell Box */}
      <div className="flex justify-center p-2">
        <div
          className={`p-4 border-4 shadow-2xl flex flex-col items-center gap-3 ${
            isRetro
              ? 'bg-[#c0c0c0] border-white border-r-gray-800 border-b-gray-800'
              : 'bg-slate-950/95 border-cyan-500/50 rounded-xl backdrop-blur-md shadow-[0_0_35px_rgba(6,182,212,0.25)]'
          }`}
        >
          {/* Windows Classic LED Header (Mines counter, Smiley Face, Digital Timer) */}
          <div
            className={`w-full p-2.5 border-2 flex items-center justify-between shadow-inner ${
              isRetro
                ? 'bg-[#808080] border-gray-800 border-r-white border-b-white'
                : 'bg-slate-900 border-cyan-800/80 rounded'
            }`}
          >
            {/* Mines Count LED */}
            <div className="bg-black text-red-600 font-mono font-black text-xl px-2 py-0.5 border border-red-900 tracking-widest shadow-inner">
              {String(remainingMines).padStart(3, '0')}
            </div>

            {/* Classic Interactive Smiley Face */}
            <button
              onClick={initBoard}
              onMouseDown={() => !gameOver && !hasWon && setFaceEmotion('scared')}
              onMouseUp={() => !gameOver && !hasWon && setFaceEmotion('normal')}
              className={`w-10 h-10 rounded border-2 flex items-center justify-center text-2xl shadow active:scale-95 cursor-pointer ${
                isRetro
                  ? 'bg-[#c0c0c0] border-white border-r-gray-800 border-b-gray-800'
                  : 'bg-cyan-900/80 border-cyan-400'
              }`}
              title="Reiniciar Campo Minado"
            >
              {faceEmotion === 'dead'
                ? '😵'
                : faceEmotion === 'cool'
                ? '😎'
                : faceEmotion === 'scared'
                ? '😮'
                : '🙂'}
            </button>

            {/* Timer LED */}
            <div className="bg-black text-red-600 font-mono font-black text-xl px-2 py-0.5 border border-red-900 tracking-widest shadow-inner">
              {String(timeElapsed).padStart(3, '0')}
            </div>
          </div>

          {/* Mobile Flag Mode Toggle */}
          <div className="w-full flex items-center justify-between sm:hidden pt-1">
            <button
              onClick={() => setFlagModeMobile((f) => !f)}
              className={`flex-1 py-1.5 px-3 rounded font-mono font-bold text-xs border flex items-center justify-center gap-2 cursor-pointer shadow ${
                flagModeMobile
                  ? 'bg-red-600 text-white border-red-400'
                  : 'bg-slate-800 text-slate-200 border-slate-600'
              }`}
            >
              <Flag className="w-4 h-4 text-red-400" />
              <span>MODO BANDEIRA: {flagModeMobile ? 'ATIVADO' : 'DESATIVADO'}</span>
            </button>
          </div>

          {/* The Board Grid */}
          <div className="overflow-auto max-w-full max-h-[70vh] p-1 border-2 border-gray-800 border-r-white border-b-white bg-gray-400">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${currentDiff.cols}, 28px)`,
                gridTemplateRows: `repeat(${currentDiff.rows}, 28px)`,
                gap: '1px',
              }}
              className="bg-gray-500"
            >
              {grid.map((row, r) =>
                row.map((cell, c) => {
                  const isTriggered =
                    triggeredMineRef.current &&
                    triggeredMineRef.current.row === r &&
                    triggeredMineRef.current.col === c;

                  return (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => handleCellClick(r, c)}
                      onContextMenu={(e) => handleToggleFlag(r, c, e)}
                      className={`w-7 h-7 flex items-center justify-center font-mono text-sm select-none cursor-pointer transition-none ${
                        cell.isRevealed
                          ? cell.isMine
                            ? isTriggered
                              ? 'bg-red-600 border border-red-900'
                              : 'bg-gray-300 border border-gray-400'
                            : 'bg-gray-300 border border-gray-400'
                          : isRetro
                          ? 'bg-[#c0c0c0] border-2 border-white border-r-gray-800 border-b-gray-800 active:border-gray-800 active:border-r-white active:border-b-white'
                          : 'bg-slate-800 border-2 border-cyan-600/60 hover:bg-slate-700'
                      }`}
                    >
                      {cell.isRevealed ? (
                        cell.isMine ? (
                          <span className="text-base leading-none">💣</span>
                        ) : cell.neighborMines > 0 ? (
                          <span className={getNumberColor(cell.neighborMines)}>
                            {cell.neighborMines}
                          </span>
                        ) : null
                      ) : cell.isFlagged ? (
                        <span className="text-xs leading-none">🚩</span>
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Bottom helper info */}
          <div className="text-[11px] font-mono text-center text-slate-800 dark:text-cyan-300">
            Botão Esquerdo: Revelar | Botão Direito: Bandeira | Primeiro clique 100% seguro
          </div>
        </div>
      </div>

      {/* Victory / Defeat Modal */}
      {(hasWon || gameOver) && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div
            className={`max-w-md w-full p-6 rounded-xl border-4 text-center space-y-4 shadow-2xl ${
              isRetro
                ? 'bg-[#c0c0c0] border-white text-slate-900 shadow-[8px_8px_0px_rgba(0,0,0,0.5)]'
                : 'bg-slate-950 border-cyan-400 text-cyan-100'
            }`}
          >
            <div
              className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center text-3xl shadow-lg ${
                hasWon ? 'bg-yellow-400 animate-bounce' : 'bg-red-600 animate-pulse'
              }`}
            >
              {hasWon ? '🏆' : '💥'}
            </div>
            <h2
              className={`text-2xl font-mono font-black tracking-wider ${
                hasWon ? 'text-green-700 dark:text-cyan-300' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {hasWon ? 'VITÓRIA! CAMPO LIMPO!' : 'BOOM! GAME OVER'}
            </h2>
            <p className="text-sm font-mono leading-relaxed">
              {hasWon
                ? `Você desativou todas as ${currentDiff.mines} minas com perfeição em ${timeElapsed} segundos!`
                : 'Você detonou uma mina terrestre! Tenha mais cuidado na próxima tentativa.'}
            </p>

            <div className="p-3 bg-white/60 dark:bg-slate-900 rounded font-mono text-sm space-y-1">
              <div>Dificuldade: <strong>{currentDiff.name}</strong></div>
              <div>Tempo: <strong>{timeElapsed}s</strong></div>
              <div>Minas Marcadas: <strong>{flagsPlaced} / {currentDiff.mines}</strong></div>
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={initBoard}
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
