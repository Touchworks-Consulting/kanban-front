import type { Lead } from './kanban';

export interface LeadActivity {
  id: string;
  lead_id: string;
  user_id?: string;
  type: 'call' | 'email' | 'whatsapp' | 'meeting' | 'note' | 'task' | 'follow_up' |
        'status_change' | 'contact_added' | 'file_uploaded' | 'lead_created' |
        'lead_updated' | 'column_moved';
  title: string;
  description?: string;
  duration_minutes?: number;
  status: 'pending' | 'completed' | 'cancelled';
  scheduled_for?: string;
  completed_at?: string;
  metadata: Record<string, any>;
  user?: {
    id: string;
    name: string;
    email?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface LeadContact {
  id: string;
  lead_id: string;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  notes?: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeadFile {
  id: string;
  lead_id: string;
  original_filename: string;
  stored_filename: string;
  file_path: string;
  file_size: number;
  file_type: 'image' | 'document' | 'spreadsheet' | 'presentation' | 'pdf' | 'text' | 'other';
  mime_type: string;
  virus_scan_status: 'pending' | 'clean' | 'infected' | 'error';
  virus_scan_result?: string;
  is_public: boolean;
  download_count: number;
  tags: string[];
  description?: string;
  uploadedBy?: {
    id: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface LeadModalData {
  timeline: LeadActivity[];
  contacts: LeadContact[];
  files: LeadFile[];
  stats?: {
    totalActivities: number;
    pendingTasks: number;
    totalContacts: number;
    totalFiles: number;
  };
}

export interface LeadStats {
  activitiesCount: number;
  contactsCount: number;
  filesCount: number;
  lastActivity?: {
    date: string;
    type: string;
    title: string;
  };
}

export interface TimelineResponse {
  activities: LeadActivity[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CreateActivityRequest {
  type: 'call' | 'email' | 'whatsapp' | 'meeting' | 'note' | 'task' | 'follow_up';
  title: string;
  description?: string;
  duration_minutes?: number;
  scheduled_for?: string;
  metadata?: Record<string, any>;
}

export interface CreateContactRequest {
  type: 'phone' | 'email';
  value: string;
  label?: 'primary' | 'secondary' | 'work' | 'personal' | 'mobile' | 'home' | 'whatsapp' | 'commercial';
  is_primary?: boolean;
}

export interface UpdateLeadRequest {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  status?: string;
  platform?: string;
  column_id?: string;
  assigned_to_user_id?: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}