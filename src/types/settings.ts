export interface ProfileData {
  name: string;
  email: string;
  display_name?: string;
  description?: string;
  avatar_url?: string;
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  settings?: Record<string, unknown>;
}

export interface SystemStatistics {
  overview: {
    totalLeads: number;
    totalCampaigns: number;
    totalWebhooks: number;
    totalWhatsAppAccounts: number;
  };
  performance: {
    leadsThisMonth: number;
    wonLeads: number;
    lostLeads: number;
    activeLeads: number;
    conversionRate: number;
  };
  lastUpdated: string;
}

export interface NotificationSettings {
  newLeads: boolean;
  webhooks: boolean;
  statusChanges: boolean;
  campaignUpdates: boolean;
  systemAlerts: boolean;
}

export interface Notification {
  id: string;
  account_id: string;
  user_id?: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  title: string;
  message: string;
  action_url?: string;
  action_label?: string;
  is_read: boolean;
  is_dismissed: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: Record<string, unknown>;
  expires_at?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomStatus {
  id: string;
  name: string;
  color: string;
  order: number;
  is_initial: boolean;
  is_won: boolean;
  is_lost: boolean;
}

export interface LossReason {
  id: string;
  name: string;
}