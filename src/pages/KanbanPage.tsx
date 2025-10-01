import React from 'react';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { KanbanSquare } from 'lucide-react';
import ErrorBoundary from '../components/ErrorBoundary';

export const KanbanPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <KanbanSquare className="w-6 h-6" />
                Leads
              </h1>
            <p className="text-muted-foreground">
              Gerencie seus leads através do fluxo visual
            </p>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <KanbanBoard />
        </div>
      </div>
    </ErrorBoundary>
  );
};