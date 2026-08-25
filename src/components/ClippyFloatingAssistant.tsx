import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, ChevronRight, ExternalLink } from 'lucide-react';
import { WindowAppId } from '../types';
import { soundFx } from '../utils/soundEffects';

interface ClippyFloatingAssistantProps {
  onOpenApp: (appId: WindowAppId) => void;
  onLaunchTimeTravel: () => void;
  initialOpen?: boolean;
}

export const ClippyFloatingAssistant: React.FC<ClippyFloatingAssistantProps> = ({
  onOpenApp,
  onLaunchTimeTravel,
  initialOpen = true,
}) => {
  const isMobileScreen = typeof window !== 'undefined' && window.innerWidth < 768;
  const [isOpen, setIsOpen] = useState<boolean>(isMobileScreen ? false : initialOpen);
  const [tipIndex, setTipIndex] = useState<number>(0);
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Eye tracking pupil offsets
  const [leftPupil, setLeftPupil] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rightPupil, setRightPupil] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const leftEyeRef = useRef<SVGCircleElement | null>(null);
  const rightEyeRef = useRef<SVGCircleElement | null>(null);
  const clippyRef = useRef<HTMLDivElement | null>(null);

  // Mouse move listener for real-time eye tracking across the entire window
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const maxDistance = 4.2; // Maximum pupil offset in pixels inside eye socket

      // Calculate Left Eye Offset
      if (leftEyeRef.current) {
        const rect = leftEyeRef.current.getBoundingClientRect();
        const eyeCenterX = rect.left + rect.width / 2;
        const eyeCenterY = rect.top + rect.height / 2;
        const dx = mouseX - eyeCenterX;
        const dy = mouseY - eyeCenterY;
        const dist = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);
        const offset = Math.min(maxDistance, dist / 22);

        setLeftPupil({
          x: Math.cos(angle) * offset,
          y: Math.sin(angle) * offset,
        });
      }

      // Calculate Right Eye Offset
      if (rightEyeRef.current) {
        const rect = rightEyeRef.current.getBoundingClientRect();
        const eyeCenterX = rect.left + rect.width / 2;
        const eyeCenterY = rect.top + rect.height / 2;
        const dx = mouseX - eyeCenterX;
        const dy = mouseY - eyeCenterY;
        const dist = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);
        const offset = Math.min(maxDistance, dist / 22);

        setRightPupil({
          x: Math.cos(angle) * offset,
          y: Math.sin(angle) * offset,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Occasional natural blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.3) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 140);
      }
    }, 4000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Interactive tips matching screenshot style and Portuguese localization
  const tips = [
    {
      greeting: "Hi, I'm Clippy (Clip for short)! 📎",
      text: (
        <>
          Bem-vindo ao <strong>MateusOS</strong>, o portfólio interativo de Mateus Araujo com estética dos anos 2000. Aqui está um tour rápido pelas ferramentas do sistema:
        </>
      ),
      action: null,
      actionLabel: null,
    },
    {
      greeting: '💼 Trabalho Selecionado & Portfólio',
      text: (
        <>
          Quer ver os estudos de caso em <strong>Logística</strong>, <strong>Engenharia de Prompt</strong> e automações com IA? Dê um toque nos ícones do desktop!
        </>
      ),
      action: () => { onOpenApp('projects'); setIsOpen(false); },
      actionLabel: 'Abrir Trabalho Selecionado →',
    },
    {
      greeting: '🚀 Viagem no Tempo para 2026',
      text: (
        <>
          Experimente o portal temporal e avance para o <strong>MATEUS SPACE 2026</strong>, onde as partículas cósmicas se transformam em aplicativos!
        </>
      ),
      action: () => { onLaunchTimeTravel(); setIsOpen(false); },
      actionLabel: 'Iniciar Viagem no Tempo →',
    },
    {
      greeting: '🎮 Jogos Nostálgicos & Entretenimento',
      text: (
        <>
          Relembre os clássicos: <strong>Paciência 2000</strong>, <strong>Snake 3310</strong>, <strong>Campo Minado</strong>, <strong>Pinball</strong> e muito mais!
        </>
      ),
      action: () => { onOpenApp('games'); setIsOpen(false); },
      actionLabel: 'Abrir Central de Jogos →',
    },
    {
      greeting: '📄 Currículo & Contato Direto',
      text: (
        <>
          Para baixar o PDF oficial de contratação ou enviar mensagem direta via WhatsApp/E-mail, acesse <strong>Resumo.pdf</strong> ou o <strong>AIMS Messenger</strong>!
        </>
      ),
      action: () => { onOpenApp('resume'); setIsOpen(false); },
      actionLabel: 'Visualizar Resumo.pdf →',
    },
  ];

  const handleNextTip = () => {
    try { soundFx.playClick(); } catch (e) {}
    setTipIndex((prev) => (prev + 1) % tips.length);
  };

  const handleToggleOpen = () => {
    try { soundFx.playClick(); } catch (e) {}
    setIsOpen(!isOpen);
  };

  const currentTip = tips[tipIndex];

  return (
    <div
      ref={clippyRef}
      className="fixed bottom-12 sm:bottom-14 right-2 sm:right-4 z-40 flex items-end gap-3 select-none pointer-events-auto"
      style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.45))' }}
    >
      {/* 1. RETRO SPEECH BUBBLE / MOBILE BOTTOM SHEET */}
      {isOpen && (
        <>
          {/* Mobile Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className="sm:hidden fixed inset-0 bg-black/50 z-40"
          />

          {/* Card Container: Bottom sheet on Mobile, Floating Post-it on Desktop */}
          <div className="fixed sm:static bottom-10 left-0 right-0 sm:bottom-auto sm:left-auto sm:right-auto z-50 w-full sm:w-80 bg-[#ffffd2] text-gray-900 border-t-2 sm:border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.85)] p-4 sm:p-3.5 font-sans relative text-xs leading-relaxed animate-slideUp sm:animate-fadeIn rounded-t-2xl sm:rounded-none">
            {/* Close button X */}
            <button
              onClick={() => {
                try { soundFx.playClick(); } catch (e) {}
                setIsOpen(false);
              }}
              className="absolute top-2 right-2 text-gray-600 hover:text-black font-bold p-1 cursor-pointer transition hover:bg-yellow-200 rounded min-w-[28px] min-h-[28px] flex items-center justify-center"
              title="Fechar dica"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Heading */}
            <div className="font-bold text-gray-950 text-xs sm:text-xs mb-1.5 pr-6 flex items-center gap-1">
              <span>{currentTip.greeting}</span>
            </div>

            {/* Body text */}
            <div className="text-xs sm:text-[11.5px] text-gray-800 mb-3 space-y-1">
              <p>{currentTip.text}</p>
            </div>

            {/* Action Link & Next Tip Navigation */}
            <div className="pt-2 border-t border-yellow-400/80 flex items-center justify-between gap-2">
              {currentTip.action ? (
                <button
                  onClick={() => {
                    try { soundFx.playWindowOpen(); } catch (e) {}
                    currentTip.action!();
                  }}
                  className="text-blue-900 hover:text-blue-700 font-bold underline text-xs sm:text-[11px] cursor-pointer flex items-center gap-0.5 py-1"
                >
                  <span>{currentTip.actionLabel}</span>
                </button>
              ) : (
                <span className="text-[11px] sm:text-[10px] text-gray-500 font-mono">Dica {tipIndex + 1} de {tips.length}</span>
              )}

              <button
                onClick={handleNextTip}
                className="text-blue-900 hover:text-blue-700 font-bold underline text-xs sm:text-[11.5px] cursor-pointer ml-auto flex items-center gap-0.5 whitespace-nowrap py-1 px-1"
              >
                <span>{tipIndex === tips.length - 1 ? 'Recomeçar ↺' : 'Próxima dica →'}</span>
              </button>
            </div>

            {/* Speech bubble pointy arrow on Desktop */}
            <div
              className="hidden sm:block absolute top-1/2 -right-2.5 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-l-8 border-l-black"
            />
            <div
              className="hidden sm:block absolute top-1/2 -right-2 -translate-y-1/2 w-0 h-0 border-y-7 border-y-transparent border-l-7 border-l-[#ffffd2]"
            />
          </div>
        </>
      )}

      {/* 2. CLIPPY CHARACTER (Vector SVG with Metallic Wire & Mouse-Tracking Eyes) */}
      <button
        onClick={handleToggleOpen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="cursor-pointer group relative transition-transform hover:scale-105 active:scale-95 focus:outline-hidden"
        title="Clique no Clippy para ver dicas!"
      >
        <svg
          width="75"
          height="95"
          viewBox="0 0 120 150"
          className="drop-shadow-lg sm:w-[95px] sm:h-[120px]"
        >
          {/* Metallic Paperclip Wire Body */}
          <defs>
            <linearGradient id="clippyMetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f3f4f6" />
              <stop offset="25%" stopColor="#d1d5db" />
              <stop offset="50%" stopColor="#9ca3af" />
              <stop offset="75%" stopColor="#e5e7eb" />
              <stop offset="100%" stopColor="#6b7280" />
            </linearGradient>
            <linearGradient id="clippyDarkShade" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4b5563" />
              <stop offset="100%" stopColor="#9ca3af" />
            </linearGradient>
            <filter id="clippyShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.45" />
            </filter>
          </defs>

          {/* Outer Loop */}
          <path
            d="M 42 135 L 42 42 A 28 28 0 0 1 98 42 L 98 108 A 20 20 0 0 1 58 108 L 58 55 A 12 12 0 0 1 82 55 L 82 100"
            fill="none"
            stroke="url(#clippyMetalGrad)"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#clippyShadow)"
          />

          {/* Subtle Inner 3D Highlight Stroke */}
          <path
            d="M 42 135 L 42 42 A 28 28 0 0 1 98 42 L 98 108 A 20 20 0 0 1 58 108 L 58 55 A 12 12 0 0 1 82 55 L 82 100"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.65"
          />

          {/* --- LEFT EYE & EYEBROW --- */}
          {/* Eyebrow Left */}
          <path
            d={isHovered ? "M 40 48 Q 50 42 60 48" : "M 42 52 Q 52 46 62 50"}
            fill="none"
            stroke="#1f2937"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Eye Socket Left */}
          <ellipse
            cx="52"
            cy="65"
            rx="10.5"
            ry="13"
            fill="#ffffff"
            stroke="#1f2937"
            strokeWidth="2.5"
          />

          {/* Left Pupil (Tracks Mouse Position) */}
          {!isBlinking ? (
            <g transform={`translate(${leftPupil.x}, ${leftPupil.y})`}>
              <circle
                ref={leftEyeRef}
                cx="52"
                cy="65"
                r="5.5"
                fill="#111827"
              />
              {/* Eye Catchlight / Glint */}
              <circle cx="50" cy="63" r="1.8" fill="#ffffff" />
            </g>
          ) : (
            // Blinking line
            <line x1="43" y1="65" x2="61" y2="65" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
          )}

          {/* --- RIGHT EYE & EYEBROW --- */}
          {/* Eyebrow Right */}
          <path
            d={isHovered ? "M 70 48 Q 80 42 90 48" : "M 68 50 Q 78 46 88 52"}
            fill="none"
            stroke="#1f2937"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Eye Socket Right */}
          <ellipse
            cx="80"
            cy="65"
            rx="10.5"
            ry="13"
            fill="#ffffff"
            stroke="#1f2937"
            strokeWidth="2.5"
          />

          {/* Right Pupil (Tracks Mouse Position) */}
          {!isBlinking ? (
            <g transform={`translate(${rightPupil.x}, ${rightPupil.y})`}>
              <circle
                ref={rightEyeRef}
                cx="80"
                cy="65"
                r="5.5"
                fill="#111827"
              />
              {/* Eye Catchlight / Glint */}
              <circle cx="78" cy="63" r="1.8" fill="#ffffff" />
            </g>
          ) : (
            // Blinking line
            <line x1="71" y1="65" x2="89" y2="65" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
          )}
        </svg>

        {/* Small notification badge when speech bubble is closed */}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 bg-yellow-400 text-black border border-black rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px] shadow animate-bounce">
            ?
          </div>
        )}
      </button>
    </div>
  );
};
