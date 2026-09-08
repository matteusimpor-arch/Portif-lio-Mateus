import React from 'react';
import {
  Clock,
  BookOpen,
  Hammer,
  Sparkles,
  Target,
  CheckCircle2,
  Zap,
  Activity,
  Briefcase,
  Compass,
  ArrowRight
} from 'lucide-react';
import { CURRENT_MISSION_DATA, CURRENTLY_NOW_DATA } from '../../../data/portfolioData';

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
                <h1 className="text-xl font-bold font-mono text-white">MISSÃO ATUAL // CURRENT MISSION 2026</h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  TELEMETRIA EM TEMPO REAL
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Atividades Operacionais • Foco de Pesquisa • Metas Estratégicas
              </p>
            </div>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-blue-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ano Base: {CURRENT_MISSION_DATA.updatedAt} • {CURRENT_MISSION_DATA.location}</span>
          </div>
        </div>
      </div>

      {/* Professional Focus Banner */}
      <div className="p-4 rounded-2xl bg-blue-950/40 border border-cyan-500/30 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Compass className="w-5 h-5 text-cyan-400 shrink-0" />
          <div>
            <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
              FOCO PROFISSIONAL ATUAL
            </div>
            <div className="text-xs font-mono font-bold text-white mt-0.5">
              {CURRENT_MISSION_DATA.professionalFocus}
            </div>
          </div>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-700/60 shrink-0">
          STATUS: ATIVO
        </span>
      </div>

      {/* 4 Primary Mission Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. O que estou fazendo (Atividades) */}
        <div className="p-5 rounded-2xl bg-black/75 border border-cyan-950 hover:border-cyan-600/60 transition backdrop-blur-xl shadow-[0_0_25px_rgba(0,10,30,0.5)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-900/40">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-cyan-400" />
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                01. O que estou fazendo
              </h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800">
              ROTINAS
            </span>
          </div>
          <div className="space-y-2.5">
            {CURRENT_MISSION_DATA.activities.map((item, idx) => (
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

        {/* 2. O que estou estudando (Estudos & Pesquisa) */}
        <div className="p-5 rounded-2xl bg-black/75 border border-cyan-950 hover:border-cyan-600/60 transition backdrop-blur-xl shadow-[0_0_25px_rgba(0,10,30,0.5)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-900/40">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-400" />
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                02. O que estou estudando
              </h3>
            </div>
            <span className="text-[10px] font-mono text-purple-400 px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800">
              PESQUISA
            </span>
          </div>
          <div className="space-y-2.5">
            {CURRENT_MISSION_DATA.studies.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-purple-950/20 border border-purple-900/40 flex items-start gap-2.5 text-xs text-slate-300"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Projetos atuais (Construindo) */}
        <div className="p-5 rounded-2xl bg-black/75 border border-cyan-950 hover:border-cyan-600/60 transition backdrop-blur-xl shadow-[0_0_25px_rgba(0,10,30,0.5)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-900/40">
            <div className="flex items-center gap-2">
              <Hammer className="w-4 h-4 text-emerald-400" />
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                03. Projetos Atuais em Construção
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800">
              DESENVOLVIMENTO
            </span>
          </div>
          <div className="space-y-2.5">
            {CURRENT_MISSION_DATA.projects.map((item, idx) => (
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

        {/* 4. Metas Estratégicas 2026 */}
        <div className="p-5 rounded-2xl bg-black/75 border border-cyan-950 hover:border-cyan-600/60 transition backdrop-blur-xl shadow-[0_0_25px_rgba(0,10,30,0.5)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-900/40">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                04. Metas Estratégicas 2026
              </h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800">
              TARGET
            </span>
          </div>
          <div className="space-y-2.5">
            {CURRENT_MISSION_DATA.goals.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-blue-950/30 border border-cyan-950 flex items-start gap-2.5 text-xs text-slate-300"
              >
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

