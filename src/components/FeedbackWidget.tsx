import { useState } from 'react';
import { useAuthStore } from '../stores/auth';
import { MessageSquare, X, Send, Bug, Lightbulb, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { cn } from '../lib/utils';

type FeedbackType = 'bug' | 'suggestion' | 'praise' | '';

export function FeedbackWidget() {
  const { token } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const feedbackOptions = [
    {
      value: 'bug' as const,
      label: 'Reportar Bug',
      description: 'Encontrei um problema ou erro',
      icon: Bug,
      color: 'text-red-500'
    },
    {
      value: 'suggestion' as const,
      label: 'Sugestão',
      description: 'Tenho uma ideia para melhorar',
      icon: Lightbulb,
      color: 'text-yellow-500'
    },
    {
      value: 'praise' as const,
      label: 'Elogio',
      description: 'Gostei de algo específico',
      icon: Heart,
      color: 'text-green-500'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackType || !message.trim()) return;

    setIsSubmitting(true);

    try {
      // Capturar informações automáticas do browser
      const browserInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        doNotTrack: navigator.doNotTrack
      };

      const screenResolution = `${screen.width}x${screen.height}`;
      const currentPage = window.location.pathname + window.location.search;

      // Enviar para API
      const response = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          type: feedbackType,
          message: message.trim(),
          browser_info: browserInfo,
          screen_resolution: screenResolution,
          current_page: currentPage
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar feedback');
      }

      const result = await response.json();
      console.log('✅ Feedback enviado com sucesso:', result.feedback_id);

      setIsSubmitted(true);

      // Reset após 3 segundos
      setTimeout(() => {
        setIsOpen(false);
        setIsSubmitted(false);
        setFeedbackType('');
        setMessage('');
      }, 3000);
    } catch (error) {
      console.error('❌ Erro ao enviar feedback:', error);

      // Mostrar erro ao usuário (você pode criar um estado de error se quiser)
      alert('Erro ao enviar feedback. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Card className="w-80 border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-700">
              <Heart className="h-5 w-5" />
              <span className="font-medium">Feedback enviado com sucesso!</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              Obrigado por nos ajudar a melhorar o Touch RUN!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-blue-600 hover:bg-blue-700"
          size="sm"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      ) : (
        <Card className="w-96 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Feedback Beta</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Sua opinião é muito importante para nós!
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Tipo de feedback
                </Label>
                <RadioGroup
                  value={feedbackType}
                  onValueChange={(value) => setFeedbackType(value as FeedbackType)}
                >
                  {feedbackOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <div key={option.value} className="flex items-start space-x-2 p-2 rounded-md hover:bg-muted/50">
                        <RadioGroupItem value={option.value} id={option.value} className="mt-0.5" />
                        <Label
                          htmlFor={option.value}
                          className="flex items-start gap-2 cursor-pointer flex-1"
                        >
                          <Icon className={cn("h-4 w-4 mt-0.5", option.color)} />
                          <div>
                            <div className="font-medium text-sm">{option.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {option.description}
                            </div>
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="message" className="text-sm font-medium">
                  Sua mensagem
                </Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Descreva seu feedback em detalhes..."
                  className="min-h-[100px] mt-2"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={!feedbackType || !message.trim() || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}