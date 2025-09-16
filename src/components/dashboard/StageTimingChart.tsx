import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';
import { Clock, TrendingUp, Users } from 'lucide-react';

// Interface para as métricas de timing de estágio
interface StageTimingData {
  columnId: string;
  columnName: string;
  columnColor: string;
  currentLeadsCount: number;
  totalLeadsProcessed: number;
  averageTimeInDays: number;
  averageTimeFormatted: string;
}

interface StageTimingChartProps {
  data: StageTimingData[];
  className?: string;
}

// Tooltip customizado para mostrar informações detalhadas
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as StageTimingData;

    return (
      <div className="bg-popover border border-border rounded-lg shadow-lg p-3 min-w-[250px]">
        <h4 className="font-semibold text-popover-foreground mb-2">{label}</h4>

        <div className="space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Tempo médio:
            </span>
            <span className="font-medium text-primary">
              {data.averageTimeFormatted}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" />
              Leads atuais:
            </span>
            <span className="font-medium">
              {data.currentLeadsCount}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Total processados:
            </span>
            <span className="font-medium">
              {data.totalLeadsProcessed}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Função para gerar cores mais escuras para as barras
const getDarkerColor = (color: string) => {
  // Se a cor já está no formato hex, retorna uma versão mais escura
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const amt = -30; // Quantidade para escurecer
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return `rgb(${Math.max(0, R)}, ${Math.max(0, G)}, ${Math.max(0, B)})`;
  }

  // Cores padrão baseadas no tema
  return 'hsl(var(--primary))';
};

export const StageTimingChart: React.FC<StageTimingChartProps> = ({
  data,
  className = ""
}) => {
  // Preparar dados para o gráfico
  const chartData = data.map(stage => ({
    ...stage,
    // Nome mais curto para o eixo X
    name: stage.columnName.length > 12
      ? stage.columnName.substring(0, 12) + '...'
      : stage.columnName,
    // Usar dias para o valor principal
    avgTimeDays: stage.averageTimeInDays,
    // Dados adicionais para tooltip
    fullName: stage.columnName
  }));

  // Encontrar o valor máximo para ajustar a escala
  const maxValue = Math.max(...chartData.map(d => d.avgTimeDays));
  const yAxisMax = maxValue > 0 ? Math.ceil(maxValue * 1.2) : 10;

  return (
    <div className={`w-full h-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          barCategoryGap="20%"
        >
          {/* Grid do fundo */}
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            opacity={0.3}
          />

          {/* Eixo X - Nomes das colunas */}
          <XAxis
            dataKey="name"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={60}
          />

          {/* Eixo Y - Dias */}
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={[0, yAxisMax]}
            tickFormatter={(value) => `${value}d`}
          />

          {/* Tooltip customizado */}
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
          />

          {/* Legenda */}
          <Legend
            verticalAlign="top"
            height={36}
            formatter={() => 'Tempo Médio por Estágio (dias)'}
          />

          {/* Barras principais - Tempo médio */}
          <Bar
            dataKey="avgTimeDays"
            name="Tempo Médio (dias)"
            radius={[4, 4, 0, 0]}
            stroke="hsl(var(--border))"
            strokeWidth={1}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.columnColor || `hsl(var(--chart-${(index % 5) + 1}))`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Versão simplificada para quando não há dados
export const EmptyStageTimingChart: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
      <Clock className="w-12 h-12 mb-4 opacity-50" />
      <h3 className="text-lg font-medium mb-2">Dados de Timing em Preparação</h3>
      <p className="text-sm text-center max-w-md">
        As métricas de tempo por estágio aparecerão aqui assim que houver
        histórico suficiente de movimentações entre as colunas do kanban.
      </p>
      <div className="mt-4 text-xs bg-muted px-3 py-2 rounded">
        💡 Mova alguns leads entre as colunas para gerar dados
      </div>
    </div>
  );
};