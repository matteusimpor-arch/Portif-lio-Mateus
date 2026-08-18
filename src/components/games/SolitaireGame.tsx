import React, { useState, useEffect } from 'react';
import { RefreshCw, Trophy, Sparkles, HelpCircle, FastForward, CheckCircle2, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../utils/soundEffects';

const SUITS = ['♠', '♥', '♦', '♣'] as const;
const SUIT_COLORS: Record<string, 'red' | 'black'> = {
  '♠': 'black',
  '♥': 'red',
  '♦': 'red',
  '♣': 'black',
};
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export interface Card {
  id: string;
  suit: '♠' | '♥' | '♦' | '♣';
  value: string;
  color: 'red' | 'black';
  valNum: number; // 1 to 13 (A = 1, K = 13)
  faceUp: boolean;
}

type SelectionSource =
  | { type: 'waste' }
  | { type: 'tableau'; colIdx: number; cardIdx: number }
  | { type: 'foundation'; fIdx: number }
  | null;

export const SolitaireGame: React.FC = () => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [waste, setWaste] = useState<Card[]>([]);
  const [foundation, setFoundation] = useState<Card[][]>([[], [], [], []]);
  const [tableau, setTableau] = useState<Card[][]>([[], [], [], [], [], [], []]);
  const [score, setScore] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [selected, setSelected] = useState<SelectionSource>(null);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [hintMessage, setHintMessage] = useState<string | null>(null);

  const initGame = () => {
    try {
      soundFx.playClick();
    } catch (e) {}

    let cards: Card[] = [];
    let id = 0;
    SUITS.forEach((suit) => {
      VALUES.forEach((val, idx) => {
        cards.push({
          id: `card-${id++}`,
          suit,
          value: val,
          color: SUIT_COLORS[suit],
          valNum: idx + 1,
          faceUp: false,
        });
      });
    });

    // Fisher-Yates Shuffle
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    // Build 7 tableau columns
    const newTableau: Card[][] = [[], [], [], [], [], [], []];
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j <= i; j++) {
        const c = cards.pop()!;
        if (j === i) {
          c.faceUp = true;
        }
        newTableau[i].push(c);
      }
    }

    setTableau(newTableau);
    setFoundation([[], [], [], []]);
    setWaste([]);
    setDeck(cards);
    setScore(0);
    setMoves(0);
    setSelected(null);
    setHasWon(false);
    setHintMessage(null);
  };

  useEffect(() => {
    initGame();
  }, []);

  // Check victory condition
  useEffect(() => {
    const totalInFoundation = foundation.reduce((acc, pile) => acc + pile.length, 0);
    if (totalInFoundation === 52 && !hasWon) {
      setHasWon(true);
      try {
        soundFx.playFanfare();
      } catch (e) {}
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
    }
  }, [foundation, hasWon]);

  // Draw card from deck into waste
  const handleDraw = () => {
    try {
      soundFx.playCardFlip();
    } catch (e) {}
    setSelected(null);
    setHintMessage(null);

    if (deck.length === 0) {
      if (waste.length === 0) return;
      // Recycle waste into deck
      const recycled = waste.map((c) => ({ ...c, faceUp: false })).reverse();
      setDeck(recycled);
      setWaste([]);
      setMoves((m) => m + 1);
      return;
    }

    const nextCard = deck[deck.length - 1];
    setDeck(deck.slice(0, -1));
    setWaste([...waste, { ...nextCard, faceUp: true }]);
    setMoves((m) => m + 1);
  };

  // Helper: check if card can go into foundation
  const canMoveToFoundation = (card: Card, fIdx: number): boolean => {
    const pile = foundation[fIdx];
    if (pile.length === 0) {
      return card.valNum === 1; // Ace
    }
    const topCard = pile[pile.length - 1];
    return topCard.suit === card.suit && card.valNum === topCard.valNum + 1;
  };

  // Helper: check if a card can go to a tableau column
  const canMoveToTableau = (card: Card, colIdx: number): boolean => {
    const col = tableau[colIdx];
    if (col.length === 0) {
      return card.valNum === 13; // King on empty
    }
    const topCard = col[col.length - 1];
    if (!topCard.faceUp) return false;
    return topCard.color !== card.color && card.valNum === topCard.valNum - 1;
  };

  // Auto-move a card to foundation or tableau on double click / smart click
  const trySmartMove = (card: Card, fromSource: SelectionSource) => {
    if (!fromSource) return;

    // 1. Try Foundation first
    for (let fIdx = 0; fIdx < 4; fIdx++) {
      if (canMoveToFoundation(card, fIdx)) {
        applyMoveToFoundation(fromSource, fIdx);
        return;
      }
    }

    // 2. Try Tableau
    for (let tIdx = 0; tIdx < 7; tIdx++) {
      if (fromSource.type === 'tableau' && fromSource.colIdx === tIdx) continue;
      if (canMoveToTableau(card, tIdx)) {
        applyMoveToTableau(fromSource, tIdx);
        return;
      }
    }
  };

  // Apply move to foundation
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
      }
    } else if (source.type === 'tableau') {
      const col = tableau[source.colIdx];
      // Can only move the top-most card of the tableau column to foundation
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
      }
    }
  };

  // Apply move to tableau column
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
        setHintMessage('Movimento inválido para esta coluna.');
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
        // Add to destination
        const newDestCol = [...tableau[destColIdx], ...movingCards];

        // Remove from source
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

  // Click on a Tableau card or column
  const handleTableauClick = (colIdx: number, cardIdx?: number) => {
    setHintMessage(null);
    const col = tableau[colIdx];

    // If we have a selected card/pile, attempt to move to this tableau column
    if (selected) {
      // If clicking same selected card, deselect
      if (
        selected.type === 'tableau' &&
        selected.colIdx === colIdx &&
        selected.cardIdx === cardIdx
      ) {
        setSelected(null);
        return;
      }

      applyMoveToTableau(selected, colIdx);
      return;
    }

    // No selection yet: selecting a card from this column
    if (col.length === 0) return;

    const targetIdx = cardIdx !== undefined ? cardIdx : col.length - 1;
    const card = col[targetIdx];

    // If card is face down and at the top, flip it
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

    if (card.faceUp) {
      try {
        soundFx.playClick();
      } catch (e) {}
      setSelected({ type: 'tableau', colIdx, cardIdx: targetIdx });
    }
  };

  // Double click for auto-move
  const handleTableauDoubleClick = (colIdx: number, cardIdx: number) => {
    const col = tableau[colIdx];
    const card = col[cardIdx];
    if (card && card.faceUp) {
      trySmartMove(card, { type: 'tableau', colIdx, cardIdx });
    }
  };

  // Click on Waste card
  const handleWasteClick = () => {
    setHintMessage(null);
    if (waste.length === 0) return;

    if (selected && selected.type === 'waste') {
      // Deselect
      setSelected(null);
      return;
    }

    try {
      soundFx.playClick();
    } catch (e) {}
    setSelected({ type: 'waste' });
  };

  // Double click on waste
  const handleWasteDoubleClick = () => {
    if (waste.length === 0) return;
    const card = waste[waste.length - 1];
    trySmartMove(card, { type: 'waste' });
  };

  // Click on Foundation pile
  const handleFoundationClick = (fIdx: number) => {
    setHintMessage(null);
    if (selected) {
      applyMoveToFoundation(selected, fIdx);
      return;
    }

    // Select top card of foundation if not empty
    const pile = foundation[fIdx];
    if (pile.length > 0) {
      setSelected({ type: 'foundation', fIdx });
    }
  };

  // Auto-complete: if all cards are revealed and deck/waste are empty
  const handleAutoComplete = () => {
    let unrevealed = 0;
    tableau.forEach((col) =>
      col.forEach((c) => {
        if (!c.faceUp) unrevealed++;
      })
    );

    if (unrevealed > 0 || deck.length > 0 || waste.length > 0) {
      setHintMessage('Auto-completar requer que todas as cartas do jogo estejam reveladas.');
      return;
    }

    // Incrementally move all to foundation
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
    }
  };

  // Provide a hint
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
              // Only suggest king if not already at base of source
              if (card.valNum === 13 && cardIdx === 0) continue;
              setHintMessage(`Dica: Mova ${card.value}${card.suit} da Coluna ${srcCol + 1} para a Coluna ${destCol + 1}!`);
              setSelected({ type: 'tableau', colIdx: srcCol, cardIdx });
              return;
            }
          }
        }
      }
    }

    // Check if deck has cards
    if (deck.length > 0 || waste.length > 0) {
      setHintMessage('Dica: Compre uma nova carta do baralho para abrir novas opções.');
      return;
    }

    setHintMessage('Nenhum movimento óbvio encontrado no momento.');
  };

  return (
    <div className="bg-[#0e7030] p-4 md:p-5 border-2 border-white border-r-gray-900 border-b-gray-900 text-white space-y-4 rounded shadow-2xl font-sans select-none">
      {/* Top Header & Status Bar */}
      <div className="bg-black/60 p-2.5 rounded border border-green-400/40 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="font-bold text-yellow-300 tracking-wider">♠ PACIÊNCIA KLONDIKE 2000</span>
          <span className="bg-green-950 px-2 py-0.5 rounded border border-green-600 text-emerald-300">
            PONTOS: {score}
          </span>
          <span className="text-slate-300">MOVIMENTOS: {moves}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleHint}
            className="px-2.5 py-1 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded flex items-center gap-1 cursor-pointer transition text-[11px]"
            title="Receber uma sugestão de movimento"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Dica</span>
          </button>

          <button
            onClick={handleAutoComplete}
            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded flex items-center gap-1 cursor-pointer transition text-[11px]"
            title="Auto-completar jogo se todas as cartas estiverem abertas"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>Auto</span>
          </button>

          <button
            onClick={initGame}
            className="px-3 py-1 bg-[#c0c0c0] hover:bg-white text-black font-bold border border-white rounded flex items-center gap-1 cursor-pointer transition text-[11px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Novo Jogo</span>
          </button>
        </div>
      </div>

      {/* Hint Alert if Active */}
      {hintMessage && (
        <div className="bg-yellow-400/90 text-slate-950 font-mono text-xs px-3 py-1.5 rounded flex items-center justify-between border border-yellow-200 animate-fadeIn">
          <span>💡 {hintMessage}</span>
          <button
            onClick={() => setHintMessage(null)}
            className="font-bold hover:underline ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Deck, Waste, and Foundations Area */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-green-900/60 p-3 rounded border border-green-700/60">
        {/* Left: Deck and Waste */}
        <div className="flex items-center gap-3">
          {/* Deck */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleDraw}
              className={`w-14 h-20 rounded border-2 flex flex-col items-center justify-center font-bold text-xs cursor-pointer shadow-lg transition transform active:scale-95 ${
                deck.length > 0
                  ? 'bg-blue-900 hover:bg-blue-800 border-white text-blue-200'
                  : 'bg-green-950 border-green-600 text-green-400'
              }`}
              title="Comprar carta (ou reciclar descarte)"
            >
              {deck.length > 0 ? (
                <>
                  <span className="text-xl">🂠</span>
                  <span className="text-[9px] font-mono mt-0.5">{deck.length}</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 text-green-400 animate-spin-slow" />
                  <span className="text-[9px] font-mono mt-1">Reciclar</span>
                </>
              )}
            </button>
            <span className="text-[10px] font-mono text-green-200 mt-1">Baralho</span>
          </div>

          {/* Waste (Descarte) */}
          <div className="flex flex-col items-center">
            <div
              onClick={handleWasteClick}
              onDoubleClick={handleWasteDoubleClick}
              className={`w-14 h-20 rounded border-2 flex flex-col items-center justify-center cursor-pointer transition shadow-md ${
                selected && selected.type === 'waste'
                  ? 'ring-4 ring-yellow-400 border-yellow-300 scale-105 bg-yellow-50'
                  : waste.length > 0
                  ? 'bg-white border-slate-300 hover:border-yellow-300'
                  : 'bg-green-950/60 border-green-700/60 border-dashed'
              }`}
              title="Carta em jogo no descarte. Clique para selecionar ou duplo clique para auto-mover."
            >
              {waste.length > 0 ? (
                (() => {
                  const topWaste = waste[waste.length - 1];
                  return (
                    <div
                      className={`flex flex-col items-center justify-center font-mono font-bold ${
                        topWaste.color === 'red' ? 'text-red-600' : 'text-slate-900'
                      }`}
                    >
                      <span className="text-sm">{topWaste.value}</span>
                      <span className="text-lg leading-none">{topWaste.suit}</span>
                    </div>
                  );
                })()
              ) : (
                <span className="text-[10px] text-green-400/80 font-mono">Descarte</span>
              )}
            </div>
            <span className="text-[10px] font-mono text-green-200 mt-1">
              Descarte ({waste.length})
            </span>
          </div>
        </div>

        {/* Right: 4 Foundations */}
        <div className="flex items-center gap-2">
          {foundation.map((pile, fIdx) => {
            const isSelected = selected && selected.type === 'foundation' && selected.fIdx === fIdx;
            const topCard = pile[pile.length - 1];
            return (
              <div key={fIdx} className="flex flex-col items-center">
                <div
                  onClick={() => handleFoundationClick(fIdx)}
                  className={`w-14 h-20 rounded border-2 flex flex-col items-center justify-center cursor-pointer transition shadow-md ${
                    isSelected
                      ? 'ring-4 ring-yellow-400 border-yellow-300'
                      : pile.length > 0
                      ? 'bg-white border-slate-300 hover:border-yellow-300'
                      : 'bg-green-950/90 border-green-500/50 border-dashed hover:border-yellow-400'
                  }`}
                  title={`Fundação ${fIdx + 1} (Ás -> Rei do mesmo naipe)`}
                >
                  {pile.length > 0 ? (
                    <div
                      className={`flex flex-col items-center justify-center font-mono font-bold ${
                        topCard.color === 'red' ? 'text-red-600' : 'text-slate-900'
                      }`}
                    >
                      <span className="text-sm">{topCard.value}</span>
                      <span className="text-lg leading-none">{topCard.suit}</span>
                    </div>
                  ) : (
                    <span className="text-green-500/70 text-lg font-bold font-mono">
                      {SUITS[fIdx]}
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-mono text-green-300 mt-1">
                  Pilha {fIdx + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Tableau Columns */}
      <div className="grid grid-cols-7 gap-2 min-h-[360px] bg-green-950/60 p-3 rounded border border-green-700/60 overflow-x-auto">
        {tableau.map((col, colIdx) => (
          <div
            key={colIdx}
            onClick={() => {
              if (col.length === 0) handleTableauClick(colIdx);
            }}
            className="flex flex-col items-center relative min-h-[300px] cursor-pointer"
          >
            {/* Column Placeholder if empty */}
            {col.length === 0 ? (
              <div
                onClick={() => handleTableauClick(colIdx)}
                className="w-full h-20 border-2 border-green-600/40 border-dashed rounded flex flex-col items-center justify-center text-xs text-green-400/60 font-mono font-bold hover:border-yellow-400 transition"
                title="Coluna vazia (Aceita apenas Reis 'K')"
              >
                <span>K</span>
                <span className="text-[9px] text-green-500/60">Vazio</span>
              </div>
            ) : (
              <div className="relative w-full">
                {col.map((card, cardIdx) => {
                  const isSelected =
                    selected &&
                    selected.type === 'tableau' &&
                    selected.colIdx === colIdx &&
                    selected.cardIdx <= cardIdx; // Highlight whole stack from clicked card down

                  return (
                    <div
                      key={card.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTableauClick(colIdx, cardIdx);
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        handleTableauDoubleClick(colIdx, cardIdx);
                      }}
                      style={{
                        position: cardIdx === 0 ? 'relative' : 'absolute',
                        top: cardIdx === 0 ? 0 : `${cardIdx * 24}px`,
                        zIndex: cardIdx + 1,
                        width: '100%',
                      }}
                      className={`h-20 rounded border-2 p-1 font-mono font-bold transition-all shadow-md cursor-pointer select-none ${
                        isSelected
                          ? 'ring-4 ring-yellow-400 border-yellow-300 -translate-y-1 bg-yellow-50 shadow-xl'
                          : card.faceUp
                          ? 'bg-white border-slate-300 hover:border-yellow-300'
                          : 'bg-gradient-to-br from-blue-900 to-indigo-950 border-blue-400/80 text-blue-200'
                      }`}
                      title={
                        card.faceUp
                          ? `${card.value}${card.suit} (Clique para mover, duplo clique para auto-mover)`
                          : 'Carta oculta (Clique no topo para virar)'
                      }
                    >
                      {card.faceUp ? (
                        <div className="flex flex-col justify-between h-full">
                          <div
                            className={`flex justify-between items-center text-xs leading-none ${
                              card.color === 'red' ? 'text-red-600' : 'text-slate-900'
                            }`}
                          >
                            <span>{card.value}</span>
                            <span>{card.suit}</span>
                          </div>
                          <div
                            className={`text-center text-base leading-none ${
                              card.color === 'red' ? 'text-red-600' : 'text-slate-900'
                            }`}
                          >
                            {card.suit}
                          </div>
                          <div
                            className={`flex justify-end items-center text-[10px] leading-none ${
                              card.color === 'red' ? 'text-red-600' : 'text-slate-900'
                            }`}
                          >
                            <span>{card.value}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-blue-300 text-lg">
                          🂠
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Victory Banner */}
      {hasWon && (
        <div className="bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 text-slate-950 p-4 rounded-lg border-2 border-yellow-200 shadow-2xl text-center space-y-2 animate-bounce">
          <div className="flex items-center justify-center gap-2 text-lg font-bold font-mono">
            <Trophy className="w-6 h-6 text-amber-900" />
            <span>PARABÉNS! VOCÊ VENCEU A PACIÊNCIA!</span>
            <Sparkles className="w-6 h-6 text-amber-900" />
          </div>
          <p className="text-xs font-mono">
            Pontuação Final: <span className="font-bold">{score}</span> | Movimentos: <span className="font-bold">{moves}</span>
          </p>
          <button
            onClick={initGame}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold font-mono text-xs rounded border border-slate-700 cursor-pointer shadow"
          >
            Jogar Novamente
          </button>
        </div>
      )}

      {/* Instructions footer */}
      <div className="text-[11px] font-mono text-green-200/90 bg-black/40 p-2 rounded flex flex-wrap items-center justify-between gap-2 border border-green-800/40">
        <span>
          💡 <strong className="text-yellow-300">Como Jogar:</strong> Clique em uma carta ou pilha para selecionar (borda amarela) e clique na coluna ou fundação de destino para mover.
        </span>
        <span className="text-emerald-300 font-semibold">
          ⚡ Dica: Duplo clique em qualquer carta para auto-movimentação instantânea!
        </span>
      </div>
    </div>
  );
};
