import React, { useState } from 'react';
import { Settings, Phone, User, Bell, Shield, Database } from 'lucide-react';
import { Button } from '../components/ui/button';
import { WhatsAppSettings } from '../components/settings/WhatsAppSettings';

interface SettingsTabProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const SettingsTabs: React.FC<SettingsTabProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Perfil do Usuário</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'whatsapp':
        return <WhatsAppSettings />;

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Notificações</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Novos leads</h4>
                    <p className="text-sm text-muted-foreground">
                      Receber notificação quando um novo lead for capturado
                    </p>
                  </div>
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Webhooks</h4>
                    <p className="text-sm text-muted-foreground">
                      Notificar sobre eventos de webhook
                    </p>
                  </div>
                  <input type="checkbox" className="w-4 h-4" />
                </div>
              </div>
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
                    <Button variant="outline" size="sm">
                      Exportar Leads (CSV)
                    </Button>
                    <Button variant="outline" size="sm">
                      Exportar Campanhas (JSON)
                    </Button>
                    <Button variant="outline" size="sm">
                      Logs WhatsApp (CSV)
                    </Button>
                  </div>
                </div>

                {/* Statistics Section */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-2">Estatísticas do Sistema</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="text-2xl font-bold text-foreground">-</div>
                      <div className="text-xs text-muted-foreground">Total Leads</div>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="text-2xl font-bold text-foreground">-</div>
                      <div className="text-xs text-muted-foreground">Campanhas</div>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="text-2xl font-bold text-foreground">-</div>
                      <div className="text-xs text-muted-foreground">Webhooks</div>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="text-2xl font-bold text-foreground">-</div>
                      <div className="text-xs text-muted-foreground">Contas WA</div>
                    </div>
                  </div>
                </div>

                {/* Maintenance Section */}
                <div className="border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-2">Manutenção</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ferramentas para limpeza e otimização do sistema. Use com cuidado!
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm">
                      Limpar Logs Antigos
                    </Button>
                    <Button variant="outline" size="sm">
                      Otimizar Banco
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
        {renderTabContent()}
      </div>
    </div>
  );
};

