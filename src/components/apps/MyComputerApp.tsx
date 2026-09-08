import React, { useState } from 'react';
import {
  Folder,
  HardDrive,
  FileText,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  RefreshCw,
  Info,
  ExternalLink,
  GraduationCap,
  Briefcase,
  Layers,
  Award,
  Mail,
  User,
  Cpu,
  Monitor,
  CheckCircle2,
  X,
  FileCode,
  Sparkles
} from 'lucide-react';
import {
  PROFILE_DATA,
  PROJECTS_DATA,
  EDUCATION_DATA,
  COURSES_DATA,
  EXPERIENCE_DATA,
  SYSTEM_HISTORY_EVENTS,
  SYSTEM_PROPERTIES_DATA,
  EASTER_EGG_FILES
} from '../../data/portfolioData';
import { soundFx } from '../../utils/soundEffects';
import { WindowAppId } from '../../types';

interface MyComputerAppProps {
  onOpenApp?: (appId: WindowAppId) => void;
  initialPath?: string;
}

type FolderPath = 'root' | 'documents' | 'education' | 'experience' | 'projects' | 'certificates' | 'contact' | 'history';

export const MyComputerApp: React.FC<MyComputerAppProps> = ({ onOpenApp, initialPath }) => {
  const [currentPath, setCurrentPath] = useState<FolderPath>(
    initialPath === 'documents' ? 'documents' : 'root'
  );
  const [history, setHistory] = useState<FolderPath[]>([
    initialPath === 'documents' ? 'documents' : 'root'
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [activeEasterEgg, setActiveEasterEgg] = useState<{ name: string; title: string; content: string } | null>(null);
  const [showPropertiesModal, setShowPropertiesModal] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'icons' | 'details'>('icons');

  const navigateTo = (path: FolderPath) => {
    try { soundFx.playClick(); } catch (e) {}
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(path);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentPath(path);
    setSelectedItem(null);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      try { soundFx.playClick(); } catch (e) {}
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setCurrentPath(history[newIdx]);
      setSelectedItem(null);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      try { soundFx.playClick(); } catch (e) {}
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setCurrentPath(history[newIdx]);
      setSelectedItem(null);
    }
  };

  const handleUp = () => {
    if (currentPath !== 'root') {
      navigateTo('root');
    }
  };

  const getPathString = () => {
    switch (currentPath) {
      case 'root':
        return 'C:\\Meu Computador';
      case 'documents':
        return 'C:\\Meu Computador\\Meus Documentos';
      case 'education':
        return 'C:\\Meu Computador\\Formação';
      case 'experience':
        return 'C:\\Meu Computador\\Experiência';
      case 'projects':
        return 'C:\\Meu Computador\\Projetos';
      case 'certificates':
        return 'C:\\Meu Computador\\Certificados';
      case 'contact':
        return 'C:\\Meu Computador\\Contato';
      case 'history':
        return 'C:\\Meu Computador\\Histórico do Sistema';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#ece9d8] text-gray-900 select-none font-sans text-xs border border-gray-400 min-h-[460px]">
      {/* 1. RETRO EXPLORER TOOLBAR */}
      <div className="bg-[#ece9d8] border-b border-gray-400 p-1 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={handleBack}
            disabled={historyIndex === 0}
            className={`px-2 py-1 bg-[#ece9d8] border border-gray-400 flex items-center gap-1 cursor-pointer active:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed ${
              historyIndex === 0 ? '' : 'hover:bg-white'
            }`}
            title="Voltar"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-gray-700" />
            <span className="hidden sm:inline">Voltar</span>
          </button>
          <button
            onClick={handleForward}
            disabled={historyIndex >= history.length - 1}
            className={`px-2 py-1 bg-[#ece9d8] border border-gray-400 flex items-center gap-1 cursor-pointer active:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed ${
              historyIndex >= history.length - 1 ? '' : 'hover:bg-white'
            }`}
            title="Avançar"
          >
            <ArrowRight className="w-3.5 h-3.5 text-gray-700" />
            <span className="hidden sm:inline">Avançar</span>
          </button>
          <button
            onClick={handleUp}
            disabled={currentPath === 'root'}
            className="px-2 py-1 bg-[#ece9d8] border border-gray-400 hover:bg-white flex items-center gap-1 cursor-pointer active:bg-gray-300 disabled:opacity-40"
            title="Pasta Acima"
          >
            <ArrowUp className="w-3.5 h-3.5 text-gray-700" />
            <span className="hidden sm:inline">Acima</span>
          </button>
          <div className="h-4 w-px bg-gray-400 mx-1" />
          <button
            onClick={() => { try { soundFx.playClick(); } catch (e) {} }}
            className="px-2 py-1 bg-[#ece9d8] border border-gray-400 hover:bg-white flex items-center gap-1 cursor-pointer"
            title="Atualizar"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-700" />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode(viewMode === 'icons' ? 'details' : 'icons')}
            className="px-2 py-1 bg-[#ece9d8] border border-gray-400 hover:bg-white text-[11px] font-bold text-gray-800 cursor-pointer"
            title="Alternar Visualização"
          >
            {viewMode === 'icons' ? 'Modo Lista' : 'Modo Ícones'}
          </button>
          <button
            onClick={() => {
              try { soundFx.playClick(); } catch (e) {}
              setShowPropertiesModal(true);
            }}
            className="px-2 py-1 bg-[#ece9d8] border border-gray-400 hover:bg-white flex items-center gap-1 text-[11px] font-bold text-blue-900 cursor-pointer"
            title="Propriedades do Sistema"
          >
            <Info className="w-3.5 h-3.5 text-blue-700" />
            <span>Propriedades</span>
          </button>
        </div>
      </div>

      {/* 2. ADDRESS BAR */}
      <div className="bg-[#ece9d8] border-b border-gray-400 px-2 py-1 flex items-center gap-2 shrink-0">
        <span className="text-gray-600 font-bold shrink-0">Endereço:</span>
        <div className="flex-1 bg-white border border-gray-500 px-2 py-0.5 font-mono text-xs flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-1.5 truncate">
            <HardDrive className="w-3.5 h-3.5 text-blue-700 shrink-0" />
            <span className="truncate">{getPathString()}</span>
          </div>
          <span className="text-[10px] text-gray-500 font-sans">Sistema FAT32</span>
        </div>
      </div>

      {/* 3. MAIN EXPLORER AREA (Sidebar + Content View) */}
      <div className="flex-1 flex overflow-hidden bg-white">
        {/* Left Classic Info Panel */}
        <div className="hidden md:flex flex-col w-52 bg-gradient-to-b from-[#7ba2e7] to-[#4d73b8] text-white p-3 border-r border-gray-400 shrink-0 space-y-4">
          <div className="bg-white/10 p-2.5 rounded border border-white/20">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Monitor className="w-5 h-5 text-amber-300" />
              <span>{SYSTEM_PROPERTIES_DATA.systemName}</span>
            </div>
            <p className="text-[10px] text-blue-100 mt-1">
              {SYSTEM_PROPERTIES_DATA.edition}
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-bold text-amber-200 border-b border-white/20 pb-1">
              TAREFAS DE ARQUIVO
            </div>
            <div className="space-y-1 text-[11px]">
              <button
                onClick={() => navigateTo('documents')}
                className="w-full text-left hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <Folder className="w-3.5 h-3.5 text-amber-300" />
                <span>Meus Documentos</span>
              </button>
              <button
                onClick={() => navigateTo('history')}
                className="w-full text-left hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-white" />
                <span>Histórico do Sistema</span>
              </button>
              <button
                onClick={() => setShowPropertiesModal(true)}
                className="w-full text-left hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <Info className="w-3.5 h-3.5 text-amber-300" />
                <span>Ver dados do sistema</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-bold text-amber-200 border-b border-white/20 pb-1">
              OUTROS LOCAIS
            </div>
            <div className="space-y-1 text-[11px]">
              <button
                onClick={() => navigateTo('root')}
                className="w-full text-left hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <HardDrive className="w-3.5 h-3.5 text-amber-300" />
                <span>Disco Local (C:)</span>
              </button>
              <button
                onClick={() => {
                  if (onOpenApp) onOpenApp('trash');
                }}
                className="w-full text-left hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <span>🗑️</span>
                <span>Lixeira</span>
              </button>
            </div>
          </div>

          <div className="mt-auto bg-black/20 p-2 rounded border border-white/10 text-[10px] space-y-1">
            <div className="font-bold text-amber-300">ESTADO DO MATEUS OS:</div>
            <div>Usuário: {SYSTEM_PROPERTIES_DATA.userName}</div>
            <div className="text-emerald-300 font-bold">Status: ONLINE</div>
          </div>
        </div>

        {/* Right Content Canvas */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-white">
          {/* =========================================================================
              VIEW: ROOT (C:\Meu Computador)
             ========================================================================= */}
          {currentPath === 'root' && (
            <div className="space-y-4">
              <div className="border-b border-gray-300 pb-1 flex items-center justify-between text-gray-600 font-bold text-[11px]">
                <span>Pastas do Sistema & Portfólio</span>
                <span>6 Itens</span>
              </div>

              <div className={viewMode === 'icons' ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3' : 'space-y-1'}>
                {/* 1. Meus Documentos */}
                <div
                  onClick={() => setSelectedItem('documents')}
                  onDoubleClick={() => navigateTo('documents')}
                  className={`p-2 rounded border cursor-pointer flex transition ${
                    viewMode === 'icons'
                      ? 'flex-col items-center text-center hover:bg-blue-50'
                      : 'items-center justify-between hover:bg-blue-50 px-3 py-1.5'
                  } ${selectedItem === 'documents' ? 'bg-blue-100 border-blue-600' : 'border-transparent'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-amber-200 border border-amber-500 rounded flex items-center justify-center text-xl shadow-xs">
                      📁
                    </div>
                    {viewMode === 'details' && (
                      <div>
                        <div className="font-bold text-gray-900">Meus Documentos</div>
                        <div className="text-[10px] text-gray-500">Pasta de Arquivos Pessoais e Profissionais</div>
                      </div>
                    )}
                  </div>
                  {viewMode === 'icons' && (
                    <div className="mt-1 font-bold text-gray-900">Meus Documentos</div>
                  )}
                  {viewMode === 'details' && <span className="text-[10px] text-gray-500 font-mono">Pasta</span>}
                </div>

                {/* 2. Formação */}
                <div
                  onClick={() => setSelectedItem('education')}
                  onDoubleClick={() => navigateTo('education')}
                  className={`p-2 rounded border cursor-pointer flex transition ${
                    viewMode === 'icons'
                      ? 'flex-col items-center text-center hover:bg-blue-50'
                      : 'items-center justify-between hover:bg-blue-50 px-3 py-1.5'
                  } ${selectedItem === 'education' ? 'bg-blue-100 border-blue-600' : 'border-transparent'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-100 border border-blue-500 rounded flex items-center justify-center text-xl shadow-xs">
                      🎓
                    </div>
                    {viewMode === 'details' && (
                      <div>
                        <div className="font-bold text-gray-900">Formação</div>
                        <div className="text-[10px] text-gray-500">Graduação em Logística, MBAs e Pós-Graduação</div>
                      </div>
                    )}
                  </div>
                  {viewMode === 'icons' && (
                    <div className="mt-1 font-bold text-gray-900">Formação</div>
                  )}
                  {viewMode === 'details' && <span className="text-[10px] text-gray-500 font-mono">Pasta</span>}
                </div>

                {/* 3. Experiência */}
                <div
                  onClick={() => setSelectedItem('experience')}
                  onDoubleClick={() => navigateTo('experience')}
                  className={`p-2 rounded border cursor-pointer flex transition ${
                    viewMode === 'icons'
                      ? 'flex-col items-center text-center hover:bg-blue-50'
                      : 'items-center justify-between hover:bg-blue-50 px-3 py-1.5'
                  } ${selectedItem === 'experience' ? 'bg-blue-100 border-blue-600' : 'border-transparent'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-emerald-100 border border-emerald-600 rounded flex items-center justify-center text-xl shadow-xs">
                      💼
                    </div>
                    {viewMode === 'details' && (
                      <div>
                        <div className="font-bold text-gray-900">Experiência</div>
                        <div className="text-[10px] text-gray-500">Exército Brasileiro (11ª RM) • 2019 até atualmente</div>
                      </div>
                    )}
                  </div>
                  {viewMode === 'icons' && (
                    <div className="mt-1 font-bold text-gray-900">Experiência</div>
                  )}
                  {viewMode === 'details' && <span className="text-[10px] text-gray-500 font-mono">Pasta</span>}
                </div>

                {/* 4. Projetos */}
                <div
                  onClick={() => setSelectedItem('projects')}
                  onDoubleClick={() => navigateTo('projects')}
                  className={`p-2 rounded border cursor-pointer flex transition ${
                    viewMode === 'icons'
                      ? 'flex-col items-center text-center hover:bg-blue-50'
                      : 'items-center justify-between hover:bg-blue-50 px-3 py-1.5'
                  } ${selectedItem === 'projects' ? 'bg-blue-100 border-blue-600' : 'border-transparent'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-purple-100 border border-purple-500 rounded flex items-center justify-center text-xl shadow-xs">
                      💻
                    </div>
                    {viewMode === 'details' && (
                      <div>
                        <div className="font-bold text-gray-900">Projetos</div>
                        <div className="text-[10px] text-gray-500">MATEUS OS 2000 & MATEUS SPACE 2026</div>
                      </div>
                    )}
                  </div>
                  {viewMode === 'icons' && (
                    <div className="mt-1 font-bold text-gray-900">Projetos</div>
                  )}
                  {viewMode === 'details' && <span className="text-[10px] text-gray-500 font-mono">Pasta</span>}
                </div>

                {/* 5. Certificados */}
                <div
                  onClick={() => setSelectedItem('certificates')}
                  onDoubleClick={() => navigateTo('certificates')}
                  className={`p-2 rounded border cursor-pointer flex transition ${
                    viewMode === 'icons'
                      ? 'flex-col items-center text-center hover:bg-blue-50'
                      : 'items-center justify-between hover:bg-blue-50 px-3 py-1.5'
                  } ${selectedItem === 'certificates' ? 'bg-blue-100 border-blue-600' : 'border-transparent'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-amber-100 border border-amber-600 rounded flex items-center justify-center text-xl shadow-xs">
                      📜
                    </div>
                    {viewMode === 'details' && (
                      <div>
                        <div className="font-bold text-gray-900">Certificados</div>
                        <div className="text-[10px] text-gray-500">SENAI 160h IA, IFRS, ENAP, DigiMaster</div>
                      </div>
                    )}
                  </div>
                  {viewMode === 'icons' && (
                    <div className="mt-1 font-bold text-gray-900">Certificados</div>
                  )}
                  {viewMode === 'details' && <span className="text-[10px] text-gray-500 font-mono">Pasta</span>}
                </div>

                {/* 6. Contato */}
                <div
                  onClick={() => setSelectedItem('contact')}
                  onDoubleClick={() => navigateTo('contact')}
                  className={`p-2 rounded border cursor-pointer flex transition ${
                    viewMode === 'icons'
                      ? 'flex-col items-center text-center hover:bg-blue-50'
                      : 'items-center justify-between hover:bg-blue-50 px-3 py-1.5'
                  } ${selectedItem === 'contact' ? 'bg-blue-100 border-blue-600' : 'border-transparent'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-teal-100 border border-teal-600 rounded flex items-center justify-center text-xl shadow-xs">
                      ✉️
                    </div>
                    {viewMode === 'details' && (
                      <div>
                        <div className="font-bold text-gray-900">Contato</div>
                        <div className="text-[10px] text-gray-500">LinkedIn, GitHub, Email, WhatsApp Oficial</div>
                      </div>
                    )}
                  </div>
                  {viewMode === 'icons' && (
                    <div className="mt-1 font-bold text-gray-900">Contato</div>
                  )}
                  {viewMode === 'details' && <span className="text-[10px] text-gray-500 font-mono">Pasta</span>}
                </div>
              </div>

              {/* System Files Section */}
              <div className="border-t border-gray-300 pt-3 space-y-2">
                <div className="text-[11px] font-bold text-gray-600">Arquivos do Sistema (Raiz)</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {EASTER_EGG_FILES.slice(0, 3).map((file) => (
                    <div
                      key={file.name}
                      onClick={() => setSelectedItem(file.name)}
                      onDoubleClick={() => {
                        try { soundFx.playWindowOpen(); } catch (e) {}
                        setActiveEasterEgg(file);
                      }}
                      className={`p-2 rounded border cursor-pointer flex items-center gap-2 hover:bg-blue-50 ${
                        selectedItem === file.name ? 'bg-blue-100 border-blue-600' : 'border-transparent'
                      }`}
                    >
                      <FileText className="w-5 h-5 text-gray-600 shrink-0" />
                      <div className="truncate">
                        <div className="font-bold text-gray-900 truncate">{file.name}</div>
                        <div className="text-[9px] text-gray-500 font-mono">Documento TXT</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW: MEUS DOCUMENTOS
             ========================================================================= */}
          {currentPath === 'documents' && (
            <div className="space-y-4">
              <div className="border-b border-gray-300 pb-1 flex items-center justify-between text-gray-600 font-bold text-[11px]">
                <span>C:\Meu Computador\Meus Documentos</span>
                <button
                  onClick={() => navigateTo('root')}
                  className="text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>Subir Nível</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. Currículo */}
                <div
                  onClick={() => setSelectedItem('doc-resume')}
                  onDoubleClick={() => {
                    if (onOpenApp) onOpenApp('resume');
                  }}
                  className={`p-3 rounded border bg-gray-50 hover:bg-blue-50 cursor-pointer flex items-center justify-between ${
                    selectedItem === 'doc-resume' ? 'border-blue-600 bg-blue-100' : 'border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-8 h-8 bg-red-100 border border-red-500 rounded flex items-center justify-center font-bold text-red-700 text-xs font-mono">
                      PDF
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-gray-900">Currículo_Oficial_Mateus.pdf</div>
                      <div className="text-[10px] text-gray-500">Documento de Apresentação Profissional</div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenApp) onOpenApp('resume');
                    }}
                    className="px-2 py-1 bg-[#ece9d8] border border-gray-400 hover:bg-white text-[11px] font-bold text-gray-800"
                  >
                    Abrir
                  </button>
                </div>

                {/* 2. Sobre Mim */}
                <div
                  onClick={() => setSelectedItem('doc-about')}
                  onDoubleClick={() => {
                    if (onOpenApp) onOpenApp('about');
                  }}
                  className={`p-3 rounded border bg-gray-50 hover:bg-blue-50 cursor-pointer flex items-center justify-between ${
                    selectedItem === 'doc-about' ? 'border-blue-600 bg-blue-100' : 'border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-8 h-8 bg-blue-100 border border-blue-500 rounded flex items-center justify-center font-bold text-blue-700 text-xs font-mono">
                      DOC
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-gray-900">Sobre_Mim_Biografia.doc</div>
                      <div className="text-[10px] text-gray-500">Trajetória, Perfil e Diferenciais</div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenApp) onOpenApp('about');
                    }}
                    className="px-2 py-1 bg-[#ece9d8] border border-gray-400 hover:bg-white text-[11px] font-bold text-gray-800"
                  >
                    Abrir
                  </button>
                </div>

                {/* 3. Projetos */}
                <div
                  onClick={() => setSelectedItem('doc-projects')}
                  onDoubleClick={() => {
                    if (onOpenApp) onOpenApp('projects');
                  }}
                  className={`p-3 rounded border bg-gray-50 hover:bg-blue-50 cursor-pointer flex items-center justify-between ${
                    selectedItem === 'doc-projects' ? 'border-blue-600 bg-blue-100' : 'border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-8 h-8 bg-purple-100 border border-purple-500 rounded flex items-center justify-center font-bold text-purple-700 text-xs font-mono">
                      EXE
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-gray-900">Trabalho_Selecionado.exe</div>
                      <div className="text-[10px] text-gray-500">MATEUS OS 2000 / SPACE 2026</div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenApp) onOpenApp('projects');
                    }}
                    className="px-2 py-1 bg-[#ece9d8] border border-gray-400 hover:bg-white text-[11px] font-bold text-gray-800"
                  >
                    Executar
                  </button>
                </div>

                {/* 4. Formação & MBAs */}
                <div
                  onClick={() => setSelectedItem('doc-education')}
                  onDoubleClick={() => {
                    if (onOpenApp) onOpenApp('education');
                  }}
                  className={`p-3 rounded border bg-gray-50 hover:bg-blue-50 cursor-pointer flex items-center justify-between ${
                    selectedItem === 'doc-education' ? 'border-blue-600 bg-blue-100' : 'border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-8 h-8 bg-emerald-100 border border-emerald-500 rounded flex items-center justify-center font-bold text-emerald-700 text-xs font-mono">
                      DOC
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-gray-900">Formacao_Academica_MBAs.doc</div>
                      <div className="text-[10px] text-gray-500">Logística, Finanças, Supply Chain & Licitações</div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenApp) onOpenApp('education');
                    }}
                    className="px-2 py-1 bg-[#ece9d8] border border-gray-400 hover:bg-white text-[11px] font-bold text-gray-800"
                  >
                    Abrir
                  </button>
                </div>
              </div>

              {/* Easter Eggs in Documents */}
              <div className="border-t border-gray-300 pt-3">
                <div className="text-[11px] font-bold text-gray-600 mb-2">Notas do Sistema</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {EASTER_EGG_FILES.map((file) => (
                    <div
                      key={file.name}
                      onClick={() => setSelectedItem(file.name)}
                      onDoubleClick={() => {
                        try { soundFx.playWindowOpen(); } catch (e) {}
                        setActiveEasterEgg(file);
                      }}
                      className={`p-2 rounded border bg-white hover:bg-blue-50 cursor-pointer flex items-center justify-between ${
                        selectedItem === file.name ? 'border-blue-600 bg-blue-100' : 'border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-gray-600 shrink-0" />
                        <span className="font-bold text-gray-800 truncate">{file.name}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveEasterEgg(file);
                        }}
                        className="text-[10px] text-blue-700 hover:underline cursor-pointer"
                      >
                        Ler TXT
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW: FORMAÇÃO ACADÊMICA
             ========================================================================= */}
          {currentPath === 'education' && (
            <div className="space-y-4">
              <div className="border-b border-gray-300 pb-1 flex items-center justify-between text-gray-600 font-bold text-[11px]">
                <span>C:\Meu Computador\Formação</span>
                <button
                  onClick={() => navigateTo('root')}
                  className="text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>Subir Nível</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {EDUCATION_DATA.map((edu) => (
                  <div key={edu.id} className="p-3 rounded border border-gray-300 bg-gray-50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 text-xs font-mono">{edu.degree}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                        {edu.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-blue-900 font-semibold">{edu.institution} • {edu.type}</div>
                    <p className="text-[11px] text-gray-700">{edu.description}</p>
                  </div>
                ))}
              </div>

              {onOpenApp && (
                <div className="pt-2">
                  <button
                    onClick={() => onOpenApp('education')}
                    className="px-3 py-1.5 bg-[#ece9d8] border-2 border-white border-r-gray-800 border-b-gray-800 text-xs font-bold text-gray-900 hover:bg-white cursor-pointer"
                  >
                    Abrir Aplicativo Completo de Formação (Education.exe)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              VIEW: EXPERIÊNCIA PROFISSIONAL
             ========================================================================= */}
          {currentPath === 'experience' && (
            <div className="space-y-4">
              <div className="border-b border-gray-300 pb-1 flex items-center justify-between text-gray-600 font-bold text-[11px]">
                <span>C:\Meu Computador\Experiência</span>
                <button
                  onClick={() => navigateTo('root')}
                  className="text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>Subir Nível</span>
                </button>
              </div>

              {EXPERIENCE_DATA.map((exp) => (
                <div key={exp.id} className="p-3.5 rounded border border-gray-300 bg-gray-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-gray-900 text-xs font-mono">{exp.role} — {exp.organization}</div>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold border border-blue-300">
                      {exp.period}
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px] text-gray-700">
                    {exp.description.map((desc, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-blue-700">▸</span>
                        <span>{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {onOpenApp && (
                <div className="pt-2">
                  <button
                    onClick={() => onOpenApp('experience')}
                    className="px-3 py-1.5 bg-[#ece9d8] border-2 border-white border-r-gray-800 border-b-gray-800 text-xs font-bold text-gray-900 hover:bg-white cursor-pointer"
                  >
                    Abrir Aplicativo de Experiência (Experience.exe)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              VIEW: PROJETOS
             ========================================================================= */}
          {currentPath === 'projects' && (
            <div className="space-y-4">
              <div className="border-b border-gray-300 pb-1 flex items-center justify-between text-gray-600 font-bold text-[11px]">
                <span>C:\Meu Computador\Projetos</span>
                <button
                  onClick={() => navigateTo('root')}
                  className="text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>Subir Nível</span>
                </button>
              </div>

              {PROJECTS_DATA.map((proj) => (
                <div key={proj.id} className="p-3.5 rounded border border-gray-300 bg-gray-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-gray-900 text-xs font-mono">{proj.name}</div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                      {proj.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-700">{proj.description}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {proj.technologies.map((t, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-800 font-mono text-[10px] border border-gray-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {onOpenApp && (
                <div className="pt-2">
                  <button
                    onClick={() => onOpenApp('projects')}
                    className="px-3 py-1.5 bg-[#ece9d8] border-2 border-white border-r-gray-800 border-b-gray-800 text-xs font-bold text-gray-900 hover:bg-white cursor-pointer"
                  >
                    Abrir Central de Projetos (Projects.exe)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              VIEW: CERTIFICADOS
             ========================================================================= */}
          {currentPath === 'certificates' && (
            <div className="space-y-4">
              <div className="border-b border-gray-300 pb-1 flex items-center justify-between text-gray-600 font-bold text-[11px]">
                <span>C:\Meu Computador\Certificados</span>
                <button
                  onClick={() => navigateTo('root')}
                  className="text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>Subir Nível</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {COURSES_DATA.map((c) => (
                  <div key={c.id} className="p-2.5 rounded border border-gray-300 bg-gray-50 flex items-start gap-2">
                    <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-gray-900 text-xs">{c.name}</div>
                      <div className="text-[10px] text-gray-600">{c.issuer} • {c.hours}</div>
                      <div className="text-[10px] text-emerald-700 font-semibold">{c.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW: CONTATO
             ========================================================================= */}
          {currentPath === 'contact' && (
            <div className="space-y-4">
              <div className="border-b border-gray-300 pb-1 flex items-center justify-between text-gray-600 font-bold text-[11px]">
                <span>C:\Meu Computador\Contato</span>
                <button
                  onClick={() => navigateTo('root')}
                  className="text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>Subir Nível</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  href={PROFILE_DATA.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded border border-blue-400 bg-blue-50 hover:bg-blue-100 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-blue-900">LinkedIn Oficial</div>
                    <div className="text-[10px] text-gray-600">{PROFILE_DATA.linkedin}</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-blue-700" />
                </a>

                <a
                  href={PROFILE_DATA.github}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded border border-gray-400 bg-gray-50 hover:bg-gray-100 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-gray-900">GitHub</div>
                    <div className="text-[10px] text-gray-600">{PROFILE_DATA.github}</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-700" />
                </a>

                <a
                  href={`mailto:${PROFILE_DATA.email}`}
                  className="p-3 rounded border border-red-400 bg-red-50 hover:bg-red-100 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-red-900">Email Profissional</div>
                    <div className="text-[10px] text-gray-600">{PROFILE_DATA.email}</div>
                  </div>
                  <Mail className="w-4 h-4 text-red-700" />
                </a>

                <a
                  href={PROFILE_DATA.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded border border-emerald-400 bg-emerald-50 hover:bg-emerald-100 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-emerald-900">WhatsApp Oficial</div>
                    <div className="text-[10px] text-gray-600">{PROFILE_DATA.phoneFormatted}</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-emerald-700" />
                </a>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW: HISTÓRICO DO SISTEMA (SYSTEM.LOG)
             ========================================================================= */}
          {currentPath === 'history' && (
            <div className="space-y-4">
              <div className="border-b border-gray-300 pb-1 flex items-center justify-between text-gray-600 font-bold text-[11px]">
                <span>C:\Meu Computador\Histórico do Sistema (SYSTEM.LOG)</span>
                <button
                  onClick={() => navigateTo('root')}
                  className="text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>Subir Nível</span>
                </button>
              </div>

              <div className="p-3 bg-black text-emerald-400 font-mono text-xs rounded border border-gray-600 space-y-3 max-h-[340px] overflow-y-auto">
                <div className="text-amber-300 font-bold border-b border-gray-800 pb-1">
                  === MATEUS OS // REGISTRO OFICIAL DE EVENTOS (SYSTEM.LOG) ===
                </div>

                {SYSTEM_HISTORY_EVENTS.map((event, i) => (
                  <div key={i} className="space-y-0.5 border-l-2 border-emerald-500/50 pl-2.5 py-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400 font-bold">[{event.year}]</span>
                      <span className="text-cyan-300">[{event.category}]</span>
                      <span className="text-white font-bold">{event.title}</span>
                    </div>
                    <div className="text-slate-300 text-[11px]">{event.description}</div>
                    {event.details && (
                      <div className="text-slate-400 text-[10px] pl-2">
                        {event.details.map((d, idx) => (
                          <div key={idx}>▸ {d}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. RETRO STATUS BAR */}
      <div className="bg-[#ece9d8] border-t border-gray-400 px-3 py-1 flex items-center justify-between text-[11px] text-gray-700 shrink-0">
        <div className="flex items-center gap-2">
          <span>{getPathString()}</span>
          <span className="text-gray-400">•</span>
          <span>Disco Local C:</span>
        </div>
        <div className="font-mono text-[10px] text-gray-600">
          MATEUS OS 00 • SISTEMA ÍNTEGRO
        </div>
      </div>

      {/* 5. EASTER EGG TEXT VIEWER (NOTEPAD MODAL) */}
      {activeEasterEgg && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#ece9d8] border-2 border-white border-r-gray-800 border-b-gray-800 shadow-2xl flex flex-col max-h-[85vh] animate-fadeIn">
            {/* Titlebar */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white px-2 py-1 font-bold text-xs flex items-center justify-between select-none">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                <span>{activeEasterEgg.title}</span>
              </div>
              <button
                onClick={() => setActiveEasterEgg(null)}
                className="w-4 h-4 bg-[#ece9d8] text-gray-900 font-bold flex items-center justify-center border border-white border-r-gray-800 border-b-gray-800 hover:bg-red-500 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Notepad Menu */}
            <div className="bg-[#ece9d8] px-2 py-0.5 border-b border-gray-400 text-[11px] flex gap-3 text-gray-800">
              <span className="hover:underline cursor-pointer">Arquivo</span>
              <span className="hover:underline cursor-pointer">Editar</span>
              <span className="hover:underline cursor-pointer">Formatar</span>
              <span className="hover:underline cursor-pointer">Ajuda</span>
            </div>

            {/* Content Textarea */}
            <div className="flex-1 p-3 bg-white text-gray-900 font-mono text-xs overflow-y-auto whitespace-pre-wrap leading-relaxed select-text min-h-[220px]">
              {activeEasterEgg.content}
            </div>

            {/* Footer */}
            <div className="bg-[#ece9d8] p-2 border-t border-gray-400 flex justify-end">
              <button
                onClick={() => setActiveEasterEgg(null)}
                className="px-4 py-1 bg-[#ece9d8] border-2 border-white border-r-gray-800 border-b-gray-800 font-bold text-xs hover:bg-gray-200 cursor-pointer"
              >
                Fechar Bloco de Notas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. SYSTEM PROPERTIES MODAL (RETRO SYSTEM PROPERTIES) */}
      {showPropertiesModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#ece9d8] border-2 border-white border-r-gray-800 border-b-gray-800 shadow-2xl flex flex-col animate-fadeIn">
            {/* Titlebar */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white px-2 py-1 font-bold text-xs flex items-center justify-between select-none">
              <div className="flex items-center gap-1.5">
                <Monitor className="w-4 h-4" />
                <span>Propriedades do Sistema // MATEUS OS 00</span>
              </div>
              <button
                onClick={() => setShowPropertiesModal(false)}
                className="w-4 h-4 bg-[#ece9d8] text-gray-900 font-bold flex items-center justify-center border border-white border-r-gray-800 border-b-gray-800 hover:bg-red-500 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Properties Content */}
            <div className="p-4 space-y-4 text-xs font-sans">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-400">
                <div className="w-12 h-12 bg-blue-900 border-2 border-gray-400 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                  M
                </div>
                <div>
                  <div className="font-bold text-sm text-blue-950">
                    {SYSTEM_PROPERTIES_DATA.systemName}
                  </div>
                  <div className="text-[11px] text-gray-600">
                    {SYSTEM_PROPERTIES_DATA.edition}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold">
                    Versão: {SYSTEM_PROPERTIES_DATA.version}
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 border border-gray-400 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Usuário:</span>
                  <span className="font-bold text-gray-900">{SYSTEM_PROPERTIES_DATA.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="font-bold text-emerald-600">{SYSTEM_PROPERTIES_DATA.userStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">M-BOT Companion:</span>
                  <span className="font-bold text-blue-700">{SYSTEM_PROPERTIES_DATA.mBotStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Modo Atual:</span>
                  <span className="font-bold text-gray-900">{SYSTEM_PROPERTIES_DATA.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Localização:</span>
                  <span className="font-bold text-gray-900">{SYSTEM_PROPERTIES_DATA.location}</span>
                </div>
              </div>

              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-950">
                <span className="font-bold">Áreas de Atuação: </span>
                <span>{SYSTEM_PROPERTIES_DATA.focusAreas}</span>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="bg-[#ece9d8] p-2.5 border-t border-gray-400 flex justify-end gap-2">
              <button
                onClick={() => setShowPropertiesModal(false)}
                className="px-4 py-1 bg-[#ece9d8] border-2 border-white border-r-gray-800 border-b-gray-800 font-bold text-xs hover:bg-gray-200 cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
