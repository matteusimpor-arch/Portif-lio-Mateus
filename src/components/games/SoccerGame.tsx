import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Play, RotateCcw, Volume2, Shield, Sparkles, Flag, ArrowRight, Zap, Target } from 'lucide-react';
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

type GamePhase = 'AIM_X' | 'AIM_Y' | 'POWER' | 'BALL_FLIGHT' | 'GOALIE_TURN' | 'RESULT' | 'MATCH_OVER';

export const SoccerGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [playerTeam, setPlayerTeam] = useState<Team>(TEAMS[0]);
  const [cpuTeam, setCpuTeam] = useState<Team>(TEAMS[1]);
  const [gameMode, setGameMode] = useState<'penalties' | 'freekicks'>('penalties');

  // Match state
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [playerScores, setPlayerScores] = useState<boolean[]>([]);
  const [cpuScores, setCpuScores] = useState<boolean[]>([]);
  const [isPlayerShooting, setIsPlayerShooting] = useState<boolean>(true);
  const [phase, setPhase] = useState<GamePhase>('AIM_X');
  const [bannerText, setBannerText] = useState<string>('PREPARE-SE PARA O CHUTE!');
  const [totalScore, setTotalScore] = useState<number>(0);
  const [shotsTaken, setShotsTaken] = useState<number>(0);
  const [goalsScored, setGoalsScored] = useState<number>(0);

  // Kick parameters
  const [aimX, setAimX] = useState<number>(0.5); // 0 (left) to 1 (right)
  const [aimY, setAimY] = useState<number>(0.5); // 0 (ground) to 1 (top crossbar)
  const [power, setPower] = useState<number>(0.7); // 0 to 1
  const [curve, setCurve] = useState<number>(0); // -1 (left curve) to 1 (right curve)

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

  // Start new match
  const startMatch = () => {
    try {
      soundFx.playWhistle();
    } catch (e) {}
    setCurrentRound(1);
    setPlayerScores([]);
    setCpuScores([]);
    setIsPlayerShooting(true);
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

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let renderAnimId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Sky and Stadium Crowd in Background
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 90);
      skyGrad.addColorStop(0, '#0f172a');
      skyGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, 90);

      // Stadium floodlights & crowd dots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      for (let i = 0; i < 40; i++) {
        const cx = (i * 9) % canvas.width;
        const cy = 20 + ((i * 7) % 50);
        ctx.fillStyle = i % 3 === 0 ? '#facc15' : i % 2 === 0 ? '#ef4444' : '#38bdf8';
        ctx.fillRect(cx, cy, 3, 3);
      }

      // Stadium Banners
      ctx.fillStyle = '#000080';
      ctx.fillRect(0, 75, canvas.width, 15);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('⚽ COPA RETRO \'96 ⚽ INTERNATIONAL SUPER CUP ⚽ MATEUS OS', 10, 86);

      // 2. Pitch / Grass (Striped Field)
      const grassY = 90;
      for (let y = grassY; y < canvas.height; y += 18) {
        ctx.fillStyle = Math.floor((y - grassY) / 18) % 2 === 0 ? '#15803d' : '#16a34a';
        ctx.fillRect(0, y, canvas.width, 18);
      }

      // Penalty box lines in perspective
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      // Penalty area box
      ctx.moveTo(40, 150);
      ctx.lineTo(320, 150);
      ctx.lineTo(350, canvas.height);
      ctx.moveTo(40, 150);
      ctx.lineTo(10, canvas.height);
      // Penalty spot
      ctx.arc(180, 260, 3, 0, Math.PI * 2);
      ctx.stroke();

      // 3. Goal Posts & 3D Net
      const goalLeft = 70;
      const goalRight = 290;
      const goalTop = 45;
      const goalBottom = 135;

      // Net background depth
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(goalLeft, goalTop, goalRight - goalLeft, goalBottom - goalTop);

      // Net grid pattern
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

      // Posts (White, thick)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5;
      ctx.strokeRect(goalLeft, goalTop, goalRight - goalLeft, goalBottom - goalTop);

      // Goal target rings in Free Kick mode
      if (gameMode === 'freekicks') {
        const targets = [
          { x: goalLeft + 25, y: goalTop + 20, pts: 500, col: '#facc15' },
          { x: goalRight - 25, y: goalTop + 20, pts: 500, col: '#facc15' },
          { x: goalLeft + 25, y: goalBottom - 20, pts: 250, col: '#38bdf8' },
          { x: goalRight - 25, y: goalBottom - 20, pts: 250, col: '#38bdf8' },
        ];
        targets.forEach((t) => {
          ctx.strokeStyle = t.col;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(t.x, t.y, 14, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8px monospace';
          ctx.fillText(`+${t.pts}`, t.x - 11, t.y + 3);
        });
      }

      // 4. Goalkeeper
      ctx.save();
      ctx.translate(goalieState.x, goalieState.y);

      // Goalkeeper Jersey & Body
      const goalieCol = isPlayerShooting ? cpuTeam.primaryColor : playerTeam.primaryColor;
      ctx.fillStyle = goalieCol;

      if (goalieState.action === 'idle') {
        // Body
        ctx.fillRect(-12, -22, 24, 26);
        // Head
        ctx.fillStyle = '#fbcfe8';
        ctx.beginPath();
        ctx.arc(0, -30, 8, 0, Math.PI * 2);
        ctx.fill();
        // Arms
        ctx.fillStyle = '#000000';
        ctx.fillRect(-20, -18, 8, 14);
        ctx.fillRect(12, -18, 8, 14);
        // Gloves
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-22, -6, 10, 8);
        ctx.fillRect(12, -6, 10, 8);
        // Shorts & legs
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-10, 4, 20, 14);
        ctx.fillStyle = '#fbcfe8';
        ctx.fillRect(-8, 18, 6, 12);
        ctx.fillRect(2, 18, 6, 12);
      } else if (goalieState.action.includes('left')) {
        ctx.rotate(-0.5);
        ctx.fillRect(-14, -20, 28, 22);
        ctx.fillStyle = '#fbcfe8';
        ctx.beginPath();
        ctx.arc(-8, -26, 7, 0, Math.PI * 2);
        ctx.fill();
        // Stretched arms to left
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-30, -18, 18, 8);
      } else if (goalieState.action.includes('right')) {
        ctx.rotate(0.5);
        ctx.fillRect(-14, -20, 28, 22);
        ctx.fillStyle = '#fbcfe8';
        ctx.beginPath();
        ctx.arc(8, -26, 7, 0, Math.PI * 2);
        ctx.fill();
        // Stretched arms to right
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(12, -18, 18, 8);
      } else {
        // Jump center
        ctx.fillRect(-12, -32, 24, 26);
        ctx.fillStyle = '#fbcfe8';
        ctx.beginPath();
        ctx.arc(0, -40, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-16, -45, 10, 10);
        ctx.fillRect(6, -45, 10, 10);
      }
      ctx.restore();

      // 5. Ball
      if (ballState.active || phase !== 'MATCH_OVER') {
        ctx.save();
        ctx.translate(ballState.x, ballState.y);
        ctx.scale(ballState.scale, ballState.scale);
        ctx.rotate(ballState.spin);

        // Ball Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(0, 10, 8 * ballState.scale, 4 * ballState.scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ball body (White circle)
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Classic retro pentagon pattern on ball
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillRect(-6, -6, 3, 3);
        ctx.fillRect(3, -6, 3, 3);
        ctx.fillRect(-6, 3, 3, 3);
        ctx.fillRect(3, 3, 3, 3);

        ctx.restore();
      }

      // 6. Aiming Reticle (Visible when aiming)
      if (isPlayerShooting && (phase === 'AIM_X' || phase === 'AIM_Y' || phase === 'POWER')) {
        const reticleX = goalLeft + (goalRight - goalLeft) * oscX;
        const reticleY = goalBottom - (goalBottom - goalTop) * (phase === 'AIM_X' ? 0.5 : oscY);

        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 2]);
        ctx.beginPath();
        ctx.arc(reticleX, reticleY, 14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(reticleX - 18, reticleY);
        ctx.lineTo(reticleX + 18, reticleY);
        ctx.moveTo(reticleX, reticleY - 18);
        ctx.lineTo(reticleX, reticleY + 18);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      renderAnimId = requestAnimationFrame(draw);
    };

    renderAnimId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(renderAnimId);
  }, [ballState, goalieState, phase, oscX, oscY, isPlayerShooting, cpuTeam, playerTeam, gameMode]);

  // User click action for the kick rhythm
  const handleKickAction = () => {
    try {
      soundFx.playClick();
    } catch (e) {}

    if (phase === 'AIM_X') {
      setAimX(oscX);
      setPhase('AIM_Y');
      setBannerText('AGORA ESCOLHA A ALTURA DO CHUTE!');
    } else if (phase === 'AIM_Y') {
      setAimY(oscY);
      setPhase('POWER');
      setBannerText('SEGURE E TRAVE A FORÇA E POTÊNCIA!');
    } else if (phase === 'POWER') {
      const finalPower = oscPower;
      setPower(finalPower);
      executeKick(aimX, aimY, finalPower);
    }
  };

  // Execute Kick Animation and Outcome
  const executeKick = (shotX: number, shotY: number, shotPow: number) => {
    try {
      soundFx.playKick();
    } catch (e) {}

    setPhase('BALL_FLIGHT');
    setBannerText('CHUTE DISPARADO! LÁ VAI A BOLA...');

    const goalLeft = 70;
    const goalRight = 290;
    const goalTop = 45;
    const goalBottom = 135;

    // Target coordinates on screen
    const targetScreenX = goalLeft + (goalRight - goalLeft) * shotX + (Math.random() * 10 - 5);
    const targetScreenY = goalBottom - (goalBottom - goalTop) * shotY;

    // Goalkeeper AI Decision
    const goalieChoices: ('idle' | 'jump-left' | 'jump-right' | 'jump-center' | 'jump-top-left' | 'jump-top-right')[] = [
      'jump-left',
      'jump-right',
      'jump-center',
      'jump-top-left',
      'jump-top-right',
    ];

    // CPU goalie guesses randomly or reacts
    const goalieChoice = goalieChoices[Math.floor(Math.random() * goalieChoices.length)];
    let goalieTargetX = 180;
    let goalieTargetY = 110;

    if (goalieChoice.includes('left')) goalieTargetX = 110;
    if (goalieChoice.includes('right')) goalieTargetX = 250;
    if (goalieChoice.includes('top')) goalieTargetY = 80;

    setGoalieState({
      x: goalieTargetX,
      y: goalieTargetY,
      action: goalieChoice,
    });

    // Animate ball movement
    let progress = 0;
    const startX = 180;
    const startY = 260;

    const interval = setInterval(() => {
      progress += 0.05;
      const curX = startX + (targetScreenX - startX) * progress;
      const curY = startY + (targetScreenY - startY) * progress - Math.sin(progress * Math.PI) * 40;
      const curScale = 1 - progress * 0.45; // Ball gets smaller as it approaches the goal

      setBallState({
        x: curX,
        y: curY,
        scale: curScale,
        spin: progress * 10,
        targetX: targetScreenX,
        targetY: targetScreenY,
        active: true,
      });

      if (progress >= 1) {
        clearInterval(interval);

        // Evaluate Goal or Save
        const distToGoalie = Math.hypot(targetScreenX - goalieTargetX, targetScreenY - goalieTargetY);
        const isWithinGoal = targetScreenX >= goalLeft + 6 && targetScreenX <= goalRight - 6 && targetScreenY >= goalTop + 6 && targetScreenY <= goalBottom;

        const isSaved = isWithinGoal && distToGoalie < 38;

        if (isWithinGoal && !isSaved) {
          // GOOOOOOL!
          try {
            soundFx.playFanfare();
          } catch (e) {}
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
          setBannerText('⚽ GOOOOOOOOOOL! QUE GOLAÇO ESPETACULAR!');
          setPlayerScores((prev) => [...prev, true]);
          setGoalsScored((g) => g + 1);
          setTotalScore((s) => s + 500);
        } else if (isSaved) {
          try {
            soundFx.playNotification();
          } catch (e) {}
          setBannerText('🧤 DEFENDAÇA DO GOLEIRO! ESPALMOU!');
          setPlayerScores((prev) => [...prev, false]);
        } else {
          try {
            soundFx.playNotification();
          } catch (e) {}
          setBannerText('💨 PRA FOOOOORA! TIROU TINTA DA TRAVE!');
          setPlayerScores((prev) => [...prev, false]);
        }

        setShotsTaken((s) => s + 1);

        setTimeout(() => {
          if (gameMode === 'penalties') {
            triggerCpuTurn();
          } else {
            // Free kicks: next shot
            setPhase('AIM_X');
            setBannerText('PRÓXIMA COBRANÇA! MIRE A DIREÇÃO.');
            resetBallAndGoalie();
          }
        }, 2200);
      }
    }, 25);
  };

  // CPU Turn in Penalties (Player is Goalkeeper)
  const triggerCpuTurn = () => {
    setIsPlayerShooting(false);
    setPhase('GOALIE_TURN');
    setBannerText(`RODADA DO ADVERSÁRIO (${cpuTeam.name})! ESCOLHA ONDE O GOLEIRO DEVE PULAR:`);
    resetBallAndGoalie();
  };

  // Player chooses dive as goalkeeper
  const handlePlayerDive = (diveChoice: 'left' | 'center' | 'right') => {
    try {
      soundFx.playKick();
    } catch (e) {}

    let goalieX = 180;
    if (diveChoice === 'left') goalieX = 110;
    if (diveChoice === 'right') goalieX = 250;

    setGoalieState({
      x: goalieX,
      y: 105,
      action: diveChoice === 'left' ? 'jump-left' : diveChoice === 'right' ? 'jump-right' : 'jump-center',
    });

    // CPU shot destination
    const cpuShotX = 75 + Math.random() * (285 - 75);
    const cpuShotY = 55 + Math.random() * (130 - 55);

    // Ball Animation
    let progress = 0;
    const startX = 180;
    const startY = 260;

    const interval = setInterval(() => {
      progress += 0.05;
      const curX = startX + (cpuShotX - startX) * progress;
      const curY = startY + (cpuShotY - startY) * progress - Math.sin(progress * Math.PI) * 40;
      const curScale = 1 - progress * 0.45;

      setBallState({
        x: curX,
        y: curY,
        scale: curScale,
        spin: progress * 10,
        targetX: cpuShotX,
        targetY: cpuShotY,
        active: true,
      });

      if (progress >= 1) {
        clearInterval(interval);

        const dist = Math.hypot(cpuShotX - goalieX, cpuShotY - 105);
        const cpuScored = dist > 42;

        if (!cpuScored) {
          try {
            soundFx.playNotification();
          } catch (e) {}
          setBannerText('🧤 DEFENDEU! VOCÊ PEGOU O PÊNALTI!');
          setCpuScores((prev) => [...prev, false]);
          setTotalScore((s) => s + 300);
        } else {
          try {
            soundFx.playNotification();
          } catch (e) {}
          setBannerText(`⚽ GOL DELES! ${cpuTeam.name} converteu o pênalti.`);
          setCpuScores((prev) => [...prev, true]);
        }

        setTimeout(() => {
          checkMatchEnd();
        }, 2200);
      }
    }, 25);
  };

  const checkMatchEnd = () => {
    if (currentRound >= 5) {
      setPhase('MATCH_OVER');
      const pGoals = playerScores.filter(Boolean).length;
      const cGoals = cpuScores.filter(Boolean).length;

      if (pGoals >= cGoals) {
        try {
          soundFx.playFanfare();
        } catch (e) {}
        confetti({ particleCount: 180, spread: 100 });
        setBannerText(`🏆 CAMPEÃO MUNDIAL! ${playerTeam.name} VENCEU POR ${pGoals} X ${cGoals}!`);
      } else {
        try {
          soundFx.playNotification();
        } catch (e) {}
        setBannerText(`FIM DE JOGO: ${cpuTeam.name} venceu por ${cGoals} x ${pGoals}. Tente outra vez!`);
      }
    } else {
      setCurrentRound((r) => r + 1);
      setIsPlayerShooting(true);
      setPhase('AIM_X');
      setBannerText(`RODADA ${currentRound + 1}: SEU CHUTE! MIRE A DIREÇÃO.`);
      resetBallAndGoalie();
    }
  };

  return (
    <div className="bg-[#1e293b] p-4 md:p-5 border-2 border-white border-r-gray-900 border-b-gray-900 text-white space-y-4 rounded shadow-2xl font-sans select-none max-w-2xl mx-auto">
      {/* Top Arcade Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 p-3 rounded border border-emerald-500/40 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="p-1 bg-yellow-400 text-slate-950 font-black rounded text-xs">SOCCER 2000</span>
          <span className="font-bold text-yellow-300">RETRO WORLD CUP PENALTY 2000</span>
        </div>

        {/* Score & Points */}
        <div className="flex items-center gap-3">
          <span className="text-emerald-400 font-bold bg-black/50 px-2 py-0.5 rounded border border-emerald-600">
            SCORE: {totalScore}
          </span>
          <button
            onClick={startMatch}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded flex items-center gap-1 border border-slate-600 cursor-pointer text-[11px]"
          >
            <RotateCcw className="w-3 h-3 text-yellow-400" />
            <span>Reiniciar</span>
          </button>
        </div>
      </div>

      {/* Team Selection Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/80 p-2.5 rounded border border-slate-700 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Seu Time:</span>
          <select
            value={playerTeam.id}
            onChange={(e) => {
              const sel = TEAMS.find((t) => t.id === e.target.value);
              if (sel) setPlayerTeam(sel);
            }}
            className="bg-slate-800 text-yellow-300 font-bold px-2 py-1 rounded border border-slate-600 cursor-pointer"
          >
            {TEAMS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.flag} {t.name} ({t.starPlayer})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Adversário:</span>
          <select
            value={cpuTeam.id}
            onChange={(e) => {
              const sel = TEAMS.find((t) => t.id === e.target.value);
              if (sel) setCpuTeam(sel);
            }}
            className="bg-slate-800 text-sky-300 font-bold px-2 py-1 rounded border border-slate-600 cursor-pointer"
          >
            {TEAMS.filter((t) => t.id !== playerTeam.id).map((t) => (
              <option key={t.id} value={t.id}>
                {t.flag} {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => setGameMode('penalties')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer ${
              gameMode === 'penalties' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            Pênaltis
          </button>
          <button
            onClick={() => setGameMode('freekicks')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer ${
              gameMode === 'freekicks' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            Faltas
          </button>
        </div>
      </div>

      {/* Match Scoreboard Indicator */}
      {gameMode === 'penalties' && (
        <div className="bg-black/80 p-3 rounded-lg border border-slate-700 flex items-center justify-around font-mono text-xs shadow-inner">
          {/* Player Team Score */}
          <div className="flex flex-col items-center gap-1">
            <span className="font-bold text-yellow-300 text-sm">
              {playerTeam.flag} {playerTeam.name}
            </span>
            <div className="flex gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border border-slate-500 flex items-center justify-center text-[10px] font-bold ${
                    playerScores[i] === true
                      ? 'bg-emerald-500 text-white'
                      : playerScores[i] === false
                      ? 'bg-red-500 text-white'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {playerScores[i] === true ? '✓' : playerScores[i] === false ? '✕' : i + 1}
                </div>
              ))}
            </div>
          </div>

          <div className="text-xl font-black text-slate-400">VS</div>

          {/* CPU Team Score */}
          <div className="flex flex-col items-center gap-1">
            <span className="font-bold text-sky-300 text-sm">
              {cpuTeam.flag} {cpuTeam.name}
            </span>
            <div className="flex gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border border-slate-500 flex items-center justify-center text-[10px] font-bold ${
                    cpuScores[i] === true
                      ? 'bg-emerald-500 text-white'
                      : cpuScores[i] === false
                      ? 'bg-red-500 text-white'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {cpuScores[i] === true ? '✓' : cpuScores[i] === false ? '✕' : i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Pitch Canvas Stage */}
      <div className="relative flex justify-center bg-black p-2 rounded-lg border-2 border-emerald-600 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={360}
          height={300}
          className="border border-emerald-400/40 bg-black rounded"
        />

        {/* Floating Broadcast Banner */}
        <div className="absolute top-4 left-4 right-4 bg-black/85 text-yellow-300 font-mono font-bold text-xs p-2 rounded border border-yellow-400/60 text-center shadow-lg animate-pulse">
          {bannerText}
        </div>
      </div>

      {/* Controls and Meters Area */}
      <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 space-y-3 font-mono">
        {isPlayerShooting && phase !== 'MATCH_OVER' && (
          <div className="space-y-3">
            {/* Real-time Oscillating Meters */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              {/* Aim X Meter */}
              <div className="bg-slate-950 p-2 rounded border border-slate-800 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">1. Direção (◄ ►)</span>
                  <span className={phase === 'AIM_X' ? 'text-yellow-400 font-bold' : 'text-slate-500'}>
                    {phase === 'AIM_X' ? 'MIRANDO...' : 'TRAVADO'}
                  </span>
                </div>
                <div className="h-3 bg-slate-800 rounded overflow-hidden relative">
                  <div
                    className="absolute top-0 bottom-0 w-2 bg-yellow-400 transition-all"
                    style={{ left: `${oscX * 100}%` }}
                  />
                </div>
              </div>

              {/* Aim Y Meter */}
              <div className="bg-slate-950 p-2 rounded border border-slate-800 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">2. Altura (▲ ▼)</span>
                  <span className={phase === 'AIM_Y' ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {phase === 'AIM_Y' ? 'MIRANDO...' : 'TRAVADO'}
                  </span>
                </div>
                <div className="h-3 bg-slate-800 rounded overflow-hidden relative">
                  <div
                    className="absolute top-0 bottom-0 w-2 bg-emerald-400 transition-all"
                    style={{ left: `${oscY * 100}%` }}
                  />
                </div>
              </div>

              {/* Power Meter */}
              <div className="bg-slate-950 p-2 rounded border border-slate-800 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">3. Potência (⚡)</span>
                  <span className={phase === 'POWER' ? 'text-red-400 font-bold' : 'text-slate-500'}>
                    {phase === 'POWER' ? 'FORÇA!' : 'TRAVADO'}
                  </span>
                </div>
                <div className="h-3 bg-slate-800 rounded overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 via-yellow-400 to-red-600 transition-all"
                    style={{ width: `${oscPower * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Main Kick Button */}
            <button
              onClick={handleKickAction}
              disabled={phase === 'BALL_FLIGHT' || phase === 'GOALIE_TURN'}
              className="w-full py-3.5 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 hover:from-yellow-400 hover:to-amber-300 text-slate-950 font-black text-sm rounded-lg shadow-xl flex items-center justify-center gap-2 cursor-pointer transition transform active:scale-98"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>
                {phase === 'AIM_X'
                  ? 'TRAVAR DIREÇÃO (1/3)'
                  : phase === 'AIM_Y'
                  ? 'TRAVAR ALTURA (2/3)'
                  : phase === 'POWER'
                  ? 'CHUTAR COM FORÇA MÁXIMA! (3/3)'
                  : 'CHUTE EM ANDAMENTO...'}
              </span>
            </button>
          </div>
        )}

        {/* Goalkeeper Turn Controls */}
        {!isPlayerShooting && phase === 'GOALIE_TURN' && (
          <div className="space-y-2">
            <div className="text-xs text-yellow-300 text-center font-bold">
              ESCOLHA O CANTO PARA DEFENDER COM O GOLEIRO:
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handlePlayerDive('left')}
                className="py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded border border-blue-400 cursor-pointer shadow"
              >
                🧤 Pular na Esquerda ◄
              </button>
              <button
                onClick={() => handlePlayerDive('center')}
                className="py-3 bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs rounded border border-blue-400 cursor-pointer shadow"
              >
                🧤 Ficar no Centro ▲
              </button>
              <button
                onClick={() => handlePlayerDive('right')}
                className="py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded border border-blue-400 cursor-pointer shadow"
              >
                🧤 Pular na Direita ►
              </button>
            </div>
          </div>
        )}

        {/* Match Over Restart */}
        {phase === 'MATCH_OVER' && (
          <div className="text-center pt-2">
            <button
              onClick={startMatch}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-lg flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-yellow-300" />
              <span>Disputar Nova Partida da Copa</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
