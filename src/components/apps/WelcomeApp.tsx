import React from 'react';
import { Sparkles, ArrowRight, Folder, FileText, Send, Lightbulb, Compass, Monitor } from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';
import { WindowAppId } from '../../types';

interface WelcomeAppProps {
  onOpenApp?: (appId: WindowAppId) => void;
  onLaunchTimeTravel?: () => void;
}

export const WelcomeApp: React.FC<WelcomeAppProps> = ({ onOpenApp, onLaunchTimeTravel }) => {
  return (
    <div className="bg-white text-gray-900 font-sans p-6 sm:p-8 max-w-3xl mx-auto space-y-6 select-text">
      {/* Big Pixel Headline */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-blue-900 font-vt323 tracking-normal leading-[0.95] drop-shadow-xs">
          Mateus Araujo,
          <br />
          Especialista de
          <br />
          Logística e Inovação
          <br />
          Tecnológica
        </h1>
        {/* Teal separator bar matching screenshot */}
        <div className="h-1.5 w-full bg-[#008080] mt-3" />
      </div>

      {/* Main bold intro statement */}
      <div className="text-base sm:text-lg font-bold text-gray-950 leading-snug">
        Transformando complexidade em eficiência. Otimizo fluxos de suprimentos, gestão pública e integração digital com inteligência estratégica e inovação.
      </div>

      {/* Yellow highlight callout box with lightbulb */}
      <div className="bg-[#ffffcc] border-2 border-[#e6d870] p-4 sm:p-5 rounded-none shadow-xs text-xs sm:text-sm text-gray-900 flex items-start gap-3">
        <div className="text-2xl shrink-0 select-none">💡</div>
        <div className="leading-relaxed">
          <span className="font-bold">Um conceito deliberado:</span> estratégia operacional, pensamento de sistemas e visão de futuro, disfarçado de nostalgia. Espreite em{' '}
          <button
            onClick={() => {
              try { soundFx.playClick(); } catch (e) {}
              if (onLaunchTimeTravel) onLaunchTimeTravel();
            }}
            className="font-bold text-blue-800 underline hover:text-blue-600 cursor-pointer inline-flex items-center gap-0.5"
          >
            2026
          </button>{' '}
          para ver mais do meu trabalho e explorar a experiência orbital.
        </div>
      </div>

      {/* Navigation guidance paragraphs */}
      <div className="text-xs sm:text-sm text-gray-800 space-y-3 leading-relaxed border-t border-gray-200 pt-4">
        <p>
          <button
            onClick={() => {
              try { soundFx.playClick(); } catch (e) {}
              if (onOpenApp) onOpenApp('projects');
            }}
            className="font-bold text-blue-800 underline hover:text-blue-600 cursor-pointer"
          >
            Trabalho selecionado
          </button>{' '}
          aberto para procurar estudos de caso, ou navegue pelos ícones da área de trabalho para conhecer minha trajetória profissional, competências em logística, engenharia de prompts e projetos digitais.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => {
              try { soundFx.playClick(); } catch (e) {}
              if (onOpenApp) onOpenApp('projects');
            }}
            className="p-3 bg-gray-100 hover:bg-blue-50 border-2 border-gray-300 hover:border-blue-500 text-left transition flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Folder className="w-5 h-5 text-amber-500" />
              <div>
                <div className="font-bold text-xs text-gray-900 group-hover:text-blue-700">Ver Projetos Selecionados</div>
                <div className="text-[11px] text-gray-500">Dashboards, Supply Chain & Web</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transform group-hover:translate-x-1 transition" />
          </button>

          <button
            onClick={() => {
              try { soundFx.playClick(); } catch (e) {}
              if (onLaunchTimeTravel) onLaunchTimeTravel();
            }}
            className="p-3 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white border-2 border-blue-950 text-left transition flex items-center justify-between group cursor-pointer shadow-md"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" />
              <div>
                <div className="font-bold text-xs text-yellow-300">Viagem no Tempo 2000 → 2026</div>
                <div className="text-[11px] text-blue-200">Experiência Orbital com Partículas</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-yellow-300 transform group-hover:translate-x-1 transition" />
          </button>
        </div>
      </div>
    </div>
  );
};
