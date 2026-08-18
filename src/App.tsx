import React, { useState, useEffect, useRef } from 'react';
import { WindowAppId, WindowState, ThemeConfig, NotificationItem, ViewMode } from './types';
import { BootScreen } from './components/BootScreen';
import { ShutdownScreen } from './components/ShutdownScreen';
import { Desktop } from './components/Desktop';
import { Taskbar } from './components/Taskbar';
import { WindowFrame } from './components/WindowFrame';
import { TimeTravelSpiral } from './components/TimeTravelSpiral';
import { DigitalSpaceExperience } from './components/DigitalSpaceExperience';
import { ScreensaverCanvas } from './components/ScreensaverCanvas';

// Apps
import { WelcomeApp } from './components/apps/WelcomeApp';
import { AboutApp } from './components/apps/AboutApp';
import { ExperienceApp } from './components/apps/ExperienceApp';
import { EducationApp } from './components/apps/EducationApp';
import { SkillsApp } from './components/apps/SkillsApp';
import { ProjectsApp } from './components/apps/ProjectsApp';
import { ResumeApp } from './components/apps/ResumeApp';
import { LogisticsApp } from './components/apps/LogisticsApp';
import { NowApp } from './components/apps/NowApp';
import { ContactApp } from './components/apps/ContactApp';
import { TerminalApp } from './components/apps/TerminalApp';
import { ExperimentsApp } from './components/apps/ExperimentsApp';
import { SettingsApp } from './components/apps/SettingsApp';
import { TrashApp } from './components/apps/TrashApp';
import { PixPaintApp } from './components/apps/PixPaintApp';
import { PopQuizApp } from './components/apps/PopQuizApp';
import { ClippyApp } from './components/apps/ClippyApp';
import { NapsterApp } from './components/apps/NapsterApp';
import { NostalgiaApp } from './components/apps/NostalgiaApp';
import { AimsMessengerApp } from './components/apps/AimsMessengerApp';

import { soundFx } from './utils/soundEffects';

export default function App() {
  const [isBootComplete, setIsBootComplete] = useState<boolean>(false);
  const [isShutdown, setIsShutdown] = useState<boolean>(false);
  const [activeWindowId, setActiveWindowId] = useState<WindowAppId | null>('welcome');
  const [highestZIndex, setHighestZIndex] = useState<number>(20);

  // Screensaver State & Idle Timer
  const [isScreensaverActive, setIsScreensaverActive] = useState<boolean>(false);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // View Mode State (Retro 2000 vs Space 2026)
  const [viewMode, setViewMode] = useState<ViewMode>('retro');
  const [isTimeTraveling, setIsTimeTraveling] = useState<boolean>(false);

  // Initial Window states matching the 16 desktop apps + Welcome
  const initialWindows: WindowState[] = [
    { id: 'welcome', title: '✦ Bem-Vindo · Leia-Me (Welcome.exe)', iconName: 'welcome', isOpen: true, isMinimized: false, isMaximized: false, zIndex: 20, x: 120, y: 35, width: 780, height: 570 },
    { id: 'projects', title: 'Trabalho Selecionado (Projects.exe)', iconName: 'projects', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 90, y: 45, width: 840, height: 620 },
    { id: 'about', title: 'Sobre Mateus (About_Mateus.exe)', iconName: 'about', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 60, y: 30, width: 740, height: 560 },
    { id: 'education', title: 'Formação Acadêmica & MBAs (Education.exe)', iconName: 'education', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 100, y: 50, width: 750, height: 580 },
    { id: 'experience', title: 'Experiência Profissional (Experience.exe)', iconName: 'experience', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 80, y: 40, width: 750, height: 580 },
    { id: 'skills', title: 'O que eu faço / Competências (Skills.exe)', iconName: 'skills', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 100, y: 50, width: 750, height: 560 },
    { id: 'now', title: 'Agora (2026) / Focos & Metas (Now.exe)', iconName: 'now', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 80, y: 40, width: 720, height: 540 },
    { id: 'contact', title: 'Contato Direto (Contact.exe)', iconName: 'contact', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 140, y: 70, width: 740, height: 560 },
    { id: 'resume', title: 'Currículo Oficial (Résumé.pdf)', iconName: 'resume', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 110, y: 55, width: 720, height: 580 },
    
    // Creative & Retro Apps
    { id: 'paint', title: 'Criança Pix (PixPaint.exe)', iconName: 'paint', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 130, y: 40, width: 760, height: 560 },
    { id: 'quiz', title: 'Cultura Pop Quiz Anos 2000 (Quiz.exe)', iconName: 'quiz', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 150, y: 60, width: 680, height: 520 },
    { id: 'clippy', title: 'Clippy Assistente Virtual (Clippy.exe)', iconName: 'clippy', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 200, y: 80, width: 620, height: 480 },
    { id: 'games', title: 'Jogos & Mini-Games (Games.exe)', iconName: 'games', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 140, y: 50, width: 820, height: 640 },
    { id: 'aims', title: 'AIMS Instant Messenger (AIMS.exe)', iconName: 'aims', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 160, y: 60, width: 680, height: 530 },
    { id: 'settings', title: 'Fundos & Personalização (Settings.exe)', iconName: 'settings', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 170, y: 90, width: 680, height: 520 },
    { id: 'napster', title: 'Categoria: Napster MP3 Player (Napster.exe)', iconName: 'napster', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 150, y: 70, width: 720, height: 540 },
    { id: 'nostalgia', title: 'Momentos de Nostalgia CRT TV (Nostalgia.exe)', iconName: 'nostalgia', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 120, y: 50, width: 700, height: 530 },
    { id: 'trash', title: 'Lixeira do Sistema (Trash.exe)', iconName: 'trash', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 180, y: 95, width: 620, height: 460 },

    // Additional utilities
    { id: 'logistics', title: 'Logística & Supply Chain (Logistics.exe)', iconName: 'logistics', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 130, y: 65, width: 780, height: 580 },
    { id: 'terminal', title: 'Terminal Interativo (Terminal.exe)', iconName: 'terminal', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 150, y: 80, width: 680, height: 480 },
    { id: 'experiments', title: 'Experimentos (Experiments.exe)', iconName: 'experiments', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 140, y: 50, width: 820, height: 640 },
  ];

  const [windows, setWindows] = useState<WindowState[]>(initialWindows);

  // Theme settings with localStorage hydration
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(() => {
    let savedWallpaper: ThemeConfig['wallpaper'] = 'classic-teal';
    try {
      const saved = localStorage.getItem('mateus_os_wallpaper');
      if (saved) savedWallpaper = saved as ThemeConfig['wallpaper'];
    } catch (e) {}

    return {
      mode: 'dark',
      wallpaper: savedWallpaper,
      enableScanlines: false,
      enableSound: true,
      enableAnimations: true,
    };
  });

  // Idle Timer (30 seconds of inactivity triggers the Screensaver)
  useEffect(() => {
    if (!isBootComplete || isShutdown || isTimeTraveling || viewMode === 'space') {
      return;
    }

    const resetIdleTimer = () => {
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
      idleTimeoutRef.current = setTimeout(() => {
        setIsScreensaverActive(true);
      }, 35000); // 35 seconds of inactivity
    };

    resetIdleTimer();

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'];
    activityEvents.forEach((evt) => {
      window.addEventListener(evt, resetIdleTimer, { passive: true });
    });

    return () => {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, resetIdleTimer);
      });
    };
  }, [isBootComplete, isShutdown, isTimeTraveling, viewMode]);

  // System notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: 'notif-1', title: 'Boas-vindas', message: 'Bem-vindo ao Sistema Pessoal de Mateus Araujo (MATEUS OS 2000)!', time: 'Agora', type: 'system', read: false },
    { id: 'notif-2', title: 'Atualização para 2026', message: 'Experimente a transição espiral e explore a experiência MATEUS SPACE 2026.', time: 'Sistema', type: 'info', read: false }
  ]);

  const handleToggleSound = () => {
    const nextVal = !themeConfig.enableSound;
    setThemeConfig(prev => ({ ...prev, enableSound: nextVal }));
    soundFx.setEnabled(nextVal);
  };

  const handleToggleScanlines = () => {
    soundFx.playClick();
    setThemeConfig(prev => ({ ...prev, enableScanlines: !prev.enableScanlines }));
  };

  const bringToFront = (appId: WindowAppId) => {
    const newZ = highestZIndex + 1;
    setHighestZIndex(newZ);
    setActiveWindowId(appId);
    setWindows(prev => prev.map(w => w.id === appId ? { ...w, zIndex: newZ, isMinimized: false } : w));
  };

  const handleOpenApp = (appId: WindowAppId) => {
    bringToFront(appId);
    setWindows(prev => prev.map(w => w.id === appId ? { ...w, isOpen: true, isMinimized: false } : w));
  };

  const handleCloseWindow = (appId: WindowAppId) => {
    setWindows(prev => prev.map(w => w.id === appId ? { ...w, isOpen: false } : w));
    if (activeWindowId === appId) {
      setActiveWindowId(null);
    }
  };

  const handleMinimizeWindow = (appId: WindowAppId) => {
    setWindows(prev => prev.map(w => w.id === appId ? { ...w, isMinimized: true } : w));
    if (activeWindowId === appId) {
      setActiveWindowId(null);
    }
  };

  const handleMaximizeWindow = (appId: WindowAppId) => {
    setWindows(prev => prev.map(w => w.id === appId ? { ...w, isMaximized: !w.isMaximized } : w));
  };

  const handleToggleMinimizeTaskbar = (appId: WindowAppId) => {
    const targetWin = windows.find(w => w.id === appId);
    if (!targetWin) return;

    if (targetWin.isMinimized || activeWindowId !== appId) {
      bringToFront(appId);
    } else {
      handleMinimizeWindow(appId);
    }
  };

  const handleResetDesktop = () => {
    setWindows(initialWindows);
  };

  const handleLaunchTimeTravel = () => {
    try { soundFx.playFanfare(); } catch (e) {}
    setIsTimeTraveling(true);
  };

  const handleTimeTravelComplete = () => {
    setIsTimeTraveling(false);
    setViewMode('space');
  };

  const handleBackToRetro = () => {
    try { soundFx.playClick(); } catch (e) {}
    setViewMode('retro');
  };

  const handleTestScreensaver = () => {
    soundFx.playClick();
    setIsScreensaverActive(true);
  };

  const renderAppContent = (appId: WindowAppId) => {
    switch (appId) {
      case 'welcome':
        return (
          <WelcomeApp
            onOpenApp={handleOpenApp}
            onLaunchTimeTravel={handleLaunchTimeTravel}
          />
        );
      case 'about': return <AboutApp />;
      case 'experience': return <ExperienceApp />;
      case 'education': return <EducationApp />;
      case 'skills': return <SkillsApp />;
      case 'projects': return <ProjectsApp />;
      case 'resume': return <ResumeApp />;
      case 'logistics': return <LogisticsApp />;
      case 'now': return <NowApp />;
      case 'contact': return <ContactApp />;
      case 'terminal': return <TerminalApp />;
      case 'games':
      case 'experiments': return <ExperimentsApp />;
      case 'paint': return <PixPaintApp />;
      case 'quiz': return <PopQuizApp />;
      case 'clippy': return <ClippyApp onOpenApp={handleOpenApp} />;
      case 'aims': return <AimsMessengerApp />;
      case 'napster': return <NapsterApp />;
      case 'nostalgia': return <NostalgiaApp />;
      case 'settings': 
        return (
          <SettingsApp
            themeConfig={themeConfig}
            onUpdateTheme={(cfg) => setThemeConfig(prev => ({ ...prev, ...cfg }))}
            onResetDesktop={handleResetDesktop}
            onTestScreensaver={handleTestScreensaver}
          />
        );
      case 'trash': return <TrashApp />;
      default: return <div>Conteúdo em carregamento...</div>;
    }
  };

  if (!isBootComplete) {
    return <BootScreen onBootComplete={() => setIsBootComplete(true)} />;
  }

  if (isShutdown) {
    return <ShutdownScreen onRestart={() => setIsShutdown(false)} />;
  }

  if (isTimeTraveling) {
    return <TimeTravelSpiral onComplete={handleTimeTravelComplete} />;
  }

  if (viewMode === 'space' || viewMode === 'modern') {
    return <DigitalSpaceExperience onBackToRetro={handleBackToRetro} />;
  }

  return (
    <div className={`fixed inset-0 overflow-hidden font-sans-ui text-slate-100 ${themeConfig.enableScanlines ? 'crt-overlay' : ''}`}>
      {/* Interactive Desktop Canvas */}
      <Desktop
        onOpenApp={handleOpenApp}
        themeConfig={themeConfig}
        onLaunchTimeTravel={handleLaunchTimeTravel}
        onTestScreensaver={handleTestScreensaver}
      />

      {/* Render Open Windows */}
      {windows.map((win) => (
        <WindowFrame
          key={win.id}
          windowState={win}
          isActive={activeWindowId === win.id && !win.isMinimized}
          onFocus={() => bringToFront(win.id)}
          onClose={() => handleCloseWindow(win.id)}
          onMinimize={() => handleMinimizeWindow(win.id)}
          onMaximize={() => handleMaximizeWindow(win.id)}
        >
          {renderAppContent(win.id)}
        </WindowFrame>
      ))}

      {/* Bottom Fixed Taskbar */}
      <Taskbar
        windows={windows}
        activeWindowId={activeWindowId}
        onOpenApp={handleOpenApp}
        onToggleMinimize={handleToggleMinimizeTaskbar}
        onShutdown={() => setIsShutdown(true)}
        isSoundEnabled={themeConfig.enableSound}
        onToggleSound={handleToggleSound}
        isScanlinesEnabled={themeConfig.enableScanlines}
        onToggleScanlines={handleToggleScanlines}
        notifications={notifications}
        onLaunchTimeTravel={handleLaunchTimeTravel}
        onTestScreensaver={handleTestScreensaver}
      />

      {/* Screensaver Component Overlay */}
      {isScreensaverActive && (
        <div className="fixed inset-0 z-[9999]">
          <ScreensaverCanvas
            onWakeUp={() => setIsScreensaverActive(false)}
            reduceMotion={false}
          />
        </div>
      )}
    </div>
  );
}
