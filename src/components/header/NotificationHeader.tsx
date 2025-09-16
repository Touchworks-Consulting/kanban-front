import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, AlertCircle, Info, CheckCircle, Wifi, WifiOff, Smartphone, SmartphoneNfc } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../../lib/utils';
import notificationService, { type Notification } from '../../services/notificationService';

interface NotificationHeaderProps {
  accountId: string;
  token: string;
  onSendTestNotification?: () => void;
}

const NotificationHeader: React.FC<NotificationHeaderProps> = ({
  accountId,
  token,
  onSendTestNotification
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [pushStatus, setPushStatus] = useState<{
    supported: boolean;
    ready: boolean;
    permission: NotificationPermission;
  }>({
    supported: false,
    ready: false,
    permission: 'default'
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    // Inicializar conexão
    notificationService.connect(token, accountId);

    const unsubscribeNotification = notificationService.onNotification((notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    const unsubscribeConnection = notificationService.onConnectionChange((connected) => {
      setIsConnected(connected);
    });

    // Atualizar status das push notifications
    const updatePushStatus = () => {
      setPushStatus({
        supported: notificationService.isPushNotificationSupported(),
        ready: notificationService.isPushNotificationReady(),
        permission: notificationService.getPushNotificationPermission()
      });
    };

    // Atualizar inicialmente e a cada segundo
    updatePushStatus();
    const pushStatusInterval = setInterval(updatePushStatus, 1000);

    return () => {
      unsubscribeNotification();
      unsubscribeConnection();
      notificationService.disconnect();
      clearInterval(pushStatusInterval);
    };
  }, [token, accountId]);

  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

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

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const addTestNotification = async () => {
    try {
      const success = await notificationService.sendTestNotification(token);
      if (!success) {
        console.error('Falha ao enviar notificação de teste');
      }

      if (onSendTestNotification) {
        onSendTestNotification();
      }
    } catch (error) {
      console.error('Erro ao enviar notificação de teste:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>

        <div className={cn("flex items-center gap-1", isConnected ? "text-green-500" : "text-gray-400")}>
          <span>
            {isConnected ? (
              <Wifi className="h-4 w-4" />
            ) : (
              <WifiOff className="h-4 w-4" />
            )}
          </span>
        </div>

        <div className={cn("flex items-center",
          pushStatus.ready && pushStatus.permission === 'granted' ? "text-green-500" :
          pushStatus.supported ? "text-yellow-500" : "text-gray-400"
        )}>
          <span>
            {pushStatus.ready && pushStatus.permission === 'granted' ? (
              <SmartphoneNfc className="h-4 w-4" />
            ) : pushStatus.supported ? (
              <Smartphone className="h-4 w-4" />
            ) : (
              <Smartphone className="h-4 w-4 opacity-50" />
            )}
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 z-50">
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Notificações</CardTitle>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      Marcar todas como lidas
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  Nenhuma notificação
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer",
                        !notification.read && "bg-blue-50"
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                {formatTimestamp(notification.timestamp)}
                              </p>
                            </div>

                            <div className="flex items-center gap-1">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="h-6 w-6"
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
                                className="h-6 w-6"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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