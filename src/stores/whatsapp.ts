import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { 
  WhatsAppAccount,
  CreateWhatsAppAccountDto,
  UpdateWhatsAppAccountDto,
  WebhookLog
} from '../types';
import { whatsappService } from '../services';

interface WhatsAppState {
  // State
  accounts: WhatsAppAccount[];
  selectedAccount: WhatsAppAccount | null;
  webhookLogs: WebhookLog[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchAccounts: (params?: { is_active?: boolean }) => Promise<void>;
  fetchAccount: (id: string) => Promise<void>;
  createAccount: (data: CreateWhatsAppAccountDto) => Promise<void>;
  updateAccount: (id: string, data: UpdateWhatsAppAccountDto) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  testWebhook: (id: string) => Promise<any>;
  fetchWebhookLogs: (id: string) => Promise<void>;
  
  clearError: () => void;
  setSelectedAccount: (account: WhatsAppAccount | null) => void;
}

export const useWhatsAppStore = create<WhatsAppState>()(
  devtools(
    (set, get) => ({
      // Initial state
      accounts: [],
      selectedAccount: null,
      webhookLogs: [],
      loading: false,
      error: null,

      // Fetch accounts
      fetchAccounts: async (params) => {
        try {
          set({ loading: true, error: null });
          const response = await whatsappService.getAccounts(params);
          set({ accounts: response.accounts, loading: false });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.error || 'Erro ao carregar contas WhatsApp', 
            loading: false 
          });
        }
      },

      // Fetch single account
      fetchAccount: async (id: string) => {
        try {
          set({ loading: true, error: null });
          const response = await whatsappService.getAccount(id);
          set({ 
            selectedAccount: response.account,
            loading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.error || 'Erro ao carregar conta WhatsApp', 
            loading: false 
          });
        }
      },

      // Create account
      createAccount: async (data: CreateWhatsAppAccountDto) => {
        try {
          set({ error: null });
          const response = await whatsappService.createAccount(data);
          
          const { accounts } = get();
          set({
            accounts: [response.account, ...accounts]
          });
        } catch (error: any) {
          set({ error: error.response?.data?.error || 'Erro ao criar conta WhatsApp' });
          throw error;
        }
      },

      // Update account
      updateAccount: async (id: string, data: UpdateWhatsAppAccountDto) => {
        try {
          set({ error: null });
          const response = await whatsappService.updateAccount(id, data);
          
          const { accounts } = get();
          const updatedAccounts = accounts.map(account =>
            account.id === id ? response.account : account
          );
          
          set({
            accounts: updatedAccounts,
            selectedAccount: response.account
          });
        } catch (error: any) {
          set({ error: error.response?.data?.error || 'Erro ao atualizar conta WhatsApp' });
          throw error;
        }
      },

      // Delete account
      deleteAccount: async (id: string) => {
        try {
          set({ error: null });
          await whatsappService.deleteAccount(id);
          
          const { accounts } = get();
          set({
            accounts: accounts.filter(account => account.id !== id),
            selectedAccount: null
          });
        } catch (error: any) {
          set({ error: error.response?.data?.error || 'Erro ao deletar conta WhatsApp' });
          throw error;
        }
      },

      // Test webhook
      testWebhook: async (id: string) => {
        try {
          set({ error: null });
          const response = await whatsappService.testWebhook(id);
          return response;
        } catch (error: any) {
          set({ error: error.response?.data?.error || 'Erro ao testar webhook' });
          throw error;
        }
      },

      // Fetch webhook logs
      fetchWebhookLogs: async (id: string) => {
        try {
          set({ loading: true, error: null });
          const response = await whatsappService.getWebhookLogs(id);
          set({ webhookLogs: response.logs, loading: false });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.error || 'Erro ao carregar logs do webhook', 
            loading: false 
          });
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Set selected account
      setSelectedAccount: (account: WhatsAppAccount | null) => set({ selectedAccount: account }),
    }),
    {
      name: 'whatsapp-store',
    }
  )
);