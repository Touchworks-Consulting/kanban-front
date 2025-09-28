import React from 'react';
import { Skeleton } from '../ui/skeleton';
import { cn } from '../../lib/utils';

interface PipelineHeaderSkeletonProps {
  className?: string;
}

export const PipelineHeaderSkeleton: React.FC<PipelineHeaderSkeletonProps> = ({
  className
}) => {
  return (
    <div className={cn('bg-background border-b sticky top-0 z-10', className)}>
      {/* Primeira linha - Nome, Status, Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-4 gap-3">
        {/* Esquerda - Nome do Lead e Status */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="min-w-0 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* Direita - Botões de Ação */}
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-8 w-12 sm:w-16" />
          <Skeleton className="h-8 w-14 sm:w-20" />
          <Skeleton className="h-8 w-24 sm:w-32" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>

      {/* Segunda linha - Pipeline Skeleton */}
      <div className="px-4 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>

        {/* Pipeline skeleton */}
        <div className="relative">
          <Skeleton className="w-full h-7 rounded-md" />
        </div>
      </div>
    </div>
  );
};