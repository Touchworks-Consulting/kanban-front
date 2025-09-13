import { api } from './api';

export interface Account {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  avatar_url?: string;
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  role: 'owner' | 'admin' | 'member';
  permissions: Record<string, boolean>;
  is_active: boolean;
}

export interface CreateAccountDto {
  name: string;
  display_name?: string;
  description?: string;
  plan?: 'free' | 'basic' | 'pro' | 'enterprise';
}

export interface UpdateAccountDto {
  name?: string;
  display_name?: string;
  description?: string;
  avatar_url?: string;
}

export const accountService = {
  // Listar todas as contas do usuário
  async getUserAccounts(): Promise<{ accounts: Account[] }> {
    const response = await api.get('/api/accounts');
    return response.data;
  },

  // Obter conta atual
  async getCurrentAccount(): Promise<{ account: Account }> {
    const response = await api.get('/api/accounts/current');
    return response.data;
  },

  // Criar nova conta
  async createAccount(data: CreateAccountDto): Promise<{ account: Account }> {
    const response = await api.post('/api/accounts', data);
    return response.data;
  },

  // Atualizar conta
  async updateAccount(accountId: string, data: UpdateAccountDto): Promise<{ account: Account }> {
    const response = await api.put(`/api/accounts/${accountId}`, data);
    return response.data;
  },

  // Trocar contexto de conta
  async switchAccount(accountId: string): Promise<{ success: boolean; account: Account }> {
    const response = await api.post('/api/accounts/switch', { accountId });
    return response.data;
  }
};