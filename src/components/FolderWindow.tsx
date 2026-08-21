import React from 'react';
import { Folder, FolderOpen, HardDrive, Info, ArrowLeft, Plus } from 'lucide-react';
import { DesktopFolderItem } from '../types';

interface FolderWindowProps {
  folder: DesktopFolderItem;
  mode: 'retro' | 'space';
}

export const FolderWindow: React.FC<FolderWindowProps> = ({ folder, mode }) => {
  if (mode === 'retro') {
    return (
      <div className="flex flex-col h-full select-none font-sans text-gray-900 bg-[#c0c0c0]">
        {/* Retro Menu Bar */}
        <div className="flex items-center gap-3 px-2 py-0.5 border-b border-gray-400 text-xs font-sans bg-[#ece9d8]">
          <span className="hover:bg-blue-800 hover:text-white px-1 cursor-pointer">Arquivo</span>
          <span className="hover:bg-blue-800 hover:text-white px-1 cursor-pointer">Editar</span>
          <span className="hover:bg-blue-800 hover:text-white px-1 cursor-pointer">Exibir</span>
          <span className="hover:bg-blue-800 hover:text-white px-1 cursor-pointer">Favoritos</span>
          <span className="hover:bg-blue-800 hover:text-white px-1 cursor-pointer">Ajuda</span>
        </div>

        {/* Retro Address Bar */}
        <div className="flex items-center gap-2 px-2 py-1 border-b border-gray-400 bg-[#ece9d8] text-xs">
          <span className="text-gray-600 font-bold">Endereço:</span>
          <div className="flex-1 bg-white border border-gray-600 px-1.5 py-0.5 text-xs font-mono flex items-center gap-1.5">
            <Folder className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">C:\Desktop\{folder.name}</span>
          </div>
        </div>

        {/* Folder Content (Empty state) */}
        <div className="flex-1 bg-white border-2 border-gray-600 m-1 p-6 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-md bg-amber-100 border border-amber-400 flex items-center justify-center text-amber-600 shadow-sm mb-3">
            <FolderOpen className="w-9 h-9 text-amber-500" />
          </div>
          <h3 className="font-bold text-sm text-gray-800">{folder.name}</h3>
          <p className="text-xs text-gray-500 mt-1">Esta pasta está vazia.</p>
        </div>

        {/* Status Bar */}
        <div className="px-2 py-0.5 border-t border-gray-400 bg-[#c0c0c0] text-[11px] text-gray-700 flex justify-between">
          <span>0 objeto(s)</span>
          <span>0 bytes</span>
        </div>
      </div>
    );
  }

  // Modern Space 2026 Folder Window
  return (
    <div className="flex flex-col h-full select-none font-sans text-slate-200">
      {/* Top Address & Breadcrumb Bar */}
      <div className="p-3 bg-slate-900/80 border-b border-white/10 flex items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-cyan-300">
          <HardDrive className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400">/</span>
          <span className="text-slate-400">DESKTOP</span>
          <span className="text-slate-400">/</span>
          <span className="text-white font-bold">{folder.name.toUpperCase()}</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
          CONTAINER QUANTUM
        </span>
      </div>

      {/* Main Empty Folder Area */}
      <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_30px_rgba(6,182,212,0.2)] mb-4">
          <FolderOpen className="w-10 h-10" />
        </div>
        <h2 className="text-lg font-bold font-mono text-white tracking-wide">{folder.name}</h2>
        <p className="text-xs text-slate-400 font-mono mt-1 max-w-sm">
          Esta pasta está vazia. Nenhum arquivo ou documento inserido neste diretório local.
        </p>
      </div>

      {/* Bottom Status Bar */}
      <div className="p-2.5 bg-black/60 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>STATUS: 0 ARQUIVOS</span>
        <span className="text-cyan-400">MEMÓRIA: 0 KB</span>
      </div>
    </div>
  );
};
