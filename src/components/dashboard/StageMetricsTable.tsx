import React from 'react';
import { ArrowRight, Clock, TrendingUp, Users, Target } from 'lucide-react';

// Interface para as métricas detalhadas de estágio
interface StageMetric {
  columnId: string;
  columnName: string;
  columnColor: string;
  currentLeadsCount: number;
  totalLeadsProcessed: number;
  averageTimeInDays: number;
  averageTimeFormatted: string;
  conversionToNext?: {
    toStage: string;
    rate: number;
    leadsAdvanced: number;
  } | null;
}

interface StageMetricsTableProps {
  data: StageMetric[];
  className?: string;
}

// Componente para badge de status da taxa de conversão
const ConversionRateBadge: React.FC<{ rate: number }> = ({ rate }) => {
  const getColorClass = (rate: number) => {
    if (rate >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (rate >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (rate >= 40) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getColorClass(rate)}`}>
      {rate.toFixed(1)}%
    </span>
  );
};

// Componente para badge de tempo médio
const TimeBadge: React.FC<{ timeFormatted: string; days: number }> = ({ timeFormatted, days }) => {
  const getColorClass = (days: number) => {
    if (days <= 2) return 'bg-green-100 text-green-800 border-green-200';
    if (days <= 7) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (days <= 14) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getColorClass(days)}`}>
      <Clock className="w-3 h-3 mr-1" />
      {timeFormatted}
    </span>
  );
};

export const StageMetricsTable: React.FC<StageMetricsTableProps> = ({
  data,
  className = ""
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={`w-full p-6 text-center text-muted-foreground ${className}`}>
        <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Nenhuma métrica de estágio disponível</p>
        <p className="text-xs mt-1">Aguardando dados de movimentação dos leads</p>
      </div>
    );
  }

  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wide text-muted-foreground">
              Estágio
            </th>
            <th className="text-center py-3 px-4 font-medium text-xs uppercase tracking-wide text-muted-foreground">
              <div className="flex items-center justify-center gap-1">
                <Users className="w-3 h-3" />
                Leads Atuais
              </div>
            </th>
            <th className="text-center py-3 px-4 font-medium text-xs uppercase tracking-wide text-muted-foreground">
              <div className="flex items-center justify-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Processados
              </div>
            </th>
            <th className="text-center py-3 px-4 font-medium text-xs uppercase tracking-wide text-muted-foreground">
              <div className="flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" />
                Tempo Médio
              </div>
            </th>
            <th className="text-center py-3 px-4 font-medium text-xs uppercase tracking-wide text-muted-foreground">
              <div className="flex items-center justify-center gap-1">
                <Target className="w-3 h-3" />
                Taxa Conversão
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((stage, index) => (
            <tr
              key={stage.columnId}
              className="border-b border-border/50 hover:bg-muted/20 transition-colors"
            >
              {/* Nome do estágio */}
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full border border-border/20"
                    style={{ backgroundColor: stage.columnColor }}
                  />
                  <span className="font-medium text-foreground">
                    {stage.columnName}
                  </span>
                </div>
              </td>

              {/* Leads atuais */}
              <td className="py-3 px-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg font-bold text-foreground">
                    {stage.currentLeadsCount}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    leads
                  </span>
                </div>
              </td>

              {/* Total processados */}
              <td className="py-3 px-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg font-bold text-primary">
                    {stage.totalLeadsProcessed}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    total
                  </span>
                </div>
              </td>

              {/* Tempo médio */}
              <td className="py-3 px-4 text-center">
                <TimeBadge
                  timeFormatted={stage.averageTimeFormatted}
                  days={stage.averageTimeInDays}
                />
              </td>

              {/* Taxa de conversão */}
              <td className="py-3 px-4 text-center">
                {stage.conversionToNext ? (
                  <div className="flex flex-col items-center gap-1">
                    <ConversionRateBadge rate={stage.conversionToNext.rate} />
                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                      <span>{stage.conversionToNext.leadsAdvanced}</span>
                      <ArrowRight className="w-3 h-3" />
                      <span className="max-w-20 truncate">
                        {stage.conversionToNext.toStage}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Estágio final
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legenda */}
      <div className="mt-4 p-3 bg-muted/20 rounded-lg">
        <div className="text-xs text-muted-foreground mb-2 font-medium">
          Legenda de Performance:
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="font-medium">Tempo Médio:</span>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>≤ 2 dias (Excelente)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>3-7 dias (Bom)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>8-14 dias (Atenção)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>&gt; 14 dias (Crítico)</span>
            </div>
          </div>
          <div>
            <span className="font-medium">Taxa de Conversão:</span>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>≥ 80% (Excelente)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>60-79% (Bom)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>40-59% (Atenção)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>&lt; 40% (Crítico)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};