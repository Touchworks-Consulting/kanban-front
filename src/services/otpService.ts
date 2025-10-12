import api from './api';

export interface OTPResponse {
  success: boolean;
  message: string;
}

export const otpService = {
  /**
   * Solicita envio de OTP para recuperação de senha
   */
  async requestPasswordReset(phone: string): Promise<OTPResponse> {
    const response = await api.post('/api/auth/forgot-password', { phone });
    return response.data;
  },

  /**
   * Valida OTP e redefine senha
   */
  async resetPassword(phone: string, otp: string, newPassword: string): Promise<OTPResponse> {
    const response = await api.post('/api/auth/reset-password', {
      phone,
      otp,
      newPassword
    });
    return response.data;
  },

  /**
   * Valida OTP sem redefinir senha (para UI feedback)
   */
  async verifyOTP(phone: string, otp: string): Promise<OTPResponse> {
    const response = await api.post('/api/auth/verify-otp', {
      phone,
      otp
    });
    return response.data;
  },

  /**
   * Verifica telefone do usuário atual via OTP
   */
  async verifyPhone(phone: string, otp: string): Promise<{ success: boolean; message: string; user?: any }> {
    const response = await api.put('/api/users/verify-phone', {
      phone,
      otp
    });
    return response.data;
  },

  /**
   * Solicita OTP para verificação de telefone (endpoint específico)
   */
  async requestPhoneVerification(phone: string): Promise<OTPResponse> {
    const response = await api.post('/api/users/request-phone-verification', { phone });
    return response.data;
  }
};