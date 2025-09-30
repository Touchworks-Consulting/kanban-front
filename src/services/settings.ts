import { api } from './api';
import type {
  ProfileData,
  SystemStatistics,
  NotificationSettings,
  ApiResponse,
  Notification,
  CustomStatus,
  LossReason
} from '../types';

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  display_name?: string;
  description?: string;
  avatar_url?: string;
}

export interface ExportOptions {
  format?: 'csv' | 'json';
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CleanupRequest {
  days?: number;
}

class SettingsService {
  // Profile Management
  async getProfile(): Promise<ProfileData> {
    const response = await api.get<ProfileData>('/api/settings/profile');
    return response.data;
  }

  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<{ profile: ProfileData }>> {
    const response = await api.put<ApiResponse<{ profile: ProfileData }>>('/api/settings/profile', data);
    return response.data;
  }

  // System Statistics
  async getSystemStatistics(): Promise<SystemStatistics> {
    const response = await api.get<SystemStatistics>('/api/settings/statistics');
    return response.data;
  }

  // Data Export
  async exportLeads(options: ExportOptions = {}): Promise<Blob> {
    const params = new URLSearchParams();

    if (options.format) params.append('format', options.format);
    if (options.status) params.append('status', options.status);
    if (options.dateFrom) params.append('dateFrom', options.dateFrom);
    if (options.dateTo) params.append('dateTo', options.dateTo);

    const response = await api.getAxiosInstance().get(`/api/settings/export/leads?${params.toString()}`, {
      responseType: 'blob'
    });

    return response.data;
  }

  async exportCampaigns(): Promise<Blob> {
    const response = await api.getAxiosInstance().get('/api/settings/export/campaigns', {
      responseType: 'blob'
    });

    return response.data;
  }

  async exportWebhookLogs(options: Pick<ExportOptions, 'dateFrom' | 'dateTo'> = {}): Promise<Blob> {
    const params = new URLSearchParams();

    if (options.dateFrom) params.append('dateFrom', options.dateFrom);
    if (options.dateTo) params.append('dateTo', options.dateTo);

    const response = await api.getAxiosInstance().get(`/api/settings/export/webhook-logs?${params.toString()}`, {
      responseType: 'blob'
    });

    return response.data;
  }

  // Helper method to download blob as file
  downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Notification Settings
  async getNotificationSettings(): Promise<NotificationSettings> {
    const response = await api.get<NotificationSettings>('/api/settings/notifications/settings');
    return response.data;
  }

  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<ApiResponse<{ settings: NotificationSettings }>> {
    const response = await api.put<ApiResponse<{ settings: NotificationSettings }>>('/api/settings/notifications/settings', settings);
    return response.data;
  }

  // Notifications Management
  async getNotifications(params: {
    page?: number;
    limit?: number;
    unread_only?: boolean;
  } = {}): Promise<{
    notifications: Notification[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }> {
    const response = await api.get('/api/settings/notifications', { params });
    return response.data;
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<{ message: string }>> {
    const response = await api.put<ApiResponse<{ message: string }>>(`/api/settings/notifications/${id}/read`);
    return response.data;
  }

  async dismissNotification(id: string): Promise<ApiResponse<{ message: string }>> {
    const response = await api.put<ApiResponse<{ message: string }>>(`/api/settings/notifications/${id}/dismiss`);
    return response.data;
  }

  // System Maintenance
  async cleanupOldLogs(options: CleanupRequest = {}): Promise<ApiResponse<{ message: string; deletedCount: number }>> {
    const response = await api.post<ApiResponse<{ message: string; deletedCount: number }>>('/api/settings/maintenance/cleanup-logs', options);
    return response.data;
  }

  // Custom Status Management
  async getCustomStatuses(): Promise<{ statuses: CustomStatus[] }> {
    const response = await api.get<{ statuses: CustomStatus[] }>('/api/settings/statuses');
    return response.data;
  }

  async updateCustomStatuses(statuses: CustomStatus[]): Promise<ApiResponse<{ message: string }>> {
    const response = await api.put<ApiResponse<{ message: string }>>('/api/settings/statuses', { statuses });
    return response.data;
  }

  async getLossReasons(): Promise<{ lossReasons: LossReason[] }> {
    const response = await api.get<{ lossReasons: LossReason[] }>('/api/settings/loss-reasons');
    return response.data;
  }

  async updateLossReasons(lossReasons: LossReason[]): Promise<ApiResponse<{ message: string }>> {
    const response = await api.put<ApiResponse<{ message: string }>>('/api/settings/loss-reasons', { lossReasons });
    return response.data;
  }

  // Status validation helpers
  static validateStatus(status: Partial<CustomStatus>): string[] {
    const errors: string[] = [];

    if (!status.name?.trim()) {
      errors.push('Nome do status é obrigatório');
    }

    if (!status.color?.match(/^#[0-9A-Fa-f]{6}$/)) {
      errors.push('Cor deve ser um código hexadecimal válido');
    }

    if (typeof status.order !== 'number' || status.order < 0) {
      errors.push('Ordem deve ser um número positivo');
    }

    return errors;
  }

  static validateLossReason(reason: Partial<LossReason>): string[] {
    const errors: string[] = [];

    if (!reason.name?.trim()) {
      errors.push('Nome do motivo é obrigatório');
    }

    if (!reason.id?.trim()) {
      errors.push('ID do motivo é obrigatório');
    }

    if (typeof reason.order !== 'number' || reason.order < 0) {
      errors.push('Ordem deve ser um número positivo');
    }

    return errors;
  }

  static validateStatusList(statuses: CustomStatus[]): string[] {
    const errors: string[] = [];

    if (statuses.length === 0) {
      errors.push('Pelo menos um status deve estar configurado');
    }

    const initialStatuses = statuses.filter(s => s.is_initial);
    if (initialStatuses.length === 0) {
      errors.push('Pelo menos um status deve ser marcado como inicial');
    } else if (initialStatuses.length > 1) {
      errors.push('Apenas um status pode ser marcado como inicial');
    }

    const ids = statuses.map(s => s.id);
    if (new Set(ids).size !== ids.length) {
      errors.push('IDs dos status devem ser únicos');
    }

    const names = statuses.map(s => s.name.trim().toLowerCase());
    if (new Set(names).size !== names.length) {
      errors.push('Nomes dos status devem ser únicos');
    }

    return errors;
  }
}

export const settingsService = new SettingsService();
export default settingsService;