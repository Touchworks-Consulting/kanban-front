import React, { useEffect, useState } from 'react';
import { X, Activity, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { LoadingSpinner } from '../LoadingSpinner';
import { useWhatsAppStore } from '../../stores';
import type { WhatsAppAccount, WebhookLog } from '../../types';

interface WebhookLogsModalProps {
  account: WhatsAppAccount;
  isOpen: boolean;
  onClose: () => void;
}

export const WebhookLogsModal: React.FC<WebhookLogsModalProps> = ({
  account,
  isOpen,
  onClose,
}) => {
  const { webhookLogs, loading, fetchWebhookLogs } = useWhatsAppStore();
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchWebhookLogs(account.id);
    }
  }, [isOpen, account.id, fetchWebhookLogs]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh && isOpen) {
      interval = setInterval(() => {
        fetchWebhookLogs(account.id);
      }, 5000); // Atualiza a cada 5 segundos
    }
    return () => clearInterval(interval);
  }, [autoRefresh, isOpen, account.id, fetchWebhookLogs]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR');
  };

  const getStatusIcon = (log: WebhookLog) => {
    if (!log.processed) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    } else if (log.lead_created) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else {
      return <CheckCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusText = (log: WebhookLog) => {
    if (!log.processed) {
      return 'Erro';
    } else if (log.lead_created) {
      return 'Lead Criado';
    } else {
      return 'Processado';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Logs do Webhook
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Eventos recebidos para {account.account_name} ({account.phone_number})
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? 'bg-green-100 text-green-700' : ''}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                {autoRefresh ? 'Auto Refresh' : 'Refresh Manual'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchWebhookLogs(account.id)}
                disabled={loading}
              >
                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading && webhookLogs.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner />
            </div>
          ) : webhookLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Activity className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhum evento registrado
              </h3>
              <p className="text-muted-foreground">
                Os webhooks recebidos aparecerão aqui em tempo real
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {webhookLogs.map((log) => (
                <div key={log.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(log)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">
                            {getStatusText(log)}
                          </span>
                          {log.campaign_matched && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {log.campaign_matched}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatTimestamp(log.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {log.event_type}
                    </div>
                  </div>

                  {log.error && (
                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">{log.error}</p>
                    </div>
                  )}

                  {/* Payload Preview */}
                  <div className="bg-muted rounded-lg p-3">
                    <details className="group">
                      <summary className="cursor-pointer text-sm font-medium text-muted-foreground group-open:text-foreground">
                        Ver payload completo
                      </summary>
                      <pre className="mt-2 text-xs bg-background p-3 rounded border overflow-x-auto">
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                    </details>
                  </div>

                  {/* Message Preview */}
                  {log.payload?.message?.text?.body && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-900 font-medium">Mensagem:</p>
                      <p className="text-sm text-blue-700 mt-1">
                        "{log.payload.message.text.body}"
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        De: {log.payload.message?.from || 'N/A'}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="p-4 border-t bg-muted/30">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Total de eventos: {webhookLogs.length}
            </span>
            <div className="flex items-center gap-4">
              <span>
                Processados: {webhookLogs.filter(log => log.processed).length}
              </span>
              <span>
                Leads criados: {webhookLogs.filter(log => log.lead_created).length}
              </span>
              <span>
                Erros: {webhookLogs.filter(log => !log.processed).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};