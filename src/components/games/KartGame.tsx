import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, RotateCcw, Trophy, Volume2, Sparkles, Flag, Gauge, Play, Pause, ChevronLeft, ChevronRight, Zap, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../utils/soundEffects';
import { getGameHighScore, saveGameHighScore, saveGameBestTime, getGameBestTime, setGameActiveStatus } from '../../utils/gameStorage';

interface KartGameProps {
  onBackToHub?: () => void;
  mode?: 'retro' | 'space';
}

interface Racer {
  id: string;
  name: string;
  color: string;
  kartColor: string;
  avatar: string;
  maxSpeed: number;
  accel: number;
  turnSpeed: number;
}

const RACERS: Racer[] = [
  { id: 'mateus', name: 'Mateus (Pro)', color: '#3b82f6', kartColor: '#1d4ed8', avatar: '🏎️', maxSpeed: 6.8, accel: 0.14, turnSpeed: 0.055 },
  { id: 'cyber_ace', name: 'Cyber Ace', color: '#06b6d4', kartColor: '#0891b2', avatar: '⚡', maxSpeed: 6.6, accel: 0.15, turnSpeed: 0.052 },
  { id: 'nova', name: 'Nova', color: '#ec4899', kartColor: '#be185d', avatar: '🚀', maxSpeed: 6.7, accel: 0.13, turnSpeed: 0.058 },
  { id: 'pixel_fox', name: 'Pixel Fox', color: '#f97316', kartColor: '#c2410c', avatar: '🦊', maxSpeed: 6.5, accel: 0.16, turnSpeed: 0.055 },
  { id: 'viper', name: 'Viper Turbo', color: '#10b981', kartColor: '#047857', avatar: '🐍', maxSpeed: 6.9, accel: 0.12, turnSpeed: 0.048 },
  { id: 'titan', name: 'Titan Drift', color: '#eab308', kartColor: '#a16207', avatar: '🛡️', maxSpeed: 7.0, accel: 0.11, turnSpeed: 0.045 },
  { id: 'blaze', name: 'Blaze 2000', color: '#ef4444', kartColor: '#b91c1c', avatar: '🔥', maxSpeed: 6.7, accel: 0.14, turnSpeed: 0.050 },
  { id: 'echo', name: 'Echo Vector', color: '#a855f7', kartColor: '#7e22ce', avatar: '🛸', maxSpeed: 6.6, accel: 0.15, turnSpeed: 0.054 },
];

interface Waypoint {
  x: number;
  y: number;
}

interface TrackDef {
  id: string;
  name: string;
  theme: string;
  waypoints: Waypoint[];
  boostPads: { x: number; y: number }[];
  grassColor: string;
  roadColor: string;
  curbColor: string;
}

const TRACK_CIRCUIT: TrackDef = {
  id: 'circuit',
  name: 'Circuito Retro 2000',
  theme: 'Grama Clássica & Asfalto',
  grassColor: '#15803d',
  roadColor: '#334155',
  curbColor: '#ef4444',
  waypoints: [
    { x: 120, y: 380 },
    { x: 120, y: 180 },
    { x: 180, y: 100 },
    { x: 340, y: 90 },
    { x: 480, y: 110 },
    { x: 560, y: 180 },
    { x: 550, y: 320 },
    { x: 440, y: 400 },
    { x: 330, y: 320 },
    { x: 260, y: 410 },
    { x: 160, y: 420 },
  ],
  boostPads: [
    { x: 120, y: 240 },
    { x: 400, y: 95 },
    { x: 480, y: 380 },
  ],
};

interface KartState {
  racer: Racer;
  x: number;
  y: number;
  angle: number;
  speed: number;
  lap: number;
  nextCheckpoint: number;
  progress: number;
  rank: number;
  boostTimer: number;
  isPlayer: boolean;
}

export const KartGame: React.FC<KartGameProps> = ({
  onBackToHub,
  mode = 'retro',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [selectedRacer, setSelectedRacer] = useState<Racer>(RACERS[0]);
  const [countdown, setCountdown] = useState<number | null>(null); // 3, 2, 1, 0 (GO!)
  const [raceActive, setRaceActive] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [currentLap, setCurrentLap] = useState<number>(1);
  const [playerRank, setPlayerRank] = useState<number>(1);
  const [speedKmh, setSpeedKmh] = useState<number>(0);
  const [raceTime, setRaceTime] = useState<number>(0);
  const [bestLapTime, setBestLapTime] = useState<number | null>(null);
  const [finalStandings, setFinalStandings] = useState<KartState[]>([]);
  const [respawnCooldown, setRespawnCooldown] = useState<boolean>(false);

  // Notify M-BOT
  useEffect(() => {
    setGameActiveStatus(true, 'Kart Racing');
    return () => setGameActiveStatus(false);
  }, []);

  const keys = useRef<{ up: boolean; down: boolean; left: boolean; right: boolean }>({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  const kartsRef = useRef<KartState[]>([]);
  const lapStartTimesRef = useRef<number[]>([0, 0, 0, 0]);
  const raceStartTimeRef = useRef<number>(0);

  // Start Race Sequence with 3-2-1-GO!
  const startRaceCountdown = () => {
    try {
      soundFx.playClick();
    } catch (e) {}

    // Place racers on grid
    const wp0 = TRACK_CIRCUIT.waypoints[0];
    const wp1 = TRACK_CIRCUIT.waypoints[1];
    const initialAngle = Math.atan2(wp1.y - wp0.y, wp1.x - wp0.x);

    const initialKarts: KartState[] = RACERS.map((racer, idx) => {
      const isPlayer = racer.id === selectedRacer.id;
      // Staggered starting grid
      const gridRow = Math.floor(idx / 2);
      const gridCol = idx % 2 === 0 ? -12 : 12;
      const startX = wp0.x + gridCol;
      const startY = wp0.y + gridRow * 28;

      return {
        racer: isPlayer ? selectedRacer : racer,
        x: startX,
        y: startY,
        angle: initialAngle,
        speed: 0,
        lap: 1,
        nextCheckpoint: 1,
        progress: 0,
        rank: idx + 1,
        boostTimer: 0,
        isPlayer,
      };
    });

    kartsRef.current = initialKarts;
    setCountdown(3);
    setRaceActive(false);
    setIsFinished(false);
    setCurrentLap(1);
    setPlayerRank(1);
    setRaceTime(0);
    setFinalStandings([]);

    try { soundFx.playBounce(300); } catch (e) {}

    let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
        try { soundFx.playBounce(300); } catch (e) {}
      } else if (count === 0) {
        setCountdown(0); // GO!
        try { soundFx.playFanfare(); } catch (e) {}
        setRaceActive(true);
        raceStartTimeRef.current = Date.now();
        lapStartTimesRef.current[1] = Date.now();
      } else {
        clearInterval(interval);
        setCountdown(null);
      }
    }, 900);
  };

  // Respawn Kart to last valid waypoint
  const handleRespawn = useCallback(() => {
    if (respawnCooldown) return;
    const playerKart = kartsRef.current.find((k) => k.isPlayer);
    if (!playerKart) return;

    const lastWpIdx =
      (playerKart.nextCheckpoint - 1 + TRACK_CIRCUIT.waypoints.length) %
      TRACK_CIRCUIT.waypoints.length;
    const wp = TRACK_CIRCUIT.waypoints[lastWpIdx];
    const nextWp = TRACK_CIRCUIT.waypoints[playerKart.nextCheckpoint];

    playerKart.x = wp.x;
    playerKart.y = wp.y;
    playerKart.speed = 0;
    playerKart.angle = Math.atan2(nextWp.y - wp.y, nextWp.x - wp.x);

    setRespawnCooldown(true);
    setTimeout(() => setRespawnCooldown(false), 2000);
    try { soundFx.playNotification(); } catch (e) {}
  }, [respawnCooldown]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyS', 'KeyA', 'KeyD', 'KeyR'].includes(e.code)) {
        e.preventDefault();
      }

      if (['ArrowUp', 'KeyW'].includes(e.code)) keys.current.up = true;
      if (['ArrowDown', 'KeyS'].includes(e.code)) keys.current.down = true;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.current.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keys.current.right = true;
      if (e.code === 'KeyR') handleRespawn();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) keys.current.up = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) keys.current.down = false;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.current.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keys.current.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleRespawn]);

  // Main RAF Physics & Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const WIDTH = 680;
    const HEIGHT = 520;
    const TOTAL_LAPS = 3;
    const waypoints = TRACK_CIRCUIT.waypoints;

    const gameLoop = () => {
      const karts = kartsRef.current;

      if (raceActive && !isFinished) {
        // Update race elapsed time
        const elapsed = (Date.now() - raceStartTimeRef.current) / 1000;
        setRaceTime(elapsed);

        karts.forEach((kart) => {
          // -----------------------------------------------------------
          // PLAYER PHYSICS
          // -----------------------------------------------------------
          if (kart.isPlayer) {
            // Steering
            if (keys.current.left) kart.angle -= kart.racer.turnSpeed;
            if (keys.current.right) kart.angle += kart.racer.turnSpeed;

            // Acceleration & Braking
            let maxCurrentSpeed = kart.racer.maxSpeed;
            if (kart.boostTimer > 0) {
              maxCurrentSpeed *= 1.45;
              kart.boostTimer--;
            }

            if (keys.current.up) {
              kart.speed = Math.min(maxCurrentSpeed, kart.speed + kart.racer.accel);
            } else if (keys.current.down) {
              kart.speed = Math.max(-2, kart.speed - kart.racer.accel * 1.5);
            } else {
              // Coasting friction
              kart.speed *= 0.97;
            }

            // Move
            kart.x += Math.cos(kart.angle) * kart.speed;
            kart.y += Math.sin(kart.angle) * kart.speed;

            setSpeedKmh(Math.round(Math.abs(kart.speed) * 22));

            // Track bounds / grass slowdown
            // Find distance to closest road segment
            let minDistToTrack = 9999;
            for (let i = 0; i < waypoints.length; i++) {
              const p1 = waypoints[i];
              const p2 = waypoints[(i + 1) % waypoints.length];
              const l2 = (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2;
              let t = ((kart.x - p1.x) * (p2.x - p1.x) + (kart.y - p1.y) * (p2.y - p1.y)) / l2;
              t = Math.max(0, Math.min(1, t));
              const projX = p1.x + t * (p2.x - p1.x);
              const projY = p1.y + t * (p2.y - p1.y);
              const d = Math.hypot(kart.x - projX, kart.y - projY);
              if (d < minDistToTrack) minDistToTrack = d;
            }

            // Road width is 50px radius (100px total). If outside, grass slowdown!
            if (minDistToTrack > 44 && kart.boostTimer <= 0) {
              kart.speed *= 0.88; // Grass penalty
            }

            // Boost pad collision
            TRACK_CIRCUIT.boostPads.forEach((bp) => {
              if (Math.hypot(kart.x - bp.x, kart.y - bp.y) < 26) {
                kart.boostTimer = 45;
                try { soundFx.playBoost(); } catch (e) {}
              }
            });
          } else {
            // -----------------------------------------------------------
            // CPU COMPETITORS AI
            // -----------------------------------------------------------
            const targetWp = waypoints[kart.nextCheckpoint];
            // Slight steering jitter/variance per racer
            const targetAngle = Math.atan2(targetWp.y - kart.y, targetWp.x - kart.x);

            let angleDiff = targetAngle - kart.angle;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

            kart.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), kart.racer.turnSpeed * 0.95);
            kart.speed = Math.min(kart.racer.maxSpeed * 0.92, kart.speed + kart.racer.accel);

            kart.x += Math.cos(kart.angle) * kart.speed;
            kart.y += Math.sin(kart.angle) * kart.speed;
          }

          // -----------------------------------------------------------
          // CHECKPOINT & LAP TRACKING (ORDERED, PREVENTS CUTS)
          // -----------------------------------------------------------
          const targetWp = waypoints[kart.nextCheckpoint];
          const distToCheckpoint = Math.hypot(kart.x - targetWp.x, kart.y - targetWp.y);

          if (distToCheckpoint < 55) {
            kart.nextCheckpoint = (kart.nextCheckpoint + 1) % waypoints.length;

            // Passed finish line!
            if (kart.nextCheckpoint === 1) {
              if (kart.isPlayer) {
                const lapTime = (Date.now() - lapStartTimesRef.current[kart.lap]) / 1000;
                setBestLapTime((prev) => (prev ? Math.min(prev, lapTime) : lapTime));
                lapStartTimesRef.current[kart.lap + 1] = Date.now();
              }

              kart.lap += 1;

              if (kart.isPlayer) {
                setCurrentLap(Math.min(TOTAL_LAPS, kart.lap));
                if (kart.lap > TOTAL_LAPS) {
                  // Player finished race!
                  setIsFinished(true);
                  try {
                    soundFx.playFanfare();
                  } catch (e) {}
                  confetti({ particleCount: 160, spread: 90, origin: { y: 0.6 } });
                  const totalTime = (Date.now() - raceStartTimeRef.current) / 1000;
                  saveGameBestTime('kart', totalTime);
                }
              }
            }
          }

          // Total progress value for leaderboard ranking
          kart.progress = kart.lap * 1000 + kart.nextCheckpoint * 50 - distToCheckpoint * 0.1;
        });

        // -------------------------------------------------------------
        // KART-TO-KART COLLISIONS
        // -------------------------------------------------------------
        for (let i = 0; i < karts.length; i++) {
          for (let j = i + 1; j < karts.length; j++) {
            const k1 = karts[i];
            const k2 = karts[j];
            const dist = Math.hypot(k1.x - k2.x, k1.y - k2.y);
            if (dist < 20) {
              const angle = Math.atan2(k2.y - k1.y, k2.x - k1.x);
              k1.x -= Math.cos(angle) * 3;
              k1.y -= Math.sin(angle) * 3;
              k2.x += Math.cos(angle) * 3;
              k2.y += Math.sin(angle) * 3;
              k1.speed *= 0.85;
              k2.speed *= 0.85;
            }
          }
        }

        // -------------------------------------------------------------
        // LEADERBOARD RANKING (1º to 8º)
        // -------------------------------------------------------------
        const sorted = [...karts].sort((a, b) => b.progress - a.progress);
        sorted.forEach((k, idx) => {
          k.rank = idx + 1;
        });

        const player = sorted.find((k) => k.isPlayer);
        if (player) {
          setPlayerRank(player.rank);
        }
        setFinalStandings(sorted);
      }

      // -------------------------------------------------------------
      // RENDERING CANVAS
      // -------------------------------------------------------------
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      const isRetro = mode === 'retro';

      // Grass Background
      ctx.fillStyle = isRetro ? '#15803d' : '#022c22';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Track Asphalt Spline (connecting waypoints with thick line)
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Curbs / Border
      ctx.strokeStyle = isRetro ? '#ef4444' : '#06b6d4';
      ctx.lineWidth = 78;
      ctx.beginPath();
      waypoints.forEach((wp, i) => {
        if (i === 0) ctx.moveTo(wp.x, wp.y);
        else ctx.lineTo(wp.x, wp.y);
      });
      ctx.closePath();
      ctx.stroke();

      // Road Asphalt
      ctx.strokeStyle = isRetro ? '#334155' : '#0f172a';
      ctx.lineWidth = 66;
      ctx.stroke();

      // Road Center Dash
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([12, 14]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Start / Finish Line
      const pStart = waypoints[0];
      const pNext = waypoints[1];
      const startAngle = Math.atan2(pNext.y - pStart.y, pNext.x - pStart.x);
      ctx.save();
      ctx.translate(pStart.x, pStart.y);
      ctx.rotate(startAngle + Math.PI / 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-32, -4, 64, 8);
      // Checkered pattern
      ctx.fillStyle = '#000000';
      for (let c = -32; c < 32; c += 8) {
        ctx.fillRect(c, -4, 4, 4);
        ctx.fillRect(c + 4, 0, 4, 4);
      }
      ctx.restore();

      // Boost Pads
      TRACK_CIRCUIT.boostPads.forEach((bp) => {
        ctx.save();
        ctx.fillStyle = '#eab308';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(bp.x, bp.y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚡', bp.x, bp.y);
        ctx.restore();
      });

      // Render Karts
      karts.forEach((kart) => {
        ctx.save();
        ctx.translate(kart.x, kart.y);
        ctx.rotate(kart.angle);

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 3, 13, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Kart Body
        ctx.fillStyle = kart.racer.kartColor;
        ctx.beginPath();
        ctx.roundRect(-12, -7, 24, 14, [4]);
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Wheels
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-10, -9, 6, 3);
        ctx.fillRect(4, -9, 6, 3);
        ctx.fillRect(-10, 6, 6, 3);
        ctx.fillRect(4, 6, 6, 3);

        // Driver Helmet
        ctx.fillStyle = kart.racer.color;
        ctx.beginPath();
        ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Boost fire particle
        if (kart.boostTimer > 0) {
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(-14, 0, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        // Player Highlight Indicator
        if (kart.isPlayer) {
          ctx.save();
          ctx.fillStyle = '#fbbf24';
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('VOCÊ', kart.x, kart.y - 14);
          ctx.restore();
        }
      });

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [raceActive, isFinished, mode]);

  const isRetro = mode === 'retro';

  return (
    <div className="space-y-4 font-sans select-none text-slate-100 max-w-4xl mx-auto">
      {/* Top Controls Bar */}
      <div
        className={`p-2.5 border-2 flex flex-wrap items-center justify-between gap-2 shadow ${
          isRetro
            ? 'bg-[#c0c0c0] border-white border-r-gray-800 border-b-gray-800 text-gray-900'
            : 'bg-slate-900/90 border-cyan-500/40 text-cyan-200 rounded-lg backdrop-blur-md'
        }`}
      >
        <div className="flex items-center gap-2">
          {onBackToHub && (
            <button
              onClick={onBackToHub}
              className={`px-3 py-1.5 font-mono font-bold text-xs border-2 cursor-pointer flex items-center gap-1.5 transition ${
                isRetro
                  ? 'bg-[#d4d0c8] hover:bg-white text-gray-900 border-white border-r-gray-800 border-b-gray-800'
                  : 'bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 border-cyan-600 rounded'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>VOLTAR AO ARCADE</span>
            </button>
          )}
          <span className="font-mono font-black text-xs text-blue-900 dark:text-cyan-300">
            🏁 {isRetro ? 'KART RACING 2000 (ORIGINAL)' : 'SPACE KART GRAND PRIX'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Respawn Kart Button */}
          <button
            onClick={handleRespawn}
            disabled={respawnCooldown}
            className={`px-2.5 py-1 font-mono text-xs font-bold border rounded cursor-pointer transition flex items-center gap-1 ${
              respawnCooldown
                ? 'opacity-40 bg-gray-600 text-white'
                : 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400'
            }`}
            title="Reposicionar kart na pista [Tecla R]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>RESPAWN [R]</span>
          </button>

          <button
            onClick={startRaceCountdown}
            className={`px-3 py-1 font-mono font-bold text-xs border-2 cursor-pointer flex items-center gap-1 shadow ${
              isRetro
                ? 'bg-[#d4d0c8] hover:bg-white text-black border-white border-r-gray-800 border-b-gray-800'
                : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 border-emerald-300 rounded'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>LARGADA</span>
          </button>
        </div>
      </div>

      {/* Race Telemetry HUD */}
      <div
        className={`px-4 py-2 border-2 rounded-lg grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono shadow-lg text-center ${
          isRetro
            ? 'bg-[#000080] border-white text-white'
            : 'bg-slate-950/90 border-cyan-500/50 text-cyan-100 backdrop-blur-md'
        }`}
      >
        <div>
          <div className="text-[10px] text-white/70 tracking-widest font-bold">POSIÇÃO</div>
          <div className="text-xl font-black text-yellow-300">{playerRank}º / 8</div>
        </div>
        <div>
          <div className="text-[10px] text-white/70 tracking-widest font-bold">VOLTA</div>
          <div className="text-xl font-black text-yellow-300">{currentLap} / 3</div>
        </div>
        <div>
          <div className="text-[10px] text-white/70 tracking-widest font-bold">VELOCIDADE</div>
          <div className="text-xl font-black text-yellow-300">{speedKmh} km/h</div>
        </div>
        <div>
          <div className="text-[10px] text-white/70 tracking-widest font-bold">TEMPO</div>
          <div className="text-xl font-black text-yellow-300">{raceTime.toFixed(1)}s</div>
        </div>
      </div>

      {/* Main Track Canvas Box */}
      <div className="flex flex-col items-center justify-center p-1 relative">
        <div
          className={`relative p-2 rounded-2xl border-4 shadow-2xl ${
            isRetro
              ? 'bg-[#1e293b] border-gray-400 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]'
              : 'bg-slate-950 border-cyan-500/50 shadow-[0_0_35px_rgba(6,182,212,0.25)]'
          }`}
        >
          <canvas
            ref={canvasRef}
            width={680}
            height={520}
            className="w-full max-w-[680px] h-auto rounded-lg border-2 border-slate-700 block shadow-inner bg-black"
          />

          {/* Countdown 3-2-1-GO Overlay */}
          {countdown !== null && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
              <div className="text-7xl sm:text-8xl font-mono font-black text-yellow-400 animate-bounce tracking-widest drop-shadow-[0_0_25px_rgba(250,204,21,0.8)]">
                {countdown === 0 ? 'GO!' : countdown}
              </div>
            </div>
          )}

          {/* Not active pre-race character picker */}
          {!raceActive && !isFinished && countdown === null && (
            <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center p-4 text-center z-10 space-y-4">
              <p className="font-mono text-xl font-black text-white">ESCOLHA SEU PILOTO</p>
              <div className="grid grid-cols-4 gap-2 max-w-md w-full">
                {RACERS.map((racer) => (
                  <button
                    key={racer.id}
                    onClick={() => setSelectedRacer(racer)}
                    className={`p-2 rounded-lg border-2 flex flex-col items-center gap-1 cursor-pointer transition ${
                      selectedRacer.id === racer.id
                        ? 'bg-yellow-400/20 border-yellow-400 scale-105 shadow-lg'
                        : 'bg-slate-800/80 border-slate-600 hover:border-slate-400'
                    }`}
                  >
                    <span className="text-2xl">{racer.avatar}</span>
                    <span className="text-[10px] font-mono font-bold text-white truncate w-full text-center">
                      {racer.name}
                    </span>
                  </button>
                ))}
              </div>

              <button
                onClick={startRaceCountdown}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono font-black text-sm rounded-xl cursor-pointer shadow-lg transition transform hover:scale-105"
              >
                INICIAR CORRIDA 🏁
              </button>
            </div>
          )}

          {/* Virtual Mobile Controls */}
          <div className="pt-3 flex items-center justify-between gap-4 select-none">
            {/* Steering Left / Right */}
            <div className="flex gap-2">
              <button
                onTouchStart={() => (keys.current.left = true)}
                onTouchEnd={() => (keys.current.left = false)}
                onMouseDown={() => (keys.current.left = true)}
                onMouseUp={() => (keys.current.left = false)}
                className="w-14 h-12 bg-black/80 text-white rounded-xl flex items-center justify-center active:bg-blue-700 shadow border border-white/20"
                aria-label="Virar Esquerda"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onTouchStart={() => (keys.current.right = true)}
                onTouchEnd={() => (keys.current.right = false)}
                onMouseDown={() => (keys.current.right = true)}
                onMouseUp={() => (keys.current.right = false)}
                className="w-14 h-12 bg-black/80 text-white rounded-xl flex items-center justify-center active:bg-blue-700 shadow border border-white/20"
                aria-label="Virar Direita"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>

            {/* Gas and Brake */}
            <div className="flex gap-2">
              <button
                onTouchStart={() => (keys.current.down = true)}
                onTouchEnd={() => (keys.current.down = false)}
                onMouseDown={() => (keys.current.down = true)}
                onMouseUp={() => (keys.current.down = false)}
                className="px-4 py-3 bg-rose-800 active:bg-rose-600 text-white font-mono font-bold text-xs rounded-xl border border-rose-500 shadow"
              >
                FREIO
              </button>
              <button
                onTouchStart={() => (keys.current.up = true)}
                onTouchEnd={() => (keys.current.up = false)}
                onMouseDown={() => (keys.current.up = true)}
                onMouseUp={() => (keys.current.up = false)}
                className="px-6 py-3 bg-emerald-600 active:bg-emerald-500 text-slate-950 font-mono font-black text-sm rounded-xl border border-emerald-400 shadow"
              >
                ACELERAR 🚀
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Finished Race Results Modal */}
      {isFinished && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div
            className={`max-w-md w-full p-6 rounded-xl border-4 text-center space-y-4 shadow-2xl ${
              isRetro
                ? 'bg-[#c0c0c0] border-white text-slate-900 shadow-[8px_8px_0px_rgba(0,0,0,0.5)]'
                : 'bg-slate-950 border-cyan-400 text-cyan-100'
            }`}
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-yellow-400 flex items-center justify-center text-3xl shadow-lg">
              {playerRank === 1 ? '🥇' : playerRank === 2 ? '🥈' : playerRank === 3 ? '🥉' : '🏁'}
            </div>
            <h2 className="text-2xl font-mono font-black tracking-wider text-green-700 dark:text-cyan-300">
              BANDEIRA QUADRICULADA!
            </h2>
            <p className="text-sm font-mono leading-relaxed">
              Você cruzou a linha de chegada na <strong className="text-yellow-600 dark:text-yellow-300">{playerRank}ª POSIÇÃO</strong>!
            </p>

            <div className="p-3 bg-white/60 dark:bg-slate-900 rounded font-mono text-xs space-y-1">
              <div>Tempo Total: <strong>{raceTime.toFixed(2)}s</strong></div>
              {bestLapTime && <div>Melhor Volta: <strong>{bestLapTime.toFixed(2)}s</strong></div>}
            </div>

            {/* Top 3 Podium */}
            <div className="space-y-1 text-left font-mono text-xs bg-black/20 p-2.5 rounded">
              <div className="font-bold text-center pb-1 border-b border-white/20">CLASSIFICAÇÃO FINAL</div>
              {finalStandings.slice(0, 5).map((k, idx) => (
                <div key={k.racer.id} className="flex justify-between items-center py-0.5">
                  <span>{idx + 1}º {k.racer.avatar} {k.racer.name}</span>
                  <span className="font-bold">{k.isPlayer ? '★ VOCÊ' : 'CPU'}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={startRaceCountdown}
                className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white font-mono font-bold text-xs rounded cursor-pointer shadow transition"
              >
                CORRER NOVAMENTE
              </button>
              {onBackToHub && (
                <button
                  onClick={onBackToHub}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white font-mono font-bold text-xs rounded cursor-pointer shadow transition"
                >
                  VOLTAR AO ARCADE
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
