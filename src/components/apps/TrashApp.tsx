import React, { useState } from 'react';
import { Trash2, RefreshCw, FileText, Folder, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { TrashItem } from '../../types';
import { soundFx } from '../../utils/soundEffects';

interface TrashAppProps {
  mode?: 'retro' | 'space';
  trashItems: TrashItem[];
  onRestoreItem: (item: TrashItem) => void;
  onPermanentlyDeleteItem: (id: string) => void;
  onEmptyTrash: () => void;
}

export const TrashApp: React.FC<TrashAppProps> = ({
  mode = 'retro',
  trashItems,
  onRestoreItem,
  onPermanentlyDeleteItem,
  onEmptyTrash,
}) => {
  const [confirmEmpty, setConfirmEmpty] = useState<boolean>(false);

  const handleEmpty = () => {
    try { soundFx.playWindowClose(); } catch (e) {}
    onEmptyTrash();
    setConfirmEmpty(false);
  };

  const handleRestore = (item: TrashItem) => {
    try { soundFx.playNotification(); } catch (e) {}
    onRestoreItem(item);
  };

  const handlePermanentDelete = (id: string) => {
    try { soundFx.playClick(); } catch (e) {}
    onPermanentlyDeleteItem(id);
  };

  // Filter items matching the current mode or show all with tag
  const displayedItems = trashItems.filter((i) => i.origin === mode);

  if (mode === 'retro') {
    return (
      <div className="space-y-4 font-sans text-gray-900 select-none bg-[#c0c0c0] p-1">
        {/* Retro Header Toolbar */}
        <div className="bg-[#ece9d8] p-2 border border-gray-400 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-bold">
            <Trash2 className="w-5 h-5 text-gray-700" />
            <span className="text-gray-900">LIXEIRA DO SISTEMA (C:\RECYCLED)</span>
          </div>

          {displayedItems.length > 0 && (
            <button
              onClick={() => setConfirmEmpty(true)}
              className="px-2.5 py-1 bg-[#c0c0c0] hover:bg-[#d4d0c8] active:bg-[#a0a0a0] border-2 border-white border-r-gray-800 border-b-gray-800 text-xs font-bold text-gray-900 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-700" />
              <span>Esvaziar Lixeira</span>
            </button>
          )}
        </div>

        {/* Items List */}
        <div className="bg-white border-2 border-gray-600 p-2 min-h-[220px] max-h-[360px] overflow-y-auto space-y-1">
          {displayedItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500 space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600" />
              <p className="text-xs font-sans">A Lixeira do sistema está vazia.</p>
            </div>
          ) : (
            displayedItems.map((item) => (
              <div
                key={item.id}
                className="p-2 hover:bg-blue-100 border-b border-gray-200 flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-2 truncate">
                  {item.type === 'folder' ? (
                    <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-gray-500 shrink-0" />
                  )}
                  <div>
                    <div className="font-bold text-gray-900">{item.name}</div>
                    <div className="text-[10px] text-gray-500">{item.desc}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleRestore(item)}
                    className="px-2 py-0.5 bg-[#ece9d8] border border-gray-400 hover:bg-white text-[11px] font-sans flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3 text-emerald-700" />
                    <span>Restaurar</span>
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(item.id)}
                    className="px-2 py-0.5 bg-[#ece9d8] border border-gray-400 hover:bg-red-100 text-[11px] font-sans text-red-700 cursor-pointer"
                    title="Excluir Permanentemente"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Retro Confirmation Modal */}
        {confirmEmpty && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-[#c0c0c0] border-2 border-white border-r-gray-800 border-b-gray-800 p-4 w-80 shadow-2xl space-y-4">
              <div className="flex items-center gap-2 font-bold text-xs bg-blue-900 text-white p-1">
                <span>Confirmar Exclusão</span>
              </div>
              <p className="text-xs text-gray-900">
                Tem certeza de que deseja esvaziar a Lixeira e excluir permanentemente todos os itens?
              </p>
              <div className="flex justify-end gap-2 text-xs font-bold">
                <button
                  onClick={handleEmpty}
                  className="px-4 py-1 bg-[#c0c0c0] border-2 border-white border-r-gray-800 border-b-gray-800 hover:bg-gray-300 cursor-pointer"
                >
                  Sim
                </button>
                <button
                  onClick={() => setConfirmEmpty(false)}
                  className="px-4 py-1 bg-[#c0c0c0] border-2 border-white border-r-gray-800 border-b-gray-800 hover:bg-gray-300 cursor-pointer"
                >
                  Não
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Modern Space 2026 Trash
  return (
    <div className="space-y-6 font-sans text-slate-100 select-none max-w-3xl mx-auto animate-fadeIn">
      {/* Modern Banner */}
      <div className="p-5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl flex items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-mono text-white tracking-wide">
              LIXEIRA DIGITAL // SPACE 2026
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Repositório de itens descartados e pastas recicladas
            </p>
          </div>
        </div>

        {displayedItems.length > 0 && (
          <button
            onClick={() => setConfirmEmpty(true)}
            className="px-3.5 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200 text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition shadow-md"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
            <span>Esvaziar Lixeira</span>
          </button>
        )}
      </div>

      {/* Modern Trash Items List */}
      <div className="p-5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl space-y-3 min-h-[260px]">
        {displayedItems.length === 0 ? (
          <div className="text-center py-16 space-y-3 text-slate-500">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-400/80" />
            <p className="text-sm font-mono text-slate-300">
              A lixeira está completamente vazia e otimizada!
            </p>
            <p className="text-xs font-mono text-slate-500">
              Nenhuma pasta ou arquivo aguardando restauração.
            </p>
          </div>
        ) : (
          displayedItems.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 hover:border-cyan-500/40 flex items-center justify-between gap-4 transition"
            >
              <div className="flex items-center gap-3 truncate">
                <div className="w-9 h-9 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center shrink-0">
                  {item.type === 'folder' ? (
                    <Folder className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <FileText className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="truncate font-mono">
                  <div className="font-bold text-sm text-slate-100 truncate">{item.name}</div>
                  <div className="text-xs text-slate-400 truncate">{item.desc}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleRestore(item)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restaurar</span>
                </button>
                <button
                  onClick={() => handlePermanentDelete(item.id)}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950 border border-white/10 hover:border-red-500 text-slate-400 hover:text-red-300 transition cursor-pointer"
                  title="Excluir Permanentemente"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modern Confirmation Modal */}
      {confirmEmpty && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="p-6 rounded-2xl bg-slate-950 border border-red-500/40 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-950 border border-red-500/50 flex items-center justify-center mx-auto text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-mono font-bold text-base text-white">Esvaziar Lixeira?</h3>
            <p className="text-xs font-mono text-slate-400">
              Todos os itens contidos na lixeira serão excluídos permanentemente do sistema.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2 font-mono">
              <button
                onClick={() => setConfirmEmpty(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs text-slate-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleEmpty}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-lg cursor-pointer"
              >
                Esvaziar Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
