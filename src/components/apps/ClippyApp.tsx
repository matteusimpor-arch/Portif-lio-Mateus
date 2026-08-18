import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, Sparkles, MessageSquare, Lightbulb, Compass, Rocket } from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';
import { WindowAppId } from '../../types';

interface ClippyAppProps {
  onOpenApp?: (appId: WindowAppId) => void;
  onLaunchTimeTravel?: () => void;
}

export const ClippyApp: React.FC<ClippyAppProps> = ({ onOpenApp, onLaunchTimeTravel }) => {
  const [tipIndex, setTipIndex] = useState<number>(0);
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [leftPupil, setLeftPupil] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rightPupil, setRightPupil] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const leftEyeRef = useRef<SVGCircleElement | null>(null);
  const rightEyeRef = useRef<SVGCircleElement | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const maxDistance = 4.2;

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

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.3) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 140);
      }
    }, 3800);

    return () => clearInterval(blinkInterval);
  }, []);

  const tips = [
    {
      title: 'Parece que você está navegando no portfólio de Mateus Araujo!',
      body: 'Deseja conhecer os projetos em destaque de logística, automação e sistemas web? Clique em "Trabalho Selecionado" para explorar os estudos de caso completos.',
      actionLabel: 'Abrir Trabalho Selecionado',
      appId: 'projects' as WindowAppId
    },
    {
      title: 'Você sabia sobre a Viagem no Tempo?',
      body: 'Clicando no aplicativo "Viagem no tempo" ou no botão de atualização, você é transportado em uma espiral cósmica do ano 2000 até 2026 para acessar o MATEUS SPACE.',
      actionLabel: 'Iniciar Viagem no Tempo',
      actionSpecial: 'timetravel'
    },
    {
      title: 'Procurando o Currículo para contratação?',
      body: 'Você pode visualizar e fazer download do Currículo em PDF oficial de Mateus Araujo a qualquer momento abrindo o arquivo "Résumé.pdf".',
      actionLabel: 'Abrir Résumé.pdf',
      appId: 'resume' as WindowAppId
    },
    {
      title: 'Dica de produtividade dos anos 2000!',
      body: 'Você pode arrastar as janelas pelo título, minimizá-las para a barra de tarefas ou trocar os papéis de parede em "Fundos".',
      actionLabel: 'Personalizar Fundos',
      appId: 'settings' as WindowAppId
    },
    {
      title: 'Quer entrar em contato direto?',
      body: 'Mateus está disponível para posições estratégicas em logística, gestão e consultoria em IA. Acesse o aplicativo "Contato" ou use o chat "AIMS"!',
      actionLabel: 'Abrir Contato',
      appId: 'contact' as WindowAppId
    }
  ];

  const handleNextTip = () => {
    setTipIndex((prev) => (prev + 1) % tips.length);
    try { soundFx.playClick(); } catch (e) {}
  };

  const handleExecute = (tip: typeof tips[0]) => {
    try { soundFx.playWindowOpen(); } catch (e) {}
    if (tip.actionSpecial === 'timetravel') {
      if (onLaunchTimeTravel) onLaunchTimeTravel();
    } else if (tip.appId && onOpenApp) {
      onOpenApp(tip.appId);
    }
  };

  const currentTip = tips[tipIndex];

  return (
    <div className="bg-[#ffffd8] text-black font-sans text-xs p-5 border-2 border-yellow-500 shadow-xl space-y-4 max-w-lg mx-auto select-none">
      {/* Top Header with Interactive Vector Clippy */}
      <div className="flex items-center gap-4 border-b-2 border-yellow-400 pb-3">
        <div className="relative">
          <svg
            width="80"
            height="100"
            viewBox="0 0 120 150"
            className="drop-shadow-md"
          >
            <defs>
              <linearGradient id="clippyMetalGradApp" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f3f4f6" />
                <stop offset="25%" stopColor="#d1d5db" />
                <stop offset="50%" stopColor="#9ca3af" />
                <stop offset="75%" stopColor="#e5e7eb" />
                <stop offset="100%" stopColor="#6b7280" />
              </linearGradient>
            </defs>

            {/* Wire Body */}
            <path
              d="M 42 135 L 42 42 A 28 28 0 0 1 98 42 L 98 108 A 20 20 0 0 1 58 108 L 58 55 A 12 12 0 0 1 82 55 L 82 100"
              fill="none"
              stroke="url(#clippyMetalGradApp)"
              strokeWidth="11"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 42 135 L 42 42 A 28 28 0 0 1 98 42 L 98 108 A 20 20 0 0 1 58 108 L 58 55 A 12 12 0 0 1 82 55 L 82 100"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.65"
            />

            {/* Left Eyebrow & Eye */}
            <path d="M 42 52 Q 52 46 62 50" fill="none" stroke="#1f2937" strokeWidth="3.5" strokeLinecap="round" />
            <ellipse cx="52" cy="65" rx="10.5" ry="13" fill="#ffffff" stroke="#1f2937" strokeWidth="2.5" />
            {!isBlinking ? (
              <g transform={`translate(${leftPupil.x}, ${leftPupil.y})`}>
                <circle ref={leftEyeRef} cx="52" cy="65" r="5.5" fill="#111827" />
                <circle cx="50" cy="63" r="1.8" fill="#ffffff" />
              </g>
            ) : (
              <line x1="43" y1="65" x2="61" y2="65" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
            )}

            {/* Right Eyebrow & Eye */}
            <path d="M 68 50 Q 78 46 88 52" fill="none" stroke="#1f2937" strokeWidth="3.5" strokeLinecap="round" />
            <ellipse cx="80" cy="65" rx="10.5" ry="13" fill="#ffffff" stroke="#1f2937" strokeWidth="2.5" />
            {!isBlinking ? (
              <g transform={`translate(${rightPupil.x}, ${rightPupil.y})`}>
                <circle ref={rightEyeRef} cx="80" cy="65" r="5.5" fill="#111827" />
                <circle cx="78" cy="63" r="1.8" fill="#ffffff" />
              </g>
            ) : (
              <line x1="71" y1="65" x2="89" y2="65" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
            )}
          </svg>
        </div>

        <div>
          <h2 className="text-base font-bold font-vt323 text-lg text-blue-950 flex items-center gap-1.5">
            <span>CLIPPY • ASSISTENTE DO MATEUS OS 2000</span>
          </h2>
          <p className="text-[11px] text-gray-700">Seus olhos acompanham o movimento do seu cursor!</p>
        </div>
      </div>

      {/* Speech Bubble */}
      <div className="bg-white p-4 border-2 border-gray-700 shadow-md relative space-y-2">
        <div className="font-bold text-blue-900 text-sm">{currentTip.title}</div>
        <p className="text-gray-800 leading-relaxed text-xs">{currentTip.body}</p>

        <div className="pt-2 flex flex-wrap items-center gap-2 justify-between">
          <button
            onClick={() => handleExecute(currentTip)}
            className="btn-retro px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-950 font-bold flex items-center gap-1.5 cursor-pointer text-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-600" />
            <span>{currentTip.actionLabel}</span>
          </button>

          <button
            onClick={handleNextTip}
            className="btn-retro px-3 py-1.5 flex items-center gap-1 cursor-pointer text-xs"
          >
            <span>Next tip →</span>
          </button>
        </div>
      </div>

      {/* Footer quick shortcuts */}
      <div className="pt-2 border-t border-yellow-400/80 flex justify-between items-center text-[10px] text-gray-600 font-mono">
        <span>Dica {tipIndex + 1} de {tips.length}</span>
        <span>MATEUS OS 2000 ASSIST</span>
      </div>
    </div>
  );
};
