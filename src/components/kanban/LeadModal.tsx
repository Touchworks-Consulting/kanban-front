import React, { useEffect } from 'react';
import type { Lead, KanbanColumn } from '../../types/kanban';
import type { LeadModalData } from '../../types/leadModal';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { PipelineHeader } from './PipelineHeader';
import { PipelineHeaderSkeleton } from './PipelineHeaderSkeleton';
import { LeadDataSidebar } from './LeadDataSidebar';
import { LeadDataSidebarSkeleton } from './LeadDataSidebarSkeleton';
import { ActivitiesArea } from './ActivitiesArea';
import { ActivitiesAreaSkeleton } from './ActivitiesAreaSkeleton';
import { useLeadModalStore } from '../../stores/leadModalStore';
import { optimizedLeadService } from '../../services/optimizedLeadService';
import type { UserDto } from '../../services/users';

interface LeadModalProps {
  leadId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
  onDelete?: (leadId: string) => Promise<void>;
}

export const LeadModal: React.FC<LeadModalProps> = ({
  leadId,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}) => {
  // Use Zustand store instead of local state
  const {
    lead,
    modalData,
    columns,
    users,
    loading,
    errors,
    setLead,
    setModalData,
    setColumns,
    setUsers,
    setIsOpen,
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
    reset,
    clearErrors,
  } = useLeadModalStore();

  // Load initial data only once when modal opens
  const loadInitialData = async () => {
    if (!leadId) return;

    setLoading('lead', true);
    setError('lead', null);

    try {
      const data = await optimizedLeadService.loadInitialData(leadId);

      setLead(data.lead);
      setColumns(data.columns);
      setUsers(data.users);
      setModalData(data.modalData);
    } catch (err: any) {
      console.error('Erro ao carregar dados do modal:', err);
      setError('lead', 'Erro ao carregar dados do lead');
    } finally {
      setLoading('lead', false);
    }
  };

  useEffect(() => {
    if (isOpen && leadId) {
      setIsOpen(true);
      clearErrors();
      loadInitialData();
    } else if (!isOpen) {
      setIsOpen(false);
    }
  }, [isOpen, leadId]);

  const handleClose = () => {
    reset();
    onClose();
  };

  // Optimistic update for status changes
  const handleStatusChange = async (status: 'won' | 'lost', reason?: string) => {
    if (!lead) return;

    // Immediate UI update
    updateStatusOptimistic(status, reason);
    setLoading('status', true);
    setError('status', null);

    try {
      const updatedLead = await optimizedLeadService.updateStatus(lead.id, status, reason);
      setLead(updatedLead); // Update with server response
      onUpdate?.();
    } catch (error) {
      console.error('Erro ao atualizar status do lead:', error);
      setError('status', 'Erro ao atualizar status');
      rollbackStatus(); // Rollback on error
    } finally {
      setLoading('status', false);
    }
  };

  // Optimistic update for column moves
  const handleMoveToNext = async (nextColumnId: string) => {
    if (!lead) return;

    const targetColumn = columns.find(c => c.id === nextColumnId);

    // Immediate UI update
    updateColumnOptimistic(nextColumnId, targetColumn);
    setLoading('column', true);
    setError('column', null);

    try {
      const updatedLead = await optimizedLeadService.moveToColumn(lead.id, nextColumnId);
      setLead(updatedLead); // Update with server response
      onUpdate?.();
    } catch (error) {
      console.error('Erro ao mover lead:', error);
      setError('column', 'Erro ao mover lead');
      rollbackColumn(); // Rollback on error
    } finally {
      setLoading('column', false);
    }
  };

  // Optimistic update for general lead updates
  const handleUpdateLead = async (updates: Partial<Lead>) => {
    if (!lead) return;

    // Immediate UI update
    updateLeadOptimistic(updates);
    setLoading('lead', true);
    setError('lead', null);

    try {
      const updatedLead = await optimizedLeadService.updateLead(lead.id, updates);
      setLead(updatedLead); // Update with server response
      onUpdate?.();
    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
      setError('lead', 'Erro ao atualizar lead');
      rollbackLead(); // Rollback on error
      throw error;
    } finally {
      setLoading('lead', false);
    }
  };

  // Optimistic update for assignee changes - NOW TRULY OPTIMIZED!
  const handleAssigneeChange = async (userId: string) => {
    if (!lead) return;

    const assignedUser = users.find(u => u.id === userId);

    // Immediate UI update - no more full payload!
    updateAssigneeOptimistic(userId, assignedUser);
    setLoading('assignee', true);
    setError('assignee', null);

    try {
      const updatedLead = await optimizedLeadService.updateAssignee(lead.id, userId);
      setLead(updatedLead); // Update with server response
      onUpdate?.();
    } catch (error) {
      console.error('Erro ao alterar responsável:', error);
      setError('assignee', 'Erro ao alterar responsável');
      rollbackAssignee(); // Rollback on error
      throw error;
    } finally {
      setLoading('assignee', false);
    }
  };

  if (!isOpen) return null;

  // Use granular loading states
  const isMainLoading = loading.lead;
  const hasMainError = errors.lead;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden focus:outline-none border-0 p-0 [&>button]:!visible [&>button]:!opacity-100 [&>button]:!bg-white [&>button]:!border [&>button]:!shadow-sm [&>button]:!z-50 [&>button]:!top-2 [&>button]:!right-2">
        <div className="sr-only">
          <DialogTitle>{lead ? `Lead: ${lead.name}` : 'Detalhes do Lead'}</DialogTitle>
          <DialogDescription>
            Modal com informações detalhadas do lead incluindo dados, atividades e arquivos
          </DialogDescription>
        </div>
        {isMainLoading ? (
          <div className="flex flex-col max-h-[95vh]">
            {/* Header Skeleton */}
            <PipelineHeaderSkeleton className="flex-shrink-0" />

            {/* Duas Colunas com Skeletons */}
            <div className="flex flex-1 min-h-0">
              {/* Coluna Esquerda - Sidebar Skeleton */}
              <LeadDataSidebarSkeleton className="w-80 flex-shrink-0" />

              {/* Coluna Direita - Activities Skeleton */}
              <ActivitiesAreaSkeleton className="flex-1" />
            </div>
          </div>
        ) : hasMainError ? (
          <div className="flex items-center justify-center h-96 text-center p-6">
            <div>
              <p className="text-destructive mb-4">{hasMainError}</p>
              <Button onClick={loadInitialData} variant="outline">
                Tentar Novamente
              </Button>
            </div>
          </div>
        ) : lead ? (
          <div className="flex flex-col max-h-[95vh]">
            {/* Header Fixo com Pipeline Visual - with granular loading states */}
            <PipelineHeader
              lead={lead}
              columns={columns}
              onStatusChange={handleStatusChange}
              onMoveToNext={handleMoveToNext}
              onUpdate={() => {}} // No longer needed - using optimistic updates
              onDelete={onDelete}
              onAssigneeChange={handleAssigneeChange}
              users={users}
              className="flex-shrink-0"
              // TODO: Add loading states for micro-interactions
              // isAssigneeLoading={loading.assignee}
              // isStatusLoading={loading.status}
              // isColumnLoading={loading.column}
            />

            {/* Duas Colunas com Scroll Independente */}
            <div className="flex flex-1 min-h-0">
              {/* Coluna Esquerda - Dados do Lead */}
              <LeadDataSidebar
                lead={lead}
                columns={columns}
                onUpdateLead={handleUpdateLead}
                className="w-80 flex-shrink-0"
                // TODO: Add loading state for lead updates
                // isUpdating={loading.lead}
                // updateError={errors.lead}
              />

              {/* Coluna Direita - Atividades */}
              <ActivitiesArea
                leadId={leadId}
                modalData={modalData}
                onUpdate={() => {}} // No longer needed - using optimistic updates
                className="flex-1"
                // TODO: Add loading states for activities
                // isActivitiesLoading={loading.activities}
                // activitiesError={errors.activities}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-96">
            <p className="text-muted-foreground">Lead não encontrado</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};