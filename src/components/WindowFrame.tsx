import React, { useState, useRef, useEffect } from 'react';
import { Minus, Square, Copy, X, Folder, User, Briefcase, GraduationCap, Cpu, Sparkles, FileText, Truck, Clock, Mail, Terminal as TermIcon, Gamepad2, Settings as SettingsIcon, Trash2, Check, HelpCircle, RefreshCw, ChevronLeft } from 'lucide-react';
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
  const [screenSize, setScreenSize] = useState<{ width: number; height: number }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  const isMobile = screenSize.width < 768;
  const isTablet = screenSize.width >= 768 && screenSize.width < 1024;

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

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync and clamp position if passed externally or resized
  useEffect(() => {
    if (isMobile) return;

    if (isTablet) {
      // Center on tablet
      const tabletW = Math.min(screenSize.width * 0.92, 780);
      const tabletH = Math.min(screenSize.height * 0.86, 680);
      setPosition({
        x: Math.max(10, Math.floor((screenSize.width - tabletW) / 2)),
        y: Math.max(10, Math.floor((screenSize.height - tabletH - 45) / 2))
      });
    } else {
      // Desktop: clamp so it never renders offscreen
      const safeX = Math.max(16, Math.min(screenSize.width - windowState.width - 20, windowState.x));
      const safeY = Math.max(16, Math.min(screenSize.height - windowState.height - 60, windowState.y));
      setPosition({ x: safeX, y: safeY });
    }
  }, [windowState.x, windowState.y, windowState.width, windowState.height, isMobile, isTablet, screenSize.width, screenSize.height]);

  const getTitlebarGradient = (appId: WindowAppId, active: boolean) => {
    if (!active) return 'bg-[#808080] text-gray-300';

    switch (appId) {
      case 'welcome':
        return 'bg-gradient-to-r from-[#000080] via-[#004080] to-[#000080] text-white';
      case 'about':
        return 'bg-gradient-to-r from-[#000080] via-[#0a3570] to-[#000080] text-white';
      case 'projects':
        return 'bg-gradient-to-r from-[#000080] via-[#004d40] to-[#000080] text-white';
      case 'contact':
        return 'bg-gradient-to-r from-[#000080] via-[#7b1fa2] to-[#000080] text-white';
      case 'education':
        return 'bg-gradient-to-r from-[#000080] via-[#1565c0] to-[#000080] text-white';
      case 'experience':
        return 'bg-gradient-to-r from-[#000080] via-[#2e7d32] to-[#000080] text-white';
      case 'skills':
        return 'bg-gradient-to-r from-[#000080] via-[#303f9f] to-[#000080] text-white';
      case 'resume':
        return 'bg-gradient-to-r from-[#000080] via-[#b71c1c] to-[#000080] text-white';
      case 'terminal':
        return 'bg-gradient-to-r from-emerald-950 via-black to-green-950 text-green-400 border-b border-green-800';
      case 'experiments':
      case 'games':
        return 'bg-gradient-to-r from-[#000080] via-[#4a148c] to-[#000080] text-white';
      case 'now':
        return 'bg-gradient-to-r from-[#000080] via-[#33691e] to-[#000080] text-white';
      case 'paint':
        return 'bg-gradient-to-r from-[#000080] via-[#ad1457] to-[#000080] text-white';
      case 'quiz':
        return 'bg-gradient-to-r from-[#000080] via-[#e65100] to-[#000080] text-yellow-200';
      case 'clippy':
        return 'bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-700 text-black';
      case 'aims':
        return 'bg-gradient-to-r from-[#000080] via-[#bf360c] to-[#000080] text-white';
      case 'napster':
        return 'bg-gradient-to-r from-[#000080] via-[#006064] to-[#000080] text-cyan-200';
      case 'nostalgia':
        return 'bg-gradient-to-r from-slate-900 via-gray-900 to-black text-amber-300';
      case 'logistics':
        return 'bg-gradient-to-r from-[#000080] via-[#1a237e] to-[#000080] text-white';
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

  // Dragging handlers (desktop only)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobile || windowState.isMaximized) return;
    onFocus();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isMobile || windowState.isMaximized) return;
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
    if (isMobile) return;

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
  }, [isDragging, isMobile]);

  if (!windowState.isOpen || windowState.isMinimized) {
    return null;
  }

  const isMaximized = windowState.isMaximized;

  // Responsive Styles
  let style: React.CSSProperties;

  if (isMobile) {
    // Fullscreen on mobile devices
    style = {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: '100dvh',
      zIndex: 100 + windowState.zIndex,
    };
  } else if (isTablet) {
    // Responsive centered on tablet
    const tabletW = Math.min(screenSize.width * 0.92, 780);
    const tabletH = Math.min(screenSize.height * 0.86, 680);
    style = {
      position: 'fixed',
      left: `${position.x}px`,
      top: `${position.y}px`,
      width: `${tabletW}px`,
      height: `${tabletH}px`,
      maxWidth: 'calc(100vw - 20px)',
      maxHeight: 'calc(100vh - 55px)',
      zIndex: windowState.zIndex,
    };
  } else if (isMaximized) {
    // Maximized on desktop
    style = {
      position: 'fixed',
      top: '8px',
      left: '8px',
      right: '8px',
      bottom: '48px',
      width: 'calc(100vw - 16px)',
      height: 'calc(100vh - 56px)',
      zIndex: windowState.zIndex,
    };
  } else {
    // Floating on desktop
    style = {
      position: 'fixed',
      left: `${position.x}px`,
      top: `${position.y}px`,
      width: `${Math.min(windowState.width, screenSize.width - 32)}px`,
      height: `${Math.min(windowState.height, screenSize.height - 70)}px`,
      maxWidth: 'calc(100vw - 20px)',
      maxHeight: 'calc(100vh - 60px)',
      zIndex: windowState.zIndex,
    };
  }

  return (
    <div
      ref={windowRef}
      style={style}
      onClick={() => {
        onFocus();
        setOpenMenu(null);
      }}
      className={`flex flex-col bg-[#ECE9D8] border-2 border-white border-r-gray-800 border-b-gray-800 shadow-2xl ${
        isActive ? 'ring-2 ring-yellow-400/70 shadow-2xl' : 'opacity-98'
      } transition-shadow duration-150 overflow-hidden select-text relative`}
    >
      {/* Toast Notification for Menu Actions */}
      {menuToast && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 bg-[#2b2b2b] text-yellow-300 font-mono text-xs px-4 py-2 border-2 border-yellow-400 shadow-xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-green-400" />
          <span>{menuToast}</span>
        </div>
      )}

      {/* Responsive Title Bar */}
      {isMobile ? (
        /* Mobile Dedicated Top Navigation Bar */
        <div
          className={`h-11 px-3 flex items-center justify-between select-none shadow-md shrink-0 ${getTitlebarGradient(
            windowState.id,
            true
          )}`}
        >
          {/* Back Button */}
          <button
            onClick={() => {
              soundFx.playWindowClose();
              onClose();
            }}
            className="flex items-center gap-1 px-2 py-1 bg-white/15 hover:bg-white/25 active:bg-white/30 rounded text-xs font-bold font-mono text-white transition cursor-pointer min-h-[34px]"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>VOLTAR</span>
          </button>

          {/* App Title Center */}
          <div className="font-bold text-xs font-mono uppercase tracking-tight truncate max-w-[170px] text-center text-white drop-shadow-sm">
            {windowState.title}
          </div>

          {/* Close Button Right */}
          <button
            onClick={() => {
              soundFx.playWindowClose();
              onClose();
            }}
            className="w-8 h-8 flex items-center justify-center bg-red-600/80 hover:bg-red-600 active:bg-red-700 text-white rounded text-sm font-bold cursor-pointer"
            title="Fechar"
          >
            ✕
          </button>
        </div>
      ) : (
        /* Desktop / Tablet Classic 2000s Titlebar */
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className={`h-8 px-2 flex items-center justify-between ${
            !isMaximized ? 'cursor-move' : ''
          } select-none shrink-0 ${getTitlebarGradient(
            windowState.id,
            isActive
          )}`}
        >
          <div className="flex items-center gap-2 font-bold text-xs md:text-sm tracking-tight truncate">
            <span className="truncate drop-shadow-sm font-mono uppercase text-[12px] md:text-[13px]">
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
              className="w-5 h-5 bg-[#ECE9D8] hover:bg-[#F5F4ED] border border-white border-r-gray-800 border-b-gray-800 text-xs font-bold flex items-center justify-center text-gray-900 active:border-inset cursor-pointer pb-1"
            >
              _
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onMaximize();
              }}
              title={isMaximized ? "Restaurar" : "Maximizar"}
              className="w-5 h-5 bg-[#ECE9D8] hover:bg-[#F5F4ED] border border-white border-r-gray-800 border-b-gray-800 text-xs font-bold flex items-center justify-center text-gray-900 active:border-inset cursor-pointer"
            >
              {isMaximized ? '❐' : '□'}
            </button>

            <button
              onClick={() => {
                soundFx.playWindowClose();
                onClose();
              }}
              title="Fechar"
              className="w-5 h-5 bg-[#ECE9D8] hover:bg-red-600 hover:text-white border border-white border-r-gray-800 border-b-gray-800 text-xs font-bold flex items-center justify-center text-gray-900 active:border-inset cursor-pointer"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Classic Menu Bar (Visible on Desktop / Tablet) */}
      {!isMobile && (
        <div className="bg-[#ECE9D8] border-b border-gray-400 px-2 py-0.5 flex gap-3 text-xs font-sans text-gray-900 relative select-none shrink-0">
          {(['file', 'edit', 'view', 'tools', 'help'] as const).map((menuKey) => (
            <div key={menuKey} className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  soundFx.playClick();
                  setOpenMenu(openMenu === menuKey ? null : menuKey);
                }}
                className={`px-2 py-0.5 capitalize cursor-pointer hover:bg-[#000080] hover:text-white rounded-xs ${
                  openMenu === menuKey ? 'bg-[#000080] text-white font-bold' : ''
                }`}
              >
                {menuKey}
              </button>

              {/* Dropdown Box */}
              {openMenu === menuKey && (
                <div className="absolute top-full left-0 mt-0.5 bg-[#ECE9D8] border-2 border-white border-r-gray-800 border-b-gray-800 shadow-xl py-1 w-44 z-50 text-xs text-gray-900 font-sans">
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
                        Sair / Fechar
                      </button>
                    </>
                  )}

                  {menuKey === 'edit' && (
                    <>
                      <button
                        onClick={() => {
                          showToast('Conteúdo selecionado!');
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
                        Centralizar Posição
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
                          showToast(`Software: ${windowState.title} - Mateus OS`);
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
      )}

      {/* Window Content Interior Container - Authentic Retro System Canvas */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#F5F4ED] p-3 sm:p-5 m-1 border-2 border-[#808080] border-r-white border-b-white text-gray-900 custom-scrollbar relative">
        {children}
      </div>

      {/* Bottom Status Bar */}
      <div className="flex justify-between items-center px-3 py-1 text-[10px] text-gray-700 font-mono bg-[#ECE9D8] border-t border-gray-400 select-none shrink-0">
        <span className="truncate uppercase font-bold text-blue-950">
          STATUS: {windowState.id}.EXE ATIVO
        </span>
        <div className="flex gap-2 sm:gap-3 shrink-0 font-bold">
          <span className="text-emerald-800">200 OK</span>
          <span className="hidden sm:inline">MEM: 64MB</span>
          <span>MATEUS_OS</span>
        </div>
      </div>
    </div>
  );
};


