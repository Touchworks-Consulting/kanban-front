import React from 'react';
import { Badge } from '../ui/badge';
import { CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { KanbanColumn } from '../../types/kanban';

export interface PipelineStageIndicatorProps {
  columns: KanbanColumn[];
  currentColumn: string;
  leadStatus: 'active' | 'won' | 'lost';
  className?: string;
  showLabels?: boolean;
  showHeader?: boolean;
}

export const PipelineStageIndicator: React.FC<PipelineStageIndicatorProps> = ({
  columns,
  currentColumn,
  leadStatus,
  className,
  showLabels = true,
  showHeader = true,
}) => {
  const sortedColumns = [...columns].sort((a, b) => a.position - b.position);
  const currentColumnIndex = sortedColumns.findIndex((col) => col.id === currentColumn);
  const isWon = leadStatus === 'won';
  const isLost = leadStatus === 'lost';

  const progressPercentage = currentColumnIndex >= 0 ? ((currentColumnIndex + 1) / sortedColumns.length) * 100 : 0;

  const getColumnColor = (column: KanbanColumn) => column.color || '#6366f1';

  return (
    <div className={cn('w-full', className)}>
      {showHeader && (
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Pipeline
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {currentColumnIndex >= 0 ? sortedColumns[currentColumnIndex].name : 'Indefinido'}
            </p>
          </div>

          {isWon ? (
            <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Ganho
            </Badge>
          ) : isLost ? (
            <Badge variant="destructive">
              <XCircle className="w-3 h-3 mr-1" />
              Perdido
            </Badge>
          ) : (
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              <Clock className="w-3 h-3 mr-1" />
              {Math.round(progressPercentage)}%
            </Badge>
          )}
        </div>
      )}

      <div className="relative">
        <div className="w-full flex h-8 rounded-md overflow-hidden bg-muted">
          {sortedColumns.map((column, index) => {
            const isCurrent = currentColumnIndex === index;
            const isPassed = currentColumnIndex > index;
            const columnColor = getColumnColor(column);

            return (
              <div
                key={column.id}
                className={cn('relative flex-1 flex items-center justify-center text-xs font-medium group', isPassed ? 'text-white' : 'text-muted-foreground')}
                style={{ minWidth: 0 }}
              >
                <div className="absolute inset-0 transition-all duration-300" style={{ backgroundColor: isPassed || isCurrent ? columnColor : undefined, opacity: isPassed || isCurrent ? 1 : 0.12 }} />

                {isCurrent ? (
                  <span className="relative z-10 text-white px-2 py-0.5">{`${Math.round(progressPercentage)}%`}</span>
                ) : (
                  <span className="relative z-10 px-2 py-0.5 truncate">&nbsp;</span>
                )}

                {index < sortedColumns.length - 1 && (
                  <div aria-hidden className="absolute right-[-8px] top-1/2 transform -translate-y-1/2 rotate-45 w-4 h-4 border-t border-l border-border bg-background" style={{ zIndex: 30 }} />
                )}

                <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-2 mb-2 hidden group-hover:block z-50">
                  <div className="bg-slate-800 text-white text-sm rounded-md px-3 py-2 shadow-md max-w-xs">
                    <div className="font-semibold">{column.name}</div>
                    <div className="text-xs text-slate-300 mt-1">{`Este negócio ainda não está nessa etapa`}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!isWon && !isLost && currentColumnIndex < sortedColumns.length - 1 && (
          <div className="mt-2 text-center">
            <p className="text-xs text-muted-foreground">Próxima etapa: <span className="font-medium text-foreground">{sortedColumns[currentColumnIndex + 1]?.name}</span></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PipelineStageIndicator;
import React from 'react';
import { Badge } from '../ui/badge';
import { CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { KanbanColumn } from '../../types/kanban';

interface PipelineStageIndicatorProps {
  columns: KanbanColumn[];
  currentColumn: string;
  leadStatus: 'active' | 'won' | 'lost';
  className?: string;
  showLabels?: boolean;
  showHeader?: boolean;
}

const PipelineStageIndicator: React.FC<PipelineStageIndicatorProps> = ({
  columns,
  currentColumn,
  leadStatus,
  className,
  showLabels = true,
  showHeader = true,
}) => {
  const sortedColumns = [...columns].sort((a, b) => a.position - b.position);
  const currentColumnIndex = sortedColumns.findIndex((col) => col.id === currentColumn);
  const isWon = leadStatus === 'won';
  const isLost = leadStatus === 'lost';

  const progressPercentage = currentColumnIndex >= 0 ? ((currentColumnIndex + 1) / sortedColumns.length) * 100 : 0;

  const getColumnColor = (column: KanbanColumn) => column.color || '#6366f1';

  return (
    <div className={cn('w-full', className)}>
      {showHeader && (
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Pipeline
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {currentColumnIndex >= 0 ? sortedColumns[currentColumnIndex].name : 'Indefinido'}
            </p>
          </div>

          {isWon ? (
            <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Ganho
            </Badge>
          ) : isLost ? (
            <Badge variant="destructive">
              <XCircle className="w-3 h-3 mr-1" />
              Perdido
            </Badge>
          ) : (
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              <Clock className="w-3 h-3 mr-1" />
              {Math.round(progressPercentage)}%
            </Badge>
          )}
        </div>
      )}

      <div className="relative">
        <div className="w-full flex h-8 rounded-md overflow-hidden bg-muted">
          {sortedColumns.map((column, index) => {
            const isCurrent = currentColumnIndex === index;
            const isPassed = currentColumnIndex > index;
            const columnColor = getColumnColor(column);

            return (
              <div
                key={column.id}
                className={cn('relative flex-1 flex items-center justify-center text-xs font-medium group', isPassed ? 'text-white' : 'text-muted-foreground')}
                style={{ minWidth: 0 }}
              >
                <div className="absolute inset-0 transition-all duration-300" style={{ backgroundColor: isPassed || isCurrent ? columnColor : undefined, opacity: isPassed || isCurrent ? 1 : 0.12 }} />

                {isCurrent ? (
                  <span className="relative z-10 text-white px-2 py-0.5">{`${Math.round(progressPercentage)}%`}</span>
                ) : (
                  <span className="relative z-10 px-2 py-0.5 truncate">&nbsp;</span>
                )}

                {index < sortedColumns.length - 1 && (
                  <div aria-hidden className="absolute right-[-8px] top-1/2 transform -translate-y-1/2 rotate-45 w-4 h-4 border-t border-l border-border bg-background" style={{ zIndex: 30 }} />
                )}

                <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-2 mb-2 hidden group-hover:block z-50">
                  <div className="bg-slate-800 text-white text-sm rounded-md px-3 py-2 shadow-md max-w-xs">
                    <div className="font-semibold">{column.name}</div>
                    <div className="text-xs text-slate-300 mt-1">{`Este negócio ainda não está nessa etapa`}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!isWon && !isLost && currentColumnIndex < sortedColumns.length - 1 && (
          <div className="mt-2 text-center">
            <p className="text-xs text-muted-foreground">Próxima etapa: <span className="font-medium text-foreground">{sortedColumns[currentColumnIndex + 1]?.name}</span></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PipelineStageIndicator;
import React from 'react';
import { Badge } from '../ui/badge';
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  Clock,
  TrendingUp
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { KanbanColumn } from '../../types/kanban';

interface PipelineStageIndicatorProps {
  columns: KanbanColumn[];
  currentColumn: string;
  leadStatus: 'active' | 'won' | 'lost';
  className?: string;
  showLabels?: boolean; // whether to render stage names under the dots
  showHeader?: boolean; // whether to render the 'Pipeline' header and subtitle
  return (
    <div className={cn('w-full', className)}>
      {/* Header with current stage (optional) */}
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Pipeline
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {currentColumnIndex >= 0 ? sortedColumns[currentColumnIndex].name : 'Indefinido'}
            </p>
          </div>

          {/* Status badge */}
          {isWon ? (
            <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Ganho
            </Badge>
          ) : isLost ? (
            <Badge variant="destructive">
              <XCircle className="w-3 h-3 mr-1" />
              Perdido
            </Badge>
          ) : (
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              <Clock className="w-3 h-3 mr-1" />
              {Math.round(progressPercentage)}%
            </Badge>
          )}
        </div>
      )}

      {/* Segmented pipeline */}
      <div className="relative">
        <div className="w-full flex h-8 rounded-md overflow-hidden bg-muted">
          {sortedColumns.map((column, index) => {
            const isCurrent = currentColumnIndex === index;
            const isPassed = currentColumnIndex > index;
            const columnColor = getColumnColor(column);

            // small helper to render a styled tooltip (CSS-only)
            const tooltip = (
              <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-2 mb-2 hidden group-hover:block z-50">
                <div className="bg-slate-800 text-white text-sm rounded-md px-3 py-2 shadow-md max-w-xs">
                  <div className="font-semibold">{column.name}</div>
                  <div className="text-xs text-slate-300 mt-1">{`Este negócio ainda não está nessa etapa`}</div>
                </div>
              </div>
            );

            return (
              <div
                key={column.id}
                className={cn(
                  'relative flex-1 flex items-center justify-center text-xs font-medium group',
                  isPassed ? 'text-white' : 'text-muted-foreground'
                )}
                style={{ minWidth: 0 }}
              >
                {/* Segment background: highlight current/previous with column color */}
                <div
                  className={cn('absolute inset-0 transition-all duration-300')}
                  style={{
                    backgroundColor: isPassed || isCurrent ? columnColor : undefined,
                    opacity: isPassed || isCurrent ? 1 : 0.12
                  }}
                />

                {/* Text inside current segment (e.g., "1 dia") */}
                {isCurrent ? (
                  <span className="relative z-10 text-white px-2 py-0.5">{`${Math.round(progressPercentage)}%`}</span>
                ) : (
                  <span className="relative z-10 px-2 py-0.5 truncate">&nbsp;</span>
                )}

                {/* Diamond separator between segments */}
                {index < sortedColumns.length - 1 && (
                  <div
                    aria-hidden
                    className="absolute right-[-8px] top-1/2 transform -translate-y-1/2 rotate-45 w-4 h-4 border-t border-l border-border bg-background"
                    style={{ zIndex: 30 }}
                  />
                )}

                {/* Tooltip */}
                {tooltip}
              </div>
            );
          })}
        </div>

        {/* Optional next stage hint */}
        {!isWon && !isLost && currentColumnIndex < sortedColumns.length - 1 && (
          <div className="mt-2 text-center">
            <p className="text-xs text-muted-foreground">
              Pr xima etapa: <span className="font-medium text-foreground">
                {sortedColumns[currentColumnIndex + 1]?.name}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
                {/* Arrow to next stage */}
                {index < sortedColumns.length - 1 && isCurrent && !isWon && !isLost && (
                  <ArrowRight className="w-3 h-3 text-primary mt-1 animate-pulse" />
                )}
              </div>
            );
          })}
        </div>

        {/* Next stage hint */}
        {!isWon && !isLost && currentColumnIndex < sortedColumns.length - 1 && (
          <div className="mt-3 text-center">
            <p className="text-xs text-muted-foreground">
              Próxima etapa: <span className="font-medium text-foreground">
                {sortedColumns[currentColumnIndex + 1]?.name}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};