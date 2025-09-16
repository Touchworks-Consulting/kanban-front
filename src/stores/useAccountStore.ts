import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Account, CreateAccountDto, UpdateAccountDto } from '../services/account';
import { accountService } from '../services/account';

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
          set({ loading: true, error: null });
          const response = await accountService.switchAccount(accountId);
          
          if (response.success) {
            set({ 
              currentAccount: response.account,
              loading: false 
            });
            
            // Force refresh of other stores that depend on account context
            // This could be handled by other stores listening to account changes
            window.location.reload(); // Simple approach for now
          }
        } catch (error: any) {
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