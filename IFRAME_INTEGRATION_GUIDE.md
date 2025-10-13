# Guia de Integração via Iframe - LeadModal

## 📋 Visão Geral

Este guia documenta como integrar o LeadModal do sistema Kanban Touch em aplicações externas usando iframe com autenticação via API key.

## 🔑 Gerando a API Key

### 1. Fazer login no sistema
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "seu@email.com",
  "password": "suasenha"
}
```

Resposta:
```json
{
  "token": "eyJhbGc...",
  "user": { ... },
  "account": {
    "id": "account-uuid-123"
  }
}
```

### 2. Gerar API Key (somente owner/admin)
```bash
POST /api/accounts/{account-id}/api-key
Authorization: Bearer {seu-token-jwt}
```

Resposta:
```json
{
  "message": "API key gerada com sucesso",
  "api_key": "a1b2c3d4e5f6...",
  "warning": "Guarde esta chave em local seguro. Ela não será mostrada novamente."
}
```

⚠️ **IMPORTANTE**: Salve esta API key em local seguro (variáveis de ambiente, vault, etc).

## 🔍 Fluxo de Integração

### Passo 1: Buscar Lead por Telefone

```javascript
const API_KEY = 'sua-api-key-aqui';
const PHONE = '5511999999999';

const response = await fetch(
  `https://seu-dominio.com/api/embed/lead/by-phone?phone=${PHONE}`,
  {
    headers: {
      'x-api-key': API_KEY
    }
  }
);

const lead = await response.json();
console.log(lead);
// {
//   id: "lead-uuid-456",
//   name: "João Silva",
//   phone: "5511999999999",
//   email: "joao@example.com",
//   status: "active",
//   column: { id, name, color },
//   tags: [...],
//   assignedUser: { id, name, email }
// }
```

### Passo 2: Abrir LeadModal em Iframe

```html
<!DOCTYPE html>
<html>
<head>
  <title>Integração LeadModal</title>
</head>
<body>
  <h1>Sistema Externo</h1>
  <button id="openLeadBtn">Abrir Lead</button>

  <div id="modal-container" style="display: none;">
    <iframe
      id="lead-modal-iframe"
      width="100%"
      height="800px"
      frameborder="0">
    </iframe>
  </div>

  <script>
    const API_KEY = 'sua-api-key-aqui';
    const PHONE = '5511999999999';
    const BASE_URL = 'https://seu-dominio.com';

    document.getElementById('openLeadBtn').addEventListener('click', async () => {
      try {
        // 1. Buscar lead por telefone
        const response = await fetch(
          `${BASE_URL}/api/embed/lead/by-phone?phone=${PHONE}`,
          { headers: { 'x-api-key': API_KEY } }
        );

        if (!response.ok) {
          throw new Error('Lead não encontrado');
        }

        const lead = await response.json();

        // 2. Abrir iframe com LeadModal
        const iframe = document.getElementById('lead-modal-iframe');
        iframe.src = `${BASE_URL}/embed/lead-modal/${lead.id}?api_key=${API_KEY}`;

        document.getElementById('modal-container').style.display = 'block';

      } catch (error) {
        console.error('Erro ao abrir lead:', error);
        alert('Erro ao abrir lead: ' + error.message);
      }
    });

    // 3. Escutar eventos do iframe
    window.addEventListener('message', (event) => {
      // Validar origem em produção!
      // if (event.origin !== BASE_URL) return;

      const { type, leadId } = event.data;

      switch (type) {
        case 'lead-modal-closed':
          console.log('Modal fechado');
          document.getElementById('modal-container').style.display = 'none';
          break;

        case 'lead-updated':
          console.log('Lead atualizado:', leadId);
          // Recarregar dados do lead se necessário
          break;

        case 'lead-deleted':
          console.log('Lead deletado:', leadId);
          document.getElementById('modal-container').style.display = 'none';
          // Atualizar lista de leads
          break;
      }
    });
  </script>
</body>
</html>
```

## 🎨 Exemplo React

```tsx
import React, { useState } from 'react';

const API_KEY = process.env.REACT_APP_KANBAN_API_KEY!;
const BASE_URL = 'https://seu-dominio.com';

export const ExternalLeadIntegration: React.FC = () => {
  const [leadId, setLeadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const openLeadModal = async (phone: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/api/embed/lead/by-phone?phone=${phone}`,
        { headers: { 'x-api-key': API_KEY } }
      );

      if (!response.ok) {
        throw new Error('Lead não encontrado');
      }

      const lead = await response.json();
      setLeadId(lead.id);

    } catch (error) {
      console.error('Erro:', error);
      alert('Lead não encontrado');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, leadId: updatedLeadId } = event.data;

      switch (type) {
        case 'lead-modal-closed':
          setLeadId(null);
          break;
        case 'lead-updated':
          console.log('Lead atualizado:', updatedLeadId);
          break;
        case 'lead-deleted':
          setLeadId(null);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div>
      <button onClick={() => openLeadModal('5511999999999')} disabled={loading}>
        {loading ? 'Carregando...' : 'Abrir Lead'}
      </button>

      {leadId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 9999
        }}>
          <iframe
            src={`${BASE_URL}/embed/lead-modal/${leadId}?api_key=${API_KEY}`}
            style={{
              width: '90%',
              height: '90%',
              margin: '5%',
              border: 'none',
              borderRadius: '8px'
            }}
          />
        </div>
      )}
    </div>
  );
};
```

## 🔒 Segurança

### Boas Práticas

1. **Nunca exponha a API key no código frontend**
   - Use variáveis de ambiente
   - Proxy através do seu backend

2. **Valide origem das mensagens postMessage**
```javascript
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://seu-dominio.com') {
    return; // Ignorar mensagens de outras origens
  }
  // Processar mensagem
});
```

3. **Regenere API keys periodicamente**
```bash
POST /api/accounts/{account-id}/api-key
Authorization: Bearer {token}
```

4. **Em produção, restrinja X-Frame-Options**
```typescript
// vite.config.ts
headers: {
  'Content-Security-Policy': "frame-ancestors https://dominio-autorizado.com"
}
```

## 📡 Endpoints Disponíveis

### 1. Buscar Lead por Telefone
```
GET /api/embed/lead/by-phone?phone={phone}
Headers: x-api-key: {sua-api-key}
```

### 2. Validar Lead (usado internamente pelo iframe)
```
GET /api/embed/lead-modal/{leadId}
Headers: x-api-key: {sua-api-key}
```

### 3. Gerar/Regenerar API Key
```
POST /api/accounts/{accountId}/api-key
Headers: Authorization: Bearer {jwt-token}
Permissão: owner ou admin
```

## 🎯 Eventos PostMessage

O iframe envia os seguintes eventos para o sistema externo:

| Evento | Descrição | Payload |
|--------|-----------|---------|
| `lead-modal-closed` | Modal foi fechado | `{ type, leadId }` |
| `lead-updated` | Lead foi atualizado | `{ type, leadId }` |
| `lead-deleted` | Lead foi deletado | `{ type, leadId }` |

## 🐛 Tratamento de Erros

```javascript
try {
  const response = await fetch(`${BASE_URL}/api/embed/lead/by-phone?phone=${phone}`, {
    headers: { 'x-api-key': API_KEY }
  });

  if (response.status === 401) {
    console.error('API key inválida ou expirada');
  } else if (response.status === 404) {
    console.error('Lead não encontrado');
  } else if (!response.ok) {
    console.error('Erro desconhecido:', response.status);
  }

  const lead = await response.json();
  // Processar lead

} catch (error) {
  console.error('Erro de rede:', error);
}
```

## 📝 Notas

- A API key é vinculada à conta (`Account`)
- Apenas leads da mesma conta podem ser acessados
- O LeadModal herda todas as funcionalidades do sistema principal
- Atualizações no código são refletidas automaticamente no iframe
