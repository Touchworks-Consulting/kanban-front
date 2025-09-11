import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services';
import type { LoginCredentials, RegisterData, UserAccount } from '../types';

interface AuthState {
  // State
  account: UserAccount | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      account: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(credentials);
          // A resposta da API agora é o objeto direto com token e user
          const { token, user } = response;
          
          if (token && user) {
            set({
              account: user,
              token: token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            // Isso pode acontecer se a resposta não vier como esperado
            throw new Error('Resposta de login inválida');
          }
        } catch (err) {
          const error = err as any;
          const errorMessage = error?.response?.data?.message || error.message || 'Falha no login';
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
            account: null,
            token: null,
          });
          throw new Error(errorMessage);
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          const { token, user } = await authService.register(data);
          if (token && user) {
            set({
              account: user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error('Resposta de registro inválida');
          }
        } catch (err) {
          const error = err as any;
          const errorMessage = error?.response?.data?.message || error.message || 'Falha no registro';
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
          });
          throw new Error(errorMessage);
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            account: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      refreshAuth: async () => {
        const { token } = get();
        
        if (!token || authService.isTokenExpired()) {
          try {
            const newToken = await authService.refreshToken();
            const account = await authService.getProfile();
            
            set({
              token: newToken,
              account,
              isAuthenticated: true,
            });
          } catch (error) {
            console.error('Token refresh failed:', error);
            get().logout();
          }
        }
      },

      clearError: () => set({ error: null }),
      
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        account: state.account,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Initialize auth state on app start
export const initializeAuth = () => {
  if (authService.isAuthenticated() && !authService.isTokenExpired()) {
    const account = authService.getCurrentAccount();
    const token = authService.getToken();
    
    if (account && token) {
      useAuthStore.setState({
        account,
        token,
        isAuthenticated: true,
      });
    }
  } else {
    // Clear invalid auth data
    authService.clearAuthData();
    useAuthStore.setState({
      account: null,
      token: null,
      isAuthenticated: false,
    });
  }
};
