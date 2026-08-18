import React, { useState } from 'react';
import { Tv, Radio, Sparkles, Film, ChevronRight, ChevronLeft, Volume2 } from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';

interface NostalgiaMemory {
  id: number;
  channel: string;
  year: string;
  title: string;
  category: string;
  description: string;
  bulletPoints: string[];
  iconEmoji: string;
}

export const NostalgiaApp: React.FC = () => {
  const [currentChannel, setCurrentChannel] = useState<number>(0);
  const [isStatic, setIsStatic] = useState<boolean>(false);

  const memories: NostalgiaMemory[] = [
    {
      id: 1,
      channel: 'CH 03 — DIAL-UP & ORIGENS',
      year: '2000',
      title: 'A Revolução da Internet Discada e dos Anos 2000',
      category: 'Tecnologia & Sociedade',
      description: 'O início da era digital em massa. Conexões discadas na madrugada de sábado, o surgimento dos fóruns, salas de bate-papo, disquetes de 1.44MB e o nascimento de Mateus Araujo.',
      bulletPoints: [
        'Aguardar a meia-noite de sábado para pagar apenas 1 pulso de telefone.',
        'Download de uma única música MP3 levava 40 minutos comemorados.',
        'Primeiros passos na curiosidade lógica e paixão por computação.'
      ],
      iconEmoji: '💾'
    },
    {
      id: 2,
      channel: 'CH 05 — GAMES RETRÔ',
      year: '2000 - 2005',
      title: 'Era de Ouro das Lan Houses e Consoles 3D',
      category: 'Jogos & Cultura',
      description: 'As tardes nas lan houses jogando CS 1.6, Need for Speed Underground, Tibia e consoles clássicos de 32/64 bits formaram o raciocínio rápido e trabalho em equipe.',
      bulletPoints: [
        'Grito de "corujão" nas lan houses de bairro.',
        'Aulas de digitação rápida no teclado mecânico barulhento.',
        'Desenvolvimento de raciocínio espacial e resolução de problemas.'
      ],
      iconEmoji: '🕹️'
    },
    {
      id: 3,
      channel: 'CH 08 — LOGÍSTICA & DISCIPLINA',
      year: '2018 - 2024',
      title: 'Exército Brasileiro e Cadeia de Suprimentos',
      category: 'Carreira & Liderança',
      description: 'A transição para o profissionalismo sério: a disciplina operacional do Exército Brasileiro combinada com o estudo técnico da gestão de logística e cadeias de suprimentos.',
      bulletPoints: [
        'Organização de rotinas críticas sob pressão e rígida conformidade.',
        'Mapeamento de estoques, inventários e distribuição tática.',
        'Graduação Tecnológica em Logística (2025).'
      ],
      iconEmoji: '🎖️'
    },
    {
      id: 4,
      channel: 'CH 12 — INTELIGÊNCIA ARTIFICIAL',
      year: '2024 - 2026',
      title: 'Engenharia de Prompt, Automação e Futuro',
      category: 'Inovação Digital',
      description: 'A convergência da experiência operacional com o poder dos Grandes Modelos de Linguagem (LLMs), criando sistemas que geram valor econômico e estratégico real.',
      bulletPoints: [
        'Criação de esteiras automáticas com IA para redução de custos.',
        'Estruturação de diretrizes sintáticas de alta precisão para empresas.',
        'Construção do ecossistema do Mateus OS e Space 2026.'
      ],
      iconEmoji: '🚀'
    }
  ];

  const changeChannel = (delta: number) => {
    try { soundFx.playClick(); } catch (e) {}
    setIsStatic(true);
    setTimeout(() => {
      setCurrentChannel((prev) => (prev + delta + memories.length) % memories.length);
      setIsStatic(false);
      try { soundFx.playNotification(); } catch (e) {}
    }, 180);
  };

  const mem = memories[currentChannel];

  return (
    <div className="bg-[#c0c0c0] p-4 text-black font-sans text-xs space-y-4 select-none max-w-xl mx-auto">
      {/* App Header */}
      <div className="bg-[#1a202c] text-white p-3 border-2 border-white border-r-gray-800 border-b-gray-800 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <Tv className="w-5 h-5 text-amber-400" />
          <h1 className="font-vt323 text-xl font-bold tracking-wider">MOMENTOS DE NOSTALGIA • TV RETRÔ 2000</h1>
        </div>
        <div className="font-mono text-xs text-amber-300 bg-black/50 px-2 py-0.5 border border-amber-500/40">
          SINTONIZADOR CRT
        </div>
      </div>

      {/* Retro TV Screen Frame */}
      <div className="bg-[#2d3748] p-4 rounded-xl border-4 border-gray-700 shadow-2xl space-y-3">
        {/* CRT Glass Display */}
        <div className={`bg-black text-green-400 p-5 rounded-lg border-2 border-gray-900 min-h-[220px] relative overflow-hidden font-mono ${isStatic ? 'bg-[radial-gradient(#fff_1px,transparent_1px)] opacity-50' : ''}`}>
          {/* Channel OSD on Top */}
          <div className="flex justify-between items-center text-xs text-yellow-300 border-b border-green-900 pb-2 mb-3">
            <span className="font-bold">{mem.channel}</span>
            <span className="bg-green-950 text-green-300 px-2 py-0.5 rounded border border-green-800 font-bold">ANO: {mem.year}</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{mem.iconEmoji}</span>
              <div>
                <div className="text-[10px] text-green-500 uppercase tracking-widest">{mem.category}</div>
                <h3 className="text-base font-bold text-white leading-tight font-vt323 text-xl">{mem.title}</h3>
              </div>
            </div>

            <p className="text-xs text-green-300 leading-relaxed pt-1">
              {mem.description}
            </p>

            <div className="space-y-1.5 pt-2 border-t border-green-950">
              {mem.bulletPoints.map((bp, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                  <span className="text-yellow-400 font-bold">›</span>
                  <span>{bp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TV Physical Dials and Controls */}
        <div className="bg-gray-300 p-2.5 rounded-lg border border-gray-500 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-gray-800">
            <Radio className="w-4 h-4 text-red-600 animate-pulse" />
            <span>CANAL {currentChannel + 1} DE {memories.length}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => changeChannel(-1)}
              className="btn-retro px-3 py-1.5 flex items-center gap-1 font-bold cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Canal Anterior</span>
            </button>
            <button
              onClick={() => changeChannel(1)}
              className="btn-retro px-3 py-1.5 flex items-center gap-1 font-bold cursor-pointer bg-blue-100 text-blue-950"
            >
              <span>Próximo Canal</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
