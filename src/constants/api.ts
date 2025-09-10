export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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
