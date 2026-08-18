import React, { useState } from 'react';
import { Trash2, RefreshCw, FileText, CheckCircle2 } from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';

export const TrashApp: React.FC = () => {
  const [trashItems, setTrashItems] = useState([
    { id: 1, name: 'antigo_prompt_ruim.txt', desc: 'Prompt sem contexto e sem persona (deletado em 2024)' },
    { id: 2, name: 'planilha_manual_antiga.xlsx', desc: 'Processo manual substituído por automação em IA' },
    { id: 3, name: 'ideia_antiga.doc', desc: 'Rascunho inicial do portfólio pré-OS' }
  ]);

  const handleEmptyTrash = () => {
    soundFx.playWindowClose();
    setTrashItems([]);
  };

  const handleRestore = (id: number) => {
    soundFx.playNotification();
    setTrashItems((prev) => prev.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6 font-sans-ui text-slate-200">
      {/* App Banner */}
      <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-400">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-vt323 text-2xl">LIXEIRA DO SISTEMA</h1>
            <p className="text-xs text-slate-400">Arquivos obsoletos e rascunhos descontinuados</p>
          </div>
        </div>

        {trashItems.length > 0 && (
          <button
            onClick={handleEmptyTrash}
            className="flex items-center gap-1.5 bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 text-xs font-semibold py-1.5 px-3 rounded transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span>Esvaziar Lixeira</span>
          </button>
        )}
      </div>

      <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-3">
        {trashItems.length === 0 ? (
          <div className="text-center py-12 space-y-2 text-slate-500">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500/60" />
            <p className="text-sm font-mono-code">A lixeira está completamente limpa e otimizada!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {trashItems.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between gap-4 text-xs font-mono-code"
              >
                <div className="flex items-center gap-3 truncate">
                  <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                  <div className="truncate">
                    <div className="font-bold text-slate-200 truncate">{item.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{item.desc}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleRestore(item.id)}
                  className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] px-2.5 py-1 rounded border border-slate-700 transition cursor-pointer shrink-0"
                >
                  <RefreshCw className="w-3 h-3 text-emerald-400" />
                  <span>Restaurar</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
