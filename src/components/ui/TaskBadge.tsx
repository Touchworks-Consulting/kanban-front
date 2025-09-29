import React from 'react';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ActivityCounts } from '../../services/activity';

interface TaskBadgeProps {
  counts: ActivityCounts;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

export const TaskBadge: React.FC<TaskBadgeProps> = ({
  counts,
  className,
  size = 'sm',
  showLabels = false
}) => {
  // Se não há tarefas, não mostra nada
  if (!counts.has_tasks) {
    return null;
  }

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  // Prioridade: vencidas > hoje > total
  if (counts.has_overdue) {
    return (
      <div className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        "bg-red-100 text-red-800 border border-red-200",
        sizeClasses[size],
        className
      )}>
        <AlertTriangle className={iconSizes[size]} />
        <span>{counts.overdue}</span>
        {showLabels && <span className="hidden sm:inline">vencida{counts.overdue > 1 ? 's' : ''}</span>}
      </div>
    );
  }

  if (counts.has_today) {
    return (
      <div className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        "bg-orange-100 text-orange-800 border border-orange-200",
        sizeClasses[size],
        className
      )}>
        <Clock className={iconSizes[size]} />
        <span>{counts.today}</span>
        {showLabels && <span className="hidden sm:inline">hoje</span>}
      </div>
    );
  }

  // Se tem tarefas pendentes mas não são urgentes
  return (
    <div className={cn(
      "inline-flex items-center gap-1 rounded-full font-medium",
      "bg-blue-100 text-blue-800 border border-blue-200",
      sizeClasses[size],
      className
    )}>
      <CheckCircle2 className={iconSizes[size]} />
      <span>{counts.total_pending}</span>
      {showLabels && <span className="hidden sm:inline">pendente{counts.total_pending > 1 ? 's' : ''}</span>}
    </div>
  );
};

// Hook para usar as cores do TaskBadge em outros componentes
export const useTaskBadgeColors = (counts: ActivityCounts) => {
  if (!counts.has_tasks) {
    return null;
  }

  if (counts.has_overdue) {
    return {
      type: 'overdue' as const,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      ringColor: 'ring-red-500',
      badgeColor: 'bg-red-100'
    };
  }

  if (counts.has_today) {
    return {
      type: 'today' as const,
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-800',
      ringColor: 'ring-orange-500',
      badgeColor: 'bg-orange-100'
    };
  }

  return {
    type: 'pending' as const,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    ringColor: 'ring-blue-500',
    badgeColor: 'bg-blue-100'
  };
};