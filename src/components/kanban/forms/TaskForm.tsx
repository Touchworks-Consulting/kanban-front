import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Calendar, Clock, AlertTriangle, X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Activity, CreateActivityDto } from '../../../services/activity';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateActivityDto) => Promise<void>;
  task?: Activity | null; // Para edição
  leadId: string;
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

const PRIORITIES: Array<{ value: Activity['priority']; label: string; color: string }> = [
  { value: 'low', label: 'Baixa', color: 'text-green-600' },
  { value: 'medium', label: 'Média', color: 'text-yellow-600' },
  { value: 'high', label: 'Alta', color: 'text-orange-600' },
  { value: 'urgent', label: 'Urgente', color: 'text-red-600' }
];

export const TaskForm: React.FC<TaskFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  task,
  leadId
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

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Preencher formulário quando editando
  useEffect(() => {
    if (task) {
      setFormData({
        activity_type: task.activity_type,
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        scheduled_for: task.scheduled_for ? task.scheduled_for.slice(0, 16) : '', // Format para datetime-local
        reminder_at: task.reminder_at ? task.reminder_at.slice(0, 16) : '',
        duration_minutes: task.duration_minutes,
        status: task.status
      });
    } else {
      // Reset para criação
      setFormData({
        activity_type: 'task',
        title: '',
        description: '',
        priority: 'medium',
        scheduled_for: '',
        reminder_at: '',
        duration_minutes: undefined,
        status: 'pending'
      });
    }
    setErrors({});
  }, [task, isOpen]);

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
        ...formData,
        scheduled_for: formData.scheduled_for ? new Date(formData.scheduled_for).toISOString() : undefined,
        reminder_at: formData.reminder_at ? new Date(formData.reminder_at).toISOString() : undefined,
        duration_minutes: formData.duration_minutes || undefined
      };

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar atividade:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateActivityDto, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">
            {task ? 'Editar Atividade' : 'Nova Atividade'}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo de atividade */}
            <div className="space-y-2">
              <Label htmlFor="activity_type">Tipo de Atividade</Label>
              <Select
                value={formData.activity_type}
                onValueChange={(value) => handleChange('activity_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Ex: Ligar para apresentar proposta"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Detalhes adicionais sobre a atividade..."
                rows={3}
              />
            </div>

            {/* Prioridade */}
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map(priority => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <span className={priority.color}>{priority.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data/hora agendada */}
            <div className="space-y-2">
              <Label htmlFor="scheduled_for" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data e Hora Agendada
              </Label>
              <Input
                id="scheduled_for"
                type="datetime-local"
                value={formData.scheduled_for}
                onChange={(e) => handleChange('scheduled_for', e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
              {!formData.scheduled_for && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleChange('scheduled_for', getDefaultDateTime())}
                  className="text-xs"
                >
                  Definir para próxima hora
                </Button>
              )}
            </div>

            {/* Lembrete */}
            {formData.scheduled_for && (
              <div className="space-y-2">
                <Label htmlFor="reminder_at" className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Lembrete
                </Label>
                <Input
                  id="reminder_at"
                  type="datetime-local"
                  value={formData.reminder_at}
                  onChange={(e) => handleChange('reminder_at', e.target.value)}
                  max={formData.scheduled_for}
                  className={errors.reminder_at ? 'border-red-500' : ''}
                />
                {errors.reminder_at && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {errors.reminder_at}
                  </p>
                )}
              </div>
            )}

            {/* Duração */}
            <div className="space-y-2">
              <Label htmlFor="duration_minutes" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Duração (minutos)
              </Label>
              <Input
                id="duration_minutes"
                type="number"
                min="1"
                max="480"
                value={formData.duration_minutes || ''}
                onChange={(e) => handleChange('duration_minutes', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Ex: 30"
                className={errors.duration_minutes ? 'border-red-500' : ''}
              />
              {errors.duration_minutes && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.duration_minutes}
                </p>
              )}
            </div>

            {/* Ações */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="min-w-[100px]"
              >
                {loading ? 'Salvando...' : task ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};