import { motion } from 'framer-motion';
import { Skeleton } from '../ui/skeleton';

// Skeleton para cards de KPIs
export const KPICardSkeleton = () => (
  <div className="bg-card rounded-lg border p-6 space-y-3">
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-6 w-6 rounded-full" />
    </div>
    <Skeleton className="h-8 w-20" />
    <div className="flex items-center space-x-2">
      <Skeleton className="h-3 w-3 rounded-full" />
      <Skeleton className="h-3 w-16" />
    </div>
  </div>
);

// Skeleton para gráficos
export const ChartSkeleton = ({ height = "h-64" }: { height?: string }) => (
  <div className={`bg-card rounded-lg border p-6 ${height}`}>
    <div className="space-y-4 mb-6">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-24" />
    </div>
    <div className="flex items-end space-x-2 h-32">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-full bg-muted rounded animate-pulse"
          style={{
            height: `${20 + Math.random() * 80}%`
          }}
          animate={{ 
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 1.5 + i * 0.1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  </div>
);

// Skeleton para tabelas/listas
export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="bg-card rounded-lg border overflow-hidden">
    <div className="bg-muted/50 border-b p-4">
      <div className="grid grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-4" />
        ))}
      </div>
    </div>
    <div className="divide-y">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4">
          <div className="grid grid-cols-6 gap-4 items-center">
            {Array.from({ length: 6 }).map((_, j) => (
              <Skeleton 
                key={j} 
                className={`h-4 ${j === 0 ? 'w-full' : j === 5 ? 'w-8' : ''}`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Skeleton para funil de vendas
export const FunnelSkeleton = () => (
  <div className="bg-card rounded-lg border p-6 space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-4 w-48" />
    </div>
    <div className="space-y-4">
      {['100%', '85%', '65%', '45%', '25%'].map((width, i) => (
        <div key={i} className="space-y-2">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-8" />
          </div>
          <motion.div
            className="bg-muted rounded animate-pulse h-8"
            style={{ width }}
            animate={{ 
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 1.5 + i * 0.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      ))}
    </div>
  </div>
);

// Skeleton para timeline
export const TimelineSkeleton = () => (
  <div className="bg-card rounded-lg border p-6">
    <div className="space-y-4 mb-6">
      <Skeleton className="h-6 w-40" />
      <div className="flex space-x-4">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
    </div>
    <div className="h-48 relative">
      <div className="absolute inset-0 flex items-end space-x-1">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end">
            <motion.div
              className="bg-muted rounded animate-pulse w-full mb-1"
              style={{
                height: `${10 + Math.random() * 70}%`
              }}
              animate={{ 
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 1.5 + i * 0.05,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Skeleton para dashboard completo
export const DashboardSkeleton = () => (
  <div className="space-y-6">
    {/* Header Skeleton */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex space-x-2">
        <Skeleton className="h-10 w-24 rounded-md" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
    </div>

    {/* KPIs Grid Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <KPICardSkeleton key={i} />
      ))}
    </div>

    {/* Charts Grid Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartSkeleton height="h-80" />
      <FunnelSkeleton />
    </div>

    {/* Timeline Skeleton */}
    <TimelineSkeleton />

    {/* Table Skeleton */}
    <TableSkeleton rows={3} />
  </div>
);