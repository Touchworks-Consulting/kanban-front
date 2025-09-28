import { apiService } from './api';
import { kanbanService } from './kanban';
import { userService } from './users';
import type { Lead, KanbanColumn, UpdateLeadDto } from '../types/kanban';
import type { LeadModalData, CreateActivityRequest, LeadActivity } from '../types/leadModal';
import type { UserDto } from './users';

/**
 * Optimized Lead Service - Performs granular updates without full reloads
 */
export class OptimizedLeadService {
  // Debounce timers
  private static debounceTimers = new Map<string, NodeJS.Timeout>();

  /**
   * Load initial modal data (only called once when opening modal)
   */
  static async loadInitialData(leadId: string): Promise<{
    lead: Lead;
    modalData: LeadModalData;
    columns: KanbanColumn[];
    users: UserDto[];
  }> {
    const [leadResponse, columnsResponse, usersResponse] = await Promise.all([
      kanbanService.getLeadById(leadId),
      kanbanService.getColumns(),
      userService.list()
    ]);

    // For now, return empty data - will be loaded separately
    return {
      lead: leadResponse.lead,
      modalData: {
        timeline: [],
        contacts: [],
        files: [],
        stats: {
          totalActivities: 0,
          pendingTasks: 0,
          totalContacts: 0,
          totalFiles: 0
        }
      },
      columns: columnsResponse.columns,
      users: usersResponse || []
    };
  }

  /**
   * Update only the assignee - optimized PATCH request
   */
  static async updateAssignee(leadId: string, userId: string): Promise<Lead> {
    try {
      // Use optimized endpoint with only assignee data
      const response = await apiService.patch(`/api/leads/${leadId}/assignee`, {
        assigned_to_user_id: userId
      });

      return response.data.lead;
    } catch (error) {
      console.error('Error updating assignee:', error);
      throw error;
    }
  }

  /**
   * Update lead status - optimized PATCH request
   */
  static async updateStatus(
    leadId: string,
    status: 'won' | 'lost',
    reason?: string
  ): Promise<Lead> {
    try {
      const payload: any = { status };
      if (status === 'won' && reason) {
        payload.won_reason = reason;
      } else if (status === 'lost' && reason) {
        payload.lost_reason = reason;
      }

      const response = await apiService.patch(`/api/leads/${leadId}/status`, payload);
      return response.data.lead;
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  }

  /**
   * Move lead to column - optimized PATCH request
   */
  static async moveToColumn(leadId: string, columnId: string): Promise<Lead> {
    try {
      const response = await kanbanService.moveLead(leadId, {
        column_id: columnId,
        position: 0
      });

      return response.lead;
    } catch (error) {
      console.error('Error moving lead:', error);
      throw error;
    }
  }

  /**
   * Update lead with debouncing for multiple rapid changes
   */
  static async updateLeadDebounced(
    leadId: string,
    updates: Partial<Lead>,
    debounceMs: number = 500
  ): Promise<void> {
    const debounceKey = `lead-${leadId}`;

    // Clear existing timer
    if (this.debounceTimers.has(debounceKey)) {
      clearTimeout(this.debounceTimers.get(debounceKey)!);
    }

    // Set new timer
    const timer = setTimeout(async () => {
      try {
        await this.updateLead(leadId, updates);
        this.debounceTimers.delete(debounceKey);
      } catch (error) {
        console.error('Debounced update failed:', error);
        this.debounceTimers.delete(debounceKey);
        throw error;
      }
    }, debounceMs);

    this.debounceTimers.set(debounceKey, timer);
  }

  /**
   * Update lead - optimized to send only changed fields
   */
  static async updateLead(leadId: string, updates: Partial<Lead>): Promise<Lead> {
    try {
      // Clean up updates - remove undefined values and format properly
      const cleanUpdates: any = {};

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'tags' && Array.isArray(value)) {
            cleanUpdates[key] = value.map((tag: any) =>
              typeof tag === 'string' ? tag : tag.name || tag.id || String(tag)
            );
          } else {
            cleanUpdates[key] = value;
          }
        }
      });

      const response = await kanbanService.updateLead(leadId, cleanUpdates);
      return response.lead;
    } catch (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  }

  /**
   * Add activity without reloading timeline
   */
  static async addActivity(leadId: string, activity: CreateActivityRequest): Promise<LeadActivity> {
    try {
      const response = await apiService.post(`/api/leads/${leadId}/activities`, activity);
      return response.data.activity;
    } catch (error) {
      console.error('Error adding activity:', error);
      throw error;
    }
  }

  /**
   * Load activities separately (lazy loading)
   */
  static async loadActivities(leadId: string, page: number = 1): Promise<LeadActivity[]> {
    try {
      const response = await apiService.get(`/api/leads/${leadId}/activities`, {
        params: { page, limit: 20 }
      });
      return response.data.activities || [];
    } catch (error) {
      console.error('Error loading activities:', error);
      return [];
    }
  }

  /**
   * Load contacts separately (lazy loading)
   */
  static async loadContacts(leadId: string): Promise<any[]> {
    try {
      const response = await apiService.get(`/api/leads/${leadId}/contacts`);
      return response.data.contacts || [];
    } catch (error) {
      console.error('Error loading contacts:', error);
      return [];
    }
  }

  /**
   * Load files separately (lazy loading)
   */
  static async loadFiles(leadId: string): Promise<any[]> {
    try {
      const response = await apiService.get(`/api/leads/${leadId}/files`);
      return response.data.files || [];
    } catch (error) {
      console.error('Error loading files:', error);
      return [];
    }
  }

  /**
   * Cancel all pending debounced updates
   */
  static cancelPendingUpdates(): void {
    this.debounceTimers.forEach((timer) => clearTimeout(timer));
    this.debounceTimers.clear();
  }

  /**
   * Sync data from server (for conflict resolution)
   */
  static async syncFromServer(leadId: string): Promise<{
    lead: Lead;
    activities: LeadActivity[];
  }> {
    try {
      const [leadResponse, activitiesResponse] = await Promise.all([
        kanbanService.getLeadById(leadId),
        this.loadActivities(leadId)
      ]);

      return {
        lead: leadResponse.lead,
        activities: activitiesResponse
      };
    } catch (error) {
      console.error('Error syncing from server:', error);
      throw error;
    }
  }
}

export const optimizedLeadService = OptimizedLeadService;