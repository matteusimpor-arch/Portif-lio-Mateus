import React, { useState, useEffect, useRef } from 'react';
import { Trophy, RotateCcw, Volume2, Sparkles, Flag, ArrowRight, Zap, Play, ArrowLeft, ChevronLeft, ChevronRight, Gauge } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../utils/soundEffects';

interface Character {
  id: string;
  name: string;
  avatar: string;
  color: string;
  kartColor: string;
  speedStat: number;
  accelStat: number;
  weightStat: number;
}

const CHARACTERS: Character[] = [
  { id: 'mario', name: 'Mario', avatar: '🔴', color: '#ef4444', kartColor: '#dc2626', speedStat: 8, accelStat: 8, weightStat: 7 },
  { id: 'luigi', name: 'Luigi', avatar: '🟢', color: '#22c55e', kartColor: '#16a34a', speedStat: 8, accelStat: 8, weightStat: 7 },
  { id: 'peach', name: 'Peach', avatar: '💖', color: '#ec4899', kartColor: '#db2777', speedStat: 7, accelStat: 10, weightStat: 5 },
  { id: 'toad', name: 'Toad', avatar: '🍄', color: '#3b82f6', kartColor: '#2563eb', speedStat: 7, accelStat: 10, weightStat: 4 },
  { id: 'yoshi', name: 'Yoshi', avatar: '🦖', color: '#84cc16', kartColor: '#65a30d', speedStat: 8, accelStat: 9, weightStat: 6 },
  { id: 'bowser', name: 'Bowser', avatar: '🔥', color: '#eab308', kartColor: '#ca8a04', speedStat: 10, accelStat: 5, weightStat: 10 },
  { id: 'donkey', name: 'DK', avatar: '🦍', color: '#b45309', kartColor: '#92400e', speedStat: 9, accelStat: 6, weightStat: 9 },
  { id: 'wario', name: 'Wario', avatar: '⭐', color: '#eab308', kartColor: '#854d0e', speedStat: 9, accelStat: 6, weightStat: 9 },
];

interface Track {
  id: string;
  name: string;
  theme: string;
  bgGrad: [string, string];
  roadColor: string;
  curbColor: string;
  length: number;
  curves: Array<{ pos: number; curve: number }>;
}

const TRACKS: Track[] = [
  {
    id: 'mushroom',
    name: 'Circuito Cogumelo 2000',
    theme: 'Grama & Asfalto Clássico',
    bgGrad: ['#38bdf8', '#86efac'],
    roadColor: '#334155',
    curbColor: '#ef4444',
    length: 2200,
    curves: [
      { pos: 300, curve: 0.8 },
      { pos: 700, curve: -0.9 },
      { pos: 1200, curve: 1.2 },
      { pos: 1600, curve: -0.7 },
    ],
  },
  {
    id: 'beach',
    name: 'Praia Koopa Beach',
    theme: 'Areia Tropical & Mar Azul',
    bgGrad: ['#0284c7', '#fde047'],
    roadColor: '#78716c',
    curbColor: '#f97316',
    length: 2600,
    curves: [
      { pos: 400, curve: -1.1 },
      { pos: 900, curve: 1.0 },
      { pos: 1500, curve: -1.3 },
      { pos: 2000, curve: 0.9 },
    ],
  },
  {
    id: 'castle',
    name: 'Castelo de Fogo Bowser',
    theme: 'Lava Vulcânica & Fortaleza',
    bgGrad: ['#450a0a', '#ea580c'],
    roadColor: '#18181b',
    curbColor: '#facc15',
    length: 3000,
    curves: [
      { pos: 350, curve: 1.3 },
      { pos: 800, curve: -1.4 },
      { pos: 1400, curve: 1.5 },
      { pos: 2100, curve: -1.2 },
      { pos: 2600, curve: 1.1 },
    ],
  },
];

interface KartGameProps {
  onBackToHub?: () => void;
  mode?: 'retro' | 'space';
}

export const KartGame: React.FC<KartGameProps> = ({
  onBackToHub,
  mode = 'retro',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [selectedChar, setSelectedChar] = useState<Character>(CHARACTERS[0]);
  const [selectedTrack, setSelectedTrack] = useState<Track>(TRACKS[0]);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [lap, setLap] = useState<number>(1);
  const [position, setPosition] = useState<number>(1);
  const [coins, setCoins] = useState<number>(0);
  const [boostTime, setBoostTime] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Kart controls state
  const keys = useRef<{ left: boolean; right: boolean; up: boolean; down: boolean; space: boolean }>({
    left: false,
    right: false,
    up: false,
    down: false,
    space: false,
  });

  const startRace = () => {
    try {
      soundFx.playFanfare();
    } catch (e) {}
    setLap(1);
    setPosition(1);
    setCoins(0);
    setBoostTime(0);
    setIsFinished(false);
    setIsPlaying(true);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.current.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keys.current.right = true;
      if (['ArrowUp', 'KeyW'].includes(e.code)) keys.current.up = true;
      if (['ArrowDown', 'KeyS'].includes(e.code)) keys.current.down = true;
      if (e.code === 'Space') keys.current.space = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.current.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keys.current.right = false;
      if (['ArrowUp', 'KeyW'].includes(e.code)) keys.current.up = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) keys.current.down = false;
      if (e.code === 'Space') keys.current.space = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main Pseudo-3D Mode 7 Racing Engine
  useEffect(() => {
    if (!isPlaying || isFinished) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let playerX = 0; // -1 to 1 across track
    let trackPos = 0; // Distance traveled
    let speed = 0;
    const maxSpeed = 16 + selectedChar.speedStat * 0.8;
    const accel = 0.25 + selectedChar.accelStat * 0.05;

    // AI competitors positions along track
    const rivals = [
      { id: 'rival-1', name: 'Bowser', x: -0.4, pos: 200, speed: 17, color: '#eab308' },
      { id: 'rival-2', name: 'Luigi', x: 0.3, pos: 150, speed: 16.5, color: '#22c55e' },
      { id: 'rival-3', name: 'Peach', x: -0.2, pos: 100, speed: 16.2, color: '#ec4899' },
    ];

    let animId: number;

    const gameLoop = () => {
      // 1. Controls & Acceleration
      if (keys.current.up) {
        speed = Math.min(maxSpeed, speed + accel);
      } else if (keys.current.down) {
        speed = Math.max(0, speed - accel * 1.5);
      } else {
        speed = Math.max(0, speed - 0.12);
      }

      // Steering
      if (keys.current.left) {
        playerX -= 0.035 * (speed / maxSpeed);
      }
      if (keys.current.right) {
        playerX += 0.035 * (speed / maxSpeed);
      }

      // Off-road penalty
      if (Math.abs(playerX) > 0.85) {
        speed = Math.min(speed, 6);
      }

      // Turbo boost item
      if (keys.current.space && coins >= 3) {
        setCoins((c) => Math.max(0, c - 3));
        speed = maxSpeed * 1.35;
        try {
          soundFx.playBoost();
        } catch (e) {}
      }

      trackPos += speed;

      // Check current curve
      let currentCurve = 0;
      selectedTrack.curves.forEach((c) => {
        const dist = Math.abs((trackPos % selectedTrack.length) - c.pos);
        if (dist < 300) {
          currentCurve = c.curve * (1 - dist / 300);
        }
      });

      playerX -= currentCurve * 0.015 * (speed / maxSpeed);

      // Check Lap Finish
      if (trackPos >= selectedTrack.length) {
        trackPos = 0;
        setLap((currLap) => {
          if (currLap >= 3) {
            setIsFinished(true);
            setIsPlaying(false);
            try {
              soundFx.playFanfare();
            } catch (e) {}
            confetti({ particleCount: 150, spread: 90 });
            return 3;
          }
          try {
            soundFx.playNotification();
          } catch (e) {}
          return currLap + 1;
        });
      }

      // Update Rivals
      rivals.forEach((r) => {
        r.pos += r.speed;
        if (r.pos > selectedTrack.length) r.pos -= selectedTrack.length;
      });

      // Calculate Position
      let currentRank = 1;
      rivals.forEach((r) => {
        if (r.pos > trackPos) currentRank++;
      });
      setPosition(currentRank);

      // 2. Render Pseudo 3D Mode-7 Track
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 140);
      skyGrad.addColorStop(0, selectedTrack.bgGrad[0]);
      skyGrad.addColorStop(1, selectedTrack.bgGrad[1]);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, 140);

      // Mountain / Landscape Silhouette
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(0, 140);
      ctx.lineTo(80, 95);
      ctx.lineTo(170, 130);
      ctx.lineTo(260, 85);
      ctx.lineTo(360, 140);
      ctx.fill();

      // Road Perspective Scanlines
      const horizonY = 140;
      for (let y = horizonY; y < canvas.height; y++) {
        const perspective = (y - horizonY) / (canvas.height - horizonY);
        const roadWidth = 280 * perspective;
        const roadCenter = canvas.width / 2 + currentCurve * 80 * (1 - perspective) - playerX * 160 * perspective;

        // Grass / Sand
        const grassStrip = Math.floor((trackPos + (canvas.height - y) * 12) / 40) % 2 === 0;
        ctx.fillStyle = grassStrip ? '#16a34a' : '#15803d';
        ctx.fillRect(0, y, canvas.width, 1);

        // Curbs (Red/White or Orange/White)
        const curbWidth = 24 * perspective;
        const curbStrip = Math.floor((trackPos + (canvas.height - y) * 12) / 20) % 2 === 0;
        ctx.fillStyle = curbStrip ? selectedTrack.curbColor : '#ffffff';
        ctx.fillRect(roadCenter - roadWidth / 2 - curbWidth, y, curbWidth, 1);
        ctx.fillRect(roadCenter + roadWidth / 2, y, curbWidth, 1);

        // Main Road Asfalt
        ctx.fillStyle = selectedTrack.roadColor;
        ctx.fillRect(roadCenter - roadWidth / 2, y, roadWidth, 1);

        // Center White Dashed Lane Line
        if (curbStrip) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(roadCenter - 1.5 * perspective, y, 3 * perspective, 1);
        }
      }

      // 3. Render Player Kart (Super Mario Kart Sprite Style)
      const kartScreenX = canvas.width / 2;
      const kartScreenY = canvas.height - 35;

      ctx.save();
      ctx.translate(kartScreenX, kartScreenY);

      // Kart wheels
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-22, 6, 9, 14);
      ctx.fillRect(13, 6, 9, 14);

      // Kart chassis
      ctx.fillStyle = selectedChar.kartColor;
      ctx.fillRect(-17, -8, 34, 22);

      // Kart exhaust pipe flame during acceleration
      if (speed > 8) {
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(0, 16, 4 + (speed / maxSpeed) * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Driver Character
      ctx.fillStyle = selectedChar.color;
      ctx.beginPath();
      ctx.arc(0, -14, 12, 0, Math.PI * 2);
      ctx.fill();

      // Driver Cap / Hat
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(selectedChar.avatar, 0, -8);

      ctx.restore();

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isFinished, selectedChar, selectedTrack, coins]);

  return (
    <div className="space-y-4 font-sans select-none text-slate-100 max-w-2xl mx-auto">
      {/* Top Game Navigation Bar */}
      <div className="bg-[#c0c0c0] p-2.5 border-2 border-white border-r-gray-800 border-b-gray-800 text-gray-900 flex flex-wrap items-center justify-between gap-3 shadow">
        <div className="flex items-center gap-2">
          {onBackToHub && (
            <button
              onClick={onBackToHub}
              className="px-3 py-1.5 bg-[#d4d0c8] hover:bg-white text-gray-900 font-mono font-bold text-xs border-2 border-white border-r-gray-800 border-b-gray-800 cursor-pointer flex items-center gap-1.5 active:border-gray-800 active:border-r-white active:border-b-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>VOLTAR AOS JOGOS</span>
            </button>
          )}
          <div className="font-mono font-black text-xs text-[#000080] flex items-center gap-1">
            <span>🏎️ MARIO KART GP 2000</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={startRace}
            className="px-3 py-1.5 bg-[#d4d0c8] hover:bg-white text-black font-mono font-bold text-xs border-2 border-white border-r-gray-800 border-b-gray-800 cursor-pointer flex items-center gap-1 shadow"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>REINICIAR</span>
          </button>
        </div>
      </div>

      {/* Instructions Banner */}
      <div className="bg-[#000080] text-yellow-300 px-3 py-1.5 border border-white text-xs font-mono flex flex-wrap items-center justify-between gap-2 shadow-inner">
        <span>
          <strong>CONTROLES:</strong> <code className="bg-black/60 px-1 py-0.5 rounded text-white">▲ / W</code> Acelerar | <code className="bg-black/60 px-1 py-0.5 rounded text-white">◄ ►</code> Direção | <code className="bg-black/60 px-1 py-0.5 rounded text-white">ESPAÇO</code> Turbo
        </span>
        <span className="text-white">
          Volta: <strong className="text-yellow-300">{lap} / 3</strong> | Posição: <strong className="text-yellow-300">{position}º / 4</strong>
        </span>
      </div>

      {/* Track & Character Selector (When idle) */}
      {!isPlaying && (
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-4 shadow-xl">
          <div>
            <label className="text-xs font-mono font-bold text-cyan-400 block mb-2">
              1. ESCOLHA O PILOTO:
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {CHARACTERS.map((char) => (
                <button
                  key={char.id}
                  onClick={() => setSelectedChar(char)}
                  className={`p-2 rounded-lg border flex flex-col items-center gap-1 cursor-pointer transition ${
                    selectedChar.id === char.id
                      ? 'bg-blue-600 border-yellow-300 ring-2 ring-yellow-400 scale-105 shadow-lg'
                      : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <span className="text-2xl">{char.avatar}</span>
                  <span className="text-[11px] font-mono font-bold">{char.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-mono font-bold text-cyan-400 block mb-2">
              2. ESCOLHA O CIRCUITO:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {TRACKS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTrack(t)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition ${
                    selectedTrack.id === t.id
                      ? 'bg-indigo-900 border-yellow-300 ring-2 ring-yellow-400 shadow-lg'
                      : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <div className="font-mono font-bold text-xs text-yellow-300">{t.name}</div>
                  <div className="text-[10px] text-slate-300">{t.theme}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startRace}
            className="w-full py-4 bg-gradient-to-r from-red-600 via-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 font-black font-mono text-sm rounded-xl shadow-2xl cursor-pointer active:scale-98 transition flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>LARGADA! INICIAR CORRIDA 2000</span>
          </button>
        </div>
      )}

      {/* Main Track Canvas Screen */}
      <div className="flex justify-center bg-black p-2 rounded-lg border-2 border-slate-700 shadow-2xl relative">
        <canvas
          ref={canvasRef}
          width={360}
          height={260}
          className="border border-slate-800 bg-black rounded"
        />

        {isFinished && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 text-center rounded animate-fadeIn">
            <Trophy className="w-12 h-12 text-yellow-400 animate-bounce mb-2" />
            <h3 className="text-lg font-black font-mono text-yellow-300">
              CORRIDA FINALIZADA!
            </h3>
            <p className="text-xs font-mono text-slate-200 mt-1">
              Você terminou em <span className="font-bold text-yellow-400">{position}º LUGAR</span> com {selectedChar.name}!
            </p>
            <button
              onClick={startRace}
              className="mt-4 px-6 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-mono font-black text-xs rounded-lg shadow-lg cursor-pointer transition"
            >
              Correr Novamente
            </button>
          </div>
        )}
      </div>

      {/* Mobile Touch Controls for Kart */}
      {isPlaying && !isFinished && (
        <div className="grid grid-cols-4 gap-2 pt-1 font-mono text-xs">
          <button
            onMouseDown={() => (keys.current.left = true)}
            onMouseUp={() => (keys.current.left = false)}
            onTouchStart={(e) => {
              e.preventDefault();
              keys.current.left = true;
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              keys.current.left = false;
            }}
            className="py-4 bg-slate-800 active:bg-slate-700 text-white rounded-lg border border-slate-600 flex items-center justify-center select-none shadow"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onMouseDown={() => (keys.current.right = true)}
            onMouseUp={() => (keys.current.right = false)}
            onTouchStart={(e) => {
              e.preventDefault();
              keys.current.right = true;
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              keys.current.right = false;
            }}
            className="py-4 bg-slate-800 active:bg-slate-700 text-white rounded-lg border border-slate-600 flex items-center justify-center select-none shadow"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <button
            onMouseDown={() => (keys.current.down = true)}
            onMouseUp={() => (keys.current.down = false)}
            onTouchStart={(e) => {
              e.preventDefault();
              keys.current.down = true;
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              keys.current.down = false;
            }}
            className="py-4 bg-red-900 active:bg-red-800 text-white font-black rounded-lg border border-red-700 flex items-center justify-center select-none shadow"
          >
            <span>FREIO</span>
          </button>

          <button
            onMouseDown={() => (keys.current.up = true)}
            onMouseUp={() => (keys.current.up = false)}
            onTouchStart={(e) => {
              e.preventDefault();
              keys.current.up = true;
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              keys.current.up = false;
            }}
            className="py-4 bg-emerald-600 active:bg-emerald-500 text-slate-950 font-black rounded-lg border border-emerald-400 flex items-center justify-center select-none shadow"
          >
            <span>ACELERAR</span>
          </button>
        </div>
      )}
    </div>
  );
};
