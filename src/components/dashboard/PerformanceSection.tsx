import React from 'react';
import { MQLMetricCard } from './MQLMetricCard';
import { LossReasonsReport } from './LossReasonsReport';
import { StatusDistributionChart } from './StatusDistributionChart';
import type { MQLData, LossReasonsData, StatusDistributionData } from '../../services/performance';

interface PerformanceSectionProps {
  mqlData: MQLData | null;
  lossReasonsData: LossReasonsData | null;
  statusDistributionData: StatusDistributionData | null;
  isLoading?: boolean;
}

export const PerformanceSection: React.FC<PerformanceSectionProps> = ({
  mqlData,
  lossReasonsData,
  statusDistributionData,
  isLoading = false
}) => {
  return (
    <div className="space-y-6">
      {/* Header da Seção */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Análise de Performance</h2>
          <p className="text-muted-foreground">
            Métricas detalhadas sobre conversão, motivos de perda e distribuição do pipeline
          </p>
        </div>
      </div>

      {/* Loss Reasons Report - Largura Total */}
      <LossReasonsReport
        data={lossReasonsData}
        isLoading={isLoading}
      />
    </div>
  );
};
