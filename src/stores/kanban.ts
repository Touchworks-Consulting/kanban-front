import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { 
  KanbanBoard, 
  KanbanColumn, 
  Lead, 
  CreateLeadDto, 
  UpdateLeadDto, 
  CreateColumnDto, 
  UpdateColumnDto,
  MoveLeadDto 
} from '../types';
import { kanbanService } from '../services';

interface KanbanState {
  // State
  board: KanbanBoard | null;
  loading: boolean;
  error: string | null;
  previousBoard: KanbanBoard | null; // Moved inside state to prevent memory leaks

  // Actions
  fetchBoard: () => Promise<void>;
  createLead: (data: CreateLeadDto) => Promise<void>;
  updateLead: (id: string, data: UpdateLeadDto) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  moveLead: (id: string, data: MoveLeadDto) => Promise<void>;
  createColumn: (data: CreateColumnDto) => Promise<void>;
  updateColumn: (id: string, data: UpdateColumnDto) => Promise<void>;
  deleteColumn: (id: string) => Promise<void>;
  reorderColumns: (columnOrders: Array<{ id: string; position: number }>) => Promise<void>;
  clearError: () => void;

  // Optimistic updates
  optimisticMoveLead: (leadId: string, sourceColumnId: string, targetColumnId: string, newPosition: number) => void;
  revertOptimisticMove: () => void;

  // Cleanup
  cleanup: () => void;
}

export const useKanbanStore = create<KanbanState>()(
  devtools(
    (set, get) => ({
      // Initial state
      board: null,
      loading: false,
      error: null,
      previousBoard: null,

      // Fetch board with columns and leads
      fetchBoard: async () => {
        try {
          set({ loading: true, error: null });
          const response = await kanbanService.getBoard();
          set({ board: response.board, loading: false });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.error || 'Erro ao carregar board', 
            loading: false 
          });
        }
      },

      // Create new lead
      createLead: async (data: CreateLeadDto) => {
        try {
          set({ error: null });
          const response = await kanbanService.createLead(data);
          
          const { board } = get();
          if (!board) return;

          const updatedColumns = board.columns.map(column => {
            if (column.id === response.lead.column_id) {
              return {
                ...column,
                leads: [...(column.leads || []), response.lead]
              };
            }
            return column;
          });

          set({
            board: {
              ...board,
              columns: updatedColumns
            }
          });
        } catch (error: any) {
          set({ error: error.response?.data?.error || 'Erro ao criar lead' });
          throw error;
        }
      },

      // Update lead
      updateLead: async (id: string, data: UpdateLeadDto) => {
        try {
          set({ error: null });
          const response = await kanbanService.updateLead(id, data);
          
          const { board } = get();
          if (!board) return;

          const updatedColumns = board.columns.map(column => ({
            ...column,
            leads: (column.leads || []).map(lead => 
              lead.id === id ? response.lead : lead
            )
          }));

          set({
            board: {
              ...board,
              columns: updatedColumns
            }
          });
        } catch (error: any) {
          set({ error: error.response?.data?.error || 'Erro ao atualizar lead' });
          throw error;
        }
      },

      // Delete lead
      deleteLead: async (id: string) => {
        try {
          set({ error: null });
          await kanbanService.deleteLead(id);
          
          const { board } = get();
          if (!board) return;

          const updatedColumns = board.columns.map(column => ({
            ...column,
            leads: (column.leads || []).filter(lead => lead.id !== id)
          }));

          set({
            board: {
              ...board,
              columns: updatedColumns
            }
          });
        } catch (error: any) {
          set({ error: error.response?.data?.error || 'Erro ao deletar lead' });
          throw error;
        }
      },

      // Move lead with optimistic updates
      moveLead: async (id: string, data: MoveLeadDto) => {
        try {
          set({ error: null });
          const response = await kanbanService.moveLead(id, data);
          
          // Update the moved lead in the store without refetching entire board
          const { board } = get();
          if (!board) return;

          // Clear the previous board backup since the operation was successful
          set(state => ({ ...state, previousBoard: null }));

          // Update the lead with the response data to ensure consistency
          const updatedColumns = board.columns.map(column => ({
            ...column,
            leads: (column.leads || []).map(lead => 
              lead.id === id ? response.lead : lead
            ).sort((a, b) => a.position - b.position)
          }));

          set({
            board: {
              ...board,
              columns: updatedColumns
            }
          });
        } catch (error: any) {
          // Revert optimistic update on error
          get().revertOptimisticMove();
          set({ error: error.response?.data?.error || 'Erro ao mover lead' });
          throw error;
        }
      },

      // Optimistic move for better UX
      optimisticMoveLead: (leadId: string, sourceColumnId: string, targetColumnId: string, newPosition: number) => {
        const { board } = get();
        if (!board) return;

        // Store previous state for potential revert (deep clone to avoid references)
        set(state => ({
          ...state,
          previousBoard: JSON.parse(JSON.stringify(board))
        }));

        // Find the lead to move
        let leadToMove: Lead | null = null;
        const sourceColumn = board.columns.find(col => col.id === sourceColumnId);
        if (sourceColumn?.leads) {
          leadToMove = sourceColumn.leads.find(lead => lead.id === leadId) || null;
        }

        if (!leadToMove) return;

        const updatedColumns = board.columns.map(column => {
          if (column.id === sourceColumnId && column.id === targetColumnId) {
            // Moving within the same column
            const leads = [...(column.leads || [])];
            const currentIndex = leads.findIndex(lead => lead.id === leadId);
            
            if (currentIndex === -1) return column;
            
            // Remove the lead from its current position
            const [movedLead] = leads.splice(currentIndex, 1);
            
            // Insert it at the new position
            const actualPosition = Math.min(newPosition, leads.length);
            leads.splice(actualPosition, 0, movedLead);
            
            // Update positions to maintain order
            const reorderedLeads = leads.map((lead, index) => ({
              ...lead,
              position: index
            }));

            return {
              ...column,
              leads: reorderedLeads
            };
          } else if (column.id === sourceColumnId) {
            // Remove lead from source column
            const remainingLeads = (column.leads || [])
              .filter(lead => lead.id !== leadId)
              .map((lead, index) => ({ ...lead, position: index }));
              
            return {
              ...column,
              leads: remainingLeads
            };
          } else if (column.id === targetColumnId) {
            // Add lead to target column
            const leads = [...(column.leads || [])];
            const updatedLead = { ...leadToMove, column_id: targetColumnId, position: newPosition };
            
            // Insert at the specified position
            const actualPosition = Math.min(newPosition, leads.length);
            leads.splice(actualPosition, 0, updatedLead);
            
            // Update positions to maintain order
            const reorderedLeads = leads.map((lead, index) => ({
              ...lead,
              position: index
            }));

            return {
              ...column,
              leads: reorderedLeads
            };
          }
          
          return column;
        });

        set({
          board: {
            ...board,
            columns: updatedColumns
          }
        });
      },

      // Revert optimistic update
      revertOptimisticMove: () => {
        const { previousBoard } = get();
        if (previousBoard) {
          set({
            board: previousBoard,
            previousBoard: null // Clear after revert
          });
        }
      },

      // Create column
      createColumn: async (data: CreateColumnDto) => {
        try {
          set({ error: null });
          const response = await kanbanService.createColumn(data);
          
          const { board } = get();
          if (!board) return;

          set({
            board: {
              ...board,
              columns: [...board.columns, response.column]
                .sort((a, b) => a.position - b.position)
            }
          });
        } catch (error: any) {
          set({ error: error.response?.data?.error || 'Erro ao criar coluna' });
          throw error;
        }
      },

      // Update column
      updateColumn: async (id: string, data: UpdateColumnDto) => {
        try {
          set({ error: null });
          const response = await kanbanService.updateColumn(id, data);
          
          const { board } = get();
          if (!board) return;

          const updatedColumns = board.columns.map(column =>
            column.id === id ? response.column : column
          ).sort((a, b) => a.position - b.position);

          set({
            board: {
              ...board,
              columns: updatedColumns
            }
          });
        } catch (error: any) {
          set({ error: error.response?.data?.error || 'Erro ao atualizar coluna' });
          throw error;
        }
      },

      // Delete column
      deleteColumn: async (id: string) => {
        try {
          set({ error: null });
          await kanbanService.deleteColumn(id);
          
          const { board } = get();
          if (!board) return;

          set({
            board: {
              ...board,
              columns: board.columns.filter(column => column.id !== id)
            }
          });
        } catch (error: any) {
          set({ error: error.response?.data?.error || 'Erro ao deletar coluna' });
          throw error;
        }
      },

      // Reorder columns
      reorderColumns: async (columnOrders: Array<{ id: string; position: number }>) => {
        try {
          set({ error: null });
          const response = await kanbanService.reorderColumns({ columnOrders });
          
          const { board } = get();
          if (!board) return;

          set({
            board: {
              ...board,
              columns: response.columns
            }
          });
        } catch (error: any) {
          set({ error: error.response?.data?.error || 'Erro ao reordenar colunas' });
          throw error;
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Cleanup function to prevent memory leaks
      cleanup: () => set({
        board: null,
        previousBoard: null,
        loading: false,
        error: null
      }),
    }),
    {
      name: 'kanban-store',
    }
  )
);