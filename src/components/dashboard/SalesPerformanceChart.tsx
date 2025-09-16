import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, BarChart3, TrendingUp } from 'lucide-react';

interface SalesPerformanceData {
  name: string;
  leadsWon: number;
  color?: string;
}

interface SalesPerformanceChartProps {
  data: SalesPerformanceData[];
  loading?: boolean;
  className?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
        <p className="font-medium text-popover-foreground">{label}</p>
        <div className="flex items-center gap-2 mt-1">
          <Trophy className="w-4 h-4 text-green-600" />
          <span className="text-sm text-muted-foreground">
            Leads Ganhos: <span className="font-bold text-foreground">{data.leadsWon}</span>
          </span>
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

export const SalesPerformanceChart: React.FC<SalesPerformanceChartProps> = ({
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
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="h-80 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`w-full p-6 text-center text-muted-foreground ${className}`}>
        <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Nenhum dado de performance disponível</p>
        <p className="text-xs mt-1">Aguardando dados de vendas</p>
      </div>
    );
  }

  const colors = generateColors(data.length);
  const chartData = data.map((item, index) => ({
    ...item,
    color: item.color || colors[index]
  }));

  const maxValue = Math.max(...data.map(d => d.leadsWon));
  const chartHeight = Math.max(320, Math.min(480, maxValue * 20 + 100));

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-6 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Performance de Vendas</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
          <TrendingUp className="w-3 h-3" />
          Leads Ganhos por Vendedor
        </div>
      </div>

      <div className="w-full" style={{ height: `${chartHeight}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
            barCategoryGap="20%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              className="opacity-30"
              horizontal={true}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 12,
                fill: 'currentColor',
                textAnchor: 'middle'
              }}
              interval={0}
              angle={-45}
              height={80}
              className="text-muted-foreground"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 12,
                fill: 'currentColor'
              }}
              className="text-muted-foreground"
              domain={[0, 'dataMax + 1']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="leadsWon"
              radius={[4, 4, 0, 0]}
              strokeWidth={1}
              stroke="rgba(0,0,0,0.1)"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {data.length > 0 && (
        <div className="mt-4 p-3 bg-muted/20 rounded-lg">
          <div className="text-xs text-muted-foreground mb-2 font-medium">
            Estatísticas da Performance:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="flex flex-col gap-1">
              <span className="font-medium">Melhor Vendedor:</span>
              <div className="flex items-center gap-2">
                <Trophy className="w-3 h-3 text-yellow-600" />
                <span className="text-foreground">
                  {data.reduce((best, current) =>
                    current.leadsWon > best.leadsWon ? current : best
                  ).name}
                </span>
                <span className="text-muted-foreground">
                  ({Math.max(...data.map(d => d.leadsWon))} leads)
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium">Total de Vendas:</span>
              <span className="text-lg font-bold text-primary">
                {data.reduce((sum, d) => sum + d.leadsWon, 0)} leads
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium">Média por Vendedor:</span>
              <span className="text-lg font-bold text-green-600">
                {(data.reduce((sum, d) => sum + d.leadsWon, 0) / data.length).toFixed(1)} leads
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};