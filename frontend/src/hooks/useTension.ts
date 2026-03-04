import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { newsService, TensionResponse } from '../services/newsService';

const CACHE_KEY = 'tension_cache';
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

interface CacheEntry {
  data: TensionResponse;
  timestamp: number;
}

interface UseTensionResult {
  tension: TensionResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useTension(): UseTensionResult {
  const [tension, setTension] = useState<TensionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchTension = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    
    try {
      // Check cache first
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          const entry: CacheEntry = JSON.parse(cached);
          if (Date.now() - entry.timestamp < CACHE_TTL) {
            setTension(entry.data);
            setLoading(false);
            return;
          }
        }
      }
      
      // Fetch fresh data
      const data = await newsService.getTension();
      setTension(data);
      
      // Cache it
      const entry: CacheEntry = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(entry));
      
    } catch (e: any) {
      setError(e.message || 'Erreur de chargement');
      
      // Try to use stale cache as fallback
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          const entry: CacheEntry = JSON.parse(cached);
          setTension(entry.data);
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchTension();
  }, [fetchTension]);
  
  const refresh = useCallback(async () => {
    await fetchTension(true);
  }, [fetchTension]);
  
  return {
    tension,
    loading,
    error,
    refresh,
  };
}
