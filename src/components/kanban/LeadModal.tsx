import React, { useState, useEffect } from 'react';
import type { Lead, KanbanColumn } from '../../types/kanban';
import type { LeadModalData } from '../../types/leadModal';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { PipedriveLikeHeader } from './PipedriveLikeHeader';
import { PipedriveLikeHeaderSkeleton } from './PipedriveLikeHeaderSkeleton';
import { LeadDataSidebar } from './LeadDataSidebar';
import { LeadDataSidebarSkeleton } from './LeadDataSidebarSkeleton';
import { ActivitiesArea } from './ActivitiesArea';
import { ActivitiesAreaSkeleton } from './ActivitiesAreaSkeleton';
import { leadModalService } from '../../services/leadModalService';

interface LeadModalProps {
  leadId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export const LeadModal: React.FC<LeadModalProps> = ({
  leadId,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [lead, setLead] = useState<Lead | null>(null);
  const [modalData, setModalData] = useState<LeadModalData | null>(null);
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadModalData = async () => {
    if (!leadId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await leadModalService.getLeadModalData(leadId);
      setLead(data.lead);
      setColumns(data.columns || []);
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
      await leadModalService.updateLead(lead.id, updates);
      await loadModalData();
      onUpdate?.();
    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
      throw error;
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden p-0 focus:outline-none border-0">
        <div className="sr-only">
          <DialogTitle>{lead ? `Lead: ${lead.name}` : 'Detalhes do Lead'}</DialogTitle>
          <DialogDescription>
            Modal com informações detalhadas do lead incluindo dados, atividades e arquivos
          </DialogDescription>
        </div>
        {isLoading ? (
          <div className="flex flex-col max-h-[95vh]">
            {/* Header Skeleton */}
            <PipedriveLikeHeaderSkeleton className="flex-shrink-0" />

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
            {/* Header Fixo Estilo Pipedrive */}
            <PipedriveLikeHeader
              lead={lead}
              columns={columns}
              onStatusChange={handleStatusChange}
              onMoveToNext={handleMoveToNext}
              onUpdate={handleUpdate}
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