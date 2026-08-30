import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Compass,
  X,
  Move,
  Rocket,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { soundFx } from '../utils/soundEffects';
import { SpaceThemeId } from '../types';

export interface MBotConfig {
  enabled: boolean;
  behavior: 'roam' | 'stay';
  cursorInteraction: boolean;
  sound: boolean;
  position?: { x: number; y: number };
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
  | 'walking'
  | 'inviting'
  | 'observing'
  | 'waving'
  | 'dragging'
  | 'traveling'
  | 'entering_vortex'
  | 'reconstructing';

// Dimensions and Screen Margins (Guaranteeing 100% visibility)
const BOT_BOUNDS = {
  width: 110,
  height: 125,
  padding: 16,
  bottomSafety: 65, // Safety margin above desktop taskbar
};

// Clamps (x, y) coordinates so M-BOT is always 100% visible inside the viewport
const clampToScreen = (x: number, y: number): { x: number; y: number } => {
  if (typeof window === 'undefined') return { x, y };
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;
  const minX = BOT_BOUNDS.padding;
  const maxX = Math.max(minX, screenW - BOT_BOUNDS.width - BOT_BOUNDS.padding);
  const minY = BOT_BOUNDS.padding;
  const maxY = Math.max(minY, screenH - BOT_BOUNDS.height - BOT_BOUNDS.bottomSafety);

  return {
    x: Math.max(minX, Math.min(maxX, x)),
    y: Math.max(minY, Math.min(maxY, y)),
  };
};

// Normalized Circuit Checkpoints across Desktop (fraction of screen width/height)
const PATROL_CIRCUIT_POINTS = [
  { xRatio: 0.82, yRatio: 0.72 }, // Bottom-Right
  { xRatio: 0.52, yRatio: 0.78 }, // Bottom-Center
  { xRatio: 0.16, yRatio: 0.65 }, // Bottom-Left
  { xRatio: 0.14, yRatio: 0.24 }, // Top-Left
  { xRatio: 0.48, yRatio: 0.16 }, // Top-Center
  { xRatio: 0.80, yRatio: 0.20 }, // Top-Right
  { xRatio: 0.62, yRatio: 0.48 }, // Center-Right
  { xRatio: 0.32, yRatio: 0.45 }, // Center-Left
];

export const MBotCompanion: React.FC<MBotCompanionProps> = ({
  mode = 'retro',
  spaceTheme = 'space-blue',
  onOpenSettings,
  onLaunchTimeTravel,
  isTraveling = false,
}) => {
  // Load configuration from localStorage
  const [config, setConfig] = useState<MBotConfig>(() => {
    if (typeof window === 'undefined') {
      return { enabled: true, behavior: 'roam', cursorInteraction: true, sound: false };
    }
    try {
      const enabled = localStorage.getItem('mBotEnabled') !== 'false';
      const behavior = (localStorage.getItem('mBotBehavior') as 'roam' | 'stay') || 'roam';
      const cursorInteraction = localStorage.getItem('mBotCursorInteraction') !== 'false';
      const sound = localStorage.getItem('mBotSound') === 'true';
      const posStr = localStorage.getItem('mBotPosition');
      const position = posStr ? JSON.parse(posStr) : undefined;
      return { enabled, behavior, cursorInteraction, sound, position };
    } catch (e) {
      return { enabled: true, behavior: 'roam', cursorInteraction: true, sound: false };
    }
  });

  // Current real position (always accurate, no delayed CSS jumps)
  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== 'undefined') {
      return clampToScreen(window.innerWidth - 240, window.innerHeight - 250);
    }
    return { x: 300, y: 300 };
  });

  // Bot State Machine
  const [botState, setBotState] = useState<BotState>('reconstructing');
  const [facing, setFacing] = useState<'left' | 'right'>('left');
  const [eyeOffset, setEyeOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [headAngle, setHeadAngle] = useState<number>(0);
  const [antennaGlowing, setAntennaGlowing] = useState<boolean>(false);
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [treadRolling, setTreadRolling] = useState<boolean>(true);
  const [isWaving, setIsWaving] = useState<boolean>(false);
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<{ x: number; y: number } | null>(null);
  const [showInvitation, setShowInvitation] = useState<boolean>(false);
  const [reconstructionScale, setReconstructionScale] = useState<number>(0.2);
  const [reconstructionOpacity, setReconstructionOpacity] = useState<number>(0.2);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isHolding, setIsHolding] = useState<boolean>(false);

  // Position and patrol refs for buttery-smooth RAF animation
  const posRef = useRef<{ x: number; y: number }>(pos);
  posRef.current = pos;

  const facingRef = useRef<'left' | 'right'>(facing);
  facingRef.current = facing;

  const mousePosRef = useRef<{ x: number; y: number }>({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 300,
  });

  const currentWaypointIndexRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Pointer Drag vs Click tracking refs
  const isPointerDownRef = useRef<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const pointerStartTimeRef = useRef<number>(0);
  const dragStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const botStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update configuration helper
  const updateConfig = (newConfig: Partial<MBotConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      try {
        if (newConfig.enabled !== undefined) {
          localStorage.setItem('mBotEnabled', String(updated.enabled));
          window.dispatchEvent(new CustomEvent('mbot-status-changed', { detail: { enabled: updated.enabled } }));
        }
        if (newConfig.behavior !== undefined) localStorage.setItem('mBotBehavior', updated.behavior);
        if (newConfig.cursorInteraction !== undefined) localStorage.setItem('mBotCursorInteraction', String(updated.cursorInteraction));
        if (newConfig.sound !== undefined) localStorage.setItem('mBotSound', String(updated.sound));
      } catch (e) {}
      return updated;
    });
  };

  // Sound effects helpers
  const playChirp = useCallback(() => {
    if (config.sound) {
      try {
        soundFx.playMBotChirp();
      } catch (e) {}
    }
  }, [config.sound]);

  // Show temporary speech balloon
  const showQuickSpeech = useCallback((text: string, durationMs = 2800) => {
    if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
    setSpeechBubble(text);
    speechTimeoutRef.current = setTimeout(() => {
      setSpeechBubble(null);
    }, durationMs);
  }, []);

  // Listen to window resize to ensure M-BOT stays 100% within screen
  useEffect(() => {
    const handleResize = () => {
      setPos((prev) => clampToScreen(prev.x, prev.y));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen to external toggle events from taskbar or settings
  useEffect(() => {
    const handleStatusChanged = (e: CustomEvent) => {
      if (e.detail && typeof e.detail.enabled === 'boolean') {
        setConfig((prev) => ({ ...prev, enabled: e.detail.enabled }));
      }
    };

    const handleToggle = () => {
      updateConfig({ enabled: !config.enabled });
    };

    window.addEventListener('mbot-status-changed', handleStatusChanged as EventListener);
    window.addEventListener('mbot-toggle', handleToggle);

    return () => {
      window.removeEventListener('mbot-status-changed', handleStatusChanged as EventListener);
      window.removeEventListener('mbot-toggle', handleToggle);
    };
  }, [config.enabled]);

  // =========================================================================
  // 1. RECONSTRUCTION ENTRANCE ON LOAD / MODE SWITCH
  // =========================================================================
  useEffect(() => {
    setBotState('reconstructing');
    setReconstructionScale(0.1);
    setReconstructionOpacity(0.1);
    setAntennaGlowing(true);

    const step1 = setTimeout(() => {
      setReconstructionScale(0.75);
      setReconstructionOpacity(0.85);
      playChirp();
    }, 200);

    const step2 = setTimeout(() => {
      setReconstructionScale(1.0);
      setReconstructionOpacity(1.0);
      setAntennaGlowing(false);
      setBotState('walking');
      setTreadRolling(true);
    }, 550);

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
      if (botState === 'walking' || botState === 'idle' || botState === 'inviting') {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 140);
        if (Math.random() < 0.25) {
          setTimeout(() => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 120);
          }, 240);
        }
      }
    }, 3200 + Math.random() * 3000);

    return () => clearInterval(blinkInterval);
  }, [config.enabled, botState]);

  // Helper to calculate exact pupil offset and head angle looking at mouse cursor
  const updateGazeAt = useCallback((mouseX: number, mouseY: number, botX: number, botY: number, curFacing: 'left' | 'right') => {
    if (botState === 'traveling' || botState === 'entering_vortex') return;

    // Center of M-BOT's eyes in screen viewport coordinates (~54px from left, ~38px from top)
    const botEyeCenterX = botX + 54;
    const botEyeCenterY = botY + 38;

    const dx = mouseX - botEyeCenterX;
    const dy = mouseY - botEyeCenterY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 1) {
      setEyeOffset({ x: 0, y: 0 });
      return;
    }

    // Maximum pupil displacement in SVG coordinate units
    const maxOffsetX = 5.2;
    const maxOffsetY = 4.2;

    const normX = dx / dist;
    const normY = dy / dist;

    // Smooth response curve: responsive up close and full gaze anywhere on the screen
    const strength = Math.min(1, Math.max(0.2, dist / 80));

    // Flip horizontal direction for scaleX(-1) flipped container when facing right
    const localDirX = curFacing === 'left' ? normX : -normX;

    const ex = localDirX * maxOffsetX * strength;
    const ey = normY * maxOffsetY * strength;

    setEyeOffset({ x: ex, y: ey });

    // Subtle head tilt following the mouse cursor
    const screenW = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const rawAngle = (dx / screenW) * 16;
    const clampedAngle = Math.max(-9, Math.min(9, rawAngle));
    setHeadAngle(curFacing === 'left' ? clampedAngle : -clampedAngle);

    // Antenna lights up when mouse cursor is near M-BOT
    if (dist < 150) {
      setAntennaGlowing(true);
    } else {
      setAntennaGlowing(false);
    }
  }, [botState]);

  // =========================================================================
  // 3. CURSOR GAZE TRACKING (ACROSS THE ENTIRE SCREEN)
  // =========================================================================
  useEffect(() => {
    if (!config.enabled || !config.cursorInteraction) return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };

      if (isDraggingRef.current) return;

      if (
        botState === 'walking' ||
        botState === 'idle' ||
        botState === 'inviting' ||
        botState === 'observing' ||
        botState === 'waving'
      ) {
        updateGazeAt(e.clientX, e.clientY, posRef.current.x, posRef.current.y, facingRef.current);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [config.enabled, config.cursorInteraction, botState, updateGazeAt]);

  // =========================================================================
  // 4. BUTTERY SMOOTH REAL-TIME PATROL (DELTA-TIME BASED - NO SUDDEN RUSHES)
  // =========================================================================
  useEffect(() => {
    if (
      !config.enabled ||
      config.behavior === 'stay' ||
      botState !== 'walking' ||
      showInvitation ||
      isDraggingRef.current ||
      isPointerDownRef.current
    ) {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      return;
    }

    lastTimeRef.current = performance.now();

    const step = (now: number) => {
      const deltaSec = Math.min(0.08, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      if (
        !config.enabled ||
        config.behavior === 'stay' ||
        botState !== 'walking' ||
        showInvitation ||
        isDraggingRef.current ||
        isPointerDownRef.current
      ) {
        return;
      }

      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const wp = PATROL_CIRCUIT_POINTS[currentWaypointIndexRef.current];
      const target = clampToScreen(wp.xRatio * screenW, wp.yRatio * screenH);

      const current = posRef.current;
      const dx = target.x - current.x;
      const dy = target.y - current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Target reached -> advance to next circuit point
      if (dist < 8) {
        currentWaypointIndexRef.current = (currentWaypointIndexRef.current + 1) % PATROL_CIRCUIT_POINTS.length;
      } else {
        // Move towards target at ~42px per second
        const speedPxPerSec = 42;
        const moveDist = speedPxPerSec * deltaSec;
        const ratio = Math.min(1, moveDist / dist);
        const newX = current.x + dx * ratio;
        const newY = current.y + dy * ratio;

        const nextFacing = dx > 0 ? 'right' : 'left';
        setFacing(nextFacing);
        facingRef.current = nextFacing;

        // Keep eyes locked onto cursor position as M-BOT rolls along
        updateGazeAt(mousePosRef.current.x, mousePosRef.current.y, newX, newY, nextFacing);

        setPos({ x: newX, y: newY });
      }

      animFrameIdRef.current = requestAnimationFrame(step);
    };

    animFrameIdRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [config.enabled, config.behavior, botState, showInvitation, updateGazeAt]);

  // =========================================================================
  // 5. OPEN INVITATION DIALOGUE ON CLICK (NO SUDDEN WARP / TELEPORT)
  // =========================================================================
  const handleBotClick = useCallback(() => {
    if (botState === 'traveling' || botState === 'entering_vortex') return;

    // Pause walking right at current position
    setBotState('inviting');
    setTreadRolling(false);
    setIsWaving(true);
    setAntennaGlowing(true);
    setHeadAngle(-4);
    setShowInvitation(true);
    setMenuOpen(null);

    try {
      soundFx.playMBotCurious();
    } catch (e) {}
  }, [botState]);

  // Accept Space / Retro invitation -> Launch Time Travel!
  const handleAcceptInvitation = () => {
    setShowInvitation(false);
    setBotState('traveling');
    setIsWaving(true);
    setAntennaGlowing(true);
    setTreadRolling(false);
    setEyeOffset({ x: 0, y: 0 });

    try {
      if (mode === 'retro') {
        soundFx.playFanfare();
      } else {
        soundFx.playMBotCurious();
      }
    } catch (err) {}

    showQuickSpeech(
      mode === 'retro'
        ? '🚀 Salto temporal confirmado! Rumo a 2026...'
        : '🌀 Dobra temporal confirmada! Rumo ao Ano 2000...',
      2400
    );

    setTimeout(() => {
      setBotState('entering_vortex');
      setReconstructionScale(0.1);
      setReconstructionOpacity(0.1);

      setTimeout(() => {
        if (onLaunchTimeTravel) {
          onLaunchTimeTravel(mode === 'retro' ? 'forward' : 'backward');
        }
      }, 700);
    }, 650);
  };

  // Decline/Close invitation -> Resume patrol smoothly
  const handleDeclineInvitation = () => {
    setShowInvitation(false);
    setIsWaving(false);
    setAntennaGlowing(false);
    showQuickSpeech('Sem problemas! Continuarei patrulhando por aqui 🤖', 2400);

    setTimeout(() => {
      setBotState('walking');
      setTreadRolling(true);
    }, 500);
  };

  // =========================================================================
  // 6. CLICK & HOLD DRAG SYSTEM (SEAMLESS DRAGGING WITH REAL-TIME CLAMPING)
  // =========================================================================
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isPointerDownRef.current) return;

      const dx = e.clientX - dragStartPosRef.current.x;
      const dy = e.clientY - dragStartPosRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Trigger active dragging if moved or held
      if (dist > 4 || (Date.now() - pointerStartTimeRef.current > 180 && dist > 1)) {
        if (!isDraggingRef.current) {
          isDraggingRef.current = true;
          setShowInvitation(false);
          setBotState('dragging');
          setTreadRolling(false);
          setAntennaGlowing(true);
          setMenuOpen(null);
        }

        const newPos = clampToScreen(
          botStartPosRef.current.x + dx,
          botStartPosRef.current.y + dy
        );
        setPos(newPos);
      }
    };

    const handleGlobalMouseUp = () => {
      if (!isPointerDownRef.current) return;
      isPointerDownRef.current = false;
      setIsHolding(false);

      if (isDraggingRef.current) {
        // User dragged and released at new position
        isDraggingRef.current = false;
        setBotState('walking');
        setTreadRolling(true);
        setAntennaGlowing(false);
        try {
          localStorage.setItem('mBotPosition', JSON.stringify(posRef.current));
        } catch (e) {}
      } else {
        // Simple click without dragging -> Open invitation dialogue!
        handleBotClick();
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [handleBotClick]);

  // Mouse Down directly on M-BOT
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only primary left click
    e.preventDefault();
    e.stopPropagation();

    isPointerDownRef.current = true;
    isDraggingRef.current = false;
    setIsHolding(true);
    pointerStartTimeRef.current = Date.now();
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    botStartPosRef.current = { x: posRef.current.x, y: posRef.current.y };
  };

  // Touch Handlers for Mobile & Tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    const t = e.touches[0];
    isPointerDownRef.current = true;
    isDraggingRef.current = false;
    setIsHolding(true);
    pointerStartTimeRef.current = Date.now();
    dragStartPosRef.current = { x: t.clientX, y: t.clientY };
    botStartPosRef.current = { x: posRef.current.x, y: posRef.current.y };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPointerDownRef.current || e.touches.length === 0) return;
    const t = e.touches[0];
    const dx = t.clientX - dragStartPosRef.current.x;
    const dy = t.clientY - dragStartPosRef.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 5) {
      if (!isDraggingRef.current) {
        isDraggingRef.current = true;
        setShowInvitation(false);
        setBotState('dragging');
        setTreadRolling(false);
        setAntennaGlowing(true);
      }

      const newPos = clampToScreen(
        botStartPosRef.current.x + dx,
        botStartPosRef.current.y + dy
      );
      setPos(newPos);
    }
  };

  const handleTouchEnd = () => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    setIsHolding(false);

    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setBotState('walking');
      setTreadRolling(true);
      setAntennaGlowing(false);
      try {
        localStorage.setItem('mBotPosition', JSON.stringify(posRef.current));
      } catch (e) {}
    } else {
      handleBotClick();
    }
  };

  // Right Click Context Menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isPointerDownRef.current = false;
    isDraggingRef.current = false;
    setIsHolding(false);

    const menuX = Math.min(window.innerWidth - 220, Math.max(10, e.clientX));
    const menuY = Math.min(window.innerHeight - 240, Math.max(10, e.clientY));
    setMenuOpen({ x: menuX, y: menuY });
  };

  if (!config.enabled) return null;

  // Colors for Space Mode theme
  const getSpaceThemeStyles = () => {
    switch (spaceTheme) {
      case 'neon-purple':
        return { led: '#d946ef', accent: '#a855f7', glow: 'rgba(217,70,239,0.6)' };
      case 'emerald-matrix':
        return { led: '#10b981', accent: '#059669', glow: 'rgba(16,185,129,0.6)' };
      case 'amber-gold':
        return { led: '#f59e0b', accent: '#d97706', glow: 'rgba(245,158,11,0.6)' };
      case 'crimson-dark':
        return { led: '#ef4444', accent: '#dc2626', glow: 'rgba(239,68,68,0.6)' };
      default:
        return { led: '#06b6d4', accent: '#0284c7', glow: 'rgba(6,182,212,0.6)' };
    }
  };

  const spaceStyles = getSpaceThemeStyles();

  return (
    <>
      {/* =========================================================
          M-BOT MAIN ROOT CONTAINER
          Z-INDEX: 38 (Always 100% visible on top of desktop icons)
          Elevated to z-50 during active dragging
         ========================================================= */}
      <div
        id="mbot-companion-root"
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${reconstructionScale})`,
          transition:
            botState === 'entering_vortex'
              ? 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.7s ease-in'
              : botState === 'reconstructing'
              ? 'transform 0.35s ease-out, opacity 0.35s ease-out'
              : 'none',
          zIndex: botState === 'dragging' || showInvitation ? 50 : 38,
          opacity: reconstructionOpacity,
          touchAction: 'none',
        }}
        className={`fixed top-0 left-0 select-none pointer-events-auto filter drop-shadow-[0_6px_16px_rgba(0,0,0,0.45)] ${
          isHolding ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          if (!isPointerDownRef.current) setIsHolding(false);
        }}
        title={
          mode === 'retro'
            ? 'M-BOT: Clique e segure para arrastar • Clique para falar com ele'
            : 'M-BOT: Clique e segure para arrastar • Clique para interagir'
        }
      >
        {/* Hover Hint Tooltip (Only when not showing invitation or speech) */}
        {isHovered && !speechBubble && !showInvitation && botState !== 'traveling' && botState !== 'entering_vortex' && !isDraggingRef.current && (
          <div
            className={`absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-mono shadow-xl animate-fadeIn pointer-events-none z-50 flex items-center gap-1.5 ${
              mode === 'retro'
                ? 'bg-[#000080] text-white border border-white font-bold shadow-[2px_2px_0px_#000]'
                : 'bg-cyan-500 text-slate-950 font-bold border border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.7)]'
            }`}
          >
            <Move className="w-3 h-3 text-amber-300 animate-pulse" />
            <span>{mode === 'retro' ? 'Clique para interagir • Arraste para mover' : 'Clique para interagir • Arraste para mover'}</span>
          </div>
        )}

        {/* Short Temporary Speech Bubble */}
        {speechBubble && !showInvitation && (
          <div
            className={`absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-mono shadow-xl animate-fadeIn pointer-events-none z-50 ${
              mode === 'retro'
                ? 'bg-[#ffffe1] text-gray-900 border-2 border-black font-bold shadow-[3px_3px_0px_#000]'
                : 'bg-slate-950/95 text-cyan-200 border border-cyan-400/70 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.5)]'
            }`}
          >
            {speechBubble}
            <div
              className={`absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 ${
                mode === 'retro' ? 'border-t-black' : 'border-t-cyan-400/70'
              }`}
            />
          </div>
        )}

        {/* =========================================================
            INTERACTIVE INVITATION DIALOGUE (CONVITE PARA MODO SPACE)
           ========================================================= */}
        {showInvitation && (
          <div
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className={`absolute -top-36 sm:-top-40 left-1/2 -translate-x-1/2 w-72 sm:w-80 p-3 sm:p-3.5 rounded-xl shadow-2xl animate-scaleIn pointer-events-auto z-50 ${
              mode === 'retro'
                ? 'bg-[#ece9d8] border-2 border-[#0055ea] text-gray-900 shadow-[4px_4px_12px_rgba(0,0,0,0.6)] font-sans'
                : 'bg-slate-950/95 border-2 border-cyan-400 text-slate-100 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.5)] font-mono'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-gray-300/40">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                {mode === 'retro' ? (
                  <>
                    <Rocket className="w-4 h-4 text-blue-600 animate-bounce" />
                    <span className="text-blue-900 font-bold">M-BOT 00 • Viagem no Tempo</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                    <span className="text-cyan-300 font-bold">M-BOT 26 • Salto Quântico</span>
                  </>
                )}
              </div>
              <button
                onClick={handleDeclineInvitation}
                className="text-gray-500 hover:text-red-500 transition p-0.5 rounded cursor-pointer"
                title="Fechar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Message Body */}
            <p className="text-xs leading-relaxed mb-3">
              {mode === 'retro' ? (
                <>
                  Olá! Gostaria de fazer uma <strong>Viagem Temporal</strong> rumo ao <strong>Modo Space 2026</strong>?
                </>
              ) : (
                <>
                  Saudações! Deseja abrir a dobra quântica e <strong>retornar ao MATEUS OS 2000</strong>?
                </>
              )}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleAcceptInvitation}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition transform active:scale-95 cursor-pointer shadow-md ${
                  mode === 'retro'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-400 shadow-[2px_2px_0px_#000]'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 border border-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.8)]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{mode === 'retro' ? 'Sim, viajar!' : 'Sim, retornar!'}</span>
              </button>

              <button
                onClick={handleDeclineInvitation}
                className={`py-1.5 px-3 rounded-lg text-xs font-medium transition cursor-pointer ${
                  mode === 'retro'
                    ? 'bg-gray-200 hover:bg-gray-300 text-gray-800 border border-gray-400'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600'
                }`}
              >
                Agora não
              </button>
            </div>

            {/* Speech Balloon Down Arrow */}
            <div
              className={`absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-6 border-x-transparent border-t-8 ${
                mode === 'retro' ? 'border-t-[#0055ea]' : 'border-t-cyan-400'
              }`}
            />
          </div>
        )}

        {/* =========================================================
            CHARACTER SVG CONTAINER (LARGE, 100% VISIBLE & SHARP)
            Dimensions: ~106px x 120px on desktop
           ========================================================= */}
        <div
          style={{
            transform: `scaleX(${facing === 'left' ? 1 : -1}) ${
              botState === 'walking'
                ? 'translateY(-2px)'
                : botState === 'dragging'
                ? 'rotate(-8deg) scale(1.08)'
                : ''
            }`,
          }}
          className={`relative transition-transform duration-200 w-[84px] h-[96px] sm:w-[98px] sm:h-[110px] md:w-[108px] md:h-[122px] flex flex-col items-center justify-end group ${
            botState === 'walking' ? 'animate-bounce-subtle' : ''
          }`}
        >
          {/* =========================================================
              M-BOT 00 (RETRO 2000 EDITION)
              OLHOS: Fundo Branco, Pupilas Pretas, Reflexos Brancos
             ========================================================= */}
          {mode === 'retro' && (
            <svg
              viewBox="0 0 100 110"
              className="w-full h-full overflow-visible"
              style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.45))' }}
            >
              <defs>
                <linearGradient id="retroMetalChassis" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="50%" stopColor="#64748b" />
                  <stop offset="100%" stopColor="#475569" />
                </linearGradient>
                <linearGradient id="retroBluePlate" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#1e3a8a" />
                </linearGradient>
                <linearGradient id="retroEyeGoggle" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#cbd5e1" />
                  <stop offset="60%" stopColor="#64748b" />
                  <stop offset="100%" stopColor="#334155" />
                </linearGradient>
                <linearGradient id="retroTreadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
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
                  transform: isWaving
                    ? 'rotate(-60deg)'
                    : botState === 'dragging'
                    ? 'rotate(30deg)'
                    : 'rotate(-5deg)',
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
                  transform: isWaving
                    ? 'rotate(50deg)'
                    : botState === 'dragging'
                    ? 'rotate(-30deg)'
                    : botState === 'walking'
                    ? 'rotate(18deg)'
                    : 'rotate(5deg)',
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
                fill="url(#retroMetalChassis)"
                stroke="#000"
                strokeWidth="1.6"
              />
              <circle cx="28" cy="52" r="1.5" fill="#1e293b" />
              <circle cx="72" cy="52" r="1.5" fill="#1e293b" />
              <circle cx="28" cy="82" r="1.5" fill="#1e293b" />
              <circle cx="72" cy="82" r="1.5" fill="#1e293b" />

              {/* Front Plate */}
              <rect x="30" y="53" width="40" height="28" rx="4" fill="url(#retroBluePlate)" stroke="#000" strokeWidth="1.2" />

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
                  <ellipse cx="33" cy="25" rx="15" ry="14" fill="url(#retroEyeGoggle)" stroke="#000" strokeWidth="1.6" />
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
                  <ellipse cx="67" cy="25" rx="15" ry="14" fill="url(#retroEyeGoggle)" stroke="#000" strokeWidth="1.6" />
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

              {/* Tank Treads */}
              <g>
                <path d="M 12 98 L 22 75 L 34 75 L 42 98 Z" fill="url(#retroTreadGrad)" stroke="#000" strokeWidth="1.6" />
                <circle cx="18" cy="93" r="4.2" fill="#475569" stroke="#000" strokeWidth="1" />
                <circle cx="28" cy="81" r="3.4" fill="#475569" stroke="#000" strokeWidth="1" />
                <circle cx="36" cy="93" r="4.2" fill="#475569" stroke="#000" strokeWidth="1" />
                <line x1="12" y1="98" x2="42" y2="98" stroke="#0f172a" strokeWidth="3" strokeDasharray={treadRolling ? "3,2" : "none"} />
              </g>

              <g>
                <path d="M 58 98 L 66 75 L 78 75 L 88 98 Z" fill="url(#retroTreadGrad)" stroke="#000" strokeWidth="1.6" />
                <circle cx="64" cy="93" r="4.2" fill="#475569" stroke="#000" strokeWidth="1" />
                <circle cx="72" cy="81" r="3.4" fill="#475569" stroke="#000" strokeWidth="1" />
                <circle cx="82" cy="93" r="4.2" fill="#475569" stroke="#000" strokeWidth="1" />
                <line x1="58" y1="98" x2="88" y2="98" stroke="#0f172a" strokeWidth="3" strokeDasharray={treadRolling ? "3,2" : "none"} />
              </g>
            </svg>
          )}

          {/* =========================================================
              M-BOT 26 (SPACE 2026 CYBERNETIC EDITION)
              OLHOS: Fundo Branco, Pupilas Pretas, Reflexos Brancos
             ========================================================= */}
          {mode === 'space' && (
            <svg
              viewBox="0 0 100 110"
              className="w-full h-full overflow-visible"
              style={{ filter: `drop-shadow(0 0 14px ${spaceStyles.glow})` }}
            >
              <defs>
                <linearGradient id="spaceDarkMetal" x1="0%" y1="0%" x2="100%" y2="100%">
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
                  transform: isWaving
                    ? 'rotate(-60deg)'
                    : botState === 'dragging'
                    ? 'rotate(30deg)'
                    : 'rotate(-5deg)',
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
                  transform: isWaving
                    ? 'rotate(50deg)'
                    : botState === 'dragging'
                    ? 'rotate(-30deg)'
                    : botState === 'walking'
                    ? 'rotate(18deg)'
                    : 'rotate(5deg)',
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
                fill="url(#spaceDarkMetal)"
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

              {/* Cyber Neck & Eyes (Same White/Black Format) */}
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

              {/* Cyber Treads */}
              <g>
                <path d="M 12 98 L 22 75 L 34 75 L 42 98 Z" fill="#0f172a" stroke={spaceStyles.led} strokeWidth="1.5" />
                <circle cx="18" cy="93" r="4" fill="#1e293b" stroke={spaceStyles.led} strokeWidth="1" />
                <circle cx="28" cy="81" r="3.2" fill="#1e293b" stroke={spaceStyles.led} strokeWidth="1" />
                <circle cx="36" cy="93" r="4" fill="#1e293b" stroke={spaceStyles.led} strokeWidth="1" />
                <line x1="12" y1="98" x2="42" y2="98" stroke={spaceStyles.led} strokeWidth="2.5" strokeDasharray={treadRolling ? "3,2" : "none"} />
              </g>

              <g>
                <path d="M 58 98 L 66 75 L 78 75 L 88 98 Z" fill="#0f172a" stroke={spaceStyles.led} strokeWidth="1.5" />
                <circle cx="64" cy="93" r="4" fill="#1e293b" stroke={spaceStyles.led} strokeWidth="1" />
                <circle cx="72" cy="81" r="3.2" fill="#1e293b" stroke={spaceStyles.led} strokeWidth="1" />
                <circle cx="82" cy="93" r="4" fill="#1e293b" stroke={spaceStyles.led} strokeWidth="1" />
                <line x1="58" y1="98" x2="88" y2="98" stroke={spaceStyles.led} strokeWidth="2.5" strokeDasharray={treadRolling ? "3,2" : "none"} />
              </g>
            </svg>
          )}
        </div>
      </div>

      {/* =========================================================
          M-BOT CONTEXT MENU (RIGHT CLICK)
         ========================================================= */}
      {menuOpen && (
        <div
          style={{ top: `${menuOpen.y}px`, left: `${menuOpen.x}px` }}
          className={`fixed z-50 w-60 py-1.5 text-xs select-none shadow-2xl animate-fadeIn ${
            mode === 'retro'
              ? 'bg-[#c0c0c0] border-2 border-white border-r-gray-800 border-b-gray-800 font-sans text-gray-900'
              : 'bg-slate-950/95 border border-cyan-500/50 rounded-2xl font-mono text-slate-100 backdrop-blur-2xl shadow-[0_0_30px_rgba(6,182,212,0.3)]'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={`px-3 py-1 font-bold flex items-center justify-between border-b ${
              mode === 'retro'
                ? 'border-gray-400 text-blue-900'
                : 'border-white/10 text-cyan-300'
            }`}
          >
            <span>{mode === 'retro' ? 'M-BOT 00 (Guia)' : 'M-BOT 26 (Cyber)'}</span>
            <button
              onClick={() => setMenuOpen(null)}
              className="text-gray-500 hover:text-black cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={(e) => {
              setMenuOpen(null);
              handleBotClick();
            }}
            className={`w-full text-left px-3 py-1.5 flex items-center gap-2 cursor-pointer transition ${
              mode === 'retro'
                ? 'hover:bg-[#000080] hover:text-white'
                : 'hover:bg-cyan-500/20 hover:text-cyan-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-bold">{mode === 'retro' ? 'Convite: Viajar para 2026' : 'Convite: Retornar para 2000'}</span>
          </button>

          <button
            onClick={() => {
              updateConfig({ behavior: config.behavior === 'roam' ? 'stay' : 'roam' });
              setMenuOpen(null);
            }}
            className={`w-full text-left px-3 py-1.5 flex items-center gap-2 cursor-pointer transition ${
              mode === 'retro'
                ? 'hover:bg-[#000080] hover:text-white'
                : 'hover:bg-cyan-500/20 hover:text-cyan-300'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-blue-500" />
            <span>Percurso: {config.behavior === 'roam' ? 'Ativo (Circuito)' : 'Pausado'}</span>
          </button>

          <button
            onClick={() => {
              updateConfig({ sound: !config.sound });
              setMenuOpen(null);
            }}
            className={`w-full text-left px-3 py-1.5 flex items-center gap-2 cursor-pointer transition ${
              mode === 'retro'
                ? 'hover:bg-[#000080] hover:text-white'
                : 'hover:bg-cyan-500/20 hover:text-cyan-300'
            }`}
          >
            {config.sound ? (
              <Volume2 className="w-3.5 h-3.5 text-green-600" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-gray-500" />
            )}
            <span>Sons do Robô: {config.sound ? 'Ativado' : 'Desativado'}</span>
          </button>

          <button
            onClick={() => {
              updateConfig({ enabled: false });
              setMenuOpen(null);
            }}
            className={`w-full text-left px-3 py-1.5 flex items-center gap-2 text-red-600 cursor-pointer transition border-t ${
              mode === 'retro'
                ? 'border-gray-400 hover:bg-red-700 hover:text-white'
                : 'border-white/10 hover:bg-red-500/20'
            }`}
          >
            <X className="w-3.5 h-3.5" />
            <span>Ocultar M-BOT</span>
          </button>
        </div>
      )}
    </>
  );
};
