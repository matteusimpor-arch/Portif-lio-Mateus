import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, ChevronRight, Bot, Compass, Shield, Cpu, MessageSquare } from 'lucide-react';
import { soundFx } from '../../../utils/soundEffects';

interface SpaceClippyProps {
  onOpenModule: (nodeId: string) => void;
  onBackToRetro: () => void;
}

export const SpaceClippy: React.FC<SpaceClippyProps> = ({ onOpenModule, onBackToRetro }) => {
  // Silent by default (no auto-opening speech bubble)
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [tipIndex, setTipIndex] = useState<number>(0);
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const tips = [
    {
      title: 'MATEUS SPACE 2026 CORE',
      text: 'Bem-vindo ao Deep Blue Space! Esta é a visão contemporânea do portfólio de Mateus Araujo. Todos os módulos contam com tecnologia futurista e gravidade zero.',
      actionLabel: 'Explorar Sobre Mim',
      actionId: 'about'
    },
    {
      title: 'MATRIZ DE COMPETÊNCIAS',
      text: 'Conheça o sistema de capacidades em Logística, Finanças, Supply Chain, Exército Brasileiro e Engenharia de Prompt com IA.',
      actionLabel: 'Ver Competências',
      actionId: 'skills'
    },
    {
      title: 'PROJECT EXPLORER',
      text: 'Examine os projetos em destaque, arquitetura front-end com Canvas 2D, Web Audio API e física de partículas.',
      actionLabel: 'Ver Projetos',
      actionId: 'projects'
    },
    {
      title: 'CURRÍCULO EM PDF',
      text: 'Você pode baixar o Currículo Vitae oficial completo e formatado diretamente em PDF a qualquer momento.',
      actionLabel: 'Acessar Resumo.pdf',
      actionId: 'resume'
    },
    {
      title: 'CONTATO DIRETO',
      text: 'O WhatsApp é o canal prioritário de resposta mais rápida para contratações e propostas profissionais.',
      actionLabel: 'Abrir Contato',
      actionId: 'contact'
    }
  ];

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 4500);

    return () => clearInterval(blinkInterval);
  }, []);

  const currentTip = tips[tipIndex];

  const handleNextTip = () => {
    try { soundFx.playClick(); } catch (e) {}
    setTipIndex((prev) => (prev + 1) % tips.length);
  };

  const handleAction = () => {
    if (currentTip.actionId) {
      try { soundFx.playClick(); } catch (e) {}
      onOpenModule(currentTip.actionId);
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed bottom-16 sm:bottom-18 right-4 sm:right-6 z-40 flex flex-col items-end gap-3 select-none pointer-events-auto">
      {/* 1. FUTURISTIC SPEECH BUBBLE / MOBILE BOTTOM SHEET HUD */}
      {isOpen && (
        <>
          {/* Mobile Backdrop overlay */}
          <div
            onClick={() => setIsOpen(false)}
            className="sm:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40 animate-fadeIn"
          />

          {/* Card container: Bottom Sheet on Mobile, Floating HUD on Desktop */}
          <div className="fixed sm:static bottom-0 left-0 right-0 sm:bottom-auto sm:left-auto sm:right-auto z-50 w-full sm:w-80 p-4 sm:p-4 rounded-t-3xl sm:rounded-2xl bg-[#020817]/95 sm:bg-black/85 border-t-2 sm:border border-cyan-400/80 backdrop-blur-2xl text-slate-100 shadow-[0_0_45px_rgba(6,182,212,0.45)] space-y-3 animate-slideUp sm:animate-fadeIn">
            {/* Mobile Sheet Drag Indicator */}
            <div className="w-10 h-1 bg-cyan-500/40 rounded-full mx-auto sm:hidden" />

            {/* Top Status Header */}
            <div className="flex items-center justify-between pb-2 border-b border-cyan-900/60">
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-cyan-300 font-bold">
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
                <span>CLIPPY 2026 • AI ASSISTANT</span>
              </div>
              <button
                onClick={() => {
                  try { soundFx.playClick(); } catch (e) {}
                  setIsOpen(false);
                }}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tip Body */}
            <div className="space-y-1">
              <h4 className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>{currentTip.title}</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {currentTip.text}
              </p>
            </div>

            {/* Action Button & Next Tip */}
            <div className="flex items-center justify-between pt-2 border-t border-cyan-950/80">
              <button
                onClick={handleAction}
                className="px-3 py-2 sm:py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/60 text-cyan-200 text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer transition shadow-xs active:scale-95"
              >
                <span>{currentTip.actionLabel}</span>
                <ChevronRight className="w-3 h-3 text-cyan-400" />
              </button>

              <button
                onClick={handleNextTip}
                className="text-[11px] sm:text-[10px] font-mono text-slate-300 hover:text-cyan-300 transition cursor-pointer py-1.5 px-2"
              >
                Próxima ({tipIndex + 1}/{tips.length}) ❯
              </button>
            </div>
          </div>
        </>
      )}

      {/* 2. FUTURISTIC METALLIC HOLOGRAPHIC CLIPPY BODY */}
      <button
        onClick={() => {
          try { soundFx.playClick(); } catch (e) {}
          setIsOpen(!isOpen);
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative cursor-pointer group focus:outline-hidden"
        title="Assistente Neural Clippy 2026"
      >
        {/* Pulsing Holographic Ring */}
        <div className="absolute -inset-1.5 sm:-inset-2 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 opacity-70 blur-xs group-hover:opacity-100 transition-opacity animate-spin duration-1000" />

        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-b from-slate-800 via-slate-900 to-black border-2 border-cyan-400/80 flex items-center justify-center relative z-10 shadow-[0_0_25px_rgba(6,182,212,0.6)] group-hover:scale-105 active:scale-95 transition-transform">
          {/* Cybernetic Metallic Paperclip SVG with Glowing Digital Cyan Eyes */}
          <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Chrome Paperclip Body */}
            <path
              d="M16 28V12C16 7.58172 19.5817 4 24 4C28.4183 4 32 7.58172 32 12V34C32 39.5228 27.5228 44 22 44C16.4772 44 12 39.5228 12 34V16"
              stroke="url(#chromeGrad)"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            {/* Inner loop */}
            <path
              d="M20 16V33C20 34.6569 21.3431 36 23 36C24.6569 36 26 34.6569 26 33V14"
              stroke="url(#chromeGrad)"
              strokeWidth="2.8"
              strokeLinecap="round"
            />

            {/* Glowing Digital Cyan Eyes */}
            {!isBlinking ? (
              <>
                <circle cx="20" cy="12" r="2.2" fill="#38bdf8" filter="url(#eyeGlow)" />
                <circle cx="28" cy="12" r="2.2" fill="#38bdf8" filter="url(#eyeGlow)" />
                <circle cx="20" cy="12" r="0.8" fill="#ffffff" />
                <circle cx="28" cy="12" r="0.8" fill="#ffffff" />
              </>
            ) : (
              <>
                <line x1="18" y1="12" x2="22" y2="12" stroke="#38bdf8" strokeWidth="1.5" />
                <line x1="26" y1="12" x2="30" y2="12" stroke="#38bdf8" strokeWidth="1.5" />
              </>
            )}

            <defs>
              <linearGradient id="chromeGrad" x1="12" y1="4" x2="32" y2="44" gradientUnits="userSpaceOnUse">
                <stop stopColor="#e2e8f0" />
                <stop offset="0.5" stopColor="#38bdf8" />
                <stop offset="1" stopColor="#1e3a8a" />
              </linearGradient>
              <filter id="eyeGlow" x="15" y="7" width="18" height="10" filterUnits="userSpaceOnUse">
                <feGaussianBlur stdDeviation="1" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
          </svg>

          {/* Online Dot */}
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-ping" />
          </span>
        </div>
      </button>
    </div>
  );
};
