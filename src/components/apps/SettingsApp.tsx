import React, { useState, useEffect } from 'react';
import {
  Settings,
  RefreshCw,
  Eye,
  Check,
  Moon,
  Tv,
  Sparkles,
  Bot,
  Compass,
  Square,
  Volume2,
  VolumeX,
  Smile
} from 'lucide-react';
import { ThemeConfig } from '../../types';
import { soundFx } from '../../utils/soundEffects';
import { ScreensaverType } from '../ScreensaverCanvas';
import { MateusLogo } from '../MateusLogo';

interface SettingsAppProps {
  themeConfig: ThemeConfig;
  onUpdateTheme: (newConfig: Partial<ThemeConfig>) => void;
  onResetDesktop: () => void;
  onTestScreensaver?: () => void;
  initialTab?: 'wallpaper' | 'screensaver' | 'appearance' | 'mbot';
}

interface ScreensaverOption {
  id: ScreensaverType | 'random';
  name: string;
  badge: string;
  desc: string;
  icon: string;
}

export const SettingsApp: React.FC<SettingsAppProps> = ({
  themeConfig,
  onUpdateTheme,
  onResetDesktop,
  onTestScreensaver,
  initialTab = 'wallpaper',
}) => {
  const [activeTab, setActiveTab] = useState<'wallpaper' | 'screensaver' | 'appearance' | 'mbot'>(initialTab);
  const [previewWallpaper, setPreviewWallpaper] = useState<ThemeConfig['wallpaper']>(themeConfig.wallpaper);

  // M-BOT local settings state
  const [mBotEnabled, setMBotEnabled] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('mBotEnabled') !== 'false' : true;
  });
  const [mBotBehavior, setMBotBehavior] = useState<'roam' | 'stay'>(() => {
    return (typeof window !== 'undefined' && (localStorage.getItem('mBotBehavior') as 'roam' | 'stay')) || 'roam';
  });
  const [mBotCursor, setMBotCursor] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('mBotCursorInteraction') !== 'false' : true;
  });
  const [mBotSound, setMBotSound] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('mBotSound') === 'true' : false;
  });

  const handleUpdateMBot = (updates: { enabled?: boolean; behavior?: 'roam' | 'stay'; cursor?: boolean; sound?: boolean }) => {
    if (updates.enabled !== undefined) {
      setMBotEnabled(updates.enabled);
      localStorage.setItem('mBotEnabled', String(updates.enabled));
    }
    if (updates.behavior !== undefined) {
      setMBotBehavior(updates.behavior);
      localStorage.setItem('mBotBehavior', updates.behavior);
    }
    if (updates.cursor !== undefined) {
      setMBotCursor(updates.cursor);
      localStorage.setItem('mBotCursorInteraction', String(updates.cursor));
    }
    if (updates.sound !== undefined) {
      setMBotSound(updates.sound);
      localStorage.setItem('mBotSound', String(updates.sound));
      if (updates.sound) soundFx.playMBotChirp();
    }
    // Dispatch storage event so live companion syncs immediately
    window.dispatchEvent(new Event('storage'));
  };

  const [selectedScreensaver, setSelectedScreensaver] = useState<string>(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('mateus_screensaver_pref')) || 'pipes_3d';
  });

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

  const screensaverOptions: ScreensaverOption[] = [
    {
      id: 'pipes_3d',
      name: 'Tubos 3D (3D Pipes Classic)',
      badge: 'CLÁSSICO',
      desc: 'O lendário labirinto tridimensional de canos coloridos iluminados do Windows 98/2000.',
      icon: '🧪'
    },
    {
      id: 'starfield',
      name: 'Campo de Estrelas 3D (Starfield)',
      badge: 'ESPAÇAL',
      desc: 'Navegação em alta velocidade pelo cosmos com feixes de luz e estrelas viajando em direção à tela.',
      icon: '✨'
    },
    {
      id: 'matrix_rain',
      name: 'Chuva Digital Matrix Code',
      badge: 'HACKER',
      desc: 'Cascata de glifos verdes com reflexo fosforescente e terminal de dados em tempo real.',
      icon: '📟'
    },
    {
      id: 'mystify',
      name: 'Mystify (Polígonos Dinâmicos)',
      badge: 'GEOMETRIA',
      desc: 'Fitas poligonais coloridas ricocheteando nas bordas com rastro e transição de matiz suave.',
      icon: '🎨'
    },
    {
      id: 'retro_bounce',
      name: 'Bouncing Logo Mateus OS',
      badge: 'RETRÔ',
      desc: 'O clássico logotipo flutuante que rebate nas quatro paredes da tela mudando de cor a cada quique.',
      icon: '📺'
    },
    {
      id: 'flying_windows',
      name: 'Janelas Flutuantes 3D',
      badge: 'SISTEMA',
      desc: 'Janelas clássicas do Mateus OS navegando pelo espaço em gravidade zero.',
      icon: '🪟'
    },
    {
      id: 'crt_terminal',
      name: 'Terminal Mainframe Diagnostic',
      badge: 'DIAGNÓSTICO',
      desc: 'Varredura contínua de status, logs e checagem de sistemas com scanlines CRT.',
      icon: '💻'
    },
    {
      id: 'random',
      name: 'Modo Aleatório (Surpresa)',
      badge: 'ALEATÓRIO',
      desc: 'Alterna dinamicamente entre os diferentes descansos de tela a cada ciclo de inatividade.',
      icon: '🎲'
    }
  ];

  const handleApplyWallpaper = (wId: ThemeConfig['wallpaper']) => {
    soundFx.playFanfare();
    onUpdateTheme({ wallpaper: wId });
    try {
      localStorage.setItem('mateus_os_wallpaper', wId);
    } catch (e) {}
  };

  const handleSaveScreensaver = (scId: string) => {
    soundFx.playClick();
    setSelectedScreensaver(scId);
    try {
      localStorage.setItem('mateus_screensaver_pref', scId);
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
          <span className="text-blue-950 font-bold">PAINEL DE CONTROLE: PROPRIEDADES DE VÍDEO & SISTEMA</span>
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

        <button
          onClick={() => {
            soundFx.playClick();
            setActiveTab('mbot');
          }}
          className={`px-3 py-1 text-xs font-bold border-2 rounded-t-sm cursor-pointer ${
            activeTab === 'mbot'
              ? 'bg-white border-gray-600 border-b-white font-bold text-blue-950 -mb-[2px]'
              : 'bg-[#d8d8d8] border-gray-400 text-gray-700 hover:bg-gray-200'
          }`}
        >
          ✦ M-BOT (Companheiro)
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
          <div className="bg-blue-50 border border-blue-300 p-3 rounded space-y-1.5">
            <h3 className="font-bold font-mono text-blue-950 text-xs flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-blue-800" />
              <span>Gerenciador de Proteção de Tela Mateus OS</span>
            </h3>
            <p className="text-gray-800 text-[11.5px] leading-relaxed">
              O descanso de tela é disparado automaticamente após <strong>30 segundos de inatividade</strong>. Mova o mouse, clique ou toque em qualquer lugar para retornar à sua sessão instantaneamente.
            </p>
          </div>

          <div className="space-y-2">
            <label className="font-bold font-mono text-gray-900 text-xs">
              Escolha o Protetor de Tela Favorito:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {screensaverOptions.map((sc) => {
                const isChosen = selectedScreensaver === sc.id;
                return (
                  <div
                    key={sc.id}
                    onClick={() => handleSaveScreensaver(sc.id)}
                    className={`p-2.5 border-2 rounded flex items-start gap-2.5 cursor-pointer transition ${
                      isChosen
                        ? 'border-blue-900 bg-blue-50 ring-1 ring-blue-900 shadow-xs'
                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl shrink-0 p-1 bg-white border border-gray-300 rounded">
                      {sc.icon}
                    </span>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="font-bold text-blue-950 flex items-center justify-between text-xs">
                        <span className="truncate">{sc.name}</span>
                        <span className="text-[9px] font-mono px-1 py-0.5 bg-blue-950 text-cyan-300 rounded">
                          {sc.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-600 leading-snug line-clamp-2">
                        {sc.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-gray-300">
            <span className="text-[11px] font-mono text-emerald-800 font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Modo selecionado: {selectedScreensaver.toUpperCase()}</span>
            </span>

            <button
              onClick={() => {
                soundFx.playClick();
                if (onTestScreensaver) {
                  onTestScreensaver();
                }
              }}
              className="btn-retro px-4 py-2 text-xs font-bold text-blue-950 bg-yellow-200 border-2 border-yellow-600 flex items-center gap-1.5 cursor-pointer shadow hover:bg-yellow-100"
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

            {/* Official Visual Identity Showcase */}
            <div className="p-3 bg-[#f8fafc] border border-blue-200 rounded space-y-2">
              <div className="font-bold text-blue-950 flex items-center justify-between">
                <span>Identidade Visual &amp; Favicon Oficial (M + Órbita)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-blue-100 text-blue-900 rounded font-bold">Oficial</span>
              </div>
              <p className="text-[11px] text-gray-600">
                Logotipo exclusivo integrando a letra <strong>M</strong>, anel orbital luminoso e ponto espacial de navegação temporal.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-[#030712] p-2.5 rounded border border-gray-700 flex items-center gap-3">
                  <MateusLogo mode="retro" size={32} animated={false} />
                  <div className="text-[10px] font-mono text-gray-300">
                    <div className="font-bold text-white">Modo OS 00</div>
                    <div className="text-[#38bdf8]">Retrô Pixel Ed.</div>
                  </div>
                </div>
                <div className="bg-[#020617] p-2.5 rounded border border-cyan-500/40 flex items-center gap-3">
                  <MateusLogo mode="space" size={32} animated={true} />
                  <div className="text-[10px] font-mono text-cyan-300">
                    <div className="font-bold text-white">Modo Space 2026</div>
                    <div className="text-cyan-400">Quantum Vector Glow</div>
                  </div>
                </div>
              </div>
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

      {/* Tab 4: M-BOT Companion */}
      {activeTab === 'mbot' && (
        <div className="bg-white border-2 border-gray-700 shadow-sm p-4 space-y-4 text-xs">
          {/* M-BOT Overview Card */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-3 bg-blue-50 border-2 border-blue-200 rounded">
            {/* Retro Bot Visual Avatar */}
            <div className="w-20 h-20 bg-slate-200 border-2 border-slate-400 p-1 flex items-center justify-center shadow-inner shrink-0 rounded">
              <svg viewBox="0 0 100 110" className="w-16 h-16">
                <rect x="24" y="48" width="52" height="38" rx="6" fill="#64748b" stroke="#000" strokeWidth="1.5" />
                <rect x="30" y="53" width="40" height="28" rx="4" fill="#1e3a8a" stroke="#000" strokeWidth="1" />
                <rect x="42" y="66" width="16" height="11" rx="2" fill="#ffffff" stroke="#000" strokeWidth="0.8" />
                <text x="50" y="74.5" textAnchor="middle" fontSize="8" fontWeight="900" fontFamily="monospace" fill="#1e3a8a">M</text>
                <circle cx="64" cy="58" r="1.8" fill="#22c55e" stroke="#000" strokeWidth="0.5" />
                <rect x="46" y="38" width="8" height="12" rx="2" fill="#334155" stroke="#000" strokeWidth="1" />
                {/* Eyes: Fundo Branco, Pupila Preta, Brilho Branco */}
                <ellipse cx="34" cy="26" rx="14" ry="13" fill="#64748b" stroke="#000" strokeWidth="1.5" />
                <ellipse cx="34" cy="26" rx="11" ry="10" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
                <circle cx="34" cy="26" r="6" fill="#000000" />
                <circle cx="32" cy="23.5" r="2.2" fill="#ffffff" />
                <circle cx="36.5" cy="28.5" r="1.1" fill="#ffffff" />
                <ellipse cx="66" cy="26" rx="14" ry="13" fill="#64748b" stroke="#000" strokeWidth="1.5" />
                <ellipse cx="66" cy="26" rx="11" ry="10" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
                <circle cx="66" cy="26" r="6" fill="#000000" />
                <circle cx="64" cy="23.5" r="2.2" fill="#ffffff" />
                <circle cx="68.5" cy="28.5" r="1.1" fill="#ffffff" />
                {/* Treads */}
                <path d="M 12 98 L 22 75 L 34 75 L 42 98 Z" fill="#1e293b" stroke="#000" strokeWidth="1.5" />
                <path d="M 58 98 L 66 75 L 78 75 L 88 98 Z" fill="#1e293b" stroke="#000" strokeWidth="1.5" />
              </svg>
            </div>

            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="font-bold font-mono text-sm text-blue-950">M-BOT COMPANION</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-yellow-200 border border-yellow-500 text-blue-950 font-bold">
                  HABITANTE DO DESKTOP
                </span>
              </div>
              <p className="text-gray-700 text-[11px] leading-relaxed">
                Pequeno robô explorador original do Mateus OS. Passeia discretamente pelo desktop, observa o cursor e aplicativos, reage a cliques e evolui de <strong>M-BOT 00</strong> para <strong>M-BOT 26</strong> durante a viagem temporal.
              </p>
            </div>
          </div>

          {/* Controls List */}
          <div className="space-y-3">
            {/* Enable/Disable M-BOT */}
            <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-300 rounded">
              <div className="space-y-0.5">
                <div className="font-bold text-blue-950 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-blue-900" />
                  <span>Exibir M-BOT no Desktop</span>
                </div>
                <div className="text-[11px] text-gray-600">Ativa ou desativa a presença do robô companheiro</div>
              </div>
              <input
                type="checkbox"
                checked={mBotEnabled}
                onChange={(e) => {
                  soundFx.playClick();
                  handleUpdateMBot({ enabled: e.target.checked });
                }}
                className="w-4 h-4 cursor-pointer"
              />
            </div>

            {/* Behavior: Roam vs Stay */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 border border-gray-300 rounded gap-2">
              <div className="space-y-0.5">
                <div className="font-bold text-blue-950 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-blue-900" />
                  <span>Comportamento do Robô</span>
                </div>
                <div className="text-[11px] text-gray-600">Escolha entre caminhar livremente ou ficar parado em um ponto</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateMBot({ behavior: 'roam' })}
                  className={`btn-retro px-3 py-1 text-xs font-bold flex items-center gap-1 cursor-pointer ${
                    mBotBehavior === 'roam' ? 'bg-blue-900 text-white font-bold' : 'text-gray-900'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Passear</span>
                </button>
                <button
                  onClick={() => handleUpdateMBot({ behavior: 'stay' })}
                  className={`btn-retro px-3 py-1 text-xs font-bold flex items-center gap-1 cursor-pointer ${
                    mBotBehavior === 'stay' ? 'bg-blue-900 text-white font-bold' : 'text-gray-900'
                  }`}
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Ficar Parado</span>
                </button>
              </div>
            </div>

            {/* Cursor Tracking Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-300 rounded">
              <div className="space-y-0.5">
                <div className="font-bold text-blue-950 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-blue-900" />
                  <span>Interação com o Cursor</span>
                </div>
                <div className="text-[11px] text-gray-600">Os olhos digitais observam o mouse quando ele passa perto</div>
              </div>
              <input
                type="checkbox"
                checked={mBotCursor}
                onChange={(e) => {
                  soundFx.playClick();
                  handleUpdateMBot({ cursor: e.target.checked });
                }}
                className="w-4 h-4 cursor-pointer"
              />
            </div>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-300 rounded">
              <div className="space-y-0.5">
                <div className="font-bold text-blue-950 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-blue-900" />
                  <span>Efeitos Sonoros do M-BOT</span>
                </div>
                <div className="text-[11px] text-gray-600">Pequenos bips e cumprimentos eletrônicos sutis ao interagir</div>
              </div>
              <input
                type="checkbox"
                checked={mBotSound}
                onChange={(e) => {
                  soundFx.playClick();
                  handleUpdateMBot({ sound: e.target.checked });
                }}
                className="w-4 h-4 cursor-pointer"
              />
            </div>
          </div>

          <div className="p-3 bg-gray-100 border border-gray-300 rounded text-[11px] text-gray-600 space-y-1 font-mono">
            <div className="font-bold text-blue-950 flex items-center gap-1">
              <Smile className="w-3.5 h-3.5 text-blue-900" />
              <span>Dicas de Interação:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 pl-1">
              <li>Clique ou toque no M-BOT para receber um cumprimento animado.</li>
              <li>Clique e arraste para posicioná-lo onde preferir na tela.</li>
              <li>Clique com botão direito (ou toque longo no mobile) para abrir o menu rápido.</li>
            </ul>
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
