import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { LoadingSpinner } from './LoadingSpinner';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export function LoginForm({ onSubmit, isLoading = false, error }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      await onSubmit(email, password);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="mx-auto grid w-[350px] gap-6">
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold">Touch RUN</h1>
        <p className="text-balance text-muted-foreground">
          Digite seu email abaixo para entrar na sua conta
        </p>

        {/* Banner Beta */}
        <div className="mx-auto mt-2">
          <div className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/50 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-300/20">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            Versão Beta Gratuita
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !email || !password}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </Button>
        </form>
      </div>

      <div className="mt-4 text-center text-sm">
        Não tem uma conta?{" "}
        <Link to="/register" className="underline">
          Criar conta
        </Link>
      </div>
    </div>
  );
}

export function Login03() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm
          onSubmit={async (email, password) => {
            // Esta função será passada pela página principal
            console.log('Login attempt:', { email, password });
          }}
        />
      </div>
    </div>
  );
}