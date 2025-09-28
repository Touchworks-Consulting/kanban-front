// Re-exportamos ValidationResult do arquivo de tipos
export type { ValidationResult } from './types';

// Re-exportamos as funções específicas dos outros arquivos
export {
  validatePhoneNumber,
  formatPhoneNumber,
  processPhoneInput,
  type PhoneValidationOptions,
  type PhoneProcessingResult
} from './phoneValidator';

export {
  validateEmail,
  createDebouncedEmailValidator,
  getEmailSuggestions,
  type EmailValidationOptions
} from './emailValidator';

// Importamos ValidationResult para usar nas funções locais
import type { ValidationResult } from './types';

// Validador genérico para campos de texto
export const validateText = (value: string, options: { required?: boolean; minLength?: number; maxLength?: number } = {}): ValidationResult => {
  const { required = false, minLength = 0, maxLength = Infinity } = options;

  if (!value || value.trim() === '') {
    if (required) {
      return {
        isValid: false,
        message: 'Campo obrigatório',
        type: 'error'
      };
    }
    return { isValid: true, type: 'success' };
  }

  const trimmedValue = value.trim();

  if (trimmedValue.length < minLength) {
    return {
      isValid: false,
      message: `Deve ter pelo menos ${minLength} caracteres`,
      type: 'error'
    };
  }

  if (trimmedValue.length > maxLength) {
    return {
      isValid: false,
      message: `Deve ter no máximo ${maxLength} caracteres`,
      type: 'error'
    };
  }

  return {
    isValid: true,
    message: 'Campo válido',
    type: 'success'
  };
};

// Validador para números/valores monetários
export const validateNumber = (value: string, options: { required?: boolean; min?: number; max?: number; allowZero?: boolean } = {}): ValidationResult => {
  const { required = false, min = -Infinity, max = Infinity, allowZero = true } = options;

  if (!value || value.trim() === '') {
    if (required) {
      return {
        isValid: false,
        message: 'Valor é obrigatório',
        type: 'error'
      };
    }
    return { isValid: true, type: 'success' };
  }

  const numValue = parseFloat(value);

  if (isNaN(numValue)) {
    return {
      isValid: false,
      message: 'Deve ser um número válido',
      type: 'error'
    };
  }

  if (!allowZero && numValue === 0) {
    return {
      isValid: false,
      message: 'Valor deve ser maior que zero',
      type: 'error'
    };
  }

  if (numValue < min) {
    return {
      isValid: false,
      message: `Valor deve ser pelo menos ${min}`,
      type: 'error'
    };
  }

  if (numValue > max) {
    return {
      isValid: false,
      message: `Valor deve ser no máximo ${max}`,
      type: 'error'
    };
  }

  return {
    isValid: true,
    message: 'Valor válido',
    type: 'success'
  };
};