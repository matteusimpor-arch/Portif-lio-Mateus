import React, { useState } from 'react';
import { Gamepad2, Sparkles, Trophy, ArrowLeft, Play, Bomb, Rocket, Shield, Zap, ChevronRight } from 'lucide-react';
import { soundFx } from '../../../utils/soundEffects';

import { SolitaireGame } from '../../games/SolitaireGame';
import { SoccerGame } from '../../games/SoccerGame';
import { KartGame } from '../../games/KartGame';
import { MinesweeperGame } from '../../games/MinesweeperGame';
import { PinballGame } from '../../games/PinballGame';
import { SnakeGame } from '../../games/SnakeGame';

export type GameId = 'solitaire' | 'snake' | 'minesweeper' | 'pinball' | 'soccer' | 'kart' | null;

interface GameItem {
  id: 'solitaire' | 'snake' | 'minesweeper' | 'pinball' | 'soccer' | 'kart';
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
    title: 'PACIÊNCIA NEBULA',
    category: 'Cartas & Estratégia',
    categoryBadge: 'ESTRATÉGIA',
    description: 'Paciência Klondike em ambiente cósmico com baralho holográfico, drag-and-drop e HUD futurista.',
    icon: '♠️',
    gradient: 'from-blue-600 to-cyan-600'
  },
  {
    id: 'snake',
    title: 'COSMIC SNAKE',
    category: 'Arcade Espacial',
    categoryBadge: 'ARCADE',
    description: 'Serpente luminosa com grade digital, núcleos de energia quântica e rastro de luz suave.',
    icon: '🐍',
    gradient: 'from-emerald-500 to-cyan-600'
  },
  {
    id: 'minesweeper',
    title: 'MINESWEEPER // 2026',
    category: 'Raciocínio Quântico',
    categoryBadge: 'DEDUÇÃO',
    description: 'Desarme campos de minas com estética quântica, seleções Fácil/Médio/Difícil e contadores digitais.',
    icon: '💣',
    gradient: 'from-purple-600 to-blue-700'
  },
  {
    id: 'pinball',
    title: 'NEON PINBALL',
    category: 'Física & Metal',
    categoryBadge: 'FLIPERAMA',
    description: 'Mesa espacial de alta velocidade com bumpers holográficos, física precisa e efeitos de impacto.',
    icon: '🚀',
    gradient: 'from-pink-600 to-purple-800'
  },
  {
    id: 'soccer',
    title: 'FUTEBOL 2026',
    category: 'Esporte Cibernético',
    categoryBadge: 'ESPORTE',
    description: 'Gramado digital holográfico, goleiro inteligente e cálculo de curva de trajetória.',
    icon: '⚽',
    gradient: 'from-cyan-500 to-blue-800'
  },
  {
    id: 'kart',
    title: 'MARIO KART',
    category: 'Velocidade & Reflexo',
    categoryBadge: 'CORRIDA',
    description: 'Circuito espacial pseudo-3D com pilotos lendários, turbos de fótons e velocímetro digital.',
    icon: '🏎️',
    gradient: 'from-amber-500 to-red-600'
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
              <span>← VOLTAR AO SPACE ARCADE</span>
            </button>

            <div className="flex items-center gap-2 font-mono">
              <span className="text-base">{activeGame?.icon}</span>
              <span className="text-xs font-bold text-white tracking-wide">{activeGame?.title}</span>
            </div>
          </div>

          {/* Render Game Inside Glass Container */}
          <div className="p-4 rounded-2xl bg-black/90 border border-cyan-500/20 backdrop-blur-xl shadow-2xl flex items-center justify-center min-h-[440px]">
            {selectedGameId === 'solitaire' && <SolitaireGame onBackToHub={handleBackToArcade} mode="space" />}
            {selectedGameId === 'snake' && <SnakeGame onBackToHub={handleBackToArcade} mode="space" />}
            {selectedGameId === 'minesweeper' && <MinesweeperGame onBackToHub={handleBackToArcade} mode="space" />}
            {selectedGameId === 'pinball' && <PinballGame onBackToHub={handleBackToArcade} mode="space" />}
            {selectedGameId === 'soccer' && <SoccerGame onBackToHub={handleBackToArcade} mode="space" />}
            {selectedGameId === 'kart' && <KartGame onBackToHub={handleBackToArcade} mode="space" />}
          </div>
        </div>
      ) : (
        /* Arcade Game Hub (Grid of 6 Games) */
        <div className="space-y-6">
          {/* Top Banner */}
          <div className="p-6 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-[0_0_25px_rgba(6,182,212,0.5)]">
                <Gamepad2 className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-mono text-white tracking-wide">
                  SPACE ARCADE // 2026
                </h1>
                <p className="text-xs text-slate-400 font-mono">
                  Game Center com versões visuais futuristas dos clássicos interativos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>6 TÍTULOS DISPONÍVEIS</span>
            </div>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SPACE_GAMES.map((game) => (
              <div
                key={game.id}
                onClick={() => handleLaunchGame(game.id)}
                className="group relative p-5 rounded-2xl bg-black/40 hover:bg-slate-900/60 border border-white/10 hover:border-cyan-400/60 backdrop-blur-xl transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.25)] hover:-translate-y-1"
              >
                {/* Background ambient glow on hover */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${game.gradient} opacity-10 group-hover:opacity-20 blur-2xl transition-opacity rounded-full`} />

                <div>
                  {/* Top line badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl p-2.5 rounded-xl bg-slate-900/80 border border-white/10 group-hover:scale-110 transition-transform">
                      {game.icon}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 font-bold">
                      {game.categoryBadge}
                    </span>
                  </div>

                  {/* Title & category */}
                  <h3 className="text-base font-bold font-mono text-white group-hover:text-cyan-300 transition-colors">
                    {game.title}
                  </h3>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">{game.category}</div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {game.description}
                  </p>
                </div>

                {/* Launch Button */}
                <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-cyan-400 group-hover:text-white transition-colors">
                  <span className="font-bold flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>JOGAR AGORA</span>
                  </span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
