import React, { useState } from 'react';
import { HelpCircle, Award, CheckCircle2, XCircle, RotateCcw, Sparkles, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../utils/soundEffects';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const PopQuizApp: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const questions: Question[] = [
    {
      id: 1,
      question: 'No ano 2000, qual mídia física dominava a gravação e distribuição de músicas antes do streaming?',
      options: ['CD-R / CD-RW e MiniDisc', 'Disquete 5 1/4', 'Fita K7 apenas', 'Pen Drive USB 3.0'],
      correct: 0,
      explanation: 'O ano 2000 foi a era de ouro dos CDs graváveis (CD-R) e do auge dos tocadores MP3 portáteis e Napster.'
    },
    {
      id: 2,
      question: 'Em Logística e Supply Chain, o que significa o conceito de "Lead Time"?',
      options: [
        'O custo total do frete rodoviário',
        'O tempo total transcorrido desde o pedido até a entrega final ao cliente',
        'A velocidade máxima dos caminhões de entrega',
        'O número de paletes empilhados no galpão'
      ],
      correct: 1,
      explanation: 'Lead Time é o tempo de ciclo integral do processo de suprimento, essencial para a eficiência operacional.'
    },
    {
      id: 3,
      question: 'Qual era o som mais icônico de conexão à internet discada (Dial-up) nos anos 2000?',
      options: ['O bip agudo de fax/modem 56kbps', 'O toque do iPhone', 'O som do WhatsApp', 'O barulho de fibra óptica'],
      correct: 0,
      explanation: 'Os famosos chiados e handshakes dos modems US Robotics e 56k marcaram a virada do milênio!'
    },
    {
      id: 4,
      question: 'Na gestão estratégica de estoques, qual metodologia foca na eliminação de desperdícios e produção sob demanda?',
      options: ['Just-in-Time (JIT) / Lean Logistics', 'Estoque Infinito', 'Descarte Aleatório', 'Armazenagem Desordenada'],
      correct: 0,
      explanation: 'O Just-in-Time originário do Sistema Toyota de Produção revolucionou a logística mundial.'
    },
    {
      id: 5,
      question: 'Qual jogo clássico vinha pré-instalado nos computadores da época e desafiava a encontrar bombas?',
      options: ['Campo Minado (Minesweeper)', 'Minecraft', 'Fortnite', 'Cyberpunk 2077'],
      correct: 0,
      explanation: 'Campo Minado foi companheiro fiel de milhões de usuários nas pausas do trabalho e estudo nos anos 2000.'
    }
  ];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOpt(idx);
    setIsAnswered(true);

    const isCorrect = idx === questions[currentIdx].correct;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      try { soundFx.playNotification(); } catch (e) {}
    } else {
      try { soundFx.playError(); } catch (e) {}
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOpt(null);
      setIsAnswered(false);
      try { soundFx.playClick(); } catch (e) {}
    } else {
      setIsCompleted(true);
      try {
        soundFx.playFanfare();
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    setScore(0);
    setIsCompleted(false);
    try { soundFx.playClick(); } catch (e) {}
  };

  const currentQ = questions[currentIdx];

  return (
    <div className="bg-[#c0c0c0] p-4 text-black font-sans text-xs space-y-4 select-none max-w-xl mx-auto">
      {/* Title banner */}
      <div className="bg-[#000080] text-white p-2.5 flex items-center justify-between border-2 border-white border-r-gray-800 border-b-gray-800 shadow-md">
        <div className="flex items-center gap-2 font-bold font-vt323 text-lg">
          <HelpCircle className="w-5 h-5 text-yellow-300 animate-pulse" />
          <span>CULTURA POP QUIZ • ANOS 2000 & LOGÍSTICA</span>
        </div>
        <div className="font-mono text-xs bg-black/40 px-2 py-0.5 rounded border border-yellow-300/40 text-yellow-300">
          Pontos: {score}/{questions.length}
        </div>
      </div>

      {!isCompleted ? (
        <div className="space-y-4">
          {/* Question Card */}
          <div className="bg-white p-4 border-bevel-in space-y-2">
            <div className="text-[11px] font-bold text-blue-900 uppercase font-mono">
              Pergunta {currentIdx + 1} de {questions.length}
            </div>
            <div className="text-sm font-bold text-gray-900 leading-snug">
              {currentQ.question}
            </div>
          </div>

          {/* Options Grid */}
          <div className="space-y-2">
            {currentQ.options.map((opt, idx) => {
              let optStyle = 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-400';
              if (isAnswered) {
                if (idx === currentQ.correct) {
                  optStyle = 'bg-emerald-100 border-emerald-600 text-emerald-950 font-bold';
                } else if (selectedOpt === idx) {
                  optStyle = 'bg-red-100 border-red-600 text-red-950';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  className={`w-full text-left p-3 border-2 transition rounded-none flex items-center justify-between text-xs cursor-pointer ${optStyle}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-white border border-gray-400 flex items-center justify-center font-bold text-[10px]">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>
                  {isAnswered && idx === currentQ.correct && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  {isAnswered && selectedOpt === idx && idx !== currentQ.correct && (
                    <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {isAnswered && (
            <div className="p-3 bg-yellow-50 border border-yellow-300 text-yellow-950 text-[11px] leading-relaxed">
              <span className="font-bold">💡 Curiosidade:</span> {currentQ.explanation}
            </div>
          )}

          {/* Next Button */}
          {isAnswered && (
            <div className="flex justify-end">
              <button
                onClick={handleNext}
                className="btn-retro px-5 py-2 font-bold flex items-center gap-2 bg-blue-100 text-blue-950 cursor-pointer"
              >
                <span>{currentIdx + 1 === questions.length ? 'Ver Resultado' : 'Próxima Pergunta'}</span>
                <Sparkles className="w-3.5 h-3.5 text-yellow-600" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Completed Screen */
        <div className="bg-white p-6 border-bevel-in text-center space-y-4">
          <div className="w-16 h-16 bg-yellow-100 border-2 border-yellow-500 rounded-full flex items-center justify-center mx-auto text-3xl shadow-md">
            🏆
          </div>
          <h2 className="text-xl font-bold font-vt323 text-blue-900 text-2xl">QUIZ FINALIZADO!</h2>
          <p className="text-sm font-semibold text-gray-800">
            Você acertou <span className="text-emerald-700 font-bold text-base">{score}</span> de {questions.length} perguntas!
          </p>
          <p className="text-xs text-gray-600 max-w-md mx-auto">
            {score >= 4
              ? 'Excelente! Você domina tanto a nostalgia dos anos 2000 quanto os conceitos de tecnologia e logística.'
              : 'Bom trabalho! Vale a pena continuar explorando o sistema para aprender mais sobre a trajetória de Mateus Araujo.'}
          </p>

          <div className="pt-3">
            <button
              onClick={handleRestart}
              className="btn-retro px-5 py-2 inline-flex items-center gap-2 cursor-pointer font-bold"
            >
              <RotateCcw className="w-4 h-4 text-blue-700" />
              <span>Jogar Novamente</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
