import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  User,
  MessageSquare,
  Phone,
  Mail,
  Video,
  FileText,
  CheckSquare,
  Target,
  Coffee,
  Send,
  X,
  Palette
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RichActivityFormProps {
  onSubmit: (activity: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const activityTypes = [
  {
    id: 'call',
    label: 'Ligação',
    icon: Phone,
    color: '#10b981',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800'
  },
  {
    id: 'email',
    label: 'Email',
    icon: Mail,
    color: '#3b82f6',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  {
    id: 'meeting',
    label: 'Reunião',
    icon: Video,
    color: '#8b5cf6',
    bgColor: 'bg-violet-50 dark:bg-violet-950/20',
    borderColor: 'border-violet-200 dark:border-violet-800'
  },
  {
    id: 'note',
    label: 'Anotação',
    icon: MessageSquare,
    color: '#f59e0b',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
    borderColor: 'border-amber-200 dark:border-amber-800'
  },
  {
    id: 'task',
    label: 'Tarefa',
    icon: CheckSquare,
    color: '#ef4444',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
    borderColor: 'border-red-200 dark:border-red-800'
  },
  {
    id: 'follow_up',
    label: 'Follow-up',
    icon: Target,
    color: '#06b6d4',
    bgColor: 'bg-cyan-50 dark:bg-cyan-950/20',
    borderColor: 'border-cyan-200 dark:border-cyan-800'
  },
  {
    id: 'proposal',
    label: 'Proposta',
    icon: FileText,
    color: '#84cc16',
    bgColor: 'bg-lime-50 dark:bg-lime-950/20',
    borderColor: 'border-lime-200 dark:border-lime-800'
  },
  {
    id: 'lunch',
    label: 'Almoço',
    icon: Coffee,
    color: '#a855f7',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    borderColor: 'border-purple-200 dark:border-purple-800'
  }
];

const priorities = [
  { id: 'low', label: 'Baixa', color: '#22c55e' },
  { id: 'medium', label: 'Média', color: '#f59e0b' },
  { id: 'high', label: 'Alta', color: '#ef4444' },
  { id: 'urgent', label: 'Urgente', color: '#dc2626' }
];

export const RichActivityForm: React.FC<RichActivityFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [activity, setActivity] = useState({
    type: '',
    title: '',
    description: '',
    scheduledDate: undefined as Date | undefined,
    scheduledTime: '',
    duration: '',
    priority: 'medium',
    status: 'pending'
  });

  const selectedType = activityTypes.find(type => type.id === activity.type);

  const handleSubmit = async () => {
    if (!activity.type || !activity.title.trim()) return;

    const activityData = {
      ...activity,
      scheduled_for: activity.scheduledDate && activity.scheduledTime
        ? new Date(`${format(activity.scheduledDate, 'yyyy-MM-dd')} ${activity.scheduledTime}`)
        : undefined,
      duration_minutes: activity.duration ? parseInt(activity.duration) : undefined,
      metadata: {
        priority: activity.priority,
        color: selectedType?.color
      }
    };

    await onSubmit(activityData);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            Nova Atividade
          </h4>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Activity Type Selection */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Tipo de Atividade</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {activityTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = activity.type === type.id;

              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setActivity(prev => ({ ...prev, type: type.id }))}
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 hover:scale-105",
                    isSelected
                      ? `${type.bgColor} ${type.borderColor} shadow-md`
                      : "border-muted bg-background hover:bg-muted/50"
                  )}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: isSelected ? type.color : undefined }}
                  />
                  <span className={cn(
                    "text-xs font-medium",
                    isSelected ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {type.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div>
          <Label htmlFor="title" className="text-sm font-medium">
            Título *
          </Label>
          <Input
            id="title"
            value={activity.title}
            onChange={(e) => setActivity(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Ex: Ligação para cliente..."
            className="mt-1"
          />
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description" className="text-sm font-medium">
            Descrição
          </Label>
          <Textarea
            id="description"
            value={activity.description}
            onChange={(e) => setActivity(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Detalhes da atividade..."
            rows={3}
            className="mt-1"
          />
        </div>

        {/* Scheduling */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !activity.scheduledDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {activity.scheduledDate ? (
                    format(activity.scheduledDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                  ) : (
                    "Selecionar data"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={activity.scheduledDate}
                  onSelect={(date) => setActivity(prev => ({ ...prev, scheduledDate: date }))}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time */}
          <div>
            <Label htmlFor="time" className="text-sm font-medium">
              Horário
            </Label>
            <Input
              id="time"
              type="time"
              value={activity.scheduledTime}
              onChange={(e) => setActivity(prev => ({ ...prev, scheduledTime: e.target.value }))}
              className="mt-1"
            />
          </div>
        </div>

        {/* Duration and Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Duration */}
          <div>
            <Label htmlFor="duration" className="text-sm font-medium">
              Duração (minutos)
            </Label>
            <Input
              id="duration"
              type="number"
              value={activity.duration}
              onChange={(e) => setActivity(prev => ({ ...prev, duration: e.target.value }))}
              placeholder="Ex: 30"
              className="mt-1"
            />
          </div>

          {/* Priority */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Prioridade</Label>
            <Select
              value={activity.priority}
              onValueChange={(value) => setActivity(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((priority) => (
                  <SelectItem key={priority.id} value={priority.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: priority.color }}
                      />
                      {priority.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Status */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Status</Label>
          <Select
            value={activity.status}
            onValueChange={(value) => setActivity(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-yellow-600" />
                  Pendente
                </div>
              </SelectItem>
              <SelectItem value="completed">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-3 h-3 text-green-600" />
                  Concluído
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !activity.type || !activity.title.trim()}
            className="flex-1 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {isLoading ? 'Salvando...' : 'Adicionar Atividade'}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};