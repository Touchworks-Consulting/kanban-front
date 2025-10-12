import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { PhoneInput } from '../components/forms/PhoneInput';
import { otpService } from '../services/otpService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { CheckCircle2 } from 'lucide-react';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone || phone.length < 13) {
      setError('Telefone inválido');
      return;
    }

    setLoading(true);

    try {
      const result = await otpService.requestPasswordReset(phone);

      if (result.success) {
        setSent(true);
        // Redirecionar para página de validação OTP após 2 segundos
        setTimeout(() => {
          navigate('/reset-password', { state: { phone } });
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao enviar código');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Código Enviado!</h2>
            <p className="text-muted-foreground mb-4">
              Enviamos um código de 6 dígitos para o WhatsApp:
            </p>
            <p className="font-mono text-lg font-bold mb-6">
              {phone}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              O código expira em 10 minutos.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecionando...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <img src="/logo.svg" alt="Touch RUN" className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Recuperar Senha</h1>
            </div>
            <p className="text-muted-foreground">
              Digite seu telefone para receber um código via WhatsApp
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-destructive/15 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <PhoneInput
              value={phone}
              onChange={setPhone}
              required
              disabled={loading}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !phone}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Enviando código...
                </>
              ) : (
                'Enviar Código'
              )}
            </Button>

            <div className="text-center text-sm">
              <Link
                to="/login"
                className="text-primary hover:underline"
              >
                ← Voltar para o login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}