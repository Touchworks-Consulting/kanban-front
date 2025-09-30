import { useState, useEffect, useCallback } from 'react';
import { activityService } from '../services/activity';
import type { ActivityCounts, LeadActivityCounts } from '../services/activity';

// Hook para contagem de atividades de um único lead
export const useLeadActivityCounts = (leadId: string) => {
  const [counts, setCounts] = useState<ActivityCounts | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCounts = useCallback(async () => {
    if (!leadId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await activityService.getLeadActivityCounts(leadId);
      setCounts(response.counts);
    } catch (err: any) {
      console.error('Erro ao buscar contagens de atividades:', err);
      setError(err.message || 'Erro ao carregar contagens');
      setCounts(null);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

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

// Hook para contagens bulk (para o kanban board)
export const useBulkActivityCounts = (leadIds: string[]) => {
  const [countsMap, setCountsMap] = useState<Map<string, ActivityCounts>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBulkCounts = useCallback(async () => {
    if (!leadIds.length) {
      setCountsMap(new Map());
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await activityService.getBulkLeadActivityCounts(leadIds);

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
  }, [leadIds]);

  useEffect(() => {
    fetchBulkCounts();
  }, [fetchBulkCounts]);

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
      const response = await activityService.getActivityCounts();
      setCounts(response.counts);
    } catch (err: any) {
      console.error('Erro ao buscar contagens do usuário:', err);
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