import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import {
  Plus,
  Activity,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  FileText,
  Users,
  Paperclip,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Filter,
  Search,
  CheckSquare
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { LeadModalData } from '../../types/leadModal';
import type { Lead } from '../../types/kanban';
import { formatDate, formatDistanceToNow } from '../../utils/helpers';
import { TasksTab } from './tabs/TasksTab';

interface ActivitiesAreaProps {
  leadId: string;
  modalData?: LeadModalData | null;
  lead?: Lead | null;
  onUpdate?: () => void;
  className?: string;
}

const ActivitiesAreaComponent: React.FC<ActivitiesAreaProps> = ({
  leadId,
  modalData,
  lead,
  onUpdate,
  className
}) => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [triggerNewTask, setTriggerNewTask] = useState(0);

  const handleNewActivity = React.useCallback(() => {
    setActiveTab('tasks');
    setTriggerNewTask(prev => prev + 1);
  }, []);

  const handleNewTaskCreated = React.useCallback(() => {
    // Não precisa fazer nada, o contador já foi incrementado
  }, []);

  // Remover registro automático para evitar chamadas indevidas

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
        return Phone;
      case 'email':
        return Mail;
      case 'whatsapp':
        return MessageSquare;
      case 'meeting':
        return Calendar;
      case 'note':
        return MessageSquare;
      case 'task':
        return CheckCircle;
      case 'follow_up':
        return Activity;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'call':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'email':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'whatsapp':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'meeting':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'note':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'task':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'follow_up':
        return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const activities = modalData?.timeline || [];
  const contacts = modalData?.contacts || [];
  const files = modalData?.files || [];

  return (
    <div className={cn('bg-background flex flex-col min-h-0', className)}>
      {/* Navegação de tabs simplificada */}
      <div className="border-b flex-shrink-0 px-2">
        <div className="flex items-center justify-between">
          <div className="flex">
            <Button
              variant={activeTab === 'tasks' ? 'default' : 'ghost'}
              className={cn(
                'rounded-none border-b-2 px-3 py-2 text-sm',
                activeTab === 'tasks'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-transparent hover:bg-muted'
              )}
              onClick={() => setActiveTab('tasks')}
            >
              <CheckSquare className="w-4 h-4 mr-1" />
              Tarefas
            </Button>
            <Button
              variant={activeTab === 'timeline' ? 'default' : 'ghost'}
              className={cn(
                'rounded-none border-b-2 px-3 py-2 text-sm',
                activeTab === 'timeline'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-transparent hover:bg-muted'
              )}
              onClick={() => setActiveTab('timeline')}
            >
              <Activity className="w-4 h-4 mr-1" />
              Timeline
              <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                {activities.length}
              </Badge>
            </Button>
            <Button
              variant={activeTab === 'files' ? 'default' : 'ghost'}
              className={cn(
                'rounded-none border-b-2 px-3 py-2 text-sm',
                activeTab === 'files'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-transparent hover:bg-muted'
              )}
              onClick={() => setActiveTab('files')}
            >
              <Paperclip className="w-4 h-4 mr-1" />
              Arquivos
              <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                {files.length}
              </Badge>
            </Button>
          </div>

          {/* Botão Nova atividade apenas para tab de tarefas */}
          {activeTab === 'tasks' && (
            <Button
              variant="default"
              size="sm"
              onClick={handleNewActivity}
              className="h-7 px-3 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Nova
            </Button>
          )}
        </div>
      </div>

      {/* Conteúdo das tabs */}
      <div className="flex-1 min-h-0">
        {/* Tasks Tab */}
        <div className={cn("h-full", activeTab !== 'tasks' && "hidden")}>
          <ScrollArea className="h-full">
            <div className="p-6">
              <TasksTab
                leadId={leadId}
                onUpdate={onUpdate}
                triggerNewTask={triggerNewTask}
                onNewTaskCreated={handleNewTaskCreated}
                leadName={lead?.name}
              />
            </div>
          </ScrollArea>
        </div>

        {/* Timeline Tab */}
        <div className={cn("h-full", activeTab !== 'timeline' && "hidden")}>
            <ScrollArea className="h-full">
              <div className="p-6">
                {activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((activity, index) => {
                      const ActivityIcon = getActivityIcon(activity.type);
                      const StatusIcon = getStatusIcon(activity.status);
                      const isLast = index === activities.length - 1;

                      return (
                        <div key={activity.id} className="relative">
                          {/* Linha de conexão */}
                          {!isLast && (
                            <div className="absolute left-6 top-14 w-0.5 h-full bg-gray-200 -z-10" />
                          )}

                          <div className="flex gap-4">
                            {/* Ícone da atividade */}
                            <div className={cn(
                              'flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center',
                              getActivityColor(activity.type)
                            )}>
                              <ActivityIcon className="w-5 h-5" />
                            </div>

                            {/* Conteúdo da atividade */}
                            <div className={cn(
                              "flex-1 bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow",
                              activity.scheduled_for && activity.status === 'pending' && new Date(activity.scheduled_for) < new Date() && "border-2 border-red-500"
                            )}>
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 mb-1">
                                    {activity.title}
                                  </h4>
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <span>{activity.user?.name || 'Sistema'}</span>
                                    <span>•</span>
                                    <span>{formatDistanceToNow(activity.created_at)}</span>
                                    <span>•</span>
                                    <StatusIcon className={cn('w-4 h-4', getStatusColor(activity.status))} />
                                    <span className={getStatusColor(activity.status)}>
                                      {activity.status === 'completed' ? 'Concluído' :
                                       activity.status === 'pending' ? 'Pendente' :
                                       activity.status === 'cancelled' ? 'Cancelado' : 'Pendente'}
                                    </span>
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </div>

                              {activity.description && (
                                <p className="text-sm text-gray-600 mb-3">
                                  {activity.description}
                                </p>
                              )}

                              {activity.scheduled_for && (
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <Calendar className="w-3 h-3" />
                                  <span>Agendado para {formatDate(activity.scheduled_for, 'datetime')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Activity className="w-6 h-6 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Nenhuma atividade registrada
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
        </div>


        {/* Files Tab */}
        <div className={cn("h-full", activeTab !== 'files' && "hidden")}>
            <ScrollArea className="h-full">
              <div className="p-6">
                {files.length > 0 ? (
                  <div className="space-y-4">
                    {files.map((file) => (
                      <div key={file.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-gray-400" />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{file.original_filename}</h4>
                            <p className="text-sm text-gray-600">
                              {file.file_size && `${Math.round(file.file_size / 1024)} KB`} •
                              {formatDate(file.created_at, 'short')}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Paperclip className="w-6 h-6 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Nenhum arquivo anexado
                    </p>
                    <Button variant="outline" size="sm">
                      <Plus className="h-3 h-3 mr-1" />
                      Anexar arquivo
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
        </div>

      </div>
    </div>
  );
};

export const ActivitiesArea = React.memo(ActivitiesAreaComponent);