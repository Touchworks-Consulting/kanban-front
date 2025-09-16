import type { User, Account } from './auth';

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

export interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  account: Account | null;
  token: string | null;
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
}

export type WithId<T> = T & { id: number };
export type WithTimestamps<T> = T & {
  createdAt: string;
  updatedAt: string;
};

export type CreateData<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateData<T> = Partial<CreateData<T>>;
