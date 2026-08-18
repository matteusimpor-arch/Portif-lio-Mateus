import React from 'react';
import { Settings, Monitor, Volume2, Sparkles, RefreshCw, Palette, Shield, Laptop, Terminal } from 'lucide-react';
import { ThemeConfig } from '../../types';
import { soundFx } from '../../utils/soundEffects';

interface SettingsAppProps {
  themeConfig: ThemeConfig;
  onUpdateTheme: (newConfig: Partial<ThemeConfig>) => void;
  onResetDesktop: () => void;
}

export const SettingsApp: React.FC<SettingsAppProps> = ({
  themeConfig,
  onUpdateTheme,
  onResetDesktop
}) => {
  return (
    <div className="space-y-6 font-sans text-slate-100">
      {/* App Banner */}
      <div className="bg-[#c0c0c0] p-4 border-2 border-white border-r-gray-800 border-b-gray-800 text-gray-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 text-amber-300 border border-white rounded shadow-sm">
            <Settings className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h1 className="text-lg font-black font-mono tracking-wide text-gray-900 uppercase">
              PAINEL DE CONTROLE • CONTROL_PANEL.EXE
            </h1>
            <p className="text-xs font-mono text-gray-700">
              Gerenciamento de papéis de parede, efeitos visuais CRT e parâmetros do sistema
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wallpapers Selection */}
        <div className="bg-slate-900/90 p-5 rounded-none border-2 border-slate-700 space-y-4">
          <h2 className="text-sm font-bold text-yellow-300 font-mono flex items-center gap-2 pb-2 border-b border-slate-800">
            <Palette className="w-4 h-4 text-emerald-400" />
            <span>SELEÇÃO DE WALLPAPER RETRÔ</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
            {[
              { id: '90s', label: "90s (Classic Teal OS)", color: 'bg-[#008080]' },
              { id: 'mateus-os', label: "MATEUS OS (Navy & Gold)", color: 'bg-[#000080] border border-yellow-400' },
              { id: 'retro-computer', label: "RETRO COMPUTER (CRT Beige)", color: 'bg-[#c8bfa7]' },
              { id: 'pixel-art', label: "PIXEL ART (Sunset Grid)", color: 'bg-gradient-to-b from-indigo-950 via-purple-900 to-pink-700' },
              { id: 'space', label: "SPACE (Deep Nebula)", color: 'bg-black bg-[radial-gradient(ellipse_at_top,#2e1065,#030712)]' },
              { id: 'cyber', label: "CYBER (Neon Grid)", color: 'bg-slate-950 border border-cyan-400' },
              { id: 'tech', label: "TECH (Matrix Circuit)", color: 'bg-black border border-emerald-500' },
            ].map((wall) => (
              <button
                key={wall.id}
                onClick={() => {
                  soundFx.playClick();
                  onUpdateTheme({ wallpaper: wall.id as ThemeConfig['wallpaper'] });
                }}
                className={`p-3 border-2 text-left transition cursor-pointer flex flex-col justify-between h-20 ${
                  themeConfig.wallpaper === wall.id || (themeConfig.wallpaper === 'classic-teal' && wall.id === '90s')
                    ? 'border-yellow-400 bg-slate-800 text-yellow-300 font-bold ring-2 ring-yellow-400'
                    : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className={`w-full h-6 ${wall.color} rounded-xs border border-white/20`} />
                <span className="truncate mt-1">{wall.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Audio & Visual Options */}
        <div className="bg-slate-900/90 p-5 rounded-none border-2 border-slate-700 space-y-4">
          <h2 className="text-sm font-bold text-yellow-300 font-mono flex items-center gap-2 pb-2 border-b border-slate-800">
            <Monitor className="w-4 h-4 text-amber-400" />
            <span>EXIBIÇÃO E SOM</span>
          </h2>

          <div className="space-y-3 text-xs font-mono">
            {/* CRT Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800">
              <div>
                <div className="font-bold text-emerald-400">Efeito CRT / Scanlines</div>
                <div className="text-[10px] text-slate-400">Filtro de linhas de varredura vintage de tubo</div>
              </div>
              <input
                type="checkbox"
                checked={themeConfig.enableScanlines}
                onChange={(e) => {
                  soundFx.playClick();
                  onUpdateTheme({ enableScanlines: e.target.checked });
                }}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800">
              <div>
                <div className="font-bold text-emerald-400">Efeitos Sonoros Retrô</div>
                <div className="text-[10px] text-slate-400">Sons de boot, cliques e abertura de janelas</div>
              </div>
              <input
                type="checkbox"
                checked={themeConfig.enableSound}
                onChange={(e) => {
                  soundFx.playClick();
                  onUpdateTheme({ enableSound: e.target.checked });
                }}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                soundFx.playClick();
                onResetDesktop();
              }}
              className="w-full btn-retro py-2.5 px-4 text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer bg-[#c0c0c0] text-black active:border-inset"
            >
              <RefreshCw className="w-4 h-4 text-blue-800" />
              <span>[ RESTAURAR POSIÇÕES DAS JANELAS ]</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

