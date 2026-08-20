import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  Zap,
  Terminal,
  Activity
} from 'lucide-react';
import { soundFx } from '../../../utils/soundEffects';
import { PROFILE_DATA } from '../../../data/portfolioData';

interface ChatMessage {
  id: number;
  sender: 'user' | 'mateus';
  text: string;
  time: string;
}

export const SpaceAimsApp: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: 'mateus',
      text: 'TRANSMISSÃO INICIADA • Olá! Bem-vindo ao Terminal Quântico de Comunicação AIMS 2026.',
      time: '12:00:01'
    },
    {
      id: 2,
      sender: 'mateus',
      text: 'Sou o agente neural de Mateus Araujo. Você pode me consultar sobre Formação em Logística, Especializações em Finanças/Supply Chain, Atuação no Exército, ou Projetos de IA & Prompting.',
      time: '12:00:03'
    }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString()
    };

    setMessages((prev) => [...prev, userMsg]);
    const query = inputText.toLowerCase();
    setInputText('');
    try { soundFx.playClick(); } catch (e) {}

    setIsTyping(true);
    setTimeout(() => {
      let reply = 'Consulta recebida. Para contato imediato e propostas, você pode acionar o WhatsApp direto ou LinkedIn de Mateus no módulo de Contato.';

      if (query.includes('logistica') || query.includes('logística') || query.includes('estoque') || query.includes('supply')) {
        reply = 'FORMAÇÃO LOGÍSTICA: Graduado em Logística pelo IESB, com MBAs em Supply Chain, Finanças e Controladoria. Atuação comprovada em dimensionamento de armazéns, acuracidade de inventários e redução de custos logísticos.';
      } else if (query.includes('ia') || query.includes('inteligencia') || query.includes('inteligência') || query.includes('prompt') || query.includes('chatgpt')) {
        reply = 'CAPACIDADES DE IA: Especialista em Engenharia de Prompt, orquestração de LLMs, automação de fluxos operacionais e desenvolvimento de assistentes virtuais de alta precisão.';
      } else if (query.includes('exercito') || query.includes('exército') || query.includes('militar')) {
        reply = 'TRAJETÓRIA NO EXÉRCITO: Experiência sólida em administração militar, gestão de suprimentos e processos com rigoroso controle de conformidade regulatória.';
      } else if (query.includes('whatsapp') || query.includes('contato') || query.includes('telefone') || query.includes('email')) {
        reply = `CANAIS DIRETOS:\n• WhatsApp: ${PROFILE_DATA.phoneFormatted}\n• E-mail: ${PROFILE_DATA.email}\n• LinkedIn: ${PROFILE_DATA.linkedin}`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'mateus',
          text: reply,
          time: new Date().toLocaleTimeString()
        }
      ]);
      setIsTyping(false);
      try { soundFx.playFanfare(); } catch (e) {}
    }, 450);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 select-none font-sans text-slate-100 animate-fadeIn">
      {/* 2026 Futuristic Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-cyan-950/70 border border-cyan-500/30 p-4 sm:p-5 backdrop-blur-xl shadow-[0_0_40px_rgba(6,182,212,0.15)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold font-mono text-white flex items-center gap-2">
              <span>AIMS NEURAL TERMINAL 2026</span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                ONLINE
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">
              Comunicação Instantânea & Assistente Neural de Carreira
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-cyan-300 bg-black/50 px-3 py-1.5 rounded-xl border border-cyan-900/60">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Status: Conexão Criptografada</span>
        </div>
      </div>

      {/* Messages View Area */}
      <div className="h-[360px] sm:h-[400px] overflow-y-auto custom-scrollbar p-4 rounded-2xl bg-black/80 border border-cyan-500/30 backdrop-blur-xl shadow-inner space-y-3 font-mono">
        {messages.map((msg) => {
          const isMe = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 max-w-[85%] ${
                isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                  isMe
                    ? 'bg-blue-600 text-white'
                    : 'bg-gradient-to-tr from-cyan-500 to-blue-700 text-white'
                }`}
              >
                {isMe ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-3 rounded-2xl border text-xs leading-relaxed ${
                  isMe
                    ? 'bg-blue-600/30 border-blue-500/50 text-white rounded-tr-xs shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                    : 'bg-blue-950/60 border-cyan-500/40 text-cyan-100 rounded-tl-xs shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1 text-[10px] opacity-70">
                  <span className="font-bold">{isMe ? 'VOCÊ' : 'MATEUS ARAUJO • NEURAL'}</span>
                  <span>{msg.time}</span>
                </div>
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-cyan-300 text-xs font-mono bg-blue-950/40 p-2.5 rounded-xl border border-cyan-900/60 w-fit">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Processando resposta neural...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <form onSubmit={handleSend} className="flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Digite sua mensagem para o terminal neural (ex: 'conte sobre sua formação em logística')..."
          className="flex-1 px-4 py-3 rounded-xl bg-black/80 border border-cyan-500/40 focus:border-cyan-300 text-xs font-mono text-white placeholder-slate-500 outline-none backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.15)]"
        />
        <button
          type="submit"
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 transition"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Enviar</span>
        </button>
      </form>
    </div>
  );
};
