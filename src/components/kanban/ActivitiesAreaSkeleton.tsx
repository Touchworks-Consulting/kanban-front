import React from 'react';
import { Skeleton } from '../ui/skeleton';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '../../lib/utils';

interface ActivitiesAreaSkeletonProps {
  className?: string;
}

export const ActivitiesAreaSkeleton: React.FC<ActivitiesAreaSkeletonProps> = ({
  className
}) => {
  return (
    <div className={cn('bg-background flex flex-col min-h-0', className)}>
      {/* Header da área de atividades */}
      <div className="border-b px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-20" />
            <div className="flex items-center gap-1">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
          <Skeleton className="h-8 w-28" />
        </div>
      </div>

      {/* Navegação de tabs skeleton */}
      <div className="border-b flex-shrink-0">
        <div className="flex">
          <div className="flex items-center px-4 py-3 gap-2">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-6 rounded-full" />
          </div>
          <div className="flex items-center px-4 py-3 gap-2">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-6 rounded-full" />
          </div>
          <div className="flex items-center px-4 py-3 gap-2">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-6 rounded-full" />
          </div>
        </div>
      </div>

      {/* Conteúdo das atividades skeleton */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-6">
            <div className="space-y-4">
              {/* Timeline items skeleton */}
              {[...Array(4)].map((_, index) => (
                <div key={index} className="relative">
                  <div className="flex gap-4">
                    {/* Ícone da atividade */}
                    <Skeleton className="flex-shrink-0 w-12 h-12 rounded-full" />

                    {/* Conteúdo da atividade */}
                    <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-2" />
                            <Skeleton className="h-3 w-12" />
                            <Skeleton className="h-3 w-2" />
                            <Skeleton className="h-3 w-3" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                        <Skeleton className="h-6 w-6" />
                      </div>

                      <div className="space-y-1">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>

                      {/* Data agendada (algumas atividades) */}
                      {index % 2 === 0 && (
                        <div className="flex items-center gap-2">
                          <Skeleton className="w-3 h-3" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};