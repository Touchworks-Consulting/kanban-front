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
}

let previousBoard: KanbanBoard | null = null;

export const useKanbanStore = create<KanbanState>()(
  devtools(
    (set, get) => ({
      // Initial state
      board: null,
      loading: false,
      error: null,

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
          await kanbanService.moveLead(id, data);
          
          // Refetch board to ensure consistency
          await get().fetchBoard();
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

        // Store previous state for potential revert
        previousBoard = JSON.parse(JSON.stringify(board));

        // Find the lead to move
        let leadToMove: Lead | null = null;
        const sourceColumn = board.columns.find(col => col.id === sourceColumnId);
        if (sourceColumn?.leads) {
          leadToMove = sourceColumn.leads.find(lead => lead.id === leadId) || null;
        }

        if (!leadToMove) return;

        // Update lead's column_id and position
        const updatedLead = { ...leadToMove, column_id: targetColumnId, position: newPosition };

        // Remove lead from source column
        const updatedColumns = board.columns.map(column => {
          if (column.id === sourceColumnId) {
            return {
              ...column,
              leads: (column.leads || []).filter(lead => lead.id !== leadId)
            };
          }
          if (column.id === targetColumnId) {
            const newLeads = [...(column.leads || []), updatedLead]
              .sort((a, b) => a.position - b.position);
            return {
              ...column,
              leads: newLeads
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
        if (previousBoard) {
          set({ board: previousBoard });
          previousBoard = null;
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
    }),
    {
      name: 'kanban-store',
    }
  )
);