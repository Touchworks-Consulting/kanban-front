import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../constants';
import type { ApiError } from '../types';

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
          const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
          const accountJson = localStorage.getItem(STORAGE_KEYS.ACCOUNT_DATA);

          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }

          if (accountJson) {
            const accountData = JSON.parse(accountJson);
            // Garante que o ID existe antes de adicioná-lo
            if (accountData && accountData.id) {
              config.headers['X-Tenant-ID'] = accountData.id;
            }
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
      (response: AxiosResponse) => response, // Deixando a resposta intacta por enquanto
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as RetryableAxiosConfig;
        
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          if (this.refreshing) {
            return new Promise((resolve) => {
              this.refreshQueue.push((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.api.request(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.refreshing = true;

          try {
            const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
            if (!refreshToken) {
              throw new Error('No refresh token');
            }

            const response = await this.api.post('/api/auth/refresh', {
              refreshToken,
            });

            const { token } = response.data.data;
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);

            this.refreshQueue.forEach((callback) => callback(token));
            this.refreshQueue = [];

            originalRequest.headers.Authorization = `Bearer ${token}`;
            return this.api.request(originalRequest);
          } catch (refreshError) {
            this.clearAuthData();
            window.location.href = '/login';
            return Promise.reject(refreshError);
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
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.ACCOUNT_DATA);
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
