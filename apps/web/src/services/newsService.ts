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
