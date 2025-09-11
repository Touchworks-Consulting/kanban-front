export interface WhatsAppAccount {
  id: string;
  phone_id: string;
  account_name: string;
  phone_number: string;
  webhook_url?: string;
  verify_token?: string;
  access_token?: string;
  is_active: boolean;
  account_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateWhatsAppAccountDto {
  phone_id: string;
  account_name: string;
  phone_number: string;
}

export interface UpdateWhatsAppAccountDto {
  phone_id?: string;
  account_name?: string;
  phone_number?: string;
  is_active?: boolean;
}

export interface WebhookLog {
  id: string;
  phone_id: string;
  account_id: string;
  event_type: string;
  payload: any;
  processed: boolean;
  campaign_matched: string | null;
  lead_created: boolean;
  error: string | null;
  created_at: string;
}