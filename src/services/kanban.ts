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

export const kanbanService = {
  // Board
  async getBoard(): Promise<{ board: KanbanBoard }> {
    const response = await api.get('/api/kanban/board');
    return response.data;
  },

  // Columns
  async getColumns(): Promise<{ columns: KanbanColumn[] }> {
    const response = await api.get('/api/kanban/columns');
    return response.data;
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