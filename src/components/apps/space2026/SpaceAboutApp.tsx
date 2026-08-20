import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  Award,
  Briefcase,
  Cpu,
  Target,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Download,
  ExternalLink,
  Code,
  Layers,
  Terminal,
  FileText
} from 'lucide-react';
import {
  PROFILE_DATA,
  EDUCATION_DATA,
  COURSES_DATA,
  EXPERIENCE_DATA,
  SKILLS_DATA,
  CURRENTLY_NOW_DATA
} from '../../../data/portfolioData';
import { soundFx } from '../../../utils/soundEffects';

export const SpaceAboutApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'education' | 'experience' | 'skills' | 'goals'>('profile');

  const graduacoes = EDUCATION_DATA.filter((e) => e.type === 'Graduação');
  const mbas = EDUCATION_DATA.filter((e) => e.degree.startsWith('MBA'));
  const posGraduacoes = EDUCATION_DATA.filter((e) => e.degree.startsWith('PÓS-GRADUAÇÃO'));

  return (
    <div className="max-w-5xl mx-auto space-y-6 select-none font-sans text-slate-100 animate-fadeIn">
      {/* 2026 Modern Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-cyan-950/70 border border-cyan-500/30 p-6 backdrop-blur-xl shadow-[0_0_40px_rgba(6,182,212,0.15)]">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-900 p-0.5 shadow-[0_0_25px_rgba(56,189,248,0.5)]">
                <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center text-cyan-300 font-mono font-black text-2xl">
                  MA
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center" title="Disponível para Projetos">
                <span className="w-2 h-2 rounded-full bg-emerald-200 animate-ping" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
                  {PROFILE_DATA.fullName}
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                  2026 PROFILE
                </span>
              </div>
              <p className="text-xs sm:text-sm text-cyan-300 font-mono mt-0.5">
                {PROFILE_DATA.title}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xl line-clamp-2">
                {PROFILE_DATA.headline}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <a
              href={PROFILE_DATA.linkedin}
              target="_blank"
              rel="noreferrer"
              onClick={() => { try { soundFx.playClick(); } catch (e) {} }}
              className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-cyan-200 text-xs font-mono font-semibold flex items-center gap-1.5 transition shadow-sm hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>LinkedIn</span>
            </a>
            <a
              href={PROFILE_DATA.whatsapp}
              target="_blank"
              rel="noreferrer"
              onClick={() => { try { soundFx.playClick(); } catch (e) {} }}
              className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-200 text-xs font-mono font-semibold flex items-center gap-1.5 transition shadow-sm hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]"
            >
              <span>WhatsApp Direto</span>
            </a>
          </div>
        </div>

        {/* Dynamic Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-cyan-500/20">
          {PROFILE_DATA.stats.map((stat, i) => (
            <div key={i} className="p-2.5 rounded-xl bg-black/40 border border-cyan-900/40">
              <div className="text-lg sm:text-xl font-bold font-mono text-cyan-300">
                {stat.value}
              </div>
              <div className="text-[11px] text-slate-400 leading-snug">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modern Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-cyan-900/50 backdrop-blur-md overflow-x-auto">
        {[
          { id: 'profile', label: 'Visão Geral', icon: User },
          { id: 'education', label: 'Formação & MBAs', icon: GraduationCap },
          { id: 'experience', label: 'Trajetória Profissional', icon: Briefcase },
          { id: 'skills', label: 'Pilares & Competências', icon: Cpu },
          { id: 'goals', label: 'Metas 2026', icon: Target },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                try { soundFx.playClick(); } catch (e) {}
                setActiveTab(tab.id as any);
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-mono font-semibold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Profile & Overview */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/20 backdrop-blur-md space-y-3">
              <h2 className="text-sm font-bold font-mono text-cyan-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>BIOGRAFIA EXECUTIVA</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {PROFILE_DATA.bioLong}
              </p>
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-xs font-mono text-cyan-200 italic">
                "{PROFILE_DATA.quote}"
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/20 backdrop-blur-md space-y-3">
              <h2 className="text-sm font-bold font-mono text-cyan-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>DISPONIBILIDADE & PERFIL DE ATUAÇÃO</span>
              </h2>
              <p className="text-xs text-slate-300">
                {PROFILE_DATA.availability}
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                {PROFILE_DATA.traits.map((trait, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-cyan-900/30 text-xs font-mono text-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{trait}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/20 backdrop-blur-md space-y-3">
              <h3 className="text-xs font-bold font-mono text-cyan-300 uppercase">
                Informações de Contato
              </h3>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2 rounded-lg bg-black/40 border border-slate-800">
                  <div className="text-[10px] text-slate-400">E-mail Oficial</div>
                  <div className="text-cyan-200 truncate">{PROFILE_DATA.email}</div>
                </div>
                <div className="p-2 rounded-lg bg-black/40 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Telefone / WhatsApp</div>
                  <div className="text-cyan-200">{PROFILE_DATA.phoneFormatted}</div>
                </div>
                <div className="p-2 rounded-lg bg-black/40 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Localização</div>
                  <div className="text-cyan-200">{PROFILE_DATA.location}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Education & MBAs */}
      {activeTab === 'education' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Graduação & Pós */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold font-mono text-cyan-300 uppercase flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                <span>Graduação Superior Concluída</span>
              </h3>
              {graduacoes.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-md space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-xs font-mono text-white">{item.degree}</h4>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-cyan-300 font-mono">{item.institution}</p>
                  <p className="text-xs text-slate-400">{item.description}</p>
                </div>
              ))}

              <h3 className="text-xs font-bold font-mono text-cyan-300 uppercase flex items-center gap-2 pt-2">
                <Award className="w-4 h-4" />
                <span>Pós-Graduação & Especializações</span>
              </h3>
              {posGraduacoes.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-md space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-xs font-mono text-white">{item.degree}</h4>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-cyan-300 font-mono">{item.institution}</p>
                  <p className="text-xs text-slate-400">{item.description}</p>
                </div>
              ))}
            </div>

            {/* MBAs */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold font-mono text-cyan-300 uppercase flex items-center gap-2">
                <Award className="w-4 h-4 text-cyan-400" />
                <span>Especializações Executivas (MBAs)</span>
              </h3>
              {mbas.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-md space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-xs font-mono text-white">{item.degree}</h4>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-blue-950 text-sky-300 border border-blue-700">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-cyan-300 font-mono">{item.institution}</p>
                  <p className="text-xs text-slate-400">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cursos Adicionais & Capacitações */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/20 backdrop-blur-md space-y-3">
            <h3 className="text-xs font-bold font-mono text-cyan-300 uppercase">
              Cursos Técnicos & Certificações Relevantes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {COURSES_DATA.map((c) => (
                <div key={c.id} className="p-3 rounded-xl bg-black/40 border border-cyan-900/40 space-y-1">
                  <div className="text-xs font-bold text-slate-200">{c.name}</div>
                  <div className="text-[11px] text-cyan-400 font-mono">{c.issuer} • {c.hours}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Experience */}
      {activeTab === 'experience' && (
        <div className="space-y-4">
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-cyan-400 before:via-blue-600 before:to-indigo-900">
            {EXPERIENCE_DATA.map((exp, idx) => (
              <div key={exp.id || idx} className="relative p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/20 backdrop-blur-md space-y-3">
                <div className="absolute -left-[31px] top-6 w-4 h-4 rounded-full bg-cyan-400 border-2 border-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold font-mono text-white">{exp.role}</h3>
                    <p className="text-xs font-mono text-cyan-300">{exp.organization} • {exp.location}</p>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-600/60">
                    {exp.period}
                  </span>
                </div>
                <div className="text-xs text-slate-300 leading-relaxed space-y-1">
                  {Array.isArray(exp.description) ? (
                    exp.description.map((d, dIdx) => <p key={dIdx}>{d}</p>)
                  ) : (
                    <p>{exp.description}</p>
                  )}
                </div>
                {exp.highlights && (
                  <div className="space-y-1.5 pt-2">
                    <div className="text-[11px] font-mono text-cyan-300 font-semibold">Destaques & Responsabilidades:</div>
                    {exp.highlights.map((ach, aIdx) => (
                      <div key={aIdx} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{ach}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Skills Matrix */}
      {activeTab === 'skills' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SKILLS_DATA.map((cat, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/20 backdrop-blur-md space-y-3">
              <h3 className="text-xs font-bold font-mono text-cyan-300 uppercase flex items-center justify-between">
                <span>{cat.category}</span>
                <span className="text-[10px] text-slate-400 font-normal">{cat.skills.length} competências</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {cat.skills.map((s, sIdx) => (
                  <span
                    key={sIdx}
                    className="px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-cyan-200 text-xs font-mono"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: Goals 2026 */}
      {activeTab === 'goals' && (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/20 backdrop-blur-md space-y-4">
          <h2 className="text-sm font-bold font-mono text-cyan-300 flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            <span>OBJETIVOS PROFISSIONAIS & DIRETRIZES 2026</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                title: 'Atuação em Logística & Supply Chain',
                desc: 'Integração de processos operacionais, gestão de estoques, planejamento estratégico e redução de custos logísticos.'
              },
              {
                title: 'Engenharia de Prompt & IA Aplicada',
                desc: 'Desenvolvimento de sistemas de automação inteligentes, orquestração de LLMs e fluxos de trabalho autônomos.'
              },
              {
                title: 'Gestão Pública & Conformidade',
                desc: 'Aplicação de boas práticas em governança, processos licitatórios e gestão orçamentária transparente.'
              },
              {
                title: 'Desenvolvimento Profissional Contínuo',
                desc: 'Constante atualização em novas ferramentas computacionais, metodologias ágeis e inovação digital.'
              }
            ].map((goal, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-black/40 border border-cyan-900/40 space-y-1.5">
                <div className="font-bold text-xs font-mono text-white flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  {goal.title}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {goal.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
