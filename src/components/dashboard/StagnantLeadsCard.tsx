import React from 'react';
import { AlertTriangle, Calendar, Phone, Mail, DollarSign, ExternalLink } from 'lucide-react';

// Interface para lead estagnado
interface StagnantLead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  value?: number;
  daysSinceUpdate: number;
  column: {
    id?: string;
    name?: string;
    color?: string;
  };
  updated_at: string;
}

interface StagnantLeadsCardProps {
  leads: StagnantLead[];
  threshold: number;
  className?: string;
  onLeadClick?: (leadId: string) => void;
}

// Componente para badge de dias estagnado
const DaysStagnantBadge: React.FC<{ days: number }> = ({ days }) => {
  const getColorClass = (days: number) => {
    if (days >= 30) return 'bg-red-100 text-red-800 border-red-200';
    if (days >= 14) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (days >= 7) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const formatDays = (days: number) => {
    if (days < 7) return `${days}d`;
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      const remainingDays = days % 7;
      if (remainingDays === 0) return `${weeks}sem`;
      return `${weeks}sem ${remainingDays}d`;
    }
    const months = Math.floor(days / 30);
    return `${months}mês${months > 1 ? 'es' : ''}`;
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getColorClass(days)}`}>
      <Calendar className="w-3 h-3 mr-1" />
      {formatDays(days)}
    </span>
  );
};

// Componente para informações de contato
const ContactInfo: React.FC<{ lead: StagnantLead }> = ({ lead }) => {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {lead.phone && (
        <div className="flex items-center gap-1">
          <Phone className="w-3 h-3" />
          <span>{lead.phone}</span>
        </div>
      )}
      {lead.email && (
        <div className="flex items-center gap-1">
          <Mail className="w-3 h-3" />
          <span className="max-w-32 truncate">{lead.email}</span>
        </div>
      )}
      {lead.value && lead.value > 0 && (
        <div className="flex items-center gap-1 text-green-600">
          <DollarSign className="w-3 h-3" />
          <span>R$ {lead.value.toLocaleString('pt-BR')}</span>
        </div>
      )}
    </div>
  );
};

export const StagnantLeadsCard: React.FC<StagnantLeadsCardProps> = ({
  leads,
  threshold,
  className = "",
  onLeadClick
}) => {
  if (!leads || leads.length === 0) {
    return (
      <div className={`bg-card rounded-lg border p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-green-500" />
          <h3 className="font-semibold text-card-foreground">Leads Estagnados</h3>
        </div>

        <div className="text-center py-6 text-muted-foreground">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium text-green-600">Tudo em dia! 🎉</p>
          <p className="text-xs mt-1">
            Nenhum lead parado há mais de {threshold} dias
          </p>
        </div>
      </div>
    );
  }

  // Ordenar leads por dias estagnado (maior primeiro)
  const sortedLeads = [...leads].sort((a, b) => b.daysSinceUpdate - a.daysSinceUpdate);

  return (
    <div className={`bg-card rounded-lg border p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-500" />
          <h3 className="font-semibold text-card-foreground">
            Leads Estagnados
          </h3>
        </div>
        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full border border-orange-200">
          {leads.length} lead{leads.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sortedLeads.map((lead) => (
          <div
            key={lead.id}
            className={`p-3 bg-muted/30 rounded-lg border border-border/50 hover:border-orange-200 hover:bg-orange-50/50 transition-colors ${
              onLeadClick ? 'cursor-pointer' : ''
            }`}
            onClick={() => onLeadClick?.(lead.id)}
          >
            {/* Header com nome e tempo estagnado */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-foreground truncate">
                  {lead.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  {lead.column.name && (
                    <div className="flex items-center gap-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: lead.column.color || '#6b7280' }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {lead.column.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <DaysStagnantBadge days={lead.daysSinceUpdate} />
                {onLeadClick && (
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Informações de contato */}
            <ContactInfo lead={lead} />

            {/* Data da última atualização */}
            <div className="text-xs text-muted-foreground mt-2">
              Última atividade: {new Date(lead.updated_at).toLocaleDateString('pt-BR')}
            </div>
          </div>
        ))}
      </div>

      {/* Footer com ações rápidas */}
      <div className="mt-4 pt-3 border-t border-border/50">
        <div className="text-xs text-muted-foreground mb-2">
          <strong>Dica:</strong> Considere entrar em contato com leads parados há mais de {threshold} dias
        </div>

        {/* Resumo por criticidade */}
        <div className="flex items-center gap-4 text-xs">
          {leads.filter(l => l.daysSinceUpdate >= 30).length > 0 && (
            <div className="flex items-center gap-1 text-red-600">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>{leads.filter(l => l.daysSinceUpdate >= 30).length} críticos (30+ dias)</span>
            </div>
          )}
          {leads.filter(l => l.daysSinceUpdate >= 14 && l.daysSinceUpdate < 30).length > 0 && (
            <div className="flex items-center gap-1 text-orange-600">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>{leads.filter(l => l.daysSinceUpdate >= 14 && l.daysSinceUpdate < 30).length} atenção (14-29 dias)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};