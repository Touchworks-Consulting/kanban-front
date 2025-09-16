import * as PusherPushNotifications from '@pusher/push-notifications-web';

class PushNotificationService {
  private beamsClient: PusherPushNotifications.Client | null = null;
  private isInitialized = false;
  private instanceId: string | null = null;

  async initialize(instanceId?: string) {
    // Só inicializar em produção ou se instanceId for fornecido
    if (import.meta.env.MODE !== 'production' && !instanceId) {
      console.log('Push notifications desabilitadas em desenvolvimento');
      return false;
    }

    // Verificar se o navegador suporta notificações
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Navegador não suporta push notifications');
      return false;
    }

    try {
      this.instanceId = instanceId || import.meta.env.VITE_PUSHER_INSTANCE_ID;

      if (!this.instanceId) {
        console.warn('VITE_PUSHER_INSTANCE_ID não encontrado');
        return false;
      }

      this.beamsClient = new PusherPushNotifications.Client({
        instanceId: this.instanceId,
      });

      await this.beamsClient.start();
      this.isInitialized = true;

      console.log('Push notifications inicializadas');
      return true;
    } catch (error) {
      console.error('Erro ao inicializar push notifications:', error);
      return false;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async subscribeToAccount(accountId: string): Promise<boolean> {
    if (!this.beamsClient || !this.isInitialized) {
      console.warn('Beams client não inicializado');
      return false;
    }

    try {
      await this.beamsClient.addDeviceInterest(`account-${accountId}`);
      console.log(`Inscrito nas notificações da conta: ${accountId}`);
      return true;
    } catch (error) {
      console.error('Erro ao se inscrever:', error);
      return false;
    }
  }

  async unsubscribeFromAccount(accountId: string): Promise<boolean> {
    if (!this.beamsClient || !this.isInitialized) {
      return false;
    }

    try {
      await this.beamsClient.removeDeviceInterest(`account-${accountId}`);
      console.log(`Desinscrito das notificações da conta: ${accountId}`);
      return true;
    } catch (error) {
      console.error('Erro ao se desinscrever:', error);
      return false;
    }
  }

  async getDeviceId(): Promise<string | null> {
    if (!this.beamsClient || !this.isInitialized) {
      return null;
    }

    try {
      return await this.beamsClient.getDeviceId();
    } catch (error) {
      console.error('Erro ao obter device ID:', error);
      return null;
    }
  }

  isSupported(): boolean {
    return 'Notification' in window &&
           'serviceWorker' in navigator &&
           'PushManager' in window;
  }

  isReady(): boolean {
    return this.isInitialized && this.beamsClient !== null;
  }

  getPermissionStatus(): NotificationPermission {
    return 'Notification' in window ? Notification.permission : 'default';
  }
}

export const pushNotificationService = new PushNotificationService();
export default pushNotificationService;