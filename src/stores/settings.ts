import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  ProfileData,
  SystemStatistics,
  NotificationSettings,
  Notification
} from '../types';
import { settingsService, type UpdateProfileRequest, type ExportOptions, type CleanupRequest } from '../services/settings';

interface SettingsState {
  // Profile State
  profile: ProfileData | null;

  // Statistics State
  statistics: SystemStatistics | null;

  // Notification Settings State
  notificationSettings: NotificationSettings | null;

  // Notifications State
  notifications: Notification[];
  notificationsPagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  } | null;

  // Loading States
  loading: {
    profile: boolean;
    statistics: boolean;
    notificationSettings: boolean;
    notifications: boolean;
    export: boolean;
    cleanup: boolean;
  };

  // Error State
  error: string | null;

  // Actions

  // Profile Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;

  // Statistics Actions
  fetchSystemStatistics: () => Promise<void>;

  // Data Export Actions
  exportLeads: (options?: ExportOptions, filename?: string) => Promise<void>;
  exportCampaigns: (filename?: string) => Promise<void>;
  exportWebhookLogs: (options?: Pick<ExportOptions, 'dateFrom' | 'dateTo'>, filename?: string) => Promise<void>;

  // Notification Settings Actions
  fetchNotificationSettings: () => Promise<void>;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => Promise<void>;

  // Notifications Actions
  fetchNotifications: (params?: { page?: number; limit?: number; unread_only?: boolean }) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  dismissNotification: (id: string) => Promise<void>;

  // System Maintenance Actions
  cleanupOldLogs: (options?: CleanupRequest) => Promise<void>;

  // Utility Actions
  clearError: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  devtools(
    (set, get) => ({
      // Initial state
      profile: null,
      statistics: null,
      notificationSettings: null,
      notifications: [],
      notificationsPagination: null,
      loading: {
        profile: false,
        statistics: false,
        notificationSettings: false,
        notifications: false,
        export: false,
        cleanup: false,
      },
      error: null,

      // Profile Actions
      fetchProfile: async () => {
        try {
          set((state) => ({ loading: { ...state.loading, profile: true }, error: null }));
          const profile = await settingsService.getProfile();
          set((state) => ({ profile, loading: { ...state.loading, profile: false } }));
        } catch (error: any) {
          set((state) => ({
            error: error.response?.data?.error || 'Erro ao carregar perfil',
            loading: { ...state.loading, profile: false }
          }));
        }
      },

      updateProfile: async (data: UpdateProfileRequest) => {
        try {
          set((state) => ({ loading: { ...state.loading, profile: true }, error: null }));
          const response = await settingsService.updateProfile(data);
          set((state) => ({
            profile: response.profile,
            loading: { ...state.loading, profile: false }
          }));
        } catch (error: any) {
          set((state) => ({
            error: error.response?.data?.error || 'Erro ao atualizar perfil',
            loading: { ...state.loading, profile: false }
          }));
          throw error;
        }
      },

      // Statistics Actions
      fetchSystemStatistics: async () => {
        try {
          set((state) => ({ loading: { ...state.loading, statistics: true }, error: null }));
          const statistics = await settingsService.getSystemStatistics();
          set((state) => ({ statistics, loading: { ...state.loading, statistics: false } }));
        } catch (error: any) {
          set((state) => ({
            error: error.response?.data?.error || 'Erro ao carregar estatísticas',
            loading: { ...state.loading, statistics: false }
          }));
        }
      },

      // Data Export Actions
      exportLeads: async (options: ExportOptions = {}, filename?: string) => {
        try {
          set((state) => ({ loading: { ...state.loading, export: true }, error: null }));
          const blob = await settingsService.exportLeads(options);
          const defaultFilename = `leads-${new Date().toISOString().split('T')[0]}.${options.format || 'csv'}`;
          settingsService.downloadBlob(blob, filename || defaultFilename);
          set((state) => ({ loading: { ...state.loading, export: false } }));
        } catch (error: any) {
          set((state) => ({
            error: error.response?.data?.error || 'Erro ao exportar leads',
            loading: { ...state.loading, export: false }
          }));
          throw error;
        }
      },

      exportCampaigns: async (filename?: string) => {
        try {
          set((state) => ({ loading: { ...state.loading, export: true }, error: null }));
          const blob = await settingsService.exportCampaigns();
          const defaultFilename = `campaigns-${new Date().toISOString().split('T')[0]}.json`;
          settingsService.downloadBlob(blob, filename || defaultFilename);
          set((state) => ({ loading: { ...state.loading, export: false } }));
        } catch (error: any) {
          set((state) => ({
            error: error.response?.data?.error || 'Erro ao exportar campanhas',
            loading: { ...state.loading, export: false }
          }));
          throw error;
        }
      },

      exportWebhookLogs: async (options: Pick<ExportOptions, 'dateFrom' | 'dateTo'> = {}, filename?: string) => {
        try {
          set((state) => ({ loading: { ...state.loading, export: true }, error: null }));
          const blob = await settingsService.exportWebhookLogs(options);
          const defaultFilename = `webhook-logs-${new Date().toISOString().split('T')[0]}.csv`;
          settingsService.downloadBlob(blob, filename || defaultFilename);
          set((state) => ({ loading: { ...state.loading, export: false } }));
        } catch (error: any) {
          set((state) => ({
            error: error.response?.data?.error || 'Erro ao exportar logs',
            loading: { ...state.loading, export: false }
          }));
          throw error;
        }
      },

      // Notification Settings Actions
      fetchNotificationSettings: async () => {
        try {
          set((state) => ({ loading: { ...state.loading, notificationSettings: true }, error: null }));
          const notificationSettings = await settingsService.getNotificationSettings();
          set((state) => ({
            notificationSettings,
            loading: { ...state.loading, notificationSettings: false }
          }));
        } catch (error: any) {
          set((state) => ({
            error: error.response?.data?.error || 'Erro ao carregar configurações de notificação',
            loading: { ...state.loading, notificationSettings: false }
          }));
        }
      },

      updateNotificationSettings: async (settings: Partial<NotificationSettings>) => {
        try {
          set((state) => ({ loading: { ...state.loading, notificationSettings: true }, error: null }));
          const response = await settingsService.updateNotificationSettings(settings);
          set((state) => ({
            notificationSettings: response.settings,
            loading: { ...state.loading, notificationSettings: false }
          }));
        } catch (error: any) {
          set((state) => ({
            error: error.response?.data?.error || 'Erro ao atualizar configurações de notificação',
            loading: { ...state.loading, notificationSettings: false }
          }));
          throw error;
        }
      },

      // Notifications Actions
      fetchNotifications: async (params = {}) => {
        try {
          set((state) => ({ loading: { ...state.loading, notifications: true }, error: null }));
          const response = await settingsService.getNotifications(params);
          set((state) => ({
            notifications: response.notifications,
            notificationsPagination: response.pagination,
            loading: { ...state.loading, notifications: false }
          }));
        } catch (error: any) {
          set((state) => ({
            error: error.response?.data?.error || 'Erro ao carregar notificações',
            loading: { ...state.loading, notifications: false }
          }));
        }
      },

      markNotificationAsRead: async (id: string) => {
        try {
          await settingsService.markNotificationAsRead(id);
          // Update local state
          set((state) => ({
            notifications: state.notifications.map(notification =>
              notification.id === id ? { ...notification, is_read: true } : notification
            )
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.error || 'Erro ao marcar notificação como lida' });
          throw error;
        }
      },

      dismissNotification: async (id: string) => {
        try {
          await settingsService.dismissNotification(id);
          // Update local state
          set((state) => ({
            notifications: state.notifications.map(notification =>
              notification.id === id ? { ...notification, is_dismissed: true } : notification
            )
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.error || 'Erro ao dispensar notificação' });
          throw error;
        }
      },

      // System Maintenance Actions
      cleanupOldLogs: async (options: CleanupRequest = {}) => {
        try {
          set((state) => ({ loading: { ...state.loading, cleanup: true }, error: null }));
          const response = await settingsService.cleanupOldLogs(options);
          set((state) => ({ loading: { ...state.loading, cleanup: false } }));
          // Refresh statistics after cleanup
          get().fetchSystemStatistics();
          return response;
        } catch (error: any) {
          set((state) => ({
            error: error.response?.data?.error || 'Erro ao limpar logs',
            loading: { ...state.loading, cleanup: false }
          }));
          throw error;
        }
      },

      // Utility Actions
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'settings-store',
    }
  )
);