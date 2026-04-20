import { apiRequest } from './apiClient';

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  published_at: string;
  severity: 'critique' | 'eleve' | 'moyen' | 'faible';
  threat_type: string;
  level: 'debutant' | 'intermediaire' | 'avance';
  tldr: string[];
  impact: string;
  actions: string[];
  content?: string;
  country?: string;
  language?: string;
  priority?: number;
}

export interface NewsResponse {
  items: NewsItem[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface CyberTension {
  level: string;
  score: number;
  reason: string;
  critical_count: number;
  high_count: number;
  recent_threats: string[];
  updated_at: string;
}

export interface NewsFilters {
  severity?: string;
  type?: string;
  level?: string;
  search?: string;
  country?: string;
  date_from?: string;
  date_to?: string;
}

export async function getNews(
  page: number = 1,
  pageSize: number = 15,
  filters: NewsFilters = {}
): Promise<NewsResponse> {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('page_size', String(pageSize));
  
  if (filters.severity) params.set('severity', filters.severity);
  if (filters.type) params.set('type', filters.type);
  if (filters.level) params.set('level', filters.level);
  if (filters.search) params.set('search', filters.search);
  if (filters.country) params.set('country', filters.country);
  if (filters.date_from) params.set('date_from', filters.date_from);
  if (filters.date_to) params.set('date_to', filters.date_to);
  
  return apiRequest<NewsResponse>(`/api/news?${params.toString()}`);
}

export async function getNewsById(id: string): Promise<NewsItem> {
  return apiRequest<NewsItem>(`/api/news/${id}`);
}

export async function getTension(): Promise<CyberTension> {
  return apiRequest<CyberTension>('/api/news/tension');
}

// AI Summary Types
export interface AISummaryItem {
  article_id: string;
  title_fr: string;
  summary: string;
  threat_type: string;
  severity: string;
  source: string;
  link: string;
  key_info?: string;
  action?: string;
}

export interface AISummaryResponse {
  mode: string;
  generated_at: string;
  items: AISummaryItem[];
  global_summary: string;
}

export async function getAISummary(
  mode: 'simple' | 'executive' | 'analyst' = 'simple',
  limit: number = 5
): Promise<AISummaryResponse> {
  return apiRequest<AISummaryResponse>('/api/news/ai-summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, limit }),
  });
}

// Dashboard Types
export interface DashboardMetrics {
  threat_level: string;
  score: number;
  active_alerts: number;
  critical_vulnerabilities: number;
  monitored_sources: number;
}

export interface RadarCategory {
  name: string;
  value: number;
}

export interface RadarResponse {
  categories: RadarCategory[];
}

export interface TimelineEvent {
  id: string;
  title: string;
  source: string;
  severity: string;
  threat_type: string;
  timestamp: string;
  description: string;
  link: string;
}

export interface TimelineResponse {
  events: TimelineEvent[];
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  return apiRequest<DashboardMetrics>('/api/dashboard/metrics');
}

export async function getDashboardRadar(): Promise<RadarResponse> {
  return apiRequest<RadarResponse>('/api/dashboard/radar');
}

export async function getDashboardTimeline(): Promise<TimelineResponse> {
  return apiRequest<TimelineResponse>('/api/dashboard/timeline');
}

// Grouped News Types (France vs International)
export interface GroupedNewsResponse {
  france: NewsItem[];
  international: NewsItem[];
  france_total: number;
  international_total: number;
}

export async function getGroupedNews(limit: number = 10): Promise<GroupedNewsResponse> {
  return apiRequest<GroupedNewsResponse>(`/api/dashboard/news-grouped?limit=${limit}`);
}

// Application Version
export interface VersionInfo {
  version: string;
  name: string;
  api_version: string;
}

export async function getVersion(): Promise<VersionInfo> {
  return apiRequest<VersionInfo>('/api/dashboard/version');
}

// V4 - Dashboard Summary (KPIs)
export interface DashboardSummary {
  kpis: {
    total_articles: number;
    critical_alerts: number;
    active_sources: number;
    most_targeted_sector: string | null;
    articles_today: number;
    articles_7days: number;
  };
  tension_level: string;
  tension_score: number;
  last_updated: string;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return apiRequest<DashboardSummary>('/api/dashboard/summary');
}

// V4 - Top Threats
export interface TopThreat {
  id: string;
  title: string;
  attack_type: string;
  severity: string;
  target?: string | null;
  impact_summary?: string | null;
  source: string;
  published_at: string;
  score: number;
}

export interface TopThreatsResponse {
  threats: TopThreat[];
  count: number;
}

export async function getTopThreats(limit: number = 3): Promise<TopThreatsResponse> {
  return apiRequest<TopThreatsResponse>(`/api/dashboard/top-threats?limit=${limit}`);
}

// V4 - Timeline by Period (24h / 7d / 30d)
export interface TimelineBucket {
  date: string;
  count: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface TimelinePeriodResponse {
  period: string;
  data: TimelineBucket[];
  total: number;
}

export async function getTimelineByPeriod(
  period: '24h' | '7d' | '30d' = '7d'
): Promise<TimelinePeriodResponse> {
  return apiRequest<TimelinePeriodResponse>(`/api/dashboard/timeline/${period}`);
}
