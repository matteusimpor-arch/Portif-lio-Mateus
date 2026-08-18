import { Project, ExperienceItem, EducationItem, CertificateItem, SkillCategory, CurrentlyNow } from '../types';

export const PROFILE_INFO = {
  name: 'MATEUS ARAUJO SANTOS',
  title: 'PROFISSIONAL DE LOGÍSTICA, GESTÃO E TECNOLOGIA',
  headline: 'Logística • Gestão • Finanças • Supply Chain • Administração Pública • Tecnologia • Inteligência Artificial • Engenharia de Prompt',
  location: 'Brasil',
  email: 'matteus.impor@gmail.com',
  linkedin: 'https://linkedin.com/in/mateus-araujo',
  github: 'https://github.com/mateus-araujo',
  subtitle: 'Profissional com formação em Logística e especializações voltadas para Gestão, Finanças, Supply Chain e Administração Pública, atualmente direcionando sua trajetória para tecnologia, Inteligência Artificial e Engenharia de Prompt.',
  bioShort: 'Minha trajetória profissional e acadêmica é construída na interseção entre gestão, logística e tecnologia. Ao longo da minha formação, desenvolvi conhecimentos em processos, organização, planejamento, finanças, Supply Chain e administração pública, enquanto amplio continuamente minha atuação em Inteligência Artificial, Engenharia de Prompt e soluções digitais.',
  bioLong: `Minha trajetória profissional e acadêmica é construída na interseção entre gestão, logística e tecnologia. Ao longo da minha formação, desenvolvi conhecimentos em processos, organização, planejamento, finanças, Supply Chain e administração pública, enquanto amplio continuamente minha atuação em Inteligência Artificial, Engenharia de Prompt e soluções digitais.

Minha abordagem conecta conhecimentos de diferentes áreas para criar soluções práticas. Meu foco em Inteligência Artificial está principalmente na aplicação prática: transformar ideias, processos e necessidades reais em soluções digitais utilizando IA, automação e Engenharia de Prompt.`,
  featuredQuote: 'Gestão para entender o problema. Tecnologia para transformar a solução. Inteligência Artificial para ampliar as possibilidades.',
  howIThinkQuote: 'Busco transformar conhecimento em soluções. Minha abordagem combina visão de processos, gestão e tecnologia para encontrar formas mais inteligentes, eficientes e práticas de resolver problemas.',
  howIThinkSteps: ['INPUT', 'ANALYSIS', 'STRATEGY', 'TECHNOLOGY', 'SOLUTION'],
  nextLevelObjective: 'Meu objetivo é continuar evoluindo na interseção entre gestão, tecnologia e Inteligência Artificial, desenvolvendo soluções que possam melhorar processos, facilitar o acesso ao conhecimento e transformar ideias em aplicações práticas.',
  transitionFlow: [
    'LOGISTICS',
    'MANAGEMENT',
    'FINANCE',
    'SUPPLY CHAIN',
    'PUBLIC ADMINISTRATION',
    'TECHNOLOGY',
    'ARTIFICIAL INTELLIGENCE'
  ],
  stats: [
    { value: '+1', label: 'Graduação Concluída' },
    { value: '+4', label: 'Especializações / MBAs e Formações Avançadas' },
    { value: '+7', label: 'Anos de Experiência no Exército Brasileiro' },
    { value: '+Diversos', label: 'Projetos Digitais & Soluções' },
    { value: '★', label: 'Experiência Multidisciplinar' }
  ]
};

export const PROJECTS_DATA: Project[] = [
  {
    id: 'proj-1',
    name: 'PromptMatrix AI Studio',
    tagline: 'Laboratório avançado de Engenharia de Prompt e Otimização de LLMs',
    description: 'Ambiente interativo desenvolvido para testes, estruturação de prompts sintáticos com poucas amostras (few-shot), avaliação de contexto e otimização de instruções para modelos LLM.',
    objective: 'Capacitar a estruturação de prompts para aplicações corporativas, reduzindo consumo de tokens e melhorando a assertividade das respostas.',
    technologies: ['React', 'TypeScript', 'Gemini API', 'Tailwind CSS', 'Prompt Engineering'],
    category: 'AI PROJECTS',
    status: 'Destaque',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    link: '#',
    github: 'https://github.com/mateus-araujo/prompt-matrix-studio',
    demoAvailable: true,
    features: [
      'Estruturação de prompts sintáticos e personas com foco prático',
      'Modelagem de contexto, instrução do sistema e formatos de saída (JSON/Markdown)',
      'Aprimoramento iterativo de comandos e prompts para sistemas',
      'Biblioteca de templates reutilizáveis'
    ]
  },
  {
    id: 'proj-2',
    name: 'LogiFlow Supply Chain Control',
    tagline: 'Dashboard de Gestão de Estoque, Processos e Indicadores Logísticos',
    description: 'Sistema web para visualização de movimentação de materiais, controle de níveis de estoque de segurança, cálculo de Lead Time e acompanhamento de processos logísticos.',
    objective: 'Unir a visão prática de Supply Chain à tecnologia para redução de gargalos e acompanhamento eficiente de indicadores (KPIs).',
    technologies: ['TypeScript', 'Recharts', 'Express', 'Tailwind CSS', 'Logística'],
    category: 'LOGISTICS',
    status: 'Concluído',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop',
    link: '#',
    github: 'https://github.com/mateus-araujo/logiflow-control',
    demoAvailable: true,
    features: [
      'Acompanhamento de indicadores chave (OTIF, Giro de Estoque, Curva ABC)',
      'Controle de estoque mínimo e pontos de pedido',
      'Organização e visibilidade do fluxo operacional'
    ]
  },
  {
    id: 'proj-3',
    name: 'OpsAdmin Suite',
    tagline: 'Plataforma de Padronização e Gestão de Documentos Operacionais',
    description: 'Solução digital voltada para a organização, catalogação e auditoria de processos administrativos, instruções de serviço e rotinas institucionais.',
    objective: 'Inspirado nos fundamentos de administração pública e governança para garantir conformidade documental e rastreabilidade.',
    technologies: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Gestão'],
    category: 'MANAGEMENT',
    status: 'Concluído',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop',
    link: '#',
    github: 'https://github.com/mateus-araujo/ops-admin-suite',
    demoAvailable: true,
    features: [
      'Organização rápida de rotinas e acompanhamento de relatórios operacionais',
      'Estruturação clara de responsabilidades e fluxos administrativos',
      'Padronização de documentação oficial e processos de conformidade'
    ]
  },
  {
    id: 'proj-4',
    name: 'AutoDoc AI Agent',
    tagline: 'Automação inteligente de organização de dados e resumos executivos',
    description: 'Ferramenta baseada em IA e automação para classificação de informações, síntese de documentos e facilitação do fluxo de trabalho diário.',
    objective: 'Eliminar tarefas repetitivas na triagem e processamento de informações administrativas.',
    technologies: ['Python', 'LLM Integration', 'FastAPI', 'Automation', 'IA'],
    category: 'AUTOMATION',
    status: 'Destaque',
    image: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=800&auto=format&fit=crop',
    link: '#',
    github: 'https://github.com/mateus-araujo/autodoc-ai-agent',
    demoAvailable: true,
    features: [
      'Extração organizada de dados e estrutura de textos',
      'Geração de resumos executivos adaptados para a gestão',
      'Fluxos automatizados de notificação e apoio à decisão'
    ]
  },
  {
    id: 'proj-5',
    name: 'EduAI Prompt & Content Hub',
    tagline: 'Desenvolvimento de Materiais Didáticos, Apostilas e Treinamentos em IA',
    description: 'Portal e biblioteca de conteúdos didáticos focados na capacitação prática em Inteligência Artificial, Engenharia de Prompt, ferramentas digitais (Canva, CapCut, Gmail) e produtividade.',
    objective: 'Transformar conhecimentos técnicos e operacionais em materiais didáticos acessíveis e apostilas de treinamento.',
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Educação', 'Canva', 'CapCut'],
    category: 'EDUCATION',
    status: 'Em Desenvolvimento',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
    link: '#',
    github: 'https://github.com/mateus-araujo/edu-ai-prompt',
    demoAvailable: true,
    features: [
      'Guias didáticos de Engenharia de Prompt e ferramentas digitais',
      'Apostilas para capacitação prática em rotinas administrativas e digitais',
      'Treinamentos acessíveis conectando tecnologia e ambiente de trabalho'
    ]
  }
];

export const EXPERIENCE_DATA: ExperienceItem[] = [
  {
    id: 'exp-1',
    period: '2019 — 2027',
    role: 'Cabo / Militar Temporário',
    organization: 'Exército Brasileiro — 11ª Região Militar',
    location: 'Brasil',
    badge: 'Atuação Institucional',
    description: [
      'Atuação voltada para organização, disciplina, responsabilidade e cumprimento rigoroso de procedimentos regimentais.',
      'Execução e acompanhamento de rotinas administrativas, controle de informações e gerenciamento de demandas de unidade.',
      'Elaboração, controle e acompanhamento de documentos administrativos e processos oficiais com foco na conformidade.',
      'Trabalho em equipe, comunicação assertiva e atendimento a diretrizes com alto padrão de ética e compromisso.'
    ],
    skillsUsed: ['Gestão Administrativa', 'Documentação Oficial', 'Organização de Processos', 'Trabalho em Equipe', 'Disciplina Operacional'],
    highlights: [
      'Experiência consolidada em rotinas administrativas e controle rigoroso de prazos e informações institucionais',
      'Reconhecimento pela dedicação, responsabilidade e condução de tarefas sob diretrizes formais'
    ]
  }
];

export const EDUCATION_DATA: EducationItem[] = [
  {
    id: 'edu-1',
    year: '2023 — 2025',
    degree: 'TECNOLOGIA EM LOGÍSTICA',
    institution: 'Graduação Concluída em Julho de 2025',
    status: 'Concluído',
    type: 'Graduação',
    description: 'Formação com foco em gestão da cadeia de suprimentos, logística de transportes e armazenagem, gestão de estoques e otimização de fluxos operacionais.',
    highlights: ['Graduação concluída em Julho de 2025.']
  },
  {
    id: 'edu-2',
    year: '2025 — Em Andamento',
    degree: 'MBA EM FINANÇAS E CONTROLADORIA',
    institution: 'Pós-Graduação / MBA',
    status: 'Em Andamento',
    type: 'MBA / Pós',
    description: 'Especialização em andamento com foco em planejamento financeiro, gestão de custos, análise orçamentária e controladoria estratégica.',
    highlights: ['Formação avançada voltada à gestão financeira corporativa.']
  },
  {
    id: 'edu-3',
    year: '2024 — 2025',
    degree: 'MBA EM LOGÍSTICA E SUPPLY CHAIN MANAGEMENT',
    institution: 'Pós-Graduação Concluída',
    status: 'Concluído',
    type: 'MBA / Pós',
    description: 'Aprofundamento na gestão integrada da cadeia de suprimentos, estratégias de estocagem, redes de distribuição e otimização de processos logísticos.',
    highlights: ['Formação executiva concluída.']
  },
  {
    id: 'edu-4',
    year: '2024',
    degree: 'PÓS-GRADUAÇÃO EM SUPPLY CHAIN',
    institution: 'Pós-Graduação Concluída',
    status: 'Concluído',
    type: 'MBA / Pós',
    description: 'Especialização focada nos elos da cadeia de suprimentos, estratégias de compras, armazenagem e nível de serviço ao cliente.',
    highlights: ['Formação concluída.']
  },
  {
    id: 'edu-5',
    year: '2024',
    degree: 'PÓS-GRADUAÇÃO EM LICITAÇÕES E CONTRATOS ADMINISTRATIVOS',
    institution: 'Pós-Graduação Concluída',
    status: 'Concluído',
    type: 'MBA / Pós',
    description: 'Formação voltada aos fundamentos de licitações, contratações públicas e contratos administrativos conforme a legislação vigente.',
    highlights: ['Especialização nos princípios e práticas do setor público.']
  },
  {
    id: 'edu-6',
    year: '2024',
    degree: 'MBA / FORMAÇÃO EM GESTÃO PÚBLICA',
    institution: 'Pós-Graduação / Especialização Concluída',
    status: 'Concluído',
    type: 'MBA / Pós',
    description: 'Capacitação em administração pública, governança, políticas públicas e gestão de recursos e rotinas no âmbito governamental.',
    highlights: ['Formação em Gestão Pública.']
  }
];

export const CERTIFICATES_DATA: CertificateItem[] = [
  {
    id: 'cert-1',
    name: 'Contabilidade Básica',
    hours: '30h',
    issuer: 'Curso Livre de Capacitação',
    year: '2024',
    status: 'Concluído'
  },
  {
    id: 'cert-2',
    name: 'Gestão Financeira',
    hours: '40h',
    issuer: 'Curso Livre de Capacitação',
    year: '2024',
    status: 'Concluído'
  },
  {
    id: 'cert-3',
    name: 'Treinamento em Ferramentas Digitais (Canva, CapCut, Gmail & Produtividade)',
    hours: '20h',
    issuer: 'Capacitação e Desenvolvimento Prático',
    year: '2025',
    status: 'Concluído'
  }
];

export const SKILLS_DATA: SkillCategory[] = [
  {
    category: 'TECHNOLOGY',
    code: 'TECHNOLOGY',
    icon: 'Cpu',
    skills: [
      { name: 'Inteligência Artificial', level: 92, description: 'Aplicação prática de IA para otimização de processos e produtividade', tags: ['IA Generativa', 'LLMs', 'Modelos de Linguagem'] },
      { name: 'Engenharia de Prompt', level: 95, description: 'Estruturação de prompts, definição de contexto, requisitos e instruções detalhadas', tags: ['Prompts Estruturados', 'Contexto', 'Instruções', 'Sistemas'] },
      { name: 'Automação', level: 88, description: 'Desenvolvimento de fluxos automatizados e simplificação de rotinas', tags: ['Fluxos', 'Produtividade', 'Automação de Tarefas'] },
      { name: 'Ferramentas Digitais & Soluções', level: 90, description: 'Criação de soluções digitais e domínio de ferramentas modernas', tags: ['Soluções Web', 'Ferramentas Digitais', 'Plataformas'] }
    ]
  },
  {
    category: 'MANAGEMENT',
    code: 'MANAGEMENT',
    icon: 'Briefcase',
    skills: [
      { name: 'Gestão', level: 92, description: 'Visão sistêmica, alinhamento estratégico e condução de objetivos', tags: ['Gestão de Demandas', 'Gargalos', 'Soluções'] },
      { name: 'Planejamento', level: 90, description: 'Elaboração de metas, cronogramas e estruturação de ações', tags: ['Planejamento Operacional', 'Estratégia'] },
      { name: 'Organização', level: 95, description: 'Padronização de rotinas e controle rigoroso de informações', tags: ['Metodologia', 'Estrutura', 'Controle'] },
      { name: 'Processos', level: 92, description: 'Mapeamento de fluxos, análise de procedimentos e melhoria contínua', tags: ['Análise de Fluxos', 'Conformidade', 'Procedimentos'] }
    ]
  },
  {
    category: 'LOGISTICS',
    code: 'LOGISTICS',
    icon: 'Truck',
    skills: [
      { name: 'Logística', level: 94, description: 'Gestão de movimentação, armazenagem e fluxo de informações', tags: ['Operações Logísticas', 'Armazenagem', 'Fluxos'] },
      { name: 'Supply Chain', level: 92, description: 'Visão integrada da cadeia de suprimentos e relacionamento operacional', tags: ['Cadeia de Suprimentos', 'Suprimentos', 'Indicadores'] },
      { name: 'Gestão de Operações', level: 90, description: 'Acompanhamento do nível de serviço e eficiência nas rotinas', tags: ['Nível de Serviço', 'Lead Time', 'Controle'] }
    ]
  },
  {
    category: 'FINANCE',
    code: 'FINANCE',
    icon: 'Award',
    skills: [
      { name: 'Gestão Financeira', level: 88, description: 'Fundamentos de análise financeira, planejamento e orçamentos', tags: ['Gestão Financeira', 'Orçamento', 'Planejamento'] },
      { name: 'Finanças', level: 85, description: 'Compreensão de fluxos financeiros, custos e controles', tags: ['Análise de Custos', 'Finanças Corporativas'] },
      { name: 'Controladoria', level: 85, description: 'Especialização em andamento voltada ao acompanhamento e controle', tags: ['Controladoria', 'Indicadores Financeiros'] }
    ]
  },
  {
    category: 'PUBLIC ADMINISTRATION',
    code: 'PUBLIC ADMINISTRATION',
    icon: 'ShieldCheck',
    skills: [
      { name: 'Gestão Pública', level: 90, description: 'Princípios da administração pública, governança e rotinas institucionais', tags: ['Administração Pública', 'Normativas', 'Governança'] },
      { name: 'Licitações', level: 88, description: 'Fundamentos e princípios aplicados às compras públicas', tags: ['Licitações Públicas', 'Processos Licitatórios'] },
      { name: 'Contratos Administrativos', level: 88, description: 'Acompanhamento e princípios na gestão de contratos públicos', tags: ['Contratos', 'Acompanhamento', 'Legislação'] }
    ]
  },
  {
    category: 'EDUCATION',
    code: 'EDUCATION',
    icon: 'GraduationCap',
    skills: [
      { name: 'Criação de Materiais', level: 92, description: 'Desenvolvimento de apostilas, guias práticos e materiais didáticos', tags: ['Apostilas', 'Conteúdo Didático', 'Canva'] },
      { name: 'Treinamentos', level: 90, description: 'Capacitação em IA, Engenharia de Prompt e ferramentas digitais', tags: ['Capacitação', 'Treinamento Prático', 'Educação'] },
      { name: 'Conteúdo Didático', level: 92, description: 'Transformação de conhecimentos técnicos em materiais acessíveis', tags: ['Didática', 'Ferramentas Digitais', 'CapCut', 'Gmail'] }
    ]
  }
];

export const EDUCATIONAL_MATERIALS_INFO = {
  title: 'EDUCAÇÃO & COMPARTILHAMENTO DE CONHECIMENTO',
  subtitle: 'Transformando conhecimento técnico em materiais didáticos acessíveis',
  description: 'Interesse contínuo na criação de apostilas, cursos, treinamentos em Inteligência Artificial, Engenharia de Prompt e uso de ferramentas digitais no dia a dia.',
  items: [
    { title: 'Criação de Apostilas & Guias Práticos', desc: 'Estruturação de materiais didáticos claros para aprendizado rápido.' },
    { title: 'Treinamento em IA & Engenharia de Prompt', desc: 'Capacitação no uso consciente e eficiente de modelos de linguagem para produtividade.' },
    { title: 'Ferramentas Digitais de Produtividade', desc: 'Aplicações práticas com Canva, CapCut, Gmail e ecossistema digital no ambiente de trabalho.' },
    { title: 'Conteúdo Acessível', desc: 'Tradução de conceitos de gestão e tecnologia em conteúdos instrucionais estruturados.' }
  ]
};

export const CURRENTLY_NOW_DATA: CurrentlyNow = {
  studying: [
    'MBA em Finanças e Controladoria (Em andamento)',
    'Aplicação prática de Inteligência Artificial e Engenharia de Prompt',
    'Automação de processos e integração de soluções digitais'
  ],
  building: [
    'PromptMatrix Studio — Laboratório de testes e refinamento de prompts',
    'Apostilas didáticas e guias práticos sobre uso de IA e ferramentas digitais',
    'Sistemas web interativos para visualização de processos e indicadores'
  ],
  learning: [
    'Engenharia de Prompt aplicada à criação de instruções para sistemas',
    'Integração entre gestão pública, finanças e tecnologias emergentes',
    'Desenvolvimento de conteúdos didáticos acessíveis'
  ],
  designing: [
    'Fluxos automatizados para triagem de informações e documentos',
    'Modelos de prompts estruturados para treinamento em produtividade'
  ],
  goals2026: [
    'Evoluir continuamente na interseção entre gestão, tecnologia e Inteligência Artificial',
    'Desenvolver soluções práticas que melhorem processos e facilitem o acesso ao conhecimento',
    'Expandir a criação de materiais didáticos e treinamentos aplicados'
  ]
};

export const TERMINAL_HELP_TEXT = `
MATEUS ARAUJO PORTFOLIO OS v2026
Comandos disponíveis:

  help         - Exibe este menu de ajuda
  about        - Exibe um resumo sobre Mateus Araujo
  experience   - Lista a trajetória profissional no Exército Brasileiro
  education    - Apresenta a formação acadêmica (Graduação, MBAs e Pós)
  skills       - Mostra as competências (Gestão, Logística, IA, Finanças, Adm. Pública)
  projects     - Lista os projetos em destaque
  contact      - Exibe canais de contato direto
  ai           - Informações sobre competências e aplicação de IA
  logistics    - Resumo de competências em Logística & Supply Chain
  certificates - Lista os cursos e certificações concluídas
  howithink    - Exibe a filosofia de trabalho
  nextlevel    - Mostra o objetivo de evolução profissional
  now          - O que Mateus está desenvolvendo atualmente
  clear        - Limpa o terminal
`;
