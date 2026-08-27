import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Eye,
  Volume2,
  VolumeX,
  Compass,
  Square,
  Settings,
  X,
  Smile,
  Zap,
  Radio,
  Play,
  ArrowRight,
  HelpCircle
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
  onLaunchTimeTravel?: () => void;
  isTraveling?: boolean;
}

// Bot State Machine Types
type BotState =
  | 'idle'
  | 'walking'
  | 'observing'
  | 'looking_at_target'
  | 'waving'
  | 'dragging'
  | 'resting'
  | 'space_invitation'
  | 'guiding_to_travel'
  | 'disintegrating'
  | 'reconstructing';

export const MBotCompanion: React.FC<MBotCompanionProps> = ({
  mode = 'retro',
  spaceTheme = 'space-blue',
  onOpenSettings,
  onLaunchTimeTravel,
  isTraveling = false,
}) => {
  // Load initial settings from localStorage
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

  // Coordinates on desktop
  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== 'undefined') {
      if (config.position && config.position.x > 0 && config.position.y > 0) {
        return {
          x: Math.min(window.innerWidth - 110, Math.max(20, config.position.x)),
          y: Math.min(window.innerHeight - 150, Math.max(40, config.position.y)),
        };
      }
      return {
        x: Math.max(30, window.innerWidth - 180),
        y: Math.max(50, window.innerHeight - 220),
      };
    }
    return { x: 300, y: 300 };
  });

  // Bot State Machine
  const [botState, setBotState] = useState<BotState>(() => {
    return mode === 'space' ? 'reconstructing' : 'idle';
  });
  const [facing, setFacing] = useState<'left' | 'right'>('left');
  const [eyeOffset, setEyeOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [headAngle, setHeadAngle] = useState<number>(0);
  const [antennaGlowing, setAntennaGlowing] = useState<boolean>(false);
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [treadRolling, setTreadRolling] = useState<boolean>(false);
  const [isWaving, setIsWaving] = useState<boolean>(false);
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);
  const [showSpaceInvitation, setShowSpaceInvitation] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<{ x: number; y: number } | null>(null);
  const [reconstructionProgress, setReconstructionProgress] = useState<number>(1);

  // References
  const isDraggingRef = useRef<boolean>(false);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mousePosRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const lastActiveTimeRef = useRef<number>(Date.now());
  const lastInvitationTimeRef = useRef<number>(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const targetLookTimerRef = useRef<NodeJS.Timeout | null>(null);
  const roamTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const treadOffsetRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Helper to persist configuration
  const updateConfig = (newConfig: Partial<MBotConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      try {
        if (newConfig.enabled !== undefined) localStorage.setItem('mBotEnabled', String(updated.enabled));
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
      soundFx.playMBotChirp();
    }
  }, [config.sound]);

  const playCurious = useCallback(() => {
    if (config.sound) {
      soundFx.playMBotCurious();
    }
  }, [config.sound]);

  const showQuickSpeech = (text: string, duration = 2800) => {
    if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
    setSpeechBubble(text);
    speechTimeoutRef.current = setTimeout(() => {
      setSpeechBubble(null);
    }, duration);
  };

  // Ensure robot stays inside viewport safe zones
  const clampPosition = (x: number, y: number) => {
    const minX = 20;
    const maxX = Math.max(minX, window.innerWidth - 110);
    const minY = 30;
    const maxY = Math.max(minY, window.innerHeight - (mode === 'space' ? 140 : 120));
    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y)),
    };
  };

  // Reconstructing sequence when entering Space Mode
  useEffect(() => {
    if (mode === 'space') {
      setBotState('reconstructing');
      setReconstructionProgress(0.1);
      setEyeOffset({ x: 0, y: 0 });
      setAntennaGlowing(true);

      const t1 = setTimeout(() => setReconstructionProgress(0.5), 400);
      const t2 = setTimeout(() => setReconstructionProgress(0.85), 900);
      const t3 = setTimeout(() => {
        setReconstructionProgress(1);
        setBotState('observing');
        // Space arrival looking sequence: left -> right -> self -> user
        setEyeOffset({ x: -4.5, y: 0 });
        setTimeout(() => {
          setEyeOffset({ x: 4.5, y: 0 });
          setTimeout(() => {
            setEyeOffset({ x: 0, y: 3.5 }); // looks at self
            setHeadAngle(6);
            setTimeout(() => {
              setEyeOffset({ x: 0, y: 0 }); // looks at user
              setHeadAngle(0);
              setIsWaving(true);
              setIsBlinking(true);
              setTimeout(() => {
                setIsBlinking(false);
                setIsWaving(false);
                setAntennaGlowing(false);
                setBotState('idle');
              }, 1200);
            }, 700);
          }, 600);
        }, 600);
      }, 1400);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [mode]);

  // Space theme adaptive colors (for subtle LEDs and accents only - EYES REMAIN WHITE/BLACK)
  const getSpaceThemeStyles = () => {
    switch (spaceTheme) {
      case 'aurora':
        return { accent: '#10b981', led: '#00f5a0', glow: 'rgba(0, 245, 160, 0.7)' };
      case 'void':
        return { accent: '#64748b', led: '#f8fafc', glow: 'rgba(248, 250, 252, 0.6)' };
      case 'violet':
        return { accent: '#8b5cf6', led: '#c084fc', glow: 'rgba(192, 132, 252, 0.7)' };
      case 'light-space':
        return { accent: '#0284c7', led: '#38bdf8', glow: 'rgba(56, 189, 248, 0.7)' };
      case 'space-blue':
      default:
        return { accent: '#0284c7', led: '#06b6d4', glow: 'rgba(6, 182, 212, 0.75)' };
    }
  };

  const spaceStyles = getSpaceThemeStyles();

  // =========================================================================
  // GLOBAL CLICK OBSERVER: Parar e olhar para a pasta/tela ao clicar
  // =========================================================================
  useEffect(() => {
    if (!config.enabled || isTraveling || botState === 'space_invitation' || botState === 'guiding_to_travel') return;

    const handleGlobalClick = (e: MouseEvent) => {
      const targetEl = e.target as HTMLElement | null;
      // Skip if clicking M-BOT itself or context menu
      if (targetEl && (targetEl.closest('#mbot-companion-root') || targetEl.closest('#mbot-context-menu'))) {
        return;
      }

      lastActiveTimeRef.current = Date.now();

      // Cancel walking immediately
      if (roamTimeoutRef.current) {
        clearTimeout(roamTimeoutRef.current);
        roamTimeoutRef.current = null;
      }
      setTreadRolling(false);

      // Check click position
      const clickX = e.clientX;
      const clickY = e.clientY;
      const botCenterX = pos.x + 45;
      const botCenterY = pos.y + 45;
      const dx = clickX - botCenterX;
      const dy = clickY - botCenterY;
      const dist = Math.hypot(dx, dy);

      // Turn facing towards click
      setFacing(dx < 0 ? 'left' : 'right');

      // Move pupils within white sclera area (max 5px offset)
      const lookDist = Math.max(1, dist);
      const lookX = Math.max(-5, Math.min(5, (dx / lookDist) * 5));
      const lookY = Math.max(-5, Math.min(5, (dy / lookDist) * 5));
      setEyeOffset({ x: lookX, y: lookY });

      // Tilt head towards target
      const angle = Math.atan2(dy, Math.abs(dx)) * (180 / Math.PI);
      setHeadAngle(Math.max(-14, Math.min(14, angle * 0.35)));
      setAntennaGlowing(true);

      setBotState('looking_at_target');

      if (Math.random() < 0.35) {
        playCurious();
      }

      // Look for 2.4s and then relax back to idle
      if (targetLookTimerRef.current) clearTimeout(targetLookTimerRef.current);
      targetLookTimerRef.current = setTimeout(() => {
        setBotState('idle');
        setHeadAngle(0);
        setEyeOffset({ x: 0, y: 0 });
        setAntennaGlowing(false);
      }, 2400);
    };

    window.addEventListener('click', handleGlobalClick, true);

    return () => {
      window.removeEventListener('click', handleGlobalClick, true);
      if (targetLookTimerRef.current) clearTimeout(targetLookTimerRef.current);
    };
  }, [config.enabled, isTraveling, botState, pos, playCurious]);

  // =========================================================================
  // NATURAL EYE BLINKING (Semi-random intervals)
  // =========================================================================
  useEffect(() => {
    if (!config.enabled) return;

    let blinkTimer: NodeJS.Timeout;
    const scheduleNextBlink = () => {
      const nextInterval = Math.random() * 3200 + 2200;
      blinkTimer = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          // 20% chance of double blink
          if (Math.random() < 0.2) {
            setTimeout(() => {
              setIsBlinking(true);
              setTimeout(() => setIsBlinking(false), 120);
            }, 140);
          }
          scheduleNextBlink();
        }, 150);
      }, nextInterval);
    };

    scheduleNextBlink();

    return () => clearTimeout(blinkTimer);
  }, [config.enabled]);

  // =========================================================================
  // CURSOR & AMBIENT EYE TRACKING (Pupils move inside white sclera)
  // =========================================================================
  useEffect(() => {
    if (!config.enabled || isDraggingRef.current || botState === 'looking_at_target' || botState === 'space_invitation') return;

    const interval = setInterval(() => {
      if (botState === 'resting') {
        setEyeOffset({ x: 0, y: 1 });
        setHeadAngle(0);
        return;
      }

      // Track cursor if enabled and within comfortable range
      if (config.cursorInteraction && mousePosRef.current.x > 0) {
        const botCenterX = pos.x + 45;
        const botCenterY = pos.y + 45;
        const dx = mousePosRef.current.x - botCenterX;
        const dy = mousePosRef.current.y - botCenterY;
        const dist = Math.hypot(dx, dy);

        if (dist < 260 && dist > 12) {
          const maxLook = 4.2;
          setEyeOffset({
            x: Math.max(-maxLook, Math.min(maxLook, (dx / dist) * maxLook)),
            y: Math.max(-maxLook, Math.min(maxLook, (dy / dist) * maxLook)),
          });
          return;
        }
      }

      // Ambient eye wandering
      if (botState === 'walking') {
        setEyeOffset({ x: facing === 'left' ? -3 : 3, y: 0 });
      } else if (botState === 'observing') {
        setEyeOffset({
          x: (Math.random() - 0.5) * 5,
          y: (Math.random() - 0.5) * 3.5,
        });
        setHeadAngle((Math.random() - 0.5) * 8);
      } else if (botState === 'idle') {
        if (Math.random() < 0.3) {
          setEyeOffset({
            x: (Math.random() - 0.5) * 3.5,
            y: (Math.random() - 0.5) * 2.5,
          });
        } else {
          setEyeOffset({ x: 0, y: 0 });
          setHeadAngle(0);
        }
      }
    }, 450);

    return () => clearInterval(interval);
  }, [config.enabled, config.cursorInteraction, pos, botState, facing]);

  // =========================================================================
  // AUTONOMOUS ROAMING & EXPLORATION (Natural Walk -> Pause -> Observe)
  // =========================================================================
  useEffect(() => {
    if (
      !config.enabled ||
      config.behavior !== 'roam' ||
      isDraggingRef.current ||
      isTraveling ||
      botState === 'space_invitation' ||
      botState === 'guiding_to_travel'
    ) {
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const scheduleNextRoam = () => {
      // Inactivity check (35s sleep)
      const timeSinceActive = Date.now() - lastActiveTimeRef.current;
      if (timeSinceActive > 35000 && botState !== 'resting') {
        setBotState('resting');
        roamTimeoutRef.current = setTimeout(scheduleNextRoam, 4000);
        return;
      }

      if (botState === 'idle') {
        // Wait 4 to 8 seconds at current position
        const pauseDuration = Math.random() * 4000 + 4000;
        roamTimeoutRef.current = setTimeout(() => {
          if (botState === 'looking_at_target' || botState === 'space_invitation') return;

          const isMobile = window.innerWidth < 768;
          const padding = isMobile ? 25 : 60;
          const destX = Math.random() * (window.innerWidth - padding * 2 - 90) + padding;
          const destY = Math.random() * (window.innerHeight - 210 - padding) + padding;
          const clamped = clampPosition(destX, destY);

          setFacing(clamped.x < pos.x ? 'left' : 'right');
          setBotState('walking');
          setTreadRolling(true);

          setPos(clamped);

          const dist = Math.hypot(clamped.x - pos.x, clamped.y - pos.y);
          const walkDuration = Math.max(3000, Math.min(6000, dist * 8.5));

          roamTimeoutRef.current = setTimeout(() => {
            setTreadRolling(false);
            setBotState('observing');
            if (Math.random() < 0.25) playCurious();

            roamTimeoutRef.current = setTimeout(() => {
              setBotState('idle');
              roamTimeoutRef.current = setTimeout(scheduleNextRoam, 1200);
            }, Math.random() * 2500 + 1500);
          }, walkDuration);
        }, pauseDuration);
      }
    };

    roamTimeoutRef.current = setTimeout(scheduleNextRoam, 3200);

    return () => {
      if (roamTimeoutRef.current) clearTimeout(roamTimeoutRef.current);
    };
  }, [config.enabled, config.behavior, botState, pos, isTraveling, playCurious]);

  // =========================================================================
  // MOUSE / TOUCH EVENTS (Dragging & Waking Up)
  // =========================================================================
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
      lastActiveTimeRef.current = Date.now();

      if (botState === 'resting') {
        setBotState('idle');
      }

      if (isDraggingRef.current) {
        const nextX = e.clientX - dragOffsetRef.current.x;
        const nextY = e.clientY - dragOffsetRef.current.y;
        setPos(clampPosition(nextX, nextY));
      }
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        mousePosRef.current = { x: t.clientX, y: t.clientY };
        lastActiveTimeRef.current = Date.now();

        if (isDraggingRef.current) {
          const nextX = t.clientX - dragOffsetRef.current.x;
          const nextY = t.clientY - dragOffsetRef.current.y;
          setPos(clampPosition(nextX, nextY));
        }
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setBotState('idle');
        try {
          localStorage.setItem('mBotPosition', JSON.stringify(pos));
        } catch (e) {}
      }
    };

    const handleGlobalDismiss = () => {
      setMenuOpen(null);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);
    window.addEventListener('click', handleGlobalDismiss);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
      window.removeEventListener('click', handleGlobalDismiss);
    };
  }, [botState, pos, mode]);

  // =========================================================================
  // CLICK ON M-BOT (Waving & Space Invitation Option)
  // =========================================================================
  const handleBotClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDraggingRef.current) return;

    lastActiveTimeRef.current = Date.now();

    // Cancel roaming timers
    if (roamTimeoutRef.current) {
      clearTimeout(roamTimeoutRef.current);
      roamTimeoutRef.current = null;
    }
    setTreadRolling(false);

    // If Retro Mode and Travel is available, check cooldown for the Space Invitation
    const now = Date.now();
    const canInviteToSpace =
      mode === 'retro' &&
      !!onLaunchTimeTravel &&
      now - lastInvitationTimeRef.current > 60000; // 1 min cooldown

    // 35% chance to show Space Invitation if available, otherwise cheerful wave & greeting
    if (canInviteToSpace && (Math.random() < 0.35 || showSpaceInvitation)) {
      setBotState('space_invitation');
      setShowSpaceInvitation(true);
      setEyeOffset({ x: 0, y: 0 });
      setHeadAngle(-4);
      setAntennaGlowing(true);
      playChirp();
      return;
    }

    // Standard Friendly Interaction
    setBotState('waving');
    setIsWaving(true);
    setHeadAngle(-6);
    setAntennaGlowing(true);
    playChirp();

    const greetings =
      mode === 'retro'
        ? ['Bip! M-BOT aqui!', '✦ Olhando o desktop!', 'Tudo pronto!', 'Explorando!']
        : ['Bip-bop! Space 2026.', '⚡ M-BOT 26 ativo.', 'Sistemas 100%.', '✦ Observando cosmos...'];
    const msg = greetings[Math.floor(Math.random() * greetings.length)];
    showQuickSpeech(msg);

    setTimeout(() => {
      setBotState('idle');
      setIsWaving(false);
      setHeadAngle(0);
      setAntennaGlowing(false);
    }, 2200);
  };

  // =========================================================================
  // SPACE INVITATION: Accept & Guide to Travel
  // =========================================================================
  const handleAcceptSpaceInvitation = () => {
    setShowSpaceInvitation(false);
    lastInvitationTimeRef.current = Date.now();

    // Excited animation
    setBotState('guiding_to_travel');
    setIsWaving(true);
    setAntennaGlowing(true);
    playChirp();
    showQuickSpeech('Vamos para o futuro! Venha comigo.', 3000);

    // Target travel location (top right / taskbar travel area)
    const travelTargetX = Math.max(30, window.innerWidth - 220);
    const travelTargetY = Math.max(30, window.innerHeight - 100);

    setTimeout(() => {
      setIsWaving(false);
      setFacing('right');
      setBotState('walking');
      setTreadRolling(true);

      // Walk toward Travel button
      setPos({ x: travelTargetX, y: travelTargetY });

      // Midpoint: look back at user to say "follow me"
      setTimeout(() => {
        setEyeOffset({ x: -4, y: 0 });
      }, 1600);

      // Arrived at Travel
      setTimeout(() => {
        setTreadRolling(false);
        setEyeOffset({ x: 0, y: -4 }); // looks at travel button
        setHeadAngle(-8);

        setTimeout(() => {
          setEyeOffset({ x: 0, y: 0 }); // looks back at user
          setBotState('disintegrating');
          playChirp();

          // Launch actual Travel transition
          setTimeout(() => {
            if (onLaunchTimeTravel) {
              onLaunchTimeTravel();
            }
          }, 800);
        }, 1200);
      }, 3500);
    }, 800);
  };

  const handleDeclineSpaceInvitation = () => {
    setShowSpaceInvitation(false);
    lastInvitationTimeRef.current = Date.now();
    setBotState('waving');
    setIsWaving(true);
    playChirp();

    setTimeout(() => {
      setIsWaving(false);
      setHeadAngle(0);
      setAntennaGlowing(false);
      setBotState('idle');
    }, 1200);
  };

  // =========================================================================
  // CONTEXT MENU & DRAG HANDLERS
  // =========================================================================
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    lastActiveTimeRef.current = Date.now();

    const menuX = Math.min(window.innerWidth - 190, Math.max(10, e.clientX));
    const menuY = Math.min(window.innerHeight - 240, Math.max(10, e.clientY));
    setMenuOpen({ x: menuX, y: menuY });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    isDraggingRef.current = true;
    dragOffsetRef.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
    setBotState('dragging');
    setMenuOpen(null);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    const t = e.touches[0];
    isDraggingRef.current = true;
    dragOffsetRef.current = {
      x: t.clientX - pos.x,
      y: t.clientY - pos.y,
    };
    setBotState('dragging');
    setMenuOpen(null);

    longPressTimerRef.current = setTimeout(() => {
      isDraggingRef.current = false;
      setBotState('idle');
      const menuX = Math.min(window.innerWidth - 190, Math.max(10, t.clientX));
      const menuY = Math.min(window.innerHeight - 240, Math.max(10, t.clientY));
      setMenuOpen({ x: menuX, y: menuY });
    }, 650);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
  };

  if (!config.enabled) return null;

  return (
    <>
      {/* =========================================================
          M-BOT MAIN CHARACTER ROOT
         ========================================================= */}
      <div
        id="mbot-companion-root"
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
          transition:
            botState === 'walking' || botState === 'guiding_to_travel'
              ? 'transform 3.5s cubic-bezier(0.25, 0.1, 0.25, 1)'
              : botState === 'dragging'
              ? 'none'
              : 'transform 0.4s ease-out',
          zIndex: botState === 'dragging' ? 70 : 30,
          opacity: botState === 'disintegrating' ? 0.2 : reconstructionProgress,
        }}
        className="fixed top-0 left-0 select-none cursor-grab active:cursor-grabbing pointer-events-auto filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)]"
        onClick={handleBotClick}
        onContextMenu={handleContextMenu}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Retro Space Invitation Balloon */}
        {showSpaceInvitation && (
          <div
            className="absolute -top-36 left-1/2 -translate-x-1/2 w-64 bg-[#ffffe1] text-gray-900 border-2 border-black p-3 rounded-sm shadow-[4px_4px_0px_#000] z-50 animate-fadeIn font-sans text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-1.5 font-bold text-blue-900 border-b border-gray-400 pb-1 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>M-BOT: VIAGEM TEMPORAL</span>
            </div>
            <p className="text-[11px] leading-relaxed text-gray-800 mb-3">
              Quer conhecer o futuro? Posso te levar para o <strong>Modo Space</strong>!
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={handleDeclineSpaceInvitation}
                className="btn-retro px-2 py-1 text-[11px] font-bold text-gray-700 cursor-pointer"
              >
                Agora não
              </button>
              <button
                onClick={handleAcceptSpaceInvitation}
                className="btn-retro px-2.5 py-1 text-[11px] font-bold bg-blue-900 text-white cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <span>Ir para o Space</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-black" />
          </div>
        )}

        {/* Short Speech Bubble */}
        {speechBubble && !showSpaceInvitation && (
          <div
            className={`absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-lg text-[11px] font-mono shadow-xl animate-fadeIn pointer-events-none z-50 ${
              mode === 'retro'
                ? 'bg-[#ffffe1] text-gray-900 border-2 border-black font-bold shadow-[2px_2px_0px_#000]'
                : 'bg-slate-950/95 text-cyan-200 border border-cyan-400/60 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.4)]'
            }`}
          >
            {speechBubble}
            <div
              className={`absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 ${
                mode === 'retro' ? 'border-t-black' : 'border-t-cyan-400/60'
              }`}
            />
          </div>
        )}

        {/* CHARACTER SVG CONTAINER */}
        <div
          style={{
            transform: `scaleX(${facing === 'left' ? 1 : -1}) ${
              botState === 'walking'
                ? 'translateY(-2px)'
                : botState === 'dragging'
                ? 'rotate(-8deg) scale(1.06)'
                : ''
            }`,
          }}
          className={`relative transition-transform duration-300 w-24 sm:w-28 h-26 sm:h-30 flex flex-col items-center justify-end group ${
            botState === 'walking' ? 'animate-bounce-subtle' : ''
          }`}
        >
          {/* =========================================================
              M-BOT 00 (RETRO 2000 EDITION)
              Paleta: Cinza metálico, grafite, azul clássico, teal
              OLHOS: Fundo Branco, Pupilas Pretas, Reflexos Brancos
             ========================================================= */}
          {mode === 'retro' && (
            <svg
              viewBox="0 0 100 110"
              className="w-full h-full overflow-visible"
              style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.35))' }}
            >
              <defs>
                {/* Vintage Tech Metal Chassis (Cinza / Grafite / Azul) */}
                <linearGradient id="retroMetalChassis" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="50%" stopColor="#64748b" />
                  <stop offset="100%" stopColor="#475569" />
                </linearGradient>
                {/* Classic Windows Blue Plate */}
                <linearGradient id="retroBluePlate" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#1e3a8a" />
                </linearGradient>
                {/* Eyepiece Casing */}
                <linearGradient id="retroEyeGoggle" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#cbd5e1" />
                  <stop offset="60%" stopColor="#64748b" />
                  <stop offset="100%" stopColor="#334155" />
                </linearGradient>
                {/* Tank Tread Dark Metal */}
                <linearGradient id="retroTreadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="50%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
              </defs>

              {/* ----------------- TOP ANTENNA ----------------- */}
              <g
                style={{
                  transformOrigin: '50px 20px',
                  transform: antennaGlowing ? 'rotate(10deg)' : 'none',
                  transition: 'transform 0.2s ease',
                }}
              >
                {/* Antenna Rod */}
                <line x1="50" y1="18" x2="50" y2="6" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
                {/* Antenna Tip Light */}
                <circle
                  cx="50"
                  cy="5"
                  r="3.5"
                  fill={antennaGlowing ? '#ef4444' : '#f59e0b'}
                  stroke="#000"
                  strokeWidth="0.8"
                  className={antennaGlowing ? 'animate-pulse' : ''}
                />
                {antennaGlowing && (
                  <circle cx="50" cy="5" r="6" fill="#ef4444" opacity="0.3" className="animate-ping" />
                )}
              </g>

              {/* ----------------- LEFT ROBOTIC ARM ----------------- */}
              <g
                style={{
                  transformOrigin: '22px 56px',
                  transform: isWaving
                    ? 'rotate(-55deg)'
                    : botState === 'dragging'
                    ? 'rotate(25deg)'
                    : 'rotate(-5deg)',
                  transition: 'transform 0.3s ease',
                }}
              >
                <circle cx="22" cy="56" r="4" fill="#334155" stroke="#000" strokeWidth="1" />
                <rect x="12" y="53" width="10" height="6" rx="2" fill="#64748b" stroke="#000" strokeWidth="1" />
                <rect x="5" y="54" width="7" height="4" fill="#94a3b8" stroke="#000" strokeWidth="0.8" />
                {/* Clamp Hand */}
                <path d="M 5 53 L 1 50 L 1 54 Z" fill="#475569" stroke="#000" strokeWidth="0.8" />
                <path d="M 5 57 L 1 60 L 1 56 Z" fill="#475569" stroke="#000" strokeWidth="0.8" />
              </g>

              {/* ----------------- RIGHT ROBOTIC ARM ----------------- */}
              <g
                style={{
                  transformOrigin: '78px 56px',
                  transform: isWaving
                    ? 'rotate(45deg)'
                    : botState === 'dragging'
                    ? 'rotate(-25deg)'
                    : botState === 'walking'
                    ? 'rotate(15deg)'
                    : 'rotate(5deg)',
                  transition: 'transform 0.3s ease',
                }}
              >
                <circle cx="78" cy="56" r="4" fill="#334155" stroke="#000" strokeWidth="1" />
                <rect x="78" y="53" width="10" height="6" rx="2" fill="#64748b" stroke="#000" strokeWidth="1" />
                <rect x="88" y="54" width="7" height="4" fill="#94a3b8" stroke="#000" strokeWidth="0.8" />
                <path d="M 95 53 L 99 50 L 99 54 Z" fill="#475569" stroke="#000" strokeWidth="0.8" />
                <path d="M 95 57 L 99 60 L 99 56 Z" fill="#475569" stroke="#000" strokeWidth="0.8" />
              </g>

              {/* ----------------- COMPACT MAIN BODY ----------------- */}
              {/* Main Box Chassis */}
              <rect
                x="24"
                y="48"
                width="52"
                height="38"
                rx="6"
                fill="url(#retroMetalChassis)"
                stroke="#000"
                strokeWidth="1.5"
              />
              {/* Corner Screws */}
              <circle cx="28" cy="52" r="1.2" fill="#1e293b" />
              <circle cx="72" cy="52" r="1.2" fill="#1e293b" />
              <circle cx="28" cy="82" r="1.2" fill="#1e293b" />
              <circle cx="72" cy="82" r="1.2" fill="#1e293b" />

              {/* Front Plate with Mateus OS Identity */}
              <rect x="30" y="53" width="40" height="28" rx="4" fill="url(#retroBluePlate)" stroke="#000" strokeWidth="1" />

              {/* Ventilation Slits */}
              <line x1="34" y1="58" x2="42" y2="58" stroke="#93c5fd" strokeWidth="1" />
              <line x1="34" y1="61" x2="42" y2="61" stroke="#93c5fd" strokeWidth="1" />

              {/* Status LEDs */}
              <circle cx="64" cy="58" r="1.8" fill="#22c55e" stroke="#000" strokeWidth="0.5" />
              <circle cx="60" cy="58" r="1.8" fill="#eab308" stroke="#000" strokeWidth="0.5" />

              {/* Discrete Mateus OS Emblem: "M" */}
              <rect x="42" y="66" width="16" height="11" rx="2" fill="#ffffff" stroke="#000" strokeWidth="0.8" />
              <text
                x="50"
                y="74.5"
                textAnchor="middle"
                fontSize="8"
                fontWeight="900"
                fontFamily="monospace"
                fill="#1e3a8a"
              >
                M
              </text>

              {/* ----------------- ARTICULATED SHORT NECK ----------------- */}
              <g
                style={{
                  transformOrigin: '50px 48px',
                  transform: `rotate(${headAngle}deg)`,
                  transition: 'transform 0.25s ease-out',
                }}
              >
                <rect x="46" y="38" width="8" height="12" rx="2" fill="#334155" stroke="#000" strokeWidth="1" />
                <circle cx="50" cy="40" r="3.5" fill="#64748b" stroke="#000" strokeWidth="1" />

                {/* ----------------- DUAL BIG EXPRESSIVE EYES ----------------- */}
                {/* LEFT EYE */}
                <g>
                  {/* Outer Bezel Goggle */}
                  <ellipse cx="34" cy="26" rx="14" ry="13" fill="url(#retroEyeGoggle)" stroke="#000" strokeWidth="1.5" />
                  
                  {/* FUNDO DO OLHO: BRANCO */}
                  <ellipse cx="34" cy="26" rx="11" ry="10" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />

                  {/* PUPILA PRETA COM MOVIMENTO INDEPENDENTE */}
                  <g
                    style={{
                      transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
                      transition: 'transform 0.15s cubic-bezier(0.2, 0.9, 0.3, 1.2)',
                    }}
                  >
                    {/* Pupila Preta */}
                    <circle cx="34" cy="26" r={isBlinking || botState === 'resting' ? 1.5 : 6.2} fill="#000000" />
                    
                    {/* REFLEXOS BRANCOS */}
                    {!isBlinking && botState !== 'resting' && (
                      <>
                        {/* Brilho Principal Branco */}
                        <circle cx="32" cy="23.5" r="2.2" fill="#ffffff" />
                        {/* Brilho Secundário Branco */}
                        <circle cx="36.5" cy="28.5" r="1.1" fill="#ffffff" />
                      </>
                    )}
                  </g>

                  {/* Pálpebra de Descanso / Piscar */}
                  {(isBlinking || botState === 'resting') && (
                    <line x1="23" y1="26" x2="45" y2="26" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
                  )}
                </g>

                {/* RIGHT EYE */}
                <g>
                  <ellipse cx="66" cy="26" rx="14" ry="13" fill="url(#retroEyeGoggle)" stroke="#000" strokeWidth="1.5" />
                  
                  {/* FUNDO DO OLHO: BRANCO */}
                  <ellipse cx="66" cy="26" rx="11" ry="10" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />

                  {/* PUPILA PRETA */}
                  <g
                    style={{
                      transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
                      transition: 'transform 0.15s cubic-bezier(0.2, 0.9, 0.3, 1.2)',
                    }}
                  >
                    <circle cx="66" cy="26" r={isBlinking || botState === 'resting' ? 1.5 : 6.2} fill="#000000" />
                    {!isBlinking && botState !== 'resting' && (
                      <>
                        <circle cx="64" cy="23.5" r="2.2" fill="#ffffff" />
                        <circle cx="68.5" cy="28.5" r="1.1" fill="#ffffff" />
                      </>
                    )}
                  </g>

                  {(isBlinking || botState === 'resting') && (
                    <line x1="55" y1="26" x2="77" y2="26" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
                  )}
                </g>
              </g>

              {/* ----------------- DUAL TANK TREADS ----------------- */}
              {/* Left Track */}
              <g>
                <path d="M 12 98 L 22 75 L 34 75 L 42 98 Z" fill="url(#retroTreadGrad)" stroke="#000" strokeWidth="1.5" />
                <circle cx="18" cy="93" r="4" fill="#475569" stroke="#000" strokeWidth="0.8" />
                <circle cx="28" cy="81" r="3.2" fill="#475569" stroke="#000" strokeWidth="0.8" />
                <circle cx="36" cy="93" r="4" fill="#475569" stroke="#000" strokeWidth="0.8" />
                <line x1="12" y1="98" x2="42" y2="98" stroke="#0f172a" strokeWidth="2.5" strokeDasharray={treadRolling ? "3,2" : "none"} />
              </g>

              {/* Right Track */}
              <g>
                <path d="M 58 98 L 66 75 L 78 75 L 88 98 Z" fill="url(#retroTreadGrad)" stroke="#000" strokeWidth="1.5" />
                <circle cx="64" cy="93" r="4" fill="#475569" stroke="#000" strokeWidth="0.8" />
                <circle cx="72" cy="81" r="3.2" fill="#475569" stroke="#000" strokeWidth="0.8" />
                <circle cx="82" cy="93" r="4" fill="#475569" stroke="#000" strokeWidth="0.8" />
                <line x1="58" y1="98" x2="88" y2="98" stroke="#0f172a" strokeWidth="2.5" strokeDasharray={treadRolling ? "3,2" : "none"} />
              </g>
            </svg>
          )}

          {/* =========================================================
              M-BOT 26 (SPACE 2026 CYBERNETIC EDITION)
              Paleta: Metal grafite escuro, azul profundo, cyan/neon LEDs
              OLHOS: FUNDO BRANCO, PUPILAS PRETAS, REFLEXOS BRANCOS
             ========================================================= */}
          {mode === 'space' && (
            <svg
              viewBox="0 0 100 110"
              className="w-full h-full overflow-visible"
              style={{ filter: `drop-shadow(0 0 10px ${spaceStyles.glow})` }}
            >
              <defs>
                {/* Space Titanium Dark Gradient */}
                <linearGradient id="spaceDarkMetal" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="50%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#020617" />
                </linearGradient>
              </defs>

              {/* ----------------- SPACE QUANTUM ANTENNA ----------------- */}
              <g
                style={{
                  transformOrigin: '50px 20px',
                  transform: antennaGlowing ? 'rotate(10deg)' : 'none',
                  transition: 'transform 0.2s ease',
                }}
              >
                <line x1="50" y1="18" x2="50" y2="6" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="50" cy="5" r="3.5" fill={spaceStyles.led} stroke="#0f172a" strokeWidth="0.8" />
                <circle cx="50" cy="5" r="6" fill={spaceStyles.led} opacity="0.35" className="animate-pulse" />
              </g>

              {/* ----------------- LEFT CYBER ARM ----------------- */}
              <g
                style={{
                  transformOrigin: '22px 56px',
                  transform: isWaving
                    ? 'rotate(-55deg)'
                    : botState === 'dragging'
                    ? 'rotate(25deg)'
                    : 'rotate(-5deg)',
                  transition: 'transform 0.3s ease',
                }}
              >
                <circle cx="22" cy="56" r="4" fill="#334155" stroke={spaceStyles.led} strokeWidth="1" />
                <rect x="12" y="53" width="10" height="6" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="1" />
                <rect x="5" y="54" width="7" height="4" fill={spaceStyles.accent} opacity="0.9" rx="1" />
              </g>

              {/* ----------------- RIGHT CYBER ARM ----------------- */}
              <g
                style={{
                  transformOrigin: '78px 56px',
                  transform: isWaving
                    ? 'rotate(45deg)'
                    : botState === 'dragging'
                    ? 'rotate(-25deg)'
                    : botState === 'walking'
                    ? 'rotate(15deg)'
                    : 'rotate(5deg)',
                  transition: 'transform 0.3s ease',
                }}
              >
                <circle cx="78" cy="56" r="4" fill="#334155" stroke={spaceStyles.led} strokeWidth="1" />
                <rect x="78" y="53" width="10" height="6" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="1" />
                <rect x="88" y="54" width="7" height="4" fill={spaceStyles.accent} opacity="0.9" rx="1" />
              </g>

              {/* ----------------- SPACE BODY CHASSIS ----------------- */}
              <rect
                x="24"
                y="48"
                width="52"
                height="38"
                rx="8"
                fill="url(#spaceDarkMetal)"
                stroke={spaceStyles.led}
                strokeWidth="1.2"
              />
              {/* Carbon Plate */}
              <rect x="29" y="53" width="42" height="28" rx="5" fill="#0f172a" stroke="#334155" strokeWidth="1" />

              {/* Telemetry Sensor Bar */}
              <line x1="33" y1="58" x2="45" y2="58" stroke={spaceStyles.led} strokeWidth="1.5" className="animate-pulse" />

              {/* Status LED Light */}
              <circle cx="66" cy="58" r="2" fill={spaceStyles.led} />

              {/* Mateus OS Space Emblem: M•26 */}
              <rect x="36" y="66" width="28" height="11" rx="3" fill="#020617" stroke={spaceStyles.led} strokeWidth="0.8" />
              <text
                x="50"
                y="74.5"
                textAnchor="middle"
                fontSize="7"
                fontWeight="900"
                fontFamily="monospace"
                fill={spaceStyles.led}
                letterSpacing="0.8"
              >
                M•26
              </text>

              {/* ----------------- ARTICULATED CYBER NECK ----------------- */}
              <g
                style={{
                  transformOrigin: '50px 48px',
                  transform: `rotate(${headAngle}deg)`,
                  transition: 'transform 0.25s ease-out',
                }}
              >
                <rect x="46" y="38" width="8" height="12" rx="3" fill="#334155" stroke="#475569" strokeWidth="1" />
                <circle cx="50" cy="40" r="3.5" fill="#0f172a" stroke={spaceStyles.led} strokeWidth="1" />

                {/* ----------------- DUAL EXPRESSIVE EYES (SPACE: SAME WHITE/BLACK FORMAT) ----------------- */}
                {/* LEFT EYE */}
                <g>
                  {/* Outer Rim */}
                  <ellipse cx="34" cy="26" rx="14" ry="13" fill="#0f172a" stroke={spaceStyles.led} strokeWidth="1.5" />
                  
                  {/* FUNDO DO OLHO: BRANCO PURO (NÃO NEON) */}
                  <ellipse cx="34" cy="26" rx="11" ry="10" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />

                  {/* PUPILA PRETA INDEPENDENTE */}
                  <g
                    style={{
                      transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
                      transition: 'transform 0.15s cubic-bezier(0.2, 0.9, 0.3, 1.2)',
                    }}
                  >
                    <circle cx="34" cy="26" r={isBlinking || botState === 'resting' ? 1.5 : 6.2} fill="#000000" />
                    
                    {/* REFLEXOS BRANCOS */}
                    {!isBlinking && botState !== 'resting' && (
                      <>
                        <circle cx="32" cy="23.5" r="2.2" fill="#ffffff" />
                        <circle cx="36.5" cy="28.5" r="1.1" fill="#ffffff" />
                      </>
                    )}
                  </g>

                  {(isBlinking || botState === 'resting') && (
                    <line x1="23" y1="26" x2="45" y2="26" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
                  )}
                </g>

                {/* RIGHT EYE */}
                <g>
                  <ellipse cx="66" cy="26" rx="14" ry="13" fill="#0f172a" stroke={spaceStyles.led} strokeWidth="1.5" />
                  
                  {/* FUNDO DO OLHO: BRANCO PURO */}
                  <ellipse cx="66" cy="26" rx="11" ry="10" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />

                  {/* PUPILA PRETA */}
                  <g
                    style={{
                      transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
                      transition: 'transform 0.15s cubic-bezier(0.2, 0.9, 0.3, 1.2)',
                    }}
                  >
                    <circle cx="66" cy="26" r={isBlinking || botState === 'resting' ? 1.5 : 6.2} fill="#000000" />
                    {!isBlinking && botState !== 'resting' && (
                      <>
                        <circle cx="64" cy="23.5" r="2.2" fill="#ffffff" />
                        <circle cx="68.5" cy="28.5" r="1.1" fill="#ffffff" />
                      </>
                    )}
                  </g>

                  {(isBlinking || botState === 'resting') && (
                    <line x1="55" y1="26" x2="77" y2="26" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
                  )}
                </g>
              </g>

              {/* ----------------- QUANTUM MAG-TREADS ----------------- */}
              <g>
                <path d="M 12 98 L 22 75 L 34 75 L 42 98 Z" fill="#0f172a" stroke={spaceStyles.led} strokeWidth="1.2" />
                <circle cx="18" cy="93" r="4" fill="#1e293b" />
                <circle cx="28" cy="81" r="3.2" fill="#1e293b" />
                <circle cx="36" cy="93" r="4" fill="#1e293b" />
                <line x1="14" y1="99" x2="40" y2="99" stroke={spaceStyles.led} strokeWidth="2" strokeDasharray={treadRolling ? "3,2" : "none"} />
              </g>

              <g>
                <path d="M 58 98 L 66 75 L 78 75 L 88 98 Z" fill="#0f172a" stroke={spaceStyles.led} strokeWidth="1.2" />
                <circle cx="64" cy="93" r="4" fill="#1e293b" />
                <circle cx="72" cy="81" r="3.2" fill="#1e293b" />
                <circle cx="82" cy="93" r="4" fill="#1e293b" />
                <line x1="60" y1="99" x2="86" y2="99" stroke={spaceStyles.led} strokeWidth="2" strokeDasharray={treadRolling ? "3,2" : "none"} />
              </g>
            </svg>
          )}
        </div>
      </div>

      {/* =========================================================
          M-BOT CONTEXT MENU (Right Click / Long Press)
         ========================================================= */}
      {menuOpen && (
        <div
          id="mbot-context-menu"
          style={{ top: `${menuOpen.y}px`, left: `${menuOpen.x}px` }}
          className={`fixed z-[999] w-48 shadow-2xl py-1 text-xs select-none animate-fadeIn ${
            mode === 'retro'
              ? 'bg-[#c0c0c0] border-2 border-white border-r-gray-800 border-b-gray-800 font-sans text-gray-900 shadow-[3px_3px_0px_#000]'
              : 'bg-slate-950/95 border border-cyan-500/40 text-slate-200 font-mono rounded-2xl backdrop-blur-2xl py-2'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={`px-3 py-1 font-bold text-[10px] flex items-center justify-between border-b ${
              mode === 'retro'
                ? 'bg-blue-900 text-white border-gray-400 mb-1'
                : 'text-cyan-300 border-white/10 mb-1.5'
            }`}
          >
            <span>{mode === 'retro' ? 'M-BOT COMPANION' : 'M-BOT // 2026'}</span>
            <span className="opacity-70">{config.behavior === 'roam' ? 'PASSEIO' : 'PARADO'}</span>
          </div>

          <button
            onClick={() => {
              setMenuOpen(null);
              handleBotClick({ stopPropagation: () => {} } as unknown as React.MouseEvent);
            }}
            className={`w-full text-left px-3 py-1.5 flex items-center gap-2 cursor-pointer ${
              mode === 'retro'
                ? 'hover:bg-blue-800 hover:text-white'
                : 'hover:bg-cyan-500/20 hover:text-cyan-300'
            }`}
          >
            <Smile className="w-3.5 h-3.5 text-amber-500" />
            <span>Interagir</span>
          </button>

          {mode === 'retro' && onLaunchTimeTravel && (
            <button
              onClick={() => {
                setMenuOpen(null);
                setShowSpaceInvitation(true);
              }}
              className="w-full text-left px-3 py-1.5 flex items-center gap-2 cursor-pointer font-bold text-blue-900 hover:bg-blue-800 hover:text-white"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Explorar o Space &gt;</span>
            </button>
          )}

          <button
            onClick={() => {
              updateConfig({ behavior: 'stay' });
              setBotState('idle');
              setMenuOpen(null);
              showQuickSpeech('Modo parado ativado.');
            }}
            className={`w-full text-left px-3 py-1.5 flex items-center gap-2 cursor-pointer ${
              mode === 'retro'
                ? 'hover:bg-blue-800 hover:text-white'
                : 'hover:bg-cyan-500/20 hover:text-cyan-300'
            } ${config.behavior === 'stay' ? 'font-bold' : ''}`}
          >
            <Square className="w-3.5 h-3.5 text-red-500" />
            <span>Ficar parado</span>
          </button>

          <button
            onClick={() => {
              updateConfig({ behavior: 'roam' });
              setBotState('idle');
              setMenuOpen(null);
              showQuickSpeech('Passeando pelo desktop!');
            }}
            className={`w-full text-left px-3 py-1.5 flex items-center gap-2 cursor-pointer ${
              mode === 'retro'
                ? 'hover:bg-blue-800 hover:text-white'
                : 'hover:bg-cyan-500/20 hover:text-cyan-300'
            } ${config.behavior === 'roam' ? 'font-bold' : ''}`}
          >
            <Compass className="w-3.5 h-3.5 text-blue-500" />
            <span>Passear pelo desktop</span>
          </button>

          <button
            onClick={() => {
              const nextSound = !config.sound;
              updateConfig({ sound: nextSound });
              if (nextSound) soundFx.playMBotChirp();
              setMenuOpen(null);
            }}
            className={`w-full text-left px-3 py-1.5 flex items-center gap-2 cursor-pointer ${
              mode === 'retro'
                ? 'hover:bg-blue-800 hover:text-white'
                : 'hover:bg-cyan-500/20 hover:text-cyan-300'
            }`}
          >
            {config.sound ? (
              <Volume2 className="w-3.5 h-3.5 text-green-600" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-gray-500" />
            )}
            <span>Sons: {config.sound ? 'LIGADO' : 'DESLIGADO'}</span>
          </button>

          <div
            className={`my-1 mx-1 border-b ${
              mode === 'retro' ? 'border-gray-400' : 'border-white/10'
            }`}
          />

          <button
            onClick={() => {
              setMenuOpen(null);
              if (onOpenSettings) onOpenSettings();
            }}
            className={`w-full text-left px-3 py-1.5 flex items-center gap-2 cursor-pointer ${
              mode === 'retro'
                ? 'hover:bg-blue-800 hover:text-white'
                : 'hover:bg-cyan-500/20 hover:text-cyan-300'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-blue-600" />
            <span>Personalização</span>
          </button>

          <button
            onClick={() => {
              updateConfig({ enabled: false });
              setMenuOpen(null);
            }}
            className={`w-full text-left px-3 py-1.5 flex items-center gap-2 cursor-pointer text-red-600 ${
              mode === 'retro' ? 'hover:bg-red-800 hover:text-white' : 'hover:bg-red-950/80 hover:text-red-300'
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
