import React, { useState, useEffect } from 'react';
import { X, BarChart3, Users, MessageSquare, Calendar, Download, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '../ui/button';
import { LoadingSpinner } from '../LoadingSpinner';
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

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      // Simular carregamento
      setTimeout(() => {
        setReportData(generateMockData(campaign));
        setLoading(false);
      }, 1000);
    }
  }, [isOpen, campaign]);

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
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
              </select>
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
                      <p className="text-sm text-muted-foreground">Mensagens</p>
                      <p className="text-2xl font-bold text-foreground">
                        {reportData?.summary.totalMessages || 0}
                      </p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Últimos {dateRange === '7d' ? '7' : dateRange === '30d' ? '30' : '90'} dias
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
                    Leads / Mensagens totais
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
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="text-lg font-medium text-foreground mb-4">
                    Leads por Dia
                  </h3>
                  <div className="h-64">
                    {/* Simple bar chart representation */}
                    <div className="flex items-end justify-between h-full gap-1">
                      {reportData?.dailyData.slice(-7).map((day: any, index: number) => (
                        <div key={index} className="flex flex-col items-center flex-1">
                          <div 
                            className="bg-blue-500 w-full rounded-t"
                            style={{ height: `${(day.leads / 20) * 100}%` }}
                          />
                          <span className="text-xs text-muted-foreground mt-1 rotate-45 origin-left">
                            {new Date(day.date).getDate()}/{new Date(day.date).getMonth() + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hourly Distribution */}
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="text-lg font-medium text-foreground mb-4">
                    Distribuição por Hora
                  </h3>
                  <div className="h-64">
                    <div className="flex items-end justify-between h-full gap-0.5">
                      {reportData?.leadsByHour.map((hour: any, index: number) => (
                        <div key={index} className="flex flex-col items-center flex-1">
                          <div 
                            className="bg-green-500 w-full rounded-t"
                            style={{ height: `${(hour.leads / 15) * 100}%` }}
                          />
                          {index % 4 === 0 && (
                            <span className="text-xs text-muted-foreground mt-1">
                              {hour.hour}h
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
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
                        <th className="text-right py-2 px-4 font-medium text-muted-foreground">Disparos</th>
                        <th className="text-right py-2 px-4 font-medium text-muted-foreground">Leads</th>
                        <th className="text-right py-2 px-4 font-medium text-muted-foreground">Taxa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData?.topPhrases.map((phrase: any, index: number) => (
                        <tr key={index} className="border-b">
                          <td className="py-3 px-4 font-medium text-foreground">
                            "{phrase.phrase}"
                          </td>
                          <td className="py-3 px-4 text-right text-foreground">
                            {phrase.matches}
                          </td>
                          <td className="py-3 px-4 text-right text-foreground">
                            {phrase.leads}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
                              {((phrase.leads / phrase.matches) * 100).toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-lg font-medium text-foreground mb-4">
                  Atividade Recente
                </h3>
                <div className="space-y-3">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div key={i} className="flex items-center justify-between py-2 px-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm text-foreground">
                          Lead capturado pela frase "quero saber mais"
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        há {Math.floor(Math.random() * 60) + 1} min
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};