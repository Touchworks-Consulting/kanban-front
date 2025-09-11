import { apiService } from './api';
import { API_ENDPOINTS, STORAGE_KEYS } from '../constants';
import type { LoginCredentials, RegisterData, AuthResponse, UserAccount } from '../types';

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(
      '/api/auth/login',
      credentials
    );

    const authData = response.data;

    // Store auth data if login was successful
    if (authData.token && authData.user) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, authData.token);
      localStorage.setItem(STORAGE_KEYS.ACCOUNT_DATA, JSON.stringify(authData.user));
    }

    return authData;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(
      API_ENDPOINTS.REGISTER,
      data
    );
    
    const authData = response.data;

    // Store auth data if registration was successful
    if (authData.token && authData.user) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, authData.token);
      localStorage.setItem(STORAGE_KEYS.ACCOUNT_DATA, JSON.stringify(authData.user));
    }

    return authData;
  }

  async logout(): Promise<void> {
    try {
      await apiService.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthData();
    }
  }

  async refreshToken(): Promise<string> {
    const response = await apiService.post<{ token: string }>(
      API_ENDPOINTS.REFRESH
    );

    const newToken = response.data.token;
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken);

    return newToken;
  }

  async getProfile(): Promise<UserAccount> {
    const response = await apiService.get<{ account: UserAccount }>(API_ENDPOINTS.PROFILE);
    return response.data.account;
  }

  getCurrentUser(): UserAccount | null {
    const accountData = localStorage.getItem(STORAGE_KEYS.ACCOUNT_DATA);
    return accountData ? JSON.parse(accountData) : null;
  }

  getCurrentAccount(): UserAccount | null {
    const accountData = localStorage.getItem(STORAGE_KEYS.ACCOUNT_DATA);
    return accountData ? JSON.parse(accountData) : null;
  }

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const account = this.getCurrentAccount();
    return !!(token && account);
  }

  clearAuthData(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ACCOUNT_DATA);
  }

  // Check if token is expired (basic check)
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }
}

export const authService = new AuthService();
export default authService;
