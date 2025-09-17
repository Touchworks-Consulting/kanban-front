import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../constants';
import type { ApiError } from '../types';
import { useAuthStore } from '../stores/auth';

interface RetryableAxiosConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

class ApiService {
  private api: AxiosInstance;
  private refreshing = false;
  private refreshQueue: Array<(token: string) => void> = [];

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        try {
          // Ler diretamente do Zustand store (mais confiável)
          const authState = useAuthStore.getState();
          let token = authState.token;
          let accountData = authState.account;

          console.log('🔧 Request interceptor (Zustand direct):', {
            url: config.url,
            method: config.method,
            hasToken: !!token,
            hasAccountData: !!accountData
          });

          // Fallback para localStorage legado se Zustand não tiver dados
          if (!token) {
            token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
            const accountJson = localStorage.getItem(STORAGE_KEYS.ACCOUNT_DATA);
            if (accountJson) {
              try {
                accountData = JSON.parse(accountJson);
              } catch (e) {
                console.log('❌ Erro ao fazer parse do account data:', e);
              }
            }
            console.log('🔧 Request interceptor (fallback):', {
              url: config.url,
              method: config.method,
              hasToken: !!token,
              hasAccountData: !!accountData
            });
          }

          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('✅ Token added to request');
          } else {
            console.log('❌ No token found in localStorage');
          }

          if (accountData && accountData.id) {
            config.headers['X-Tenant-ID'] = accountData.id;
            console.log('✅ Tenant ID added:', accountData.id);
          } else {
            console.log('❌ No account ID found in accountData');
          }
        } catch (error) {
          console.error('Erro ao processar dados do localStorage:', error);
          // Limpa dados corrompidos para evitar loops de erro
          this.clearAuthData();
          // Opcional: redirecionar para o login se a falha for crítica
          // window.location.href = '/login';
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as RetryableAxiosConfig;
        const status = error.response?.status;
        const url = originalRequest?.url || '';

        // Não tentar refresh em endpoints de auth básicos
        const isRefreshEndpoint = url.includes('/api/auth/refresh');
        const isLoginOrRegister = url.includes('/api/auth/login') || url.includes('/api/auth/register') || url.includes('/api/auth/logout');

        if (status === 401) {
          // Se já tentamos ou é endpoint crítico de auth, só limpar e seguir
            if (originalRequest._retry || isRefreshEndpoint || isLoginOrRegister) {
            this.clearAuthData();
            return Promise.reject(error);
          }

          // Impede múltiplos refresh concorrentes
          if (this.refreshing) {
            return new Promise((resolve) => {
              this.refreshQueue.push((token: string) => {
                const hdrs: any = originalRequest.headers || {};
                hdrs.Authorization = `Bearer ${token}`;
                originalRequest.headers = hdrs;
                resolve(this.api.request(originalRequest));
              });
            });
          }

          // Não tentar refresh se não há token salvo
          const existingToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
          if (!existingToken) {
            this.clearAuthData();
            return Promise.reject(error);
          }

          originalRequest._retry = true;
          this.refreshing = true;
          try {
            // Chama refresh simples que usa Authorization atual
            const refreshResponse = await this.api.post('/api/auth/refresh');
            const newToken = (refreshResponse.data && refreshResponse.data.token) || (refreshResponse.data?.data?.token);
            if (!newToken) throw new Error('Token de refresh ausente');
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken);

            // Reexecutar fila
            this.refreshQueue.forEach(cb => cb(newToken));
            this.refreshQueue = [];

            const hdrs: any = originalRequest.headers || {};
            hdrs.Authorization = `Bearer ${newToken}`;
            originalRequest.headers = hdrs;
            return this.api.request(originalRequest);
          } catch (refreshErr) {
            this.clearAuthData();
            return Promise.reject(refreshErr);
          } finally {
            this.refreshing = false;
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private clearAuthData() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.ACCOUNT_DATA);
    // Também limpa o Zustand persist
    localStorage.removeItem('auth-storage');
    console.log('🧹 Cleared all auth data from localStorage');
  }

  async get<T>(url: string, params?: Record<string, unknown>): Promise<AxiosResponse<T>> {
    return this.api.get<T>(url, { params });
  }

  async post<T>(url: string, data?: unknown): Promise<AxiosResponse<T>> {
    return this.api.post<T>(url, data);
  }

  async put<T>(url: string, data?: unknown): Promise<AxiosResponse<T>> {
    return this.api.put<T>(url, data);
  }

  async patch<T>(url: string, data?: unknown): Promise<AxiosResponse<T>> {
    return this.api.patch<T>(url, data);
  }

  async delete<T>(url: string): Promise<AxiosResponse<T>> {
    return this.api.delete<T>(url);
  }

  // Helper method to get raw axios instance
  getAxiosInstance(): AxiosInstance {
    return this.api;
  }
}

export const apiService = new ApiService();
export const api = apiService;
export default apiService;
