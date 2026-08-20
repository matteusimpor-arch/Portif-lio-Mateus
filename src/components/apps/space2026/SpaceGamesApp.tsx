import React, { useState } from 'react';
import { Gamepad2, Sparkles, Trophy, ArrowLeft, Play, Bomb, Rocket, Shield, Zap, ChevronRight } from 'lucide-react';
import { soundFx } from '../../../utils/soundEffects';

import { SolitaireGame } from '../../games/SolitaireGame';
import { SoccerGame } from '../../games/SoccerGame';
import { KartGame } from '../../games/KartGame';
import { MinesweeperGame } from '../../games/MinesweeperGame';
import { PinballGame } from '../../games/PinballGame';
import { SnakeGame } from '../../games/SnakeGame';

export type GameId = 'solitaire' | 'soccer' | 'kart' | 'minesweeper' | 'pinball' | 'snake' | null;

interface GameItem {
  id: 'solitaire' | 'soccer' | 'kart' | 'minesweeper' | 'pinball' | 'snake';
  title: string;
  category: string;
  categoryBadge: string;
  description: string;
  icon: string;
  gradient: string;
}

const SPACE_GAMES: GameItem[] = [
  {
    id: 'solitaire',
    title: 'SOLITAIRE NEBULA',
    category: 'Cartas & Estratégia',
    categoryBadge: 'ESTRATÉGIA',
    description: 'Paciência Klondike em ambiente digital com descarte quântico e movimentação suave.',
    icon: '♠️',
    gradient: 'from-blue-600 to-cyan-600'
  },
  {
    id: 'snake',
    title: 'COSMIC SNAKE 2026',
    category: 'Arcade Cósmico',
    categoryBadge: 'ARCADE',
    description: 'A clássica serpente em modo aceleração cósmica, coletando orbes de energia.',
    icon: '🐍',
    gradient: 'from-emerald-500 to-cyan-600'
  },
  {
    id: 'minesweeper',
    title: 'MINESWEEPER QUANTUM',
    category: 'Raciocínio & Dedução',
    categoryBadge: 'DEDUÇÃO',
    description: 'Desarme campos de minas quânticas com contadores digitais e grade responsiva.',
    icon: '💣',
    gradient: 'from-purple-600 to-blue-700'
  },
  {
    id: 'soccer',
    title: 'CYBER SOCCER STRIKER',
    category: 'Esporte Futurista',
    categoryBadge: 'ESPORTE',
    description: 'Cobranças de falta e pênaltis com mira holográfica e cálculo de trajetória.',
    icon: '⚽',
    gradient: 'from-cyan-500 to-blue-800'
  },
  {
    id: 'kart',
    title: 'SPACE RACER 3D',
    category: 'Velocidade & Reflexo',
    categoryBadge: 'CORRIDA',
    description: 'Corrida em túneis espaciais e curvas pseudo-3D com turbos de fótons.',
    icon: '🏎️',
    gradient: 'from-amber-500 to-red-600'
  },
  {
    id: 'pinball',
    title: 'SPACE CADET PINBALL',
    category: 'Física & Arcade',
    categoryBadge: 'PINBALL',
    description: 'O lendário fliperama espacial com bumpers holográficos e pontuação quântica.',
    icon: '🚀',
    gradient: 'from-pink-600 to-purple-800'
  }
];

export const SpaceGamesApp: React.FC = () => {
  const [selectedGameId, setSelectedGameId] = useState<GameId>(null);

  const activeGame = SPACE_GAMES.find((g) => g.id === selectedGameId);

  const handleLaunchGame = (id: GameItem['id']) => {
    try { soundFx.playClick(); } catch (e) {}
    setSelectedGameId(id);
  };

  const handleBackToArcade = () => {
    try { soundFx.playClick(); } catch (e) {}
    setSelectedGameId(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 select-none font-sans text-slate-100 animate-fadeIn">
      {/* Active Game Mode */}
      {selectedGameId ? (
        <div className="space-y-4">
          {/* Game Titlebar HUD */}
          <div className="p-3.5 rounded-2xl bg-black/80 border border-cyan-500/30 flex items-center justify-between backdrop-blur-xl">
            <button
              onClick={handleBackToArcade}
              className="px-3 py-1.5 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-cyan-400/40 text-cyan-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Game Center</span>
            </button>

            <div className="flex items-center gap-2 font-mono">
              <span className="text-base">{activeGame?.icon}</span>
              <span className="text-xs font-bold text-white">{activeGame?.title}</span>
            </div>
          </div>

          {/* Render Game Inside Glass Container */}
          <div className="p-4 rounded-2xl bg-black/90 border border-cyan-500/20 backdrop-blur-xl shadow-2xl flex items-center justify-center min-h-[420px]">
            {selectedGameId === 'solitaire' && <SolitaireGame />}
            {selectedGameId === 'soccer' && <SoccerGame />}
            {selectedGameId === 'kart' && <KartGame />}
            {selectedGameId === 'minesweeper' && <MinesweeperGame />}
            {selectedGameId === 'pinball' && <PinballGame />}
            {selectedGameId === 'snake' && <SnakeGame />}
          </div>
        </div>
      ) : (
        /* Arcade Games Selection Hub */
        <div className="space-y-6">
          {/* 2026 Futuristic Header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-cyan-950/70 border border-cyan-500/30 p-6 backdrop-blur-xl shadow-[0_0_40px_rgba(6,182,212,0.15)]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold font-mono text-white">SPACE ARCADE CENTER 2026</h1>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                      INTERACTIVE GAMES
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    Seleção de Clássicos Recriados com Visual Deep Blue Space & Física Aprimorada
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SPACE_GAMES.map((game) => (
              <div
                key={game.id}
                onClick={() => handleLaunchGame(game.id)}
                className="p-4 rounded-2xl bg-black/75 hover:bg-blue-950/80 border border-cyan-950/90 hover:border-cyan-400 transition-all duration-300 cursor-pointer flex flex-col justify-between group backdrop-blur-xl shadow-[0_0_15px_rgba(0,10,30,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-900 to-cyan-500 flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform">
                      {game.icon}
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-blue-950 text-cyan-300 border border-cyan-700/60 font-bold">
                      {game.categoryBadge}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-white font-mono group-hover:text-cyan-300 transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {game.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-cyan-950/80 flex items-center justify-between text-xs font-mono text-cyan-400 group-hover:text-cyan-200">
                  <span>Jogar Agora</span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
