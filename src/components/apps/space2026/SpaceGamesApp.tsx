import React, { useState } from 'react';
import { Gamepad2, Sparkles, Trophy, ArrowLeft, Play, Bomb, Rocket, Shield, Zap, ChevronRight } from 'lucide-react';
import { soundFx } from '../../../utils/soundEffects';

import { SolitaireGame } from '../../games/SolitaireGame';
import { SoccerGame } from '../../games/SoccerGame';
import { KartGame } from '../../games/KartGame';
import { MinesweeperGame } from '../../games/MinesweeperGame';
import { PinballGame } from '../../games/PinballGame';
import { SnakeGame } from '../../games/SnakeGame';
import { PongGame } from '../../games/PongGame';
import { BrickBreakerGame } from '../../games/BrickBreakerGame';
import { AsteroidDefenseGame } from '../../games/AsteroidDefenseGame';

export type GameId =
  | 'solitaire'
  | 'snake'
  | 'minesweeper'
  | 'pinball'
  | 'soccer'
  | 'kart'
  | 'pong'
  | 'brickbreaker'
  | 'asteroid'
  | null;

interface GameItem {
  id: 'solitaire' | 'snake' | 'minesweeper' | 'pinball' | 'soccer' | 'kart' | 'pong' | 'brickbreaker' | 'asteroid';
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
    gradient: 'from-blue-600 to-cyan-600',
  },
  {
    id: 'snake',
    title: 'COSMIC SNAKE',
    category: 'Arcade Espacial',
    categoryBadge: 'ARCADE',
    description: 'Serpente luminosa com grade digital, núcleos de energia quântica e rastro de luz suave.',
    icon: '🐍',
    gradient: 'from-emerald-500 to-cyan-600',
  },
  {
    id: 'minesweeper',
    title: 'MINESWEEPER // 2026',
    category: 'Raciocínio Quântico',
    categoryBadge: 'DEDUÇÃO',
    description: 'Desarme campos de minas com estética quântica, seleções Fácil/Médio/Difícil e contadores digitais.',
    icon: '💣',
    gradient: 'from-purple-600 to-blue-700',
  },
  {
    id: 'pinball',
    title: 'NEON PINBALL',
    category: 'Física & Gravidade',
    categoryBadge: 'FLIPERAMA',
    description: 'Mesa espacial de alta velocidade com bumpers holográficos, física precisa e efeitos de impacto.',
    icon: '🚀',
    gradient: 'from-pink-600 to-purple-800',
  },
  {
    id: 'soccer',
    title: 'CYBER SOCCER 2026',
    category: 'Esporte Cibernético',
    categoryBadge: 'ESPORTE',
    description: 'Partida real com gramado digital holográfico, goleiro inteligente que acompanha a bola e IA adversária.',
    icon: '⚽',
    gradient: 'from-cyan-500 to-blue-800',
  },
  {
    id: 'kart',
    title: 'SPACE KART GRAND PRIX',
    category: 'Velocidade & Reflexo',
    categoryBadge: 'CORRIDA',
    description: 'Grande Prêmio de 3 voltas com 8 pilotos no grid, largada 3-2-1-GO, telemetria e sistema de respawn.',
    icon: '🏎️',
    gradient: 'from-amber-500 to-red-600',
  },
  {
    id: 'pong',
    title: 'LASER PONG 2026',
    category: 'Arcade Cibernético',
    categoryBadge: 'DUELO',
    description: 'Duelo 1x1 em alta velocidade até 7 pontos com laser trails, física de impacto e CPU reativa.',
    icon: '🏓',
    gradient: 'from-teal-500 to-emerald-700',
  },
  {
    id: 'brickbreaker',
    title: 'QUANTUM BREAKOUT',
    category: 'Destruição de Partículas',
    categoryBadge: 'ARCADE',
    description: 'Desintegre matrizes quânticas ao longo de 3 fases com power-ups de expansão de campo e desaceleração.',
    icon: '🧱',
    gradient: 'from-sky-500 to-indigo-700',
  },
  {
    id: 'asteroid',
    title: 'COSMIC DEFENDER',
    category: 'Sobrevivência Orbital',
    categoryBadge: 'COMBATE',
    description: 'Pilote um interceptador estelar com impulso inercial e canhões de fótons contra chuvas de meteoros.',
    icon: '🌌',
    gradient: 'from-violet-600 to-rose-700',
  },
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
            {selectedGameId === 'pong' && <PongGame onBackToHub={handleBackToArcade} mode="space" />}
            {selectedGameId === 'brickbreaker' && <BrickBreakerGame onBackToHub={handleBackToArcade} mode="space" />}
            {selectedGameId === 'asteroid' && <AsteroidDefenseGame onBackToHub={handleBackToArcade} mode="space" />}
          </div>
        </div>
      ) : (
        /* Arcade Game Hub (Grid of 9 Games) */
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
                  Game Center com 9 títulos completos, simulações em tempo real e controles responsivos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>9 JOGOS DISPONÍVEIS</span>
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
                {/* Header with Icon & Category */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl p-2 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                        {game.icon}
                      </div>
                      <div>
                        <h3 className="font-mono font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                          {game.title}
                        </h3>
                        <span className="text-[10px] font-mono text-slate-400">{game.category}</span>
                      </div>
                    </div>

                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                      {game.categoryBadge}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300/90 leading-relaxed mb-4">
                    {game.description}
                  </p>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-cyan-400/80">
                    SESSÃO ATIVA
                  </span>
                  <div className="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-mono font-bold text-xs flex items-center gap-1 shadow-md transition">
                    <span>JOGAR</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
