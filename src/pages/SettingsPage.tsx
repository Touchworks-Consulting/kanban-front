import React, { useState, useEffect } from 'react';
import { Settings, Phone, User, Bell, Shield, Database, Download, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { WhatsAppSettings } from '../components/settings/WhatsAppSettings';
import { StatusSettings } from '../components/settings/StatusSettings';
import { useSettingsStore } from '../stores';

interface SettingsTabProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const SettingsTabs: React.FC<SettingsTabProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'status', label: 'Status', icon: Settings },
    { id: 'whatsapp', label: 'WhatsApp', icon: Phone },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'data', label: 'Dados', icon: Database },
  ];

  return (
    <div className="w-64 bg-card border-r">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configurações
        </h2>
      </div>
      <nav className="p-4 space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('whatsapp');

  const {
    profile,
    statistics,
    notificationSettings,
    loading,
    error,
    fetchProfile,
    updateProfile,
    fetchSystemStatistics,
    fetchNotificationSettings,
    updateNotificationSettings,
    exportLeads,
    exportCampaigns,
    exportWebhookLogs,
    cleanupOldLogs,
    clearError
  } = useSettingsStore();

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    display_name: '',
    description: '',
    avatar_url: ''
  });

  // Load data on component mount
  useEffect(() => {
    fetchProfile();
    fetchSystemStatistics();
    fetchNotificationSettings();
  }, [fetchProfile, fetchSystemStatistics, fetchNotificationSettings]);

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || '',
        email: profile.email || '',
        display_name: profile.display_name || '',
        description: profile.description || '',
        avatar_url: profile.avatar_url || ''
      });
    }
  }, [profile]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(profileForm);
      // Success feedback can be handled with a toast/alert system
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleNotificationSettingChange = async (setting: string, value: boolean) => {
    try {
      await updateNotificationSettings({ [setting]: value });
    } catch (error) {
      // Error is handled by the store
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            {loading.profile && (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
              </div>
            )}

            {!loading.profile && (
              <form onSubmit={handleProfileSubmit}>
                <h3 className="text-lg font-medium text-foreground mb-4">Perfil do Usuário</h3>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Nome completo
                      </label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Seu nome completo"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="seu@email.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Nome de exibição
                      </label>
                      <input
                        type="text"
                        value={profileForm.display_name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, display_name: e.target.value }))}
                        className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Como você quer ser chamado"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        URL do Avatar
                      </label>
                      <input
                        type="url"
                        value={profileForm.avatar_url}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, avatar_url: e.target.value }))}
                        className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="https://exemplo.com/avatar.jpg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={profileForm.description}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                      placeholder="Fale um pouco sobre você ou sua empresa..."
                    />
                  </div>

                  {profile && (
                    <div className="bg-muted rounded-lg p-4">
                      <h4 className="font-medium text-foreground mb-2">Informações da Conta</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>Plano: <span className="font-medium">{profile.plan}</span></div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={loading.profile}
                      className="flex items-center gap-2"
                    >
                      {loading.profile && <LoadingSpinner />}
                      Salvar Alterações
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        );

      case 'status':
        return <StatusSettings />;

      case 'whatsapp':
        return <WhatsAppSettings />;

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Notificações</h3>

              {loading.notificationSettings && (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                </div>
              )}

              {!loading.notificationSettings && notificationSettings && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Novos leads</h4>
                      <p className="text-sm text-muted-foreground">
                        Receber notificação quando um novo lead for capturado
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={notificationSettings.newLeads}
                      onChange={(e) => handleNotificationSettingChange('newLeads', e.target.checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Webhooks</h4>
                      <p className="text-sm text-muted-foreground">
                        Notificar sobre eventos de webhook
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={notificationSettings.webhooks}
                      onChange={(e) => handleNotificationSettingChange('webhooks', e.target.checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Mudanças de status</h4>
                      <p className="text-sm text-muted-foreground">
                        Notificar quando leads mudarem de status
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={notificationSettings.statusChanges}
                      onChange={(e) => handleNotificationSettingChange('statusChanges', e.target.checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Atualizações de campanhas</h4>
                      <p className="text-sm text-muted-foreground">
                        Notificar sobre mudanças em campanhas
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={notificationSettings.campaignUpdates}
                      onChange={(e) => handleNotificationSettingChange('campaignUpdates', e.target.checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Alertas do sistema</h4>
                      <p className="text-sm text-muted-foreground">
                        Receber notificações importantes do sistema
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={notificationSettings.systemAlerts}
                      onChange={(e) => handleNotificationSettingChange('systemAlerts', e.target.checked)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Segurança</h3>
              <div className="space-y-4">
                <Button variant="outline">Alterar Senha</Button>
                <Button variant="outline">Configurar 2FA</Button>
              </div>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Gerenciamento de Dados</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Gerencie os dados do sistema, incluindo leads, campanhas e logs de webhook.
              </p>
              
              <div className="space-y-6">
                {/* Export Section */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-2">Exportar Dados</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Baixe seus dados em diferentes formatos para backup ou análise externa.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportLeads({ format: 'csv' })}
                      disabled={loading.export}
                      className="flex items-center gap-2"
                    >
                      {loading.export ? <LoadingSpinner /> : <Download className="w-4 h-4" />}
                      Exportar Leads (CSV)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportCampaigns()}
                      disabled={loading.export}
                      className="flex items-center gap-2"
                    >
                      {loading.export ? <LoadingSpinner /> : <Download className="w-4 h-4" />}
                      Exportar Campanhas (JSON)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportWebhookLogs()}
                      disabled={loading.export}
                      className="flex items-center gap-2"
                    >
                      {loading.export ? <LoadingSpinner /> : <Download className="w-4 h-4" />}
                      Logs WhatsApp (CSV)
                    </Button>
                  </div>
                </div>

                {/* Statistics Section */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-2">Estatísticas do Sistema</h4>
                  {loading.statistics ? (
                    <div className="flex items-center justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div className="bg-muted rounded-lg p-3">
                        <div className="text-2xl font-bold text-foreground">
                          {statistics?.overview?.totalLeads ?? 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Total Leads</div>
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="text-2xl font-bold text-foreground">
                          {statistics?.overview?.totalCampaigns ?? 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Campanhas</div>
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="text-2xl font-bold text-foreground">
                          {statistics?.overview?.totalWebhooks ?? 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Webhooks</div>
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="text-2xl font-bold text-foreground">
                          {statistics?.overview?.totalWhatsAppAccounts ?? 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Contas WA</div>
                      </div>
                    </div>
                  )}

                  {statistics && (
                    <div className="mt-4 space-y-4">
                      <h5 className="font-medium text-foreground">Performance</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="bg-muted rounded-lg p-3">
                          <div className="text-2xl font-bold text-green-600">
                            {statistics.performance.wonLeads}
                          </div>
                          <div className="text-xs text-muted-foreground">Leads Ganhos</div>
                        </div>
                        <div className="bg-muted rounded-lg p-3">
                          <div className="text-2xl font-bold text-red-600">
                            {statistics.performance.lostLeads}
                          </div>
                          <div className="text-xs text-muted-foreground">Leads Perdidos</div>
                        </div>
                        <div className="bg-muted rounded-lg p-3">
                          <div className="text-2xl font-bold text-blue-600">
                            {statistics.performance.activeLeads}
                          </div>
                          <div className="text-xs text-muted-foreground">Leads Ativos</div>
                        </div>
                        <div className="bg-muted rounded-lg p-3">
                          <div className="text-2xl font-bold text-purple-600">
                            {statistics.performance.conversionRate}%
                          </div>
                          <div className="text-xs text-muted-foreground">Taxa Conversão</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Maintenance Section */}
                <div className="border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-2">Manutenção</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ferramentas para limpeza e otimização do sistema. Use com cuidado!
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cleanupOldLogs({ days: 30 })}
                      disabled={loading.cleanup}
                      className="flex items-center gap-2"
                    >
                      {loading.cleanup ? <LoadingSpinner /> : <Trash2 className="w-4 h-4" />}
                      Limpar Logs Antigos
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchSystemStatistics()}
                      disabled={loading.statistics}
                      className="flex items-center gap-2"
                    >
                      {loading.statistics ? <LoadingSpinner /> : <RotateCcw className="w-4 h-4" />}
                      Atualizar Estatísticas
                    </Button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="border border-red-200 rounded-lg p-4 bg-red-50/50">
                  <h4 className="font-medium text-red-800 mb-2">Zona de Perigo</h4>
                  <p className="text-sm text-red-600 mb-4">
                    Ações irreversíveis que podem causar perda de dados. Proceda com extrema cautela.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="destructive" size="sm">
                      Limpar Todos os Leads
                    </Button>
                    <Button variant="destructive" size="sm">
                      Reset Completo
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex">
      <SettingsTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 p-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription className="flex items-center justify-between">
              {error}
              <Button variant="outline" size="sm" onClick={clearError}>
                Fechar
              </Button>
            </AlertDescription>
          </Alert>
        )}
        {renderTabContent()}
      </div>
    </div>
  );
};

