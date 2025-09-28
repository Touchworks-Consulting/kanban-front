import { apiService } from './api';
import { kanbanService } from './kanban';
import type {
  LeadModalData,
  LeadStats,
  TimelineResponse,
  CreateActivityRequest,
  CreateContactRequest,
  LeadActivity,
  LeadContact,
  LeadFile
} from '../types/leadModal';
import type { KanbanColumn, UpdateLeadDto } from '../types/kanban';

export const leadModalService = {
  /**
   * Obter dados completos do modal do lead
   */
  async getLeadModalData(leadId: string): Promise<LeadModalData & { columns: KanbanColumn[] }> {
    const [leadResponse, columnsResponse] = await Promise.all([
      kanbanService.getLeadById(leadId),
      kanbanService.getColumns()
    ]);

    // Estrutura os dados no formato esperado pelo modal
    return {
      lead: leadResponse.lead,
      timeline: [], // Será carregado separadamente se necessário
      contacts: [], // Será carregado separadamente se necessário
      files: [], // Será carregado separadamente se necessário
      stats: {
        totalActivities: 0,
        pendingTasks: 0,
        totalContacts: 0,
        totalFiles: 0
      },
      columns: columnsResponse.columns
    };
  },

  /**
   * Obter dados completos do modal do lead (alias)
   */
  async getModalData(leadId: string): Promise<LeadModalData> {
    return this.getLeadModalData(leadId);
  },

  /**
   * Obter estatísticas do lead
   */
  async getStats(leadId: string): Promise<LeadStats> {
    const response = await apiService.get(`/lead-modal/${leadId}/stats`);
    return response.data.data;
  },

  /**
   * Obter timeline paginada
   */
  async getTimeline(leadId: string, page: number = 1, limit: number = 20): Promise<TimelineResponse> {
    const response = await apiService.get(`/lead-modal/${leadId}/timeline`, {
      params: { page, limit }
    });
    return response.data.data;
  },

  /**
   * Adicionar nova atividade
   */
  async addActivity(leadId: string, activity: CreateActivityRequest): Promise<LeadActivity> {
    const response = await apiService.post(`/lead-modal/${leadId}/activities`, activity);
    return response.data.data;
  },

  /**
   * Obter contatos do lead
   */
  async getContacts(leadId: string): Promise<LeadContact[]> {
    const response = await apiService.get(`/lead-modal/${leadId}/contacts`);
    return response.data.data;
  },

  /**
   * Adicionar novo contato
   */
  async addContact(leadId: string, contact: CreateContactRequest): Promise<LeadContact> {
    const response = await apiService.post(`/lead-modal/${leadId}/contacts`, contact);
    return response.data.data;
  },

  /**
   * Obter arquivos do lead
   */
  async getFiles(leadId: string): Promise<LeadFile[]> {
    const response = await apiService.get(`/lead-modal/${leadId}/files`);
    return response.data.data;
  },

  /**
   * Atualizar dados do lead
   */
  async updateLead(leadId: string, updates: UpdateLeadDto): Promise<any> {
    // Usa o endpoint correto do kanbanService
    const response = await kanbanService.updateLead(leadId, updates);
    return response.lead;
  },

  /**
   * Marcar lead como ganho ou perdido
   */
  async updateLeadStatus(leadId: string, status: 'won' | 'lost', reason?: string): Promise<any> {
    const updates: any = { status };
    if (status === 'won' && reason) {
      updates.won_reason = reason;
    } else if (status === 'lost' && reason) {
      updates.lost_reason = reason;
    }

    // Usa o endpoint correto do kanbanService
    const response = await kanbanService.updateLead(leadId, updates);
    return response.lead;
  },

  /**
   * Mover lead para próxima coluna
   */
  async moveLeadToColumn(leadId: string, columnId: string): Promise<any> {
    // Usa o endpoint correto do kanbanService
    const response = await kanbanService.moveLead(leadId, {
      column_id: columnId,
      position: 0
    });
    return response.lead;
  }
};