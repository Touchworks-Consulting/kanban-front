# 🔐 PLANO DE IMPLEMENTAÇÃO: RECUPERAÇÃO DE SENHA VIA OTP WHATSAPP

## 📋 CONTEXTO

Este documento descreve o plano completo de implementação do sistema de recuperação de senha via OTP WhatsApp e ajustes no cadastro de usuários para incluir telefone obrigatório no projeto Kanban Touch RUN.

**Data de Criação**: 2025-01-10
**Versão**: 1.0
**Estimativa**: 4-5 horas de implementação

---

## 🎯 OBJETIVOS

### Principal
Implementar sistema completo de recuperação de senha utilizando código OTP enviado via WhatsApp através de AWS Lambda existente.

### Secundários
1. ✅ Adicionar campo telefone obrigatório no cadastro de usuários
2. ✅ Validar telefone em formato internacional (+55)
3. ✅ Integrar com Lambda AWS existente para envio/validação de OTP
4. ✅ Criar páginas de UI para fluxo de recuperação
5. ✅ Atualizar modelos do banco de dados

---

## 📦 INFRAESTRUTURA EXISTENTE

### AWS Lambda OTP (JÁ IMPLEMENTADA)
- **Endpoint**: `https://dg1s6ify35.execute-api.us-east-1.amazonaws.com/default/request-validate-otp-whatsapp`
- **Tecnologia**: Python (boto3, DynamoDB, WhatsApp Business API)
- **Funcionalidades**:
  - Envio de OTP via WhatsApp
  - Envio de OTP via Email (SQS)
  - Validação de OTP
  - Expiração de 10 minutos
  - Armazenamento no DynamoDB

### Endpoints da Lambda

#### 1. Enviar OTP
```json
POST /default/request-validate-otp-whatsapp
{
  "action": "send",
  "phone_number": "+5511999999999"
}

Response Success:
{
  "message": "OTP enviado com sucesso.",
  "OTP_code": "OTP_507"
}
```

#### 2. Validar OTP
```json
POST /default/request-validate-otp-whatsapp
{
  "action": "validate",
  "phone_number": "+5511999999999",
  "otp": "123456"
}

Response Success:
{
  "message": "OTP validado com sucesso.",
  "OTP_code": "OTP_512"
}

Response Error (OTP Inválido):
{
  "message": "OTP inválido ou expirado.",
  "OTP_code": "OTP_511"
}
```

### Códigos de Resposta Lambda
- `OTP_507`: OTP enviado com sucesso
- `OTP_512`: OTP validado com sucesso
- `OTP_511`: OTP inválido ou expirado
- `OTP_510`: Nenhum OTP encontrado para o telefone
- `OTP_500-506`: Erros diversos (JSON inválido, parâmetros faltando, etc.)

---

## 🗄️ PARTE 1: BANCO DE DADOS

### 1.1 Migration: Adicionar Phone ao Account

**Arquivo**: `kanban-touch/src/database/migrations/YYYY-MM-DD-add-phone-to-accounts.js`

```javascript
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Account', 'phone', {
      type: Sequelize.STRING,
      allowNull: true, // Começar como opcional para não quebrar dados existentes
      unique: false
    });

    // Adicionar índice para busca rápida
    await queryInterface.addIndex('Account', ['phone'], {
      name: 'idx_account_phone'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex('Account', 'idx_account_phone');
    await queryInterface.removeColumn('Account', 'phone');
  }
};
```

### 1.2 Migration: Adicionar Phone ao User

**Arquivo**: `kanban-touch/src/database/migrations/YYYY-MM-DD-add-phone-to-users.js`

```javascript
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'phone', {
      type: Sequelize.STRING,
      allowNull: true, // Começar como opcional
      unique: false
    });

    // Adicionar índice
    await queryInterface.addIndex('users', ['phone'], {
      name: 'idx_user_phone'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex('users', 'idx_user_phone');
    await queryInterface.removeColumn('users', 'phone');
  }
};
```

### 1.3 Atualizar Model Account

**Arquivo**: `kanban-touch/src/models/Account.js`

**Localização**: Adicionar após o campo `email` (linha ~22)

```javascript
phone: {
  type: DataTypes.STRING,
  allowNull: true,
  validate: {
    is: /^\+?[1-9]\d{1,14}$/ // E.164 format
  }
},
```

### 1.4 Atualizar Model User

**Arquivo**: `kanban-touch/src/models/User.js`

**Localização**: Adicionar após o campo `email` (linha ~23)

```javascript
phone: {
  type: DataTypes.STRING,
  allowNull: true, // Mudar para false após migração completa
  validate: {
    is: /^\+?[1-9]\d{1,14}$/ // E.164 format
  }
},
```

---

## ⚙️ PARTE 2: BACKEND

### 2.1 Novo Service: OTPService.js

**Arquivo**: `kanban-touch/src/services/OTPService.js`

```javascript
const axios = require('axios');

const OTP_LAMBDA_URL = 'https://dg1s6ify35.execute-api.us-east-1.amazonaws.com/default/request-validate-otp-whatsapp';

class OTPService {
  /**
   * Envia OTP via WhatsApp
   * @param {string} phoneNumber - Formato: +5511999999999
   * @returns {Promise<{success: boolean, message: string, code?: string}>}
   */
  static async sendOTP(phoneNumber) {
    try {
      const response = await axios.post(OTP_LAMBDA_URL, {
        action: 'send',
        phone_number: phoneNumber
      });

      if (response.data.OTP_code === 'OTP_507') {
        return { success: true, message: 'OTP enviado com sucesso' };
      }

      return { success: false, message: 'Erro ao enviar OTP' };
    } catch (error) {
      console.error('OTP Send Error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao enviar OTP'
      };
    }
  }

  /**
   * Valida OTP
   * @param {string} phoneNumber - Formato: +5511999999999
   * @param {string} otp - Código de 6 dígitos
   * @returns {Promise<{success: boolean, message: string}>}
   */
  static async validateOTP(phoneNumber, otp) {
    try {
      const response = await axios.post(OTP_LAMBDA_URL, {
        action: 'validate',
        phone_number: phoneNumber,
        otp: otp
      });

      if (response.data.OTP_code === 'OTP_512') {
        return { success: true, message: 'OTP validado com sucesso' };
      }

      return { success: false, message: 'OTP inválido ou expirado' };
    } catch (error) {
      console.error('OTP Validation Error:', error);

      // Tratar códigos de erro específicos
      const otpCode = error.response?.data?.OTP_code;

      if (otpCode === 'OTP_511') {
        return { success: false, message: 'OTP inválido ou expirado' };
      }
      if (otpCode === 'OTP_510') {
        return { success: false, message: 'Nenhum OTP encontrado para esse telefone' };
      }

      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao validar OTP'
      };
    }
  }
}

module.exports = OTPService;
```

### 2.2 Novo Controller: passwordResetController.js

**Arquivo**: `kanban-touch/src/controllers/passwordResetController.js`

```javascript
const { Account, User } = require('../models');
const OTPService = require('../services/OTPService');

/**
 * POST /api/auth/forgot-password
 * Envia OTP via WhatsApp para recuperação de senha
 */
const forgotPassword = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Telefone é obrigatório'
      });
    }

    // Normalizar telefone (remover espaços, adicionar +55 se necessário)
    const normalizedPhone = normalizePhone(phone);

    // Verificar se telefone existe no sistema (Account ou User)
    const user = await User.findOne({ where: { phone: normalizedPhone } });
    const account = await Account.findOne({ where: { phone: normalizedPhone } });

    // IMPORTANTE: Não revelar se telefone existe ou não (segurança)
    // Sempre retorna sucesso mesmo se não encontrar

    if (user || account) {
      // Enviar OTP apenas se telefone existe
      const result = await OTPService.sendOTP(normalizedPhone);

      if (!result.success) {
        console.error('Erro ao enviar OTP:', result.message);
        // Não revelar erro ao usuário
      }
    }

    // Sempre retorna a mesma mensagem
    return res.json({
      success: true,
      message: 'Se esse telefone estiver cadastrado, você receberá um código via WhatsApp'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * POST /api/auth/reset-password
 * Valida OTP e redefine senha
 */
const resetPassword = async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;

    if (!phone || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Telefone, OTP e nova senha são obrigatórios'
      });
    }

    // Validar força da senha
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Senha deve ter no mínimo 6 caracteres'
      });
    }

    const normalizedPhone = normalizePhone(phone);

    // 1. Validar OTP
    const otpValidation = await OTPService.validateOTP(normalizedPhone, otp);

    if (!otpValidation.success) {
      return res.status(401).json({
        success: false,
        message: otpValidation.message
      });
    }

    // 2. Buscar usuário pelo telefone
    let user = await User.findOne({ where: { phone: normalizedPhone } });

    if (!user) {
      // Buscar por Account (modelo antigo)
      const account = await Account.findOne({ where: { phone: normalizedPhone } });

      if (account) {
        // Atualizar senha da Account
        account.password = newPassword;
        await account.save();

        return res.json({
          success: true,
          message: 'Senha redefinida com sucesso'
        });
      }

      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // 3. Atualizar senha do usuário
    user.password = newPassword;
    await user.save();

    // 4. Log da atividade (opcional)
    console.log(`Senha redefinida para usuário: ${user.email}`);

    return res.json({
      success: true,
      message: 'Senha redefinida com sucesso'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * POST /api/auth/verify-otp
 * Apenas valida OTP sem redefinir senha (para UI)
 */
const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Telefone e OTP são obrigatórios'
      });
    }

    const normalizedPhone = normalizePhone(phone);
    const result = await OTPService.validateOTP(normalizedPhone, otp);

    if (result.success) {
      return res.json({ success: true, message: 'OTP válido' });
    }

    return res.status(401).json({
      success: false,
      message: result.message
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Helper para normalizar telefone
function normalizePhone(phone) {
  // Remove espaços, traços, parênteses
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');

  // Adiciona +55 se não tiver código do país
  if (!cleaned.startsWith('+')) {
    cleaned = '+55' + cleaned;
  }

  return cleaned;
}

module.exports = {
  forgotPassword,
  resetPassword,
  verifyOTP
};
```

### 2.3 Atualizar authController.js

**Arquivo**: `kanban-touch/src/controllers/authController.js`

**Modificações no método `register`**:

1. Adicionar `phone` aos parâmetros extraídos (linha ~89):
```javascript
const { email, password, name, accountName, domain, phone } = req.body;
```

2. Adicionar validação de phone (linha ~92):
```javascript
if (!email || !password || !name || !phone) {
  return res.status(400).json({
    success: false,
    message: 'Email, senha, nome e telefone são obrigatórios'
  });
}
```

3. Adicionar validação e normalização de telefone (após linha ~103):
```javascript
// Validar formato do telefone
const normalizedPhone = normalizePhone(phone);
if (!isValidPhone(normalizedPhone)) {
  return res.status(400).json({
    success: false,
    message: 'Telefone inválido. Use formato +5511999999999'
  });
}

// Verificar se telefone já existe
const existingPhone = await User.findOne({ where: { phone: normalizedPhone } });
if (existingPhone) {
  return res.status(400).json({
    success: false,
    message: 'Telefone já cadastrado'
  });
}
```

4. Adicionar phone ao criar Account (linha ~115):
```javascript
const account = await Account.create({
  name: accountName || name || email.split('@')[0],
  email,
  phone: normalizedPhone, // ← ADICIONAR
  is_active: true,
  settings: { domain: domain || null }
});
```

5. Adicionar phone ao criar User (linha ~119):
```javascript
const user = await User.create({
  account_id: account.id,
  name,
  email,
  password,
  phone: normalizedPhone, // ← ADICIONAR
  role: 'owner',
  current_account_id: account.id
});
```

6. Adicionar helper functions no final do arquivo:
```javascript
// Helper functions
function normalizePhone(phone) {
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (!cleaned.startsWith('+')) {
    cleaned = '+55' + cleaned;
  }
  return cleaned;
}

function isValidPhone(phone) {
  // E.164 format: +[country code][number]
  return /^\+?[1-9]\d{1,14}$/.test(phone);
}
```

### 2.4 Atualizar authRoutes.js

**Arquivo**: `kanban-touch/src/routes/authRoutes.js`

**Adicionar no início**:
```javascript
const passwordResetController = require('../controllers/passwordResetController');
```

**Adicionar rotas (antes do `module.exports`)**:
```javascript
// Recuperação de senha
router.post('/forgot-password', passwordResetController.forgotPassword);
router.post('/reset-password', passwordResetController.resetPassword);
router.post('/verify-otp', passwordResetController.verifyOTP);
```

---

## 🎨 PARTE 3: FRONTEND

### 3.1 Novo Service: otpService.ts

**Arquivo**: `kanban-touch-front/src/services/otpService.ts`

```typescript
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
  }
};
```

### 3.2 Novo Componente: PhoneInput.tsx

**Arquivo**: `kanban-touch-front/src/components/forms/PhoneInput.tsx`

```typescript
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useState, useEffect } from 'react';

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
  id = 'phone',
  label = 'Telefone (WhatsApp)'
}: PhoneInputProps) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatted = formatPhone(input);
    setDisplayValue(formatted);

    // Retorna apenas números com +55
    const numbers = input.replace(/\D/g, '');
    onChange(numbers.length > 0 ? `+55${numbers}` : '');
  };

  return (
    <div className="grid gap-2">
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <Input
        id={id}
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
```

### 3.3 Nova Página: ForgotPasswordPage.tsx

**Arquivo**: `kanban-touch-front/src/pages/ForgotPasswordPage.tsx`

```typescript
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { PhoneInput } from '../components/forms/PhoneInput';
import { otpService } from '../services/otpService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { CheckCircle2 } from 'lucide-react';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone || phone.length < 13) {
      setError('Telefone inválido');
      return;
    }

    setLoading(true);

    try {
      const result = await otpService.requestPasswordReset(phone);

      if (result.success) {
        setSent(true);
        // Redirecionar para página de validação OTP após 2 segundos
        setTimeout(() => {
          navigate('/reset-password', { state: { phone } });
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao enviar código');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Código Enviado!</h2>
            <p className="text-muted-foreground mb-4">
              Enviamos um código de 6 dígitos para o WhatsApp:
            </p>
            <p className="font-mono text-lg font-bold mb-6">
              {phone}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              O código expira em 10 minutos.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecionando...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <img src="/logo.svg" alt="Touch RUN" className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Recuperar Senha</h1>
            </div>
            <p className="text-muted-foreground">
              Digite seu telefone para receber um código via WhatsApp
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-destructive/15 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <PhoneInput
              value={phone}
              onChange={setPhone}
              required
              disabled={loading}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !phone}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Enviando código...
                </>
              ) : (
                'Enviar Código'
              )}
            </Button>

            <div className="text-center text-sm">
              <Link
                to="/login"
                className="text-primary hover:underline"
              >
                ← Voltar para o login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 3.4 Nova Página: ResetPasswordPage.tsx

**Arquivo**: `kanban-touch-front/src/pages/ResetPasswordPage.tsx`

```typescript
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { otpService } from '../services/otpService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone || '';

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!phone) {
      navigate('/forgot-password');
    }
  }, [phone, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações
    if (otp.length !== 6) {
      setError('Código deve ter 6 dígitos');
      return;
    }

    if (newPassword.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      const result = await otpService.resetPassword(phone, otp, newPassword);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao redefinir senha');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Senha Redefinida!</h2>
            <p className="text-muted-foreground mb-6">
              Sua senha foi alterada com sucesso.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecionando para o login...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <img src="/logo.svg" alt="Touch RUN" className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Nova Senha</h1>
            </div>
            <p className="text-muted-foreground mb-2">
              Digite o código recebido via WhatsApp
            </p>
            <p className="text-sm font-mono text-primary">
              {phone}
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-destructive/15 px-3 py-2 text-sm text-destructive flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="otp">Código de Verificação</Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                required
                disabled={loading}
                className="text-center text-2xl font-mono tracking-widest"
              />
              <p className="text-xs text-muted-foreground">
                Digite o código de 6 dígitos
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Digite a senha novamente"
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !otp || !newPassword || !confirmPassword}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Redefinindo...
                </>
              ) : (
                'Redefinir Senha'
              )}
            </Button>

            <div className="text-center text-sm space-y-2">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-primary hover:underline block w-full"
              >
                Não recebeu o código? Reenviar
              </button>
              <Link
                to="/login"
                className="text-muted-foreground hover:text-primary block"
              >
                ← Voltar para o login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 3.5 Atualizar RegisterPage.tsx

**Arquivo**: `kanban-touch-front/src/pages/RegisterPage.tsx`

**Modificações**:

1. Importar PhoneInput (no topo):
```typescript
import { PhoneInput } from '../components/forms/PhoneInput';
```

2. Adicionar phone ao estado (linha ~12):
```typescript
const [form, setForm] = useState({
  name: '',
  email: '',
  password: '',
  accountName: '',
  phone: '' // ← ADICIONAR
});
```

3. Atualizar validação (linha ~24):
```typescript
if (!form.email || !form.password || !form.name || !form.phone) return;
```

4. Adicionar campo PhoneInput no formulário (após accountName, linha ~113):
```typescript
<PhoneInput
  id="phone"
  value={form.phone}
  onChange={(value) => setForm(f => ({ ...f, phone: value }))}
  required
  disabled={isLoading}
/>
```

### 3.6 Atualizar login-form.tsx

**Arquivo**: `kanban-touch-front/src/components/login-form.tsx`

**Modificação**: Adicionar link "Esqueceu sua senha?" (linha ~78):

```typescript
<div className="grid gap-2">
  <div className="flex items-center justify-between">
    <Label htmlFor="password">Senha</Label>
    <Link
      to="/forgot-password"
      className="text-xs text-primary hover:underline"
    >
      Esqueceu sua senha?
    </Link>
  </div>
  <Input
    id="password"
    name="password"
    type="password"
    placeholder="Sua senha"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    autoComplete="current-password"
    required
    disabled={isLoading}
  />
</div>
```

### 3.7 Atualizar App.tsx

**Arquivo**: `kanban-touch-front/src/App.tsx`

**Modificações**:

1. Importar páginas (no topo):
```typescript
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
```

2. Adicionar rotas públicas (após as rotas de login/register, linha ~112):
```typescript
<Route path="/forgot-password" element={<ForgotPasswordPage />} />
<Route path="/reset-password" element={<ResetPasswordPage />} />
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### **Fase 1: Banco de Dados (30 min)**
- [ ] Criar migration `YYYY-MM-DD-add-phone-to-accounts.js`
- [ ] Criar migration `YYYY-MM-DD-add-phone-to-users.js`
- [ ] Executar migrations: `cd kanban-touch && npx sequelize-cli db:migrate`
- [ ] Atualizar `src/models/Account.js` - adicionar campo phone
- [ ] Atualizar `src/models/User.js` - adicionar campo phone
- [ ] Testar conexão ao banco

### **Fase 2: Backend - Serviços (1h)**
- [ ] Criar `src/services/OTPService.js`
- [ ] Testar integração com Lambda AWS (Postman)
- [ ] Criar `src/controllers/passwordResetController.js`
- [ ] Atualizar `src/controllers/authController.js`
- [ ] Atualizar `src/routes/authRoutes.js`
- [ ] Testar todos os endpoints:
  - [ ] POST /api/auth/forgot-password
  - [ ] POST /api/auth/reset-password
  - [ ] POST /api/auth/verify-otp
  - [ ] POST /api/auth/register (com phone)

### **Fase 3: Frontend - Componentes (2h)**
- [ ] Criar `src/components/forms/PhoneInput.tsx`
- [ ] Criar `src/services/otpService.ts`
- [ ] Criar `src/pages/ForgotPasswordPage.tsx`
- [ ] Criar `src/pages/ResetPasswordPage.tsx`
- [ ] Atualizar `src/pages/RegisterPage.tsx`
- [ ] Atualizar `src/components/login-form.tsx`
- [ ] Atualizar `src/App.tsx`

### **Fase 4: Testes E2E (1h)**
- [ ] Testar cadastro com telefone
- [ ] Testar validação de telefone inválido
- [ ] Testar telefone duplicado
- [ ] Testar fluxo "Esqueci minha senha" completo
- [ ] Verificar recebimento de OTP via WhatsApp
- [ ] Testar OTP válido
- [ ] Testar OTP inválido/expirado
- [ ] Testar redefinição de senha
- [ ] Testar login com nova senha

### **Fase 5: Deploy (30 min)**
- [ ] Executar migrations em produção
- [ ] Deploy backend (Vercel)
- [ ] Deploy frontend (Vercel)
- [ ] Testar em produção
- [ ] Monitorar logs

---

## 📊 RESUMO DE ARQUIVOS

### **BACKEND (8 arquivos)**

#### **NOVOS (4)**
1. `kanban-touch/src/services/OTPService.js`
2. `kanban-touch/src/controllers/passwordResetController.js`
3. `kanban-touch/src/database/migrations/YYYY-MM-DD-add-phone-to-accounts.js`
4. `kanban-touch/src/database/migrations/YYYY-MM-DD-add-phone-to-users.js`

#### **MODIFICADOS (4)**
1. `kanban-touch/src/models/Account.js`
2. `kanban-touch/src/models/User.js`
3. `kanban-touch/src/controllers/authController.js`
4. `kanban-touch/src/routes/authRoutes.js`

### **FRONTEND (7 arquivos)**

#### **NOVOS (4)**
1. `kanban-touch-front/src/services/otpService.ts`
2. `kanban-touch-front/src/components/forms/PhoneInput.tsx`
3. `kanban-touch-front/src/pages/ForgotPasswordPage.tsx`
4. `kanban-touch-front/src/pages/ResetPasswordPage.tsx`

#### **MODIFICADOS (3)**
1. `kanban-touch-front/src/pages/RegisterPage.tsx`
2. `kanban-touch-front/src/components/login-form.tsx`
3. `kanban-touch-front/src/App.tsx`

---

## 🚀 PROMPT PARA AGENTE

```
Implemente o sistema completo de recuperação de senha via OTP WhatsApp e adicione telefone obrigatório no cadastro de usuários, seguindo exatamente o plano detalhado no arquivo IMPLEMENTATION_PLAN_PASSWORD_RESET_OTP.md.

IMPORTANTE:
1. Siga a ordem das fases do checklist
2. Use os códigos fornecidos sem alterações
3. Teste cada endpoint após implementação
4. Valide formato de telefone (+5511999999999)
5. Integre com Lambda AWS existente
6. Mantenha segurança (não revelar se telefone existe)
7. Adicione logs apropriados

Comece pela Fase 1 (Banco de Dados) e execute todas as etapas do checklist sequencialmente.
```

---

## 🔐 SEGURANÇA

### Práticas Implementadas
1. ✅ Não revelar se telefone existe (sempre retorna sucesso)
2. ✅ Token OTP expira em 10 minutos (Lambda)
3. ✅ OTP de uso único (DynamoDB)
4. ✅ Validação de formato de telefone (E.164)
5. ✅ Senha mínima de 6 caracteres
6. ✅ Hash de senha com bcrypt (models)
7. ✅ Logs de atividades críticas

---

## 📝 NOTAS TÉCNICAS

### Formato de Telefone
- **Input do usuário**: `(11) 99999-9999`
- **Armazenado no banco**: `+5511999999999`
- **Enviado para Lambda**: `+5511999999999`
- **Validação**: Regex E.164 `/^\+?[1-9]\d{1,14}$/`

### Fluxo de OTP
1. Usuário digita telefone
2. Backend normaliza (+55) e busca no DB
3. Se existe, chama Lambda AWS (action: send)
4. Lambda envia OTP via WhatsApp Business API
5. Usuário recebe código e digita
6. Backend valida com Lambda (action: validate)
7. Lambda consulta DynamoDB
8. Se válido, backend permite redefinir senha

### Tratamento de Erros
- **OTP_507**: Sucesso no envio
- **OTP_512**: OTP válido
- **OTP_511**: OTP inválido/expirado
- **OTP_510**: Telefone não encontrado
- **Network errors**: Tratados com try/catch

---

## ⏱️ ESTIMATIVA TOTAL

**4-5 horas** de implementação completa

- Fase 1 (DB): 30 min
- Fase 2 (Backend): 1h
- Fase 3 (Frontend): 2h
- Fase 4 (Testes): 1h
- Fase 5 (Deploy): 30 min

---

**Documento criado em**: 2025-01-10
**Autor**: Claude Code Assistant
**Versão**: 1.0
**Status**: Pronto para implementação ✅
