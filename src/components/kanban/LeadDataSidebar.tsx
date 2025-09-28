import React, { useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import {
  Phone,
  Mail,
  User,
  Calendar,
  DollarSign,
  MapPin,
  Tag,
  Building,
  Globe,
  Plus,
  Edit3,
  Star,
  Clock,
  TrendingUp,
  Check,
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Lead, KanbanColumn } from '../../types/kanban';
import { formatDate, formatCurrency, formatDistanceToNow } from '../../utils/helpers';

interface LeadDataSidebarProps {
  lead: Lead;
  columns: KanbanColumn[];
  className?: string;
  onUpdateLead?: (updates: Partial<Lead>) => Promise<void>;
}

export const LeadDataSidebar: React.FC<LeadDataSidebarProps> = ({
  lead,
  columns,
  className,
  onUpdateLead
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    details: false,
    contact: false,
    assignee: true,
    tags: true,
    campaign: true,
    notes: true
  });
  const getPlatformColor = (platform?: string) => {
    const colors = {
      facebook: '#1877F2',
      instagram: '#E4405F',
      google: '#4285F4',
      linkedin: '#0A66C2',
      whatsapp: '#25D366',
      website: '#6B7280',
    };
    return colors[platform as keyof typeof colors] || '#6B7280';
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

  const calculateProbability = () => {
    const currentColumnIndex = columns.findIndex(col => col.id === lead.column_id);
    if (currentColumnIndex >= 0) {
      return Math.min(Math.round(((currentColumnIndex + 1) / columns.length) * 100), 90);
    }
    return 25;
  };

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleEditStart = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const handleEditCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleEditSave = async (field: string) => {
    if (!onUpdateLead) return;

    try {
      await onUpdateLead({ [field]: editValue });
      setEditingField(null);
      setEditValue('');
    } catch (error) {
      console.error('Erro ao salvar campo:', error);
    }
  };

  const EditableField = ({
    field,
    value,
    children,
    className: fieldClassName = ""
  }: {
    field: string;
    value: string;
    children: React.ReactNode;
    className?: string;
  }) => {
    const isEditing = editingField === field;

    if (isEditing) {
      return (
        <div className={cn("flex items-center gap-1", fieldClassName)}>
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-5 text-xs"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleEditSave(field);
              if (e.key === 'Escape') handleEditCancel();
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0"
            onClick={() => handleEditSave(field)}
          >
            <Check className="h-2 w-2 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0"
            onClick={handleEditCancel}
          >
            <X className="h-2 w-2 text-muted-foreground" />
          </Button>
        </div>
      );
    }

    return (
      <div
        className={cn(
          "group cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5 transition-colors relative flex items-center",
          fieldClassName
        )}
        onClick={() => handleEditStart(field, value)}
      >
        <div className="flex-1">
          {children}
        </div>
        <Edit3 className="h-2 w-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
      </div>
    );
  };

  return (
    <div className={cn('bg-muted/30 border-r flex flex-col min-h-0', className)}>
      <ScrollArea className="flex-1 overflow-auto">
        <div className="p-3 space-y-4">
          {/* Seção de Valor e Detalhes */}
          <Collapsible
            open={!collapsedSections.details}
            onOpenChange={() => toggleSection('details')}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-1 hover:bg-muted/50 rounded">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">Negócio</span>
              </div>
              {collapsedSections.details ?
                <ChevronRight className="w-3 h-3 text-muted-foreground" /> :
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              }
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-2 mt-2">
              {/* Valor */}
              <div className="flex items-center gap-3 pl-6">
                <DollarSign className="w-3 h-3 text-muted-foreground" />
                <div className="flex-1">
                  <EditableField
                    field="value"
                    value={lead.value?.toString() || ''}
                    className="min-w-0"
                  >
                    <div className="text-xs font-medium text-foreground">
                      {lead.value ? formatCurrency(lead.value) : 'Não informado'}
                    </div>
                  </EditableField>
                </div>
              </div>

              {/* Probabilidade */}
              <div className="flex items-center gap-3 pl-6">
                <TrendingUp className="w-3 h-3 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-xs font-medium text-foreground">{calculateProbability()}%</div>
                </div>
              </div>

              {/* Data de criação */}
              <div className="flex items-center gap-3 pl-6">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-xs font-medium text-foreground">
                    {formatDate(lead.createdAt, 'short')}
                  </div>
                </div>
              </div>

              {/* Tempo na etapa */}
              <div className="flex items-center gap-3 pl-6">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-xs font-medium text-foreground">
                    {formatDistanceToNow(lead.updatedAt)}
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Seção de Contato */}
          <Collapsible
            open={!collapsedSections.contact}
            onOpenChange={() => toggleSection('contact')}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-1 hover:bg-muted/50 rounded">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">Contato</span>
              </div>
              {collapsedSections.contact ?
                <ChevronRight className="w-3 h-3 text-muted-foreground" /> :
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              }
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-2 mt-2">
              {/* Telefone */}
              {lead.phone && (
                <div className="flex items-center gap-3 pl-6 hover:bg-muted/30 rounded p-1 transition-colors group">
                  <Phone className="w-3 h-3 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <EditableField
                      field="phone"
                      value={lead.phone || ''}
                      className="min-w-0"
                    >
                      <div className="text-xs font-medium text-foreground truncate">
                        {lead.phone}
                      </div>
                    </EditableField>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                    onClick={() => window.open(`tel:${lead.phone}`, '_self')}
                  >
                    <Phone className="h-2 w-2" />
                  </Button>
                </div>
              )}

              {/* Email */}
              {lead.email && (
                <div className="flex items-center gap-3 pl-6 hover:bg-muted/30 rounded p-1 transition-colors group">
                  <Mail className="w-3 h-3 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <EditableField
                      field="email"
                      value={lead.email || ''}
                      className="min-w-0"
                    >
                      <div className="text-xs font-medium text-foreground truncate">
                        {lead.email}
                      </div>
                    </EditableField>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                    onClick={() => window.open(`mailto:${lead.email}`, '_self')}
                  >
                    <Mail className="h-2 w-2" />
                  </Button>
                </div>
              )}

              {/* Origem */}
              {lead.platform && (
                <div className="flex items-center gap-3 pl-6">
                  <Globe className="w-3 h-3 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="text-xs font-medium text-foreground">
                      {getPlatformLabel(lead.platform)}
                    </div>
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Seção de Responsável */}
          {lead.assignedUser && (
            <Collapsible
              open={!collapsedSections.assignee}
              onOpenChange={() => toggleSection('assignee')}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-1 hover:bg-muted/50 rounded">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">Responsável</span>
                </div>
                {collapsedSections.assignee ?
                  <ChevronRight className="w-3 h-3 text-muted-foreground" /> :
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                }
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-2">
                <div className="flex items-center gap-3 pl-6">
                  <User className="w-3 h-3 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="text-xs font-medium text-foreground">{lead.assignedUser.name}</div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Seção de Tags */}
          {lead.tags && lead.tags.length > 0 && (
            <Collapsible
              open={!collapsedSections.tags}
              onOpenChange={() => toggleSection('tags')}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-1 hover:bg-muted/50 rounded">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">Tags</span>
                </div>
                {collapsedSections.tags ?
                  <ChevronRight className="w-3 h-3 text-muted-foreground" /> :
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                }
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-2">
                <div className="flex flex-wrap gap-1 pl-6">
                  {lead.tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="text-xs px-2 py-1 border-muted-foreground/20"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Seção de Campanha */}
          {lead.campaign && (
            <Collapsible
              open={!collapsedSections.campaign}
              onOpenChange={() => toggleSection('campaign')}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-1 hover:bg-muted/50 rounded">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">Campanha</span>
                </div>
                {collapsedSections.campaign ?
                  <ChevronRight className="w-3 h-3 text-muted-foreground" /> :
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                }
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-2">
                <div className="flex items-center gap-3 pl-6">
                  <TrendingUp className="w-3 h-3 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="text-xs font-medium text-foreground">{lead.campaign}</div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Seção de Notas */}
          {lead.notes && (
            <Collapsible
              open={!collapsedSections.notes}
              onOpenChange={() => toggleSection('notes')}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-1 hover:bg-muted/50 rounded">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">Notas</span>
                </div>
                {collapsedSections.notes ?
                  <ChevronRight className="w-3 h-3 text-muted-foreground" /> :
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                }
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-2">
                <div className="pl-6">
                  <div className="p-2 rounded-lg bg-muted/50 border-muted">
                    <EditableField
                      field="notes"
                      value={lead.notes || ''}
                    >
                      <p className="text-xs text-foreground leading-relaxed">
                        {lead.notes}
                      </p>
                    </EditableField>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};