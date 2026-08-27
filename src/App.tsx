import React, { useState, useEffect, useRef } from 'react';
import { WindowAppId, WindowState, ThemeConfig, NotificationItem, ViewMode, DesktopFolderItem, TrashItem } from './types';
import { BootScreen } from './components/BootScreen';
import { ShutdownScreen } from './components/ShutdownScreen';
import { Desktop } from './components/Desktop';
import { Taskbar } from './components/Taskbar';
import { WindowFrame } from './components/WindowFrame';
import { TimeTravelSpiral } from './components/TimeTravelSpiral';
import { DigitalSpaceExperience } from './components/DigitalSpaceExperience';
import { ScreensaverCanvas } from './components/ScreensaverCanvas';
import { FolderWindow } from './components/FolderWindow';

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
import { GuestbookApp } from './components/apps/GuestbookApp';

import { soundFx } from './utils/soundEffects';
import { recordSiteVisit } from './lib/firebase';

export default function App() {
  const [isBootComplete, setIsBootComplete] = useState<boolean>(false);
  const [isShutdown, setIsShutdown] = useState<boolean>(false);
  // Check if first visit for automatic Welcome.exe opening
  const isFirstVisit = typeof window !== 'undefined' ? !localStorage.getItem('mateusOSWelcomeSeen') : true;

  const [activeWindowId, setActiveWindowId] = useState<string | null>(() => (isFirstVisit ? 'welcome' : null));
  const [highestZIndex, setHighestZIndex] = useState<number>(20);

  // Auto-record site visit on initial page load (1 per browser session)
  useEffect(() => {
    recordSiteVisit();
    // Mark welcome seen on first visit
    if (typeof window !== 'undefined' && !localStorage.getItem('mateusOSWelcomeSeen')) {
      try {
        localStorage.setItem('mateusOSWelcomeSeen', 'true');
      } catch (e) {}
    }
  }, []);

  // Screensaver State & Idle Timer
  const [isScreensaverActive, setIsScreensaverActive] = useState<boolean>(false);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // View Mode State (Retro 2000 vs Space 2026)
  const [viewMode, setViewMode] = useState<ViewMode>('retro');
  const [isTimeTraveling, setIsTimeTraveling] = useState<boolean>(false);

  // --- RETRO CUSTOM FOLDERS STATE (PERSISTED) ---
  const [retroFolders, setRetroFolders] = useState<DesktopFolderItem[]>(() => {
    try {
      const saved = localStorage.getItem('mateus_retro_folders');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const saveRetroFolders = (folders: DesktopFolderItem[]) => {
    setRetroFolders(folders);
    try {
      localStorage.setItem('mateus_retro_folders', JSON.stringify(folders));
    } catch (e) {}
  };

  // --- GLOBAL TRASH ITEMS STATE (PERSISTED) ---
  const [trashItems, setTrashItems] = useState<TrashItem[]>(() => {
    try {
      const saved = localStorage.getItem('mateus_trash_items');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const saveTrashItems = (items: TrashItem[]) => {
    setTrashItems(items);
    try {
      localStorage.setItem('mateus_trash_items', JSON.stringify(items));
    } catch (e) {}
  };

  // Open Folder Windows in Retro Desktop
  const [openFolderWindows, setOpenFolderWindows] = useState<
    { folder: DesktopFolderItem; win: WindowState }[]
  >([]);

  // Initial Window states matching the 16 desktop apps + Welcome
  const initialWindows: WindowState[] = [
    {
      id: 'welcome',
      title: '✦ Bem-Vindo · Leia-Me (Welcome.exe)',
      iconName: 'welcome',
      isOpen: isFirstVisit,
      isMinimized: false,
      isMaximized: false,
      zIndex: isFirstVisit ? 20 : 1,
      x: typeof window !== 'undefined' ? Math.max(16, Math.floor((window.innerWidth - 660) / 2)) : 100,
      y: typeof window !== 'undefined' ? Math.max(16, Math.floor((window.innerHeight - 540) / 2)) : 40,
      width: 660,
      height: 500,
    },
    { id: 'projects', title: 'Trabalho Selecionado (Projects.exe)', iconName: 'projects', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 90, y: 45, width: 840, height: 620 },
    { id: 'about', title: 'Sobre Mateus (About_Mateus.exe)', iconName: 'about', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 60, y: 30, width: 740, height: 560 },
    { id: 'education', title: 'Formação Acadêmica & MBAs (Education.exe)', iconName: 'education', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 100, y: 50, width: 750, height: 580 },
    { id: 'experience', title: 'Experiência Profissional (Experience.exe)', iconName: 'experience', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 80, y: 40, width: 750, height: 580 },
    { id: 'skills', title: 'O que eu faço / Competências (Skills.exe)', iconName: 'skills', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 100, y: 50, width: 750, height: 560 },
    { id: 'now', title: 'Agora (2026) / Focos & Metas (Now.exe)', iconName: 'now', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 80, y: 40, width: 720, height: 540 },
    { id: 'contact', title: 'Contato Direto (Contact.exe)', iconName: 'contact', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 140, y: 70, width: 740, height: 560 },
    { id: 'guestbook', title: 'Livro de Visitas (Guestbook.exe)', iconName: 'guestbook', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 140, y: 60, width: 780, height: 600 },
    { id: 'resume', title: 'Currículo Oficial (Resumo.pdf)', iconName: 'resume', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 110, y: 55, width: 720, height: 580 },
    
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

  // Idle Timer (35 seconds of inactivity triggers the Screensaver)
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
      }, 35000);
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

  const bringToFront = (appId: string) => {
    const newZ = highestZIndex + 1;
    setHighestZIndex(newZ);
    setActiveWindowId(appId);
    setWindows(prev => prev.map(w => w.id === appId ? { ...w, zIndex: newZ, isMinimized: false } : w));
    setOpenFolderWindows(prev =>
      prev.map(f =>
        f.win.id === appId ? { ...f, win: { ...f.win, zIndex: newZ, isMinimized: false } } : f
      )
    );
  };

  const handleOpenApp = (appId: WindowAppId) => {
    bringToFront(appId);
    setWindows(prev => prev.map(w => w.id === appId ? { ...w, isOpen: true, isMinimized: false } : w));
  };

  const handleCloseWindow = (appId: string) => {
    setWindows(prev => prev.map(w => w.id === appId ? { ...w, isOpen: false } : w));
    setOpenFolderWindows(prev => prev.filter(f => f.win.id !== appId));
    if (activeWindowId === appId) {
      setActiveWindowId(null);
    }
  };

  const handleMinimizeWindow = (appId: string) => {
    setWindows(prev => prev.map(w => w.id === appId ? { ...w, isMinimized: true } : w));
    setOpenFolderWindows(prev =>
      prev.map(f => (f.win.id === appId ? { ...f, win: { ...f.win, isMinimized: true } } : f))
    );
    if (activeWindowId === appId) {
      setActiveWindowId(null);
    }
  };

  const handleMaximizeWindow = (appId: string) => {
    setWindows(prev => prev.map(w => w.id === appId ? { ...w, isMaximized: !w.isMaximized } : w));
    setOpenFolderWindows(prev =>
      prev.map(f =>
        f.win.id === appId ? { ...f, win: { ...f.win, isMaximized: !f.win.isMaximized } } : f
      )
    );
  };

  const handleToggleMinimizeTaskbar = (appId: string) => {
    const targetWin = windows.find(w => w.id === appId) || openFolderWindows.find(f => f.win.id === appId)?.win;
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

  // --- RETRO FOLDER ACTIONS ---
  const handleCreateRetroFolder = () => {
    const count = retroFolders.length;
    const newName = count === 0 ? 'Nova pasta' : `Nova pasta (${count + 1})`;
    const newFolder: DesktopFolderItem = {
      id: `retro-folder-${Date.now()}`,
      name: newName,
      origin: 'retro',
      createdAt: Date.now(),
    };
    saveRetroFolders([...retroFolders, newFolder]);
  };

  const handleRenameRetroFolder = (id: string, newName: string) => {
    const updated = retroFolders.map(f => (f.id === id ? { ...f, name: newName } : f));
    saveRetroFolders(updated);
  };

  const handleDeleteRetroFolder = (id: string) => {
    const target = retroFolders.find(f => f.id === id);
    if (!target) return;

    // Move to trash
    const trashItem: TrashItem = {
      id: `trash-${Date.now()}`,
      name: target.name,
      origin: 'retro',
      type: 'folder',
      deletedAt: Date.now(),
      originalFolder: target,
    };
    saveTrashItems([...trashItems, trashItem]);
    saveRetroFolders(retroFolders.filter(f => f.id !== id));
  };

  const handleUpdateRetroFolderPos = (id: string, x: number, y: number) => {
    const updated = retroFolders.map(f => (f.id === id ? { ...f, x, y } : f));
    saveRetroFolders(updated);
  };

  const handleOpenRetroFolder = (folder: DesktopFolderItem) => {
    const winId = `retro-folder-win-${folder.id}`;
    const exists = openFolderWindows.find(f => f.win.id === winId);

    if (exists) {
      bringToFront(winId);
    } else {
      const newZ = highestZIndex + 1;
      setHighestZIndex(newZ);
      setActiveWindowId(winId);
      const newWin: WindowState = {
        id: winId as any,
        title: `Pasta: ${folder.name}`,
        iconName: 'folder',
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
        zIndex: newZ,
        x: 180 + openFolderWindows.length * 20,
        y: 100 + openFolderWindows.length * 20,
        width: 620,
        height: 440,
      };
      setOpenFolderWindows([...openFolderWindows, { folder, win: newWin }]);
    }
  };

  // --- TRASH RESTORATION & PURGING ---
  const handleRestoreTrashItem = (item: TrashItem) => {
    if (item.originalFolder) {
      if (item.origin === 'retro') {
        saveRetroFolders([...retroFolders, item.originalFolder]);
      }
    }
    saveTrashItems(trashItems.filter(t => t.id !== item.id));
    try { soundFx.playWindowOpen(); } catch (e) {}
  };

  const handlePermanentDeleteTrashItem = (id: string) => {
    saveTrashItems(trashItems.filter(t => t.id !== id));
    try { soundFx.playWindowClose(); } catch (e) {}
  };

  const handleEmptyTrash = () => {
    saveTrashItems([]);
    try { soundFx.playWindowClose(); } catch (e) {}
  };

  const handleTrashSpaceFolder = (folder: DesktopFolderItem) => {
    const trashItem: TrashItem = {
      id: `trash-${Date.now()}`,
      name: folder.name,
      origin: 'space',
      type: 'folder',
      deletedAt: Date.now(),
      originalFolder: folder,
    };
    saveTrashItems([...trashItems, trashItem]);
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
      case 'contact': return <ContactApp mode="retro" />;
      case 'guestbook': return <GuestbookApp mode="retro" />;
      case 'terminal': return <TerminalApp />;
      case 'games':
      case 'experiments': return <ExperimentsApp />;
      case 'paint': return <PixPaintApp />;
      case 'quiz': return <PopQuizApp />;
      case 'clippy': return <ClippyApp onOpenApp={handleOpenApp} onLaunchTimeTravel={handleLaunchTimeTravel} />;
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
      case 'trash':
        return (
          <TrashApp
            mode="retro"
            trashItems={trashItems}
            onRestoreItem={handleRestoreTrashItem}
            onPermanentlyDeleteItem={handlePermanentDeleteTrashItem}
            onEmptyTrash={handleEmptyTrash}
          />
        );
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
    return (
      <DigitalSpaceExperience
        onBackToRetro={handleBackToRetro}
        trashItems={trashItems}
        onTrashFolder={handleTrashSpaceFolder}
        onRestoreTrashItem={handleRestoreTrashItem}
        onPermanentDeleteTrashItem={handlePermanentDeleteTrashItem}
        onEmptyTrash={handleEmptyTrash}
      />
    );
  }

  return (
    <div className={`fixed inset-0 overflow-hidden font-sans-ui text-slate-100 ${themeConfig.enableScanlines ? 'crt-overlay' : ''}`}>
      {/* Interactive Desktop Canvas */}
      <Desktop
        onOpenApp={handleOpenApp}
        themeConfig={themeConfig}
        onLaunchTimeTravel={handleLaunchTimeTravel}
        onTestScreensaver={handleTestScreensaver}
        folders={retroFolders}
        onCreateFolder={handleCreateRetroFolder}
        onRenameFolder={handleRenameRetroFolder}
        onDeleteFolder={handleDeleteRetroFolder}
        onOpenFolder={handleOpenRetroFolder}
        onUpdateFolderPosition={handleUpdateRetroFolderPos}
      />

      {/* Render Standard Open Windows */}
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

      {/* Render Open Retro Folder Windows */}
      {openFolderWindows.map(({ folder, win }) => (
        <WindowFrame
          key={win.id}
          windowState={win}
          isActive={activeWindowId === win.id && !win.isMinimized}
          onFocus={() => bringToFront(win.id)}
          onClose={() => handleCloseWindow(win.id)}
          onMinimize={() => handleMinimizeWindow(win.id)}
          onMaximize={() => handleMaximizeWindow(win.id)}
        >
          <FolderWindow folder={folder} mode="retro" />
        </WindowFrame>
      ))}

      {/* Bottom Fixed Taskbar */}
      <Taskbar
        windows={[
          ...windows,
          ...openFolderWindows.map(f => f.win),
        ]}
        activeWindowId={activeWindowId}
        onOpenApp={(id) => {
          if (id.startsWith('retro-folder-win-')) {
            bringToFront(id);
          } else {
            handleOpenApp(id as WindowAppId);
          }
        }}
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
