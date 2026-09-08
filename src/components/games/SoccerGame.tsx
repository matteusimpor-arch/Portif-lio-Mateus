import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw, Trophy, Volume2, Sparkles, Play, Pause, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../utils/soundEffects';
import { getGameHighScore, saveGameHighScore, setGameActiveStatus } from '../../utils/gameStorage';

interface SoccerGameProps {
  onBackToHub?: () => void;
  mode?: 'retro' | 'space';
}

interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  speed: number;
  color: string;
  name: string;
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  friction: number;
}

interface Goalkeeper {
  x: number;
  y: number;
  vy: number;
  width: number;
  height: number;
  minY: number;
  maxY: number;
  color: string;
}

export const SoccerGame: React.FC<SoccerGameProps> = ({
  onBackToHub,
  mode = 'retro',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [scorePlayer, setScorePlayer] = useState<number>(0);
  const [scoreCpu, setScoreCpu] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(90); // 90 second match
  const [isMatchActive, setIsMatchActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMatchOver, setIsMatchOver] = useState<boolean>(false);
  const [goalCelebration, setGoalCelebration] = useState<string | null>(null);

  // Notify M-BOT
  useEffect(() => {
    setGameActiveStatus(true, 'Futebol');
    return () => setGameActiveStatus(false);
  }, []);

  const keys = useRef<{ up: boolean; down: boolean; left: boolean; right: boolean; kick: boolean }>({
    up: false,
    down: false,
    left: false,
    right: false,
    kick: false,
  });

  const gameStateRef = useRef({
    width: 640,
    height: 380,
    player: {
      x: 200,
      y: 190,
      vx: 0,
      vy: 0,
      radius: 14,
      speed: 3.5,
      color: '#2563eb', // Blue
      name: 'Mateus',
    } as Player,
    cpu: {
      x: 440,
      y: 190,
      vx: 0,
      vy: 0,
      radius: 14,
      speed: 3.0,
      color: '#dc2626', // Red
      name: 'CPU',
    } as Player,
    ball: {
      x: 320,
      y: 190,
      vx: 0,
      vy: 0,
      radius: 8,
      friction: 0.985,
    } as Ball,
    gkPlayer: {
      x: 35,
      y: 190,
      vy: 0,
      width: 12,
      height: 48,
      minY: 130,
      maxY: 250,
      color: '#facc15', // Yellow GK jersey
    } as Goalkeeper,
    gkCpu: {
      x: 605,
      y: 190,
      vy: 0,
      width: 12,
      height: 48,
      minY: 130,
      maxY: 250,
      color: '#10b981', // Emerald GK jersey
    } as Goalkeeper,
    isGoalScored: false,
    celebrationTimer: 0,
    playerScore: 0,
    cpuScore: 0,
    gameTime: 90,
  });

  // Reset ball and players to center positions after goal
  const resetKickoff = (scorer: 'player' | 'cpu') => {
    const s = gameStateRef.current;
    s.player.x = 220;
    s.player.y = 190;
    s.player.vx = 0;
    s.player.vy = 0;

    s.cpu.x = 420;
    s.cpu.y = 190;
    s.cpu.vx = 0;
    s.cpu.vy = 0;

    s.ball.x = 320;
    s.ball.y = 190;
    s.ball.vx = scorer === 'player' ? -1 : 1;
    s.ball.vy = 0;

    s.gkPlayer.y = 190;
    s.gkCpu.y = 190;

    s.isGoalScored = false;
  };

  const startMatch = () => {
    try {
      soundFx.playWhistle();
    } catch (e) {}

    const s = gameStateRef.current;
    s.playerScore = 0;
    s.cpuScore = 0;
    s.gameTime = 90;
    setScorePlayer(0);
    setScoreCpu(0);
    setTimeLeft(90);
    setIsMatchOver(false);
    setIsPaused(false);
    setGoalCelebration(null);
    resetKickoff('cpu');
    setIsMatchActive(true);
  };

  // Match clock countdown
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isMatchActive && !isPaused && !isMatchOver) {
      timer = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            setIsMatchOver(true);
            setIsMatchActive(false);
            try { soundFx.playWhistle(); } catch (e) {}
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isMatchActive, isPaused, isMatchOver]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'Escape') {
        setIsPaused((p) => !p);
        return;
      }

      if (['ArrowUp', 'KeyW'].includes(e.code)) keys.current.up = true;
      if (['ArrowDown', 'KeyS'].includes(e.code)) keys.current.down = true;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.current.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keys.current.right = true;
      if (e.code === 'Space') {
        keys.current.kick = true;
        if (!isMatchActive || isMatchOver) {
          startMatch();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) keys.current.up = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) keys.current.down = false;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.current.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keys.current.right = false;
      if (e.code === 'Space') keys.current.kick = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isMatchActive, isMatchOver]);

  // Main RAF Physics and Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const WIDTH = 640;
    const HEIGHT = 380;
    const GOAL_TOP = 135;
    const GOAL_BOTTOM = 245;

    const gameLoop = () => {
      const state = gameStateRef.current;
      const { player, cpu, ball, gkPlayer, gkCpu } = state;

      if (isMatchActive && !isPaused && !isMatchOver) {
        if (state.isGoalScored) {
          state.celebrationTimer++;
          if (state.celebrationTimer > 120) {
            setGoalCelebration(null);
            resetKickoff('cpu');
          }
        } else {
          // -----------------------------------------------------------
          // 1. PLAYER MOVEMENT
          // -----------------------------------------------------------
          let pvx = 0;
          let pvy = 0;
          if (keys.current.up) pvy -= player.speed;
          if (keys.current.down) pvy += player.speed;
          if (keys.current.left) pvx -= player.speed;
          if (keys.current.right) pvx += player.speed;

          // Normalize diagonal
          if (pvx !== 0 && pvy !== 0) {
            pvx *= 0.707;
            pvy *= 0.707;
          }

          player.x = Math.max(30, Math.min(WIDTH - 30, player.x + pvx));
          player.y = Math.max(25, Math.min(HEIGHT - 25, player.y + pvy));

          // -----------------------------------------------------------
          // 2. CPU AI LOGIC
          // -----------------------------------------------------------
          const cpuDistToBall = Math.hypot(ball.x - cpu.x, ball.y - cpu.y);
          const isDefending = ball.x < 280; // Ball is in player's half

          let cpuTargetX = ball.x;
          let cpuTargetY = ball.y;

          if (isDefending && cpuDistToBall > 120) {
            // Patrol midfield
            cpuTargetX = 400;
            cpuTargetY = 190 + Math.sin(Date.now() * 0.003) * 60;
          }

          const cpuDx = cpuTargetX - cpu.x;
          const cpuDy = cpuTargetY - cpu.y;
          const cpuDist = Math.hypot(cpuDx, cpuDy);

          if (cpuDist > 5) {
            cpu.x += (cpuDx / cpuDist) * cpu.speed;
            cpu.y += (cpuDy / cpuDist) * cpu.speed;
          }

          // CPU constraints
          cpu.x = Math.max(30, Math.min(WIDTH - 30, cpu.x));
          cpu.y = Math.max(25, Math.min(HEIGHT - 25, cpu.y));

          // -----------------------------------------------------------
          // 3. GOALKEEPERS (GUARANTEED NEVER DISAPPEAR, PERMANENT FIX)
          // -----------------------------------------------------------
          // Player Goalkeeper tracks ball Y within goal post range
          const targetGkPlayerY = Math.max(gkPlayer.minY + 20, Math.min(gkPlayer.maxY - 20, ball.y));
          gkPlayer.y += (targetGkPlayerY - gkPlayer.y) * 0.18;

          // CPU Goalkeeper tracks ball Y within goal post range
          const targetGkCpuY = Math.max(gkCpu.minY + 20, Math.min(gkCpu.maxY - 20, ball.y));
          gkCpu.y += (targetGkCpuY - gkCpu.y) * 0.18;

          // -----------------------------------------------------------
          // 4. BALL PHYSICS & TACKLE / DRIBBLE / SHOT
          // -----------------------------------------------------------
          ball.x += ball.vx;
          ball.y += ball.vy;
          ball.vx *= ball.friction;
          ball.vy *= ball.friction;

          // Stop micro drift
          if (Math.hypot(ball.vx, ball.vy) < 0.05) {
            ball.vx = 0;
            ball.vy = 0;
          }

          // Player dribble / kick
          const distToPlayer = Math.hypot(ball.x - player.x, ball.y - player.y);
          if (distToPlayer < player.radius + ball.radius + 4) {
            const angle = Math.atan2(ball.y - player.y, ball.x - player.x);
            if (keys.current.kick) {
              // POWER SHOT!
              const shotPower = 11.5;
              ball.vx = Math.cos(angle) * shotPower;
              ball.vy = Math.sin(angle) * shotPower;
              try { soundFx.playBounce(500); } catch (e) {}
            } else {
              // Nudge dribble
              const nudgePower = 3.2;
              ball.vx = Math.cos(angle) * nudgePower + pvx * 0.4;
              ball.vy = Math.sin(angle) * nudgePower + pvy * 0.4;
              try { soundFx.playBounce(300); } catch (e) {}
            }
          }

          // CPU dribble / kick
          if (cpuDistToBall < cpu.radius + ball.radius + 4) {
            // CPU shoots towards player's goal (left)
            const angleToGoal = Math.atan2(190 - ball.y, 25 - ball.x);
            const cpuShotPower = cpu.x < 300 ? 9.5 : 4.5;
            ball.vx = Math.cos(angleToGoal) * cpuShotPower + (Math.random() - 0.5);
            ball.vy = Math.sin(angleToGoal) * cpuShotPower + (Math.random() - 0.5) * 2;
            try { soundFx.playBounce(350); } catch (e) {}
          }

          // Goalkeeper Collisions (Defenses)
          // Player GK Save
          if (
            ball.x - ball.radius < gkPlayer.x + gkPlayer.width &&
            ball.x + ball.radius > gkPlayer.x &&
            ball.y > gkPlayer.y - gkPlayer.height / 2 &&
            ball.y < gkPlayer.y + gkPlayer.height / 2
          ) {
            ball.x = gkPlayer.x + gkPlayer.width + ball.radius + 2;
            ball.vx = Math.abs(ball.vx) * 0.9 + 2;
            ball.vy += (Math.random() - 0.5) * 4;
            try { soundFx.playBounce(600); } catch (e) {}
          }

          // CPU GK Save
          if (
            ball.x + ball.radius > gkCpu.x - gkCpu.width &&
            ball.x - ball.radius < gkCpu.x &&
            ball.y > gkCpu.y - gkCpu.height / 2 &&
            ball.y < gkCpu.y + gkCpu.height / 2
          ) {
            ball.x = gkCpu.x - gkCpu.width - ball.radius - 2;
            ball.vx = -Math.abs(ball.vx) * 0.9 - 2;
            ball.vy += (Math.random() - 0.5) * 4;
            try { soundFx.playBounce(600); } catch (e) {}
          }

          // Pitch Side Bounds (Top & Bottom pitch walls)
          if (ball.y - ball.radius < 20) {
            ball.y = 20 + ball.radius;
            ball.vy = -ball.vy * 0.8;
          }
          if (ball.y + ball.radius > HEIGHT - 20) {
            ball.y = HEIGHT - 20 - ball.radius;
            ball.vy = -ball.vy * 0.8;
          }

          // -----------------------------------------------------------
          // 5. GOAL SCORING DETECTION
          // -----------------------------------------------------------
          // CPU Goal (Ball enters Left net)
          if (ball.x - ball.radius < 24 && ball.y >= GOAL_TOP && ball.y <= GOAL_BOTTOM) {
            state.isGoalScored = true;
            state.celebrationTimer = 0;
            state.cpuScore++;
            setScoreCpu(state.cpuScore);
            setGoalCelebration('GOL DO CPU! ⚽');
            try { soundFx.playWhistle(); } catch (e) {}
          } else if (ball.x - ball.radius < 24) {
            // Rebound off left back line outside goal
            ball.x = 24 + ball.radius;
            ball.vx = -ball.vx * 0.8;
          }

          // PLAYER GOAL (Ball enters Right net!)
          if (ball.x + ball.radius > WIDTH - 24 && ball.y >= GOAL_TOP && ball.y <= GOAL_BOTTOM) {
            state.isGoalScored = true;
            state.celebrationTimer = 0;
            state.playerScore++;
            setScorePlayer(state.playerScore);
            setGoalCelebration('GOOOOOL DE MATEUS! 🏆⚽');
            try {
              soundFx.playWhistle();
              soundFx.playFanfare();
            } catch (e) {}
            confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
            saveGameHighScore('soccer', state.playerScore);
          } else if (ball.x + ball.radius > WIDTH - 24) {
            // Rebound off right back line outside goal
            ball.x = WIDTH - 24 - ball.radius;
            ball.vx = -ball.vx * 0.8;
          }
        }
      }

      // -------------------------------------------------------------
      // RENDERING TOP-DOWN PITCH
      // -------------------------------------------------------------
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      const isRetro = mode === 'retro';

      // Pitch Grass Pattern (striped)
      for (let i = 0; i < WIDTH; i += 64) {
        ctx.fillStyle = (i / 64) % 2 === 0
          ? isRetro ? '#15803d' : '#064e3b'
          : isRetro ? '#16a34a' : '#047857';
        ctx.fillRect(i, 0, 64, HEIGHT);
      }

      // White Field Markings
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;

      // Outer Pitch Border
      ctx.strokeRect(24, 18, WIDTH - 48, HEIGHT - 36);

      // Halfway Line
      ctx.beginPath();
      ctx.moveTo(WIDTH / 2, 18);
      ctx.lineTo(WIDTH / 2, HEIGHT - 18);
      ctx.stroke();

      // Center Circle & Spot
      ctx.beginPath();
      ctx.arc(WIDTH / 2, HEIGHT / 2, 55, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(WIDTH / 2, HEIGHT / 2, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Left Penalty Box & Goal
      ctx.strokeRect(24, 90, 85, 200);
      ctx.strokeRect(24, 135, 35, 110);
      // Net Left
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(6, GOAL_TOP, 18, GOAL_BOTTOM - GOAL_TOP);
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(6, GOAL_TOP, 18, GOAL_BOTTOM - GOAL_TOP);

      // Right Penalty Box & Goal
      ctx.strokeRect(WIDTH - 109, 90, 85, 200);
      ctx.strokeRect(WIDTH - 59, 135, 35, 110);
      // Net Right
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(WIDTH - 24, GOAL_TOP, 18, GOAL_BOTTOM - GOAL_TOP);
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(WIDTH - 24, GOAL_TOP, 18, GOAL_BOTTOM - GOAL_TOP);

      // Goalkeepers
      // Player GK
      ctx.fillStyle = gkPlayer.color;
      ctx.fillRect(
        gkPlayer.x - gkPlayer.width / 2,
        gkPlayer.y - gkPlayer.height / 2,
        gkPlayer.width,
        gkPlayer.height
      );
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(
        gkPlayer.x - gkPlayer.width / 2,
        gkPlayer.y - gkPlayer.height / 2,
        gkPlayer.width,
        gkPlayer.height
      );

      // CPU GK
      ctx.fillStyle = gkCpu.color;
      ctx.fillRect(
        gkCpu.x - gkCpu.width / 2,
        gkCpu.y - gkCpu.height / 2,
        gkCpu.width,
        gkCpu.height
      );
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(
        gkCpu.x - gkCpu.width / 2,
        gkCpu.y - gkCpu.height / 2,
        gkCpu.width,
        gkCpu.height
      );

      // Players
      // Player (Mateus)
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 6;
      ctx.fillStyle = player.color;
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Number 10 on back
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('10', player.x, player.y);

      // Player Name Tag
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('MATEUS', player.x, player.y - 18);
      ctx.restore();

      // CPU Player
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 6;
      ctx.fillStyle = cpu.color;
      ctx.beginPath();
      ctx.arc(cpu.x, cpu.y, cpu.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Number 7 on back
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('7', cpu.x, cpu.y);

      // CPU Name Tag
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('CPU', cpu.x, cpu.y - 18);
      ctx.restore();

      // Ball
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Black soccer hexagons
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [isMatchActive, isPaused, isMatchOver, mode]);

  const isRetro = mode === 'retro';

  // Format time (e.g. 01:25)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

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
            ⚽ {isRetro ? 'FUTEBOL INTERNACIONAL 2000' : 'CYBER SOCCER 2026'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isMatchActive && !isMatchOver && (
            <button
              onClick={() => setIsPaused((p) => !p)}
              className="px-2.5 py-1 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-mono font-bold text-xs border border-yellow-600 rounded flex items-center gap-1 cursor-pointer shadow"
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? 'CONTINUAR' : 'PAUSAR'}</span>
            </button>
          )}

          <button
            onClick={startMatch}
            className={`px-3 py-1 font-mono font-bold text-xs border-2 cursor-pointer flex items-center gap-1 shadow ${
              isRetro
                ? 'bg-[#d4d0c8] hover:bg-white text-black border-white border-r-gray-800 border-b-gray-800'
                : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 border-emerald-300 rounded'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>NOVA PARTIDA</span>
          </button>
        </div>
      </div>

      {/* Broadcast Scoreboard */}
      <div
        className={`px-4 py-2 border-2 rounded-lg flex items-center justify-between font-mono shadow-lg ${
          isRetro
            ? 'bg-[#000080] border-white text-white'
            : 'bg-slate-950/90 border-cyan-500/50 text-cyan-100 backdrop-blur-md'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block border border-white" />
            <span className="font-black text-sm">MATEUS</span>
          </div>
          <span className="text-2xl font-black text-yellow-300 px-2 py-0.5 bg-black/40 rounded border border-white/20">
            {scorePlayer}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[10px] text-white/70 tracking-widest font-bold">TEMPO DE JOGO</span>
          <span className="text-lg font-black text-yellow-300">{formatTime(timeLeft)}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-2xl font-black text-yellow-300 px-2 py-0.5 bg-black/40 rounded border border-white/20">
            {scoreCpu}
          </span>
          <div className="flex items-center gap-2">
            <span className="font-black text-sm">CPU</span>
            <span className="w-3 h-3 rounded-full bg-red-600 inline-block border border-white" />
          </div>
        </div>
      </div>

      {/* Pitch Stadium Canvas */}
      <div className="flex flex-col items-center justify-center p-1 relative">
        <div
          className={`relative p-2.5 rounded-2xl border-4 shadow-2xl overflow-hidden ${
            isRetro
              ? 'bg-[#1e293b] border-gray-400 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]'
              : 'bg-slate-950 border-emerald-500/50 shadow-[0_0_35px_rgba(16,185,129,0.25)]'
          }`}
        >
          <canvas
            ref={canvasRef}
            width={640}
            height={380}
            className="w-full max-w-[640px] h-auto rounded-lg border-2 border-green-950 block shadow-inner"
          />

          {/* Goal celebration banner overlay */}
          {goalCelebration && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 animate-bounce">
              <div className="bg-yellow-400 text-slate-950 font-mono font-black text-xl sm:text-2xl px-6 py-3 rounded-2xl border-4 border-black shadow-2xl tracking-widest">
                {goalCelebration}
              </div>
            </div>
          )}

          {/* Not active overlay */}
          {!isMatchActive && !isMatchOver && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-4 text-center z-10">
              <p className="font-mono text-lg font-bold text-white mb-3">PARTIDA DE 90 SEGUNDOS</p>
              <button
                onClick={startMatch}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono font-bold text-sm rounded cursor-pointer shadow transition"
              >
                APITAR INÍCIO ⚽
              </button>
            </div>
          )}

          {/* Touch Virtual Controls for Mobile */}
          <div className="pt-3 flex items-center justify-between gap-4 select-none">
            {/* D-Pad */}
            <div className="flex flex-col items-center gap-1">
              <button
                onTouchStart={() => (keys.current.up = true)}
                onTouchEnd={() => (keys.current.up = false)}
                className="w-11 h-10 bg-black/80 text-white rounded-lg flex items-center justify-center active:bg-blue-700 shadow"
              >
                <ChevronUp className="w-6 h-6" />
              </button>
              <div className="flex gap-2">
                <button
                  onTouchStart={() => (keys.current.left = true)}
                  onTouchEnd={() => (keys.current.left = false)}
                  className="w-11 h-10 bg-black/80 text-white rounded-lg flex items-center justify-center active:bg-blue-700 shadow"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onTouchStart={() => (keys.current.down = true)}
                  onTouchEnd={() => (keys.current.down = false)}
                  className="w-11 h-10 bg-black/80 text-white rounded-lg flex items-center justify-center active:bg-blue-700 shadow"
                >
                  <ChevronDown className="w-6 h-6" />
                </button>
                <button
                  onTouchStart={() => (keys.current.right = true)}
                  onTouchEnd={() => (keys.current.right = false)}
                  className="w-11 h-10 bg-black/80 text-white rounded-lg flex items-center justify-center active:bg-blue-700 shadow"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Kick Button */}
            <button
              onTouchStart={() => (keys.current.kick = true)}
              onTouchEnd={() => (keys.current.kick = false)}
              onMouseDown={() => (keys.current.kick = true)}
              onMouseUp={() => (keys.current.kick = false)}
              className="px-6 py-4 bg-yellow-500 active:bg-yellow-400 text-slate-950 font-mono font-black text-sm rounded-2xl border-2 border-yellow-300 active:scale-95 shadow cursor-pointer flex items-center gap-1.5"
            >
              <Zap className="w-5 h-5 fill-slate-950" />
              <span>CHUTAR!</span>
            </button>
          </div>
        </div>
      </div>

      {/* Match Over Modal */}
      {isMatchOver && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div
            className={`max-w-md w-full p-6 rounded-xl border-4 text-center space-y-4 shadow-2xl ${
              isRetro
                ? 'bg-[#c0c0c0] border-white text-slate-900 shadow-[8px_8px_0px_rgba(0,0,0,0.5)]'
                : 'bg-slate-950 border-emerald-400 text-emerald-100'
            }`}
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-yellow-400 flex items-center justify-center text-3xl shadow-lg">
              {scorePlayer > scoreCpu ? '🏆' : scorePlayer === scoreCpu ? '🤝' : '⚽'}
            </div>
            <h2 className="text-2xl font-mono font-black tracking-wider text-green-700 dark:text-emerald-300">
              FIM DE PARTIDA!
            </h2>
            <p className="text-sm font-mono leading-relaxed">
              {scorePlayer > scoreCpu
                ? 'VITÓRIA DE MATEUS! Excelente atuação contra o CPU!'
                : scorePlayer === scoreCpu
                ? 'EMPATE TÉCNICO! Grande equilíbrio em campo.'
                : 'VITÓRIA DO CPU! Tente novamente para a revanche.'}
            </p>

            <div className="p-4 bg-white/60 dark:bg-slate-900 rounded font-mono text-base space-y-1 font-bold">
              <div className="text-xl text-yellow-500 dark:text-yellow-300">
                MATEUS {scorePlayer} X {scoreCpu} CPU
              </div>
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={startMatch}
                className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white font-mono font-bold text-xs rounded cursor-pointer shadow transition"
              >
                JOGAR REVANCHE
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
