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
};