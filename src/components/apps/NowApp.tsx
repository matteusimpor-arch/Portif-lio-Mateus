import React, { useState } from 'react';
import { Clock, BookOpen, Hammer, Sparkles, Target, Compass, Plus, CheckCircle2 } from 'lucide-react';
import { CURRENTLY_NOW_DATA } from '../../data/portfolioData';
import { soundFx } from '../../utils/soundEffects';

export const NowApp: React.FC = () => {
  const [nowData, setNowData] = useState(CURRENTLY_NOW_DATA);
  const [newItemText, setNewItemText] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<keyof typeof CURRENTLY_NOW_DATA>('studying');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    soundFx.playClick();
    setNowData((prev) => ({
      ...prev,
      [activeCategory]: [...prev[activeCategory], newItemText.trim()]
    }));
    setNewItemText('');
  };

  return (
    <div className="space-y-6 font-sans-ui text-slate-200">
      {/* App Banner */}
      <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-950 border border-emerald-800 rounded-lg text-emerald-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-vt323 text-2xl">ATUALMENTE / NOW PAGE</h1>
            <p className="text-xs text-slate-400">Status em tempo real do que Mateus está estudando, construindo e projetando</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-emerald-950/60 border border-emerald-800 text-emerald-300 px-3 py-1 rounded text-xs font-mono-code">
          <Compass className="w-3.5 h-3.5 text-emerald-400" />
          <span>FOCO 2026</span>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ESTUDANDO */}
        <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 pb-2 border-b border-slate-800">
            <BookOpen className="w-4 h-4" />
            <h2 className="text-sm font-bold font-mono-code uppercase">01. ESTUDANDO</h2>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {nowData.studying.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CONSTRUINDO */}
        <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 pb-2 border-b border-slate-800">
            <Hammer className="w-4 h-4" />
            <h2 className="text-sm font-bold font-mono-code uppercase">02. CONSTRUINDO</h2>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {nowData.building.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* APRENDENDO */}
        <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-blue-400 pb-2 border-b border-slate-800">
            <Sparkles className="w-4 h-4" />
            <h2 className="text-sm font-bold font-mono-code uppercase">03. APRENDENDO</h2>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {nowData.learning.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* OBJETIVOS 2026 */}
        <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-purple-400 pb-2 border-b border-slate-800">
            <Target className="w-4 h-4" />
            <h2 className="text-sm font-bold font-mono-code uppercase">04. OBJETIVOS 2026</h2>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {nowData.goals2026.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Interactive Quick Add Item */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-400 font-mono-code uppercase">Adicionar Novo Foco Interativo</h3>
        <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-2">
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value as keyof typeof CURRENTLY_NOW_DATA)}
            className="bg-slate-900 text-slate-200 border border-slate-800 rounded px-3 py-2 text-xs font-mono-code focus:outline-none focus:border-emerald-500"
          >
            <option value="studying">Estudando</option>
            <option value="building">Construindo</option>
            <option value="learning">Aprendendo</option>
            <option value="goals2026">Objetivos</option>
          </select>

          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Digite aqui o novo objetivo ou foco..."
            className="flex-1 bg-slate-900 text-slate-200 px-3 py-2 rounded border border-slate-800 text-xs focus:outline-none focus:border-emerald-500 font-sans-ui"
          />

          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded text-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar</span>
          </button>
        </form>
      </div>
    </div>
  );
};
