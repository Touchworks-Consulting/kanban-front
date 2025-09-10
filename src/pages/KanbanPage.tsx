import React from 'react';
import { KanbanBoard } from '../components/kanban/KanbanBoard';

export const KanbanPage: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Kanban CRM
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
  );
};