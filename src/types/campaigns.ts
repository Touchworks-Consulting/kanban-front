export interface Campaign {
  id: string;
  name: string;
  platform: 'Meta' | 'Google';
  channel: string;
  creative_code: string;
  description?: string;
  is_active: boolean;
  account_id: string;
  created_at: string;
  updated_at: string;
  stats?: {
    total_phrases: number;
    total_leads: number;
    active_phrases: number;
  };
  trigger_phrases?: TriggerPhrase[];
}

export interface TriggerPhrase {
  id: string;
  phrase: string;
  keywords: string[];
  campaign_id: string;
  priority: number;
  is_active: boolean;
  account_id: string;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppAccount {
  id: string;
  phone_id: string;
  account_name: string;
  phone_number: string;
  is_active: boolean;
  account_id: string;
  created_at: string;
  updated_at: string;
}

export interface WebhookLog {
  id: string;
  webhook_type: 'whatsapp';
  raw_data: any;
  processed: boolean;
  phone_id?: string;
  account_id?: string;
  created_at: string;
}

export interface CreateCampaignDto {
  name: string;
  platform: 'Meta' | 'Google';
  channel: string;
  creative_code?: string;
  description?: string;
  trigger_phrases?: Array<{
    phrase: string;
    keywords: string[];
    priority?: number;
  }>;
}

export interface UpdateCampaignDto extends Partial<CreateCampaignDto> {
  is_active?: boolean;
}

export interface CreateTriggerPhraseDto {
  phrase: string;
  keywords: string[];
  priority?: number;
}

export interface UpdateTriggerPhraseDto extends Partial<CreateTriggerPhraseDto> {
  is_active?: boolean;
}

export interface PhraseMatchResult {
  match_found: boolean;
  phrase?: TriggerPhrase;
  campaign?: Campaign;
  confidence?: number;
  match_type?: 'exact' | 'keyword';
  matched_keywords?: string[];
  message?: string;
}

export interface CampaignStats {
  total_campaigns: number;
  active_campaigns: number;
  total_leads_generated: number;
  leads_this_month: number;
  top_performing_campaigns: Array<{
    campaign: Campaign;
    leads_count: number;
    conversion_rate: number;
  }>;
}

// Plataformas e canais disponíveis
export const PLATFORMS = ['Meta', 'Google'] as const;

export const CHANNELS = {
  Meta: ['Instagram', 'Facebook', 'WhatsApp', 'Messenger'],
  Google: ['Google Ads', 'YouTube', 'Gmail', 'Google Shopping']
} as const;

export type Platform = typeof PLATFORMS[number];
export type Channel = typeof CHANNELS[Platform][number];