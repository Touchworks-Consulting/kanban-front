import { apiService } from './api';
import { API_ENDPOINTS } from '../constants';
import type { 
  Lead, 
  KanbanColumn, 
  LeadCreateData, 
  LeadUpdateData, 
  LeadFilters, 
  LeadSort,
  PaginatedResponse 
} from '../types';

class LeadService {
  async getLeads(
    page = 1,
    limit = 20,
    filters?: LeadFilters,
    sort?: LeadSort
  ): Promise<PaginatedResponse<Lead>> {
    const params = {
      page,
      limit,
      ...filters,
      ...(sort && { sortBy: sort.field, sortOrder: sort.direction }),
    };

    const res = await apiService.get<{ leads: any[]; pagination: { total: number; page: number; limit: number; pages: number } }>(API_ENDPOINTS.LEADS, params);
    const payload = res.data;
    const adapt = (l: any): Lead => {
      const colId = l.column_id ?? l.column?.id;
      const tags = Array.isArray(l.tags) ? l.tags : [];
      return {
        id: String(l.id),
        name: l.name ?? '',
        email: l.email ?? '',
        phone: l.phone,
        company: l.company,
        position: l.position,
        source: l.platform ?? l.source ?? 'Desconhecido',
        status: l.status ?? 'novo',
        score: l.score ?? 0,
        tags: tags.map((t: any) => t.name),
        tagsMeta: tags.map((t: any) => ({ name: t.name, color: t.color ?? '#64748b' })),
        notes: l.notes ?? '',
        kanbanColumnId: colId ? String(colId) : '',
        accountId: String(l.account_id ?? ''),
        assignedTo: undefined,
        lastContact: undefined,
        nextFollowUp: undefined,
        createdAt: (l.createdAt ?? l.created_at ?? new Date().toISOString()).toString(),
        updatedAt: (l.updatedAt ?? l.updated_at ?? new Date().toISOString()).toString(),
      };
    };
    return {
      data: (payload.leads as any[]).map(adapt) as Lead[],
      pagination: {
        page: payload.pagination.page,
        limit: payload.pagination.limit,
        total: payload.pagination.total,
        totalPages: payload.pagination.pages,
        hasNext: payload.pagination.page < payload.pagination.pages,
        hasPrev: payload.pagination.page > 1,
      },
    };
  }

  async getLeadById(id: string): Promise<Lead> {
    const res = await apiService.get<{ lead: any }>(API_ENDPOINTS.LEAD_BY_ID(id));
    return res.data.lead as unknown as Lead;
  }

  async createLead(data: LeadCreateData): Promise<Lead> {
    const payload: any = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      notes: data.notes,
      value: (data as any).value,
      platform: data.source, // backend expects platform
      column_id: data.kanbanColumnId, // backend expects column_id
    };
    const res = await apiService.post<{ message: string; lead: any }>(API_ENDPOINTS.LEADS, payload);
    const l = res.data.lead;
    return {
      id: String(l.id),
      name: l.name ?? '',
      email: l.email ?? '',
      phone: l.phone,
      company: l.company,
      position: l.position,
      source: l.platform ?? l.source ?? 'Desconhecido',
      status: l.status ?? 'novo',
      score: l.score ?? 0,
      tags: (l.tags ?? []).map((t: any) => t.name),
      tagsMeta: (l.tags ?? []).map((t: any) => ({ name: t.name, color: t.color ?? '#64748b' })),
      notes: l.notes ?? '',
      kanbanColumnId: String(l.column_id ?? l.column?.id ?? ''),
      accountId: String(l.account_id ?? ''),
      assignedTo: undefined,
      lastContact: undefined,
      nextFollowUp: undefined,
      createdAt: (l.createdAt ?? l.created_at ?? new Date().toISOString()).toString(),
      updatedAt: (l.updatedAt ?? l.updated_at ?? new Date().toISOString()).toString(),
    } as Lead;
  }

  async updateLead(id: string, data: LeadUpdateData): Promise<Lead> {
    const payload: any = { ...data };
    if (data.kanbanColumnId) payload.column_id = data.kanbanColumnId;
    if (data.source) payload.platform = data.source;
    delete payload.kanbanColumnId;
    const res = await apiService.patch<{ message: string; lead: any }>(API_ENDPOINTS.LEAD_BY_ID(id), payload);
    const l = res.data.lead;
    return {
      id: String(l.id),
      name: l.name ?? '',
      email: l.email ?? '',
      phone: l.phone,
      company: l.company,
      position: l.position,
      source: l.platform ?? l.source ?? 'Desconhecido',
      status: l.status ?? 'novo',
      score: l.score ?? 0,
      tags: (l.tags ?? []).map((t: any) => t.name),
      tagsMeta: (l.tags ?? []).map((t: any) => ({ name: t.name, color: t.color ?? '#64748b' })),
      notes: l.notes ?? '',
      kanbanColumnId: String(l.column_id ?? l.column?.id ?? ''),
      accountId: String(l.account_id ?? ''),
      assignedTo: undefined,
      lastContact: undefined,
      nextFollowUp: undefined,
      createdAt: (l.createdAt ?? l.created_at ?? new Date().toISOString()).toString(),
      updatedAt: (l.updatedAt ?? l.updated_at ?? new Date().toISOString()).toString(),
    } as Lead;
  }

  async deleteLead(id: string): Promise<void> {
    await apiService.delete(API_ENDPOINTS.LEAD_BY_ID(id));
  }

  async searchLeads(query: string): Promise<Lead[]> {
    const res = await apiService.get<Lead[]>(API_ENDPOINTS.LEAD_SEARCH, { q: query });
    return res.data as unknown as Lead[];
  }

  async getKanbanColumns(): Promise<KanbanColumn[]> {
    const res = await apiService.get<{ columns: any[] }>(API_ENDPOINTS.KANBAN_COLUMNS);
  const adaptLead = (l: any): Lead => {
      const colId = l.column_id ?? l.column?.id;
      return {
        id: String(l.id),
        name: l.name ?? '',
        email: l.email ?? '',
        phone: l.phone,
        company: l.company,
        position: l.position,
        source: l.platform ?? l.source ?? 'Desconhecido',
        status: l.status ?? 'novo',
        score: l.score ?? 0,
    tags: (l.tags ?? []).map((t: any) => t.name),
    tagsMeta: (l.tags ?? []).map((t: any) => ({ name: t.name, color: t.color ?? '#64748b' })),
        notes: l.notes ?? '',
        kanbanColumnId: colId ? String(colId) : '',
        accountId: String(l.account_id),
        assignedTo: undefined,
        lastContact: undefined,
        nextFollowUp: undefined,
        createdAt: (l.createdAt ?? l.created_at ?? new Date().toISOString()).toString(),
        updatedAt: (l.updatedAt ?? l.updated_at ?? new Date().toISOString()).toString(),
      };
    };
    const columns = (res.data.columns || []).map((c: any) => ({
      id: String(c.id),
      name: c.name,
      order: c.position ?? 0,
      color: c.color ?? '#6b7280',
      accountId: String(c.account_id),
      leads: (c.leads ?? []).map(adaptLead),
      createdAt: (c.createdAt ?? c.created_at ?? new Date().toISOString()).toString(),
      updatedAt: (c.updatedAt ?? c.updated_at ?? new Date().toISOString()).toString(),
    })) as KanbanColumn[];
    return columns;
  }

  async createKanbanColumn(data: {
    name: string;
    color: string;
    order: number;
  }): Promise<KanbanColumn> {
    const res = await apiService.post<{ column: any }>(API_ENDPOINTS.KANBAN_COLUMNS, data);
    // Map minimal shape
    const c = res.data.column;
    return ({
      id: (c.id as unknown) as any,
      name: c.name,
      order: c.position ?? 0,
      color: c.color ?? '#6b7280',
      accountId: c.account_id,
      leads: [],
      createdAt: (c.createdAt ?? c.created_at ?? new Date().toISOString()).toString(),
      updatedAt: (c.updatedAt ?? c.updated_at ?? new Date().toISOString()).toString(),
    }) as KanbanColumn;
  }

  async updateKanbanColumn(
    id: string,
    data: { name?: string; color?: string; order?: number }
  ): Promise<KanbanColumn> {
    const res = await apiService.patch<{ column: any }>(API_ENDPOINTS.KANBAN_COLUMN_BY_ID(id), data);
    const c = res.data.column;
    return ({
      id: String(c.id),
      name: c.name,
      order: c.position ?? 0,
      color: c.color ?? '#6b7280',
      accountId: String(c.account_id),
      leads: [],
      createdAt: (c.createdAt ?? c.created_at ?? new Date().toISOString()).toString(),
      updatedAt: (c.updatedAt ?? c.updated_at ?? new Date().toISOString()).toString(),
    }) as KanbanColumn;
  }

  async deleteKanbanColumn(id: string): Promise<void> {
  await apiService.delete(API_ENDPOINTS.KANBAN_COLUMN_BY_ID(id));
  }

  async moveLeadToColumn(
    leadId: string,
    columnId: string,
    position?: number
  ): Promise<void> {
  await apiService.patch(API_ENDPOINTS.LEAD_MOVE(leadId), {
      column_id: columnId,
      position,
    });
  }

  async exportLeads(filters?: LeadFilters): Promise<Blob> {
    const params = { ...filters };
    const response = await apiService.getAxiosInstance().get(
      API_ENDPOINTS.LEAD_EXPORT,
      {
        params,
        responseType: 'blob',
      }
    );
    return response.data;
  }

  async bulkUpdateLeads(
    leadIds: string[],
    updates: LeadUpdateData
  ): Promise<Lead[]> {
  const res = await apiService.post<Lead[]>(`${API_ENDPOINTS.LEADS}/bulk-update`, {
      leadIds,
      updates,
    });
  return res.data as unknown as Lead[];
  }

  async bulkDeleteLeads(leadIds: string[]): Promise<void> {
  await apiService.post(`${API_ENDPOINTS.LEADS}/bulk-delete`, {
      leadIds,
    });
  }
}

export const leadService = new LeadService();
export default leadService;
