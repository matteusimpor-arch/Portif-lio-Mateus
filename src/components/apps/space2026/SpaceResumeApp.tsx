import React, { useState } from 'react';
import {
  FileText,
  Download,
  Sparkles,
  Briefcase,
  GraduationCap,
  Award,
  Calendar,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { PROFILE_DATA, EXPERIENCE_DATA, EDUCATION_DATA, CERTIFICATES_DATA } from '../../../data/portfolioData';
import { soundFx } from '../../../utils/soundEffects';
import { generateCurriculumPdf } from '../../../utils/generatePdf';

export const SpaceResumeApp: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'all' | 'experience' | 'education' | 'certifications'>('all');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleDownloadPDF = () => {
    try { soundFx.playClick(); } catch (e) {}
    setIsGenerating(true);
    try {
      generateCurriculumPdf();
    } catch (err) {
      console.error('Error generating PDF:', err);
      window.print();
    } finally {
      setTimeout(() => setIsGenerating(false), 800);
    }
  };

  const handlePrint = () => {
    try { soundFx.playClick(); } catch (e) {}
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 select-none font-sans text-slate-100 animate-fadeIn">
      {/* 2026 Futuristic Header HUD */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-cyan-950/70 border border-cyan-500/30 p-6 backdrop-blur-xl shadow-[0_0_40px_rgba(6,182,212,0.15)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(6,182,212,0.5)]">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-mono text-white">CURRÍCULO VITAE OFICIAL</h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  DOCUMENTO DIGITAL 2026
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {PROFILE_DATA.name} • {PROFILE_DATA.headline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-mono font-bold flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 transition disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Gerando PDF...' : 'Baixar Currículo em PDF'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="hidden sm:flex px-3 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold items-center gap-1.5 cursor-pointer transition"
            >
              <span>Imprimir</span>
            </button>
          </div>
        </div>

        {/* Section Filter Pills */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-cyan-900/50 overflow-x-auto">
          {[
            { id: 'all', label: 'Visão Completa' },
            { id: 'experience', label: 'Experiência Profissional' },
            { id: 'education', label: 'Formação & MBAs' },
            { id: 'certifications', label: 'Certificações' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                try { soundFx.playClick(); } catch (e) {}
                setActiveSection(tab.id as any);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer whitespace-nowrap ${
                activeSection === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:text-cyan-200 hover:bg-blue-950/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Executive Summary Card */}
      <div className="p-6 rounded-2xl bg-black/75 border border-cyan-950 backdrop-blur-xl shadow-[0_0_25px_rgba(0,10,30,0.5)] space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold">
          <Sparkles className="w-4 h-4" />
          <span>Resumo Executivo</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {PROFILE_DATA.bioLong}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-cyan-950/80 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px]">LOCALIZAÇÃO</span>
            <span className="text-white font-bold">{PROFILE_DATA.location}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">EMAIL</span>
            <span className="text-cyan-400 font-bold truncate block">{PROFILE_DATA.email}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">TELEFONE / WHATSAPP</span>
            <span className="text-emerald-400 font-bold">{PROFILE_DATA.phoneFormatted}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">STATUS</span>
            <span className="text-cyan-300 font-bold">Disponível para Projetos</span>
          </div>
        </div>
      </div>

      {/* 1. Experiência Profissional */}
      {(activeSection === 'all' || activeSection === 'experience') && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-cyan-900/40">
            <Briefcase className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold font-mono text-white tracking-wider uppercase">
              Experiência Profissional
            </h2>
          </div>

          <div className="space-y-4">
            {EXPERIENCE_DATA.map((exp) => (
              <div
                key={exp.id}
                className="p-5 rounded-2xl bg-black/75 border border-cyan-950 hover:border-cyan-500/50 transition backdrop-blur-xl shadow-[0_0_20px_rgba(0,10,30,0.5)] space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                      <span>{exp.role}</span>
                      {exp.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-cyan-300 border border-cyan-800">
                          {exp.badge}
                        </span>
                      )}
                    </h3>
                    <div className="text-xs text-cyan-400 font-mono font-bold mt-0.5">
                      {exp.organization}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-cyan-500" />
                      {exp.period}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-500" />
                      {exp.location}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  {exp.description.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {exp.skillsUsed && exp.skillsUsed.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-cyan-950/80">
                    {exp.skillsUsed.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950/60 text-cyan-300 border border-cyan-900/60"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Formação Acadêmica */}
      {(activeSection === 'all' || activeSection === 'education') && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-cyan-900/40">
            <GraduationCap className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold font-mono text-white tracking-wider uppercase">
              Formação Acadêmica & Pós-Graduações
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EDUCATION_DATA.map((edu) => (
              <div
                key={edu.id}
                className="p-4 rounded-2xl bg-black/75 border border-cyan-950 hover:border-cyan-500/40 transition backdrop-blur-xl shadow-[0_0_20px_rgba(0,10,30,0.5)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-cyan-300 border border-cyan-800 font-bold">
                      {edu.type}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{edu.year}</span>
                  </div>

                  <h3 className="text-sm font-bold font-mono text-white">{edu.degree}</h3>
                  <div className="text-xs text-cyan-400 font-mono mt-0.5">{edu.institution}</div>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">{edu.description}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-cyan-950/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Status:</span>
                  <span className="text-emerald-400 font-bold">{edu.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Certificações */}
      {(activeSection === 'all' || activeSection === 'certifications') && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-cyan-900/40">
            <Award className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold font-mono text-white tracking-wider uppercase">
              Certificações & Especializações
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {CERTIFICATES_DATA.map((cert) => (
              <div
                key={cert.id}
                className="p-3.5 rounded-xl bg-black/75 border border-cyan-950 hover:border-cyan-600/50 transition backdrop-blur-xl shadow-[0_0_15px_rgba(0,10,30,0.5)] flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold font-mono text-white leading-snug">{cert.name}</h4>
                  <p className="text-[11px] text-cyan-400 font-mono mt-1">{cert.issuer}</p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-cyan-950 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>{cert.year}</span>
                  <span className="text-emerald-400">{cert.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
