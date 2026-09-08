import { Project, ExperienceItem, EducationItem, CertificateItem, SkillCategory, CurrentlyNow } from '../types';

export const PROFILE_DATA = {
  name: 'MATEUS ARAUJO',
  fullName: 'MATEUS ARAUJO SANTOS',
  title: 'PROFISSIONAL DE LOGÍSTICA, GESTÃO E TECNOLOGIA',
  headline: 'Logística • Gestão • Finanças • Supply Chain • Administração Pública • Inteligência Artificial • Engenharia de Prompt',
  location: 'Brasil',
  email: 'matteus.impor@gmail.com',
  phone: '(61) 983180345',
  phoneFormatted: '(61) 98318-0345',
  linkedin: 'https://www.linkedin.com/in/mateus-araujo077',
  github: 'https://github.com/matteusimpor-arch',
  whatsapp: 'https://wa.me/5561983180345',
  whatsappDisplay: '(61) 983180345',
  
  // Disponibilidade e características principais
  availability: 'Disponibilidade para atuação em áreas administrativas, logísticas e operacionais.',
  traits: [
    'ORGANIZADO',
    'ANALÍTICO',
    'COMPROMETIDO',
    'DESENVOLVIMENTO PROFISSIONAL CONTÍNUO'
  ],
  
  subtitle: 'Profissional com formação em Logística, múltiplos MBAs e especializações em Finanças, Controladoria, Supply Chain, Gestão Pública e Licitações, com atuação contínua em tecnologia, automação e Inteligência Artificial.',
  
  bioShort: 'Minha trajetória profissional e acadêmica une gestão, logística e tecnologia. Atuo com responsabilidade, conformidade de processos, organização administrativa, controle de informações e aplicação prática de Inteligência Artificial e soluções digitais.',
  
  bioLong: `Minha trajetória profissional e acadêmica é construída na interseção entre gestão, logística e tecnologia. Ao longo da minha formação, desenvolvi conhecimentos sólidos em processos, organização, planejamento, finanças, Supply Chain e administração pública, enquanto amplio continuamente minha atuação em Inteligência Artificial, Engenharia de Prompt e soluções digitais.

Possuo disponibilidade para atuação em áreas administrativas, logísticas e operacionais, com perfil analítico, organização rigorosa e foco no desenvolvimento profissional contínuo.`,

  quote: 'Gestão para estruturar processos. Tecnologia para otimizar rotinas. Inteligência Artificial para potencializar resultados.',

  stats: [
    { value: '1', label: 'Graduação Superior em Logística Concluída' },
    { value: '3', label: 'MBAs Especializados' },
    { value: '1', label: 'Pós-Graduação em Licitações' },
    { value: '2019+', label: 'Experiência Administrativa no Exército' },
    { value: '160h', label: 'Operador de Computador com IA (SENAI)' }
  ]
};

// Aliased export for backwards compatibility
export const PROFILE_INFO = PROFILE_DATA;

// =========================================================================
// 1. TRABALHO SELECIONADO — PROJETOS REAIS (Sem projetos fictícios)
// =========================================================================
export const PROJECTS_DATA: Project[] = [
  {
    id: 'proj-mateus-os',
    name: 'MATEUS OS 2000 / MATEUS SPACE 2026',
    tagline: 'Portfólio Pessoal Interativo com Duas Épocas e Linguagens Visuais',
    description: 'Portfólio pessoal desenvolvido como uma experiência digital que conecta duas épocas e duas linguagens visuais: um ambiente retrô inspirado nos computadores dos anos 2000 e uma experiência moderna e interativa ambientada no MATEUS SPACE 2026.',
    objective: 'Criar uma ponte imersiva entre a nostalgia da era do desktop clássico e as tecnologias interativas contemporâneas (partículas, WebGL, tech-noir e gravidade zero).',
    technologies: [
      'React',
      'TypeScript',
      'Tailwind CSS',
      'HTML5 Canvas 2D',
      'Web Audio API',
      'Dot Matrix Particle Engine',
      'Particle Morphing'
    ],
    category: 'WEB PROJECTS',
    status: 'Destaque',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop',
    link: '#',
    github: 'https://github.com/matteusimpor-arch',
    demoAvailable: true,
    features: [
      'Desktop retrô clássico estilo Windows 2000 com janelas arrastáveis, minimizar e maximizar',
      'Menu Iniciar funcional com submenus clássicos e atalhos de sistema',
      'Menu de contexto com botão direito no desktop e personalização de fundos',
      'Assistente Clippy com olhos interativos que acompanham o cursor e balão de dicas em português',
      'Viagem no Tempo com portal temporal em espiral cósmica (2000 → 2026)',
      'MATEUS SPACE 2026 com atmosfera Tech-Noir, Particle Text e física magnética de cursor',
      'Particle Morphing com desintegração de texto em micropartículas que se convertem nos 8 aplicativos',
      'Flutuação dos aplicativos em gravidade zero e auras holográficas',
      'Player de música retrô Napster com sintetizador de áudio Web Audio API',
      'Central de Jogos retrô (Paciência 2000, Snake 3310, Futebol 2000, Campo Minado)',
      'Sistema de descanso de tela automático por inatividade (30 segundos) e modo de teste instantâneo'
    ]
  }
];

// =========================================================================
// 2. FORMAÇÃO ACADÊMICA REAL (Graduação ↓ MBAs ↓ Pós-Graduação)
// =========================================================================
export const EDUCATION_DATA: EducationItem[] = [
  // GRADUAÇÃO
  {
    id: 'edu-grad-1',
    year: 'Concluído',
    degree: 'SUPERIOR EM LOGÍSTICA',
    institution: 'Centro Universitário IESB',
    status: 'Concluído',
    type: 'Graduação',
    description: 'Formação superior com foco em gestão da cadeia de suprimentos, logística de transportes, movimentação e armazenagem, gestão de estoques e otimização de fluxos operacionais.',
    highlights: [
      'Graduação concluída.',
      'Foco em processos logísticos, controle de armazenagem e distribuição física.'
    ]
  },

  // MBAs
  {
    id: 'edu-mba-1',
    year: 'Pós-Graduação / MBA',
    degree: 'MBA EM FINANÇAS E CONTROLADORIA',
    institution: 'Anhanguera',
    status: 'Concluído',
    type: 'MBA / Pós',
    description: 'Especialização executiva voltada a planejamento financeiro, gestão de custos, análise orçamentária, fluxo de caixa e controladoria estratégica.',
    highlights: [
      'Análise financeira e estruturação de orçamentos corporativos.',
      'Controladoria e indicadores de desempenho econômico.'
    ]
  },
  {
    id: 'edu-mba-2',
    year: 'Pós-Graduação / MBA',
    degree: 'MBA EM LOGÍSTICA E SUPPLY CHAIN MANAGEMENT',
    institution: 'Anhanguera',
    status: 'Concluído',
    type: 'MBA / Pós',
    description: 'Aprofundamento na gestão integrada da cadeia de suprimentos (Supply Chain), redes de distribuição, níveis de serviço, compras estratégicas e otimização de fluxos.',
    highlights: [
      'Gestão estratégica da cadeia de suprimentos.',
      'Planejamento de operações logísticas e Lead Time.'
    ]
  },
  {
    id: 'edu-mba-3',
    year: 'Pós-Graduação / MBA',
    degree: 'MBA EM GESTÃO PÚBLICA',
    institution: 'Especialização Executiva',
    status: 'Concluído',
    type: 'MBA / Pós',
    description: 'Capacitação avançada em governança pública, políticas públicas, gestão de recursos, conformidade orçamentária e administração no âmbito governamental.',
    highlights: [
      'Governança e conformidade na gestão pública.',
      'Planejamento e controle de processos administrativos.'
    ]
  },

  // PÓS-GRADUAÇÃO / ESPECIALIZAÇÕES
  {
    id: 'edu-pos-1',
    year: 'Pós-Graduação',
    degree: 'PÓS-GRADUAÇÃO EM LICITAÇÕES E CONTRATOS ADMINISTRATIVOS',
    institution: 'Especialização',
    status: 'Concluído',
    type: 'MBA / Pós',
    description: 'Formação especializada em processos licitatórios, legislação de contratações públicas, elaboração e fiscalização de contratos administrativos.',
    highlights: [
      'Domínio dos princípios e procedimentos da legislação de licitações públicas.',
      'Gestão e conformidade de contratos administrativos.'
    ]
  }
];

// =========================================================================
// 3. CURSOS ADICIONAIS REAIS
// =========================================================================
export const COURSES_DATA: CertificateItem[] = [
  {
    id: 'course-1',
    name: 'Operador de Computador com IA',
    hours: '160 horas',
    issuer: 'SENAI',
    year: 'Recente',
    status: 'Concluído (Destaque)'
  },
  {
    id: 'course-2',
    name: 'Assistente Ambiental',
    hours: 'Carga Horária Completa',
    issuer: 'SENAI',
    year: 'Concluído',
    status: 'Concluído'
  },
  {
    id: 'course-3',
    name: 'Contabilidade Básica',
    hours: 'Carga Horária Completa',
    issuer: 'IFRS',
    year: 'Concluído',
    status: 'Concluído'
  },
  {
    id: 'course-4',
    name: 'Gestão de Finanças Pessoais',
    hours: 'Carga Horária Completa',
    issuer: 'ENAP',
    year: 'Concluído',
    status: 'Concluído'
  },
  {
    id: 'course-5',
    name: 'Gestão Financeira',
    hours: 'Carga Horária Completa',
    issuer: 'IFRS',
    year: 'Concluído',
    status: 'Concluído'
  },
  {
    id: 'course-6',
    name: 'Informática Profissionalizante',
    hours: 'Carga Horária Completa',
    issuer: 'DigiMaster',
    year: 'Concluído',
    status: 'Concluído'
  },
  {
    id: 'course-7',
    name: 'Logística',
    hours: 'Carga Horária Completa',
    issuer: 'IFRS',
    year: 'Concluído',
    status: 'Concluído'
  }
];

export const CERTIFICATES_DATA = COURSES_DATA;

// =========================================================================
// 4. EXPERIÊNCIA PROFISSIONAL REAL
// =========================================================================
export const EXPERIENCE_DATA: ExperienceItem[] = [
  {
    id: 'exp-eb-1',
    period: '2019 até atualmente',
    role: 'Cabo (Cb)',
    organization: 'Exército Brasileiro — 11ª Região Militar',
    location: 'Brasil',
    badge: 'Atuação Efetiva',
    description: [
      'Responsável pela confecção diária do aditamento da Seção do Serviço de Veteranos e Pensionistas (SVP) da 11ª Região Militar.',
      'Elaboração, conferência detalhada e organização rigorosa de documentos administrativos oficiais.',
      'Controle rigoroso de informações institucionais, registros oficiais e cumprimento de prazos regimentais.',
      'Apoio direto às rotinas administrativas e logísticas da unidade militar.'
    ],
    skillsUsed: [
      'Documentação Oficial',
      'Gestão de Processos',
      'Controle de Prazos',
      'Rotinas Administrativas',
      'Apoio Logístico',
      'Disciplina e Organização'
    ],
    highlights: [
      'Confecção e conferência diária do aditamento oficial da SVP / 11ª Região Militar.',
      'Garantia de conformidade, rastreabilidade e pontualidade na tramitação de expedientes oficiais.'
    ]
  }
];

// =========================================================================
// 5. COMPETÊNCIAS E CONHECIMENTOS
// =========================================================================
export const SKILLS_DATA: SkillCategory[] = [
  {
    category: 'LOGÍSTICA & SUPPLY CHAIN',
    code: 'LOGISTICS',
    icon: 'Truck',
    skills: [
      { name: 'Logística Operacional', level: 95, description: 'Planejamento de movimentação, armazenagem e controle de fluxos materiais', tags: ['Armazenagem', 'Fluxos Operacionais', 'Controle'] },
      { name: 'Supply Chain Management', level: 92, description: 'Visão integrada da cadeia de suprimentos e nível de serviço', tags: ['Cadeia de Suprimentos', 'Lead Time', 'Indicadores'] },
      { name: 'Gestão de Estoques', level: 90, description: 'Controle de suprimentos, acuracidade e reposição', tags: ['Estoque', 'Inventário', 'Suprimentos'] }
    ]
  },
  {
    category: 'GESTÃO & ADMINISTRAÇÃO',
    code: 'MANAGEMENT',
    icon: 'Briefcase',
    skills: [
      { name: 'Gestão Administrativa', level: 96, description: 'Organização de rotinas, tramitação de documentos oficiais e prazos', tags: ['Documentos Oficiais', 'Conformidade', 'Prazos'] },
      { name: 'Organização e Métodos', level: 95, description: 'Padronização de processos e estruturação de fluxos operacionais', tags: ['Organização', 'Processos', 'Métodos'] },
      { name: 'Perfil Analítico', level: 94, description: 'Conferência criteriosa, identificação de inconsistências e resolução de problemas', tags: ['Análise Crítica', 'Precisão', 'Controle'] }
    ]
  },
  {
    category: 'FINANÇAS & CONTROLADORIA',
    code: 'FINANCE',
    icon: 'Award',
    skills: [
      { name: 'Controladoria & Finanças', level: 90, description: 'Planejamento financeiro, análise de custos e indicadores orçamentários', tags: ['Custos', 'Orçamento', 'Controladoria'] },
      { name: 'Gestão Financeira', level: 88, description: 'Fundamentos de fluxo financeiro, conciliação e controles', tags: ['Finanças', 'Gestão Orçamentária'] }
    ]
  },
  {
    category: 'GESTÃO PÚBLICA & LICITAÇÕES',
    code: 'PUBLIC ADMINISTRATION',
    icon: 'ShieldCheck',
    skills: [
      { name: 'Gestão Pública', level: 92, description: 'Normativas, governança e rotinas institucionais no setor público', tags: ['Administração Pública', 'Governança', 'Regimentos'] },
      { name: 'Licitações & Contratos', level: 90, description: 'Fundamentos da legislação de contratações públicas e fiscalização de contratos', tags: ['Licitações', 'Contratos Administrativos', 'Legislação'] }
    ]
  },
  {
    category: 'TECNOLOGIA & INTELIGÊNCIA ARTIFICIAL',
    code: 'TECHNOLOGY',
    icon: 'Cpu',
    skills: [
      { name: 'Operação de Computador com IA', level: 94, description: 'Formação SENAI (160h) voltada à aplicação prática de IA nas rotinas digitais', tags: ['SENAI 160h', 'IA Aplicada', 'Produtividade'] },
      { name: 'Engenharia de Prompt', level: 92, description: 'Estruturação de comandos claros, contextos e especificações para modelos de linguagem', tags: ['Prompts Estruturados', 'LLMs', 'Contexto'] },
      { name: 'Informática Profissionalizante', level: 95, description: 'Domínio de ferramentas de escritório, sistemas e automações de tarefas', tags: ['DigiMaster', 'Sistemas', 'Ferramentas'] }
    ]
  }
];

// =========================================================================
// 6. AGORA (2026) — FOCOS ATUAIS E METAS
// =========================================================================
export const CURRENTLY_NOW_DATA: CurrentlyNow = {
  studying: [
    'Aprofundamento na interseção entre Logística, Gestão Pública e Inteligência Artificial',
    'Técnicas avançadas de Engenharia de Prompt e automação de fluxos documentais',
    'Gestão de processos orientada a dados e controle de indicadores'
  ],
  building: [
    'MATEUS OS 2000 / MATEUS SPACE 2026 — Experiência digital interativa',
    'Modelos de padronização documental com apoio de Inteligência Artificial',
    'Estruturações de rotinas para ganho de produtividade e redução de prazos operacionais'
  ],
  learning: [
    'Aplicações práticas de IA para otimização de rotinas em logística e administração',
    'Metodologias ágeis aplicadas ao controle de processos e conformidade legal',
    'Ferramentas contemporâneas de desenvolvimento web e interfaces interativas'
  ],
  designing: [
    'Fluxos estruturados para triagem e organização de expedientes administrativos',
    'Modelos conceituais conectando gestão de suprimentos e tecnologia'
  ],
  goals2026: [
    'Disponibilidade para atuação estratégica em áreas administrativas, logísticas e operacionais',
    'Desenvolver soluções que melhorem a precisão e eficiência dos fluxos de trabalho',
    'Consolidar a aplicação prática de IA e automação como aceleradores profissionais'
  ]
};

// Centralized Current Mission for Space 2026
export const CURRENT_MISSION_DATA = {
  updatedAt: '2026',
  location: 'Brasília, DF • Brasil',
  professionalFocus: 'Logística, Gestão de Processos e Inteligência Artificial Aplicada',
  activities: [
    'Padronização de expedientes e rotinas administrativas com foco em rastreabilidade',
    'Otimização de fluxos e tempos de resposta no controle documental',
    'Arquitetura e desenvolvimento da experiência digital interativa MATEUS OS 2000 / SPACE 2026'
  ],
  studies: CURRENTLY_NOW_DATA.studying,
  projects: CURRENTLY_NOW_DATA.building,
  goals: CURRENTLY_NOW_DATA.goals2026
};

// =========================================================================
// 7. HISTÓRICO DO SISTEMA (SYSTEM.LOG) & MARCOS REAIS DA TRAJETÓRIA
// =========================================================================
export interface SystemHistoryEvent {
  year: string;
  tag: string;
  title: string;
  category: 'EXPERIÊNCIA' | 'FORMAÇÃO' | 'PROJETOS' | 'CERTIFICAÇÕES' | 'MARCO';
  description: string;
  details?: string[];
}

export const SYSTEM_HISTORY_EVENTS: SystemHistoryEvent[] = [
  {
    year: '2019',
    tag: 'BOOT_01',
    title: 'Início da Atuação no Exército Brasileiro',
    category: 'EXPERIÊNCIA',
    description: 'Ingresso nas rotinas administrativas e operacionais da 11ª Região Militar (Seção do Serviço de Veteranos e Pensionistas).',
    details: [
      'Confecção diária do aditamento oficial da SVP',
      'Conferência rigorosa de processos e cumprimento de prazos'
    ]
  },
  {
    year: 'GRADUAÇÃO',
    tag: 'CORE_EDU',
    title: 'Superior em Logística Concluído',
    category: 'FORMAÇÃO',
    description: 'Conclusão da graduação com ênfase em Supply Chain, armazenagem e gestão de estoques (Centro Universitário IESB).',
    details: [
      'Cadeia de suprimentos e transporte logístico',
      'Otimização de fluxos operacionais e movimentação de materiais'
    ]
  },
  {
    year: 'ESPECIALIZAÇÕES',
    tag: 'POST_GRAD',
    title: 'MBAs Executivos em Finanças, Supply Chain & Gestão Pública',
    category: 'FORMAÇÃO',
    description: 'Múltiplas especializações concluídas voltadas a finanças corporativas, cadeia de suprimentos e conformidade governamental.',
    details: [
      'MBA em Finanças e Controladoria',
      'MBA em Logística e Supply Chain Management',
      'MBA em Gestão Pública'
    ]
  },
  {
    year: 'LEGISLAÇÃO',
    tag: 'COMPLIANCE',
    title: 'Pós-Graduação em Licitações e Contratos',
    category: 'FORMAÇÃO',
    description: 'Aprofundamento na legislação de contratações públicas, fiscalização e elaboração de contratos administrativos.',
    details: [
      'Domínio das normativas de licitações públicas',
      'Gestão de conformidade documental'
    ]
  },
  {
    year: 'CAPACITAÇÃO',
    tag: 'AI_SKILL',
    title: 'Operador de Computador com IA (SENAI 160h)',
    category: 'CERTIFICAÇÕES',
    description: 'Formação profissional em aplicação prática de Inteligência Artificial, Engenharia de Prompt e automação digital.',
    details: [
      'Engenharia de Prompt estruturada',
      'Integração de ferramentas de produtividade e IA'
    ]
  },
  {
    year: '2026',
    tag: 'PORTFOLIO_CORE',
    title: 'MATEUS OS 2000 ➔ MATEUS SPACE 2026',
    category: 'PROJETOS',
    description: 'Lançamento do ecossistema digital conectando a era clássica dos computadores de 2000 ao universo tech-noir de 2026.',
    details: [
      'Integração de duas épocas com continuidade de dados',
      'M-BOT Companion e Travel temporal com partículas'
    ]
  }
];

// =========================================================================
// 8. PROPRIEDADES DO SISTEMA (OS 00 / RETRO PROPERTIES)
// =========================================================================
export const SYSTEM_PROPERTIES_DATA = {
  systemName: 'MATEUS OS 00',
  edition: 'Personal Portfolio Edition',
  userName: 'Mateus Araujo',
  userStatus: 'ONLINE',
  version: '00.2026-STABLE',
  mode: 'RETRO (ERA 2000)',
  mBotStatus: 'ONLINE & ATIVO',
  framework: 'React + TypeScript + Tailwind',
  storageEngine: 'Local Memory & Firestore Realtime',
  location: 'Brasil',
  focusAreas: 'Logística • Gestão • Finanças • Inteligência Artificial'
};

// =========================================================================
// 9. EASTER EGGS DISCRETOS (Textos Curtos e Autênticos)
// =========================================================================
export const EASTER_EGG_FILES = [
  {
    name: 'README.TXT',
    title: 'README.TXT — Boas-Vindas ao Mateus OS',
    content: `=====================================================
MATEUS OS 00 — PERSONAL PORTFOLIO EDITION
=====================================================

Bem-vindo ao meu ambiente digital interativo!

Este sistema foi construído para apresentar minha trajetória 
em Logística, Gestão Pública, Finanças e Tecnologia através 
de duas perspectivas temporais:

[2000] MATEUS OS 00  -> A era clássica do desktop, nostálgica e exploratória.
[2026] MATEUS SPACE  -> A evolução tecnológica, limpa e orbital.

Você pode explorar livremente as pastas, Meu Computador, 
a Lixeira e interagir com o M-BOT.

Dica: Quando estiver pronto para conhecer o futuro, 
abra o TRAVEL.EXE ou converse com o M-BOT.

-- Mateus Araujo`
  },
  {
    name: 'SYSTEM.LOG',
    title: 'SYSTEM.LOG — Registro de Eventos do Sistema',
    content: `[2019-03-01] INICIALIZANDO ATIVIDADES ADMINISTRATIVAS (EB / 11ª RM)
[2019-2025] CONFERENCIA DOCUMENTAL E ADITAMENTOS REGIMENTAIS DIARIOS
[2024-11-20] CONCLUSAO GRADUACAO SUPERIOR EM LOGISTICA (IESB)
[2025-05-15] ESPECIALIZACOES: MBAS FINANCAS, SUPPLY CHAIN & GESTAO PUBLICA
[2025-09-10] POS-GRADUACAO EM LICITACOES E CONTRATOS ADMINISTRATIVOS
[2025-12-01] CAPACITACAO: OPERADOR DE COMPUTADOR COM IA (SENAI 160H)
[2026-01-01] BOOT DO SISTEMA: MATEUS OS 00 CONECTADO AO SPACE 2026
[STATUS] TODOS OS SUBSISTEMAS OPERANDO EM CONFORMIDADE.`
  },
  {
    name: 'ABOUT_OS.TXT',
    title: 'ABOUT_OS.TXT — Filosofia do Sistema',
    content: `MATEUS OS 00 // NOTAS DE CONCEPÇÃO
-----------------------------------------------------
Dois mundos, o mesmo profissional.

O OS 00 homenageia a era de ouro da computação pessoal, 
onde cada janela, ícone e arquivo transmitia a sensação 
de exploração autêntica.

No Space 2026, os mesmos conceitos amadurecem:
- Meu Computador torna-se Data Core
- O Histórico torna-se Timeline Orbital
- Os Projetos tornam-se Project Explorer
- A data atual torna-se Missão Atual

Simplicidade na forma, rigor no conteúdo.`
  },
  {
    name: 'OLD_PROJECTS.TXT',
    title: 'OLD_PROJECTS.TXT — Notas de Rascunho',
    content: `ARQUIVO DE PROJETOS & ESTUDOS PRELIMINARES
-----------------------------------------------------
- Estruturação de planilhas de controle e conferência de expedientes
- Modelos de padronização para aditamentos oficiais
- Estudos de Engenharia de Prompt para classificação de dados
- Protótipo do M-BOT em matriz de pontos 16x16`
  },
  {
    name: 'HELLO.TXT',
    title: 'HELLO.TXT — Saudação do M-BOT',
    content: `(o_o) // Olá, visitante!

Eu sou o M-BOT. Estou aqui para te acompanhar na exploração
deste portfólio. Se quiser ver algum projeto, conhecer o Mateus
ou viajar para o ano de 2026, é só clicar em mim no canto superior!`
  }
];

// Initial Trash File
export const INITIAL_TRASH_FILE = {
  id: 'trash-readme-old',
  name: 'README_OLD.TXT',
  desc: 'Rascunho descartado do sistema original (2 KB)',
  origin: 'retro' as const,
  deletedAt: Date.now() - 86400000,
  type: 'file' as const
};

// =========================================================================
// 10. CURIOSIDADES "✦ VOCÊ SABIA?" (Por Época e Factualmente Corretas)
// =========================================================================
export const DID_YOU_KNOW_RETRO = [
  {
    id: 1,
    title: 'Armazenamento no ano 2000 vs. Hoje',
    fact: 'Em 2000, um disco rígido de 20 GB era considerado de ponta e custava alto. Hoje, sistemas modernos processam fluxos de dados massivos em tempo real.'
  },
  {
    id: 2,
    title: 'A Era do Windows 2000',
    fact: 'Lançado no início de 2000, o Windows 2000 estabeleceu a base de estabilidade e segurança da arquitetura NT para ambientes corporativos.'
  },
  {
    id: 3,
    title: 'Nascimento do MP3 e Napster',
    fact: 'No início dos anos 2000, o compartilhamento de arquivos MP3 revolucionou para sempre o consumo de áudio digital no mundo.'
  },
  {
    id: 4,
    title: 'Logística e Código de Barras',
    fact: 'A padronização dos códigos de barras e os primeiros softwares WMS nos anos 2000 revolucionaram a acuracidade dos inventários logísticos.'
  },
  {
    id: 5,
    title: 'M-BOT 00: Origem',
    fact: 'O M-BOT nasceu com visual pixelado e circuitos vintage para guiar você pelas pastas e arquivos deste portfólio.'
  }
];

export const DID_YOU_KNOW_SPACE = [
  {
    id: 101,
    title: 'Supply Chain 4.0 & Automação',
    fact: 'Na era 2026, a rastreabilidade em tempo real e algoritmos preditivos transformam a eficiência da cadeia de suprimentos e reduzem prazos operacionais.'
  },
  {
    id: 102,
    title: 'Engenharia de Prompt Estruturada',
    fact: 'A formulação precisa de contexto e restrições permite que modelos de linguagem executem tarefas analíticas complexas com alta fidelidade.'
  },
  {
    id: 103,
    title: 'Conformidade e Governança Pública',
    fact: 'A digitalização dos processos licitatórios e contratos públicos assegura transparência, economicidade e auditabilidade contínua.'
  },
  {
    id: 104,
    title: 'Data Core: Continuidade 2000 → 2026',
    fact: 'O Data Core no Space 2026 consome exatamente os mesmos dados de Meu Computador do OS 00, demonstrando a evolução de apresentação da informação.'
  },
  {
    id: 105,
    title: 'M-BOT 26: Evolução Tecnológica',
    fact: 'No Space 2026, o M-BOT evoluiu para um modelo de metal refinado com antena luminosa e iluminação tech-noir, mantendo a mesma essência de guia.'
  }
];

export const DID_YOU_KNOW_FACTS = [...DID_YOU_KNOW_RETRO, ...DID_YOU_KNOW_SPACE];

export const TERMINAL_HELP_TEXT = `
MATEUS ARAUJO PORTFOLIO OS v2026
Comandos disponíveis:

  help         - Exibe este menu de ajuda
  about        - Exibe o perfil completo de Mateus Araujo
  experience   - Trajetória no Exército Brasileiro (11ª Região Militar)
  education    - Formação acadêmica (Logística, MBAs e Pós-Graduação)
  courses      - Cursos adicionais (SENAI 160h, IFRS, ENAP, DigiMaster)
  skills       - Competências em Logística, Gestão, Finanças, Adm. Pública e IA
  projects     - Trabalho Selecionado (MATEUS OS 2000 / SPACE 2026)
  contact      - Canais de contato direto (LinkedIn, GitHub, Email, WhatsApp)
  now          - Focos atuais e objetivos para 2026
  history      - Exibe o histórico do sistema (SYSTEM.LOG)
  clear        - Limpa a tela do terminal
`;
