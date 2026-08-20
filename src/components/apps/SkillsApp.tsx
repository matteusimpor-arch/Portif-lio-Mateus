import React, { useState } from 'react';
import { Cpu, Briefcase, Truck, Award, Search, CheckCircle2, Wrench } from 'lucide-react';
import { SKILLS_DATA } from '../../data/portfolioData';
import { soundFx } from '../../utils/soundEffects';

export const SkillsApp: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categoryNames = ['Todos', ...SKILLS_DATA.map((c) => c.category)];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Tecnologia & IA':
        return <Cpu className="w-4 h-4 text-emerald-800" />;
      case 'Gestão & Processos':
        return <Briefcase className="w-4 h-4 text-blue-800" />;
      case 'Logística & Operações':
        return <Truck className="w-4 h-4 text-amber-800" />;
      case 'Competências Pessoais':
        return <Award className="w-4 h-4 text-purple-800" />;
      default:
        return <Cpu className="w-4 h-4 text-blue-900" />;
    }
  };

  const filteredCategories = SKILLS_DATA.filter(
    (cat) => selectedCategory === 'Todos' || cat.category === selectedCategory
  );

  return (
    <div className="space-y-4 font-sans text-gray-900 select-none max-w-4xl mx-auto">
      {/* Retro Directory Header */}
      <div className="bg-[#ECE9D8] p-2 border-2 border-white border-r-gray-800 border-b-gray-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 font-bold">
          <Wrench className="w-4 h-4 text-blue-900" />
          <span className="text-blue-950 font-bold">C:\MATEUS\HABILIDADES_E_COMPETENCIAS.DAT</span>
        </div>
        <span className="text-[11px] text-gray-700">MATRIZ TÉCNICA OFICIAL</span>
      </div>

      {/* App Banner / Search Header */}
      <div className="bg-[#F1F0E8] p-4 border-2 border-gray-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#000080] text-white border border-blue-950 rounded-xs">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-blue-950 font-mono">
              MATRIZ DE HABILIDADES
            </h1>
            <p className="text-xs text-gray-700">
              Tecnologia, Engenharia de Prompt, Gestão Estratégica e Logística
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar competência..."
            className="w-full bg-white text-xs text-gray-900 pl-8 pr-3 py-1.5 border-2 border-gray-500 border-r-white border-b-white focus:outline-none focus:ring-1 focus:ring-blue-800"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 pt-1">
        {categoryNames.map((catName) => (
          <button
            key={catName}
            onClick={() => {
              try { soundFx.playClick(); } catch (e) {}
              setSelectedCategory(catName);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold whitespace-nowrap transition cursor-pointer border-2 rounded-t-xs ${
              selectedCategory === catName
                ? 'bg-[#F5F4ED] text-blue-950 border-gray-600 border-b-[#F5F4ED] shadow-xs'
                : 'bg-[#ECE9D8] text-gray-700 border-gray-400 hover:bg-[#F1F0E8]'
            }`}
          >
            {catName !== 'Todos' && getCategoryIcon(catName)}
            <span>{catName}</span>
          </button>
        ))}
      </div>

      {/* Skill Categories Sections */}
      <div className="space-y-4">
        {filteredCategories.map((catGroup) => {
          const matchingSkills = catGroup.skills.filter(
            (s) =>
              s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
              s.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
          );

          if (matchingSkills.length === 0) return null;

          return (
            <div
              key={catGroup.category}
              className="bg-[#F5F4ED] p-4 sm:p-5 border-2 border-gray-400 shadow-xs space-y-3"
            >
              <div className="flex items-center gap-2 pb-2 border-b-2 border-blue-900/40">
                {getCategoryIcon(catGroup.category)}
                <h2 className="text-sm font-bold text-blue-950 font-mono uppercase tracking-wide">
                  {catGroup.category}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {matchingSkills.map((skill) => (
                  <div
                    key={skill.name}
                    className="bg-[#ECE9D8] p-3.5 border-2 border-white border-r-gray-800 border-b-gray-800 space-y-2.5 hover:shadow-sm transition"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="text-xs font-bold text-blue-950 font-mono flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span>{skill.name}</span>
                        </h3>
                        <p className="text-[11px] text-gray-700 mt-1 leading-relaxed">
                          {skill.description}
                        </p>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-blue-950 bg-[#F1F0E8] px-2 py-0.5 border border-gray-500 shrink-0">
                        {skill.level}%
                      </span>
                    </div>

                    {/* Classic Retro Meter Bar */}
                    <div className="w-full bg-[#D4D0C8] h-3 border border-gray-600 border-r-white border-b-white p-0.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-900 via-blue-700 to-teal-700 h-full transition-all duration-300"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {skill.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-[#F1F0E8] text-gray-800 text-[10px] font-mono px-1.5 py-0.5 border border-gray-400"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Retro Status Bar */}
      <div className="bg-[#ECE9D8] p-1.5 border border-gray-400 text-[11px] font-mono text-gray-800 flex items-center justify-between">
        <span>STATUS: EXIBINDO MATRIZ DE COMPETÊNCIAS</span>
        <span>MATEUS OS 2000</span>
      </div>
    </div>
  );
};

