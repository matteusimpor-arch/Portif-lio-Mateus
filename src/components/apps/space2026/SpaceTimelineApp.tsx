import React, { useState } from 'react';
import {
  GitBranch,
  Calendar,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Layers,
  Award,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { SYSTEM_HISTORY_EVENTS } from '../../../data/portfolioData';
import { soundFx } from '../../../utils/soundEffects';

export const SpaceTimelineApp: React.FC = () => {
  const [activeNodeIdx, setActiveNodeIdx] = useState<number>(0);

  const activeEvent = SYSTEM_HISTORY_EVENTS[activeNodeIdx] || SYSTEM_HISTORY_EVENTS[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6 select-none font-sans text-slate-100 animate-fadeIn">
      {/* 2026 Header HUD */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-cyan-950/70 border border-cyan-500/30 p-6 backdrop-blur-xl shadow-[0_0_40px_rgba(6,182,212,0.15)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(6,182,212,0.5)]">
              <GitBranch className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-mono text-white">TIMELINE ORBITAL 2026</h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  CHRONOLOGICAL TELEMETRY
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Marcos Reais de Carreira • 2019 até 2026 • Brasília, DF
              </p>
            </div>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-blue-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>6 NÓS TEMPORAIS REGISTRADOS</span>
          </div>
        </div>
      </div>

      {/* Orbital Nodes Horizon (Responsive Grid/Horizontal Track) */}
      <div className="p-4 rounded-2xl bg-black/75 border border-cyan-500/30 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.15)] space-y-4">
        <div className="text-xs font-mono text-cyan-400 flex items-center justify-between">
          <span>TRAJETÓRIA TEMPORAL</span>
          <span className="text-slate-400">Clique em um nó para visualizar detalhes</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {SYSTEM_HISTORY_EVENTS.map((event, idx) => {
            const isSelected = activeNodeIdx === idx;
            return (
              <button
                key={idx}
                onClick={() => {
                  try { soundFx.playClick(); } catch (e) {}
                  setActiveNodeIdx(idx);
                }}
                className={`p-3 rounded-xl border transition-all text-left cursor-pointer flex flex-col justify-between min-h-[90px] ${
                  isSelected
                    ? 'bg-blue-900/90 border-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.5)] scale-[1.02]'
                    : 'bg-black/50 border-cyan-950 hover:border-cyan-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-cyan-300 font-bold">{event.tag}</span>
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-cyan-400 animate-ping' : 'bg-slate-700'}`} />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-white mt-1">{event.year}</div>
                  <div className="text-[10px] text-slate-300 truncate mt-0.5">{event.category}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Node Detail Card */}
      {activeEvent && (
        <div className="p-6 rounded-2xl bg-black/80 border border-cyan-500/40 backdrop-blur-xl shadow-[0_0_35px_rgba(6,182,212,0.2)] space-y-5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-cyan-900/50">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  {activeEvent.category}
                </span>
                <span className="text-xs font-mono text-amber-300 font-bold">
                  MARCO // {activeEvent.year}
                </span>
              </div>
              <h2 className="text-lg font-bold font-mono text-white mt-1">{activeEvent.title}</h2>
            </div>
            <div className="text-xs font-mono text-cyan-300 bg-blue-950/80 px-3 py-1.5 rounded-xl border border-cyan-600/40 w-fit">
              REGISTRO: {activeEvent.tag}
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed bg-blue-950/30 p-4 rounded-xl border border-cyan-950">
            {activeEvent.description}
          </p>

          {activeEvent.details && (
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                Destaques & Entregas Chave
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeEvent.details.map((item, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-black/60 border border-cyan-950 flex items-start gap-2.5 text-xs text-slate-300"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
