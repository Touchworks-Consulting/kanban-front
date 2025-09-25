import { useEffect, useState } from 'react';
import { userService } from '../services';
import { usePlanLimits } from '../components/PlanLimitsAlert';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Eye, EyeOff, Copy, RefreshCw, Check } from 'lucide-react';
import { useAuthStore } from '../stores/auth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui/select';

interface UserRow { id: string; name: string; email: string; role?: string; is_active?: boolean; account_id?: string; user_id?: string; }

export function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [creating, setCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ name: string; email: string; password: string } | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<{ type: 'password' | 'credentials' | null }>({ type: null });
  const { checkUserLimit } = usePlanLimits();
  const { account } = useAuthStore();

  const load = async () => {
    setLoading(true);
    try {
      const list = await userService.list();
      setUsers(list);
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Reagir à mudança de conta
  useEffect(() => {
    const handleAccountChange = (event: CustomEvent) => {
      console.log('👂 UsersPage: Detectada mudança de conta, recarregando dados...', event.detail);
      load();
    };

    window.addEventListener('accountChanged', handleAccountChange as EventListener);

    return () => {
      window.removeEventListener('accountChanged', handleAccountChange as EventListener);
    };
  }, []);

  const generateSecurePassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword();
    setForm(f => ({ ...f, password: newPassword }));
  };

  const copyToClipboard = async (text: string, type: 'password' | 'credentials') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback({ type });
      setTimeout(() => setCopyFeedback({ type: null }), 2000);
    } catch (err) {
      console.error('Erro ao copiar para área de transferência:', err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
  e.preventDefault();
  console.log('submit: handleCreate chamado');
  console.log('🔍 DEBUG - Account data:', account);
  console.log('🔍 DEBUG - Account ID:', account?.id);
  console.log('🔍 DEBUG - Account ID (account_id):', account?.account_id);
  console.log('🔍 DEBUG - Form data:', form);
  console.log('🔍 DEBUG - AuthStore account:', account);
  setCreating(true);
  setError(null);

    try {
      // Verificar limite antes de criar usuário
      const limitCheck = await checkUserLimit(1);
      console.log('checkUserLimit result:', limitCheck);

      if (!limitCheck.allowed) {
        setError(limitCheck.message || 'Limite de usuários atingido. Considere fazer upgrade do seu plano.');
        return;
      }

      console.log('chamando userService.create', form);

      // Salvar as credenciais antes de enviar para o servidor
      const credentialsToSave = {
        name: form.name,
        email: form.email,
        password: form.password
      };

      // Usar account_id se disponível (novo formato), senão usar id (formato legado)
      const accountId = account?.account_id || account?.id;

      const payload = {
        ...form,
        role: form.role as "member" | "admin",
        account_id: accountId
      };

      console.log('🔍 DEBUG - Account ID calculado:', accountId);
      console.log('🔍 DEBUG - Payload completo:', payload);
      console.log('🔍 DEBUG - Account ID no payload:', payload.account_id);

      await userService.create(payload);

      // Salvar credenciais e mostrar modal
      setCreatedCredentials(credentialsToSave);
      setShowCredentials(true);

      setForm({ name: '', email: '', password: '', role: 'member' });
      await load();
    } catch (e: any) {
      console.log('Erro ao criar usuário:', e);
      setError(e.message || 'Erro ao criar usuário');
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (u: UserRow) => {
    try {
      await userService.update(u.id || (u as any).user_id, { is_active: !u.is_active });
      await load();
    } catch (e: any) {
      setError(e.message || 'Erro ao atualizar');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Usuários</h1>
        <p className="text-sm text-muted-foreground">Gerencie os usuários que têm acesso à sua conta.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-card text-card-foreground rounded shadow divide-y divide-border">
            <div className="p-4 flex items-center justify-between">
              <h2 className="font-semibold">Lista</h2>
              {loading && <LoadingSpinner size="sm" />}
            </div>
            <div className="p-4 overflow-x-auto">
              {error && <div className="mb-4 text-sm text-destructive">{error}</div>}
              {!loading && users.length === 0 && <div className="text-sm text-muted-foreground">Nenhum usuário.</div>}
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-border">
                    <th className="py-2 pr-2">Nome</th>
                    <th className="py-2 pr-2">Email</th>
                    <th className="py-2 pr-2">Perfil</th>
                    <th className="py-2 pr-2">Ativo</th>
                    <th className="py-2 pr-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id || u.user_id} className="border-b border-border last:border-0">
                      <td className="py-2 pr-2">{u.name}</td>
                      <td className="py-2 pr-2">{u.email}</td>
                      <td className="py-2 pr-2 capitalize">{u.role || 'member'}</td>
                      <td className="py-2 pr-2">{u.is_active === false ? 'Não' : 'Sim'}</td>
                      <td className="py-2 pr-2 text-right">
                        <button onClick={() => toggleActive(u)} className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80">
                          {u.is_active === false ? 'Ativar' : 'Desativar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div>
            <div className="bg-card text-card-foreground rounded shadow p-4">
              <h2 className="font-semibold mb-4">Novo Usuário</h2>
              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-foreground">Nome</label>
                  <input className="mt-1 w-full border border-border bg-background text-foreground rounded px-2 py-1 text-sm focus:ring-2 focus:ring-primary focus:border-transparent" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground">Email</label>
                  <input type="email" className="mt-1 w-full border border-border bg-background text-foreground rounded px-2 py-1 text-sm focus:ring-2 focus:ring-primary focus:border-transparent" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground">Senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="mt-1 w-full border border-border bg-background text-foreground rounded px-2 py-1 pr-20 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      required
                    />
                    <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex gap-1">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                        title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(form.password, 'password')}
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                        title="Copiar senha"
                        disabled={!form.password}
                      >
                        {copyFeedback.type === 'password' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="mt-2 flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Gerar senha segura
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground">Perfil</label>
                  <Select value={form.role} onValueChange={(value: "member" | "admin") => setForm(f => ({ ...f, role: value }))}>
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue placeholder="Selecionar perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Membro</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <button type="submit" disabled={creating} className="w-full bg-primary text-primary-foreground rounded py-2 text-sm disabled:opacity-50 hover:bg-primary/90 transition-colors">
                  {creating ? 'Criando...' : 'Criar Usuário'}
                </button>
              </form>
            </div>
        </div>
      </div>

      {/* Modal de Credenciais */}
      {showCredentials && createdCredentials && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card text-card-foreground rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Usuário Criado com Sucesso!</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground">Nome</label>
                <div className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                  <span>{createdCredentials.name}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground">Email</label>
                <div className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                  <span>{createdCredentials.email}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground">Senha</label>
                <div className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                  <span className="font-mono">{createdCredentials.password}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  const credentialsText = `Nome: ${createdCredentials.name}\nEmail: ${createdCredentials.email}\nSenha: ${createdCredentials.password}`;
                  copyToClipboard(credentialsText, 'credentials');
                }}
                className="flex-1 bg-primary text-primary-foreground rounded py-2 px-3 text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                {copyFeedback.type === 'credentials' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copyFeedback.type === 'credentials' ? 'Copiado!' : 'Copiar Credenciais'}
              </button>
              <button
                onClick={() => {
                  setShowCredentials(false);
                  setCreatedCredentials(null);
                }}
                className="px-4 py-2 text-sm border border-border rounded hover:bg-muted transition-colors"
              >
                Fechar
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              ⚠️ Salve essas credenciais em um local seguro. Esta é a única vez que você verá a senha.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
