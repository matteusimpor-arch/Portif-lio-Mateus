import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw, Trophy, Volume2, Sparkles, Play, Pause, ChevronLeft, ChevronRight, Rocket, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../utils/soundEffects';
import { getGameHighScore, saveGameHighScore, setGameActiveStatus } from '../../utils/gameStorage';

interface AsteroidDefenseGameProps {
  onBackToHub?: () => void;
  mode?: 'retro' | 'space';
}

interface Ship {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  radius: number;
  invulnerableTimer: number;
}

interface Laser {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

interface Asteroid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  size: 3 | 2 | 1; // 3 = Large, 2 = Medium, 1 = Small
  points: number;
  vertices: number[];
}

export const AsteroidDefenseGame: React.FC<AsteroidDefenseGameProps> = ({
  onBackToHub,
  mode = 'retro',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => getGameHighScore('asteroid', 5000));
  const [lives, setLives] = useState<number>(3);
  const [wave, setWave] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  // Notify M-BOT
  useEffect(() => {
    setGameActiveStatus(true, 'Asteroid Defense');
    return () => setGameActiveStatus(false);
  }, []);

  const keys = useRef<{ left: boolean; right: boolean; thrust: boolean; fire: boolean }>({
    left: false,
    right: false,
    thrust: false,
    fire: false,
  });

  const stateRef = useRef({
    width: 640,
    height: 440,
    ship: {
      x: 320,
      y: 220,
      vx: 0,
      vy: 0,
      angle: -Math.PI / 2,
      radius: 12,
      invulnerableTimer: 60,
    } as Ship,
    lasers: [] as Laser[],
    asteroids: [] as Asteroid[],
    score: 0,
    lives: 3,
    wave: 1,
    fireCooldown: 0,
  });

  const createAsteroid = (x: number, y: number, size: 3 | 2 | 1): Asteroid => {
    const radius = size === 3 ? 34 : size === 2 ? 20 : 11;
    const points = size === 3 ? 50 : size === 2 ? 100 : 200;
    const speed = (4 - size) * 0.95;
    const angle = Math.random() * Math.PI * 2;

    // Generate ragged asteroid vertex offsets
    const vertices: number[] = [];
    const numVerts = 8 + Math.floor(Math.random() * 4);
    for (let i = 0; i < numVerts; i++) {
      vertices.push(0.75 + Math.random() * 0.5);
    }

    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius,
      size,
      points,
      vertices,
    };
  };

  const spawnWave = (waveNum: number) => {
    const { width, height } = stateRef.current;
    const count = 3 + waveNum;
    const newAsteroids: Asteroid[] = [];

    for (let i = 0; i < count; i++) {
      let x = Math.random() * width;
      let y = Math.random() * height;
      // Don't spawn on top of ship
      if (Math.hypot(x - 320, y - 220) < 140) {
        x = (x + width / 2) % width;
        y = (y + height / 2) % height;
      }
      newAsteroids.push(createAsteroid(x, y, 3));
    }
    stateRef.current.asteroids = newAsteroids;
  };

  const fireLaser = () => {
    const s = stateRef.current;
    if (s.fireCooldown > 0) return;

    const tipX = s.ship.x + Math.cos(s.ship.angle) * s.ship.radius;
    const tipY = s.ship.y + Math.sin(s.ship.angle) * s.ship.radius;
    const speed = 9;

    s.lasers.push({
      x: tipX,
      y: tipY,
      vx: Math.cos(s.ship.angle) * speed + s.ship.vx * 0.4,
      vy: Math.sin(s.ship.angle) * speed + s.ship.vy * 0.4,
      life: 55,
    });

    s.fireCooldown = 9;
    try { soundFx.playLaser(); } catch (e) {}
  };

  const resetShip = () => {
    const s = stateRef.current;
    s.ship.x = s.width / 2;
    s.ship.y = s.height / 2;
    s.ship.vx = 0;
    s.ship.vy = 0;
    s.ship.angle = -Math.PI / 2;
    s.ship.invulnerableTimer = 90;
  };

  const startNewGame = () => {
    try {
      soundFx.playClick();
    } catch (e) {}

    const s = stateRef.current;
    s.score = 0;
    s.lives = 3;
    s.wave = 1;
    s.lasers = [];
    setScore(0);
    setLives(3);
    setWave(1);
    setIsGameOver(false);
    setIsPaused(false);

    resetShip();
    spawnWave(1);
    setIsPlaying(true);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'KeyA', 'KeyD', 'KeyW', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'Escape') {
        setIsPaused((p) => !p);
        return;
      }

      if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.current.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keys.current.right = true;
      if (['ArrowUp', 'KeyW'].includes(e.code)) keys.current.thrust = true;
      if (e.code === 'Space') {
        if (!isPlaying || isGameOver) {
          startNewGame();
        } else {
          fireLaser();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.current.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keys.current.right = false;
      if (['ArrowUp', 'KeyW'].includes(e.code)) keys.current.thrust = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, isGameOver]);

  // Main RAF Physics and Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const { width, height } = stateRef.current;

    const gameLoop = () => {
      const s = stateRef.current;

      if (isPlaying && !isPaused && !isGameOver) {
        if (s.fireCooldown > 0) s.fireCooldown--;

        // Ship rotation
        if (keys.current.left) s.ship.angle -= 0.07;
        if (keys.current.right) s.ship.angle += 0.07;

        // Thrust physics with inertia
        if (keys.current.thrust) {
          const accel = 0.16;
          s.ship.vx += Math.cos(s.ship.angle) * accel;
          s.ship.vy += Math.sin(s.ship.angle) * accel;
        }

        // Friction
        s.ship.vx *= 0.985;
        s.ship.vy *= 0.985;

        // Move ship
        s.ship.x += s.ship.vx;
        s.ship.y += s.ship.vy;

        // Screen wraparound for ship
        if (s.ship.x < 0) s.ship.x += width;
        if (s.ship.x > width) s.ship.x -= width;
        if (s.ship.y < 0) s.ship.y += height;
        if (s.ship.y > height) s.ship.y -= height;

        if (s.ship.invulnerableTimer > 0) s.ship.invulnerableTimer--;

        // Lasers movement & lifetime
        for (let l = s.lasers.length - 1; l >= 0; l--) {
          const laser = s.lasers[l];
          laser.x += laser.vx;
          laser.y += laser.vy;
          laser.life--;

          // Screen wraparound for lasers
          if (laser.x < 0) laser.x += width;
          if (laser.x > width) laser.x -= width;
          if (laser.y < 0) laser.y += height;
          if (laser.y > height) laser.y -= height;

          if (laser.life <= 0) {
            s.lasers.splice(l, 1);
          }
        }

        // Asteroids movement & wraparound
        s.asteroids.forEach((a) => {
          a.x += a.vx;
          a.y += a.vy;
          if (a.x < -30) a.x += width + 60;
          if (a.x > width + 30) a.x -= width + 60;
          if (a.y < -30) a.y += height + 60;
          if (a.y > height + 30) a.y -= height + 60;
        });

        // Laser vs Asteroid Collisions
        for (let l = s.lasers.length - 1; l >= 0; l--) {
          const laser = s.lasers[l];
          let laserHit = false;

          for (let a = s.asteroids.length - 1; a >= 0; a--) {
            const ast = s.asteroids[a];
            const dist = Math.hypot(laser.x - ast.x, laser.y - ast.y);

            if (dist < ast.radius) {
              laserHit = true;
              try { soundFx.playExplosion(); } catch (e) {}

              s.score += ast.points;
              setScore(s.score);
              saveGameHighScore('asteroid', s.score);
              setHighScore((h) => Math.max(h, s.score));

              // Split asteroid
              if (ast.size > 1) {
                const nextSize = (ast.size - 1) as 2 | 1;
                s.asteroids.push(createAsteroid(ast.x, ast.y, nextSize));
                s.asteroids.push(createAsteroid(ast.x, ast.y, nextSize));
              }

              s.asteroids.splice(a, 1);
              break;
            }
          }

          if (laserHit) {
            s.lasers.splice(l, 1);
          }
        }

        // Ship vs Asteroid Collision
        if (s.ship.invulnerableTimer <= 0) {
          for (let a = 0; a < s.asteroids.length; a++) {
            const ast = s.asteroids[a];
            const dist = Math.hypot(s.ship.x - ast.x, s.ship.y - ast.y);

            if (dist < s.ship.radius + ast.radius) {
              // Ship crashed!
              try { soundFx.playExplosion(); } catch (e) {}
              s.lives--;
              setLives(s.lives);

              if (s.lives <= 0) {
                setIsGameOver(true);
              } else {
                resetShip();
              }
              break;
            }
          }
        }

        // Next Wave Check
        if (s.asteroids.length === 0) {
          s.wave++;
          setWave(s.wave);
          try { soundFx.playFanfare(); } catch (e) {}
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          spawnWave(s.wave);
        }
      }

      // -------------------------------------------------------------
      // RENDERING CANVAS
      // -------------------------------------------------------------
      ctx.clearRect(0, 0, width, height);

      const isRetro = mode === 'retro';

      // Deep Space background with starfield
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      // Starfield dots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 60; i++) {
        const sx = (i * 97) % width;
        const sy = (i * 131) % height;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // Render Asteroids (Vector outlines)
      s.asteroids.forEach((a) => {
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.strokeStyle = isRetro ? '#facc15' : '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();

        const numVerts = a.vertices.length;
        for (let i = 0; i < numVerts; i++) {
          const ang = (i / numVerts) * Math.PI * 2;
          const rad = a.radius * a.vertices[i];
          const px = Math.cos(ang) * rad;
          const py = Math.sin(ang) * rad;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      });

      // Render Lasers
      ctx.fillStyle = isRetro ? '#ef4444' : '#22d3ee';
      s.lasers.forEach((laser) => {
        ctx.beginPath();
        ctx.arc(laser.x, laser.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Render Ship
      if (s.ship.invulnerableTimer === 0 || Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.save();
        ctx.translate(s.ship.x, s.ship.y);
        ctx.rotate(s.ship.angle);

        // Vector Triangle Ship
        ctx.strokeStyle = isRetro ? '#ffffff' : '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(s.ship.radius, 0); // nose
        ctx.lineTo(-s.ship.radius, -s.ship.radius * 0.7); // bottom left
        ctx.lineTo(-s.ship.radius * 0.5, 0); // notch
        ctx.lineTo(-s.ship.radius, s.ship.radius * 0.7); // bottom right
        ctx.closePath();
        ctx.stroke();

        // Thrust flame
        if (keys.current.thrust) {
          ctx.strokeStyle = '#f97316';
          ctx.beginPath();
          ctx.moveTo(-s.ship.radius * 0.6, -s.ship.radius * 0.35);
          ctx.lineTo(-s.ship.radius * 1.5, 0);
          ctx.lineTo(-s.ship.radius * 0.6, s.ship.radius * 0.35);
          ctx.stroke();
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isPaused, isGameOver, mode]);

  const isRetro = mode === 'retro';

  return (
    <div className="space-y-4 font-sans select-none text-slate-100 max-w-3xl mx-auto">
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
            🚀 {isRetro ? 'ASTEROID DEFENSE 1979' : 'COSMIC DEFENDER 2026'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={startNewGame}
            className={`px-3 py-1 font-mono font-bold text-xs border-2 cursor-pointer flex items-center gap-1 shadow ${
              isRetro
                ? 'bg-[#d4d0c8] hover:bg-white text-black border-white border-r-gray-800 border-b-gray-800'
                : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 border-cyan-300 rounded'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>NOVA MISSÃO</span>
          </button>
        </div>
      </div>

      {/* Info Status Bar */}
      <div
        className={`px-4 py-2 border-2 rounded-lg flex items-center justify-between font-mono shadow-lg ${
          isRetro
            ? 'bg-[#000080] border-white text-white'
            : 'bg-slate-950/90 border-cyan-500/50 text-cyan-100 backdrop-blur-md'
        }`}
      >
        <div className="flex items-center gap-4">
          <span>Pontos: <strong className="text-yellow-300">{score}</strong></span>
          <span>Onda: <strong className="text-yellow-300">WAVE {wave}</strong></span>
        </div>

        <div className="flex items-center gap-4">
          <span>Vidas: <strong className="text-cyan-400">{'🚀 '.repeat(Math.max(0, lives))}</strong></span>
          <span>Recorde: <strong className="text-yellow-300">{highScore}</strong></span>
        </div>
      </div>

      {/* Canvas Cabinet */}
      <div className="flex flex-col items-center justify-center p-1 relative">
        <div
          className={`relative p-2.5 rounded-2xl border-4 shadow-2xl ${
            isRetro
              ? 'bg-[#1e293b] border-gray-400 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]'
              : 'bg-slate-950 border-cyan-500/50 shadow-[0_0_35px_rgba(6,182,212,0.25)]'
          }`}
        >
          <canvas
            ref={canvasRef}
            width={640}
            height={440}
            className="w-full max-w-[640px] h-auto rounded-lg border-2 border-slate-700 block shadow-inner bg-black"
          />

          {/* Not playing pre-game overlay */}
          {!isPlaying && !isGameOver && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-4 text-center z-10">
              <p className="font-mono text-lg font-bold text-white mb-3">DEFENDA O ESPAÇO CONTRA ASTEROIDES</p>
              <button
                onClick={startNewGame}
                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold text-sm rounded cursor-pointer shadow transition"
              >
                DECOLAR 🚀
              </button>
            </div>
          )}

          {/* Virtual Mobile Controls */}
          <div className="pt-3 flex items-center justify-between gap-4 select-none">
            {/* Steering */}
            <div className="flex gap-2">
              <button
                onTouchStart={() => (keys.current.left = true)}
                onTouchEnd={() => (keys.current.left = false)}
                onMouseDown={() => (keys.current.left = true)}
                onMouseUp={() => (keys.current.left = false)}
                className="w-14 h-12 bg-black/80 text-white rounded-xl flex items-center justify-center active:bg-cyan-700 shadow"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onTouchStart={() => (keys.current.right = true)}
                onTouchEnd={() => (keys.current.right = false)}
                onMouseDown={() => (keys.current.right = true)}
                onMouseUp={() => (keys.current.right = false)}
                className="w-14 h-12 bg-black/80 text-white rounded-xl flex items-center justify-center active:bg-cyan-700 shadow"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>

            {/* Thrust & Fire */}
            <div className="flex gap-2">
              <button
                onTouchStart={() => (keys.current.thrust = true)}
                onTouchEnd={() => (keys.current.thrust = false)}
                onMouseDown={() => (keys.current.thrust = true)}
                onMouseUp={() => (keys.current.thrust = false)}
                className="px-4 py-3 bg-amber-600 active:bg-amber-500 text-white font-mono font-bold text-xs rounded-xl shadow flex items-center gap-1"
              >
                <Rocket className="w-4 h-4" />
                <span>PROPULSOR</span>
              </button>
              <button
                onClick={fireLaser}
                className="px-6 py-3 bg-rose-600 active:bg-rose-500 text-white font-mono font-black text-sm rounded-xl shadow flex items-center gap-1"
              >
                <Zap className="w-5 h-5" />
                <span>DISPARO</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div
            className={`max-w-md w-full p-6 rounded-xl border-4 text-center space-y-4 shadow-2xl ${
              isRetro
                ? 'bg-[#c0c0c0] border-white text-slate-900 shadow-[8px_8px_0px_rgba(0,0,0,0.5)]'
                : 'bg-slate-950 border-cyan-400 text-cyan-100'
            }`}
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-red-600 flex items-center justify-center text-3xl shadow-lg">
              💥
            </div>
            <h2 className="text-2xl font-mono font-black tracking-wider text-red-600 dark:text-red-400">
              NAVE DESTRUÍDA!
            </h2>
            <p className="text-sm font-mono leading-relaxed">
              Sua nave foi desintegrada pelos asteroides espaciais!
            </p>

            <div className="p-3 bg-white/60 dark:bg-slate-900 rounded font-mono text-sm space-y-1">
              <div>Pontuação Final: <strong>{score}</strong></div>
              <div>Ondas Sobrevividas: <strong>WAVE {wave}</strong></div>
              <div>Recorde Salvo: <strong>{highScore}</strong></div>
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={startNewGame}
                className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white font-mono font-bold text-xs rounded cursor-pointer shadow transition"
              >
                RECOMEÇAR MISSÃO
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
