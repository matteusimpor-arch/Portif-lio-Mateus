import React from 'react';
import { GraduationCap, Award, Calendar, BookOpen, CheckCircle2, Sparkles } from 'lucide-react';
import { EDUCATION_DATA } from '../../data/portfolioData';

export const EducationApp: React.FC = () => {
  return (
    <div className="space-y-6 font-sans-ui text-slate-200">
      {/* App Banner */}
      <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-950 border border-blue-800 rounded-lg text-blue-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-vt323 text-2xl">FORMAÇÃO ACADÊMICA & CERTIFICAÇÕES</h1>
            <p className="text-xs text-slate-400">Graduação, pós-graduações e especializações contínuas em tecnologia</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-blue-950/60 border border-blue-800 text-blue-300 px-3 py-1 rounded text-xs font-mono-code">
          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
          <span>APRENDIZADO CONTÍNUO</span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EDUCATION_DATA.map((edu) => (
          <div
            key={edu.id}
            className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 hover:border-blue-500/50 transition-all shadow-md flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-mono-code px-2 py-0.5 rounded font-bold uppercase">
                  {edu.type}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-400 font-mono-code">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {edu.year}
                </span>
              </div>

              <div>
                <h2 className="text-base font-bold text-white leading-snug">{edu.degree}</h2>
                <div className="text-xs text-emerald-400 font-mono-code mt-0.5">{edu.institution}</div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {edu.description}
              </p>
            </div>

            {edu.highlights && edu.highlights.length > 0 && (
              <div className="pt-3 border-t border-slate-800/80 space-y-1">
                {edu.highlights.map((hl, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-xs text-amber-300/90 font-mono-code">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{hl}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Additional Learning Commitments */}
      <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-emerald-400 font-mono-code uppercase flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-400" />
          <span>Foco em Formação Complementar e Atualização 2026</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Complementando a formação em Logística e Pós-Graduações em IA, Mateus mantém rotina diária de atualização prática em modelos de linguagem avançados (Gemini, Claude 3.5, OpenAI GPT-4o), arquiteturas de agentes autônomos e automação de processos corporativos.
        </p>
      </div>
    </div>
  );
};
