import { api } from './api';

export interface PlanFeature {
  name: string;
  included: boolean;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  max_users: number | null;
  max_leads: number | null;
  features: PlanFeature[];
  is_active: boolean;
  is_default: boolean;
  trial_days: number;
  sort_order: number;
}

export interface Subscription {
  id: string;
  status: 'trial' | 'active' | 'canceled';
  current_period_start: string;
  current_period_end: string;
  trial_start?: string;
  trial_end?: string;
  cancel_at_period_end: boolean;
  quantity: number;
  unit_price: number;
  total_price: number;
  next_invoice_date?: string;
  plan: Plan;
}

export const billingService = {
  // Buscar todos os planos disponíveis
  async getPlans(): Promise<{ success: boolean; plans: Plan[] }> {
    const response = await api.get('/api/billing/plans');
    return response.data;
  },

  // Buscar assinatura atual
  async getCurrentSubscription(): Promise<{ success: boolean; subscription: Subscription | null }> {
    const response = await api.get('/api/billing/subscription');
    return response.data;
  },

  // Criar nova assinatura
  async createSubscription(planId: string, quantity: number = 1): Promise<{ success: boolean; subscription_id?: string; message?: string }> {
    const response = await api.post('/api/billing/subscription', {
      plan_id: planId,
      quantity: quantity
    });
    return response.data;
  },

  // Atualizar quantidade de usuários
  async updateSubscriptionQuantity(quantity: number): Promise<{ success: boolean; message?: string }> {
    const response = await api.put('/api/billing/subscription/quantity', {
      quantity: quantity
    });
    return response.data;
  },

  // Cancelar assinatura
  async cancelSubscription(cancelAtPeriodEnd: boolean = true): Promise<{ success: boolean; message?: string }> {
    const response = await api.post('/api/billing/subscription/cancel', {
      cancel_at_period_end: cancelAtPeriodEnd
    });
    return response.data;
  },

  // Verificar limites da conta
  async checkAccountLimits(): Promise<{
    success: boolean;
    limits: {
      max_users: number | null;
      max_leads: number | null;
      current_users: number;
      current_leads: number;
      users_limit_reached: boolean;
      leads_limit_reached: boolean;
    }
  }> {
    const response = await api.get('/api/billing/limits');
    return response.data;
  }
};