import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Smile, Phone, Video, UserCheck, Shield, Sparkles } from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';

interface ChatMessage {
  id: number;
  sender: 'user' | 'mateus';
  text: string;
  time: string;
}

export const AimsMessengerApp: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: 'mateus',
      text: 'Olá! Sou Mateus Araujo. Bem-vindo ao meu comunicador instantâneo AIMS 2000! Como posso ajudar você hoje?',
      time: '14:20'
    },
    {
      id: 2,
      sender: 'mateus',
      text: 'Você pode me perguntar sobre minha experiência em Logística, Projetos de IA & Prompting, Carreira no Exército ou oportunidades de trabalho!',
      time: '14:21'
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
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    const query = inputText.toLowerCase();
    setInputText('');
    try { soundFx.playClick(); } catch (e) {}

    setIsTyping(true);
    setTimeout(() => {
      let reply = 'Interessante! Vamos conversar mais a respeito. Você pode também me chamar diretamente pelo WhatsApp ou LinkedIn na janela de Contato.';

      if (query.includes('logistica') || query.includes('logística') || query.includes('estoque') || query.includes('supply')) {
        reply = 'Sou graduado em Tecnologia em Logística (2025). Minhas especialidades incluem controle de estoques, inventários contínuos, redução de lead time e otimização de cadeias de suprimentos.';
      } else if (query.includes('ia') || query.includes('inteligencia') || query.includes('inteligência') || query.includes('prompt')) {
        reply = 'Na área de Inteligência Artificial, atuo fortemente com Engenharia de Prompt, System Directives, Chain-of-Thought e integração de LLMs para automação empresarial e redução de custos operacionais.';
      } else if (query.includes('exercito') || query.includes('exército') || query.includes('militar')) {
        reply = 'Minha trajetória no Exército Brasileiro consolidou competências essenciais de liderança de equipes, disciplina em processos críticos, organização logística e respeito a rígidos padrões de conformidade.';
      } else if (query.includes('cv') || query.includes('curriculo') || query.includes('currículo') || query.includes('pdf')) {
        reply = 'Você pode abrir o aplicativo Résumé.pdf na área de trabalho para ler e baixar meu currículo oficial completo em PDF!';
      } else if (query.includes('2026') || query.includes('space') || query.includes('futuro') || query.includes('tempo')) {
        reply = 'Experimente clicar no botão "Viagem no tempo" na área de trabalho! Ele te transporta do ano 2000 até 2026 no ambiente interativo MATEUS SPACE com partículas!';
      } else if (query.includes('contato') || query.includes('email') || query.includes('whatsapp') || query.includes('telefone')) {
        reply = 'Você pode me contatar diretamente por WhatsApp (11 96085-7977) ou por email (matteus.impor@gmail.com). Ficarei honrado em conversar!';
      }

      const botMsg: ChatMessage = {
        id: Date.now() + 1,
        sender: 'mateus',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
      try { soundFx.playNotification(); } catch (e) {}
    }, 800);
  };

  return (
    <div className="bg-[#c0c0c0] p-3 text-black font-sans text-xs space-y-3 select-none max-w-xl mx-auto">
      {/* AIMS Window Titlebar */}
      <div className="bg-gradient-to-r from-[#ffaa00] via-[#ff6600] to-[#cc3300] text-white p-2.5 border-2 border-white border-r-gray-800 border-b-gray-800 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white text-orange-600 flex items-center justify-center font-black text-sm">
            💬
          </div>
          <div>
            <h1 className="font-vt323 text-lg font-bold tracking-wider leading-none">AIMS 2000 • INSTANT MESSENGER</h1>
            <span className="text-[10px] text-yellow-200 font-mono">CONECTADO: mateus.araujo (ONLINE)</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] bg-black/40 px-2 py-0.5 rounded border border-yellow-300/40 text-yellow-300 font-bold font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>DISPONÍVEL</span>
        </div>
      </div>

      {/* Buddy Info Card */}
      <div className="bg-white p-2 border-bevel-in flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center font-vt323 text-lg">
            MA
          </div>
          <div>
            <div className="font-bold text-gray-900">Mateus Araujo Santos</div>
            <div className="text-[10px] text-gray-500 font-mono">Status: "Transformando complexidade em eficiência..."</div>
          </div>
        </div>
        <div className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 border border-emerald-300 font-bold">
          PRONTO PARA BATE-PAPO
        </div>
      </div>

      {/* Chat Messages Box */}
      <div className="bg-white p-3 border-bevel-in h-60 overflow-y-auto space-y-2.5 custom-scrollbar font-sans">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono mb-0.5">
              <span className="font-bold text-blue-900">
                {m.sender === 'user' ? 'Você' : 'mateus.araujo'}:
              </span>
              <span>{m.time}</span>
            </div>
            <div
              className={`p-2.5 rounded-lg max-w-[85%] text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 border border-gray-300 text-gray-900 shadow-xs'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-[11px] text-gray-500 italic">
            <span className="animate-pulse">mateus.araujo está digitando uma resposta...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Message Form */}
      <form onSubmit={handleSend} className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Digite uma mensagem para Mateus Araujo..."
            className="flex-1 bg-white p-2 border-bevel-in text-xs focus:outline-hidden text-gray-900"
          />
          <button
            type="submit"
            className="btn-retro px-4 py-2 bg-blue-100 text-blue-950 font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-blue-700" />
            <span>Enviar</span>
          </button>
        </div>

        {/* Quick Question Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="text-[10px] font-bold text-gray-600 self-center">Sugestões:</span>
          {['Fale sobre Logística', 'Experiência em IA', 'Exército Brasileiro', 'Como ver o Currículo?'].map((sug) => (
            <button
              key={sug}
              type="button"
              onClick={() => {
                setInputText(sug);
              }}
              className="text-[10px] bg-gray-100 hover:bg-yellow-100 border border-gray-400 px-2 py-0.5 rounded-none cursor-pointer text-gray-800"
            >
              {sug}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
};
