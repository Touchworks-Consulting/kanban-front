import { api } from './api';
import type { 
  KanbanBoard, 
  KanbanColumn, 
  Lead, 
  CreateLeadDto, 
  UpdateLeadDto, 
  CreateColumnDto, 
  UpdateColumnDto, 
  MoveLeadDto, 
  ReorderColumnsDto 
} from '../types';

export interface SearchFilters {
  search?: string;
  platform?: string;
  period?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  valueRange?: string;
  tags?: string[];
}

export const kanbanService = {
  // Board
  async getBoard(): Promise<{ board: KanbanBoard }> {
    const response = await api.get('/api/kanban/board');
    return response.data as { board: KanbanBoard };
  },

  // Board with filters
  async searchBoard(filters: SearchFilters, options?: { signal?: AbortSignal }): Promise<{ board: KanbanBoard }> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.platform && filters.platform !== 'all') params.append('platform', filters.platform);
    if (filters.period && filters.period !== 'all') params.append('period', filters.period);
    if (filters.dateRange) {
      params.append('dateStart', filters.dateRange.start);
      params.append('dateEnd', filters.dateRange.end);
    }
    if (filters.valueRange && filters.valueRange !== 'all') params.append('valueRange', filters.valueRange);
    if (filters.tags && filters.tags.length > 0) {
      filters.tags.forEach(tag => params.append('tags', tag));
    }

    const url = `/api/kanban/board?${params.toString()}`;

    const response = await api.get(url, options);
    return response.data as { board: KanbanBoard };
  },

  // Columns
  async getColumns(): Promise<{ columns: KanbanColumn[] }> {
    const response = await api.get('/api/kanban/columns');
    return response.data as { columns: KanbanColumn[] };
  },

  async createColumn(data: CreateColumnDto): Promise<{ column: KanbanColumn }> {
    const response = await api.post('/api/kanban/columns', data);
    return response.data;
  },

  async updateColumn(id: string, data: UpdateColumnDto): Promise<{ column: KanbanColumn }> {
    const response = await api.put(`/api/kanban/columns/${id}`, data);
    return response.data;
  },

  async deleteColumn(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/api/kanban/columns/${id}`);
    return response.data;
  },

  async reorderColumns(data: ReorderColumnsDto): Promise<{ columns: KanbanColumn[] }> {
    const response = await api.patch('/api/kanban/columns/reorder', data);
    return response.data;
  },

  // Leads
  async getLeads(params?: {
    page?: number;
    limit?: number;
    status?: string;
    platform?: string;
    search?: string;
    column_id?: string;
  }): Promise<{
    leads: Lead[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }> {
    const response = await api.get('/api/leads', { params });
    return response.data;
  },

  async getLeadById(id: string): Promise<{ lead: Lead }> {
    const response = await api.get(`/api/leads/${id}`);
    return response.data;
  },

  async createLead(data: CreateLeadDto): Promise<{ lead: Lead }> {
    const response = await api.post('/api/leads', data);
    return response.data;
  },

  async updateLead(id: string, data: UpdateLeadDto): Promise<{ lead: Lead }> {
    const response = await api.put(`/api/leads/${id}`, data);
    return response.data;
  },

  async deleteLead(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/api/leads/${id}`);
    return response.data;
  },

  async moveLead(id: string, data: MoveLeadDto): Promise<{ lead: Lead }> {
    const response = await api.patch(`/api/leads/${id}/move`, data);
    return response.data;
  },
};