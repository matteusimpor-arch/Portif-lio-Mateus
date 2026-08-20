import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Play, RotateCcw, Volume2, Shield, Sparkles, Flag, ArrowRight, Zap, Target, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../utils/soundEffects';

interface Team {
  id: string;
  name: string;
  flag: string;
  primaryColor: string;
  secondaryColor: string;
  starPlayer: string;
}

const TEAMS: Team[] = [
  { id: 'bra', name: 'Brasil', flag: '🇧🇷', primaryColor: '#facc15', secondaryColor: '#15803d', starPlayer: 'Rivaldo & Ronaldo #9' },
  { id: 'fra', name: 'França', flag: '🇫🇷', primaryColor: '#1d4ed8', secondaryColor: '#ef4444', starPlayer: 'Zidane & Henry #10' },
  { id: 'ita', name: 'Itália', flag: '🇮🇹', primaryColor: '#2563eb', secondaryColor: '#ffffff', starPlayer: 'Totti & Del Piero #10' },
  { id: 'arg', name: 'Argentina', flag: '🇦🇷', primaryColor: '#38bdf8', secondaryColor: '#ffffff', starPlayer: 'Batistuta & Verón #9' },
  { id: 'ger', name: 'Alemanha', flag: '🇩🇪', primaryColor: '#f8fafc', secondaryColor: '#0f172a', starPlayer: 'Kahn & Ballack #13' },
  { id: 'ned', name: 'Holanda', flag: '🇳🇱', primaryColor: '#ea580c', secondaryColor: '#ffffff', starPlayer: 'Kluivert & Davids #8' },
  { id: 'por', name: 'Portugal', flag: '🇵🇹', primaryColor: '#dc2626', secondaryColor: '#16a34a', starPlayer: 'Luís Figo #7' },
];

type GamePhase = 'AIM_X' | 'AIM_Y' | 'POWER' | 'BALL_FLIGHT' | 'RESULT' | 'MATCH_OVER';

interface SoccerGameProps {
  onBackToHub?: () => void;
  mode?: 'retro' | 'space';
}

export const SoccerGame: React.FC<SoccerGameProps> = ({
  onBackToHub,
  mode = 'retro',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [playerTeam, setPlayerTeam] = useState<Team>(TEAMS[0]);
  const [cpuTeam, setCpuTeam] = useState<Team>(TEAMS[1]);
  const [gameMode, setGameMode] = useState<'penalties' | 'freekicks'>('penalties');

  // Match state
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [playerScores, setPlayerScores] = useState<boolean[]>([]);
  const [cpuScores, setCpuScores] = useState<boolean[]>([]);
  const [phase, setPhase] = useState<GamePhase>('AIM_X');
  const [bannerText, setBannerText] = useState<string>('SEU CHUTE: MIRE A DIREÇÃO (ESQUERDA / DIREITA)');
  const [totalScore, setTotalScore] = useState<number>(0);
  const [shotsTaken, setShotsTaken] = useState<number>(0);
  const [goalsScored, setGoalsScored] = useState<number>(0);

  // Kick parameters
  const [aimX, setAimX] = useState<number>(0.5);
  const [aimY, setAimY] = useState<number>(0.5);
  const [power, setPower] = useState<number>(0.7);

  // Oscillators for meter
  const [oscX, setOscX] = useState<number>(0.5);
  const [oscY, setOscY] = useState<number>(0.5);
  const [oscPower, setOscPower] = useState<number>(0.5);

  // Animation values
  const [ballState, setBallState] = useState<{
    x: number;
    y: number;
    scale: number;
    spin: number;
    targetX: number;
    targetY: number;
    active: boolean;
  }>({
    x: 180,
    y: 260,
    scale: 1,
    spin: 0,
    targetX: 180,
    targetY: 100,
    active: false,
  });

  const [goalieState, setGoalieState] = useState<{
    x: number;
    y: number;
    action: 'idle' | 'jump-left' | 'jump-right' | 'jump-center' | 'jump-top-left' | 'jump-top-right';
  }>({
    x: 180,
    y: 110,
    action: 'idle',
  });

  const startMatch = () => {
    try {
      soundFx.playWhistle();
    } catch (e) {}
    setCurrentRound(1);
    setPlayerScores([]);
    setCpuScores([]);
    setPhase('AIM_X');
    setBannerText('SEU CHUTE: MIRE A DIREÇÃO (ESQUERDA / DIREITA)');
    setTotalScore(0);
    setShotsTaken(0);
    setGoalsScored(0);
    resetBallAndGoalie();
  };

  const resetBallAndGoalie = () => {
    setBallState({
      x: 180,
      y: 260,
      scale: 1,
      spin: 0,
      targetX: 180,
      targetY: 100,
      active: false,
    });
    setGoalieState({
      x: 180,
      y: 110,
      action: 'idle',
    });
  };

  useEffect(() => {
    startMatch();
  }, [playerTeam, cpuTeam, gameMode]);

  // Meter oscillation loop
  useEffect(() => {
    let animId: number;
    let t = 0;

    const oscLoop = () => {
      t += 0.05;
      if (phase === 'AIM_X') {
        setOscX((Math.sin(t * 1.5) + 1) / 2);
      } else if (phase === 'AIM_Y') {
        setOscY((Math.sin(t * 1.8) + 1) / 2);
      } else if (phase === 'POWER') {
        setOscPower((Math.sin(t * 2.2) + 1) / 2);
      }
      animId = requestAnimationFrame(oscLoop);
    };

    animId = requestAnimationFrame(oscLoop);
    return () => cancelAnimationFrame(animId);
  }, [phase]);

  // Handle player meter click / action
  const handleKickAction = () => {
    try {
      soundFx.playClick();
    } catch (e) {}

    if (phase === 'AIM_X') {
      setAimX(oscX);
      setPhase('AIM_Y');
      setBannerText('AGORA DEFINA A ALTURA DO CHUTE (RASTEIRO / ALTO)');
    } else if (phase === 'AIM_Y') {
      setAimY(oscY);
      setPhase('POWER');
      setBannerText('DEFINA A FORÇA DO CHUTE!');
    } else if (phase === 'POWER') {
      const selectedPower = oscPower;
      setPower(selectedPower);
      setPhase('BALL_FLIGHT');
      executeShot(aimX, aimY, selectedPower);
    }
  };

  // Keyboard space / enter listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (['AIM_X', 'AIM_Y', 'POWER'].includes(phase)) {
          handleKickAction();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, oscX, oscY, oscPower, aimX, aimY]);

  // Execute ball flight and Goalkeeper AI defense
  const executeShot = (ax: number, ay: number, pwr: number) => {
    try {
      soundFx.playBoost();
    } catch (e) {}

    // Goal boundaries: X from 80 to 280, Y from 50 to 130
    const targetX = 80 + ax * 200;
    const targetY = 130 - ay * 75;

    // Goalkeeper AI decision
    const goalieChoices: Array<'jump-left' | 'jump-right' | 'jump-center' | 'jump-top-left' | 'jump-top-right'> = [
      'jump-left',
      'jump-right',
      'jump-center',
      'jump-top-left',
      'jump-top-right',
    ];
    // Goalkeeper has high probability to guess near targetX
    let goalieAction: 'idle' | 'jump-left' | 'jump-right' | 'jump-center' | 'jump-top-left' | 'jump-top-right' = 'jump-center';
    if (ax < 0.4) {
      goalieAction = ay > 0.6 ? 'jump-top-left' : 'jump-left';
    } else if (ax > 0.6) {
      goalieAction = ay > 0.6 ? 'jump-top-right' : 'jump-right';
    } else {
      goalieAction = 'jump-center';
    }

    // 25% chance of misdirection/error by goalie
    if (Math.random() < 0.28) {
      goalieAction = goalieChoices[Math.floor(Math.random() * goalieChoices.length)];
    }

    setGoalieState({
      x: 180 + (goalieAction.includes('left') ? -65 : goalieAction.includes('right') ? 65 : 0),
      y: goalieAction.includes('top') ? 80 : 105,
      action: goalieAction,
    });

    setBallState({
      x: 180,
      y: 260,
      scale: 1,
      spin: (ax - 0.5) * 15,
      targetX,
      targetY,
      active: true,
    });

    // Check Goal vs Saved vs Missed
    const goalieSaved =
      (goalieAction.includes('left') && ax < 0.45) ||
      (goalieAction.includes('right') && ax > 0.55) ||
      (goalieAction === 'jump-center' && ax >= 0.4 && ax <= 0.6);

    const isMissed = pwr > 0.95 || ax < 0.05 || ax > 0.95;
    const isGoal = !goalieSaved && !isMissed;

    setTimeout(() => {
      setShotsTaken((s) => s + 1);
      if (isGoal) {
        setGoalsScored((g) => g + 1);
        setTotalScore((s) => s + (gameMode === 'freekicks' ? 500 : 300));
        setPlayerScores((prev) => [...prev, true]);
        setBannerText('⚽ GOOOOOOL! GOLAÇO RETRÔ SUPER STAR SOCCER!');
        try {
          soundFx.playFanfare();
        } catch (e) {}
        confetti({ particleCount: 120, spread: 80 });
      } else if (goalieSaved) {
        setPlayerScores((prev) => [...prev, false]);
        setBannerText('🧤 DEFEENDEU O GOLEIRO! ESPETACULAR DEFESA!');
        try {
          soundFx.playError();
        } catch (e) {}
      } else {
        setPlayerScores((prev) => [...prev, false]);
        setBannerText('❌ PRA FORA! A BOLA SUBIU DEMAIS!');
        try {
          soundFx.playError();
        } catch (e) {}
      }

      setPhase('RESULT');

      // Next round after delay
      setTimeout(() => {
        if (currentRound >= 5) {
          setPhase('MATCH_OVER');
          setBannerText('FIM DA DISPUTA DE PÊNALTIS!');
        } else {
          setCurrentRound((r) => r + 1);
          setPhase('AIM_X');
          setBannerText(`RODADA ${currentRound + 1}: SEU CHUTE - MIRE A DIREÇÃO`);
          resetBallAndGoalie();
        }
      }, 2500);
    }, 900);
  };

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let renderAnimId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Stadium Sky and Lights
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 90);
      skyGrad.addColorStop(0, '#0f172a');
      skyGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, 90);

      // Crowd dots
      for (let i = 0; i < 40; i++) {
        const cx = (i * 9) % canvas.width;
        const cy = 20 + ((i * 7) % 50);
        ctx.fillStyle = i % 3 === 0 ? '#facc15' : i % 2 === 0 ? '#ef4444' : '#38bdf8';
        ctx.fillRect(cx, cy, 3, 3);
      }

      // Stadium Banner
      ctx.fillStyle = '#000080';
      ctx.fillRect(0, 75, canvas.width, 15);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('⚽ INTERNATIONAL SUPER STAR SOCCER 2000 ⚽ MATEUS OS', 10, 86);

      // 2. Pitch / Grass
      const grassY = 90;
      for (let y = grassY; y < canvas.height; y += 18) {
        ctx.fillStyle = Math.floor((y - grassY) / 18) % 2 === 0 ? '#15803d' : '#16a34a';
        ctx.fillRect(0, y, canvas.width, 18);
      }

      // Penalty Area Lines
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(40, 150);
      ctx.lineTo(320, 150);
      ctx.lineTo(350, canvas.height);
      ctx.moveTo(40, 150);
      ctx.lineTo(10, canvas.height);
      ctx.arc(180, 260, 3, 0, Math.PI * 2);
      ctx.stroke();

      // 3. Goal Posts & Net
      const goalLeft = 70;
      const goalRight = 290;
      const goalTop = 45;
      const goalBottom = 135;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(goalLeft, goalTop, goalRight - goalLeft, goalBottom - goalTop);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1;
      for (let nx = goalLeft; nx <= goalRight; nx += 12) {
        ctx.beginPath();
        ctx.moveTo(nx, goalTop);
        ctx.lineTo(nx, goalBottom);
        ctx.stroke();
      }
      for (let ny = goalTop; ny <= goalBottom; ny += 10) {
        ctx.beginPath();
        ctx.moveTo(goalLeft, ny);
        ctx.lineTo(goalRight, ny);
        ctx.stroke();
      }

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5;
      ctx.strokeRect(goalLeft, goalTop, goalRight - goalLeft, goalBottom - goalTop);

      // 4. Fully Proportioned Goalkeeper (Complete Body, Legs, Gloves & Boots)
      ctx.save();
      ctx.translate(goalieState.x, goalieState.y);

      const goalieCol = cpuTeam.primaryColor;
      ctx.fillStyle = goalieCol;

      if (goalieState.action === 'idle') {
        // Torso / Jersey
        ctx.fillRect(-12, -22, 24, 26);
        // Head
        ctx.fillStyle = '#fbcfe8';
        ctx.beginPath();
        ctx.arc(0, -30, 8, 0, Math.PI * 2);
        ctx.fill();
        // Hair
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(0, -34, 7, Math.PI, 0);
        ctx.fill();
        // Arms
        ctx.fillStyle = goalieCol;
        ctx.fillRect(-18, -18, 7, 14);
        ctx.fillRect(11, -18, 7, 14);
        // Gloves
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-20, -4, 9, 8);
        ctx.fillRect(11, -4, 9, 8);
        // Shorts
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-11, 4, 22, 14);
        // Legs
        ctx.fillStyle = '#fbcfe8';
        ctx.fillRect(-9, 18, 7, 14);
        ctx.fillRect(2, 18, 7, 14);
        // Boots
        ctx.fillStyle = '#000000';
        ctx.fillRect(-10, 32, 9, 5);
        ctx.fillRect(1, 32, 9, 5);
      } else {
        // Goalkeeper Diving / Jumping - FULL BODY PRESERVED
        const isLeft = goalieState.action.includes('left');
        const isRight = goalieState.action.includes('right');
        const angle = isLeft ? -0.45 : isRight ? 0.45 : 0;

        ctx.rotate(angle);

        // Torso / Jersey
        ctx.fillStyle = goalieCol;
        ctx.fillRect(-14, -20, 28, 24);

        // Head
        ctx.fillStyle = '#fbcfe8';
        ctx.beginPath();
        ctx.arc(isLeft ? -6 : isRight ? 6 : 0, -28, 8, 0, Math.PI * 2);
        ctx.fill();

        // Stretched Arms & Gloves
        ctx.fillStyle = goalieCol;
        ctx.fillRect(isLeft ? -30 : -8, -18, 18, 8);
        ctx.fillRect(isLeft ? -8 : 12, -18, 18, 8);

        ctx.fillStyle = '#ffffff'; // White keeper gloves
        ctx.fillRect(isLeft ? -34 : 28, -20, 10, 11);
        ctx.fillRect(isLeft ? -18 : 14, -20, 10, 11);

        // Shorts
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-12, 4, 24, 14);

        // Extended Legs
        ctx.fillStyle = '#fbcfe8';
        ctx.fillRect(isLeft ? -4 : -12, 18, 8, 16);
        ctx.fillRect(isLeft ? 6 : -2, 18, 8, 16);

        // Boots
        ctx.fillStyle = '#000000';
        ctx.fillRect(isLeft ? -5 : -13, 34, 10, 6);
        ctx.fillRect(isLeft ? 5 : -3, 34, 10, 6);
      }

      ctx.restore();

      // 5. Ball Rendering
      if (phase === 'BALL_FLIGHT' || phase === 'RESULT') {
        const b = ballState;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.spin);

        ctx.beginPath();
        ctx.arc(0, 0, 10 * b.scale, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Hexagon dots on soccer ball
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(0, 0, 3 * b.scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      } else {
        // Ball resting on penalty spot
        ctx.beginPath();
        ctx.arc(180, 260, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(180, 260, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      renderAnimId = requestAnimationFrame(draw);
    };

    renderAnimId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(renderAnimId);
  }, [goalieState, ballState, phase, cpuTeam]);

  // Ball flight physics update loop
  useEffect(() => {
    if (phase !== 'BALL_FLIGHT') return;

    const interval = setInterval(() => {
      setBallState((b) => {
        const dx = b.targetX - b.x;
        const dy = b.targetY - b.y;

        const newX = b.x + dx * 0.18;
        const newY = b.y + dy * 0.18;
        const newScale = Math.max(0.45, b.scale - 0.05);

        return {
          ...b,
          x: newX,
          y: newY,
          scale: newScale,
          spin: b.spin + 0.3,
        };
      });
    }, 30);

    return () => clearInterval(interval);
  }, [phase]);

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
            <span>⚽ FUTEBOL 2000 (SUPER STAR SOCCER)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={startMatch}
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
          <strong>CONTROLES:</strong> Aperte <code className="bg-black/60 px-1 py-0.5 rounded text-white">ESPAÇO</code> ou clique no botão para calibrar Mira X, Mira Y e Força!
        </span>
        <span className="text-white">
          Placar: <strong className="text-yellow-300">{goalsScored} / {shotsTaken}</strong>
        </span>
      </div>

      {/* Match Scoreboard */}
      <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 flex flex-wrap items-center justify-between gap-4 font-mono text-xs shadow-xl">
        <div className="flex items-center gap-3">
          <span className="text-xl">{playerTeam.flag}</span>
          <div>
            <div className="font-black text-yellow-400">{playerTeam.name.toUpperCase()} (VOCÊ)</div>
            <div className="text-[10px] text-slate-400">{playerTeam.starPlayer}</div>
          </div>
        </div>

        {/* Penalty shootout indicator dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px] font-black ${
                playerScores[i] === true
                  ? 'bg-emerald-500 text-white'
                  : playerScores[i] === false
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {playerScores[i] === true ? '✓' : playerScores[i] === false ? '✕' : i + 1}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-black text-slate-300">{cpuTeam.name.toUpperCase()} (CPU)</div>
            <div className="text-[10px] text-slate-400">{cpuTeam.starPlayer}</div>
          </div>
          <span className="text-xl">{cpuTeam.flag}</span>
        </div>
      </div>

      {/* Main Pitch Stadium Canvas */}
      <div className="flex justify-center bg-black p-2 rounded-lg border-2 border-green-700 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={360}
          height={300}
          className="border border-green-500/40 bg-black rounded"
        />
      </div>

      {/* Interactive Oscillating Meters & Touch Buttons */}
      <div className="bg-slate-900/90 p-4 rounded-lg border border-slate-700 space-y-3 font-mono text-xs">
        <div className="text-center font-bold text-yellow-300 bg-black/60 p-2 rounded border border-slate-800">
          {bannerText}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Meter 1: Mira X */}
          <div className={`p-2.5 rounded border ${phase === 'AIM_X' ? 'bg-blue-950 border-cyan-400 ring-2 ring-cyan-500' : 'bg-slate-800 border-slate-700 opacity-60'}`}>
            <div className="flex justify-between text-[11px] mb-1 font-bold text-slate-300">
              <span>1. DIREÇÃO (X)</span>
              <span>{Math.round(oscX * 100)}%</span>
            </div>
            <div className="w-full bg-slate-950 h-3 rounded overflow-hidden relative border border-slate-700">
              <div
                className="bg-cyan-400 h-full transition-all duration-75"
                style={{ width: `${oscX * 100}%` }}
              />
            </div>
          </div>

          {/* Meter 2: Altura Y */}
          <div className={`p-2.5 rounded border ${phase === 'AIM_Y' ? 'bg-blue-950 border-cyan-400 ring-2 ring-cyan-500' : 'bg-slate-800 border-slate-700 opacity-60'}`}>
            <div className="flex justify-between text-[11px] mb-1 font-bold text-slate-300">
              <span>2. ALTURA (Y)</span>
              <span>{Math.round(oscY * 100)}%</span>
            </div>
            <div className="w-full bg-slate-950 h-3 rounded overflow-hidden relative border border-slate-700">
              <div
                className="bg-amber-400 h-full transition-all duration-75"
                style={{ width: `${oscY * 100}%` }}
              />
            </div>
          </div>

          {/* Meter 3: Força */}
          <div className={`p-2.5 rounded border ${phase === 'POWER' ? 'bg-blue-950 border-cyan-400 ring-2 ring-cyan-500' : 'bg-slate-800 border-slate-700 opacity-60'}`}>
            <div className="flex justify-between text-[11px] mb-1 font-bold text-slate-300">
              <span>3. FORÇA</span>
              <span>{Math.round(oscPower * 100)}%</span>
            </div>
            <div className="w-full bg-slate-950 h-3 rounded overflow-hidden relative border border-slate-700">
              <div
                className="bg-red-500 h-full transition-all duration-75"
                style={{ width: `${oscPower * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Big Action Kick Button for Touch and Desktop */}
        {['AIM_X', 'AIM_Y', 'POWER'].includes(phase) && (
          <button
            onClick={handleKickAction}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-sm rounded-xl shadow-xl cursor-pointer active:scale-98 transition flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5 fill-current" />
            <span>
              {phase === 'AIM_X'
                ? 'TRAVAR DIREÇÃO DO CHUTE'
                : phase === 'AIM_Y'
                ? 'TRAVAR ALTURA DO CHUTE'
                : 'CHUTAR NO GOL!'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
