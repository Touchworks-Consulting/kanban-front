import { apiService } from "./api";
import { API_ENDPOINTS } from "../constants";
import type {
  Lead,
  KanbanColumn,
  CreateLeadDto,
  UpdateLeadDto,
} from "../types/kanban";
import type {
  PaginatedResponse,
  CreateData,
  UpdateData,
} from "../types/common";

class LeadService {
  async getLeads(
    page = 1,
    limit = 20,
    filters?: Partial<Lead>,
    sort?: { field: string; direction: "asc" | "desc" }
  ): Promise<PaginatedResponse<Lead>> {
    const params = {
      page,
      limit,
      ...filters,
      ...(sort && { sortBy: sort.field, sortOrder: sort.direction }),
    };
    const res = await apiService.get<{
      leads: any[];
      pagination: { total: number; page: number; limit: number; pages: number };
    }>(API_ENDPOINTS.LEADS, params);
    const payload = res.data;
    const adapt = (l: any): Lead => {
      return {
        id: String(l.id),
        name: l.name ?? "",
        email: l.email ?? "",
        phone: l.phone,
        platform: l.platform ?? l.source ?? "Desconhecido",
        status: l.status ?? "novo",
        column_id: l.column_id ?? l.column?.id,
        position: l.position ?? 0,
        value: l.value,
        notes: l.notes ?? "",
        account_id: String(l.account_id ?? ""),
        assigned_to_user_id: l.assigned_to_user_id,
        createdAt: (
          l.createdAt ??
          l.created_at ??
          new Date().toISOString()
        ).toString(),
        updatedAt: (
          l.updatedAt ??
          l.updated_at ??
          new Date().toISOString()
        ).toString(),
        tags: l.tags,
        column: l.column,
      };
    };
    return {
      data: (payload.leads as any[]).map(adapt),
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
    const res = await apiService.get<{ lead: any }>(
      API_ENDPOINTS.LEAD_BY_ID(id)
    );
    const l = res.data.lead;
    return {
      id: String(l.id),
      name: l.name ?? "",
      email: l.email ?? "",
      phone: l.phone,
      platform: l.platform ?? l.source ?? "Desconhecido",
      status: l.status ?? "novo",
      column_id: l.column_id ?? l.column?.id,
      position: l.position ?? 0,
      value: l.value,
      notes: l.notes ?? "",
      account_id: String(l.account_id ?? ""),
      assigned_to_user_id: l.assigned_to_user_id,
      createdAt: (
        l.createdAt ??
        l.created_at ??
        new Date().toISOString()
      ).toString(),
      updatedAt: (
        l.updatedAt ??
        l.updated_at ??
        new Date().toISOString()
      ).toString(),
      tags: l.tags,
      column: l.column,
    };
  }

  async createLead(data: CreateData<CreateLeadDto>): Promise<Lead> {
    const payload: CreateLeadDto = {
      ...data,
    };
    const res = await apiService.post<{ message: string; lead: any }>(
      API_ENDPOINTS.LEADS,
      payload
    );
    const l = res.data.lead;
    return {
      id: String(l.id),
      name: l.name ?? "",
      email: l.email ?? "",
      phone: l.phone,
      platform: l.platform ?? l.source ?? "Desconhecido",
      status: l.status ?? "novo",
      column_id: l.column_id ?? l.column?.id,
      position: l.position ?? 0,
      value: l.value,
      notes: l.notes ?? "",
      account_id: String(l.account_id ?? ""),
      assigned_to_user_id: l.assigned_to_user_id,
      createdAt: (
        l.createdAt ??
        l.created_at ??
        new Date().toISOString()
      ).toString(),
      updatedAt: (
        l.updatedAt ??
        l.updated_at ??
        new Date().toISOString()
      ).toString(),
      tags: l.tags,
      column: l.column,
    };
  }

  async updateLead(id: string, data: UpdateData<UpdateLeadDto>): Promise<Lead> {
    const payload: UpdateLeadDto = {
      ...data,
    };
    const res = await apiService.patch<{ message: string; lead: any }>(
      API_ENDPOINTS.LEAD_BY_ID(id),
      payload
    );
    const l = res.data.lead;
    return {
      id: String(l.id),
      name: l.name ?? "",
      email: l.email ?? "",
      phone: l.phone,
      platform: l.platform ?? l.source ?? "Desconhecido",
      status: l.status ?? "novo",
      column_id: l.column_id ?? l.column?.id,
      position: l.position ?? 0,
      value: l.value,
      notes: l.notes ?? "",
      account_id: String(l.account_id ?? ""),
      assigned_to_user_id: l.assigned_to_user_id,
      createdAt: (
        l.createdAt ??
        l.created_at ??
        new Date().toISOString()
      ).toString(),
      updatedAt: (
        l.updatedAt ??
        l.updated_at ??
        new Date().toISOString()
      ).toString(),
      tags: l.tags,
      column: l.column,
    };
  }

  async deleteLead(id: string): Promise<void> {
    await apiService.delete(API_ENDPOINTS.LEAD_BY_ID(id));
  }

  async searchLeads(query: string): Promise<Lead[]> {
    const res = await apiService.get<{ leads: any[] }>(
      API_ENDPOINTS.LEAD_SEARCH,
      { q: query }
    );
    return (res.data.leads || []).map((l: any) => ({
      id: String(l.id),
      name: l.name ?? "",
      email: l.email ?? "",
      phone: l.phone,
      platform: l.platform ?? l.source ?? "Desconhecido",
      status: l.status ?? "novo",
      column_id: l.column_id ?? l.column?.id,
      position: l.position ?? 0,
      value: l.value,
      notes: l.notes ?? "",
      account_id: String(l.account_id ?? ""),
      assigned_to_user_id: l.assigned_to_user_id,
      createdAt: (
        l.createdAt ??
        l.created_at ??
        new Date().toISOString()
      ).toString(),
      updatedAt: (
        l.updatedAt ??
        l.updated_at ??
        new Date().toISOString()
      ).toString(),
      tags: l.tags,
      column: l.column,
    }));
  }

  async getKanbanColumns(): Promise<KanbanColumn[]> {
    const res = await apiService.get<{ columns: any[] }>(
      API_ENDPOINTS.KANBAN_COLUMNS
    );
    const adaptLead = (l: any): Lead => ({
      id: String(l.id),
      name: l.name ?? "",
      email: l.email ?? "",
      phone: l.phone,
      platform: l.platform ?? l.source ?? "Desconhecido",
      status: l.status ?? "novo",
      column_id: l.column_id ?? l.column?.id,
      position: l.position ?? 0,
      value: l.value,
      notes: l.notes ?? "",
      account_id: String(l.account_id ?? ""),
      assigned_to_user_id: l.assigned_to_user_id,
      createdAt: (
        l.createdAt ??
        l.created_at ??
        new Date().toISOString()
      ).toString(),
      updatedAt: (
        l.updatedAt ??
        l.updated_at ??
        new Date().toISOString()
      ).toString(),
      tags: l.tags,
      column: l.column,
    });
    const columns = (res.data.columns || []).map((c: any) => ({
      id: String(c.id),
      name: c.name,
      position: c.position ?? 0,
      color: c.color ?? "#6b7280",
      is_system: !!c.is_system,
      is_active: !!c.is_active,
      is_mql: !!c.is_mql,
      account_id: String(c.account_id),
      leads: (c.leads ?? []).map(adaptLead),
      createdAt: (
        c.createdAt ??
        c.created_at ??
        new Date().toISOString()
      ).toString(),
      updatedAt: (
        c.updatedAt ??
        c.updated_at ??
        new Date().toISOString()
      ).toString(),
    }));
    return columns;
  }

  async createKanbanColumn(data: {
    name: string;
    color?: string;
  }): Promise<KanbanColumn> {
    const res = await apiService.post<{ column: any }>(
      API_ENDPOINTS.KANBAN_COLUMNS,
      data
    );
    const c = res.data.column;
    return {
      id: String(c.id),
      name: c.name,
      position: c.position ?? 0,
      color: c.color ?? "#6b7280",
      is_system: !!c.is_system,
      is_active: !!c.is_active,
      is_mql: !!c.is_mql,
      account_id: String(c.account_id),
      leads: [],
      createdAt: (
        c.createdAt ??
        c.created_at ??
        new Date().toISOString()
      ).toString(),
      updatedAt: (
        c.updatedAt ??
        c.updated_at ??
        new Date().toISOString()
      ).toString(),
    };
  }

  async updateKanbanColumn(
    id: string,
    data: { name?: string; color?: string; position?: number; is_mql?: boolean }
  ): Promise<KanbanColumn> {
    const res = await apiService.patch<{ column: any }>(
      API_ENDPOINTS.KANBAN_COLUMN_BY_ID(id),
      data
    );
    const c = res.data.column;
    return {
      id: String(c.id),
      name: c.name,
      position: c.position ?? 0,
      color: c.color ?? "#6b7280",
      is_system: !!c.is_system,
      is_active: !!c.is_active,
      is_mql: !!c.is_mql,
      account_id: String(c.account_id),
      leads: [],
      createdAt: (
        c.createdAt ??
        c.created_at ??
        new Date().toISOString()
      ).toString(),
      updatedAt: (
        c.updatedAt ??
        c.updated_at ??
        new Date().toISOString()
      ).toString(),
    };
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

  async exportLeads(filters?: Partial<Lead>): Promise<Blob> {
    const params = { ...filters };
    const response = await apiService
      .getAxiosInstance()
      .get(API_ENDPOINTS.LEAD_EXPORT, {
        params,
        responseType: "blob",
      });
    return response.data;
  }

  async bulkUpdateLeads(
    leadIds: string[],
    updates: UpdateData<UpdateLeadDto>
  ): Promise<Lead[]> {
    const res = await apiService.post<Lead[]>(
      `${API_ENDPOINTS.LEADS}/bulk-update`,
      {
        leadIds,
        updates,
      }
    );
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
