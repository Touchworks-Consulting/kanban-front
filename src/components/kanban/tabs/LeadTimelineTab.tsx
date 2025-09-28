import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import {
  Plus,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  FileText,
  Activity,
  Video,
  CheckSquare,
  Target,
  Coffee
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { LeadActivity } from '../../../types/leadModal';
import { formatDate, formatDistanceToNow } from '../../../utils/helpers';
import { RichActivityForm } from '../RichActivityForm';

interface LeadTimelineTabProps {
  leadId: string;
  initialActivities: LeadActivity[];
}

export const LeadTimelineTab: React.FC<LeadTimelineTabProps> = ({
  leadId,
  initialActivities
}) => {
  const [activities, setActivities] = useState<LeadActivity[]>(initialActivities);
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddActivity = async (activityData: any) => {
    if (!activityData.type || !activityData.title.trim()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simular criação de atividade
      const mockActivity: LeadActivity = {
        id: Date.now().toString(),
        lead_id: leadId,
        user_id: '1',
        type: activityData.type as any,
        title: activityData.title,
        description: activityData.description || undefined,
        status: activityData.status,
        duration_minutes: activityData.duration_minutes,
        scheduled_for: activityData.scheduled_for?.toISOString(),
        metadata: activityData.metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: {
          id: '1',
          name: 'Usuário Atual'
        }
      };

      setActivities(prev => [mockActivity, ...prev]);
      setIsAddingActivity(false);
    } catch (err) {
      console.error('Erro ao adicionar atividade:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
        return Phone;
      case 'email':
        return Mail;
      case 'meeting':
        return Video;
      case 'note':
        return MessageSquare;
      case 'task':
        return CheckSquare;
      case 'follow_up':
        return Target;
      case 'proposal':
        return FileText;
      case 'lunch':
        return Coffee;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: string, metadata?: any) => {
    // Use custom color from metadata if available
    if (metadata?.color) {
      return {
        iconColor: metadata.color,
        bgColor: `${metadata.color}15`,
        borderColor: `${metadata.color}30`
      };
    }

    // Fallback colors matching RichActivityForm
    switch (type) {
      case 'call':
        return {
          iconColor: '#10b981',
          bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
          borderColor: 'border-emerald-200 dark:border-emerald-800'
        };
      case 'email':
        return {
          iconColor: '#3b82f6',
          bgColor: 'bg-blue-50 dark:bg-blue-950/20',
          borderColor: 'border-blue-200 dark:border-blue-800'
        };
      case 'meeting':
        return {
          iconColor: '#8b5cf6',
          bgColor: 'bg-violet-50 dark:bg-violet-950/20',
          borderColor: 'border-violet-200 dark:border-violet-800'
        };
      case 'note':
        return {
          iconColor: '#f59e0b',
          bgColor: 'bg-amber-50 dark:bg-amber-950/20',
          borderColor: 'border-amber-200 dark:border-amber-800'
        };
      case 'task':
        return {
          iconColor: '#ef4444',
          bgColor: 'bg-red-50 dark:bg-red-950/20',
          borderColor: 'border-red-200 dark:border-red-800'
        };
      case 'follow_up':
        return {
          iconColor: '#06b6d4',
          bgColor: 'bg-cyan-50 dark:bg-cyan-950/20',
          borderColor: 'border-cyan-200 dark:border-cyan-800'
        };
      case 'proposal':
        return {
          iconColor: '#84cc16',
          bgColor: 'bg-lime-50 dark:bg-lime-950/20',
          borderColor: 'border-lime-200 dark:border-lime-800'
        };
      case 'lunch':
        return {
          iconColor: '#a855f7',
          bgColor: 'bg-purple-50 dark:bg-purple-950/20',
          borderColor: 'border-purple-200 dark:border-purple-800'
        };
      default:
        return {
          iconColor: '#6b7280',
          bgColor: 'bg-muted',
          borderColor: 'border-muted'
        };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'cancelled':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'pending':
        return Clock;
      case 'cancelled':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      call: 'Ligação',
      email: 'Email',
      meeting: 'Reunião',
      note: 'Anotação',
      task: 'Tarefa',
      follow_up: 'Follow-up',
      proposal: 'Proposta'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      completed: 'Concluído',
      pending: 'Pendente',
      cancelled: 'Cancelado'
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Timeline</h3>
          <Button
            onClick={() => setIsAddingActivity(true)}
            className="flex items-center gap-2"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Nova Atividade
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-4">
        {/* Rich Activity Form */}
        {isAddingActivity && (
          <div className="mb-4">
            <RichActivityForm
              onSubmit={handleAddActivity}
              onCancel={() => setIsAddingActivity(false)}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Activities Timeline */}
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const ActivityIcon = getActivityIcon(activity.type);
            const StatusIcon = getStatusIcon(activity.status);
            const colors = getActivityColor(activity.type, activity.metadata);
            const isLast = index === activities.length - 1;

            return (
              <div key={activity.id} className="relative">
                {/* Timeline line */}
                {!isLast && (
                  <div className="absolute left-6 top-14 w-0.5 h-full bg-border -z-10" />
                )}

                <div className="flex gap-4">
                  {/* Activity Icon */}
                  <div
                    className={cn(
                      'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-sm',
                      colors.bgColor,
                      colors.borderColor
                    )}
                    style={{
                      backgroundColor: typeof colors.bgColor === 'string' && colors.bgColor.startsWith('#')
                        ? colors.bgColor
                        : undefined
                    }}
                  >
                    <ActivityIcon
                      className="h-5 w-5"
                      style={{ color: colors.iconColor }}
                    />
                  </div>

                  {/* Activity Content */}
                  <Card className="flex-1">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {activity.title}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {getTypeLabel(activity.type)}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <User className="h-3 w-3" />
                            <span>{activity.user?.name || 'Sistema'}</span>
                            <span>•</span>
                            <Clock className="h-3 w-3" />
                            <span>{formatDistanceToNow(activity.created_at)}</span>
                            <span>•</span>
                            <time className="text-xs" title={formatDate(activity.created_at, 'datetime')}>
                              {formatDate(activity.created_at, 'short')}
                            </time>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <StatusIcon className={cn('h-4 w-4', getStatusColor(activity.status))} />
                          <span className={cn('text-xs font-medium', getStatusColor(activity.status))}>
                            {getStatusLabel(activity.status)}
                          </span>
                        </div>
                      </div>

                      {activity.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {activity.description}
                        </p>
                      )}

                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <div className="mt-2 p-2 bg-muted rounded-md">
                          <div className="text-xs text-gray-500 space-y-1">
                            {Object.entries(activity.metadata).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="font-medium">{key}:</span>
                                <span>{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            );
          })}
        </div>

        {activities.length === 0 && !isAddingActivity && (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhuma atividade ainda
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Registre ligações, emails, reuniões e outras interações com este lead
            </p>
            <Button onClick={() => setIsAddingActivity(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Primeira Atividade
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};