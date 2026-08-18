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

// =========================================================================
// 7. CURIOSIDADES "✦ VOCÊ SABIA?" (Rotativas e Factualmente Corretas)
// =========================================================================
export const DID_YOU_KNOW_FACTS = [
  {
    id: 1,
    title: 'Armazenamento no ano 2000 vs. Hoje',
    fact: 'Em 2000, um disco rígido de 20 GB custava mais de $200 dólares. Hoje, sistemas em nuvem processam terabytes em tempo real com alta disponibilidade e inteligência artificial.'
  },
  {
    id: 2,
    title: 'A Era do Windows 2000',
    fact: 'Lançado em fevereiro de 2000, o Windows 2000 Professional foi o primeiro sistema operacional da linha NT a trazer suporte nativo avançado a USB e gerenciamento robusto de multitarefas.'
  },
  {
    id: 3,
    title: 'Nascimento do MP3 e Napster',
    fact: 'O Napster revolucionou a distribuição de música digital em 1999 e 2000, abrindo caminho para o streaming moderno ao demonstrar o poder das redes descentralizadas.'
  },
  {
    id: 4,
    title: 'Logística e Código de Barras',
    fact: 'A padronização dos códigos de barras EAN/UPC e o surgimento dos primeiros sistemas WMS no início dos anos 2000 transformaram radicalmente a acuracidade dos estoques mundiais.'
  },
  {
    id: 5,
    title: 'Clippy: O Assistente Pioneiro',
    fact: 'Clippy (Clippit) foi introduzido no Office 97 e utilizava árvores de decisão bayesianas para tentar prever o que o usuário estava escrevendo e sugerir modelos de documentos.'
  },
  {
    id: 6,
    title: 'MATEUS OS 2000 → SPACE 2026',
    fact: 'A transição cósmica deste portfólio simula a evolução de 26 anos da computação: saindo da interface beveled cinza de 2000 até um palco de partículas em gravidade zero em 2026.'
  }
];

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
  clear        - Limpa a tela do terminal
`;
