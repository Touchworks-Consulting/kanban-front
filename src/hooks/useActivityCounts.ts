import { useState, useEffect, useCallback, useRef } from 'react';
import { activityService } from '../services/activity';
import type { ActivityCounts, LeadActivityCounts } from '../services/activity';

// Cache global para contagens de atividades
const activityCountsCache = new Map<string, { data: ActivityCounts; timestamp: number }>();
const CACHE_TTL = 30000; // 30 segundos

// Request deduplication - armazena promises em andamento
const pendingRequests = new Map<string, Promise<ActivityCounts>>();

// Hook para contagem de atividades de um único lead
export const useLeadActivityCounts = (leadId: string) => {
  const [counts, setCounts] = useState<ActivityCounts | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  const fetchCounts = useCallback(async () => {
    if (!leadId || leadId.trim() === '') return;

    // Verificar cache primeiro
    const cached = activityCountsCache.get(leadId);
    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < CACHE_TTL) {
        setCounts(cached.data);
        return;
      } else {
        activityCountsCache.delete(leadId);
      }
    }

    // Verificar se já há uma requisição em andamento para este lead
    let existingRequest = pendingRequests.get(leadId);

    if (!existingRequest) {
      // Criar nova requisição
      setLoading(true);
      setError(null);

      existingRequest = activityService.getLeadActivityCounts(leadId)
        .then(response => {
          // Armazenar no cache
          activityCountsCache.set(leadId, {
            data: response.counts,
            timestamp: Date.now()
          });
          return response.counts;
        })
        .finally(() => {
          // Remover da fila de pendentes
          pendingRequests.delete(leadId);
        });

      pendingRequests.set(leadId, existingRequest);
    }

    try {
      const result = await existingRequest;
      if (isMounted.current) {
        setCounts(result);
      }
    } catch (err: any) {
      if (isMounted.current) {
        console.error('Erro ao buscar contagens de atividades:', err);
        setError(err.message || 'Erro ao carregar contagens');
        setCounts(null);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [leadId]);

  useEffect(() => {
    isMounted.current = true;
    fetchCounts();

    return () => {
      isMounted.current = false;
    };
  }, [fetchCounts]);

  return {
    counts,
    loading,
    error,
    refetch: fetchCounts
  };
};

// Hook para contagens bulk (para o kanban board)
export const useBulkActivityCounts = (leadIds: string[]) => {
  const [countsMap, setCountsMap] = useState<Map<string, ActivityCounts>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const leadIdsStringRef = useRef<string>('');
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchBulkCounts = useCallback(async (ids: string[]) => {
    if (!ids.length) {
      setCountsMap(new Map());
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await activityService.getBulkLeadActivityCounts(ids);

      const newMap = new Map<string, ActivityCounts>();
      response.lead_counts.forEach((item: LeadActivityCounts) => {
        newMap.set(item.lead_id, item.counts);
      });

      setCountsMap(newMap);
    } catch (err: any) {
      console.error('Erro ao buscar contagens bulk de atividades:', err);
      setError(err.message || 'Erro ao carregar contagens');
      setCountsMap(new Map());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Convert leadIds to string to avoid reference comparison
    const leadIdsString = JSON.stringify([...leadIds].sort());

    // Skip if leadIds haven't changed
    if (leadIdsString === leadIdsStringRef.current) {
      return;
    }

    leadIdsStringRef.current = leadIdsString;

    // Clear any pending timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Debounce bulk fetch by 300ms to allow multiple leads to batch together
    fetchTimeoutRef.current = setTimeout(() => {
      fetchBulkCounts(leadIds);
    }, 300);

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [leadIds, fetchBulkCounts]);

  // Função helper para obter contagens de um lead específico
  const getLeadCounts = useCallback((leadId: string): ActivityCounts | null => {
    return countsMap.get(leadId) || null;
  }, [countsMap]);

  return {
    countsMap,
    loading,
    error,
    refetch: fetchBulkCounts,
    getLeadCounts
  };
};

// Hook para contagens do usuário atual (para header badge)
export const useUserActivityCounts = () => {
  const [counts, setCounts] = useState<ActivityCounts | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCounts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('📊 [useUserActivityCounts] Fetching activity counts...');
      const response = await activityService.getActivityCounts();
      console.log('📊 [useUserActivityCounts] Response:', response);
      setCounts(response.counts);
    } catch (err: any) {
      console.error('❌ [useUserActivityCounts] Erro ao buscar contagens do usuário:', err);
      setError(err.message || 'Erro ao carregar contagens');
      setCounts(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  return {
    counts,
    loading,
    error,
    refetch: fetchCounts
  };
};

// Hook para atividades vencidas (para notificações)
export const useOverdueActivities = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOverdueActivities = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await activityService.getOverdueActivities();
      setActivities(response.activities);
      setCount(response.count);
    } catch (err: any) {
      console.error('Erro ao buscar atividades vencidas:', err);
      setError(err.message || 'Erro ao carregar atividades vencidas');
      setActivities([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverdueActivities();
  }, [fetchOverdueActivities]);

  return {
    activities,
    count,
    loading,
    error,
    refetch: fetchOverdueActivities
  };
};

// Hook para atividades de hoje
export const useTodayActivities = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTodayActivities = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await activityService.getTodayActivities();
      setActivities(response.activities);
      setCount(response.count);
    } catch (err: any) {
      console.error('Erro ao buscar atividades de hoje:', err);
      setError(err.message || 'Erro ao carregar atividades de hoje');
      setActivities([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodayActivities();
  }, [fetchTodayActivities]);

  return {
    activities,
    count,
    loading,
    error,
    refetch: fetchTodayActivities
  };
};