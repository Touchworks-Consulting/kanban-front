import React, { useState } from 'react';
import { X, Plus, Trash2, AlertCircle } from 'lucide-react';
import { useCampaignsStore } from '../../stores';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { PLATFORMS, CHANNELS, type CreateCampaignDto } from '../../types';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  isOpen,
  onClose
}) => {
  const { createCampaign, error, clearError } = useCampaignsStore();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateCampaignDto>({
    name: '',
    platform: 'Meta',
    channel: 'WhatsApp',
    description: '',
    trigger_phrases: []
  });

  const [triggerPhrase, setTriggerPhrase] = useState('');
  const [creativeCode, setCreativeCode] = useState('');

  const handleInputChange = (field: keyof CreateCampaignDto, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) clearError();
  };

  const handlePlatformChange = (platform: 'Meta' | 'Google') => {
    setFormData(prev => ({
      ...prev,
      platform,
      channel: CHANNELS[platform][0] // Reset to first channel of new platform
    }));
    if (error) clearError();
  };

  const handleAddTriggerPhrase = () => {
    if (!triggerPhrase.trim() || !creativeCode.trim()) return;

    const newPhrase = {
      phrase: triggerPhrase.trim(),
      creative_code: creativeCode.trim(),
      priority: formData.trigger_phrases ? formData.trigger_phrases.length + 1 : 1
    };

    setFormData(prev => ({
      ...prev,
      trigger_phrases: [...(prev.trigger_phrases || []), newPhrase]
    }));

    setTriggerPhrase('');
    setCreativeCode('');
  };

  const handleRemoveTriggerPhrase = (index: number) => {
    setFormData(prev => ({
      ...prev,
      trigger_phrases: prev.trigger_phrases?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    setLoading(true);
    try {
      await createCampaign(formData);
      onClose();
      // Reset form
      setFormData({
        name: '',
        platform: 'Meta',
        channel: 'WhatsApp',
        description: '',
        trigger_phrases: []
      });
    } catch (error) {
      console.error('Error creating campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (error) clearError();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-foreground">Nova Campanha</h2>
          <Button size="sm" variant="ghost" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Informações Básicas</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nome da Campanha *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ex: Campanha Curso Online"
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Plataforma *
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) => handlePlatformChange(e.target.value as 'Meta' | 'Google')}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    {PLATFORMS.map(platform => (
                      <option key={platform} value={platform}>
                        {platform}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Canal *
                  </label>
                  <select
                    value={formData.channel}
                    onChange={(e) => handleInputChange('channel', e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    {CHANNELS[formData.platform].map(channel => (
                      <option key={channel} value={channel}>
                        {channel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descreva o objetivo e público-alvo desta campanha..."
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>
            </div>

            {/* Trigger Phrases */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Frases Gatilho</h3>
              <p className="text-sm text-muted-foreground">
                Configure frases que, quando detectadas nas mensagens, irão classificar automaticamente o lead nesta campanha.
              </p>

              {/* Add new trigger phrase */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Frase Gatilho *
                    </label>
                    <input
                      type="text"
                      value={triggerPhrase}
                      onChange={(e) => setTriggerPhrase(e.target.value)}
                      placeholder="Ex: quero saber sobre o curso"
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      onKeyPress={(e) => e.key === 'Enter' && e.preventDefault()}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Código do Criativo *
                    </label>
                    <input
                      type="text"
                      value={creativeCode}
                      onChange={(e) => setCreativeCode(e.target.value)}
                      placeholder="Ex: CUR001"
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      onKeyPress={(e) => e.key === 'Enter' && e.preventDefault()}
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleAddTriggerPhrase}
                  disabled={!triggerPhrase.trim() || !creativeCode.trim()}
                  size="sm"
                  className="w-full md:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Frase
                </Button>
              </div>

              {/* Existing trigger phrases */}
              {formData.trigger_phrases && formData.trigger_phrases.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Frases Configuradas</h4>
                  {formData.trigger_phrases.map((phrase, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-foreground">"{phrase.phrase}"</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Código: <span className="font-mono">{phrase.creative_code}</span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveTriggerPhrase(index)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !formData.name.trim()}>
            {loading ? 'Criando...' : 'Criar Campanha'}
          </Button>
        </div>
      </div>
    </div>
  );
};