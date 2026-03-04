import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { newsService, NewsResponse, NewsFilters, hashFilters } from '../services/newsService';
import { News } from '../types';

const PAGE_SIZE = 15;
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours in ms
const CACHE_KEY_PREFIX = 'news_cache_';

export type NewsState = 'idle' | 'loading' | 'refreshing' | 'loadingMore' | 'error' | 'success';

interface CacheEntry {
  data: NewsResponse;
  timestamp: number;
}

interface UseNewsResult {
  news: News[];
  state: NewsState;
  error: string | null;
  hasMore: boolean;
  total: number;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  setFilters: (filters: NewsFilters) => void;
  filters: NewsFilters;
}

export function useNews(initialFilters: NewsFilters = {}): UseNewsResult {
  const [news, setNews] = useState<News[]>([]);
  const [state, setState] = useState<NewsState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFiltersState] = useState<NewsFilters>(initialFilters);
  
  // Anti-race condition
  const requestIdRef = useRef(0);
  const filtersKeyRef = useRef(hashFilters(initialFilters));
  
  // Cache helpers
  const getCacheKey = useCallback((filtersKey: string, pageNum: number) => {
    return `${CACHE_KEY_PREFIX}${filtersKey}_p${pageNum}`;
  }, []);
  
  const getFromCache = useCallback(async (key: string): Promise<NewsResponse | null> => {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (cached) {
        const entry: CacheEntry = JSON.parse(cached);
        if (Date.now() - entry.timestamp < CACHE_TTL) {
          return entry.data;
        }
        // Remove stale cache
        await AsyncStorage.removeItem(key);
      }
    } catch (e) {
      console.warn('Cache read error:', e);
    }
    return null;
  }, []);
  
  const setToCache = useCallback(async (key: string, data: NewsResponse) => {
    try {
      const entry: CacheEntry = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(key, JSON.stringify(entry));
    } catch (e) {
      console.warn('Cache write error:', e);
    }
  }, []);
  
  // Fetch news
  const fetchNews = useCallback(async (
    pageNum: number,
    currentFilters: NewsFilters,
    isRefresh: boolean = false
  ) => {
    const requestId = ++requestIdRef.current;
    const filtersKey = hashFilters(currentFilters);
    const cacheKey = getCacheKey(filtersKey, pageNum);
    
    // Determine state
    if (isRefresh) {
      setState('refreshing');
    } else if (pageNum === 1) {
      setState('loading');
    } else {
      setState('loadingMore');
    }
    
    setError(null);
    
    try {
      // Cache-first for page 1 (non-refresh)
      if (pageNum === 1 && !isRefresh) {
        const cached = await getFromCache(cacheKey);
        if (cached) {
          // Check if this request is still valid
          if (requestIdRef.current !== requestId) return;
          
          setNews(cached.items);
          setHasMore(cached.has_more);
          setTotal(cached.total);
          setState('success');
          
          // Revalidate in background
          newsService.getNews(pageNum, PAGE_SIZE, currentFilters)
            .then(async (fresh) => {
              if (requestIdRef.current === requestId) {
                setNews(fresh.items);
                setHasMore(fresh.has_more);
                setTotal(fresh.total);
                await setToCache(cacheKey, fresh);
              }
            })
            .catch(() => {}); // Silent background refresh
          
          return;
        }
      }
      
      // Fetch from API
      const response = await newsService.getNews(pageNum, PAGE_SIZE, currentFilters);
      
      // Check if this request is still valid
      if (requestIdRef.current !== requestId) return;
      
      if (pageNum === 1) {
        setNews(response.items);
      } else {
        setNews(prev => [...prev, ...response.items]);
      }
      
      setHasMore(response.has_more);
      setTotal(response.total);
      setState('success');
      
      // Cache the response
      if (pageNum === 1) {
        await setToCache(cacheKey, response);
      }
      
    } catch (e: any) {
      // Check if this request is still valid
      if (requestIdRef.current !== requestId) return;
      
      setError(e.message || 'Une erreur est survenue');
      setState('error');
    }
  }, [getCacheKey, getFromCache, setToCache]);
  
  // Initial load
  useEffect(() => {
    fetchNews(1, filters);
  }, []);
  
  // Handle filter changes
  const setFilters = useCallback((newFilters: NewsFilters) => {
    const newKey = hashFilters(newFilters);
    
    // Only reload if filters actually changed
    if (newKey !== filtersKeyRef.current) {
      filtersKeyRef.current = newKey;
      setFiltersState(newFilters);
      setPage(1);
      setNews([]);
      fetchNews(1, newFilters);
    }
  }, [fetchNews]);
  
  // Load more
  const loadMore = useCallback(async () => {
    if (state === 'loadingMore' || !hasMore) return;
    
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchNews(nextPage, filters);
  }, [state, hasMore, page, filters, fetchNews]);
  
  // Refresh
  const refresh = useCallback(async () => {
    setPage(1);
    await fetchNews(1, filters, true);
  }, [filters, fetchNews]);
  
  return {
    news,
    state,
    error,
    hasMore,
    total,
    loadMore,
    refresh,
    setFilters,
    filters,
  };
}
