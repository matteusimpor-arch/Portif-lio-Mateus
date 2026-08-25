import React from 'react';
import { Sparkles, ArrowRight, Folder, FileText, Send, Lightbulb, Compass, Monitor } from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';
import { WindowAppId } from '../../types';
import { MateusLogo } from '../MateusLogo';

interface WelcomeAppProps {
  onOpenApp?: (appId: WindowAppId) => void;
  onLaunchTimeTravel?: () => void;
}

export const WelcomeApp: React.FC<WelcomeAppProps> = ({ onOpenApp, onLaunchTimeTravel }) => {
  return (
    <div className="bg-[#F5F4ED] text-gray-900 font-sans p-4 sm:p-6 md:p-8 max-w-3xl mx-auto space-y-5 select-text border-2 border-gray-400 shadow-xs">
      {/* Directory Path Bar */}
      <div className="bg-[#ECE9D8] p-1.5 border-2 border-white border-r-gray-800 border-b-gray-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <MateusLogo mode="retro" size={20} animated={false} />
          <span className="text-blue-950 font-bold">C:\MATEUS\BEM_VINDO_README.TXT</span>
        </div>
        <span className="text-[10px] text-gray-700">MATEUS OS 2000</span>
      </div>

      {/* Big Headline */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-blue-900 font-mono tracking-tight leading-tight">
          Mateus Araujo
          <span className="block text-lg sm:text-xl md:text-2xl text-blue-950 font-normal mt-1">
            Especialista em Logística, IA & Inovação Tecnológica
          </span>
        </h1>
        {/* Teal separator bar */}
        <div className="h-1.5 w-full bg-[#008080] mt-2" />
      </div>

      {/* Main bold intro statement */}
      <div className="text-sm sm:text-base font-bold text-gray-950 leading-relaxed bg-[#ECE9D8] p-3.5 border-2 border-white border-r-gray-800 border-b-gray-800">
        Transformando complexidade em eficiência. Otimizo fluxos de suprimentos, gestão pública e integração digital com inteligência estratégica, automação e inovação.
      </div>

      {/* Yellow highlight callout box with lightbulb */}
      <div className="bg-[#FFFDE7] border-2 border-amber-400 p-4 rounded-none shadow-xs text-xs sm:text-sm text-gray-900 flex items-start gap-3">
        <div className="text-xl shrink-0 select-none">💡</div>
        <div className="leading-relaxed">
          <span className="font-bold text-amber-950">Conceito do Portfólio:</span> estratégia operacional, pensamento sistêmico e visão de futuro, disfarçados em estética nostálgica do ano 2000. Alterne para o{' '}
          <button
            onClick={() => {
              try { soundFx.playClick(); } catch (e) {}
              if (onLaunchTimeTravel) onLaunchTimeTravel();
            }}
            className="font-bold text-blue-800 underline hover:text-blue-600 cursor-pointer inline-flex items-center gap-0.5"
          >
            Modo 2026
          </button>{' '}
          a qualquer momento para navegar no espaço interativo moderno.
        </div>
      </div>

      {/* Navigation guidance */}
      <div className="text-xs sm:text-sm text-gray-800 space-y-3 leading-relaxed border-t-2 border-gray-300 pt-4">
        <p>
          Abra os aplicativos abaixo ou clique nos ícones da Área de Trabalho para explorar projetos selecionados, competências técnicas, experiência profissional e canais de contato.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => {
              try { soundFx.playClick(); } catch (e) {}
              if (onOpenApp) onOpenApp('projects');
            }}
            className="p-3 bg-[#ECE9D8] hover:bg-[#F1F0E8] border-2 border-white border-r-gray-800 border-b-gray-800 text-left transition flex items-center justify-between group cursor-pointer active:border-inset"
          >
            <div className="flex items-center gap-2.5">
              <Folder className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <div className="font-bold text-xs text-blue-950 group-hover:text-blue-700">Ver Projetos Selecionados</div>
                <div className="text-[11px] text-gray-600">Dashboards, Supply Chain & Web</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-blue-900 transform group-hover:translate-x-0.5 transition" />
          </button>

          <button
            onClick={() => {
              try { soundFx.playClick(); } catch (e) {}
              if (onLaunchTimeTravel) onLaunchTimeTravel();
            }}
            className="p-3 bg-[#000080] hover:bg-blue-900 text-white border-2 border-white border-r-gray-950 border-b-gray-950 text-left transition flex items-center justify-between group cursor-pointer shadow-xs active:border-inset"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-yellow-300 animate-spin shrink-0" />
              <div>
                <div className="font-bold text-xs text-yellow-300">Viagem no Tempo 2000 → 2026</div>
                <div className="text-[11px] text-blue-200">Modo Espacial & Interativo</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-yellow-300 transform group-hover:translate-x-0.5 transition" />
          </button>
        </div>
      </div>
    </div>
  );
};
