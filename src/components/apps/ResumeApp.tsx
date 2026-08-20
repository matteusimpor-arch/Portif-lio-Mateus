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
      `Telefone/WhatsApp: ${PROFILE_INFO.phone} (Principal)\n` +
      `Email: ${PROFILE_INFO.email}\n` +
      `LinkedIn: ${PROFILE_INFO.linkedin}\n` +
      `GitHub: ${PROFILE_INFO.github}\n\n` +
      `---------------------------------------------------\n` +
      `RESUMO EXECUTIVO & APRESENTAÇÃO\n` +
      `---------------------------------------------------\n` +
      `${PROFILE_INFO.subtitle}\n\n` +
      `${PROFILE_INFO.bioShort}\n\n` +
      `Citação: "${PROFILE_INFO.quote}"\n\n` +
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
    <div className="space-y-4 font-sans text-gray-900 select-none max-w-4xl mx-auto">
      {/* Retro Directory Header */}
      <div className="bg-[#ECE9D8] p-2 border-2 border-white border-r-gray-800 border-b-gray-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 font-bold">
          <FileText className="w-4 h-4 text-blue-900" />
          <span className="text-blue-950 font-bold">C:\MATEUS\CURRICULO_VITAE.PDF</span>
        </div>
        <span className="text-[11px] text-gray-700">DOCUMENTO OFICIAL EXECUTIVO</span>
      </div>

      {/* Top Banner with Actions */}
      <div className="bg-[#F1F0E8] p-4 border-2 border-gray-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#000080] text-white border border-blue-950 rounded-xs">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-blue-950 font-mono">
              CURRÍCULO VITAE — {PROFILE_INFO.name}
            </h1>
            <p className="text-xs text-gray-700">
              Documento executivo oficial pronto para download em PDF ou Texto puro
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Main Action: Generate PDF */}
          <button
            onClick={handleGeneratePdf}
            disabled={isGeneratingPdf}
            className={`flex items-center gap-2 font-bold text-xs py-2 px-4 border-2 border-white border-r-gray-800 border-b-gray-800 transition cursor-pointer shadow-xs active:border-inset ${
              pdfSuccess
                ? 'bg-emerald-800 text-white'
                : 'bg-[#000080] hover:bg-blue-800 text-white'
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
            className="flex items-center gap-1.5 bg-[#ECE9D8] hover:bg-[#F5F4ED] text-gray-900 text-xs font-bold py-2 px-3 border-2 border-white border-r-gray-800 border-b-gray-800 transition cursor-pointer active:border-inset"
            title="Baixar versão em texto puro"
          >
            <Download className="w-3.5 h-3.5 text-gray-700" />
            <span>BAIXAR .TXT</span>
          </button>
        </div>
      </div>

      {/* CV Sheet Replica in Authentic Retro Canvas */}
      <div className="bg-[#F5F4ED] p-5 md:p-6 border-2 border-gray-400 space-y-5 shadow-xs font-sans text-xs">
        {/* Accent Bar */}
        <div className="h-1.5 bg-[#000080] -mt-5 -mx-5 md:-mt-6 md:-mx-6 mb-5" />

        {/* CV Header */}
        <div className="border-b-2 border-blue-900/30 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-blue-950 font-mono tracking-tight">{PROFILE_INFO.name}</h2>
            <p className="text-xs font-bold text-blue-900 font-mono mt-0.5">{PROFILE_INFO.title}</p>
            <p className="text-xs text-gray-700 mt-1 max-w-xl">{PROFILE_INFO.subtitle}</p>
          </div>
          <div className="text-[11px] font-mono text-gray-800 space-y-1 bg-[#ECE9D8] p-3 border-2 border-white border-r-gray-800 border-b-gray-800">
            <div>WhatsApp: <span className="text-emerald-800 font-bold">{PROFILE_INFO.phone} (Principal)</span></div>
            <div>Email: <span className="text-blue-950">{PROFILE_INFO.email}</span></div>
            <div>LinkedIn: <a href={PROFILE_INFO.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-800 underline">{PROFILE_INFO.linkedin}</a></div>
            <div>GitHub: <span className="text-gray-900">{PROFILE_INFO.github}</span></div>
            <div>Localização: <span className="text-gray-900">{PROFILE_INFO.location}</span></div>
          </div>
        </div>

        {/* Section: Resumo Executivo */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-blue-950 font-mono uppercase tracking-wide flex items-center gap-1.5">
            <Award className="w-4 h-4 text-blue-900" />
            <span>Resumo Executivo</span>
          </h3>
          <p className="text-xs text-gray-800 leading-relaxed">
            {PROFILE_INFO.bioShort}
          </p>
          <div className="p-2.5 bg-[#FFFDE7] border border-amber-300 text-xs italic text-amber-950">
            "{PROFILE_INFO.quote}"
          </div>
        </div>

        {/* Section: Formação Acadêmica & Pós-Graduações */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-blue-950 font-mono uppercase tracking-wide flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-blue-900" />
            <span>Formação Acadêmica & Pós-Graduações</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {EDUCATION_DATA.map((edu) => (
              <div key={edu.id} className="bg-[#ECE9D8] p-3 border-2 border-white border-r-gray-800 border-b-gray-800 space-y-1">
                <div className="flex justify-between items-center">
                  <div className="font-bold text-blue-950 text-xs">{edu.degree}</div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#F1F0E8] text-blue-950 border border-gray-400 font-bold">
                    {edu.year}
                  </span>
                </div>
                <div className="text-blue-900 font-medium text-[11px]">{edu.institution}</div>
                <div className="text-gray-700 text-[11px] leading-relaxed pt-1">{edu.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Experiência */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-blue-950 font-mono uppercase tracking-wide flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-blue-900" />
            <span>Experiência Profissional</span>
          </h3>
          <div className="space-y-2 text-xs">
            {EXPERIENCE_DATA.map((exp) => (
              <div key={exp.id} className="bg-[#ECE9D8] p-3.5 border-2 border-white border-r-gray-800 border-b-gray-800 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <span className="font-bold text-blue-950 text-sm">{exp.role}</span>
                    <span className="text-gray-700 text-xs ml-2">— {exp.organization}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-950 bg-[#F1F0E8] px-2 py-0.5 border border-gray-400 self-start sm:self-auto">
                    {exp.period}
                  </span>
                </div>
                <ul className="space-y-1 text-gray-800 text-xs pl-2">
                  {exp.description.map((d, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-800 mt-0.5">❯</span>
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
          <h3 className="text-xs font-bold text-blue-950 font-mono uppercase tracking-wide flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-blue-900" />
            <span>Competências e Áreas de Domínio</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {SKILLS_DATA.map((cat, i) => (
              <div key={i} className="bg-[#ECE9D8] p-2.5 border-2 border-white border-r-gray-800 border-b-gray-800 space-y-1">
                <div className="font-bold text-blue-950 text-xs font-mono">{cat.category}</div>
                <div className="text-[11px] text-gray-700">
                  {cat.skills.map((s) => s.name).join(' • ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom PDF Generation Callout */}
        <div className="pt-4 border-t-2 border-gray-400 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-700">
          <span>Deseja anexar ou imprimir o currículo oficial?</span>
          <button
            onClick={handleGeneratePdf}
            disabled={isGeneratingPdf}
            className="px-4 py-2 bg-[#000080] hover:bg-blue-800 text-white font-bold text-xs border-2 border-white border-r-gray-800 border-b-gray-800 shadow-xs flex items-center gap-2 cursor-pointer transition active:border-inset"
          >
            <FileDown className="w-4 h-4" />
            <span>BAIXAR CURRÍCULO EM PDF</span>
          </button>
        </div>
      </div>

      {/* Retro Status Bar */}
      <div className="bg-[#ECE9D8] p-1.5 border border-gray-400 text-[11px] font-mono text-gray-800 flex items-center justify-between">
        <span>STATUS: CURRÍCULO CARREGADO (100%)</span>
        <span>MATEUS OS 2000</span>
      </div>
    </div>
  );
};

