import React from 'react';
import { CheckSquare, AlertTriangle, Clock } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { useUserActivityCounts } from '../../hooks/useActivityCounts';

interface TasksNotificationBadgeProps {
  className?: string;
  onClick?: () => void;
}

export const TasksNotificationBadge: React.FC<TasksNotificationBadgeProps> = ({
  className,
  onClick
}) => {
  const { counts, loading, error } = useUserActivityCounts();

  // Não mostra nada se não tem dados ou está carregando
  if (loading || error || !counts) {
    return null;
  }

  // Não mostra se não há tarefas pendentes
  if (!counts.has_tasks) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn("h-9 w-9 p-0", className)}
        title="Nenhuma tarefa pendente"
      >
        <CheckSquare className="h-4 w-4 text-muted-foreground" />
      </Button>
    );
  }

  // Definir ícone e cor baseado na prioridade das tarefas
  const getIconAndColor = () => {
    if (counts.has_overdue) {
      return {
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-100 hover:bg-red-200',
        badgeVariant: 'destructive' as const,
        tooltip: `${counts.overdue} tarefa${counts.overdue > 1 ? 's' : ''} vencida${counts.overdue > 1 ? 's' : ''}`
      };
    }

    if (counts.has_today) {
      return {
        icon: Clock,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100 hover:bg-orange-200',
        badgeVariant: 'default' as const,
        tooltip: `${counts.today} tarefa${counts.today > 1 ? 's' : ''} para hoje`
      };
    }

    return {
      icon: CheckSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 hover:bg-blue-200',
      badgeVariant: 'secondary' as const,
      tooltip: `${counts.total_pending} tarefa${counts.total_pending > 1 ? 's' : ''} pendente${counts.total_pending > 1 ? 's' : ''}`
    };
  };

  const { icon: Icon, color, bgColor, badgeVariant, tooltip } = getIconAndColor();

  // Definir qual número mostrar (prioridade: vencidas > hoje > total)
  const displayCount = counts.has_overdue ? counts.overdue : counts.has_today ? counts.today : counts.total_pending;

  const fullTooltip = counts.total_pending > displayCount
    ? `${tooltip} (${counts.total_pending} total)`
    : tooltip;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      title={fullTooltip}
      className={cn(
        "relative h-9 w-9 p-0 transition-colors",
        bgColor,
        className
      )}
    >
      <Icon className={cn("h-4 w-4", color)} />

      {/* Badge com contador */}
      <Badge
        variant={badgeVariant}
        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs font-bold flex items-center justify-center min-w-[20px]"
      >
        {displayCount > 99 ? '99+' : displayCount}
      </Badge>
    </Button>
  );
};