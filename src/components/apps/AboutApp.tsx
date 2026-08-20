import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  Award,
  Briefcase,
  Cpu,
  Target,
  CheckCircle2,
  BookOpen,
  FileText,
  Clock,
  ShieldCheck
} from 'lucide-react';
import {
  PROFILE_DATA,
  EDUCATION_DATA,
  COURSES_DATA,
  EXPERIENCE_DATA,
  SKILLS_DATA,
  CURRENTLY_NOW_DATA
} from '../../data/portfolioData';
import { soundFx } from '../../utils/soundEffects';

export const AboutApp: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('perfil');

  const navItems = [
    { id: 'perfil', label: '1. Perfil', icon: User },
    { id: 'formacao', label: '2. Formação Acadêmica', icon: GraduationCap },
    { id: 'especializacoes', label: '3. Especializações (MBAs)', icon: Award },
    { id: 'cursos', label: '4. Cursos Adicionais', icon: BookOpen },
    { id: 'experiencia', label: '5. Experiência Profissional', icon: Briefcase },
    { id: 'competencias', label: '6. Competências & Conhecimentos', icon: Cpu },
    { id: 'objetivos', label: '7. Objetivos Profissionais', icon: Target },
  ];

  const graduacoes = EDUCATION_DATA.filter((e) => e.type === 'Graduação');
  const mbas = EDUCATION_DATA.filter((e) => e.degree.startsWith('MBA'));
  const posGraduacoes = EDUCATION_DATA.filter((e) => e.degree.startsWith('PÓS-GRADUAÇÃO'));

  return (
    <div className="space-y-4 font-sans text-gray-900 select-none max-w-4xl mx-auto">
      {/* Retro Directory Header */}
      <div className="bg-[#c0c0c0] p-2 border-2 border-white border-r-gray-800 border-b-gray-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 font-bold">
          <User className="w-4 h-4 text-blue-900" />
          <span className="text-blue-950 font-bold">C:\MATEUS\SOBRE_MIM.DOC</span>
        </div>
        <span className="text-[11px] text-gray-700">PERFIL PROFISSIONAL OFICIAL</span>
      </div>

      {/* Main Container with Sidebar + Content (Classic Windows Help / Properties style) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Left Nav Menu */}
        <div className="bg-[#ECE9D8] p-2 border-2 border-white border-r-gray-800 border-b-gray-800 space-y-1 md:col-span-1">
          <div className="font-bold text-[11px] text-blue-950 px-2 py-1 bg-[#D4D0C8] border-2 border-white border-r-gray-800 border-b-gray-800 font-mono mb-1">
            ÍNDICE DE TÓPICOS
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  try { soundFx.playClick(); } catch (e) {}
                  setActiveSection(item.id);
                }}
                className={`w-full text-left px-2 py-1.5 text-xs flex items-center gap-2 cursor-pointer font-medium transition ${
                  isActive
                    ? 'bg-[#000080] text-white font-bold border border-blue-950 shadow-xs'
                    : 'text-gray-800 hover:bg-[#F5F4ED]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-yellow-300' : 'text-blue-900'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Content Panel */}
        <div className="bg-[#F5F4ED] border-2 border-gray-400 shadow-xs p-4 md:col-span-3 min-h-[420px] text-xs leading-relaxed space-y-4">
          {/* SECTION 1: PERFIL */}
          {activeSection === 'perfil' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b-2 border-yellow-600 pb-3">
                <div className="w-12 h-12 bg-[#000080] text-white border-2 border-white border-r-gray-800 border-b-gray-800 flex items-center justify-center font-mono text-xl font-bold">
                  MA
                </div>
                <div>
                  <h2 className="text-lg font-bold font-mono text-blue-950">{PROFILE_DATA.name}</h2>
                  <p className="text-[11.5px] text-blue-900 font-bold">{PROFILE_DATA.title}</p>
                </div>
              </div>

              <div className="bg-[#ECE9D8] border-2 border-white border-r-gray-800 border-b-gray-800 p-3.5 space-y-2">
                <h3 className="font-bold text-blue-950 font-mono text-xs">PERFIL PROFISSIONAL</h3>
                <p className="text-gray-800 leading-relaxed text-[11.5px]">
                  {PROFILE_DATA.availability}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {PROFILE_DATA.traits.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-[#F1F0E8] border border-gray-400 text-blue-950 text-[10px] font-mono font-bold"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-blue-950 font-mono">APRESENTAÇÃO</h3>
                <p className="text-gray-800 leading-relaxed text-[11.5px]">
                  {PROFILE_DATA.bioLong}
                </p>
              </div>

              <div className="border-t-2 border-gray-300 pt-3 italic text-gray-700 text-[11px] bg-[#FFFDE7] p-2 border border-amber-300">
                "{PROFILE_DATA.quote}"
              </div>
            </div>
          )}

          {/* SECTION 2: FORMAÇÃO ACADÊMICA */}
          {activeSection === 'formacao' && (
            <div className="space-y-4">
              <div className="border-b-2 border-blue-900 pb-2">
                <h2 className="text-base font-bold font-mono text-blue-950 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-800" />
                  <span>FORMAÇÃO ACADÊMICA — GRADUAÇÃO</span>
                </h2>
              </div>

              {graduacoes.map((edu) => (
                <div key={edu.id} className="p-3.5 bg-[#ECE9D8] border-2 border-white border-r-gray-800 border-b-gray-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-blue-950 font-mono">{edu.degree}</h3>
                    <span className="px-2 py-0.5 bg-[#E8F5E9] text-emerald-950 border border-emerald-500 text-[10px] font-mono font-bold">
                      {edu.status}
                    </span>
                  </div>
                  <p className="font-bold text-blue-900">{edu.institution}</p>
                  <p className="text-gray-800 leading-relaxed text-[11.5px]">{edu.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* SECTION 3: ESPECIALIZAÇÕES & MBAS */}
          {activeSection === 'especializacoes' && (
            <div className="space-y-4">
              <div className="border-b-2 border-blue-900 pb-2">
                <h2 className="text-base font-bold font-mono text-blue-950 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-yellow-700" />
                  <span>ESPECIALIZAÇÕES, MBAS E PÓS-GRADUAÇÃO</span>
                </h2>
              </div>

              <div className="space-y-3">
                <div className="font-bold text-xs text-blue-950 font-mono">MBAs CONCLUÍDOS / ESPECIALIZAÇÕES:</div>
                {mbas.map((edu) => (
                  <div key={edu.id} className="p-3 bg-[#ECE9D8] border-2 border-white border-r-gray-800 border-b-gray-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-blue-950 text-xs font-mono">{edu.degree}</h4>
                      <span className="px-1.5 py-0.2 bg-[#F1F0E8] text-blue-950 text-[10px] font-mono font-bold border border-gray-400">
                        {edu.institution}
                      </span>
                    </div>
                    <p className="text-gray-700 text-[11.5px]">{edu.description}</p>
                  </div>
                ))}

                <div className="font-bold text-xs text-blue-950 font-mono pt-2">PÓS-GRADUAÇÃO:</div>
                {posGraduacoes.map((edu) => (
                  <div key={edu.id} className="p-3 bg-[#ECE9D8] border-2 border-white border-r-gray-800 border-b-gray-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-blue-950 text-xs font-mono">{edu.degree}</h4>
                      <span className="px-1.5 py-0.2 bg-[#FFFDE7] text-amber-950 text-[10px] font-mono font-bold border border-amber-400">
                        {edu.institution}
                      </span>
                    </div>
                    <p className="text-gray-700 text-[11.5px]">{edu.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4: CURSOS ADICIONAIS */}
          {activeSection === 'cursos' && (
            <div className="space-y-3">
              <div className="border-b-2 border-blue-900 pb-2">
                <h2 className="text-base font-bold font-mono text-blue-950 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-800" />
                  <span>CURSOS ADICIONAIS E CAPACITAÇÃO</span>
                </h2>
              </div>

              <div className="space-y-2">
                {COURSES_DATA.map((course) => (
                  <div
                    key={course.id}
                    className={`p-2.5 border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11.5px] ${
                      course.id === 'course-1'
                        ? 'bg-[#E3F2FD] border-blue-600 font-medium'
                        : 'bg-[#ECE9D8] border-white border-r-gray-800 border-b-gray-800'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-blue-950 flex items-center gap-1.5">
                        <span>{course.name}</span>
                        {course.id === 'course-1' && (
                          <span className="px-1.5 py-0.2 bg-[#000080] text-yellow-300 text-[9px] font-bold">
                            ★ DESTAQUE
                          </span>
                        )}
                      </div>
                      <div className="text-gray-700 text-[10.5px]">Instituição: {course.issuer}</div>
                    </div>
                    <div className="text-right font-mono text-[10.5px] text-blue-950 font-bold">
                      {course.hours}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5: EXPERIÊNCIA PROFISSIONAL */}
          {activeSection === 'experiencia' && (
            <div className="space-y-4">
              <div className="border-b-2 border-blue-900 pb-2">
                <h2 className="text-base font-bold font-mono text-blue-950 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-blue-800" />
                  <span>EXPERIÊNCIA PROFISSIONAL</span>
                </h2>
              </div>

              {EXPERIENCE_DATA.map((exp) => (
                <div key={exp.id} className="p-4 bg-[#ECE9D8] border-2 border-white border-r-gray-800 border-b-gray-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-400 pb-2">
                    <div>
                      <h3 className="text-sm font-bold text-blue-950 font-mono">{exp.organization}</h3>
                      <p className="text-xs font-bold text-emerald-900">Posto/Graduação: {exp.role}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-[#000080] text-white font-mono text-[10.5px] font-bold mt-1 sm:mt-0">
                      {exp.period}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11.5px] text-gray-800">
                    <div className="font-bold text-blue-950">Principais Atribuições e Responsabilidades:</div>
                    <ul className="list-disc pl-5 space-y-1 leading-relaxed">
                      {exp.description.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-gray-300 flex flex-wrap gap-1.5">
                    {exp.skillsUsed.map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-[#F1F0E8] border border-gray-400 text-gray-800 text-[10px] font-mono"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SECTION 6: COMPETÊNCIAS & CONHECIMENTOS */}
          {activeSection === 'competencias' && (
            <div className="space-y-4">
              <div className="border-b-2 border-blue-900 pb-2">
                <h2 className="text-base font-bold font-mono text-blue-950 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-blue-800" />
                  <span>MATRIZ DE COMPETÊNCIAS E CONHECIMENTOS</span>
                </h2>
              </div>

              <div className="space-y-3">
                {SKILLS_DATA.map((cat, idx) => (
                  <div key={idx} className="p-3 bg-[#ECE9D8] border-2 border-white border-r-gray-800 border-b-gray-800 space-y-2">
                    <h4 className="font-bold text-blue-950 font-mono text-xs border-b border-gray-300 pb-1">
                      {cat.category}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      {cat.skills.map((s, sIdx) => (
                        <div key={sIdx} className="p-2 bg-[#F5F4ED] border border-gray-400 space-y-0.5">
                          <div className="font-bold text-blue-950 flex items-center justify-between">
                            <span>{s.name}</span>
                            <span className="text-[10px] font-mono text-blue-800 font-bold">{s.level}%</span>
                          </div>
                          <p className="text-gray-700 text-[10.5px] leading-tight">{s.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 7: OBJETIVOS PROFISSIONAIS */}
          {activeSection === 'objetivos' && (
            <div className="space-y-4">
              <div className="border-b-2 border-blue-900 pb-2">
                <h2 className="text-base font-bold font-mono text-blue-950 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-red-700" />
                  <span>OBJETIVOS PROFISSIONAIS & METAS 2026</span>
                </h2>
              </div>

              <div className="bg-[#ECE9D8] border-2 border-white border-r-gray-800 border-b-gray-800 p-3.5 space-y-2.5">
                <h3 className="font-bold text-blue-950 font-mono text-xs">DIRECIONAMENTO PROFISSIONAL</h3>
                <p className="text-gray-800 leading-relaxed text-[11.5px]">
                  {PROFILE_DATA.availability}
                </p>
                <div className="space-y-1.5 pt-1 text-[11.5px] text-gray-800">
                  <div className="font-bold text-blue-900">Metas e Focos Atuais:</div>
                  <ul className="list-disc pl-5 space-y-1 leading-relaxed">
                    {CURRENTLY_NOW_DATA.goals2026.map((g, idx) => (
                      <li key={idx}>{g}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="border-2 border-gray-400 p-3 bg-[#F1F0E8] space-y-2 text-[11.5px]">
                <div className="font-bold text-blue-950 font-mono">Estudos & Aprofundamento Ativo:</div>
                <ul className="list-disc pl-5 space-y-1 text-gray-800">
                  {CURRENTLY_NOW_DATA.studying.map((st, idx) => (
                    <li key={idx}>{st}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Retro Status Bar */}
      <div className="bg-[#c0c0c0] p-1.5 border-bevel-in text-[11px] font-mono text-gray-800 flex items-center justify-between">
        <span>STATUS: DADOS PROFISSIONAIS SINCRONIZADOS</span>
        <span>MATEUS OS 2000</span>
      </div>
    </div>
  );
};
