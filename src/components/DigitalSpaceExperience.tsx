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
  Minus,
  Maximize2,
  Minimize2,
  Search,
  FileText,
  MessageSquare,
  BookOpen,
  Volume2,
  VolumeX,
  LayoutGrid,
  Palette,
  Sparkles,
  Trash2,
  FolderPlus,
  RefreshCw,
  Edit2,
  Info,
  Layers,
  AlertTriangle,
  FolderOpen,
  Check
} from 'lucide-react';
import { soundFx } from '../utils/soundEffects';
import { ParticleTextCanvas } from './ParticleTextCanvas';
import { SpaceBlueBackgroundCanvas } from './SpaceBlueBackgroundCanvas';
import { SpaceThemeId, SpaceWallpaperId, DesktopFolderItem, TrashItem } from '../types';

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
import { SpacePersonalizationApp } from './apps/space2026/SpacePersonalizationApp';
import { TrashApp } from './apps/TrashApp';
import { GuestbookApp } from './apps/GuestbookApp';
import { FolderWindow } from './FolderWindow';
import { getFolderFiles, formatFileSize } from '../utils/folderStorage';

interface DigitalSpaceExperienceProps {
  onBackToRetro: () => void;
  trashItems?: TrashItem[];
  onTrashFolder?: (folder: DesktopFolderItem) => void;
  onRestoreTrashItem?: (item: TrashItem) => void;
  onPermanentDeleteTrashItem?: (id: string) => void;
  onEmptyTrash?: () => void;
}

export interface SpaceAppDefinition {
  id: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  category: 'core' | 'interactive' | 'utility';
  icon: React.ElementType;
  iconBg: string;
  color: string;
  accentHex: string;
  isPdf?: boolean;
}

interface OpenSpaceWindow {
  id: string;
  folderData?: DesktopFolderItem;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

export const DigitalSpaceExperience: React.FC<DigitalSpaceExperienceProps> = ({
  onBackToRetro,
  trashItems = [],
  onTrashFolder,
  onRestoreTrashItem,
  onPermanentDeleteTrashItem,
  onEmptyTrash,
}) => {
  // --- 1. PERSONALIZATION STATE (WALLPAPERS, THEMES, EFFECTS) ---
  const [currentTheme, setCurrentTheme] = useState<SpaceThemeId>(() => {
    try {
      const saved = localStorage.getItem('mateus_space_theme');
      if (saved) return saved as SpaceThemeId;
    } catch (e) {}
    return 'space-blue';
  });

  const [currentWallpaper, setCurrentWallpaper] = useState<SpaceWallpaperId>(() => {
    try {
      const saved = localStorage.getItem('mateus_space_wallpaper');
      if (saved) return saved as SpaceWallpaperId;
    } catch (e) {}
    return 'deep-space';
  });

  const [effectsEnabled, setEffectsEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('mateus_space_effects');
      if (saved !== null) return saved === 'true';
    } catch (e) {}
    return true;
  });

  const [personalizationTab, setPersonalizationTab] = useState<'wallpapers' | 'themes' | 'effects'>('wallpapers');

  const handleSelectTheme = (t: SpaceThemeId) => {
    setCurrentTheme(t);
    try {
      localStorage.setItem('mateus_space_theme', t);
    } catch (e) {}
  };

  const handleSelectWallpaper = (wp: SpaceWallpaperId) => {
    setCurrentWallpaper(wp);
    try {
      localStorage.setItem('mateus_space_wallpaper', wp);
    } catch (e) {}
  };

  const handleToggleEffects = (enabled: boolean) => {
    setEffectsEnabled(enabled);
    try {
      localStorage.setItem('mateus_space_effects', String(enabled));
    } catch (e) {}
  };

  // --- 2. SPACE USER FOLDERS SYSTEM (INDEPENDENT FROM RETRO) ---
  const [spaceFolders, setSpaceFolders] = useState<DesktopFolderItem[]>(() => {
    try {
      const saved = localStorage.getItem('mateus_space_folders');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const saveSpaceFolders = (folders: DesktopFolderItem[]) => {
    setSpaceFolders(folders);
    try {
      localStorage.setItem('mateus_space_folders', JSON.stringify(folders));
    } catch (e) {}
  };

  // Folder Renaming State
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState<string>('');
  const renameInputRef = useRef<HTMLInputElement | null>(null);

  // Folder Delete Confirmation Modal
  const [folderToDelete, setFolderToDelete] = useState<DesktopFolderItem | null>(null);

  // Dragging State for Custom Space Folders
  const [draggingFolderId, setDraggingFolderId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Selected icon on desktop
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    targetFolder?: DesktopFolderItem;
  } | null>(null);

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Focus rename input on editing
  useEffect(() => {
    if (editingFolderId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [editingFolderId]);

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // --- 3. SPACE APP DEFINITIONS ---
  const spaceApps: SpaceAppDefinition[] = useMemo(() => [
    {
      id: 'about',
      title: 'SOBRE MIM',
      shortTitle: 'Sobre Mim',
      subtitle: 'Perfil Digital & Trajetória',
      category: 'core',
      icon: User,
      iconBg: 'from-blue-600 to-cyan-500',
      color: 'text-cyan-400',
      accentHex: '#06b6d4',
    },
    {
      id: 'skills',
      title: 'O QUE EU FAÇO',
      shortTitle: 'Competências',
      subtitle: 'Capabilities & IA',
      category: 'core',
      icon: Cpu,
      iconBg: 'from-blue-500 to-indigo-600',
      color: 'text-blue-400',
      accentHex: '#3b82f6',
    },
    {
      id: 'projects',
      title: 'TRABALHO SELECIONADO',
      shortTitle: 'Projetos',
      subtitle: 'Project Explorer',
      category: 'core',
      icon: Folder,
      iconBg: 'from-cyan-500 to-blue-600',
      color: 'text-cyan-300',
      accentHex: '#22d3ee',
    },
    {
      id: 'resume',
      title: 'RESUMO.PDF',
      shortTitle: 'RESUMO.PDF',
      subtitle: 'Currículo Oficial PDF',
      category: 'core',
      icon: FileText,
      iconBg: 'from-rose-600 to-red-500',
      color: 'text-red-400',
      accentHex: '#ef4444',
      isPdf: true,
    },
    {
      id: 'now',
      title: 'AGORA (2026)',
      shortTitle: 'Agora (2026)',
      subtitle: 'Live Status & Metas',
      category: 'core',
      icon: Clock,
      iconBg: 'from-indigo-500 to-blue-600',
      color: 'text-indigo-400',
      accentHex: '#6366f1',
    },
    {
      id: 'aims',
      title: 'AIMS',
      shortTitle: 'AIMS',
      subtitle: 'Neural Terminal',
      category: 'interactive',
      icon: MessageSquare,
      iconBg: 'from-cyan-600 to-blue-800',
      color: 'text-cyan-400',
      accentHex: '#0891b2',
    },
    {
      id: 'games',
      title: 'SPACE ARCADE',
      shortTitle: 'Space Arcade',
      subtitle: 'Game Center',
      category: 'interactive',
      icon: Gamepad2,
      iconBg: 'from-blue-600 to-sky-500',
      color: 'text-sky-400',
      accentHex: '#0284c7',
    },
    {
      id: 'personalization',
      title: 'PERSONALIZAÇÃO',
      shortTitle: 'Personalização',
      subtitle: 'Wallpapers, Temas & Efeitos',
      category: 'utility',
      icon: Palette,
      iconBg: 'from-purple-600 to-cyan-500',
      color: 'text-purple-400',
      accentHex: '#a855f7',
    },
    {
      id: 'contact',
      title: 'CONTATO',
      shortTitle: 'Contato',
      subtitle: 'Direct Hub & WhatsApp',
      category: 'core',
      icon: Mail,
      iconBg: 'from-emerald-500 to-teal-600',
      color: 'text-emerald-400',
      accentHex: '#10b981',
    },
    {
      id: 'guestbook',
      title: 'LIVRO DE VISITAS',
      shortTitle: 'Livro de Visitas',
      subtitle: 'Registro Firestore',
      category: 'interactive',
      icon: BookOpen,
      iconBg: 'from-cyan-600 to-emerald-600',
      color: 'text-teal-400',
      accentHex: '#06b6d4',
    },
    {
      id: 'trash',
      title: 'LIXEIRA',
      shortTitle: 'Lixeira',
      subtitle: 'Arquivos Descartados',
      category: 'utility',
      icon: Trash2,
      iconBg: 'from-slate-700 to-red-800',
      color: 'text-red-400',
      accentHex: '#dc2626',
    }
  ], []);

  // Window State Management
  const [openWindows, setOpenWindows] = useState<OpenSpaceWindow[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [topZIndex, setTopZIndex] = useState<number>(30);

  // Launcher Menu (Start Menu) State
  const [isLauncherOpen, setIsLauncherOpen] = useState<boolean>(false);
  const [launcherSearch, setLauncherSearch] = useState<string>('');

  // Sound State
  const [isSoundOn, setIsSoundOn] = useState<boolean>(true);

  // Time Display (2026 Future Clock)
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Bring Window to Front
  const bringToFront = (appId: string) => {
    const newZ = topZIndex + 1;
    setTopZIndex(newZ);
    setActiveWindowId(appId);
    setOpenWindows((prev) =>
      prev.map((w) => (w.id === appId ? { ...w, zIndex: newZ, isMinimized: false } : w))
    );
  };

  // Open App in Window
  const handleOpenApp = (appId: string, initialTab?: 'wallpapers' | 'themes' | 'effects') => {
    setIsLauncherOpen(false);
    if (initialTab) setPersonalizationTab(initialTab);
    try {
      soundFx.playWindowOpen();
    } catch (e) {}

    setOpenWindows((prev) => {
      const exists = prev.find((w) => w.id === appId);
      const newZ = topZIndex + 1;
      setTopZIndex(newZ);
      setActiveWindowId(appId);

      if (exists) {
        return prev.map((w) =>
          w.id === appId ? { ...w, isMinimized: false, zIndex: newZ } : w
        );
      }
      return [
        ...prev,
        {
          id: appId,
          isMinimized: false,
          isMaximized: false,
          zIndex: newZ,
        },
      ];
    });
  };

  // Open User Folder Window
  const handleOpenFolderWindow = (folder: DesktopFolderItem) => {
    const windowId = `folder-window-${folder.id}`;
    try {
      soundFx.playWindowOpen();
    } catch (e) {}

    setOpenWindows((prev) => {
      const exists = prev.find((w) => w.id === windowId);
      const newZ = topZIndex + 1;
      setTopZIndex(newZ);
      setActiveWindowId(windowId);

      if (exists) {
        return prev.map((w) =>
          w.id === windowId ? { ...w, isMinimized: false, zIndex: newZ } : w
        );
      }
      return [
        ...prev,
        {
          id: windowId,
          folderData: folder,
          isMinimized: false,
          isMaximized: false,
          zIndex: newZ,
        },
      ];
    });
  };

  // Close Window
  const handleCloseWindow = (appId: string) => {
    try {
      soundFx.playWindowClose();
    } catch (e) {}
    setOpenWindows((prev) => prev.filter((w) => w.id !== appId));
    if (activeWindowId === appId) {
      setActiveWindowId(null);
    }
  };

  // Minimize Window
  const handleMinimizeWindow = (appId: string) => {
    try {
      soundFx.playClick();
    } catch (e) {}
    setOpenWindows((prev) =>
      prev.map((w) => (w.id === appId ? { ...w, isMinimized: true } : w))
    );
    if (activeWindowId === appId) {
      setActiveWindowId(null);
    }
  };

  // Maximize / Restore Window
  const handleToggleMaximize = (appId: string) => {
    try {
      soundFx.playClick();
    } catch (e) {}
    setOpenWindows((prev) =>
      prev.map((w) => (w.id === appId ? { ...w, isMaximized: !w.isMaximized } : w))
    );
  };

  // Taskbar Click
  const handleTaskbarClick = (appId: string) => {
    const target = openWindows.find((w) => w.id === appId);
    if (!target) return;

    if (target.isMinimized || activeWindowId !== appId) {
      bringToFront(appId);
    } else {
      handleMinimizeWindow(appId);
    }
  };

  // Sound Toggle
  const toggleSound = () => {
    const nextVal = !isSoundOn;
    setIsSoundOn(nextVal);
    soundFx.setEnabled(nextVal);
  };

  // --- 4. CONTEXT MENU & FOLDERS HANDLING ---
  const handleContextMenu = (e: React.MouseEvent, folder?: DesktopFolderItem) => {
    e.preventDefault();
    e.stopPropagation();
    try { soundFx.playClick(); } catch (err) {}

    const menuWidth = 220;
    const menuHeight = folder ? 180 : 250;
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 12);
    const y = Math.min(e.clientY, window.innerHeight - menuHeight - 12);

    setContextMenu({ visible: true, x, y, targetFolder: folder });
    if (folder) {
      setSelectedIconId(`folder-${folder.id}`);
    }
  };

  const handleTouchStart = (e: React.TouchEvent, folder?: DesktopFolderItem) => {
    const touch = e.touches[0];
    const clientX = touch.clientX;
    const clientY = touch.clientY;

    longPressTimerRef.current = setTimeout(() => {
      try { soundFx.playClick(); } catch (err) {}
      const menuWidth = 220;
      const menuHeight = folder ? 180 : 250;
      const x = Math.min(clientX, window.innerWidth - menuWidth - 12);
      const y = Math.min(clientY, window.innerHeight - menuHeight - 12);

      setContextMenu({ visible: true, x, y, targetFolder: folder });
      if (folder) {
        setSelectedIconId(`folder-${folder.id}`);
      }
    }, 600);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // Create New Space Folder
  const handleCreateSpaceFolder = () => {
    const count = spaceFolders.length;
    const newName = count === 0 ? 'Nova pasta' : `Nova pasta (${count + 1})`;
    const newFolder: DesktopFolderItem = {
      id: `space-folder-${Date.now()}`,
      name: newName,
      origin: 'space',
      createdAt: Date.now(),
    };
    const updated = [...spaceFolders, newFolder];
    saveSpaceFolders(updated);
    setEditingFolderId(newFolder.id);
    setEditingFolderName(newName);
    setContextMenu(null);
    try { soundFx.playWindowOpen(); } catch (e) {}
  };

  const handleStartRename = (folder: DesktopFolderItem) => {
    setEditingFolderId(folder.id);
    setEditingFolderName(folder.name);
    setContextMenu(null);
  };

  const handleSaveRename = () => {
    if (editingFolderId) {
      const trimmed = editingFolderName.trim() || 'Nova pasta';
      const updated = spaceFolders.map((f) =>
        f.id === editingFolderId ? { ...f, name: trimmed } : f
      );
      saveSpaceFolders(updated);
    }
    setEditingFolderId(null);
  };

  const handleConfirmDeleteFolder = () => {
    if (folderToDelete) {
      const updated = spaceFolders.filter((f) => f.id !== folderToDelete.id);
      saveSpaceFolders(updated);
      if (onTrashFolder) onTrashFolder(folderToDelete);
      try { soundFx.playWindowClose(); } catch (e) {}
    }
    setFolderToDelete(null);
  };

  // Drag and Drop for Space Folders
  const handleFolderMouseDown = (e: React.MouseEvent, folder: DesktopFolderItem) => {
    if (editingFolderId === folder.id) return;
    setSelectedIconId(`folder-${folder.id}`);
    setDraggingFolderId(folder.id);

    const folderElem = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - folderElem.left,
      y: e.clientY - folderElem.top,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingFolderId) {
      const x = Math.max(10, Math.min(window.innerWidth - 110, e.clientX - dragOffset.x));
      const y = Math.max(10, Math.min(window.innerHeight - 130, e.clientY - dragOffset.y));
      const updated = spaceFolders.map((f) =>
        f.id === draggingFolderId ? { ...f, x, y } : f
      );
      saveSpaceFolders(updated);
    }
  };

  const handleMouseUp = () => {
    setDraggingFolderId(null);
  };

  // Keyboard Shortcuts for Space Desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
        setEditingFolderId(null);
        setFolderToDelete(null);
        setIsLauncherOpen(false);
      } else if (e.key === 'F2' && selectedIconId?.startsWith('folder-')) {
        const folderId = selectedIconId.replace('folder-', '');
        const target = spaceFolders.find((f) => f.id === folderId);
        if (target) {
          setEditingFolderId(target.id);
          setEditingFolderName(target.name);
        }
      } else if (e.key === 'Delete' && selectedIconId?.startsWith('folder-')) {
        const folderId = selectedIconId.replace('folder-', '');
        const target = spaceFolders.find((f) => f.id === folderId);
        if (target) {
          setFolderToDelete(target);
        }
      } else if (e.key === 'Enter' && selectedIconId) {
        if (selectedIconId.startsWith('folder-')) {
          const folderId = selectedIconId.replace('folder-', '');
          const target = spaceFolders.find((f) => f.id === folderId);
          if (target) handleOpenFolderWindow(target);
        } else {
          handleOpenApp(selectedIconId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIconId, spaceFolders]);

  // Filter Launcher Apps
  const filteredApps = useMemo(() => {
    if (!launcherSearch.trim()) return spaceApps;
    return spaceApps.filter(
      (app) =>
        app.title.toLowerCase().includes(launcherSearch.toLowerCase()) ||
        app.subtitle.toLowerCase().includes(launcherSearch.toLowerCase()) ||
        app.shortTitle.toLowerCase().includes(launcherSearch.toLowerCase())
    );
  }, [spaceApps, launcherSearch]);

  // Theme Design Token CSS Variables
  const themeCssVariables = useMemo(() => {
    let accent = '#22D3EE';
    let sec = '#38BDF8';
    let bg = '#020617';
    let glow = 'rgba(34, 211, 238, 0.4)';

    if (currentTheme === 'aurora') {
      accent = '#00F5A0';
      sec = '#22D3EE';
      bg = '#020B0A';
      glow = 'rgba(0, 245, 160, 0.4)';
    } else if (currentTheme === 'void') {
      accent = '#E2E8F0';
      sec = '#64748B';
      bg = '#000000';
      glow = 'rgba(226, 232, 240, 0.2)';
    } else if (currentTheme === 'violet') {
      accent = '#8B5CF6';
      sec = '#38BDF8';
      bg = '#050816';
      glow = 'rgba(139, 92, 246, 0.4)';
    } else if (currentTheme === 'light-space') {
      accent = '#0284C7';
      sec = '#2563EB';
      bg = '#F8FAFC';
      glow = 'rgba(2, 132, 199, 0.3)';
    }

    return {
      '--space-accent': accent,
      '--space-sec': sec,
      '--space-bg': bg,
      '--space-glow': glow,
    } as React.CSSProperties;
  }, [currentTheme]);

  return (
    <div
      style={themeCssVariables}
      onContextMenu={(e) => handleContextMenu(e)}
      onTouchStart={(e) => handleTouchStart(e)}
      onTouchEnd={handleTouchEnd}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`fixed inset-0 select-none overflow-hidden font-sans-ui ${
        currentTheme === 'light-space' ? 'text-slate-800' : 'text-slate-100'
      }`}
    >
      {/* Dynamic Multi-Wallpaper Procedural Background */}
      <SpaceBlueBackgroundCanvas
        reduceMotion={false}
        wallpaperId={currentWallpaper}
        effectsEnabled={effectsEnabled}
      />

      {/* --- DESKTOP CANVAS WORKSPACE --- */}
      <div className="relative z-10 w-full h-[calc(100vh-64px)] p-4 sm:p-6 md:p-8 flex flex-col justify-between pointer-events-none overflow-y-auto custom-scrollbar pb-20">
        {/* TOP BAR / NAVIGATION / SYSTEM STATUS */}
        <div className="w-full flex items-center justify-between pointer-events-auto">
          {/* Back to Retro (OS 00) Button */}
          <button
            onClick={() => {
              try { soundFx.playClick(); } catch (e) {}
              onBackToRetro();
            }}
            className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-black/60 hover:bg-slate-900/80 border border-white/10 hover:border-cyan-400/50 text-slate-300 hover:text-white transition-all backdrop-blur-xl group cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-mono text-xs font-bold tracking-wider">
              RETORNAR AO MATEUS OS 00
            </span>
          </button>

          {/* Quick System Indicators */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 backdrop-blur-xl text-[11px] font-mono text-cyan-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>SPACE OS 2026 // {currentTheme.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* --- CENTER AREA: SOPHISTICATED SIGNATURE & ICONS GRID --- */}
        <div className="w-full flex-1 flex flex-col items-center justify-center my-auto pointer-events-auto">
          {/* Central Name "Mateus Araujo" with Particle Glass / Digital Dust */}
          <div className="w-full max-w-2xl text-center mb-6">
            <ParticleTextCanvas
              reduceMotion={!effectsEnabled}
              theme={currentTheme}
            />
          </div>

          {/* 3-Column Standard Space App Icons Matrix */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-3 sm:gap-4 max-w-5xl justify-items-center">
            {spaceApps.map((app) => {
              const IconComp = app.icon;
              const isSelected = selectedIconId === app.id;

              return (
                <div
                  key={app.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    try { soundFx.playClick(); } catch (err) {}
                    setSelectedIconId(app.id);
                    if (typeof window !== 'undefined' && window.innerWidth < 768) {
                      handleOpenApp(app.id);
                    }
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    handleOpenApp(app.id);
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-2xl w-20 sm:w-22 text-center cursor-pointer transition-all duration-200 group ${
                    isSelected
                      ? 'bg-cyan-500/20 border border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-105'
                      : 'hover:bg-white/10 hover:border-white/20 border border-transparent'
                  }`}
                >
                  {/* Modern Futuristic App Icon Badge */}
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${app.iconBg} p-2.5 flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all`}
                  >
                    <IconComp className="w-6 h-6" />
                  </div>

                  <span className="text-[11px] font-mono font-medium text-slate-200 mt-2 truncate w-full group-hover:text-cyan-300 transition-colors">
                    {app.shortTitle}
                  </span>
                </div>
              );
            })}

            {/* Custom User Folders in Space 2026 */}
            {spaceFolders.map((folder) => {
              const isSelected = selectedIconId === `folder-${folder.id}`;
              const isEditing = editingFolderId === folder.id;
              const hasCustomPos = folder.x !== undefined && folder.y !== undefined;

              return (
                <div
                  key={folder.id}
                  style={
                    hasCustomPos
                      ? { position: 'fixed', left: `${folder.x}px`, top: `${folder.y}px`, zIndex: 15 }
                      : undefined
                  }
                  onMouseDown={(e) => handleFolderMouseDown(e, folder)}
                  onClick={(e) => {
                    e.stopPropagation();
                    try { soundFx.playClick(); } catch (err) {}
                    setSelectedIconId(`folder-${folder.id}`);
                    if (typeof window !== 'undefined' && window.innerWidth < 768) {
                      handleOpenFolderWindow(folder);
                    }
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    handleOpenFolderWindow(folder);
                  }}
                  onContextMenu={(e) => handleContextMenu(e, folder)}
                  onTouchStart={(e) => handleTouchStart(e, folder)}
                  onTouchEnd={handleTouchEnd}
                  className={`flex flex-col items-center justify-center p-2 rounded-2xl w-20 sm:w-22 text-center cursor-pointer transition-all duration-200 group ${
                    isSelected
                      ? 'bg-cyan-500/20 border border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-105'
                      : 'hover:bg-white/10 hover:border-white/20 border border-transparent'
                  }`}
                >
                  {/* Modern Glass Folder Icon */}
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600/30 to-blue-700/40 border border-cyan-400/40 p-2.5 flex items-center justify-center text-cyan-300 shadow-lg group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all">
                    <Folder className="w-6 h-6" />
                  </div>

                  {isEditing ? (
                    <input
                      ref={renameInputRef}
                      type="text"
                      value={editingFolderName}
                      onChange={(e) => setEditingFolderName(e.target.value)}
                      onBlur={handleSaveRename}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename();
                        if (e.key === 'Escape') setEditingFolderId(null);
                      }}
                      className="w-full text-[11px] font-mono text-cyan-300 bg-slate-900/90 border border-cyan-400 text-center px-1 py-0.5 rounded outline-none mt-1"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="text-[11px] font-mono font-medium text-slate-200 mt-2 truncate w-full group-hover:text-cyan-300 transition-colors">
                      {folder.name}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom subtle guidance */}
        <div className="w-full flex items-center justify-end text-[11px] font-mono text-slate-500 pointer-events-auto">
          <span className="hidden md:inline">MATEUS ARAUJO // SISTEMA INTEGRADO 2026</span>
        </div>
      </div>

      {/* --- WINDOWS LAYER (MODERN 2026 GLASS WINDOWS) --- */}
      {openWindows.map((win) => {
        if (win.isMinimized) return null;

        const appDef = spaceApps.find((a) => a.id === win.id);
        const isFolderWindow = win.id.startsWith('folder-window-');
        const folder = win.folderData;
        const isActive = activeWindowId === win.id;

        const title = isFolderWindow
          ? folder?.name.toUpperCase() || 'PASTA'
          : appDef?.title || 'APLICATIVO';

        return (
          <div
            key={win.id}
            onMouseDown={() => bringToFront(win.id)}
            style={{ zIndex: win.zIndex }}
            className={`fixed transition-all duration-200 flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden ${
              win.isMaximized
                ? 'inset-0 pb-16 rounded-none'
                : 'top-10 bottom-20 left-4 right-4 sm:left-12 sm:right-12 md:left-24 md:right-24 lg:left-36 lg:right-36 rounded-3xl'
            } ${
              isActive
                ? 'border border-cyan-400/50 bg-slate-950/90 shadow-[0_0_40px_rgba(6,182,212,0.2)]'
                : 'border border-white/10 bg-slate-950/80'
            }`}
          >
            {/* Window Glass Titlebar */}
            <div className="h-12 px-4 bg-black/40 border-b border-white/10 flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
                <span className="text-xs font-mono font-bold text-white tracking-wider">
                  {title}
                </span>
              </div>

              {/* Window Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMinimizeWindow(win.id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                  title="Minimizar"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleMaximize(win.id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                  title={win.isMaximized ? 'Restaurar' : 'Maximizar'}
                >
                  {win.isMaximized ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseWindow(win.id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-red-950/80 text-slate-400 hover:text-red-400 transition cursor-pointer"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Window Content Container */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
              {isFolderWindow && folder ? (
                <FolderWindow folder={folder} mode="space" />
              ) : (
                <>
                  {win.id === 'about' && <SpaceAboutApp onOpenContact={() => handleOpenApp('contact')} />}
                  {win.id === 'skills' && <SpaceSkillsApp onOpenContact={() => handleOpenApp('contact')} />}
                  {win.id === 'projects' && <SpaceProjectsApp />}
                  {win.id === 'resume' && <SpaceResumeApp />}
                  {win.id === 'now' && <SpaceNowApp />}
                  {win.id === 'aims' && <SpaceAimsApp />}
                  {win.id === 'games' && <SpaceGamesApp />}
                  {win.id === 'contact' && <SpaceContactApp />}
                  {win.id === 'guestbook' && <GuestbookApp mode="retro" />}
                  {win.id === 'personalization' && (
                    <SpacePersonalizationApp
                      currentTheme={currentTheme}
                      currentWallpaper={currentWallpaper}
                      effectsEnabled={effectsEnabled}
                      onSelectTheme={handleSelectTheme}
                      onSelectWallpaper={handleSelectWallpaper}
                      onToggleEffects={handleToggleEffects}
                      initialTab={personalizationTab}
                    />
                  )}
                  {win.id === 'trash' && (
                    <TrashApp
                      mode="space"
                      trashItems={trashItems}
                      onRestoreItem={(item) => {
                        if (onRestoreTrashItem) onRestoreTrashItem(item);
                        // If folder belonged to space, add it back to spaceFolders
                        if (item.originalFolder && item.origin === 'space') {
                          saveSpaceFolders([...spaceFolders, item.originalFolder]);
                        }
                      }}
                      onPermanentlyDeleteItem={(id) => {
                        if (onPermanentDeleteTrashItem) onPermanentDeleteTrashItem(id);
                      }}
                      onEmptyTrash={() => {
                        if (onEmptyTrash) onEmptyTrash();
                      }}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}

      {/* Floating Futuristic Clippy Assistant */}
      <SpaceClippy
        onOpenAims={() => handleOpenApp('aims')}
        onOpenGames={() => handleOpenApp('games')}
        onOpenProjects={() => handleOpenApp('projects')}
      />

      {/* --- MODERN SPACE TASKBAR (FIXED BOTTOM) --- */}
      <div className="fixed bottom-0 inset-x-0 h-16 bg-black/60 border-t border-white/10 backdrop-blur-2xl z-40 px-4 flex items-center justify-between select-none">
        {/* Left: Start / Space Launcher Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              try { soundFx.playClick(); } catch (e) {}
              setIsLauncherOpen(!isLauncherOpen);
            }}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl font-mono text-xs font-bold transition-all cursor-pointer ${
              isLauncherOpen
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.6)]'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/10 hover:border-cyan-400/40'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>SPACE // MENU</span>
          </button>

          {/* Open Windows Tabs in Taskbar */}
          <div className="hidden sm:flex items-center gap-2 overflow-x-auto max-w-md py-1">
            {openWindows.map((win) => {
              const appDef = spaceApps.find((a) => a.id === win.id);
              const isFolder = win.id.startsWith('folder-window-');
              const title = isFolder ? win.folderData?.name || 'Pasta' : appDef?.shortTitle || 'App';
              const isActive = activeWindowId === win.id && !win.isMinimized;

              return (
                <button
                  key={win.id}
                  onClick={() => handleTaskbarClick(win.id)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs flex items-center gap-2 transition cursor-pointer truncate max-w-[140px] ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-xs'
                      : 'bg-black/40 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? 'bg-cyan-400' : 'bg-slate-600'
                    }`}
                  />
                  <span className="truncate">{title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Quick Controls, Audio Toggle & 2026 Clock */}
        <div className="flex items-center gap-3">
          {/* Quick Personalization Shortcut */}
          <button
            onClick={() => handleOpenApp('personalization')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-cyan-300 transition cursor-pointer"
            title="Personalização (Wallpapers, Temas, Efeitos)"
          >
            <Palette className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-cyan-300 transition cursor-pointer"
            title={isSoundOn ? 'Desativar Som' : 'Ativar Som'}
          >
            {isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>

          {/* 2026 Digital HUD Clock */}
          <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 font-mono text-xs font-bold text-cyan-300 shadow-inner">
            {currentTime}
          </div>
        </div>
      </div>

      {/* --- START / SPACE LAUNCHER DRAWER --- */}
      {isLauncherOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed bottom-20 left-4 w-88 sm:w-96 max-h-[520px] rounded-3xl bg-slate-950/95 border border-cyan-500/40 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.9)] z-50 p-5 flex flex-col gap-4 animate-fadeIn"
        >
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar aplicativos ou ferramentas..."
              value={launcherSearch}
              onChange={(e) => setLauncherSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition"
              autoFocus
            />
          </div>

          {/* Apps List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
            {filteredApps.map((app) => {
              const IconComp = app.icon;
              return (
                <button
                  key={app.id}
                  onClick={() => handleOpenApp(app.id)}
                  className="w-full p-2.5 rounded-2xl hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/30 flex items-center gap-3.5 text-left transition group cursor-pointer"
                >
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${app.iconBg} flex items-center justify-center text-white shrink-0 shadow-md group-hover:scale-105 transition-transform`}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-mono font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {app.title}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 truncate">
                      {app.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Footer Options */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
            <button
              onClick={() => handleOpenApp('personalization')}
              className="text-slate-400 hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Personalizar</span>
            </button>
            <button
              onClick={() => onBackToRetro()}
              className="text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Modo Retrô</span>
            </button>
          </div>
        </div>
      )}

      {/* --- SPACE 2026 CONTEXT MENU --- */}
      {contextMenu?.visible && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-50 w-52 rounded-2xl bg-slate-950/95 border border-cyan-500/40 backdrop-blur-2xl shadow-[0_0_35px_rgba(6,182,212,0.3)] py-2 text-xs font-mono text-slate-200 select-none animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.targetFolder ? (
            /* Folder Options */
            <>
              <button
                onClick={() => {
                  if (contextMenu.targetFolder) handleOpenFolderWindow(contextMenu.targetFolder);
                  setContextMenu(null);
                }}
                className="w-full text-left px-4 py-2 hover:bg-cyan-500/20 hover:text-cyan-300 flex items-center gap-2.5 cursor-pointer transition font-bold"
              >
                <FolderOpen className="w-4 h-4 text-cyan-400" />
                <span>Abrir</span>
              </button>
              <button
                onClick={() => {
                  if (contextMenu.targetFolder) handleStartRename(contextMenu.targetFolder);
                }}
                className="w-full text-left px-4 py-2 hover:bg-cyan-500/20 hover:text-cyan-300 flex items-center gap-2.5 cursor-pointer transition"
              >
                <Edit2 className="w-4 h-4" />
                <span>Renomear (F2)</span>
              </button>
              <button
                onClick={() => {
                  if (contextMenu.targetFolder) setFolderToDelete(contextMenu.targetFolder);
                  setContextMenu(null);
                }}
                className="w-full text-left px-4 py-2 hover:bg-red-950/80 hover:text-red-300 text-red-400 flex items-center gap-2.5 cursor-pointer transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir</span>
              </button>
              <div className="h-px bg-white/10 my-1.5 mx-2" />
              <button
                onClick={() => {
                  if (contextMenu.targetFolder) {
                    const fFiles = getFolderFiles(contextMenu.targetFolder.id);
                    const totalBytes = fFiles.reduce((sum, f) => sum + (f.sizeBytes || 0), 0);
                    alert(`CONTAINER QUANTUM // SPACE 2026\n------------------------------------\nDiretório: ${contextMenu.targetFolder?.name.toUpperCase()}\nConteúdo: ${fFiles.length} arquivo(s) salvos\nArmazenamento: ${formatFileSize(totalBytes)}\nSegurança: Criptografia Local Ativa`);
                  }
                  setContextMenu(null);
                }}
                className="w-full text-left px-4 py-2 hover:bg-cyan-500/20 hover:text-cyan-300 flex items-center gap-2.5 cursor-pointer transition"
              >
                <Info className="w-4 h-4 text-cyan-400" />
                <span>Propriedades</span>
              </button>
            </>
          ) : (
            /* Empty Desktop Options */
            <>
              <button
                onClick={handleCreateSpaceFolder}
                className="w-full text-left px-4 py-2 hover:bg-cyan-500/20 hover:text-cyan-300 flex items-center gap-2.5 cursor-pointer transition"
              >
                <FolderPlus className="w-4 h-4 text-cyan-400" />
                <span>Nova pasta</span>
              </button>
              <div className="h-px bg-white/10 my-1.5 mx-2" />
              <button
                onClick={() => {
                  try { soundFx.playClick(); } catch (e) {}
                  const resetPositions = spaceFolders.map((f) => ({ ...f, x: undefined, y: undefined }));
                  saveSpaceFolders(resetPositions);
                  setContextMenu(null);
                }}
                className="w-full text-left px-4 py-2 hover:bg-cyan-500/20 hover:text-cyan-300 flex items-center gap-2.5 cursor-pointer transition"
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Organizar ícones</span>
              </button>
              <button
                onClick={() => {
                  try { soundFx.playClick(); } catch (e) {}
                  setContextMenu(null);
                }}
                className="w-full text-left px-4 py-2 hover:bg-cyan-500/20 hover:text-cyan-300 flex items-center gap-2.5 cursor-pointer transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Atualizar</span>
              </button>
              <div className="h-px bg-white/10 my-1.5 mx-2" />
              <button
                onClick={() => {
                  handleOpenApp('personalization', 'wallpapers');
                  setContextMenu(null);
                }}
                className="w-full text-left px-4 py-2 hover:bg-cyan-500/20 hover:text-cyan-300 flex items-center gap-2.5 cursor-pointer transition"
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Alterar wallpaper</span>
              </button>
              <button
                onClick={() => {
                  handleOpenApp('personalization', 'themes');
                  setContextMenu(null);
                }}
                className="w-full text-left px-4 py-2 hover:bg-cyan-500/20 hover:text-cyan-300 flex items-center gap-2.5 cursor-pointer transition"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Alterar tema</span>
              </button>
              <button
                onClick={() => {
                  handleOpenApp('personalization');
                  setContextMenu(null);
                }}
                className="w-full text-left px-4 py-2 hover:bg-cyan-500/20 hover:text-cyan-300 flex items-center gap-2.5 cursor-pointer transition"
              >
                <Palette className="w-4 h-4 text-cyan-400" />
                <span>Personalização</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Modern Folder Deletion Modal */}
      {folderToDelete && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="p-6 rounded-3xl bg-slate-950 border border-red-500/40 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-500/50 flex items-center justify-center mx-auto text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-mono font-bold text-base text-white">Mover para a Lixeira?</h3>
            <p className="text-xs font-mono text-slate-400">
              A pasta <span className="text-cyan-300 font-bold">"{folderToDelete.name}"</span> será enviada para a Lixeira do Space.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2 font-mono">
              <button
                onClick={() => setFolderToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs text-slate-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDeleteFolder}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-lg cursor-pointer"
              >
                Mover para Lixeira
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
