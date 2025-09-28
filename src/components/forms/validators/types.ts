export interface ValidationResult {
  isValid: boolean;
  message?: string;
  type: 'error' | 'success' | 'warning';
}