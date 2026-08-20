import React, { useState } from 'react';
import {
  Cpu,
  Boxes,
  Code2,
  Sparkles,
  ShieldCheck,
  Search,
  CheckCircle2,
  Sliders,
  Terminal,
  Zap,
  TrendingUp
} from 'lucide-react';
import { SKILLS_DATA } from '../../../data/portfolioData';
import { soundFx } from '../../../utils/soundEffects';

export const SpaceSkillsApp: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const categories = [
    { id: 'all', label: 'Todas as Competências', count: SKILLS_DATA.reduce((acc, c) => acc + c.skills.length, 0) },
    ...SKILLS_DATA.map(c => ({ id: c.category, label: c.category, count: c.skills.length }))
  ];

  const filteredCategories = SKILLS_DATA.filter(cat => {
    if (selectedCategory !== 'all' && cat.category !== selectedCategory) return false;
    return true;
  }).map(cat => {
    return {
      ...cat,
      skills: cat.skills.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    };
  }).filter(cat => cat.skills.length > 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6 select-none font-sans text-slate-100 animate-fadeIn">
      {/* 2026 Futuristic Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-cyan-950/70 border border-cyan-500/30 p-6 backdrop-blur-xl shadow-[0_0_40px_rgba(6,182,212,0.15)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-[0_0_20px_rgba(56,189,248,0.4)]">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-mono text-white">MATRIZ DE COMPETÊNCIAS 2026</h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  SYSTEM CORE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Logística Avançada • Supply Chain • Engenharia de Prompt • Automações Digitais
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-cyan-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar competência..."
              className="w-full bg-black/60 text-xs pl-9 pr-3 py-2 rounded-xl border border-cyan-900/60 focus:outline-hidden focus:border-cyan-400 font-mono text-white placeholder-slate-500 backdrop-blur-md"
            />
          </div>
        </div>

        {/* 4 Pillars of Excellence */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-cyan-500/20">
          {[
            { title: 'Logística & Supply Chain', level: 'Especialista', icon: Boxes, desc: 'WMS, TMS, Gestão de Estoques e Distribuição' },
            { title: 'Engenharia de Prompt & IA', level: 'Avançado', icon: Sparkles, desc: 'Orquestração de LLMs, System Prompts e Automação' },
            { title: 'Gestão Pública & Licitações', level: 'Pós-Graduado', icon: ShieldCheck, desc: 'Governança, Conformidade e Processos Licitatórios' },
            { title: 'Tecnologia & Desenvolvimento', level: 'Contínuo', icon: Code2, desc: 'React, TypeScript, Automações e Soluções Digitais' }
          ].map((pillar, i) => {
            const PIcon = pillar.icon;
            return (
              <div key={i} className="p-3 rounded-xl bg-black/40 border border-cyan-900/40 space-y-1">
                <div className="flex items-center justify-between">
                  <PIcon className="w-4 h-4 text-cyan-400" />
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {pillar.level}
                  </span>
                </div>
                <div className="text-xs font-bold font-mono text-white pt-1">{pillar.title}</div>
                <p className="text-[11px] text-slate-400 leading-snug">{pillar.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-cyan-900/50 backdrop-blur-md overflow-x-auto">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                try { soundFx.playClick(); } catch (e) {}
                setSelectedCategory(cat.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <span>{cat.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCategories.map((cat, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/20 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-900/50 pb-2">
              <h3 className="text-xs font-bold font-mono text-cyan-300 uppercase flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>{cat.category}</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                {cat.skills.length} itens listados
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {cat.skills.map((skill, sIdx) => (
                <div
                  key={sIdx}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-cyan-900/40 hover:border-cyan-500/50 transition group"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300 shrink-0" />
                  <span className="text-xs font-mono text-slate-200 group-hover:text-white truncate">
                    {skill}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
