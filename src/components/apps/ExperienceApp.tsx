import React from 'react';
import { Briefcase, Calendar, MapPin, Award, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import { EXPERIENCE_DATA } from '../../data/portfolioData';

export const ExperienceApp: React.FC = () => {
  return (
    <div className="space-y-6 font-sans-ui text-slate-200">
      {/* App Banner */}
      <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-950 border border-emerald-800 rounded-lg text-emerald-400">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-vt323 text-2xl">TRAJETÓRIA PROFISSIONAL</h1>
            <p className="text-xs text-slate-400">Experiência institucional, consultoria em IA e gestão de processos</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-emerald-950/60 border border-emerald-800 text-emerald-300 px-3 py-1 rounded text-xs font-mono-code">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>RIGOR & DISCIPLINA</span>
        </div>
      </div>

      {/* Interactive Timeline */}
      <div className="space-y-6 relative before:absolute before:inset-0 before:left-3 md:before:left-6 before:w-0.5 before:bg-slate-800">
        {EXPERIENCE_DATA.map((item) => (
          <div key={item.id} className="relative pl-8 md:pl-12 group">
            {/* Timeline Dot */}
            <div className="absolute left-1.5 md:left-4 top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-4 border-slate-950 group-hover:scale-125 transition-transform" />

            <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-all shadow-lg space-y-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-white">{item.role}</h2>
                    {item.badge && (
                      <span className="bg-emerald-950 text-emerald-300 text-[10px] font-mono-code border border-emerald-800 px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-emerald-400 font-medium font-mono-code">{item.organization}</div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono-code shrink-0">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {item.period}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {item.location}
                  </span>
                </div>
              </div>

              {/* Description Bullet points */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 font-mono-code uppercase">Principais Responsabilidades e Atividades:</h3>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {item.description.map((desc, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{desc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Highlights box */}
              {item.highlights && item.highlights.length > 0 && (
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 font-mono-code">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>DESTAQUES E CONQUISTAS:</span>
                  </div>
                  {item.highlights.map((h, hIdx) => (
                    <div key={hIdx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Skills Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {item.skillsUsed.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="bg-slate-800 text-slate-300 hover:text-emerald-300 text-[11px] font-mono-code px-2.5 py-0.5 rounded border border-slate-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
