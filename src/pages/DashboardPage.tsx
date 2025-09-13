import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  Trophy, 
  Activity,
  Filter,
  Download,
  RefreshCw,
  Settings,
  MessageSquare,
  Zap,
  Phone,
  
} from 'lucide-react';
import { dashboardService, campaignsService, whatsappService, type ConversionTimeMetric } from '../services';
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeletons';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { DateRangePicker } from '../components/ui/date-range-picker';
import { cn } from '../lib/utils';
import {
  TimelineChartInner,
  mockTimelineData
} from '../components/dashboard/DashboardCharts';
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

// Tipo simples para filtros - seguindo padrão do kanban
interface SimpleFilters {
  period: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

// Componente simples de funil
const SimpleFunnelChart = ({ data }: { data: any[] }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className="space-y-1">
      {data.map((item, index) => {
        const widthPercentage = (item.value / maxValue) * 100;
        const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'];
        
        return (
          <div key={index} className="flex items-center gap-3">
            <div className="w-20 text-xs text-muted-foreground text-right">
              {item.label}
            </div>
            <div className="flex-1 bg-muted rounded-full h-6 relative overflow-hidden">
              <div 
                className={`h-full ${colors[index % colors.length]} transition-all duration-500 flex items-center justify-end pr-2`}
                style={{ width: `${widthPercentage}%` }}
              >
                <span className="text-xs font-medium text-white">
                  {item.value}
                </span>
              </div>
            </div>
            <div className="w-12 text-xs text-muted-foreground">
              {((item.value / data[0].value) * 100).toFixed(0)}%
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Dados mock para o funil
const createMockFunnelData = (totalLeads: number, wonLeads: number) => [
  { label: 'Visitantes', value: totalLeads || 100 },
  { label: 'Interessados', value: Math.floor((totalLeads || 100) * 0.7) },
  { label: 'Qualificados', value: Math.floor((totalLeads || 100) * 0.4) },
  { label: 'Propostas', value: Math.floor((totalLeads || 100) * 0.2) },
  { label: 'Fechados', value: wonLeads || 10 }
];

export function DashboardPage() {
  // Estado consolidado para todos os dados do dashboard
  const [dashboardData, setDashboardData] = useState<ConsolidatedDashboardData | null>(null);
  const [conversionMetrics, setConversionMetrics] = useState<ConversionTimeMetric[]>([]);
  
  // Estados para dados adicionais
  const [campaignStats, setCampaignStats] = useState({
    active: 0,
    total: 0,
    totalPhrases: 0
  });
  const [whatsappStats, setWhatsappStats] = useState({
    connected: 0,
    total: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [datePickerKey, setDatePickerKey] = useState(0); // Para forçar re-render e abertura automática

  // Estado dos filtros - seguindo padrão do kanban
  const [filters, setFilters] = useState<SimpleFilters>({
    period: "7"
  });

  // Handler para mudanças de filtro com auto-abertura do calendário
  const handleFilterChange = (value: string) => {
    setFilters({ ...filters, period: value });
    
    // Se selecionou "personalizado", força a abertura do DateRangePicker
    if (value === "custom") {
      setDatePickerKey(prev => prev + 1);
    }
  };

  // Função consolidada para buscar dados do dashboard com filtros
  const fetchDashboardData = async (appliedFilters = filters) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Aplicando filtros no dashboard:', appliedFilters);

      // Preparar parâmetros dos filtros para as APIs
      const filterParams: any = {};
      
      if (appliedFilters.period !== 'custom') {
        // Converter período em datas
        const now = new Date();
        let startDate: Date;
        
        switch (appliedFilters.period) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'last7days':
            startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
            break;
          case 'last30days':
            startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
            break;
          default:
            startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)); // default para 7 dias
        }
        
        filterParams.start_date = startDate.toISOString().split('T')[0];
        filterParams.end_date = now.toISOString().split('T')[0];
      } else if (appliedFilters.dateRange) {
        filterParams.start_date = appliedFilters.dateRange.start;
        filterParams.end_date = appliedFilters.dateRange.end;
      }

      // Fazer chamadas paralelas para todos os dados
      const [metricsResponse, conversionResponse] = await Promise.all([
        dashboardService.getMetrics(filterParams),
        dashboardService.getConversionTimeByCampaign(filterParams)
      ]);

      // Buscar dados adicionais (sem filtros de data)
      try {
        const [campaignsResponse, whatsappResponse] = await Promise.all([
          campaignsService.getCampaigns(),
          whatsappService.getAccounts()
        ]);

        // Calcular estatísticas de campanhas
        const activeCampaigns = (campaignsResponse as any).campaigns.filter((c: any) => c.is_active);
        setCampaignStats({
          active: activeCampaigns.length,
          total: (campaignsResponse as any).campaigns.length,
          totalPhrases: 0 // Será atualizado em uma chamada separada se necessário
        });

        // Calcular estatísticas do WhatsApp
        const accounts = (whatsappResponse as any).accounts || [];
        const connectedWhatsApp = accounts.filter((w: any) => w.status === 'active' || w.status === 'connected');
        setWhatsappStats({
          connected: connectedWhatsApp.length,
          total: accounts.length
        });
      } catch (err) {
        console.warn('Erro ao carregar dados adicionais:', err);
      }

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

  // Recarregar dados quando filtros mudarem
  useEffect(() => {
    console.log('Filtros mudaram:', filters);
    fetchDashboardData();
  }, [filters]);

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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Dashboard completo do seu CRM com análises avançadas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {filters.period === 'custom' ? (
            <DateRangePicker
              key={datePickerKey} // Força re-render e abertura automática
              value={filters.dateRange ? {
                start: new Date(filters.dateRange.start + 'T00:00:00'),
                end: new Date(filters.dateRange.end + 'T00:00:00')
              } : undefined}
              onChange={(range) => {
                if (range) {
                  const formatDateLocal = (date: Date) => {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                  };
                  
                  const dateRange = {
                    start: formatDateLocal(range.start),
                    end: formatDateLocal(range.end)
                  };
                  
                  setFilters(prev => ({
                    ...prev,
                    dateRange: dateRange
                  }));
                } else {
                  // Se limpar o range, volta para "Últimos 7 dias"
                  setFilters(prev => ({
                    ...prev,
                    period: '7',
                    dateRange: undefined
                  }));
                }
              }}
              placeholder="Selecionar período personalizado"
            />
          ) : (
            <Select value={filters.period} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="month">Último mês</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
        
        {/* Botão para voltar aos filtros predefinidos quando estiver em modo custom */}
        {filters.period === 'custom' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters(prev => ({
              ...prev,
              period: '7',
              dateRange: undefined
            }))}
          >
            Voltar aos filtros
          </Button>
        )}
      </div>

      {/* Main KPI Cards - 6 cards em uma única linha */}
      <div className="grid grid-cols-6 gap-3 mb-6">
        <div className="bg-card rounded-lg border p-2">
          <div className="flex items-center gap-1 mb-1">
            <Users className="w-3 h-3 text-blue-500" />
            <span className="text-xs font-medium text-muted-foreground">Total Leads</span>
          </div>
          <div className="text-xl font-bold text-foreground">
            {dashboardData?.totalLeads || 0}
          </div>
          <div className="text-xs text-green-600">
            +{dashboardData?.recentLeads || 0} recentes
          </div>
        </div>
        
        <div className="bg-card rounded-lg border p-2">
          <div className="flex items-center gap-1 mb-1">
            <Target className="w-3 h-3 text-green-500" />
            <span className="text-xs font-medium text-muted-foreground">Conversão</span>
          </div>
          <div className="text-xl font-bold text-foreground">
            {dashboardData?.conversionRate || 0}%
          </div>
          <div className="text-xs text-muted-foreground">
            {dashboardData?.wonLeads || 0} convertidos
          </div>
        </div>
        
        <div className="bg-card rounded-lg border p-2">
          <div className="flex items-center gap-1 mb-1">
            <Trophy className="w-3 h-3 text-yellow-500" />
            <span className="text-xs font-medium text-muted-foreground">Receita</span>
          </div>
          <div className="text-lg font-bold text-foreground">
            R$ {((dashboardData?.totalRevenue || 0) / 1000).toFixed(0)}k
          </div>
          <div className="text-xs text-muted-foreground">
            Total gerado
          </div>
        </div>

        <div className="bg-card rounded-lg border p-2">
          <div className="flex items-center gap-1 mb-1">
            <Zap className="w-3 h-3 text-purple-500" />
            <span className="text-xs font-medium text-muted-foreground">Campanhas</span>
          </div>
          <div className="text-xl font-bold text-foreground">
            {campaignStats.active}
          </div>
          <div className="text-xs text-muted-foreground">
            {campaignStats.total} total
          </div>
        </div>

        <div className="bg-card rounded-lg border p-2">
          <div className="flex items-center gap-1 mb-1">
            <MessageSquare className="w-3 h-3 text-blue-600" />
            <span className="text-xs font-medium text-muted-foreground">Frases</span>
          </div>
          <div className="text-xl font-bold text-foreground">
            {campaignStats.totalPhrases}
          </div>
          <div className="text-xs text-muted-foreground">
            Triggers
          </div>
        </div>

        <div className="bg-card rounded-lg border p-2">
          <div className="flex items-center gap-1 mb-1">
            <Phone className="w-3 h-3 text-green-600" />
            <span className="text-xs font-medium text-muted-foreground">WhatsApp</span>
          </div>
          <div className="text-xl font-bold text-foreground">
            {whatsappStats.connected}
          </div>
          <div className="text-xs text-muted-foreground">
            {whatsappStats.total} contas
          </div>
        </div>
      </div>

      {/* Layout principal sem painéis redimensionáveis */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        {/* Evolução Temporal - 2 colunas para mais espaço horizontal */}
        <div className="lg:col-span-2 bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
           <h3 className="text-base font-semibold">Evolução Temporal</h3>

          </div>
          <div className="h-64">
            <div className="h-full">
              <TimelineChartInner data={mockTimelineData} />
              
            </div>
          </div>
        </div>
        
        {/* Funil de Conversão - 1 coluna */}
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-base font-semibold">Funil de Conversão</h3>
          </div>
          <div className="h-64">
            <div className="h-full">
              <SimpleFunnelChart data={createMockFunnelData(dashboardData?.totalLeads || 0, dashboardData?.wonLeads || 0)} />
            </div>
          </div>
        </div>

        {/* Distribuição por Status - 1 coluna */}
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="text-base font-semibold">Distribuição por Status</h3>
          </div>
          {dashboardData?.leadsByStatus && dashboardData.leadsByStatus.length > 0 ? (
            <div className="space-y-2 h-64 overflow-y-auto">
              {dashboardData.leadsByStatus
                .filter((item: any) => !['won', 'lost', 'ganho', 'perdido'].includes(item.status.toLowerCase()))
                .map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded border">
                  <div className="flex items-center gap-2 flex-1">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`} />
                    <span className="text-sm font-medium capitalize">
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">{item.count}</div>
                    <div className="text-xs text-muted-foreground">
                      {((item.count / (dashboardData?.totalLeads || 1)) * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum dado disponível</p>
            </div>
          )}
        </div>
      </div>

      {/* Seção Conversão por Campanha + Nuvem de Palavras - Largura total */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Tabela de Conversão por Campanha */}
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-primary" />
            <h3 className="text-base font-semibold">Tempo de Conversão por Campanha</h3>
          </div>
          {conversionMetrics.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="text-left py-2 font-medium text-xs uppercase tracking-wide text-muted-foreground">Campanha</th>
                    <th className="text-center py-2 font-medium text-xs uppercase tracking-wide text-muted-foreground">Conversões</th>
                    <th className="text-right py-2 font-medium text-xs uppercase tracking-wide text-muted-foreground">Tempo Médio</th>
                  </tr>
                </thead>
                <tbody>
                  {conversionMetrics.slice(0, 5).map((metric, index) => (
                    <tr key={index} className="border-b border-border/20 hover:bg-muted/50">
                      <td className="py-2 font-medium text-foreground">{metric.campaign}</td>
                      <td className="py-2 text-center">
                        <span className="inline-flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          {metric.totalConversions}
                        </span>
                      </td>
                      <td className="py-2 text-right font-mono text-primary">
                        {metric.averageTimeToConversion.formatted}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Target className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum dado de conversão disponível</p>
            </div>
          )}
        </div>

        {/* Nuvem de Palavras/Frases Mais Utilizadas */}
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-primary" />
            <h3 className="text-base font-semibold">Frases Mais Utilizadas</h3>
          </div>
          <div className="text-center py-6 text-muted-foreground">
            <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nuvem de palavras será implementada</p>
            <p className="text-xs mt-1">Dados disponíveis no banco</p>
          </div>
        </div>
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
