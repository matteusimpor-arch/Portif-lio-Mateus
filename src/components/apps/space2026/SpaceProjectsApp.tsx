import React, { useState } from 'react';
import {
  FolderGit2,
  ExternalLink,
  Github,
  Layers,
  Sparkles,
  CheckCircle2,
  Code2,
  Cpu,
  Monitor,
  Zap,
  ChevronRight
} from 'lucide-react';
import { PROJECTS_DATA, PROFILE_DATA } from '../../../data/portfolioData';
import { soundFx } from '../../../utils/soundEffects';

export const SpaceProjectsApp: React.FC = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(PROJECTS_DATA[0]?.id || 'proj-mateus-os');

  const currentProject = PROJECTS_DATA.find((p) => p.id === selectedProjectId) || PROJECTS_DATA[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6 select-none font-sans text-slate-100 animate-fadeIn">
      {/* 2026 Futuristic Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-cyan-950/70 border border-cyan-500/30 p-6 backdrop-blur-xl shadow-[0_0_40px_rgba(6,182,212,0.15)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(6,182,212,0.5)]">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-mono text-white">PROJECT EXPLORER 2026</h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  SYSTEM ARCHITECTURE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Portfólio de Aplicações • Engenharia Front-end • Simulações Interativas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={PROFILE_DATA.github}
              target="_blank"
              rel="noreferrer"
              onClick={() => { try { soundFx.playClick(); } catch (e) {} }}
              className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 text-xs font-mono font-semibold flex items-center gap-1.5 transition shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Ver GitHub Geral</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Project Explorer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Project Selector List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-2 px-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Módulos de Projeto ({PROJECTS_DATA.length})</span>
          </div>

          {PROJECTS_DATA.map((proj) => {
            const isSelected = proj.id === selectedProjectId;
            return (
              <div
                key={proj.id}
                onClick={() => {
                  try { soundFx.playClick(); } catch (e) {}
                  setSelectedProjectId(proj.id);
                }}
                className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer text-left relative overflow-hidden backdrop-blur-md ${
                  isSelected
                    ? 'bg-blue-950/90 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)]'
                    : 'bg-black/60 border-cyan-950/80 hover:border-cyan-700/80 text-slate-300'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-blue-600" />
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                    {proj.category}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    {proj.status}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-white font-mono mt-2">{proj.name}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">{proj.tagline}</p>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-cyan-950/80 text-[11px] font-mono text-cyan-400">
                  <span>Ver Detalhes HUD</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Detailed Project Viewer (HUD Glass Card) */}
        {currentProject && (
          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 rounded-2xl bg-black/75 border border-cyan-500/30 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.15)] space-y-6">
              {/* Project Title and Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyan-900/50">
                <div>
                  <span className="text-[11px] font-mono text-cyan-400 font-bold tracking-wider">
                    {currentProject.category} • STATUS 2026
                  </span>
                  <h2 className="text-xl font-bold font-mono text-white mt-0.5">
                    {currentProject.name}
                  </h2>
                  <p className="text-xs text-cyan-200 mt-1">{currentProject.tagline}</p>
                </div>

                <div className="flex items-center gap-2">
                  {currentProject.github && (
                    <a
                      href={currentProject.github}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => { try { soundFx.playClick(); } catch (e) {} }}
                      className="px-3 py-1.5 rounded-lg bg-blue-900/60 hover:bg-blue-800 border border-cyan-500/40 text-cyan-200 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>Repositório</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Description & Objective */}
              <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                <div>
                  <h4 className="font-mono text-cyan-300 font-bold mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Visão Geral do Projeto</span>
                  </h4>
                  <p className="bg-blue-950/40 p-3.5 rounded-xl border border-cyan-900/40">
                    {currentProject.description}
                  </p>
                </div>

                {currentProject.objective && (
                  <div>
                    <h4 className="font-mono text-cyan-300 font-bold mb-1 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Objetivo Arquitetural</span>
                    </h4>
                    <p className="bg-black/50 p-3.5 rounded-xl border border-cyan-950/60 text-slate-300">
                      {currentProject.objective}
                    </p>
                  </div>
                )}
              </div>

              {/* Tech Stack Chips */}
              <div>
                <h4 className="font-mono text-cyan-300 font-bold mb-2 flex items-center gap-1.5 text-xs">
                  <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Stack Tecnológica</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {currentProject.technologies.map((tech, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-blue-950/80 text-cyan-300 font-mono text-[11px] font-semibold border border-cyan-600/40 shadow-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Key Features List */}
              {currentProject.features && currentProject.features.length > 0 && (
                <div>
                  <h4 className="font-mono text-cyan-300 font-bold mb-2 flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Funcionalidades & Destaques de Engenharia</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentProject.features.map((feat, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-slate-950/70 border border-cyan-950/80 flex items-start gap-2 text-[11px] text-slate-300"
                      >
                        <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
