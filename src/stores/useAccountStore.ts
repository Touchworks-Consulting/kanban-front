import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Account, CreateAccountDto, UpdateAccountDto } from '../services/account';
import { accountService } from '../services/account';
import { useAuthStore } from './auth';

interface AccountState {
  // State
  currentAccount: Account | null;
  accounts: Account[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchAccounts: () => Promise<void>;
  fetchCurrentAccount: () => Promise<void>;
  switchAccount: (accountId: string) => Promise<void>;
  createAccount: (data: CreateAccountDto) => Promise<void>;
  updateAccount: (accountId: string, data: UpdateAccountDto) => Promise<void>;
  clearError: () => void;
}

export const useAccountStore = create<AccountState>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentAccount: null,
      accounts: [],
      loading: false,
      error: null,

      // Fetch all user accounts
      fetchAccounts: async () => {
        try {
          set({ loading: true, error: null });
          const response = await accountService.getUserAccounts();
          set({ accounts: response.accounts, loading: false });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.error || 'Erro ao carregar contas',
            loading: false 
          });
        }
      },

      // Fetch current account
      fetchCurrentAccount: async () => {
        try {
          set({ error: null });
          const response = await accountService.getCurrentAccount();
          set({ currentAccount: response.account });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.error || 'Erro ao carregar conta atual',
            currentAccount: null 
          });
        }
      },

      // Switch account context
      switchAccount: async (accountId: string) => {
        try {
          console.log('🔄 AccountStore: Iniciando switch para conta', accountId);
          set({ loading: true, error: null });
          const response = await accountService.switchAccount(accountId);

          if (response.success) {
            console.log('✅ AccountStore: Switch bem-sucedido, sincronizando com AuthStore', response.account);

            set({
              currentAccount: response.account,
              loading: false
            });

            // Sincronizar com o AuthStore para manter consistência
            const authStore = useAuthStore.getState();
            if (authStore.account && authStore.isAuthenticated) {
              console.log('🔄 AccountStore: Atualizando account no AuthStore');

              // Criar um objeto UserAccount compatível com AuthStore
              const syncedAccount = {
                ...authStore.account,
                id: response.account.id,
                account_id: response.account.id,
                name: response.account.display_name || response.account.name,
                email: authStore.account.email, // Manter email do usuário
                user_id: authStore.account.user_id, // Manter user_id original
                role: response.account.role,
                permissions: response.account.permissions
              };

              // Usar o setState do Zustand para trigger re-render
              useAuthStore.setState({ account: syncedAccount });

              // Atualizar localStorage para persistência
              localStorage.setItem('crm_account_data', JSON.stringify(syncedAccount));

              console.log('✅ AccountStore: AuthStore sincronizado com sucesso', syncedAccount);
            }

            // Notificar outros sistemas sobre a mudança de conta
            window.dispatchEvent(new CustomEvent('accountChanged', {
              detail: { newAccountId: response.account.id }
            }));
          }
        } catch (error: any) {
          console.error('❌ AccountStore: Erro no switch de conta:', error);
          set({
            error: error.response?.data?.error || 'Erro ao trocar conta',
            loading: false
          });
        }
      },

      // Create new account
      createAccount: async (data: CreateAccountDto) => {
        try {
          set({ loading: true, error: null });
          const response = await accountService.createAccount(data);
          
          const { accounts } = get();
          set({ 
            accounts: [...accounts, response.account],
            loading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.error || 'Erro ao criar conta',
            loading: false 
          });
          throw error;
        }
      },

      // Update account
      updateAccount: async (accountId: string, data: UpdateAccountDto) => {
        try {
          set({ loading: true, error: null });
          const response = await accountService.updateAccount(accountId, data);
          
          const { accounts, currentAccount } = get();
          const updatedAccounts = accounts.map(account =>
            account.id === accountId ? response.account : account
          );
          
          set({ 
            accounts: updatedAccounts,
            currentAccount: currentAccount?.id === accountId ? response.account : currentAccount,
            loading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.error || 'Erro ao atualizar conta',
            loading: false 
          });
          throw error;
        }
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'account-store',
    }
  )
);