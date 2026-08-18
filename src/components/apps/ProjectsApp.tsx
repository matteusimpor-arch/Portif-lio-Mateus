import React, { useState } from 'react';
import {
  Folder,
  ExternalLink,
  Github,
  Sparkles,
  CheckCircle2,
  Search,
  X,
  Layers,
  Terminal,
  Clock,
  Compass,
  Cpu,
  Monitor,
  Gamepad2,
  Eye
} from 'lucide-react';
import { PROJECTS_DATA } from '../../data/portfolioData';
import { Project } from '../../types';
import { soundFx } from '../../utils/soundEffects';

export const ProjectsApp: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project>(PROJECTS_DATA[0]);
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'architecture' | 'future'>('overview');

  const mainProject = PROJECTS_DATA[0];

  return (
    <div className="space-y-4 font-sans text-gray-900 select-none max-w-4xl mx-auto">
      {/* Retro Directory Path Titlebar */}
      <div className="bg-[#c0c0c0] p-2 border-2 border-white border-r-gray-800 border-b-gray-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 font-bold">
          <Folder className="w-4 h-4 text-yellow-700 fill-yellow-500" />
          <span className="text-blue-950 font-bold">C:\MATEUS\TRABALHO_SELECIONADO\</span>
        </div>
        <span className="text-[11px] text-gray-700">1 PROJETO REAL CADASTRADO</span>
      </div>

      {/* Main Project Hero Card */}
      <div className="bg-white border-2 border-gray-700 shadow-md p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-yellow-500/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-900 text-white font-mono text-[10px] font-bold">
                PROJETO PRINCIPAL
              </span>
              <span className="px-2 py-0.5 rounded bg-green-800 text-white font-mono text-[10px] font-bold">
                PORTFÓLIO PESSOAL INTERATIVO
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-blue-950">
              {mainProject.name}
            </h1>
            <p className="text-xs text-gray-700 font-sans leading-relaxed">
              {mainProject.tagline}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/matteusimpor-arch"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-retro px-3 py-1.5 flex items-center gap-1 text-xs font-bold text-blue-950 hover:bg-yellow-200"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Ver no GitHub</span>
            </a>
          </div>
        </div>

        {/* Retro Tabs System */}
        <div className="flex items-center gap-1 border-b-2 border-gray-400 pt-1">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('overview');
            }}
            className={`px-3 py-1 text-xs font-bold border-2 rounded-t-sm cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white border-gray-600 border-b-white font-bold text-blue-950 -mb-[2px]'
                : 'bg-[#d8d8d8] border-gray-400 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ✦ Visão Geral & Conceito
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('features');
            }}
            className={`px-3 py-1 text-xs font-bold border-2 rounded-t-sm cursor-pointer ${
              activeTab === 'features'
                ? 'bg-white border-gray-600 border-b-white font-bold text-blue-950 -mb-[2px]'
                : 'bg-[#d8d8d8] border-gray-400 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ★ Recursos & Funcionalidades
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('architecture');
            }}
            className={`px-3 py-1 text-xs font-bold border-2 rounded-t-sm cursor-pointer ${
              activeTab === 'architecture'
                ? 'bg-white border-gray-600 border-b-white font-bold text-blue-950 -mb-[2px]'
                : 'bg-[#d8d8d8] border-gray-400 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ⚙ Tecnologias Utilizadas
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('future');
            }}
            className={`px-3 py-1 text-xs font-bold border-2 rounded-t-sm cursor-pointer ${
              activeTab === 'future'
                ? 'bg-white border-gray-600 border-b-white font-bold text-blue-950 -mb-[2px]'
                : 'bg-[#d8d8d8] border-gray-400 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ＋ Novos Projetos
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4 text-xs leading-relaxed pt-2">
            <div className="bg-yellow-50 border border-yellow-300 p-3 rounded space-y-2">
              <div className="font-bold text-blue-950 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-yellow-600" />
                <span>Conceito Central: 2000 → VIAGEM NO TEMPO → 2026</span>
              </div>
              <p className="text-gray-800">
                {mainProject.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-300 p-3 bg-gray-50 space-y-2">
                <h3 className="font-bold text-blue-900 font-mono flex items-center gap-1.5">
                  <Monitor className="w-4 h-4 text-teal-700" />
                  <span>Universo 1: MATEUS OS 2000</span>
                </h3>
                <p className="text-[11.5px] text-gray-700">
                  Estética fiel aos sistemas operacionais clássicos (Windows 95/98/2000, Early Web). Janelas beveled com gerenciamento multitarefa, menus de contexto, personalização de papéis de parede, sons sintetizados em tempo real e jogos nostálgicos.
                </p>
              </div>

              <div className="border border-gray-300 p-3 bg-gray-50 space-y-2">
                <h3 className="font-bold text-emerald-900 font-mono flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-emerald-600" />
                  <span>Universo 2: MATEUS SPACE 2026</span>
                </h3>
                <p className="text-[11.5px] text-gray-700">
                  Experiência Tech-Noir contemporânea com renderização em HTML5 Canvas, física de micropartículas magnéticas reagindo ao cursor, Dot Matrix e morfologia automática de palavras em aplicativos com flutuação em gravidade zero.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Features */}
        {activeTab === 'features' && (
          <div className="space-y-3 pt-2 text-xs">
            <h3 className="font-bold text-blue-950 font-mono">
              Recursos Implementados e Destaques Técnicos:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {mainProject.features.map((feat, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-gray-50 border border-gray-300 rounded flex items-start gap-2 text-[11.5px] text-gray-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Architecture & Tech */}
        {activeTab === 'architecture' && (
          <div className="space-y-4 pt-2 text-xs">
            <div className="space-y-2">
              <h3 className="font-bold text-blue-950 font-mono">
                Stack Tecnológica Utilizada:
              </h3>
              <div className="flex flex-wrap gap-2">
                {mainProject.technologies.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-50 border border-blue-300 text-blue-950 font-mono font-bold rounded text-xs"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="border border-gray-300 p-3 bg-gray-50 space-y-2">
              <h4 className="font-bold text-gray-900 font-mono">Engenharia de Áudio & Partículas</h4>
              <p className="text-[11.5px] text-gray-700 leading-relaxed">
                O projeto utiliza a <strong>Web Audio API</strong> para sintetizar todos os efeitos sonoros (clicks, fanfarras, abertura de janelas e músicas do Napster) diretamente em código nativo, com zero arquivos externos de áudio e latência mínima. Os campos de partículas operam em loops a 60 FPS com <code>requestAnimationFrame</code>.
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Future Projects */}
        {activeTab === 'future' && (
          <div className="p-4 bg-gray-50 border border-dashed border-gray-400 rounded text-center space-y-2 text-xs">
            <div className="w-10 h-10 bg-yellow-100 border border-yellow-400 rounded-full flex items-center justify-center mx-auto text-yellow-800 font-bold">
              ＋
            </div>
            <h3 className="font-bold text-blue-950 font-mono">
              Estrutura Preparada para Novos Projetos Reais
            </h3>
            <p className="text-gray-600 max-w-md mx-auto text-[11.5px]">
              Esta seção está padronizada para receber exclusivamente novos projetos reais desenvolvidos por Mateus Araujo em Logística, IA, Gestão e Engenharia de Prompt, mantendo a autenticidade e o rigor profissional do portfólio.
            </p>
          </div>
        )}
      </div>

      {/* Retro Status Bar */}
      <div className="bg-[#c0c0c0] p-1.5 border-bevel-in text-[11px] font-mono text-gray-800 flex items-center justify-between">
        <span>STATUS: EXIBINDO PROJETOS REAIS</span>
        <span>MATEUS OS 2000 / SPACE 2026</span>
      </div>
    </div>
  );
};
