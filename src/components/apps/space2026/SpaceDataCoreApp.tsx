import React, { useState } from 'react';
import {
  Database,
  User,
  GraduationCap,
  Briefcase,
  Layers,
  FileText,
  Mail,
  Cpu,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity,
  Award,
  Clock,
  Sparkles,
  GitBranch
} from 'lucide-react';
import {
  PROFILE_DATA,
  PROJECTS_DATA,
  EDUCATION_DATA,
  EXPERIENCE_DATA,
  COURSES_DATA,
  SYSTEM_HISTORY_EVENTS,
  CURRENT_MISSION_DATA
} from '../../../data/portfolioData';
import { soundFx } from '../../../utils/soundEffects';

interface SpaceDataCoreAppProps {
  initialSection?: 'profile' | 'projects' | 'education' | 'experience' | 'timeline' | 'documents' | 'contact';
}

export const SpaceDataCoreApp: React.FC<SpaceDataCoreAppProps> = ({ initialSection = 'profile' }) => {
  const [activeSection, setActiveSection] = useState<
    'profile' | 'projects' | 'education' | 'experience' | 'timeline' | 'documents' | 'contact'
  >(initialSection);

  const [selectedTimelineNode, setSelectedTimelineNode] = useState<number>(0);

  const sections = [
    { id: 'profile', label: 'PROFILE', icon: User, desc: 'Perfil & Biografia' },
    { id: 'projects', label: 'PROJECTS', icon: Layers, desc: 'Project Explorer' },
    { id: 'education', label: 'EDUCATION', icon: GraduationCap, desc: 'Formação & MBAs' },
    { id: 'experience', label: 'EXPERIENCE', icon: Briefcase, desc: 'Atuação Militar & Gestão' },
    { id: 'timeline', label: 'TIMELINE', icon: GitBranch, desc: 'Marcos Orbitais' },
    { id: 'documents', label: 'DOCUMENTS', icon: FileText, desc: 'Currículo & Certificados' },
    { id: 'contact', label: 'CONTACT', icon: Mail, desc: 'Canais de Conexão' }
  ] as const;

  return (
    <div className="max-w-6xl mx-auto space-y-6 select-none font-sans text-slate-100 animate-fadeIn">
      {/* 2026 Header HUD */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-cyan-950/70 border border-cyan-500/30 p-6 backdrop-blur-xl shadow-[0_0_40px_rgba(6,182,212,0.15)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(6,182,212,0.5)]">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-mono text-white">DATA CORE 2026</h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  CENTRAL REPOSITORY
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Evolução Arquitetural de &quot;Meu Computador&quot; • Acesso Unificado ao Portfólio
              </p>
            </div>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-blue-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>MATEUS ARAUJO // SISTEMA 2026</span>
          </div>
        </div>
      </div>

      {/* Main Container: Navigation Sidebar + Content View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Navigation Pills */}
        <div className="lg:col-span-3 space-y-2">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-2 px-1 pb-1">
            <Activity className="w-3.5 h-3.5" />
            <span>Módulos de Dados</span>
          </div>

          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => {
                  try { soundFx.playClick(); } catch (e) {}
                  setActiveSection(sec.id);
                }}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-900/90 to-cyan-950/90 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                    : 'bg-black/60 border-cyan-950/80 hover:border-cyan-700 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-blue-950 text-cyan-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="font-mono text-xs font-bold">{sec.label}</div>
                    <div className="text-[10px] text-slate-400 truncate">{sec.desc}</div>
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive ? 'text-cyan-400 translate-x-0.5' : 'text-slate-600'
                  }`}
                />
              </button>
            );
          })}

          <div className="mt-4 p-3.5 rounded-xl bg-blue-950/30 border border-cyan-950 text-[11px] font-mono text-slate-400 space-y-1">
            <div className="text-cyan-300 font-bold">STATUS DA INTEGRAÇÃO</div>
            <div>• Continuidade com OS 00: Ativa</div>
            <div>• Repositório: Verificado</div>
          </div>
        </div>

        {/* Right Content Panel */}
        <div className="lg:col-span-9 p-6 rounded-2xl bg-black/75 border border-cyan-500/30 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.15)] min-h-[440px]">
          {/* =========================================================================
              SECTION: PROFILE
             ========================================================================= */}
          {activeSection === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-cyan-900/50">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                    MÓDULO DE IDENTIDADE
                  </span>
                  <h2 className="text-lg font-bold font-mono text-white">{PROFILE_DATA.name}</h2>
                  <p className="text-xs text-cyan-200">{PROFILE_DATA.title}</p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-600/40 text-xs font-mono">
                  {PROFILE_DATA.location}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-blue-950/40 border border-cyan-900/50 text-xs text-slate-300 leading-relaxed space-y-3">
                <h3 className="font-mono text-cyan-300 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Resumo Profissional</span>
                </h3>
                <p>{PROFILE_DATA.bioLong}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-black/50 border border-cyan-950 space-y-2">
                  <h4 className="font-mono text-xs text-cyan-400 font-bold">Pilares de Atuação</h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">▸</span>
                      <span>Logística Integrada & Gestão de Supply Chain</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">▸</span>
                      <span>Administração Pública, Normativas & Licitações</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">▸</span>
                      <span>Finanças, Controladoria & Métricas de Processo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">▸</span>
                      <span>Inteligência Artificial Aplicada & Engenharia de Prompt</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-black/50 border border-cyan-950 space-y-2">
                  <h4 className="font-mono text-xs text-cyan-400 font-bold">Foco Atual (2026)</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {CURRENT_MISSION_DATA.professionalFocus}
                  </p>
                  <div className="pt-2">
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-1 rounded border border-emerald-800">
                      DISPONÍVEL PARA CONEXÃO & NOVOS DESAFIOS
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              SECTION: PROJECTS
             ========================================================================= */}
          {activeSection === 'projects' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-cyan-900/50">
                <div>
                  <h2 className="text-base font-bold font-mono text-white">PROJECT EXPLORER // DATA CORE</h2>
                  <p className="text-xs text-slate-400">Trabalhos em Destaque e Aplicações Web</p>
                </div>
                <span className="text-xs font-mono text-cyan-400">{PROJECTS_DATA.length} Projetos</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PROJECTS_DATA.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-4 rounded-xl bg-blue-950/30 border border-cyan-900/60 hover:border-cyan-500 transition space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                        {proj.category}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {proj.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-mono text-sm font-bold text-white">{proj.name}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">{proj.tagline}</p>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {proj.technologies.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-black/60 text-cyan-300 font-mono text-[10px] border border-cyan-900"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    {proj.github && (
                      <div className="pt-2 border-t border-cyan-950">
                        <a
                          href={proj.github}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1.5"
                        >
                          <span>Ver Código no GitHub</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              SECTION: EDUCATION
             ========================================================================= */}
          {activeSection === 'education' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-cyan-900/50">
                <div>
                  <h2 className="text-base font-bold font-mono text-white">FORMAÇÃO & ESPECIALIZAÇÕES</h2>
                  <p className="text-xs text-slate-400">Graduação Superior, MBAs Executivos e Pós-Graduação</p>
                </div>
              </div>

              <div className="space-y-3">
                {EDUCATION_DATA.map((edu) => (
                  <div
                    key={edu.id}
                    className="p-4 rounded-xl bg-blue-950/30 border border-cyan-900/60 space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="font-mono text-sm font-bold text-white flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>{edu.degree}</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-700/60 w-fit">
                        {edu.status}
                      </span>
                    </div>
                    <div className="text-xs text-cyan-300 font-mono">
                      {edu.institution} • {edu.type} • {edu.year}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{edu.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              SECTION: EXPERIENCE
             ========================================================================= */}
          {activeSection === 'experience' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-cyan-900/50">
                <div>
                  <h2 className="text-base font-bold font-mono text-white">TRAJETÓRIA PROFISSIONAL</h2>
                  <p className="text-xs text-slate-400">Experiência Militar e Rotinas Administrativas (11ª RM)</p>
                </div>
              </div>

              {EXPERIENCE_DATA.map((exp) => (
                <div
                  key={exp.id}
                  className="p-4 rounded-xl bg-blue-950/30 border border-cyan-900/60 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="font-mono text-sm font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{exp.role}</span>
                    </div>
                    <span className="text-xs font-mono text-cyan-400">{exp.period}</span>
                  </div>
                  <div className="text-xs text-cyan-200 font-mono">
                    {exp.organization} • {exp.location}
                  </div>
                  <div className="space-y-2 text-xs text-slate-300">
                    {exp.description.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold">▸</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* =========================================================================
              SECTION: TIMELINE (MARCOS ORBITAIS)
             ========================================================================= */}
          {activeSection === 'timeline' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-cyan-900/50">
                <div>
                  <h2 className="text-base font-bold font-mono text-white">TIMELINE ORBITAL // 2019 ➔ 2026</h2>
                  <p className="text-xs text-slate-400">Navegador Sequencial de Marcos de Carreira</p>
                </div>
              </div>

              {/* Orbital Nodes Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {SYSTEM_HISTORY_EVENTS.map((event, idx) => {
                  const isSelected = selectedTimelineNode === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        try { soundFx.playClick(); } catch (e) {}
                        setSelectedTimelineNode(idx);
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.6)]'
                          : 'bg-black/60 border-cyan-950 hover:border-cyan-700 text-slate-300'
                      }`}
                    >
                      <div className="text-[10px] font-mono tracking-wider">{event.tag}</div>
                      <div className="text-xs font-mono font-bold mt-1">{event.year}</div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Node Details */}
              {SYSTEM_HISTORY_EVENTS[selectedTimelineNode] && (
                <div className="p-5 rounded-2xl bg-blue-950/40 border border-cyan-400/40 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                      {SYSTEM_HISTORY_EVENTS[selectedTimelineNode].category}
                    </span>
                    <span className="text-xs font-mono text-amber-300 font-bold">
                      {SYSTEM_HISTORY_EVENTS[selectedTimelineNode].year}
                    </span>
                  </div>

                  <h3 className="text-base font-bold font-mono text-white">
                    {SYSTEM_HISTORY_EVENTS[selectedTimelineNode].title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {SYSTEM_HISTORY_EVENTS[selectedTimelineNode].description}
                  </p>

                  {SYSTEM_HISTORY_EVENTS[selectedTimelineNode].details && (
                    <div className="space-y-1 pt-2 border-t border-cyan-900/60">
                      {SYSTEM_HISTORY_EVENTS[selectedTimelineNode].details?.map((d, i) => (
                        <div key={i} className="text-xs text-slate-400 flex items-start gap-2">
                          <span className="text-cyan-400">▸</span>
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              SECTION: DOCUMENTS
             ========================================================================= */}
          {activeSection === 'documents' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-cyan-900/50">
                <div>
                  <h2 className="text-base font-bold font-mono text-white">DOCUMENTOS & CERTIFICAÇÕES</h2>
                  <p className="text-xs text-slate-400">Acesso a Cursos e Qualificações Técnicas</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {COURSES_DATA.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl bg-blue-950/30 border border-cyan-900/60 flex items-start gap-3"
                  >
                    <Award className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-mono text-xs font-bold text-white">{c.name}</h4>
                      <div className="text-[11px] text-cyan-300 font-mono mt-0.5">
                        {c.issuer} • {c.hours}
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 font-semibold mt-1 inline-block">
                        {c.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              SECTION: CONTACT
             ========================================================================= */}
          {activeSection === 'contact' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-cyan-900/50">
                <div>
                  <h2 className="text-base font-bold font-mono text-white">CANAIS DE CONEXÃO DIRETA</h2>
                  <p className="text-xs text-slate-400">Comunicação e Redes Profissionais</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href={PROFILE_DATA.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 rounded-xl bg-blue-950/40 border border-cyan-900 hover:border-cyan-400 transition flex items-center justify-between group"
                >
                  <div>
                    <div className="font-mono text-xs font-bold text-white group-hover:text-cyan-300">
                      LinkedIn Oficial
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{PROFILE_DATA.linkedin}</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-cyan-400" />
                </a>

                <a
                  href={PROFILE_DATA.github}
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 rounded-xl bg-blue-950/40 border border-cyan-900 hover:border-cyan-400 transition flex items-center justify-between group"
                >
                  <div>
                    <div className="font-mono text-xs font-bold text-white group-hover:text-cyan-300">
                      GitHub
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{PROFILE_DATA.github}</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-cyan-400" />
                </a>

                <a
                  href={`mailto:${PROFILE_DATA.email}`}
                  className="p-4 rounded-xl bg-blue-950/40 border border-cyan-900 hover:border-cyan-400 transition flex items-center justify-between group"
                >
                  <div>
                    <div className="font-mono text-xs font-bold text-white group-hover:text-cyan-300">
                      Email Direto
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{PROFILE_DATA.email}</div>
                  </div>
                  <Mail className="w-4 h-4 text-cyan-400" />
                </a>

                <a
                  href={PROFILE_DATA.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 rounded-xl bg-blue-950/40 border border-cyan-900 hover:border-emerald-400 transition flex items-center justify-between group"
                >
                  <div>
                    <div className="font-mono text-xs font-bold text-white group-hover:text-emerald-300">
                      WhatsApp Oficial
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{PROFILE_DATA.phoneFormatted}</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-emerald-400" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
