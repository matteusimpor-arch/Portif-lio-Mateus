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
  ChevronRight
} from 'lucide-react';
import { WindowAppId, WindowState, NotificationItem } from '../types';
import { soundFx } from '../utils/soundEffects';

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
}) => {
  const [isStartOpen, setIsStartOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('2:26 PM');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const startRef = useRef<HTMLDivElement>(null);

  // Update clock format
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

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (startRef.current && !startRef.current.contains(e.target as Node)) {
        setIsStartOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getAppIcon = (appId: WindowAppId) => {
    const props = { className: "w-3.5 h-3.5 shrink-0" };
    switch (appId) {
      case 'welcome': return <Sparkles {...props} className="w-3.5 h-3.5 text-yellow-600" />;
      case 'projects': return <Folder {...props} className="w-3.5 h-3.5 text-amber-600" />;
      case 'about': return <FileText {...props} className="w-3.5 h-3.5 text-blue-600" />;
      case 'skills': return <Cpu {...props} className="w-3.5 h-3.5 text-indigo-600" />;
      case 'now': return <Clock {...props} className="w-3.5 h-3.5 text-lime-600" />;
      case 'contact': return <Mail {...props} className="w-3.5 h-3.5 text-rose-600" />;
      case 'resume': return <FileText {...props} className="w-3.5 h-3.5 text-red-600" />;
      case 'paint': return <Palette {...props} className="w-3.5 h-3.5 text-pink-600" />;
      case 'quiz': return <HelpCircle {...props} className="w-3.5 h-3.5 text-yellow-600" />;
      case 'clippy': return <span className="text-xs">📎</span>;
      case 'games':
      case 'experiments': return <Gamepad2 {...props} className="w-3.5 h-3.5 text-purple-600" />;
      case 'aims': return <MessageSquare {...props} className="w-3.5 h-3.5 text-orange-600" />;
      case 'settings': return <Settings {...props} className="w-3.5 h-3.5 text-slate-700" />;
      case 'napster': return <Music {...props} className="w-3.5 h-3.5 text-cyan-600" />;
      case 'nostalgia': return <Tv {...props} className="w-3.5 h-3.5 text-amber-700" />;
      case 'trash': return <Trash2 {...props} className="w-3.5 h-3.5 text-gray-600" />;
      default: return <Folder {...props} className="w-3.5 h-3.5 text-blue-600" />;
    }
  };

  const startMenuItems: { id: WindowAppId; label: string; desc: string }[] = [
    { id: 'welcome', label: '✦ Bem-Vindo · Leia-Me', desc: 'Apresentação inicial e visão geral' },
    { id: 'projects', label: 'Trabalho Selecionado', desc: 'Dashboards, Supply Chain & Web' },
    { id: 'about', label: 'Sobre mim', desc: 'Biografia e filosofia de trabalho' },
    { id: 'skills', label: 'O que eu faço', desc: 'Logística, Engenharia de Prompt e Gestão' },
    { id: 'now', label: 'Agora (2026)', desc: 'Focos atuais, aprendizado e metas' },
    { id: 'contact', label: 'Contato', desc: 'WhatsApp, LinkedIn e Email' },
    { id: 'resume', label: 'Résumé.pdf', desc: 'Visualizar e baixar currículo oficial' },
    { id: 'paint', label: 'Criança Pix', desc: 'Estúdio retrô de pintura e pixel art' },
    { id: 'quiz', label: 'Cultura Pop Quiz', desc: 'Jogo de perguntas dos anos 2000' },
    { id: 'clippy', label: 'Clippy Ajuda', desc: 'Dicas interativas e atalhos' },
    { id: 'games', label: 'Jogos', desc: 'Campo Minado, Paciência, Snake' },
    { id: 'aims', label: 'AIMS Messenger', desc: 'Bate-papo instantâneo com Mateus' },
    { id: 'napster', label: 'Categoria: Napster', desc: 'Player MP3 retrô e visualizador' },
    { id: 'nostalgia', label: 'Momentos de Nostalgia', desc: 'Sintonizador de TV CRT e memórias' },
    { id: 'settings', label: 'Fundos & Temas', desc: 'Papéis de parede e configurações' },
    { id: 'trash', label: 'Lixeira', desc: 'Arquivos descontinuados' },
  ];

  const filteredStartItems = startMenuItems.filter(
    (item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartItemClick = (appId: WindowAppId) => {
    try { soundFx.playClick(); } catch (e) {}
    if (appId === 'timetravel') {
      onLaunchTimeTravel();
    } else {
      onOpenApp(appId);
    }
    setIsStartOpen(false);
  };

  const openWindows = windows.filter((w) => w.isOpen);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-10 bg-[#c0c0c0] border-t-2 border-white flex items-center justify-between px-1 sm:px-2 z-40 select-none shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
      {/* Left: Start Button + Window Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar max-w-[75%] h-full py-1">
        {/* Start Button */}
        <div ref={startRef} className="relative shrink-0 flex items-center gap-1">
          <button
            onClick={() => {
              try { soundFx.playClick(); } catch (e) {}
              setIsStartOpen(!isStartOpen);
            }}
            className={`h-8 px-3 btn-retro flex items-center gap-1.5 font-bold text-xs text-black cursor-pointer shadow-xs ${
              isStartOpen ? 'border-gray-800 border-t-gray-800 border-l-gray-800 bg-[#d0d0d0]' : ''
            }`}
          >
            <div className="w-4 h-4 bg-gradient-to-br from-red-500 via-yellow-400 to-green-500 flex items-center justify-center text-[9px] text-black font-black shrink-0">
              田
            </div>
            <span className="font-bold tracking-tight">✦ Início</span>
          </button>

          {/* Start Menu Popup */}
          {isStartOpen && (
            <div className="absolute bottom-11 left-0 w-80 sm:w-96 bg-[#c0c0c0] border-2 border-white border-r-gray-800 border-b-gray-800 shadow-2xl overflow-hidden z-50 font-sans">
              {/* Header Profile */}
              <div className="bg-gradient-to-r from-[#000080] via-[#1084d0] to-[#000080] p-3 border-b-2 border-white flex items-center justify-between text-white shadow-md">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-yellow-400 text-blue-950 font-black flex items-center justify-center font-vt323 text-lg border-2 border-white shadow">
                    MA
                  </div>
                  <div>
                    <h3 className="font-black text-white text-sm tracking-wide font-vt323 text-lg">MATEUS OS 2000</h3>
                    <p className="text-[10px] text-yellow-300 font-mono font-bold">EDIÇÃO ANO 2000 • ED. 2026</p>
                  </div>
                </div>
                <span className="bg-blue-900 border border-blue-400 text-white px-2 py-0.5 rounded text-[10px] font-mono">
                  ONLINE
                </span>
              </div>

              {/* Search Bar */}
              <div className="p-2 border-b border-gray-400 bg-[#d0d0d0]">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar aplicativo no sistema..."
                    className="w-full bg-white text-xs text-gray-900 pl-8 pr-3 py-1 border-2 border-gray-500 border-r-white border-b-white focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Big Time Travel Action Button */}
              <div className="p-1.5 bg-[#b0b0b0] border-b border-gray-400">
                <button
                  onClick={() => {
                    try { soundFx.playClick(); } catch (e) {}
                    setIsStartOpen(false);
                    onLaunchTimeTravel();
                  }}
                  className="w-full bg-gradient-to-r from-blue-950 via-indigo-900 to-purple-900 hover:from-blue-900 hover:to-purple-800 text-white p-2 border-2 border-yellow-300 text-left flex items-center justify-between group cursor-pointer shadow-md"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-300 animate-spin shrink-0" />
                    <div>
                      <div className="font-bold text-xs text-yellow-300 font-mono">Viagem no Tempo 2000 ➔ 2026</div>
                      <div className="text-[10px] text-blue-200">MATEUS SPACE Interativo com Partículas</div>
                    </div>
                  </div>
                  <span className="bg-yellow-400 text-black font-bold text-[9px] px-1.5 py-0.5 font-mono">
                    Entrar ›
                  </span>
                </button>
              </div>

              {/* Menu Apps List */}
              <div className="max-h-72 overflow-y-auto custom-scrollbar p-1 space-y-0.5 bg-white">
                {filteredStartItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleStartItemClick(item.id)}
                    className="w-full text-left p-1.5 hover:bg-[#000080] hover:text-white flex items-center gap-2.5 transition cursor-pointer group text-gray-900 text-xs"
                  >
                    <div className="p-1 bg-[#c0c0c0] border border-gray-600 rounded-xs group-hover:bg-blue-900 shrink-0">
                      {getAppIcon(item.id)}
                    </div>
                    <div className="truncate">
                      <div className="font-bold group-hover:text-white truncate">{item.label}</div>
                      <div className="text-[10px] text-gray-500 group-hover:text-blue-200 truncate">{item.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Footer Restart / Shutdown */}
              <div className="p-2 bg-[#c0c0c0] border-t-2 border-white flex justify-between items-center text-xs">
                <button
                  onClick={() => {
                    try { soundFx.playClick(); } catch (e) {}
                    setIsStartOpen(false);
                    window.location.reload();
                  }}
                  className="btn-retro px-2.5 py-1 text-gray-900 cursor-pointer font-bold text-[11px] flex items-center gap-1"
                >
                  <RotateCw className="w-3 h-3 text-amber-700" />
                  <span>Reiniciar</span>
                </button>

                <button
                  onClick={() => {
                    try { soundFx.playClick(); } catch (e) {}
                    setIsStartOpen(false);
                    onShutdown();
                  }}
                  className="btn-retro px-3 py-1 text-gray-900 hover:bg-red-600 hover:text-white cursor-pointer font-bold text-[11px] flex items-center gap-1"
                >
                  <Power className="w-3 h-3 text-red-600" />
                  <span>Desligar</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Open Windows Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar h-full">
          {openWindows.map((win) => {
            const isActive = activeWindowId === win.id && !win.isMinimized;
            return (
              <button
                key={win.id}
                onClick={() => {
                  try { soundFx.playClick(); } catch (e) {}
                  onToggleMinimize(win.id);
                }}
                className={`h-8 px-2.5 flex items-center gap-1.5 text-xs font-sans max-w-[170px] truncate cursor-pointer transition ${
                  isActive
                    ? 'bg-[#e0e0e0] border-2 border-gray-500 border-t-gray-800 border-l-gray-800 font-bold text-gray-950 shadow-inner'
                    : win.isMinimized
                    ? 'btn-retro text-gray-600 opacity-80'
                    : 'btn-retro text-gray-900'
                }`}
              >
                {getAppIcon(win.iconName as WindowAppId)}
                <span className="truncate">{win.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Section: 🟢 Atualização para 2026 + Sound + Clock */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Green Upgrade Button to 2026 */}
        <button
          onClick={() => {
            try { soundFx.playClick(); } catch (e) {}
            onLaunchTimeTravel();
          }}
          className="h-8 px-2 sm:px-3 bg-emerald-800 hover:bg-emerald-700 text-yellow-300 border-2 border-emerald-500 flex items-center gap-1.5 font-bold text-xs font-mono cursor-pointer shadow-xs active:scale-95"
          title="Viajar no tempo para 2026"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="hidden sm:inline">Atualização para 2026</span>
          <span className="sm:hidden">2026</span>
          <Sparkles className="w-3 h-3 text-yellow-300 animate-spin" />
        </button>

        {/* System Tray Frame */}
        <div className="h-8 flex items-center gap-1.5 bg-[#c0c0c0] border-2 border-gray-500 border-t-gray-800 border-l-gray-800 px-2 shadow-inner text-gray-900 font-mono text-xs shrink-0">
          {/* CRT Scanlines Toggle */}
          <button
            onClick={onToggleScanlines}
            title={isScanlinesEnabled ? 'Desativar efeito CRT' : 'Ativar efeito CRT'}
            className={`p-0.5 rounded cursor-pointer ${
              isScanlinesEnabled ? 'text-blue-900 font-bold' : 'text-gray-600'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={isSoundEnabled ? 'Som ativado' : 'Som mutado'}
            className="p-0.5 text-gray-800 cursor-pointer"
          >
            {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-gray-400" />}
          </button>

          {/* Clock matching 2:26 PM */}
          <div className="font-sans font-bold text-[11px] text-gray-900 border-l border-gray-400 pl-1.5">
            {currentTime}
          </div>
        </div>
      </div>
    </div>
  );
};
