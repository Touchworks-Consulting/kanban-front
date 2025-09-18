import { useState, useEffect } from 'react';
import { AlertTriangle, Users, Zap, Crown, X } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

interface PlanLimits {
  users: {
    current: number;
    limit: number | null;
    remaining: number | null;
    percentage: number;
  };
  leads: {
    current: number;
    limit: number | null;
    remaining: number | null;
    percentage: number;
  };
}

interface Subscription {
  id: string;
  status: string;
  plan_name: string;
  plan_price: number;
  expires_at: string;
  is_beta: boolean;
}

interface PlanLimitsData {
  limits: PlanLimits;
  subscription: Subscription;
  warnings: {
    users_near_limit: boolean;
    leads_near_limit: boolean;
  };
}

export function PlanLimitsAlert() {
  const [limitsData, setLimitsData] = useState<PlanLimitsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(() => {
    return JSON.parse(localStorage.getItem('limits-alert-dismissed') || '{}');
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchLimitsData();
  }, []);

  const fetchLimitsData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/billing/limits/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLimitsData(data);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados de limites:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = (type: string) => {
    const newDismissed = { ...dismissed, [type]: Date.now() };
    setDismissed(newDismissed);
    localStorage.setItem('limits-alert-dismissed', JSON.stringify(newDismissed));
  };

  const shouldShowAlert = (type: string, condition: boolean) => {
    if (!condition) return false;

    const dismissedTime = dismissed[type];
    if (!dismissedTime) return true;

    // Mostra novamente após 24 horas
    const dayInMs = 24 * 60 * 60 * 1000;
    return (Date.now() - dismissedTime) > dayInMs;
  };

  if (loading || !limitsData) return null;

  const { limits, subscription, warnings } = limitsData;

  // Durante beta, não mostra alertas de limite
  if (subscription?.is_beta) return null;

  const alerts = [];

  // Alerta para limite de usuários
  if (limits.users.limit && limits.users.percentage >= 80 && shouldShowAlert('users', warnings.users_near_limit)) {
    alerts.push({
      id: 'users',
      type: 'warning',
      icon: <Users className="w-5 h-5" />,
      title: `Limite de usuários: ${limits.users.current}/${limits.users.limit}`,
      message: `Você está usando ${limits.users.percentage}% do seu limite de usuários. ${limits.users.remaining || 0} restantes.`,
      action: limits.users.percentage >= 100 ? 'Fazer upgrade' : 'Ver planos'
    });
  }

  // Alerta para limite de leads
  if (limits.leads.limit && limits.leads.percentage >= 80 && shouldShowAlert('leads', warnings.leads_near_limit)) {
    alerts.push({
      id: 'leads',
      type: limits.leads.percentage >= 100 ? 'error' : 'warning',
      icon: <Zap className="w-5 h-5" />,
      title: `Limite de leads: ${limits.leads.current}/${limits.leads.limit}`,
      message: `Você usou ${limits.leads.percentage}% dos seus leads mensais. ${limits.leads.remaining || 0} restantes.`,
      action: limits.leads.percentage >= 100 ? 'Fazer upgrade' : 'Ver planos'
    });
  }

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`flex items-start justify-between p-4 rounded-lg border-l-4 ${
            alert.type === 'error'
              ? 'bg-red-50 dark:bg-red-950/20 border-red-500'
              : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-500'
          }`}
        >
          <div className="flex items-start space-x-3 flex-1">
            <div className={`flex-shrink-0 ${
              alert.type === 'error' ? 'text-red-500' : 'text-yellow-500'
            }`}>
              {alert.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-semibold ${
                alert.type === 'error'
                  ? 'text-red-900 dark:text-red-100'
                  : 'text-yellow-900 dark:text-yellow-100'
              }`}>
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                {alert.title}
              </h3>
              <p className={`text-sm mt-1 ${
                alert.type === 'error'
                  ? 'text-red-800 dark:text-red-200'
                  : 'text-yellow-800 dark:text-yellow-200'
              }`}>
                {alert.message}
              </p>
              <div className="mt-3 flex items-center space-x-2">
                <Button
                  size="sm"
                  onClick={() => navigate('/plans')}
                  className={
                    alert.type === 'error'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  }
                >
                  <Crown className="w-4 h-4 mr-1" />
                  {alert.action}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => dismissAlert(alert.id)}
                  className="text-xs"
                >
                  Dispensar por 24h
                </Button>
              </div>
            </div>
          </div>
          <button
            onClick={() => dismissAlert(alert.id)}
            className={`ml-4 inline-flex text-sm ${
              alert.type === 'error'
                ? 'text-red-400 hover:text-red-600 dark:text-red-300'
                : 'text-yellow-400 hover:text-yellow-600 dark:text-yellow-300'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// Hook personalizado para verificar limites antes de ações
export function usePlanLimits() {
  const checkUserLimit = async (quantityToAdd = 1): Promise<{allowed: boolean; message?: string}> => {
    try {
      const token = localStorage.getItem('crm_auth_token');
      if (!token) return { allowed: false, message: 'Token não encontrado' };

      const response = await fetch('/api/billing/limits/check-users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: quantityToAdd })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          allowed: false,
          message: data.error || 'Limite atingido'
        };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Erro ao verificar limite de usuários:', error);
      return { allowed: false, message: 'Erro ao verificar limite' };
    }
  };

  const checkLeadLimit = async (quantityToAdd = 1): Promise<{allowed: boolean; message?: string}> => {
    try {
      const token = localStorage.getItem('crm_auth_token');
      if (!token) return { allowed: false, message: 'Token não encontrado' };

      const response = await fetch('/api/billing/limits/check-leads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: quantityToAdd })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          allowed: false,
          message: data.error || 'Limite atingido'
        };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Erro ao verificar limite de leads:', error);
      return { allowed: false, message: 'Erro ao verificar limite' };
    }
  };

  return {
    checkUserLimit,
    checkLeadLimit
  };
}