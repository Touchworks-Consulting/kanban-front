import { api } from './api';
import type { 
  Campaign,
  TriggerPhrase,
  WebhookLog,
  CreateCampaignDto,
  UpdateCampaignDto,
  CreateTriggerPhraseDto,
  UpdateTriggerPhraseDto,
  PhraseMatchResult,
  CampaignStats
} from '../types';

export const campaignsService = {
  // Campaigns
  async getCampaigns(params?: {
    platform?: string;
    is_active?: boolean;
  }): Promise<{ campaigns: Campaign[] }> {
    const response = await api.get('/api/campaigns', { params });
    return response.data;
  },

  async getCampaign(id: string): Promise<{ campaign: Campaign }> {
    const response = await api.get(`/api/campaigns/${id}`);
    return response.data;
  },

  async createCampaign(data: CreateCampaignDto): Promise<{ campaign: Campaign }> {
    const response = await api.post('/api/campaigns', data);
    return response.data;
  },

  async updateCampaign(id: string, data: UpdateCampaignDto): Promise<{ campaign: Campaign }> {
    const response = await api.put(`/api/campaigns/${id}`, data);
    return response.data;
  },

  async deleteCampaign(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/api/campaigns/${id}`);
    return response.data;
  },

  // Trigger Phrases
  async getTriggerPhrases(campaignId: string): Promise<{ phrases: TriggerPhrase[] }> {
    const response = await api.get(`/api/campaigns/${campaignId}/phrases`);
    return response.data;
  },

  async createTriggerPhrase(campaignId: string, data: CreateTriggerPhraseDto): Promise<{ phrase: TriggerPhrase }> {
    const response = await api.post(`/api/campaigns/${campaignId}/phrases`, data);
    return response.data;
  },

  async updateTriggerPhrase(phraseId: string, data: UpdateTriggerPhraseDto): Promise<{ phrase: TriggerPhrase }> {
    const response = await api.put(`/api/phrases/${phraseId}`, data);
    return response.data;
  },

  async deleteTriggerPhrase(phraseId: string): Promise<{ message: string }> {
    const response = await api.delete(`/api/phrases/${phraseId}`);
    return response.data;
  },

  // Test phrase matching
  async testPhraseMatch(message: string): Promise<PhraseMatchResult> {
    const response = await api.post('/api/campaigns/test-match', { message });
    return response.data;
  },

  // 📊 RELATÓRIO DE FRASES MAIS EFICAZES
  async getMostEffectivePhrases(campaignId: string, dateRange: string = '30'): Promise<{
    campaign_name: string;
    date_range: string;
    total_leads: number;
    effective_phrases: Array<{
      phrase: string;
      original_phrase: string;
      volume: number;
      percentage: string;
    }>;
  }> {
    const response = await api.get(`/api/campaigns/${campaignId}/effective-phrases`, {
      params: { date_range: dateRange }
    });
    return response.data;
  },

  // 🔍 DEBUG RELATÓRIOS DA CAMPANHA
  async debugCampaignReports(campaignId: string): Promise<any> {
    const response = await api.get(`/api/campaigns/${campaignId}/debug-reports`);
    return response.data;
  },

  // 📊 DADOS DOS GRÁFICOS
  async getCampaignChartData(campaignId: string, dateRange: string = '30'): Promise<{
    campaign_name: string;
    date_range: string;
    daily_data: Array<{
      date: string;
      leads: number;
      day: string;
    }>;
    hourly_data: Array<{
      hour: string;
      leads: number;
      hourNumber: number;
    }>;
    total_leads: number;
    peak_hour: { hour: string; leads: number; };
  }> {
    const response = await api.get(`/api/campaigns/${campaignId}/chart-data`, {
      params: { date_range: dateRange }
    });
    return response.data;
  },

  // Webhook simulation (for testing)
  async simulateWhatsAppWebhook(data: {
    phone_id: string;
    from: string;
    message: string;
    contact_name?: string;
  }): Promise<{ success: boolean }> {
    const webhookData = {
      entry: [{
        changes: [{
          field: 'messages',
          value: {
            metadata: { phone_number_id: data.phone_id },
            messages: [{
              from: data.from,
              text: { body: data.message },
              type: 'text',
              id: `msg_${Date.now()}`,
              timestamp: Math.floor(Date.now() / 1000).toString()
            }],
            contacts: data.contact_name ? [{
              wa_id: data.from,
              profile: { name: data.contact_name }
            }] : []
          }
        }]
      }]
    };

    const response = await api.post('/api/webhook/whatsapp', webhookData);
    return response.data;
  },

  // Analytics and Stats
  async getCampaignStats(): Promise<CampaignStats> {
    // This would be a real endpoint in production
    // For now, we'll calculate from campaigns data
    const { campaigns } = await this.getCampaigns();
    
    return {
      total_campaigns: campaigns.length,
      active_campaigns: campaigns.filter(c => c.is_active).length,
      total_leads_generated: campaigns.reduce((sum, c) => sum + (c.stats?.total_leads || 0), 0),
      leads_this_month: campaigns.reduce((sum, c) => sum + (c.stats?.total_leads || 0), 0), // Simplified
      top_performing_campaigns: campaigns
        .filter(c => c.stats && c.stats.total_leads > 0)
        .sort((a, b) => (b.stats?.total_leads || 0) - (a.stats?.total_leads || 0))
        .slice(0, 5)
        .map(campaign => ({
          campaign,
          leads_count: campaign.stats?.total_leads || 0,
          conversion_rate: 0.15 // Mock conversion rate
        }))
    };
  }
};