import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Calendar } from '../../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { Calendar as CalendarIcon, Clock, AlertTriangle, X, Bell, Phone, Mail, MessageSquare, Users, FileText, CheckSquare, Target, ChevronUp, ChevronDown, Minus, AlertOctagon } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Activity, CreateActivityDto } from '../../../services/activity';
import { activityReminderService } from '../../../services/activityReminderService';
import type { ActivityReminder } from '../../../services/activityReminderService';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateActivityDto) => Promise<void>;
  task?: Activity | null; // Para edição
  leadId: string;
  leadName?: string; // Nome do lead para auto-preenchimento
}

const ACTIVITY_TYPES: Array<{ value: Activity['activity_type']; label: string; description: string }> = [
  { value: 'task', label: 'Tarefa', description: 'Atividade geral a ser realizada' },
  { value: 'call', label: 'Ligação', description: 'Ligar para o lead' },
  { value: 'email', label: 'Email', description: 'Enviar email para o lead' },
  { value: 'whatsapp', label: 'WhatsApp', description: 'Entrar em contato via WhatsApp' },
  { value: 'meeting', label: 'Reunião', description: 'Agendar reunião presencial ou online' },
  { value: 'follow_up', label: 'Follow-up', description: 'Acompanhamento do lead' },
  { value: 'note', label: 'Nota', description: 'Registrar informação importante' }
];

const PRIORITIES: Array<{
  value: Activity['priority'];
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = [
  {
    value: 'low',
    label: 'Baixa',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    icon: <ChevronDown className="w-4 h-4 text-green-600" />
  },
  {
    value: 'medium',
    label: 'Média',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50 border-yellow-200',
    icon: <Minus className="w-4 h-4 text-yellow-600" />
  },
  {
    value: 'high',
    label: 'Alta',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50 border-orange-200',
    icon: <ChevronUp className="w-4 h-4 text-orange-600" />
  },
  {
    value: 'urgent',
    label: 'Urgente',
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
    icon: (
      <div className="flex items-center">
        <ChevronUp className="w-3 h-3 text-red-600 -mr-1" />
        <ChevronUp className="w-3 h-3 text-red-600" />
      </div>
    )
  }
];

export const TaskForm: React.FC<TaskFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  task,
  leadId,
  leadName
}) => {
  const [formData, setFormData] = useState<CreateActivityDto>({
    activity_type: 'task',
    title: '',
    description: '',
    priority: 'medium',
    scheduled_for: '',
    reminder_at: '',
    duration_minutes: undefined,
    status: 'pending'
  });

  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [reminderDate, setReminderDate] = useState<Date | undefined>();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Função para gerar título automático
  const generateAutoTitle = (activityType: Activity['activity_type']): string => {
    if (!leadName) return '';

    const titleMap = {
      'call': `Ligar para ${leadName}`,
      'email': `Enviar email para ${leadName}`,
      'whatsapp': `Mensagem WhatsApp para ${leadName}`,
      'meeting': `Reunião com ${leadName}`,
      'follow_up': `Follow-up com ${leadName}`,
      'note': `Anotação sobre ${leadName}`,
      'task': `Tarefa relacionada a ${leadName}`
    };

    return titleMap[activityType] || `Atividade para ${leadName}`;
  };

  // Preencher formulário quando editando
  useEffect(() => {
    if (task) {
      setFormData({
        activity_type: task.activity_type,
        title: task.title,
        description: task.description || '',
        priority: task.priority || 'medium', // Garantir valor padrão
        scheduled_for: task.scheduled_for || '',
        reminder_at: task.reminder_at || '',
        duration_minutes: task.duration_minutes,
        status: task.status || 'pending' // Garantir valor padrão
      });
      // Converter strings para Date objects para os datepickers
      setScheduledDate(task.scheduled_for ? new Date(task.scheduled_for) : undefined);
      setReminderDate(task.reminder_at ? new Date(task.reminder_at) : undefined);
    } else {
      // Reset para criação com título auto-gerado
      setFormData({
        activity_type: 'task',
        title: generateAutoTitle('task'),
        description: '',
        priority: 'medium',
        scheduled_for: '',
        reminder_at: '',
        duration_minutes: undefined,
        status: 'pending'
      });
      setScheduledDate(undefined);
      setReminderDate(undefined);
    }
    setErrors({});
  }, [task, isOpen, leadName]);

  // Auto-atualizar título quando tipo de atividade muda (apenas para criação)
  useEffect(() => {
    if (!task && formData.activity_type) {
      const newTitle = generateAutoTitle(formData.activity_type);
      if (newTitle && newTitle !== formData.title) {
        setFormData(prev => ({ ...prev, title: newTitle }));
      }
    }
  }, [formData.activity_type, task, leadName]);

  // Handlers para mudanças de data
  const handleScheduledDateChange = (date: Date | undefined) => {
    setScheduledDate(date);
    setFormData(prev => ({
      ...prev,
      scheduled_for: date ? date.toISOString() : ''
    }));
  };

  const handleReminderDateChange = (date: Date | undefined) => {
    setReminderDate(date);
    setFormData(prev => ({
      ...prev,
      reminder_at: date ? date.toISOString() : ''
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (formData.scheduled_for && formData.reminder_at) {
      const scheduledDate = new Date(formData.scheduled_for);
      const reminderDate = new Date(formData.reminder_at);

      if (reminderDate >= scheduledDate) {
        newErrors.reminder_at = 'Lembrete deve ser anterior à data agendada';
      }
    }

    if (formData.duration_minutes && formData.duration_minutes < 1) {
      newErrors.duration_minutes = 'Duração deve ser maior que 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Converter datas para ISO string se preenchidas
      const submitData: CreateActivityDto = {
        activity_type: formData.activity_type,
        title: formData.title,
        description: formData.description,
        scheduled_for: formData.scheduled_for ? new Date(formData.scheduled_for).toISOString() : undefined,
        priority: formData.priority, // Reativado temporariamente
        // reminder_at: formData.reminder_at ? new Date(formData.reminder_at).toISOString() : undefined, // Temporariamente removido
        duration_minutes: formData.duration_minutes || undefined,
        status: formData.status
      };

      const savedActivity = await onSubmit(submitData);

      // TODO: Temporariamente desabilitado até migração das colunas priority e reminder_at
      // if (submitData.reminder_at && submitData.scheduled_for) {
      //   try {
      //     const reminderData: ActivityReminder = {
      //       id: `reminder-${leadId}-${Date.now()}`,
      //       activityId: (savedActivity as any)?.id || `temp-${Date.now()}`,
      //       leadId: leadId,
      //       title: formData.title,
      //       body: `${formData.description || 'Sem descrição'}\nAgendado para: ${format(new Date(submitData.scheduled_for), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`,
      //       scheduledFor: new Date(submitData.scheduled_for),
      //       reminderAt: new Date(submitData.reminder_at),
      //       priority: formData.priority,
      //       activityType: formData.activity_type
      //     };

      //     const reminderScheduled = await activityReminderService.scheduleReminder(reminderData);
      //     if (reminderScheduled) {
      //       console.log('Lembrete de notificação agendado com sucesso');
      //     }
      //   } catch (reminderError) {
      //     console.warn('Erro ao agendar lembrete de notificação:', reminderError);
      //   }
      // }

      onClose();
    } catch (error) {
      console.error('Erro ao salvar atividade:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateActivityDto, value: any) => {
    // Garantir valores padrões para enums que não podem ser vazios
    let sanitizedValue = value;
    if (field === 'priority' && (!value || value === '')) {
      sanitizedValue = 'medium';
    }
    if (field === 'status' && (!value || value === '')) {
      sanitizedValue = 'pending';
    }

    setFormData(prev => ({
      ...prev,
      [field]: sanitizedValue
    }));

    // Limpar erro do campo quando usuário digita
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Definir data/hora padrão (próxima hora redonda)
  const getDefaultDateTime = () => {
    const now = new Date();
    const nextHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0);
    return nextHour.toISOString().slice(0, 16);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="min-h-full w-full flex items-center justify-center py-4">
        <Card className="w-full max-w-xl mx-auto max-h-[90vh] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-4 h-4 text-primary" />
              </div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {task ? 'Editar Atividade' : 'Nova Atividade'}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </CardHeader>

          <CardContent className="max-h-[75vh] overflow-y-auto px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Primeira linha: Tipo + Prioridade */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="activity_type" className="text-xs font-medium text-gray-700">Tipo</Label>
                <Select
                  value={formData.activity_type}
                  onValueChange={(value) => handleChange('activity_type', value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPES.map(type => {
                      const getTypeIcon = (activityType: Activity['activity_type']) => {
                        const iconClass = "w-4 h-4 mr-2";
                        switch (activityType) {
                          case 'call': return <Phone className={cn(iconClass, "text-green-600")} />;
                          case 'email': return <Mail className={cn(iconClass, "text-blue-600")} />;
                          case 'whatsapp': return <MessageSquare className={cn(iconClass, "text-green-600")} />;
                          case 'meeting': return <Users className={cn(iconClass, "text-purple-600")} />;
                          case 'note': return <FileText className={cn(iconClass, "text-orange-600")} />;
                          case 'task': return <CheckSquare className={cn(iconClass, "text-gray-600")} />;
                          case 'follow_up': return <Target className={cn(iconClass, "text-indigo-600")} />;
                          default: return <CheckSquare className={cn(iconClass, "text-gray-600")} />;
                        }
                      };

                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center text-sm">
                            {getTypeIcon(type.value)}
                            {type.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Prioridade com ícones estilo Jira */}
              <div className="space-y-1">
                <Label htmlFor="priority" className="text-xs font-medium text-gray-700">Prioridade</Label>
                <Select
                  value={formData.priority || 'medium'}
                  onValueChange={(value) => handleChange('priority', value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>
                        <div className="flex items-center gap-2">
                          <div className={cn("flex items-center justify-center w-5 h-5 rounded border", priority.bgColor)}>
                            {priority.icon}
                          </div>
                          <span className={cn("text-sm font-medium", priority.color)}>
                            {priority.label}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Duração */}
              <div className="space-y-1">
                <Label htmlFor="duration_minutes" className="text-xs font-medium text-gray-700">Duração (min)</Label>
                <Input
                  id="duration_minutes"
                  type="number"
                  min="1"
                  max="480"
                  value={formData.duration_minutes || ''}
                  onChange={(e) => handleChange('duration_minutes', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="30"
                  className={cn("h-8", errors.duration_minutes ? 'border-red-500' : '')}
                />
              </div>
            </div>

            {/* Título */}
            <div className="space-y-1">
              <Label htmlFor="title" className="text-xs font-medium text-gray-700">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Ex: Ligar para apresentar proposta"
                className={cn("h-8", errors.title ? 'border-red-500' : '')}
              />
              {errors.title && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertTriangle className="w-2 h-2" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Descrição */}
            <div className="space-y-1">
              <Label htmlFor="description" className="text-xs font-medium text-gray-700">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Detalhes adicionais..."
                rows={2}
                className="text-sm resize-none"
              />
            </div>

            {/* Data/hora agendada */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" />
                Agendamento
              </Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal flex-1 h-8 text-xs",
                        !scheduledDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {scheduledDate ? (
                        format(scheduledDate, "dd/MM", { locale: ptBR })
                      ) : (
                        <span>Data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={handleScheduledDateChange}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="time"
                  value={scheduledDate ? format(scheduledDate, "HH:mm") : ""}
                  onChange={(e) => {
                    if (e.target.value) {
                      const [hours, minutes] = e.target.value.split(":").map(Number);
                      const newDate = scheduledDate || new Date();
                      newDate.setHours(hours, minutes);
                      handleScheduledDateChange(newDate);
                    }
                  }}
                  className="w-20 h-8 text-xs"
                  placeholder="--:--"
                />
              </div>
            </div>

            {/* Ações */}
            <div className="flex justify-end gap-3 pt-4 border-t mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="h-9 px-4 text-sm font-medium"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="h-9 px-6 text-sm font-medium"
              >
                {loading ? 'Salvando...' : task ? 'Atualizar' : 'Criar Atividade'}
              </Button>
            </div>
          </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};