import { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated, isLoading } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '', accountName: '' });
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
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-lg p-8 bg-card text-card-foreground rounded-xl border shadow">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img src="/src/assets/vite.svg" alt="Touch RUN" className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Criar Conta</h1>
          </div>
          <p className="text-muted-foreground mt-2">Preencha os dados para iniciar no Touch RUN</p>

          {/* Banner Beta */}
          <div className="mt-3">
            <div className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/50 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-300/20">
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              Versão Beta Gratuita
            </div>
          </div>
        </div>
        {error && (
          <div className="mb-4 rounded-md bg-destructive/15 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Seu nome completo"
              required
              disabled={isLoading}
              autoComplete="name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              required
              disabled={isLoading}
              autoComplete="email"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Sua senha"
              required
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="accountName">Nome da Conta</Label>
            <Input
              id="accountName"
              name="accountName"
              value={form.accountName}
              onChange={handleChange}
              placeholder="Nome da sua empresa ou organização"
              disabled={isLoading}
              autoComplete="off"
              data-1p-ignore
              data-lpignore="true"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Registrando...
              </>
            ) : (
              'Registrar'
            )}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link to="/login" className="underline underline-offset-4 hover:text-primary">
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
}
