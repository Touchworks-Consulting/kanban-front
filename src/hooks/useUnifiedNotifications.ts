import { useState, useEffect, useCallback } from 'react';
import { useUserActivityCounts } from './useActivityCounts';

export interface UnifiedNotification {
  id: string;
  type: 'task_overdue' | 'task_today' | 'task_pending' | 'activity_reminder' | 'system';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  leadId?: string;
  activityId?: string;
  metadata?: any;
}

// Storage keys
const STORAGE_KEY_READ_NOTIFICATIONS = 'unified_notifications_read';
const STORAGE_KEY_DISMISSED_NOTIFICATIONS = 'unified_notifications_dismissed';

// Helper para carregar IDs de notificações lidas
const loadReadNotificationIds = (): Set<string> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_READ_NOTIFICATIONS);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch (error) {
    console.error('Erro ao carregar notificações lidas:', error);
  }
  return new Set();
};

// Helper para salvar IDs de notificações lidas
const saveReadNotificationIds = (ids: Set<string>) => {
  try {
    localStorage.setItem(STORAGE_KEY_READ_NOTIFICATIONS, JSON.stringify(Array.from(ids)));
  } catch (error) {
    console.error('Erro ao salvar notificações lidas:', error);
  }
};

// Helper para carregar IDs de notificações removidas
const loadDismissedNotificationIds = (): Set<string> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_DISMISSED_NOTIFICATIONS);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch (error) {
    console.error('Erro ao carregar notificações removidas:', error);
  }
  return new Set();
};

// Helper para salvar IDs de notificações removidas
const saveDismissedNotificationIds = (ids: Set<string>) => {
  try {
    localStorage.setItem(STORAGE_KEY_DISMISSED_NOTIFICATIONS, JSON.stringify(Array.from(ids)));
  } catch (error) {
    console.error('Erro ao salvar notificações removidas:', error);
  }
};

export interface UnifiedNotificationCounts {
  total: number;
  unread: number;
  urgent: number;
  high: number;
  medium: number;
  low: number;
  byType: {
    task_overdue: number;
    task_today: number;
    task_pending: number;
    activity_reminder: number;
    system: number;
  };
}

export const useUnifiedNotifications = () => {
  const [notifications, setNotifications] = useState<UnifiedNotification[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(() => loadReadNotificationIds());
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<Set<string>>(() => loadDismissedNotificationIds());
  const [counts, setCounts] = useState<UnifiedNotificationCounts>({
    total: 0,
    unread: 0,
    urgent: 0,
    high: 0,
    medium: 0,
    low: 0,
    byType: {
      task_overdue: 0,
      task_today: 0,
      task_pending: 0,
      activity_reminder: 0,
      system: 0
    }
  });

  // Obter contadores de atividades do usuário
  const { counts: activityCounts, loading: activityLoading } = useUserActivityCounts();

  // Gerar notificações de tarefas baseadas nos contadores
  const generateTaskNotifications = useCallback((): UnifiedNotification[] => {
    if (!activityCounts) {
      return [];
    }

    const taskNotifications: UnifiedNotification[] = [];

    // Verificar se há tarefas (total_pending > 0)
    const hasTasks = activityCounts.total_pending > 0;
    if (!hasTasks) {
      return [];
    }

    // Notificação de tarefas vencidas (prioridade urgente)
    const hasOverdue = activityCounts.overdue > 0;
    if (hasOverdue) {
      taskNotifications.push({
        id: 'task-overdue',
        type: 'task_overdue',
        priority: 'urgent',
        title: 'Tarefas Vencidas',
        message: `Você tem ${activityCounts.overdue} tarefa${activityCounts.overdue > 1 ? 's' : ''} vencida${activityCounts.overdue > 1 ? 's' : ''} que precisa${activityCounts.overdue > 1 ? 'm' : ''} de atenção`,
        timestamp: new Date(),
        read: false,
        actionUrl: '/kanban?focus=tasks&filter=overdue'
      });
    }

    // Notificação de tarefas para hoje (prioridade alta)
    const hasToday = activityCounts.today > 0;
    if (hasToday) {
      taskNotifications.push({
        id: 'task-today',
        type: 'task_today',
        priority: 'high',
        title: 'Tarefas para Hoje',
        message: `Você tem ${activityCounts.today} tarefa${activityCounts.today > 1 ? 's' : ''} agendada${activityCounts.today > 1 ? 's' : ''} para hoje`,
        timestamp: new Date(),
        read: false,
        actionUrl: '/kanban?focus=tasks&filter=today'
      });
    }

    // Notificação de tarefas pendentes gerais (prioridade média)
    const pendingCount = activityCounts.total_pending - (activityCounts.overdue || 0) - (activityCounts.today || 0);
    if (pendingCount > 0) {
      taskNotifications.push({
        id: 'task-pending',
        type: 'task_pending',
        priority: 'medium',
        title: 'Tarefas Pendentes',
        message: `Você tem ${pendingCount} outra${pendingCount > 1 ? 's' : ''} tarefa${pendingCount > 1 ? 's' : ''} pendente${pendingCount > 1 ? 's' : ''}`,
        timestamp: new Date(),
        read: false,
        actionUrl: '/kanban?focus=tasks&filter=pending'
      });
    }

    return taskNotifications;
  }, [activityCounts]);

  // Atualizar notificações quando os contadores mudarem
  useEffect(() => {
    if (activityLoading) return;

    console.log('🔔 [useUnifiedNotifications] activityCounts:', activityCounts);

    const taskNotifications = generateTaskNotifications();

    console.log('🔔 [useUnifiedNotifications] Generated notifications:', taskNotifications);

    setNotifications(prevNotifications => {
      // Remover notificações antigas de tarefas
      const nonTaskNotifications = prevNotifications.filter(
        n => !['task_overdue', 'task_today', 'task_pending'].includes(n.type)
      );

      // Adicionar novas notificações de tarefas, aplicando estado de lida/removida
      const updatedTaskNotifications = taskNotifications
        .filter(n => !dismissedNotificationIds.has(n.id)) // Filtrar removidas
        .map(n => ({
          ...n,
          read: readNotificationIds.has(n.id) // Aplicar estado de lida
        }));

      return [...updatedTaskNotifications, ...nonTaskNotifications];
    });
  }, [activityCounts, activityLoading, generateTaskNotifications, readNotificationIds, dismissedNotificationIds]);

  // Calcular contadores
  useEffect(() => {
    const newCounts: UnifiedNotificationCounts = {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      urgent: notifications.filter(n => n.priority === 'urgent').length,
      high: notifications.filter(n => n.priority === 'high').length,
      medium: notifications.filter(n => n.priority === 'medium').length,
      low: notifications.filter(n => n.priority === 'low').length,
      byType: {
        task_overdue: notifications.filter(n => n.type === 'task_overdue').length,
        task_today: notifications.filter(n => n.type === 'task_today').length,
        task_pending: notifications.filter(n => n.type === 'task_pending').length,
        activity_reminder: notifications.filter(n => n.type === 'activity_reminder').length,
        system: notifications.filter(n => n.type === 'system').length
      }
    };

    setCounts(newCounts);
  }, [notifications]);

  // Marcar notificação como lida
  const markAsRead = useCallback((notificationId: string) => {
    setReadNotificationIds(prev => {
      const newSet = new Set(prev);
      newSet.add(notificationId);
      saveReadNotificationIds(newSet);
      return newSet;
    });

    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  }, []);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(() => {
    const allIds = new Set(notifications.map(n => n.id));
    setReadNotificationIds(prev => {
      const newSet = new Set([...prev, ...allIds]);
      saveReadNotificationIds(newSet);
      return newSet;
    });

    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  }, [notifications]);

  // Remover notificação
  const removeNotification = useCallback((notificationId: string) => {
    setDismissedNotificationIds(prev => {
      const newSet = new Set(prev);
      newSet.add(notificationId);
      saveDismissedNotificationIds(newSet);
      return newSet;
    });

    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  // Adicionar notificação customizada
  const addNotification = useCallback((notification: Omit<UnifiedNotification, 'id' | 'timestamp'>) => {
    const newNotification: UnifiedNotification = {
      ...notification,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  // Limpar todas as notificações
  const clearAll = useCallback(() => {
    // Marcar todas como removidas
    const allIds = new Set(notifications.map(n => n.id));
    setDismissedNotificationIds(prev => {
      const newSet = new Set([...prev, ...allIds]);
      saveDismissedNotificationIds(newSet);
      return newSet;
    });

    setNotifications([]);
  }, [notifications]);

  return {
    notifications,
    counts,
    loading: activityLoading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    addNotification,
    clearAll
  };
};
