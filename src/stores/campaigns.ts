import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { 
  Campaign,
  TriggerPhrase,
  CreateCampaignDto,
  UpdateCampaignDto,
  CreateTriggerPhraseDto,
  UpdateTriggerPhraseDto,
  PhraseMatchResult,
  CampaignStats
} from '../types';
import { campaignsService } from '../services';

interface CampaignsState {
  // State
  campaigns: Campaign[];
  selectedCampaign: Campaign | null;
  triggerPhrases: TriggerPhrase[];
  stats: CampaignStats | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchCampaigns: (params?: { platform?: string; is_active?: boolean }) => Promise<void>;
  fetchCampaign: (id: string) => Promise<void>;
  createCampaign: (data: CreateCampaignDto) => Promise<void>;
  updateCampaign: (id: string, data: UpdateCampaignDto) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  
  fetchTriggerPhrases: (campaignId: string) => Promise<void>;
  createTriggerPhrase: (campaignId: string, data: CreateTriggerPhraseDto) => Promise<void>;
  updateTriggerPhrase: (phraseId: string, data: UpdateTriggerPhraseDto) => Promise<void>;
  deleteTriggerPhrase: (phraseId: string) => Promise<void>;
  
  testPhraseMatch: (message: string) => Promise<PhraseMatchResult>;
  simulateWebhook: (data: any) => Promise<void>;
  fetchStats: () => Promise<void>;
  
  clearError: () => void;
  setSelectedCampaign: (campaign: Campaign | null) => void;
}

export const useCampaignsStore = create<CampaignsState>()(
  devtools(
    (set, get) => ({
      // Initial state
      campaigns: [],
      selectedCampaign: null,
      triggerPhrases: [],
      stats: null,
      loading: false,
      error: null,

      // Fetch campaigns
      fetchCampaigns: async (params) => {
        try {
          set({ loading: true, error: null });
          const response = await campaignsService.getCampaigns(params);
          set({ campaigns: response.campaigns, loading: false });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.error || 'Erro ao carregar campanhas', 
            loading: false 
          });
        }
      },

      // Fetch single campaign
      fetchCampaign: async (id: string) => {
        try {
          set({ loading: true, error: null });
          const response = await campaignsService.getCampaign(id);
          set({ 
            selectedCampaign: response.campaign,
            triggerPhrases: response.campaign.trigger_phrases || [],
            loading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.error || 'Erro ao carregar campanha', 
            loading: false 
          });
        }
      },

      // Create campaign
      createCampaign: async (data: CreateCampaignDto) => {
        try {
          set({ error: null });
          const response = await campaignsService.createCampaign(data);
          
          const { campaigns } = get();
          set({
            campaigns: [response.campaign, ...campaigns]
          });
        } catch (error: any) {
          set({ error: error.response?.data?.error || 'Erro ao criar campanha' });
          throw error;
        }
      },

      // Update campaign
      updateCampaign: async (id: string, data: UpdateCampaignDto) => {
        try {
          set({ error: null });
          const response = await campaignsService.updateCampaign(id, data);
          
          const { campaigns } = get();
          const updatedCampaigns = campaigns.map(campaign =>
            campaign.id === id ? response.campaign : campaign
          );
          
          set({
            campaigns: updatedCampaigns,
            selectedCampaign: response.campaign
          });
        } catch (error: any) {
          set({ error: error.response?.data?.error || 'Erro ao atualizar campanha' });
          throw error;
        }
      },

      // Delete campaign
      deleteCampaign: async (id: string) => {
        try {
          set({ error: null });
          await campaignsService.deleteCampaign(id);
          
          const { campaigns } = get();
          set({
            campaigns: campaigns.filter(campaign => campaign.id !== id),
            selectedCampaign: null
          });
        } catch (error: any) {
          set({ error: error.response?.data?.error || 'Erro ao deletar campanha' });
          throw error;
        }
      },

      // Fetch trigger phrases
      fetchTriggerPhrases: async (campaignId: string) => {
        try {
          set({ loading: true, error: null });
          const response = await campaignsService.getTriggerPhrases(campaignId);
          set({ triggerPhrases: response.phrases, loading: false });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.error || 'Erro ao carregar frases gatilho', 
            loading: false 
          });
        }
      },

      // Create trigger phrase
      createTriggerPhrase: async (campaignId: string, data: CreateTriggerPhraseDto) => {
        try {
          set({ error: null });
          const response = await campaignsService.createTriggerPhrase(campaignId, data);
          
          const { triggerPhrases } = get();
          set({
            triggerPhrases: [...triggerPhrases, response.phrase]
          });
        } catch (error: any) {
          set({ error: error.response?.data?.error || 'Erro ao criar frase gatilho' });
          throw error;
        }
      },

      // Update trigger phrase
      updateTriggerPhrase: async (phraseId: string, data: UpdateTriggerPhraseDto) => {
        try {
          set({ error: null });
          const response = await campaignsService.updateTriggerPhrase(phraseId, data);
          
          const { triggerPhrases } = get();
          const updatedPhrases = triggerPhrases.map(phrase =>
            phrase.id === phraseId ? response.phrase : phrase
          );
          
          set({ triggerPhrases: updatedPhrases });
        } catch (error: any) {
          set({ error: error.response?.data?.error || 'Erro ao atualizar frase gatilho' });
          throw error;
        }
      },

      // Delete trigger phrase
      deleteTriggerPhrase: async (phraseId: string) => {
        try {
          set({ error: null });
          await campaignsService.deleteTriggerPhrase(phraseId);
          
          const { triggerPhrases } = get();
          set({
            triggerPhrases: triggerPhrases.filter(phrase => phrase.id !== phraseId)
          });
        } catch (error: any) {
          set({ error: error.response?.data?.error || 'Erro ao deletar frase gatilho' });
          throw error;
        }
      },

      // Test phrase match
      testPhraseMatch: async (message: string) => {
        try {
          set({ error: null });
          return await campaignsService.testPhraseMatch(message);
        } catch (error: any) {
          set({ error: error.response?.data?.error || 'Erro ao testar frase' });
          throw error;
        }
      },

      // Simulate webhook
      simulateWebhook: async (data: any) => {
        try {
          set({ error: null });
          await campaignsService.simulateWhatsAppWebhook(data);
        } catch (error: any) {
          set({ error: error.response?.data?.error || 'Erro ao simular webhook' });
          throw error;
        }
      },

      // Fetch stats
      fetchStats: async () => {
        try {
          set({ loading: true, error: null });
          const stats = await campaignsService.getCampaignStats();
          set({ stats, loading: false });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.error || 'Erro ao carregar estatísticas', 
            loading: false 
          });
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Set selected campaign
      setSelectedCampaign: (campaign: Campaign | null) => set({ selectedCampaign: campaign }),
    }),
    {
      name: 'campaigns-store',
    }
  )
);