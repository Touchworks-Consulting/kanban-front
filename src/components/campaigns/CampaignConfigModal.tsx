import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useCampaignsStore } from '../../stores';
import { formatDate } from '../../utils/helpers';
import type { Campaign, UpdateCampaignDto } from '../../types';

interface CampaignConfigModalProps {
  campaign: Campaign;
  isOpen: boolean;
  onClose: () => void;
}

export const CampaignConfigModal: React.FC<CampaignConfigModalProps> = ({
  campaign,
  isOpen,
  onClose,
}) => {
  const { updateCampaign, loading, error, clearError } = useCampaignsStore();

  const [formData, setFormData] = useState<UpdateCampaignDto>({
    name: campaign.name,
    description: campaign.description || '',
    platform: campaign.platform,
    channel: campaign.channel,
    is_active: campaign.is_active,
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: campaign.name,
        description: campaign.description || '',
        platform: campaign.platform,
        channel: campaign.channel,
        is_active: campaign.is_active,
      });
      setHasChanges(false);
      clearError();
    }
  }, [isOpen, campaign, clearError]);

  const handleInputChange = (field: keyof UpdateCampaignDto, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Check if there are changes
      const original = {
        name: campaign.name,
        description: campaign.description || '',
        platform: campaign.platform,
        channel: campaign.channel,
        is_active: campaign.is_active,
      };
      
      setHasChanges(JSON.stringify(newData) !== JSON.stringify(original));
      
      return newData;
    });
  };

  const handleSave = async () => {
    if (!hasChanges) {
      onClose();
      return;
    }

    try {
      await updateCampaign(campaign.id, formData);
      onClose();
    } catch (error) {
      // Error handled by store
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      if (window.confirm('Você tem alterações não salvas. Deseja sair mesmo assim?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Configurar Campanha
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Altere as configurações da campanha {campaign.name}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {/* Campaign Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nome da Campanha *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Digite o nome da campanha"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Descreva o objetivo desta campanha"
              />
            </div>

            {/* Platform and Channel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Plataforma *
                </label>
                <Select
                  value={formData.platform}
                  onValueChange={(value) => handleInputChange('platform', value)}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecionar plataforma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Meta">Meta</SelectItem>
                    <SelectItem value="Google">Google</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="YouTube">YouTube</SelectItem>
                    <SelectItem value="TikTok">TikTok</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Canal *
                </label>
                <Select
                  value={formData.channel}
                  onValueChange={(value) => handleInputChange('channel', value)}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecionar canal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="Google Ads">Google Ads</SelectItem>
                    <SelectItem value="YouTube">YouTube</SelectItem>
                    <SelectItem value="TikTok">TikTok</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Status */}
            <div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-foreground">
                  Campanha ativa
                </label>
              </div>
              <p className="text-xs text-muted-foreground mt-1 ml-7">
                Campanhas inativas não processarão webhooks
              </p>
            </div>

            {/* Campaign Stats (Read-only) */}
            <div className="bg-muted rounded-lg p-4">
              <h3 className="text-sm font-medium text-foreground mb-3">
                Estatísticas da Campanha
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Frases Gatilho:</span>
                  <span className="ml-2 font-medium">
                    {campaign.stats?.total_phrases || 0}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Leads Gerados:</span>
                  <span className="ml-2 font-medium">
                    {campaign.stats?.total_leads || 0}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Criado em:</span>
                  <span className="ml-2 font-medium">
                    {formatDate(campaign.createdAt)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Última atualização:</span>
                  <span className="ml-2 font-medium">
                    {formatDate(campaign.updated_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-muted/30">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            
            <div className="flex items-center gap-2">
              {hasChanges && (
                <span className="text-xs text-muted-foreground">
                  Alterações não salvas
                </span>
              )}
              <Button 
                onClick={handleSave} 
                disabled={loading || (!hasChanges)}
                className="min-w-[100px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};