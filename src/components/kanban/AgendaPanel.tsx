import React, { useState, useEffect } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Calendar,
  Clock,
  Phone,
  Mail,
  MessageSquare,
  Users,
  FileText,
  CheckSquare,
  Target,
  AlertTriangle,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format, isToday, isTomorrow, isThisWeek, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { activityService } from '../../services/activity';
import type { Activity } from '../../services/activity';

interface AgendaPanelProps {
  leadId: string;
  onNewActivity: () => void;
}

export const AgendaPanel: React.FC<AgendaPanelProps> = ({
  leadId,
  onNewActivity
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    loadScheduledActivities();
  }, [leadId]);

  const loadScheduledActivities = async () => {
    try {
      setLoading(true);
      const response = await activityService.getLeadActivities(leadId, {
        status: 'pending',
        limit: 50
      });

      // Filtrar apenas atividades com data agendada
      const scheduled = response.activities.filter(
        activity => activity.scheduled_for
      );

      // Ordenar por data
      scheduled.sort((a, b) =>
        new Date(a.scheduled_for!).getTime() - new Date(b.scheduled_for!).getTime()
      );

      setActivities(scheduled);
    } catch (error) {
      console.error('Erro ao carregar atividades agendadas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: Activity['activity_type']) => {
    const iconClass = "w-3 h-3";
    switch (type) {
      case 'call': return <Phone className={iconClass} />;
      case 'email': return <Mail className={iconClass} />;
      case 'whatsapp': return <MessageSquare className={iconClass} />;
      case 'meeting': return <Users className={iconClass} />;
      case 'note': return <FileText className={iconClass} />;
      case 'task': return <CheckSquare className={iconClass} />;
      case 'follow_up': return <Target className={iconClass} />;
      default: return <CheckSquare className={iconClass} />;
    }
  };

  const getPriorityColor = (priority: Activity['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getDateLabel = (date: string) => {
    const activityDate = new Date(date);

    if (isToday(activityDate)) {
      return {
        label: 'Hoje',
        time: format(activityDate, 'HH:mm'),
        className: 'text-blue-600 font-medium'
      };
    }

    if (isTomorrow(activityDate)) {
      return {
        label: 'Amanhã',
        time: format(activityDate, 'HH:mm'),
        className: 'text-orange-600 font-medium'
      };
    }

    if (isThisWeek(activityDate)) {
      return {
        label: format(activityDate, 'EEEE', { locale: ptBR }),
        time: format(activityDate, 'HH:mm'),
        className: 'text-gray-600'
      };
    }

    return {
      label: format(activityDate, 'dd/MM', { locale: ptBR }),
      time: format(activityDate, 'HH:mm'),
      className: 'text-gray-500'
    };
  };

  // Agrupar atividades por data
  const groupedActivities = activities.reduce((groups, activity) => {
    if (!activity.scheduled_for) return groups;

    const date = format(new Date(activity.scheduled_for), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, Activity[]>);

  if (loading) {
    return (
      <div className={cn(
        "flex-shrink-0 border-l bg-slate-50 dark:bg-slate-900 transition-all duration-300",
        isCollapsed ? "w-12" : "w-64"
      )}>
        {isCollapsed ? (
          <div className="p-3 border-b">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsCollapsed(false)}
              className="h-6 w-6 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Carregando...
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsCollapsed(true)}
                className="h-6 w-6 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "flex-shrink-0 border-l bg-slate-50 dark:bg-slate-900 transition-all duration-300",
      isCollapsed ? "w-12" : "w-64"
    )}>
      {isCollapsed ? (
        // Vista colapsada
        <div className="p-3 border-b">
          <div className="flex flex-col items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsCollapsed(false)}
              className="h-8 w-8 p-0"
              title="Expandir agenda"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {activities.length > 0 && (
              <Badge variant="secondary" className="text-xs px-1 min-w-5 h-5">
                {activities.length}
              </Badge>
            )}
          </div>
        </div>
      ) : (
        // Vista expandida
        <>
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Agenda
              </h3>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onNewActivity}
                  className="h-6 px-2 text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Nova
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsCollapsed(true)}
                  className="h-6 w-6 p-0"
                  title="Recolher agenda"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {activities.length > 0 && (
              <p className="text-xs text-slate-500">
                {activities.length} atividade{activities.length !== 1 ? 's' : ''} agendada{activities.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <ScrollArea className="h-full">
            <div className="p-4">
              {Object.keys(groupedActivities).length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 mb-3">
                    Nenhuma atividade agendada
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onNewActivity}
                    className="text-xs"
                  >
                    Agendar Atividade
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedActivities).map(([date, dayActivities]) => {
                    const firstActivity = dayActivities[0];
                    const dateInfo = getDateLabel(firstActivity.scheduled_for!);

                    return (
                      <div key={date}>
                        <h4 className={cn("text-xs font-medium mb-2", dateInfo.className)}>
                          {dateInfo.label}
                        </h4>
                        <div className="space-y-2">
                          {dayActivities.map((activity) => {
                            const activityDateInfo = getDateLabel(activity.scheduled_for!);

                            return (
                              <div
                                key={activity.id}
                                className={cn(
                                  "p-2 rounded-lg border bg-white dark:bg-slate-800 hover:shadow-sm transition-shadow cursor-pointer",
                                  activity.is_overdue && "border-2 border-red-500 shadow-red-100"
                                )}
                              >
                                <div className="flex items-start gap-2">
                                  <div className="flex-shrink-0 mt-0.5">
                                    {getActivityIcon(activity.activity_type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                                      {activity.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-2.5 h-2.5 text-slate-400" />
                                        <span className="text-xs text-slate-500">
                                          {activityDateInfo.time}
                                        </span>
                                      </div>
                                      <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        getPriorityColor(activity.priority)
                                      )} />
                                      {activity.is_overdue && (
                                        <AlertTriangle className="w-2.5 h-2.5 text-red-500" />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
};