import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, MoreHorizontal, Edit, Trash2, DollarSign, GripVertical } from 'lucide-react';
import type { KanbanColumn as ColumnType, Lead } from '../../types/kanban';
import type { ActivityCounts } from '../../services/activity';
import { LeadCard } from './LeadCard';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { cn } from '../../lib/utils';

interface KanbanColumnProps {
  column: ColumnType;
  onAddLead?: (columnId: string) => void;
  onEditColumn?: (column: ColumnType) => void;
  onDeleteColumn?: (columnId: string) => void;
  onEditLead?: (lead: Lead) => void;
  onDeleteLead?: (leadId: string) => void;
  onOpenModal?: (leadId: string) => void;
  activityCountsMap?: Map<string, ActivityCounts>;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  onAddLead,
  onEditColumn,
  onDeleteColumn,
  onEditLead,
  onDeleteLead,
  onOpenModal,
  activityCountsMap,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Sortable for column reordering
  const {
    attributes,
    listeners,
    setNodeRef: setSortableNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
  });

  // Droppable for lead drops
  const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  // Combine refs
  const setNodeRef = (node: HTMLElement | null) => {
    setSortableNodeRef(node);
    setDroppableNodeRef(node);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const leads = column.leads || [];
  const leadIds = leads.map(lead => lead.id);

const uniqueLeads = Array.from(new Set(leads.map(l => l.id))).map(id => leads.find(l => l.id === id));
const getTotalValue = () => {
  return uniqueLeads.reduce((total, lead) => total + ((lead?.value) || 0), 0);
};

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value).replace(/\u00A0/g, ' '); // Replace NBSP with regular space for better text wrapping
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        "kanban-column flex flex-col w-80 sm:w-72 lg:w-80 h-[calc(100vh-20rem)] bg-background rounded-lg border shadow-sm transition-all duration-200 flex-shrink-0 min-w-0 max-w-80 sm:max-w-72 lg:max-w-80 overflow-hidden",
        isOver && "ring-2 ring-primary/50 shadow-lg scale-[1.02]",
        isHovered && !isOver && "shadow-md",
        isDragging && "z-50 shadow-2xl"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 border-b min-w-0 overflow-hidden">
        <div className="flex items-center gap-2 min-w-0 overflow-hidden flex-1">
          <div
            {...listeners}
            className="cursor-grab active:cursor-grabbing touch-none p-1 hover:bg-muted rounded-sm transition-colors flex-shrink-0"
            aria-label="Drag column"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: column.color }}
          />
          <h3 className="font-semibold text-sm text-foreground truncate min-w-0">
            {column.name}
          </h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full flex-shrink-0">
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
                isHovered ? "opacity-100" : "opacity-0 sm:opacity-100 md:opacity-0"
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
                  isHovered ? "opacity-100" : "opacity-0 sm:opacity-100 md:opacity-0"
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
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem 
                      onSelect={(e) => e.preventDefault()}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir Coluna
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir Coluna</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir a coluna <strong>"{column.name}"</strong>?<br />
                        <br />
                        Esta ação não pode ser desfeita. Se houver leads nesta coluna, eles precisam ser movidos para outra coluna antes da exclusão.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onDeleteColumn(column.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Excluir Coluna
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Total value 
      {getTotalValue() > 0 && (
        <div className="px-4 py-2 border-b bg-muted/30">
          <div className="flex items-center gap-2 text-sm min-w-0">
            <span className="font-medium text-green-600 truncate min-w-0 flex-1" title={formatCurrency(getTotalValue())}>
              {formatCurrency(getTotalValue())}
            </span>
          </div>
        </div>
      )}*/}

      {/* Column Content */}
      <div
        className={cn(
          "flex-1 min-h-[200px] relative overflow-hidden",
          isOver && "bg-primary/5"
        )}
      >
        <ScrollArea className="h-full">
          <div className="p-4 space-y-3">
            <SortableContext items={leadIds} strategy={verticalListSortingStrategy}>
              {leads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onEdit={onEditLead}
                  onDelete={onDeleteLead}
                  onOpenModal={onOpenModal}
                  activityCounts={activityCountsMap?.get(lead.id) || null}
                />
              ))}
            </SortableContext>

            {/* Drop zone indicator */}
            {isOver && leads.length > 0 && (
              <div className="h-2 bg-primary/20 rounded-full animate-pulse" />
            )}

            {/* Empty state */}
            {leads.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors",
                  isOver ? "bg-primary/20" : "bg-muted"
                )}>
                  <Plus className={cn(
                    "w-6 h-6",
                    isOver ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                <p className={cn(
                  "text-sm mb-2 transition-colors",
                  isOver ? "text-primary font-medium" : "text-muted-foreground"
                )}>
                  {isOver ? "Solte o lead aqui" : "Nenhum lead nesta coluna"}
                </p>
                {onAddLead && !isOver && (
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
        </ScrollArea>
      </div>
    </div>
  );
};