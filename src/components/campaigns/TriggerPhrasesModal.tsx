import React, { useState, useEffect } from 'react';
import { X, Plus, Edit, Trash2, Save, MessageSquare, TestTube, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { useCampaignsStore } from '../../stores';
import { formatDate } from '../../utils/helpers';
import type { Campaign, TriggerPhrase, CreateTriggerPhraseDto, UpdateTriggerPhraseDto } from '../../types';

interface TriggerPhrasesModalProps {
  campaign: Campaign;
  isOpen: boolean;
  onClose: () => void;
}

export const TriggerPhrasesModal: React.FC<TriggerPhrasesModalProps> = ({
  campaign,
  isOpen,
  onClose,
}) => {
  const { 
    triggerPhrases,
    fetchTriggerPhrases,
    createTriggerPhrase,
    updateTriggerPhrase,
    deleteTriggerPhrase,
    testPhraseMatch,
    loading,
    error,
    clearError
  } = useCampaignsStore();

  const [editingPhrase, setEditingPhrase] = useState<TriggerPhrase | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);

  const [formData, setFormData] = useState<CreateTriggerPhraseDto>({
    phrase: '',
    creative_code: '',
    match_type: 'contains',
    is_active: true,
  });

  useEffect(() => {
    if (isOpen) {
      fetchTriggerPhrases(campaign.id);
      clearError();
      setEditingPhrase(null);
      setShowAddForm(false);
      setTestResult(null);
      setTestMessage('');
    }
  }, [isOpen, campaign.id, fetchTriggerPhrases, clearError]);

  const handleAddPhrase = async () => {
    if (!formData.phrase.trim()) return;
    
    try {
      await createTriggerPhrase(campaign.id, formData);
      setFormData({ phrase: '', creative_code: '', match_type: 'contains', is_active: true });
      setShowAddForm(false);
    } catch (error) {
      // Error handled by store
    }
  };

  const handleEditPhrase = async () => {
    if (!editingPhrase || !formData.phrase.trim()) return;
    
    try {
      await updateTriggerPhrase(editingPhrase.id, formData as UpdateTriggerPhraseDto);
      setEditingPhrase(null);
      setFormData({ phrase: '', creative_code: '', match_type: 'contains', is_active: true });
    } catch (error) {
      // Error handled by store
    }
  };

  const handleDeletePhrase = async (phrase: TriggerPhrase) => {
    if (window.confirm(`Tem certeza que deseja deletar a frase "${phrase.phrase}"?`)) {
      try {
        await deleteTriggerPhrase(phrase.id);
      } catch (error) {
        // Error handled by store
      }
    }
  };

  const startEdit = (phrase: TriggerPhrase) => {
    setEditingPhrase(phrase);
    setFormData({
      phrase: phrase.phrase,
      creative_code: phrase.creative_code,
      match_type: phrase.match_type,
      is_active: phrase.is_active,
    });
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingPhrase(null);
    setShowAddForm(false);
    setFormData({ phrase: '', creative_code: '', match_type: 'contains', is_active: true });
  };

  const handleTestPhrase = async () => {
    if (!testMessage.trim()) return;
    
    setTestLoading(true);
    try {
      const result = await testPhraseMatch(testMessage);
      setTestResult(result);
    } catch (error) {
      // Error handled by store
    } finally {
      setTestLoading(false);
    }
  };

  const getMatchTypeLabel = (matchType: string) => {
    switch (matchType) {
      case 'exact': return 'Exato';
      case 'contains': return 'Contém';
      case 'starts_with': return 'Inicia com';
      case 'ends_with': return 'Termina com';
      case 'regex': return 'Regex';
      default: return matchType;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Frases Gatilho
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Gerencie as frases que acionam a captura de leads para {campaign.name}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Phrases List */}
          <div className="flex-1 p-6 overflow-y-auto border-r">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Add New Button */}
            {!showAddForm && !editingPhrase && (
              <Button 
                onClick={() => setShowAddForm(true)} 
                className="w-full mb-4"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Frase Gatilho
              </Button>
            )}

            {/* Add Form */}
            {showAddForm && (
              <div className="bg-muted rounded-lg p-4 mb-4">
                <h3 className="text-sm font-medium mb-3">Nova Frase Gatilho</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formData.phrase}
                    onChange={(e) => setFormData(prev => ({ ...prev, phrase: e.target.value }))}
                    placeholder="Digite a frase gatilho"
                    className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  
                  <input
                    type="text"
                    value={formData.creative_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, creative_code: e.target.value }))}
                    placeholder="Código do criativo (opcional)"
                    className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={formData.match_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, match_type: e.target.value as any }))}
                      className="px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="contains">Contém</option>
                      <option value="exact">Exato</option>
                      <option value="starts_with">Inicia com</option>
                      <option value="ends_with">Termina com</option>
                      <option value="regex">Regex</option>
                    </select>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="add_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                        className="w-4 h-4"
                      />
                      <label htmlFor="add_active" className="text-sm">Ativa</label>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleAddPhrase} 
                      disabled={loading || !formData.phrase.trim()} 
                      size="sm"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    </Button>
                    <Button onClick={cancelEdit} variant="outline" size="sm">
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Form */}
            {editingPhrase && (
              <div className="bg-muted rounded-lg p-4 mb-4">
                <h3 className="text-sm font-medium mb-3">Editar Frase Gatilho</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formData.phrase}
                    onChange={(e) => setFormData(prev => ({ ...prev, phrase: e.target.value }))}
                    placeholder="Digite a frase gatilho"
                    className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  
                  <input
                    type="text"
                    value={formData.creative_code || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, creative_code: e.target.value }))}
                    placeholder="Código do criativo (opcional)"
                    className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={formData.match_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, match_type: e.target.value as any }))}
                      className="px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="contains">Contém</option>
                      <option value="exact">Exato</option>
                      <option value="starts_with">Inicia com</option>
                      <option value="ends_with">Termina com</option>
                      <option value="regex">Regex</option>
                    </select>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="edit_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                        className="w-4 h-4"
                      />
                      <label htmlFor="edit_active" className="text-sm">Ativa</label>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleEditPhrase} disabled={loading} size="sm">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    </Button>
                    <Button onClick={cancelEdit} variant="outline" size="sm">
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Phrases List */}
            <div className="space-y-2">
              {loading && triggerPhrases.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : triggerPhrases.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma frase gatilho cadastrada</p>
                  <p className="text-sm">Clique em "Nova Frase Gatilho" para começar</p>
                </div>
              ) : (
                triggerPhrases.map((phrase) => (
                  <div key={phrase.id} className="bg-card border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground">{phrase.phrase}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            phrase.is_active 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {phrase.is_active ? 'Ativa' : 'Inativa'}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Tipo: {getMatchTypeLabel(phrase.match_type)} • 
                          Criada em {formatDate(phrase.createdAt)}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => startEdit(phrase)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDeletePhrase(phrase)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Panel - Test Area */}
          <div className="w-80 p-6 bg-muted/30">
            <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              Testar Frases
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Mensagem de Teste
                </label>
                <textarea
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Digite uma mensagem para testar quais frases seriam acionadas..."
                />
              </div>
              
              <Button 
                onClick={handleTestPhrase} 
                disabled={!testMessage.trim() || testLoading}
                className="w-full"
                variant="outline"
              >
                {testLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testando...
                  </>
                ) : (
                  <>
                    <TestTube className="w-4 h-4 mr-2" />
                    Testar
                  </>
                )}
              </Button>
              
              {testResult && (
                <div className="bg-background border rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-2">Resultado do Teste</h4>
                  {testResult.matched ? (
                    <div className="space-y-2">
                      <div className="text-sm text-green-700 bg-green-100 px-2 py-1 rounded">
                        Frase encontrada!
                      </div>
                      <div className="text-sm">
                        <strong>Campanha:</strong> {testResult.campaign?.name}
                      </div>
                      <div className="text-sm">
                        <strong>Frase:</strong> "{testResult.phrase?.phrase}"
                      </div>
                      <div className="text-sm">
                        <strong>Tipo:</strong> {getMatchTypeLabel(testResult.phrase?.match_type)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-red-700 bg-red-100 px-2 py-1 rounded">
                      Nenhuma frase encontrada
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};