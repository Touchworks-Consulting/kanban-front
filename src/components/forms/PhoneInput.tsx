import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useState, useEffect, useId } from 'react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  label?: string;
}

export function PhoneInput({
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  id,
  label = 'Telefone (WhatsApp)'
}: PhoneInputProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const uniqueId = useId();
  const inputId = id || `phone-${uniqueId}`;

  const formatPhone = (phone: string) => {
    // Remove tudo exceto números
    const cleaned = phone.replace(/\D/g, '');

    // Formata: (11) 99999-9999
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    if (cleaned.length <= 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }

    // Limita a 11 dígitos
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
  };

  useEffect(() => {
    // Se o value vem com +55, remove para exibir apenas os números formatados
    if (value.startsWith('+55')) {
      const numbers = value.slice(3);
      setDisplayValue(formatPhone(numbers));
    } else {
      setDisplayValue(value);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatted = formatPhone(input);
    setDisplayValue(formatted);

    // Retorna apenas números com +55 (só adiciona se não tiver)
    const numbers = input.replace(/\D/g, '');
    if (numbers.length > 0) {
      const phone = numbers.length <= 11 ? `+55${numbers}` : `+55${numbers.slice(0, 11)}`;
      onChange(phone);
    } else {
      onChange('');
    }
  };

  return (
    <div className="grid gap-2">
      {label && (
        <Label htmlFor={inputId}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <Input
        id={inputId}
        type="tel"
        value={displayValue}
        onChange={handleChange}
        placeholder="(11) 99999-9999"
        required={required}
        disabled={disabled}
        autoComplete="tel"
        className={error ? 'border-destructive' : ''}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <p className="text-xs text-muted-foreground">
        Digite seu telefone com DDD (apenas números)
      </p>
    </div>
  );
}