import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { settingsService } from '../services/settings';
import type { CustomStatus, LossReason } from '../types';

export interface StatusOption {
  value: string;
  label: string;
  color: string;
  is_initial: boolean;
  is_won: boolean;
  is_lost: boolean;
  order: number;
}

export interface LossReasonOption {
  value: string;
  label: string;
}

interface StatusContextType {
  statuses: StatusOption[];
  lossReasons: LossReasonOption[];
  loading: boolean;
  error: string | null;
  getInitialStatus: () => StatusOption | undefined;
  getWonStatuses: () => StatusOption[];
  getLostStatuses: () => StatusOption[];
  getStatusByValue: (value: string) => StatusOption | undefined;
  getLossReasonByValue: (value: string) => LossReasonOption | undefined;
  refetch: () => Promise<void>;
}

const StatusContext = createContext<StatusContextType | undefined>(undefined);

// Default statuses to use as fallback
const defaultStatuses: StatusOption[] = [
  { value: 'new', label: 'Novo', color: '#94a3b8', is_initial: true, is_won: false, is_lost: false, order: 1 },
  { value: 'contacted', label: 'Contactado', color: '#3b82f6', is_initial: false, is_won: false, is_lost: false, order: 2 },
  { value: 'qualified', label: 'Qualificado', color: '#f59e0b', is_initial: false, is_won: false, is_lost: false, order: 3 },
  { value: 'proposal', label: 'Proposta', color: '#8b5cf6', is_initial: false, is_won: false, is_lost: false, order: 4 },
  { value: 'won', label: 'Ganho', color: '#10b981', is_initial: false, is_won: true, is_lost: false, order: 5 },
  { value: 'lost', label: 'Perdido', color: '#ef4444', is_initial: false, is_won: false, is_lost: true, order: 6 },
];

const defaultLossReasons: LossReasonOption[] = [
  { value: 'price', label: 'Preço alto' },
  { value: 'timing', label: 'Timing inadequado' },
  { value: 'competitor', label: 'Escolheu concorrente' },
  { value: 'no_response', label: 'Não respondeu' },
  { value: 'not_interested', label: 'Não interessado' },
  { value: 'other', label: 'Outro motivo' },
];

export function StatusProvider({ children }: { children: ReactNode }) {
  const [statuses, setStatuses] = useState<StatusOption[]>(defaultStatuses);
  const [lossReasons, setLossReasons] = useState<LossReasonOption[]>(defaultLossReasons);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchAttempted, setFetchAttempted] = useState(false);

  const fetchStatuses = async () => {
    // Prevent multiple simultaneous fetches
    if (fetchAttempted && !loading) return;

    try {
      setLoading(true);
      setError(null);
      setFetchAttempted(true);

      console.log('🔄 StatusProvider: Fetching custom statuses...');

      const [statusesResponse, lossReasonsResponse] = await Promise.all([
        settingsService.getCustomStatuses().catch(err => {
          console.warn('⚠️ Failed to fetch statuses, using defaults:', err);
          return { statuses: [] };
        }),
        settingsService.getLossReasons().catch(err => {
          console.warn('⚠️ Failed to fetch loss reasons, using defaults:', err);
          return { lossReasons: [] };
        })
      ]);

      // Convert CustomStatus[] to StatusOption[]
      const statusOptions: StatusOption[] = (statusesResponse.statuses || [])
        .sort((a, b) => a.order - b.order)
        .map(status => ({
          value: status.id,
          label: status.name,
          color: status.color,
          is_initial: status.is_initial,
          is_won: status.is_won,
          is_lost: status.is_lost,
          order: status.order,
        }));

      // Convert LossReason[] to LossReasonOption[]
      const lossReasonOptions: LossReasonOption[] = (lossReasonsResponse.lossReasons || [])
        .map(reason => ({
          value: reason.id,
          label: reason.name,
        }));

      // Use custom statuses if available, otherwise fallback to defaults
      setStatuses(statusOptions.length > 0 ? statusOptions : defaultStatuses);
      setLossReasons(lossReasonOptions.length > 0 ? lossReasonOptions : defaultLossReasons);

      console.log(`✅ StatusProvider: Loaded ${statusOptions.length || 'default'} statuses`);

    } catch (err) {
      console.error('❌ StatusProvider: Error fetching custom statuses:', err);
      setError('Erro ao carregar status customizados. Usando padrões.');

      // Fallback to default values on error
      setStatuses(defaultStatuses);
      setLossReasons(defaultLossReasons);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  // Helper functions
  const getInitialStatus = () => {
    return statuses.find(status => status.is_initial) || statuses[0];
  };

  const getWonStatuses = () => {
    return statuses.filter(status => status.is_won);
  };

  const getLostStatuses = () => {
    return statuses.filter(status => status.is_lost);
  };

  const getStatusByValue = (value: string) => {
    return statuses.find(status => status.value === value);
  };

  const getLossReasonByValue = (value: string) => {
    return lossReasons.find(reason => reason.value === value);
  };

  const refetch = async () => {
    setFetchAttempted(false);
    await fetchStatuses();
  };

  return (
    <StatusContext.Provider
      value={{
        statuses,
        lossReasons,
        loading,
        error,
        getInitialStatus,
        getWonStatuses,
        getLostStatuses,
        getStatusByValue,
        getLossReasonByValue,
        refetch,
      }}
    >
      {children}
    </StatusContext.Provider>
  );
}

export function useCustomStatuses() {
  const context = useContext(StatusContext);
  if (context === undefined) {
    throw new Error('useCustomStatuses must be used within a StatusProvider');
  }
  return context;
}
