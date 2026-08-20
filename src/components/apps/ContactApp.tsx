import React from 'react';
import {
  Mail,
  Linkedin,
  Github,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  BookUser,
  ArrowUpRight
} from 'lucide-react';
import { PROFILE_DATA } from '../../data/portfolioData';
import { soundFx } from '../../utils/soundEffects';

interface ContactAppProps {
  mode?: 'retro' | 'space';
}

export const ContactApp: React.FC<ContactAppProps> = ({ mode = 'retro' }) => {
  const isRetro = mode === 'retro';

  const handleLinkClick = () => {
    try {
      soundFx.playClick();
    } catch (e) {}
  };

  // =========================================================================
  // RETRO 2000: AGENDA DE CONTATOS CLÁSSICA (CONTACT.EXE)
  // =========================================================================
  if (isRetro) {
    return (
      <div className="space-y-4 font-sans text-gray-900 select-none max-w-2xl mx-auto">
        {/* Retro Header Bar */}
        <div className="bg-[#c0c0c0] p-2 border-2 border-white border-r-gray-800 border-b-gray-800 flex items-center justify-between text-xs font-mono shadow-xs">
          <div className="flex items-center gap-2 font-bold">
            <BookUser className="w-4 h-4 text-blue-900" />
            <span className="text-blue-950 font-bold">C:\MATEUS\CONTACT.EXE</span>
          </div>
          <span className="text-[11px] text-gray-700 font-bold">AGENDA DE CONTATOS</span>
        </div>

        {/* Presentation Banner */}
        <div className="bg-[#F5F4ED] border-2 border-gray-400 p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-200 border-2 border-emerald-700 flex items-center justify-center text-xl shadow-inner shrink-0">
            📇
          </div>
          <div>
            <h2 className="text-sm font-black font-mono text-blue-950 tracking-wide">
              CONTATO
            </h2>
            <p className="text-xs text-gray-700 font-sans mt-0.5">
              Escolha um canal para falar comigo.
            </p>
          </div>
        </div>

        {/* Retro Contact Channels */}
        <div className="bg-[#F5F4ED] border-2 border-gray-400 p-4 space-y-3.5 shadow-xs">
          {/* 1. WHATSAPP (CANAL PRINCIPAL EM DESTAQUE) */}
          <div className="p-3 bg-[#E8F5E9] border-2 border-emerald-700 border-r-emerald-950 border-b-emerald-950 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-emerald-600 text-white rounded-xs flex items-center justify-center text-base border border-emerald-900 shadow-xs">
                  💬
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-emerald-950">
                      WHATSAPP
                    </span>
                    <span className="text-[9px] font-mono bg-emerald-300 text-emerald-950 px-1.5 py-0.2 rounded-xs font-black border border-emerald-600">
                      CANAL PRINCIPAL
                    </span>
                  </div>
                  <span className="text-xs text-emerald-900">Falar diretamente</span>
                </div>
              </div>
            </div>

            <a
              href={PROFILE_DATA.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
              className="w-full py-2.5 px-4 bg-[#2e7d32] hover:bg-[#1b5e20] text-white border-2 border-white border-r-emerald-950 border-b-emerald-950 flex items-center justify-center gap-2 font-mono font-black text-xs cursor-pointer shadow active:border-emerald-950 active:border-r-white active:border-b-white transition"
            >
              <MessageCircle className="w-4 h-4 text-emerald-200" />
              <span>ABRIR WHATSAPP</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-200" />
            </a>
          </div>

          {/* Demais Canais (LinkedIn, E-mail, GitHub) */}
          <div className="space-y-2 pt-1">
            <span className="font-mono text-[11px] font-bold text-gray-700 block">
              OUTROS CANAIS DIRETOS:
            </span>

            {/* 2. LINKEDIN */}
            <a
              href={PROFILE_DATA.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
              className="p-2.5 bg-white hover:bg-[#E3F2FD] border-2 border-white border-r-gray-800 border-b-gray-800 flex items-center justify-between group transition cursor-pointer shadow-xs active:border-gray-800 active:border-r-white active:border-b-white"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 bg-[#0077B5] text-white rounded-xs flex items-center justify-center text-xs font-bold shrink-0">
                  in
                </div>
                <div>
                  <div className="font-mono font-bold text-xs text-blue-950">
                    LINKEDIN
                  </div>
                  <div className="text-[11px] text-gray-600">
                    Perfil profissional
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-blue-900 group-hover:translate-x-0.5 transition-transform">
                <span>Acessar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </a>

            {/* 3. E-MAIL */}
            <a
              href={`mailto:${PROFILE_DATA.email}`}
              onClick={handleLinkClick}
              className="p-2.5 bg-white hover:bg-[#FFF3E0] border-2 border-white border-r-gray-800 border-b-gray-800 flex items-center justify-between group transition cursor-pointer shadow-xs active:border-gray-800 active:border-r-white active:border-b-white"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 bg-amber-600 text-white rounded-xs flex items-center justify-center text-xs font-bold shrink-0">
                  ✉️
                </div>
                <div>
                  <div className="font-mono font-bold text-xs text-amber-950">
                    E-MAIL
                  </div>
                  <div className="text-[11px] text-gray-600">
                    Enviar e-mail
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-900 group-hover:translate-x-0.5 transition-transform">
                <span>Escrever</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </a>

            {/* 4. GITHUB */}
            <a
              href={PROFILE_DATA.github}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
              className="p-2.5 bg-white hover:bg-[#ECEFF1] border-2 border-white border-r-gray-800 border-b-gray-800 flex items-center justify-between group transition cursor-pointer shadow-xs active:border-gray-800 active:border-r-white active:border-b-white"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 bg-gray-900 text-white rounded-xs flex items-center justify-center text-xs font-bold shrink-0">
                  <Github className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-mono font-bold text-xs text-gray-950">
                    GITHUB
                  </div>
                  <div className="text-[11px] text-gray-600">
                    Projetos e códigos
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-gray-900 group-hover:translate-x-0.5 transition-transform">
                <span>Ver repositórios</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </a>
          </div>
        </div>

        {/* Retro Status Bar */}
        <div className="bg-[#c0c0c0] p-1.5 border-bevel-in text-[11px] font-mono text-gray-800 flex items-center justify-between">
          <span>STATUS: CANAIS DIRETOS DISPONÍVEIS</span>
          <span>MATEUS OS 2000</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MODERN 2026: PAINEL TECNOLÓGICO DE CONTATO DIRETO
  // =========================================================================
  return (
    <div className="space-y-5 font-sans text-slate-100 select-none max-w-2xl mx-auto">
      {/* Modern Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-cyan-950/80 border border-cyan-500/30 backdrop-blur-md shadow-[0_0_30px_rgba(6,182,212,0.15)] flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/30 shrink-0">
          💬
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-black tracking-wider text-white">
            CONTATO
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            Escolha um canal para falar comigo.
          </p>
        </div>
      </div>

      {/* Main Channels Panel */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-cyan-500/20 backdrop-blur-md shadow-lg space-y-4">
        {/* 1. WHATSAPP (CANAL PRINCIPAL EM DESTAQUE) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/90 via-emerald-900/40 to-slate-900/90 border-2 border-emerald-500/50 hover:border-emerald-400 transition-all duration-300 shadow-[0_0_25px_rgba(16,185,129,0.2)] space-y-3.5 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center text-xl shadow-lg shadow-emerald-500/40 group-hover:scale-105 transition-transform">
                <MessageCircle className="w-6 h-6 fill-current text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-white tracking-wide">
                    WHATSAPP
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-bold">
                    PRINCIPAL
                  </span>
                </div>
                <p className="text-xs text-emerald-200/90 mt-0.5">
                  Falar diretamente
                </p>
              </div>
            </div>
          </div>

          <a
            href={PROFILE_DATA.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleLinkClick}
            className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black font-mono text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 active:scale-[0.98] transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>ABRIR WHATSAPP</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

        {/* Demais Canais (LinkedIn, E-mail, GitHub) */}
        <div className="space-y-2.5 pt-1">
          <span className="font-mono text-[11px] font-bold text-cyan-400/80 tracking-wider block">
            OUTROS CANAIS PROFISSIONAIS
          </span>

          {/* 2. LINKEDIN */}
          <a
            href={PROFILE_DATA.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleLinkClick}
            className="p-3.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/50 flex items-center justify-between group transition cursor-pointer shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#0077B5] text-white flex items-center justify-center text-sm font-bold shrink-0 shadow">
                <Linkedin className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-blue-300 transition">
                  LINKEDIN
                </h4>
                <p className="text-[11px] text-slate-400">
                  Perfil profissional
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-mono font-bold text-blue-400 group-hover:text-blue-300 group-hover:translate-x-1 transition">
              <span>Acessar</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </a>

          {/* 3. E-MAIL */}
          <a
            href={`mailto:${PROFILE_DATA.email}`}
            onClick={handleLinkClick}
            className="p-3.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/50 flex items-center justify-between group transition cursor-pointer shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-300 transition">
                  E-MAIL
                </h4>
                <p className="text-[11px] text-slate-400">
                  Enviar e-mail
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-400 group-hover:text-amber-300 group-hover:translate-x-1 transition">
              <span>Enviar</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </a>

          {/* 4. GITHUB */}
          <a
            href={PROFILE_DATA.github}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleLinkClick}
            className="p-3.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-500/50 flex items-center justify-between group transition cursor-pointer shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow border border-slate-700">
                <Github className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-slate-300 transition">
                  GITHUB
                </h4>
                <p className="text-[11px] text-slate-400">
                  Projetos e códigos
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-300 group-hover:translate-x-1 transition">
              <span>Repositórios</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};
