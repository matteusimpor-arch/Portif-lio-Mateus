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
  Maximize2,
  FolderPlus,
  RefreshCw,
  Edit2,
  LayoutGrid,
  Check,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import { WindowAppId, ThemeConfig, DesktopFolderItem } from '../types';
import { soundFx } from '../utils/soundEffects';
import { DID_YOU_KNOW_FACTS } from '../data/portfolioData';
import { ClippyFloatingAssistant } from './ClippyFloatingAssistant';

interface DesktopProps {
  onOpenApp: (appId: WindowAppId) => void;
  themeConfig: ThemeConfig;
  onLaunchTimeTravel: () => void;
  onTestScreensaver?: () => void;
  folders?: DesktopFolderItem[];
  onCreateFolder?: (name?: string) => void;
  onRenameFolder?: (id: string, newName: string) => void;
  onDeleteFolder?: (id: string) => void;
  onOpenFolder?: (folder: DesktopFolderItem) => void;
  onUpdateFolderPosition?: (id: string, x: number, y: number) => void;
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
  onTestScreensaver,
  folders = [],
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onOpenFolder,
  onUpdateFolderPosition,
}) => {
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [isFactDismissed, setIsFactDismissed] = useState<boolean>(false);
  const [currentFactIndex, setCurrentFactIndex] = useState<number>(0);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    targetFolder?: DesktopFolderItem;
  } | null>(null);

  // Folder Renaming State
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState<string>('');
  const renameInputRef = useRef<HTMLInputElement | null>(null);

  // Folder Delete Modal State
  const [folderToDelete, setFolderToDelete] = useState<DesktopFolderItem | null>(null);

  // Dragging State for Custom Folders
  const [draggingFolderId, setDraggingFolderId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Long press timer for mobile
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Rotate "Você Sabia?" facts automatically every 8 seconds
  useEffect(() => {
    if (isFactDismissed) return;
    const timer = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % DID_YOU_KNOW_FACTS.length);
    }, 8500);
    return () => clearInterval(timer);
  }, [isFactDismissed]);

  // Focus rename input on editing
  useEffect(() => {
    if (editingFolderId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [editingFolderId]);

  // Close context menu on any outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      setContextMenu(null);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Keyboard Shortcuts for Folders
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
        setEditingFolderId(null);
        setFolderToDelete(null);
      } else if (e.key === 'F2' && selectedIcon?.startsWith('folder-')) {
        const folderId = selectedIcon.replace('folder-', '');
        const target = folders.find((f) => f.id === folderId);
        if (target) {
          setEditingFolderId(target.id);
          setEditingFolderName(target.name);
        }
      } else if (e.key === 'Delete' && selectedIcon?.startsWith('folder-')) {
        const folderId = selectedIcon.replace('folder-', '');
        const target = folders.find((f) => f.id === folderId);
        if (target) {
          setFolderToDelete(target);
        }
      } else if (e.key === 'Enter' && selectedIcon) {
        if (selectedIcon.startsWith('folder-')) {
          const folderId = selectedIcon.replace('folder-', '');
          const target = folders.find((f) => f.id === folderId);
          if (target && onOpenFolder) onOpenFolder(target);
        } else {
          handleIconDoubleClick(selectedIcon as WindowAppId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIcon, folders, onOpenFolder]);

  // Handle right-click for Context Menu
  const handleContextMenu = (e: React.MouseEvent, folder?: DesktopFolderItem) => {
    e.preventDefault();
    e.stopPropagation();
    try { soundFx.playClick(); } catch (err) {}

    const menuWidth = 200;
    const menuHeight = folder ? 180 : 220;
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 10);
    const y = Math.min(e.clientY, window.innerHeight - menuHeight - 10);

    setContextMenu({ visible: true, x, y, targetFolder: folder });
    if (folder) {
      setSelectedIcon(`folder-${folder.id}`);
    }
  };

  // Touch Long-Press Handling for Mobile Context Menu
  const handleTouchStart = (e: React.TouchEvent, folder?: DesktopFolderItem) => {
    const touch = e.touches[0];
    const clientX = touch.clientX;
    const clientY = touch.clientY;

    longPressTimerRef.current = setTimeout(() => {
      try { soundFx.playClick(); } catch (err) {}
      const menuWidth = 200;
      const menuHeight = folder ? 180 : 220;
      const x = Math.min(clientX, window.innerWidth - menuWidth - 10);
      const y = Math.min(clientY, window.innerHeight - menuHeight - 10);

      setContextMenu({ visible: true, x, y, targetFolder: folder });
      if (folder) {
        setSelectedIcon(`folder-${folder.id}`);
      }
    }, 600);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // Folder Actions
  const handleCreateNewFolder = () => {
    if (onCreateFolder) {
      try { soundFx.playWindowOpen(); } catch (e) {}
      onCreateFolder();
    }
    setContextMenu(null);
  };

  const handleStartRename = (folder: DesktopFolderItem) => {
    setEditingFolderId(folder.id);
    setEditingFolderName(folder.name);
    setContextMenu(null);
  };

  const handleSaveRename = () => {
    if (editingFolderId && onRenameFolder) {
      const trimmed = editingFolderName.trim() || 'Nova pasta';
      onRenameFolder(editingFolderId, trimmed);
    }
    setEditingFolderId(null);
  };

  const handleConfirmDelete = () => {
    if (folderToDelete && onDeleteFolder) {
      try { soundFx.playWindowClose(); } catch (e) {}
      onDeleteFolder(folderToDelete.id);
    }
    setFolderToDelete(null);
  };

  // Drag and drop for folders
  const handleFolderMouseDown = (e: React.MouseEvent, folder: DesktopFolderItem) => {
    if (editingFolderId === folder.id) return;
    setSelectedIcon(`folder-${folder.id}`);
    setDraggingFolderId(folder.id);

    const folderElem = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - folderElem.left,
      y: e.clientY - folderElem.top,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingFolderId && onUpdateFolderPosition) {
      const x = Math.max(10, Math.min(window.innerWidth - 100, e.clientX - dragOffset.x));
      const y = Math.max(10, Math.min(window.innerHeight - 120, e.clientY - dragOffset.y));
      onUpdateFolderPosition(draggingFolderId, x, y);
    }
  };

  const handleMouseUp = () => {
    setDraggingFolderId(null);
  };

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
            <div className="w-10 h-10 bg-gradient-to-tr from-purple-700 to-pink-600 border-2 border-yellow-300 rounded-lg flex items-center justify-center text-xl shadow-md">
              ❓
            </div>
          </div>
        );

      case 'clippy':
        return (
          <div className="w-12 h-12 relative flex items-center justify-center">
            <div className="w-10 h-10 bg-yellow-300 border-2 border-yellow-600 rounded-full flex items-center justify-center text-xl shadow-md">
              📎
            </div>
          </div>
        );

      case 'gamepad':
        return (
          <div className="w-12 h-12 relative flex items-center justify-center">
            <div className="w-10 h-8 bg-gray-700 border-2 border-gray-900 rounded-md flex items-center justify-center text-lg shadow-md">
              🎮
            </div>
          </div>
        );

      case 'aims':
        return (
          <div className="w-12 h-12 relative flex items-center justify-center">
            <div className="w-10 h-10 bg-yellow-400 border-2 border-yellow-600 rounded-full flex items-center justify-center text-xl shadow-md">
              🏃
            </div>
          </div>
        );

      case 'settings-screen':
        return (
          <div className="w-12 h-12 relative flex items-center justify-center">
            <div className="w-10 h-8 bg-blue-900 border-2 border-gray-400 rounded-xs flex items-center justify-center shadow-md relative">
              <div className="w-3 h-3 bg-cyan-400 rounded-full" />
              <div className="absolute -bottom-2 w-4 h-2 bg-gray-400 border border-gray-600" />
            </div>
          </div>
        );

      case 'guestbook-book':
        return (
          <div className="w-12 h-12 relative flex items-center justify-center">
            <div className="w-8 h-10 bg-teal-700 border-2 border-teal-950 shadow-md relative flex items-center justify-center">
              <span className="text-amber-200 text-xs font-bold">📖</span>
            </div>
          </div>
        );

      case 'napster':
        return (
          <div className="w-12 h-12 relative flex items-center justify-center">
            <div className="w-10 h-10 bg-blue-600 border-2 border-white rounded-full flex items-center justify-center text-white text-lg shadow-md">
              🐱
            </div>
          </div>
        );

      case 'retro-tv':
        return (
          <div className="w-12 h-12 relative flex items-center justify-center">
            <div className="w-10 h-8 bg-amber-900 border-2 border-amber-950 rounded-sm flex items-center justify-center shadow-md relative">
              <div className="w-6 h-5 bg-sky-300 border border-black" />
            </div>
          </div>
        );

      case 'time-spiral':
        return (
          <div className="w-12 h-12 relative flex items-center justify-center animate-pulse">
            <div className="w-10 h-10 bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-900 border-2 border-cyan-300 rounded-full flex items-center justify-center text-xl shadow-lg">
              🌀
            </div>
          </div>
        );

      case 'recycle-bin':
        return (
          <div className="w-12 h-12 relative flex items-center justify-center">
            <div className="w-8 h-10 bg-slate-300 border-2 border-slate-600 shadow-md relative flex flex-col items-center justify-center">
              <Trash2 className="w-5 h-5 text-slate-700" />
            </div>
          </div>
        );

      default:
        return <Folder className="w-10 h-10 text-amber-400" />;
    }
  };

  return (
    <main
      id="desktop-main-canvas"
      onContextMenu={(e) => handleContextMenu(e)}
      onTouchStart={(e) => handleTouchStart(e)}
      onTouchEnd={handleTouchEnd}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`fixed inset-0 select-none overflow-hidden pb-12 transition-colors duration-500 ${getWallpaperBackground()}`}
    >
      {/* Desktop Grid Layout */}
      <div className="relative w-full h-full p-4 overflow-y-auto custom-scrollbar grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-y-4 gap-x-2 content-start z-10 pointer-events-auto pb-16">
        {/* Standard Desktop Apps */}
        {desktopItems.map((item) => {
          const isSelected = selectedIcon === item.id;
          return (
            <div
              key={item.id}
              onClick={() => handleIconClick(item.id)}
              onDoubleClick={() => handleIconDoubleClick(item.id)}
              className={`flex flex-col items-center justify-start p-1.5 rounded-xs w-24 h-24 text-center cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-blue-900/60 border border-dotted border-white/80'
                  : 'hover:bg-white/10'
              }`}
            >
              <div className="relative">
                {renderIconVisual(item.iconType)}
                {item.badge && (
                  <span
                    className={`absolute -top-1 -right-2 text-[9px] font-bold px-1 rounded-xs shadow-xs uppercase tracking-tighter ${
                      item.badgeColor || 'bg-red-600 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] font-sans mt-1 px-1 line-clamp-2 leading-tight ${
                  isSelected ? 'bg-blue-900 text-white' : 'text-white drop-shadow-[1px_1px_2px_rgba(0,0,0,0.9)]'
                }`}
              >
                {item.title}
              </span>
            </div>
          );
        })}

        {/* Custom User Folders in Retro OS 00 */}
        {folders.map((folder) => {
          const isSelected = selectedIcon === `folder-${folder.id}`;
          const isEditing = editingFolderId === folder.id;
          const hasCustomPos = folder.x !== undefined && folder.y !== undefined;

          const folderContent = (
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
                setSelectedIcon(`folder-${folder.id}`);
                if (typeof window !== 'undefined' && window.innerWidth < 768) {
                  if (onOpenFolder) onOpenFolder(folder);
                }
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                try { soundFx.playWindowOpen(); } catch (err) {}
                if (onOpenFolder) onOpenFolder(folder);
              }}
              onContextMenu={(e) => handleContextMenu(e, folder)}
              onTouchStart={(e) => handleTouchStart(e, folder)}
              onTouchEnd={handleTouchEnd}
              className={`flex flex-col items-center justify-start p-1.5 rounded-xs w-24 h-24 text-center cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-blue-900/60 border border-dotted border-white/80'
                  : 'hover:bg-white/10'
              }`}
            >
              {/* Windows 2000 Yellow Folder Icon */}
              <div className="w-12 h-12 relative flex items-center justify-center">
                <div className="w-10 h-8 bg-amber-400 border-2 border-amber-600 rounded-t-xs shadow-md relative">
                  <div className="absolute -top-2 left-0 w-4 h-2 bg-amber-500 border-t-2 border-l-2 border-r-2 border-amber-700 rounded-t-xs" />
                </div>
              </div>

              {/* Folder Name / Inline Renaming */}
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
                  className="w-full text-[11px] font-sans text-black bg-white border border-blue-800 text-center px-0.5 py-0 outline-none"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span
                  className={`text-[11px] font-sans mt-1 px-1 line-clamp-2 leading-tight ${
                    isSelected ? 'bg-blue-900 text-white' : 'text-white drop-shadow-[1px_1px_2px_rgba(0,0,0,0.9)]'
                  }`}
                >
                  {folder.name}
                </span>
              )}
            </div>
          );

          return folderContent;
        })}
      </div>

      {/* Floating Clippy Assistant */}
      <ClippyFloatingAssistant
        onOpenApp={onOpenApp}
        onLaunchTimeTravel={onLaunchTimeTravel}
      />

      {/* "Você Sabia?" Floating Tip Banner */}
      {!isFactDismissed && (
        <aside
          aria-label="Dica do Sistema"
          className="fixed top-4 right-4 z-20 w-80 bg-[#ffffe1] text-gray-900 border-2 border-black p-3 shadow-[4px_4px_0px_rgba(0,0,0,0.4)] text-xs font-sans animate-fadeIn"
        >
          <div className="flex items-center justify-between font-bold border-b border-gray-400 pb-1 mb-2">
            <div className="flex items-center gap-1.5 text-blue-900">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>DICA DO SISTEMA 2000</span>
            </div>
            <button
              onClick={() => setIsFactDismissed(true)}
              className="text-gray-600 hover:text-black font-bold px-1 hover:bg-gray-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {DID_YOU_KNOW_FACTS[currentFactIndex]?.title && (
            <div className="font-bold text-[11px] text-blue-950 mb-1">
              {DID_YOU_KNOW_FACTS[currentFactIndex].title}
            </div>
          )}
          <p className="leading-snug text-gray-800">
            {DID_YOU_KNOW_FACTS[currentFactIndex]?.fact}
          </p>
        </aside>
      )}

      {/* Retro OS 00 Context Menu */}
      {contextMenu?.visible && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-50 w-48 bg-[#c0c0c0] border-2 border-white border-r-gray-800 border-b-gray-800 shadow-2xl py-1 text-xs font-sans text-gray-900 select-none animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.targetFolder ? (
            /* Folder Context Menu */
            <>
              <button
                onClick={() => {
                  if (onOpenFolder && contextMenu.targetFolder) {
                    onOpenFolder(contextMenu.targetFolder);
                  }
                  setContextMenu(null);
                }}
                className="w-full text-left px-3 py-1 font-bold hover:bg-blue-800 hover:text-white flex items-center gap-2 cursor-pointer"
              >
                <FolderOpen className="w-3.5 h-3.5 text-amber-700" />
                <span>Abrir</span>
              </button>
              <button
                onClick={() => {
                  if (contextMenu.targetFolder) {
                    handleStartRename(contextMenu.targetFolder);
                  }
                }}
                className="w-full text-left px-3 py-1 hover:bg-blue-800 hover:text-white flex items-center gap-2 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Renomear (F2)</span>
              </button>
              <button
                onClick={() => {
                  if (contextMenu.targetFolder) {
                    setFolderToDelete(contextMenu.targetFolder);
                  }
                  setContextMenu(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-blue-800 hover:text-white flex items-center gap-2 cursor-pointer text-red-800 hover:text-white"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>
              <div className="h-px bg-gray-400 my-1 mx-1 border-b border-white" />
              <button
                onClick={() => {
                  alert(`Propriedades da Pasta:\nNome: ${contextMenu.targetFolder?.name}\nLocal: C:\\Desktop\nTamanho: 0 bytes`);
                  setContextMenu(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-blue-800 hover:text-white flex items-center gap-2 cursor-pointer"
              >
                <Info className="w-3.5 h-3.5 text-blue-900" />
                <span>Propriedades</span>
              </button>
            </>
          ) : (
            /* Desktop Empty Area Context Menu */
            <>
              <button
                onClick={handleCreateNewFolder}
                className="w-full text-left px-3 py-1 hover:bg-blue-800 hover:text-white flex items-center gap-2 cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5 text-amber-700" />
                <span>Nova pasta</span>
              </button>
              <div className="h-px bg-gray-400 my-1 mx-1 border-b border-white" />
              <button
                onClick={() => {
                  try { soundFx.playClick(); } catch (e) {}
                  // Reset coordinates of all folders
                  folders.forEach((f) => {
                    if (onUpdateFolderPosition) onUpdateFolderPosition(f.id, 0, 0);
                  });
                  setContextMenu(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-blue-800 hover:text-white flex items-center gap-2 cursor-pointer"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Organizar ícones</span>
              </button>
              <button
                onClick={() => {
                  try { soundFx.playClick(); } catch (e) {}
                  setContextMenu(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-blue-800 hover:text-white flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Atualizar</span>
              </button>
              <div className="h-px bg-gray-400 my-1 mx-1 border-b border-white" />
              <button
                onClick={() => {
                  onOpenApp('settings');
                  setContextMenu(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-blue-800 hover:text-white flex items-center gap-2 cursor-pointer"
              >
                <Palette className="w-3.5 h-3.5 text-blue-900" />
                <span>Personalizar...</span>
              </button>
              <button
                onClick={() => {
                  onOpenApp('about');
                  setContextMenu(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-blue-800 hover:text-white flex items-center gap-2 cursor-pointer"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Propriedades do Sistema</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Retro Folder Deletion Confirmation Dialog */}
      {folderToDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-[#c0c0c0] border-2 border-white border-r-gray-800 border-b-gray-800 p-4 w-88 shadow-2xl space-y-4">
            <div className="flex items-center justify-between font-bold text-xs bg-blue-900 text-white p-1">
              <span>Confirmar Exclusão de Pasta</span>
              <button
                onClick={() => setFolderToDelete(null)}
                className="px-1 hover:bg-red-700 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="flex items-start gap-3 text-xs text-gray-900">
              <div className="w-8 h-8 rounded-full bg-amber-200 border border-amber-600 flex items-center justify-center text-amber-800 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold">Tem certeza de que deseja enviar a pasta</p>
                <p className="text-blue-950 font-mono mt-1">"{folderToDelete.name}"</p>
                <p className="mt-1 text-gray-600">para a Lixeira do Sistema?</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 text-xs font-bold pt-2">
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-1 bg-[#c0c0c0] border-2 border-white border-r-gray-800 border-b-gray-800 hover:bg-gray-300 active:border-gray-800 active:border-r-white active:border-b-white cursor-pointer"
              >
                Sim
              </button>
              <button
                onClick={() => setFolderToDelete(null)}
                className="px-4 py-1 bg-[#c0c0c0] border-2 border-white border-r-gray-800 border-b-gray-800 hover:bg-gray-300 active:border-gray-800 active:border-r-white active:border-b-white cursor-pointer"
              >
                Não
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
