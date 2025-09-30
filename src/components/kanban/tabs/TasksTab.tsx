import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import {
  Plus,
  CheckSquare,
  Clock,
  AlertTriangle,
  Calendar,
  User,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle2,
  PlayCircle,
  XCircle,
  Phone,
  Mail,
  MessageSquare,
  Users,
  FileText,
  Target
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '../../ui/dropdown-menu';
import { cn } from '../../../lib/utils';
import { formatDate, formatDistanceToNow } from '../../../utils/helpers';
import { activityService } from '../../../services/activity';
import type { Activity, CreateActivityDto } from '../../../services/activity';
import { TaskForm } from '../forms/TaskForm';

interface TasksTabProps {
  leadId: string;
  onUpdate?: () => void;
  triggerNewTask?: number;
  onNewTaskCreated?: () => void;
  leadName?: string; // Nome do lead para auto-preenchimento
}

type TaskFilter = 'all' | 'pending' | 'completed' | 'overdue' | 'today';
type TaskSort = 'newest' | 'oldest' | 'priority' | 'due_date';

export const TasksTab: React.FC<TasksTabProps> = ({ leadId, onUpdate, triggerNewTask, onNewTaskCreated, leadName }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [sort, setSort] = useState<TaskSort>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [lastTriggerCount, setLastTriggerCount] = useState(0);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Sincronizar com triggerNewTask inicial para evitar trigger falso
  useEffect(() => {
    if (!isInitialized && triggerNewTask !== undefined) {
      setLastTriggerCount(triggerNewTask);
      setIsInitialized(true);
    }
  }, [triggerNewTask, isInitialized]);

  // Carregar atividades
  const loadActivities = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await activityService.getLeadActivities(leadId, {
        limit: 50 // Carregar mais atividades
      });
      setActivities(response.activities);
    } catch (err: any) {
      console.error('Erro ao carregar atividades:', err);
      setError('Erro ao carregar atividades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [leadId]);

  // Responder ao trigger de nova tarefa
  useEffect(() => {
    // Só responder a triggers depois da inicialização
    if (isInitialized && triggerNewTask && triggerNewTask > lastTriggerCount) {
      setShowCreateForm(true);
      setLastTriggerCount(triggerNewTask);
      onNewTaskCreated?.();
    }
  }, [triggerNewTask, lastTriggerCount, onNewTaskCreated, isInitialized]);

  // Filtrar e ordenar atividades
  const filteredAndSortedActivities = React.useMemo(() => {
    let filtered = activities;

    // Aplicar filtros
    switch (filter) {
      case 'pending':
        filtered = filtered.filter(a => a.status === 'pending');
        break;
      case 'completed':
        filtered = filtered.filter(a => a.status === 'completed');
        break;
      case 'overdue':
        filtered = filtered.filter(a => a.status === 'pending' && a.is_overdue);
        break;
      case 'today':
        const today = new Date().toDateString();
        filtered = filtered.filter(a =>
          a.scheduled_for && new Date(a.scheduled_for).toDateString() === today
        );
        break;
    }

    // Aplicar busca
    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Aplicar ordenação
    switch (sort) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'priority':
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        break;
      case 'due_date':
        filtered.sort((a, b) => {
          if (!a.scheduled_for && !b.scheduled_for) return 0;
          if (!a.scheduled_for) return 1;
          if (!b.scheduled_for) return -1;
          return new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime();
        });
        break;
      default: // newest
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return filtered;
  }, [activities, filter, sort, searchTerm]);

  // Criar nova atividade
  const handleCreateActivity = async (data: CreateActivityDto) => {
    try {
      const response = await activityService.createActivity(leadId, data);
      setActivities(prev => [response.activity, ...prev]);
      setShowCreateForm(false);
      onUpdate?.();

      // Disparar evento para atualizar a agenda global
      window.dispatchEvent(new CustomEvent('activity-created', { detail: response.activity }));
    } catch (err: any) {
      console.error('Erro ao criar atividade:', err);
    }
  };

  // Atualizar atividade
  const handleUpdateActivity = async (activityId: string, data: Partial<Activity>) => {
    try {
      const response = await activityService.updateActivity(activityId, data);
      setActivities(prev => prev.map(a => a.id === activityId ? response.activity : a));
      setEditingActivity(null);
      onUpdate?.();

      // Disparar evento para atualizar a agenda global
      window.dispatchEvent(new CustomEvent('activity-updated', { detail: response.activity }));
    } catch (err: any) {
      console.error('Erro ao atualizar atividade:', err);
    }
  };

  // Excluir atividade
  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta atividade?')) return;

    try {
      await activityService.deleteActivity(activityId);
      setActivities(prev => prev.filter(a => a.id !== activityId));
      onUpdate?.();

      // Disparar evento para atualizar a agenda global
      window.dispatchEvent(new CustomEvent('activity-deleted', { detail: { id: activityId } }));
    } catch (err: any) {
      console.error('Erro ao excluir atividade:', err);
    }
  };

  // Toggle status da atividade
  const handleToggleStatus = async (activity: Activity) => {
    const newStatus = activity.status === 'completed' ? 'pending' : 'completed';
    const updateData: any = { status: newStatus };

    if (newStatus === 'completed') {
      updateData.completed_at = new Date().toISOString();
    } else {
      updateData.completed_at = null;
    }

    await handleUpdateActivity(activity.id, updateData);
  };

  // Obter ícone do tipo de atividade
  const getActivityIcon = (type: Activity['activity_type']) => {
    const iconClass = "w-4 h-4";
    switch (type) {
      case 'call': return <Phone className={iconClass} />;
      case 'email': return <Mail className={iconClass} />;
      case 'whatsapp': return <MessageSquare className={iconClass} />;
      case 'meeting': return <Users className={iconClass} />;
      case 'note': return <FileText className={iconClass} />;
      case 'task': return <CheckSquare className={iconClass} />;
      case 'follow_up': return <Target className={iconClass} />;
      default: return <CheckSquare className={iconClass} />;
    }
  };

  // Obter cor da prioridade (apenas bordas coloridas)
  const getPriorityColor = (priority: Activity['priority']) => {
    switch (priority) {
      case 'urgent': return 'text-red-700 border-red-300';
      case 'high': return 'text-orange-700 border-orange-300';
      case 'medium': return 'text-yellow-700 border-yellow-300';
      case 'low': return 'text-green-700 border-green-300';
      default: return 'text-gray-700 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadActivities} variant="outline">
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  const stats = {
    total: activities.length,
    pending: activities.filter(a => a.status === 'pending').length,
    completed: activities.filter(a => a.status === 'completed').length,
    overdue: activities.filter(a => a.status === 'pending' && a.is_overdue).length
  };

  return (
    <div className="space-y-4">
      {/* Filtros compactos */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <Select value={filter} onValueChange={(value: TaskFilter) => setFilter(value)}>
          <SelectTrigger className="w-28 h-8">
            <Filter className="w-3 h-3 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="completed">Concluídas</SelectItem>
            <SelectItem value="overdue">Vencidas</SelectItem>
            <SelectItem value="today">Hoje</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(value: TaskSort) => setSort(value)}>
          <SelectTrigger className="w-24 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Recentes</SelectItem>
            <SelectItem value="oldest">Antigas</SelectItem>
            <SelectItem value="priority">Prioridade</SelectItem>
            <SelectItem value="due_date">Vencimento</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de atividades */}
      <div className="space-y-3">
        {filteredAndSortedActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckSquare className="w-6 h-6 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {searchTerm || filter !== 'all'
                ? 'Nenhuma atividade encontrada'
                : 'Nenhuma tarefa ainda'
              }
            </p>
          </div>
        ) : (
          filteredAndSortedActivities.map((activity) => (
            <Card
              key={activity.id}
              className={cn(
                "transition-all duration-200 hover:shadow-md",
                activity.status === 'completed' && "opacity-75",
                activity.is_overdue && activity.status === 'pending' && "border-2 border-red-500"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Checkbox para toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-transparent"
                    onClick={() => handleToggleStatus(activity)}
                  >
                    {activity.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded hover:border-gray-400" />
                    )}
                  </Button>

                  <div className="flex-1 min-w-0">
                    {/* Título com ícone destacado */}
                    <div className="flex items-start gap-3 mb-2">
                      <div className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                        activity.activity_type === 'call' && "bg-green-100 text-green-600",
                        activity.activity_type === 'email' && "bg-blue-100 text-blue-600",
                        activity.activity_type === 'whatsapp' && "bg-green-100 text-green-600",
                        activity.activity_type === 'meeting' && "bg-purple-100 text-purple-600",
                        activity.activity_type === 'note' && "bg-orange-100 text-orange-600",
                        activity.activity_type === 'task' && "bg-gray-100 text-gray-600",
                        activity.activity_type === 'follow_up' && "bg-indigo-100 text-indigo-600"
                      )}>
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={cn(
                          "font-medium text-sm leading-5",
                          activity.status === 'completed' && "line-through text-muted-foreground"
                        )}>
                          {activity.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className={cn("text-xs flex items-center gap-1", getPriorityColor(activity.priority))}
                          >
                            {activity.priority === 'urgent' && <span className="w-2 h-2 rounded-full bg-red-500" />}
                            {activity.priority === 'high' && <span className="w-2 h-2 rounded-full bg-orange-500" />}
                            {activity.priority === 'medium' && <span className="w-2 h-2 rounded-full bg-yellow-500" />}
                            {activity.priority === 'low' && <span className="w-2 h-2 rounded-full bg-green-500" />}
                            {activity.priority === 'low' ? 'Baixa' :
                             activity.priority === 'medium' ? 'Média' :
                             activity.priority === 'high' ? 'Alta' : 'Urgente'}
                          </Badge>
                          {activity.is_overdue && activity.status === 'pending' && (
                            <Badge variant="destructive" className="text-xs flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Vencida
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Descrição */}
                    {activity.description && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {activity.description}
                      </p>
                    )}

                    {/* Metadados */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {activity.scheduled_for && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(activity.scheduled_for, 'short')}</span>
                        </div>
                      )}

                      {activity.duration_minutes && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{activity.duration_minutes}min</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{activity.user?.name || 'Sistema'}</span>
                      </div>

                      <span>•</span>
                      <span>{formatDistanceToNow(activity.created_at)}</span>
                    </div>
                  </div>

                  {/* Menu de ações */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingActivity(activity)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(activity)}>
                        {activity.status === 'completed' ? (
                          <>
                            <PlayCircle className="w-4 h-4 mr-2" />
                            Marcar como pendente
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Marcar como concluída
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteActivity(activity.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Form de criação/edição */}
      <TaskForm
        isOpen={showCreateForm || !!editingActivity}
        onClose={() => {
          setShowCreateForm(false);
          setEditingActivity(null);
        }}
        onSubmit={editingActivity ?
          (data) => handleUpdateActivity(editingActivity.id, data) :
          handleCreateActivity
        }
        task={editingActivity}
        leadId={leadId}
        leadName={leadName}
      />
    </div>
  );
};