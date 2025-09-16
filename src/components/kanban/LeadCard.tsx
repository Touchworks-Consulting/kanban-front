import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Mail,
  Phone,
  DollarSign,
  MessageSquare,
  ExternalLink,
  Clock,
  Calendar,
  User
} from 'lucide-react';
import type { Lead } from '../../types/kanban';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { formatDate } from '../../utils/helpers';
import { useCustomStatuses } from '../../hooks/useCustomStatuses';

interface LeadCardProps {
  lead: Lead;
  onEdit?: (lead: Lead) => void;
  onDelete?: (leadId: string) => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onEdit, onDelete }) => {
  const { getStatusByValue } = useCustomStatuses();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPlatformColor = (platform?: string) => {
    const colors = {
      facebook: 'bg-blue-500',
      instagram: 'bg-pink-500',
      google: 'bg-red-500',
      linkedin: 'bg-blue-700',
      whatsapp: 'bg-green-500',
      website: 'bg-gray-600',
    };
    return colors[platform as keyof typeof colors] || 'bg-gray-400';
  };

  const formatCurrency = (value?: number | string) => {
    if (!value || value === 0) return 'R$ 0,00';

    // Convert to number if it's a string
    let numValue = typeof value === 'string' ? parseFloat(value) : value;

    // Check if the number is valid
    if (isNaN(numValue)) return 'R$ 0,00';

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue).replace(/\u00A0/g, ' '); // Replace NBSP with regular space for better text wrapping
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "bg-card rounded-lg border shadow-sm p-4 cursor-grab active:cursor-grabbing",
        "hover:shadow-md transition-shadow duration-200",
        "group relative",
        "w-full overflow-hidden",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Avatar className="h-8 w-8 text-xs flex-shrink-0">
            <AvatarFallback>{getInitials(lead.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-sm text-card-foreground truncate">
              {lead.name}
            </h3>
            {lead.campaign && (
              <p className="text-xs text-muted-foreground truncate">
                {lead.campaign}
              </p>
            )}
          </div>
        </div>
        
        {/* Platform indicator */}
        {lead.platform && (
          <div className={cn(
            "w-2 h-2 rounded-full flex-shrink-0",
            getPlatformColor(lead.platform)
          )} />
        )}
      </div>

      {/* Contact info */}
      <div className="space-y-1 mb-3">
        {lead.phone && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{lead.phone}</span>
          </div>
        )}
        {lead.email && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{lead.email}</span>
          </div>
        )}
        {lead.assignedUser && (
          <div className="flex items-center gap-2 text-xs text-blue-600">
            <User className="w-3 h-3 flex-shrink-0" />
            <span className="truncate font-medium">{lead.assignedUser.name}</span>
          </div>
        )}
      </div>

      {/* Message preview */}
      {lead.message && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Mensagem</span>
          </div>
          <p className="text-xs text-card-foreground line-clamp-2 bg-muted/50 rounded p-2 break-words">
            {lead.message}
          </p>
        </div>
      )}

      {/* Value */}
      {lead.value && lead.value > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-3 h-3 text-green-600" />
          <span className="text-xs font-medium text-green-600">
            {formatCurrency(lead.value)}
          </span>
        </div>
      )}

      {/* Tags */}
      {lead.tags && lead.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {lead.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium truncate max-w-[120px]"
              style={{
                backgroundColor: `${tag.color}20`,
                color: tag.color,
              }}
            >
              {tag.name}
            </span>
          ))}
          {lead.tags.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground flex-shrink-0">
              +{lead.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Status Badge */}
      {(() => {
        const statusInfo = getStatusByValue(lead.status);
        if (!statusInfo) return null;

        return (
          <div className="flex items-center justify-between mb-2">
            <span
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border"
              style={{
                backgroundColor: `${statusInfo.color}15`,
                color: statusInfo.color,
                borderColor: `${statusInfo.color}30`,
              }}
            >
              <div
                className="w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: statusInfo.color }}
              />
              {statusInfo.label}
            </span>
            {(statusInfo.is_won || statusInfo.is_lost) && (
              <span className={cn(
                "text-xs font-medium px-1 py-0.5 rounded",
                statusInfo.is_won ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              )}>
                {statusInfo.is_won ? '✓' : '✗'}
              </span>
            )}
          </div>
        );
      })()}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3 flex-shrink-0" />
          <time className="truncate">
            {formatDate(lead.createdAt, 'short')}
          </time>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 sm:opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          {lead.source_url && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                window.open(lead.source_url, '_blank');
              }}
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          )}

          {onEdit && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(lead);
              }}
            >
              Editar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};