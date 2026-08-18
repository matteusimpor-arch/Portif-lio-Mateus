import React, { useState } from 'react';
import { FileText, Download, Eye, CheckCircle2, Award, Briefcase, GraduationCap, Cpu, Sparkles, FileDown, Check } from 'lucide-react';
import { PROFILE_INFO, EDUCATION_DATA, EXPERIENCE_DATA, SKILLS_DATA, CERTIFICATES_DATA } from '../../data/portfolioData';
import { soundFx } from '../../utils/soundEffects';
import { generateCurriculumPdf } from '../../utils/generatePdf';

export const ResumeApp: React.FC = () => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  const handleGeneratePdf = () => {
    try {
      soundFx.playClick();
    } catch (e) {}
    setIsGeneratingPdf(true);

    setTimeout(() => {
      try {
        generateCurriculumPdf();
        setIsGeneratingPdf(false);
        setPdfSuccess(true);
        try {
          soundFx.playFanfare();
        } catch (e) {}
        setTimeout(() => setPdfSuccess(false), 3500);
      } catch (err) {
        console.error('Error generating PDF:', err);
        setIsGeneratingPdf(false);
        alert('Ocorreu um erro ao gerar o PDF. Tentando download em formato texto.');
        handleDownloadTxt();
      }
    }, 400);
  };

  const handleDownloadTxt = () => {
    try {
      soundFx.playClick();
    } catch (e) {}
    const content =
      `===================================================\n` +
      `CURRÍCULO VITAE — ${PROFILE_INFO.name}\n` +
      `===================================================\n` +
      `Nome: ${PROFILE_INFO.name}\n` +
      `Título: ${PROFILE_INFO.title}\n` +
      `Atuação: ${PROFILE_INFO.headline}\n` +
      `Email: ${PROFILE_INFO.email}\n` +
      `LinkedIn: ${PROFILE_INFO.linkedin}\n` +
      `GitHub: ${PROFILE_INFO.github}\n\n` +
      `---------------------------------------------------\n` +
      `RESUMO EXECUTIVO & APRESENTAÇÃO\n` +
      `---------------------------------------------------\n` +
      `${PROFILE_INFO.subtitle}\n\n` +
      `${PROFILE_INFO.bioShort}\n\n` +
      `Citação: "${PROFILE_INFO.featuredQuote}"\n\n` +
      `---------------------------------------------------\n` +
      `FORMAÇÃO ACADÊMICA & PÓS-GRADUAÇÕES\n` +
      `---------------------------------------------------\n` +
      EDUCATION_DATA.map(
        (edu) => `• ${edu.degree}\n  Instituição/Status: ${edu.institution} (${edu.year})\n  Descrição: ${edu.description}\n`
      ).join('\n') +
      `\n---------------------------------------------------\n` +
      `EXPERIÊNCIA PROFISSIONAL\n` +
      `---------------------------------------------------\n` +
      EXPERIENCE_DATA.map(
        (exp) =>
          `• ${exp.role} @ ${exp.organization} (${exp.period})\n  ${exp.description.join('\n  ')}\n`
      ).join('\n') +
      `\n---------------------------------------------------\n` +
      `CURSOS E CERTIFICAÇÕES\n` +
      `---------------------------------------------------\n` +
      CERTIFICATES_DATA.map(
        (cert) => `• ${cert.name} (${cert.hours || 'N/A'}) — ${cert.issuer} [${cert.year}]\n`
      ).join('\n');

    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `Curriculo_${PROFILE_INFO.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6 font-sans-ui text-slate-200">
      {/* Top Banner with Actions */}
      <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-950 border border-indigo-800 rounded-lg text-indigo-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-vt323 text-2xl">CURRÍCULO VITAE — {PROFILE_INFO.name}</h1>
            <p className="text-xs text-slate-400">Documento executivo oficial pronto para download em PDF</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Main Action: Generate PDF */}
          <button
            onClick={handleGeneratePdf}
            disabled={isGeneratingPdf}
            className={`flex items-center gap-2 font-bold text-xs py-2.5 px-4 rounded-lg transition cursor-pointer shadow-lg transform hover:scale-105 active:scale-95 ${
              pdfSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white border border-indigo-400/30'
            }`}
          >
            {isGeneratingPdf ? (
              <>
                <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
                <span>GERANDO PDF...</span>
              </>
            ) : pdfSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" />
                <span>PDF GERADO COM SUCESSO!</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 text-yellow-300" />
                <span>GERAR CURRÍCULO EM PDF</span>
              </>
            )}
          </button>

          {/* Fallback TXT Download */}
          <button
            onClick={handleDownloadTxt}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2.5 px-3 rounded-lg border border-slate-700 transition cursor-pointer"
            title="Baixar versão em texto puro"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>BAIXAR .TXT</span>
          </button>
        </div>
      </div>

      {/* CV Sheet Replica */}
      <div className="bg-slate-950 p-6 md:p-8 rounded-xl border-2 border-slate-800 space-y-6 shadow-2xl relative font-sans-ui">
        {/* Accent Bar */}
        <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-t-lg -mt-6 -mx-6 md:-mt-8 md:-mx-8 mb-6" />

        {/* CV Header */}
        <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{PROFILE_INFO.name}</h2>
            <p className="text-sm font-semibold text-indigo-400 font-mono-code mt-0.5">{PROFILE_INFO.title}</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">{PROFILE_INFO.subtitle}</p>
          </div>
          <div className="text-xs font-mono-code text-slate-400 space-y-1 bg-slate-900/80 p-3 rounded-lg border border-slate-800/80">
            <div>Email: <span className="text-slate-200">{PROFILE_INFO.email}</span></div>
            <div>LinkedIn: <span className="text-slate-200">{PROFILE_INFO.linkedin}</span></div>
            <div>GitHub: <span className="text-slate-200">{PROFILE_INFO.github}</span></div>
            <div>Localização: <span className="text-slate-200">{PROFILE_INFO.location}</span></div>
          </div>
        </div>

        {/* Section: Resumo Executivo */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-indigo-400 font-mono-code uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4" />
            <span>Resumo Executivo</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {PROFILE_INFO.bioShort}
          </p>
          <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-xs italic text-indigo-300">
            "{PROFILE_INFO.featuredQuote}"
          </div>
        </div>

        {/* Section: Formação Acadêmica & Pós-Graduações */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-indigo-400 font-mono-code uppercase tracking-wider flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            <span>Formação Acadêmica & Pós-Graduações</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
            {EDUCATION_DATA.map((edu) => (
              <div key={edu.id} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="flex justify-between items-center">
                  <div className="font-bold text-white text-xs">{edu.degree}</div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                    {edu.year}
                  </span>
                </div>
                <div className="text-slate-400 text-[11px] font-medium">{edu.institution}</div>
                <div className="text-slate-300 text-[11px] leading-relaxed pt-1">{edu.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Experiência */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-indigo-400 font-mono-code uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            <span>Experiência Profissional</span>
          </h3>
          <div className="space-y-2 text-xs text-slate-300">
            {EXPERIENCE_DATA.map((exp) => (
              <div key={exp.id} className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-800 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <span className="font-bold text-white text-sm">{exp.role}</span>
                    <span className="text-slate-400 text-xs ml-2">— {exp.organization}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800 self-start sm:self-auto">
                    {exp.period}
                  </span>
                </div>
                <ul className="space-y-1 text-slate-300 text-xs pl-2">
                  {exp.description.map((d, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-indigo-400 mt-0.5">❯</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Pilares de Competência */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-indigo-400 font-mono-code uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            <span>Competências e Áreas de Domínio</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate-300">
            {SKILLS_DATA.map((cat, i) => (
              <div key={i} className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 space-y-1">
                <div className="font-bold text-indigo-300 text-xs">{cat.category}</div>
                <div className="text-[11px] text-slate-400">
                  {cat.skills.map((s) => s.name).join(' • ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom PDF Generation Callout */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span>Deseja anexar ou imprimir o currículo oficial?</span>
          <button
            onClick={handleGeneratePdf}
            disabled={isGeneratingPdf}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow flex items-center gap-2 cursor-pointer transition"
          >
            <FileDown className="w-4 h-4" />
            <span>BAIXAR CURRÍCULO EM PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

