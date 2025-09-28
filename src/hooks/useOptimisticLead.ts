import { useCallback, useRef } from 'react';
import { useLeadModalStore } from '../stores/leadModalStore';
import { optimizedLeadService } from '../services/optimizedLeadService';
import type { Lead } from '../types/kanban';

/**
 * Hook for optimistic lead updates with debouncing and error handling
 */
export const useOptimisticLead = () => {
  const {
    lead,
    loading,
    errors,
    setLead,
    setLoading,
    setError,
    updateLeadOptimistic,
    updateAssigneeOptimistic,
    updateStatusOptimistic,
    updateColumnOptimistic,
    rollbackLead,
    rollbackAssignee,
    rollbackStatus,
    rollbackColumn,
  } = useLeadModalStore();

  // Debounce timer refs
  const debounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  /**
   * Update assignee with optimistic UI and rollback on error
   */
  const updateAssignee = useCallback(async (userId: string) => {
    if (!lead) return;

    const users = useLeadModalStore.getState().users;
    const assignedUser = users.find(u => u.id === userId);

    // Optimistic update
    updateAssigneeOptimistic(userId, assignedUser);
    setLoading('assignee', true);
    setError('assignee', null);

    try {
      const updatedLead = await optimizedLeadService.updateAssignee(lead.id, userId);
      setLead(updatedLead);
      return updatedLead;
    } catch (error) {
      console.error('Failed to update assignee:', error);
      setError('assignee', 'Erro ao alterar responsável');
      rollbackAssignee();
      throw error;
    } finally {
      setLoading('assignee', false);
    }
  }, [lead, updateAssigneeOptimistic, setLoading, setError, setLead, rollbackAssignee]);

  /**
   * Update status with optimistic UI and rollback on error
   */
  const updateStatus = useCallback(async (status: 'won' | 'lost', reason?: string) => {
    if (!lead) return;

    // Optimistic update
    updateStatusOptimistic(status, reason);
    setLoading('status', true);
    setError('status', null);

    try {
      const updatedLead = await optimizedLeadService.updateStatus(lead.id, status, reason);
      setLead(updatedLead);
      return updatedLead;
    } catch (error) {
      console.error('Failed to update status:', error);
      setError('status', 'Erro ao atualizar status');
      rollbackStatus();
      throw error;
    } finally {
      setLoading('status', false);
    }
  }, [lead, updateStatusOptimistic, setLoading, setError, setLead, rollbackStatus]);

  /**
   * Move to column with optimistic UI and rollback on error
   */
  const moveToColumn = useCallback(async (columnId: string) => {
    if (!lead) return;

    const columns = useLeadModalStore.getState().columns;
    const targetColumn = columns.find(c => c.id === columnId);

    // Optimistic update
    updateColumnOptimistic(columnId, targetColumn);
    setLoading('column', true);
    setError('column', null);

    try {
      const updatedLead = await optimizedLeadService.moveToColumn(lead.id, columnId);
      setLead(updatedLead);
      return updatedLead;
    } catch (error) {
      console.error('Failed to move to column:', error);
      setError('column', 'Erro ao mover lead');
      rollbackColumn();
      throw error;
    } finally {
      setLoading('column', false);
    }
  }, [lead, updateColumnOptimistic, setLoading, setError, setLead, rollbackColumn]);

  /**
   * Update lead field with debouncing for rapid changes
   */
  const updateLeadField = useCallback(async (
    field: keyof Lead,
    value: any,
    debounceMs: number = 500
  ) => {
    if (!lead) return;

    // Optimistic update
    updateLeadOptimistic({ [field]: value });

    const debounceKey = `${lead.id}-${field}`;

    // Clear existing timer
    if (debounceTimers.current.has(debounceKey)) {
      clearTimeout(debounceTimers.current.get(debounceKey)!);
    }

    // Set new timer
    const timer = setTimeout(async () => {
      setLoading('lead', true);
      setError('lead', null);

      try {
        const updatedLead = await optimizedLeadService.updateLead(lead.id, { [field]: value });
        setLead(updatedLead);
        debounceTimers.current.delete(debounceKey);
      } catch (error) {
        console.error(`Failed to update ${field}:`, error);
        setError('lead', `Erro ao atualizar ${field}`);
        rollbackLead();
        debounceTimers.current.delete(debounceKey);
        throw error;
      } finally {
        setLoading('lead', false);
      }
    }, debounceMs);

    debounceTimers.current.set(debounceKey, timer);
  }, [lead, updateLeadOptimistic, setLoading, setError, setLead, rollbackLead]);

  /**
   * Update multiple fields with debouncing
   */
  const updateLeadFields = useCallback(async (
    updates: Partial<Lead>,
    debounceMs: number = 800
  ) => {
    if (!lead) return;

    // Optimistic update
    updateLeadOptimistic(updates);

    const debounceKey = `${lead.id}-batch`;

    // Clear existing timer
    if (debounceTimers.current.has(debounceKey)) {
      clearTimeout(debounceTimers.current.get(debounceKey)!);
    }

    // Set new timer
    const timer = setTimeout(async () => {
      setLoading('lead', true);
      setError('lead', null);

      try {
        const updatedLead = await optimizedLeadService.updateLead(lead.id, updates);
        setLead(updatedLead);
        debounceTimers.current.delete(debounceKey);
      } catch (error) {
        console.error('Failed to update lead fields:', error);
        setError('lead', 'Erro ao atualizar lead');
        rollbackLead();
        debounceTimers.current.delete(debounceKey);
        throw error;
      } finally {
        setLoading('lead', false);
      }
    }, debounceMs);

    debounceTimers.current.set(debounceKey, timer);
  }, [lead, updateLeadOptimistic, setLoading, setError, setLead, rollbackLead]);

  /**
   * Cancel all pending debounced updates
   */
  const cancelPendingUpdates = useCallback(() => {
    debounceTimers.current.forEach((timer) => clearTimeout(timer));
    debounceTimers.current.clear();
  }, []);

  /**
   * Force sync with server (useful for conflict resolution)
   */
  const syncWithServer = useCallback(async () => {
    if (!lead) return;

    setLoading('lead', true);
    setError('lead', null);

    try {
      const { lead: syncedLead } = await optimizedLeadService.syncFromServer(lead.id);
      setLead(syncedLead);
      return syncedLead;
    } catch (error) {
      console.error('Failed to sync with server:', error);
      setError('lead', 'Erro ao sincronizar com servidor');
      throw error;
    } finally {
      setLoading('lead', false);
    }
  }, [lead, setLoading, setError, setLead]);

  return {
    // State
    lead,
    loading,
    errors,

    // Actions
    updateAssignee,
    updateStatus,
    moveToColumn,
    updateLeadField,
    updateLeadFields,
    cancelPendingUpdates,
    syncWithServer,

    // Utilities
    isLoading: (key?: keyof typeof loading) => {
      if (key) return loading[key];
      return Object.values(loading).some(Boolean);
    },
    hasError: (key?: keyof typeof errors) => {
      if (key) return !!errors[key];
      return Object.values(errors).some(Boolean);
    },
    getError: (key: keyof typeof errors) => errors[key],

    // Debug utilities
    _debugState: () => ({
      lead,
      loading,
      errors,
      pendingTimers: debounceTimers.current.size
    })
  };
};