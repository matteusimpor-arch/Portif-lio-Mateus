import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, RotateCcw, Flag, Bomb, Trophy, Sparkles, HelpCircle, Sliders, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../utils/soundEffects';

export type MinesweeperDifficulty = 'easy' | 'medium' | 'hard' | 'custom';

interface DifficultyConfig {
  rows: number;
  cols: number;
  mines: number;
  label: string;
}

const DIFFICULTIES: Record<MinesweeperDifficulty, DifficultyConfig> = {
  easy: { rows: 9, cols: 9, mines: 10, label: 'Fácil (9x9 - 10 minas)' },
  medium: { rows: 16, cols: 16, mines: 40, label: 'Intermediário (16x16 - 40 minas)' },
  hard: { rows: 16, cols: 24, mines: 65, label: 'Difícil (24x16 - 65 minas)' },
  custom: { rows: 10, cols: 10, mines: 15, label: 'Personalizado' },
};

interface Cell {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  count: number;
}

interface MinesweeperGameProps {
  onBackToHub?: () => void;
  mode?: 'retro' | 'space';
}

export const MinesweeperGame: React.FC<MinesweeperGameProps> = ({
  onBackToHub,
  mode = 'retro',
}) => {
  const [difficulty, setDifficulty] = useState<MinesweeperDifficulty>('easy');
  const [customRows, setCustomRows] = useState<number>(10);
  const [customCols, setCustomCols] = useState<number>(10);
  const [customMines, setCustomMines] = useState<number>(15);
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);

  const [grid, setGrid] = useState<Cell[][]>([]);
  const [status, setStatus] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [minesLeft, setMinesLeft] = useState<number>(10);
  const [timer, setTimer] = useState<number>(0);
  const [flagMode, setFlagMode] = useState<boolean>(false);
  const [firstClickDone, setFirstClickDone] = useState<boolean>(false);

  const currentConfig = difficulty === 'custom'
    ? { rows: customRows, cols: customCols, mines: customMines, label: 'Personalizado' }
    : DIFFICULTIES[difficulty];

  // Initialize empty grid without placing mines until first click
  const initBoard = useCallback(() => {
    try {
      soundFx.playClick();
    } catch (e) {}

    const { rows, cols, mines } = currentConfig;
    const safeMines = Math.min(mines, rows * cols - 1);

    const emptyGrid: Cell[][] = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({
        mine: false,
        revealed: false,
        flagged: false,
        count: 0,
      }))
    );

    setGrid(emptyGrid);
    setStatus('idle');
    setMinesLeft(safeMines);
    setTimer(0);
    setFirstClickDone(false);
  }, [currentConfig]);

  useEffect(() => {
    initBoard();
  }, [initBoard]);

  // Timer interval
  useEffect(() => {
    if (status !== 'playing') return;
    const interval = setInterval(() => {
      setTimer((t) => Math.min(999, t + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  // Place mines safely around first clicked cell
  const populateMines = (startRow: number, startCol: number, baseGrid: Cell[][]) => {
    const { rows, cols, mines } = currentConfig;
    const newGrid = baseGrid.map((row) => row.map((c) => ({ ...c })));
    const safeMines = Math.min(mines, rows * cols - 9);

    let placed = 0;
    while (placed < safeMines) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);

      // Keep starting cell and its 8 immediate neighbors free of mines
      const isNearStart = Math.abs(r - startRow) <= 1 && Math.abs(c - startCol) <= 1;
      if (!newGrid[r][c].mine && !isNearStart) {
        newGrid[r][c].mine = true;
        placed++;
      }
    }

    // Calculate neighboring mines count
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (newGrid[r][c].mine) continue;
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
              if (newGrid[nr][nc].mine) count++;
            }
          }
        }
        newGrid[r][c].count = count;
      }
    }

    return newGrid;
  };

  const handleCellClick = (r: number, c: number) => {
    if (status === 'won' || status === 'lost') return;

    // In flag mode (especially on mobile touch)
    if (flagMode) {
      handleToggleFlag(r, c);
      return;
    }

    let activeGrid = grid;

    // If first click, initialize mines safely
    if (!firstClickDone || status === 'idle') {
      activeGrid = populateMines(r, c, grid);
      setFirstClickDone(true);
      setStatus('playing');
    }

    const currentCell = activeGrid[r][c];
    if (currentCell.flagged || currentCell.revealed) return;

    // Hit a mine -> Game Over
    if (currentCell.mine) {
      try {
        soundFx.playError();
      } catch (e) {}
      const lostGrid = activeGrid.map((row) =>
        row.map((cell) => ({
          ...cell,
          revealed: cell.mine ? true : cell.revealed,
        }))
      );
      setGrid(lostGrid);
      setStatus('lost');
      return;
    }

    // Reveal safely
    try {
      soundFx.playClick();
    } catch (e) {}

    const newGrid = activeGrid.map((row) => row.map((cell) => ({ ...cell })));
    const { rows, cols } = currentConfig;

    const floodReveal = (row: number, col: number) => {
      if (row < 0 || row >= rows || col < 0 || col >= cols) return;
      const cell = newGrid[row][col];
      if (cell.revealed || cell.flagged) return;

      cell.revealed = true;
      if (cell.count === 0 && !cell.mine) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr !== 0 || dc !== 0) {
              floodReveal(row + dr, col + dc);
            }
          }
        }
      }
    };

    floodReveal(r, c);

    // Check victory condition
    let unrevealedNonMines = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (!newGrid[row][col].mine && !newGrid[row][col].revealed) {
          unrevealedNonMines++;
        }
      }
    }

    if (unrevealedNonMines === 0) {
      setStatus('won');
      try {
        soundFx.playFanfare();
      } catch (e) {}
      confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
    }

    setGrid(newGrid);
  };

  const handleToggleFlag = (r: number, c: number) => {
    if (status === 'won' || status === 'lost') return;
    const currentCell = grid[r][c];
    if (currentCell.revealed) return;

    try {
      soundFx.playClick();
    } catch (e) {}

    const newGrid = grid.map((row, ri) =>
      row.map((cell, ci) => {
        if (ri === r && ci === c) {
          const nextFlag = !cell.flagged;
          setMinesLeft((prev) => (nextFlag ? prev - 1 : prev + 1));
          return { ...cell, flagged: nextFlag };
        }
        return cell;
      })
    );

    setGrid(newGrid);
  };

  const handleContextMenu = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    handleToggleFlag(r, c);
  };

  return (
    <div className="space-y-4 font-sans select-none text-gray-900">
      {/* Top Game Navigation Bar */}
      <div className="bg-[#c0c0c0] p-2.5 border-2 border-white border-r-gray-800 border-b-gray-800 flex flex-wrap items-center justify-between gap-3 shadow">
        <div className="flex items-center gap-2">
          {onBackToHub && (
            <button
              onClick={onBackToHub}
              className="px-3 py-1.5 bg-[#d4d0c8] hover:bg-white text-gray-900 font-mono font-bold text-xs border-2 border-white border-r-gray-800 border-b-gray-800 cursor-pointer flex items-center gap-1.5 active:border-gray-800 active:border-r-white active:border-b-white transition"
              title="Voltar para a seleção de jogos"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>VOLTAR AOS JOGOS</span>
            </button>
          )}
          <div className="font-mono font-black text-xs text-[#000080] flex items-center gap-1">
            <Bomb className="w-4 h-4 text-red-600" />
            <span>CAMPO MINADO 2000</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Difficulty Dropdown */}
          <select
            value={difficulty}
            onChange={(e) => {
              const val = e.target.value as MinesweeperDifficulty;
              if (val === 'custom') {
                setShowCustomModal(true);
              } else {
                setDifficulty(val);
              }
            }}
            className="px-2 py-1 bg-white border-2 border-gray-600 border-r-white border-b-white text-xs font-mono font-bold cursor-pointer"
          >
            <option value="easy">Fácil (9x9 - 10 minas)</option>
            <option value="medium">Intermediário (16x16 - 40 minas)</option>
            <option value="hard">Difícil (24x16 - 65 minas)</option>
            <option value="custom">Personalizado...</option>
          </select>

          <button
            onClick={initBoard}
            className="px-3 py-1 bg-[#d4d0c8] hover:bg-white text-black font-mono font-bold text-xs border-2 border-white border-r-gray-800 border-b-gray-800 cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>REINICIAR</span>
          </button>
        </div>
      </div>

      {/* Control Instructions Banner */}
      <div className="bg-[#000080] text-yellow-300 px-3 py-1.5 border border-white text-xs font-mono flex flex-wrap items-center justify-between gap-2 shadow-inner">
        <span>
          <strong>CONTROLES:</strong> Clique normal para revelar | Botão direito ou Modo Bandeira para marcar 🚩
        </span>
        <span className="text-white text-[11px]">
          Dificuldade: <strong className="text-yellow-300">{currentConfig.label}</strong>
        </span>
      </div>

      {/* Main Minesweeper Table */}
      <div className="bg-[#c0c0c0] p-4 border-2 border-white border-r-gray-800 border-b-gray-800 shadow-2xl max-w-full overflow-x-auto mx-auto inline-block min-w-[320px]">
        {/* Beveled Top Status Counter Bar */}
        <div className="bg-[#a0a0a0] p-2 border-2 border-gray-600 border-r-white border-b-white flex items-center justify-between font-mono font-bold mb-3 shadow-inner">
          {/* Mine Counter */}
          <div className="bg-black text-red-600 px-2.5 py-1 text-2xl font-mono border-2 border-gray-700 tracking-widest shadow-inner select-none">
            {String(Math.max(-99, minesLeft)).padStart(3, '0')}
          </div>

          {/* Smiley Status Button */}
          <button
            onClick={initBoard}
            className="w-11 h-11 bg-[#c0c0c0] border-2 border-white border-r-gray-800 border-b-gray-800 flex items-center justify-center text-2xl cursor-pointer active:border-gray-800 active:border-r-white active:border-b-white hover:bg-gray-100 transition shadow"
            title="Clique para reiniciar jogo"
          >
            {status === 'playing' ? '🙂' : status === 'won' ? '😎' : status === 'lost' ? '😵' : '🙂'}
          </button>

          {/* Timer */}
          <div className="bg-black text-red-600 px-2.5 py-1 text-2xl font-mono border-2 border-gray-700 tracking-widest shadow-inner select-none">
            {String(timer).padStart(3, '0')}
          </div>
        </div>

        {/* Flag mode button for Mobile & Quick Toggle */}
        <div className="flex justify-between items-center mb-2 px-1">
          <button
            onClick={() => setFlagMode(!flagMode)}
            className={`px-3 py-1.5 border-2 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow transition ${
              flagMode
                ? 'bg-yellow-400 text-black border-yellow-600 ring-2 ring-yellow-500 font-black'
                : 'bg-[#d4d0c8] text-gray-800 border-white border-r-gray-800 border-b-gray-800 hover:bg-white'
            }`}
          >
            <Flag className={`w-4 h-4 ${flagMode ? 'text-red-700 fill-current' : 'text-red-600'}`} />
            <span>MODO BANDEIRA: {flagMode ? 'ATIVADO (Toque para marcar)' : 'DESATIVADO'}</span>
          </button>
          <span className="text-[10px] font-mono text-gray-700 hidden sm:inline">
            Primeiro clique é 100% seguro
          </span>
        </div>

        {/* Grid Cells */}
        <div
          className="bg-[#808080] p-2 border-2 border-gray-800 border-r-white border-b-white grid gap-0.5 select-none max-w-full overflow-x-auto shadow-inner"
          style={{
            gridTemplateColumns: `repeat(${currentConfig.cols}, minmax(0, 1fr))`,
            width: 'max-content',
            margin: '0 auto',
          }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                onContextMenu={(e) => handleContextMenu(e, r, c)}
                className={`w-7 h-7 sm:w-8 sm:h-8 font-mono font-black text-sm sm:text-base flex items-center justify-center transition-none cursor-pointer select-none ${
                  cell.revealed
                    ? cell.mine
                      ? 'bg-red-600 text-white border border-gray-700'
                      : 'bg-[#c0c0c0] border border-gray-400 text-black'
                    : 'bg-[#c0c0c0] border-2 border-white border-r-gray-800 border-b-gray-800 active:border-gray-800 active:border-r-white active:border-b-white hover:brightness-105'
                }`}
              >
                {cell.revealed ? (
                  cell.mine ? (
                    '💣'
                  ) : cell.count > 0 ? (
                    <span
                      className={
                        cell.count === 1
                          ? 'text-blue-700 font-black'
                          : cell.count === 2
                          ? 'text-emerald-700 font-black'
                          : cell.count === 3
                          ? 'text-red-600 font-black'
                          : cell.count === 4
                          ? 'text-indigo-900 font-black'
                          : cell.count === 5
                          ? 'text-amber-800 font-black'
                          : cell.count === 6
                          ? 'text-teal-700 font-black'
                          : 'text-purple-900 font-black'
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

        {/* Win / Loss Banners */}
        {status === 'won' && (
          <div className="mt-3 bg-green-100 text-green-950 p-2.5 border-2 border-green-700 text-center text-xs font-mono font-bold animate-pulse shadow">
            🎉 PARABÉNS! VOCÊ VENCEU O CAMPO MINADO EM {timer} SEGUNDOS!
          </div>
        )}
        {status === 'lost' && (
          <div className="mt-3 bg-red-100 text-red-950 p-2.5 border-2 border-red-700 text-center text-xs font-mono font-bold shadow">
            💥 BOMB! VOCÊ ACERTOU UMA MINA. CLIQUE NO SMILEY OU EM REINICIAR!
          </div>
        )}
      </div>

      {/* Custom Difficulty Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#c0c0c0] p-4 border-2 border-white border-r-gray-800 border-b-gray-800 shadow-2xl max-w-sm w-full font-mono text-xs text-gray-900 space-y-3">
            <div className="bg-[#000080] text-white p-1.5 font-bold flex justify-between items-center">
              <span>Personalizar Campo Minado</span>
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-1 bg-[#c0c0c0] text-black font-bold border border-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 bg-[#d4d0c8] p-3 border border-gray-600">
              <div className="flex justify-between items-center">
                <label>Linhas (8 - 24):</label>
                <input
                  type="number"
                  min={8}
                  max={24}
                  value={customRows}
                  onChange={(e) => setCustomRows(Number(e.target.value))}
                  className="w-16 px-1.5 py-0.5 bg-white border border-gray-700 text-right"
                />
              </div>

              <div className="flex justify-between items-center">
                <label>Colunas (8 - 30):</label>
                <input
                  type="number"
                  min={8}
                  max={30}
                  value={customCols}
                  onChange={(e) => setCustomCols(Number(e.target.value))}
                  className="w-16 px-1.5 py-0.5 bg-white border border-gray-700 text-right"
                />
              </div>

              <div className="flex justify-between items-center">
                <label>Minas (5 - 150):</label>
                <input
                  type="number"
                  min={5}
                  max={Math.min(150, customRows * customCols - 9)}
                  value={customMines}
                  onChange={(e) => setCustomMines(Number(e.target.value))}
                  className="w-16 px-1.5 py-0.5 bg-white border border-gray-700 text-right"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-3 py-1 bg-[#d4d0c8] border-2 border-white border-r-gray-800 border-b-gray-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setDifficulty('custom');
                  setShowCustomModal(false);
                  initBoard();
                }}
                className="px-3 py-1 bg-[#000080] text-white font-bold border-2 border-white cursor-pointer"
              >
                Aplicar e Jogar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
