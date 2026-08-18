import React, { useState } from 'react';
import {
  Mail,
  Linkedin,
  Github,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageCircle,
  Phone,
  Inbox
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PROFILE_DATA } from '../../data/portfolioData';
import { soundFx } from '../../utils/soundEffects';

export const ContactApp: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playClick();
    setStatusMsg(null);

    if (!formData.name || !formData.email || !formData.message) {
      setStatusMsg({ type: 'error', text: 'Por favor, preencha nome, e-mail e a mensagem antes de enviar.' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulates or calls API
      await new Promise((resolve) => setTimeout(resolve, 600));
      soundFx.playFanfare();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      setStatusMsg({
        type: 'success',
        text: `Mensagem enviada com sucesso para ${PROFILE_DATA.email}! Obrigado pelo contato.`
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Falha no envio da mensagem. Tente pelo e-mail direto.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 font-sans text-gray-900 select-none max-w-4xl mx-auto">
      {/* Retro Directory Header */}
      <div className="bg-[#c0c0c0] p-2 border-2 border-white border-r-gray-800 border-b-gray-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 font-bold">
          <Mail className="w-4 h-4 text-blue-900" />
          <span className="text-blue-950 font-bold">C:\MATEUS\CONTATO_DIRETO.EXE</span>
        </div>
        <span className="text-[11px] text-gray-700">CANAIS OFICIAIS</span>
      </div>

      {/* Main Grid: Direct Links on Left + Mail Form on Right */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left Column: Direct Links & Networks */}
        <div className="bg-white border-2 border-gray-700 shadow-sm p-4 space-y-3 md:col-span-1 text-xs">
          <h2 className="font-bold font-mono text-blue-950 text-xs border-b-2 border-blue-900 pb-1.5 flex items-center gap-1.5">
            <Inbox className="w-4 h-4 text-blue-800" />
            <span>CANAIS DIRETOS</span>
          </h2>

          <div className="space-y-2">
            {/* WhatsApp (Número Principal) */}
            <a
              href={PROFILE_DATA.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-400 rounded flex items-center justify-between group transition cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-700" />
                <div>
                  <div className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                    <span>WhatsApp</span>
                    <span className="text-[9px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-bold">Principal</span>
                  </div>
                  <div className="text-[10px] text-emerald-800 font-mono font-bold">{PROFILE_DATA.phone}</div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-700 group-hover:translate-x-0.5 transition-transform" />
            </a>

            {/* Telefone Direto */}
            <a
              href={`tel:+5561983180345`}
              className="p-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded flex items-center justify-between group transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-700" />
                <div>
                  <div className="font-bold text-amber-950 text-xs">Telefone Principal</div>
                  <div className="text-[10px] text-amber-800 font-mono font-bold">{PROFILE_DATA.phone}</div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-amber-700 group-hover:translate-x-0.5 transition-transform" />
            </a>

            {/* LinkedIn */}
            <a
              href={PROFILE_DATA.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded flex items-center justify-between group transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-blue-700" />
                <div>
                  <div className="font-bold text-blue-950 text-xs">LinkedIn Oficial</div>
                  <div className="text-[10px] text-blue-800 font-mono font-bold truncate max-w-[130px]">mateus-araujo077</div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
            </a>

            {/* Email */}
            <a
              href={`mailto:${PROFILE_DATA.email}`}
              className="p-2.5 bg-green-50 hover:bg-green-100 border border-green-300 rounded flex items-center justify-between group transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-green-800" />
                <div>
                  <div className="font-bold text-green-950 text-xs">E-mail Direto</div>
                  <div className="text-[10px] text-gray-700 truncate max-w-[130px]">{PROFILE_DATA.email}</div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-green-700 group-hover:translate-x-0.5 transition-transform" />
            </a>

            {/* GitHub */}
            <a
              href={PROFILE_DATA.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded flex items-center justify-between group transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4 text-gray-800" />
                <div>
                  <div className="font-bold text-gray-900 text-xs">GitHub</div>
                  <div className="text-[10px] text-gray-600 truncate max-w-[130px]">matteusimpor-arch</div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          <div className="pt-2 border-t border-gray-300 text-[11px] text-gray-600 leading-relaxed">
            {PROFILE_DATA.availability}
          </div>
        </div>

        {/* Right Column: Outlook Express Style Contact Form */}
        <div className="bg-white border-2 border-gray-700 shadow-sm p-4 space-y-3 md:col-span-2 text-xs">
          <div className="flex items-center justify-between border-b-2 border-yellow-600 pb-1.5">
            <h2 className="font-bold font-mono text-blue-950 text-xs flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-yellow-700" />
              <span>NOVA MENSAGEM (EXPRESS MAIL 2000)</span>
            </h2>
            <span className="text-[10.5px] font-mono text-gray-600">PARA: {PROFILE_DATA.email}</span>
          </div>

          {statusMsg && (
            <div
              className={`p-2.5 border rounded text-xs flex items-start gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-green-50 border-green-400 text-green-900'
                  : 'bg-red-50 border-red-400 text-red-900'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-mono text-[11px] font-bold text-gray-800">De (Seu Nome):</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Seu nome"
                  className="w-full bg-white border border-gray-400 px-2 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-700"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[11px] font-bold text-gray-800">Seu E-mail:</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seu.email@exemplo.com"
                  className="w-full bg-white border border-gray-400 px-2 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-700"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-mono text-[11px] font-bold text-gray-800">Assunto:</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Ex: Oportunidade profissional / Contato"
                className="w-full bg-white border border-gray-400 px-2 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-700"
              />
            </div>

            <div className="space-y-1">
              <label className="font-mono text-[11px] font-bold text-gray-800">Mensagem:</label>
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Escreva sua mensagem aqui..."
                className="w-full bg-white border border-gray-400 p-2 text-xs text-gray-900 focus:outline-none focus:border-blue-700 resize-none font-sans"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10.5px] text-gray-600 font-mono">
                Destino: {PROFILE_DATA.email}
              </span>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-retro px-4 py-1.5 flex items-center gap-1.5 font-bold text-xs text-blue-950 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Transmitindo...' : 'Enviar Mensagem'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Retro Status Bar */}
      <div className="bg-[#c0c0c0] p-1.5 border-bevel-in text-[11px] font-mono text-gray-800 flex items-center justify-between">
        <span>STATUS: CANAL DE COMUNICAÇÃO ATIVO</span>
        <span>MATEUS OS 2000</span>
      </div>
    </div>
  );
};
