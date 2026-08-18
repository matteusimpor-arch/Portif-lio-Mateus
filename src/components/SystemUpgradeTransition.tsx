import React, { useState, useEffect } from 'react';
import { Sparkles, Monitor, ArrowRight, RefreshCw, Cpu, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface SystemUpgradeTransitionProps {
  direction: 'to-modern' | 'to-retro';
  onComplete: () => void;
}

export const SystemUpgradeTransition: React.FC<SystemUpgradeTransitionProps> = ({
  direction,
  onComplete,
}) => {
  const [step, setStep] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);

  const upgradeLogs = [
    'Initializing START 2026 SPACE...',
    'Synchronizing orbital modules...',
    'Loading interactive nodes (Portfolio, Formação, IA)...',
    'Configuring 3D celestial perspective...',
    'Optimizing spatial engine...',
    'START 2026 • SPACE ENVIRONMENT ONLINE'
  ];

  const downgradeLogs = [
    'RETURNING TO MATEUS OS \'96...',
    'Restoring retro desktop kernel...',
    'Initializing CRT monitor & 16-bit windows...',
    'MATEUS OS \'96 RESTORED'
  ];

  const activeLogs = direction === 'to-modern' ? upgradeLogs : downgradeLogs;

  useEffect(() => {
    try {
      if (direction === 'to-modern') {
        soundFx.playFanfare();
      } else {
        soundFx.playBootSound();
      }
    } catch (err) {
      console.warn(err);
    }

    // Fast progress bar
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 90);

    return () => clearInterval(interval);
  }, [direction]);

  useEffect(() => {
    if (step < activeLogs.length) {
      const timer = setTimeout(() => {
        setLogs((prev) => [...prev, activeLogs[step]]);
        setStep((prev) => prev + 1);
      }, 130);
      return () => clearTimeout(timer);
    } else {
      const finishTimer = setTimeout(() => {
        onComplete();
      }, 400);
      return () => clearTimeout(finishTimer);
    }
  }, [step, activeLogs]);

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col items-center justify-center p-6 overflow-hidden select-none">
      {/* Background glitch effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_70%)] animate-pulse pointer-events-none" />
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="max-w-xl w-full bg-slate-900/90 border-2 border-indigo-500/50 rounded-2xl p-6 md:p-8 shadow-[0_0_50px_rgba(99,102,241,0.25)] relative backdrop-blur-xl z-10 space-y-6">
        {/* Transition Header */}
        <div className="flex items-center justify-between border-b border-indigo-500/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-950 rounded-xl border border-indigo-500/40 text-indigo-400">
              {direction === 'to-modern' ? (
                <Sparkles className="w-6 h-6 animate-spin text-yellow-400" />
              ) : (
                <Monitor className="w-6 h-6 text-emerald-400" />
              )}
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold font-mono text-white tracking-wide">
                {direction === 'to-modern' ? 'START 2026 • SPACE' : 'RETORNANDO AO MATEUS OS \'96'}
              </h2>
              <p className="text-xs text-indigo-300 font-mono">
                {direction === 'to-modern' ? 'Iniciando Experiência Interativa Space' : 'Restaurando Desktop Retrô'}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-indigo-950 text-indigo-300 px-3 py-1 rounded-full border border-indigo-800">
            {progress}%
          </span>
        </div>

        {/* Logs Output Box */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs md:text-sm space-y-2 h-44 overflow-y-auto custom-scrollbar">
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-indigo-500">❯</span>
              <span className={idx === logs.length - 1 ? 'text-yellow-300 font-bold animate-pulse' : 'text-slate-300'}>
                {log}
              </span>
            </div>
          ))}
        </div>

        {/* Animated Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono text-indigo-300">
            <span>{direction === 'to-modern' ? 'PROCESSANDO INTERFACE CONTEMPORÂNEA...' : 'CARREGANDO KERNEL RETRÔ...'}</span>
            <span className="font-bold text-yellow-400">{progress}%</span>
          </div>
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-indigo-900">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-yellow-400 rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Footer status */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800 pt-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>MATEUS ARAUJO PORTFOLIO OS</span>
          </div>
          <span>(C) 2026</span>
        </div>
      </div>
    </div>
  );
};
