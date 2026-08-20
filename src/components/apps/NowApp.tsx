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
    <div className="space-y-4 font-sans text-gray-900 select-none max-w-4xl mx-auto">
      {/* Retro Directory Header */}
      <div className="bg-[#ECE9D8] p-2 border-2 border-white border-r-gray-800 border-b-gray-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 font-bold">
          <Clock className="w-4 h-4 text-blue-900" />
          <span className="text-blue-950 font-bold">C:\MATEUS\STATUS_ATUAL_NOW.LOG</span>
        </div>
        <span className="text-[11px] text-gray-700">FEED EM TEMPO REAL</span>
      </div>

      {/* App Banner */}
      <div className="bg-[#F1F0E8] p-4 border-2 border-gray-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#000080] text-white border border-blue-950 rounded-xs">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-blue-950 font-mono">
              ATUALMENTE / NOW PAGE (2026)
            </h1>
            <p className="text-xs text-gray-700">
              Status do que Mateus está estudando, construindo e projetando atualmente
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-[#ECE9D8] border-2 border-white border-r-gray-800 border-b-gray-800 text-blue-950 px-3 py-1 text-xs font-mono font-bold">
          <Compass className="w-3.5 h-3.5 text-blue-800" />
          <span>FOCO 2026</span>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ESTUDANDO */}
        <div className="bg-[#F5F4ED] p-4 sm:p-5 border-2 border-gray-400 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-blue-950 pb-2 border-b-2 border-emerald-800">
            <BookOpen className="w-4 h-4 text-emerald-800" />
            <h2 className="text-xs font-bold font-mono uppercase tracking-wide">01. ESTUDANDO</h2>
          </div>
          <ul className="space-y-2 text-xs text-gray-800">
            {nowData.studying.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed bg-[#ECE9D8] p-2 border border-gray-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CONSTRUINDO */}
        <div className="bg-[#F5F4ED] p-4 sm:p-5 border-2 border-gray-400 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-blue-950 pb-2 border-b-2 border-amber-800">
            <Hammer className="w-4 h-4 text-amber-800" />
            <h2 className="text-xs font-bold font-mono uppercase tracking-wide">02. CONSTRUINDO</h2>
          </div>
          <ul className="space-y-2 text-xs text-gray-800">
            {nowData.building.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed bg-[#ECE9D8] p-2 border border-gray-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* APRENDENDO */}
        <div className="bg-[#F5F4ED] p-4 sm:p-5 border-2 border-gray-400 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-blue-950 pb-2 border-b-2 border-blue-800">
            <Sparkles className="w-4 h-4 text-blue-800" />
            <h2 className="text-xs font-bold font-mono uppercase tracking-wide">03. APRENDENDO</h2>
          </div>
          <ul className="space-y-2 text-xs text-gray-800">
            {nowData.learning.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed bg-[#ECE9D8] p-2 border border-gray-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* OBJETIVOS 2026 */}
        <div className="bg-[#F5F4ED] p-4 sm:p-5 border-2 border-gray-400 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-blue-950 pb-2 border-b-2 border-purple-800">
            <Target className="w-4 h-4 text-purple-800" />
            <h2 className="text-xs font-bold font-mono uppercase tracking-wide">04. OBJETIVOS 2026</h2>
          </div>
          <ul className="space-y-2 text-xs text-gray-800">
            {nowData.goals2026.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed bg-[#ECE9D8] p-2 border border-gray-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-700 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Interactive Quick Add Item */}
      <div className="bg-[#ECE9D8] p-4 border-2 border-white border-r-gray-800 border-b-gray-800 space-y-2.5">
        <h3 className="text-xs font-bold text-blue-950 font-mono uppercase">Adicionar Novo Foco Interativo</h3>
        <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-2">
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value as keyof typeof CURRENTLY_NOW_DATA)}
            className="bg-white text-gray-900 border-2 border-gray-500 border-r-white border-b-white px-3 py-1.5 text-xs font-mono font-bold focus:outline-none"
          >
            <option value="studying">01. Estudando</option>
            <option value="building">02. Construindo</option>
            <option value="learning">03. Aprendendo</option>
            <option value="goals2026">04. Objetivos</option>
          </select>

          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Digite aqui o novo objetivo ou foco..."
            className="flex-1 bg-white text-gray-900 px-3 py-1.5 border-2 border-gray-500 border-r-white border-b-white text-xs focus:outline-none"
          />

          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 bg-[#000080] hover:bg-blue-800 text-white font-bold px-4 py-1.5 text-xs border-2 border-white border-r-gray-800 border-b-gray-800 cursor-pointer active:border-inset"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar</span>
          </button>
        </form>
      </div>

      {/* Retro Status Bar */}
      <div className="bg-[#ECE9D8] p-1.5 border border-gray-400 text-[11px] font-mono text-gray-800 flex items-center justify-between">
        <span>STATUS: FEED SINCRONIZADO</span>
        <span>MATEUS OS 2000</span>
      </div>
    </div>
  );
};

