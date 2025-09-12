import { useState, useEffect } from 'react';
import { dashboardService, type DashboardMetrics, type ConversionTimeMetric } from '../services';

export function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [conversionMetrics, setConversionMetrics] = useState<ConversionTimeMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        
        const [metricsResponse, conversionResponse] = await Promise.all([
          dashboardService.getMetrics(),
          dashboardService.getConversionTimeByCampaign()
        ]);

        setMetrics(metricsResponse.metrics);
        setConversionMetrics(conversionResponse.conversionMetrics);
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
        setError('Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Visão geral do seu CRM
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">Total de Leads</h3>
            <p className="text-2xl font-bold text-card-foreground mt-2">
              {metrics?.totalLeads || 0}
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">Leads Recentes</h3>
            <p className="text-2xl font-bold text-card-foreground mt-2">
              {metrics?.recentLeads || 0}
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">Ganhos</h3>
            <p className="text-2xl font-bold text-card-foreground mt-2">
              {metrics?.wonLeads || 0}
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">Taxa de Conversão</h3>
            <p className="text-2xl font-bold text-card-foreground mt-2">
              {metrics?.conversionRate ? `${metrics.conversionRate.toFixed(1)}%` : '0%'}
            </p>
          </div>
        </div>

        {conversionMetrics.length > 0 && (
          <div className="bg-card p-6 rounded-lg border mb-8">
            <h2 className="text-lg font-semibold text-card-foreground mb-4">
              Tempo Médio de Conversão por Campanha
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {conversionMetrics.map((metric, index) => (
                <div key={index} className="p-4 bg-muted rounded-lg">
                  <h3 className="font-medium text-card-foreground mb-2">
                    {metric.campaign}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    Conversões: {metric.totalConversions}
                  </p>
                  <p className="text-lg font-bold text-primary">
                    {metric.averageTimeToConversion.formatted}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">
            Leads por Status
          </h2>
          {metrics?.leadsByStatus && metrics.leadsByStatus.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.leadsByStatus.map((item, index) => (
                <div key={index} className="p-4 bg-muted rounded-lg">
                  <h3 className="font-medium text-card-foreground capitalize">
                    {item.status}
                  </h3>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {item.count}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              Nenhum dado de status disponível
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
