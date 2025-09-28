import React from 'react';
import { Skeleton } from '../ui/skeleton';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '../../lib/utils';

interface LeadDataSidebarSkeletonProps {
  className?: string;
}

export const LeadDataSidebarSkeleton: React.FC<LeadDataSidebarSkeletonProps> = ({
  className
}) => {
  return (
    <div className={cn('bg-muted/30 border-r flex flex-col min-h-0', className)}>
      <ScrollArea className="flex-1 overflow-auto">
        <div className="p-3 space-y-4">
          {/* Seção de Negócio */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-1">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="h-3 w-16" />
            </div>

            <div className="space-y-2 ml-6">
              <div className="flex items-center gap-3">
                <Skeleton className="w-3 h-3" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="w-3 h-3" />
                <Skeleton className="h-3 w-12" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="w-3 h-3" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="w-3 h-3" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>

          {/* Seção de Contato */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-1">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="h-3 w-14" />
            </div>

            <div className="space-y-2 ml-6">
              <div className="flex items-center gap-3">
                <Skeleton className="w-3 h-3" />
                <Skeleton className="h-3 w-28" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="w-3 h-3" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="w-3 h-3" />
                <Skeleton className="h-3 w-18" />
              </div>
            </div>
          </div>

          {/* Seção de Responsável */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-1">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="h-3 w-20" />
            </div>

            <div className="ml-6">
              <div className="flex items-center gap-3">
                <Skeleton className="w-3 h-3" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>

          {/* Seção de Tags */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-1">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="h-3 w-10" />
            </div>

            <div className="ml-6 flex flex-wrap gap-1">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>

          {/* Seção de Campanha */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-1">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="h-3 w-18" />
            </div>

            <div className="ml-6">
              <div className="flex items-center gap-3">
                <Skeleton className="w-3 h-3" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>

          {/* Seção de Notas */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-1">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="h-3 w-12" />
            </div>

            <div className="ml-6">
              <div className="p-2 rounded-lg bg-muted/50 space-y-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};