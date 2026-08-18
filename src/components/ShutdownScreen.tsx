import React from 'react';
import { Power, RefreshCw, Sparkles, Terminal } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface ShutdownScreenProps {
  onRestart: () => void;
}

export const ShutdownScreen: React.FC<ShutdownScreenProps> = ({ onRestart }) => {
  const handleRestart = () => {
    soundFx.playClick();
    onRestart();
  };

  return (
    <div className="fixed inset-0 bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 z-50 crt-overlay font-sans-ui">
      <div className="max-w-lg w-full bg-slate-900 border-2 border-slate-700 p-8 rounded-xl text-center shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="w-16 h-16 bg-red-950/80 border border-red-500/40 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Power className="w-8 h-8" />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold font-vt323 tracking-wider text-amber-400 mb-2">
          SYSTEM SHUTDOWN COMPLETE
        </h1>

        <p className="text-slate-300 text-sm md:text-base mb-6 leading-relaxed">
          É seguro desligar o computador ou reiniciar a sessão do sistema de <strong className="text-white">Mateus Araujo</strong>.
        </p>

        <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800 text-left font-mono-code text-xs text-slate-400 mb-8 space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <Terminal className="w-3.5 h-3.5" />
            <span>SESSION SUMMARY</span>
          </div>
          <div>• Mateus Araujo System Status: Safe Offline</div>
          <div>• Prompt Engineering Engine: Saved</div>
          <div>• Thank you for visiting!</div>
        </div>

        <button
          onClick={handleRestart}
          className="w-full inline-flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold py-3 px-6 rounded-lg border border-emerald-500/40 hover:border-emerald-400 transition cursor-pointer shadow-md"
        >
          <RefreshCw className="w-5 h-5 animate-spin-slow" />
          <span>RESTART SYSTEM (REINICIAR)</span>
        </button>

        <div className="mt-6 text-xs text-slate-500 flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Tecnologia • Inteligência Artificial • Gestão • Logística</span>
        </div>
      </div>
    </div>
  );
};
