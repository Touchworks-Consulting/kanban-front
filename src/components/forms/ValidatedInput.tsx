import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '../ui/input';
import { ValidationFeedback } from './ValidationFeedback';
import { cn } from '../../lib/utils';
import type { ValidationResult } from './validators/index';
import {
  validateEmail,
  validatePhoneNumber,
  validateText,
  validateNumber,
  processPhoneInput,
  createDebouncedEmailValidator,
  getEmailSuggestions
} from './validators/index';

export interface ValidatedInputProps {
  field: string;
  value: string;
  type: 'phone' | 'email' | 'text' | 'number';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  validationOptions?: Record<string, any>;
  onValidatedChange: (value: string, isValid: boolean, validation?: ValidationResult) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  showFeedback?: boolean;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  field,
  value,
  type,
  placeholder,
  required = false,
  disabled = false,
  className,
  validationOptions = {},
  onValidatedChange,
  onBlur,
  onFocus,
  showFeedback = true
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [validation, setValidation] = useState<ValidationResult | undefined>();
  const [isValidating, setIsValidating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounced email validator
  const debouncedEmailValidator = useCallback(
    createDebouncedEmailValidator((result: ValidationResult) => {
      setValidation(result);
      setIsValidating(false);
      onValidatedChange(displayValue, result.isValid, result);
    }),
    [displayValue, onValidatedChange]
  );

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const validateField = (inputValue: string) => {
    let result: ValidationResult;

    switch (type) {
      case 'phone':
        const phoneResult = processPhoneInput(inputValue, { required, ...validationOptions });
        result = phoneResult.validation;

        // Se válido, usar o valor formatado
        if (result.isValid && phoneResult.formatted !== inputValue) {
          setDisplayValue(phoneResult.formatted);
          onValidatedChange(phoneResult.formatted, result.isValid, result);
        } else {
          onValidatedChange(inputValue, result.isValid, result);
        }
        break;

      case 'email':
        setIsValidating(true);
        debouncedEmailValidator(inputValue, { required, ...validationOptions });

        // Gerar sugestões se necessário
        if (inputValue.includes('@') && !inputValue.endsWith('@')) {
          const emailSuggestions = getEmailSuggestions(inputValue);
          setSuggestions(emailSuggestions);
          setShowSuggestions(emailSuggestions.length > 0);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
        return; // Return early for debounced validation

      case 'number':
        result = validateNumber(inputValue, { required, ...validationOptions });
        break;

      case 'text':
      default:
        result = validateText(inputValue, { required, ...validationOptions });
        break;
    }

    setValidation(result);
    onValidatedChange(inputValue, result.isValid, result);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setDisplayValue(newValue);

    // Para telefone, formatar em tempo real
    if (type === 'phone') {
      const phoneResult = processPhoneInput(newValue, { required, ...validationOptions });
      setDisplayValue(phoneResult.formatted);
      setValidation(phoneResult.validation);
      onValidatedChange(phoneResult.formatted, phoneResult.validation.isValid, phoneResult.validation);
    } else {
      validateField(newValue);
    }
  };

  const handleBlur = () => {
    setShowSuggestions(false);

    // Para telefone, aplicar formatação final e código do país se necessário
    if (type === 'phone' && displayValue) {
      const phoneResult = processPhoneInput(displayValue, { required, ...validationOptions });
      setDisplayValue(phoneResult.formatted);
      setValidation(phoneResult.validation);
      onValidatedChange(phoneResult.formatted, phoneResult.validation.isValid, phoneResult.validation);
    }

    onBlur?.();
  };

  const handleFocus = () => {
    if (type === 'email' && suggestions.length > 0) {
      setShowSuggestions(true);
    }
    onFocus?.();
  };

  const applySuggestion = (suggestion: string) => {
    const [localPart] = displayValue.split('@');
    const newEmail = `${localPart}@${suggestion}`;
    setDisplayValue(newEmail);
    validateField(newEmail);
    setShowSuggestions(false);
  };

  const getInputClassName = () => {
    if (!validation) return '';

    switch (validation.type) {
      case 'error':
        return 'border-destructive focus-visible:ring-destructive bg-destructive/5';
      case 'success':
        return 'border-green-500 focus-visible:ring-green-500 bg-green-50/50';
      case 'warning':
        return 'border-yellow-500 focus-visible:ring-yellow-500 bg-yellow-50/50';
      default:
        return '';
    }
  };

  return (
    <div className="relative w-full">
      <Input
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'transition-colors duration-200',
          getInputClassName(),
          className
        )}
        type={type === 'number' ? 'number' : 'text'}
        inputMode={type === 'phone' ? 'tel' : type === 'email' ? 'email' : undefined}
      />

      {/* Sugestões de email */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-md z-50 max-h-32 overflow-y-auto">
          {suggestions.map((suggestion, index) => {
            const [localPart] = displayValue.split('@');
            const fullSuggestion = `${localPart}@${suggestion}`;

            return (
              <button
                key={index}
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                onClick={() => applySuggestion(suggestion)}
                type="button"
              >
                <span className="text-muted-foreground">Você quis dizer </span>
                <span className="font-medium">{fullSuggestion}</span>
                <span className="text-muted-foreground">?</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Feedback de validação */}
      {showFeedback && (
        <ValidationFeedback
          validation={validation}
          isLoading={isValidating}
          show={!!displayValue || !!validation?.message}
        />
      )}
    </div>
  );
};