import React from 'react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import {
  DollarSign,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
 
  Clock,
  TrendingUp,
  Timer
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Lead, KanbanColumn } from '../../types/kanban';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { PipelineStageIndicator } from './PipelineStageIndicator';
import { LeadActionButtons } from './LeadActionButtons';
import { Button } from '../ui/button';

interface LeadSidebarProps {
  lead: Lead;
  columns: KanbanColumn[];
  onStatusChange?: (status: 'won' | 'lost', reason?: string) => Promise<void>;
  onMoveToNext?: (nextColumnId: string) => Promise<void>;
  className?: string;
}

export const LeadSidebar: React.FC<LeadSidebarProps> = ({
  lead,
  columns,
  onStatusChange,
  onMoveToNext,
  className
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPlatformColor = (platform?: string) => {
    const colors = {
      facebook: 'bg-blue-600',
      instagram: 'bg-pink-600',
      google: 'bg-red-600',
      linkedin: 'bg-blue-700',
      whatsapp: 'bg-green-600',
      website: 'bg-muted-foreground',
    };
    return colors[platform as keyof typeof colors] || 'bg-muted-foreground';
  };

  const getPlatformLabel = (platform?: string) => {
    const labels = {
      facebook: 'Facebook',
      instagram: 'Instagram',
      google: 'Google',
      linkedin: 'LinkedIn',
      whatsapp: 'WhatsApp',
      website: 'Website'
    };
    return labels[platform as keyof typeof labels] || platform || 'Desconhecido';
  };

  return (
    <div className={cn('w-full h-full bg-muted/30 border-r flex flex-col', className)}>
      <ScrollArea className="flex-1 p-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-foreground truncate">{lead.value ? formatCurrency(lead.value) : '--'}</span>
            <Button size="sm" variant="ghost" className="text-xs px-2 py-1">+ Produtos</Button>
          </div>
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="truncate">{lead.metadata?.probability ? `${lead.metadata.probability}%` : '--'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Timer className="w-3.5 h-3.5" />
              <span className="truncate">{formatDate(lead.createdAt, 'short')}</span>
            </div>
            {lead.assignedUser?.name && (
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5" />
                <span className="truncate">{lead.assignedUser.name}</span>
              </div>
            )}
          </div>
          {lead.phone && (
            <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-green-600 text-sm hover:underline">
              <Phone className="w-4 h-4" />
              {lead.phone}
            </a>
          )}
          {lead.email && (
            <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-blue-600 text-sm hover:underline">
              <Mail className="w-4 h-4" />
              {lead.email}
            </a>
          )}
          {lead.tags && lead.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {lead.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="text-[11px] px-2 py-0.5"
                  style={{ borderColor: tag.color, color: tag.color }}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
          {lead.notes && (
            <div className="text-xs text-muted-foreground pl-2 mt-2">
              {lead.notes}
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="flex-shrink-0 p-3 bg-background border-t">
        <LeadActionButtons
          lead={lead}
          columns={columns}
          onStatusChange={onStatusChange}
          onMoveToNext={onMoveToNext}
        />
      </div>
    </div>
  );
};