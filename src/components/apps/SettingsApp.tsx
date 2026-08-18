import React, { useState } from 'react';
import {
  Settings,
  Monitor,
  Volume2,
  Sparkles,
  RefreshCw,
  Palette,
  Eye,
  Check,
  Moon,
  Tv
} from 'lucide-react';
import { ThemeConfig } from '../../types';
import { soundFx } from '../../utils/soundEffects';

interface SettingsAppProps {
  themeConfig: ThemeConfig;
  onUpdateTheme: (newConfig: Partial<ThemeConfig>) => void;
  onResetDesktop: () => void;
  onTestScreensaver?: () => void;
}

export const SettingsApp: React.FC<SettingsAppProps> = ({
  themeConfig,
  onUpdateTheme,
  onResetDesktop,
  onTestScreensaver
}) => {
  const [activeTab, setActiveTab] = useState<'wallpaper' | 'screensaver' | 'appearance'>('wallpaper');
  const [previewWallpaper, setPreviewWallpaper] = useState<ThemeConfig['wallpaper']>(themeConfig.wallpaper);

  const wallpapers: { id: ThemeConfig['wallpaper']; label: string; bgClass: string; desc: string }[] = [
    {
      id: 'classic-teal',
      label: 'Teal Clássico 2000 (Padrão)',
      bgClass: 'bg-[#008080]',
      desc: 'Cor ciano/verde clássica dos desktops Windows 95/98/2000'
    },
    {
      id: 'mateus-os',
      label: 'Azul Meia-Noite Profundo',
      bgClass: 'bg-[#000080]',
      desc: 'Azul clássico corporativo da linha NT'
    },
    {
      id: 'retro-computer',
      label: 'Bege Computador Vintage',
      bgClass: 'bg-[#c8bfa7]',
      desc: 'Paleta inspirada nos gabinetes e monitores CRT clássicos'
    },
    {
      id: 'pixel-art',
      label: 'Gradiente Pôr do Sol Retrô',
      bgClass: 'bg-gradient-to-b from-indigo-950 via-purple-900 to-pink-700',
      desc: 'Gradiente estilo synthwave com transição suave'
    },
    {
      id: 'minimal-slate',
      label: 'Tempestade Cinza Grafite',
      bgClass: 'bg-[#2b3542]',
      desc: 'Tom moderno e sóbrio para leitura confortável'
    },
    {
      id: 'matrix',
      label: 'Matrix Terminal Dark',
      bgClass: 'bg-black border border-emerald-900',
      desc: 'Fundo escuro minimalista com atmosfera hacker anos 2000'
    }
  ];

  const handleApplyWallpaper = (wId: ThemeConfig['wallpaper']) => {
    soundFx.playFanfare();
    onUpdateTheme({ wallpaper: wId });
    try {
      localStorage.setItem('mateus_os_wallpaper', wId);
    } catch (e) {}
  };

  const handleRestoreDefault = () => {
    soundFx.playClick();
    setPreviewWallpaper('classic-teal');
    onUpdateTheme({ wallpaper: 'classic-teal' });
    try {
      localStorage.setItem('mateus_os_wallpaper', 'classic-teal');
    } catch (e) {}
  };

  return (
    <div className="space-y-4 font-sans text-gray-900 select-none max-w-3xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#c0c0c0] p-2 border-2 border-white border-r-gray-800 border-b-gray-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 font-bold">
          <Settings className="w-4 h-4 text-blue-900" />
          <span className="text-blue-950 font-bold">PAINEL DE CONTROLE: PROPRIEDADES DE VÍDEO & FUNDOS</span>
        </div>
        <span className="text-[11px] text-gray-700">PERSONALIZAR.EXE</span>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center gap-1 border-b-2 border-gray-400">
        <button
          onClick={() => {
            soundFx.playClick();
            setActiveTab('wallpaper');
          }}
          className={`px-3 py-1 text-xs font-bold border-2 rounded-t-sm cursor-pointer ${
            activeTab === 'wallpaper'
              ? 'bg-white border-gray-600 border-b-white font-bold text-blue-950 -mb-[2px]'
              : 'bg-[#d8d8d8] border-gray-400 text-gray-700 hover:bg-gray-200'
          }`}
        >
          ✦ Tela de Fundo (Wallpapers)
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            setActiveTab('screensaver');
          }}
          className={`px-3 py-1 text-xs font-bold border-2 rounded-t-sm cursor-pointer ${
            activeTab === 'screensaver'
              ? 'bg-white border-gray-600 border-b-white font-bold text-blue-950 -mb-[2px]'
              : 'bg-[#d8d8d8] border-gray-400 text-gray-700 hover:bg-gray-200'
          }`}
        >
          ✦ Descanso de Tela
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            setActiveTab('appearance');
          }}
          className={`px-3 py-1 text-xs font-bold border-2 rounded-t-sm cursor-pointer ${
            activeTab === 'appearance'
              ? 'bg-white border-gray-600 border-b-white font-bold text-blue-950 -mb-[2px]'
              : 'bg-[#d8d8d8] border-gray-400 text-gray-700 hover:bg-gray-200'
          }`}
        >
          ✦ Áudio & Efeitos CRT
        </button>
      </div>

      {/* Tab 1: Wallpapers */}
      {activeTab === 'wallpaper' && (
        <div className="bg-white border-2 border-gray-700 shadow-sm p-4 space-y-4 text-xs">
          {/* Monitor Simulator Preview */}
          <div className="flex flex-col items-center justify-center p-3 bg-gray-100 border border-gray-400 rounded">
            <div className="w-48 h-32 bg-[#e0d8c3] border-4 border-[#8c8573] rounded-t-lg p-2 shadow-inner flex flex-col items-center justify-between">
              {/* Screen Glass */}
              <div
                className={`w-full h-full rounded border-2 border-black ${
                  wallpapers.find((w) => w.id === previewWallpaper)?.bgClass || 'bg-[#008080]'
                } flex items-center justify-center relative overflow-hidden`}
              >
                <div className="text-[10px] text-white/90 font-mono font-bold bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">
                  {previewWallpaper}
                </div>
              </div>
            </div>
            {/* Monitor Stand */}
            <div className="w-16 h-3 bg-[#8c8573] border-x-2 border-black" />
            <div className="w-24 h-2 bg-[#b8af9b] border-2 border-black rounded-b" />
            <span className="text-[10px] text-gray-600 font-mono mt-1">
              Visualização Prévia do Monitor CRT
            </span>
          </div>

          {/* Wallpapers List */}
          <div className="space-y-2">
            <label className="font-bold font-mono text-gray-900 text-xs">
              Selecione um Papel de Parede:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {wallpapers.map((w) => {
                const isSelected = previewWallpaper === w.id;
                const isCurrentActive = themeConfig.wallpaper === w.id;
                return (
                  <div
                    key={w.id}
                    onClick={() => {
                      soundFx.playClick();
                      setPreviewWallpaper(w.id);
                    }}
                    className={`p-2.5 border-2 rounded flex items-center gap-3 cursor-pointer transition ${
                      isSelected
                        ? 'border-blue-900 bg-blue-50'
                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded border border-black shrink-0 ${w.bgClass}`} />
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="font-bold text-blue-950 flex items-center gap-1.5 text-xs truncate">
                        <span>{w.label}</span>
                        {isCurrentActive && (
                          <span className="px-1.5 py-0.2 bg-green-700 text-white text-[9px] font-bold rounded">
                            ATIVO
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-600 truncate">{w.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-300">
            <button
              onClick={handleRestoreDefault}
              className="btn-retro px-3 py-1.5 text-xs text-gray-800 font-medium cursor-pointer"
            >
              Restaurar Padrão (Teal 2000)
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundFx.playClick();
                  onUpdateTheme({ wallpaper: previewWallpaper });
                }}
                className="btn-retro px-3 py-1.5 text-xs text-blue-950 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Testar Fundo</span>
              </button>
              <button
                onClick={() => handleApplyWallpaper(previewWallpaper)}
                className="btn-retro px-4 py-1.5 text-xs text-blue-950 font-bold bg-yellow-200 border-2 border-yellow-600 flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 text-green-800 font-bold" />
                <span>Aplicar e Salvar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Screensaver */}
      {activeTab === 'screensaver' && (
        <div className="bg-white border-2 border-gray-700 shadow-sm p-4 space-y-4 text-xs">
          <div className="bg-blue-50 border border-blue-300 p-3 rounded space-y-2">
            <h3 className="font-bold font-mono text-blue-950 text-xs flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-blue-800" />
              <span>Sistema Automático de Descanso de Tela</span>
            </h3>
            <p className="text-gray-800 text-[11.5px] leading-relaxed">
              O descanso de tela é ativado automaticamente após <strong>30 segundos de inatividade</strong> (sem movimento de mouse ou teclas). Qualquer toque no teclado ou clique desperta o sistema instantaneamente.
            </p>
          </div>

          <div className="border border-gray-300 p-3 bg-gray-50 rounded space-y-2">
            <div className="font-bold text-gray-900 font-mono">Modos de Descanso Incluídos:</div>
            <ul className="list-disc pl-5 space-y-1 text-[11.5px] text-gray-700">
              <li><strong>Chuva Digital Matrix:</strong> Caracteres verdes codificados com o nome <em>MATEUS ARAUJO</em>.</li>
              <li><strong>Morfologia de Partículas:</strong> Nuvens de micropartículas orbitando no espaço.</li>
              <li><strong>Terminal CRT Retrô:</strong> Linhas de log em fósforo verde estilo mainframe.</li>
              <li><strong>Campo de Estrelas (Starfield):</strong> Efeito clássico 3D de navegação estelar.</li>
            </ul>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => {
                soundFx.playClick();
                if (onTestScreensaver) {
                  onTestScreensaver();
                }
              }}
              className="btn-retro px-4 py-2 text-xs font-bold text-blue-950 bg-yellow-200 border-2 border-yellow-600 flex items-center gap-1.5 cursor-pointer"
            >
              <Tv className="w-4 h-4 text-blue-950" />
              <span>Testar Descanso de Tela Agora</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Appearance & Sound */}
      {activeTab === 'appearance' && (
        <div className="bg-white border-2 border-gray-700 shadow-sm p-4 space-y-4 text-xs">
          <div className="space-y-3">
            {/* CRT Lines Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-300 rounded">
              <div className="space-y-0.5">
                <div className="font-bold text-blue-950">Linhas de Varredura CRT (Scanlines)</div>
                <div className="text-[11px] text-gray-600">Simula a textura visual de monitores de tubo vintage</div>
              </div>
              <input
                type="checkbox"
                checked={themeConfig.enableScanlines}
                onChange={(e) => {
                  soundFx.playClick();
                  onUpdateTheme({ enableScanlines: e.target.checked });
                }}
                className="w-4 h-4 cursor-pointer"
              />
            </div>

            {/* Audio Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-300 rounded">
              <div className="space-y-0.5">
                <div className="font-bold text-blue-950">Efeitos Sonoros Retrô (Web Audio)</div>
                <div className="text-[11px] text-gray-600">Clicks, abertura de janelas e fanfarras sintetizadas em tempo real</div>
              </div>
              <input
                type="checkbox"
                checked={themeConfig.enableSound}
                onChange={(e) => {
                  soundFx.playClick();
                  onUpdateTheme({ enableSound: e.target.checked });
                }}
                className="w-4 h-4 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-gray-300 flex justify-between items-center">
            <span className="text-[11px] text-gray-600">Deseja reorganizar as janelas abertas?</span>
            <button
              onClick={() => {
                soundFx.playClick();
                onResetDesktop();
              }}
              className="btn-retro px-3 py-1.5 text-xs text-gray-900 font-bold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Redefinir Área de Trabalho</span>
            </button>
          </div>
        </div>
      )}

      {/* Retro Status Bar */}
      <div className="bg-[#c0c0c0] p-1.5 border-bevel-in text-[11px] font-mono text-gray-800 flex items-center justify-between">
        <span>SISTEMA: MATEUS OS 2000 PERSONALIZAÇÃO</span>
        <span>CONFIGURAÇÕES SALVAS EM LOCALSTORAGE</span>
      </div>
    </div>
  );
};
