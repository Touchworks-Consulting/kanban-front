import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { format, isToday, isTomorrow, isThisWeek, addDays, startOfDay, addHours, isSameDay, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { activityService } from '../../services/activity';
import { authService } from '../../services/auth';
import type { Activity } from '../../services/activity';

interface AgendaPanelProps {
  onNewActivity: () => void;
}

export const AgendaPanel: React.FC<AgendaPanelProps> = ({
  onNewActivity
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const loadUserActivities = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      // Usar getUpcomingActivities diretamente já que range endpoint não existe
      const response = await activityService.getUpcomingActivities(undefined, 30);

      // Filtrar atividades com data agendada que não estão concluídas
      const scheduled = response.activities.filter(
        activity => activity.scheduled_for && activity.status !== 'completed'
      );

      // Ordenar por data
      scheduled.sort((a, b) =>
        new Date(a.scheduled_for!).getTime() - new Date(b.scheduled_for!).getTime()
      );

      setActivities(scheduled);
    } catch (error) {
      console.error('Erro ao carregar atividades do usuário:', error);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadUserActivities();
  }, [loadUserActivities]);

  // Ouvir eventos de atividades para recarregar (silenciosamente)
  useEffect(() => {
    const handleActivityChange = (eventName: string) => () => {
      console.log(`📅 Agenda: ${eventName} - recarregando silenciosamente...`);
      loadUserActivities(true); // Silent reload - não mostra loading
    };

    const handleCreated = handleActivityChange('Atividade criada');
    const handleUpdated = handleActivityChange('Atividade atualizada');
    const handleDeleted = handleActivityChange('Atividade deletada');

    window.addEventListener('activity-created', handleCreated);
    window.addEventListener('activity-updated', handleUpdated);
    window.addEventListener('activity-deleted', handleDeleted);

    return () => {
      window.removeEventListener('activity-created', handleCreated);
      window.removeEventListener('activity-updated', handleUpdated);
      window.removeEventListener('activity-deleted', handleDeleted);
    };
  }, [loadUserActivities]);

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

  // Gerar horários do dia (6h às 22h) - memoizado
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      slots.push({
        hour,
        time: `${hour.toString().padStart(2, '0')}:00`,
        timeObj: addHours(startOfDay(selectedDate), hour)
      });
    }
    return slots;
  }, [selectedDate]);

  // Obter atividades do dia selecionado - memoizado
  const dayActivities = useMemo(() => {
    return activities.filter(activity =>
      activity.scheduled_for &&
      isSameDay(new Date(activity.scheduled_for), selectedDate)
    );
  }, [activities, selectedDate]);

  // Verificar se é horário atual
  const isCurrentTime = (timeObj: Date) => {
    const now = new Date();
    const currentHour = now.getHours();
    const slotHour = timeObj.getHours();

    return isSameDay(selectedDate, now) &&
           currentHour >= slotHour &&
           currentHour < slotHour + 1;
  };

  // Navegação de datas - useCallback para estabilizar referências
  const goToPreviousDay = useCallback(() => {
    setSelectedDate(prev => addDays(prev, -1));
  }, []);

  const goToNextDay = useCallback(() => {
    setSelectedDate(prev => addDays(prev, 1));
  }, []);

  const goToToday = useCallback(() => {
    setSelectedDate(new Date());
  }, []);


  if (loading) {
    return (
      <div className={cn(
        "flex-shrink-0 border-l bg-background transition-all duration-300",
        isCollapsed ? "w-12" : "w-72"
      )}>
        {isCollapsed ? (
          <div className="p-3 border-b">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsCollapsed(false)}
              className="h-6 w-6 p-0"
            >
              <Calendar className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">
                Carregando...
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsCollapsed(true)}
                className="h-6 w-6 p-0"
              >
                <Calendar className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "flex-shrink-0 border-l bg-background transition-all duration-300",
      isCollapsed ? "w-12" : "w-72"
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
              <Calendar className="w-4 h-4" />
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
              <h3 className="text-sm font-semibold text-foreground">
                Agenda
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsCollapsed(true)}
                className="h-6 w-6 p-0"
                title="Recolher agenda"
              >
                <Calendar className="w-4 h-4" />
              </Button>
            </div>

            {/* Navegação de data */}
            <div className="flex items-center justify-between mb-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={goToPreviousDay}
                className="h-6 w-6 p-0"
              >
                <ChevronLeft className="w-3 h-3" />
              </Button>

              <div className="text-center">
                <h4 className="text-sm font-medium text-foreground">
                  {format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {format(selectedDate, 'EEEE', { locale: ptBR })}
                </p>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={goToNextDay}
                className="h-6 w-6 p-0"
              >
                <ChevronRight className="w-3 h-3" />
              </Button>
            </div>

            {!isToday(selectedDate) && (
              <Button
                size="sm"
                variant="outline"
                onClick={goToToday}
                className="w-full h-6 text-xs"
              >
                Hoje
              </Button>
            )}
          </div>

          <ScrollArea className="h-full">
            <div className="relative px-1">
              {/* Layout da agenda com horários */}
              <div className="min-h-full">
                {timeSlots.map((slot) => {
                  const slotActivities = dayActivities.filter(activity => {
                    const activityHour = new Date(activity.scheduled_for!).getHours();
                    return activityHour === slot.hour;
                  });
                  const isCurrent = isCurrentTime(slot.timeObj);

                  return (
                    <div
                      key={slot.hour}
                      className={cn(
                        "flex border-b border-border/50 min-h-[60px] relative",
                        isCurrent && "bg-primary/5"
                      )}
                    >
                      {/* Coluna de horário */}
                      <div className="w-14 p-1 border-r border-border/50 flex-shrink-0">
                        <span className={cn(
                          "text-xs font-medium",
                          isCurrent ? "text-primary font-bold" : "text-muted-foreground"
                        )}>
                          {slot.time}
                        </span>
                      </div>

                      {/* Coluna de atividades */}
                      <div className="flex-1 p-1 relative min-w-0">
                        {/* Marcador de horário atual */}
                        {isCurrent && (
                          <div className="absolute left-0 top-1/2 w-full flex items-center">
                            <div className="w-2 h-2 bg-primary rounded-full -ml-1 border-2 border-background"></div>
                            <div className="flex-1 h-px bg-primary/30"></div>
                          </div>
                        )}

                        {/* Atividades do horário */}
                        <div className="space-y-1 relative z-10">
                          {slotActivities.map((activity) => (
                            <div
                              key={activity.id}
                              className={cn(
                                "p-1.5 rounded border bg-card hover:shadow-sm transition-shadow cursor-pointer w-full",
                                activity.is_overdue && "border-red-500 border-2"
                              )}
                            >
                              <div className="flex items-center gap-1.5">
                                <div className="flex-shrink-0">
                                  {getActivityIcon(activity.activity_type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-foreground truncate" title={activity.title}>
                                    {activity.title}
                                  </p>
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <span className="text-xs text-muted-foreground">
                                      {format(new Date(activity.scheduled_for!), 'HH:mm')}
                                    </span>
                                    <div className={cn(
                                      "w-1.5 h-1.5 rounded-full",
                                      getPriorityColor(activity.priority)
                                    )} />
                                    {activity.is_overdue && (
                                      <AlertTriangle className="w-2 h-2 text-red-500" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Estado vazio */}
                {dayActivities.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center py-8">
                      <p className="text-xs text-muted-foreground">
                        Nenhuma atividade para {format(selectedDate, 'dd/MM', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
};