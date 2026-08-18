export type ViewMode = 'retro' | 'space' | 'modern';
export type ModernThemeMode = 'dark' | 'light' | 'system';

export type WindowAppId =
  | 'welcome'
  | 'about'
  | 'projects'
  | 'skills'
  | 'now'
  | 'contact'
  | 'resume'
  | 'paint'
  | 'quiz'
  | 'clippy'
  | 'games'
  | 'aims'
  | 'settings'
  | 'napster'
  | 'nostalgia'
  | 'timetravel'
  | 'trash'
  | 'logistics'
  | 'experience'
  | 'education'
  | 'terminal'
  | 'experiments';

export interface WindowState {
  id: WindowAppId;
  title: string;
  iconName: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DesktopIcon {
  id: WindowAppId;
  title: string;
  iconName: string;
  category?: string;
  badge?: string;
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  objective: string;
  technologies: string[];
  category: 'AI PROJECTS' | 'WEB PROJECTS' | 'AUTOMATION' | 'EDUCATION' | 'LOGISTICS' | 'MANAGEMENT' | 'IA' | 'Logística' | 'Gestão' | 'Automação' | 'Educação';
  status: 'Concluído' | 'Em Desenvolvimento' | 'Destaque';
  image: string;
  link?: string;
  github?: string;
  demoAvailable: boolean;
  features: string[];
}

export interface ExperienceItem {
  id: string;
  period: string;
  role: string;
  organization: string;
  location: string;
  badge?: string;
  description: string[];
  skillsUsed: string[];
  highlights: string[];
}

export interface EducationItem {
  id: string;
  year: string;
  degree: string;
  institution: string;
  status: 'Concluído' | 'Em Andamento';
  type: 'Graduação' | 'MBA / Pós' | 'Certificação' | 'Curso';
  description: string;
  highlights?: string[];
}

export interface CertificateItem {
  id: string;
  name: string;
  hours?: string;
  issuer: string;
  year: string;
  status: string;
}

export interface SkillCategory {
  category: string;
  code: 'TECHNOLOGY' | 'MANAGEMENT' | 'LOGISTICS' | 'FINANCE' | 'PUBLIC ADMINISTRATION' | 'EDUCATION';
  icon: string;
  skills: {
    name: string;
    level: number; // 0-100
    description: string;
    tags: string[];
  }[];
}

export interface CurrentlyNow {
  studying: string[];
  building: string[];
  learning: string[];
  designing: string[];
  goals2026: string[];
}

export interface ThemeConfig {
  mode: 'dark' | 'retro90s' | 'cyberpunk' | 'light';
  wallpaper:
    | 'retro-computer'
    | 'pixel-art'
    | 'space'
    | 'cyber'
    | '90s'
    | 'mateus-os'
    | 'tech'
    | 'classic-teal'
    | 'retro-grid'
    | 'matrix'
    | 'minimal-slate';
  enableScanlines: boolean;
  enableSound: boolean;
  enableAnimations: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'system';
  read?: boolean;
}

