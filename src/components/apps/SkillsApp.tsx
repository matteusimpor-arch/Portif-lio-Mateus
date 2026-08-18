import React, { useState } from 'react';
import { Cpu, Briefcase, Truck, Award, CheckCircle2, Search } from 'lucide-react';
import { SKILLS_DATA } from '../../data/portfolioData';

export const SkillsApp: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categoryNames = ['Todos', ...SKILLS_DATA.map(c => c.category)];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Tecnologia & IA': return <Cpu className="w-4 h-4 text-emerald-400" />;
      case 'Gestão & Processos': return <Briefcase className="w-4 h-4 text-amber-400" />;
      case 'Logística & Operações': return <Truck className="w-4 h-4 text-blue-400" />;
      case 'Competências Pessoais': return <Award className="w-4 h-4 text-purple-400" />;
      default: return <Cpu className="w-4 h-4 text-emerald-400" />;
    }
  };

  const filteredCategories = SKILLS_DATA.filter(cat => 
    selectedCategory === 'Todos' || cat.category === selectedCategory
  );

  return (
    <div className="space-y-6 font-sans-ui text-slate-200">
      {/* App Banner */}
      <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-950 border border-emerald-800 rounded-lg text-emerald-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-vt323 text-2xl">MATRIZ DE HABILIDADES</h1>
            <p className="text-xs text-slate-400">Tecnologia, Engenharia de Prompt, Gestão e Logística</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar habilidade..."
            className="w-full bg-slate-950 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
        {categoryNames.map((catName) => (
          <button
            key={catName}
            onClick={() => setSelectedCategory(catName)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono-code whitespace-nowrap transition cursor-pointer border ${
              selectedCategory === catName
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-sm'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border-slate-800'
            }`}
          >
            {catName !== 'Todos' && getCategoryIcon(catName)}
            <span>{catName}</span>
          </button>
        ))}
      </div>

      {/* Skill Categories Sections */}
      <div className="space-y-6">
        {filteredCategories.map((catGroup) => {
          const matchingSkills = catGroup.skills.filter(s => 
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
          );

          if (matchingSkills.length === 0) return null;

          return (
            <div key={catGroup.category} className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                {getCategoryIcon(catGroup.category)}
                <h2 className="text-lg font-bold text-white font-vt323 text-xl">{catGroup.category}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchingSkills.map((skill) => (
                  <div
                    key={skill.name}
                    className="bg-slate-950/80 p-4 rounded-lg border border-slate-800/80 hover:border-emerald-500/40 transition-all space-y-3 shadow-inner"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-bold text-slate-100">{skill.name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{skill.description}</p>
                      </div>
                      <span className="text-xs font-mono-code font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 shrink-0">
                        {skill.level}%
                      </span>
                    </div>

                    {/* Meter bar */}
                    <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
                      <div
                        className="bg-gradient-to-r from-emerald-600 to-teal-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {skill.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-slate-900 text-slate-400 text-[10px] font-mono-code px-2 py-0.5 rounded border border-slate-800"
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
    </div>
  );
};
