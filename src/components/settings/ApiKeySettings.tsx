import React, { useState, useEffect } from 'react';
import { Key, Copy, Eye, EyeOff, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { LoadingSpinner } from '../LoadingSpinner';
import { useAuthStore } from '../../stores/auth';
import { api } from '../../services/api';

interface ApiKeyData {
  apiKey: string | null;
  maskedKey: string | null;
  hasKey: boolean;
}

export const ApiKeySettings: React.FC = () => {
  const { account } = useAuthStore();
  const [apiKeyData, setApiKeyData] = useState<ApiKeyData>({
    apiKey: null,
    maskedKey: null,
    hasKey: false
  });
  const [isRevealed, setIsRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfirmRegenerate, setShowConfirmRegenerate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Buscar API key ao montar
  useEffect(() => {
    fetchApiKey();
  }, []);

  const fetchApiKey = async () => {
    if (!account?.id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/api/accounts/${account.id}/api-key`);
      const { api_key, masked_key, has_key } = response.data;

      setApiKeyData({
        apiKey: api_key,
        maskedKey: masked_key,
        hasKey: has_key
      });
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Conta não tem API key ainda
        setApiKeyData({
          apiKey: null,
          maskedKey: null,
          hasKey: false
        });
      } else {
        setError(err.response?.data?.error || 'Erro ao buscar API key');
      }
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = async () => {
    if (!account?.id) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post(`/api/accounts/${account.id}/api-key`);
      const { api_key } = response.data;

      setApiKeyData({
        apiKey: api_key,
        maskedKey: maskApiKey(api_key),
        hasKey: true
      });

      setSuccess('Chave de API gerada com sucesso!');
      setIsRevealed(true); // Revelar automaticamente após gerar
      setShowConfirmRegenerate(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao gerar API key');
    } finally {
      setLoading(false);
    }
  };

  const maskApiKey = (key: string): string => {
    if (!key || key.length <= 8) return key;
    const lastChars = key.slice(-8);
    return '•'.repeat(key.length - 8) + lastChars;
  };

  const copyToClipboard = async () => {
    if (!apiKeyData.apiKey) return;

    try {
      await navigator.clipboard.writeText(apiKeyData.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Erro ao copiar para área de transferência');
    }
  };

  const toggleReveal = () => {
    setIsRevealed(!isRevealed);
  };

  if (loading && !apiKeyData.hasKey) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-foreground mb-2">Chave de API</h3>
        <p className="text-sm text-muted-foreground">
          Use a chave de API para integrar seu sistema externo com o LeadModal via iframe.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* API Key Display */}
      <div className="border rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">
              {apiKeyData.hasKey ? 'Chave Ativa' : 'Nenhuma Chave Configurada'}
            </span>
          </div>
          {apiKeyData.hasKey && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                Ativa
              </span>
            </div>
          )}
        </div>

        {apiKeyData.hasKey && (
          <>
            <div className="bg-muted rounded-lg p-4 font-mono text-sm break-all">
              {isRevealed ? apiKeyData.apiKey : apiKeyData.maskedKey}
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleReveal}
                className="flex items-center gap-2"
              >
                {isRevealed ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Ocultar
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    Revelar
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmRegenerate(true)}
                className="flex items-center gap-2 text-orange-600 hover:text-orange-700"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerar
              </Button>
            </div>
          </>
        )}

        {!apiKeyData.hasKey && (
          <Button
            onClick={generateApiKey}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading && <LoadingSpinner />}
            <Key className="w-4 h-4" />
            Gerar Chave de API
          </Button>
        )}
      </div>

      {/* Regenerate Confirmation */}
      {showConfirmRegenerate && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <p className="font-medium mb-2">Tem certeza que deseja regenerar a chave?</p>
            <p className="text-sm mb-4">
              A chave anterior será invalidada imediatamente e todos os sistemas externos
              que a utilizam deixarão de funcionar até serem atualizados.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmRegenerate(false)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={generateApiKey}
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {loading && <LoadingSpinner />}
                Sim, Regenerar
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Security Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="font-medium text-yellow-800 mb-2">⚠️ Segurança</p>
        <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
          <li>Nunca exponha sua API key publicamente</li>
          <li>Use variáveis de ambiente em produção</li>
          <li>Faça proxy das requisições pelo seu backend</li>
          <li>Regenere a chave periodicamente por segurança</li>
        </ul>
      </div>
    </div>
  );
};
