import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw, Rocket, Trophy, Sparkles, Volume2, Shield, Zap } from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';

interface PinballGameProps {
  onBackToHub?: () => void;
  mode?: 'retro' | 'space';
}

export const PinballGame: React.FC<PinballGameProps> = ({
  onBackToHub,
  mode = 'retro',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [rank, setRank] = useState<string>('Cadete Espacial');
  const [multiplier, setMultiplier] = useState<number>(1);
  const [highScore, setHighScore] = useState<number>(12500);

  // Flipper and control flags
  const leftFlipperActive = useRef<boolean>(false);
  const rightFlipperActive = useRef<boolean>(false);
  const plungerCharging = useRef<boolean>(false);
  const plungerPower = useRef<number>(0);

  const startNewGame = () => {
    try {
      soundFx.playWhistle();
    } catch (e) {}
    setScore(0);
    setLives(3);
    setRank('Cadete Espacial');
    setMultiplier(1);
    setIsActive(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === 'z' || e.key === 'Z') {
        leftFlipperActive.current = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D' || e.key === '/' || e.key === '.') {
        rightFlipperActive.current = true;
      }
      if (e.key === ' ' || e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        plungerCharging.current = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === 'z' || e.key === 'Z') {
        leftFlipperActive.current = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D' || e.key === '/' || e.key === '.') {
        rightFlipperActive.current = false;
      }
      if (e.key === ' ' || e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        plungerCharging.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main Pinball Physics & Rendering Loop
  useEffect(() => {
    if (!isActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let ballX = 310;
    let ballY = 320;
    let ballVx = 0;
    let ballVy = -8;
    const ballRadius = 6.5;
    const gravity = 0.14;

    // Flipper dimensions & positions
    const leftFlipper = { x: 95, y: 390, length: 55, angle: 0.35, restAngle: 0.35, activeAngle: -0.55 };
    const rightFlipper = { x: 225, y: 390, length: 55, angle: Math.PI - 0.35, restAngle: Math.PI - 0.35, activeAngle: Math.PI + 0.55 };

    // Bumpers and targets
    const bumpers = [
      { x: 100, y: 120, r: 22, color: '#38bdf8', glow: '#0284c7', pts: 250, flash: 0 },
      { x: 220, y: 120, r: 22, color: '#ec4899', glow: '#be185d', pts: 250, flash: 0 },
      { x: 160, y: 180, r: 26, color: '#facc15', glow: '#ca8a04', pts: 500, flash: 0 },
      { x: 60, y: 220, r: 16, color: '#a855f7', glow: '#7e22ce', pts: 150, flash: 0 },
      { x: 260, y: 220, r: 16, color: '#a855f7', glow: '#7e22ce', pts: 150, flash: 0 },
    ];

    // Rollover hyperspace targets
    const rollovers = [
      { x: 110, y: 55, active: false, pts: 100 },
      { x: 160, y: 45, active: false, pts: 100 },
      { x: 210, y: 55, active: false, pts: 100 },
    ];

    let animId: number;

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Table Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, '#0a0d24');
      bgGrad.addColorStop(0.5, '#0e1538');
      bgGrad.addColorStop(1, '#050714');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Space Cadet Mission Graphics & Orbit Tracks
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(160, 150, 95, Math.PI * 0.8, Math.PI * 2.2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(160, 150, 65, 0, Math.PI * 2);
      ctx.stroke();

      // Mission Center Star
      ctx.fillStyle = 'rgba(250, 204, 21, 0.15)';
      ctx.beginPath();
      ctx.arc(160, 150, 30, 0, Math.PI * 2);
      ctx.fill();

      // Slingshots above flippers
      const slings = [
        { x1: 55, y1: 310, x2: 85, y2: 370, x3: 55, y3: 370 },
        { x1: 265, y1: 310, x2: 235, y2: 370, x3: 265, y3: 370 },
      ];
      ctx.fillStyle = 'rgba(236, 72, 153, 0.35)';
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 2;
      slings.forEach((s) => {
        ctx.beginPath();
        ctx.moveTo(s.x1, s.y1);
        ctx.lineTo(s.x2, s.y2);
        ctx.lineTo(s.x3, s.y3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });

      // 2. Update Flippers
      if (leftFlipperActive.current) {
        leftFlipper.angle += (leftFlipper.activeAngle - leftFlipper.angle) * 0.45;
      } else {
        leftFlipper.angle += (leftFlipper.restAngle - leftFlipper.angle) * 0.25;
      }

      if (rightFlipperActive.current) {
        rightFlipper.angle += (rightFlipper.activeAngle - rightFlipper.angle) * 0.45;
      } else {
        rightFlipper.angle += (rightFlipper.restAngle - rightFlipper.angle) * 0.25;
      }

      // Draw Left Flipper
      const lx2 = leftFlipper.x + Math.cos(leftFlipper.angle) * leftFlipper.length;
      const ly2 = leftFlipper.y + Math.sin(leftFlipper.angle) * leftFlipper.length;
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(leftFlipper.x, leftFlipper.y);
      ctx.lineTo(lx2, ly2);
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      // Draw Right Flipper
      const rx2 = rightFlipper.x + Math.cos(rightFlipper.angle) * rightFlipper.length;
      const ry2 = rightFlipper.y + Math.sin(rightFlipper.angle) * rightFlipper.length;
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(rightFlipper.x, rightFlipper.y);
      ctx.lineTo(rx2, ry2);
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      // 3. Draw & Collide Bumpers
      bumpers.forEach((b) => {
        if (b.flash > 0) b.flash--;
        ctx.save();
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = b.flash > 0 ? '#ffffff' : b.color;
        ctx.shadowColor = b.glow;
        ctx.shadowBlur = b.flash > 0 ? 20 : 12;
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Inner light core
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();

        // Bumper collision
        const dx = ballX - b.x;
        const dy = ballY - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < b.r + ballRadius) {
          b.flash = 12;
          const normalX = dx / dist;
          const normalY = dy / dist;
          ballVx = normalX * 7.5;
          ballVy = normalY * 7.5;
          setScore((s) => {
            const next = s + b.pts;
            if (next > 10000) setRank('Comandante de Frota');
            else if (next > 5000) setRank('Tenente Espacial');
            else if (next > 2000) setRank('Alferes');
            return next;
          });
          try {
            soundFx.playPowerup();
          } catch (e) {}
        }
      });

      // 4. Rollover Targets
      rollovers.forEach((ro) => {
        ctx.fillStyle = ro.active ? '#facc15' : 'rgba(250, 204, 21, 0.4)';
        ctx.beginPath();
        ctx.arc(ro.x, ro.y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        const d = Math.sqrt((ballX - ro.x) ** 2 + (ballY - ro.y) ** 2);
        if (d < 12 && !ro.active) {
          ro.active = true;
          setScore((s) => s + ro.pts);
          try {
            soundFx.playNotification();
          } catch (e) {}
        }
      });

      // 5. Plunger Lane (Right edge)
      ctx.fillStyle = 'rgba(250, 204, 21, 0.15)';
      ctx.fillRect(295, 40, 25, canvas.height - 40);
      ctx.strokeStyle = '#facc15';
      ctx.strokeRect(295, 40, 25, canvas.height - 40);

      // Plunger Spring
      if (plungerCharging.current) {
        plungerPower.current = Math.min(15, plungerPower.current + 0.5);
      } else if (plungerPower.current > 0) {
        if (ballX > 295 && ballY > 300) {
          ballVy = -plungerPower.current * 1.2;
          ballVx = -1.2;
          try {
            soundFx.playBoost();
          } catch (e) {}
        }
        plungerPower.current = 0;
      }

      ctx.fillStyle = '#ef4444';
      ctx.fillRect(300, canvas.height - 30 + plungerPower.current, 15, 20);

      // 6. Ball Physics & Movement
      ballVy += gravity;
      ballVx *= 0.995; // air drag
      ballVy *= 0.995;

      ballX += ballVx;
      ballY += ballVy;

      // Table Boundary Walls
      if (ballX <= 16) {
        ballX = 16;
        ballVx = Math.abs(ballVx) * 0.85;
      }
      if (ballX >= 295 && ballY <= 60) {
        // Curved top right entry into plunger lane
        ballX = 295;
        ballVx = -Math.abs(ballVx);
      } else if (ballX >= canvas.width - 12) {
        ballX = canvas.width - 12;
        ballVx = -Math.abs(ballVx) * 0.85;
      }
      if (ballY <= 16) {
        ballY = 16;
        ballVy = Math.abs(ballVy) * 0.85;
      }

      // Flipper Collisions (Segment distance check)
      const checkFlipperHit = (fx: number, fy: number, fx2: number, fy2: number, isLeft: boolean) => {
        const segDx = fx2 - fx;
        const segDy = fy2 - fy;
        const segLen = Math.sqrt(segDx * segDx + segDy * segDy);
        const u = Math.max(0, Math.min(1, ((ballX - fx) * segDx + (ballY - fy) * segDy) / (segLen * segLen)));
        const closeX = fx + u * segDx;
        const closeY = fy + u * segDy;
        const dist = Math.sqrt((ballX - closeX) ** 2 + (ballY - closeY) ** 2);

        if (dist < ballRadius + 6) {
          const flipperSpeed = (isLeft ? leftFlipperActive.current : rightFlipperActive.current) ? 9 : 3.5;
          ballVy = -Math.abs(ballVy) * 0.6 - flipperSpeed;
          ballVx += (isLeft ? 2.5 : -2.5) + (ballX - closeX) * 0.2;
          try {
            soundFx.playClick();
          } catch (e) {}
        }
      };

      checkFlipperHit(leftFlipper.x, leftFlipper.y, lx2, ly2, true);
      checkFlipperHit(rightFlipper.x, rightFlipper.y, rx2, ry2, false);

      // Ball Drain at Bottom
      if (ballY > canvas.height + 25) {
        setLives((l) => {
          if (l <= 1) {
            setIsActive(false);
            try {
              soundFx.playError();
            } catch (e) {}
            return 0;
          }
          // Respawn in plunger lane
          ballX = 308;
          ballY = 330;
          ballVx = 0;
          ballVy = -9;
          return l - 1;
        });
      }

      // 7. Draw Ball with Metallic Specular Highlight
      ctx.save();
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#f8fafc';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Specular glare
      ctx.beginPath();
      ctx.arc(ballX - 2, ballY - 2, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [isActive]);

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
            <Rocket className="w-4 h-4 text-cyan-700" />
            <span>3D PINBALL SPACE CADET 2000</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={startNewGame}
            className="px-3 py-1.5 bg-[#d4d0c8] hover:bg-white text-black font-mono font-bold text-xs border-2 border-white border-r-gray-800 border-b-gray-800 cursor-pointer flex items-center gap-1 shadow"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>REINICIAR</span>
          </button>
        </div>
      </div>

      {/* Control Instructions Banner */}
      <div className="bg-[#0b0f2a] p-2.5 rounded border border-cyan-500/40 text-xs font-mono flex flex-wrap items-center justify-between gap-2 shadow-inner text-cyan-200">
        <span>
          <strong>CONTROLES:</strong> <code className="bg-black/60 px-1 py-0.5 rounded text-yellow-300">◄ A / Z</code> Paleta Esq | <code className="bg-black/60 px-1 py-0.5 rounded text-yellow-300">► D / .</code> Paleta Dir | <code className="bg-black/60 px-1 py-0.5 rounded text-yellow-300">ESPAÇO</code> Lançar
        </span>
        <span className="text-yellow-300 font-bold">
          Patente: {rank}
        </span>
      </div>

      {/* Main Pinball Machine Frame */}
      <div className="bg-[#0e1538] p-4 border-2 border-cyan-500/50 rounded-xl shadow-2xl space-y-3">
        {/* Top Digital Score HUD */}
        <div className="bg-black/80 p-3 rounded-lg border border-cyan-600/60 flex items-center justify-between font-mono text-xs shadow-inner">
          <div>
            <div className="text-[10px] text-slate-400">PONTUAÇÃO</div>
            <div className="text-xl font-black text-cyan-400 tracking-wider leading-none">{score}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">RECORD</div>
            <div className="text-sm font-bold text-yellow-400">{Math.max(score, highScore)}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400">ESFERAS RESTANTES</div>
            <div className="text-sm font-bold text-red-400">{'⚪ '.repeat(lives)}</div>
          </div>
        </div>

        {/* Pinball Canvas */}
        <div className="flex justify-center bg-black p-2 rounded-lg border-2 border-blue-950 shadow-2xl">
          <canvas
            ref={canvasRef}
            width={330}
            height={430}
            className="border border-cyan-500/30 bg-black rounded"
          />
        </div>

        {/* Action Button & Launch System */}
        {!isActive ? (
          <button
            onClick={startNewGame}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold font-mono text-sm rounded-lg border border-cyan-300 shadow-xl cursor-pointer active:scale-98 transition flex items-center justify-center gap-2"
          >
            <Rocket className="w-5 h-5 fill-current" />
            <span>LANÇAR ESFERA / INICIAR MISSÃO ESPACIAL</span>
          </button>
        ) : (
          /* Mobile / Touch On-Screen Controls */
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onMouseDown={() => (leftFlipperActive.current = true)}
              onMouseUp={() => (leftFlipperActive.current = false)}
              onTouchStart={(e) => {
                e.preventDefault();
                leftFlipperActive.current = true;
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                leftFlipperActive.current = false;
              }}
              className="py-4 bg-blue-700 hover:bg-blue-600 active:bg-blue-500 text-white font-mono font-black text-xs rounded-lg border border-cyan-300 shadow-lg cursor-pointer flex items-center justify-center gap-1 select-none active:scale-95 transition"
            >
              <span>◀ ESQUERDA</span>
            </button>

            <button
              onMouseDown={() => (plungerCharging.current = true)}
              onMouseUp={() => (plungerCharging.current = false)}
              onTouchStart={(e) => {
                e.preventDefault();
                plungerCharging.current = true;
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                plungerCharging.current = false;
              }}
              className="py-4 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-mono font-black text-xs rounded-lg border border-yellow-200 shadow-lg cursor-pointer flex items-center justify-center gap-1 select-none active:scale-95 transition"
            >
              <span>🚀 LANÇAR</span>
            </button>

            <button
              onMouseDown={() => (rightFlipperActive.current = true)}
              onMouseUp={() => (rightFlipperActive.current = false)}
              onTouchStart={(e) => {
                e.preventDefault();
                rightFlipperActive.current = true;
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                rightFlipperActive.current = false;
              }}
              className="py-4 bg-blue-700 hover:bg-blue-600 active:bg-blue-500 text-white font-mono font-black text-xs rounded-lg border border-cyan-300 shadow-lg cursor-pointer flex items-center justify-center gap-1 select-none active:scale-95 transition"
            >
              <span>DIREITA ▶</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
