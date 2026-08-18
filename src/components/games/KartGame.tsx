import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Play, RotateCcw, Zap, Sparkles, Volume2, Flag, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../utils/soundEffects';

interface Character {
  id: string;
  name: string;
  color: string;
  kartColor: string;
  speed: number;
  accel: number;
  handling: number;
  icon: string;
}

const CHARACTERS: Character[] = [
  { id: 'mario', name: 'Mario', color: '#ef4444', kartColor: '#dc2626', speed: 85, accel: 80, handling: 80, icon: '🔴' },
  { id: 'luigi', name: 'Luigi', color: '#22c55e', kartColor: '#16a34a', speed: 82, accel: 85, handling: 85, icon: '🟢' },
  { id: 'toad', name: 'Toad', color: '#38bdf8', kartColor: '#0284c7', speed: 78, accel: 95, handling: 90, icon: '🍄' },
  { id: 'yoshi', name: 'Yoshi', color: '#84cc16', kartColor: '#65a30d', speed: 86, accel: 88, handling: 82, icon: '🦖' },
  { id: 'peach', name: 'Peach', color: '#f472b6', kartColor: '#db2777', speed: 80, accel: 90, handling: 88, icon: '👑' },
  { id: 'bowser', name: 'Bowser', color: '#f97316', kartColor: '#ea580c', speed: 95, accel: 65, handling: 60, icon: '🐢' },
];

interface Track {
  id: string;
  name: string;
  theme: 'grass' | 'desert' | 'castle' | 'rainbow';
  skyColor: string;
  groundColor: string;
  roadColor: string;
  curbColor1: string;
  curbColor2: string;
}

const TRACKS: Track[] = [
  { id: 'circuit', name: 'Mario Circuit 2000', theme: 'grass', skyColor: '#38bdf8', groundColor: '#15803d', roadColor: '#475569', curbColor1: '#ef4444', curbColor2: '#ffffff' },
  { id: 'desert', name: 'Choco Desert 2000', theme: 'desert', skyColor: '#fde047', groundColor: '#d97706', roadColor: '#78350f', curbColor1: '#f97316', curbColor2: '#fde68a' },
  { id: 'castle', name: 'Bowser Castle 2000', theme: 'castle', skyColor: '#0f172a', groundColor: '#1e1b4b', roadColor: '#1e293b', curbColor1: '#a855f7', curbColor2: '#ffffff' },
  { id: 'rainbow', name: 'Rainbow Road 2000', theme: 'rainbow', skyColor: '#030712', groundColor: '#312e81', roadColor: '#4338ca', curbColor1: '#ec4899', curbColor2: '#06b6d4' },
];

type ItemType = 'mushroom' | 'banana' | 'greenshell' | 'redshell' | 'star' | null;

interface KartOpponent {
  id: string;
  char: Character;
  trackPos: number; // 0 to 1000
  lane: number; // -1 to 1
  speed: number;
}

export const KartGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [selectedChar, setSelectedChar] = useState<Character>(CHARACTERS[0]);
  const [selectedTrack, setSelectedTrack] = useState<Track>(TRACKS[0]);

  // Race State
  const [gameState, setGameState] = useState<'menu' | 'countdown' | 'racing' | 'finished'>('menu');
  const [countdown, setCountdown] = useState<number>(3);
  const [currentLap, setCurrentLap] = useState<number>(1);
  const TOTAL_LAPS = 3;
  const [position, setPosition] = useState<number>(8);
  const [speedKmh, setSpeedKmh] = useState<number>(0);
  const [heldItem, setHeldItem] = useState<ItemType>(null);
  const [isItemRolling, setIsItemRolling] = useState<boolean>(false);
  const [invincibleTimer, setInvincibleTimer] = useState<number>(0);
  const [raceTime, setRaceTime] = useState<number>(0);

  // Player physics
  const playerRef = useRef({
    x: 0, // -1 to 1 on track width
    distance: 0,
    speed: 0,
    maxSpeed: 120,
    accel: 0.6,
    brake: 0.8,
    angle: 0,
    drift: 0,
    spinOutTimer: 0,
  });

  // Track & Road curve parameters
  const trackCurveRef = useRef({
    curve: 0,
    targetCurve: 0,
    segment: 0,
  });

  // Item Boxes on track
  const itemBoxesRef = useRef<{ dist: number; lane: number; active: boolean }[]>([
    { dist: 150, lane: -0.5, active: true },
    { dist: 150, lane: 0, active: true },
    { dist: 150, lane: 0.5, active: true },
    { dist: 450, lane: -0.4, active: true },
    { dist: 450, lane: 0.4, active: true },
    { dist: 750, lane: 0, active: true },
  ]);

  // Active hazards (Bananas & Shells)
  const hazardsRef = useRef<{ type: 'banana' | 'shell'; dist: number; lane: number; speed: number }[]>([]);

  // Opponents AI
  const opponentsRef = useRef<KartOpponent[]>([]);

  // Controls input state
  const keysRef = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
    useItem: false,
    drift: false,
  });

  // Initialize Opponents
  const initOpponents = () => {
    const others = CHARACTERS.filter((c) => c.id !== selectedChar.id);
    opponentsRef.current = others.map((char, idx) => ({
      id: char.id,
      char,
      trackPos: 50 + idx * 80,
      lane: (idx % 3 - 1) * 0.5,
      speed: 85 + Math.random() * 25,
    }));
  };

  // Start Countdown & Race
  const startRace = () => {
    try {
      soundFx.playClick();
    } catch (e) {}

    initOpponents();
    playerRef.current = {
      x: 0,
      distance: 0,
      speed: 0,
      maxSpeed: selectedChar.speed * 1.35,
      accel: selectedChar.accel * 0.008,
      brake: 0.8,
      angle: 0,
      drift: 0,
      spinOutTimer: 0,
    };
    hazardsRef.current = [];
    setCurrentLap(1);
    setPosition(8);
    setHeldItem(null);
    setInvincibleTimer(0);
    setRaceTime(0);
    setGameState('countdown');
    setCountdown(3);

    // 3, 2, 1, GO!
    let cd = 3;
    const interval = setInterval(() => {
      cd -= 1;
      setCountdown(cd);
      try {
        soundFx.playNotification();
      } catch (e) {}

      if (cd <= 0) {
        clearInterval(interval);
        setGameState('racing');
        try {
          soundFx.playFanfare();
        } catch (e) {}
      }
    }, 900);
  };

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keysRef.current.up = true;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keysRef.current.down = true;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keysRef.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = true;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        useItemAction();
      }
      if (e.key === 'Shift') keysRef.current.drift = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keysRef.current.up = false;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keysRef.current.down = false;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keysRef.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = false;
      if (e.key === 'Shift') keysRef.current.drift = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [heldItem, gameState]);

  // Roll item roulette
  const rollItem = () => {
    if (heldItem || isItemRolling) return;
    setIsItemRolling(true);
    try {
      soundFx.playPowerup();
    } catch (e) {}

    const possibleItems: ItemType[] = ['mushroom', 'banana', 'greenshell', 'redshell', 'star'];
    let rolls = 0;
    const interval = setInterval(() => {
      rolls++;
      const randomItem = possibleItems[Math.floor(Math.random() * possibleItems.length)];
      setHeldItem(randomItem);

      if (rolls > 12) {
        clearInterval(interval);
        setIsItemRolling(false);
        try {
          soundFx.playNotification();
        } catch (e) {}
      }
    }, 100);
  };

  // Use currently held item
  const useItemAction = () => {
    if (!heldItem || isItemRolling || gameState !== 'racing') return;
    try {
      soundFx.playPowerup();
    } catch (e) {}

    if (heldItem === 'mushroom') {
      try {
        soundFx.playBoost();
      } catch (e) {}
      playerRef.current.speed = Math.min(playerRef.current.maxSpeed * 1.5, 175);
    } else if (heldItem === 'banana') {
      hazardsRef.current.push({
        type: 'banana',
        dist: playerRef.current.distance - 20,
        lane: playerRef.current.x,
        speed: 0,
      });
    } else if (heldItem === 'greenshell') {
      hazardsRef.current.push({
        type: 'shell',
        dist: playerRef.current.distance + 30,
        lane: playerRef.current.x,
        speed: 160,
      });
    } else if (heldItem === 'redshell') {
      hazardsRef.current.push({
        type: 'shell',
        dist: playerRef.current.distance + 30,
        lane: 0,
        speed: 180,
      });
    } else if (heldItem === 'star') {
      try {
        soundFx.playBoost();
      } catch (e) {}
      setInvincibleTimer(200); // frames of invincibility
      playerRef.current.speed = playerRef.current.maxSpeed * 1.3;
    }

    setHeldItem(null);
  };

  // Main Game Loop
  useEffect(() => {
    if (gameState !== 'racing') return;

    let animId: number;
    const TRACK_LENGTH = 1000;

    const gameLoop = () => {
      const p = playerRef.current;
      setRaceTime((t) => t + 0.016);

      // Spinout penalty check
      if (p.spinOutTimer > 0) {
        p.spinOutTimer--;
        p.speed *= 0.92;
      } else {
        // Acceleration / Braking
        if (keysRef.current.up) {
          p.speed = Math.min(p.speed + p.accel, p.maxSpeed);
        } else if (keysRef.current.down) {
          p.speed = Math.max(p.speed - p.brake, -20);
        } else {
          p.speed = Math.max(0, p.speed - 0.2); // Friction
        }

        // Steering
        if (keysRef.current.left) {
          p.x -= (0.025 * (p.speed / p.maxSpeed)) * (keysRef.current.drift ? 1.4 : 1);
          p.angle = -0.15;
        } else if (keysRef.current.right) {
          p.x += (0.025 * (p.speed / p.maxSpeed)) * (keysRef.current.drift ? 1.4 : 1);
          p.angle = 0.15;
        } else {
          p.angle = 0;
        }
      }

      // Off-road penalty
      if (Math.abs(p.x) > 0.9) {
        p.speed = Math.min(p.speed, 45); // Slow down on grass/sand
      }

      // Keep player inside bounds
      p.x = Math.max(-1.3, Math.min(1.3, p.x));

      // Advance distance
      p.distance += p.speed * 0.08;

      // Update Track Curves dynamically
      const curSegment = Math.floor(p.distance / 200) % 5;
      if (curSegment === 1) trackCurveRef.current.targetCurve = 0.6; // Right turn
      else if (curSegment === 3) trackCurveRef.current.targetCurve = -0.6; // Left turn
      else trackCurveRef.current.targetCurve = 0; // Straight

      trackCurveRef.current.curve += (trackCurveRef.current.targetCurve - trackCurveRef.current.curve) * 0.04;

      // Check Lap Completion
      if (p.distance >= TRACK_LENGTH) {
        p.distance -= TRACK_LENGTH;
        if (currentLap >= TOTAL_LAPS) {
          setGameState('finished');
          try {
            soundFx.playFanfare();
          } catch (e) {}
          confetti({ particleCount: 150, spread: 90 });
          return;
        } else {
          setCurrentLap((l) => l + 1);
          try {
            soundFx.playNotification();
          } catch (e) {}
        }
      }

      // Update Opponents
      opponentsRef.current.forEach((opp) => {
        opp.trackPos += opp.speed * 0.08;
        if (opp.trackPos >= TRACK_LENGTH) opp.trackPos -= TRACK_LENGTH;
      });

      // Calculate Player Rank Position (1st to 8th)
      const allRacers = [
        { id: 'player', dist: (currentLap - 1) * TRACK_LENGTH + p.distance },
        ...opponentsRef.current.map((opp) => ({ id: opp.id, dist: (currentLap - 1) * TRACK_LENGTH + opp.trackPos })),
      ];
      allRacers.sort((a, b) => b.dist - a.dist);
      const playerRank = allRacers.findIndex((r) => r.id === 'player') + 1;
      setPosition(playerRank);

      // Check Item Box Collisions
      itemBoxesRef.current.forEach((box) => {
        const distDiff = Math.abs(p.distance - box.dist);
        const laneDiff = Math.abs(p.x - box.lane);
        if (distDiff < 15 && laneDiff < 0.35 && box.active) {
          box.active = false;
          rollItem();
          setTimeout(() => {
            box.active = true;
          }, 5000);
        }
      });

      // Check Hazard Collisions
      hazardsRef.current.forEach((h, idx) => {
        h.dist += h.speed * 0.08;
        const distDiff = Math.abs(p.distance - h.dist);
        const laneDiff = Math.abs(p.x - h.lane);

        if (distDiff < 18 && laneDiff < 0.25 && p.spinOutTimer === 0 && invincibleTimer === 0) {
          p.spinOutTimer = 45; // Spin out!
          try {
            soundFx.playWindowClose();
          } catch (e) {}
          hazardsRef.current.splice(idx, 1);
        }
      });

      if (invincibleTimer > 0) setInvincibleTimer((t) => t - 1);
      setSpeedKmh(Math.round(p.speed));

      // Draw Canvas
      renderRace();

      animId = requestAnimationFrame(gameLoop);
    };

    const renderRace = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const p = playerRef.current;
      const t = selectedTrack;

      // 1. Sky & Horizon
      ctx.fillStyle = t.skyColor;
      ctx.fillRect(0, 0, canvas.width, 110);

      // Distant mountains / castle decor
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const mx = ((i * 90) - (p.distance * 0.2)) % (canvas.width + 100);
        ctx.moveTo(mx, 110);
        ctx.lineTo(mx + 45, 60);
        ctx.lineTo(mx + 90, 110);
        ctx.fill();
      }

      // 2. Mode 7 / Pseudo 3D Road Perspective
      const horizonY = 110;
      const roadH = canvas.height - horizonY;

      for (let y = 0; y < roadH; y += 4) {
        const perspective = y / roadH; // 0 (horizon) to 1 (near bottom)
        const screenY = horizonY + y;

        // Ground color
        const isGroundStripe = Math.floor((p.distance + y * 2) / 20) % 2 === 0;
        ctx.fillStyle = isGroundStripe ? t.groundColor : '#0f5132';
        ctx.fillRect(0, screenY, canvas.width, 4);

        // Road Width at this perspective
        const roadW = (120 + perspective * 340);
        const curveOffset = Math.sin(perspective * Math.PI / 2) * trackCurveRef.current.curve * 120;
        const roadCenterX = canvas.width / 2 + curveOffset - (p.x * 120 * perspective);

        // Road asphalt
        ctx.fillStyle = t.roadColor;
        ctx.fillRect(roadCenterX - roadW / 2, screenY, roadW, 4);

        // Curbs (Zebra stripes on sides)
        const curbW = 10 + perspective * 18;
        const isCurbStripe = Math.floor((p.distance + y * 3) / 16) % 2 === 0;
        ctx.fillStyle = isCurbStripe ? t.curbColor1 : t.curbColor2;

        // Left curb
        ctx.fillRect(roadCenterX - roadW / 2 - curbW, screenY, curbW, 4);
        // Right curb
        ctx.fillRect(roadCenterX + roadW / 2, screenY, curbW, 4);
      }

      // 3. Render Item Boxes & Hazards on Track
      itemBoxesRef.current.forEach((box) => {
        const relDist = box.dist - (p.distance % 1000);
        if (relDist > 0 && relDist < 250 && box.active) {
          const depth = 1 - relDist / 250;
          const boxY = horizonY + depth * roadH;
          const boxX = canvas.width / 2 + (box.lane - p.x) * 220 * depth;
          const size = 12 + depth * 16;

          ctx.fillStyle = '#facc15';
          ctx.fillRect(boxX - size / 2, boxY - size, size, size);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.strokeRect(boxX - size / 2, boxY - size, size, size);
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 10px monospace';
          ctx.fillText('?', boxX - 3, boxY - size / 3);
        }
      });

      // 4. Render Opponent Karts
      opponentsRef.current.forEach((opp) => {
        const relDist = opp.trackPos - (p.distance % 1000);
        if (relDist > -30 && relDist < 300) {
          const depth = 1 - relDist / 300;
          if (depth > 0.1 && depth < 1.1) {
            const oppY = horizonY + depth * roadH;
            const oppX = canvas.width / 2 + (opp.lane - p.x) * 220 * depth;
            const size = 16 + depth * 22;

            // Opponent Kart Body
            ctx.fillStyle = opp.char.kartColor;
            ctx.fillRect(oppX - size / 2, oppY - size, size, size * 0.7);
            ctx.fillStyle = opp.char.color;
            ctx.beginPath();
            ctx.arc(oppX, oppY - size * 0.8, size * 0.3, 0, Math.PI * 2);
            ctx.fill();
            // Kart wheels
            ctx.fillStyle = '#000000';
            ctx.fillRect(oppX - size * 0.6, oppY - size * 0.5, size * 0.25, size * 0.4);
            ctx.fillRect(oppX + size * 0.35, oppY - size * 0.5, size * 0.25, size * 0.4);
          }
        }
      });

      // 5. Render Player's Kart (Centered near bottom)
      ctx.save();
      const playerScreenX = canvas.width / 2;
      const playerScreenY = canvas.height - 35;

      ctx.translate(playerScreenX, playerScreenY);
      if (p.spinOutTimer > 0) {
        ctx.rotate(p.spinOutTimer * 0.4);
      } else {
        ctx.rotate(p.angle);
      }

      // Kart Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(0, 10, 24, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Kart Tires
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-22, -8, 8, 16); // Left tire
      ctx.fillRect(14, -8, 8, 16); // Right tire
      ctx.fillRect(-20, 4, 7, 14); // Left rear
      ctx.fillRect(13, 4, 7, 14); // Right rear

      // Kart Body
      ctx.fillStyle = selectedChar.kartColor;
      ctx.fillRect(-16, -14, 32, 26);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-16, -14, 32, 26);

      // Character Hat / Head
      ctx.fillStyle = selectedChar.color;
      ctx.beginPath();
      ctx.arc(0, -18, 10, 0, Math.PI * 2);
      ctx.fill();

      // Steering wheel
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-8, -10, 16, 4);

      // Exhaust Boost Flames if speed high or star
      if (p.speed > p.maxSpeed * 0.95 || invincibleTimer > 0) {
        ctx.fillStyle = invincibleTimer > 0 ? '#facc15' : '#ef4444';
        ctx.beginPath();
        ctx.moveTo(-10, 12);
        ctx.lineTo(-6, 24 + Math.random() * 8);
        ctx.lineTo(-2, 12);
        ctx.moveTo(2, 12);
        ctx.lineTo(6, 24 + Math.random() * 8);
        ctx.lineTo(10, 12);
        ctx.fill();
      }

      ctx.restore();
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, currentLap, selectedTrack, selectedChar, heldItem, isItemRolling, invincibleTimer]);

  return (
    <div className="bg-[#1e1b4b] p-4 md:p-5 border-2 border-white border-r-gray-900 border-b-gray-900 text-white space-y-4 rounded shadow-2xl font-sans select-none max-w-2xl mx-auto">
      {/* Arcade Header */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-indigo-950 p-3 rounded border border-red-500/40 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="p-1 bg-red-600 text-white font-black rounded text-xs">SUPER KART 2000</span>
          <span className="font-bold text-yellow-300">MARIO KART GP 2000</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-yellow-400 font-bold bg-black/60 px-2.5 py-0.5 rounded border border-yellow-500">
            {gameState === 'racing' ? `VOLTA: ${currentLap} / ${TOTAL_LAPS}` : 'PRONTO PARA CORRER'}
          </span>
          <button
            onClick={startRace}
            className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded flex items-center gap-1 border border-white cursor-pointer text-[11px] shadow"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{gameState === 'racing' ? 'Reiniciar' : 'Iniciar Corrida'}</span>
          </button>
        </div>
      </div>

      {/* Character & Track Selectors */}
      {gameState === 'menu' && (
        <div className="space-y-3 bg-slate-900/90 p-4 rounded-lg border border-slate-700 font-mono text-xs">
          <div>
            <span className="text-yellow-300 font-bold block mb-1">1. Escolha seu Piloto:</span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {CHARACTERS.map((char) => (
                <button
                  key={char.id}
                  onClick={() => setSelectedChar(char)}
                  className={`p-2 rounded border flex flex-col items-center gap-1 cursor-pointer transition ${
                    selectedChar.id === char.id
                      ? 'bg-red-600 border-yellow-300 ring-2 ring-yellow-400 font-bold scale-105'
                      : 'bg-slate-800 border-slate-600 hover:bg-slate-700'
                  }`}
                >
                  <span className="text-xl">{char.icon}</span>
                  <span className="text-[11px]">{char.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-yellow-300 font-bold block mb-1">2. Escolha o Grande Prêmio:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TRACKS.map((tr) => (
                <button
                  key={tr.id}
                  onClick={() => setSelectedTrack(tr)}
                  className={`p-2 rounded border text-center cursor-pointer transition text-[11px] ${
                    selectedTrack.id === tr.id
                      ? 'bg-indigo-600 border-yellow-300 ring-2 ring-yellow-400 font-bold'
                      : 'bg-slate-800 border-slate-600 hover:bg-slate-700'
                  }`}
                >
                  {tr.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startRace}
            className="w-full py-3.5 bg-gradient-to-r from-red-600 via-amber-500 to-yellow-500 hover:from-red-500 hover:to-amber-400 text-slate-950 font-black text-sm rounded-lg shadow-xl flex items-center justify-center gap-2 cursor-pointer transition transform active:scale-98"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>LARGADA! INICIAR CORRIDA GP</span>
          </button>
        </div>
      )}

      {/* Main Race Canvas Screen */}
      <div className="relative flex justify-center bg-black p-2 rounded-lg border-2 border-indigo-500 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={380}
          height={260}
          className="border border-indigo-400/40 bg-black rounded"
        />

        {/* In-Game HUD Overlays */}
        {gameState === 'racing' && (
          <>
            {/* Top-Left: Position Rank (1st, 2nd, etc.) */}
            <div className="absolute top-4 left-4 bg-black/80 px-3 py-1.5 rounded-lg border-2 border-yellow-400 font-mono shadow-lg flex items-center gap-1.5">
              <span className="text-2xl font-black text-yellow-300 leading-none">{position}º</span>
              <span className="text-[10px] text-slate-300 uppercase">LUGAR</span>
            </div>

            {/* Top-Right: Item Box Slot */}
            <div className="absolute top-4 right-4 bg-black/80 p-2 rounded-lg border-2 border-yellow-400 font-mono shadow-lg flex flex-col items-center">
              <span className="text-[9px] text-yellow-300 font-bold mb-0.5">ITEM [ESPAÇO]</span>
              <div
                onClick={useItemAction}
                className="w-10 h-10 bg-slate-900 border border-slate-600 rounded flex items-center justify-center text-xl cursor-pointer hover:scale-105 active:scale-95 transition"
                title="Clique ou aperte Espaço para usar item"
              >
                {isItemRolling ? (
                  <span className="animate-spin text-yellow-300">🎲</span>
                ) : heldItem === 'mushroom' ? (
                  '🍄'
                ) : heldItem === 'banana' ? (
                  '🍌'
                ) : heldItem === 'greenshell' ? (
                  '🐢'
                ) : heldItem === 'redshell' ? (
                  '🔴'
                ) : heldItem === 'star' ? (
                  '⭐'
                ) : (
                  <span className="text-slate-600 text-xs">VAZIO</span>
                )}
              </div>
            </div>

            {/* Bottom-Right: Speedometer */}
            <div className="absolute bottom-4 right-4 bg-black/85 px-3 py-1 rounded border border-slate-600 font-mono text-right shadow">
              <div className="text-lg font-black text-emerald-400 leading-none">{speedKmh} <span className="text-[10px]">KM/H</span></div>
              <div className="text-[9px] text-slate-400">VOLTA {currentLap}/{TOTAL_LAPS}</div>
            </div>
          </>
        )}

        {/* Countdown Overlay */}
        {gameState === 'countdown' && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center font-mono">
            <div className="text-6xl font-black text-yellow-400 animate-bounce">{countdown}</div>
            <div className="text-sm font-bold text-white tracking-widest mt-2">PREPARE OS MOTORES!</div>
          </div>
        )}

        {/* Race Finished Podium Overlay */}
        {gameState === 'finished' && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center font-mono text-center p-4 space-y-3">
            <Trophy className="w-12 h-12 text-yellow-400 animate-bounce" />
            <div className="text-2xl font-black text-yellow-300">
              {position === 1 ? '🥇 1º LUGAR! CAMPEÃO DO GP!' : `${position}º LUGAR NO PÓDIO!`}
            </div>
            <p className="text-xs text-slate-300">
              Piloto: <strong className="text-white">{selectedChar.name}</strong> | Pista: <strong className="text-white">{selectedTrack.name}</strong>
            </p>
            <div className="flex gap-2">
              <button
                onClick={startRace}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-xs rounded cursor-pointer shadow"
              >
                Correr Novamente
              </button>
              <button
                onClick={() => setGameState('menu')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded border border-slate-600 cursor-pointer"
              >
                Mudar Piloto / Pista
              </button>
            </div>
          </div>
        )}
      </div>

      {/* On-Screen Touch / Keyboard Controls */}
      <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        {/* Virtual Directional D-Pad */}
        <div className="flex items-center gap-1">
          <button
            onMouseDown={() => (keysRef.current.left = true)}
            onMouseUp={() => (keysRef.current.left = false)}
            onTouchStart={() => (keysRef.current.left = true)}
            onTouchEnd={() => (keysRef.current.left = false)}
            className="w-10 h-10 bg-slate-800 hover:bg-slate-700 active:bg-yellow-500 active:text-black rounded border border-slate-600 flex items-center justify-center font-bold text-base cursor-pointer"
          >
            ◄
          </button>
          <div className="flex flex-col gap-1">
            <button
              onMouseDown={() => (keysRef.current.up = true)}
              onMouseUp={() => (keysRef.current.up = false)}
              onTouchStart={() => (keysRef.current.up = true)}
              onTouchEnd={() => (keysRef.current.up = false)}
              className="w-10 h-8 bg-slate-800 hover:bg-slate-700 active:bg-green-500 active:text-black rounded border border-slate-600 flex items-center justify-center font-bold text-xs cursor-pointer"
            >
              ▲ ACEL
            </button>
            <button
              onMouseDown={() => (keysRef.current.down = true)}
              onMouseUp={() => (keysRef.current.down = false)}
              onTouchStart={() => (keysRef.current.down = true)}
              onTouchEnd={() => (keysRef.current.down = false)}
              className="w-10 h-8 bg-slate-800 hover:bg-slate-700 active:bg-red-500 active:text-black rounded border border-slate-600 flex items-center justify-center font-bold text-xs cursor-pointer"
            >
              ▼ FREIO
            </button>
          </div>
          <button
            onMouseDown={() => (keysRef.current.right = true)}
            onMouseUp={() => (keysRef.current.right = false)}
            onTouchStart={() => (keysRef.current.right = true)}
            onTouchEnd={() => (keysRef.current.right = false)}
            className="w-10 h-10 bg-slate-800 hover:bg-slate-700 active:bg-yellow-500 active:text-black rounded border border-slate-600 flex items-center justify-center font-bold text-base cursor-pointer"
          >
            ►
          </button>
        </div>

        {/* Action Button: Use Item */}
        <div className="flex items-center gap-2">
          <button
            onClick={useItemAction}
            className="px-4 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black rounded-lg shadow-lg flex items-center gap-1.5 cursor-pointer text-xs active:scale-95"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>USAR PODER / ITEM</span>
          </button>

          <button
            onMouseDown={() => (keysRef.current.drift = true)}
            onMouseUp={() => (keysRef.current.drift = false)}
            onTouchStart={() => (keysRef.current.drift = true)}
            onTouchEnd={() => (keysRef.current.drift = false)}
            className="px-3 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg border border-indigo-400 cursor-pointer text-xs active:scale-95"
          >
            DRIFT
          </button>
        </div>
      </div>
    </div>
  );
};
