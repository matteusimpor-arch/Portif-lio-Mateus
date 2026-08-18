import React, { useState } from 'react';
import {
  Folder,
  FileText,
  FileCode,
  Radio,
  Mail,
  Palette,
  HelpCircle,
  Gamepad2,
  MessageSquare,
  Monitor,
  Music,
  Tv,
  Sparkles,
  Trash2,
  Compass,
  X,
  RotateCw,
  Info,
  Lightbulb
} from 'lucide-react';
import { WindowAppId, ThemeConfig } from '../types';
import { soundFx } from '../utils/soundEffects';
import { ClippyFloatingAssistant } from './ClippyFloatingAssistant';

interface DesktopProps {
  onOpenApp: (appId: WindowAppId) => void;
  themeConfig: ThemeConfig;
  onLaunchTimeTravel: () => void;
}

interface DesktopItem {
  id: WindowAppId;
  title: string;
  column: 1 | 2 | 3;
  badge?: string;
  badgeColor?: string;
  iconType:
    | 'folder-tabbed'
    | 'notepad'
    | 'doc-word'
    | 'satellite'
    | 'envelope'
    | 'pdf-doc'
    | 'paint-palette'
    | 'pop-quiz'
    | 'clippy'
    | 'gamepad'
    | 'aims'
    | 'settings-screen'
    | 'napster'
    | 'retro-tv'
    | 'time-spiral'
    | 'recycle-bin';
}

export const Desktop: React.FC<DesktopProps> = ({ onOpenApp, themeConfig, onLaunchTimeTravel }) => {
  const [selectedIcon, setSelectedIcon] = useState<WindowAppId | null>(null);
  const [isFactDismissed, setIsFactDismissed] = useState<boolean>(false);
  const [isUpdateDismissed, setIsUpdateDismissed] = useState<boolean>(false);

  // The 16 desktop icons arranged in 3 neat columns matching the screenshot
  const desktopItems: DesktopItem[] = [
    // Column 1
    { id: 'projects', title: 'Trabalho Selecionado', column: 1, iconType: 'folder-tabbed' },
    { id: 'about', title: 'Sobre mim', column: 1, iconType: 'notepad' },
    { id: 'skills', title: 'O que eu faço', column: 1, iconType: 'doc-word' },
    { id: 'now', title: 'Agora (2026)', column: 1, iconType: 'satellite' },
    { id: 'contact', title: 'Contato', column: 1, iconType: 'envelope' },
    { id: 'resume', title: 'Résumé.pdf', column: 1, iconType: 'pdf-doc' },

    // Column 2
    { id: 'paint', title: 'Criança Pix', column: 2, iconType: 'paint-palette' },
    { id: 'quiz', title: 'Cultura Pop Quiz', column: 2, iconType: 'pop-quiz', badge: '★ QUIZ', badgeColor: 'bg-blue-600 text-yellow-300' },
    { id: 'clippy', title: 'Clippy Ajuda', column: 2, iconType: 'clippy' },
    { id: 'games', title: 'Jogos', column: 2, iconType: 'gamepad' },
    { id: 'aims', title: 'AIMS', column: 2, iconType: 'aims' },
    { id: 'settings', title: 'Fundos', column: 2, iconType: 'settings-screen' },

    // Column 3
    { id: 'napster', title: 'Categoria: Napster', column: 3, iconType: 'napster' },
    { id: 'nostalgia', title: 'Momentos de Nostalgia', column: 3, iconType: 'retro-tv' },
    { id: 'timetravel', title: 'Viagem no tempo', column: 3, iconType: 'time-spiral' },
    { id: 'trash', title: 'Lixeira', column: 3, iconType: 'recycle-bin' }
  ];

  const handleIconClick = (appId: WindowAppId) => {
    try { soundFx.playClick(); } catch (e) {}
    setSelectedIcon(appId);
  };

  const handleIconDoubleClick = (appId: WindowAppId) => {
    try { soundFx.playWindowOpen(); } catch (e) {}
    if (appId === 'timetravel') {
      onLaunchTimeTravel();
    } else {
      onOpenApp(appId);
    }
  };

  // Render authentic retro pixel icons matching the screenshot
  const renderIconVisual = (iconType: DesktopItem['iconType']) => {
    switch (iconType) {
      case 'folder-tabbed':
        return (
          <div className="w-12 h-12 relative flex items-center justify-center">
            {/* Manila Folder with color tabs */}
            <div className="w-10 h-8 bg-amber-300 border-2 border-amber-500 rounded-t-xs shadow-md relative">
              <div className="absolute -top-2 left-0 w-4 h-2 bg-amber-400 border-t-2 border-l-2 border-r-2 border-amber-600 rounded-t-xs" />
              <div className="absolute top-1 left-1 right-1 flex gap-0.5">
                <span className="w-1.5 h-2 bg-red-500 rounded-xs" />
                <span className="w-1.5 h-2 bg-blue-500 rounded-xs" />
                <span className="w-1.5 h-2 bg-green-500 rounded-xs" />
              </div>
            </div>
          </div>
        );

      case 'notepad':
        return (
          <div className="w-12 h-12 relative flex items-center justify-center">
            <div className="w-8 h-10 bg-yellow-100 border-2 border-blue-800 shadow-md relative p-1 flex flex-col justify-between">
              <div className="space-y-0.5">
                <div className="w-full h-0.5 bg-blue-400" />
                <div className="w-4/5 h-0.5 bg-blue-400" />
                <div className="w-full h-0.5 bg-blue-400" />
              </div>
              <div className="text-[9px] text-right">✏️</div>
            </div>
          </div>
        );

      case 'doc-word':
        return (
          <div className="w-12 h-12 relative flex items-center justify-center">
            <div className="w-9 h-10 bg-white border-2 border-blue-900 shadow-md relative flex flex-col justify-between p-1">
              <div className="w-4 h-4 bg-blue-700 text-white font-black font-sans text-[10px] flex items-center justify-center border border-blue-950">
                W
              </div>
              <div className="space-y-0.5">
                <div className="w-full h-0.5 bg-gray-400" />
                <div className="w-3/4 h-0.5 bg-gray-400" />
              </div>
            </div>
          </div>
        );

      case 'satellite':
        return (
          <div className="w-12 h-12 relative flex items-center justify-center">
            <div className="w-10 h-10 bg-slate-800 border-2 border-cyan-400 rounded-full flex items-center justify-center text-xl shadow-lg">
              📡
            </div>
          </div>
        );

      case 'envelope':
        return (
          <div className="w-12 h-12 relative flex items-center justify-center">
            <div className="w-10 h-7 bg-white border-2 border-yellow-700 shadow-md relative flex items-center justify-center">
              <div className="w-full h-full border-t border-yellow-600 flex items-center justify-center text-amber-800 text-xs">
                ✉️
              </div>
            </div>
          </div>
        );

      case 'pdf-doc':
        return (
          <div className="w-12 h-12 relative flex items-center justify-center">
            <div className="w-8 h-10 bg-white border-2 border-red-700 shadow-md relative flex flex-col justify-between p-1">
              <div className="bg-red-600 text-white font-bold text-[7px] text-center px-0.5 rounded-xs font-mono">
                PDF
              </div>
              <div className="space-y-0.5">
                <div className="w-full h-0.5 bg-gray-400" />
                <div className="w-4/5 h-0.5 bg-gray-400" />
              </div>
            </div>
          </div>
        );

      case 'paint-palette':
        return (
          <div className="w-12 h-12 relative flex items-center justify-center">
            <div className="w-10 h-10 bg-amber-100 border-2 border-amber-800 rounded-full flex items-center justify-center text-xl shadow-md">
              🎨
            </div>
          </div>
        );

      case 'pop-quiz':
        return (
          <div className="w-12 h-12 relative flex items-center justify-center">
            <div className="w-10 h-10 bg-blue-700 border-2 border-yellow-300 text-yellow-300 font-bold text-xl flex items-center justify-center shadow-md">
              ❓
            </div>
          </div>
        );

      case 'clippy':
        return (
          <div className="w-12 h-12 relative flex items-center justify-center">
            <div className="w-10 h-10 bg-yellow-200 border-2 border-gray-700 rounded-full flex items-center justify-center text-2xl shadow-md">
              📎
            </div>
          </div>
        );

      case 'gamepad':
        return (
          <div className="w-12 h-12 relative flex items-center justify-center">
            <div className="w-10 h-8 bg-gray-800 border-2 border-gray-400 rounded-sm flex items-center justify-center text-base shadow-md">
              🎮
            </div>
          </div>
        );

      case 'aims':
        return (
          <div className="w-12 h-12 relative flex items-center justify-center">
            <div className="w-10 h-8 bg-orange-600 border-2 border-yellow-200 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
              💬
            </div>
          </div>
        );

      case 'settings-screen':
        return (
          <div className="w-12 h-12 relative flex items-center justify-center">
            <div className="w-10 h-8 bg-teal-900 border-2 border-white rounded-xs flex items-center justify-center text-white text-xs shadow-md">
              🖼️
            </div>
          </div>
        );

      case 'napster':
        return (
          <div className="w-12 h-12 relative flex items-center justify-center">
            <div className="w-10 h-10 bg-blue-900 border-2 border-cyan-300 rounded-full flex items-center justify-center text-xl shadow-md">
              🎵
            </div>
          </div>
        );

      case 'retro-tv':
        return (
          <div className="w-12 h-12 relative flex items-center justify-center">
            <div className="w-10 h-8 bg-amber-950 border-2 border-amber-600 rounded-xs flex items-center justify-center text-lg shadow-md">
              📺
            </div>
          </div>
        );

      case 'time-spiral':
        return (
          <div className="w-12 h-12 relative flex items-center justify-center">
            <div className="w-10 h-10 bg-indigo-950 border-2 border-purple-400 rounded-full flex items-center justify-center text-xl shadow-lg animate-pulse">
              🌀
            </div>
          </div>
        );

      case 'recycle-bin':
        return (
          <div className="w-12 h-12 relative flex items-center justify-center">
            <div className="w-9 h-10 bg-slate-300 border-2 border-slate-700 shadow-md flex items-center justify-center text-base">
              🗑️
            </div>
          </div>
        );

      default:
        return <Folder className="w-8 h-8 text-yellow-300" />;
    }
  };

  const col1Items = desktopItems.filter((i) => i.column === 1);
  const col2Items = desktopItems.filter((i) => i.column === 2);
  const col3Items = desktopItems.filter((i) => i.column === 3);

  return (
    <div
      onClick={() => setSelectedIcon(null)}
      className="fixed inset-0 pt-3 px-3 pb-12 overflow-hidden bg-[#008080] select-none text-white font-sans text-xs"
    >
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(rgba(255,255,255,0.4)_1px,transparent_1px)] [background-size:20px_20px]" />

      {/* 3 Left Columns Desktop Grid Container */}
      <div className="relative z-10 flex gap-6 sm:gap-10 h-full content-start items-start pointer-events-auto">
        {/* Column 1 */}
        <div className="flex flex-col gap-4 sm:gap-5 w-24 sm:w-28">
          {col1Items.map((item) => {
            const isSelected = selectedIcon === item.id;
            return (
              <div
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleIconClick(item.id);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleIconDoubleClick(item.id);
                }}
                className={`flex flex-col items-center gap-1 group cursor-pointer p-1 transition ${
                  isSelected
                    ? 'bg-[#000080]/80 rounded border border-yellow-300'
                    : 'hover:bg-white/10 rounded'
                }`}
              >
                <div className="group-hover:scale-105 transition-transform duration-100">
                  {renderIconVisual(item.iconType)}
                </div>
                <span className="text-[11px] font-sans font-bold text-center leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] max-w-full truncate px-0.5">
                  {item.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-4 sm:gap-5 w-24 sm:w-28">
          {col2Items.map((item) => {
            const isSelected = selectedIcon === item.id;
            return (
              <div
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleIconClick(item.id);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleIconDoubleClick(item.id);
                }}
                className={`flex flex-col items-center gap-1 group cursor-pointer p-1 relative transition ${
                  isSelected
                    ? 'bg-[#000080]/80 rounded border border-yellow-300'
                    : 'hover:bg-white/10 rounded'
                }`}
              >
                {item.badge && (
                  <span className="absolute -top-1 right-0 text-[8px] font-mono font-bold bg-blue-700 text-yellow-300 px-1 py-0.2 rounded border border-yellow-300 shadow">
                    {item.badge}
                  </span>
                )}
                <div className="group-hover:scale-105 transition-transform duration-100">
                  {renderIconVisual(item.iconType)}
                </div>
                <span className="text-[11px] font-sans font-bold text-center leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] max-w-full truncate px-0.5">
                  {item.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Column 3 */}
        <div className="flex flex-col gap-4 sm:gap-5 w-24 sm:w-28">
          {col3Items.map((item) => {
            const isSelected = selectedIcon === item.id;
            return (
              <div
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleIconClick(item.id);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleIconDoubleClick(item.id);
                }}
                className={`flex flex-col items-center gap-1 group cursor-pointer p-1 transition ${
                  isSelected
                    ? 'bg-[#000080]/80 rounded border border-yellow-300'
                    : 'hover:bg-white/10 rounded'
                }`}
              >
                <div className="group-hover:scale-105 transition-transform duration-100">
                  {renderIconVisual(item.iconType)}
                </div>
                <span className="text-[11px] font-sans font-bold text-center leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] max-w-full truncate px-0.5">
                  {item.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* TOP RIGHT WIDGET: ✦ Você sabia? [x] (Sticky Note from Screenshot) */}
      {!isFactDismissed && (
        <div className="hidden md:block absolute top-4 right-4 z-20 w-80 bg-[#ffffd0] text-gray-900 border-2 border-yellow-600 shadow-2xl p-3 font-sans select-none animate-fadeIn">
          {/* Note Titlebar */}
          <div className="flex items-center justify-between border-b border-yellow-400 pb-1.5 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 font-mono">
              <span>✦ Você sabia?</span>
            </div>
            <button
              onClick={() => setIsFactDismissed(true)}
              className="text-gray-600 hover:text-black font-bold text-xs cursor-pointer p-0.5"
              title="Fechar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Note Content */}
          <p className="text-[11px] leading-relaxed text-gray-800">
            Em 2000, 1 GB de armazenamento custava centenas de dólares. Hoje a logística digital e a automação de processos tratam terabytes em tempo real com inteligência artificial e alta disponibilidade.
          </p>
        </div>
      )}

      {/* RETRO CLIPPY INTERACTIVE FLOATING ASSISTANT */}
      <ClippyFloatingAssistant
        onOpenApp={onOpenApp}
        onLaunchTimeTravel={onLaunchTimeTravel}
        initialOpen={true}
      />

      {/* WATERMARK AT BOTTOM RIGHT */}
      <div className="absolute bottom-2 right-4 text-[10px] font-mono text-white/50 pointer-events-none tracking-wider">
        OWNED BY MATEUS ARAUJO © 2026. ALL RIGHTS RESERVED.
      </div>
    </div>
  );
};
