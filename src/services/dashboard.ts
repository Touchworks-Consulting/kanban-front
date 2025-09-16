import { api } from './api';

export interface DashboardMetrics {
  totalLeads: number;
  recentLeads: number;
  wonLeads: number;
  lostLeads: number;
  conversionRate: number;
  totalValue: number;
  leadsByStatus: Array<{
    status: string;
    count: number;
  }>;
  leadsByPlatform: Array<{
    platform: string;
    count: number;
  }>;
}

export interface ConversionFunnel {
  step: string;
  count: number;
  percentage: number;
}

export interface TimelineData {
  date: string;
  count: number;
}

export interface ConversionTimeMetric {
  campaign: string;
  totalConversions: number;
  averageTimeToConversion: {
    seconds: number;
    minutes: number;
    hours: number;
    days: number;
    formatted: string;
  };
}

// Novas interfaces para métricas de estágio
export interface StageTimingMetric {
  columnId: string;
  columnName: string;
  columnColor: string;
  currentLeadsCount: number;
  totalLeadsProcessed: number;
  averageTimeInDays: number;
  averageTimeFormatted: string;
}

export interface StageConversionRate {
  fromStage: string;
  toStage: string;
  leadsEntered: number;
  leadsAdvanced: number;
  conversionRate: number;
}

export interface StagnantLead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  value?: number;
  daysSinceUpdate: number;
  column: {
    id?: string;
    name?: string;
    color?: string;
  };
  updated_at: string;
}

export interface DetailedStageMetric extends StageTimingMetric {
  conversionToNext?: {
    toStage: string;
    rate: number;
    leadsAdvanced: number;
  } | null;
}

export interface DashboardData {
  dashboard: {
    metrics: DashboardMetrics;
    funnel: ConversionFunnel[];
    timeline: {
      timeframe: string;
      data: TimelineData[];
    };
    conversionMetrics: ConversionTimeMetric[];
    account: {
      id: string;
      name: string;
    };
  };
}

export const dashboardService = {
  // Dashboard completo
  async getDashboard(params?: {
    start_date?: string;
    end_date?: string;
    timeframe?: 'week' | 'month' | 'year';
  }): Promise<DashboardData> {
    const response = await api.get('/api/dashboard', { params });
    return response.data;
  },

  // Métricas específicas
  async getMetrics(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<{ metrics: DashboardMetrics }> {
    const response = await api.get('/api/dashboard/metrics', { params });
    return response.data;
  },

  // Funil de conversão
  async getConversionFunnel(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<{ funnel: ConversionFunnel[] }> {
    const response = await api.get('/api/dashboard/funnel', { params });
    return response.data;
  },

  // Timeline de leads
  async getTimeline(params?: {
    timeframe?: 'week' | 'month' | 'year';
  }): Promise<{ timeframe: string; data: TimelineData[] }> {
    const response = await api.get('/api/dashboard/timeline', { params });
    return response.data;
  },

  // Tempo médio de conversão por campanha
  async getConversionTimeByCampaign(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<{ conversionMetrics: ConversionTimeMetric[] }> {
    const response = await api.get('/api/dashboard/conversion-time-by-campaign', { params });
    return response.data;
  },

  // Novos métodos para análise de estágios

  // Métricas de tempo por estágio
  async getStageTimingMetrics(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<{ stageMetrics: StageTimingMetric[] }> {
    const response = await api.get('/api/dashboard/stage-timing', { params });
    return response.data;
  },

  // Taxas de conversão entre estágios
  async getStageConversionRates(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<{ conversionRates: StageConversionRate[] }> {
    const response = await api.get('/api/dashboard/stage-conversion-rates', { params });
    return response.data;
  },

  // Leads estagnados
  async getStagnantLeads(params?: {
    days_threshold?: number;
  }): Promise<{ stagnantLeads: StagnantLead[]; threshold: number }> {
    const response = await api.get('/api/dashboard/stagnant-leads', { params });
    return response.data;
  },

  // Métricas detalhadas combinadas por estágio
  async getDetailedStageMetrics(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<{ detailedMetrics: DetailedStageMetric[] }> {
    const response = await api.get('/api/dashboard/detailed-stage-metrics', { params });
    return response.data;
  },

  // Novos métodos para ranking de vendedores

  // Ranking de vendedores
  async getSalesRanking(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<{ data: any[] }> {
    const response = await api.get('/api/dashboard/sales-ranking', { params });
    return { data: response.data.salesRanking || [] };
  },

  // Gráfico de performance de vendas
  async getSalesPerformanceChart(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<{ data: any[] }> {
    const response = await api.get('/api/dashboard/sales-performance-chart', { params });
    return { data: response.data.data || [] };
  },

  // Gráfico de dispersão: atividades vs conversão
  async getActivityConversionScatter(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<{ data: any[] }> {
    const response = await api.get('/api/dashboard/activity-conversion-scatter', { params });
    return { data: response.data.data || [] };
  },
};