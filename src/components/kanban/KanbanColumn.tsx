import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, MoreHorizontal, Edit, Trash2, DollarSign } from 'lucide-react';
import type { KanbanColumn as ColumnType, Lead } from '../../types/kanban';
import { LeadCard } from './LeadCard';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';

interface KanbanColumnProps {
  column: ColumnType;
  onAddLead?: (columnId: string) => void;
  onEditColumn?: (column: ColumnType) => void;
  onDeleteColumn?: (columnId: string) => void;
  onEditLead?: (lead: Lead) => void;
  onDeleteLead?: (leadId: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  onAddLead,
  onEditColumn,
  onDeleteColumn,
  onEditLead,
  onDeleteLead,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const leads = column.leads || [];
  const leadIds = leads.map(lead => lead.id);

  const getTotalValue = () => {
    return leads.reduce((total, lead) => total + (lead.value || 0), 0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div 
      className={cn(
        "flex flex-col w-80 bg-background rounded-lg border shadow-sm",
        isOver && "ring-2 ring-primary/50"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: column.color }}
          />
          <h3 className="font-semibold text-sm text-foreground">
            {column.name}
          </h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {leads.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Add lead button */}
          {onAddLead && (
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                "h-8 w-8 p-0 transition-opacity",
                isHovered ? "opacity-100" : "opacity-0"
              )}
              onClick={() => onAddLead(column.id)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}

          {/* Column menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className={cn(
                  "h-8 w-8 p-0 transition-opacity",
                  isHovered ? "opacity-100" : "opacity-0"
                )}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEditColumn && (
                <DropdownMenuItem onClick={() => onEditColumn(column)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Coluna
                </DropdownMenuItem>
              )}
              {onDeleteColumn && !column.is_system && (
                <DropdownMenuItem 
                  onClick={() => onDeleteColumn(column.id)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir Coluna
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Total value */}
      {getTotalValue() > 0 && (
        <div className="px-4 py-2 border-b bg-muted/30">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="font-medium text-green-600">
              {formatCurrency(getTotalValue())}
            </span>
          </div>
        </div>
      )}

      {/* Column Content */}
      <div 
        ref={setNodeRef}
        className="flex-1 p-4 space-y-3 overflow-y-auto kanban-scroll min-h-[200px]"
      >
        <SortableContext items={leadIds} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onEdit={onEditLead}
              onDelete={onDeleteLead}
            />
          ))}
        </SortableContext>

        {/* Empty state */}
        {leads.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Plus className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Nenhum lead nesta coluna
            </p>
            {onAddLead && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAddLead(column.id)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Lead
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};