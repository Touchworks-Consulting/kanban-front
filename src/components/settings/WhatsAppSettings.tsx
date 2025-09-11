import React, { useEffect, useState } from 'react';
import { Plus, Search, Phone, Globe, TestTube, Edit, Trash2, Activity, AlertCircle, CheckCircle, Copy } from 'lucide-react';
import { useWhatsAppStore } from '../../stores';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { LoadingSpinner } from '../LoadingSpinner';
import { WebhookLogsModal } from '../whatsapp/WebhookLogsModal';
import type { WhatsAppAccount, CreateWhatsAppAccountDto } from '../../types';

export const WhatsAppSettings: React.FC = () => {
  const {
    accounts,
    loading,
    error,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    testWebhook,
    clearError
  } = useWhatsAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<WhatsAppAccount | null>(null);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedAccountForLogs, setSelectedAccountForLogs] = useState<WhatsAppAccount | null>(null);

  const [formData, setFormData] = useState<CreateWhatsAppAccountDto>({
    phone_id: '',
    account_name: '',
    phone_number: '',
  });

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const filteredAccounts = accounts.filter(account => 
    account.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.phone_number.includes(searchTerm) ||
    account.phone_id.includes(searchTerm)
  );

  const handleCreateAccount = async () => {
    if (!formData.phone_id || !formData.account_name || !formData.phone_number) {
      return;
    }

    try {
      await createAccount(formData);
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      // Error handled by store
    }
  };

  const handleUpdateAccount = async () => {
    if (!editingAccount) return;

    try {
      await updateAccount(editingAccount.id, formData);
      setEditingAccount(null);
      resetForm();
    } catch (error) {
      // Error handled by store
    }
  };

  const handleDeleteAccount = async (account: WhatsAppAccount) => {
    if (window.confirm(`Tem certeza que deseja deletar a conta "${account.account_name}"?`)) {
      try {
        await deleteAccount(account.id);
      } catch (error) {
        // Error handled by store
      }
    }
  };

  const handleTestWebhook = async (account: WhatsAppAccount) => {
    setTestingWebhook(account.id);
    try {
      const result = await testWebhook(account.id);
      alert(`Webhook testado com sucesso! Resultado: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      // Error handled by store
    } finally {
      setTestingWebhook(null);
    }
  };

  const startEdit = (account: WhatsAppAccount) => {
    setEditingAccount(account);
    setFormData({
      phone_id: account.phone_id,
      account_name: account.account_name,
      phone_number: account.phone_number,
    });
  };

  const resetForm = () => {
    setFormData({
      phone_id: '',
      account_name: '',
      phone_number: '',
    });
  };

  const cancelEdit = () => {
    setEditingAccount(null);
    setShowCreateModal(false);
    resetForm();
  };

  const copyWebhookUrl = () => {
    const webhookUrl = `${window.location.origin.replace(':5173', ':3000')}/api/webhook/whatsapp`;
    navigator.clipboard.writeText(webhookUrl);
    alert('URL do webhook copiada para a área de transferência!');
  };

  const openLogsModal = (account: WhatsAppAccount) => {
    setSelectedAccountForLogs(account);
    setShowLogsModal(true);
  };

  const closeLogsModal = () => {
    setShowLogsModal(false);
    setSelectedAccountForLogs(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-foreground mb-1">WhatsApp Business</h3>
          <p className="text-sm text-muted-foreground">
            Configure suas contas WhatsApp Business para receber webhooks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={copyWebhookUrl}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Copiar URL
          </Button>
          <Button onClick={() => setShowCreateModal(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nova Conta
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="outline" size="sm" onClick={clearError}>
              Fechar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar contas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Accounts List */}
      <div className="bg-card rounded-lg border overflow-hidden">
        {loading && accounts.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner />
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Phone className="w-12 h-12 text-muted-foreground mb-4" />
            <h4 className="text-lg font-medium text-foreground mb-2">
              {searchTerm ? 'Nenhuma conta encontrada' : 'Nenhuma conta configurada'}
            </h4>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? 'Tente ajustar os filtros de busca'
                : 'Configure sua primeira conta WhatsApp Business'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowCreateModal(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Configurar Conta
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {filteredAccounts.map((account) => (
              <div key={account.id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      account.is_active ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Phone className={`w-5 h-5 ${
                        account.is_active ? 'text-green-600' : 'text-gray-500'
                      }`} />
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {account.account_name}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{account.phone_number}</span>
                        <span>ID: {account.phone_id}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                          account.is_active 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {account.is_active ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          {account.is_active ? 'Ativa' : 'Inativa'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openLogsModal(account)}
                    >
                      <Activity className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestWebhook(account)}
                      disabled={testingWebhook === account.id}
                    >
                      {testingWebhook === account.id ? (
                        <LoadingSpinner />
                      ) : (
                        <TestTube className="w-4 h-4" />
                      )}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => startEdit(account)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteAccount(account)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingAccount) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold text-foreground">
                {editingAccount ? 'Editar Conta WhatsApp' : 'Nova Conta WhatsApp'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {editingAccount 
                  ? 'Atualize as informações da conta' 
                  : 'Conecte uma conta WhatsApp Business ao sistema'
                }
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone ID * <span className="text-muted-foreground">(Obrigatório)</span>
                </label>
                <input
                  type="text"
                  value={formData.phone_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="123456789012345"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  ID do número no WhatsApp Business API (obtido no Facebook Developer Console)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nome da Conta *
                </label>
                <input
                  type="text"
                  value={formData.account_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, account_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Empresa Principal"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Nome para identificar esta conta no sistema
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Número de Telefone *
                </label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="+5511999999999"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Número do WhatsApp Business (formato internacional)
                </p>
              </div>
            </div>

            <div className="p-6 border-t flex items-center justify-between">
              <Button variant="outline" onClick={cancelEdit}>
                Cancelar
              </Button>
              
              <Button 
                onClick={editingAccount ? handleUpdateAccount : handleCreateAccount}
                disabled={!formData.phone_id || !formData.account_name || !formData.phone_number}
              >
                {editingAccount ? 'Salvar' : 'Criar Conta'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Webhook Logs Modal */}
      {showLogsModal && selectedAccountForLogs && (
        <WebhookLogsModal
          account={selectedAccountForLogs}
          isOpen={showLogsModal}
          onClose={closeLogsModal}
        />
      )}
    </div>
  );
};