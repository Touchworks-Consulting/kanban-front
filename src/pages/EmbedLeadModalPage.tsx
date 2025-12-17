import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { LeadModal } from "../components/kanban/LeadModal";
import { CreateLeadModal } from "../components/kanban/CreateLeadModal";
import axios from "axios";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Button } from "../components/ui/button";
import { UserPlus, Phone } from "lucide-react";
import type { CreateLeadDto } from "../types";

/**
 * Página standalone para renderizar o LeadModal via iframe
 * Autenticação via API key (query param)
 *
 * URL: /embed/lead-modal/:leadId?api_key=xxx
 * URL (criar): /embed/lead-modal/new?api_key=xxx&phone=5511999999999
 */
export const EmbedLeadModalPage: React.FC = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const [searchParams] = useSearchParams();
  const apiKey = searchParams.get("api_key");
  const phoneParam = searchParams.get("phone");
  const theme = searchParams.get("theme"); // 'dark' ou 'light'

  // Aplicar tema IMEDIATAMENTE antes de qualquer renderização
  if (theme) {
    const html = document.documentElement;
    html.classList.remove("light", "dark");
    html.classList.add(theme);
    html.style.colorScheme = theme;
  }

  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leadNotFound, setLeadNotFound] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createdLeadId, setCreatedLeadId] = useState<string | null>(null);

  // Modo "criar novo lead" quando leadId === 'new'
  const isCreateMode = leadId === "new";

  useEffect(() => {
    const validateAccess = async () => {
      if (!apiKey) {
        setError("API key não fornecida");
        setIsLoading(false);
        return;
      }

      // Se for modo de criação, apenas validar API key sem validar leadId
      if (isCreateMode) {
        setIsValid(true);
        setShowCreateModal(true);
        setIsLoading(false);
        return;
      }

      if (!leadId) {
        setError("Lead ID não fornecido");
        setIsLoading(false);
        return;
      }

      try {
        // Validar acesso ao lead com a API key
        const response = await axios.get(`/api/embed/lead-modal/${leadId}`, {
          headers: {
            "x-api-key": apiKey,
          },
        });

        if (response.status === 200) {
          setIsValid(true);
        }
      } catch (err: any) {
        console.error("Erro ao validar acesso:", err);
        if (err.response?.status === 401) {
          setError("API key inválida ou expirada");
        } else if (err.response?.status === 404) {
          // Lead não encontrado - oferecer opção de criar
          setLeadNotFound(true);
        } else {
          setError("Erro ao validar acesso ao lead");
        }
      } finally {
        setIsLoading(false);
      }
    };

    validateAccess();
  }, [leadId, apiKey, isCreateMode]);

  // Handler para criar lead via API embed
  const handleCreateLead = async (data: CreateLeadDto) => {
    if (!apiKey) {
      throw new Error("API key não disponível");
    }

    try {
      const response = await axios.post("/api/embed/lead", data, {
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
      });

      const newLead = response.data;
      setCreatedLeadId(newLead.id);
      setShowCreateModal(false);
      setIsValid(true);
      setLeadNotFound(false);

      // Notificar sistema externo
      window.parent.postMessage(
        {
          type: "lead-created",
          leadId: newLead.id,
          lead: newLead,
        },
        "*"
      );
    } catch (error: any) {
      console.error("Erro ao criar lead:", error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div
        key={theme}
        className="min-h-screen flex items-center justify-center bg-background"
      >
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div
        key={theme}
        className="min-h-screen flex items-center justify-center bg-background"
      >
        <div className="text-center p-6">
          <h2 className="text-xl font-semibold text-destructive mb-2">
            Acesso Negado
          </h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  // Lead não encontrado - mostrar opção de criar
  if (leadNotFound) {
    return (
      <div
        key={theme}
        className="min-h-screen flex items-center justify-center bg-background p-4"
      >
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Lead não encontrado
          </h2>
          <p className="text-muted-foreground mb-6">
            {phoneParam
              ? `Não encontramos nenhum lead com o telefone ${phoneParam}.`
              : "O lead que você está procurando não existe ou não pertence a esta conta."}
          </p>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto"
            size="lg"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Criar Novo Lead
          </Button>

          {/* Modal de criação */}
          <CreateLeadModal
            isOpen={showCreateModal}
            onClose={() => {
              setShowCreateModal(false);
              // Notificar sistema externo que modal foi fechado sem criar
              window.parent.postMessage({ type: "lead-modal-closed" }, "*");
            }}
            onSubmit={handleCreateLead}
            initialPhone={phoneParam || undefined}
          />
        </div>
      </div>
    );
  }

  // Se criou um lead, mostrar o LeadModal do lead criado
  const displayLeadId = createdLeadId || leadId;

  if (!isValid || !displayLeadId || displayLeadId === "new") {
    // Modo criar - apenas mostrar modal
    return (
      <div
        key={theme}
        className="min-h-screen"
        style={{ background: "transparent" }}
      >
        <CreateLeadModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            window.parent.postMessage({ type: "lead-modal-closed" }, "*");
          }}
          onSubmit={handleCreateLead}
          initialPhone={phoneParam || undefined}
          isEmbed={true}
        />
      </div>
    );
  }

  return (
    <div key={theme} className="min-h-screen bg-background">
      {/* Renderizar apenas o LeadModal, sem layout */}
      <LeadModal
        leadId={displayLeadId}
        isOpen={true}
        isEmbed={true}
        onClose={() => {
          // Notificar o sistema externo que o modal foi fechado
          window.parent.postMessage(
            { type: "lead-modal-closed", leadId: displayLeadId },
            "*"
          );
        }}
        onUpdate={() => {
          // Notificar o sistema externo que o lead foi atualizado
          window.parent.postMessage(
            { type: "lead-updated", leadId: displayLeadId },
            "*"
          );
        }}
        onDelete={async (deletedLeadId: string) => {
          // Notificar o sistema externo que o lead foi deletado
          window.parent.postMessage(
            { type: "lead-deleted", leadId: deletedLeadId },
            "*"
          );
          await axios.delete(`/api/leads/${deletedLeadId}`, {
            headers: { "x-api-key": apiKey },
          });
        }}
      />
    </div>
  );
};
