import React from 'react';
import { Briefcase, Calendar, MapPin, Shield, CheckCircle2, Award, Folder } from 'lucide-react';
import { EXPERIENCE_DATA } from '../../data/portfolioData';

export const ExperienceApp: React.FC = () => {
  return (
    <div className="space-y-4 font-sans text-gray-900 select-none max-w-4xl mx-auto">
      {/* Retro Header */}
      <div className="bg-[#c0c0c0] p-2 border-2 border-white border-r-gray-800 border-b-gray-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 font-bold">
          <Briefcase className="w-4 h-4 text-blue-900" />
          <span className="text-blue-950 font-bold">C:\MATEUS\EXPERIENCIA_MILITAR\</span>
        </div>
        <span className="text-[11px] text-gray-700">REGISTRO OFICIAL</span>
      </div>

      {EXPERIENCE_DATA.map((item) => (
        <div key={item.id} className="bg-[#F5F4ED] border-2 border-gray-400 shadow-xs p-4 sm:p-5 space-y-4 text-xs">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-green-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-800 text-white font-mono text-[10.5px] font-bold border border-emerald-950">
                  ATUAÇÃO INSTITUCIONAL
                </span>
                <h2 className="text-base font-bold font-mono text-blue-950">{item.organization}</h2>
              </div>
              <p className="text-xs font-bold text-gray-800 font-mono mt-1">
                Posto / Graduação: <span className="text-emerald-900 font-bold">{item.role}</span>
              </p>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px] text-blue-950 bg-[#ECE9D8] px-2.5 py-1 border-2 border-white border-r-gray-800 border-b-gray-800 w-fit">
              <span className="flex items-center gap-1 font-bold text-blue-950">
                <Calendar className="w-3.5 h-3.5 text-blue-900" />
                {item.period}
              </span>
            </div>
          </div>

          {/* Core Responsibilities */}
          <div className="space-y-2">
            <h3 className="font-bold font-mono text-blue-950 text-xs uppercase">
              Principais Atribuições e Rotinas Administrativas:
            </h3>
            <div className="bg-[#ECE9D8] border-2 border-white border-r-gray-800 border-b-gray-800 p-3.5 space-y-2">
              <ul className="space-y-1.5 text-[11.5px] text-gray-800 leading-relaxed list-disc pl-5">
                {item.description.map((desc, idx) => (
                  <li key={idx}>
                    <span className="text-gray-900">{desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Highlights Box */}
          {item.highlights && (
            <div className="bg-[#ECE9D8] border-2 border-white border-r-gray-800 border-b-gray-800 p-3.5 space-y-1.5">
              <div className="font-bold font-mono text-blue-950 text-xs flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-700" />
                <span>DESTAQUES DE DESEMPENHO E CONFORMIDADE:</span>
              </div>
              {item.highlights.map((hl, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-[11.5px] text-gray-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <span className="font-medium">{hl}</span>
                </div>
              ))}
            </div>
          )}

          {/* Competências Aplicadas */}
          <div className="space-y-1.5">
            <h4 className="font-bold font-mono text-blue-950 text-[11px]">Competências & Habilidades Exercidas:</h4>
            <div className="flex flex-wrap gap-1.5">
              {item.skillsUsed.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-[#F1F0E8] border border-gray-400 text-gray-800 font-mono text-[10.5px]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Retro Status Bar */}
      <div className="bg-[#c0c0c0] p-1.5 border-bevel-in text-[11px] font-mono text-gray-800 flex items-center justify-between">
        <span>STATUS: EXPERIÊNCIA MILITAR CONSOLIDADA</span>
        <span>MATEUS OS 2000</span>
      </div>
    </div>
  );
};
