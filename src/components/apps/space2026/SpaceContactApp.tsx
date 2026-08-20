import React from 'react';
import {
  MessageCircle,
  Linkedin,
  Mail,
  Github,
  Phone,
  Sparkles,
  ExternalLink,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Compass
} from 'lucide-react';
import { PROFILE_DATA } from '../../../data/portfolioData';
import { soundFx } from '../../../utils/soundEffects';

export const SpaceContactApp: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 select-none font-sans text-slate-100 animate-fadeIn">
      {/* 2026 Futuristic Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-cyan-950/70 border border-cyan-500/30 p-6 backdrop-blur-xl shadow-[0_0_40px_rgba(6,182,212,0.15)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-400 to-cyan-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-mono text-white">COMMUNICATION HUB 2026</h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  CANAIS DIRETOS ATIVOS
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Conecte-se diretamente com Mateus Araujo para oportunidades, consultorias e projetos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Highlighted WhatsApp Card */}
      <a
        href={PROFILE_DATA.whatsapp}
        target="_blank"
        rel="noreferrer"
        onClick={() => { try { soundFx.playClick(); } catch (e) {} }}
        className="block p-6 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-950 to-teal-950/70 border-2 border-emerald-500/60 hover:border-emerald-400 transition-all duration-300 backdrop-blur-xl shadow-[0_0_35px_rgba(16,185,129,0.25)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] group cursor-pointer relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-3">
          <span className="px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-mono font-black text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-md">
            <Zap className="w-3 h-3 fill-current" />
            CANAL PRINCIPAL • RESPOSTA MAIS RÁPIDA
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-slate-950 shadow-lg group-hover:scale-110 transition-transform">
            <MessageCircle className="w-8 h-8 fill-current" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold font-mono text-white group-hover:text-emerald-300 transition-colors">
                WHATSAPP DIRETO
              </h2>
              <ExternalLink className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xs text-emerald-200/90 font-mono font-bold">
              {PROFILE_DATA.phoneFormatted}
            </p>
            <p className="text-xs text-slate-300 max-w-xl">
              Canal prioritário para propostas de trabalho, parcerias profissionais e contato instantâneo.
            </p>
          </div>
        </div>
      </a>

      {/* Secondary Channels Grid: LinkedIn, E-mail, GitHub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* LinkedIn Card */}
        <a
          href={PROFILE_DATA.linkedin}
          target="_blank"
          rel="noreferrer"
          onClick={() => { try { soundFx.playClick(); } catch (e) {} }}
          className="p-5 rounded-2xl bg-black/75 hover:bg-blue-950/70 border border-cyan-950 hover:border-cyan-400 transition-all duration-300 backdrop-blur-xl shadow-[0_0_20px_rgba(0,10,30,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.35)] group cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                <Linkedin className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-cyan-300 border border-cyan-800">
                REDE PROFISSIONAL
              </span>
            </div>

            <h3 className="font-bold text-sm text-white font-mono group-hover:text-cyan-300">
              LINKEDIN
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Conecte-se para networking, artigos e histórico profissional consolidado.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-cyan-950 flex items-center justify-between text-xs font-mono text-cyan-400">
            <span>Acessar Perfil</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        </a>

        {/* E-mail Card */}
        <a
          href={`mailto:${PROFILE_DATA.email}`}
          onClick={() => { try { soundFx.playClick(); } catch (e) {} }}
          className="p-5 rounded-2xl bg-black/75 hover:bg-blue-950/70 border border-cyan-950 hover:border-cyan-400 transition-all duration-300 backdrop-blur-xl shadow-[0_0_20px_rgba(0,10,30,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.35)] group cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                CORRESPONDÊNCIA
              </span>
            </div>

            <h3 className="font-bold text-sm text-white font-mono group-hover:text-cyan-300">
              E-MAIL PROFISSIONAL
            </h3>
            <p className="text-xs text-cyan-300 font-mono mt-1 truncate">
              {PROFILE_DATA.email}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Ideal para envio formal de documentos, propostas e briefings detalhados.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-cyan-950 flex items-center justify-between text-xs font-mono text-cyan-400">
            <span>Enviar E-mail</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        </a>

        {/* GitHub Card */}
        <a
          href={PROFILE_DATA.github}
          target="_blank"
          rel="noreferrer"
          onClick={() => { try { soundFx.playClick(); } catch (e) {} }}
          className="p-5 rounded-2xl bg-black/75 hover:bg-blue-950/70 border border-cyan-950 hover:border-cyan-400 transition-all duration-300 backdrop-blur-xl shadow-[0_0_20px_rgba(0,10,30,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.35)] group cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                <Github className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                CÓDIGO FONTE
              </span>
            </div>

            <h3 className="font-bold text-sm text-white font-mono group-hover:text-cyan-300">
              GITHUB
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Repositórios públicos, projetos em React, automações e experimentos.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-cyan-950 flex items-center justify-between text-xs font-mono text-cyan-400">
            <span>Ver Repositórios</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        </a>
      </div>
    </div>
  );
};
