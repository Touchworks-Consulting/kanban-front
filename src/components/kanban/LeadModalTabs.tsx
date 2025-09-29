import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import {
  Activity,
  Users,
  Paperclip,
  CheckSquare,
  FileText
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { LeadModalData } from '../../types/leadModal';
import { LeadTimelineTab } from './tabs/LeadTimelineTab';
import { LeadContactsTab } from './tabs/LeadContactsTab';
import { LeadFilesTab } from './tabs/LeadFilesTab';
import { TasksTab } from './tabs/TasksTab';

interface LeadModalTabsProps {
  leadId: string;
  modalData?: LeadModalData;
  onUpdate?: () => void;
}

export const LeadModalTabs: React.FC<LeadModalTabsProps> = ({
  leadId,
  modalData,
  onUpdate
}) => {
  const [activeTab, setActiveTab] = useState<'activities' | 'tasks' | 'notes' | 'files'>('activities');
  const [triggerNewTask, setTriggerNewTask] = useState(false);

  // Force browser cache refresh

  if (!modalData) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b bg-background">
          <div className="flex px-2">
            <div className="flex items-center gap-2 px-3 py-3">
              <div className="w-4 h-4 bg-muted rounded animate-pulse"></div>
              <div className="w-20 h-4 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'activities' as const,
      label: 'Atividades',
      icon: Activity,
      count: modalData.timeline?.length || 0,
      badge: modalData.timeline?.filter(a => a.status === 'pending').length || undefined,
      badgeVariant: 'destructive' as const
    },
    {
      id: 'tasks' as const,
      label: 'Tarefas',
      icon: CheckSquare,
      count: 0, // Será implementado quando integrarmos com a API
      badge: undefined, // Mostrará pending tasks
      badgeVariant: 'destructive' as const
    },
    {
      id: 'notes' as const,
      label: 'Anotações',
      icon: FileText,
      count: 0,
      badge: undefined,
      badgeVariant: 'default' as const
    },
    {
      id: 'files' as const,
      label: 'Arquivos',
      icon: Paperclip,
      count: modalData.files?.length || 0,
      badge: modalData.files?.filter(f => f.virus_scan_status === 'pending').length || undefined,
      badgeVariant: 'secondary' as const
    }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="border-b bg-background">
        <div className="flex items-center justify-between px-2">
          <div className="flex">
            {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <Button
                key={tab.id}
                variant="ghost"
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-none border-b-2 transition-colors text-base font-semibold",
                  isActive
                    ? "border-primary text-primary bg-accent shadow-sm scale-105"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="h-4 w-4" />
                <span className="truncate max-w-[120px] sm:max-w-[180px] md:max-w-[240px] lg:max-w-[320px] text-ellipsis">{tab.label}</span>

                {/* Count badge */}
                <Badge
                  variant="outline"
                  className="ml-1 text-xs"
                >
                  {tab.count}
                </Badge>

                {/* Status badge */}
                {tab.badge && tab.badge > 0 && (
                  <Badge
                    variant={tab.badgeVariant}
                    className="ml-1 text-xs h-4 w-4 rounded-full p-0 flex items-center justify-center"
                  >
                    {tab.badge}
                  </Badge>
                )}
              </Button>
            );
            })}
          </div>

          <div className="flex items-center gap-2 pr-3">
            <Button
              variant="ghost"
              size="sm"
              className="ml-2"
              onClick={() => {
                setActiveTab('tasks');
                setTriggerNewTask(true);
              }}
            >
              + Nova Atividade
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Content with ScrollArea */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {activeTab === 'activities' && (
            <LeadTimelineTab
              leadId={leadId}
              initialActivities={modalData.timeline || []}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksTab
              leadId={leadId}
              onUpdate={onUpdate}
              triggerNewTask={triggerNewTask}
              onNewTaskCreated={() => setTriggerNewTask(false)}
            />
          )}

          {activeTab === 'notes' && (
            <div className="p-6 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Aba de anotações em desenvolvimento
              </p>
            </div>
          )}

          {activeTab === 'files' && (
            <LeadFilesTab
              leadId={leadId}
              initialFiles={modalData.files || []}
            />
          )}
        </ScrollArea>
      </div>
    </div>
  );
};