import React, { useState, useRef, useEffect } from 'react';
import { Minus, Square, Copy, X, Folder, User, Briefcase, GraduationCap, Cpu, Sparkles, FileText, Truck, Clock, Mail, Terminal as TermIcon, Gamepad2, Settings as SettingsIcon, Trash2, Check, HelpCircle, RefreshCw, CpuIcon } from 'lucide-react';
import { WindowState, WindowAppId } from '../types';
import { soundFx } from '../utils/soundEffects';

interface WindowFrameProps {
  windowState: WindowState;
  isActive: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  windowState,
  isActive,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  children
}) => {
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: windowState.x,
    y: windowState.y
  });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  // Active Menu Dropdown State
  const [openMenu, setOpenMenu] = useState<'file' | 'edit' | 'view' | 'tools' | 'help' | null>(null);
  const [menuToast, setMenuToast] = useState<string | null>(null);

  // Sync position if passed externally
  useEffect(() => {
    setPosition({ x: windowState.x, y: windowState.y });
  }, [windowState.x, windowState.y]);

  const getTitlebarGradient = (appId: WindowAppId, active: boolean) => {
    if (!active) return 'bg-[#808080] text-gray-300';

    switch (appId) {
      case 'welcome':
        return 'bg-gradient-to-r from-[#000080] via-[#004080] to-[#000080] text-white';
      case 'about':
        return 'bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white';
      case 'projects':
        return 'bg-gradient-to-r from-emerald-700 via-teal-800 to-emerald-950 text-white';
      case 'contact':
        return 'bg-gradient-to-r from-red-700 via-rose-800 to-rose-950 text-white';
      case 'education':
        return 'bg-gradient-to-r from-amber-600 via-yellow-700 to-amber-900 text-white';
      case 'experience':
        return 'bg-gradient-to-r from-orange-700 via-amber-800 to-orange-950 text-white';
      case 'skills':
        return 'bg-gradient-to-r from-violet-700 via-purple-800 to-violet-950 text-white';
      case 'resume':
        return 'bg-gradient-to-r from-cyan-700 via-blue-800 to-cyan-950 text-white';
      case 'terminal':
        return 'bg-gradient-to-r from-emerald-950 via-black to-green-950 text-green-400 border-b border-green-800';
      case 'experiments':
      case 'games':
        return 'bg-gradient-to-r from-fuchsia-700 via-pink-800 to-fuchsia-950 text-white';
      case 'now':
        return 'bg-gradient-to-r from-lime-700 via-emerald-800 to-lime-950 text-white';
      case 'paint':
        return 'bg-gradient-to-r from-pink-700 via-purple-800 to-pink-950 text-white';
      case 'quiz':
        return 'bg-gradient-to-r from-blue-800 via-indigo-900 to-blue-950 text-yellow-300';
      case 'clippy':
        return 'bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-700 text-black';
      case 'aims':
        return 'bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 text-white';
      case 'napster':
        return 'bg-gradient-to-r from-blue-900 via-cyan-800 to-blue-950 text-cyan-300';
      case 'nostalgia':
        return 'bg-gradient-to-r from-slate-900 via-gray-900 to-black text-amber-300';
      case 'logistics':
        return 'bg-gradient-to-r from-indigo-800 via-blue-900 to-slate-900 text-white';
      case 'settings':
        return 'bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 text-white';
      case 'trash':
        return 'bg-gradient-to-r from-gray-700 via-gray-800 to-slate-900 text-gray-200';
      default:
        return 'bg-gradient-to-r from-[#000080] to-[#1084d0] text-white';
    }
  };

  const showToast = (msg: string) => {
    setMenuToast(msg);
    setTimeout(() => setMenuToast(null), 2500);
  };

  // Dragging handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (windowState.isMaximized) return;
    onFocus();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (windowState.isMaximized) return;
    onFocus();
    if (e.touches.length > 0) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      };
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = Math.max(10, Math.min(window.innerWidth - 100, e.clientX - dragStartRef.current.x));
      const newY = Math.max(10, Math.min(window.innerHeight - 80, e.clientY - dragStartRef.current.y));
      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length === 0) return;
      const newX = Math.max(10, Math.min(window.innerWidth - 100, e.touches[0].clientX - dragStartRef.current.x));
      const newY = Math.max(10, Math.min(window.innerHeight - 80, e.touches[0].clientY - dragStartRef.current.y));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  if (!windowState.isOpen || windowState.isMinimized) {
    return null;
  }

  const isMaximized = windowState.isMaximized;

  const style: React.CSSProperties = isMaximized
    ? {
        position: 'fixed',
        top: '10px',
        left: '10px',
        right: '10px',
        bottom: '50px',
        width: 'calc(100vw - 20px)',
        height: 'calc(100vh - 60px)',
        zIndex: windowState.zIndex,
      }
    : {
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${windowState.width}px`,
        height: `${windowState.height}px`,
        maxWidth: 'calc(100vw - 20px)',
        maxHeight: 'calc(100vh - 70px)',
        zIndex: windowState.zIndex,
      };

  return (
    <div
      ref={windowRef}
      style={style}
      onClick={() => {
        onFocus();
        setOpenMenu(null);
      }}
      className={`flex flex-col bg-[#c0c0c0] border-2 border-white border-r-gray-800 border-b-gray-800 shadow-2xl ${
        isActive ? 'ring-2 ring-yellow-400/60 shadow-2xl' : 'opacity-95'
      } transition-shadow duration-150 overflow-hidden select-text relative`}
    >
      {/* Toast Notification for Menu Actions */}
      {menuToast && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 bg-black text-yellow-300 font-mono text-xs px-4 py-2 border-2 border-yellow-400 shadow-xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-green-400" />
          <span>{menuToast}</span>
        </div>
      )}

      {/* Colorful Title Bar */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={`h-8 px-2 flex items-center justify-between cursor-move select-none ${getTitlebarGradient(
          windowState.id,
          isActive
        )}`}
      >
        <div className="flex items-center gap-2 font-bold text-xs md:text-sm tracking-tight truncate">
          <span className="truncate drop-shadow-sm font-mono uppercase">
            {windowState.title}
          </span>
        </div>

        {/* Bevel Control Buttons */}
        <div className="flex items-center gap-1 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              soundFx.playClick();
              onMinimize();
            }}
            title="Minimizar"
            className="w-5 h-5 bg-[#c0c0c0] hover:bg-[#d0d0d0] border border-white border-r-gray-800 border-b-gray-800 text-xs font-bold flex items-center justify-center text-gray-900 active:border-inset cursor-pointer pb-1"
          >
            _
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onMaximize();
            }}
            title={isMaximized ? "Restaurar" : "Maximizar"}
            className="w-5 h-5 bg-[#c0c0c0] hover:bg-[#d0d0d0] border border-white border-r-gray-800 border-b-gray-800 text-xs font-bold flex items-center justify-center text-gray-900 active:border-inset cursor-pointer"
          >
            {isMaximized ? '❐' : '□'}
          </button>

          <button
            onClick={() => {
              soundFx.playWindowClose();
              onClose();
            }}
            title="Fechar"
            className="w-5 h-5 bg-[#c0c0c0] hover:bg-red-600 hover:text-white border border-white border-r-gray-800 border-b-gray-800 text-xs font-bold flex items-center justify-center text-gray-900 active:border-inset cursor-pointer"
          >
            ×
          </button>
        </div>
      </div>

      {/* Retro Window Menu Bar: File | Edit | View | Tools | Help */}
      <div className="bg-[#c0c0c0] border-b border-gray-400 px-2 py-0.5 flex gap-4 text-xs font-sans text-gray-900 relative select-none">
        {(['file', 'edit', 'view', 'tools', 'help'] as const).map((menuKey) => (
          <div key={menuKey} className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                soundFx.playClick();
                setOpenMenu(openMenu === menuKey ? null : menuKey);
              }}
              className={`px-2 py-0.5 capitalize cursor-pointer hover:bg-[#000080] hover:text-white ${
                openMenu === menuKey ? 'bg-[#000080] text-white font-bold' : ''
              }`}
            >
              {menuKey}
            </button>

            {/* Dropdown Box */}
            {openMenu === menuKey && (
              <div className="absolute top-full left-0 mt-0.5 bg-[#c0c0c0] border-2 border-white border-r-gray-800 border-b-gray-800 shadow-xl py-1 w-44 z-50 text-xs text-gray-900 font-sans">
                {menuKey === 'file' && (
                  <>
                    <button
                      onClick={() => {
                        showToast('Janela atualizada!');
                        setOpenMenu(null);
                      }}
                      className="w-full text-left px-3 py-1 hover:bg-[#000080] hover:text-white cursor-pointer"
                    >
                      Atualizar / Reload
                    </button>
                    <div className="border-t border-gray-400 my-1" />
                    <button
                      onClick={() => {
                        onClose();
                        setOpenMenu(null);
                      }}
                      className="w-full text-left px-3 py-1 hover:bg-[#000080] hover:text-white cursor-pointer text-red-800 font-bold"
                    >
                      Sair / Exit
                    </button>
                  </>
                )}

                {menuKey === 'edit' && (
                  <>
                    <button
                      onClick={() => {
                        showToast('Conteúdo copiado para a área de transferência!');
                        setOpenMenu(null);
                      }}
                      className="w-full text-left px-3 py-1 hover:bg-[#000080] hover:text-white cursor-pointer"
                    >
                      Copiar Informações
                    </button>
                    <button
                      onClick={() => {
                        showToast('Texto selecionado!');
                        setOpenMenu(null);
                      }}
                      className="w-full text-left px-3 py-1 hover:bg-[#000080] hover:text-white cursor-pointer"
                    >
                      Selecionar Tudo
                    </button>
                  </>
                )}

                {menuKey === 'view' && (
                  <>
                    <button
                      onClick={() => {
                        onMaximize();
                        setOpenMenu(null);
                      }}
                      className="w-full text-left px-3 py-1 hover:bg-[#000080] hover:text-white cursor-pointer"
                    >
                      {isMaximized ? 'Restaurar Tamanho' : 'Modo Tela Cheia'}
                    </button>
                    <button
                      onClick={() => {
                        setPosition({ x: 50, y: 50 });
                        setOpenMenu(null);
                      }}
                      className="w-full text-left px-3 py-1 hover:bg-[#000080] hover:text-white cursor-pointer"
                    >
                      Resetar Posição
                    </button>
                  </>
                )}

                {menuKey === 'tools' && (
                  <>
                    <button
                      onClick={() => {
                        showToast('Diagnóstico: 0 erros. Sistema Operacional 100% íntegro.');
                        setOpenMenu(null);
                      }}
                      className="w-full text-left px-3 py-1 hover:bg-[#000080] hover:text-white cursor-pointer"
                    >
                      Executar Diagnóstico
                    </button>
                  </>
                )}

                {menuKey === 'help' && (
                  <>
                    <button
                      onClick={() => {
                        showToast(`Software: ${windowState.title} - Mateus Araujo OS v2.5`);
                        setOpenMenu(null);
                      }}
                      className="w-full text-left px-3 py-1 hover:bg-[#000080] hover:text-white cursor-pointer"
                    >
                      Sobre o Aplicativo
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Window Content Interior Container */}
      <div className="flex-1 overflow-auto bg-slate-950 p-4 m-1 border-2 border-gray-500 border-r-white border-b-white text-slate-100 custom-scrollbar relative">
        {children}
      </div>

      {/* Bottom Status Bar */}
      <div className="flex justify-between items-center px-3 py-1 text-[10px] text-gray-700 font-mono bg-[#c0c0c0] border-t border-gray-400 select-none">
        <span className="truncate">PROCESS: {windowState.id.toUpperCase()}.EXE ACTIVE</span>
        <div className="flex gap-3 shrink-0 font-bold">
          <span className="text-emerald-800">STATUS: 200 OK</span>
          <span>MEM: 64MB</span>
          <span>MATEUS_OS</span>
        </div>
      </div>
    </div>
  );
};

