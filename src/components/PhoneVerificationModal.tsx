import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { LoadingSpinner } from './LoadingSpinner';
import { AlertTriangle, CheckCircle, Phone, ArrowLeft, Smartphone, MessageCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { PhoneInput } from './forms/PhoneInput';
import { otpService } from '../services/otpService';
import { useAuthStore } from '../stores/auth';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onVerificationSuccess: (user: any) => void;
}

export function PhoneVerificationModal({
  isOpen,
  onVerificationSuccess
}: PhoneVerificationModalProps) {
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const { account } = useAuthStore();

  // Countdown para reenvio
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOTP = async () => {
    if (!phone) {
      setError('Telefone é obrigatório');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await otpService.requestPhoneVerification(phone);
      setStep('otp');
      setSuccess('Código enviado via WhatsApp!');
      setCountdown(60); // 60 segundos para reenvio
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar código');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      setError('Código OTP é obrigatório');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await otpService.verifyPhone(phone, otp);

      if (response.success && response.user) {
        setStep('success');
        setSuccess('Telefone verificado com sucesso!');

        // Atualizar dados do usuário no store após animação
        setTimeout(() => {
          onVerificationSuccess(response.user);
        }, 2000);
      } else {
        setError(response.message || 'Erro na verificação');
      }
    } catch (err: any) {
      setError(err.message || 'Código inválido ou expirado');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPhone = () => {
    setStep('phone');
    setOtp('');
    setError(null);
    setSuccess(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}} modal>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Verificação de Telefone Obrigatória</DialogTitle>
              <DialogDescription>
                Para continuar usando o sistema, você precisa verificar seu número do WhatsApp
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <div className="rounded-lg bg-destructive/15 border border-destructive/20 px-4 py-3 text-sm text-destructive flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && step !== 'success' && (
            <div className="rounded-lg bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-800 dark:text-green-200 flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600 dark:text-green-400" />
              <span>{success}</span>
            </div>
          )}

          {step === 'phone' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-amber-100 dark:bg-amber-900/50 rounded-full">
                    <MessageCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="text-sm text-amber-800 dark:text-amber-200">
                    <p className="font-semibold mb-2">Por que isso é necessário?</p>
                    <p className="text-xs leading-relaxed">
                      Seu telefone é usado para recuperação de senha e notificações importantes.
                      Precisamos verificar que é um número válido do WhatsApp.
                    </p>
                  </div>
                </div>
              </div>

              <div className="transform transition-all duration-300 hover:scale-[1.02]">
                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                  required
                  label="Seu Telefone (WhatsApp)"
                  error={error && !phone ? 'Telefone é obrigatório' : undefined}
                />
              </div>

              <Button
                onClick={handleSendOTP}
                disabled={loading || !phone}
                className="w-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                size="lg"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Enviando código...
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Enviar Código via WhatsApp
                  </>
                )}
              </Button>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="text-center bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Código enviado via WhatsApp
                  </p>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  para <strong className="font-mono">{phone}</strong>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp" className="text-base font-medium">Código de Verificação</Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  required
                  disabled={loading}
                  className="text-center text-2xl tracking-[0.5em] font-mono h-14 transition-all duration-300 focus:scale-[1.02] focus:ring-2"
                />
                <p className="text-xs text-center text-muted-foreground">
                  Digite os 6 dígitos recebidos no WhatsApp
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackToPhone}
                  disabled={loading}
                  className="flex-1 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  onClick={handleVerifyOTP}
                  disabled={loading || !otp || otp.length !== 6}
                  className="flex-1 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verificar Código
                    </>
                  )}
                </Button>
              </div>

              <div className="text-center border-t pt-4">
                <Button
                  type="button"
                  variant="link"
                  onClick={handleSendOTP}
                  disabled={loading || countdown > 0}
                  size="sm"
                  className="text-xs transition-all duration-300"
                >
                  {countdown > 0 ? (
                    `Reenviar em ${countdown}s`
                  ) : (
                    'Não recebeu? Reenviar código'
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-700">
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-1000 delay-300">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 animate-in zoom-in duration-700 delay-500" />
                </div>
                <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2 animate-in slide-in-from-bottom-2 duration-500 delay-700">
                  Telefone Verificado!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 animate-in slide-in-from-bottom-2 duration-500 delay-900">
                  Seu número WhatsApp foi verificado com sucesso.
                  <br />
                  Você será redirecionado em instantes...
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 animate-in slide-in-from-bottom-2 duration-500 delay-1100">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-green-100 dark:bg-green-900/50 rounded-full">
                    <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-green-800 dark:text-green-200 mb-1">
                      Número verificado: <span className="font-mono">{phone}</span>
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      Agora você pode usar todos os recursos do sistema, incluindo recuperação de senha.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}