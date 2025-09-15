import { useState, useEffect } from 'react';
import { User, Mail, Calendar, Building, Key, Save, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../stores/auth';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Button } from '../components/ui/button';
import { accountService, type Account } from '../services/account';

export function ProfilePage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    avatar_url: ''
  });

  useEffect(() => {
    loadAccountData();
  }, []);

  const loadAccountData = async () => {
    try {
      setLoadingData(true);
      setError(null);
      const response = await accountService.getCurrentAccount();
      setAccount(response.account);
      setFormData({
        name: response.account.name || '',
        display_name: response.account.display_name || '',
        description: response.account.description || '',
        avatar_url: response.account.avatar_url || ''
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados da conta');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name || '',
        display_name: account.display_name || '',
        description: account.description || '',
        avatar_url: account.avatar_url || ''
      });
    }
  }, [account]);

  const handleSave = async () => {
    if (!account) return;

    setLoading(true);
    setError(null);
    try {
      await accountService.updateAccount(account.id, {
        name: formData.name,
        display_name: formData.display_name,
        description: formData.description,
        avatar_url: formData.avatar_url
      });
      await loadAccountData(); // Recarregar dados atualizados
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar alterações');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
        <span className="ml-2">Carregando dados da conta...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="w-6 h-6" />
          Meu Perfil
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerencie suas informações da conta e configurações.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Informações Básicas */}
        <div className="lg:col-span-2">
          <div className="bg-card text-card-foreground rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-6">Informações Básicas</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nome da Conta
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-border bg-background text-foreground rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Digite o nome da conta"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nome de Exibição
                </label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                  className="w-full border border-border bg-background text-foreground rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Nome amigável para exibição"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-border bg-background text-foreground rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Descrição da conta"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  URL do Avatar
                </label>
                <input
                  type="url"
                  value={formData.avatar_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                  className="w-full border border-border bg-background text-foreground rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://exemplo.com/avatar.jpg"
                />
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Informações da Conta */}
        <div>
          <div className="bg-card text-card-foreground rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-6">Informações da Conta</h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <Building className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">ID da Conta</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {account?.id || 'Não disponível'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Usuário</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.name || user?.email || 'Não disponível'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Plano</p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {account?.plan === 'free' ? 'Beta Gratuito' : account?.plan || 'Não definido'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card de Status */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                Conta Ativa
              </span>
            </div>
            <p className="text-xs text-green-700 dark:text-green-300">
              Sua conta está funcionando perfeitamente! Aproveite todos os recursos disponíveis na versão beta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}