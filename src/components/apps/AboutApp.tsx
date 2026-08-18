import React from 'react';
import { User, Cpu, Award, Target, Terminal, Shield, Sparkles, CheckCircle2 } from 'lucide-react';
import { PROFILE_INFO } from '../../data/portfolioData';

export const AboutApp: React.FC = () => {
  return (
    <div className="space-y-6 font-sans-ui text-slate-200">
      {/* Header Bio Card */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 p-6 rounded-xl border border-emerald-500/30 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-0.5 shadow-xl shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-vt323 text-4xl text-emerald-300 font-bold">
              MA
            </div>
          </div>

          <div className="text-center sm:text-left space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-mono-code">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>PERFIL PROFISSIONAL OFICIAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{PROFILE_INFO.name}</h1>
            <p className="text-sm text-emerald-300 font-medium">{PROFILE_INFO.headline}</p>
            <p className="text-xs text-slate-400 leading-relaxed max-w-2xl pt-1">
              {PROFILE_INFO.bioShort}
            </p>
          </div>
        </div>
      </div>

      {/* Main Narrative */}
      <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 font-vt323 text-xl">
          <User className="w-5 h-5 text-emerald-400" />
          <span>APRESENTAÇÃO E TRAJETÓRIA</span>
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          {PROFILE_INFO.bioLong}
        </p>
      </div>

      {/* Core Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="p-2 bg-emerald-950 border border-emerald-800 w-fit rounded-lg text-emerald-400">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Inteligência Artificial & Prompting</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Especialista na elaboração de diretrizes sintáticas (System Prompts, Few-shotting, Chain-of-Thought) para maximizar a precisão de LLMs.
          </p>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="p-2 bg-amber-950 border border-amber-800 w-fit rounded-lg text-amber-400">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Rigores de Gestão Operacional</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Experiência fundamentada no Exército Brasileiro e em consultorias, trazendo disciplina, padronização de rotinas e liderança.
          </p>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="p-2 bg-blue-950 border border-blue-800 w-fit rounded-lg text-blue-400">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Logística & Supply Chain</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Formação acadêmica em Tecnologia em Logística (2025) focada na otimização da cadeia de suprimentos e gestão de estoques.
          </p>
        </div>
      </div>

      {/* Key Differential List */}
      <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-emerald-400 font-mono-code uppercase">Diferenciais e Princípios de Atuação</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Foco pragmático na resolução de problemas reais de negócios.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Abordagem orientada a dados e eficiência de custos com IA.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Domínio técnico e visão estratégica de processos.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Capacidade contínua de aprendizado e evolução tecnológica.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
