import React, { useState } from 'react';
import { Mail, Linkedin, Github, Send, CheckCircle2, AlertCircle, RefreshCw, MessageSquare, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PROFILE_INFO } from '../../data/portfolioData';
import { soundFx } from '../../utils/soundEffects';

export const ContactApp: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string; ticketId?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playClick();
    setStatusMsg(null);

    if (!formData.name || !formData.email || !formData.message) {
      setStatusMsg({ type: 'error', text: 'Por favor, preencha todos os campos do formulário.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        soundFx.playFanfare();
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
        setStatusMsg({ type: 'success', text: data.message, ticketId: data.ticketId });
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Erro ao enviar mensagem.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Falha de conexão com o servidor de contato.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans-ui text-slate-200">
      {/* App Banner */}
      <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-950 border border-emerald-800 rounded-lg text-emerald-400">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-vt323 text-2xl">CANAL DE CONTATO DIRETO</h1>
            <p className="text-xs text-slate-400">Conecte-se com Mateus Araujo para projetos, consultoria ou oportunidades</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono-code text-slate-400 bg-slate-950 px-3 py-1 rounded border border-slate-800">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span>{PROFILE_INFO.location}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Form */}
        <div className="lg:col-span-2 bg-slate-900/80 p-6 rounded-xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white font-mono-code flex items-center gap-2 pb-2 border-b border-slate-800">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>ENVIAR MENSAGEM DIRETA</span>
          </h2>

          {statusMsg && (
            <div className={`p-4 rounded-lg border text-xs font-mono-code flex items-start gap-3 ${
              statusMsg.type === 'success' ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300' : 'bg-red-950/80 border-red-500 text-red-300'
            }`}>
              {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <div>
                <p>{statusMsg.text}</p>
                {statusMsg.ticketId && (
                  <p className="mt-1 font-bold text-amber-300">Ticket de Registro: {statusMsg.ticketId}</p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-mono-code text-slate-300">Seu Nome Completo:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: João Silva"
                className="w-full bg-slate-950 text-slate-200 px-3 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-emerald-500 font-sans-ui"
              />
            </div>

            <div className="space-y-1">
              <label className="font-mono-code text-slate-300">Seu Endereço de Email:</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Ex: joao@empresa.com.br"
                className="w-full bg-slate-950 text-slate-200 px-3 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-emerald-500 font-sans-ui"
              />
            </div>

            <div className="space-y-1">
              <label className="font-mono-code text-slate-300">Sua Mensagem / Proposta:</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Descreva brevemente o projeto, dúvida ou proposta..."
                rows={5}
                className="w-full bg-slate-950 text-slate-200 p-3 rounded-lg border border-slate-800 focus:outline-none focus:border-emerald-500 font-sans-ui custom-scrollbar"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 px-6 rounded-lg transition cursor-pointer shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Registrando Mensagem...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>ENVIAR MENSAGEM</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Social Badges & Direct Links */}
        <div className="space-y-4">
          <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 font-mono-code uppercase">Canais de Conexão</h3>

            <a
              href={`mailto:${PROFILE_INFO.email}`}
              className="flex items-center gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800 hover:border-emerald-500 transition group"
            >
              <div className="p-2 bg-emerald-950 border border-emerald-800 rounded text-emerald-400">
                <Mail className="w-5 h-5" />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white group-hover:text-emerald-300">E-mail Profissional</div>
                <div className="text-[11px] text-slate-400 font-mono-code truncate">{PROFILE_INFO.email}</div>
              </div>
            </a>

            <a
              href={PROFILE_INFO.linkedin}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800 hover:border-blue-500 transition group"
            >
              <div className="p-2 bg-blue-950 border border-blue-800 rounded text-blue-400">
                <Linkedin className="w-5 h-5" />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white group-hover:text-blue-300">Perfil LinkedIn</div>
                <div className="text-[11px] text-slate-400 font-mono-code truncate">{PROFILE_INFO.linkedin}</div>
              </div>
            </a>

            <a
              href={PROFILE_INFO.github}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800 hover:border-slate-500 transition group"
            >
              <div className="p-2 bg-slate-800 border border-slate-700 rounded text-slate-300">
                <Github className="w-5 h-5" />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white group-hover:text-slate-300">GitHub Repositories</div>
                <div className="text-[11px] text-slate-400 font-mono-code truncate">{PROFILE_INFO.github}</div>
              </div>
            </a>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-400">
            <div className="font-bold text-emerald-400 font-mono-code">⚡ RESPOSTA RÁPIDA</div>
            <p>Mensagens registradas através do formulário são analisadas com prioridade em até 24 horas úteis.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
