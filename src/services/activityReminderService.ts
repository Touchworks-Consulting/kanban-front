export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export interface ActivityReminder {
  id: string;
  activityId: string;
  leadId: string;
  title: string;
  body: string;
  scheduledFor: Date;
  reminderAt: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  activityType: 'call' | 'email' | 'whatsapp' | 'meeting' | 'note' | 'task' | 'follow_up';
}

class ActivityReminderService {
  private scheduledReminders = new Map<string, NodeJS.Timeout>();
  private storageKey = 'scheduled_activity_reminders';

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Browser não suporta notificações desktop');
      return { granted: false, denied: true, default: false };
    }

    let permission = Notification.permission;

    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    return {
      granted: permission === 'granted',
      denied: permission === 'denied',
      default: permission === 'default'
    };
  }

  async scheduleReminder(reminder: ActivityReminder): Promise<boolean> {
    const permission = await this.requestPermission();
    if (!permission.granted) {
      console.warn('Permissão para notificações negada - não é possível agendar lembrete');
      return false;
    }

    // Cancelar lembrete anterior se existir
    this.cancelReminder(reminder.id);

    const now = new Date();
    const delay = reminder.reminderAt.getTime() - now.getTime();

    // Se o lembrete é para o passado, não agendar
    if (delay <= 0) {
      console.log(`Lembrete para atividade ${reminder.activityId} é para o passado, não será agendado`);
      return false;
    }

    const timeoutId = setTimeout(() => {
      this.showDesktopNotification(reminder);
      this.scheduledReminders.delete(reminder.id);
      this.saveScheduledReminders();
    }, delay);

    this.scheduledReminders.set(reminder.id, timeoutId);
    this.saveScheduledReminders();

    console.log(`Lembrete agendado para ${reminder.reminderAt.toLocaleString()} - Atividade: ${reminder.title}`);
    return true;
  }

  private showDesktopNotification(reminder: ActivityReminder): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const priorityEmoji = {
      'urgent': '🔴',
      'high': '🟠',
      'medium': '🟡',
      'low': '🟢'
    };

    const typeEmoji = {
      'call': '📞',
      'email': '📧',
      'whatsapp': '💬',
      'meeting': '🤝',
      'note': '📝',
      'task': '✅',
      'follow_up': '🎯'
    };

    const options: NotificationOptions = {
      body: reminder.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `activity-reminder-${reminder.activityId}`,
      renotify: true,
      requireInteraction: reminder.priority === 'urgent' || reminder.priority === 'high',
      vibrate: reminder.priority === 'urgent' ? [200, 100, 200] : [100],
      data: {
        leadId: reminder.leadId,
        activityId: reminder.activityId,
        scheduledFor: reminder.scheduledFor.toISOString()
      },
      actions: [
        {
          action: 'complete',
          title: 'Marcar como concluída'
        },
        {
          action: 'snooze',
          title: 'Lembrar em 15 min'
        }
      ]
    };

    const title = `${priorityEmoji[reminder.priority]} ${typeEmoji[reminder.activityType]} ${reminder.title}`;

    const notification = new Notification(title, options);

    // Auto-fechar após 10 segundos (exceto para prioridade alta/urgente)
    if (reminder.priority !== 'urgent' && reminder.priority !== 'high') {
      setTimeout(() => {
        notification.close();
      }, 10000);
    }

    // Handlers para interação com a notificação
    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      notification.close();

      // Disparar evento customizado para abrir o modal do lead
      window.dispatchEvent(new CustomEvent('openLeadModal', {
        detail: {
          leadId: reminder.leadId,
          activityId: reminder.activityId
        }
      }));
    };

    // Handler para ações (se suportado pelo browser)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'notification-action') {
          const { action, activityId } = event.data;

          if (action === 'complete') {
            // Disparar evento para marcar atividade como concluída
            window.dispatchEvent(new CustomEvent('completeActivity', {
              detail: { activityId }
            }));
          } else if (action === 'snooze') {
            // Reagendar para 15 minutos
            const snoozeReminder: ActivityReminder = {
              ...reminder,
              id: `${reminder.id}-snooze`,
              reminderAt: new Date(Date.now() + 15 * 60 * 1000)
            };
            this.scheduleReminder(snoozeReminder);
          }
        }
      });
    }
  }

  cancelReminder(reminderId: string): void {
    const timeoutId = this.scheduledReminders.get(reminderId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledReminders.delete(reminderId);
      this.saveScheduledReminders();
      console.log(`Lembrete ${reminderId} cancelado`);
    }
  }

  cancelAllReminders(): void {
    for (const [id, timeoutId] of this.scheduledReminders) {
      clearTimeout(timeoutId);
    }
    this.scheduledReminders.clear();
    this.saveScheduledReminders();
    console.log('Todos os lembretes cancelados');
  }

  getScheduledCount(): number {
    return this.scheduledReminders.size;
  }

  // Salvar lembretes agendados no localStorage para persistir entre sessões
  private saveScheduledReminders(): void {
    const reminderData = Array.from(this.scheduledReminders.keys()).map(id => ({
      id,
      scheduledAt: new Date().toISOString()
    }));

    localStorage.setItem(this.storageKey, JSON.stringify(reminderData));
  }

  // Restaurar lembretes do localStorage (chamado no init da aplicação)
  loadPersistedReminders(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const reminderData = JSON.parse(stored);
        console.log(`${reminderData.length} lembretes persistidos encontrados`);
        // Nota: Para implementar completamente, seria necessário também
        // salvar os dados completos do reminder, não apenas os IDs
      }
    } catch (error) {
      console.error('Erro ao carregar lembretes persistidos:', error);
    }
  }

  // Método para testar notificações
  async testDesktopNotification(): Promise<void> {
    const permission = await this.requestPermission();
    if (!permission.granted) {
      alert('Permissão para notificações negada. Habilite nas configurações do navegador.');
      return;
    }

    const testReminder: ActivityReminder = {
      id: 'test-reminder',
      activityId: 'test-activity',
      leadId: 'test-lead',
      title: 'Notificação de Teste',
      body: 'Esta é uma notificação de teste do sistema de lembretes de atividades.',
      scheduledFor: new Date(),
      reminderAt: new Date(),
      priority: 'medium',
      activityType: 'task'
    };

    this.showDesktopNotification(testReminder);
  }

  // Verificar se o browser suporta notificações
  isSupported(): boolean {
    return 'Notification' in window;
  }

  // Obter status da permissão atual
  getCurrentPermission(): string {
    if (!this.isSupported()) return 'not-supported';
    return Notification.permission;
  }
}

export const activityReminderService = new ActivityReminderService();