import { io, Socket } from 'socket.io-client';
import pushNotificationService from './pushNotificationService';

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

class NotificationService {
  private socket: Socket | null = null;
  private listeners: Array<(notification: Notification) => void> = [];
  private connectionListeners: Array<(connected: boolean) => void> = [];
  private pushInitialized = false;

  async connect(token: string, accountId: string) {
    if (this.socket) {
      this.disconnect();
    }

    // Inicializar push notifications se em produção
    await this.initializePushNotifications(accountId);

    // Detectar URL baseado no ambiente
    const socketUrl = import.meta.env.MODE === 'production'
      ? import.meta.env.VITE_API_URL || 'https://kanban-crm-api.vercel.app'
      : 'http://localhost:3000';

    this.socket = io(socketUrl, {
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Conectado ao servidor de notificações via Socket.IO');
      this.socket?.emit('join-account', accountId);
      this.notifyConnectionListeners(true);
    });

    this.socket.on('disconnect', () => {
      console.log('Desconectado do servidor de notificações');
      this.notifyConnectionListeners(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Erro na conexão com servidor de notificações:', error);
      this.notifyConnectionListeners(false);
    });

    this.socket.on('new-notification', (notification: any) => {
      console.log('Nova notificação recebida via Socket.IO:', notification);

      const processedNotification: Notification = {
        ...notification,
        timestamp: new Date(notification.timestamp)
      };

      this.notifyListeners(processedNotification);
    });
  }

  private async initializePushNotifications(accountId: string) {
    if (this.pushInitialized) return;

    try {
      // Tentar inicializar push notifications
      const initialized = await pushNotificationService.initialize();

      if (initialized) {
        // Pedir permissão
        const hasPermission = await pushNotificationService.requestPermission();

        if (hasPermission) {
          // Se inscrever na conta
          await pushNotificationService.subscribeToAccount(accountId);
          this.pushInitialized = true;
          console.log('Push notifications configuradas para conta:', accountId);
        } else {
          console.log('Permissão para push notifications negada');
        }
      }
    } catch (error) {
      console.warn('Erro ao configurar push notifications:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onNotification(callback: (notification: Notification) => void) {
    this.listeners.push(callback);

    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  onConnectionChange(callback: (connected: boolean) => void) {
    this.connectionListeners.push(callback);

    return () => {
      const index = this.connectionListeners.indexOf(callback);
      if (index > -1) {
        this.connectionListeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(notification: Notification) {
    this.listeners.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Erro ao processar notificação:', error);
      }
    });
  }

  private notifyConnectionListeners(connected: boolean) {
    this.connectionListeners.forEach(callback => {
      try {
        callback(connected);
      } catch (error) {
        console.error('Erro ao processar mudança de conexão:', error);
      }
    });
  }

  private getApiUrl(): string {
    return import.meta.env.MODE === 'production'
      ? import.meta.env.VITE_API_URL || 'https://kanban-crm-api.vercel.app'
      : 'http://localhost:3000';
  }

  async sendTestNotification(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.getApiUrl()}/api/notifications/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Erro ao enviar notificação de teste:', error);
      return false;
    }
  }

  async broadcastNotification(
    token: string,
    title: string,
    message: string,
    type: 'info' | 'warning' | 'success' | 'error' = 'info',
    targetAccounts?: string[]
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.getApiUrl()}/api/notifications/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          message,
          type,
          targetAccounts
        })
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Erro ao enviar notificação broadcast:', error);
      return false;
    }
  }

  // Métodos para info sobre push notifications
  isPushNotificationSupported(): boolean {
    return pushNotificationService.isSupported();
  }

  isPushNotificationReady(): boolean {
    return pushNotificationService.isReady();
  }

  getPushNotificationPermission(): NotificationPermission {
    return pushNotificationService.getPermissionStatus();
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const notificationService = new NotificationService();
export default notificationService;