import React from 'react';
import { Target, TrendingUp } from 'lucide-react';
import type { MQLData } from '../../services/performance';

interface MQLMetricCardProps {
  data: MQLData | null;
  isLoading?: boolean;
}

export const MQLMetricCard: React.FC<MQLMetricCardProps> = ({ data, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Target className="w-6 h-6 mx-auto mb-2 opacity-50 animate-pulse" />
          <p className="text-sm">Carregando métricas MQL...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Target className="w-6 h-6 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhum dado MQL disponível</p>
        </div>
      </div>
    );
  }

  const hasWarning = !!data.warning;
  const percentage = data.mql_percentage || 0;

  return (
    <>
      <div className="flex items-center gap-2 mb-3">
        <Target className="w-4 h-4 text-primary" />
        <h3 className="text-base font-semibold">MQL % (Marketing Qualified Leads)</h3>
      </div>

      <div className="h-64 overflow-y-auto">
        {hasWarning ? (
          <div className="space-y-2 py-6 text-center">
            <div className="text-2xl font-bold text-muted-foreground">
              N/A
            </div>
            <p className="text-xs text-muted-foreground">
              {data.warning}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Marque colunas como MQL ao editar o quadro Kanban
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                {percentage.toFixed(1)}%
              </div>
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {data.mql_leads} de {data.total_leads} leads
              </p>

              {data.mql_columns && data.mql_columns.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Colunas MQL:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {data.mql_columns.map((col) => (
                      <div
                        key={col.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-muted border"
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: col.color || '#10b981' }}
                        />
                        <span className="font-medium">{col.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
