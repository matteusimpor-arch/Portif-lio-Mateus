import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  PenTool,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Clock,
  User,
  ChevronDown,
  RefreshCw,
  Eye,
  ShieldCheck,
  Star,
  Pin
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../utils/soundEffects';
import {
  subscribeToSiteStatistics,
  subscribeToGuestbookEntries,
  submitGuestbookSignature,
  SiteStatistics,
  FirestoreGuestbookEntry
} from '../../lib/firebase';

export interface GuestbookDisplayEntry {
  id: string;
  name: string;
  message: string;
  createdAt?: any;
  dateFormatted: string;
  timeFormatted: string;
  status: 'approved' | 'pending' | 'hidden';
  avatarLetter: string;
}

interface GuestbookAppProps {
  mode?: 'retro' | 'space';
}

const OWNER_WELCOME_MESSAGE = {
  name: 'Mateus Araújo',
  title: 'Criador do Site',
  message: `Sejam bem-vindos ao meu espaço! 🚀
Uma viagem dos anos 2000 ao futuro, reunindo um pouco da minha história, projetos e ideias. Explore à vontade e, antes de partir, deixe seu registro no Livro de Visitas.`,
  signature: '— Mateus Araújo'
};

const AVATAR_COLORS = [
  'from-blue-600 to-indigo-600',
  'from-emerald-600 to-teal-600',
  'from-amber-600 to-orange-600',
  'from-rose-600 to-pink-600',
  'from-purple-600 to-violet-600',
  'from-cyan-600 to-blue-600',
];

function getAvatarColor(letter: string): string {
  const code = letter.toUpperCase().charCodeAt(0) || 65;
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

function formatDateAndTime(timestamp: any): { date: string; time: string } {
  try {
    let dateObj: Date;
    if (timestamp && typeof timestamp.toDate === 'function') {
      dateObj = timestamp.toDate();
    } else if (timestamp && timestamp.seconds) {
      dateObj = new Date(timestamp.seconds * 1000);
    } else if (timestamp) {
      dateObj = new Date(timestamp);
    } else {
      dateObj = new Date();
    }

    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');

    return {
      date: `${day}/${month}/${year}`,
      time: `${hours}:${minutes}`
    };
  } catch (e) {
    return { date: 'Hoje', time: 'Agora' };
  }
}

export const GuestbookApp: React.FC<GuestbookAppProps> = ({ mode = 'retro' }) => {
  const isRetro = mode === 'retro';

  const [entries, setEntries] = useState<GuestbookDisplayEntry[]>([]);
  const [stats, setStats] = useState<SiteStatistics>({ totalVisits: 1, totalSignatures: 0 });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [honeypot, setHoneypot] = useState<string>(''); // Anti-bot honeypot field
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [visibleLimit, setVisibleLimit] = useState<number>(8);
  const lastSubmitTimeRef = useRef<number>(0);

  // 1. Subscribe to Firebase Site Statistics (Visitas vs Assinaturas reais)
  useEffect(() => {
    // Tenta obter cache do localStorage primeiro
    try {
      const cachedStats = localStorage.getItem('mateus_site_stats_cache');
      if (cachedStats) {
        setStats(JSON.parse(cachedStats));
      }
    } catch (e) {}

    // Subscrição em tempo real ao Firestore
    const unsubscribeStats = subscribeToSiteStatistics((newStats) => {
      setStats((prev) => {
        const merged = {
          totalVisits: Math.max(prev.totalVisits || 1, newStats.totalVisits || 1),
          totalSignatures: newStats.totalSignatures ?? prev.totalSignatures
        };
        try {
          localStorage.setItem('mateus_site_stats_cache', JSON.stringify(merged));
        } catch (e) {}
        return merged;
      });
    });

    // Fallback polling API para ambientes sem conexão direta
    fetch('/api/analytics/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats((prev) => ({
            totalVisits: Math.max(prev.totalVisits, data.totalVisits || 1),
            totalSignatures: data.totalSignatures ?? prev.totalSignatures
          }));
        }
      })
      .catch(() => {});

    return () => {
      unsubscribeStats();
    };
  }, []);

  // 2. Subscribe to Firebase Guestbook Entries (Tempo Real)
  useEffect(() => {
    setIsLoading(true);

    // Carregar cache local imediato para transição rápida
    try {
      const cached = localStorage.getItem('mateus_guestbook_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        setEntries(parsed);
      }
    } catch (e) {}

    const unsubscribeEntries = subscribeToGuestbookEntries(
      50,
      (firestoreItems) => {
        const formatted: GuestbookDisplayEntry[] = firestoreItems.map((item) => {
          const { date, time } = formatDateAndTime(item.createdAt);
          return {
            id: item.id || `fb_${Date.now()}_${Math.random()}`,
            name: item.name,
            message: item.message,
            createdAt: item.createdAt,
            dateFormatted: date,
            timeFormatted: time,
            status: item.status,
            avatarLetter: item.name.charAt(0).toUpperCase() || 'M'
          };
        });

        setEntries(formatted);
        setIsLoading(false);

        try {
          localStorage.setItem('mateus_guestbook_cache', JSON.stringify(formatted));
        } catch (e) {}
      },
      (err) => {
        console.warn('[Guestbook] Fallback para API do servidor:', err);
        // Fallback para API express caso Firestore direto bloqueie
        fetch('/api/guestbook')
          .then((res) => res.json())
          .then((data) => {
            if (data.signatures) {
              setEntries(data.signatures);
            }
          })
          .catch(() => {})
          .finally(() => setIsLoading(false));
      }
    );

    return () => {
      unsubscribeEntries();
    };
  }, []);

  // 3. Submissão com Rate Limit, Honeypot e Sanitização Estrita
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { soundFx.playClick(); } catch (err) {}
    setStatusMsg(null);

    // Anti-bot honeypot check
    if (honeypot.trim().length > 0) {
      console.warn('Bot submission blocked.');
      return;
    }

    // Rate limiting: Mínimo 5 segundos entre envios consecutivos do mesmo navegador
    const nowMs = Date.now();
    if (nowMs - lastSubmitTimeRef.current < 5000) {
      setStatusMsg({
        type: 'error',
        text: 'Por favor, aguarde alguns segundos antes de enviar outra assinatura.'
      });
      return;
    }

    const trimmedName = name
      .replace(/<[^>]*>?/gm, '')
      .replace(/[^\p{L}\p{N}\s.,!?'"()\-@_#]/gu, '')
      .trim()
      .slice(0, 40);

    const trimmedMessage = message
      .replace(/<[^>]*>?/gm, '')
      .trim()
      .slice(0, 200);

    if (!trimmedName) {
      setStatusMsg({ type: 'error', text: 'Por favor, informe seu nome ou apelido (máx 40 letras).' });
      return;
    }

    if (!trimmedMessage) {
      setStatusMsg({ type: 'error', text: 'Por favor, escreva uma mensagem antes de assinar.' });
      return;
    }

    setIsSubmitting(true);
    lastSubmitTimeRef.current = nowMs;

    try {
      // 1. Tentar salvar diretamente no Firebase Firestore
      const fbResult = await submitGuestbookSignature(trimmedName, trimmedMessage);

      if (fbResult.success) {
        try { soundFx.playFanfare(); } catch (e) {}
        try { confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } }); } catch (e) {}

        setStatusMsg({ type: 'success', text: 'Assinatura registrada com sucesso no Livro!' });
        setName('');
        setMessage('');

        // Notificar também endpoint de backend para sincronizar cache
        fetch('/api/guestbook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: trimmedName, message: trimmedMessage })
        }).catch(() => {});
      } else {
        // Fallback para endpoint da API caso Firestore offline
        const res = await fetch('/api/guestbook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: trimmedName, message: trimmedMessage })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          try { soundFx.playFanfare(); } catch (e) {}
          try { confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } }); } catch (e) {}

          setStatusMsg({ type: 'success', text: 'Assinatura registrada!' });
          setName('');
          setMessage('');
          if (data.entry) {
            setEntries((prev) => [data.entry, ...prev]);
            setStats((prev) => ({ ...prev, totalSignatures: prev.totalSignatures + 1 }));
          }
        } else {
          setStatusMsg({ type: 'error', text: data.error || 'Falha ao salvar assinatura. Tente novamente.' });
        }
      }
    } catch (err: any) {
      console.error('Erro no envio do guestbook:', err);
      setStatusMsg({ type: 'error', text: 'Não foi possível salvar sua assinatura no momento. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const visibleEntries = entries.slice(0, visibleLimit);
  const hasMore = entries.length > visibleLimit;

  // Formatador de número com zeros à esquerda no estilo retrô (ex: 001284)
  const formatRetroCount = (num: number, digits = 6) => {
    return String(num).padStart(digits, '0');
  };

  // =========================================================================
  // RETRO 2000 INTERFACE (GUESTBOOK.EXE COM CONTADOR REAL DE VISITAS E ASSINATURAS)
  // =========================================================================
  if (isRetro) {
    return (
      <div className="space-y-4 font-sans text-gray-900 select-none max-w-4xl mx-auto">
        {/* Retro Header Bar */}
        <div className="bg-[#c0c0c0] p-2 border-2 border-white border-r-gray-800 border-b-gray-800 flex items-center justify-between text-xs font-mono shadow-xs">
          <div className="flex items-center gap-2 font-bold">
            <BookOpen className="w-4 h-4 text-blue-900" />
            <span className="text-blue-950 font-bold">C:\MATEUS\GUESTBOOK.EXE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-[#000080] text-white px-2 py-0.5 font-bold rounded-xs text-[11px] font-mono">
              VISITORS: {formatRetroCount(stats.totalVisits, 6)}
            </span>
            <span className="bg-emerald-800 text-white px-2 py-0.5 font-bold rounded-xs text-[11px] font-mono">
              SIGNATURES: {formatRetroCount(entries.length || stats.totalSignatures, 4)}
            </span>
          </div>
        </div>

        {/* Retro Banner com Estatísticas Integradas */}
        <div className="bg-[#F5F4ED] border-2 border-gray-400 p-3.5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-200 border-2 border-amber-600 flex items-center justify-center text-xl shadow-inner shrink-0">
              📖
            </div>
            <div>
              <h2 className="text-sm font-black font-mono text-blue-950 tracking-wide">
                LIVRO DE VISITAS
              </h2>
              <p className="text-xs text-gray-700 font-sans mt-0.5">
                "Um pequeno registro de quem passou por aqui."
              </p>
            </div>
          </div>

          {/* Retro Visitor Badge (Contador clássico anos 2000) */}
          <div className="flex items-center gap-2 bg-black p-1.5 border-2 border-gray-600 rounded-xs shadow-inner self-stretch sm:self-auto justify-around sm:justify-start">
            <div className="text-center px-2 border-r border-gray-700">
              <span className="text-[9px] font-mono text-emerald-400 block font-bold">VISITAS REAIS</span>
              <span className="text-xs font-mono font-black text-lime-400 tracking-widest">
                {stats.totalVisits.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="text-center px-2">
              <span className="text-[9px] font-mono text-cyan-400 block font-bold">ASSINATURAS</span>
              <span className="text-xs font-mono font-black text-cyan-300 tracking-widest">
                {(entries.length || stats.totalSignatures).toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        </div>

        {/* ★ MENSAGEM DO PROPRIETÁRIO (PINNED / FIXADA NO TOPO) */}
        <div className="bg-[#FFFDF2] border-2 border-amber-600/70 p-3.5 shadow-xs relative space-y-2">
          <div className="flex items-center justify-between border-b border-amber-300/80 pb-1.5 font-mono">
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-900 border border-amber-400 font-bold px-2 py-0.5 rounded-xs text-[10px] flex items-center gap-1 shadow-2xs">
                <Star className="w-3 h-3 text-amber-600 fill-amber-500" />
                <span>MENSAGEM DO PROPRIETÁRIO</span>
              </span>
              <span className="font-bold text-xs text-blue-950 font-mono">
                {OWNER_WELCOME_MESSAGE.name}
              </span>
            </div>
            <span className="text-[10px] font-mono text-amber-800 font-bold bg-amber-50 px-1.5 py-0.5 border border-amber-200">
              ★ FIXADA
            </span>
          </div>

          <div className="flex items-start gap-3 pt-0.5">
            <div className="w-8 h-8 rounded-xs bg-[#000080] text-amber-300 font-mono font-bold flex items-center justify-center text-sm shrink-0 border border-amber-500 shadow-xs">
              👑
            </div>
            <div className="space-y-1.5 flex-1">
              <p className="text-xs text-gray-900 leading-relaxed font-sans italic whitespace-pre-line">
                "{OWNER_WELCOME_MESSAGE.message}"
              </p>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-blue-950">
                  {OWNER_WELCOME_MESSAGE.signature}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Sign Form Column (Left / Top on Mobile) */}
          <div className="md:col-span-2 bg-[#F5F4ED] border-2 border-gray-400 p-3.5 space-y-3 text-xs shadow-xs">
            <div className="border-b-2 border-blue-900 pb-1.5 flex items-center justify-between font-mono font-bold text-blue-950">
              <div className="flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-blue-800" />
                <span>ASSINAR O LIVRO</span>
              </div>
              <span className="text-[10px] text-gray-500 font-normal">FIREBASE SYNC</span>
            </div>

            {statusMsg && (
              <div
                className={`p-2 border-2 text-xs flex items-start gap-1.5 font-mono ${
                  statusMsg.type === 'success'
                    ? 'bg-green-100 border-green-700 text-green-950 font-bold'
                    : 'bg-red-100 border-red-700 text-red-950 font-bold'
                }`}
              >
                {statusMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-800 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-800 shrink-0 mt-0.5" />
                )}
                <span>{statusMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Invisible Honeypot Field for anti-bot */}
              <input
                type="text"
                name="website_url_hp"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              <div className="space-y-1">
                <label className="font-mono text-[11px] font-bold text-gray-900 flex items-center justify-between">
                  <span>NOME OU APELIDO:</span>
                  <span className="text-[10px] text-gray-500 font-normal">{name.length}/40</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={40}
                  placeholder="Ex: Lucas / Visitante"
                  className="w-full bg-white border-2 border-gray-500 border-r-white border-b-white px-2 py-1.5 text-xs text-gray-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[11px] font-bold text-gray-900 flex items-center justify-between">
                  <span>MENSAGEM:</span>
                  <span className={`text-[10px] font-mono ${message.length >= 190 ? 'text-red-700 font-bold' : 'text-gray-600'}`}>
                    {message.length} / 200
                  </span>
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={200}
                  placeholder="Ex: Passei por aqui! Parabéns pelo projeto."
                  className="w-full bg-white border-2 border-gray-500 border-r-white border-b-white p-2 text-xs text-gray-900 focus:outline-none resize-none font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-retro py-2 flex items-center justify-center gap-1.5 font-bold font-mono text-xs text-blue-950 cursor-pointer disabled:opacity-50 shadow-xs active:translate-y-0.5"
              >
                <PenTool className="w-3.5 h-3.5 text-blue-900" />
                <span>{isSubmitting ? 'REGISTRANDO...' : 'ASSINAR LIVRO'}</span>
              </button>
            </form>
          </div>

          {/* Signatures List Column (Right / Bottom on Mobile) */}
          <div className="md:col-span-3 bg-[#F5F4ED] border-2 border-gray-400 p-3.5 space-y-3 text-xs shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="border-b-2 border-gray-400 pb-1.5 flex items-center justify-between font-mono">
                <div className="font-bold text-blue-950 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-800" />
                  <span>ASSINATURAS PÚBLICAS</span>
                </div>
                <span className="text-[11px] text-gray-600 font-bold">
                  {entries.length} {entries.length === 1 ? 'REGISTRO' : 'REGISTROS'}
                </span>
              </div>

              {isLoading && entries.length === 0 ? (
                <div className="p-8 text-center text-gray-600 font-mono space-y-2">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-900" />
                  <p>CARREGANDO ASSINATURAS...</p>
                </div>
              ) : entries.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-gray-400 bg-white/60 space-y-2 rounded-xs">
                  <div className="text-2xl">✍️</div>
                  <p className="font-bold font-mono text-gray-800 text-xs">
                    Ainda não há assinaturas no banco.
                  </p>
                  <p className="text-[11px] text-gray-600">
                    Seja o primeiro a assinar o Livro de Visitas!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {visibleEntries.map((sig) => (
                    <div
                      key={sig.id}
                      className="p-2.5 bg-white border-2 border-gray-400 border-r-white border-b-white shadow-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-gray-200 pb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-xs bg-[#000080] text-white font-mono font-bold flex items-center justify-center text-xs shrink-0 border border-black shadow-xs">
                            {sig.avatarLetter || sig.name.charAt(0).toUpperCase()}
                          </div>
                          {/* Safe text rendering (No HTML execution) */}
                          <span className="font-bold font-mono text-blue-950 text-xs truncate max-w-[160px]">
                            {sig.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-gray-600 shrink-0">
                          {sig.dateFormatted} • {sig.timeFormatted}
                        </span>
                      </div>

                      {/* Safe text rendering */}
                      <p className="text-xs text-gray-800 leading-relaxed font-sans pl-1 italic">
                        "{sig.message}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination / "Ver Mais" Button */}
            {hasMore && (
              <div className="pt-2 border-t border-gray-300 flex justify-center">
                <button
                  onClick={() => {
                    try { soundFx.playClick(); } catch (e) {}
                    setVisibleLimit((prev) => prev + 6);
                  }}
                  className="btn-retro px-4 py-1.5 text-xs font-mono font-bold text-blue-950 flex items-center gap-1.5 cursor-pointer shadow-xs active:translate-y-0.5"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>VER MAIS ({entries.length - visibleLimit} restantes)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Retro Status Bar */}
        <div className="bg-[#c0c0c0] p-1.5 border-bevel-in text-[11px] font-mono text-gray-800 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
            <span>FIREBASE FIRESTORE ATIVO • CONTAGEM ATÔMICA</span>
          </span>
          <span>MATEUS OS 2000</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MODERN INTERFACE (MATEUS SPACE 2026 / LIVRO DE VISITAS PERSISTENTE)
  // =========================================================================
  return (
    <div className="space-y-5 font-sans text-slate-100 select-none max-w-4xl mx-auto">
      {/* Modern Header Banner com Estatísticas Reais */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-cyan-950/80 border border-cyan-500/30 backdrop-blur-md shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/30 shrink-0">
            📖
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-wider text-white">
              LIVRO DE VISITAS
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              "Um pequeno registro de quem passou por aqui."
            </p>
          </div>
        </div>

        {/* Discreet Modern Visitor Metrics Badges */}
        <div className="flex items-center gap-2.5">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-cyan-500/40 flex items-center gap-2 shadow-inner">
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-cyan-300">
              {stats.totalVisits.toLocaleString('pt-BR')} visitas
            </span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-emerald-500/40 flex items-center gap-2 shadow-inner">
            <PenTool className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-mono font-bold text-emerald-300">
              {(entries.length || stats.totalSignatures).toLocaleString('pt-BR')} assinaturas
            </span>
          </div>
        </div>
      </div>

      {/* HOST / OWNER WELCOME MESSAGE (PINNED / DISCREET DIGITAL GLOW) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900/80 to-cyan-950/60 border border-cyan-500/35 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.12)] space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-cyan-900/60 pb-2">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold tracking-wider flex items-center gap-1.5 shadow-[0_0_10px_rgba(6,182,212,0.25)]">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>HOST MESSAGE</span>
            </span>
            <span className="font-bold text-xs sm:text-sm text-white font-mono flex items-center gap-1.5">
              <span>{OWNER_WELCOME_MESSAGE.name}</span>
              <span className="text-[10px] text-cyan-400/80 font-normal hidden sm:inline">• {OWNER_WELCOME_MESSAGE.title}</span>
            </span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400/80 px-2 py-0.5 rounded-full bg-blue-950/60 border border-cyan-900/70 font-bold">
            ★ PINNED
          </span>
        </div>

        <div className="flex items-start gap-3.5 pt-0.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white font-mono font-bold flex items-center justify-center text-sm shadow-[0_0_15px_rgba(6,182,212,0.35)] shrink-0">
            🚀
          </div>
          <div className="space-y-2 flex-1">
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-line">
              "{OWNER_WELCOME_MESSAGE.message}"
            </p>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-cyan-300 tracking-wide">
                {OWNER_WELCOME_MESSAGE.signature}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Main Layout */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        {/* Sign Form Column */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-slate-900/70 border border-cyan-500/20 backdrop-blur-md shadow-lg space-y-4 text-xs">
          <div className="flex items-center gap-2 border-b border-slate-700/60 pb-2.5">
            <PenTool className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-sm text-cyan-200 tracking-wide">
              DEIXE SUA ASSINATURA
            </h3>
          </div>

          {statusMsg && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/70 border-rose-500/50 text-rose-200'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <span className="font-medium leading-relaxed">{statusMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Anti-bot honeypot */}
            <input
              type="text"
              name="hp_email_sec"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />

            <div className="space-y-1.5">
              <label className="font-mono text-[11px] font-bold text-slate-300 flex items-center justify-between">
                <span>NOME OU APELIDO</span>
                <span className="text-[10px] text-slate-400">{name.length}/40</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                placeholder="Seu nome ou apelido"
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[11px] font-bold text-slate-300 flex items-center justify-between">
                <span>MENSAGEM</span>
                <span className={`text-[10px] font-mono ${message.length >= 190 ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                  {message.length} / 200
                </span>
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={200}
                placeholder="Passei por aqui 👋 Parabéns pelo portfólio!"
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition resize-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black font-mono text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 active:scale-[0.98] transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'REGISTRANDO...' : 'ASSINAR LIVRO'}</span>
            </button>
          </form>
        </div>

        {/* Signatures List Column */}
        <div className="md:col-span-3 p-5 rounded-2xl bg-slate-900/70 border border-cyan-500/20 backdrop-blur-md shadow-lg space-y-4 text-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-cyan-200 tracking-wide">
                  ASSINATURAS RECENTES
                </h3>
              </div>
              <span className="text-[11px] font-mono text-cyan-400/80 font-bold">
                {entries.length} {entries.length === 1 ? 'REGISTRO' : 'REGISTROS'}
              </span>
            </div>

            {isLoading && entries.length === 0 ? (
              <div className="p-10 text-center text-slate-400 font-mono space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-400" />
                <p>CARREGANDO ASSINATURAS...</p>
              </div>
            ) : entries.length === 0 ? (
              <div className="p-10 text-center border border-dashed border-slate-700 rounded-2xl bg-slate-950/40 space-y-2">
                <div className="text-3xl">✍️</div>
                <p className="font-bold text-white text-sm">
                  Ainda não há assinaturas.
                </p>
                <p className="text-xs text-slate-400">
                  Que tal deixar a primeira?
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {visibleEntries.map((sig) => {
                  const avatarGradient = getAvatarColor(sig.avatarLetter || sig.name);
                  return (
                    <div
                      key={sig.id}
                      className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 transition shadow-sm space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${avatarGradient} text-white font-mono font-bold flex items-center justify-center text-xs shadow-md shrink-0`}>
                            {sig.avatarLetter || sig.name.charAt(0).toUpperCase()}
                          </div>
                          {/* Pure String Text Output (XSS / HTML injection safe) */}
                          <span className="font-bold text-sm text-white truncate max-w-[180px]">
                            {sig.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {sig.dateFormatted} • {sig.timeFormatted}
                        </span>
                      </div>

                      {/* Pure String Text Output */}
                      <p className="text-xs text-slate-300 leading-relaxed font-sans pl-1">
                        "{sig.message}"
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination / "Ver Mais" */}
          {hasMore && (
            <div className="pt-3 border-t border-slate-800 flex justify-center">
              <button
                onClick={() => {
                  try { soundFx.playClick(); } catch (e) {}
                  setVisibleLimit((prev) => prev + 6);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-cyan-500/30 text-xs font-mono font-bold text-cyan-300 flex items-center gap-2 cursor-pointer shadow hover:shadow-cyan-500/20 transition"
              >
                <ChevronDown className="w-3.5 h-3.5" />
                <span>VER MAIS ({entries.length - visibleLimit} restantes)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
