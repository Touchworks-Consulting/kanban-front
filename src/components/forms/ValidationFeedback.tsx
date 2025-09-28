import React from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ValidationResult } from './validators/index';

interface ValidationFeedbackProps {
  validation?: ValidationResult;
  isLoading?: boolean;
  className?: string;
  show?: boolean;
}

export const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  validation,
  isLoading = false,
  className,
  show = true
}) => {
  if (!show) return null;

  // Estado de loading
  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 mt-1 text-xs animate-in fade-in-50 duration-200", className)}>
        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        <span className="text-muted-foreground">Verificando...</span>
      </div>
    );
  }

  // Sem validação ou mensagem
  if (!validation || !validation.message) return null;

  const getIcon = () => {
    switch (validation.type) {
      case 'success':
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-destructive" />;
      default:
        return null;
    }
  };

  const getTextColor = () => {
    switch (validation.type) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className={cn(
      "flex items-start gap-2 mt-1 text-xs animate-in fade-in-50 duration-200",
      className
    )}>
      {getIcon()}
      <span className={cn("leading-4", getTextColor())}>
        {validation.message}
      </span>
    </div>
  );
};