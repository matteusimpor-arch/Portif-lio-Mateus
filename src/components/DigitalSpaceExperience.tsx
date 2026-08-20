import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  ArrowLeft,
  User,
  Cpu,
  Folder,
  Mail,
  Gamepad2,
  Clock,
  X,
  ChevronRight,
  Search,
  FileText,
  MessageSquare,
  Sparkles,
  BookOpen,
  HelpCircle
} from 'lucide-react';
import { soundFx } from '../utils/soundEffects';
import { ParticleTextCanvas } from './ParticleTextCanvas';
import { SpaceBlueBackgroundCanvas } from './SpaceBlueBackgroundCanvas';
import { ScreensaverCanvas } from './ScreensaverCanvas';

// Dedicated Space 2026 Futuristic Apps
import { SpaceAboutApp } from './apps/space2026/SpaceAboutApp';
import { SpaceSkillsApp } from './apps/space2026/SpaceSkillsApp';
import { SpaceProjectsApp } from './apps/space2026/SpaceProjectsApp';
import { SpaceResumeApp } from './apps/space2026/SpaceResumeApp';
import { SpaceNowApp } from './apps/space2026/SpaceNowApp';
import { SpaceAimsApp } from './apps/space2026/SpaceAimsApp';
import { SpaceGamesApp } from './apps/space2026/SpaceGamesApp';
import { SpaceContactApp } from './apps/space2026/SpaceContactApp';
import { SpaceClippy } from './apps/space2026/SpaceClippy';
import { GuestbookApp } from './apps/GuestbookApp';

interface DigitalSpaceExperienceProps {
  onBackToRetro: () => void;
}

interface SpaceNode {
  id: string;
  title: string;
  subtitle: string;
  category: 'core' | 'interactive';
  icon: React.ElementType;
  color: string;
  glowColor: string;
  accentHex: string;
  badge?: string;
  description: string;
  revealThreshold: number; // scroll progress where this app activates
}

export const DigitalSpaceExperience: React.FC<DigitalSpaceExperienceProps> = ({
  onBackToRetro,
}) => {
  // Continuous Scroll Progress (0.0 = Hero, 1.0 = All Apps Materialized)
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [scrollVelocity, setScrollVelocity] = useState<number>(0);
  const targetScrollRef = useRef<number>(0);
  const currentScrollRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Selected node expanded to center modal
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isOpeningApp, setIsOpeningApp] = useState<boolean>(false);
  const [isClosingApp, setIsClosingApp] = useState<boolean>(false);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [reduceMotion, setReduceMotion] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Automatic Idle Screensaver System (30 seconds)
  const [isScreensaverActive, setIsScreensaverActive] = useState<boolean>(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetIdleTimer = useCallback(() => {
    if (isScreensaverActive) {
      setIsScreensaverActive(false);
    }
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = setTimeout(() => {
      setIsScreensaverActive(true);
    }, 30000);
  }, [isScreensaverActive]);

  useEffect(() => {
    resetIdleTimer();

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'wheel'];
    const handleUserActivity = () => resetIdleTimer();

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, handleUserActivity);
      });
    };
  }, [resetIdleTimer]);

  // Smooth Spring / Lerp Animation Loop for Scroll Progress
  useEffect(() => {
    let lastTime = performance.now();

    const animateScroll = (time: number) => {
      const dt = Math.min(32, time - lastTime) / 1000;
      lastTime = time;

      const target = targetScrollRef.current;
      const current = currentScrollRef.current;
      const diff = target - current;

      if (Math.abs(diff) > 0.0005 || Math.abs(velocityRef.current) > 0.001) {
        const ease = reduceMotion ? 0.25 : 0.085;
        const newCurrent = current + diff * ease;
        const vel = (newCurrent - current) / Math.max(0.001, dt);

        currentScrollRef.current = Math.max(0, Math.min(1, newCurrent));
        velocityRef.current = vel;

        setScrollProgress(currentScrollRef.current);
        setScrollVelocity(vel);
      } else {
        currentScrollRef.current = target;
        velocityRef.current = 0;
        setScrollProgress(target);
        setScrollVelocity(0);
      }

      animFrameRef.current = requestAnimationFrame(animateScroll);
    };

    animFrameRef.current = requestAnimationFrame(animateScroll);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [reduceMotion]);

  // Unified Scroll / Wheel Handler
  const handleWheel = (e: React.WheelEvent) => {
    if (selectedNodeId !== null) return;
    resetIdleTimer();

    const delta = e.deltaY * 0.00095;
    targetScrollRef.current = Math.max(0, Math.min(1, targetScrollRef.current + delta));
  };

  // Touch Gestures for Mobile
  const touchStartYRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (selectedNodeId !== null) return;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (selectedNodeId !== null || touchStartYRef.current === null) return;
    resetIdleTimer();
    const currentY = e.touches[0].clientY;
    const deltaY = (touchStartYRef.current - currentY) * 0.0028;
    touchStartYRef.current = currentY;

    targetScrollRef.current = Math.max(0, Math.min(1, targetScrollRef.current + deltaY));
  };

  const handleTouchEnd = () => {
    touchStartYRef.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedNodeId !== null) {
        if (e.key === 'Escape') {
          handleCloseApp();
        }
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        resetIdleTimer();
        targetScrollRef.current = Math.min(1, targetScrollRef.current + 0.25);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        resetIdleTimer();
        targetScrollRef.current = Math.max(0, targetScrollRef.current - 0.25);
      } else if (e.key === 'Home') {
        resetIdleTimer();
        targetScrollRef.current = 0;
      } else if (e.key === 'End') {
        resetIdleTimer();
        targetScrollRef.current = 1;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, resetIdleTimer]);

  // Jump to Apps / Jump to Hero buttons
  const scrollToApps = () => {
    try { soundFx.playClick(); } catch (e) {}
    targetScrollRef.current = 1;
  };

  const scrollToHero = () => {
    try { soundFx.playClick(); } catch (e) {}
    targetScrollRef.current = 0;
  };

  // MATEUS SPACE 2026 APPS WITH FUTURISTIC IDENTIFIERS
  const spaceNodes: SpaceNode[] = useMemo(() => [
    {
      id: 'about',
      title: 'SOBRE MIM',
      subtitle: 'Perfil Digital & Trajetória',
      category: 'core',
      icon: User,
      color: 'from-blue-600 to-cyan-500',
      glowColor: 'shadow-cyan-500/50',
      accentHex: '#06b6d4',
      badge: 'PERFIL',
      description: 'Formação acadêmica, MBAs, trajetória no Exército e pilares de liderança.',
      revealThreshold: 0.25
    },
    {
      id: 'skills',
      title: 'O QUE EU FAÇO',
      subtitle: 'Capabilities System',
      category: 'core',
      icon: Cpu,
      color: 'from-blue-500 to-indigo-600',
      glowColor: 'shadow-blue-500/50',
      accentHex: '#3b82f6',
      badge: 'MATRIZ',
      description: 'Logística Avançada, Gestão Pública, Finanças e Engenharia de Prompt com IA.',
      revealThreshold: 0.35
    },
    {
      id: 'projects',
      title: 'TRABALHO SELECIONADO',
      subtitle: 'Project Explorer 2026',
      category: 'core',
      icon: Folder,
      color: 'from-cyan-500 to-blue-600',
      glowColor: 'shadow-cyan-500/50',
      accentHex: '#22d3ee',
      badge: 'PROJETOS',
      description: 'Arquitetura front-end interativa, dot matrix particle engine e Web Audio API.',
      revealThreshold: 0.45
    },
    {
      id: 'resume',
      title: 'RESUMO.PDF',
      subtitle: 'Digital Resume Viewer',
      category: 'core',
      icon: FileText,
      color: 'from-sky-500 to-blue-700',
      glowColor: 'shadow-sky-500/50',
      accentHex: '#38bdf8',
      badge: 'PDF',
      description: 'Visualizador de currículo com download em PDF e histórico profissional.',
      revealThreshold: 0.55
    },
    {
      id: 'now',
      title: 'AGORA 2026',
      subtitle: 'Live Status & Metas',
      category: 'core',
      icon: Clock,
      color: 'from-indigo-500 to-blue-600',
      glowColor: 'shadow-indigo-500/50',
      accentHex: '#6366f1',
      badge: 'AO VIVO',
      description: 'Projetos em andamento, estudos ativos e objetivos estratégicos traçados.',
      revealThreshold: 0.65
    },
    {
      id: 'aims',
      title: 'AIMS TERMINAL',
      subtitle: 'Communication Terminal',
      category: 'interactive',
      icon: MessageSquare,
      color: 'from-cyan-600 to-blue-800',
      glowColor: 'shadow-cyan-600/50',
      accentHex: '#0891b2',
      badge: 'CHAT',
      description: 'Comunicador neural para conversar e tirar dúvidas sobre a carreira de Mateus.',
      revealThreshold: 0.75
    },
    {
      id: 'games',
      title: 'SPACE ARCADE',
      subtitle: 'Game Center Futurista',
      category: 'interactive',
      icon: Gamepad2,
      color: 'from-blue-600 to-sky-600',
      glowColor: 'shadow-blue-600/50',
      accentHex: '#2563eb',
      badge: 'ARCADE',
      description: 'Paciência Nebula, Cosmic Snake, Campo Minado Quântico e Pinball Espacial.',
      revealThreshold: 0.85
    },
    {
      id: 'contact',
      title: 'CONTATO',
      subtitle: 'Communication Hub',
      category: 'core',
      icon: Mail,
      color: 'from-emerald-500 to-cyan-500',
      glowColor: 'shadow-emerald-500/50',
      accentHex: '#10b981',
      badge: 'WHATSAPP',
      description: 'Cards diretos para WhatsApp em destaque prioritário, LinkedIn, E-mail e GitHub.',
      revealThreshold: 0.90
    },
    {
      id: 'guestbook',
      title: 'LIVRO DE VISITAS',
      subtitle: 'Registro Comunitário',
      category: 'interactive',
      icon: BookOpen,
      color: 'from-cyan-600 to-emerald-600',
      glowColor: 'shadow-emerald-500/50',
      accentHex: '#06b6d4',
      badge: 'GUESTBOOK',
      description: 'Deixe sua assinatura digital persistente no portfólio via Firebase Firestore.',
      revealThreshold: 0.95
    }
  ], []);

  // App Opening / Closing Handlers with Smooth Scale & Fade Transition
  const handleOpenApp = (node: SpaceNode) => {
    resetIdleTimer();
    try { soundFx.playWindowOpen(); } catch (err) {}

    setIsOpeningApp(true);
    setSelectedNodeId(node.id);

    setTimeout(() => {
      setIsOpeningApp(false);
    }, 280);
  };

  const handleCloseApp = () => {
    resetIdleTimer();
    try { soundFx.playWindowClose(); } catch (err) {}

    setIsClosingApp(true);
    setTimeout(() => {
      setSelectedNodeId(null);
      setIsClosingApp(false);
    }, 240);
  };

  const handleDirectAppSwitch = (targetNode: SpaceNode) => {
    if (targetNode.id === selectedNodeId) return;
    resetIdleTimer();
    try { soundFx.playClick(); } catch (err) {}
    setSelectedNodeId(targetNode.id);
  };

  const filteredNodes = useMemo(() => {
    return spaceNodes.filter((node) => {
      const matchSearch =
        node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [spaceNodes, searchQuery]);

  // Render the Dedicated Futuristic Space Sub-Apps
  const renderCenterApp = (nodeId: string) => {
    switch (nodeId) {
      case 'about': return <SpaceAboutApp />;
      case 'skills': return <SpaceSkillsApp />;
      case 'projects': return <SpaceProjectsApp />;
      case 'resume': return <SpaceResumeApp />;
      case 'now': return <SpaceNowApp />;
      case 'aims': return <SpaceAimsApp />;
      case 'games': return <SpaceGamesApp />;
      case 'contact': return <SpaceContactApp />;
      case 'guestbook': return <GuestbookApp mode="space" />;
      default: return <SpaceAboutApp />;
    }
  };

  const selectedNode = spaceNodes.find((n) => n.id === selectedNodeId);

  // Progressive Visual Interpolations:
  const heroOpacity = Math.max(0, 1 - scrollProgress * 2.5);
  const heroScale = 1 + scrollProgress * 0.15;
  const appsOpacity = Math.min(1, Math.max(0, (scrollProgress - 0.25) / 0.65));
  const appsScale = 0.92 + appsOpacity * 0.08;

  return (
    <div
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-50 bg-[#000206] text-white overflow-hidden select-none font-sans flex flex-col justify-between"
    >
      {/* 3-LAYER PARALLAX DEEP BLUE SPACE BACKGROUND CANVAS (#020817, #03152D, #008CFF, #000000) */}
      <SpaceBlueBackgroundCanvas
        reduceMotion={reduceMotion}
        scrollProgress={scrollProgress}
      />

      {/* =========================================================================
          MAIN IN-PLACE ARENA (SEAMLESS SCROLL PROGRESSION)
      ========================================================================== */}
      <main
        className={`relative z-20 flex-1 w-full h-full flex items-center justify-center overflow-hidden p-3 sm:p-4 transition-all duration-300 ${
          selectedNodeId ? 'filter blur-[4px] scale-95 opacity-40 pointer-events-none' : ''
        }`}
      >
        {/* 1. MATEUS ARAUJO BLUE DOT MATRIX HERO */}
        {heroOpacity > 0.01 && (
          <div
            onClick={scrollToApps}
            style={{
              opacity: heroOpacity,
              transform: `scale(${heroScale})`,
              pointerEvents: heroOpacity > 0.6 ? 'auto' : 'none'
            }}
            className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-150 z-10 p-4 cursor-pointer"
          >
            <div className="w-full max-w-6xl flex flex-col items-center justify-center">
              <ParticleTextCanvas
                isCompact={false}
                reduceMotion={reduceMotion}
              />
            </div>
          </div>
        )}

        {/* 2. THE APPS MATERIALIZED IN-PLACE WITH ZERO-GRAVITY SPACE FLOATING */}
        {appsOpacity > 0.02 && (
          <div
            style={{
              opacity: appsOpacity,
              transform: `scale(${appsScale})`,
              pointerEvents: appsOpacity > 0.4 ? 'auto' : 'none'
            }}
            className="w-full max-w-5xl flex flex-col items-center gap-3 z-20 transition-all duration-150"
          >
            {/* Top Navigation & Search Bar */}
            <div className="w-full flex items-center justify-between px-1">
              <button
                onClick={scrollToHero}
                className="text-[11px] font-mono text-cyan-400/90 hover:text-cyan-200 flex items-center gap-1 cursor-pointer transition hover:underline"
              >
                <span>↑ Retornar ao início</span>
              </button>

              <div className="relative w-44 sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-cyan-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar módulo..."
                  className="w-full bg-black/75 text-white text-xs pl-8 pr-3 py-1.5 rounded-xl border border-cyan-900/90 focus:outline-hidden focus:border-cyan-400 font-mono backdrop-blur-md shadow-inner"
                />
              </div>
            </div>

            {/* Responsive App Grid with Glowing Hologram Borders & Hover Elevation */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
              {filteredNodes.map((node, index) => {
                const Icon = node.icon;
                const isHovered = hoveredNodeId === node.id;
                const isRevealed = scrollProgress >= node.revealThreshold || appsOpacity > 0.8;
                const nodeOpacity = isRevealed ? 1 : Math.max(0.2, (scrollProgress / node.revealThreshold));
                const floatAnimationClass = reduceMotion || isHovered ? '' : `animate-space-float-${index % 8}`;

                return (
                  <div
                    key={node.id}
                    onClick={() => handleOpenApp(node)}
                    onMouseEnter={() => {
                      setHoveredNodeId(node.id);
                      try { soundFx.playClick(); } catch (err) {}
                    }}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    style={{
                      opacity: nodeOpacity,
                      transform: isHovered ? 'translateY(-4px) scale(1.03)' : undefined
                    }}
                    className={`w-full p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col items-center text-center gap-2.5 group relative backdrop-blur-xl ${floatAnimationClass} ${
                      isHovered
                        ? 'bg-blue-950/90 border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.6)] z-30'
                        : 'bg-black/75 border-cyan-950/90 hover:border-cyan-700 shadow-[0_0_20px_rgba(0,10,30,0.6)]'
                    }`}
                  >
                    {/* Badge */}
                    {node.badge && (
                      <span className="absolute top-2.5 right-2.5 text-[9px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-blue-950 text-cyan-300 border border-cyan-700/60 shadow-xs">
                        {node.badge}
                      </span>
                    )}

                    {/* Glowing Blue Space Icon */}
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${node.color} flex items-center justify-center text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-transform group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.7)]`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Title & Subtitle */}
                    <div className="w-full">
                      <div className="font-bold text-xs sm:text-sm text-white truncate font-mono group-hover:text-cyan-300 transition-colors">
                        {node.title}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {node.subtitle}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed h-8 px-1">
                      {node.description}
                    </p>

                    <div className="w-full pt-1.5 border-t border-cyan-950/80 text-[10px] font-mono text-cyan-400 flex items-center justify-center gap-1 group-hover:text-cyan-200 transition-colors">
                      <span>Acessar Módulo</span>
                      <ChevronRight className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* CANTO INFERIOR ESQUERDO: OPÇÃO ÚNICA PARA RETORNAR AO MODO RETRÔ */}
      <button
        onClick={() => {
          try { soundFx.playClick(); } catch (e) {}
          onBackToRetro();
        }}
        className="fixed bottom-4 left-4 z-30 px-3.5 py-2 rounded-xl bg-black/80 hover:bg-blue-950 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white text-xs font-mono font-bold flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] active:scale-95 transition backdrop-blur-md"
        title="Retornar ao Windows 2000 (Modo Retrô)"
      >
        <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
        <span>← Back OS 00</span>
      </button>

      {/* FLOATING SPACE CLIPPY ASSISTANT */}
      {!selectedNodeId && (
        <SpaceClippy
          onOpenModule={(nodeId) => {
            const target = spaceNodes.find(n => n.id === nodeId);
            if (target) handleOpenApp(target);
          }}
          onBackToRetro={onBackToRetro}
        />
      )}

      {/* =========================================================================
          SELECTED NODE MODAL (FUTURISTIC HUD GLASS INTERFACE)
      ========================================================================== */}
      {selectedNodeId && selectedNode && (
        <div
          className={`fixed inset-2 sm:inset-5 z-40 bg-[#020817]/95 border-2 border-cyan-400/80 rounded-2xl shadow-[0_0_70px_rgba(6,182,212,0.35)] flex flex-col overflow-hidden backdrop-blur-2xl transition-all duration-300 ${
            isOpeningApp
              ? 'scale-95 opacity-0'
              : isClosingApp
              ? 'scale-95 opacity-0'
              : 'scale-100 opacity-100'
          }`}
        >
          {/* Modal Titlebar */}
          <div className="bg-blue-950/90 p-2.5 sm:p-3.5 border-b border-cyan-500/30 flex flex-wrap items-center justify-between gap-2">
            {/* Left: Active Module Identifier */}
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${selectedNode.color} flex items-center justify-center text-white shadow-md`}>
                {React.createElement(selectedNode.icon, { className: "w-4 h-4" })}
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm font-mono text-white flex items-center gap-1.5">
                  <span>{selectedNode.title}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-900 text-cyan-300 border border-blue-700">
                    2026
                  </span>
                </h3>
                <p className="text-[10px] text-slate-300">{selectedNode.subtitle}</p>
              </div>
            </div>

            {/* Center: DIRECT APP-TO-APP QUICK SWITCHER */}
            <div className="hidden lg:flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-cyan-950/90">
              {spaceNodes.map((n) => {
                const isCurrent = n.id === selectedNodeId;
                const NIcon = n.icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleDirectAppSwitch(n)}
                    title={`Navegar para ${n.title}`}
                    className={`px-2 py-1 rounded text-[10px] font-mono flex items-center gap-1 transition cursor-pointer ${
                      isCurrent
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                        : 'text-slate-400 hover:text-cyan-200 hover:bg-blue-950/50'
                    }`}
                  >
                    <NIcon className="w-3 h-3" />
                    <span>{n.title.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Right: Close Button */}
            <button
              onClick={handleCloseApp}
              className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-red-950 text-slate-300 hover:text-red-300 border border-cyan-900/80 hover:border-red-600 transition cursor-pointer flex items-center gap-1 text-xs font-mono"
              title="Retornar ao Space (ESC)"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline text-[10px]">Fechar</span>
            </button>
          </div>

          {/* Modal Content with Transparent Background allowing Cosmic Starfield Visibility */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-5 bg-[#010614]/90 text-slate-200">
            {renderCenterApp(selectedNodeId)}
          </div>

          {/* Modal Footer with Module Quick Links */}
          <div className="bg-blue-950/90 p-2.5 border-t border-cyan-900/60 flex items-center justify-between text-xs font-mono">
            <span className="text-[11px] text-cyan-400/80 hidden sm:inline">
              MATEUS SPACE 2026 • Navegue livremente pelos módulos
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex sm:hidden items-center gap-1 overflow-x-auto max-w-[200px] py-0.5">
                {spaceNodes.map(n => (
                  <button
                    key={n.id}
                    onClick={() => handleDirectAppSwitch(n)}
                    className={`px-1.5 py-0.5 text-[9px] rounded ${n.id === selectedNodeId ? 'bg-cyan-700 text-white' : 'bg-black/50 text-slate-400'}`}
                  >
                    {n.title.split(' ')[0]}
                  </button>
                ))}
              </div>
              <button
                onClick={handleCloseApp}
                className="px-3 py-1 rounded bg-blue-900/80 hover:bg-blue-800 border border-cyan-400/50 text-cyan-200 text-[11px] font-bold cursor-pointer transition shadow-xs"
              >
                Voltar ao Space ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          AUTOMATIC IDLE SCREENSAVER OVERLAY (30s INACTIVITY)
      ========================================================================== */}
      {isScreensaverActive && (
        <ScreensaverCanvas
          onWakeUp={() => setIsScreensaverActive(false)}
          reduceMotion={reduceMotion}
        />
      )}
    </div>
  );
};
