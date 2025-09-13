import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  Trophy, 
  Clock,
  Activity
} from 'lucide-react';
import { dashboardService, type ConversionTimeMetric } from '../services';
import { 
  KPICard,
  TotalLeadsKPI,
  ConversionRateKPI,
  WonLeadsKPI
} from '../components/dashboard/KPICards';
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeletons';
import {
  TimelineChart,
  FunnelChart,
  StatusPieChart,
  CampaignPerformanceChart,
  MetricsLineChart,
  mockTimelineData,
  mockFunnelData,
  mockStatusData,
  mockCampaignData,
  mockMetricsData
} from '../components/dashboard/DashboardCharts';
import { 
  DashboardControls, 
  type DashboardFilters 
} from '../components/dashboard/DashboardControls';

// Interface para dados consolidados do dashboard
interface ConsolidatedDashboardData {
  totalLeads: number;
  recentLeads: number;
  wonLeads: number;
  conversionRate: number;
  totalRevenue: number;
  leadsByStatus: Array<{
    status: string;
    count: number;
  }>;
}

export function DashboardPage() {
  // Estado consolidado para todos os dados do dashboard
  const [dashboardData, setDashboardData] = useState<ConsolidatedDashboardData | null>(null);
  const [conversionMetrics, setConversionMetrics] = useState<ConversionTimeMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Estado dos filtros
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: {
      start: null,
      end: null,
      preset: 'last_30_days'
    },
    campaigns: [],
    status: [],
    platforms: []
  });

  // Função consolidada para buscar dados do dashboard com debounce
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fazer apenas uma chamada para os dados principais
      const [metricsResponse, conversionResponse] = await Promise.all([
        dashboardService.getMetrics(),
        dashboardService.getConversionTimeByCampaign()
      ]);

      // Consolidar dados com totalRevenue calculado
      const consolidatedData: ConsolidatedDashboardData = {
        totalLeads: metricsResponse.metrics.totalLeads,
        recentLeads: metricsResponse.metrics.recentLeads,
        wonLeads: metricsResponse.metrics.wonLeads,
        conversionRate: metricsResponse.metrics.conversionRate,
        totalRevenue: metricsResponse.metrics.totalValue || 0, // Usar totalValue como revenue
        leadsByStatus: metricsResponse.metrics.leadsByStatus
      };

      setDashboardData(consolidatedData);
      setConversionMetrics(conversionResponse.conversionMetrics);
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados na inicialização
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleExport = async () => {
    // Implementar exportação dos dados do dashboard
    const exportData = {
      dashboard: dashboardData,
      conversionMetrics,
      filters,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading && !dashboardData) {
    return <DashboardSkeleton />;
  }

  if (error && !dashboardData) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Activity className="w-16 h-16 text-muted-foreground mx-auto" />
          <div className="text-destructive">{error}</div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Visão Geral
              </h1>
              <p className="text-muted-foreground mt-1">
                Dashboard completo do seu CRM com análises avançadas
              </p>
            </div>
          </div>
        </motion.div>

        {/* Dashboard Controls */}
        <DashboardControls
          filters={filters}
          onFiltersChange={setFilters}
          onRefresh={handleRefresh}
          onExport={handleExport}
          isRefreshing={refreshing}
        />

        {/* KPI Cards Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <TotalLeadsKPI 
            value={dashboardData?.totalLeads || 0}
            isLoading={isLoading}
          />
          <ConversionRateKPI 
            value={dashboardData?.conversionRate || 0}
            isLoading={isLoading}
          />
          <WonLeadsKPI 
            value={dashboardData?.wonLeads || 0}
            isLoading={isLoading}
          />
          <KPICard
            title="Receita Total"
            value={`R$ ${(dashboardData?.totalRevenue || 0).toLocaleString()}`}
            subtitle="Valor total gerado"
            icon={Target}
            color="green"
            isLoading={isLoading}
          />
        </motion.div>

        {/* Additional Metrics Row */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <KPICard
            title="Leads Recentes"
            value={dashboardData?.recentLeads || 0}
            subtitle="Últimos 7 dias"
            icon={Activity}
            color="blue"
            isLoading={isLoading}
          />
          
          <KPICard
            title="Meta do Mês"
            value="85%"
            subtitle="17/20 metas atingidas"
            icon={Target}
            color="green"
            trend={{
              value: 12,
              label: "vs mês anterior",
              isPositive: true
            }}
          />
          
          <KPICard
            title="Tempo Médio"
            value="4.2 dias"
            subtitle="Para conversão"
            icon={Clock}
            color="purple"
            trend={{
              value: 8,
              label: "mais rápido",
              isPositive: true
            }}
          />
        </motion.div>

        {/* Conversion Time by Campaign */}
        {conversionMetrics.length > 0 && (
          <motion.div 
            className="bg-card p-6 rounded-xl border shadow-sm mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-card-foreground">
                Tempo de Conversão por Campanha
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {conversionMetrics.map((metric, index) => (
                <motion.div 
                  key={index} 
                  className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-primary" />
                    <h3 className="font-medium text-card-foreground truncate">
                      {metric.campaign}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                    <span>Conversões: {metric.totalConversions}</span>
                    <Trophy className="w-4 h-4" />
                  </div>
                  <p className="text-lg font-bold text-primary">
                    {metric.averageTimeToConversion.formatted}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Leads by Status */}
        <motion.div 
          className="bg-card p-6 rounded-xl border shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-card-foreground">
              Distribuição de Leads por Status
            </h2>
          </div>
          {dashboardData?.leadsByStatus && dashboardData.leadsByStatus.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {dashboardData.leadsByStatus.map((item: any, index: number) => (
                <motion.div 
                  key={index} 
                  className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`} />
                    <h3 className="font-medium text-card-foreground capitalize">
                      {getStatusLabel(item.status)}
                    </h3>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    {item.count}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {((item.count / (dashboardData?.totalLeads || 1)) * 100).toFixed(1)}% do total
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhum dado de status disponível
              </p>
            </div>
          )}
        </motion.div>

        {/* Charts Grid */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <TimelineChart data={mockTimelineData} />
          <MetricsLineChart data={mockMetricsData} />
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <StatusPieChart data={mockStatusData} title="Status dos Leads" />
          <div className="lg:col-span-2">
            <FunnelChart data={mockFunnelData} />
          </div>
        </motion.div>

        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <CampaignPerformanceChart data={mockCampaignData} />
        </motion.div>
      </div>
    </div>
  );
}

// Helper functions
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'new': 'bg-blue-500',
    'contacted': 'bg-yellow-500',
    'qualified': 'bg-purple-500',
    'proposal': 'bg-orange-500',
    'won': 'bg-green-500',
    'lost': 'bg-red-500',
  };
  return colors[status] || 'bg-gray-500';
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'new': 'Novos',
    'contacted': 'Contatados',
    'qualified': 'Qualificados',
    'proposal': 'Proposta',
    'won': 'Ganhos',
    'lost': 'Perdidos',
  };
  return labels[status] || status;
}
