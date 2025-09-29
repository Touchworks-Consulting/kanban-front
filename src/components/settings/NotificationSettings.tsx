import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Bell, BellOff, CheckCircle, AlertCircle, Info, Settings } from 'lucide-react';
import { activityReminderService, NotificationPermission } from '../../services/activityReminderService';
import { cn } from '../../lib/utils';

export const NotificationSettings: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    default: true
  });
  const [scheduledCount, setScheduledCount] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    checkPermission();
    setScheduledCount(activityReminderService.getScheduledCount());

    // Atualizar contador periodicamente
    const interval = setInterval(() => {
      setScheduledCount(activityReminderService.getScheduledCount());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const checkPermission = async () => {
    const perm = await activityReminderService.requestPermission();
    setPermission(perm);
  };

  const handleRequestPermission = async () => {
    const perm = await activityReminderService.requestPermission();
    setPermission(perm);
  };

  const handleTestNotification = async () => {
    await activityReminderService.testDesktopNotification();
  };

  const handleToggleNotifications = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    if (!enabled) {
      activityReminderService.cancelAllReminders();
      setScheduledCount(0);
    }

    // Aqui você pode salvar a preferência no localStorage ou backend
    localStorage.setItem('notifications_enabled', enabled.toString());
  };

  const getPermissionStatus = () => {
    if (!activityReminderService.isSupported()) {
      return {
        status: 'not-supported',
        icon: AlertCircle,
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
        label: 'Não Suportado',
        description: 'Seu navegador não suporta notificações desktop'
      };
    }

    if (permission.granted) {
      return {
        status: 'granted',
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        label: 'Ativo',
        description: 'Notificações desktop estão funcionando'
      };
    }

    if (permission.denied) {
      return {
        status: 'denied',
        icon: BellOff,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        label: 'Bloqueado',
        description: 'Habilite nas configurações do navegador'
      };
    }

    return {
      status: 'default',
      icon: Bell,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      label: 'Pendente',
      description: 'Clique para solicitar permissão'
    };
  };

  const statusInfo = getPermissionStatus();
  const StatusIcon = statusInfo.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notificações de Lembretes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status das notificações */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-full', statusInfo.bgColor)}>
              <StatusIcon className={cn('w-4 h-4', statusInfo.color)} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Status das Notificações</span>
                <Badge variant={statusInfo.status === 'granted' ? 'default' : 'secondary'}>
                  {statusInfo.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {statusInfo.description}
              </p>
            </div>
          </div>

          {statusInfo.status === 'default' && (
            <Button onClick={handleRequestPermission} variant="outline">
              Permitir
            </Button>
          )}

          {statusInfo.status === 'granted' && (
            <Button onClick={handleTestNotification} variant="outline" size="sm">
              Testar
            </Button>
          )}
        </div>

        {/* Configurações de notificação */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Label htmlFor="notifications-enabled" className="font-medium">
                Habilitar Lembretes
              </Label>
              <p className="text-sm text-muted-foreground">
                Receber notificações desktop para lembretes de atividades
              </p>
            </div>
            <Switch
              id="notifications-enabled"
              checked={notificationsEnabled && permission.granted}
              onCheckedChange={handleToggleNotifications}
              disabled={!permission.granted}
            />
          </div>

          {scheduledCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
              <Info className="w-4 h-4" />
              <span>
                {scheduledCount} lembrete{scheduledCount !== 1 ? 's' : ''} agendado{scheduledCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Informações sobre notificações */}
        {statusInfo.status === 'denied' && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Settings className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-800">Como habilitar notificações</h4>
                <div className="text-sm text-orange-700 mt-1">
                  <p className="mb-2">Para receber lembretes, siga estes passos:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Clique no ícone do cadeado na barra de endereço</li>
                    <li>Selecione "Permitir" para notificações</li>
                    <li>Recarregue a página</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Informações sobre como funcionam */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <h4 className="font-medium mb-1">Como funcionam os lembretes</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Notificações aparecem no horário definido no lembrete</li>
                <li>• Prioridade alta/urgente mantém a notificação até ser fechada</li>
                <li>• Clique na notificação para abrir o lead relacionado</li>
                <li>• Lembretes funcionam mesmo com o navegador minimizado</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};