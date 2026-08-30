import React, { useState, useEffect, useRef } from 'react';
import {
  Folder,
  FileText,
  Cpu,
  Sparkles,
  Truck,
  Clock,
  Mail,
  Gamepad2,
  Settings,
  Trash2,
  Volume2,
  VolumeX,
  Monitor,
  Bell,
  Search,
  Palette,
  HelpCircle,
  MessageSquare,
  Music,
  Tv,
  RotateCw,
  Power,
  ChevronRight,
  Moon,
  Info,
  Layers,
  BookOpen,
  Eye,
  Bot
} from 'lucide-react';
import { WindowAppId, WindowState, NotificationItem } from '../types';
import { soundFx } from '../utils/soundEffects';
import { subscribeToSiteStatistics, SiteStatistics } from '../lib/firebase';

interface TaskbarProps {
  windows: WindowState[];
  activeWindowId: WindowAppId | null;
  onOpenApp: (appId: WindowAppId) => void;
  onToggleMinimize: (appId: WindowAppId) => void;
  onShutdown: () => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  isScanlinesEnabled: boolean;
  onToggleScanlines: () => void;
  notifications: NotificationItem[];
  onLaunchTimeTravel: () => void;
  onTestScreensaver?: () => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  windows,
  activeWindowId,
  onOpenApp,
  onToggleMinimize,
  onShutdown,
  isSoundEnabled,
  onToggleSound,
  isScanlinesEnabled,
  onToggleScanlines,
  notifications,
  onLaunchTimeTravel,
  onTestScreensaver
}) => {
  const [isStartOpen, setIsStartOpen] = useState<boolean>(false);
  const [activeSubmenu, setActiveSubmenu] = useState<'programs' | 'documents' | 'games' | 'settings' | 'help' | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('2:26 PM');
  const [siteStats, setSiteStats] = useState<SiteStatistics>({ totalVisits: 1, totalSignatures: 0 });
  const [isMBotEnabled, setIsMBotEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      return localStorage.getItem('mBotEnabled') !== 'false';
    } catch (e) {
      return true;
    }
  });
  const startRef = useRef<HTMLDivElement>(null);

  // Subscribe to real-time site stats in Taskbar
  useEffect(() => {
    const unsub = subscribeToSiteStatistics((st) => {
      setSiteStats(st);
    });
    return () => unsub();
  }, []);

  // Sync M-BOT visibility state with global events and storage
  useEffect(() => {
    const handleMBotStatus = (e: Event) => {
      const ce = e as CustomEvent<{ enabled?: boolean }>;
      if (ce.detail?.enabled !== undefined) {
        setIsMBotEnabled(ce.detail.enabled);
      } else {
        try {
          setIsMBotEnabled(localStorage.getItem('mBotEnabled') !== 'false');
        } catch (err) {}
      }
    };

    window.addEventListener('mbot-status-changed', handleMBotStatus);
    window.addEventListener('storage', handleMBotStatus);

    return () => {
      window.removeEventListener('mbot-status-changed', handleMBotStatus);
      window.removeEventListener('storage', handleMBotStatus);
    };
  }, []);

  const handleToggleMBot = (forceState?: boolean) => {
    const nextState = forceState !== undefined ? forceState : !isMBotEnabled;
    setIsMBotEnabled(nextState);
    try {
      localStorage.setItem('mBotEnabled', String(nextState));
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('mbot-toggle', { detail: { enabled: nextState } }));
    window.dispatchEvent(new CustomEvent('mbot-status-changed', { detail: { enabled: nextState } }));
    soundFx.playClick();
    if (nextState) {
      soundFx.playMBotChirp();
    }
  };

  // Clock format
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      setCurrentTime(timeStr);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close Start Menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (startRef.current && !startRef.current.contains(e.target as Node)) {
        setIsStartOpen(false);
        setActiveSubmenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStartButtonClick = () => {
    soundFx.playClick();
    setIsStartOpen(!isStartOpen);
    setActiveSubmenu(null);
  };

  const openAndCloseMenu = (appId: WindowAppId) => {
    soundFx.playClick();
    setIsStartOpen(false);
    setActiveSubmenu(null);
    onOpenApp(appId);
  };

  const getAppIcon = (appId: WindowAppId) => {
    switch (appId) {
      case 'welcome': return <Sparkles className="w-3.5 h-3.5 text-yellow-600 shrink-0" />;
      case 'projects': return <Folder className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
      case 'about': return <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />;
      case 'skills': return <Cpu className="w-3.5 h-3.5 text-indigo-600 shrink-0" />;
      case 'now': return <Clock className="w-3.5 h-3.5 text-lime-600 shrink-0" />;
      case 'contact': return <Mail className="w-3.5 h-3.5 text-rose-600 shrink-0" />;
      case 'guestbook': return <BookOpen className="w-3.5 h-3.5 text-blue-700 shrink-0" />;
      case 'resume': return <FileText className="w-3.5 h-3.5 text-red-600 shrink-0" />;
      case 'paint': return <Palette className="w-3.5 h-3.5 text-pink-600 shrink-0" />;
      case 'quiz': return <HelpCircle className="w-3.5 h-3.5 text-yellow-600 shrink-0" />;
      case 'clippy': return <span className="text-xs">📎</span>;
      case 'games':
      case 'experiments': return <Gamepad2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />;
      case 'aims': return <MessageSquare className="w-3.5 h-3.5 text-orange-600 shrink-0" />;
      case 'settings': return <Settings className="w-3.5 h-3.5 text-slate-700 shrink-0" />;
      case 'napster': return <Music className="w-3.5 h-3.5 text-cyan-600 shrink-0" />;
      case 'nostalgia': return <Tv className="w-3.5 h-3.5 text-amber-700 shrink-0" />;
      case 'trash': return <Trash2 className="w-3.5 h-3.5 text-gray-600 shrink-0" />;
      default: return <Folder className="w-3.5 h-3.5 text-blue-600 shrink-0" />;
    }
  };

  const openWindows = windows.filter((w) => w.isOpen);

  return (
    <div
      ref={startRef}
      className="fixed bottom-0 left-0 right-0 h-10 bg-[#c0c0c0] border-t-2 border-white flex items-center justify-between px-1.5 select-none z-50 shadow-md font-sans text-xs"
    >
      {/* LEFT SECTION: START BUTTON & OPEN WINDOWS */}
      <div className="flex items-center gap-1.5 h-full py-1 flex-1 min-w-0">
        {/* Windows 2000 Start Button */}
        <button
          onClick={handleStartButtonClick}
          className={`h-full px-3 flex items-center gap-1.5 font-bold text-gray-900 border-2 cursor-pointer transition active:translate-y-0.5 ${
            isStartOpen
              ? 'bg-[#d8d8d8] border-gray-800 border-r-white border-b-white shadow-inner font-black'
              : 'bg-[#c0c0c0] border-white border-r-gray-800 border-b-gray-800 shadow'
          }`}
        >
          {/* Windows 4-Color Flag Icon */}
          <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5">
            <span className="bg-[#ff3333] rounded-[1px]" />
            <span className="bg-[#33cc33] rounded-[1px]" />
            <span className="bg-[#3366ff] rounded-[1px]" />
            <span className="bg-[#ffcc00] rounded-[1px]" />
          </div>
          <span className="text-xs font-mono font-bold tracking-tight">Iniciar</span>
        </button>

        {/* Separator */}
        <div className="w-[2px] h-6 bg-gray-400 border-r border-white mx-0.5" />

        {/* Taskbar Open Windows Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar h-full flex-1 max-w-2xl">
          {openWindows.map((win) => {
            const isActive = activeWindowId === win.id && !win.isMinimized;
            return (
              <button
                key={win.id}
                onClick={() => {
                  soundFx.playClick();
                  onToggleMinimize(win.id);
                }}
                className={`h-full px-2.5 max-w-[150px] min-w-[90px] flex items-center gap-1.5 text-left border-2 cursor-pointer truncate transition ${
                  isActive
                    ? 'bg-[#e4e4e4] border-gray-800 border-r-white border-b-white font-bold shadow-inner text-blue-950'
                    : 'bg-[#c0c0c0] border-white border-r-gray-800 border-b-gray-800 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {getAppIcon(win.id)}
                <span className="truncate text-[11px]">{win.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT SECTION: SYSTEM TRAY */}
      <div className="flex items-center gap-2 h-full py-1 shrink-0">
        <div className="bg-[#c0c0c0] border-bevel-in px-2.5 h-full flex items-center gap-2.5 text-gray-800 font-mono text-[11px]">
          {/* Real-time Visitor Counter Pill */}
          <button
            onClick={() => onOpenApp('guestbook')}
            className="flex items-center gap-1.5 px-1.5 py-0.5 bg-black text-lime-400 font-mono text-[10px] font-bold border border-gray-600 rounded-xs shadow-inner cursor-pointer hover:border-lime-400"
            title={`Contador de Visitas Reais: ${siteStats.totalVisits} | Assinaturas: ${siteStats.totalSignatures}`}
          >
            <Eye className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="tracking-wider">{String(siteStats.totalVisits).padStart(5, '0')}</span>
          </button>

          {/* Quick Travel Portal Button in Tray with Rainbow Energy Glow */}
          <button
            onClick={() => {
              soundFx.playClick();
              onLaunchTimeTravel();
            }}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-xs bg-[#0a0f24] text-white font-mono text-[10px] font-bold border border-cyan-400 shadow-inner cursor-pointer animate-travel-glow hover:scale-105 active:scale-95 transition"
            title="Iniciar Viagem Temporal (TRAVEL 2000 → 2026)"
          >
            <span className="text-[10px]">🌀</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-cyan-300 to-amber-300 font-black tracking-wider">TRAVEL</span>
          </button>

          {/* M-BOT System Tray Status / Quick Toggle */}
          <button
            onClick={() => handleToggleMBot()}
            className={`p-0.5 cursor-pointer rounded-xs flex items-center justify-center transition ${
              isMBotEnabled
                ? 'text-blue-900 hover:text-black hover:bg-black/10'
                : 'text-amber-700 bg-amber-200/80 border border-amber-500 animate-pulse'
            }`}
            title={isMBotEnabled ? 'M-BOT Companheiro Ativo (Clique para ocultar)' : 'M-BOT Oculto (Clique para desocultar e exibir)'}
          >
            <Bot className="w-3.5 h-3.5" />
          </button>

          {/* Audio Toggle */}
          <button
            onClick={onToggleSound}
            className="hover:text-black cursor-pointer p-0.5"
            title={isSoundEnabled ? 'Som Ativado' : 'Som Mudo'}
          >
            {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5 text-blue-900" /> : <VolumeX className="w-3.5 h-3.5 text-gray-500" />}
          </button>

          {/* CRT Scanline Toggle */}
          <button
            onClick={onToggleScanlines}
            className="hover:text-black cursor-pointer p-0.5"
            title={isScanlinesEnabled ? 'Linhas CRT Ativadas' : 'Linhas CRT Desativadas'}
          >
            <Monitor className={`w-3.5 h-3.5 ${isScanlinesEnabled ? 'text-green-800 font-bold' : 'text-gray-500'}`} />
          </button>

          {/* Digital Clock */}
          <span className="font-bold text-gray-900 ml-1">{currentTime}</span>
        </div>
      </div>

      {/* START MENU POPUP */}
      {isStartOpen && (
        <div className="absolute bottom-10 left-1 w-64 bg-[#c0c0c0] border-2 border-white border-r-gray-800 border-b-gray-800 shadow-2xl flex text-gray-900 select-none z-50">
          {/* Left Vertical Band (Windows 2000 Style) */}
          <div className="w-8 bg-gradient-to-t from-[#000080] via-[#000050] to-[#008080] text-white flex flex-col justify-end items-center py-4 font-mono font-bold tracking-widest text-xs">
            <span className="transform -rotate-90 origin-center whitespace-nowrap text-white drop-shadow">
              MATEUS OS 2000
            </span>
          </div>

          {/* Right Menu Content */}
          <div className="flex-1 py-1.5 px-1 space-y-0.5 text-xs">
            {/* 1. PROGRAMAS SUBMENU */}
            <div
              onMouseEnter={() => setActiveSubmenu('programs')}
              className="relative"
            >
              <div className="px-3 py-1.5 hover:bg-[#000080] hover:text-white cursor-pointer rounded-xs flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-amber-700" />
                  <span className="font-bold">Programas</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-white" />
              </div>

              {/* Submenu Content */}
              {activeSubmenu === 'programs' && (
                <div
                  className="absolute left-full -top-1 w-56 bg-[#c0c0c0] border-2 border-white border-r-gray-800 border-b-gray-800 shadow-2xl p-1 space-y-0.5 z-50"
                  onMouseLeave={() => setActiveSubmenu(null)}
                >
                  <div
                    onClick={() => openAndCloseMenu('welcome')}
                    className="px-2 py-1.5 hover:bg-[#000080] hover:text-white cursor-pointer flex items-center gap-2 font-bold"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-600" />
                    <span>Bem-Vindo · Leia-Me (Welcome.exe)</span>
                  </div>
                  <div
                    onClick={() => openAndCloseMenu('projects')}
                    className="px-2 py-1.5 hover:bg-[#000080] hover:text-white cursor-pointer flex items-center gap-2"
                  >
                    <Folder className="w-3.5 h-3.5 text-amber-700" />
                    <span>Trabalho Selecionado (Projects.exe)</span>
                  </div>
                  <div
                    onClick={() => openAndCloseMenu('about')}
                    className="px-2 py-1.5 hover:bg-[#000080] hover:text-white cursor-pointer flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-700" />
                    <span>Sobre Mim (Perfil & Trajetória)</span>
                  </div>
                  <div
                    onClick={() => openAndCloseMenu('education')}
                    className="px-2 py-1.5 hover:bg-[#000080] hover:text-white cursor-pointer flex items-center gap-2"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-800" />
                    <span>Educação, MBAs e Cursos</span>
                  </div>
                  <div
                    onClick={() => openAndCloseMenu('skills')}
                    className="px-2 py-1.5 hover:bg-[#000080] hover:text-white cursor-pointer flex items-center gap-2"
                  >
                    <Cpu className="w-3.5 h-3.5 text-indigo-700" />
                    <span>O Que Eu Faço (Competências)</span>
                  </div>
                  <div
                    onClick={() => openAndCloseMenu('now')}
                    className="px-2 py-1.5 hover:bg-[#000080] hover:text-white cursor-pointer flex items-center gap-2"
                  >
                    <Clock className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Agora (2026)</span>
                  </div>
                  <div
                    onClick={() => openAndCloseMenu('contact')}
                    className="px-2 py-1.5 hover:bg-[#000080] hover:text-white cursor-pointer flex items-center gap-2"
                  >
                    <Mail className="w-3.5 h-3.5 text-rose-700" />
                    <span>Contato Direto</span>
                  </div>
                  <div
                    onClick={() => openAndCloseMenu('guestbook')}
                    className="px-2 py-1.5 hover:bg-[#000080] hover:text-white cursor-pointer flex items-center gap-2"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-800" />
                    <span>Livro de Visitas (Guestbook.exe)</span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. DOCUMENTOS SUBMENU */}
            <div
              onMouseEnter={() => setActiveSubmenu('documents')}
              className="relative"
            >
              <div className="px-3 py-1.5 hover:bg-[#000080] hover:text-white cursor-pointer rounded-xs flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-800" />
                  <span>Documentos</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-white" />
              </div>

              {activeSubmenu === 'documents' && (
                <div
                  className="absolute left-full -top-1 w-56 bg-[#c0c0c0] border-2 border-white border-r-gray-800 border-b-gray-800 shadow-2xl p-1 space-y-0.5 z-50"
                  onMouseLeave={() => setActiveSubmenu(null)}
                >
                  <div
                    onClick={() => openAndCloseMenu('resume')}
                    className="px-2 py-1.5 hover:bg-[#000080] hover:text-white cursor-pointer flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5 text-red-700" />
                    <span>Resumo_Mateus_Araujo.pdf</span>
                  </div>
                  <div
                    onClick={() => openAndCloseMenu('experience')}
                    className="px-2 py-1.5 hover:bg-[#000080] hover:text-white cursor-pointer flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5 text-green-800" />
                    <span>Função Atual</span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. JOGOS SUBMENU */}
            <div
              onMouseEnter={() => setActiveSubmenu('games')}
              className="relative"
            >
              <div className="px-3 py-1.5 hover:bg-[#000080] hover:text-white cursor-pointer rounded-xs flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-purple-800" />
                  <span>Jogos Retrô</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-white" />
              </div>

              {activeSubmenu === 'games' && (
                <div
                  className="absolute left-full -top-1 w-52 bg-[#c0c0c0] border-2 border-white border-r-gray-800 border-b-gray-800 shadow-2xl p-1 space-y-0.5 z-50"
                  onMouseLeave={() => setActiveSubmenu(null)}
                >
                  <div
                    onClick={() => openAndCloseMenu('games')}
                    className="px-2 py-1.5 hover:bg-[#000080] hover:text-white cursor-pointer flex items-center gap-2"
                  >
                    <span>🃏 Paciência 2000 (Solitaire)</span>
                  </div>
                  <div
                    onClick={() => openAndCloseMenu('games')}
                    className="px-2 py-1.5 hover:bg-[#000080] hover:text-white cursor-pointer flex items-center gap-2"
                  >
                    <span>🐍 Snake 3310</span>
                  </div>
                  <div
                    onClick={() => openAndCloseMenu('games')}
                    className="px-2 py-1.5 hover:bg-[#000080] hover:text-white cursor-pointer flex items-center gap-2"
                  >
                    <span>⚽ Futebol 2000</span>
                  </div>
                  <div
                    onClick={() => openAndCloseMenu('games')}
                    className="px-2 py-1.5 hover:bg-[#000080] hover:text-white cursor-pointer flex items-center gap-2"
                  >
                    <span>💣 Campo Minado</span>
                  </div>
                </div>
              )}
            </div>

            {/* 4. CONFIGURAÇÕES SUBMENU */}
            <div
              onMouseEnter={() => setActiveSubmenu('settings')}
              className="relative"
            >
              <div className="px-3 py-1.5 hover:bg-[#000080] hover:text-white cursor-pointer rounded-xs flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-slate-800" />
                  <span>Configurações</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-white" />
              </div>

              {activeSubmenu === 'settings' && (
                <div
                  className="absolute left-full -top-1 w-56 bg-[#c0c0c0] border-2 border-white border-r-gray-800 border-b-gray-800 shadow-2xl p-1 space-y-0.5 z-50"
                  onMouseLeave={() => setActiveSubmenu(null)}
                >
                  <div
                    onClick={() => openAndCloseMenu('settings')}
                    className="px-2 py-1.5 hover:bg-[#000080] hover:text-white cursor-pointer flex items-center gap-2"
                  >
                    <Palette className="w-3.5 h-3.5 text-blue-900" />
                    <span>Personalizar / Fundos</span>
                  </div>
                  <div
                    onClick={() => {
                      onToggleSound();
                      soundFx.playClick();
                    }}
                    className="px-2 py-1.5 hover:bg-[#000080] hover:text-white cursor-pointer flex items-center gap-2"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-gray-800" />
                    <span>Alternar Som ({isSoundEnabled ? 'Ligado' : 'Desligado'})</span>
                  </div>
                  <div
                    onClick={() => {
                      onToggleScanlines();
                      soundFx.playClick();
                    }}
                    className="px-2 py-1.5 hover:bg-[#000080] hover:text-white cursor-pointer flex items-center gap-2"
                  >
                    <Monitor className="w-3.5 h-3.5 text-gray-800" />
                    <span>Linhas CRT ({isScanlinesEnabled ? 'Ligado' : 'Desligado'})</span>
                  </div>
                  <div
                    onClick={() => {
                      handleToggleMBot();
                    }}
                    className="px-2 py-1.5 hover:bg-[#000080] hover:text-white cursor-pointer flex items-center justify-between border-t border-gray-400 mt-1 pt-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <Bot className="w-3.5 h-3.5 text-blue-700" />
                      <span>M-BOT Mascote</span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold ${isMBotEnabled ? 'text-green-800' : 'text-amber-800'}`}>
                      {isMBotEnabled ? 'Exibido' : 'Oculto'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 5. DESCANSO DE TELA */}
            <div
              onClick={() => {
                soundFx.playClick();
                setIsStartOpen(false);
                if (onTestScreensaver) {
                  onTestScreensaver();
                }
              }}
              className="px-3 py-1.5 hover:bg-[#000080] hover:text-white cursor-pointer rounded-xs flex items-center gap-2"
            >
              <Moon className="w-4 h-4 text-indigo-800" />
              <span>Descanso de Tela Agora</span>
            </div>

            {/* 6. AJUDA SUBMENU */}
            <div
              onClick={() => openAndCloseMenu('clippy')}
              className="px-3 py-1.5 hover:bg-[#000080] hover:text-white cursor-pointer rounded-xs flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4 text-yellow-700" />
              <span>Ajuda & Clippy</span>
            </div>

            {/* 7. M-BOT (DESOCULTAR / EXIBIR / INTERAGIR) */}
            {!isMBotEnabled ? (
              <div
                onClick={() => {
                  handleToggleMBot(true);
                  setIsStartOpen(false);
                }}
                className="px-3 py-1.5 bg-amber-200/90 hover:bg-[#000080] hover:text-white cursor-pointer rounded-xs flex items-center justify-between font-bold text-blue-950 group border border-amber-400 shadow-xs my-0.5"
                title="Clique para desocultar e reativar o mascote M-BOT no desktop"
              >
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-blue-900 group-hover:text-white shrink-0 animate-bounce" />
                  <span className="truncate">Desocultar M-BOT</span>
                </div>
                <span className="text-[9px] px-1 py-0.5 bg-amber-400 group-hover:bg-amber-300 text-slate-950 rounded-xs font-mono font-bold shrink-0">
                  RESTAURAR
                </span>
              </div>
            ) : (
              <div
                onClick={() => {
                  setIsStartOpen(false);
                  soundFx.playClick();
                  window.dispatchEvent(new CustomEvent('mbot-interact'));
                }}
                className="px-3 py-1.5 hover:bg-[#000080] hover:text-white cursor-pointer rounded-xs flex items-center justify-between group"
                title="M-BOT Companheiro Ativo (Clique para interagir)"
              >
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-blue-700 group-hover:text-white shrink-0" />
                  <span>M-BOT Mascote</span>
                </div>
                <span className="text-[10px] text-green-700 group-hover:text-green-300 font-mono font-bold">
                  ATIVO
                </span>
              </div>
            )}

            {/* Divider */}
            <div className="my-1 border-t border-gray-400 border-b border-white" />

            {/* 7. VIAGEM NO TEMPO (2026) */}
            <div
              onClick={() => {
                soundFx.playClick();
                setIsStartOpen(false);
                onLaunchTimeTravel();
              }}
              className="px-3 py-1.5 hover:bg-[#000080] hover:text-white cursor-pointer rounded-xs flex items-center gap-2 font-bold"
            >
              <span className="text-sm">🌀</span>
              <span>Viagem no Tempo (2026)</span>
            </div>

            {/* 8. DESLIGAR SISTEMA */}
            <div
              onClick={() => {
                soundFx.playClick();
                setIsStartOpen(false);
                onShutdown();
              }}
              className="px-3 py-1.5 hover:bg-[#000080] hover:text-white cursor-pointer rounded-xs flex items-center gap-2"
            >
              <Power className="w-4 h-4 text-red-700" />
              <span>Desligar Sistema...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
