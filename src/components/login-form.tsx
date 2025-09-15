import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { LoadingSpinner } from './LoadingSpinner';

interface LoginFormProps {
  className?: string;
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export function LoginForm({
  className,
  onSubmit,
  isLoading = false,
  error,
  ...props
}: LoginFormProps & Omit<React.ComponentProps<"div">, 'onSubmit'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || isLoading) return;

    await onSubmit(email, password);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center gap-2 mb-2">
                  <img src="/logo.svg" alt="Touch RUN" className="h-8 w-8" />
                  <h1 className="text-2xl font-bold">Touch RUN</h1>
                </div>
                <p className="text-balance text-muted-foreground">
                  Entre na sua conta do Touch RUN
                </p>

                {/* Banner Beta */}
                <div className="mt-3">
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

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
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
              <div className="text-center text-sm">
                Não tem uma conta?{" "}
                <Link to="/register" className="underline underline-offset-4">
                  Criar conta
                </Link>
              </div>
            </div>
          </form>
          <div className="relative hidden bg-muted md:block">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
              <div className="absolute inset-0 bg-black/20"></div>
              {/* Logo de fundo com zoom alto */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: "url('/logo.svg')",
                  backgroundSize: "800px 800px",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat"
                }}
              ></div>
              <div className="relative h-full flex flex-col items-center justify-center p-8 text-white">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-bold tracking-tight">
                    Bem-vindo
                  </h2>
                  <p className="text-blue-100 max-w-md">
                    Gerencie seus leads, automatize processos e aumente suas vendas com nossa plataforma completa de CRM.
                  </p>
                  <div className="flex items-center justify-center space-x-8 pt-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold">10K+</div>
                      <div className="text-xs text-blue-200">Leads gerenciados</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">99%</div>
                      <div className="text-xs text-blue-200">Disponibilidade</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">24/7</div>
                      <div className="text-xs text-blue-200">Suporte</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        Ao continuar, você concorda com nossos <Link to="/terms">Termos de Serviço</Link>{" "}
        e <Link to="/privacy">Política de Privacidade</Link>.
      </div>
    </div>
  );
}