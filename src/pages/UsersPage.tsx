import { useEffect, useState } from 'react';
import { userService } from '../services';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface UserRow { id: string; name: string; email: string; role?: string; is_active?: boolean; account_id?: string; user_id?: string; }

export function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [creating, setCreating] = useState(false);

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await userService.create(form);
      setForm({ name: '', email: '', password: '', role: 'member' });
      await load();
    } catch (e: any) {
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
          <div className="bg-white rounded shadow divide-y">
            <div className="p-4 flex items-center justify-between">
              <h2 className="font-semibold">Lista</h2>
              {loading && <LoadingSpinner size="sm" />}
            </div>
            <div className="p-4 overflow-x-auto">
              {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
              {!loading && users.length === 0 && <div className="text-sm text-gray-500">Nenhum usuário.</div>}
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-2">Nome</th>
                    <th className="py-2 pr-2">Email</th>
                    <th className="py-2 pr-2">Perfil</th>
                    <th className="py-2 pr-2">Ativo</th>
                    <th className="py-2 pr-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id || u.user_id} className="border-b last:border-0">
                      <td className="py-2 pr-2">{u.name}</td>
                      <td className="py-2 pr-2">{u.email}</td>
                      <td className="py-2 pr-2 capitalize">{u.role || 'member'}</td>
                      <td className="py-2 pr-2">{u.is_active === false ? 'Não' : 'Sim'}</td>
                      <td className="py-2 pr-2 text-right">
                        <button onClick={() => toggleActive(u)} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">
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
            <div className="bg-white rounded shadow p-4">
              <h2 className="font-semibold mb-4">Novo Usuário</h2>
              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium">Nome</label>
                  <input className="mt-1 w-full border rounded px-2 py-1 text-sm" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-xs font-medium">Email</label>
                  <input type="email" className="mt-1 w-full border rounded px-2 py-1 text-sm" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-xs font-medium">Senha</label>
                  <input type="password" className="mt-1 w-full border rounded px-2 py-1 text-sm" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-xs font-medium">Perfil</label>
                  <select className="mt-1 w-full border rounded px-2 py-1 text-sm" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    <option value="member">Membro</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button type="submit" disabled={creating} className="w-full bg-primary text-white rounded py-2 text-sm disabled:opacity-50">
                  {creating ? 'Criando...' : 'Criar Usuário'}
                </button>
              </form>
            </div>
        </div>
      </div>
    </div>
  );
}
