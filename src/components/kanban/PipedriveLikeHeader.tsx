import React, { useState, useEffect } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { LossReasonDialog } from './LossReasonDialog';
import { userService, type UserDto } from '../../services/users';
import { leadModalService } from '../../services/leadModalService';
import { toast } from 'sonner';
import {
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Loader2,
  Star,
  StarOff
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Lead, KanbanColumn } from '../../types/kanban';
import { formatCurrency, formatDistanceToNow } from '../../utils/helpers';

// Estilos CSS para pipeline com setas estilo Pipedrive
const customStyles = `
  .pipeline-arrow {
    transition: all 0.3s ease;
  }

  .pipeline-arrow:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  .pipeline-tooltip {
    pointer-events: none;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translate(-50%, -100%) scale(0.8); }
    to { opacity: 1; transform: translate(-50%, -100%) scale(1); }
  }

  .group:hover .pipeline-tooltip {
    animation: fadeIn 0.2s ease-out;
  }
`;

interface PipedriveLikeHeaderProps {
  lead: Lead;
  columns: KanbanColumn[];
  onStatusChange?: (status: 'won' | 'lost', reason?: string) => Promise<void>;
  onMoveToNext?: (nextColumnId: string) => Promise<void>;
  onUpdate?: () => void;
  className?: string;
}

export const PipedriveLikeHeader: React.FC<PipedriveLikeHeaderProps> = ({
  lead,
  columns,
  onStatusChange,
  onMoveToNext,
  onUpdate,
  className
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showLossReasonDialog, setShowLossReasonDialog] = useState(false);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const isWon = lead.status === 'won';
  const isLost = lead.status === 'lost';
  const isActive = lead.status !== 'won' && lead.status !== 'lost';

  const sortedColumns = columns.sort((a, b) => a.position - b.position);
  const currentColumnIndex = sortedColumns.findIndex(col => col.id === lead.column_id);
  const progressPercentage = currentColumnIndex >= 0
    ? ((currentColumnIndex + 1) / sortedColumns.length) * 100
    : 0;

  // Carregar usuários
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        const usersList = await userService.list();
        setUsers(usersList);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        toast.error('Erro ao carregar lista de usuários');
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, []);

  const handleWon = async () => {
    if (!onStatusChange) return;
    setIsLoading(true);
    try {
      await onStatusChange('won');
    } catch (error) {
      console.error('Erro ao marcar como ganho:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLostClick = () => {
    setShowLossReasonDialog(true);
  };

  const handleLossReasonConfirm = async (reason: string) => {
    if (!onStatusChange) return;
    setIsLoading(true);
    try {
      await onStatusChange('lost', reason);
    } catch (error) {
      console.error('Erro ao marcar como perdido:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssigneeChange = async (userId: string) => {
    if (!onUpdate) return;

    try {
      setIsLoading(true);

      // Criar payload completo como o EditLeadModal faz
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

      // Atualizar no backend com payload completo
      await leadModalService.updateLead(lead.id, updatePayload);

      // Mostrar feedback
      if (userId) {
        const selectedUser = users.find(u => u.id === userId);
        toast.success(`Lead atribuído para ${selectedUser?.name || 'vendedor selecionado'}`);
      } else {
        toast.success('Responsável removido do lead');
      }

      // Recarregar dados do modal para atualizar o estado
      onUpdate();
    } catch (error) {
      console.error('Erro ao alterar responsável:', error);
      toast.error('Erro ao alterar vendedor responsável');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (isWon) {
      return (
        <Badge className="bg-green-600 text-white border-0 font-medium">
          <CheckCircle className="w-3 h-3 mr-1" />
          Ganho
        </Badge>
      );
    }
    if (isLost) {
      return (
        <Badge variant="destructive" className="font-medium">
          <XCircle className="w-3 h-3 mr-1" />
          Perdido
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-blue-200 text-blue-600 font-medium">
        <Star className="w-3 h-3 mr-1" />
        Em progresso
      </Badge>
    );
  };

  const getPipelineColor = (index: number) => {
    if (index <= currentColumnIndex) {
      return columns[index]?.color || '#3b82f6';
    }
    return '#e5e7eb';
  };

  return (
    <>
      {/* Estilos CSS customizados */}
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />

      <div className={cn('bg-background border-b sticky top-0 z-10', className)}>
      {/* Primeira linha - Nome, Status, Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-4 gap-3">
        {/* Esquerda - Nome do Lead e Status */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="min-w-0 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
              <h1 className="text-lg font-semibold text-foreground truncate">
                {lead.name}
              </h1>
              {getStatusBadge()}
            </div>
            {lead.value && (
              <div className="text-sm font-medium text-green-600 dark:text-green-400">
                {formatCurrency(lead.value)}
              </div>
            )}
          </div>
        </div>

        {/* Direita - Botões de Ação */}
        {isActive && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Botão Won - Simples, sem motivo */}
            <Button
              onClick={handleWon}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <CheckCircle className="w-3 h-3 mr-1" />
              )}
              <span className="hidden sm:inline">Ganho</span>
              <span className="sm:hidden">G</span>
            </Button>

            {/* Botão Lost - Abre dialog de motivos */}
            <Button
              onClick={handleLostClick}
              disabled={isLoading}
              variant="destructive"
              size="sm"
            >
              <XCircle className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Perdido</span>
              <span className="sm:hidden">P</span>
            </Button>

            {/* Seletor de Vendedor Responsável */}
            <Select
              value={lead.assigned_to_user_id || 'none'}
              onValueChange={(value) => handleAssigneeChange(value === 'none' ? '' : value)}
              disabled={isLoading || loadingUsers}
            >
              <SelectTrigger className="w-auto min-w-[120px] sm:min-w-[140px] h-8">
                <SelectValue placeholder="Vendedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Não atribuído</SelectItem>
                {users
                  .filter(user => user.is_active)
                  .map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <span>{user.name}</span>
                        <span className="text-xs text-muted-foreground hidden sm:inline">({user.email})</span>
                        {user.role && (
                          <span className="text-xs bg-muted px-1 rounded hidden sm:inline">
                            {user.role}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>

            {/* Menu de opções */}
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Segunda linha - Pipeline Grosso e Visual */}
      <div className="px-4 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1">
          <div className="text-xs text-muted-foreground truncate">
            {currentColumnIndex >= 0 ? sortedColumns[currentColumnIndex].name : 'Indefinido'}
          </div>
          <div className="text-xs font-medium text-foreground">
            {Math.round(progressPercentage)}% concluído
          </div>
        </div>

        {/* Pipeline com Gradiente */}
        <div className="relative">
          <div
            className="w-full h-7 rounded-md overflow-hidden relative bg-muted"
            style={{
              background: `linear-gradient(90deg,
                #22c55e 0%,
                #22c55e ${progressPercentage - 2}%,
                hsl(var(--muted)) ${progressPercentage + 2}%,
                hsl(var(--muted)) 100%)`
            }}
          >
            {/* Container de textos */}
            <div className="absolute inset-0 flex items-center">
              {sortedColumns.map((column, index) => {
                const isPassed = index < currentColumnIndex;
                const isCurrent = index === currentColumnIndex;
                const isActive = isPassed || isCurrent;

                // Obter tempo gasto nesta etapa
                let stageTime = '';
                if (isCurrent) {
                  stageTime = lead.timeInCurrentStage || formatDistanceToNow(lead.updatedAt);
                } else if (isPassed && lead.stageTimelines?.[column.id]) {
                  stageTime = lead.stageTimelines[column.id];
                } else if (isPassed) {
                  stageTime = '- dias'; // Fallback para etapas passadas
                } else {
                  stageTime = '0 dias'; // Etapas futuras
                }

                return (
                  <div
                    key={column.id}
                    className={cn(
                      "group relative flex-1 flex items-center justify-center px-1 sm:px-2 transition-all duration-300",
                      "cursor-pointer"
                    )}
                    style={{
                      minWidth: '60px'
                    }}
                  >
                    <div className={cn(
                      "text-[10px] sm:text-xs font-medium truncate text-center",
                      isActive ? "text-white" : "text-muted-foreground"
                    )}>
                      {stageTime}
                    </div>

                    {/* Tooltip completo no hover */}
                    <div className="pipeline-tooltip absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none">
                      <div className="font-medium">{column.name}</div>
                      <div className="text-gray-300">Tempo: {stageTime}</div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Dialog de Motivo de Perda */}
      <LossReasonDialog
        isOpen={showLossReasonDialog}
        onClose={() => setShowLossReasonDialog(false)}
        onConfirm={handleLossReasonConfirm}
        leadName={lead.name}
      />
    </>
  );
};