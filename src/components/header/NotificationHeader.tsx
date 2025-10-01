import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, Check, AlertCircle, CheckCircle, Clock, AlertTriangle, CheckSquare } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { useUnifiedNotifications, type UnifiedNotification } from '../../hooks/useUnifiedNotifications';

interface NotificationHeaderProps {
  className?: string;
}

const NotificationHeader: React.FC<NotificationHeaderProps> = ({
  className
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    counts,
    loading,
    markAsRead,
    markAllAsRead,
    removeNotification
  } = useUnifiedNotifications();

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Obter ícone e cor baseado no tipo de notificação
  const getNotificationIcon = (notification: UnifiedNotification) => {
    switch (notification.type) {
      case 'task_overdue':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'task_today':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'task_pending':
        return <CheckSquare className="h-4 w-4 text-blue-500" />;
      case 'activity_reminder':
        return <AlertCircle className="h-4 w-4 text-purple-500" />;
      case 'system':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  // Obter cor de fundo e texto baseado na prioridade
  const getPriorityClasses = (priority: string, read: boolean) => {
    if (read) {
      return {
        bg: 'bg-muted/30',
        text: 'text-muted-foreground'
      };
    }

    switch (priority) {
      case 'urgent':
        return {
          bg: 'bg-red-100 dark:bg-red-950/30',
          text: 'text-red-900 dark:text-red-100'
        };
      case 'high':
        return {
          bg: 'bg-orange-100 dark:bg-orange-950/30',
          text: 'text-orange-900 dark:text-orange-100'
        };
      case 'medium':
        return {
          bg: 'bg-blue-100 dark:bg-blue-950/30',
          text: 'text-blue-900 dark:text-blue-100'
        };
      case 'low':
        return {
          bg: 'bg-slate-100 dark:bg-slate-950/30',
          text: 'text-slate-900 dark:text-slate-100'
        };
      default:
        return {
          bg: 'bg-muted/30',
          text: 'text-foreground'
        };
    }
  };

  // Formatar timestamp
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return `${days}d atrás`;
  };

  // Handler para clicar em uma notificação
  const handleNotificationClick = (notification: UnifiedNotification) => {
    markAsRead(notification.id);

    if (notification.actionUrl) {
      setIsOpen(false);
      navigate(notification.actionUrl);
    }
  };

  // Ordenar notificações por prioridade e timestamp
  const sortedNotifications = [...notifications].sort((a, b) => {
    // Primeiro por prioridade
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Depois por timestamp (mais recente primeiro)
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  // Determinar cor do badge baseado na prioridade mais alta
  const getBadgeVariant = () => {
    if (counts.urgent > 0) return 'destructive';
    if (counts.high > 0) return 'default';
    return 'secondary';
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        disabled={loading}
      >
        <Bell className={cn(
          "h-5 w-5 transition-colors",
          counts.urgent > 0 && "text-red-600",
          counts.urgent === 0 && counts.high > 0 && "text-orange-600"
        )} />
        {counts.unread > 0 && (
          <Badge
            variant={getBadgeVariant()}
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs font-bold flex items-center justify-center min-w-[20px]"
          >
            {counts.unread > 99 ? '99+' : counts.unread}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 z-50">
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-medium">Notificações</CardTitle>
                  {counts.total > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {counts.total}
                    </Badge>
                  )}
                </div>
                {counts.unread > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs h-7 px-2"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Marcar todas como lidas
                  </Button>
                )}
              </div>

              {/* Resumo por tipo */}
              {counts.total > 0 && (
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {counts.byType.task_overdue > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {counts.byType.task_overdue} vencida{counts.byType.task_overdue > 1 ? 's' : ''}
                    </Badge>
                  )}
                  {counts.byType.task_today > 0 && (
                    <Badge variant="default" className="text-xs bg-orange-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {counts.byType.task_today} hoje
                    </Badge>
                  )}
                  {counts.byType.task_pending > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      <CheckSquare className="h-3 w-3 mr-1" />
                      {counts.byType.task_pending} pendente{counts.byType.task_pending > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              )}
            </CardHeader>

            <CardContent className="p-0">
              {sortedNotifications.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">Nenhuma notificação</p>
                  <p className="text-xs mt-1">Você está em dia com suas tarefas!</p>
                </div>
              ) : (
                <div className="max-h-[32rem] overflow-y-auto rounded-b-lg">
                  {sortedNotifications.map((notification, index) => {
                    const priorityClasses = getPriorityClasses(notification.priority, notification.read);
                    const isLast = index === sortedNotifications.length - 1;

                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-4 border-b last:border-b-0 hover:bg-muted/70 cursor-pointer transition-colors",
                          priorityClasses.bg,
                          isLast && "rounded-b-lg"
                        )}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className={cn(
                                    "text-sm font-medium truncate",
                                    priorityClasses.text,
                                    !notification.read && "font-semibold"
                                  )}>
                                    {notification.title}
                                  </p>
                                  {!notification.read && (
                                    <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                                  )}
                                </div>
                                <p className={cn(
                                  "text-sm mt-1",
                                  notification.read ? "text-muted-foreground" : priorityClasses.text,
                                  notification.read && "opacity-70"
                                )}>
                                  {notification.message}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <p className="text-xs text-muted-foreground">
                                    {formatTimestamp(notification.timestamp)}
                                  </p>
                                  {notification.priority === 'urgent' && (
                                    <Badge variant="destructive" className="text-xs h-5">
                                      Urgente
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1 flex-shrink-0">
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notification.id);
                                    }}
                                    className="h-7 w-7"
                                    title="Marcar como lida"
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeNotification(notification.id);
                                  }}
                                  className="h-7 w-7"
                                  title="Remover"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default NotificationHeader;
