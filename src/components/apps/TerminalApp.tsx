import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TermIcon, Play, Sparkles } from 'lucide-react';
import { TERMINAL_HELP_TEXT, PROFILE_INFO, PROJECTS_DATA } from '../../data/portfolioData';
import { soundFx } from '../../utils/soundEffects';

interface TerminalLine {
  text: string;
  type: 'input' | 'output' | 'error' | 'system';
}

export const TerminalApp: React.FC = () => {
  const [history, setHistory] = useState<TerminalLine[]>([
    { text: 'Mateus Araujo Portfolio OS Terminal v2.5.0', type: 'system' },
    { text: 'Digite "help" para ver a lista de comandos disponíveis.\n', type: 'system' }
  ]);
  const [inputVal, setInputVal] = useState<string>('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isMatrixMode, setIsMatrixMode] = useState<boolean>(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    soundFx.playKeypress();

    // Add input to history
    setHistory((prev) => [...prev, { text: `mateus@portfolio:~$ ${cmd}`, type: 'input' }]);
    setCommandHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);

    const parts = trimmed.split(' ');
    const mainCmd = parts[0].toLowerCase();

    switch (mainCmd) {
      case 'help':
        setHistory((prev) => [...prev, { text: TERMINAL_HELP_TEXT, type: 'output' }]);
        break;

      case 'about':
        setHistory((prev) => [
          ...prev,
          { text: `\n[NOME]: ${PROFILE_INFO.name}\n[TÍTULO]: ${PROFILE_INFO.headline}\n[BIO]: ${PROFILE_INFO.bioLong}\n`, type: 'output' }
        ]);
        break;

      case 'projects':
        const projList = PROJECTS_DATA.map(p => `• ${p.name} [${p.category}] - ${p.tagline}`).join('\n');
        setHistory((prev) => [
          ...prev,
          { text: `\nPROJETOS EM DESTAQUE:\n${projList}\n`, type: 'output' }
        ]);
        break;

      case 'skills':
        setHistory((prev) => [
          ...prev,
          { text: `\nHABILIDADES CHAVE:\n• Inteligência Artificial & Engenharia de Prompt (98%)\n• Gestão de Supply Chain & Estoques (94%)\n• Otimização de Processos BPM (92%)\n• Gestão de Projetos Ágeis (90%)\n`, type: 'output' }
        ]);
        break;

      case 'contact':
        setHistory((prev) => [
          ...prev,
          { text: `\nCANICIS DE CONTATO:\nEmail: ${PROFILE_INFO.email}\nLinkedIn: ${PROFILE_INFO.linkedin}\nGitHub: ${PROFILE_INFO.github}\n`, type: 'output' }
        ]);
        break;

      case 'clear':
        setHistory([]);
        break;

      case 'matrix':
        setIsMatrixMode((prev) => !prev);
        soundFx.playFanfare();
        setHistory((prev) => [
          ...prev,
          { text: '\n[SYSTEM] Modo Matrix recalibrado!\n', type: 'system' }
        ]);
        break;

      case 'win96':
      case 'retro':
        soundFx.playBootSound();
        setHistory((prev) => [
          ...prev,
          { text: '\n[MATEUS OS \'96] Sistema Operacional Retrô de Alta Performance. Rebuilt for 2026.\n', type: 'system' }
        ]);
        break;

      case 'dir':
      case 'ls':
        setHistory((prev) => [
          ...prev,
          { text: '\n O Volume na unidade C é MATEUS_OS\n O Número de Série do Volume é 1996-2026\n\n Diretorio de C:\\MATEUS\n\nPROJETOS   <DIR>         13-08-2026  10:00\nSOBRE      <DIR>         13-08-2026  10:00\nDOCS       <DIR>         13-08-2026  10:00\nCONTATO    <TXT>   4,096 13-08-2026  10:00\nGAMES      <EXE>  16,384 13-08-2026  10:00\n       2 arquivo(s)     20,480 bytes\n       3 pasta(s)   12,800,000 bytes livres\n', type: 'output' }
        ]);
        break;

      case 'ver':
        setHistory((prev) => [
          ...prev,
          { text: '\nMATEUS OS \'96 Personal Portfolio System [Versão 9.60.2026]\n', type: 'system' }
        ]);
        break;

      case 'coffee':
        soundFx.playNotification();
        setHistory((prev) => [
          ...prev,
          { text: '\n☕ [CAFÉ SERVIDO] Energia operacional carregada em 100%! Pronto para otimizar processos e IA.\n', type: 'system' }
        ]);
        break;

      case 'secret':
        soundFx.playFanfare();
        setHistory((prev) => [
          ...prev,
          { text: '\n🎉 [EASTER EGG ENCONTRADO!] VOCÊ DESBLOQUEOU O MODO DESENVOLVEDOR!\n"A melhor maneira de prever o futuro é construí-lo com IA e boa gestão." - Mateus Araujo\n', type: 'system' }
        ]);
        break;

      case 'date':
        setHistory((prev) => [
          ...prev,
          { text: `\nData e Hora do Sistema: ${new Date().toLocaleString('pt-BR')}\n`, type: 'output' }
        ]);
        break;

      case 'sudo':
        soundFx.playNotification();
        setHistory((prev) => [
          ...prev,
          { text: '\n[PERMISSÃO NEGADA] Acesso root negado. Mateus Araujo é o único administrador deste sistema!\n', type: 'error' }
        ]);
        break;

      default:
        setHistory((prev) => [
          ...prev,
          { text: `Comando não reconhecido: "${cmd}". Digite "help" para ver os comandos válidos.`, type: 'error' }
        ]);
        break;
    }

    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIdx = historyIndex + 1 < commandHistory.length ? historyIndex + 1 : historyIndex;
        setHistoryIndex(nextIdx);
        setInputVal(commandHistory[commandHistory.length - 1 - nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputVal(commandHistory[commandHistory.length - 1 - nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal('');
      }
    } else {
      soundFx.playKeypress();
    }
  };

  return (
    <div className={`h-full flex flex-col font-mono-code text-xs ${isMatrixMode ? 'text-emerald-400 bg-black' : 'text-slate-200 bg-slate-950'} p-3 rounded-lg border border-slate-800 space-y-3 min-h-[350px]`}>
      {/* Top CLI Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-slate-400 text-[11px]">
        <div className="flex items-center gap-2">
          <TermIcon className="w-4 h-4 text-emerald-400" />
          <span>mateus@portfolio:~</span>
        </div>
        <div className="flex items-center gap-2">
          <span>utf-8</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* Terminal Output */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
        {history.map((line, idx) => (
          <div
            key={idx}
            className={`whitespace-pre-wrap leading-relaxed ${
              line.type === 'input' 
                ? 'text-amber-300 font-bold' 
                : line.type === 'error' 
                ? 'text-red-400' 
                : line.type === 'system' 
                ? 'text-emerald-400' 
                : 'text-slate-300'
            }`}
          >
            {line.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Terminal Input Line */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
        <span className="text-emerald-400 font-bold shrink-0">mateus@portfolio:~$</span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="flex-1 bg-transparent text-amber-300 focus:outline-none font-mono-code text-xs"
        />
      </div>
    </div>
  );
};
