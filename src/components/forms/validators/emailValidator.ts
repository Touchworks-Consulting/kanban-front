// Importamos ValidationResult do arquivo de tipos
import type { ValidationResult } from './types';

export interface EmailValidationOptions {
  required?: boolean;
  allowDisposable?: boolean;
}

// Domínios temporários/descartáveis comuns (lista básica)
const disposableDomains = [
  '10minutemail.com',
  'tempmail.org',
  'guerrillamail.com',
  'mailinator.com',
  'temp-mail.org',
  'throwaway.email',
  'getnada.com'
];

// Domínios válidos comuns para sugestões
const commonDomains = [
  'gmail.com',
  'hotmail.com',
  'yahoo.com',
  'outlook.com',
  'live.com',
  'icloud.com',
  'terra.com.br',
  'uol.com.br',
  'bol.com.br',
  'ig.com.br'
];

// TLDs válidos (lista básica)
const validTLDs = [
  'com', 'org', 'net', 'edu', 'gov', 'mil', 'int',
  'com.br', 'org.br', 'net.br', 'edu.br', 'gov.br',
  'co.uk', 'org.uk', 'ac.uk',
  'de', 'fr', 'it', 'es', 'pt',
  'io', 'co', 'me', 'info', 'biz'
];

const isValidTLD = (tld: string): boolean => {
  return validTLDs.includes(tld.toLowerCase());
};

const isDisposableEmail = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? disposableDomains.includes(domain) : false;
};

const isValidEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateEmail = (email: string, options: EmailValidationOptions = {}): ValidationResult => {
  const { required = false, allowDisposable = false } = options;

  if (!email || email.trim() === '') {
    if (required) {
      return {
        isValid: false,
        message: 'E-mail é obrigatório',
        type: 'error'
      };
    }
    return { isValid: true, type: 'success' };
  }

  const trimmedEmail = email.trim().toLowerCase();

  // Valida formato básico
  if (!isValidEmailFormat(trimmedEmail)) {
    return {
      isValid: false,
      message: 'Formato de e-mail inválido',
      type: 'error'
    };
  }

  // Extrai domínio e TLD
  const [, domain] = trimmedEmail.split('@');
  const domainParts = domain.split('.');
  const tld = domainParts.slice(-1)[0];

  // Valida TLD
  if (!isValidTLD(tld)) {
    return {
      isValid: false,
      message: 'Domínio de e-mail inválido',
      type: 'error'
    };
  }

  // Verifica e-mail descartável
  if (!allowDisposable && isDisposableEmail(trimmedEmail)) {
    return {
      isValid: false,
      message: 'E-mails temporários não são permitidos',
      type: 'warning'
    };
  }

  return {
    isValid: true,
    message: 'E-mail válido',
    type: 'success'
  };
};

// Função para sugestões de domínio
export const getEmailSuggestions = (email: string): string[] => {
  if (!email.includes('@')) return [];

  const [localPart, domain] = email.split('@');
  if (!domain || domain.includes('.')) return [];

  // Busca domínios similares
  const suggestions = commonDomains.filter(commonDomain => {
    return commonDomain.toLowerCase().startsWith(domain.toLowerCase()) ||
           domain.toLowerCase().length > 2 && commonDomain.toLowerCase().includes(domain.toLowerCase());
  });

  return suggestions.slice(0, 3); // Máximo 3 sugestões
};

// Debounced validator para performance
export const createDebouncedEmailValidator = (
  onResult: (result: ValidationResult) => void,
  delay: number = 300
) => {
  let timeoutId: NodeJS.Timeout;

  return (email: string, options: EmailValidationOptions = {}) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const result = validateEmail(email, options);
      onResult(result);
    }, delay);
  };
};