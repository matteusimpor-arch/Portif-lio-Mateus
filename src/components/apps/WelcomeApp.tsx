import React from 'react';
import { Folder, FileText, User } from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';
import { WindowAppId } from '../../types';
import { MateusLogo } from '../MateusLogo';

interface WelcomeAppProps {
  onOpenApp?: (appId: WindowAppId) => void;
  onLaunchTimeTravel?: () => void;
}

export const WelcomeApp: React.FC<WelcomeAppProps> = ({ onOpenApp }) => {
  const handleOpen = (appId: WindowAppId) => {
    try {
      soundFx.playWindowOpen();
    } catch (e) {}
    if (onOpenApp) {
      onOpenApp(appId);
    }
  };

  return (
    <div className="bg-[#ECE9D8] text-gray-900 font-sans p-3 sm:p-5 md:p-6 max-w-2xl mx-auto space-y-4 select-text border-2 border-white border-r-gray-800 border-b-gray-800 shadow-xs">
      {/* 1. CAMINHO DO ARQUIVO */}
      <div className="bg-[#FFFFFF] p-1.5 border-2 border-gray-600 border-r-white border-b-white flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 truncate">
          <MateusLogo mode="retro" size={18} animated={false} />
          <span className="text-blue-950 font-bold truncate">C:\MATEUS\BEM_VINDO_README.TXT</span>
        </div>
        <span className="text-[10px] text-gray-600 font-bold shrink-0 ml-2">MATEUS OS 2000</span>
      </div>

      {/* 2. CONTEÚDO PRINCIPAL / CABEÇALHO */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-blue-900 font-mono tracking-tight leading-tight">
          Mateus Araujo
        </h1>
        <p className="text-xs sm:text-sm font-bold text-gray-700 tracking-wide">
          Logística • Supply Chain • Gestão • Tecnologia
        </p>
      </div>

      {/* Retro Divider */}
      <div className="border-t-2 border-gray-400 border-b border-white my-2" />

      {/* 3. TEXTO DE APRESENTAÇÃO */}
      <div className="bg-[#FFFFFF] p-3.5 border-2 border-gray-600 border-r-white border-b-white text-xs sm:text-sm leading-relaxed text-gray-900">
        <p>
          Bem-vindo ao meu portfólio. Aqui você pode conhecer minha trajetória, formação, projetos e áreas de atuação por meio de uma experiência inspirada nos computadores dos anos 2000.
        </p>
      </div>

      {/* Retro Divider */}
      <div className="border-t-2 border-gray-400 border-b border-white my-2" />

      {/* 4. COMECE POR AQUI & ATALHOS RETRÔ */}
      <div className="space-y-2.5">
        <div className="text-[11px] sm:text-xs font-mono font-bold text-blue-950 tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 bg-blue-900 rounded-xs" />
          <span>COMECE POR AQUI</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
          {/* Atalho: Sobre mim */}
          <button
            onClick={() => handleOpen('about')}
            className="p-2.5 bg-[#ECE9D8] hover:bg-[#F3F1E7] border-2 border-white border-r-gray-800 border-b-gray-800 active:border-gray-800 active:border-r-white active:border-b-white text-left transition flex items-center gap-2.5 cursor-pointer shadow-xs group"
          >
            <div className="w-8 h-8 bg-yellow-100 border border-blue-900 flex items-center justify-center shrink-0 shadow-xs">
              <User className="w-4 h-4 text-blue-900 group-hover:scale-110 transition-transform" />
            </div>
            <div className="truncate">
              <div className="font-bold text-xs text-blue-950 font-mono group-hover:text-blue-700 truncate">
                Sobre mim
              </div>
              <div className="text-[10px] text-gray-600 truncate">Perfil & História</div>
            </div>
          </button>

          {/* Atalho: Trabalho Selecionado */}
          <button
            onClick={() => handleOpen('projects')}
            className="p-2.5 bg-[#ECE9D8] hover:bg-[#F3F1E7] border-2 border-white border-r-gray-800 border-b-gray-800 active:border-gray-800 active:border-r-white active:border-b-white text-left transition flex items-center gap-2.5 cursor-pointer shadow-xs group"
          >
            <div className="w-8 h-8 bg-amber-200 border border-amber-800 flex items-center justify-center shrink-0 shadow-xs">
              <Folder className="w-4 h-4 text-amber-900 group-hover:scale-110 transition-transform" />
            </div>
            <div className="truncate">
              <div className="font-bold text-xs text-blue-950 font-mono group-hover:text-blue-700 truncate">
                Trabalho Selecionado
              </div>
              <div className="text-[10px] text-gray-600 truncate">Projetos & Casos</div>
            </div>
          </button>

          {/* Atalho: Résumé.pdf */}
          <button
            onClick={() => handleOpen('resume')}
            className="p-2.5 bg-[#ECE9D8] hover:bg-[#F3F1E7] border-2 border-white border-r-gray-800 border-b-gray-800 active:border-gray-800 active:border-r-white active:border-b-white text-left transition flex items-center gap-2.5 cursor-pointer shadow-xs group"
          >
            <div className="w-8 h-8 bg-red-100 border border-red-800 flex items-center justify-center shrink-0 shadow-xs">
              <FileText className="w-4 h-4 text-red-700 group-hover:scale-110 transition-transform" />
            </div>
            <div className="truncate">
              <div className="font-bold text-xs text-blue-950 font-mono group-hover:text-blue-700 truncate">
                Résumé.pdf
              </div>
              <div className="text-[10px] text-gray-600 truncate">Currículo Oficial</div>
            </div>
          </button>
        </div>
      </div>

      {/* Retro Divider */}
      <div className="border-t-2 border-gray-400 border-b border-white my-2" />

      {/* 5. TEXTO DE EXPLORAÇÃO */}
      <div className="text-center sm:text-left text-[11px] sm:text-xs text-gray-600 font-mono">
        Explore os ícones da área de trabalho ou use o menu Iniciar.
      </div>
    </div>
  );
};
