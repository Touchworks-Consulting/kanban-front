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
  Search
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { LeadModalData } from '../../types/leadModal';
import { formatDate, formatDistanceToNow } from '../../utils/helpers';

interface ActivitiesAreaProps {
  leadId: string;
  modalData?: LeadModalData | null;
  onUpdate?: () => void;
  className?: string;
}

export const ActivitiesArea: React.FC<ActivitiesAreaProps> = ({
  leadId,
  modalData,
  onUpdate,
  className
}) => {
  const [activeTab, setActiveTab] = useState('timeline');

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
        return Phone;
      case 'email':
        return Mail;
      case 'meeting':
        return Calendar;
      case 'note':
        return MessageSquare;
      case 'task':
        return CheckCircle;
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
      case 'meeting':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'note':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'task':
        return 'text-red-600 bg-red-50 border-red-200';
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
      {/* Header da área de atividades */}
      <div className="border-b px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-foreground">Atividades</h2>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-6 px-2">
                <Filter className="w-3 h-3 mr-1" />
                <span className="text-xs">Filtros</span>
              </Button>
              <Button variant="ghost" size="sm" className="h-6 px-2">
                <Search className="w-3 h-3 mr-1" />
                <span className="text-xs">Buscar</span>
              </Button>
            </div>
          </div>
          <Button variant="default" size="sm">
            <Plus className="w-3 h-3 mr-1" />
            <span className="text-xs">Nova atividade</span>
          </Button>
        </div>
      </div>

      {/* Navegação de tabs */}
      <div className="border-b flex-shrink-0">
        <div className="flex">
          <Button
            variant={activeTab === 'timeline' ? 'default' : 'ghost'}
            className={cn(
              'rounded-none border-b-2 px-4 py-3',
              activeTab === 'timeline'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-transparent hover:bg-muted'
            )}
            onClick={() => setActiveTab('timeline')}
          >
            <Activity className="w-4 h-4 mr-2" />
            Timeline
            <Badge variant="secondary" className="ml-2">
              {activities.length}
            </Badge>
          </Button>
          <Button
            variant={activeTab === 'contacts' ? 'default' : 'ghost'}
            className={cn(
              'rounded-none border-b-2 px-4 py-3',
              activeTab === 'contacts'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-transparent hover:bg-muted'
            )}
            onClick={() => setActiveTab('contacts')}
          >
            <Users className="w-4 h-4 mr-2" />
            Contatos
            <Badge variant="secondary" className="ml-2">
              {contacts.length}
            </Badge>
          </Button>
          <Button
            variant={activeTab === 'files' ? 'default' : 'ghost'}
            className={cn(
              'rounded-none border-b-2 px-4 py-3',
              activeTab === 'files'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-transparent hover:bg-muted'
            )}
            onClick={() => setActiveTab('files')}
          >
            <Paperclip className="w-4 h-4 mr-2" />
            Arquivos
            <Badge variant="secondary" className="ml-2">
              {files.length}
            </Badge>
          </Button>
        </div>
      </div>

      {/* Conteúdo das tabs */}
      <div className="flex-1 min-h-0">
        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
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
                            <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
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
                  <div className="text-center py-12">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhuma atividade ainda
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Comece registrando uma ligação, email ou reunião com este lead
                    </p>
                    <Button variant="default">
                      <Plus className="h-4 w-4 mr-2" />
                      Primeira atividade
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
            <ScrollArea className="h-full">
              <div className="p-6">
                {contacts.length > 0 ? (
                  <div className="space-y-4">
                    {contacts.map((contact) => (
                      <div key={contact.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{contact.name}</h4>
                            {contact.email && (
                              <p className="text-sm text-gray-600">{contact.email}</p>
                            )}
                            {contact.phone && (
                              <p className="text-sm text-gray-600">{contact.phone}</p>
                            )}
                            {contact.is_primary && (
                              <Badge variant="outline" className="mt-2">
                                Contato principal
                              </Badge>
                            )}
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum contato adicionado
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Adicione pessoas relacionadas a este negócio
                    </p>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar contato
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
        )}

        {/* Files Tab */}
        {activeTab === 'files' && (
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
                  <div className="text-center py-12">
                    <Paperclip className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum arquivo anexado
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Faça upload de propostas, contratos ou outros documentos
                    </p>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Anexar arquivo
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
        )}
      </div>
    </div>
  );
};