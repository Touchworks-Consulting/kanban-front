import { api } from './api';

export interface ActivityCounts {
  total_pending: number;
  today: number;
  overdue: number;
  has_tasks: boolean;
  has_overdue: boolean;
  has_today: boolean;
}

export interface LeadActivityCounts {
  lead_id: string;
  counts: ActivityCounts;
}

export interface Activity {
  id: string;
  lead_id: string;
  user_id: string;
  activity_type: 'call' | 'email' | 'whatsapp' | 'meeting' | 'note' | 'task' | 'follow_up';
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'completed' | 'cancelled';
  scheduled_for?: string;
  completed_at?: string;
  reminder_at?: string;
  is_overdue: boolean;
  duration_minutes?: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  lead?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
}

export interface CreateActivityDto {
  activity_type: Activity['activity_type'];
  title: string;
  description?: string;
  priority?: Activity['priority'];
  scheduled_for?: string;
  reminder_at?: string;
  duration_minutes?: number;
  status?: Activity['status'];
}

export interface UpdateActivityDto extends Partial<CreateActivityDto> {
  completed_at?: string;
}

export interface ActivityListResponse {
  success: boolean;
  activities: Activity[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ActivityCountsResponse {
  success: boolean;
  lead_id: string;
  counts: ActivityCounts;
}

export interface BulkActivityCountsResponse {
  success: boolean;
  lead_counts: LeadActivityCounts[];
}

export const activityService = {
  // Get activities for a specific lead
  async getLeadActivities(
    leadId: string,
    params?: {
      status?: string;
      type?: string;
      priority?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<ActivityListResponse> {
    const response = await api.get(`/api/leads/${leadId}/activities`, {
      params
    });
    return response.data;
  },

  // Create new activity
  async createActivity(leadId: string, data: CreateActivityDto): Promise<{ success: boolean; activity: Activity; message: string }> {
    const response = await api.post(`/api/leads/${leadId}/activities`, data);
    return response.data;
  },

  // Update activity
  async updateActivity(activityId: string, data: UpdateActivityDto): Promise<{ success: boolean; activity: Activity; message: string }> {
    const response = await api.put(`/api/activities/${activityId}`, data);
    return response.data;
  },

  // Delete activity
  async deleteActivity(activityId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/api/activities/${activityId}`);
    return response.data;
  },

  // Get activity counts for a single lead (for lead card indicators)
  async getLeadActivityCounts(leadId: string): Promise<ActivityCountsResponse> {
    const response = await api.get(`/api/leads/${leadId}/activities/counts`);
    return response.data;
  },

  // Get activity counts for multiple leads (bulk operation for kanban board)
  async getBulkLeadActivityCounts(leadIds: string[]): Promise<BulkActivityCountsResponse> {
    const response = await api.post('/api/leads/bulk/activities/counts', {
      leadIds
    });
    return response.data;
  },

  // Get user's activities for today
  async getTodayActivities(userId?: string): Promise<{ success: boolean; activities: Activity[]; count: number }> {
    const endpoint = userId ? `/api/users/${userId}/activities/today` : '/api/activities/today';
    const response = await api.get(endpoint);
    return response.data;
  },

  // Get user's overdue activities
  async getOverdueActivities(userId?: string): Promise<{ success: boolean; activities: Activity[]; count: number }> {
    const endpoint = userId ? `/api/users/${userId}/activities/overdue` : '/api/activities/overdue';
    const response = await api.get(endpoint);
    return response.data;
  },

  // Get user's upcoming activities
  async getUpcomingActivities(userId?: string, days?: number): Promise<{ success: boolean; activities: Activity[]; count: number }> {
    const endpoint = userId ? `/api/users/${userId}/activities/upcoming` : '/api/activities/upcoming';
    const response = await api.get(endpoint, {
      params: { days }
    });
    return response.data;
  },

  // Get activity counts for user dashboard
  async getActivityCounts(userId?: string): Promise<{ success: boolean; counts: ActivityCounts }> {
    const endpoint = userId ? `/api/users/${userId}/activities/counts` : '/api/activities/counts';
    const response = await api.get(endpoint);
    return response.data;
  },

  // Bulk update activity status (for quick actions)
  async bulkUpdateStatus(
    activityIds: string[],
    status: Activity['status'],
    completed_at?: string
  ): Promise<{ success: boolean; message: string; updated_count: number }> {
    const response = await api.post('/api/activities/bulk-update-status', {
      activityIds,
      status,
      completed_at
    });
    return response.data;
  }
};