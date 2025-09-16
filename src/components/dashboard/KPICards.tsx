import React from 'react';
import { motion } from 'framer-motion';
import { 
  Minus,
  Users,
  Target,
  Trophy,
  DollarSign,
  Clock,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  icon?: React.ComponentType<any>;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow';
  isLoading?: boolean;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/50',
    icon: 'text-blue-600 dark:text-blue-400',
    trend: 'text-blue-600 dark:text-blue-400'
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-950/50',
    icon: 'text-green-600 dark:text-green-400',
    trend: 'text-green-600 dark:text-green-400'
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/50',
    icon: 'text-purple-600 dark:text-purple-400',
    trend: 'text-purple-600 dark:text-purple-400'
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-950/50',
    icon: 'text-orange-600 dark:text-orange-400',
    trend: 'text-orange-600 dark:text-orange-400'
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-950/50',
    icon: 'text-red-600 dark:text-red-400',
    trend: 'text-red-600 dark:text-red-400'
  },
  yellow: {
    bg: 'bg-yellow-50 dark:bg-yellow-950/50',
    icon: 'text-yellow-600 dark:text-yellow-400',
    trend: 'text-yellow-600 dark:text-yellow-400'
  }
};

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon = Activity,
  color = 'blue',
  isLoading = false
}) => {
  const colors = colorClasses[color];

  const getTrendIcon = () => {
    if (!trend) return null;
    
    if (trend.value > 0) {
      return trend.isPositive !== false ? (
        <ArrowUpRight className="w-4 h-4 text-green-500" />
      ) : (
        <ArrowUpRight className="w-4 h-4 text-red-500" />
      );
    } else if (trend.value < 0) {
      return trend.isPositive !== false ? (
        <ArrowDownRight className="w-4 h-4 text-red-500" />
      ) : (
        <ArrowDownRight className="w-4 h-4 text-green-500" />
      );
    }
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const getTrendColor = () => {
    if (!trend) return 'text-muted-foreground';
    
    if (trend.value === 0) return 'text-muted-foreground';
    
    const isPositive = trend.isPositive !== false;
    if (trend.value > 0) {
      return isPositive ? 'text-green-600' : 'text-red-600';
    } else {
      return isPositive ? 'text-red-600' : 'text-green-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card rounded-lg border p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${colors.icon}`} />
          </div>
        </div>
        {trend && (
          <div className="flex items-center space-x-1">
            {getTrendIcon()}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-foreground">
          {isLoading ? '...' : value}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
        {trend && (
          <div className={`flex items-center space-x-2 text-sm ${getTrendColor()}`}>
            <span className="font-medium">
              {trend.value > 0 ? '+' : ''}{Math.abs(trend.value)}%
            </span>
            <span className="text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Componentes pré-configurados para KPIs específicos
export const TotalLeadsKPI: React.FC<{ value: number; trend?: KPICardProps['trend']; isLoading?: boolean }> = ({ 
  value, trend, isLoading 
}) => (
  <KPICard
    title="Total de Leads"
    value={value.toLocaleString()}
    icon={Users}
    color="blue"
    trend={trend}
    isLoading={isLoading}
  />
);

export const ConversionRateKPI: React.FC<{ value: number; trend?: KPICardProps['trend']; isLoading?: boolean }> = ({ 
  value, trend, isLoading 
}) => (
  <KPICard
    title="Taxa de Conversão"
    value={`${value.toFixed(1)}%`}
    icon={Target}
    color="green"
    trend={trend}
    isLoading={isLoading}
  />
);

export const WonLeadsKPI: React.FC<{ value: number; trend?: KPICardProps['trend']; isLoading?: boolean }> = ({ 
  value, trend, isLoading 
}) => (
  <KPICard
    title="Leads Convertidos"
    value={value.toLocaleString()}
    icon={Trophy}
    color="purple"
    trend={trend}
    isLoading={isLoading}
  />
);

export const RevenueKPI: React.FC<{ value: number; trend?: KPICardProps['trend']; isLoading?: boolean }> = ({ 
  value, trend, isLoading 
}) => (
  <KPICard
    title="Receita Gerada"
    value={`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
    icon={DollarSign}
    color="green"
    trend={trend}
    isLoading={isLoading}
  />
);

export const AvgConversionTimeKPI: React.FC<{ 
  value: number; 
  unit?: 'hours' | 'days';
  trend?: KPICardProps['trend']; 
  isLoading?: boolean 
}> = ({ 
  value, unit = 'days', trend, isLoading 
}) => {
  const formatValue = () => {
    if (value < 1 && unit === 'days') {
      return `${Math.round(value * 24)}h`;
    }
    return `${Math.round(value)}${unit === 'days' ? 'd' : 'h'}`;
  };

  return (
    <KPICard
      title="Tempo Médio de Conversão"
      value={formatValue()}
      subtitle="Média até conversão"
      icon={Clock}
      color="orange"
      trend={trend}
      isLoading={isLoading}
    />
  );
};

// Grid de KPIs
export interface KPIGridProps {
  kpis: {
    totalLeads?: number;
    recentLeads?: number;
    wonLeads?: number;
    conversionRate?: number;
    totalValue?: number;
    avgConversionDays?: number;
  };
  trends?: {
    [key: string]: KPICardProps['trend'];
  };
  isLoading?: boolean;
}

export const KPIGrid: React.FC<KPIGridProps> = ({ 
  kpis, 
  trends = {}, 
  isLoading = false 
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <TotalLeadsKPI 
      value={kpis.totalLeads || 0} 
      trend={trends.totalLeads}
      isLoading={isLoading}
    />
    <ConversionRateKPI 
      value={kpis.conversionRate || 0} 
      trend={trends.conversionRate}
      isLoading={isLoading}
    />
    <WonLeadsKPI 
      value={kpis.wonLeads || 0} 
      trend={trends.wonLeads}
      isLoading={isLoading}
    />
    <RevenueKPI 
      value={kpis.totalValue || 0} 
      trend={trends.totalValue}
      isLoading={isLoading}
    />
  </div>
);