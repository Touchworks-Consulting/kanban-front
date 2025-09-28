import React from 'react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import type { Lead, KanbanColumn } from '../../types/kanban';
import { formatCurrency } from '../../utils/helpers';
import { LeadActionButtons } from './LeadActionButtons';

interface LeadHeaderProps {
  lead: Lead;
  columns: KanbanColumn[];
  onStatusChange?: (status: 'won' | 'lost', reason?: string) => Promise<void>;
  onMoveToNext?: (nextColumnId: string) => Promise<void>;
  className?: string;
}

export const LeadHeader: React.FC<LeadHeaderProps> = ({
  lead,
  columns,
  onStatusChange,
  onMoveToNext,
  className
}) => {
  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const getStatusBadge = () => {
    if (lead.status === 'won') return <Badge className="bg-green-600 text-white">Ganho</Badge>;
    if (lead.status === 'lost') return <Badge variant="destructive">Perdido</Badge>;
    return <Badge variant="outline">Ativo</Badge>;
  };

  return (
    <div className={cn('border-b bg-background px-6 pt-4 pb-2', className)}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
              <AvatarFallback className="text-lg bg-primary/10 text-primary font-semibold">
                {getInitials(lead.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xl font-bold text-foreground truncate max-w-[220px]">{lead.name}</span>
                {getStatusBadge()}
              </div>

              {lead.value && <span className="text-green-600 font-semibold text-base">{formatCurrency(lead.value)}</span>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LeadActionButtons
              lead={lead}
              columns={columns}
              onStatusChange={onStatusChange}
              onMoveToNext={onMoveToNext}
              className="min-w-48"
            />
          </div>
        </div>

              {/* pipeline removed from header - rendered by LeadModal to span full width */}
      </div>
    </div>
  );
};

export default LeadHeader;
