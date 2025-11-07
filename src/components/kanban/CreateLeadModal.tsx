import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Phone,
  Mail,
  User,
  DollarSign,
  MessageSquare,
  Users,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { apiService } from "../../services/api";
import { userService, type UserDto } from "../../services/users";
import { useCustomStatuses } from "../../hooks/useCustomStatuses";
import type { CreateLeadDto } from "../../types";

interface Campaign {
  id: string;
  name: string;
  is_active: boolean;
}

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLeadDto) => Promise<void>;
  columnId?: string;
  columnName?: string;
  initialPhone?: string; // Telefone pré-preenchido (para embed)
  initialEmail?: string; // Email pré-preenchido (para embed)
  isEmbed?: boolean; // Se true, remove o fundo escuro
}

const platforms = [
  "WhatsApp",
  "Facebook",
  "Instagram",
  "Google Ads",
  "LinkedIn",
  "Website",
  "Telefone",
  "Referência",
  "Outros",
];

export const CreateLeadModal: React.FC<CreateLeadModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  columnId,
  columnName,
  initialPhone,
  initialEmail,
  isEmbed = false,
}) => {
  const { getInitialStatus } = useCustomStatuses();
  const [formData, setFormData] = useState<CreateLeadDto>({
    name: "",
    phone: initialPhone || "",
    email: initialEmail || "",
    message: "",
    platform: "WhatsApp",
    channel: "WhatsApp",
    campaign: "",
    value: 0,
    notes: "",
    assigned_to_user_id: undefined,
    column_id: columnId || undefined,
  });
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [users, setUsers] = useState<UserDto[]>([]);

  // Atualizar telefone e email quando props mudarem
  useEffect(() => {
    if (initialPhone || initialEmail) {
      setFormData((prev) => ({
        ...prev,
        phone: initialPhone || prev.phone,
        email: initialEmail || prev.email,
      }));
    }
  }, [initialPhone, initialEmail]);

  // Buscar campanhas e usuários quando o modal abrir
  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return;

      try {
        const [campaignsResponse, usersResponse] = await Promise.all([
          apiService.get<{ campaigns: Campaign[] }>("/api/campaigns"),
          userService.list(),
        ]);

        setCampaigns(campaignsResponse.data.campaigns || []);
        setUsers(usersResponse || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [isOpen]);

  React.useEffect(() => {
    if (columnId) {
      setFormData((prev) => ({ ...prev, column_id: columnId }));
    }
  }, [columnId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      // Get initial status and add it to form data
      const initialStatus = getInitialStatus();
      const leadData = {
        ...formData,
        status: initialStatus?.value || "new", // fallback to 'new' if no initial status found
      };

      await onSubmit(leadData);
      setFormData({
        name: "",
        phone: "",
        email: "",
        message: "",
        platform: "WhatsApp",
        channel: "WhatsApp",
        campaign: "",
        value: 0,
        notes: "",
        column_id: columnId || undefined,
      });
      onClose();
    } catch (error) {
      console.error("Error creating lead:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      message: "",
      platform: "WhatsApp",
      channel: "WhatsApp",
      campaign: "",
      value: 0,
      notes: "",
      column_id: columnId || undefined,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 ${
        isEmbed ? "bg-transparent" : "bg-black/50"
      } flex items-center justify-center z-50 p-4`}
    >
      <div className="bg-background rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                Novo Lead
              </h3>
              {columnName && (
                <p className="text-sm text-muted-foreground mt-1">
                  Será adicionado na coluna "{columnName}"
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={loading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Nome *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Nome do lead"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Telefone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="(11) 99999-9999"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="email@exemplo.com"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Valor Estimado
              </label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => {
                  const rawValue = e.target.value;
                  let numValue = 0;

                  if (rawValue && rawValue !== "") {
                    numValue = Number(rawValue);
                    // Validar se é um número válido
                    if (isNaN(numValue) || numValue < 0) {
                      numValue = 0;
                    }
                  }

                  setFormData((prev) => ({ ...prev, value: numValue }));
                }}
                className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0"
                min="0"
                step="0.01"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Vendedor Responsável
            </label>
            <Select
              value={formData.assigned_to_user_id || ""}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  assigned_to_user_id: value === "none" ? undefined : value,
                }))
              }
              disabled={loading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecionar vendedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Não atribuído</SelectItem>
                {users
                  .filter((user) => user.is_active)
                  .map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <span>{user.name}</span>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Plataforma
              </label>
              <Select
                value={formData.platform}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    platform: value,
                    channel: value,
                  }))
                }
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecionar plataforma" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Campanha
              </label>
              <Select
                value={formData.campaign}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, campaign: value }))
                }
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecionar campanha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Orgânico">Orgânico</SelectItem>
                  <SelectItem value="Não identificada">
                    Não identificada
                  </SelectItem>
                  {campaigns
                    .filter((campaign) => campaign.is_active)
                    .map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.name}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Mensagem Inicial
            </label>
            <textarea
              value={formData.message}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, message: e.target.value }))
              }
              className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              placeholder="Primeira mensagem ou interesse do lead..."
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Observações
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              rows={2}
              placeholder="Observações adicionais..."
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>

            <Button type="submit" disabled={!formData.name.trim() || loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Criando..." : "Criar Lead"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
