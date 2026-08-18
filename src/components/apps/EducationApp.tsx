import React from 'react';
import {
  GraduationCap,
  Award,
  BookOpen,
  CheckCircle2,
  Check,
  Star,
  FileCheck,
  Folder
} from 'lucide-react';
import { EDUCATION_DATA, COURSES_DATA } from '../../data/portfolioData';

export const EducationApp: React.FC = () => {
  const graduacao = EDUCATION_DATA.filter((e) => e.type === 'Graduação');
  const mbas = EDUCATION_DATA.filter((e) => e.degree.startsWith('MBA'));
  const posGraduacoes = EDUCATION_DATA.filter((e) => e.degree.startsWith('PÓS-GRADUAÇÃO'));

  return (
    <div className="space-y-4 font-sans text-gray-900 select-none max-w-4xl mx-auto">
      {/* Retro Directory Header */}
      <div className="bg-[#c0c0c0] p-2 border-2 border-white border-r-gray-800 border-b-gray-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 font-bold">
          <GraduationCap className="w-4 h-4 text-blue-900" />
          <span className="text-blue-950 font-bold">C:\MATEUS\EDUCACAO_E_CURSOS\</span>
        </div>
        <span className="text-[11px] text-gray-700">FORMAÇÕES & MBAs HOMOLOGADOS</span>
      </div>

      {/* 1. GRADUAÇÃO */}
      <div className="bg-white border-2 border-gray-700 shadow-sm p-4 space-y-3">
        <div className="flex items-center gap-2 border-b-2 border-blue-900 pb-2">
          <GraduationCap className="w-5 h-5 text-blue-900" />
          <h2 className="text-sm font-bold font-mono text-blue-950 uppercase tracking-wide">
            1. Graduação Concluída
          </h2>
        </div>

        {graduacao.map((edu) => (
          <div key={edu.id} className="p-3 bg-blue-50/50 border border-blue-300 rounded space-y-1.5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h3 className="text-sm font-bold font-mono text-blue-950">{edu.degree}</h3>
              <span className="px-2 py-0.5 bg-green-700 text-white font-mono text-[10px] font-bold rounded w-fit">
                {edu.status}
              </span>
            </div>
            <div className="font-bold text-gray-800 text-[11.5px]">{edu.institution}</div>
            <p className="text-gray-700 text-[11.5px] leading-relaxed">{edu.description}</p>
          </div>
        ))}
      </div>

      {/* 2. MBAs */}
      <div className="bg-white border-2 border-gray-700 shadow-sm p-4 space-y-3">
        <div className="flex items-center gap-2 border-b-2 border-yellow-600 pb-2">
          <Award className="w-5 h-5 text-yellow-700" />
          <h2 className="text-sm font-bold font-mono text-blue-950 uppercase tracking-wide">
            2. Especializações Executivas (MBAs)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {mbas.map((edu) => (
            <div key={edu.id} className="p-3 bg-gray-50 border border-gray-300 rounded space-y-2 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="font-mono text-[10px] font-bold text-blue-900 bg-blue-100 px-1.5 py-0.5 rounded w-fit">
                  {edu.institution}
                </div>
                <h3 className="font-bold font-mono text-blue-950 text-xs leading-snug">{edu.degree}</h3>
                <p className="text-gray-700 text-[11px] leading-relaxed">{edu.description}</p>
              </div>
              <div className="pt-2 border-t border-gray-200 text-[10.5px] font-mono text-green-800 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>{edu.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. PÓS-GRADUAÇÃO / ESPECIALIZAÇÕES */}
      <div className="bg-white border-2 border-gray-700 shadow-sm p-4 space-y-3">
        <div className="flex items-center gap-2 border-b-2 border-gray-700 pb-2">
          <FileCheck className="w-5 h-5 text-gray-800" />
          <h2 className="text-sm font-bold font-mono text-blue-950 uppercase tracking-wide">
            3. Pós-Graduação & Especializações
          </h2>
        </div>

        <div className="space-y-2 text-xs">
          {posGraduacoes.map((edu) => (
            <div key={edu.id} className="p-3 bg-gray-50 border border-gray-300 rounded space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold font-mono text-blue-950 text-xs">{edu.degree}</h3>
                <span className="px-2 py-0.5 bg-gray-200 text-gray-800 font-mono text-[10px] font-bold rounded">
                  {edu.status}
                </span>
              </div>
              <p className="text-gray-700 text-[11.5px]">{edu.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. CURSOS ADICIONAIS */}
      <div className="bg-white border-2 border-gray-700 shadow-sm p-4 space-y-3">
        <div className="flex items-center gap-2 border-b-2 border-emerald-700 pb-2">
          <BookOpen className="w-5 h-5 text-emerald-800" />
          <h2 className="text-sm font-bold font-mono text-blue-950 uppercase tracking-wide">
            4. Cursos Adicionais & Capacitação Técnica
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {COURSES_DATA.map((course) => (
            <div
              key={course.id}
              className={`p-2.5 border rounded flex items-start justify-between gap-2 ${
                course.id === 'course-1'
                  ? 'bg-yellow-50/80 border-yellow-400 font-medium'
                  : 'bg-gray-50 border-gray-300'
              }`}
            >
              <div className="space-y-0.5">
                <div className="font-bold text-blue-950 text-[11.5px] flex items-center gap-1.5">
                  <span>{course.name}</span>
                  {course.id === 'course-1' && (
                    <span className="px-1.5 py-0.2 bg-yellow-400 text-black text-[9px] font-bold rounded">
                      ★ DESTAQUE
                    </span>
                  )}
                </div>
                <div className="text-gray-600 text-[10.5px]">Instituição: <span className="font-bold text-gray-800">{course.issuer}</span></div>
              </div>
              <div className="text-right font-mono text-[10.5px] text-gray-700 font-bold shrink-0">
                {course.hours}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Footer */}
      <div className="bg-[#c0c0c0] p-1.5 border-bevel-in text-[11px] font-mono text-gray-800 flex items-center justify-between">
        <span>ESTRUTURA: GRADUAÇÃO ↓ MBAs ↓ PÓS ↓ CURSOS</span>
        <span>MATEUS OS 2000</span>
      </div>
    </div>
  );
};
