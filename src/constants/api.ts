export const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  REFRESH: '/api/auth/refresh',
  LOGOUT: '/api/auth/logout',
  PROFILE: '/api/auth/verify',

  // Lead endpoints
  LEADS: '/api/leads',
  LEAD_BY_ID: (id: number | string) => `/api/leads/${id}`,
  LEAD_MOVE: (id: number | string) => `/api/leads/${id}/move`,
  LEAD_SEARCH: '/api/leads/search',
  LEAD_EXPORT: '/api/leads/export',

  // Kanban endpoints
  KANBAN_COLUMNS: '/api/kanban/columns',
  KANBAN_COLUMN_BY_ID: (id: number | string) => `/api/kanban/columns/${id}`,
  KANBAN_BOARD: '/api/kanban/board',

  // Dashboard endpoints
  DASHBOARD_STATS: '/api/dashboard/stats',
  DASHBOARD_CHARTS: '/api/dashboard/charts',

  // User endpoints
  USERS: '/api/users',
  USER_BY_ID: (id: number | string) => `/api/users/${id}`,

  // Billing endpoints
  BILLING_PLANS: '/api/billing/plans',
  BILLING_SUBSCRIPTION: '/api/billing/subscription',
  BILLING_SUBSCRIPTION_QUANTITY: '/api/billing/subscription/quantity',
  BILLING_SUBSCRIPTION_CANCEL: '/api/billing/subscription/cancel',
  BILLING_LIMITS: '/api/billing/limits',
  BILLING_LIMITS_STATUS: '/api/billing/limits/status',
  BILLING_LIMITS_CHECK_USERS: '/api/billing/limits/check-users',
  BILLING_LIMITS_CHECK_LEADS: '/api/billing/limits/check-leads',

  // Feedback endpoints
  FEEDBACK_SUBMIT: '/api/feedback/submit',
  FEEDBACK_PUBLIC_LIST: '/api/feedback/public/list',
  FEEDBACK_VOTE: (id: string) => `/api/feedback/${id}/vote`,
  FEEDBACK_CHECK_VOTE: (id: string) => `/api/feedback/${id}/vote/check`,
  FEEDBACK_ADMIN_VERIFY_CODE: '/api/feedback/admin/verify-code',
  FEEDBACK_ADMIN_STATS: '/api/feedback/admin/stats',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'crm_auth_token',
  REFRESH_TOKEN: 'crm_refresh_token',
  USER_DATA: 'crm_user_data',
  ACCOUNT_DATA: 'crm_account_data',
  THEME: 'crm_theme',
  SIDEBAR_STATE: 'crm_sidebar_state',
} as const;

export const DEFAULT_KANBAN_COLUMNS = [
  { name: 'Novo Lead', color: '#3B82F6', order: 1 },
  { name: 'Qualificado', color: '#F59E0B', order: 2 },
  { name: 'Proposta', color: '#8B5CF6', order: 3 },
  { name: 'Negociação', color: '#EF4444', order: 4 },
  { name: 'Fechado', color: '#10B981', order: 5 },
] as const;

export const LEAD_SOURCES = [
  'Website',
  'Google Ads',
  'Facebook Ads',
  'LinkedIn',
  'Instagram',
  'Email Marketing',
  'Referência',
  'Telefone',
  'WhatsApp',
  'Evento',
  'Outros',
] as const;

export const LEAD_STATUSES = [
  'novo',
  'qualificado',
  'proposta',
  'negociacao',
  'fechado-ganho',
  'fechado-perdido',
] as const;
