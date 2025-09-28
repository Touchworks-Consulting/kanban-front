import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Lead, KanbanColumn } from '../types/kanban';
import type { LeadModalData, LeadActivity, LeadContact, LeadFile } from '../types/leadModal';
import type { UserDto } from '../services/users';

interface LoadingState {
  lead: boolean;
  activities: boolean;
  contacts: boolean;
  files: boolean;
  assignee: boolean;
  status: boolean;
  column: boolean;
}

interface ErrorState {
  lead: string | null;
  activities: string | null;
  contacts: string | null;
  files: string | null;
  assignee: string | null;
  status: string | null;
  column: string | null;
}

interface LeadModalState {
  // Data
  lead: Lead | null;
  modalData: LeadModalData | null;
  columns: KanbanColumn[];
  users: UserDto[];

  // UI State
  isOpen: boolean;
  loading: LoadingState;
  errors: ErrorState;

  // Actions - Load Data
  setLead: (lead: Lead | null) => void;
  setModalData: (data: LeadModalData | null) => void;
  setColumns: (columns: KanbanColumn[]) => void;
  setUsers: (users: UserDto[]) => void;

  // Actions - UI State
  setIsOpen: (isOpen: boolean) => void;
  setLoading: (key: keyof LoadingState, value: boolean) => void;
  setError: (key: keyof ErrorState, value: string | null) => void;

  // Actions - Optimistic Updates
  updateLeadOptimistic: (updates: Partial<Lead>) => void;
  updateAssigneeOptimistic: (userId: string, user?: UserDto) => void;
  updateStatusOptimistic: (status: 'won' | 'lost', reason?: string) => void;
  updateColumnOptimistic: (columnId: string, column?: KanbanColumn) => void;

  // Actions - Activities
  addActivityOptimistic: (activity: LeadActivity) => void;
  updateActivityOptimistic: (activityId: string, updates: Partial<LeadActivity>) => void;
  removeActivityOptimistic: (activityId: string) => void;

  // Actions - Contacts
  addContactOptimistic: (contact: LeadContact) => void;
  updateContactOptimistic: (contactId: string, updates: Partial<LeadContact>) => void;
  removeContactOptimistic: (contactId: string) => void;

  // Actions - Files
  addFileOptimistic: (file: LeadFile) => void;
  removeFileOptimistic: (fileId: string) => void;

  // Actions - Rollback
  rollbackLead: () => void;
  rollbackAssignee: () => void;
  rollbackStatus: () => void;
  rollbackColumn: () => void;

  // Actions - Reset
  reset: () => void;
  clearErrors: () => void;
}

// Backup states for rollback
let leadBackup: Lead | null = null;
let assigneeBackup: string | null = null;
let statusBackup: string | null = null;
let columnBackup: string | null = null;

const initialLoadingState: LoadingState = {
  lead: false,
  activities: false,
  contacts: false,
  files: false,
  assignee: false,
  status: false,
  column: false,
};

const initialErrorState: ErrorState = {
  lead: null,
  activities: null,
  contacts: null,
  files: null,
  assignee: null,
  status: null,
  column: null,
};

export const useLeadModalStore = create<LeadModalState>()(
  devtools(
    (set, get) => ({
      // Initial State
      lead: null,
      modalData: null,
      columns: [],
      users: [],
      isOpen: false,
      loading: { ...initialLoadingState },
      errors: { ...initialErrorState },

      // Load Data Actions
      setLead: (lead) => {
        if (lead) {
          leadBackup = { ...lead };
        }
        set({ lead }, false, 'setLead');
      },

      setModalData: (modalData) => set({ modalData }, false, 'setModalData'),

      setColumns: (columns) => set({ columns }, false, 'setColumns'),

      setUsers: (users) => set({ users }, false, 'setUsers'),

      // UI State Actions
      setIsOpen: (isOpen) => set({ isOpen }, false, 'setIsOpen'),

      setLoading: (key, value) =>
        set(
          (state) => ({
            loading: { ...state.loading, [key]: value },
          }),
          false,
          `setLoading.${key}`
        ),

      setError: (key, value) =>
        set(
          (state) => ({
            errors: { ...state.errors, [key]: value },
          }),
          false,
          `setError.${key}`
        ),

      // Optimistic Updates
      updateLeadOptimistic: (updates) => {
        const { lead } = get();
        if (!lead) return;

        // Backup current state
        leadBackup = { ...lead };

        set(
          { lead: { ...lead, ...updates } },
          false,
          'updateLeadOptimistic'
        );
      },

      updateAssigneeOptimistic: (userId, user) => {
        const { lead, users } = get();
        if (!lead) return;

        // Backup current assignee
        assigneeBackup = lead.assigned_to_user_id;

        // Find user if not provided
        const assignedUser = user || users.find((u) => u.id === userId);

        set(
          {
            lead: {
              ...lead,
              assigned_to_user_id: userId,
              assignedUser: assignedUser || undefined,
            },
          },
          false,
          'updateAssigneeOptimistic'
        );
      },

      updateStatusOptimistic: (status, reason) => {
        const { lead } = get();
        if (!lead) return;

        // Backup current status
        statusBackup = lead.status;

        const updates: Partial<Lead> = { status };
        if (status === 'won' && reason) {
          updates.won_reason = reason;
        } else if (status === 'lost' && reason) {
          updates.lost_reason = reason;
        }

        set(
          { lead: { ...lead, ...updates } },
          false,
          'updateStatusOptimistic'
        );
      },

      updateColumnOptimistic: (columnId, column) => {
        const { lead, columns } = get();
        if (!lead) return;

        // Backup current column
        columnBackup = lead.column_id;

        // Find column if not provided
        const targetColumn = column || columns.find((c) => c.id === columnId);

        set(
          {
            lead: {
              ...lead,
              column_id: columnId,
              column: targetColumn || undefined,
            },
          },
          false,
          'updateColumnOptimistic'
        );
      },

      // Activities
      addActivityOptimistic: (activity) => {
        const { modalData } = get();
        if (!modalData) return;

        set(
          {
            modalData: {
              ...modalData,
              timeline: [activity, ...modalData.timeline],
              stats: modalData.stats
                ? {
                    ...modalData.stats,
                    totalActivities: modalData.stats.totalActivities + 1,
                  }
                : undefined,
            },
          },
          false,
          'addActivityOptimistic'
        );
      },

      updateActivityOptimistic: (activityId, updates) => {
        const { modalData } = get();
        if (!modalData) return;

        set(
          {
            modalData: {
              ...modalData,
              timeline: modalData.timeline.map((activity) =>
                activity.id === activityId
                  ? { ...activity, ...updates }
                  : activity
              ),
            },
          },
          false,
          'updateActivityOptimistic'
        );
      },

      removeActivityOptimistic: (activityId) => {
        const { modalData } = get();
        if (!modalData) return;

        set(
          {
            modalData: {
              ...modalData,
              timeline: modalData.timeline.filter(
                (activity) => activity.id !== activityId
              ),
              stats: modalData.stats
                ? {
                    ...modalData.stats,
                    totalActivities: Math.max(0, modalData.stats.totalActivities - 1),
                  }
                : undefined,
            },
          },
          false,
          'removeActivityOptimistic'
        );
      },

      // Contacts
      addContactOptimistic: (contact) => {
        const { modalData } = get();
        if (!modalData) return;

        set(
          {
            modalData: {
              ...modalData,
              contacts: [...modalData.contacts, contact],
              stats: modalData.stats
                ? {
                    ...modalData.stats,
                    totalContacts: modalData.stats.totalContacts + 1,
                  }
                : undefined,
            },
          },
          false,
          'addContactOptimistic'
        );
      },

      updateContactOptimistic: (contactId, updates) => {
        const { modalData } = get();
        if (!modalData) return;

        set(
          {
            modalData: {
              ...modalData,
              contacts: modalData.contacts.map((contact) =>
                contact.id === contactId ? { ...contact, ...updates } : contact
              ),
            },
          },
          false,
          'updateContactOptimistic'
        );
      },

      removeContactOptimistic: (contactId) => {
        const { modalData } = get();
        if (!modalData) return;

        set(
          {
            modalData: {
              ...modalData,
              contacts: modalData.contacts.filter(
                (contact) => contact.id !== contactId
              ),
              stats: modalData.stats
                ? {
                    ...modalData.stats,
                    totalContacts: Math.max(0, modalData.stats.totalContacts - 1),
                  }
                : undefined,
            },
          },
          false,
          'removeContactOptimistic'
        );
      },

      // Files
      addFileOptimistic: (file) => {
        const { modalData } = get();
        if (!modalData) return;

        set(
          {
            modalData: {
              ...modalData,
              files: [...modalData.files, file],
              stats: modalData.stats
                ? {
                    ...modalData.stats,
                    totalFiles: modalData.stats.totalFiles + 1,
                  }
                : undefined,
            },
          },
          false,
          'addFileOptimistic'
        );
      },

      removeFileOptimistic: (fileId) => {
        const { modalData } = get();
        if (!modalData) return;

        set(
          {
            modalData: {
              ...modalData,
              files: modalData.files.filter((file) => file.id !== fileId),
              stats: modalData.stats
                ? {
                    ...modalData.stats,
                    totalFiles: Math.max(0, modalData.stats.totalFiles - 1),
                  }
                : undefined,
            },
          },
          false,
          'removeFileOptimistic'
        );
      },

      // Rollback Actions
      rollbackLead: () => {
        if (leadBackup) {
          set({ lead: { ...leadBackup } }, false, 'rollbackLead');
        }
      },

      rollbackAssignee: () => {
        const { lead } = get();
        if (lead && assigneeBackup !== null) {
          set(
            {
              lead: {
                ...lead,
                assigned_to_user_id: assigneeBackup,
                assignedUser: undefined, // Will be refetched
              },
            },
            false,
            'rollbackAssignee'
          );
        }
      },

      rollbackStatus: () => {
        const { lead } = get();
        if (lead && statusBackup !== null) {
          set(
            { lead: { ...lead, status: statusBackup } },
            false,
            'rollbackStatus'
          );
        }
      },

      rollbackColumn: () => {
        const { lead } = get();
        if (lead && columnBackup !== null) {
          set(
            {
              lead: {
                ...lead,
                column_id: columnBackup,
                column: undefined, // Will be refetched
              },
            },
            false,
            'rollbackColumn'
          );
        }
      },

      // Reset Actions
      reset: () => {
        leadBackup = null;
        assigneeBackup = null;
        statusBackup = null;
        columnBackup = null;

        set(
          {
            lead: null,
            modalData: null,
            columns: [],
            users: [],
            isOpen: false,
            loading: { ...initialLoadingState },
            errors: { ...initialErrorState },
          },
          false,
          'reset'
        );
      },

      clearErrors: () => {
        set(
          { errors: { ...initialErrorState } },
          false,
          'clearErrors'
        );
      },
    }),
    {
      name: 'lead-modal-store',
    }
  )
);