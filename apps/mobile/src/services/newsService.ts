import { apiRequest, isUseMock } from './apiClient';
import { News, Severity, ThreatLevel, ThreatType } from '../types';
import { mockNews } from '../data/mockNews';

// Types
export interface NewsResponse {
  items: News[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface TensionResponse {
  level: string;
  score: number;
  reason: string;
  critical_count: number;
  high_count: number;
  recent_threats: string[];
  updated_at: string;
}

export interface NewsFilters {
  severity?: Severity | null;
  type?: ThreatType | null;
  level?: ThreatLevel | null;
  search?: string;
}

// Hash filters for cache key
export function hashFilters(filters: NewsFilters): string {
  const parts: string[] = [];
  if (filters.severity) parts.push(`s:${filters.severity}`);
  if (filters.type) parts.push(`t:${filters.type}`);
  if (filters.level) parts.push(`l:${filters.level}`);
  if (filters.search) parts.push(`q:${filters.search}`);
  return parts.length > 0 ? parts.join('|') : 'all';
}

// Mock service implementation
const mockNewsService = {
  async getNews(page: number, pageSize: number, filters: NewsFilters): Promise<NewsResponse> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate latency
    
    let filtered = [...mockNews];
    
    if (filters.severity) {
      filtered = filtered.filter(n => n.severity === filters.severity);
    }
    if (filters.type) {
      filtered = filtered.filter(n => n.threatType === filters.type);
    }
    if (filters.level) {
      filtered = filtered.filter(n => n.level === filters.level);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(q) ||
        n.tldr.some(t => t.toLowerCase().includes(q))
      );
    }
    
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);
    
    return {
      items,
      total: filtered.length,
      page,
      page_size: pageSize,
      has_more: start + items.length < filtered.length,
    };
  },
  
  async getNewsById(id: string): Promise<News | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockNews.find(n => n.id === id) || null;
  },
  
  async getTension(): Promise<TensionResponse> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const criticalCount = mockNews.filter(n => n.severity === 'critique').length;
    const highCount = mockNews.filter(n => n.severity === 'eleve').length;
    
    let level = 'Modéré';
    let score = 30;
    
    if (criticalCount > 0) {
      level = 'Critique';
      score = 80;
    } else if (highCount > 2) {
      level = 'Élevé';
      score = 60;
    }
    
    return {
      level,
      score,
      reason: criticalCount > 0 ? `${criticalCount} alertes critiques` : 'Situation normale',
      critical_count: criticalCount,
      high_count: highCount,
      recent_threats: mockNews.slice(0, 3).map(n => n.title.slice(0, 50)),
      updated_at: new Date().toISOString(),
    };
  },
};

// API service implementation
const apiNewsService = {
  async getNews(page: number, pageSize: number, filters: NewsFilters): Promise<NewsResponse> {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('page_size', String(pageSize));
    
    if (filters.severity) params.set('severity', filters.severity);
    if (filters.type) params.set('type', filters.type);
    if (filters.level) params.set('level', filters.level);
    if (filters.search) params.set('search', filters.search);
    
    const response = await apiRequest<any>(`/api/news?${params.toString()}`);
    
    // Map API response to frontend types
    return {
      items: response.items.map(mapApiNewsToFrontend),
      total: response.total,
      page: response.page,
      page_size: response.page_size,
      has_more: response.has_more,
    };
  },
  
  async getNewsById(id: string): Promise<News | null> {
    try {
      const response = await apiRequest<any>(`/api/news/${id}`);
      return mapApiNewsToFrontend(response);
    } catch {
      return null;
    }
  },
  
  async getTension(): Promise<TensionResponse> {
    return apiRequest<TensionResponse>('/api/news/tension');
  },
};

// Map API news to frontend format
function mapApiNewsToFrontend(apiNews: any): News {
  return {
    id: apiNews.id,
    title: apiNews.title,
    source: apiNews.source,
    date: apiNews.published_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    level: apiNews.level || 'intermediaire',
    threatType: apiNews.threat_type || 'other',
    severity: apiNews.severity || 'moyen',
    audience: apiNews.audience || 'tous',
    tldr: apiNews.tldr || [],
    impact: apiNews.impact || '',
    actions: apiNews.actions || [],
    details: apiNews.content || '',
    url: apiNews.url,
  };
}

// Export the appropriate service based on config
export const newsService = isUseMock() ? mockNewsService : apiNewsService;

// Direct exports for flexibility
export { mockNewsService, apiNewsService };
