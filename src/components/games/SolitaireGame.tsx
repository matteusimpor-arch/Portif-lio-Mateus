import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, RotateCcw, Trophy, Sparkles, HelpCircle, FastForward, CheckCircle2, RotateCw, Settings2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../utils/soundEffects';
import { getGameHighScore, saveGameHighScore, setGameActiveStatus } from '../../utils/gameStorage';

const SUITS = ['♠', '♥', '♦', '♣'] as const;
type Suit = typeof SUITS[number];

const SUIT_COLORS: Record<Suit, 'red' | 'black'> = {
  '♠': 'black',
  '♥': 'red',
  '♦': 'red',
  '♣': 'black',
};

const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;

export interface Card {
  id: string; // unique, e.g. "card-♠-1"
  suit: Suit;
  value: string;
  color: 'red' | 'black';
  valNum: number; // 1 (A) to 13 (K)
  faceUp: boolean;
}

type SelectionSource =
  | { type: 'waste' }
  | { type: 'tableau'; colIdx: number; cardIdx: number }
  | { type: 'foundation'; fIdx: number }
  | null;

interface SolitaireGameProps {
  onBackToHub?: () => void;
  mode?: 'retro' | 'space';
}

export const SolitaireGame: React.FC<SolitaireGameProps> = ({
  onBackToHub,
  mode = 'retro',
}) => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [waste, setWaste] = useState<Card[]>([]);
  const [foundation, setFoundation] = useState<Card[][]>([[], [], [], []]);
  const [tableau, setTableau] = useState<Card[][]>([[], [], [], [], [], [], []]);
  const [score, setScore] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [drawMode, setDrawMode] = useState<1 | 3>(1);
  const [selected, setSelected] = useState<SelectionSource>(null);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [highScore, setHighScore] = useState<number>(() => getGameHighScore('solitaire', 500));

  // Drag-and-drop state
  const draggedCardsRef = useRef<{ source: SelectionSource; cards: Card[] } | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Notify active game
  useEffect(() => {
    setGameActiveStatus(true, 'Paciência');
    return () => setGameActiveStatus(false);
  }, []);

  // Initialize fresh, bug-free Klondike game with exactly 52 cards
  const initGame = useCallback(() => {
    try {
      soundFx.playClick();
    } catch (e) {}

    // Strictly 52 cards
    const fullDeck: Card[] = [];
    SUITS.forEach((suit) => {
      VALUES.forEach((val, idx) => {
        fullDeck.push({
          id: `card-${suit}-${idx + 1}`,
          suit,
          value: val,
          color: SUIT_COLORS[suit],
          valNum: idx + 1,
          faceUp: false,
        });
      });
    });

    // Fisher-Yates Shuffle
    for (let i = fullDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [fullDeck[i], fullDeck[j]] = [fullDeck[j], fullDeck[i]];
    }

    // Distribute into 7 tableau columns (1, 2, 3, 4, 5, 6, 7)
    const newTableau: Card[][] = [[], [], [], [], [], [], []];
    for (let col = 0; col < 7; col++) {
      for (let card = 0; card <= col; card++) {
        const c = fullDeck.pop()!;
        if (card === col) {
          c.faceUp = true;
        } else {
          c.faceUp = false;
        }
        newTableau[col].push(c);
      }
    }

    setTableau(newTableau);
    setFoundation([[], [], [], []]);
    setWaste([]);
    setDeck(fullDeck);
    setScore(0);
    setMoves(0);
    setSelected(null);
    setHasWon(false);
    setHintMessage(null);
    draggedCardsRef.current = null;
    setIsDragging(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Victory condition check
  useEffect(() => {
    const totalFoundation = foundation.reduce((acc, pile) => acc + pile.length, 0);
    if (totalFoundation === 52 && !hasWon) {
      setHasWon(true);
      const bonusScore = Math.max(0, 1000 - moves * 5);
      const finalScore = score + 500 + bonusScore;
      setScore(finalScore);
      saveGameHighScore('solitaire', finalScore);
      setHighScore(getGameHighScore('solitaire', finalScore));
      try {
        soundFx.playFanfare();
      } catch (e) {}
      confetti({ particleCount: 160, spread: 90, origin: { y: 0.6 } });
    }
  }, [foundation, hasWon, moves, score]);

  // Rule checks
  const canMoveToFoundation = (card: Card, fIdx: number): boolean => {
    const pile = foundation[fIdx];
    if (pile.length === 0) {
      return card.valNum === 1; // Only Ace
    }
    const top = pile[pile.length - 1];
    return top.suit === card.suit && card.valNum === top.valNum + 1;
  };

  const canMoveToTableau = (card: Card, colIdx: number): boolean => {
    const col = tableau[colIdx];
    if (col.length === 0) {
      return card.valNum === 13; // King on empty
    }
    const top = col[col.length - 1];
    if (!top.faceUp) return false;
    return top.color !== card.color && card.valNum === top.valNum - 1;
  };

  // Draw card(s) from deck to waste
  const handleDraw = () => {
    try {
      soundFx.playCardFlip();
    } catch (e) {}
    setSelected(null);
    setHintMessage(null);

    if (deck.length === 0) {
      if (waste.length === 0) return;
      // Recycle waste to deck
      const recycled = waste.map((c) => ({ ...c, faceUp: false })).reverse();
      setDeck(recycled);
      setWaste([]);
      setMoves((m) => m + 1);
      return;
    }

    const drawCount = Math.min(drawMode, deck.length);
    const drawn = deck.slice(deck.length - drawCount).map((c) => ({ ...c, faceUp: true }));
    const remainingDeck = deck.slice(0, deck.length - drawCount);

    setDeck(remainingDeck);
    setWaste([...waste, ...drawn]);
    setMoves((m) => m + 1);
  };

  // Move from Waste or Tableau to Foundation
  const applyMoveToFoundation = (source: SelectionSource, fIdx: number) => {
    if (!source) return;

    if (source.type === 'waste') {
      if (waste.length === 0) return;
      const card = waste[waste.length - 1];
      if (canMoveToFoundation(card, fIdx)) {
        try {
          soundFx.playNotification();
        } catch (e) {}
        setFoundation((f) => f.map((pile, idx) => (idx === fIdx ? [...pile, card] : pile)));
        setWaste(waste.slice(0, -1));
        setScore((s) => s + 10);
        setMoves((m) => m + 1);
        setSelected(null);
      } else {
        setHintMessage(`Não é possível mover ${card.value}${card.suit} para esta fundação.`);
      }
    } else if (source.type === 'tableau') {
      const col = tableau[source.colIdx];
      if (source.cardIdx !== col.length - 1) {
        setHintMessage('Apenas a carta do topo da coluna pode ir para a fundação.');
        return;
      }
      const card = col[source.cardIdx];
      if (canMoveToFoundation(card, fIdx)) {
        try {
          soundFx.playNotification();
        } catch (e) {}
        setFoundation((f) => f.map((pile, idx) => (idx === fIdx ? [...pile, card] : pile)));

        const newCol = col.slice(0, -1);
        if (newCol.length > 0 && !newCol[newCol.length - 1].faceUp) {
          newCol[newCol.length - 1] = { ...newCol[newCol.length - 1], faceUp: true };
          setScore((s) => s + 5);
        }

        setTableau((t) => t.map((c, idx) => (idx === source.colIdx ? newCol : c)));
        setScore((s) => s + 10);
        setMoves((m) => m + 1);
        setSelected(null);
      } else {
        setHintMessage(`Não é possível mover ${card.value}${card.suit} para esta fundação.`);
      }
    }
  };

  // Move sequence from source to destination tableau column
  const applyMoveToTableau = (source: SelectionSource, destColIdx: number) => {
    if (!source) return;

    if (source.type === 'waste') {
      if (waste.length === 0) return;
      const card = waste[waste.length - 1];
      if (canMoveToTableau(card, destColIdx)) {
        try {
          soundFx.playCardFlip();
        } catch (e) {}
        setTableau((t) =>
          t.map((col, idx) => (idx === destColIdx ? [...col, card] : col))
        );
        setWaste(waste.slice(0, -1));
        setScore((s) => s + 5);
        setMoves((m) => m + 1);
        setSelected(null);
      } else {
        setHintMessage('Movimento inválido: cores devem alternar e valor decrescer (ou Rei em coluna vazia).');
      }
    } else if (source.type === 'tableau') {
      if (source.colIdx === destColIdx) {
        setSelected(null);
        return;
      }
      const sourceCol = tableau[source.colIdx];
      const movingCards = sourceCol.slice(source.cardIdx);
      const firstMovingCard = movingCards[0];

      if (canMoveToTableau(firstMovingCard, destColIdx)) {
        try {
          soundFx.playCardFlip();
        } catch (e) {}
        const newDestCol = [...tableau[destColIdx], ...movingCards];
        const newSourceCol = sourceCol.slice(0, source.cardIdx);

        if (newSourceCol.length > 0 && !newSourceCol[newSourceCol.length - 1].faceUp) {
          newSourceCol[newSourceCol.length - 1] = {
            ...newSourceCol[newSourceCol.length - 1],
            faceUp: true,
          };
          setScore((s) => s + 5);
        }

        setTableau((t) =>
          t.map((col, idx) => {
            if (idx === destColIdx) return newDestCol;
            if (idx === source.colIdx) return newSourceCol;
            return col;
          })
        );
        setScore((s) => s + 5);
        setMoves((m) => m + 1);
        setSelected(null);
      } else {
        setHintMessage('Movimento inválido: cores devem alternar e valor decrescer (ou Rei em coluna vazia).');
      }
    } else if (source.type === 'foundation') {
      const fPile = foundation[source.fIdx];
      if (fPile.length === 0) return;
      const card = fPile[fPile.length - 1];

      if (canMoveToTableau(card, destColIdx)) {
        try {
          soundFx.playCardFlip();
        } catch (e) {}
        setTableau((t) =>
          t.map((col, idx) => (idx === destColIdx ? [...col, card] : col))
        );
        setFoundation((f) =>
          f.map((pile, idx) => (idx === source.fIdx ? pile.slice(0, -1) : pile))
        );
        setMoves((m) => m + 1);
        setSelected(null);
      }
    }
  };

  // Smart Auto-Move (Double click / double tap)
  const trySmartMove = (card: Card, fromSource: SelectionSource) => {
    if (!fromSource) return;

    // First try foundation
    for (let fIdx = 0; fIdx < 4; fIdx++) {
      if (canMoveToFoundation(card, fIdx)) {
        applyMoveToFoundation(fromSource, fIdx);
        return;
      }
    }

    // Then try tableau
    for (let tIdx = 0; tIdx < 7; tIdx++) {
      if (fromSource.type === 'tableau' && fromSource.colIdx === tIdx) continue;
      if (canMoveToTableau(card, tIdx)) {
        applyMoveToTableau(fromSource, tIdx);
        return;
      }
    }
  };

  // Click handler for Tableau
  const handleTableauClick = (colIdx: number, cardIdx?: number) => {
    setHintMessage(null);
    const col = tableau[colIdx];

    // If something was already selected, this is a destination click
    if (selected) {
      if (
        selected.type === 'tableau' &&
        selected.colIdx === colIdx &&
        selected.cardIdx === cardIdx
      ) {
        // Deselect
        setSelected(null);
        return;
      }
      applyMoveToTableau(selected, colIdx);
      return;
    }

    if (col.length === 0) return;

    const targetIdx = cardIdx !== undefined ? cardIdx : col.length - 1;
    const card = col[targetIdx];

    // Reveal top card if face down
    if (!card.faceUp && targetIdx === col.length - 1) {
      try {
        soundFx.playCardFlip();
      } catch (e) {}
      const newCol = [...col];
      newCol[targetIdx] = { ...card, faceUp: true };
      setTableau((t) => t.map((c, idx) => (idx === colIdx ? newCol : c)));
      setScore((s) => s + 5);
      return;
    }

    // Select face up card
    if (card.faceUp) {
      try {
        soundFx.playClick();
      } catch (e) {}
      setSelected({ type: 'tableau', colIdx, cardIdx: targetIdx });
    }
  };

  // Auto Complete when all hidden cards are cleared
  const handleAutoComplete = () => {
    let unrevealed = 0;
    tableau.forEach((col) =>
      col.forEach((c) => {
        if (!c.faceUp) unrevealed++;
      })
    );

    if (unrevealed > 0 || deck.length > 0 || waste.length > 0) {
      setHintMessage('Auto-completar requer que todas as cartas do baralho e colunas estejam reveladas.');
      return;
    }

    let movedAny = false;
    const newFoundation = foundation.map((pile) => [...pile]);
    const newTableau = tableau.map((col) => [...col]);

    for (let cIdx = 0; cIdx < 7; cIdx++) {
      const col = newTableau[cIdx];
      if (col.length > 0) {
        const card = col[col.length - 1];
        for (let fIdx = 0; fIdx < 4; fIdx++) {
          const pile = newFoundation[fIdx];
          const canFit =
            pile.length === 0
              ? card.valNum === 1
              : pile[pile.length - 1].suit === card.suit &&
                card.valNum === pile[pile.length - 1].valNum + 1;

          if (canFit) {
            newFoundation[fIdx].push(card);
            newTableau[cIdx].pop();
            movedAny = true;
            break;
          }
        }
      }
    }

    if (movedAny) {
      try {
        soundFx.playNotification();
      } catch (e) {}
      setFoundation(newFoundation);
      setTableau(newTableau);
      setScore((s) => s + 10);
      setMoves((m) => m + 1);
    }
  };

  // Hint finder
  const handleHint = () => {
    try {
      soundFx.playClick();
    } catch (e) {}

    // Check waste to foundation
    if (waste.length > 0) {
      const wCard = waste[waste.length - 1];
      for (let fIdx = 0; fIdx < 4; fIdx++) {
        if (canMoveToFoundation(wCard, fIdx)) {
          setHintMessage(`Dica: Mova ${wCard.value}${wCard.suit} do Descarte para a Fundação!`);
          setSelected({ type: 'waste' });
          return;
        }
      }
      for (let tIdx = 0; tIdx < 7; tIdx++) {
        if (canMoveToTableau(wCard, tIdx)) {
          setHintMessage(`Dica: Mova ${wCard.value}${wCard.suit} do Descarte para a Coluna ${tIdx + 1}!`);
          setSelected({ type: 'waste' });
          return;
        }
      }
    }

    // Check tableau to foundation
    for (let colIdx = 0; colIdx < 7; colIdx++) {
      const col = tableau[colIdx];
      if (col.length > 0) {
        const card = col[col.length - 1];
        if (card.faceUp) {
          for (let fIdx = 0; fIdx < 4; fIdx++) {
            if (canMoveToFoundation(card, fIdx)) {
              setHintMessage(`Dica: Mova ${card.value}${card.suit} da Coluna ${colIdx + 1} para a Fundação!`);
              setSelected({ type: 'tableau', colIdx, cardIdx: col.length - 1 });
              return;
            }
          }
        }
      }
    }

    // Check tableau to tableau
    for (let srcCol = 0; srcCol < 7; srcCol++) {
      const col = tableau[srcCol];
      for (let cardIdx = 0; cardIdx < col.length; cardIdx++) {
        const card = col[cardIdx];
        if (card.faceUp) {
          for (let destCol = 0; destCol < 7; destCol++) {
            if (srcCol === destCol) continue;
            if (canMoveToTableau(card, destCol)) {
              if (card.valNum === 13 && cardIdx === 0) continue; // don't move king from empty to empty
              setHintMessage(`Dica: Mova ${card.value}${card.suit} da Coluna ${srcCol + 1} para a Coluna ${destCol + 1}!`);
              setSelected({ type: 'tableau', colIdx: srcCol, cardIdx });
              return;
            }
          }
        }
      }
    }

    if (deck.length > 0 || waste.length > 0) {
      setHintMessage('Dica: Compre uma carta do baralho para abrir novos caminhos.');
      return;
    }

    setHintMessage('Nenhum movimento evidente no momento.');
  };

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, source: SelectionSource, cards: Card[]) => {
    draggedCardsRef.current = { source, cards };
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', cards[0].id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnTableau = (e: React.DragEvent, destColIdx: number) => {
    e.preventDefault();
    setIsDragging(false);
    if (!draggedCardsRef.current) return;
    applyMoveToTableau(draggedCardsRef.current.source, destColIdx);
    draggedCardsRef.current = null;
  };

  const handleDropOnFoundation = (e: React.DragEvent, destFIdx: number) => {
    e.preventDefault();
    setIsDragging(false);
    if (!draggedCardsRef.current) return;
    applyMoveToFoundation(draggedCardsRef.current.source, destFIdx);
    draggedCardsRef.current = null;
  };

  const isRetro = mode === 'retro';

  return (
    <div className="space-y-4 font-sans select-none text-slate-100 max-w-5xl mx-auto">
      {/* Top Header Bar */}
      <div
        className={`p-2.5 border-2 flex flex-wrap items-center justify-between gap-3 shadow ${
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
            ♠ {isRetro ? 'PACIÊNCIA 2000 (KLONDIKE)' : 'PACIÊNCIA NEBULA'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Draw 1 / Draw 3 toggle */}
          <button
            onClick={() => setDrawMode(drawMode === 1 ? 3 : 1)}
            className={`px-2 py-1 font-mono text-xs font-bold border rounded cursor-pointer transition ${
              isRetro
                ? 'bg-[#d4d0c8] text-gray-900 border-gray-600'
                : 'bg-slate-800 text-cyan-300 border-cyan-600'
            }`}
            title="Alternar modo de compra"
          >
            MODO: COMPRA {drawMode}
          </button>

          <button
            onClick={handleHint}
            className="px-2.5 py-1 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-mono font-bold text-xs border border-yellow-600 rounded flex items-center gap-1 cursor-pointer shadow"
            title="Dica de movimento"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>DICA</span>
          </button>

          <button
            onClick={handleAutoComplete}
            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white font-mono font-bold text-xs rounded flex items-center gap-1 cursor-pointer shadow"
            title="Auto-completar fundações"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>AUTO</span>
          </button>

          <button
            onClick={initGame}
            className={`px-3 py-1 font-mono font-bold text-xs border-2 cursor-pointer flex items-center gap-1 shadow ${
              isRetro
                ? 'bg-[#d4d0c8] hover:bg-white text-black border-white border-r-gray-800 border-b-gray-800'
                : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 border-cyan-300 rounded'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>NOVA PARTIDA</span>
          </button>
        </div>
      </div>

      {/* Info Status Bar */}
      <div
        className={`px-3 py-1.5 border text-xs font-mono flex flex-wrap items-center justify-between gap-2 shadow-inner ${
          isRetro
            ? 'bg-[#000080] border-white text-yellow-300'
            : 'bg-cyan-950/60 border-cyan-800/80 text-cyan-200 rounded'
        }`}
      >
        <span>
          <strong>CONTROLES:</strong> Arraste ou clique para selecionar e mover | Duplo-clique para auto-enviar
        </span>
        <div className="flex items-center gap-4 text-white">
          <span>Pontos: <strong className="text-yellow-300">{score}</strong></span>
          <span>Movimentos: <strong className="text-yellow-300">{moves}</strong></span>
          <span>Recorde: <strong className="text-yellow-300">{highScore}</strong></span>
        </div>
      </div>

      {/* Hint Alert */}
      {hintMessage && (
        <div className="bg-yellow-400 text-slate-950 font-mono text-xs px-3 py-2 rounded flex items-center justify-between border border-yellow-600 shadow animate-fadeIn">
          <span>💡 {hintMessage}</span>
          <button
            onClick={() => setHintMessage(null)}
            className="font-bold hover:underline ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Playing Felt Table */}
      <div
        className={`p-4 border-2 rounded-xl shadow-2xl space-y-5 min-h-[500px] ${
          isRetro
            ? 'bg-[#0e7030] border-white border-r-gray-900 border-b-gray-900'
            : 'bg-gradient-to-b from-[#0b1b36] via-[#051124] to-[#020712] border-cyan-500/30'
        }`}
      >
        {/* Top Section: Deck, Waste & Foundations */}
        <div className="flex flex-wrap items-start justify-between gap-4 p-3 rounded-lg bg-black/20 border border-white/10">
          {/* Deck & Waste */}
          <div className="flex items-center gap-3">
            {/* Deck */}
            <div className="flex flex-col items-center">
              <button
                onClick={handleDraw}
                className={`w-14 sm:w-16 h-20 sm:h-22 rounded border-2 flex flex-col items-center justify-center font-bold text-xs cursor-pointer shadow-lg transition transform active:scale-95 ${
                  deck.length > 0
                    ? isRetro
                      ? 'bg-[#000080] hover:bg-blue-800 border-white text-blue-100'
                      : 'bg-cyan-900/80 hover:bg-cyan-800 border-cyan-400 text-cyan-200'
                    : 'bg-green-950/80 border-green-700 text-green-400'
                }`}
                title="Comprar carta (ou reciclar monte)"
              >
                {deck.length > 0 ? (
                  <>
                    <span className="text-2xl">🂠</span>
                    <span className="text-[10px] font-mono mt-0.5">{deck.length}</span>
                  </>
                ) : (
                  <>
                    <RotateCw className="w-5 h-5 text-green-400 animate-spin-slow" />
                    <span className="text-[9px] font-mono mt-1">Reciclar</span>
                  </>
                )}
              </button>
              <span className="text-[10px] font-mono text-white/80 mt-1">Monte</span>
            </div>

            {/* Waste */}
            <div className="flex flex-col items-center">
              <div
                onClick={() => {
                  setHintMessage(null);
                  if (waste.length === 0) return;
                  if (selected && selected.type === 'waste') setSelected(null);
                  else {
                    try { soundFx.playClick(); } catch (e) {}
                    setSelected({ type: 'waste' });
                  }
                }}
                onDoubleClick={() => {
                  if (waste.length > 0) {
                    trySmartMove(waste[waste.length - 1], { type: 'waste' });
                  }
                }}
                draggable={waste.length > 0}
                onDragStart={(e) => {
                  if (waste.length > 0) {
                    handleDragStart(e, { type: 'waste' }, [waste[waste.length - 1]]);
                  }
                }}
                className={`w-14 sm:w-16 h-20 sm:h-22 rounded border-2 flex flex-col items-center justify-center cursor-pointer transition shadow-md ${
                  selected && selected.type === 'waste'
                    ? 'ring-4 ring-yellow-400 border-yellow-300 scale-105 bg-yellow-50'
                    : waste.length > 0
                    ? 'bg-white border-slate-300 hover:border-yellow-300'
                    : 'bg-black/30 border-white/20 border-dashed'
                }`}
                title="Descarte. Arraste ou clique para mover."
              >
                {waste.length > 0 ? (
                  (() => {
                    const top = waste[waste.length - 1];
                    return (
                      <div className={`flex flex-col items-center font-mono font-black ${top.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>
                        <span className="text-base sm:text-lg leading-none">{top.value}</span>
                        <span className="text-xl sm:text-2xl leading-none mt-0.5">{top.suit}</span>
                      </div>
                    );
                  })()
                ) : (
                  <span className="text-[10px] text-white/40 font-mono">Vazio</span>
                )}
              </div>
              <span className="text-[10px] font-mono text-white/80 mt-1">Descarte ({waste.length})</span>
            </div>
          </div>

          {/* 4 Foundations */}
          <div className="flex items-center gap-2">
            {foundation.map((pile, fIdx) => {
              const isSelected = selected && selected.type === 'foundation' && selected.fIdx === fIdx;
              const top = pile[pile.length - 1];
              return (
                <div key={fIdx} className="flex flex-col items-center">
                  <div
                    onClick={() => {
                      setHintMessage(null);
                      if (selected) {
                        applyMoveToFoundation(selected, fIdx);
                      } else if (pile.length > 0) {
                        setSelected({ type: 'foundation', fIdx });
                      }
                    }}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropOnFoundation(e, fIdx)}
                    className={`w-14 sm:w-16 h-20 sm:h-22 rounded border-2 flex flex-col items-center justify-center cursor-pointer transition shadow-md ${
                      isSelected
                        ? 'ring-4 ring-yellow-400 border-yellow-300'
                        : pile.length > 0
                        ? 'bg-white border-slate-300 hover:border-yellow-300'
                        : 'bg-black/40 border-white/20 border-dashed hover:border-cyan-400'
                    }`}
                    title={`Fundação ${fIdx + 1}. Aceita de Ás a Rei do mesmo naipe.`}
                  >
                    {pile.length > 0 ? (
                      <div className={`flex flex-col items-center font-mono font-black ${top.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>
                        <span className="text-base sm:text-lg leading-none">{top.value}</span>
                        <span className="text-xl sm:text-2xl leading-none mt-0.5">{top.suit}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-white/40 font-mono font-bold">A</span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-white/80 mt-1">F{fIdx + 1} ({pile.length})</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tableau 7 Columns */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-3 pt-2">
          {tableau.map((col, colIdx) => {
            return (
              <div
                key={colIdx}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnTableau(e, colIdx)}
                onClick={() => {
                  if (col.length === 0) {
                    handleTableauClick(colIdx);
                  }
                }}
                className="flex flex-col items-center min-h-[220px] rounded-lg p-1 bg-black/10 border border-white/5 transition hover:bg-white/5"
              >
                {col.length === 0 ? (
                  <div
                    onClick={() => handleTableauClick(colIdx)}
                    className="w-full h-20 sm:h-22 rounded border-2 border-dashed border-white/20 flex items-center justify-center text-white/30 font-mono text-xs cursor-pointer hover:border-yellow-300"
                    title="Coluna vazia. Aceita apenas Rei (K)."
                  >
                    K
                  </div>
                ) : (
                  <div className="relative w-full flex flex-col items-center">
                    {col.map((card, cardIdx) => {
                      const isTopCard = cardIdx === col.length - 1;
                      const isCardSelected =
                        selected &&
                        selected.type === 'tableau' &&
                        selected.colIdx === colIdx &&
                        selected.cardIdx <= cardIdx;

                      return (
                        <div
                          key={card.id}
                          draggable={card.faceUp}
                          onDragStart={(e) => {
                            if (card.faceUp) {
                              const movingCards = col.slice(cardIdx);
                              handleDragStart(e, { type: 'tableau', colIdx, cardIdx }, movingCards);
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTableauClick(colIdx, cardIdx);
                          }}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            if (card.faceUp && isTopCard) {
                              trySmartMove(card, { type: 'tableau', colIdx, cardIdx });
                            }
                          }}
                          style={{
                            marginTop: cardIdx === 0 ? 0 : isTopCard ? '-48px' : '-54px',
                            zIndex: cardIdx + 1,
                          }}
                          className={`w-full max-w-[62px] h-20 sm:h-22 rounded border-2 flex flex-col justify-between p-1 cursor-pointer transition-all shadow-md select-none ${
                            !card.faceUp
                              ? isRetro
                                ? 'bg-[#000080] border-white text-blue-200'
                                : 'bg-cyan-950 border-cyan-700 text-cyan-300'
                              : isCardSelected
                              ? 'bg-yellow-50 border-yellow-400 ring-2 ring-yellow-400 scale-[1.03]'
                              : 'bg-white border-slate-300 hover:border-blue-400'
                          }`}
                        >
                          {card.faceUp ? (
                            <>
                              <div className={`flex items-center justify-between font-mono font-black text-xs leading-none ${card.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>
                                <span>{card.value}</span>
                                <span className="text-sm">{card.suit}</span>
                              </div>
                              <div className={`self-center text-xl leading-none font-black ${card.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>
                                {card.suit}
                              </div>
                              <div className={`flex items-center justify-between font-mono font-black text-xs leading-none rotate-180 ${card.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>
                                <span>{card.value}</span>
                                <span className="text-sm">{card.suit}</span>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center opacity-60">
                              <span className="text-lg">♠</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Victory Modal */}
      {hasWon && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div
            className={`max-w-md w-full p-6 rounded-xl border-4 text-center space-y-4 shadow-2xl ${
              isRetro
                ? 'bg-[#c0c0c0] border-white text-slate-900 shadow-[8px_8px_0px_rgba(0,0,0,0.5)]'
                : 'bg-slate-950 border-cyan-400 text-cyan-100'
            }`}
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-yellow-400 flex items-center justify-center text-3xl shadow-lg animate-bounce">
              🏆
            </div>
            <h2 className="text-2xl font-mono font-black tracking-wider text-green-700 dark:text-cyan-300">
              PARABÉNS! VITÓRIA!
            </h2>
            <p className="text-sm font-mono leading-relaxed">
              Você completou todas as 4 fundações com 52 cartas no clássico Klondike Solitaire!
            </p>

            <div className="p-3 bg-white/60 dark:bg-slate-900 rounded font-mono text-sm space-y-1">
              <div>Pontuação Final: <strong className="text-green-700 dark:text-cyan-300">{score}</strong></div>
              <div>Movimentos: <strong>{moves}</strong></div>
              <div>Recorde Salvo: <strong>{highScore}</strong></div>
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={initGame}
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
