import { api } from './api';
import type { 
  WhatsAppAccount, 
  CreateWhatsAppAccountDto, 
  UpdateWhatsAppAccountDto,
  WebhookLog
} from '../types';

export const whatsappService = {
  // Get all WhatsApp accounts
  async getAccounts(params?: { is_active?: boolean }) {
    const response = await api.get('/api/whatsapp-accounts', { params });
    return response.data;
  },

  // Get single WhatsApp account
  async getAccount(id: string) {
    const response = await api.get(`/api/whatsapp-accounts/${id}`);
    return response.data;
  },

  // Create WhatsApp account
  async createAccount(data: CreateWhatsAppAccountDto) {
    const response = await api.post('/api/whatsapp-accounts', data);
    return response.data;
  },

  // Update WhatsApp account
  async updateAccount(id: string, data: UpdateWhatsAppAccountDto) {
    const response = await api.put(`/api/whatsapp-accounts/${id}`, data);
    return response.data;
  },

  // Delete WhatsApp account
  async deleteAccount(id: string) {
    const response = await api.delete(`/api/whatsapp-accounts/${id}`);
    return response.data;
  },

  // Test webhook connection
  async testWebhook(id: string) {
    const response = await api.post(`/api/whatsapp-accounts/${id}/test-webhook`);
    return response.data;
  },

  // Get webhook logs
  async getWebhookLogs(id: string, params?: { limit?: number }) {
    const response = await api.get(`/api/whatsapp-accounts/${id}/webhook-logs`, { params });
    return response.data;
  },
};