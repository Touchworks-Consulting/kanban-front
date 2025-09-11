import { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated, isLoading } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '', accountName: '', domain: '' });
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.email || !form.password || !form.name) return;
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Falha no registro');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="w-full max-w-lg p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Criar Conta</h1>
          <p className="text-gray-600 mt-2">Preencha os dados para iniciar</p>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome</label>
            <input name="name" value={form.name} onChange={handleChange} required disabled={isLoading} className="mt-1 w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required disabled={isLoading} className="mt-1 w-full border rounded px-3 py-2" />
          </div>
            <div>
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required disabled={isLoading} className="mt-1 w-full border rounded px-3 py-2" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome da Conta</label>
              <input name="accountName" value={form.accountName} onChange={handleChange} placeholder="Minha Empresa" disabled={isLoading} className="mt-1 w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Domínio (opcional)</label>
              <input name="domain" value={form.domain} onChange={handleChange} placeholder="ex: empresa.com" disabled={isLoading} className="mt-1 w-full border rounded px-3 py-2" />
            </div>
          </div>
          <button type="submit" disabled={isLoading} className="mt-2 w-full flex items-center justify-center bg-primary text-white py-2 rounded disabled:opacity-50">
            {isLoading ? (<><LoadingSpinner size="sm" className="mr-2" /> Registrando...</>) : 'Registrar'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600">
          Já tem conta? <Link to="/login" className="text-indigo-600 hover:underline">Entrar</Link>
        </div>
      </div>
    </div>
  );
}
