import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date | number, format: 'short' | 'long' | 'time' | 'datetime' = 'short'): string {
  
  if (!date) {
    console.warn('❌ formatDate received empty/null/undefined value:', date);
    return 'N/A';
  }
  
  let dateObj: Date;
  
  
  if (typeof date === 'number') {
    // Handle Unix timestamp (both seconds and milliseconds)
    console.log('Processing number timestamp:', date);
    if (date < 1e10) {
      // Assume seconds timestamp, convert to milliseconds
      dateObj = new Date(date * 1000);
      console.log('Converted seconds timestamp to date:', dateObj);
    } else {
      // Assume milliseconds timestamp
      dateObj = new Date(date);
      console.log('Used milliseconds timestamp as date:', dateObj);
    }
  } else if (typeof date === 'string') {
    // Handle string timestamp first
    if (/^\d+$/.test(date)) {
      console.log('String contains only digits, treating as timestamp:', date);
      const numTimestamp = parseInt(date, 10);
      if (numTimestamp < 1e10) {
        // Seconds timestamp
        dateObj = new Date(numTimestamp * 1000);
        console.log('Converted string seconds timestamp to date:', dateObj);
      } else {
        // Milliseconds timestamp
        dateObj = new Date(numTimestamp);
        console.log('Used string milliseconds timestamp as date:', dateObj);
      }
    } else {
      // Handle ISO string with timezone info
      let cleanDate = date;
      
      if (date.includes('T')) {
        // Extract just the date and time part without timezone
        cleanDate = date.replace(/[+-]\d{2}:\d{2}$|Z$/, '');
        
        // If it doesn't have a timezone designator, treat as local time
        if (!date.includes('Z') && !date.match(/[+-]\d{2}:\d{2}$/)) {
          dateObj = new Date(cleanDate);
        } else {
          // Parse as ISO string (will be treated as UTC)
          dateObj = new Date(date);
        }
      } else if (date.includes('-') && date.length === 10) {
        // YYYY-MM-DD format - treat as local date
        const [year, month, day] = date.split('-').map(Number);
        dateObj = new Date(year, month - 1, day);
      } else {
        // Try to parse as-is
        dateObj = new Date(date);
      }
    }
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    console.warn('Invalid date type:', typeof date, date);
    return 'Data inválida';
  }
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date after parsing:', date, 'resulted in:', dateObj);
    return 'Data inválida';
  }
  
  if (format === 'time') {
    return dateObj.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  if (format === 'datetime') {
    return dateObj.toLocaleString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  if (format === 'long') {
    return dateObj.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  
  return dateObj.toLocaleDateString('pt-BR');
}

export function formatCurrency(amount: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
  return phoneRegex.test(phone);
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
}
