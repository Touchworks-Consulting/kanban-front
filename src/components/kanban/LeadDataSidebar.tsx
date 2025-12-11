import React, { useState, useEffect } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Switch } from "../ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { ValidatedInput } from "../forms/ValidatedInput";
import {
  Phone,
  Mail,
  User,
  Calendar,
  DollarSign,
  Tag,
  Globe,
  Edit3,
  Star,
  Clock,
  TrendingUp,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Trash2,
  UserCheck,
} from "lucide-react";
import { cn } from "../../lib/utils";
import type { Lead, KanbanColumn } from "../../types/kanban";
import {
  formatDate,
  formatCurrency,
  formatDistanceToNow,
} from "../../utils/helpers";
import { useCustomStatuses } from "../../hooks/useCustomStatuses";
import { apiService } from "../../services/api";

interface Campaign {
  id: string;
  name: string;
  is_active: boolean;
}

interface LeadDataSidebarProps {
  lead: Lead | null;
  columns: KanbanColumn[];
  className?: string;
  onUpdateLead?: (updates: Partial<Lead>) => Promise<void>;
  onDeleteLead?: () => Promise<void>;
  users?: Array<{
    id: string;
    name: string;
    email: string;
    role?: string;
    is_active?: boolean;
  }>;
  onAssigneeChange?: (userId: string) => Promise<void>;
}

const LeadDataSidebarComponent: React.FC<LeadDataSidebarProps> = ({
  lead,
  columns,
  className,
  onUpdateLead,
  onDeleteLead,
  users = [],
  onAssigneeChange,
}) => {
  if (!lead) {
    return (
      <div
        className={cn("bg-muted/30 border-r flex flex-col min-h-0", className)}
      >
        <div className="p-4 text-center text-muted-foreground">
          Lead não encontrado.
        </div>
      </div>
    );
  }
  const { statuses, loading: statusesLoading } = useCustomStatuses();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({
    details: false,
    contact: false,
    assignee: true,
    tags: true,
    campaign: true,
    notes: true,
    messages: true,
  });

  // Fetch campaigns when component mounts
  useEffect(() => {
    const fetchCampaigns = async () => {
      setCampaignsLoading(true);
      try {
        const response = await apiService.get<{ campaigns: Campaign[] }>(
          "/api/campaigns"
        );
        setCampaigns(response.data.campaigns || []);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        setCampaigns([]);
      } finally {
        setCampaignsLoading(false);
      }
    };

    fetchCampaigns();
  }, []);
  const getPlatformColor = (platform?: string) => {
    const colors = {
      facebook: "#1877F2",
      instagram: "#E4405F",
      google: "#4285F4",
      linkedin: "#0A66C2",
      whatsapp: "#25D366",
      website: "#6B7280",
    };
    return colors[platform as keyof typeof colors] || "#6B7280";
  };

  const getPlatformLabel = (platform?: string) => {
    const labels = {
      facebook: "Facebook",
      instagram: "Instagram",
      google: "Google",
      linkedin: "LinkedIn",
      whatsapp: "WhatsApp",
      website: "Website",
    };
    return (
      labels[platform as keyof typeof labels] || platform || "Desconhecido"
    );
  };

  const calculateProbability = () => {
    const currentColumnIndex = columns.findIndex(
      (col) => col.id === lead.column_id
    );
    if (currentColumnIndex >= 0) {
      return Math.min(
        Math.round(((currentColumnIndex + 1) / columns.length) * 100),
        90
      );
    }
    return 25;
  };

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleEditStart = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const handleEditCancel = () => {
    setEditingField(null);
    setEditValue("");
  };

  const handleEditSave = async (field: string) => {
    if (!onUpdateLead) return;

    try {
      await onUpdateLead({ [field]: editValue });
      setEditingField(null);
      setEditValue("");
    } catch (error) {
      console.error("Erro ao salvar campo:", error);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    // Use same handler as other fields for consistent behavior
    if (!onUpdateLead) return;

    try {
      await onUpdateLead({ status: newStatus });
    } catch (error) {
      console.error("Erro ao alterar status:", error);
    }
  };

  const handleCampaignChange = async (newCampaign: string) => {
    if (!onUpdateLead) return;

    try {
      await onUpdateLead({ campaign: newCampaign });
    } catch (error) {
      console.error("Erro ao alterar campanha:", error);
    }
  };

  const handleCustomerToggle = async (isCustomer: boolean) => {
    if (!onUpdateLead) return;

    try {
      await onUpdateLead({ is_customer: isCustomer } as Partial<Lead>);
    } catch (error) {
      console.error("Erro ao alterar status de cliente:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    console.log("🗑️ [LeadDataSidebar] handleDeleteConfirm chamado", {
      hasOnDeleteLead: !!onDeleteLead,
      leadId: lead.id,
    });

    if (!onDeleteLead) {
      console.warn("⚠️ [LeadDataSidebar] onDeleteLead não disponível");
      return;
    }

    try {
      console.log("🗑️ [LeadDataSidebar] Chamando onDeleteLead...");
      await onDeleteLead();
      console.log("✅ [LeadDataSidebar] onDeleteLead executado com sucesso");
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("❌ [LeadDataSidebar] Erro ao excluir lead:", error);
    }
  };

  const EditableField = ({
    field,
    value,
    children,
    className: fieldClassName = "",
    type = "text",
    validationOptions = {},
  }: {
    field: string;
    value: string;
    children: React.ReactNode;
    className?: string;
    type?: "text" | "email" | "phone" | "number";
    validationOptions?: Record<string, any>;
  }) => {
    const isEditing = editingField === field;

    if (isEditing) {
      // Para campos que precisam de validação especial, usar ValidatedInput
      if (type === "phone" || type === "email") {
        return (
          <div className={cn("space-y-1", fieldClassName)}>
            <div className="flex items-center gap-1">
              <ValidatedInput
                field={field}
                value={editValue}
                type={type}
                className="h-5 text-xs"
                onValidatedChange={(newValue) => {
                  setEditValue(newValue);
                }}
                validationOptions={validationOptions}
                showFeedback={false}
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
          </div>
        );
      }

      // Para campos simples, usar Input normal
      return (
        <div className={cn("flex items-center gap-1", fieldClassName)}>
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-5 text-xs"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleEditSave(field);
              if (e.key === "Escape") handleEditCancel();
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
        <div className="flex-1">{children}</div>
        <Edit3 className="h-2 w-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
      </div>
    );
  };

  return (
    <div
      className={cn("bg-muted/30 border-r flex flex-col min-h-0", className)}
    >
      <ScrollArea className="flex-1 overflow-auto">
        <div className="p-3 space-y-4">
          {/* Seção de Ações - Customer Toggle & Delete */}
          <div className="space-y-3 pb-3 border-b border-muted">
            {/* Customer Toggle */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-xs font-medium text-foreground">
                    Marcar como Cliente
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Excluir de relatórios e conversões
                  </div>
                </div>
              </div>
              <Switch
                checked={lead.is_customer || false}
                onCheckedChange={handleCustomerToggle}
              />
            </div>

            {/* Delete Button */}
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={() => {
                console.log("🗑️ [LeadDataSidebar] Botão Excluir clicado");
                setShowDeleteDialog(true);
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Lead
            </Button>
          </div>

          {/* Seção de Valor e Detalhes */}
          <Collapsible
            open={!collapsedSections.details}
            onOpenChange={() => toggleSection("details")}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-1 hover:bg-muted/50 rounded">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">
                  Negócio
                </span>
              </div>
              {collapsedSections.details ? (
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              )}
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-2 mt-2">
              {/* Valor */}
              <div className="flex items-center gap-3 pl-6">
                <DollarSign className="w-3 h-3 text-muted-foreground" />
                <div className="flex-1">
                  <EditableField
                    field="value"
                    value={lead.value?.toString() || ""}
                    className="min-w-0"
                  >
                    <div className="text-xs font-medium text-foreground">
                      {lead.value
                        ? formatCurrency(lead.value)
                        : "Não informado"}
                    </div>
                  </EditableField>
                </div>
              </div>

              {/* Probabilidade */}
              <div className="flex items-center gap-3 pl-6">
                <TrendingUp className="w-3 h-3 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-xs font-medium text-foreground">
                    {calculateProbability()}%
                  </div>
                </div>
              </div>

              {/* Data de criação */}
              <div className="flex items-center gap-3 pl-6">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-xs font-medium text-foreground">
                    {formatDate(lead.createdAt, "short")}
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

              {/* Status - SEMPRE MOSTRAR */}
              <div className="flex items-center gap-3 pl-6">
                <Star className="w-3 h-3 text-muted-foreground" />
                <div className="flex-1">
                  <Select
                    value={lead.status}
                    onValueChange={handleStatusChange}
                    disabled={statusesLoading}
                  >
                    <SelectTrigger className="h-6 text-xs border-none shadow-none p-1 hover:bg-muted/50">
                      <SelectValue placeholder="Selecionar status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusesLoading ? (
                        <SelectItem value="loading" disabled>
                          Carregando status...
                        </SelectItem>
                      ) : (
                        statuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full border"
                                style={{ backgroundColor: status.color }}
                              />
                              <span className="text-xs">{status.label}</span>
                              {status.is_initial && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                                  Inicial
                                </span>
                              )}
                              {status.is_won && (
                                <span className="text-xs bg-green-100 text-green-800 px-1 rounded">
                                  Ganho
                                </span>
                              )}
                              {status.is_lost && (
                                <span className="text-xs bg-red-100 text-red-800 px-1 rounded">
                                  Perdido
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Seção de Contato */}
          <Collapsible
            open={!collapsedSections.contact}
            onOpenChange={() => toggleSection("contact")}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-1 hover:bg-muted/50 rounded">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">
                  Contato
                </span>
              </div>
              {collapsedSections.contact ? (
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              )}
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-2 mt-2">
              {/* Telefone - SEMPRE MOSTRAR */}
              <div className="flex items-center gap-3 pl-6 hover:bg-muted/30 rounded p-1 transition-colors group">
                <Phone className="w-3 h-3 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <EditableField
                    field="phone"
                    value={lead.phone || ""}
                    type="phone"
                    className="min-w-0"
                    validationOptions={{ required: false }}
                  >
                    <div className="text-xs font-medium text-foreground truncate">
                      {lead.phone || "Clique para adicionar telefone..."}
                    </div>
                  </EditableField>
                </div>
                {lead.phone && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`tel:${lead.phone}`, "_self");
                    }}
                  >
                    <Phone className="h-2 w-2" />
                  </Button>
                )}
              </div>

              {/* Email - SEMPRE MOSTRAR */}
              <div className="flex items-center gap-3 pl-6 hover:bg-muted/30 rounded p-1 transition-colors group">
                <Mail className="w-3 h-3 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <EditableField
                    field="email"
                    value={lead.email || ""}
                    type="email"
                    className="min-w-0"
                    validationOptions={{ required: false }}
                  >
                    <div className="text-xs font-medium text-foreground truncate">
                      {lead.email || "Clique para adicionar email..."}
                    </div>
                  </EditableField>
                </div>
                {lead.email && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`mailto:${lead.email}`, "_self");
                    }}
                  >
                    <Mail className="h-2 w-2" />
                  </Button>
                )}
              </div>

              {/* Plataforma - SEMPRE MOSTRAR E EDITÁVEL */}
              <div className="flex items-center gap-3 pl-6">
                <Globe className="w-3 h-3 text-muted-foreground" />
                <div className="flex-1">
                  <EditableField field="platform" value={lead.platform || ""}>
                    <div className="text-xs font-medium text-foreground">
                      {lead.platform
                        ? getPlatformLabel(lead.platform)
                        : "Clique para definir plataforma..."}
                    </div>
                  </EditableField>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Seção de Responsável - SEMPRE MOSTRAR */}
          <Collapsible
            open={!collapsedSections.assignee}
            onOpenChange={() => toggleSection("assignee")}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-1 hover:bg-muted/50 rounded">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">
                  Responsável
                </span>
              </div>
              {collapsedSections.assignee ? (
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              )}
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-2">
              <div className="flex items-center gap-3 pl-6">
                <User className="w-3 h-3 text-muted-foreground" />
                <div className="flex-1">
                  <Select
                    value={lead.assigned_to_user_id || "none"}
                    onValueChange={(value) => {
                      const userId = value === "none" ? "" : value;
                      onAssigneeChange?.(userId);
                    }}
                  >
                    <SelectTrigger className="h-6 text-xs border-none shadow-none p-1 hover:bg-muted/50">
                      <SelectValue placeholder="Selecionar responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Não atribuído</SelectItem>
                      {users
                        .filter((user) => user.is_active)
                        .map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-2">
                              <span className="text-xs">{user.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({user.email})
                              </span>
                              {user.role && (
                                <span className="text-xs bg-muted px-1 rounded">
                                  {user.role}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Seção de Tags - SEMPRE MOSTRAR */}
          <Collapsible
            open={!collapsedSections.tags}
            onOpenChange={() => toggleSection("tags")}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-1 hover:bg-muted/50 rounded">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">
                  Tags
                </span>
              </div>
              {collapsedSections.tags ? (
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              )}
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-2">
              <div className="flex flex-wrap gap-1 pl-6">
                {lead.tags && lead.tags.length > 0 ? (
                  lead.tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="text-xs px-2 py-1 border-muted-foreground/20"
                    >
                      {tag.name}
                    </Badge>
                  ))
                ) : (
                  <div className="text-xs text-muted-foreground">
                    Nenhuma tag atribuída
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Seção de Campanha - SEMPRE MOSTRAR */}
          <Collapsible
            open={!collapsedSections.campaign}
            onOpenChange={() => toggleSection("campaign")}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-1 hover:bg-muted/50 rounded">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">
                  Campanha
                </span>
              </div>
              {collapsedSections.campaign ? (
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              )}
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-2">
              <div className="flex items-center gap-3 pl-6">
                <TrendingUp className="w-3 h-3 text-muted-foreground" />
                <div className="flex-1">
                  <Select
                    value={lead.campaign || ""}
                    onValueChange={handleCampaignChange}
                    disabled={campaignsLoading}
                  >
                    <SelectTrigger className="h-6 text-xs border-none shadow-none p-1 hover:bg-muted/50">
                      <SelectValue placeholder="Selecionar campanha" />
                    </SelectTrigger>
                    <SelectContent>
                      {campaignsLoading ? (
                        <SelectItem value="loading" disabled>
                          Carregando campanhas...
                        </SelectItem>
                      ) : (
                        <>
                          <SelectItem value="Orgânico">Orgânico</SelectItem>
                          <SelectItem value="Não identificada">
                            Não identificada
                          </SelectItem>
                          {campaigns
                            .filter((campaign) => campaign.is_active)
                            .map((campaign) => (
                              <SelectItem
                                key={campaign.id}
                                value={campaign.name}
                              >
                                <span className="text-xs">{campaign.name}</span>
                              </SelectItem>
                            ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Seção de Notas - SEMPRE MOSTRAR */}
          <Collapsible
            open={!collapsedSections.notes}
            onOpenChange={() => toggleSection("notes")}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-1 hover:bg-muted/50 rounded">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">
                  Notas
                </span>
              </div>
              {collapsedSections.notes ? (
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              )}
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-2">
              <div className="pl-6">
                <div className="p-2 rounded-lg bg-muted/50 border-muted">
                  <EditableField field="notes" value={lead.notes || ""}>
                    <p className="text-xs text-foreground leading-relaxed">
                      {lead.notes || "Clique para adicionar observações..."}
                    </p>
                  </EditableField>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Seção de Mensagens - SEMPRE MOSTRAR */}
          <Collapsible
            open={!collapsedSections.messages}
            onOpenChange={() => toggleSection("messages")}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-1 hover:bg-muted/50 rounded">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">
                  Mensagem Inicial
                </span>
              </div>
              {collapsedSections.messages ? (
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              )}
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-2">
              <div className="pl-6">
                <div className="p-2 rounded-lg bg-muted/50 border-muted">
                  <EditableField field="message" value={lead.message || ""}>
                    <p className="text-xs text-foreground leading-relaxed">
                      {lead.message ||
                        "Clique para adicionar mensagem inicial..."}
                    </p>
                  </EditableField>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O lead "{lead.name}" será
              permanentemente excluído do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() =>
                console.log("🗑️ [LeadDataSidebar] Dialog cancelado")
              }
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                console.log(
                  "🗑️ [LeadDataSidebar] Dialog confirmado - chamando handleDeleteConfirm"
                );
                handleDeleteConfirm();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export const LeadDataSidebar = React.memo(LeadDataSidebarComponent);
