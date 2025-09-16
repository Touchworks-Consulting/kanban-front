import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, Target, TrendingUp, Users } from 'lucide-react';

interface ActivityConversionData {
  name: string;
  activitiesCount: number;
  conversionRate: number;
  leadsWon: number;
  color?: string;
}

interface ActivityConversionScatterProps {
  data: ActivityConversionData[];
  loading?: boolean;
  className?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover border border-border rounded-lg shadow-lg p-3 min-w-48">
        <p className="font-medium text-popover-foreground mb-2">{data.name}</p>
        <div className="space-y-1 text-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-purple-600" />
              <span className="text-muted-foreground">Atividades:</span>
            </div>
            <span className="font-medium text-foreground">{data.activitiesCount}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3 text-green-600" />
              <span className="text-muted-foreground">Taxa Conversão:</span>
            </div>
            <span className="font-medium text-foreground">{data.conversionRate.toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-blue-600" />
              <span className="text-muted-foreground">Leads Ganhos:</span>
            </div>
            <span className="font-medium text-foreground">{data.leadsWon}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const generateColors = (count: number) => {
  const colors = [
    '#10b981', // green-500
    '#3b82f6', // blue-500
    '#8b5cf6', // violet-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#06b6d4', // cyan-500
    '#84cc16', // lime-500
    '#f97316', // orange-500
    '#ec4899', // pink-500
    '#6366f1', // indigo-500
  ];

  return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
};

export const ActivityConversionScatter: React.FC<ActivityConversionScatterProps> = ({
  data,
  loading = false,
  className = ""
}) => {
  if (loading) {
    return (
      <div className={`w-full p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="h-80 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`w-full p-6 text-center text-muted-foreground ${className}`}>
        <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Nenhum dado de atividade disponível</p>
        <p className="text-xs mt-1">Aguardando dados de atividades e conversões</p>
      </div>
    );
  }

  const colors = generateColors(data.length);
  const chartData = data.map((item, index) => ({
    ...item,
    color: item.color || colors[index]
  }));

  const maxActivities = Math.max(...data.map(d => d.activitiesCount), 10);
  const maxConversion = Math.max(...data.map(d => d.conversionRate), 100);

  const getPerformanceQuadrant = (activities: number, conversion: number) => {
    const avgActivities = data.reduce((sum, d) => sum + d.activitiesCount, 0) / data.length;
    const avgConversion = data.reduce((sum, d) => sum + d.conversionRate, 0) / data.length;

    if (activities >= avgActivities && conversion >= avgConversion) return 'high-performance';
    if (activities >= avgActivities && conversion < avgConversion) return 'high-activity-low-conversion';
    if (activities < avgActivities && conversion >= avgConversion) return 'efficient-conversion';
    return 'needs-improvement';
  };

  const avgActivities = data.reduce((sum, d) => sum + d.activitiesCount, 0) / data.length;
  const avgConversion = data.reduce((sum, d) => sum + d.conversionRate, 0) / data.length;

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-6 flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Atividades vs Taxa de Conversão</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
          <TrendingUp className="w-3 h-3" />
          Análise de Performance
        </div>
      </div>

      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 40,
              bottom: 60,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              className="opacity-30"
            />
            <XAxis
              type="number"
              dataKey="activitiesCount"
              name="Atividades"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 12,
                fill: 'currentColor'
              }}
              className="text-muted-foreground"
              domain={[0, Math.ceil(maxActivities * 1.1)]}
              label={{
                value: 'Número de Atividades',
                position: 'insideBottom',
                offset: -10,
                style: { textAnchor: 'middle', fontSize: '12px' }
              }}
            />
            <YAxis
              type="number"
              dataKey="conversionRate"
              name="Taxa de Conversão (%)"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 12,
                fill: 'currentColor'
              }}
              className="text-muted-foreground"
              domain={[0, Math.min(100, Math.ceil(maxConversion * 1.1))]}
              label={{
                value: 'Taxa de Conversão (%)',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fontSize: '12px' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Linhas de referência da média */}
            {data.length > 1 && (
              <>
                {/* Linha vertical da média de atividades */}
                <line
                  x1={`${(avgActivities / maxActivities) * 100}%`}
                  y1="0%"
                  x2={`${(avgActivities / maxActivities) * 100}%`}
                  y2="100%"
                  stroke="currentColor"
                  strokeDasharray="5 5"
                  className="opacity-20"
                />
                {/* Linha horizontal da média de conversão */}
                <line
                  x1="0%"
                  y1={`${100 - (avgConversion / Math.min(100, Math.ceil(maxConversion * 1.1))) * 100}%`}
                  x2="100%"
                  y2={`${100 - (avgConversion / Math.min(100, Math.ceil(maxConversion * 1.1))) * 100}%`}
                  stroke="currentColor"
                  strokeDasharray="5 5"
                  className="opacity-20"
                />
              </>
            )}

            <Scatter name="Vendedores" dataKey="conversionRate">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {data.length > 0 && (
        <div className="mt-4 p-3 bg-muted/20 rounded-lg">
          <div className="text-xs text-muted-foreground mb-3 font-medium">
            Análise de Performance por Quadrantes:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-medium text-green-700">Alta Performance:</span>
              <p className="text-muted-foreground mt-1">
                Acima da média em atividades ({avgActivities.toFixed(1)}) e conversão ({avgConversion.toFixed(1)}%)
              </p>
              <div className="mt-1">
                {data.filter(d => getPerformanceQuadrant(d.activitiesCount, d.conversionRate) === 'high-performance').map(d => (
                  <span key={d.name} className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs mr-1 mb-1">
                    {d.name}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="font-medium text-blue-700">Conversão Eficiente:</span>
              <p className="text-muted-foreground mt-1">
                Poucas atividades, mas alta conversão - trabalho focado
              </p>
              <div className="mt-1">
                {data.filter(d => getPerformanceQuadrant(d.activitiesCount, d.conversionRate) === 'efficient-conversion').map(d => (
                  <span key={d.name} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs mr-1 mb-1">
                    {d.name}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="font-medium text-orange-700">Muita Atividade, Baixa Conversão:</span>
              <p className="text-muted-foreground mt-1">
                Precisa melhorar qualidade das atividades
              </p>
              <div className="mt-1">
                {data.filter(d => getPerformanceQuadrant(d.activitiesCount, d.conversionRate) === 'high-activity-low-conversion').map(d => (
                  <span key={d.name} className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs mr-1 mb-1">
                    {d.name}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="font-medium text-red-700">Precisa Melhorar:</span>
              <p className="text-muted-foreground mt-1">
                Abaixo da média em atividades e conversão
              </p>
              <div className="mt-1">
                {data.filter(d => getPerformanceQuadrant(d.activitiesCount, d.conversionRate) === 'needs-improvement').map(d => (
                  <span key={d.name} className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs mr-1 mb-1">
                    {d.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};