import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services';
import type { LoginCredentials, RegisterData, UserAccount } from '../types';

interface AuthState {
  // State
  account: UserAccount | null;
  user: UserAccount | null;  // alias para compatibilidade
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
  updateUserData: (userData: Partial<UserAccount>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      account: null,
      user: null,
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
              user: user,  // alias para compatibilidade
              token: token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            // Sincronizar com localStorage legado para compatibilidade com axios interceptor
            localStorage.setItem('crm_auth_token', token);
            localStorage.setItem('crm_account_data', JSON.stringify(user));
          } else {
            // Isso pode acontecer se a resposta não vier como esperado
            throw new Error('Resposta de login inválida');
          }
        } catch (err) {
          const error = err as any;
          console.log('Login error details:', {
            error,
            response: error?.response,
            data: error?.response?.data,
            message: error?.response?.data?.message
          });

          // Melhor tratamento de mensagens de erro
          let errorMessage = 'Falha no login';

          if (error?.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error?.response?.data) {
            // Se data é uma string, usar diretamente
            errorMessage = typeof error.response.data === 'string'
              ? error.response.data
              : 'Credenciais inválidas';
          } else if (error?.message) {
            errorMessage = error.message;
          }

          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
            account: null,
            user: null,
            token: null,
          });
          throw new Error(errorMessage);
        }
      },

      register: async (data: RegisterData) => {
        console.log('🏪 AuthStore: Iniciando processo de registro');
        set({ isLoading: true, error: null });
        try {
          const { token, user } = await authService.register(data);
          console.log('🏪 AuthStore: Resposta do authService recebida:', {
            hasToken: !!token,
            hasUser: !!user,
            user
          });

          if (token && user) {
            console.log('🏪 AuthStore: Atualizando estado do store com dados de autenticação');
            set({
              account: user,
              user: user,  // alias para compatibilidade
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            // Sincronizar com localStorage legado para compatibilidade com axios interceptor
            localStorage.setItem('crm_auth_token', token);
            localStorage.setItem('crm_account_data', JSON.stringify(user));

            console.log('✅ AuthStore: Estado atualizado com sucesso - usuário logado automaticamente');
          } else {
            console.log('❌ AuthStore: Token ou user ausente na resposta');
            throw new Error('Resposta de registro inválida');
          }
        } catch (err) {
          const error = err as any;
          console.log('Register error details:', {
            error,
            response: error?.response,
            data: error?.response?.data,
            message: error?.response?.data?.message
          });

          // Melhor tratamento de mensagens de erro
          let errorMessage = 'Falha no registro';

          if (error?.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error?.response?.data) {
            // Se data é uma string, usar diretamente
            errorMessage = typeof error.response.data === 'string'
              ? error.response.data
              : 'Erro ao criar conta';
          } else if (error?.message) {
            errorMessage = error.message;
          }

          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
            account: null,
            user: null,
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
            user: null,
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
              user: account,  // alias para compatibilidade
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

      updateUserData: (userData: Partial<UserAccount>) => {
        const { account } = get();
        if (account) {
          const updatedAccount = { ...account, ...userData };
          set({
            account: updatedAccount,
            user: updatedAccount  // alias para compatibilidade
          });

          // Sincronizar com localStorage
          localStorage.setItem('crm_account_data', JSON.stringify(updatedAccount));
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        account: state.account,
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Initialize auth state on app start
export const initializeAuth = () => {
  console.log('🔧 Initializing auth state...');

  // Verifica se já existe dados no Zustand persist primeiro
  const currentState = useAuthStore.getState();

  if (currentState.isAuthenticated && currentState.token && currentState.account) {
    console.log('✅ Zustand persist has valid auth state, using it');
    // Sincronizar com localStorage legado para compatibilidade com axios interceptor
    localStorage.setItem('crm_auth_token', currentState.token);
    localStorage.setItem('crm_account_data', JSON.stringify(currentState.account));
    return;
  }

  // Fallback para dados do localStorage legado
  const token = authService.getToken();
  const account = authService.getCurrentAccount();

  

  if (token && account && !authService.isTokenExpired()) {
    console.log('✅ Valid auth data found in localStorage, setting authenticated state');
    useAuthStore.setState({
      account,
      user: account,  // alias para compatibilidade
      token,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  } else {
    console.log('❌ Invalid or expired auth data, clearing state');
    // Clear invalid auth data
    authService.clearAuthData();
    useAuthStore.setState({
      account: null,
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }
};
