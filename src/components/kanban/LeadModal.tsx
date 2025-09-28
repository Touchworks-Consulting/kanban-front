import React, { useState, useEffect } from 'react';
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
import { leadModalService } from '../../services/leadModalService';
import { userService, type UserDto } from '../../services/users';

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
  const [lead, setLead] = useState<Lead | null>(null);
  const [modalData, setModalData] = useState<LeadModalData | null>(null);
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadModalData = async () => {
    if (!leadId) return;

    setIsLoading(true);
    setError(null);

    try {
      const [data, usersList] = await Promise.all([
        leadModalService.getLeadModalData(leadId),
        userService.list()
      ]);

      setLead((data as any).lead);
      setColumns(data.columns || []);
      setUsers(usersList || []);
      setModalData({
        timeline: data.timeline || [],
        contacts: data.contacts || [],
        files: data.files || [],
        stats: data.stats || {
          totalActivities: 0,
          pendingTasks: 0,
          totalContacts: 0,
          totalFiles: 0
        }
      });
    } catch (err: any) {
      console.error('Erro ao carregar dados do modal:', err);
      setError('Erro ao carregar dados do lead');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && leadId) {
      loadModalData();
    }
  }, [isOpen, leadId]);

  const handleClose = () => {
    setLead(null);
    setModalData(null);
    setColumns([]);
    setError(null);
    onClose();
  };

  const handleUpdate = () => {
    loadModalData();
    onUpdate?.();
  };

  const handleStatusChange = async (status: 'won' | 'lost', reason?: string) => {
    if (!lead) return;

    try {
      await leadModalService.updateLeadStatus(lead.id, status, reason);
      await loadModalData();
      onUpdate?.();
    } catch (error) {
      console.error('Erro ao atualizar status do lead:', error);
    }
  };

  const handleMoveToNext = async (nextColumnId: string) => {
    if (!lead) return;

    try {
      await leadModalService.moveLeadToColumn(lead.id, nextColumnId);
      await loadModalData();
      onUpdate?.();
    } catch (error) {
      console.error('Erro ao mover lead:', error);
    }
  };

  const handleUpdateLead = async (updates: Partial<Lead>) => {
    if (!lead) return;

    try {
      // Convert tags to string array if present
      const updatePayload: any = { ...updates };
      if (updatePayload.tags) {
        updatePayload.tags = updatePayload.tags.map((tag: any) =>
          typeof tag === 'string' ? tag : tag.name || tag.id || String(tag)
        );
      }

      await leadModalService.updateLead(lead.id, updatePayload);
      await loadModalData();
      onUpdate?.();
    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
      throw error;
    }
  };

  // Handler unificado para mudança de responsável (usado por header e sidebar)
  const handleAssigneeChange = async (userId: string) => {
    if (!lead) return;

    try {
      // Payload completo para evitar problemas no backend
      const updatePayload = {
        name: lead.name,
        phone: lead.phone || '',
        email: lead.email || '',
        message: lead.message || '',
        platform: lead.platform || 'WhatsApp',
        channel: lead.channel || lead.platform || 'WhatsApp',
        campaign: lead.campaign || 'Orgânico',
        value: lead.value || 0,
        notes: lead.notes || '',
        status: lead.status,
        assigned_to_user_id: userId || ''
      };

      await leadModalService.updateLead(lead.id, updatePayload);
      await loadModalData();
      onUpdate?.();
    } catch (error) {
      console.error('Erro ao alterar responsável:', error);
      throw error;
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden focus:outline-none border-0 p-0 [&>button]:!visible [&>button]:!opacity-100 [&>button]:!bg-white [&>button]:!border [&>button]:!shadow-sm [&>button]:!z-50 [&>button]:!top-2 [&>button]:!right-2">
        <div className="sr-only">
          <DialogTitle>{lead ? `Lead: ${lead.name}` : 'Detalhes do Lead'}</DialogTitle>
          <DialogDescription>
            Modal com informações detalhadas do lead incluindo dados, atividades e arquivos
          </DialogDescription>
        </div>
        {isLoading ? (
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
        ) : error ? (
          <div className="flex items-center justify-center h-96 text-center p-6">
            <div>
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={loadModalData} variant="outline">
                Tentar Novamente
              </Button>
            </div>
          </div>
        ) : lead ? (
          <div className="flex flex-col max-h-[95vh]">
            {/* Header Fixo com Pipeline Visual */}
            <PipelineHeader
              lead={lead}
              columns={columns}
              onStatusChange={handleStatusChange}
              onMoveToNext={handleMoveToNext}
              onUpdate={handleUpdate}
              onDelete={onDelete}
              onAssigneeChange={handleAssigneeChange}
              users={users}
              className="flex-shrink-0"
            />

            {/* Duas Colunas com Scroll Independente */}
            <div className="flex flex-1 min-h-0">
              {/* Coluna Esquerda - Dados do Lead */}
              <LeadDataSidebar
                lead={lead}
                columns={columns}
                onUpdateLead={handleUpdateLead}
                className="w-80 flex-shrink-0"
              />

              {/* Coluna Direita - Atividades */}
              <ActivitiesArea
                leadId={leadId}
                modalData={modalData}
                onUpdate={handleUpdate}
                className="flex-1"
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