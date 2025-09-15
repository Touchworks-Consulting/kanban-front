import { useState, useEffect } from 'react';
import {
  Crown,
  Users,
  Zap,
  Check,
  Star,
  CreditCard,
  Shield,
  HeartHandshake,
  Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuthStore } from '../stores/auth';
import { billingService, type Plan } from '../services/billing';
import { LoadingSpinner } from '../components/LoadingSpinner';


export function PlansPage() {
  const { account } = useAuthStore();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState('beta');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await billingService.getPlans();
      if (response.success) {
        setPlans(response.plans);
      } else {
        setError('Erro ao carregar planos');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar planos');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    if (planId === 'beta') return; // Já está no beta

    const plan = plans.find(p => p.id === planId);
    if (!plan?.is_active) {
      alert('Este plano estará disponível em breve! 🚀');
      return;
    }

    try {
      const response = await billingService.createSubscription(planId);
      if (response.success) {
        setSelectedPlan(planId);
        alert(response.message || 'Plano selecionado com sucesso!');
      } else {
        alert('Erro ao selecionar plano');
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao selecionar plano');
    }
  };

  const getCurrentPlan = () => {
    return plans.find(p => p.slug === 'beta'); // Durante beta, todos estão no beta
  };

  const currentPlan = getCurrentPlan();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
        <span className="ml-2">Carregando planos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
        <Button onClick={loadPlans}>Tentar Novamente</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Crown className="w-8 h-8 text-yellow-500" />
          Planos e Preços
        </h1>
        <p className="text-muted-foreground">
          Escolha o plano perfeito para sua equipe. Durante o beta, todos os recursos estão gratuitos!
        </p>
      </div>

      {/* Current Plan Status */}
      {currentPlan && (
        <div className="bg-card text-card-foreground rounded-lg border-2 border-green-500 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <HeartHandshake className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Seu plano atual: {currentPlan.name}</h3>
                <p className="text-muted-foreground">
                  {currentPlan.description}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">R$ {currentPlan.price}</div>
              <div className="text-sm text-muted-foreground">{currentPlan.period}</div>
            </div>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-card text-card-foreground rounded-lg border p-6 transition-all hover:scale-105 ${
              plan.slug === 'professional'
                ? 'border-primary shadow-lg scale-105'
                : plan.slug === 'beta'
                ? 'border-green-500 shadow-lg'
                : 'border-border hover:border-primary/50'
            } ${!plan.is_active ? 'opacity-75' : ''}`}
          >
            {plan.slug === 'professional' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Recomendado
                </span>
              </div>
            )}

            {!plan.is_active && (
              <div className="absolute -top-3 right-4">
                <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Em Breve
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-2">
                <span className="text-3xl font-bold">R$ {plan.price.toFixed(2)}</span>
                <span className="text-muted-foreground text-sm">
                  /{plan.slug === 'beta' ? 'durante o beta' : 'por usuário/mês'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>
                  {plan.max_users === null ? 'Usuários ilimitados' : `Até ${plan.max_users} usuários`}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-muted-foreground" />
                <span>
                  {plan.max_leads === null ? 'Leads ilimitados' : `Até ${plan.max_leads} leads`}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className={`w-4 h-4 ${feature.included ? 'text-green-500' : 'text-muted-foreground'}`} />
                  <span className={`text-sm ${!feature.included ? 'text-muted-foreground line-through' : ''}`}>
                    {feature.name}
                  </span>
                </div>
              ))}
            </div>

            <Button
              onClick={() => handleSelectPlan(plan.id)}
              disabled={plan.slug === 'beta' || !plan.is_active}
              className="w-full"
              variant={plan.slug === 'beta' ? 'default' : plan.slug === 'professional' ? 'default' : 'outline'}
            >
              {plan.slug === 'beta' ? (
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Plano Atual
                </span>
              ) : !plan.is_active ? (
                'Em Breve'
              ) : (
                <span className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Selecionar Plano
                </span>
              )}
            </Button>
          </div>
        ))}
      </div>

      {/* FAQ/Info Section */}
      <div className="bg-card text-card-foreground rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Perguntas Frequentes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Quando os planos pagos estarão disponíveis?</h3>
            <p className="text-sm text-muted-foreground">
              Os planos pagos serão lançados após o período beta. Todos os usuários beta terão acesso
              antecipado com descontos especiais.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Posso cancelar a qualquer momento?</h3>
            <p className="text-sm text-muted-foreground">
              Sim! Todos os planos serão mensais e poderão ser cancelados a qualquer momento,
              sem taxas ou penalidades.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Haverá migração automática?</h3>
            <p className="text-sm text-muted-foreground">
              Não. Ao final do beta, você escolherá qual plano deseja continuar.
              Seus dados permanecerão seguros durante a transição.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Oferecerão descontos anuais?</h3>
            <p className="text-sm text-muted-foreground">
              Sim! Planejamos oferecer descontos significativos para pagamentos anuais
              em todos os planos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}