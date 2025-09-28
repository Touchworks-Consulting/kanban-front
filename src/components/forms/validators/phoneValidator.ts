// Importamos ValidationResult do arquivo de tipos
import type { ValidationResult } from './types';

export interface PhoneValidationOptions {
  required?: boolean;
  allowInternational?: boolean;
}

// DDD válidos do Brasil
const validDDDs = [
  '11', '12', '13', '14', '15', '16', '17', '18', '19', // SP
  '21', '22', '24', // RJ
  '27', '28', // ES
  '31', '32', '33', '34', '35', '37', '38', // MG
  '41', '42', '43', '44', '45', '46', // PR
  '47', '48', '49', // SC
  '51', '53', '54', '55', // RS
  '61', // DF
  '62', '64', // GO
  '63', // TO
  '65', '66', // MT
  '67', // MS
  '68', // AC
  '69', // RO
  '71', '73', '74', '75', '77', // BA
  '79', // SE
  '81', '87', // PE
  '82', // AL
  '83', // PB
  '84', // RN
  '85', '88', // CE
  '86', '89', // PI
  '91', '93', '94', // PA
  '92', '97', // AM
  '95', // RR
  '96', // AP
  '98', '99' // MA
];

export const formatPhoneNumber = (phone: string): string => {
  // Remove tudo que não é dígito
  const numbers = phone.replace(/\D/g, '');

  // Se tem código do país, remove para formatar só o número brasileiro
  let localNumber = numbers;
  if (numbers.startsWith('55') && numbers.length > 11) {
    localNumber = numbers.substring(2);
  }

  // Formata conforme o tamanho
  if (localNumber.length <= 2) {
    return `(${localNumber}`;
  } else if (localNumber.length <= 7) {
    return `(${localNumber.substring(0, 2)}) ${localNumber.substring(2)}`;
  } else if (localNumber.length <= 11) {
    const ddd = localNumber.substring(0, 2);
    const firstPart = localNumber.substring(2, localNumber.length === 11 ? 7 : 6);
    const secondPart = localNumber.substring(localNumber.length === 11 ? 7 : 6);
    return `(${ddd}) ${firstPart}-${secondPart}`;
  }

  return phone; // Retorna original se não conseguir formatar
};

export const validatePhoneNumber = (phone: string, options: PhoneValidationOptions = {}): ValidationResult => {
  const { required = false, allowInternational = true } = options;

  if (!phone || phone.trim() === '') {
    if (required) {
      return {
        isValid: false,
        message: 'Telefone é obrigatório',
        type: 'error'
      };
    }
    return { isValid: true, type: 'success' };
  }

  // Remove formatação
  const numbers = phone.replace(/\D/g, '');

  // Verifica se é internacional (+55...)
  let localNumber = numbers;
  let hasCountryCode = false;

  if (numbers.startsWith('55') && numbers.length > 11) {
    localNumber = numbers.substring(2);
    hasCountryCode = true;
  }

  // Valida tamanho (10 ou 11 dígitos para Brasil)
  if (localNumber.length < 10 || localNumber.length > 11) {
    return {
      isValid: false,
      message: 'Telefone deve ter 10 ou 11 dígitos',
      type: 'error'
    };
  }

  // Valida DDD
  const ddd = localNumber.substring(0, 2);
  if (!validDDDs.includes(ddd)) {
    return {
      isValid: false,
      message: 'DDD inválido',
      type: 'error'
    };
  }

  // Se tem 11 dígitos, o terceiro deve ser 9 (celular)
  if (localNumber.length === 11) {
    const thirdDigit = localNumber.charAt(2);
    if (thirdDigit !== '9') {
      return {
        isValid: false,
        message: 'Para celular (11 dígitos), o terceiro dígito deve ser 9',
        type: 'error'
      };
    }
  }

  return {
    isValid: true,
    message: hasCountryCode ? 'Telefone válido com código do país' : 'Telefone válido',
    type: 'success'
  };
};

export interface PhoneProcessingResult {
  formatted: string;
  validation: ValidationResult;
}

export const processPhoneInput = (input: string, options: PhoneValidationOptions = {}): PhoneProcessingResult => {
  // Remove tudo que não é dígito
  let numbers = input.replace(/\D/g, '');

  // Auto-adiciona +55 se necessário
  if (numbers.length >= 10 && numbers.length <= 11 && !numbers.startsWith('55')) {
    // Verifica se o DDD é válido antes de adicionar +55
    const ddd = numbers.substring(0, 2);
    if (validDDDs.includes(ddd)) {
      numbers = '55' + numbers;
    }
  }

  // Formata o número
  const formatted = formatPhoneNumber(numbers);

  // Valida o resultado
  const validation = validatePhoneNumber(formatted, options);

  return {
    formatted,
    validation
  };
};