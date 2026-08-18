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
  MessageSquare
} from 'lucide-react';
import { soundFx } from '../utils/soundEffects';
import { ParticleTextCanvas } from './ParticleTextCanvas';
import { SpaceGreenBackgroundCanvas } from './SpaceGreenBackgroundCanvas';
import { AppMorphingCanvas, MorphAppItem } from './AppMorphingCanvas';
import { ScreensaverCanvas } from './ScreensaverCanvas';

// Sub-apps (Strictly 8 apps)
import { ProjectsApp } from './apps/ProjectsApp';
import { AboutApp } from './apps/AboutApp';
import { SkillsApp } from './apps/SkillsApp';
import { NowApp } from './apps/NowApp';
import { ContactApp } from './apps/ContactApp';
import { ResumeApp } from './apps/ResumeApp';
import { ExperimentsApp } from './apps/ExperimentsApp';
import { AimsMessengerApp } from './apps/AimsMessengerApp';

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
}

type SpaceMode = 'hero' | 'morphing_sequence' | 'apps';

export const DigitalSpaceExperience: React.FC<DigitalSpaceExperienceProps> = ({
  onBackToRetro,
}) => {
  // Current Mode:
  // 'hero' -> Displays MATEUS ARAUJO Hero.
  // 'morphing_sequence' -> Automated cinematic progression:
  //    1. Names appear ONE BY ONE in space cloud
  //    2. Short visual pause
  //    3. Names disintegrate into microparticles
  //    4. Particles converge into 8 App icons
  // 'apps' -> The 8 materialized apps in zero-gravity space
  const [mode, setMode] = useState<SpaceMode>('hero');

  // Automated Timeline State (0ms to 4800ms)
  const [seqTime, setSeqTime] = useState<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const seqStartTimeRef = useRef<number | null>(null);

  // Selected node expanded to center modal
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
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

  // Start Automated Cinematic Transition from Hero to Apps
  const triggerAutoSequence = useCallback(() => {
    if (mode !== 'hero') return;
    try { soundFx.playClick(); } catch (e) {}
    setMode('morphing_sequence');
    setSeqTime(0);
    seqStartTimeRef.current = performance.now();
  }, [mode]);

  // Reset back to Hero from Apps (Scroll Up)
  const triggerResetToHero = useCallback(() => {
    if (mode === 'hero') return;
    try { soundFx.playClick(); } catch (e) {}
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setMode('hero');
    setSeqTime(0);
  }, [mode]);

  // Automated Timeline Loop when in 'morphing_sequence'
  useEffect(() => {
    if (mode !== 'morphing_sequence') {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const TOTAL_SEQUENCE_MS = 4600;
    seqStartTimeRef.current = performance.now();

    const updateTimeline = (now: number) => {
      if (!seqStartTimeRef.current) seqStartTimeRef.current = now;
      const elapsed = now - seqStartTimeRef.current;
      setSeqTime(elapsed);

      if (elapsed < TOTAL_SEQUENCE_MS) {
        animFrameRef.current = requestAnimationFrame(updateTimeline);
      } else {
        // Automatically finalize into materialized apps!
        try { soundFx.playWindowOpen(); } catch (e) {}
        setMode('apps');
      }
    };

    animFrameRef.current = requestAnimationFrame(updateTimeline);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [mode]);

  // Unified Scroll / Wheel Handler:
  // Scroll Down in 'hero' -> Triggers automatic discovery & transformation
  // Scroll Up in 'apps' -> Returns to 'hero'
  const handleWheel = (e: React.WheelEvent) => {
    if (selectedNodeId !== null) return;
    resetIdleTimer();

    if (e.deltaY > 15 && mode === 'hero') {
      triggerAutoSequence();
    } else if (e.deltaY < -15 && mode === 'apps') {
      triggerResetToHero();
    }
  };

  // Touch Gestures for Mobile (Swipe Down to explore, Swipe Up to return)
  const touchStartYRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (selectedNodeId !== null) return;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (selectedNodeId !== null || touchStartYRef.current === null) return;
    resetIdleTimer();
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartYRef.current - touchEndY;

    if (deltaY > 30 && mode === 'hero') {
      // Swiped Upwards / Scrolled Downwards
      triggerAutoSequence();
    } else if (deltaY < -30 && mode === 'apps') {
      // Swiped Downwards / Scrolled Upwards
      triggerResetToHero();
    }
    touchStartYRef.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedNodeId !== null) return;

      if ((e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ' || e.key === 'Enter') && mode === 'hero') {
        resetIdleTimer();
        triggerAutoSequence();
      } else if ((e.key === 'ArrowUp' || e.key === 'PageUp') && mode === 'apps') {
        resetIdleTimer();
        triggerResetToHero();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, mode, triggerAutoSequence, triggerResetToHero, resetIdleTimer]);

  // EXACTLY 8 APPS IN MATEUS SPACE 2026
  const spaceNodes: SpaceNode[] = useMemo(() => [
    {
      id: 'about',
      title: 'SOBRE MIM',
      subtitle: 'Biografia & Filosofia',
      category: 'core',
      icon: User,
      color: 'from-teal-500 to-emerald-600',
      glowColor: 'shadow-teal-500/50',
      accentHex: '#14b8a6',
      badge: 'PERFIL',
      description: 'Trajetória profissional, pilares de atuação, conexões multidisciplinares e visão de futuro.'
    },
    {
      id: 'skills',
      title: 'O QUE EU FAÇO',
      subtitle: 'Competências & Serviços',
      category: 'core',
      icon: Cpu,
      color: 'from-emerald-500 to-green-600',
      glowColor: 'shadow-emerald-500/50',
      accentHex: '#10b981',
      badge: 'MATRIZ',
      description: 'Logística, Supply Chain, Engenharia de Prompt, Modelagem e Inteligência Aplicada.'
    },
    {
      id: 'projects',
      title: 'TRABALHO SELECIONADO',
      subtitle: 'Projetos & Dashboards',
      category: 'core',
      icon: Folder,
      color: 'from-cyan-500 to-teal-600',
      glowColor: 'shadow-cyan-500/50',
      accentHex: '#06b6d4',
      badge: 'DESTAQUE',
      description: 'Estudos de caso completos em Logística, IA, Gestão Pública e Engenharia de Prompt.'
    },
    {
      id: 'resume',
      title: 'RÉSUMÉ.PDF',
      subtitle: 'Currículo Oficial',
      category: 'core',
      icon: FileText,
      color: 'from-lime-500 to-emerald-600',
      glowColor: 'shadow-lime-500/50',
      accentHex: '#84cc16',
      badge: 'PDF',
      description: 'Visualizador de currículo com download em PDF e histórico profissional consolidado.'
    },
    {
      id: 'now',
      title: 'AGORA (2026)',
      subtitle: 'Focos Atuais & Metas',
      category: 'core',
      icon: Clock,
      color: 'from-green-500 to-emerald-600',
      glowColor: 'shadow-green-500/50',
      accentHex: '#22c55e',
      badge: 'EM ANDAMENTO',
      description: 'Projetos em construção, estudos ativos e objetivos traçados para 2026.'
    },
    {
      id: 'aims',
      title: 'AIMS',
      subtitle: 'Instant Messenger',
      category: 'interactive',
      icon: MessageSquare,
      color: 'from-teal-600 to-cyan-700',
      glowColor: 'shadow-teal-600/50',
      accentHex: '#0d9488',
      badge: 'CHAT',
      description: 'Comunicador instantâneo interativo para conversar diretamente com Mateus Araujo.'
    },
    {
      id: 'games',
      title: 'JOGOS',
      subtitle: 'Retro Arcade Hub 2000',
      category: 'interactive',
      icon: Gamepad2,
      color: 'from-emerald-600 to-teal-700',
      glowColor: 'shadow-emerald-600/50',
      accentHex: '#059669',
      badge: 'ARCADE',
      description: 'Paciência 2000, Futebol 2000, Mario Kart 2000, Campo Minado, Pinball e Snake 3310.'
    },
    {
      id: 'contact',
      title: 'CONTATO',
      subtitle: 'Canais Diretos',
      category: 'core',
      icon: Mail,
      color: 'from-lime-600 to-green-700',
      glowColor: 'shadow-lime-600/50',
      accentHex: '#65a30d',
      badge: 'DIRETO',
      description: 'Envie uma mensagem direta, acesse WhatsApp, LinkedIn e e-mail oficial.'
    }
  ], []);

  // Morph Items: connecting scattered starting positions directly to the in-place app card coordinates
  const morphItems: MorphAppItem[] = useMemo(() => {
    const scatteredCoords = [
      { startX: 18, startY: 24, rot: -6, scale: 1.04 },
      { startX: 78, startY: 22, rot: 7, scale: 0.96 },
      { startX: 24, startY: 50, rot: 5, scale: 1.08 },
      { startX: 82, startY: 48, rot: -7, scale: 0.95 },
      { startX: 16, startY: 74, rot: 8, scale: 1.0 },
      { startX: 50, startY: 28, rot: -5, scale: 1.1 },
      { startX: 50, startY: 76, rot: 6, scale: 0.98 },
      { startX: 84, startY: 74, rot: -7, scale: 1.02 }
    ];

    return spaceNodes.map((node, i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const targetX = 18 + col * 21.3;
      const targetY = 38 + row * 34;
      const sc = scatteredCoords[i % scatteredCoords.length];

      return {
        id: node.id,
        name: node.title,
        startX: sc.startX,
        startY: sc.startY,
        targetX,
        targetY,
        rotation: sc.rot,
        scale: sc.scale
      };
    });
  }, [spaceNodes]);

  // Automated Timeline Calculations:
  // 1. MATEUS ARAUJO Hero: visible at 'hero' and fades out during first 500ms of sequence
  const heroOpacity = mode === 'hero' ? 1 : Math.max(0, 1 - seqTime / 450);

  // 2. Names Appearance (ONE BY ONE): between 300ms and 2100ms
  // Each name has its own staggered entry timestamp
  const isNamesCloudVisible = mode === 'morphing_sequence' && seqTime >= 250 && seqTime <= 2900;
  const namesCloudGlobalOpacity = seqTime < 2400 ? 1 : Math.max(0, 1 - (seqTime - 2400) / 450);

  // 3. Particle Morphing Disintegration & Convergence: between 2400ms and 4200ms
  const isMorphActive = mode === 'morphing_sequence' && seqTime >= 2350;
  const morphProgress = isMorphActive ? Math.min(1, Math.max(0, (seqTime - 2400) / 1700)) : 0;

  // 4. In-Place Materialized Apps:
  // Appears smoothly as morphProgress approaches 1 (seqTime >= 4000) or when mode === 'apps'
  const isAppGridActive = mode === 'apps' || (mode === 'morphing_sequence' && seqTime >= 3900);
  const appGridOpacity = mode === 'apps' ? 1 : Math.min(1, Math.max(0, (seqTime - 3900) / 500));
  const appGridScale = mode === 'apps' ? 1 : 0.88 + appGridOpacity * 0.12;

  // Node Selection -> Travel to Center Modal
  const handleSelectNode = (nodeId: string) => {
    try { soundFx.playClick(); } catch (e) {}
    setSelectedNodeId(nodeId);
    resetIdleTimer();
  };

  // Close Center Modal -> Return Node to Orbit
  const handleCloseCenter = () => {
    try { soundFx.playClick(); } catch (e) {}
    setSelectedNodeId(null);
    resetIdleTimer();
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

  // Render the 8 Sub-Apps in Center Modal
  const renderCenterApp = (nodeId: string) => {
    switch (nodeId) {
      case 'about': return <AboutApp />;
      case 'skills': return <SkillsApp />;
      case 'projects': return <ProjectsApp />;
      case 'resume': return <ResumeApp />;
      case 'now': return <NowApp />;
      case 'aims': return <AimsMessengerApp />;
      case 'games': return <ExperimentsApp />;
      case 'contact': return <ContactApp />;
      default: return <AboutApp />;
    }
  };

  const selectedNode = spaceNodes.find((n) => n.id === selectedNodeId);

  return (
    <div
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-50 bg-[#000402] text-white overflow-hidden select-none font-sans flex flex-col justify-between"
    >
      {/* 3-LAYER PARALLAX TECH-NOIR SPACE BACKGROUND CANVAS */}
      <SpaceGreenBackgroundCanvas reduceMotion={reduceMotion} />

      {/* DISCREET TOP HUD */}
      <header className="relative z-30 p-3 sm:p-4 flex items-center justify-between backdrop-blur-md bg-black/25 border-b border-teal-500/10">
        {/* Left: Button strictly "← Back OS 00" */}
        <button
          onClick={() => {
            try { soundFx.playClick(); } catch (e) {}
            onBackToRetro();
          }}
          className="px-3 py-1.5 rounded bg-black/60 hover:bg-teal-950 border border-teal-900/80 hover:border-teal-400 text-teal-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 transition backdrop-blur-md"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-teal-400" />
          <span>← Back OS 00</span>
        </button>

        {/* Right: Motion Toggle */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setReduceMotion(!reduceMotion)}
            className={`px-2.5 py-1 rounded border text-[11px] cursor-pointer transition backdrop-blur-md ${
              reduceMotion
                ? 'bg-teal-950/80 border-teal-400 text-teal-300 font-bold'
                : 'bg-black/40 border-teal-950 text-slate-400 hover:text-teal-300'
            }`}
          >
            {reduceMotion ? 'Movimento: Reduzido' : 'Movimento: Suave'}
          </button>
        </div>
      </header>

      {/* =========================================================================
          MAIN IN-PLACE ARENA (PURE MYSTERY & DISCOVERY, NO STEP INDICATORS)
      ========================================================================== */}
      <main className="relative z-20 flex-1 w-full h-full flex items-center justify-center overflow-hidden p-4">
        {/* 1. MATEUS ARAUJO GRAND DOT MATRIX HERO */}
        {heroOpacity > 0.01 && (
          <div
            onClick={triggerAutoSequence}
            style={{
              opacity: heroOpacity,
              pointerEvents: mode === 'hero' ? 'auto' : 'none'
            }}
            className="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 z-10 p-4 cursor-pointer"
          >
            <div className="w-full max-w-6xl flex flex-col items-center justify-center">
              <ParticleTextCanvas
                isCompact={false}
                reduceMotion={reduceMotion}
              />
            </div>

            {/* Subtle interactive prompt to guide the user naturally */}
            {mode === 'hero' && (
              <div className="absolute bottom-12 flex flex-col items-center gap-2 font-mono text-xs text-teal-400/80 animate-pulse pointer-events-none">
                <span className="text-[11px] tracking-widest uppercase">Role para baixo ou clique para explorar</span>
                <div className="w-4 h-7 rounded-full border border-teal-400/50 flex justify-center p-1">
                  <div className="w-1 h-2 bg-teal-400 rounded-full animate-bounce" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. STAGGERED ORGANIC WORD CLOUD (App names appear ONE BY ONE) */}
        {isNamesCloudVisible && (
          <div
            style={{ opacity: namesCloudGlobalOpacity }}
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-12"
          >
            {morphItems.map((item, index) => {
              // Exact Staggered entry for each name (one by one every 220ms)
              const nameAppearTime = 300 + index * 220;
              const isItemVisible = seqTime >= nameAppearTime;
              const itemAlpha = isItemVisible ? Math.min(1, (seqTime - nameAppearTime) / 180) : 0;
              const itemScale = isItemVisible ? Math.min(item.scale, 0.8 + (seqTime - nameAppearTime) / 400) : 0.6;

              return (
                <div
                  key={item.id}
                  style={{
                    position: 'absolute',
                    left: `${item.startX}%`,
                    top: `${item.startY}%`,
                    transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${itemScale})`,
                    transformOrigin: 'center center',
                    opacity: itemAlpha,
                    transition: 'opacity 0.2s ease-out, transform 0.2s ease-out'
                  }}
                  className="px-4 py-2 rounded-lg bg-teal-950/85 border border-teal-400/60 text-teal-200 font-mono text-xs sm:text-sm font-bold shadow-[0_0_30px_rgba(20,184,166,0.45)] backdrop-blur-md select-none tracking-wider whitespace-nowrap animate-pulse"
                >
                  {item.name}
                </div>
              );
            })}
          </div>
        )}

        {/* 3. PARTICLE MORPHING STREAM CANVAS (Disperses & Converges directly into the Apps) */}
        {isMorphActive && (
          <AppMorphingCanvas
            items={morphItems}
            progress={morphProgress}
            reduceMotion={reduceMotion}
          />
        )}

        {/* 4. THE 8 APPS MATERIALIZED IN-PLACE WITH ZERO-GRAVITY SPACE FLOATING */}
        {isAppGridActive && (
          <div
            style={{
              opacity: appGridOpacity,
              transform: `scale(${appGridScale})`,
              pointerEvents: appGridOpacity > 0.4 ? 'auto' : 'none'
            }}
            className="w-full max-w-5xl flex flex-col items-center gap-3.5 z-20 transition-all duration-300"
          >
            {/* Top Minimal Search Bar */}
            <div className="w-full flex items-center justify-between px-1">
              <button
                onClick={triggerResetToHero}
                className="text-[11px] font-mono text-teal-400/80 hover:text-teal-200 flex items-center gap-1 cursor-pointer transition hover:underline"
              >
                <span>↑ Retornar ao início</span>
              </button>

              <div className="relative w-44 sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-teal-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar módulo..."
                  className="w-full bg-black/70 text-white text-xs pl-8 pr-3 py-1.5 rounded-full border border-teal-900 focus:outline-hidden focus:border-teal-400 font-mono backdrop-blur-md"
                />
              </div>
            </div>

            {/* Responsive 8-App Grid with Zero-Gravity Space Float Motion */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full">
              {filteredNodes.map((node, index) => {
                const Icon = node.icon;
                const isHovered = hoveredNodeId === node.id;
                const floatAnimationClass = reduceMotion || isHovered ? '' : `animate-space-float-${index % 8}`;

                return (
                  <div
                    key={node.id}
                    onClick={() => handleSelectNode(node.id)}
                    onMouseEnter={() => {
                      setHoveredNodeId(node.id);
                      try { soundFx.playClick(); } catch (e) {}
                    }}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    className={`w-full p-3 sm:p-3.5 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col items-center text-center gap-2 group relative backdrop-blur-md ${floatAnimationClass} ${
                      isHovered
                        ? 'bg-teal-950/90 border-teal-400 shadow-[0_0_35px_rgba(20,184,166,0.6)] scale-105 z-30 !transform-none'
                        : 'bg-black/75 border-teal-950/90 hover:border-teal-800 shadow-[0_0_15px_rgba(0,20,10,0.4)]'
                    }`}
                  >
                    {/* Badge */}
                    {node.badge && (
                      <span className="absolute top-2 right-2 text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded bg-teal-950 text-teal-300 border border-teal-700/60">
                        {node.badge}
                      </span>
                    )}

                    {/* Glowing Tech-Noir Icon */}
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${node.color} flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Title & Subtitle */}
                    <div className="w-full">
                      <div className="font-bold text-xs text-white truncate font-mono group-hover:text-teal-300">
                        {node.title}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {node.subtitle}
                      </div>
                    </div>

                    {/* Hover Description */}
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed h-7">
                      {node.description}
                    </p>

                    <div className="w-full pt-1 border-t border-teal-950/80 text-[10px] font-mono text-teal-400 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Acessar Módulo</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* DISCREET BOTTOM FOOTER (NO PROGRESS NUMBERS OR STEP COUNTERS) */}
      <footer className="relative z-30 p-2 sm:p-2.5 flex items-center justify-between backdrop-blur-md bg-black/20 border-t border-teal-500/10 text-[10px] font-mono text-teal-500/50">
        <span>MATEUS SPACE 2026</span>
        <span>TECH-NOIR DIGITAL SPACE</span>
      </footer>

      {/* =========================================================================
          SELECTED NODE MODAL EXPANSION (FULL SCREEN FOCUS)
      ========================================================================== */}
      {selectedNodeId && selectedNode && (
        <div className="fixed inset-3 sm:inset-6 z-50 bg-[#000804] border-2 border-teal-400/80 rounded-2xl shadow-[0_0_60px_rgba(20,184,166,0.35)] flex flex-col overflow-hidden animate-fadeIn">
          {/* Modal Titlebar */}
          <div className="bg-teal-950/80 p-3 sm:p-4 border-b border-teal-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-tr ${selectedNode.color} flex items-center justify-center text-white shadow-md`}>
                {React.createElement(selectedNode.icon, { className: "w-5 h-5" })}
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base font-mono text-white flex items-center gap-2">
                  <span>{selectedNode.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-700">
                    MATEUS SPACE 2026
                  </span>
                </h3>
                <p className="text-[11px] text-slate-300">{selectedNode.subtitle}</p>
              </div>
            </div>

            <button
              onClick={handleCloseCenter}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-600 transition cursor-pointer"
              title="Retornar ao Space"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 bg-[#000603] text-slate-200">
            {renderCenterApp(selectedNodeId)}
          </div>

          {/* Modal Footer */}
          <div className="bg-teal-950/90 p-3 border-t border-teal-900/60 flex items-center justify-between text-xs font-mono">
            <span className="text-teal-400/80">Pressione Fechar para retornar ao MATEUS SPACE</span>
            <button
              onClick={handleCloseCenter}
              className="btn-retro px-4 py-1 bg-[#c0c0c0] hover:bg-yellow-300 text-black font-bold cursor-pointer"
            >
              Voltar ao Space ✕
            </button>
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
