// ============================================
// Guardian News - Shared Types
// Source unique de vérité pour les modèles
// ============================================

// Severity levels
export type Severity = 'critique' | 'eleve' | 'moyen' | 'faible';

// Threat types
export type ThreatType = 
  | 'phishing'
  | 'ransomware'
  | 'malware'
  | 'data_leak'
  | 'vuln'
  | 'scam'
  | 'apt'
  | 'ddos'
  | 'other';

// Technical level
export type ThreatLevel = 'debutant' | 'intermediaire' | 'avance';

// Target audience
export type TargetAudience = 'particuliers' | 'entreprises' | 'secteur_public' | 'tous';

// Translations interface
export interface Translations {
  fr?: {
    title?: string;
    tldr?: string[];
    impact?: string;
    actions?: string[];
    prevention?: string[];
  };
}

// News Item - Main model
export interface NewsItem {
  id: string;
  title: string;
  source: string;
  sourceScore?: number;
  url: string;
  published_at: string;
  fetched_at?: string;
  severity: Severity;
  type: ThreatType;
  level: ThreatLevel;
  target: TargetAudience;
  tldr: string[];
  impact: string;
  actions: string[];
  prevention?: string[];
  content?: string;
  url_hash?: string;
  translations?: Translations;
}

// News filters for API queries
export interface NewsFilters {
  severity?: Severity | null;
  type?: ThreatType | null;
  level?: ThreatLevel | null;
  target?: TargetAudience | null;
  search?: string;
}

// Paginated response from API
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

// News API response
export type NewsResponse = PaginatedResponse<NewsItem>;

// Cyber Tension index
export interface CyberTension {
  level: 'critique' | 'eleve' | 'modere' | 'faible';
  label: string;
  score: number;
  reason: string;
  critical_count: number;
  high_count: number;
  recent_threats: string[];
  updated_at: string;
}

// API Result wrapper
export interface ApiResult<T> {
  data?: T;
  error?: ApiError;
  loading: boolean;
}

// API Error
export interface ApiError {
  status: number;
  message: string;
  detail?: string;
}

// Emergency scenario
export interface EmergencyScenario {
  id: string;
  title: string;
  icon: string;
  description: string;
  immediateActions: string[];
  contacts: EmergencyContact[];
  evidence: string[];
  reportLinks: ReportLink[];
  templates?: EmailTemplate[];
}

export interface EmergencyContact {
  name: string;
  phone?: string;
  website?: string;
  description: string;
  icon: string;
}

export interface ReportLink {
  name: string;
  url: string;
  description: string;
}

export interface EmailTemplate {
  title: string;
  type: 'email' | 'complaint' | 'checklist';
  content: string;
}

// User preferences
export interface UserPreferences {
  language: 'fr' | 'en';
  mode: 'public' | 'pro';
  theme: 'dark' | 'light' | 'system';
  notificationsEnabled: boolean;
}

// Helper function to hash filters for cache keys
export function hashFilters(filters: NewsFilters): string {
  const parts: string[] = [];
  if (filters.severity) parts.push(`s:${filters.severity}`);
  if (filters.type) parts.push(`t:${filters.type}`);
  if (filters.level) parts.push(`l:${filters.level}`);
  if (filters.target) parts.push(`a:${filters.target}`);
  if (filters.search) parts.push(`q:${filters.search}`);
  return parts.length > 0 ? parts.join('|') : 'all';
}

// Severity colors for UI
export const SEVERITY_COLORS = {
  critique: '#F85149',
  eleve: '#F0883E',
  moyen: '#D29922',
  faible: '#3FB950',
} as const;

// Level colors for UI
export const LEVEL_COLORS = {
  debutant: '#7EE787',
  intermediaire: '#F0883E',
  avance: '#F85149',
} as const;

// Severity labels (French)
export const SEVERITY_LABELS: Record<Severity, string> = {
  critique: 'Critique',
  eleve: 'Élevé',
  moyen: 'Moyen',
  faible: 'Faible',
};

// Level labels (French)
export const LEVEL_LABELS: Record<ThreatLevel, string> = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  avance: 'Avancé',
};

// Type labels (French)
export const TYPE_LABELS: Record<ThreatType, string> = {
  phishing: 'Phishing',
  ransomware: 'Ransomware',
  malware: 'Malware',
  data_leak: 'Fuite de données',
  vuln: 'Vulnérabilité',
  scam: 'Arnaque',
  apt: 'APT',
  ddos: 'DDoS',
  other: 'Autre',
};
