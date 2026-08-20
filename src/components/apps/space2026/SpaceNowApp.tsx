import React from 'react';
import { Clock, BookOpen, Hammer, Sparkles, Target, Compass, CheckCircle2, Zap, Activity, Flame, Layers, Palette } from 'lucide-react';
import { CURRENTLY_NOW_DATA } from '../../../data/portfolioData';

export const SpaceNowApp: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6 select-none font-sans text-slate-100 animate-fadeIn">
      {/* 2026 Futuristic Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-cyan-950/70 border border-cyan-500/30 p-6 backdrop-blur-xl shadow-[0_0_40px_rgba(6,182,212,0.15)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(6,182,212,0.5)]">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-mono text-white">LIVE STATUS • AGORA 2026</h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  REAL-TIME TELEMETRY
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Projetos Ativos • Foco de Pesquisa • Metas Estratégicas
              </p>
            </div>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-blue-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ano Atual: 2026 • Brasília, DF</span>
          </div>
        </div>
      </div>

      {/* Grid of Live Activity HUD Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Estudos e Pesquisa */}
        <div className="p-5 rounded-2xl bg-black/75 border border-cyan-950 hover:border-cyan-600/60 transition backdrop-blur-xl shadow-[0_0_25px_rgba(0,10,30,0.5)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-900/40">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                01. Linhas de Pesquisa & Estudos
              </h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800">
              EM ANDAMENTO
            </span>
          </div>
          <div className="space-y-2.5">
            {CURRENTLY_NOW_DATA.studying.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-blue-950/40 border border-cyan-900/40 flex items-start gap-2.5 text-xs text-slate-300"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Construção e Projetos Ativos */}
        <div className="p-5 rounded-2xl bg-black/75 border border-cyan-950 hover:border-cyan-600/60 transition backdrop-blur-xl shadow-[0_0_25px_rgba(0,10,30,0.5)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-900/40">
            <div className="flex items-center gap-2">
              <Hammer className="w-4 h-4 text-emerald-400" />
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                02. Construindo & Desenvolvendo
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800">
              ATIVO
            </span>
          </div>
          <div className="space-y-2.5">
            {CURRENTLY_NOW_DATA.building.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 flex items-start gap-2.5 text-xs text-slate-300"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Metas & Objetivos 2026 */}
        <div className="p-5 rounded-2xl bg-black/75 border border-cyan-950 hover:border-cyan-600/60 transition backdrop-blur-xl shadow-[0_0_25px_rgba(0,10,30,0.5)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-900/40">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                03. Metas Estratégicas 2026
              </h3>
            </div>
            <span className="text-[10px] font-mono text-purple-400 px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800">
              TARGET
            </span>
          </div>
          <div className="space-y-2.5">
            {CURRENTLY_NOW_DATA.goals2026.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-purple-950/20 border border-purple-900/40 flex items-start gap-2.5 text-xs text-slate-300"
              >
                <Flame className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Aprendizado e Design */}
        <div className="p-5 rounded-2xl bg-black/75 border border-cyan-950 hover:border-cyan-600/60 transition backdrop-blur-xl shadow-[0_0_25px_rgba(0,10,30,0.5)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-900/40">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-400" />
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                04. Aprendizado & Modelagem
              </h3>
            </div>
            <span className="text-[10px] font-mono text-amber-400 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800">
              EXPLORANDO
            </span>
          </div>
          <div className="space-y-2.5">
            {CURRENTLY_NOW_DATA.learning.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 flex items-start gap-2.5 text-xs text-slate-300"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
