import React, { useEffect, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  rectIntersection,
  pointerWithin,
  getFirstCollision,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, AlertCircle } from 'lucide-react';
import { useKanbanStore } from '../../stores';
import { KanbanColumn } from './KanbanColumn';
import { LeadCard } from './LeadCard';
import { LoadingSpinner } from '../LoadingSpinner';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import type { Lead } from '../../types/kanban';

export const KanbanBoard: React.FC = () => {
  const {
    board,
    loading,
    error,
    fetchBoard,
    optimisticMoveLead,
    moveLead,
    clearError,
  } = useKanbanStore();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  // Custom collision detection
  const collisionDetectionStrategy = (args: any) => {
    const pointerIntersections = pointerWithin(args);
    if (pointerIntersections.length > 0) {
      return pointerIntersections;
    }

    const rectIntersections = rectIntersection(args);
    return rectIntersections;
  };

  const handleDragStart = (event: any) => {
    const { active } = event;
    setActiveId(active.id as string);

    // Find the active lead for drag overlay
    if (board) {
      for (const column of board.columns) {
        const lead = column.leads?.find(l => l.id === active.id);
        if (lead) {
          setActiveLead(lead);
          break;
        }
      }
    }
  };

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    
    if (!over || !board) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find active lead and its current column
    let activeColumn = null;
    let activeLead = null;
    
    for (const column of board.columns) {
      const lead = column.leads?.find(l => l.id === activeId);
      if (lead) {
        activeColumn = column;
        activeLead = lead;
        break;
      }
    }

    if (!activeColumn || !activeLead) return;

    // Determine target column
    let targetColumn = board.columns.find(col => col.id === overId);
    
    if (!targetColumn) {
      // Over might be a lead, find its column
      for (const column of board.columns) {
        if (column.leads?.some(l => l.id === overId)) {
          targetColumn = column;
          break;
        }
      }
    }

    if (!targetColumn || targetColumn.id === activeColumn.id) return;

    // Perform optimistic update
    const newPosition = targetColumn.leads?.length || 0;
    optimisticMoveLead(activeId, activeColumn.id, targetColumn.id, newPosition);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    
    setActiveId(null);
    setActiveLead(null);

    if (!over || !board) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the final target column and position
    let targetColumn = board.columns.find(col => col.id === overId);
    let targetPosition = 0;

    if (!targetColumn) {
      // Over might be a lead, find its column
      for (const column of board.columns) {
        const leadIndex = column.leads?.findIndex(l => l.id === overId);
        if (leadIndex !== undefined && leadIndex >= 0) {
          targetColumn = column;
          targetPosition = leadIndex;
          break;
        }
      }
    } else {
      targetPosition = targetColumn.leads?.length || 0;
    }

    if (!targetColumn) return;

    try {
      await moveLead(activeId, {
        column_id: targetColumn.id,
        position: targetPosition,
      });
    } catch (error) {
      console.error('Failed to move lead:', error);
    }
  };

  const handleAddLead = (columnId: string) => {
    // TODO: Open add lead modal
    console.log('Add lead to column:', columnId);
  };

  const handleEditColumn = (column: any) => {
    // TODO: Open edit column modal
    console.log('Edit column:', column);
  };

  const handleDeleteColumn = async (columnId: string) => {
    // TODO: Show confirmation modal and delete
    console.log('Delete column:', columnId);
  };

  const handleEditLead = (lead: Lead) => {
    // TODO: Open edit lead modal
    console.log('Edit lead:', lead);
  };

  const handleDeleteLead = async (leadId: string) => {
    // TODO: Show confirmation and delete
    console.log('Delete lead:', leadId);
  };

  const handleAddColumn = () => {
    // TODO: Open add column modal
    console.log('Add new column');
  };

  if (loading && !board) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          {error}
          <Button variant="outline" size="sm" onClick={clearError}>
            Fechar
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!board) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Nenhum board encontrado
      </div>
    );
  }

  const columnIds = board.columns.map(col => col.id);

  return (
    <div className="h-full">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="outline" size="sm" onClick={clearError}>
              Fechar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-6 kanban-scroll">
          <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
            {board.columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                onAddLead={handleAddLead}
                onEditColumn={handleEditColumn}
                onDeleteColumn={handleDeleteColumn}
                onEditLead={handleEditLead}
                onDeleteLead={handleDeleteLead}
              />
            ))}
          </SortableContext>

          {/* Add column button */}
          <div className="flex-shrink-0">
            <Button
              variant="outline"
              className="w-80 h-12 border-dashed"
              onClick={handleAddColumn}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Coluna
            </Button>
          </div>
        </div>

        <DragOverlay>
          {activeId && activeLead ? (
            <div className="rotate-3 opacity-90">
              <LeadCard lead={activeLead} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};