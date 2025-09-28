import React from 'react';
import { Badge } from '../ui/badge';
import {
  Clock,
  TrendingUp,
  Target,
  Calendar,
  DollarSign,
  User,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Timer
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Lead } from '../../types/kanban';
import { formatDate, formatCurrency, formatDistanceToNow } from '../../utils/helpers';

interface DealMetricsProps {
  lead: Lead;
  className?: string;
}

export const DealMetrics: React.FC<DealMetricsProps> = ({
  lead,
  className
}) => {
  // Calculate time in current stage (mock data for now)
  const timeInStage = formatDistanceToNow(lead.updatedAt);
  const probability = lead.value ? Math.min(Math.round((lead.value / 10000) * 100), 90) : 25;
  const priority = lead.metadata?.priority || 'medium';

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'urgent':
        return 'text-destructive bg-destructive/10 border-destructive/20';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return AlertTriangle;
      case 'high':
        return TrendingUp;
      case 'medium':
        return Target;
      case 'low':
        return CheckCircle2;
      default:
        return Clock;
    }
  };

  const metrics = [
    {
      label: 'Valor',
      value: lead.value ? formatCurrency(lead.value) : 'Não informado',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      label: 'Probabilidade',
      value: `${probability}%`,
      icon: TrendingUp,
      color: probability > 70 ? 'text-green-600' : probability > 40 ? 'text-orange-600' : 'text-red-600'
    },
    {
      label: 'Tempo na etapa',
      value: timeInStage,
      icon: Timer,
      color: 'text-blue-600'
    },
    {
      label: 'Criado',
      value: formatDate(lead.createdAt, 'short'),
      icon: Calendar,
      color: 'text-muted-foreground'
    },
    {
      label: 'Responsável',
      value: lead.assignedUser?.name || 'Não atribuído',
      icon: User,
      color: 'text-purple-600'
    }
  ];

  const PriorityIcon = getPriorityIcon(priority);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Priority Badge */}
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={cn('text-xs font-medium', getPriorityColor(priority))}
        >
          <PriorityIcon className="w-3 h-3 mr-1" />
          {priority === 'urgent' ? 'Urgente' :
           priority === 'high' ? 'Alta' :
           priority === 'medium' ? 'Média' :
           priority === 'low' ? 'Baixa' : 'Normal'}
        </Badge>

        <Badge variant="outline" className="text-xs">
          <Activity className="w-3 h-3 mr-1" />
          ID: {lead.id.slice(-6)}
        </Badge>
      </div>

      {/* Metrics Grid */}
      <div className="space-y-3">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-all duration-200 group cursor-pointer"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'fadeInUp 0.5s ease-out forwards'
              }}
            >
              <div className={cn(
                'p-1.5 rounded-md bg-background border transition-all duration-200 group-hover:scale-110 group-hover:shadow-md',
                metric.color
              )}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  {metric.label}
                </p>
                <p className="text-sm font-medium text-foreground truncate">
                  {metric.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Last Activity */}
      <div className="pt-2 border-t">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Última atividade</span>
        </div>
        <p className="text-xs text-foreground">
          {formatDistanceToNow(lead.updatedAt)} - Atualização do lead
        </p>
      </div>
    </div>
  );
};