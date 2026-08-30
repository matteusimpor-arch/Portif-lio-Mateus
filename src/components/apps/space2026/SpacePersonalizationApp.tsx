import React, { useState } from 'react';
import {
  Palette,
  Sparkles,
  Monitor,
  Check,
  Zap,
  Sliders,
  Sun,
  Moon,
  Layers,
  Activity,
  Compass,
  Bot,
  Square,
  Volume2,
  VolumeX,
  Eye,
  Smile
} from 'lucide-react';
import { SpaceThemeId, SpaceWallpaperId } from '../../../types';
import { soundFx } from '../../../utils/soundEffects';

interface SpacePersonalizationAppProps {
  currentTheme: SpaceThemeId;
  currentWallpaper: SpaceWallpaperId;
  effectsEnabled: boolean;
  onSelectTheme: (theme: SpaceThemeId) => void;
  onSelectWallpaper: (wp: SpaceWallpaperId) => void;
  onToggleEffects: (enabled: boolean) => void;
  initialTab?: 'wallpapers' | 'themes' | 'effects' | 'mbot';
}

export const SpacePersonalizationApp: React.FC<SpacePersonalizationAppProps> = ({
  currentTheme,
  currentWallpaper,
  effectsEnabled,
  onSelectTheme,
  onSelectWallpaper,
  onToggleEffects,
  initialTab = 'wallpapers',
}) => {
  const [activeTab, setActiveTab] = useState<'wallpapers' | 'themes' | 'effects' | 'mbot'>(initialTab);

  // M-BOT local settings state in Space Mode
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
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('mbot-status-changed', { detail: { enabled: updates.enabled } }));
  };

  const wallpapers: { id: SpaceWallpaperId; title: string; subtitle: string; previewGrad: string; tag: string }[] = [
    {
      id: 'deep-space',
      title: '01 — DEEP SPACE',
      subtitle: 'Preto profundo + azul-marinho + campo estelar dinâmico (Padrão)',
      previewGrad: 'from-slate-950 via-blue-950 to-black',
      tag: 'DEFAULT',
    },
    {
      id: 'blue-nebula',
      title: '02 — BLUE NEBULA',
      subtitle: 'Nebulosidade cósmica em #020617, #071A35, #0EA5E9 e #22D3EE',
      previewGrad: 'from-slate-950 via-sky-900 to-cyan-950',
      tag: 'CELESTIAL',
    },
    {
      id: 'aurora-space',
      title: '03 — AURORA SPACE',
      subtitle: 'Preto profundo + verde esmeralda + ondas de cyan etéreo',
      previewGrad: 'from-black via-emerald-950 to-teal-900',
      tag: 'AURORA',
    },
    {
      id: 'digital-void',
      title: '04 — DIGITAL VOID',
      subtitle: 'Escuridão minimalista absoluta, poucas estrelas e foco total',
      previewGrad: 'from-black via-zinc-950 to-black',
      tag: 'MINIMAL',
    },
    {
      id: 'violet-galaxy',
      title: '05 — VIOLET GALAXY',
      subtitle: 'Preto + azul profundo + nuvens de violeta e poeira espacial',
      previewGrad: 'from-slate-950 via-purple-950 to-indigo-950',
      tag: 'NEBULA',
    },
    {
      id: 'cyber-grid',
      title: '06 — CYBER GRID',
      subtitle: 'Grade digital vetorial sutil em perspectiva espacial 2026',
      previewGrad: 'from-slate-950 via-blue-900 to-slate-950',
      tag: 'CYBER',
    },
  ];

  const themes: { id: SpaceThemeId; name: string; desc: string; accentColor: string; secColor: string; bgColor: string }[] = [
    {
      id: 'space-blue',
      name: 'SPACE BLUE',
      desc: 'Ciano elétrico & Azul estelar clássico com fundo azul profundo.',
      accentColor: '#22D3EE',
      secColor: '#38BDF8',
      bgColor: '#020617',
    },
    {
      id: 'aurora',
      name: 'AURORA',
      desc: 'Verde esmeralda vibrante & Ciano nórdico com fundo abissal.',
      accentColor: '#00F5A0',
      secColor: '#22D3EE',
      bgColor: '#020B0A',
    },
    {
      id: 'void',
      name: 'VOID',
      desc: 'Preto puro absoluto, acentos cinza platina & iluminação discreta.',
      accentColor: '#E2E8F0',
      secColor: '#64748B',
      bgColor: '#000000',
    },
    {
      id: 'violet',
      name: 'VIOLET',
      desc: 'Violeta cósmico futurista & Sky blue de alta tecnologia.',
      accentColor: '#8B5CF6',
      secColor: '#38BDF8',
      bgColor: '#050816',
    },
    {
      id: 'light-space',
      name: 'LIGHT SPACE',
      desc: 'Superfície clara minimalista, vidros translúcidos & azul tecnológico.',
      accentColor: '#0284C7',
      secColor: '#2563EB',
      bgColor: '#F1F5F9',
    },
  ];

  const handleSelectWallpaper = (wpId: SpaceWallpaperId) => {
    try { soundFx.playFanfare(); } catch (e) {}
    onSelectWallpaper(wpId);
  };

  const handleSelectTheme = (tId: SpaceThemeId) => {
    try { soundFx.playFanfare(); } catch (e) {}
    onSelectTheme(tId);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans text-slate-100 select-none animate-fadeIn pb-4">
      {/* Top Futuristic Header */}
      <div className="p-5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-mono text-white tracking-wide">
              PERSONALIZAÇÃO DO SPACE 2026
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Controle global de wallpapers, paletas cromáticas e efeitos visuais
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-mono">
          <button
            onClick={() => {
              try { soundFx.playClick(); } catch (e) {}
              setActiveTab('wallpapers');
            }}
            className={`px-3 py-1.5 rounded-lg transition font-bold cursor-pointer ${
              activeTab === 'wallpapers'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            WALLPAPERS
          </button>
          <button
            onClick={() => {
              try { soundFx.playClick(); } catch (e) {}
              setActiveTab('themes');
            }}
            className={`px-3 py-1.5 rounded-lg transition font-bold cursor-pointer ${
              activeTab === 'themes'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            TEMAS
          </button>
          <button
            onClick={() => {
              try { soundFx.playClick(); } catch (e) {}
              setActiveTab('effects');
            }}
            className={`px-3 py-1.5 rounded-lg transition font-bold cursor-pointer ${
              activeTab === 'effects'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            EFEITOS
          </button>
          <button
            onClick={() => {
              try { soundFx.playClick(); } catch (e) {}
              setActiveTab('mbot');
            }}
            className={`px-3 py-1.5 rounded-lg transition font-bold cursor-pointer ${
              activeTab === 'mbot'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            M-BOT
          </button>
        </div>
      </div>

      {/* TAB 1: WALLPAPERS */}
      {activeTab === 'wallpapers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
            <span>SELECIONE UM WALLPAPER (RENDERIZAÇÃO NATIVA EM TEMPO REAL)</span>
            <span className="text-cyan-400">Ativo: {currentWallpaper.toUpperCase()}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wallpapers.map((wp) => {
              const isSelected = currentWallpaper === wp.id;
              return (
                <button
                  key={wp.id}
                  onClick={() => handleSelectWallpaper(wp.id)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 group relative overflow-hidden ${
                    isSelected
                      ? 'bg-blue-950/40 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)]'
                      : 'bg-black/40 hover:bg-slate-900/60 border-white/10 hover:border-cyan-500/40'
                  }`}
                >
                  {/* Visual Preview Box */}
                  <div className={`h-24 w-full rounded-xl bg-gradient-to-tr ${wp.previewGrad} border border-white/10 relative overflow-hidden flex items-center justify-center p-3`}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_70%)]" />
                    
                    {/* Simulated Text "Mateus Araujo" in preview */}
                    <div className="text-center">
                      <span className="text-xs font-mono font-bold tracking-widest text-white/90 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                        Mateus Araujo
                      </span>
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-cyan-500 text-slate-950 font-mono font-bold text-[10px] flex items-center gap-1 shadow-md">
                        <Check className="w-3 h-3" />
                        <span>ATIVO</span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-mono font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                        {wp.title}
                      </h3>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300 border border-white/5">
                        {wp.tag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {wp.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: TEMAS */}
      {activeTab === 'themes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
            <span>PALETAS CROMÁTICAS GLOBAIS DO SISTEMA</span>
            <span className="text-cyan-400">Ativo: {currentTheme.toUpperCase()}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {themes.map((t) => {
              const isSelected = currentTheme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleSelectTheme(t.id)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 group relative ${
                    isSelected
                      ? 'bg-blue-950/40 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)]'
                      : 'bg-black/40 hover:bg-slate-900/60 border-white/10 hover:border-cyan-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Palette Swatches */}
                      <div className="flex -space-x-1.5">
                        <div
                          className="w-6 h-6 rounded-full border border-white/20 shadow-md"
                          style={{ backgroundColor: t.accentColor }}
                        />
                        <div
                          className="w-6 h-6 rounded-full border border-white/20 shadow-md"
                          style={{ backgroundColor: t.secColor }}
                        />
                        <div
                          className="w-6 h-6 rounded-full border border-white/20 shadow-md"
                          style={{ backgroundColor: t.bgColor }}
                        />
                      </div>
                      <h3 className="font-mono font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                        {t.name}
                      </h3>
                    </div>

                    {isSelected && (
                      <div className="px-2 py-0.5 rounded-md bg-cyan-500 text-slate-950 font-mono font-bold text-[10px] flex items-center gap-1 shadow-md">
                        <Check className="w-3 h-3" />
                        <span>ATIVO</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-400">
                    {t.desc}
                  </p>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>Accent: {t.accentColor}</span>
                    <span>Background: {t.bgColor}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: EFEITOS DO WALLPAPER */}
      {activeTab === 'effects' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-mono font-bold text-base text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  <span>EFEITOS DO WALLPAPER & PARTÍCULAS</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  Controla a rotação lenta de estrelas, poeira digital estelar, ondas de nebulosa e interação magnética suave com o cursor.
                </p>
              </div>

              {/* Toggle Switch */}
              <div className="flex items-center gap-3">
                <span className={`text-xs font-mono font-bold ${effectsEnabled ? 'text-cyan-400' : 'text-slate-500'}`}>
                  {effectsEnabled ? 'EFEITOS: ON' : 'EFEITOS: OFF'}
                </span>
                <button
                  onClick={() => {
                    try { soundFx.playClick(); } catch (e) {}
                    onToggleEffects(!effectsEnabled);
                  }}
                  className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 cursor-pointer flex items-center ${
                    effectsEnabled ? 'bg-cyan-500 justify-end shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-slate-800 justify-start'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-white shadow-md" />
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2 text-slate-300">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="font-bold">Diretrizes de Desempenho & Acessibilidade:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
                <li>Quando desativado, mantém o papel de parede e as partículas praticamente estáticos com baixo consumo de CPU.</li>
                <li>Respeita automaticamente as configurações de sistema para redução de movimento (<code className="text-cyan-300">prefers-reduced-motion</code>).</li>
                <li>Todas as preferências são salvas localmente e persistidas entre sessões.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: M-BOT COMPANION (SPACE 2026 EDITION) */}
      {activeTab === 'mbot' && (
        <div className="space-y-4">
          {/* M-BOT 26 Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950/60 border border-cyan-500/40 backdrop-blur-xl flex flex-col sm:flex-row items-center sm:items-start gap-5 shadow-2xl">
            {/* Robot 26 Preview Box */}
            <div className="w-20 h-20 rounded-2xl bg-slate-950 border border-cyan-400/50 p-1 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)] shrink-0">
              <svg viewBox="0 0 100 110" className="w-16 h-16">
                <rect x="24" y="48" width="52" height="38" rx="8" fill="#1e293b" stroke="#06b6d4" strokeWidth="1.5" />
                <rect x="29" y="53" width="42" height="28" rx="5" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                <rect x="36" y="66" width="28" height="11" rx="3" fill="#020617" stroke="#06b6d4" strokeWidth="0.8" />
                <text x="50" y="74.5" textAnchor="middle" fontSize="7" fontWeight="900" fontFamily="monospace" fill="#06b6d4">M•26</text>
                <circle cx="66" cy="58" r="2" fill="#06b6d4" />
                <rect x="46" y="38" width="8" height="12" rx="3" fill="#334155" stroke="#475569" strokeWidth="1" />
                {/* Eyes: Fundo Branco Puro, Pupila Preta, Brilho Branco */}
                <ellipse cx="34" cy="26" rx="14" ry="13" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
                <ellipse cx="34" cy="26" rx="11" ry="10" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
                <circle cx="34" cy="26" r="6" fill="#000000" />
                <circle cx="32" cy="23.5" r="2.2" fill="#ffffff" />
                <circle cx="36.5" cy="28.5" r="1.1" fill="#ffffff" />
                <ellipse cx="66" cy="26" rx="14" ry="13" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
                <ellipse cx="66" cy="26" rx="11" ry="10" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
                <circle cx="66" cy="26" r="6" fill="#000000" />
                <circle cx="64" cy="23.5" r="2.2" fill="#ffffff" />
                <circle cx="68.5" cy="28.5" r="1.1" fill="#ffffff" />
                {/* Treads */}
                <path d="M 12 98 L 22 75 L 34 75 L 42 98 Z" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.2" />
                <path d="M 58 98 L 66 75 L 78 75 L 88 98 Z" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.2" />
              </svg>
            </div>

            <div className="space-y-1.5 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h3 className="font-mono font-bold text-base text-white">M-BOT 26 // SPACE COMPANION</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold">
                  QUANTUM EVOLUTION
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono leading-relaxed">
                Versão moderna de 2026 do robô explorador. Acabamento em metal grafite, iluminação LED adaptativa vinculada ao tema do sistema e locomoção por micro-propulsão magnética.
              </p>
            </div>
          </div>

          {/* Space Controls */}
          <div className="p-6 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl space-y-4">
            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-white/5">
              <div className="space-y-1">
                <div className="font-mono font-bold text-sm text-white flex items-center gap-2">
                  <Bot className="w-4 h-4 text-cyan-400" />
                  <span>Exibir M-BOT no Desktop Space</span>
                </div>
                <div className="text-xs font-mono text-slate-400">Ativa ou desativa a presença autônoma do robô</div>
              </div>
              <button
                onClick={() => {
                  try { soundFx.playClick(); } catch (e) {}
                  handleUpdateMBot({ enabled: !mBotEnabled });
                }}
                className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 cursor-pointer flex items-center ${
                  mBotEnabled ? 'bg-cyan-500 justify-end shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-slate-800 justify-start'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {/* Behavior: Roam vs Stay */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-white/5 gap-3">
              <div className="space-y-1">
                <div className="font-mono font-bold text-sm text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span>Modo de Operação</span>
                </div>
                <div className="text-xs font-mono text-slate-400">Passeio livre pelo espaço ou repouso em coordenadas fixas</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    try { soundFx.playClick(); } catch (e) {}
                    handleUpdateMBot({ behavior: 'roam' });
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition ${
                    mBotBehavior === 'roam'
                      ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                      : 'bg-slate-800 text-slate-400 hover:text-white border border-white/10'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Passear</span>
                </button>
                <button
                  onClick={() => {
                    try { soundFx.playClick(); } catch (e) {}
                    handleUpdateMBot({ behavior: 'stay' });
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition ${
                    mBotBehavior === 'stay'
                      ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                      : 'bg-slate-800 text-slate-400 hover:text-white border border-white/10'
                  }`}
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Ficar Parado</span>
                </button>
              </div>
            </div>

            {/* Cursor Tracking Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-white/5">
              <div className="space-y-1">
                <div className="font-mono font-bold text-sm text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>Rastreamento do Cursor</span>
                </div>
                <div className="text-xs font-mono text-slate-400">Olhos quânticos acompanham o ponteiro quando próximo</div>
              </div>
              <button
                onClick={() => {
                  try { soundFx.playClick(); } catch (e) {}
                  handleUpdateMBot({ cursor: !mBotCursor });
                }}
                className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 cursor-pointer flex items-center ${
                  mBotCursor ? 'bg-cyan-500 justify-end shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-slate-800 justify-start'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {/* Sound Effects Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-white/5">
              <div className="space-y-1">
                <div className="font-mono font-bold text-sm text-white flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  <span>Sons Sintetizados</span>
                </div>
                <div className="text-xs font-mono text-slate-400">Bips e feedback em áudio sintetizado em tempo real</div>
              </div>
              <button
                onClick={() => {
                  try { soundFx.playClick(); } catch (e) {}
                  handleUpdateMBot({ sound: !mBotSound });
                }}
                className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 cursor-pointer flex items-center ${
                  mBotSound ? 'bg-cyan-500 justify-end shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-slate-800 justify-start'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-white shadow-md" />
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2 text-slate-300">
              <Smile className="w-4 h-4 text-cyan-400" />
              <span className="font-bold">Interações Disponíveis no Space:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
              <li>Clique no robô para cumprimentá-lo com aceno e bips.</li>
              <li>Arraste e solte para posicioná-lo no local ideal do seu setup.</li>
              <li>Clique com botão direito ou toque longo para abrir o menu do M-BOT.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
