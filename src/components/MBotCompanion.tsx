import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Rocket,
  Lightbulb,
  ChevronRight,
  RotateCcw,
  Bot
} from 'lucide-react';
import { soundFx } from '../utils/soundEffects';
import { SpaceThemeId } from '../types';
import { DID_YOU_KNOW_FACTS } from '../data/portfolioData';

export interface MBotConfig {
  enabled: boolean;
  cursorInteraction: boolean;
  sound: boolean;
}

interface MBotCompanionProps {
  mode: 'retro' | 'space';
  spaceTheme?: SpaceThemeId;
  onOpenSettings?: () => void;
  onLaunchTimeTravel?: (direction?: 'forward' | 'backward') => void;
  isTraveling?: boolean;
}

// Bot State Machine Types
type BotState =
  | 'idle'
  | 'showing_fact'
  | 'menu_open'
  | 'pointing_travel'
  | 'moving_to_travel'
  | 'entering_vortex'
  | 'reconstructing';

export const MBotCompanion: React.FC<MBotCompanionProps> = ({
  mode = 'retro',
  spaceTheme = 'space-blue',
  onLaunchTimeTravel,
  isTraveling = false,
}) => {
  // Load configuration from localStorage
  const [config, setConfig] = useState<MBotConfig>(() => {
    if (typeof window === 'undefined') {
      return { enabled: true, cursorInteraction: true, sound: true };
    }
    try {
      const enabled = localStorage.getItem('mBotEnabled') !== 'false';
      const cursorInteraction = localStorage.getItem('mBotCursorInteraction') !== 'false';
      const sound = localStorage.getItem('mBotSound') !== 'false';
      return { enabled, cursorInteraction, sound };
    } catch (e) {
      return { enabled: true, cursorInteraction: true, sound: true };
    }
  });

  // State Machine
  const [botState, setBotState] = useState<BotState>('reconstructing');
  const [eyeOffset, setEyeOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [headAngle, setHeadAngle] = useState<number>(0);
  const [antennaGlowing, setAntennaGlowing] = useState<boolean>(false);
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [speechBubbleText, setSpeechBubbleText] = useState<string | null>(null);
  const [reconstructionScale, setReconstructionScale] = useState<number>(0.2);
  const [reconstructionOpacity, setReconstructionOpacity] = useState<number>(0.2);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Time Travel Dynamic Flight Coordinates (used ONLY during travel animation)
  const [flightPos, setFlightPos] = useState<{ x: number; y: number } | null>(null);

  // "Você Sabia?" Curiosidades Index & History
  const [currentFactIndex, setCurrentFactIndex] = useState<number>(() => {
    try {
      const saved = sessionStorage.getItem('mbot_last_fact_index');
      return saved ? parseInt(saved, 10) % DID_YOU_KNOW_FACTS.length : 0;
    } catch (e) {
      return 0;
    }
  });

  const mousePosRef = useRef<{ x: number; y: number }>({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 300,
  });

  const botElementRef = useRef<HTMLDivElement | null>(null);
  const autoFactTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hideFactTimerRef = useRef<NodeJS.Timeout | null>(null);
  const flightAnimRef = useRef<number | null>(null);

  // Sound effects helper
  const playChirp = useCallback(() => {
    if (config.sound) {
      try {
        soundFx.playMBotChirp();
      } catch (e) {}
    }
  }, [config.sound]);

  // Update configuration helper
  const updateConfig = (newConfig: Partial<MBotConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      try {
        if (newConfig.enabled !== undefined) {
          localStorage.setItem('mBotEnabled', String(updated.enabled));
          window.dispatchEvent(new CustomEvent('mbot-status-changed', { detail: { enabled: updated.enabled } }));
        }
        if (newConfig.cursorInteraction !== undefined) {
          localStorage.setItem('mBotCursorInteraction', String(updated.cursorInteraction));
        }
        if (newConfig.sound !== undefined) {
          localStorage.setItem('mBotSound', String(updated.sound));
        }
      } catch (e) {}
      return updated;
    });
  };

  // Listen to external toggle events
  useEffect(() => {
    const handleStatusChanged = (e: CustomEvent) => {
      if (e.detail && typeof e.detail.enabled === 'boolean') {
        setConfig((prev) => ({ ...prev, enabled: e.detail.enabled }));
      }
    };
    window.addEventListener('mbot-status-changed', handleStatusChanged as EventListener);
    return () => window.removeEventListener('mbot-status-changed', handleStatusChanged as EventListener);
  }, []);

  // =========================================================================
  // 1. RECONSTRUCTION ENTRANCE ON LOAD / MODE SWITCH
  // =========================================================================
  useEffect(() => {
    setBotState('reconstructing');
    setReconstructionScale(0.1);
    setReconstructionOpacity(0.1);
    setAntennaGlowing(true);
    setFlightPos(null);

    const step1 = setTimeout(() => {
      setReconstructionScale(0.85);
      setReconstructionOpacity(0.9);
      playChirp();
    }, 180);

    const step2 = setTimeout(() => {
      setReconstructionScale(1.0);
      setReconstructionOpacity(1.0);
      setAntennaGlowing(false);
      setBotState('idle');
    }, 480);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
    };
  }, [mode, playChirp]);

  // =========================================================================
  // 2. NATURAL EYE BLINKING
  // =========================================================================
  useEffect(() => {
    if (!config.enabled) return;

    const blinkInterval = setInterval(() => {
      if (botState === 'idle' || botState === 'showing_fact' || botState === 'menu_open') {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 140);
        if (Math.random() < 0.25) {
          setTimeout(() => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 120);
          }, 240);
        }
      }
    }, 3200 + Math.random() * 3200);

    return () => clearInterval(blinkInterval);
  }, [config.enabled, botState]);

  // =========================================================================
  // 3. CURSOR GAZE TRACKING (PUPILS & SUBTLE HEAD TILT)
  // =========================================================================
  const updateGaze = useCallback((mouseX: number, mouseY: number) => {
    if (botState === 'moving_to_travel' || botState === 'entering_vortex') return;

    if (!botElementRef.current) return;
    const rect = botElementRef.current.getBoundingClientRect();
    const botCenterX = rect.left + rect.width / 2;
    const botCenterY = rect.top + rect.height / 2;

    const dx = mouseX - botCenterX;
    const dy = mouseY - botCenterY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 2) {
      setEyeOffset({ x: 0, y: 0 });
      return;
    }

    // Maximum pupil displacement in SVG coordinate units
    const maxOffsetX = 5.0;
    const maxOffsetY = 4.0;

    const normX = dx / dist;
    const normY = dy / dist;

    // Smooth response curve up to ~450px distance
    const strength = Math.min(1, Math.max(0.15, dist / 90));

    // When positioned in top-right, looking left means negative dx
    const ex = normX * maxOffsetX * strength;
    const ey = normY * maxOffsetY * strength;

    setEyeOffset({ x: ex, y: ey });

    // Subtle head tilt following the cursor
    const rawAngle = (dx / (typeof window !== 'undefined' ? window.innerWidth : 1200)) * 14;
    const clampedAngle = Math.max(-8, Math.min(8, rawAngle));
    setHeadAngle(clampedAngle);

    // Antenna lights up when cursor is very close (<120px)
    if (dist < 120) {
      setAntennaGlowing(true);
    } else if (botState !== 'pointing_travel') {
      setAntennaGlowing(false);
    }
  }, [botState]);

  useEffect(() => {
    if (!config.enabled || !config.cursorInteraction) return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
      updateGaze(e.clientX, e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [config.enabled, config.cursorInteraction, updateGaze]);

  // =========================================================================
  // 4. "VOCÊ SABIA?" AUTOMATIC FACT ROTATION SCHEDULE (NON-INTRUSIVE)
  // =========================================================================
  const showNextFact = useCallback((manual = false) => {
    setCurrentFactIndex((prevIndex) => {
      const nextIndex = (prevIndex + 1) % DID_YOU_KNOW_FACTS.length;
      try {
        sessionStorage.setItem('mbot_last_fact_index', String(nextIndex));
      } catch (e) {}
      return nextIndex;
    });

    setBotState('showing_fact');
    playChirp();

    // Auto close fact after 8.5 seconds if not manually interacted with
    if (hideFactTimerRef.current) clearTimeout(hideFactTimerRef.current);
    hideFactTimerRef.current = setTimeout(() => {
      setBotState((current) => (current === 'showing_fact' ? 'idle' : current));
    }, 8500);
  }, [playChirp]);

  // Listen to external commands to show a fact or toggle bot
  useEffect(() => {
    const handleShowFact = () => {
      showNextFact(true);
    };
    const handleToggle = () => {
      updateConfig({ enabled: !config.enabled });
    };

    window.addEventListener('mbot-show-fact', handleShowFact);
    window.addEventListener('mbot-toggle', handleToggle);
    return () => {
      window.removeEventListener('mbot-show-fact', handleShowFact);
      window.removeEventListener('mbot-toggle', handleToggle);
    };
  }, [config.enabled, showNextFact]);

  useEffect(() => {
    if (!config.enabled) return;

    // Check how many automatic displays occurred this session (limit to 3 to prevent fatigue)
    let autoCount = 0;
    try {
      autoCount = parseInt(sessionStorage.getItem('mbot_auto_fact_count') || '0', 10);
    } catch (e) {}

    if (autoCount >= 3) return;

    // First appearance after 12 seconds
    const initialDelay = autoCount === 0 ? 12000 : 26000;

    autoFactTimerRef.current = setTimeout(() => {
      if (botState === 'idle') {
        try {
          sessionStorage.setItem('mbot_auto_fact_count', String(autoCount + 1));
        } catch (e) {}
        showNextFact(false);
      }
    }, initialDelay);

    return () => {
      if (autoFactTimerRef.current) clearTimeout(autoFactTimerRef.current);
      if (hideFactTimerRef.current) clearTimeout(hideFactTimerRef.current);
    };
  }, [config.enabled, botState, showNextFact]);

  // =========================================================================
  // 5. INTERACTIVE CLICK ON M-BOT -> OPEN INTERACTION MENU
  // =========================================================================
  const handleBotClick = () => {
    if (botState === 'moving_to_travel' || botState === 'entering_vortex') return;

    if (hideFactTimerRef.current) clearTimeout(hideFactTimerRef.current);

    if (botState === 'menu_open') {
      setBotState('idle');
      return;
    }

    try {
      soundFx.playMBotCurious();
    } catch (e) {}

    setBotState('menu_open');
  };

  // =========================================================================
  // 6. TIME TRAVEL GUIDANCE FLOW (POINT -> DEPART FROM CORNER -> VORTEX)
  // =========================================================================
  const handleInitiateTravel = () => {
    setBotState('pointing_travel');
    setAntennaGlowing(true);

    try {
      if (mode === 'retro') {
        soundFx.playFanfare();
      } else {
        soundFx.playTimeTravelWarp();
      }
    } catch (e) {}

    setSpeechBubbleText(
      mode === 'retro'
        ? '🚀 Me siga até o portal!'
        : '🌀 Iniciando dobra temporal...'
    );

    // After brief pointing indication, bot takes off towards center
    setTimeout(() => {
      setSpeechBubbleText(null);
      setBotState('moving_to_travel');

      const startX = typeof window !== 'undefined' ? window.innerWidth - 110 : 800;
      const startY = 24;
      const targetX = (typeof window !== 'undefined' ? window.innerWidth / 2 : 500) - 44;
      const targetY = (typeof window !== 'undefined' ? window.innerHeight / 2 : 350) - 48;

      setFlightPos({ x: startX, y: startY });

      const startTime = performance.now();
      const durationMs = 850;

      const animateFlight = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / durationMs);

        // Ease-in-out curve
        const ease = progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress;

        const currentX = startX + (targetX - startX) * ease;
        const currentY = startY + (targetY - startY) * ease;

        setFlightPos({ x: currentX, y: currentY });

        if (progress < 1) {
          flightAnimRef.current = requestAnimationFrame(animateFlight);
        } else {
          // Arrived at portal vortex center -> Shrink into portal hole
          setBotState('entering_vortex');
          setReconstructionScale(0.05);
          setReconstructionOpacity(0);

          setTimeout(() => {
            if (onLaunchTimeTravel) {
              onLaunchTimeTravel(mode === 'retro' ? 'forward' : 'backward');
            }
          }, 600);
        }
      };

      flightAnimRef.current = requestAnimationFrame(animateFlight);
    }, 650);
  };

  // Close fact bubble or interaction menu
  const handleCloseOverlay = () => {
    if (hideFactTimerRef.current) clearTimeout(hideFactTimerRef.current);
    setBotState('idle');
  };

  if (!config.enabled || isTraveling) {
    return null;
  }

  // Theme color accents for Space 2026 mode
  const spaceThemeConfig = {
    'space-blue': { led: '#22d3ee', glow: 'rgba(6, 182, 212, 0.45)', accent: '#0284c7' },
    'cyber-neon': { led: '#34d399', glow: 'rgba(52, 211, 153, 0.45)', accent: '#059669' },
    'retro-amber': { led: '#fbbf24', glow: 'rgba(251, 191, 36, 0.45)', accent: '#d97706' },
    'deep-void': { led: '#a855f7', glow: 'rgba(168, 85, 247, 0.45)', accent: '#7c3aed' },
  };
  const spaceStyles = spaceThemeConfig[spaceTheme] || spaceThemeConfig['space-blue'];

  const currentFact = DID_YOU_KNOW_FACTS[currentFactIndex] || DID_YOU_KNOW_FACTS[0];

  const isFlying = botState === 'moving_to_travel' || botState === 'entering_vortex';

  return (
    <>
      {/* =========================================================
          M-BOT FIXED TOP-RIGHT CONTAINER (Z-INDEX 20)
          Layer Hierarchy:
          Wallpaper -> Icons -> M-BOT (z-20) -> Windows (z-30+) -> Menus (z-50)
         ========================================================= */}
      <div
        style={
          isFlying && flightPos
            ? {
                position: 'fixed',
                left: `${flightPos.x}px`,
                top: `${flightPos.y}px`,
                zIndex: 45,
                transform: `scale(${reconstructionScale}) rotate(${botState === 'entering_vortex' ? '180deg' : '0deg'})`,
                opacity: reconstructionOpacity,
                transition: botState === 'entering_vortex' ? 'transform 0.5s ease-in, opacity 0.5s ease-in' : 'none',
              }
            : {
                position: 'fixed',
                top: 'max(16px, env(safe-area-inset-top, 16px))',
                right: 'max(16px, env(safe-area-inset-right, 16px))',
                zIndex: 20,
                transform: `scale(${reconstructionScale})`,
                opacity: reconstructionOpacity,
                transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease',
              }
        }
        className="pointer-events-none select-none flex flex-col items-end"
      >
        {/* =========================================================
            SPEECH BALLOON: "VOCÊ SABIA?" (DICAS & CURIOSIDADES)
           ========================================================= */}
        {botState === 'showing_fact' && !isFlying && (
          <div
            className={`pointer-events-auto absolute top-1 right-[calc(100%+14px)] w-[250px] sm:w-[280px] max-w-[75vw] p-3 shadow-2xl animate-fadeIn ${
              mode === 'retro'
                ? 'bg-[#ffffd8] text-slate-900 border-2 border-black font-sans shadow-[4px_4px_0px_rgba(0,0,0,0.45)]'
                : 'bg-slate-950/95 text-slate-100 border border-cyan-400/50 rounded-2xl font-mono backdrop-blur-xl shadow-[0_0_25px_rgba(6,182,212,0.3)]'
            }`}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between font-bold text-xs pb-1.5 mb-2 border-b ${
                mode === 'retro'
                  ? 'border-slate-400 text-blue-900'
                  : 'border-white/10 text-cyan-300'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Lightbulb className={`w-3.5 h-3.5 ${mode === 'retro' ? 'text-amber-600' : 'text-amber-400'}`} />
                <span className="tracking-wide">VOCÊ SABIA?</span>
              </div>
              <button
                onClick={handleCloseOverlay}
                className="text-slate-500 hover:text-red-500 p-0.5 cursor-pointer transition"
                title="Fechar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Fact Title & Description */}
            {currentFact.title && (
              <div className={`font-bold text-[11px] mb-1 ${mode === 'retro' ? 'text-blue-950' : 'text-cyan-200'}`}>
                {currentFact.title}
              </div>
            )}
            <p className="text-[11px] leading-relaxed mb-3">
              {currentFact.fact}
            </p>

            {/* Footer Navigation */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-300/40 text-[10px]">
              <span className="opacity-60 font-mono">
                {currentFactIndex + 1} / {DID_YOU_KNOW_FACTS.length}
              </span>
              <button
                onClick={() => showNextFact(true)}
                className={`flex items-center gap-1 px-2 py-1 rounded font-bold cursor-pointer transition active:scale-95 ${
                  mode === 'retro'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-400 shadow-xs'
                    : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40'
                }`}
              >
                <span>Outra</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Pointer Tail pointing right to M-BOT */}
            <div
              className={`absolute top-6 -right-2 w-0 h-0 border-y-6 border-y-transparent border-l-8 ${
                mode === 'retro' ? 'border-l-black' : 'border-l-cyan-400'
              }`}
            />
          </div>
        )}

        {/* =========================================================
            INTERACTION MENU (CLIQUE NO M-BOT)
           ========================================================= */}
        {botState === 'menu_open' && !isFlying && (
          <div
            className={`pointer-events-auto absolute top-1 right-[calc(100%+14px)] w-[240px] sm:w-[260px] max-w-[75vw] p-3 shadow-2xl animate-fadeIn ${
              mode === 'retro'
                ? 'bg-[#ece9d8] text-slate-900 border-2 border-white border-r-slate-800 border-b-slate-800 font-sans shadow-[4px_4px_0px_rgba(0,0,0,0.5)]'
                : 'bg-slate-950/95 text-slate-100 border border-cyan-400/50 rounded-2xl font-mono backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.35)]'
            }`}
          >
            {/* Menu Header */}
            <div
              className={`flex items-center justify-between font-bold text-xs pb-1.5 mb-2 border-b ${
                mode === 'retro'
                  ? 'border-slate-400 text-blue-900'
                  : 'border-white/10 text-cyan-300'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Bot className="w-4 h-4" />
                <span>{mode === 'retro' ? 'M-BOT 00' : 'M-BOT 26'}</span>
              </div>
              <button
                onClick={handleCloseOverlay}
                className="text-slate-500 hover:text-red-500 p-0.5 cursor-pointer transition"
                title="Fechar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Question Greeting */}
            <p className="text-xs mb-3 font-medium">
              {mode === 'retro'
                ? 'Quer conhecer o futuro?'
                : 'Quer voltar aos anos 2000?'}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-1.5">
              <button
                onClick={handleInitiateTravel}
                className={`w-full py-2 px-3 rounded text-xs font-bold flex items-center justify-center gap-2 transition transform active:scale-95 cursor-pointer shadow-md ${
                  mode === 'retro'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-400 shadow-[1px_1px_0px_#000]'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 border border-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.7)]'
                }`}
              >
                {mode === 'retro' ? (
                  <>
                    <Rocket className="w-3.5 h-3.5" />
                    <span>IR PARA O SPACE</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>VOLTAR PARA 2000</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  showNextFact(true);
                }}
                className={`w-full py-1.5 px-3 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  mode === 'retro'
                    ? 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-400 shadow-xs'
                    : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-white/10'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>VOCÊ SABIA?</span>
              </button>

              <button
                onClick={handleCloseOverlay}
                className={`w-full py-1 px-3 rounded text-[11px] transition text-center opacity-70 hover:opacity-100 cursor-pointer ${
                  mode === 'retro' ? 'text-slate-700 hover:bg-slate-200' : 'text-slate-400 hover:bg-white/5'
                }`}
              >
                FECHAR
              </button>
            </div>

            {/* Pointer Tail */}
            <div
              className={`absolute top-6 -right-2 w-0 h-0 border-y-6 border-y-transparent border-l-8 ${
                mode === 'retro' ? 'border-l-slate-400' : 'border-l-cyan-400'
              }`}
            />
          </div>
        )}

        {/* =========================================================
            BRIEF POINTING SPEECH BUBBLE (TRAVELING)
           ========================================================= */}
        {speechBubbleText && (
          <div
            className={`pointer-events-auto absolute top-2 right-[calc(100%+12px)] whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold shadow-xl animate-bounce ${
              mode === 'retro'
                ? 'bg-blue-600 text-white border-2 border-white'
                : 'bg-cyan-500 text-slate-950 border border-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.8)]'
            }`}
          >
            {speechBubbleText}
          </div>
        )}

        {/* =========================================================
            FIXED CHARACTER BOT BUTTON (~64-96px)
           ========================================================= */}
        <div
          ref={botElementRef}
          onClick={handleBotClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`pointer-events-auto cursor-pointer relative flex flex-col items-center justify-center p-1 rounded-2xl transition-transform duration-200 ${
            isHovered ? 'scale-108' : 'scale-100'
          }`}
          title={
            mode === 'retro'
              ? 'M-BOT 00 • Clique para interagir ou viajar para 2026'
              : 'M-BOT 26 • Clique para interagir ou voltar ao OS 00'
          }
        >
          {/* Subtle Glow Ring in Space Mode */}
          {mode === 'space' && (
            <div
              className="absolute inset-0 rounded-full opacity-40 blur-lg pointer-events-none transition-opacity"
              style={{ background: spaceStyles.glow }}
            />
          )}

          {/* SVG Character Display */}
          <div className="relative w-[64px] h-[72px] sm:w-[76px] sm:h-[86px] md:w-[88px] md:h-[98px] flex flex-col items-center justify-end">
            {/* =========================================================
                M-BOT 00 (RETRO 2000 EDITION)
               ========================================================= */}
            {mode === 'retro' && (
              <svg
                viewBox="0 0 100 110"
                className="w-full h-full overflow-visible"
                style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))' }}
              >
                <defs>
                  <linearGradient id="retroMetalChassisFixed" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#94a3b8" />
                    <stop offset="50%" stopColor="#64748b" />
                    <stop offset="100%" stopColor="#475569" />
                  </linearGradient>
                  <linearGradient id="retroBluePlateFixed" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#1e3a8a" />
                  </linearGradient>
                  <linearGradient id="retroEyeGoggleFixed" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#cbd5e1" />
                    <stop offset="60%" stopColor="#64748b" />
                    <stop offset="100%" stopColor="#334155" />
                  </linearGradient>
                  <linearGradient id="retroTreadGradFixed" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="50%" stopColor="#334155" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>
                </defs>

                {/* Top Antenna */}
                <g
                  style={{
                    transformOrigin: '50px 20px',
                    transform: antennaGlowing ? 'rotate(12deg)' : 'none',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  <line x1="50" y1="18" x2="50" y2="5" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
                  <circle
                    cx="50"
                    cy="4"
                    r="4.2"
                    fill={antennaGlowing ? '#ef4444' : '#f59e0b'}
                    stroke="#000"
                    strokeWidth="1"
                    className={antennaGlowing ? 'animate-pulse' : ''}
                  />
                  {antennaGlowing && (
                    <circle cx="50" cy="4" r="7.5" fill="#ef4444" opacity="0.4" className="animate-ping" />
                  )}
                </g>

                {/* Left Arm */}
                <g
                  style={{
                    transformOrigin: '22px 56px',
                    transform: botState === 'pointing_travel' ? 'rotate(-75deg)' : isHovered ? 'rotate(-25deg)' : 'rotate(-5deg)',
                    transition: 'transform 0.3s ease',
                  }}
                >
                  <circle cx="22" cy="56" r="4.5" fill="#334155" stroke="#000" strokeWidth="1.2" />
                  <rect x="11" y="53" width="11" height="7" rx="2" fill="#64748b" stroke="#000" strokeWidth="1.2" />
                  <rect x="4" y="54" width="8" height="5" fill="#94a3b8" stroke="#000" strokeWidth="1" />
                  <path d="M 4 53 L 0 49 L 0 54 Z" fill="#475569" stroke="#000" strokeWidth="1" />
                  <path d="M 4 58 L 0 62 L 0 57 Z" fill="#475569" stroke="#000" strokeWidth="1" />
                </g>

                {/* Right Arm */}
                <g
                  style={{
                    transformOrigin: '78px 56px',
                    transform: isHovered ? 'rotate(25deg)' : 'rotate(5deg)',
                    transition: 'transform 0.3s ease',
                  }}
                >
                  <circle cx="78" cy="56" r="4.5" fill="#334155" stroke="#000" strokeWidth="1.2" />
                  <rect x="78" y="53" width="11" height="7" rx="2" fill="#64748b" stroke="#000" strokeWidth="1.2" />
                  <rect x="88" y="54" width="8" height="5" fill="#94a3b8" stroke="#000" strokeWidth="1" />
                  <path d="M 96 53 L 100 49 L 100 54 Z" fill="#475569" stroke="#000" strokeWidth="1" />
                  <path d="M 96 58 L 100 62 L 100 57 Z" fill="#475569" stroke="#000" strokeWidth="1" />
                </g>

                {/* Main Body Chassis */}
                <rect
                  x="24"
                  y="48"
                  width="52"
                  height="38"
                  rx="7"
                  fill="url(#retroMetalChassisFixed)"
                  stroke="#000"
                  strokeWidth="1.6"
                />
                <circle cx="28" cy="52" r="1.5" fill="#1e293b" />
                <circle cx="72" cy="52" r="1.5" fill="#1e293b" />
                <circle cx="28" cy="82" r="1.5" fill="#1e293b" />
                <circle cx="72" cy="82" r="1.5" fill="#1e293b" />

                {/* Front Plate */}
                <rect x="30" y="53" width="40" height="28" rx="4" fill="url(#retroBluePlateFixed)" stroke="#000" strokeWidth="1.2" />

                {/* Ventilation Slits */}
                <line x1="34" y1="58" x2="42" y2="58" stroke="#93c5fd" strokeWidth="1.2" />
                <line x1="34" y1="61" x2="42" y2="61" stroke="#93c5fd" strokeWidth="1.2" />

                {/* Status LEDs */}
                <circle cx="64" cy="58" r="2" fill="#22c55e" stroke="#000" strokeWidth="0.6" />
                <circle cx="59" cy="58" r="2" fill="#eab308" stroke="#000" strokeWidth="0.6" />

                {/* Mateus OS Emblem: "M" */}
                <rect x="41" y="65" width="18" height="12" rx="2" fill="#ffffff" stroke="#000" strokeWidth="1" />
                <text
                  x="50"
                  y="74.5"
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="900"
                  fontFamily="monospace"
                  fill="#1e3a8a"
                >
                  M
                </text>

                {/* Articulated Neck & Eyes */}
                <g
                  style={{
                    transformOrigin: '50px 48px',
                    transform: `rotate(${headAngle}deg)`,
                    transition: 'transform 0.25s ease-out',
                  }}
                >
                  <rect x="45" y="37" width="10" height="13" rx="2" fill="#334155" stroke="#000" strokeWidth="1.2" />
                  <circle cx="50" cy="40" r="4" fill="#64748b" stroke="#000" strokeWidth="1.2" />

                  {/* Left Eye: White Background + Black Pupil */}
                  <g>
                    <ellipse cx="33" cy="25" rx="15" ry="14" fill="url(#retroEyeGoggleFixed)" stroke="#000" strokeWidth="1.6" />
                    <ellipse cx="33" cy="25" rx="12" ry="11" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                    <g
                      style={{
                        transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
                        transition: 'transform 0.15s cubic-bezier(0.2, 0.9, 0.3, 1.2)',
                      }}
                    >
                      <circle cx="33" cy="25" r={isBlinking ? 1.8 : 6.8} fill="#000000" />
                      {!isBlinking && (
                        <>
                          <circle cx="31" cy="22.5" r="2.4" fill="#ffffff" />
                          <circle cx="35.5" cy="27.8" r="1.3" fill="#ffffff" />
                        </>
                      )}
                    </g>
                    {isBlinking && (
                      <line x1="21" y1="25" x2="45" y2="25" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
                    )}
                  </g>

                  {/* Right Eye: White Background + Black Pupil */}
                  <g>
                    <ellipse cx="67" cy="25" rx="15" ry="14" fill="url(#retroEyeGoggleFixed)" stroke="#000" strokeWidth="1.6" />
                    <ellipse cx="67" cy="25" rx="12" ry="11" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                    <g
                      style={{
                        transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
                        transition: 'transform 0.15s cubic-bezier(0.2, 0.9, 0.3, 1.2)',
                      }}
                    >
                      <circle cx="67" cy="25" r={isBlinking ? 1.8 : 6.8} fill="#000000" />
                      {!isBlinking && (
                        <>
                          <circle cx="65" cy="22.5" r="2.4" fill="#ffffff" />
                          <circle cx="69.5" cy="27.8" r="1.3" fill="#ffffff" />
                        </>
                      )}
                    </g>
                    {isBlinking && (
                      <line x1="55" y1="25" x2="79" y2="25" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
                    )}
                  </g>
                </g>

                {/* Base Treads */}
                <g>
                  <path d="M 12 98 L 22 75 L 34 75 L 42 98 Z" fill="url(#retroTreadGradFixed)" stroke="#000" strokeWidth="1.6" />
                  <circle cx="18" cy="93" r="4.2" fill="#475569" stroke="#000" strokeWidth="1" />
                  <circle cx="28" cy="81" r="3.4" fill="#475569" stroke="#000" strokeWidth="1" />
                  <circle cx="36" cy="93" r="4.2" fill="#475569" stroke="#000" strokeWidth="1" />
                  <line x1="12" y1="98" x2="42" y2="98" stroke="#0f172a" strokeWidth="3" />
                </g>

                <g>
                  <path d="M 58 98 L 66 75 L 78 75 L 88 98 Z" fill="url(#retroTreadGradFixed)" stroke="#000" strokeWidth="1.6" />
                  <circle cx="64" cy="93" r="4.2" fill="#475569" stroke="#000" strokeWidth="1" />
                  <circle cx="72" cy="81" r="3.4" fill="#475569" stroke="#000" strokeWidth="1" />
                  <circle cx="82" cy="93" r="4.2" fill="#475569" stroke="#000" strokeWidth="1" />
                  <line x1="58" y1="98" x2="88" y2="98" stroke="#0f172a" strokeWidth="3" />
                </g>
              </svg>
            )}

            {/* =========================================================
                M-BOT 26 (SPACE 2026 CYBERNETIC EDITION)
               ========================================================= */}
            {mode === 'space' && (
              <svg
                viewBox="0 0 100 110"
                className="w-full h-full overflow-visible"
                style={{ filter: `drop-shadow(0 0 10px ${spaceStyles.glow})` }}
              >
                <defs>
                  <linearGradient id="spaceDarkMetalFixed" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="50%" stopColor="#0f172a" />
                    <stop offset="100%" stopColor="#020617" />
                  </linearGradient>
                </defs>

                {/* Quantum Antenna */}
                <g
                  style={{
                    transformOrigin: '50px 20px',
                    transform: antennaGlowing ? 'rotate(12deg)' : 'none',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  <line x1="50" y1="18" x2="50" y2="5" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="50" cy="4" r="4.2" fill={spaceStyles.led} stroke="#0f172a" strokeWidth="1" />
                  <circle cx="50" cy="4" r="7.5" fill={spaceStyles.led} opacity="0.4" className="animate-pulse" />
                </g>

                {/* Left Cyber Arm */}
                <g
                  style={{
                    transformOrigin: '22px 56px',
                    transform: botState === 'pointing_travel' ? 'rotate(-75deg)' : isHovered ? 'rotate(-25deg)' : 'rotate(-5deg)',
                    transition: 'transform 0.3s ease',
                  }}
                >
                  <circle cx="22" cy="56" r="4.5" fill="#334155" stroke={spaceStyles.led} strokeWidth="1.2" />
                  <rect x="11" y="53" width="11" height="7" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="1.2" />
                  <rect x="4" y="54" width="8" height="5" fill={spaceStyles.accent} opacity="0.9" rx="1.5" />
                </g>

                {/* Right Cyber Arm */}
                <g
                  style={{
                    transformOrigin: '78px 56px',
                    transform: isHovered ? 'rotate(25deg)' : 'rotate(5deg)',
                    transition: 'transform 0.3s ease',
                  }}
                >
                  <circle cx="78" cy="56" r="4.5" fill="#334155" stroke={spaceStyles.led} strokeWidth="1.2" />
                  <rect x="78" y="53" width="11" height="7" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="1.2" />
                  <rect x="88" y="54" width="8" height="5" fill={spaceStyles.accent} opacity="0.9" rx="1.5" />
                </g>

                {/* Space Chassis */}
                <rect
                  x="24"
                  y="48"
                  width="52"
                  height="38"
                  rx="8"
                  fill="url(#spaceDarkMetalFixed)"
                  stroke={spaceStyles.led}
                  strokeWidth="1.5"
                />
                <rect x="29" y="53" width="42" height="28" rx="5" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />
                <line x1="33" y1="58" x2="45" y2="58" stroke={spaceStyles.led} strokeWidth="2" className="animate-pulse" />
                <circle cx="66" cy="58" r="2.2" fill={spaceStyles.led} />

                {/* Mateus OS Space Emblem: M•26 */}
                <rect x="35" y="65" width="30" height="12" rx="3" fill="#020617" stroke={spaceStyles.led} strokeWidth="1" />
                <text
                  x="50"
                  y="74"
                  textAnchor="middle"
                  fontSize="8"
                  fontWeight="900"
                  fontFamily="monospace"
                  fill={spaceStyles.led}
                  letterSpacing="1"
                >
                  M•26
                </text>

                {/* Cyber Neck & Eyes */}
                <g
                  style={{
                    transformOrigin: '50px 48px',
                    transform: `rotate(${headAngle}deg)`,
                    transition: 'transform 0.25s ease-out',
                  }}
                >
                  <rect x="45" y="37" width="10" height="13" rx="3" fill="#334155" stroke="#475569" strokeWidth="1.2" />
                  <circle cx="50" cy="40" r="4" fill="#0f172a" stroke={spaceStyles.led} strokeWidth="1.2" />

                  {/* Left Eye: Pure White Background + Black Pupil */}
                  <g>
                    <ellipse cx="33" cy="25" rx="15" ry="14" fill="#0f172a" stroke={spaceStyles.led} strokeWidth="1.6" />
                    <ellipse cx="33" cy="25" rx="12" ry="11" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                    <g
                      style={{
                        transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
                        transition: 'transform 0.15s cubic-bezier(0.2, 0.9, 0.3, 1.2)',
                      }}
                    >
                      <circle cx="33" cy="25" r={isBlinking ? 1.8 : 6.8} fill="#000000" />
                      {!isBlinking && (
                        <>
                          <circle cx="31" cy="22.5" r="2.4" fill="#ffffff" />
                          <circle cx="35.5" cy="27.8" r="1.3" fill="#ffffff" />
                        </>
                      )}
                    </g>
                    {isBlinking && (
                      <line x1="21" y1="25" x2="45" y2="25" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
                    )}
                  </g>

                  {/* Right Eye: Pure White Background + Black Pupil */}
                  <g>
                    <ellipse cx="67" cy="25" rx="15" ry="14" fill="#0f172a" stroke={spaceStyles.led} strokeWidth="1.6" />
                    <ellipse cx="67" cy="25" rx="12" ry="11" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                    <g
                      style={{
                        transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
                        transition: 'transform 0.15s cubic-bezier(0.2, 0.9, 0.3, 1.2)',
                      }}
                    >
                      <circle cx="67" cy="25" r={isBlinking ? 1.8 : 6.8} fill="#000000" />
                      {!isBlinking && (
                        <>
                          <circle cx="65" cy="22.5" r="2.4" fill="#ffffff" />
                          <circle cx="69.5" cy="27.8" r="1.3" fill="#ffffff" />
                        </>
                      )}
                    </g>
                    {isBlinking && (
                      <line x1="55" y1="25" x2="79" y2="25" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
                    )}
                  </g>
                </g>

                {/* Base Cyber Treads */}
                <g>
                  <path d="M 12 98 L 22 75 L 34 75 L 42 98 Z" fill="#0f172a" stroke={spaceStyles.led} strokeWidth="1.5" />
                  <circle cx="18" cy="93" r="4" fill="#1e293b" stroke={spaceStyles.led} strokeWidth="1" />
                  <circle cx="28" cy="81" r="3.2" fill="#1e293b" stroke={spaceStyles.led} strokeWidth="1" />
                  <circle cx="36" cy="93" r="4" fill="#1e293b" stroke={spaceStyles.led} strokeWidth="1" />
                  <line x1="12" y1="98" x2="42" y2="98" stroke={spaceStyles.led} strokeWidth="2.5" />
                </g>

                <g>
                  <path d="M 58 98 L 66 75 L 78 75 L 88 98 Z" fill="#0f172a" stroke={spaceStyles.led} strokeWidth="1.5" />
                  <circle cx="64" cy="93" r="4" fill="#1e293b" stroke={spaceStyles.led} strokeWidth="1" />
                  <circle cx="72" cy="81" r="3.2" fill="#1e293b" stroke={spaceStyles.led} strokeWidth="1" />
                  <circle cx="82" cy="93" r="4" fill="#1e293b" stroke={spaceStyles.led} strokeWidth="1" />
                  <line x1="58" y1="98" x2="88" y2="98" stroke={spaceStyles.led} strokeWidth="2.5" />
                </g>
              </svg>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
