import React, { useState } from 'react';
import { Gamepad2, Sparkles, Trophy, ArrowLeft, Play, Bomb, Rocket, Smartphone, Shield, Zap, Flame, RotateCcw, ChevronRight } from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';

// The 6 Official Game Components
import { SolitaireGame } from '../games/SolitaireGame';
import { SoccerGame } from '../games/SoccerGame';
import { KartGame } from '../games/KartGame';
import { MinesweeperGame } from '../games/MinesweeperGame';
import { PinballGame } from '../games/PinballGame';
import { SnakeGame } from '../games/SnakeGame';

export type GameId = 'solitaire' | 'soccer' | 'kart' | 'minesweeper' | 'pinball' | 'snake' | null;

interface GameItem {
  id: 'solitaire' | 'soccer' | 'kart' | 'minesweeper' | 'pinball' | 'snake';
  title: string;
  category: string;
  categoryBadge: string;
  year: string;
  description: string;
  icon: string;
  accentColor: string;
  gradient: string;
  controlsInfo: string;
}

const GAMES_LIST: GameItem[] = [
  {
    id: 'solitaire',
    title: 'PACIÊNCIA 2000',
    category: 'Cartas & Estratégia',
    categoryBadge: 'CARTAS',
    year: '2000',
    description: 'O clássico jogo de cartas Solitaire Klondike dos computadores pessoais com 52 cartas, descarte inteligente e auto-completar.',
    icon: '♠️',
    accentColor: '#15803d',
    gradient: 'from-emerald-800 to-green-950',
    controlsInfo: 'Mouse / Toque: Selecione e mova cartas para as colunas e fundações.',
  },
  {
    id: 'soccer',
    title: 'FUTEBOL 2000',
    category: 'Esporte Retrô',
    categoryBadge: 'ESPORTE',
    year: '2000',
    description: 'Disputa de pênaltis inspirada nos grandes títulos de futebol dos anos 2000. Calibre direção, altura e potência contra o goleiro.',
    icon: '⚽',
    accentColor: '#1d4ed8',
    gradient: 'from-blue-800 to-indigo-950',
    controlsInfo: 'Espaço / Toque: Trave a Mira X, Mira Y e Força do chute.',
  },
  {
    id: 'kart',
    title: 'MARIO KART',
    category: 'Corrida Arcade',
    categoryBadge: 'CORRIDA',
    year: '2000',
    description: 'Corrida Super Kart em modo pseudo-3D com curvas dinâmicas, turbos, pilotos clássicos e 3 circuitos emocionantes.',
    icon: '🏎️',
    accentColor: '#dc2626',
    gradient: 'from-red-800 to-rose-950',
    controlsInfo: 'Setas / WASD: Acelerar e pilotar | Espaço: Turbo boost.',
  },
  {
    id: 'minesweeper',
    title: 'CAMPO MINADO',
    category: 'Lógica & Concentração',
    categoryBadge: 'LÓGICA',
    year: '2000',
    description: 'Desarme todas as minas com precisão cirúrgica. Inclui dificuldades Fácil (9x9), Médio (16x16), Difícil (24x16) e Personalizado.',
    icon: '💣',
    accentColor: '#b45309',
    gradient: 'from-amber-800 to-yellow-950',
    controlsInfo: 'Clique: Revelar | Botão Direito / Modo Bandeira: Marcar mina 🚩.',
  },
  {
    id: 'pinball',
    title: '3D PINBALL',
    category: 'Arcade Espacial',
    categoryBadge: 'ARCADE',
    year: '2000',
    description: 'O lendário Space Cadet Pinball com física ágil, bumpers reluzentes, rampas orbitais e patentes espaciais.',
    icon: '🚀',
    accentColor: '#7c3aed',
    gradient: 'from-purple-900 to-indigo-950',
    controlsInfo: 'A / Z ou ◄: Paleta Esq | D / . ou ►: Paleta Dir | Espaço: Lançar.',
  },
  {
    id: 'snake',
    title: 'SNAKE NOKIA',
    category: 'Retro Mobile',
    categoryBadge: 'MOBILE',
    year: '2000',
    description: 'O autêntico jogo da cobrinha no visor LCD verde fósforo do indestrutível celular Nokia 3310 com resposta instantânea.',
    icon: '📱',
    accentColor: '#047857',
    gradient: 'from-teal-800 to-emerald-950',
    controlsInfo: 'Setas / WASD / D-Pad virtual: Controle a direção da cobrinha.',
  },
];

interface GamesAppProps {
  mode?: 'retro' | 'space';
}

export const GamesApp: React.FC<GamesAppProps> = ({ mode = 'retro' }) => {
  const [selectedGame, setSelectedGame] = useState<GameId>(null);

  const handleSelectGame = (gameId: GameId) => {
    try {
      soundFx.playClick();
    } catch (e) {}
    setSelectedGame(gameId);
  };

  const handleBackToHub = () => {
    try {
      soundFx.playClick();
    } catch (e) {}
    setSelectedGame(null);
  };

  // If a game is active, render that specific game view with onBackToHub
  if (selectedGame === 'solitaire') {
    return <SolitaireGame onBackToHub={handleBackToHub} mode={mode} />;
  }
  if (selectedGame === 'soccer') {
    return <SoccerGame onBackToHub={handleBackToHub} mode={mode} />;
  }
  if (selectedGame === 'kart') {
    return <KartGame onBackToHub={handleBackToHub} mode={mode} />;
  }
  if (selectedGame === 'minesweeper') {
    return <MinesweeperGame onBackToHub={handleBackToHub} mode={mode} />;
  }
  if (selectedGame === 'pinball') {
    return <PinballGame onBackToHub={handleBackToHub} mode={mode} />;
  }
  if (selectedGame === 'snake') {
    return <SnakeGame onBackToHub={handleBackToHub} mode={mode} />;
  }

  // =========================================================================
  // GAME CENTER HUB (INITIAL SCREEN)
  // =========================================================================
  const isRetro = mode === 'retro';

  return (
    <div className="space-y-4 font-sans select-none">
      {/* Game Center Header Banner */}
      <div
        className={`p-4 rounded-lg border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg ${
          isRetro
            ? 'bg-[#000080] border-white text-white'
            : 'bg-gradient-to-r from-blue-950/90 via-indigo-950/80 to-black border-cyan-500/40 text-cyan-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl shadow-inner ${
              isRetro ? 'bg-white/20 border border-white/40' : 'bg-cyan-500/20 border border-cyan-400 text-cyan-300'
            }`}
          >
            🎮
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black font-mono tracking-wider">
                MATEUS GAME CENTER
              </h2>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  isRetro
                    ? 'bg-yellow-400 text-slate-950'
                    : 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50'
                }`}
              >
                6 JOGOS CLÁSSICOS
              </span>
            </div>
            <p className="text-xs opacity-90 font-mono mt-0.5">
              Selecione um jogo para iniciar. Todos os jogos contam com suporte a mouse, teclado e toque mobile.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of 6 Games */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {GAMES_LIST.map((game) => (
          <div
            key={game.id}
            onClick={() => handleSelectGame(game.id)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between group relative shadow-md hover:scale-[1.02] ${
              isRetro
                ? 'bg-[#d4d0c8] hover:bg-white text-gray-900 border-white border-r-gray-800 border-b-gray-800 active:border-gray-800 active:border-r-white active:border-b-white'
                : 'bg-slate-900/80 hover:bg-slate-800/90 text-slate-100 border-cyan-900/80 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]'
            }`}
          >
            {/* Card Header */}
            <div>
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl filter drop-shadow group-hover:scale-110 transition-transform">
                    {game.icon}
                  </span>
                  <div>
                    <h3 className="font-mono font-bold font-black text-sm tracking-wide text-gray-950 dark:text-white group-hover:text-blue-700 dark:group-hover:text-cyan-300">
                      <strong className="font-black font-mono font-bold tracking-wider">{game.title}</strong>
                    </h3>
                    <span className="text-[10px] font-mono opacity-75">{game.category}</span>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded border ${
                    isRetro
                      ? 'bg-[#000080] text-white border-white'
                      : 'bg-cyan-950 text-cyan-300 border-cyan-700'
                  }`}
                >
                  {game.categoryBadge}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs leading-relaxed opacity-85 mb-3">
                {game.description}
              </p>
            </div>

            {/* Card Footer with Play Action */}
            <div className="pt-2.5 border-t border-gray-400/50 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-[10px] font-mono text-gray-600 dark:text-slate-400">
                {game.controlsInfo.split(':')[0]}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectGame(game.id);
                }}
                className={`px-3 py-1.5 rounded text-xs font-mono font-black flex items-center gap-1.5 cursor-pointer shadow transition ${
                  isRetro
                    ? 'bg-[#000080] text-white hover:bg-blue-800 border border-white'
                    : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 border border-cyan-200'
                }`}
              >
                <span>JOGAR AGORA</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Info Banner */}
      <div
        className={`p-2.5 rounded border text-xs font-mono flex items-center justify-between text-gray-700 dark:text-slate-400 ${
          isRetro ? 'bg-[#c0c0c0] border-gray-500' : 'bg-slate-950/60 border-slate-800'
        }`}
      >
        <span>💡 Dica: Dentro de qualquer jogo, clique em <strong>← VOLTAR AOS JOGOS</strong> para retornar a este painel a qualquer momento.</span>
      </div>
    </div>
  );
};
