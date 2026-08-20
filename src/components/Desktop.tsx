import React, { useState, useEffect, useRef } from 'react';
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
  Lightbulb,
  Moon,
  Settings,
  Maximize2
} from 'lucide-react';
import { WindowAppId, ThemeConfig } from '../types';
import { soundFx } from '../utils/soundEffects';
import { DID_YOU_KNOW_FACTS } from '../data/portfolioData';
import { ClippyFloatingAssistant } from './ClippyFloatingAssistant';

interface DesktopProps {
  onOpenApp: (appId: WindowAppId) => void;
  themeConfig: ThemeConfig;
  onLaunchTimeTravel: () => void;
  onTestScreensaver?: () => void;
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
    | 'guestbook-book'
    | 'napster'
    | 'retro-tv'
    | 'time-spiral'
    | 'recycle-bin';
}

export const Desktop: React.FC<DesktopProps> = ({
  onOpenApp,
  themeConfig,
  onLaunchTimeTravel,
  onTestScreensaver
}) => {
  const [selectedIcon, setSelectedIcon] = useState<WindowAppId | null>(null);
  const [isFactDismissed, setIsFactDismissed] = useState<boolean>(false);
  const [currentFactIndex, setCurrentFactIndex] = useState<number>(0);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number } | null>(null);

  // Rotate "Você Sabia?" facts automatically every 8 seconds
  useEffect(() => {
    if (isFactDismissed) return;
    const timer = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % DID_YOU_KNOW_FACTS.length);
    }, 8500);
    return () => clearInterval(timer);
  }, [isFactDismissed]);

  // Handle right-click for Context Menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    soundFx.playClick();
    const x = Math.min(e.clientX, window.innerWidth - 200);
    const y = Math.min(e.clientY, window.innerHeight - 240);
    setContextMenu({ visible: true, x, y });
  };

  // Close context menu on any click
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Wallpaper background styling lookup
  const getWallpaperBackground = () => {
    switch (themeConfig.wallpaper) {
      case 'mateus-os':
        return 'bg-[#000080]';
      case 'retro-computer':
        return 'bg-[#c8bfa7]';
      case 'pixel-art':
        return 'bg-gradient-to-b from-indigo-950 via-purple-900 to-pink-700';
      case 'minimal-slate':
        return 'bg-[#2b3542]';
      case 'matrix':
        return 'bg-black';
      case 'space':
        return 'bg-black bg-[radial-gradient(ellipse_at_top,#2e1065,#030712)]';
      case 'cyber':
        return 'bg-slate-950';
      case 'classic-teal':
      case '90s':
      default:
        return 'bg-[#008080]';
    }
  };

  // Desktop Icons arranged in 3 columns
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
    { id: 'guestbook', title: 'Livro de Visitas', column: 3, iconType: 'guestbook-book', badge: '★ NOVO', badgeColor: 'bg-emerald-600 text-white' },
    { id: 'napster', title: 'Categoria: Napster', column: 3, iconType: 'napster' },
    { id: 'nostalgia', title: 'Momentos de Nostalgia', column: 3, iconType: 'retro-tv' },
    { id: 'timetravel', title: 'Viagem no tempo', column: 3, iconType: 'time-spiral' },
    { id: 'trash', title: 'Lixeira', column: 3, iconType: 'recycle-bin' }
  ];

  const handleIconClick = (appId: WindowAppId) => {
    try { soundFx.playClick(); } catch (e) {}
    setSelectedIcon(appId);
    // On mobile screens, single tap opens the app directly for effortless navigation
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      handleIconDoubleClick(appId);
    }
  };

  const handleIconDoubleClick = (appId: WindowAppId) => {
    try { soundFx.playWindowOpen(); } catch (e) {}
    if (appId === 'timetravel') {
      onLaunchTimeTravel();
    } else {
      onOpenApp(appId);
    }
  };

  const renderIconVisual = (iconType: DesktopItem['iconType']) => {
    switch (iconType) {
      case 'folder-tabbed':
        return (
          <div className="w-12 h-12 relative flex items-center justify-center">
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

      case 'guestbook-book':
        return (
          <div className="w-12 h-12 relative flex items-center justify-center">
            {/* Retro 2000 Book + Fountain Pen Icon */}
            <div className="w-10 h-10 bg-[#e8e4c9] border-2 border-[#5c4033] shadow-md relative rounded-xs p-1 flex flex-col justify-between overflow-visible">
              {/* Book Spine / Cover */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-indigo-800 to-blue-900 border-2 border-amber-400 rounded-xs flex items-center justify-center">
                <div className="w-6 h-7 bg-[#fffdf0] border border-amber-300 rounded-[1px] p-0.5 flex flex-col justify-around">
                  <div className="w-full h-0.5 bg-blue-900" />
                  <div className="w-3/4 h-0.5 bg-blue-900" />
                  <div className="w-full h-0.5 bg-blue-900" />
                  <div className="w-1/2 h-0.5 bg-blue-900" />
                </div>
              </div>
              {/* Golden Quill / Pen overlay */}
              <div className="absolute -top-1.5 -right-1 text-sm filter drop-shadow">
                ✒️
              </div>
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
          <div className="w-12 h-12 relative flex items-center justify-center group/travel">
            {/* Pulsing energy aura glow in shifting colors (pink, purple, blue, cyan, green, yellow, orange) */}
            <div className="absolute inset-0 rounded-full animate-travel-rainbow-border opacity-75 blur-xs p-0.5" />
            <div className="w-10 h-10 bg-[#03071e] rounded-full flex items-center justify-center relative z-10 border border-white/40 shadow-[0_0_15px_rgba(168,85,247,0.7)] group-hover/travel:shadow-[0_0_25px_rgba(6,182,212,0.9)] transition-all duration-300">
              <span className="text-xl inline-block transform group-hover/travel:scale-115 group-hover/travel:rotate-180 transition-transform duration-500">
                🌀
              </span>
              {/* Subtle orbital spark */}
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-300 animate-ping opacity-75" />
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

  const currentFact = DID_YOU_KNOW_FACTS[currentFactIndex] || DID_YOU_KNOW_FACTS[0];

  return (
    <div
      onClick={() => setSelectedIcon(null)}
      onContextMenu={handleContextMenu}
      className={`fixed inset-0 pt-3 px-3 pb-12 overflow-hidden ${getWallpaperBackground()} select-none text-white font-sans text-xs transition-colors duration-500`}
    >
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(rgba(255,255,255,0.4)_1px,transparent_1px)] [background-size:20px_20px]" />

      {/* Desktop Grid Container with Responsive Spacing */}
      <div className="relative z-10 flex flex-wrap sm:flex-nowrap gap-4 sm:gap-6 md:gap-8 h-full content-start items-start pointer-events-auto overflow-y-auto sm:overflow-visible pb-16 sm:pb-4 max-w-full">
        {/* Column 1 */}
        <div className="flex flex-col gap-2 sm:gap-2.5 md:gap-3 w-20 sm:w-24 md:w-28 shrink-0">
          {col1Items.map((item) => {
            const isSelected = selectedIcon === item.id;
            return (
              <button
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleIconClick(item.id);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleIconDoubleClick(item.id);
                }}
                className="flex flex-col items-center gap-1 group cursor-pointer p-1 rounded-sm transition-all text-center select-none w-full min-h-[82px] hover:bg-white/10 active:bg-white/15"
              >
                <div className="group-hover:scale-105 group-active:scale-95 transition-transform duration-100 shrink-0">
                  {renderIconVisual(item.iconType)}
                </div>
                <span
                  className={`text-[11px] sm:text-[12px] font-sans font-bold text-center leading-snug max-w-full line-clamp-2 ${
                    isSelected
                      ? 'bg-[#000080] text-white px-1.5 py-0.5 border border-dotted border-white/80 shadow-xs rounded-[1px]'
                      : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] px-0.5'
                  }`}
                >
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-2 sm:gap-2.5 md:gap-3 w-20 sm:w-24 md:w-28 shrink-0">
          {col2Items.map((item) => {
            const isSelected = selectedIcon === item.id;
            return (
              <button
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleIconClick(item.id);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleIconDoubleClick(item.id);
                }}
                className="flex flex-col items-center gap-1 group cursor-pointer p-1 rounded-sm relative transition-all text-center select-none w-full min-h-[82px] hover:bg-white/10 active:bg-white/15"
              >
                {item.badge && (
                  <span className="absolute top-0 right-1 text-[8px] font-mono font-bold bg-blue-700 text-yellow-300 px-1 py-0.2 rounded border border-yellow-300 shadow-xs">
                    {item.badge}
                  </span>
                )}
                <div className="group-hover:scale-105 group-active:scale-95 transition-transform duration-100 shrink-0">
                  {renderIconVisual(item.iconType)}
                </div>
                <span
                  className={`text-[11px] sm:text-[12px] font-sans font-bold text-center leading-snug max-w-full line-clamp-2 ${
                    isSelected
                      ? 'bg-[#000080] text-white px-1.5 py-0.5 border border-dotted border-white/80 shadow-xs rounded-[1px]'
                      : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] px-0.5'
                  }`}
                >
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Column 3 */}
        <div className="flex flex-col gap-2 sm:gap-2.5 md:gap-3 w-20 sm:w-24 md:w-28 shrink-0">
          {col3Items.map((item) => {
            const isSelected = selectedIcon === item.id;
            return (
              <button
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleIconClick(item.id);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleIconDoubleClick(item.id);
                }}
                className="flex flex-col items-center gap-1 group cursor-pointer p-1 rounded-sm transition-all text-center select-none w-full min-h-[82px] hover:bg-white/10 active:bg-white/15"
              >
                <div className="group-hover:scale-105 group-active:scale-95 transition-transform duration-100 shrink-0">
                  {renderIconVisual(item.iconType)}
                </div>
                <span
                  className={`text-[11px] sm:text-[12px] font-sans font-bold text-center leading-snug max-w-full line-clamp-2 ${
                    isSelected
                      ? 'bg-[#000080] text-white px-1.5 py-0.5 border border-dotted border-white/80 shadow-xs rounded-[1px]'
                      : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] px-0.5'
                  }`}
                >
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TOP RIGHT WIDGET: ✦ Você sabia? (Auto-Rotating Sticky Note) */}
      {!isFactDismissed && (
        <div className="hidden md:block absolute top-4 right-4 z-20 w-80 bg-[#ffffd0] text-gray-900 border-2 border-yellow-600 shadow-2xl p-3 font-sans select-none animate-fadeIn transition-all duration-300">
          {/* Note Titlebar */}
          <div className="flex items-center justify-between border-b border-yellow-400 pb-1.5 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 font-mono">
              <Lightbulb className="w-3.5 h-3.5 text-amber-700" />
              <span>✦ Você sabia? ({currentFactIndex + 1}/{DID_YOU_KNOW_FACTS.length})</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  soundFx.playClick();
                  setCurrentFactIndex((prev) => (prev + 1) % DID_YOU_KNOW_FACTS.length);
                }}
                className="text-gray-600 hover:text-blue-900 font-mono text-[10px] px-1 bg-yellow-200 border border-yellow-500 rounded cursor-pointer"
                title="Próxima Curiosidade"
              >
                Próximo ❯
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  soundFx.playClick();
                  setIsFactDismissed(true);
                }}
                className="text-gray-600 hover:text-black font-bold text-xs cursor-pointer p-0.5"
                title="Fechar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Note Content */}
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-blue-950 font-mono">
              {currentFact.title}
            </div>
            <p className="text-[11px] leading-relaxed text-gray-800">
              {currentFact.fact}
            </p>
          </div>
        </div>
      )}

      {/* RIGHT-CLICK CONTEXT MENU */}
      {contextMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-50 w-48 bg-[#c0c0c0] border-2 border-white border-r-gray-800 border-b-gray-800 shadow-2xl p-1 text-gray-900 font-sans text-xs select-none"
        >
          <div
            onClick={() => {
              soundFx.playClick();
              setContextMenu(null);
            }}
            className="px-3 py-1.5 hover:bg-[#000080] hover:text-white cursor-pointer rounded-xs flex items-center justify-between"
          >
            <span>Organizar Ícones</span>
          </div>

          <div
            onClick={() => {
              soundFx.playClick();
              setContextMenu(null);
            }}
            className="px-3 py-1.5 hover:bg-[#000080] hover:text-white cursor-pointer rounded-xs flex items-center justify-between"
          >
            <span>Atualizar Área de Trabalho</span>
          </div>

          <div className="my-1 border-t border-gray-400 border-b border-white" />

          <div
            onClick={() => {
              soundFx.playClick();
              setContextMenu(null);
              onOpenApp('settings');
            }}
            className="px-3 py-1.5 hover:bg-[#000080] hover:text-white cursor-pointer rounded-xs flex items-center gap-2"
          >
            <Palette className="w-3.5 h-3.5 text-blue-900" />
            <span>Personalizar / Fundos</span>
          </div>

          <div
            onClick={() => {
              soundFx.playClick();
              setContextMenu(null);
              if (onTestScreensaver) {
                onTestScreensaver();
              }
            }}
            className="px-3 py-1.5 hover:bg-[#000080] hover:text-white cursor-pointer rounded-xs flex items-center gap-2"
          >
            <Moon className="w-3.5 h-3.5 text-indigo-900" />
            <span>Testar Descanso de Tela</span>
          </div>

          <div className="my-1 border-t border-gray-400 border-b border-white" />

          <div
            onClick={() => {
              soundFx.playClick();
              setContextMenu(null);
              onLaunchTimeTravel();
            }}
            className="px-3 py-1.5 hover:bg-[#000080] hover:text-white cursor-pointer rounded-xs flex items-center gap-2 font-bold"
          >
            <span>🌀 Viagem no Tempo (2026)</span>
          </div>

          <div
            onClick={() => {
              soundFx.playClick();
              setContextMenu(null);
              onOpenApp('about');
            }}
            className="px-3 py-1.5 hover:bg-[#000080] hover:text-white cursor-pointer rounded-xs flex items-center gap-2"
          >
            <Info className="w-3.5 h-3.5 text-gray-700" />
            <span>Propriedades do Sistema</span>
          </div>
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
