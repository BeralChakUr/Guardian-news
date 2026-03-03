// Types for CyberGuard App

export type ThreatLevel = 'debutant' | 'intermediaire' | 'avance';
export type ThreatType = 'phishing' | 'ransomware' | 'malware' | 'data_leak' | 'vuln' | 'scam' | 'social_engineering' | 'fraude';
export type Severity = 'faible' | 'moyen' | 'eleve' | 'critique';
export type Audience = 'particuliers' | 'entreprises' | 'secteur_public' | 'tous';
export type OS = 'ios' | 'android' | 'windows' | 'mac' | 'linux' | 'all';

export interface News {
  id: string;
  title: string;
  source: string;
  sourceIcon?: string;
  date: string;
  level: ThreatLevel;
  threatType: ThreatType;
  severity: Severity;
  audience: Audience;
  tldr: string[];
  impact: string;
  actions: string[];
  details: string;
  url?: string;
  isFavorite?: boolean;
  isReadLater?: boolean;
}

export interface Attack {
  id: string;
  name: string;
  category: string;
  icon: string;
  definition: string;
  example: string;
  signs: string[];
  impacts: string[];
  prevention: string[];
  victimSteps: string[];
  level: ThreatLevel;
  osSpecific?: { os: OS; tips: string[] }[];
}

export interface LearningModule {
  id: string;
  level: number;
  levelName: string;
  title: string;
  description: string;
  icon: string;
  duration: string;
  lessons: Lesson[];
  isCompleted?: boolean;
  progress?: number;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  tips: string[];
  quiz?: Quiz;
  isCompleted?: boolean;
}

export interface Quiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface EmergencyScenario {
  id: string;
  title: string;
  icon: string;
  description: string;
  immediateActions: string[];
  contacts: Contact[];
  evidence: string[];
  reportLinks: { name: string; url: string; description: string }[];
  templates?: Template[];
}

export interface Contact {
  name: string;
  phone?: string;
  website?: string;
  description: string;
  icon: string;
}

export interface Template {
  title: string;
  type: 'email' | 'complaint' | 'checklist';
  content: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  level: ThreatLevel;
  os: OS[];
  category: string;
  icon: string;
  link?: string;
  isFree: boolean;
}

export interface GlossaryItem {
  term: string;
  definition: string;
  category: string;
}

export interface UserProgress {
  completedLessons: string[];
  badges: string[];
  streak: number;
  lastActivity: string;
  totalPoints: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  isUnlocked?: boolean;
}
