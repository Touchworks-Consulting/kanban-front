import React from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart as PieIcon,
  Activity,
  Target
} from 'lucide-react';

// Cores consistentes com o design system
const COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4',
  muted: '#6b7280'
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.success,
  COLORS.warning,
  COLORS.info,
  COLORS.error
];

// Componente base para cards de gráfico
interface ChartCardProps {
  title: string;
  icon: React.ComponentType<any>;
  children: React.ReactNode;
  className?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, icon: Icon, children, className = "" }) => (
  <motion.div
    className={`bg-card p-6 rounded-xl border shadow-sm ${className}`}
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-center gap-3 mb-6">
      <Icon className="w-5 h-5 text-primary" />
      <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
    </div>
    {children}
  </motion.div>
);

// Tooltip customizado
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
        <p className="text-popover-foreground font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Gráfico de linha temporal
interface TimelineChartProps {
  data: Array<{
    date: string;
    leads: number;
    conversions: number;
  }>;
}

export const TimelineChart: React.FC<TimelineChartProps> = ({ data }) => (
  <ChartCard title="Evolução Temporal" icon={TrendingUp}>
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="conversionsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3} />
            <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="date" 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area
          type="monotone"
          dataKey="leads"
          stroke={COLORS.primary}
          fillOpacity={1}
          fill="url(#leadsGradient)"
          name="Leads"
        />
        <Area
          type="monotone"
          dataKey="conversions"
          stroke={COLORS.success}
          fillOpacity={1}
          fill="url(#conversionsGradient)"
          name="Conversões"
        />
      </AreaChart>
    </ResponsiveContainer>
  </ChartCard>
);

// Gráfico de funil de conversão
interface FunnelChartProps {
  data: Array<{
    step: string;
    count: number;
    percentage: number;
  }>;
}

export const FunnelChart: React.FC<FunnelChartProps> = ({ data }) => (
  <ChartCard title="Funil de Conversão" icon={BarChart3}>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="horizontal">
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <YAxis 
          type="category" 
          dataKey="step" 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          width={80}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="count" 
          fill={COLORS.primary}
          radius={[0, 4, 4, 0]}
          name="Leads"
        />
      </BarChart>
    </ResponsiveContainer>
  </ChartCard>
);

// Gráfico de pizza para distribuição
interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  title: string;
}

export const StatusPieChart: React.FC<PieChartProps> = ({ data, title }) => (
  <ChartCard title={title} icon={PieIcon}>
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={120}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} 
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </ChartCard>
);

// Gráfico de performance de campanhas
interface CampaignPerformanceProps {
  data: Array<{
    campaign: string;
    leads: number;
    conversions: number;
    revenue: number;
  }>;
}

export const CampaignPerformanceChart: React.FC<CampaignPerformanceProps> = ({ data }) => (
  <ChartCard title="Performance das Campanhas" icon={Target}>
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="campaign" 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar 
          dataKey="leads" 
          fill={COLORS.primary} 
          name="Leads"
          radius={[2, 2, 0, 0]}
        />
        <Bar 
          dataKey="conversions" 
          fill={COLORS.success} 
          name="Conversões"
          radius={[2, 2, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  </ChartCard>
);

// Gráfico de métricas combinadas
interface MetricsLineChartProps {
  data: Array<{
    period: string;
    leads: number;
    conversionRate: number;
    revenue: number;
  }>;
}

export const MetricsLineChart: React.FC<MetricsLineChartProps> = ({ data }) => (
  <ChartCard title="Métricas Combinadas" icon={Activity}>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="period" 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="leads"
          stroke={COLORS.primary}
          strokeWidth={3}
          dot={{ r: 4 }}
          name="Leads"
        />
        <Line
          type="monotone"
          dataKey="conversionRate"
          stroke={COLORS.success}
          strokeWidth={3}
          dot={{ r: 4 }}
          name="Taxa de Conversão (%)"
        />
      </LineChart>
    </ResponsiveContainer>
  </ChartCard>
);

// Dados mockados para teste
export const mockTimelineData = [
  { date: '2024-01', leads: 120, conversions: 25 },
  { date: '2024-02', leads: 150, conversions: 30 },
  { date: '2024-03', leads: 180, conversions: 45 },
  { date: '2024-04', leads: 200, conversions: 60 },
  { date: '2024-05', leads: 220, conversions: 70 },
  { date: '2024-06', leads: 250, conversions: 85 },
];

export const mockFunnelData = [
  { step: 'Leads', count: 250, percentage: 100 },
  { step: 'Contatados', count: 200, percentage: 80 },
  { step: 'Qualificados', count: 150, percentage: 60 },
  { step: 'Proposta', count: 100, percentage: 40 },
  { step: 'Fechados', count: 85, percentage: 34 },
];

export const mockStatusData = [
  { name: 'Novos', value: 45, color: COLORS.info },
  { name: 'Contatados', value: 35, color: COLORS.warning },
  { name: 'Qualificados', value: 25, color: COLORS.primary },
  { name: 'Proposta', value: 15, color: COLORS.secondary },
  { name: 'Ganhos', value: 20, color: COLORS.success },
  { name: 'Perdidos', value: 10, color: COLORS.error },
];

export const mockCampaignData = [
  { campaign: 'Google Ads', leads: 85, conversions: 20, revenue: 15000 },
  { campaign: 'Facebook', leads: 65, conversions: 15, revenue: 12000 },
  { campaign: 'LinkedIn', leads: 45, conversions: 12, revenue: 18000 },
  { campaign: 'Email Marketing', leads: 75, conversions: 18, revenue: 9000 },
  { campaign: 'Orgânico', leads: 95, conversions: 25, revenue: 22000 },
];

export const mockMetricsData = [
  { period: 'Jan', leads: 120, conversionRate: 20.8, revenue: 15000 },
  { period: 'Feb', leads: 150, conversionRate: 20.0, revenue: 18000 },
  { period: 'Mar', leads: 180, conversionRate: 25.0, revenue: 22500 },
  { period: 'Abr', leads: 200, conversionRate: 30.0, revenue: 30000 },
  { period: 'Mai', leads: 220, conversionRate: 31.8, revenue: 35000 },
  { period: 'Jun', leads: 250, conversionRate: 34.0, revenue: 42000 },
];