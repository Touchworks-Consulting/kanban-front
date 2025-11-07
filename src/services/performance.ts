import { api } from './api';

// Interfaces
export interface MQLData {
  total_leads: number;
  mql_leads: number;
  mql_percentage: number;
  mql_columns: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  warning?: string;
}

export interface LossReason {
  reason: string;
  count: number;
  percentage: number;
}

export interface LossReasonsData {
  reasons: LossReason[];
  total_lost: number;
  top_3: LossReason[];
}

export interface StatusDistributionItem {
  status_value: string;
  status_label: string;
  count: number;
  color: string;
  is_final: boolean;
  percentage: number;
  percentage_of_total?: number;
}

export interface StatusDistributionData {
  distribution: StatusDistributionItem[];
  active_distribution: StatusDistributionItem[];
  final_distribution: StatusDistributionItem[];
  total_leads: number;
  summary: {
    total: number;
    active: number;
    final: number;
  };
}

// Services
export const performanceService = {
  /**
   * Obtém porcentagem de MQL (Marketing Qualified Leads)
   */
  async getMQLPercentage(params?: { start_date?: string; end_date?: string }): Promise<MQLData> {
    const response = await api.get('/api/dashboard/performance/mql-percentage', { params });
    return response.data;
  },

  /**
   * Obtém agregação de motivos de perda
   */
  async getLossReasons(params?: { start_date?: string; end_date?: string }): Promise<LossReasonsData> {
    const response = await api.get('/api/dashboard/performance/loss-reasons', { params });
    return response.data;
  },

  /**
   * Obtém distribuição de leads por status customizado
   */
  async getStatusDistribution(params?: { start_date?: string; end_date?: string }): Promise<StatusDistributionData> {
    const response = await api.get('/api/dashboard/performance/status-distribution', { params });
    return response.data;
  }
};

export default performanceService;
