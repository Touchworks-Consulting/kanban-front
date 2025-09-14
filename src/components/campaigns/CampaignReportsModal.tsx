import React, { useState, useEffect } from 'react';
import { X, BarChart3, Users, MessageSquare, Download, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { LoadingSpinner } from '../LoadingSpinner';
import { campaignsService } from '../../services/campaigns';
import { dashboardService } from '../../services/dashboard';
import { DailyLeadsChart } from '../charts/DailyLeadsChart';
import { HourlyDistributionChart } from '../charts/HourlyDistributionChart';
import type { Campaign } from '../../types';

interface CampaignReportsModalProps {
  campaign: Campaign;
  isOpen: boolean;
  onClose: () => void;
}

// Mock data para demonstração
const generateMockData = (campaign: Campaign) => {
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split('T')[0],
      leads: Math.floor(Math.random() * 20) + 1,
      messages: Math.floor(Math.random() * 50) + 10,
    };
  });

  const topPhrases = [
    { phrase: 'quero saber mais', matches: 45, leads: 32 },
    { phrase: 'me interessei', matches: 38, leads: 28 },
    { phrase: 'quanto custa', matches: 42, leads: 25 },
    { phrase: 'preciso de ajuda', matches: 33, leads: 22 },
    { phrase: 'tenho interesse', matches: 29, leads: 18 },
  ];

  const leadsByHour = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    leads: Math.floor(Math.random() * 15) + 1,
  }));

  return {
    summary: {
      totalLeads: campaign.stats?.total_leads || 0,
      totalMessages: last30Days.reduce((sum, day) => sum + day.messages, 0),
      totalPhrases: campaign.stats?.total_phrases || 0,
      conversionRate: Math.random() * 20 + 5, // 5-25%
      growthRate: (Math.random() - 0.5) * 40, // -20% to +20%
    },
    dailyData: last30Days,
    topPhrases,
    leadsByHour,
  };
};

export const CampaignReportsModal: React.FC<CampaignReportsModalProps> = ({
  campaign,
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('30d');
  const [reportData, setReportData] = useState<any>(null);
  const [effectivePhrases, setEffectivePhrases] = useState<any>(null);
  const [debugData, setDebugData] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [conversionTimeData, setConversionTimeData] = useState<any>(null);

  useEffect(() => {
    if (isOpen && campaign.id) {
      setLoading(true);
      
      // Buscar dados reais de frases eficazes, debug e tempo de conversão
      const loadData = async () => {
        try {
          const dateRangeNumber = dateRange === '7d' ? '7' : dateRange === '30d' ? '30' : '90';
          
          // Configurar datas para filtro da nova API
          const endDate = new Date();
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - parseInt(dateRangeNumber));
          
          const dateFilter = {
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0]
          };
          
          // Buscar dados de debug primeiro (tem todas as métricas reais)
          const debugResponse = await campaignsService.debugCampaignReports(campaign.id);
          setDebugData(debugResponse);
          console.log('🔍 DEBUG DATA:', debugResponse);
          
          // Buscar tempo médio de conversão usando nova API
          const conversionResponse = await dashboardService.getConversionTimeByCampaign(dateFilter);
          setConversionTimeData(conversionResponse);
          console.log('⏰ CONVERSION TIME DATA:', conversionResponse);
          
          // Encontrar dados de conversão para esta campanha específica
          const campaignConversionData = conversionResponse.conversionMetrics?.find(
            (metric: any) => metric.campaign === campaign.name
          );
          
          // Buscar frases mais eficazes
          const phrasesData = await campaignsService.getMostEffectivePhrases(campaign.id, dateRangeNumber);
          setEffectivePhrases(phrasesData);

          // 📊 Buscar dados dos gráficos
          const chartsData = await campaignsService.getCampaignChartData(campaign.id, dateRangeNumber);
          console.log('📊 CHART DATA RECEIVED:', chartsData);
          console.log('📊 DAILY DATA:', chartsData?.daily_data);
          console.log('📊 HOURLY DATA:', chartsData?.hourly_data);
          setChartData(chartsData);
          
          // Usar dados reais para as métricas principais
          setReportData({
            summary: {
              totalLeads: debugResponse.metrics.total_leads,
              totalInteractions: campaignConversionData ? campaignConversionData.averageTimeToConversion.formatted : 'N/A', // TEMPO MÉDIO DE CONVERSÃO REAL
              avgResponseTime: debugResponse.metrics.avg_response_time, // NOVA MÉTRICA
              totalPhrases: debugResponse.metrics.active_phrases,
              conversionRate: parseFloat(debugResponse.metrics.comparative_conversion_rate), // TAXA COMPARATIVA REAL
              totalRevenue: parseFloat(debugResponse.metrics.total_revenue || '0'),
              avgTicket: parseFloat(debugResponse.metrics.avg_ticket || '0'),
              growthRate: debugResponse.metrics.growth_rate || 0, // CRESCIMENTO REAL VS PERÍODO ANTERIOR
              conversionCount: campaignConversionData ? campaignConversionData.totalConversions : 0, // NÚMERO DE CONVERSÕES
            },
            dailyData: chartsData.daily_data, // DADOS REAIS DOS GRÁFICOS
            topPhrases: generateMockData(campaign).topPhrases, // Será substituído pelos dados reais
            leadsByHour: chartsData.hourly_data, // DADOS REAIS DOS GRÁFICOS
          });
        } catch (error) {
          console.error('Error loading campaign data:', error);
          // Fallback para dados mockados
          setReportData(generateMockData(campaign));
        } finally {
          setLoading(false);
        }
      };
      
      loadData();
    }
  }, [isOpen, campaign, dateRange]);

  const handleExport = () => {
    // Aqui implementar export para CSV/Excel
    const csvContent = reportData?.dailyData
      ?.map((row: any) => `${row.date},${row.leads},${row.messages}`)
      .join('\n');
    
    if (csvContent) {
      const blob = new Blob([`Data,Leads,Mensagens\n${csvContent}`], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-${campaign.name}-${dateRange}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Relatórios da Campanha
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Análise de performance e estatísticas para {campaign.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={dateRange}
                onValueChange={(value) => setDateRange(value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total de Leads</p>
                      <p className="text-2xl font-bold text-foreground">
                        {reportData?.summary.totalLeads || 0}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="flex items-center mt-2">
                    {reportData?.summary.growthRate >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm ${
                      reportData?.summary.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {Math.abs(reportData?.summary.growthRate || 0).toFixed(1)}%
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">vs período anterior</span>
                  </div>
                </div>

                <div className="bg-card border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Tempo de Conversão</p>
                      <p className="text-2xl font-bold text-foreground">
                        {reportData?.summary.totalInteractions || 'N/A'}
                      </p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {reportData?.summary.conversionCount ? 
                      `${reportData.summary.conversionCount} conversões no período` : 
                      'Tempo médio até conversão'
                    }
                  </p>
                </div>

                <div className="bg-card border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                      <p className="text-2xl font-bold text-foreground">
                        {reportData?.summary.conversionRate.toFixed(1)}%
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-500" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Desta campanha vs todas campanhas
                  </p>
                </div>

                <div className="bg-card border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Frases Ativas</p>
                      <p className="text-2xl font-bold text-foreground">
                        {reportData?.summary.totalPhrases || 0}
                      </p>
                    </div>
                    <Filter className="w-8 h-8 text-orange-500" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Frases gatilho configuradas
                  </p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Leads Chart */}
                <DailyLeadsChart data={chartData?.daily_data || []} />

                {/* Hourly Distribution */}
                <HourlyDistributionChart data={chartData?.hourly_data || []} />
              </div>

              {/* Top Performing Phrases */}
              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-lg font-medium text-foreground mb-4">
                  Frases Mais Eficazes
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4 font-medium text-muted-foreground">Frase</th>
                        <th className="text-right py-2 px-4 font-medium text-muted-foreground">Código</th>
                        <th className="text-right py-2 px-4 font-medium text-muted-foreground">Volume</th>
                        <th className="text-right py-2 px-4 font-medium text-muted-foreground">Taxa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {effectivePhrases && effectivePhrases.effective_phrases.length > 0 ? (
                        effectivePhrases.effective_phrases.map((phrase: any, index: number) => (
                          <tr key={index} className="border-b">
                            <td className="py-3 px-4 font-medium text-foreground">
                              "{phrase.phrase}"
                            </td>
                            <td className="py-3 px-4 text-right text-muted-foreground text-sm">
                              {phrase.phrase_code || 'N/A'}
                            </td>
                            <td className="py-3 px-4 text-right text-foreground">
                              {phrase.volume}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
                                {phrase.percentage}%
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-muted-foreground">
                            {loading ? (
                              <div className="flex items-center justify-center">
                                <LoadingSpinner />
                                <span className="ml-2">Carregando frases eficazes...</span>
                              </div>
                            ) : (
                              "Nenhuma frase eficaz encontrada no período selecionado"
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {effectivePhrases && (
                  <div className="mt-4 text-sm text-muted-foreground">
                    <p>Total de leads analisados: <span className="font-medium">{effectivePhrases.total_leads}</span></p>
                    <p>Período: <span className="font-medium">{effectivePhrases.date_range}</span></p>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};