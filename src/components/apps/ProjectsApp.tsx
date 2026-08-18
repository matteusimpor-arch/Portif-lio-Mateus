import React, { useState } from 'react';
import { Folder, ExternalLink, Github, Sparkles, Filter, CheckCircle2, ArrowUpRight, Search, X } from 'lucide-react';
import { PROJECTS_DATA } from '../../data/portfolioData';
import { Project } from '../../types';
import { soundFx } from '../../utils/soundEffects';

export const ProjectsApp: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeProjectModal, setActiveProjectModal] = useState<Project | null>(null);

  const categories = ['Todos', 'IA', 'Aplicativos', 'Automação', 'Educação', 'Gestão', 'Logística'];

  const filteredProjects = PROJECTS_DATA.filter((proj) => {
    const matchesCategory = selectedCategory === 'Todos' || proj.category === selectedCategory;
    const matchesSearch = 
      proj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.technologies.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const openModal = (proj: Project) => {
    soundFx.playClick();
    setActiveProjectModal(proj);
  };

  const closeModal = () => {
    soundFx.playClick();
    setActiveProjectModal(null);
  };

  return (
    <div className="space-y-6 font-sans-ui text-slate-200">
      {/* File Manager Directory Header */}
      <div className="bg-[#c0c0c0] p-2 border-2 border-white border-r-gray-800 border-b-gray-800 text-gray-900 flex items-center justify-between gap-3 shadow font-mono">
        <div className="flex items-center gap-2 text-xs font-bold truncate">
          <span className="bg-[#000080] text-white px-2 py-0.5 rounded-xs">DIR</span>
          <span className="text-blue-900">C:\MATEUS\PROJECTS\</span>
        </div>
        <div className="text-[10px] text-gray-700 hidden sm:block">
          52 FILE(S) • 12.8 MB FREE
        </div>
      </div>

      {/* App Banner */}
      <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-950 border border-emerald-800 rounded-lg text-emerald-400">
            <Folder className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-vt323 text-2xl">PORTFÓLIO DE PROJETOS</h1>
            <p className="text-xs text-slate-400">Soluções em Inteligência Artificial, Logística, Automação e Gestão</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar projetos..."
            className="w-full bg-slate-950 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              soundFx.playClick();
              setSelectedCategory(cat);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono-code whitespace-nowrap transition cursor-pointer border ${
              selectedCategory === cat
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-sm'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((proj) => (
          <div
            key={proj.id}
            onClick={() => openModal(proj)}
            className="bg-slate-900/80 rounded-xl border border-slate-800 hover:border-emerald-500/60 transition-all duration-200 shadow-lg flex flex-col justify-between overflow-hidden group cursor-pointer"
          >
            {/* Image Banner */}
            <div className="relative h-40 overflow-hidden bg-slate-950">
              <img
                src={proj.image}
                alt={proj.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="bg-emerald-950/90 text-emerald-300 border border-emerald-800 text-[10px] font-mono-code font-bold px-2 py-0.5 rounded backdrop-blur">
                  {proj.category}
                </span>
                {proj.status === 'Destaque' && (
                  <span className="bg-amber-500 text-slate-950 text-[10px] font-sans-ui font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Destaque
                  </span>
                )}
              </div>
            </div>

            {/* Body Info */}
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h2 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {proj.name}
                </h2>
                <p className="text-xs text-emerald-400 font-mono-code mt-0.5">{proj.tagline}</p>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {proj.description}
                </p>
              </div>

              {/* Technologies */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <div className="flex flex-wrap gap-1">
                  {proj.technologies.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="bg-slate-950 text-slate-400 text-[10px] font-mono-code px-2 py-0.5 rounded border border-slate-800"
                    >
                      {tech}
                    </span>
                  ))}
                  {proj.technologies.length > 4 && (
                    <span className="text-[10px] text-slate-500 font-mono-code">+{proj.technologies.length - 4}</span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-emerald-400 font-mono-code pt-1">
                  <span>Ver Detalhes do Projeto</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {activeProjectModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-emerald-500/80 rounded-xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-mono-code px-2.5 py-0.5 rounded font-bold">
                {activeProjectModal.category}
              </span>
              <span className="text-xs text-slate-400 font-mono-code">Status: {activeProjectModal.status}</span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white font-vt323 tracking-wide">{activeProjectModal.name}</h2>
              <p className="text-sm text-emerald-400 font-mono-code">{activeProjectModal.tagline}</p>
            </div>

            <div className="space-y-2 bg-slate-950 p-4 rounded-lg border border-slate-800">
              <h3 className="text-xs font-bold text-amber-400 font-mono-code uppercase">OBJETIVO DO PROJETO:</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{activeProjectModal.objective}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 font-mono-code uppercase">DESCRIÇÃO DETALHADA:</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{activeProjectModal.description}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 font-mono-code uppercase">FUNCIONALIDADES CHAVE:</h3>
              <ul className="space-y-1 text-xs text-slate-300">
                {activeProjectModal.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 font-mono-code uppercase">TECNOLOGIAS UTILIZADAS:</h3>
              <div className="flex flex-wrap gap-1.5">
                {activeProjectModal.technologies.map((t) => (
                  <span key={t} className="bg-slate-800 text-emerald-300 text-xs font-mono-code px-2.5 py-1 rounded border border-slate-700">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
              {activeProjectModal.github && (
                <a
                  href={activeProjectModal.github}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-4 rounded-lg border border-slate-700 transition"
                >
                  <Github className="w-4 h-4" />
                  <span>Repositório GitHub</span>
                </a>
              )}
              {activeProjectModal.demoAvailable && (
                <button
                  onClick={() => {
                    alert(`Demonstração simulada do projeto "${activeProjectModal.name}"!`);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2.5 px-4 rounded-lg transition cursor-pointer shadow-md"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Ver Demonstração Interativa</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
