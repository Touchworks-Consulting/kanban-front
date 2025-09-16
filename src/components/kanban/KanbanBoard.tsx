import React, { useEffect, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  rectIntersection,
  pointerWithin,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, AlertCircle, Search } from 'lucide-react';
import { useKanbanStore } from '../../stores';
import { useSmartSearch } from '../../hooks/useSmartSearch';
import { KanbanColumn } from './KanbanColumn';
import { LeadCard } from './LeadCard';
import { CreateColumnModal } from './CreateColumnModal';
import { EditColumnModal } from './EditColumnModal';
import { CreateLeadModal } from './CreateLeadModal';
import { EditLeadModal } from './EditLeadModal';
import { FilterBar, type FilterState } from './FilterBar';
import { LoadingSpinner } from '../LoadingSpinner';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Alert, AlertDescription } from '../ui/alert';
import type { Lead, KanbanColumn as ColumnType, CreateColumnDto, UpdateColumnDto, CreateLeadDto, UpdateLeadDto } from '../../types/kanban';

export const KanbanBoard: React.FC = () => {
  const {
    board,
    loading,
    error,
    fetchBoard,
    optimisticMoveLead,
    moveLead,
    createColumn,
    updateColumn,
    createLead,
    updateLead,
    deleteLead,
    clearError,
    reorderColumns,
  } = useKanbanStore();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [showCreateColumnModal, setShowCreateColumnModal] = useState(false);
  const [showEditColumnModal, setShowEditColumnModal] = useState(false);
  const [showCreateLeadModal, setShowCreateLeadModal] = useState(false);
  const [showEditLeadModal, setShowEditLeadModal] = useState(false);
  const [selectedColumnForLead, setSelectedColumnForLead] = useState<{ id: string; name: string } | null>(null);
  const [selectedColumnForEdit, setSelectedColumnForEdit] = useState<ColumnType | null>(null);
  const [selectedLeadForEdit, setSelectedLeadForEdit] = useState<Lead | null>(null);
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    period: 'all',
    tags: [],
    valueRange: 'all',
    platform: 'all',
    status: [],
    sortBy: 'updated_desc'
  });

  // Smart search hook - handles local + API search with caching
  const {
    result: filteredBoard,
    isSearching,
    isSearchingAPI,
    searchPerformed
  } = useSmartSearch(filters, {
    debounceMs: 300,
    minSearchLength: 1,
    enableAPISearch: true
  });

  const totalLeads = board ? board.columns.reduce((sum, col) => sum + (col.leads?.length || 0), 0) : 0;
  const filteredLeadsCount = filteredBoard ? filteredBoard.columns.reduce((sum, col) => sum + (col.leads?.length || 0), 0) : 0;

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

    // Check if we're dragging a column or a lead
    if (board) {
      // Check if it's a column being dragged
      const isColumn = board.columns.some(col => col.id === active.id);

      if (!isColumn) {
        // Find the active lead for drag overlay
        for (const column of board.columns) {
          const lead = column.leads?.find(l => l.id === active.id);
          if (lead) {
            setActiveLead(lead);
            break;
          }
        }
      }
    }
  };

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    
    if (!over || !board) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Don't do optimistic updates during drag over - only on drag end
    // This prevents unwanted intermediate states during drag
    return;
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    setActiveId(null);
    setActiveLead(null);

    if (!over || !board) {
      // Drag was cancelled - revert optimistic update if it was a lead
      const isColumn = board.columns.some(col => col.id === active.id);
      if (!isColumn) {
        const { revertOptimisticMove } = useKanbanStore.getState();
        revertOptimisticMove();
      }
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if we're reordering columns
    const activeColumn = board.columns.find(col => col.id === activeId);
    const overColumn = board.columns.find(col => col.id === overId);

    if (activeColumn) {
      // Column reordering
      if (activeId === overId) return; // Same column, no change

      const activeIndex = board.columns.findIndex(col => col.id === activeId);
      const overIndex = board.columns.findIndex(col => col.id === overId);

      if (activeIndex === -1 || overIndex === -1) return;

      // Create new column order
      const newColumns = [...board.columns];
      const [movedColumn] = newColumns.splice(activeIndex, 1);
      newColumns.splice(overIndex, 0, movedColumn);

      // Update column positions
      const columnOrders = newColumns.map((col, index) => ({
        id: col.id,
        position: index
      }));

      try {
        await reorderColumns(columnOrders);
      } catch (error) {
        console.error('Failed to reorder columns:', error);
      }

      return;
    }

    // Lead movement logic (existing code)
    // Find the final target column and position
    let targetColumn = board.columns.find(col => col.id === overId);
    let targetPosition = 0;

    if (!targetColumn) {
      // Over might be a lead, find its column and position
      for (const column of board.columns) {
        const leadIndex = column.leads?.findIndex(l => l.id === overId);
        if (leadIndex !== undefined && leadIndex >= 0) {
          targetColumn = column;
          // If dropping on a lead, insert before that lead
          targetPosition = leadIndex;
          break;
        }
      }
    } else {
      // If dropping directly on column, add at the end
      targetPosition = targetColumn.leads?.length || 0;
    }

    if (!targetColumn) {
      // Revert if we can't find valid target column
      const { revertOptimisticMove } = useKanbanStore.getState();
      revertOptimisticMove();
      return;
    }

    // Find the source column for optimistic update
    let sourceColumn = null;
    for (const column of board.columns) {
      if (column.leads?.some(l => l.id === activeId)) {
        sourceColumn = column;
        break;
      }
    }

    if (!sourceColumn) {
      return;
    }

    // Apply optimistic update before API call
    optimisticMoveLead(activeId, sourceColumn.id, targetColumn.id, targetPosition);

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
    const column = board?.columns.find(col => col.id === columnId);
    if (column) {
      setSelectedColumnForLead({ id: column.id, name: column.name });
      setShowCreateLeadModal(true);
    }
  };

  const handleEditColumn = (column: ColumnType) => {
    setSelectedColumnForEdit(column);
    setShowEditColumnModal(true);
  };

  const handleUpdateColumn = async (id: string, data: UpdateColumnDto) => {
    await updateColumn(id, data);
    setShowEditColumnModal(false);
    setSelectedColumnForEdit(null);
  };

  const handleDeleteColumn = async (columnId: string) => {
    const column = board?.columns.find(c => c.id === columnId);
    if (!column) return;

    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir a coluna "${column.name}"?\n\nEsta ação não pode ser desfeita. Se houver leads nesta coluna, eles precisam ser movidos para outra coluna antes da exclusão.`
    );

    if (!confirmDelete) return;

    try {
      await apiService.delete(`/api/kanban/columns/${columnId}`);

      // Update local state by removing the deleted column
      setBoard(prevBoard => {
        if (!prevBoard) return prevBoard;
        return {
          ...prevBoard,
          columns: prevBoard.columns.filter(c => c.id !== columnId)
        };
      });

      // Show success message
      console.log('Coluna deletada com sucesso');
    } catch (error: any) {
      console.error('Erro ao deletar coluna:', error);

      // Show user-friendly error message
      const errorMessage = error.response?.data?.error || 'Erro ao deletar coluna. Tente novamente.';
      alert(errorMessage);
    }
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLeadForEdit(lead);
    setShowEditLeadModal(true);
  };

  const handleUpdateLead = async (id: string, data: UpdateLeadDto) => {
    await updateLead(id, data);
    setShowEditLeadModal(false);
    setSelectedLeadForEdit(null);
  };

  const handleDeleteLead = async (leadId: string) => {
    await deleteLead(leadId);
    setShowEditLeadModal(false);
    setSelectedLeadForEdit(null);
  };

  const handleAddColumn = () => {
    setShowCreateColumnModal(true);
  };

  const handleCreateColumn = async (data: CreateColumnDto) => {
    await createColumn(data);
    setShowCreateColumnModal(false);
  };

  const handleCreateLead = async (data: CreateLeadDto) => {
    await createLead(data);
    setShowCreateLeadModal(false);
    setSelectedColumnForLead(null);
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
    <div className="h-full flex flex-col">
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

      {/* Filter Bar */}
      <FilterBar 
        filters={filters} 
        onFiltersChange={setFilters}
        totalLeads={totalLeads}
        filteredLeads={filteredLeadsCount}
        isSearching={isSearching}
        isSearchingAPI={isSearchingAPI}
        searchPerformed={searchPerformed}
      />

      {/* No Results Message */}
      {searchPerformed && filteredLeadsCount === 0 && filters.search && (
        <div className="px-6 py-4">
          <div className="bg-muted/50 border border-dashed rounded-lg p-8 text-center">
            <div className="text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhum lead encontrado</h3>
              <p className="text-sm">
                Não encontramos leads com o termo "{filters.search}".
                <br />
                Tente buscar por nome, email, telefone ou campanha.
              </p>
            </div>
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* Área das colunas com scroll independente */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="w-full h-full">
            <div className="flex gap-4 px-6 pt-2 pb-6 w-max min-w-full overflow-hidden">
              <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
                {(filteredBoard ?? board).columns.map((column) => (
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
                  className="w-80 sm:w-72 lg:w-80 h-12 border-dashed hover:border-solid hover:bg-muted/50 transition-all"
                  onClick={handleAddColumn}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Coluna
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>

        <DragOverlay>
          {activeId && activeLead ? (
            <div className="rotate-3 opacity-90">
              <LeadCard lead={activeLead} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Create Column Modal */}
      <CreateColumnModal
        isOpen={showCreateColumnModal}
        onClose={() => setShowCreateColumnModal(false)}
        onSubmit={handleCreateColumn}
      />

      {/* Edit Column Modal */}
      <EditColumnModal
        isOpen={showEditColumnModal}
        onClose={() => {
          setShowEditColumnModal(false);
          setSelectedColumnForEdit(null);
        }}
        onSubmit={handleUpdateColumn}
        column={selectedColumnForEdit}
      />

      {/* Create Lead Modal */}
      <CreateLeadModal
        isOpen={showCreateLeadModal}
        onClose={() => {
          setShowCreateLeadModal(false);
          setSelectedColumnForLead(null);
        }}
        onSubmit={handleCreateLead}
        columnId={selectedColumnForLead?.id}
        columnName={selectedColumnForLead?.name}
      />

      {/* Edit Lead Modal */}
      <EditLeadModal
        isOpen={showEditLeadModal}
        onClose={() => {
          setShowEditLeadModal(false);
          setSelectedLeadForEdit(null);
        }}
        onSubmit={handleUpdateLead}
        onDelete={handleDeleteLead}
        lead={selectedLeadForEdit}
      />
    </div>
  );
};