import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  isLoading: boolean;
  error?: Error;
}

// Cache global em memória
const cache = new Map<string, CacheItem<any>>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const STALE_WHILE_REVALIDATE = 2 * 60 * 1000; // 2 minutos

export interface UseCacheOptions {
  refreshInterval?: number;
  revalidateOnFocus?: boolean;
  dedupingInterval?: number;
  errorRetryCount?: number;
  cacheTime?: number;
}

export function useOptimizedCache<T>(
  key: string, 
  fetcher: () => Promise<T>,
  options: UseCacheOptions = {}
) {
  const {
    refreshInterval = 0,
    revalidateOnFocus = true,
    dedupingInterval = 2000,
    errorRetryCount = 3,
    cacheTime = CACHE_DURATION
  } = options;

  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  
  const retryCountRef = useRef(0);
  const lastFetchRef = useRef<number>(0);

  // Verificar se dados estão no cache e válidos
  const getCachedData = useCallback(() => {
    const cached = cache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    const isStale = now - cached.timestamp > STALE_WHILE_REVALIDATE;
    const isExpired = now - cached.timestamp > cacheTime;
    
    if (isExpired) {
      cache.delete(key);
      return null;
    }
    
    return { ...cached, isStale };
  }, [key, cacheTime]);

  // Função para buscar dados
  const fetchData = useCallback(async (isBackground = false) => {
    const now = Date.now();
    
    // Deduping - evitar múltiplas chamadas simultâneas
    if (now - lastFetchRef.current < dedupingInterval) {
      return;
    }
    
    lastFetchRef.current = now;

    try {
      if (!isBackground) {
        setIsValidating(true);
        setError(undefined);
      }

      const result = await fetcher();
      
      // Atualizar cache
      cache.set(key, {
        data: result,
        timestamp: now,
        isLoading: false
      });

      setData(result);
      setIsLoading(false);
      setError(undefined);
      retryCountRef.current = 0;
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      
      setError(error);
      setIsLoading(false);
      
      // Retry logic
      if (retryCountRef.current < errorRetryCount) {
        retryCountRef.current++;
        const delay = Math.pow(2, retryCountRef.current) * 1000; // Exponential backoff
        setTimeout(() => fetchData(isBackground), delay);
      }
    } finally {
      setIsValidating(false);
    }
  }, [key, fetcher, dedupingInterval, errorRetryCount]);

  // Função para revalidar manualmente
  const mutate = useCallback(async (newData?: T) => {
    if (newData !== undefined) {
      // Atualização otimista
      setData(newData);
      cache.set(key, {
        data: newData,
        timestamp: Date.now(),
        isLoading: false
      });
    }
    
    await fetchData();
  }, [key, fetchData]);

  // Effect principal
  useEffect(() => {
    const cached = getCachedData();
    
    if (cached && !cached.isStale) {
      // Usar dados do cache
      setData(cached.data);
      setIsLoading(false);
      setError(cached.error);
    } else {
      // Buscar novos dados
      if (cached && cached.isStale) {
        // Mostrar dados stale enquanto revalida
        setData(cached.data);
        setIsLoading(false);
        fetchData(true); // Background revalidation
      } else {
        // Primeira carga
        fetchData();
      }
    }
  }, [key, getCachedData, fetchData]);

  // Refresh interval
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchData(true);
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [refreshInterval, fetchData]);

  // Revalidate on window focus
  useEffect(() => {
    if (!revalidateOnFocus) return;
    
    const handleFocus = () => {
      const cached = getCachedData();
      if (!cached || cached.isStale) {
        fetchData(true);
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [revalidateOnFocus, getCachedData, fetchData]);

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate
  };
}

// Hook específico para dashboard
export function useDashboard(dateRange?: { start_date?: string; end_date?: string }, timeframe = 'week') {
  const params = new URLSearchParams();
  if (dateRange?.start_date) params.append('start_date', dateRange.start_date);
  if (dateRange?.end_date) params.append('end_date', dateRange.end_date);
  if (timeframe) params.append('timeframe', timeframe);
  
  const queryString = params.toString();
  const cacheKey = `dashboard-optimized-${queryString}`;
  
  return useOptimizedCache(
    cacheKey,
    async () => {
      const response = await api.get(`/api/dashboard/optimized?${queryString}`);
      return response.data;
    },
    {
      refreshInterval: 5 * 60 * 1000, // 5 minutos
      revalidateOnFocus: true,
      cacheTime: 3 * 60 * 1000, // 3 minutos
    }
  );
}

// Hook para KPIs específicos
export function useDashboardKPIs(dateRange?: { start_date?: string; end_date?: string }) {
  const params = new URLSearchParams();
  if (dateRange?.start_date) params.append('start_date', dateRange.start_date);
  if (dateRange?.end_date) params.append('end_date', dateRange.end_date);
  
  const queryString = params.toString();
  const cacheKey = `dashboard-kpis-${queryString}`;
  
  return useOptimizedCache(
    cacheKey,
    async () => {
      const response = await api.get(`/api/dashboard/optimized/kpis?${queryString}`);
      return response.data;
    },
    {
      refreshInterval: 2 * 60 * 1000, // 2 minutos
      cacheTime: 60 * 1000, // 1 minuto
    }
  );
}

// Hook para timeline
export function useDashboardTimeline(timeframe = 'week') {
  const cacheKey = `dashboard-timeline-${timeframe}`;
  
  return useOptimizedCache(
    cacheKey,
    async () => {
      const response = await api.get(`/api/dashboard/optimized/timeline?timeframe=${timeframe}`);
      return response.data;
    },
    {
      refreshInterval: 10 * 60 * 1000, // 10 minutos
      cacheTime: 5 * 60 * 1000, // 5 minutos
    }
  );
}

// Função utilitária para limpar cache
export function clearDashboardCache() {
  const keysToRemove: string[] = [];
  
  for (const key of cache.keys()) {
    if (key.startsWith('dashboard-')) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => cache.delete(key));
}

// Função para obter estatísticas do cache
export function getCacheStats() {
  const now = Date.now();
  let totalItems = 0;
  let validItems = 0;
  let staleItems = 0;
  
  for (const [, item] of cache.entries()) {
    totalItems++;
    const age = now - item.timestamp;
    
    if (age < STALE_WHILE_REVALIDATE) {
      validItems++;
    } else if (age < CACHE_DURATION) {
      staleItems++;
    }
  }
  
  return {
    totalItems,
    validItems,
    staleItems,
    hitRate: totalItems > 0 ? ((validItems / totalItems) * 100).toFixed(1) + '%' : '0%'
  };
}