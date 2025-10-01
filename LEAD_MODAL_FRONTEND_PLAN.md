# 🎨 **Plano Frontend: Modal de Lead Enterprise**

## 🎯 **Objetivo**
Transformar o modal atual de edição de lead em uma interface enterprise com abas, timeline, gestão de tarefas e arquivos, elevando a experiência do usuário ao nível dos CRMs líderes de mercado.

## 🏗️ **Nova Arquitetura do Modal**

### **Layout Principal: Modal Expandido**
```typescript
<Dialog maxWidth="4xl" className="lead-modal-enterprise">
  <DialogHeader>
    <LeadHeader lead={lead} onClose={onClose} />
  </DialogHeader>

  <DialogContent>
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">🔍 Visão Geral</TabsTrigger>
        <TabsTrigger value="contacts">📞 Contatos</TabsTrigger>
        <TabsTrigger value="tasks">📋 Tarefas</TabsTrigger>
        <TabsTrigger value="files">📎 Arquivos</TabsTrigger>
        <TabsTrigger value="custom">⚙️ Campos Extras</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <OverviewTab />
      </TabsContent>
      <TabsContent value="contacts">
        <ContactsTab />
      </TabsContent>
      <TabsContent value="tasks">
        <TasksTab />
      </TabsContent>
      <TabsContent value="files">
        <FilesTab />
      </TabsContent>
      <TabsContent value="custom">
        <CustomFieldsTab />
      </TabsContent>
    </Tabs>
  </DialogContent>
</Dialog>
```

## 📋 **Componentes a Serem Criados**

### **1. LeadModalEnterprise (Componente Principal)**
```typescript
// src/components/kanban/LeadModalEnterprise.tsx
interface LeadModalEnterpriseProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onUpdate: (leadId: string, data: UpdateLeadDto) => Promise<void>;
  onDelete?: (leadId: string) => Promise<void>;
}

export const LeadModalEnterprise: React.FC<LeadModalEnterpriseProps> = ({
  isOpen,
  onClose,
  lead,
  onUpdate,
  onDelete
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [leadData, setLeadData] = useState<Lead | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Estados para cada aba
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [contacts, setContacts] = useState<LeadContact[]>([]);
  const [tasks, setTasks] = useState<LeadTask[]>([]);
  const [files, setFiles] = useState<LeadFile[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<CustomFieldValue[]>([]);

  // Carregar dados quando modal abre
  useEffect(() => {
    if (isOpen && lead) {
      loadLeadData();
    }
  }, [isOpen, lead]);

  const loadLeadData = async () => {
    try {
      const [
        activitiesData,
        contactsData,
        tasksData,
        filesData,
        customData
      ] = await Promise.all([
        leadService.getActivities(lead.id),
        leadService.getContacts(lead.id),
        leadService.getTasks(lead.id),
        leadService.getFiles(lead.id),
        leadService.getCustomFieldValues(lead.id)
      ]);

      setActivities(activitiesData);
      setContacts(contactsData);
      setTasks(tasksData);
      setFiles(filesData);
      setCustomFieldValues(customData);
    } catch (error) {
      console.error('Error loading lead data:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} maxWidth="4xl">
      <DialogContent className="lead-modal-enterprise">
        <LeadHeader
          lead={lead}
          onClose={onClose}
          onDelete={onDelete}
          unsavedChanges={unsavedChanges}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="modal-tabs">
            <TabsTrigger value="overview" className="tab-overview">
              <Eye className="w-4 h-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="contacts" className="tab-contacts">
              <Phone className="w-4 h-4 mr-2" />
              Contatos
              {contacts.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {contacts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="tasks" className="tab-tasks">
              <CheckSquare className="w-4 h-4 mr-2" />
              Tarefas
              {tasks.filter(t => t.status === 'pending').length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {tasks.filter(t => t.status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="files" className="tab-files">
              <Paperclip className="w-4 h-4 mr-2" />
              Arquivos
              {files.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {files.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="custom" className="tab-custom">
              <Settings className="w-4 h-4 mr-2" />
              Campos Extras
            </TabsTrigger>
          </TabsList>

          <div className="tab-content">
            <TabsContent value="overview">
              <OverviewTab
                lead={lead}
                activities={activities}
                onLeadUpdate={handleLeadUpdate}
                onActivityAdd={handleActivityAdd}
              />
            </TabsContent>

            <TabsContent value="contacts">
              <ContactsTab
                leadId={lead?.id}
                contacts={contacts}
                onContactsChange={setContacts}
              />
            </TabsContent>

            <TabsContent value="tasks">
              <TasksTab
                leadId={lead?.id}
                tasks={tasks}
                onTasksChange={setTasks}
              />
            </TabsContent>

            <TabsContent value="files">
              <FilesTab
                leadId={lead?.id}
                files={files}
                onFilesChange={setFiles}
              />
            </TabsContent>

            <TabsContent value="custom">
              <CustomFieldsTab
                leadId={lead?.id}
                values={customFieldValues}
                onValuesChange={setCustomFieldValues}
              />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
```

### **2. OverviewTab - Visão Geral + Timeline**
```typescript
// src/components/kanban/tabs/OverviewTab.tsx
interface OverviewTabProps {
  lead: Lead;
  activities: LeadActivity[];
  onLeadUpdate: (data: Partial<Lead>) => void;
  onActivityAdd: (activity: CreateActivityDto) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  lead,
  activities,
  onLeadUpdate,
  onActivityAdd
}) => {
  return (
    <div className="overview-tab">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lado Esquerdo: Dados Principais */}
        <div className="lead-main-data">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações Principais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LeadBasicForm
                lead={lead}
                onChange={onLeadUpdate}
              />
            </CardContent>
          </Card>

          {/* Score de Engajamento */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Score de Engajamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LeadEngagementScore
                score={lead.score}
                engagementLevel={lead.engagement_level}
                factors={lead.score_factors}
              />
            </CardContent>
          </Card>
        </div>

        {/* Lado Direito: Timeline */}
        <div className="lead-timeline">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Timeline de Atividades
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddActivity(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LeadTimeline
                activities={activities}
                onActivityAdd={onActivityAdd}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
```

### **3. ContactsTab - Múltiplos Contatos**
```typescript
// src/components/kanban/tabs/ContactsTab.tsx
interface ContactsTabProps {
  leadId: string;
  contacts: LeadContact[];
  onContactsChange: (contacts: LeadContact[]) => void;
}

export const ContactsTab: React.FC<ContactsTabProps> = ({
  leadId,
  contacts,
  onContactsChange
}) => {
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [editingContact, setEditingContact] = useState<LeadContact | null>(null);

  const handleAddContact = async (contactData: CreateContactDto) => {
    try {
      const newContact = await leadContactService.create(leadId, contactData);
      onContactsChange([...contacts, newContact]);
      setIsAddingContact(false);
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  const handleUpdateContact = async (contactId: string, data: UpdateContactDto) => {
    try {
      const updatedContact = await leadContactService.update(contactId, data);
      onContactsChange(contacts.map(c => c.id === contactId ? updatedContact : c));
      setEditingContact(null);
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      await leadContactService.delete(contactId);
      onContactsChange(contacts.filter(c => c.id !== contactId));
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  return (
    <div className="contacts-tab">
      <div className="contacts-header">
        <h3 className="text-lg font-medium">Contatos do Lead</h3>
        <Button onClick={() => setIsAddingContact(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Contato
        </Button>
      </div>

      <div className="contacts-grid">
        {/* Telefones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Telefones
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contacts
              .filter(c => c.type === 'phone')
              .map(contact => (
                <ContactItem
                  key={contact.id}
                  contact={contact}
                  onEdit={setEditingContact}
                  onDelete={handleDeleteContact}
                />
              ))
            }
            {contacts.filter(c => c.type === 'phone').length === 0 && (
              <p className="text-muted-foreground text-sm">Nenhum telefone cadastrado</p>
            )}
          </CardContent>
        </Card>

        {/* Emails */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Emails
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contacts
              .filter(c => c.type === 'email')
              .map(contact => (
                <ContactItem
                  key={contact.id}
                  contact={contact}
                  onEdit={setEditingContact}
                  onDelete={handleDeleteContact}
                />
              ))
            }
            {contacts.filter(c => c.type === 'email').length === 0 && (
              <p className="text-muted-foreground text-sm">Nenhum email cadastrado</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal para adicionar/editar contato */}
      <ContactFormModal
        isOpen={isAddingContact || !!editingContact}
        onClose={() => {
          setIsAddingContact(false);
          setEditingContact(null);
        }}
        contact={editingContact}
        onSubmit={editingContact ? handleUpdateContact : handleAddContact}
      />
    </div>
  );
};
```

### **4. TasksTab - Gestão de Tarefas**
```typescript
// src/components/kanban/tabs/TasksTab.tsx
interface TasksTabProps {
  leadId: string;
  tasks: LeadTask[];
  onTasksChange: (tasks: LeadTask[]) => void;
}

export const TasksTab: React.FC<TasksTabProps> = ({
  leadId,
  tasks,
  onTasksChange
}) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<LeadTask | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return task.status === 'pending';
    if (filter === 'completed') return task.status === 'completed';
    return true;
  });

  const handleAddTask = async (taskData: CreateTaskDto) => {
    try {
      const newTask = await leadTaskService.create(leadId, taskData);
      onTasksChange([...tasks, newTask]);
      setIsAddingTask(false);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleUpdateTask = async (taskId: string, data: UpdateTaskDto) => {
    try {
      const updatedTask = await leadTaskService.update(taskId, data);
      onTasksChange(tasks.map(t => t.id === taskId ? updatedTask : t));
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleToggleTaskStatus = async (task: LeadTask) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await handleUpdateTask(task.id, {
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : null
    });
  };

  return (
    <div className="tasks-tab">
      <div className="tasks-header">
        <div>
          <h3 className="text-lg font-medium">Tarefas e Follow-ups</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie lembretes e acompanhamentos do lead
          </p>
        </div>
        <Button onClick={() => setIsAddingTask(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      {/* Filtros */}
      <div className="tasks-filters">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas ({tasks.length})</SelectItem>
            <SelectItem value="pending">
              Pendentes ({tasks.filter(t => t.status === 'pending').length})
            </SelectItem>
            <SelectItem value="completed">
              Concluídas ({tasks.filter(t => t.status === 'completed').length})
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Tarefas */}
      <div className="tasks-list">
        {filteredTasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onToggleStatus={handleToggleTaskStatus}
            onEdit={setEditingTask}
            onDelete={handleDeleteTask}
          />
        ))}

        {filteredTasks.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <CheckSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">
                Nenhuma tarefa encontrada
              </p>
              <Button
                variant="outline"
                onClick={() => setIsAddingTask(true)}
              >
                Criar primeira tarefa
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal para adicionar/editar tarefa */}
      <TaskFormModal
        isOpen={isAddingTask || !!editingTask}
        onClose={() => {
          setIsAddingTask(false);
          setEditingTask(null);
        }}
        task={editingTask}
        leadId={leadId}
        onSubmit={editingTask ? handleUpdateTask : handleAddTask}
      />
    </div>
  );
};
```

### **5. FilesTab - Gestão de Arquivos**
```typescript
// src/components/kanban/tabs/FilesTab.tsx
interface FilesTabProps {
  leadId: string;
  files: LeadFile[];
  onFilesChange: (files: LeadFile[]) => void;
}

export const FilesTab: React.FC<FilesTabProps> = ({
  leadId,
  files,
  onFilesChange
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (file: File, description?: string) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadedFile = await leadFileService.upload(leadId, file, {
        description,
        onUploadProgress: (progress) => setUploadProgress(progress)
      });

      onFilesChange([uploadedFile, ...files]);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileDelete = async (fileId: string) => {
    try {
      await leadFileService.delete(fileId);
      onFilesChange(files.filter(f => f.id !== fileId));
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('image')) return <ImageIcon className="w-6 h-6" />;
    if (mimeType.includes('pdf')) return <FileText className="w-6 h-6" />;
    if (mimeType.includes('word')) return <FileText className="w-6 h-6" />;
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return <Sheet className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  return (
    <div className="files-tab">
      <div className="files-header">
        <div>
          <h3 className="text-lg font-medium">Arquivos e Documentos</h3>
          <p className="text-sm text-muted-foreground">
            Anexos, propostas, contratos e outros documentos
          </p>
        </div>
        <div className="upload-actions">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
            multiple={false}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={isUploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            Selecionar Arquivo
          </Button>
        </div>
      </div>

      {/* Área de Drop */}
      <div
        className={cn(
          "upload-dropzone border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-border",
          isUploading && "opacity-50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="upload-progress">
            <Upload className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Enviando arquivo...
            </p>
            <Progress value={uploadProgress} className="w-48 mx-auto" />
            <p className="text-xs text-muted-foreground mt-2">
              {uploadProgress}%
            </p>
          </div>
        ) : (
          <div>
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">
              Arraste arquivos aqui ou clique para selecionar
            </p>
            <p className="text-xs text-muted-foreground">
              Suporte: PDF, DOC, XLS, PPT, JPG, PNG (máx. 10MB)
            </p>
          </div>
        )}
      </div>

      {/* Lista de Arquivos */}
      <div className="files-grid">
        {files.map(file => (
          <Card key={file.id} className="file-card">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="file-icon text-muted-foreground">
                  {getFileIcon(file.mime_type)}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate" title={file.original_filename}>
                    {file.original_filename}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(file.file_size)}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(file.created_at), 'dd/MM/yyyy')}
                    </span>
                  </div>
                  {file.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {file.description}
                    </p>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => leadFileService.download(file.id)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => window.open(`/api/files/${file.id}/preview`, '_blank')}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Visualizar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleFileDelete(file.id)}
                      className="text-destructive"
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}

        {files.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">
                Nenhum arquivo anexado
              </p>
              <Button
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                Adicionar primeiro arquivo
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
```

### **6. CustomFieldsTab - Campos Personalizados**
```typescript
// src/components/kanban/tabs/CustomFieldsTab.tsx
interface CustomFieldsTabProps {
  leadId: string;
  values: CustomFieldValue[];
  onValuesChange: (values: CustomFieldValue[]) => void;
}

export const CustomFieldsTab: React.FC<CustomFieldsTabProps> = ({
  leadId,
  values,
  onValuesChange
}) => {
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCustomFields();
  }, []);

  const loadCustomFields = async () => {
    try {
      const fields = await customFieldService.list('lead');
      setCustomFields(fields);
    } catch (error) {
      console.error('Error loading custom fields:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (fieldId: string, value: any) => {
    const existingValueIndex = values.findIndex(v => v.custom_field_id === fieldId);

    if (existingValueIndex >= 0) {
      const newValues = [...values];
      newValues[existingValueIndex] = {
        ...newValues[existingValueIndex],
        value: JSON.stringify(value)
      };
      onValuesChange(newValues);
    } else {
      onValuesChange([...values, {
        id: `temp-${fieldId}`,
        lead_id: leadId,
        custom_field_id: fieldId,
        value: JSON.stringify(value),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const valuesToSave = values.map(v => ({
        custom_field_id: v.custom_field_id,
        value: v.value
      }));

      const savedValues = await customFieldService.setLeadValues(leadId, valuesToSave);
      onValuesChange(savedValues);
    } catch (error) {
      console.error('Error saving custom field values:', error);
    } finally {
      setSaving(false);
    }
  };

  const getFieldValue = (fieldId: string) => {
    const value = values.find(v => v.custom_field_id === fieldId);
    if (!value) return '';

    try {
      return JSON.parse(value.value);
    } catch {
      return value.value;
    }
  };

  const renderField = (field: CustomField) => {
    const currentValue = getFieldValue(field.id);

    switch (field.field_type) {
      case 'text':
        return (
          <Input
            value={currentValue}
            onChange={(e) => handleValueChange(field.id, e.target.value)}
            placeholder={`Digite ${field.label.toLowerCase()}...`}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={currentValue}
            onChange={(e) => handleValueChange(field.id, e.target.value)}
            placeholder={`Digite ${field.label.toLowerCase()}...`}
            rows={3}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={currentValue}
            onChange={(e) => handleValueChange(field.id, e.target.value)}
            placeholder="0"
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={currentValue}
            onChange={(e) => handleValueChange(field.id, e.target.value)}
          />
        );

      case 'select':
        return (
          <Select value={currentValue} onValueChange={(value) => handleValueChange(field.id, value)}>
            <SelectTrigger>
              <SelectValue placeholder={`Selecionar ${field.label.toLowerCase()}...`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: any) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={currentValue === true}
              onCheckedChange={(checked) => handleValueChange(field.id, checked)}
            />
            <Label>{currentValue ? 'Sim' : 'Não'}</Label>
          </div>
        );

      default:
        return (
          <Input
            value={currentValue}
            onChange={(e) => handleValueChange(field.id, e.target.value)}
            placeholder={`Digite ${field.label.toLowerCase()}...`}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="custom-fields-tab">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="custom-fields-tab">
      <div className="custom-fields-header">
        <div>
          <h3 className="text-lg font-medium">Campos Personalizados</h3>
          <p className="text-sm text-muted-foreground">
            Informações específicas configuradas para sua conta
          </p>
        </div>
        {customFields.length > 0 && (
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        )}
      </div>

      {customFields.length > 0 ? (
        <div className="custom-fields-form space-y-6">
          {customFields.map(field => (
            <div key={field.id} className="field-group">
              <Label htmlFor={field.id} className="text-sm font-medium">
                {field.label}
                {field.is_required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
              <div className="mt-1">
                {renderField(field)}
              </div>
              {field.validation_rules?.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {field.validation_rules.description}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Settings className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">
              Nenhum campo personalizado configurado
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Configure campos personalizados nas configurações da conta
            </p>
            <Button variant="outline">
              Ir para Configurações
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
```

## 🔧 **Services e Hooks**

### **1. LeadService (expandido)**
```typescript
// src/services/lead.ts (adicionar métodos)
export const leadService = {
  // ... métodos existentes ...

  // Activities
  async getActivities(leadId: string): Promise<LeadActivity[]> {
    const response = await api.get(`/api/leads/${leadId}/activities`);
    return response.data.activities;
  },

  async addActivity(leadId: string, data: CreateActivityDto): Promise<LeadActivity> {
    const response = await api.post(`/api/leads/${leadId}/activities`, data);
    return response.data.activity;
  },

  // Contacts
  async getContacts(leadId: string): Promise<LeadContact[]> {
    const response = await api.get(`/api/leads/${leadId}/contacts`);
    return response.data.contacts;
  },

  // Tasks
  async getTasks(leadId: string): Promise<LeadTask[]> {
    const response = await api.get(`/api/leads/${leadId}/tasks`);
    return response.data.tasks;
  },

  // Files
  async getFiles(leadId: string): Promise<LeadFile[]> {
    const response = await api.get(`/api/leads/${leadId}/files`);
    return response.data.files;
  },

  // Custom Fields
  async getCustomFieldValues(leadId: string): Promise<CustomFieldValue[]> {
    const response = await api.get(`/api/custom-fields/leads/${leadId}/values`);
    return response.data.values;
  }
};
```

### **2. LeadContactService**
```typescript
// src/services/leadContact.ts
export interface LeadContact {
  id: string;
  lead_id: string;
  type: 'phone' | 'email';
  label: 'primary' | 'secondary' | 'work' | 'personal' | 'mobile' | 'home';
  value: string;
  is_primary: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateContactDto {
  type: 'phone' | 'email';
  label: string;
  value: string;
  is_primary?: boolean;
}

export const leadContactService = {
  async create(leadId: string, data: CreateContactDto): Promise<LeadContact> {
    const response = await api.post(`/api/leads/${leadId}/contacts`, data);
    return response.data.contact;
  },

  async update(contactId: string, data: Partial<CreateContactDto>): Promise<LeadContact> {
    const response = await api.put(`/api/lead-contacts/${contactId}`, data);
    return response.data.contact;
  },

  async delete(contactId: string): Promise<void> {
    await api.delete(`/api/lead-contacts/${contactId}`);
  }
};
```

### **3. LeadTaskService**
```typescript
// src/services/leadTask.ts
export interface LeadTask {
  id: string;
  lead_id: string;
  assigned_to_user_id: string;
  created_by_user_id: string;
  title: string;
  description?: string;
  type: 'call' | 'email' | 'meeting' | 'follow_up' | 'proposal' | 'contract';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date?: string;
  completed_at?: string;
  reminder_at?: string;
  assignedUser?: User;
  createdByUser?: User;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  type: LeadTask['type'];
  priority: LeadTask['priority'];
  assigned_to_user_id?: string;
  due_date?: string;
  reminder_at?: string;
}

export const leadTaskService = {
  async create(leadId: string, data: CreateTaskDto): Promise<LeadTask> {
    const response = await api.post(`/api/leads/${leadId}/tasks`, data);
    return response.data.task;
  },

  async update(taskId: string, data: Partial<CreateTaskDto>): Promise<LeadTask> {
    const response = await api.put(`/api/tasks/${taskId}`, data);
    return response.data.task;
  },

  async delete(taskId: string): Promise<void> {
    await api.delete(`/api/tasks/${taskId}`);
  }
};
```

### **4. LeadFileService**
```typescript
// src/services/leadFile.ts
export interface LeadFile {
  id: string;
  lead_id: string;
  uploaded_by_user_id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  file_type: 'image' | 'document' | 'spreadsheet' | 'presentation' | 'pdf' | 'other';
  description?: string;
  tags: string[];
  is_public: boolean;
  uploadedByUser?: User;
  created_at: string;
  updated_at: string;
}

export const leadFileService = {
  async upload(
    leadId: string,
    file: File,
    options?: {
      description?: string;
      onUploadProgress?: (progress: number) => void
    }
  ): Promise<LeadFile> {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.description) {
      formData.append('description', options.description);
    }

    const response = await api.post(`/api/leads/${leadId}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (options?.onUploadProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          options.onUploadProgress(percentCompleted);
        }
      }
    });

    return response.data.file;
  },

  async download(fileId: string): Promise<void> {
    const response = await api.get(`/api/files/${fileId}/download`, {
      responseType: 'blob'
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', response.headers['filename'] || 'file');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async delete(fileId: string): Promise<void> {
    await api.delete(`/api/files/${fileId}`);
  }
};
```

## 🎨 **Estilos e Layout**

### **CSS Personalizado**
```css
/* src/styles/lead-modal-enterprise.css */
.lead-modal-enterprise {
  .modal-tabs {
    @apply border-b border-border mb-6;

    .tab-trigger {
      @apply relative;

      &[data-state="active"] {
        @apply border-primary;

        &::after {
          content: '';
          @apply absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full;
        }
      }
    }
  }

  .tab-content {
    @apply min-h-[500px];
  }

  .overview-tab {
    .lead-main-data {
      @apply space-y-4;
    }

    .lead-timeline {
      @apply h-full;

      .timeline-item {
        @apply border-l-2 border-border pl-4 pb-4 relative;

        &::before {
          content: '';
          @apply absolute -left-2 top-2 w-3 h-3 bg-primary rounded-full border-2 border-background;
        }

        &.activity-status-change::before {
          @apply bg-blue-500;
        }

        &.activity-note-added::before {
          @apply bg-green-500;
        }

        &.activity-task-created::before {
          @apply bg-orange-500;
        }
      }
    }
  }

  .contacts-tab {
    .contacts-grid {
      @apply grid grid-cols-1 md:grid-cols-2 gap-6;
    }

    .contact-item {
      @apply flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors;

      .contact-primary {
        @apply bg-primary/10 border-primary;
      }
    }
  }

  .tasks-tab {
    .task-card {
      @apply border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors;

      &.task-overdue {
        @apply border-destructive bg-destructive/5;
      }

      &.task-due-soon {
        @apply border-orange-500 bg-orange-500/5;
      }

      &.task-completed {
        @apply opacity-75;

        .task-title {
          @apply line-through text-muted-foreground;
        }
      }
    }

    .priority-high {
      @apply border-l-4 border-l-red-500;
    }

    .priority-urgent {
      @apply border-l-4 border-l-red-700 bg-red-50;
    }

    .priority-medium {
      @apply border-l-4 border-l-orange-500;
    }

    .priority-low {
      @apply border-l-4 border-l-green-500;
    }
  }

  .files-tab {
    .upload-dropzone {
      @apply transition-all duration-200;

      &.drag-active {
        @apply border-primary bg-primary/5 scale-105;
      }
    }

    .files-grid {
      @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
    }

    .file-card {
      @apply hover:shadow-md transition-shadow;

      .file-icon {
        @apply text-2xl;
      }
    }
  }

  .custom-fields-tab {
    .field-group {
      @apply space-y-2;

      label {
        @apply text-sm font-medium;
      }

      .field-required {
        @apply border-l-4 border-l-red-500 pl-3;
      }
    }
  }
}

/* Engagement Score */
.engagement-score {
  .score-circle {
    @apply relative inline-flex items-center justify-center;

    .score-bg {
      @apply absolute inset-0 opacity-20;
    }
  }

  .score-cold { @apply text-blue-500; }
  .score-warm { @apply text-yellow-500; }
  .score-hot { @apply text-orange-500; }
  .score-burning { @apply text-red-500; }
}

/* Responsive */
@media (max-width: 768px) {
  .lead-modal-enterprise {
    .modal-tabs {
      .tab-trigger span {
        @apply hidden;
      }

      .tab-trigger {
        @apply px-2;
      }
    }

    .tab-content {
      @apply min-h-[400px];
    }

    .overview-tab {
      @apply grid-cols-1;
    }

    .contacts-tab .contacts-grid,
    .files-tab .files-grid {
      @apply grid-cols-1;
    }
  }
}
```

## 📱 **Responsividade**

### **Breakpoints e Adaptações**
```typescript
// src/hooks/useBreakpoint.ts
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState('desktop');

  useEffect(() => {
    const checkBreakpoint = () => {
      if (window.innerWidth < 640) setBreakpoint('mobile');
      else if (window.innerWidth < 1024) setBreakpoint('tablet');
      else setBreakpoint('desktop');
    };

    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);

  return breakpoint;
};

// Adaptar modal para mobile
const LeadModalEnterprise = () => {
  const breakpoint = useBreakpoint();

  if (breakpoint === 'mobile') {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[90vh]">
          {/* Mobile-optimized layout */}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog maxWidth="4xl">
      {/* Desktop layout */}
    </Dialog>
  );
};
```

## 🧪 **Testes**

### **Component Tests**
```typescript
// src/components/kanban/__tests__/LeadModalEnterprise.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LeadModalEnterprise } from '../LeadModalEnterprise';

const mockLead = {
  id: '1',
  name: 'Test Lead',
  email: 'test@example.com',
  phone: '11999999999',
  status: 'new',
  // ... outros campos
};

describe('LeadModalEnterprise', () => {
  test('renders all tabs correctly', () => {
    render(
      <LeadModalEnterprise
        isOpen={true}
        onClose={() => {}}
        lead={mockLead}
        onUpdate={() => Promise.resolve()}
      />
    );

    expect(screen.getByText('Visão Geral')).toBeInTheDocument();
    expect(screen.getByText('Contatos')).toBeInTheDocument();
    expect(screen.getByText('Tarefas')).toBeInTheDocument();
    expect(screen.getByText('Arquivos')).toBeInTheDocument();
    expect(screen.getByText('Campos Extras')).toBeInTheDocument();
  });

  test('switches tabs correctly', async () => {
    render(
      <LeadModalEnterprise
        isOpen={true}
        onClose={() => {}}
        lead={mockLead}
        onUpdate={() => Promise.resolve()}
      />
    );

    fireEvent.click(screen.getByText('Tarefas'));

    await waitFor(() => {
      expect(screen.getByText('Nova Tarefa')).toBeInTheDocument();
    });
  });

  test('displays lead information correctly', () => {
    render(
      <LeadModalEnterprise
        isOpen={true}
        onClose={() => {}}
        lead={mockLead}
        onUpdate={() => Promise.resolve()}
      />
    );

    expect(screen.getByDisplayValue('Test Lead')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
  });
});
```

### **Integration Tests**
```typescript
// src/components/kanban/__tests__/FilesTab.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FilesTab } from '../tabs/FilesTab';

// Mock file upload
const mockFile = new File(['hello'], 'hello.png', { type: 'image/png' });

describe('FilesTab Integration', () => {
  test('uploads file successfully', async () => {
    const mockOnFilesChange = jest.fn();

    render(
      <FilesTab
        leadId="test-lead"
        files={[]}
        onFilesChange={mockOnFilesChange}
      />
    );

    const input = screen.getByLabelText(/selecionar arquivo/i);
    fireEvent.change(input, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(mockOnFilesChange).toHaveBeenCalled();
    });
  });
});
```

## 📋 **Checklist de Implementação**

### **Fase 1: Estrutura Base**
- [X] Criar componente LeadModalEnterprise
- [X] Implementar sistema de abas (Tabs)
- [X] Configurar layout responsivo
- [X] Configurar estilos CSS personalizados

### **Fase 2: Aba Visão Geral**
- [ ] Implementar OverviewTab
- [ ] Criar componente LeadTimeline
- [ ] Implementar LeadEngagementScore
- [ ] Integrar formulário básico de lead

### **Fase 3: Aba Contatos**
- [ ] Implementar ContactsTab
- [ ] Criar ContactFormModal
- [ ] Implementar ContactItem component
- [ ] Validações para telefones/emails

### **Fase 4: Aba Tarefas**
- [ ] Implementar TasksTab
- [ ] Criar TaskFormModal e TaskCard
- [ ] Sistema de filtros de tarefas
- [ ] Indicadores visuais de prioridade

### **Fase 5: Aba Arquivos**
- [ ] Implementar FilesTab
- [ ] Sistema de drag & drop
- [ ] Upload com progress bar
- [ ] Preview de arquivos

### **Fase 6: Aba Campos Personalizados**
- [ ] Implementar CustomFieldsTab
- [ ] Renderização dinâmica de campos
- [ ] Validações personalizadas
- [ ] Sistema de salvamento

### **Fase 7: Services e Hooks**
- [ ] Expandir leadService
- [ ] Implementar leadContactService
- [ ] Implementar leadTaskService
- [ ] Implementar leadFileService
- [ ] Implementar customFieldService

### **Fase 8: Testes e Polimento**
- [ ] Testes unitários para todos os componentes
- [ ] Testes de integração
- [ ] Otimizações de performance
- [ ] Acessibilidade (WCAG 2.1)
- [ ] Documentação dos componentes

### **Fase 9: Deploy e Monitoramento**
- [ ] Build e deploy em staging
- [ ] Testes de aceitação do usuário
- [ ] Correção de bugs identificados
- [ ] Deploy em produção
- [ ] Monitoramento de métricas

---

📅 **Estimativa**: 6-8 semanas
👥 **Recursos**: 2-3 desenvolvedores frontend
🎯 **Dependências**: APIs backend implementadas
⚡ **Prioridade**: Alta - Interface principal do usuário