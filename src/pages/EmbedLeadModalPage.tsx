import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { LeadModal } from '../components/kanban/LeadModal';
import axios from 'axios';
import { LoadingSpinner } from '../components/LoadingSpinner';

/**
 * Página standalone para renderizar o LeadModal via iframe
 * Autenticação via API key (query param)
 *
 * URL: /embed/lead-modal/:leadId?api_key=xxx
 */
export const EmbedLeadModalPage: React.FC = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const [searchParams] = useSearchParams();
  const apiKey = searchParams.get('api_key');

  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateAccess = async () => {
      if (!leadId) {
        setError('Lead ID não fornecido');
        setIsLoading(false);
        return;
      }

      if (!apiKey) {
        setError('API key não fornecida');
        setIsLoading(false);
        return;
      }

      try {
        // Validar acesso ao lead com a API key
        const response = await axios.get(
          `/api/embed/lead-modal/${leadId}`,
          {
            headers: {
              'x-api-key': apiKey
            }
          }
        );

        if (response.status === 200) {
          setIsValid(true);
        }
      } catch (err: any) {
        console.error('Erro ao validar acesso:', err);
        if (err.response?.status === 401) {
          setError('API key inválida ou expirada');
        } else if (err.response?.status === 404) {
          setError('Lead não encontrado ou não pertence a esta conta');
        } else {
          setError('Erro ao validar acesso ao lead');
        }
      } finally {
        setIsLoading(false);
      }
    };

    validateAccess();
  }, [leadId, apiKey]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-6">
          <h2 className="text-xl font-semibold text-destructive mb-2">
            Acesso Negado
          </h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!isValid || !leadId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Renderizar apenas o LeadModal, sem layout */}
      <LeadModal
        leadId={leadId}
        isOpen={true}
        onClose={() => {
          // Notificar o sistema externo que o modal foi fechado
          window.parent.postMessage({ type: 'lead-modal-closed', leadId }, '*');
        }}
        onUpdate={() => {
          // Notificar o sistema externo que o lead foi atualizado
          window.parent.postMessage({ type: 'lead-updated', leadId }, '*');
        }}
        onDelete={async (deletedLeadId: string) => {
          // Notificar o sistema externo que o lead foi deletado
          window.parent.postMessage({ type: 'lead-deleted', leadId: deletedLeadId }, '*');
        }}
      />
    </div>
  );
};
