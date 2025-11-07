import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
import { AgendaPanel } from './AgendaPanel';
import { useLeadModalStore } from '../../stores/leadModalStore';
import { useKanbanStore } from '../../stores';
import { optimizedLeadService } from '../../services/optimizedLeadService';
import type { UserDto } from '../../services/users';

interface LeadModalProps {
  leadId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
  onDelete?: (leadId: string) => Promise<void>;
  isEmbed?: boolean; // Se true, remove o fundo escuro
}

export const LeadModal: React.FC<LeadModalProps> = ({
  leadId,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  isEmbed = false,
}) => {
  // Removido: Estado para comunicação com AgendaPanel - não mais necessário

  // Use Zustand store with selective subscriptions to minimize re-renders
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
    // Sync lead changes to board before closing (without API call)
    if (lead && leadId) {
      const { optimisticUpdateLead } = useKanbanStore.getState();
      optimisticUpdateLead(leadId, lead);
    }

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

  // Optimistic update for all sidebar field updates (including status)
  const handleUpdateLead = useCallback(async (updates: Partial<Lead>) => {
    if (!lead) return;

    // Immediate UI update
    updateLeadOptimistic(updates);
    setLoading('sidebarField', true); // Use specific loading state for sidebar fields
    setError('lead', null);

    try {
      await optimizedLeadService.updateLead(lead.id, updates);
      console.log('✅ handleUpdateLead: Campo atualizado com sucesso', { field: Object.keys(updates)[0], value: Object.values(updates)[0] });
      // Don't setLead() with server response for sidebar updates - optimistic update is sufficient
      // Don't call onUpdate() for sidebar fields - prevents full modal refresh
    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
      setError('lead', 'Erro ao atualizar lead');
      rollbackLead(); // Rollback on error
      throw error;
    } finally {
      setLoading('sidebarField', false);
    }
  }, [lead, updateLeadOptimistic, setLoading, setError, rollbackLead]);

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
      // Don't call onUpdate() for assignee changes - optimistic updates are sufficient
    } catch (error) {
      console.error('Erro ao alterar responsável:', error);
      setError('assignee', 'Erro ao alterar responsável');
      rollbackAssignee(); // Rollback on error
      throw error;
    } finally {
      setLoading('assignee', false);
    }
  };

  // Handle delete lead
  const handleDeleteLead = async () => {
    console.log('🗑️ handleDeleteLead chamado', { lead: lead?.id, hasOnDelete: !!onDelete });

    if (!lead || !onDelete) {
      console.warn('⚠️ handleDeleteLead: lead ou onDelete não disponível', { lead: !!lead, onDelete: !!onDelete });
      return;
    }

    try {
      console.log('🗑️ Chamando onDelete para lead:', lead.id);
      await onDelete(lead.id);
      console.log('✅ Lead excluído com sucesso');
      handleClose();
    } catch (error) {
      console.error('❌ Erro ao excluir lead:', error);
      setError('lead', 'Erro ao excluir lead');
      throw error;
    }
  };

  if (!isOpen) return null;

  // Use granular loading states
  const isMainLoading = loading.lead;
  const hasMainError = errors.lead;

  // Memoize lead object for sidebar - create NEW object with STABLE reference
  // This ensures that if individual field values don't change, the returned object reference stays the same
  const leadForSidebar = useMemo(() => {
    if (!lead) return null;
    return {
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      value: lead.value,
      status: lead.status,
      campaign: lead.campaign,
      platform: lead.platform,
      notes: lead.notes,
      message: lead.message,
      is_customer: lead.is_customer,
      assigned_to_user_id: lead.assigned_to_user_id,
      column_id: lead.column_id,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
      tags: lead.tags,
    } as Lead;
  }, [
    lead?.id,
    lead?.name,
    lead?.phone,
    lead?.email,
    lead?.value,
    lead?.status,
    lead?.campaign,
    lead?.platform,
    lead?.notes,
    lead?.message,
    lead?.is_customer,
    lead?.assigned_to_user_id,
    lead?.column_id,
    lead?.createdAt,
    JSON.stringify(lead?.tags)
  ]);

  // Memoize lead object for header - create NEW object with STABLE reference
  const leadForHeader = useMemo(() => {
    if (!lead) return null;
    return {
      id: lead.id,
      name: lead.name,
      value: lead.value,
      status: lead.status,
      column_id: lead.column_id,
      assigned_to_user_id: lead.assigned_to_user_id,
      updatedAt: lead.updatedAt,
      phone: lead.phone,
      email: lead.email,
      column: lead.column,
      assignedUser: lead.assignedUser,
    } as Lead;
  }, [
    lead?.id,
    lead?.name,
    lead?.value,
    lead?.status,
    lead?.column_id,
    lead?.assigned_to_user_id,
  ]);

  // Stable references for ActivitiesArea to prevent unnecessary re-renders
  const leadName = useMemo(() => lead?.name, [lead?.name]);

  const memoizedModalData = useMemo(() => modalData, [
    modalData?.timeline?.length,
    modalData?.contacts?.length,
    modalData?.files?.length,
    JSON.stringify(modalData?.timeline?.map(t => t.id)),
    JSON.stringify(modalData?.contacts?.map(c => c.id)),
    JSON.stringify(modalData?.files?.map(f => f.id))
  ]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent isEmbed={isEmbed} className="max-w-7xl max-h-[95vh] overflow-hidden focus:outline-none border-0 p-0 [&>button]:!visible [&>button]:!opacity-100 [&>button]:!bg-background [&>button]:!text-foreground [&>button]:!border [&>button]:!border-border [&>button]:!shadow-sm [&>button]:!z-50 [&>button]:!top-2 [&>button]:!right-2 [&>button]:hover:!bg-muted">
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
          <div className="flex flex-col max-h-[95vh] overflow-hidden w-full">
            {/* Header Fixo com Pipeline Visual - with granular loading states */}
            <PipelineHeader
              lead={leadForHeader}
              columns={columns}
              onStatusChange={handleStatusChange}
              onMoveToNext={handleMoveToNext}
              onUpdate={async () => {
                // Atualizar o estado interno do modal primeiro
                if (leadId) {
                  try {
                    const data = await optimizedLeadService.loadInitialData(leadId);
                    setLead(data.lead); // Atualizar estado interno do modal
                  } catch (error) {
                    console.error('Erro ao atualizar lead no modal:', error);
                  }
                }

                // Depois atualizar o board
                onUpdate?.();
              }}
              onDelete={onDelete}
              onAssigneeChange={handleAssigneeChange}
              users={users}
              className="flex-shrink-0"
              // TODO: Add loading states for micro-interactions
              // isAssigneeLoading={loading.assignee}
              // isStatusLoading={loading.status}
              // isColumnLoading={loading.column}
            />

            {/* Três Colunas com Scroll Independente */}
            <div className="flex flex-1 min-h-0 overflow-hidden">
              {/* Coluna Esquerda - Dados do Lead */}
              <LeadDataSidebar
                lead={leadForSidebar}
                columns={columns}
                onUpdateLead={handleUpdateLead}
                onDeleteLead={handleDeleteLead}
                users={users}
                onAssigneeChange={handleAssigneeChange}
                className="w-72 flex-shrink-0"
                // Optionally pass loading state for subtle feedback
                // isUpdating={loading.sidebarField}
              />

              {/* Coluna Central - Atividades */}
              <ActivitiesArea
                leadId={leadId}
                modalData={memoizedModalData}
                leadName={leadName}
                onUpdate={() => {}} // No longer needed - using optimistic updates
                className="flex-1"
                // TODO: Add loading states for activities
                // isActivitiesLoading={loading.activities}
                // activitiesError={errors.activities}
              />

              {/* Coluna Direita - Agenda Global do Usuário */}
              <AgendaPanel
                onNewActivity={() => {
                  // TODO: Implementar nova lógica direta se necessário
                  console.log('AgendaPanel: Nova atividade clicada - funcionalidade desabilitada temporariamente');
                }}
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