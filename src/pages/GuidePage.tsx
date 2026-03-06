import { useState, useEffect, useRef, useCallback } from 'react';
import {
  BookOpen,
  Search,
  ChevronDown,
  LogIn,
  UserPlus,
  KeyRound,
  Smartphone,
  LayoutDashboard,
  KanbanSquare,
  Megaphone,
  Users,
  Settings,
  Bell,
  Moon,
  Sun,
  GripVertical,
  Plus,
  Pencil,
  Trash2,
  Filter,
  ArrowUpDown,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Star,
  Trophy,
  TrendingUp,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Globe,
  FileText,
  Download,
  Upload,
  Shield,
  Crown,
  Cog,
  User,
  RefreshCw,
  Tag,
  Hash,
  CircleDot,
  Palette,
  ListOrdered,
  ThumbsUp,
  Bug,
  Lightbulb,
  Heart,
  MousePointerClick,
  Columns3,
  StickyNote,
  PhoneCall,
  Video,
  ClipboardList,
  UserCheck,
  Building2,
  CreditCard,
  Webhook,
  Code2,
  MonitorSmartphone,
  Info,
  Move,
  Check,
  X,
  ArrowUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Input } from '../components/ui/input';

// ==========================================
// Tipos e dados das seções
// ==========================================

interface GuideSection {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const guideSections: GuideSection[] = [
  { id: 'primeiros-passos', icon: LogIn, title: 'Primeiros Passos', description: 'Login, cadastro e configuração inicial' },
  { id: 'navegacao', icon: LayoutDashboard, title: 'Navegação', description: 'Sidebar, header e menus do sistema' },
  { id: 'kanban', icon: KanbanSquare, title: 'Quadro Kanban', description: 'Gerenciamento visual de leads' },
  { id: 'lead-modal', icon: MousePointerClick, title: 'Modal do Lead', description: 'Detalhes completos de cada lead' },
  { id: 'dashboard', icon: BarChart3, title: 'Dashboard & Análises', description: 'KPIs, gráficos e relatórios' },
  { id: 'campanhas', icon: Megaphone, title: 'Campanhas', description: 'Campanhas de marketing e frases-gatilho' },
  { id: 'usuarios', icon: Users, title: 'Gerenciamento de Usuários', description: 'Equipe, papéis e permissões' },
  { id: 'configuracoes', icon: Settings, title: 'Configurações', description: 'Perfil, status, WhatsApp e mais' },
  { id: 'notificacoes', icon: Bell, title: 'Notificações', description: 'Alertas, lembretes e tarefas' },
  { id: 'contas', icon: Building2, title: 'Contas & Multi-Tenant', description: 'Múltiplas contas e organizações' },
  { id: 'planos', icon: CreditCard, title: 'Planos & Assinatura', description: 'Planos disponíveis e limites' },
  { id: 'whatsapp', icon: MessageSquare, title: 'Integração WhatsApp', description: 'Webhooks, automação e mensagens' },
  { id: 'iframe', icon: Code2, title: 'Integração Iframe/Embed', description: 'Incorporar o CRM em outros sistemas' },
  { id: 'feedback', icon: ThumbsUp, title: 'Feedback', description: 'Enviar sugestões e reportar bugs' },
  { id: 'dicas', icon: Lightbulb, title: 'Dicas & Atalhos', description: 'Truques para usar o sistema melhor' },
];

const sidebarGroups = [
  { label: 'Início', sectionIds: ['primeiros-passos', 'navegacao'] },
  { label: 'Funcionalidades', sectionIds: ['kanban', 'lead-modal', 'dashboard', 'campanhas', 'usuarios'] },
  { label: 'Configuração', sectionIds: ['configuracoes', 'notificacoes', 'contas', 'planos'] },
  { label: 'Integrações', sectionIds: ['whatsapp', 'iframe'] },
  { label: 'Mais', sectionIds: ['feedback', 'dicas'] },
];

// ==========================================
// Sub-componentes reutilizáveis
// ==========================================

function SectionWrapper({ id, children }: Readonly<{ id: string; children: React.ReactNode }>) {
  return (
    <section id={id} className="scroll-mt-4">
      {children}
    </section>
  );
}

function StepList({ steps }: Readonly<{ steps: string[] }>) {
  return (
    <ol className="space-y-2 ml-1">
      {steps.map((step) => (
        <li key={step.slice(0, 50)} className="flex gap-3 items-start">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
            {steps.indexOf(step) + 1}
          </span>
          <span className="text-sm text-muted-foreground leading-relaxed">{step}</span>
        </li>
      ))}
    </ol>
  );
}

function RoleBadge({ role }: Readonly<{ role: 'owner' | 'admin' | 'member' }>) {
  const config = {
    owner: { label: '👑 Dono', className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
    admin: { label: '⚙️ Admin', className: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
    member: { label: '👤 Membro', className: 'bg-gray-500/10 text-gray-600 border-gray-500/30' },
  };
  const c = config[role];
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>;
}

function TipCard({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <Alert className="border-primary/20 bg-primary/5">
      <Lightbulb className="h-4 w-4 text-primary" />
      <AlertTitle className="text-primary">{title}</AlertTitle>
      <AlertDescription className="text-muted-foreground">{children}</AlertDescription>
    </Alert>
  );
}

function WarningCard({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <Alert className="border-yellow-500/30 bg-yellow-500/5">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-600">{title}</AlertTitle>
      <AlertDescription className="text-muted-foreground">{children}</AlertDescription>
    </Alert>
  );
}

function FeatureCard({ icon: Icon, title, children }: Readonly<{ icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }>) {
  return (
    <Card className="border-border/50 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="truncate">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-2">
        {children}
      </CardContent>
    </Card>
  );
}

function IconLabel({ icon: Icon, label }: Readonly<{ icon: React.ComponentType<{ className?: string }>; label: string }>) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <Icon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
      <span>{label}</span>
    </span>
  );
}

// ==========================================
// Demos interativas / Animações
// ==========================================

/** Mini Kanban arrastrável para demonstrar drag & drop */
function DragDropDemo() {
  const [columns, setColumns] = useState([
    { id: 'new', name: 'Novos', color: 'bg-blue-500', leads: ['Maria Silva', 'João Santos'] },
    { id: 'contact', name: 'Contatados', color: 'bg-yellow-500', leads: ['Ana Costa'] },
    { id: 'won', name: 'Ganhos', color: 'bg-green-500', leads: [] as string[] },
  ]);
  const [dragging, setDragging] = useState<{ col: number; lead: number } | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const moveLead = (fromCol: number, leadIdx: number, toCol: number) => {
    setColumns(prev => {
      const next = prev.map(c => ({ ...c, leads: [...c.leads] }));
      const [lead] = next[fromCol].leads.splice(leadIdx, 1);
      next[toCol].leads.push(lead);
      return next;
    });
    setDragging(null);
    setDragOver(null);
  };

  return (
    <div className="border border-border/50 rounded-lg p-3 bg-muted/30">
      <div className="flex items-center gap-2 mb-2">
        <Move className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium text-primary">Demo interativa — Arraste os leads entre as colunas</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {columns.map((col, colIdx) => (
          <div
            key={col.id}
            className={`rounded-lg border p-2 min-h-[80px] transition-colors ${
              dragOver === colIdx ? 'border-primary bg-primary/5' : 'border-border/50 bg-background/50'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(colIdx); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={() => { if (dragging) moveLead(dragging.col, dragging.lead, colIdx); }}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className={`w-2 h-2 rounded-full ${col.color}`} />
              <span className="text-xs font-medium">{col.name}</span>
              <span className="text-xs text-muted-foreground ml-auto">{col.leads.length}</span>
            </div>
            <div className="space-y-1">
              {col.leads.map((lead, leadIdx) => (
                <div
                  key={lead}
                  draggable
                  onDragStart={() => setDragging({ col: colIdx, lead: leadIdx })}
                  onDragEnd={() => { setDragging(null); setDragOver(null); }}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-card border border-border/30 cursor-grab active:cursor-grabbing text-xs hover:border-primary/50 transition-colors select-none"
                >
                  <GripVertical className="h-3 w-3 text-muted-foreground/50" />
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span>{lead}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Demo do pipeline visual clicável */
function getStageStyle(i: number, active: number): string {
  if (i > active) return 'bg-muted text-muted-foreground hover:bg-muted/80';
  if (i === active) return 'bg-primary text-primary-foreground shadow-sm';
  return 'bg-primary/20 text-primary';
}

function PipelineDemo() {
  const stages = ['Novo', 'Contatado', 'Qualificado', 'Proposta', 'Ganho'];
  const [active, setActive] = useState(1);

  return (
    <div className="border border-border/50 rounded-lg p-3 bg-muted/30">
      <div className="flex items-center gap-2 mb-2">
        <MousePointerClick className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium text-primary">Demo interativa — Clique nas etapas para mover o lead</span>
      </div>
      <div className="flex items-center gap-0.5">
        {stages.map((stage, i) => (
          <button
            key={stage}
            onClick={() => setActive(i)}
            className={`flex-1 py-1.5 px-1 text-xs font-medium text-center transition-all rounded-md ${getStageStyle(i, active)}`}
          >
            {stage}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <div className="flex gap-1.5">
          <button
            onClick={() => setActive(4)}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors"
          >
            <Trophy className="h-3 w-3" /> Ganhou
          </button>
          <button
            onClick={() => setActive(0)}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors"
          >
            <X className="h-3 w-3" /> Perdeu
          </button>
        </div>
        <span className="text-xs text-muted-foreground ml-auto">
          Etapa atual: <strong>{stages[active]}</strong>
        </span>
      </div>
    </div>
  );
}

/** Demo de edição inline */
function InlineEditDemo() {
  const [editing, setEditing] = useState<string | null>(null);
  const [values, setValues] = useState({
    name: 'Maria Silva',
    phone: '(11) 99999-8888',
    value: 'R$ 5.000,00',
    status: 'Qualificado',
  });

  const handleSave = (field: string, newVal: string) => {
    setValues(prev => ({ ...prev, [field]: newVal }));
    setEditing(null);
  };

  const fields = [
    { key: 'name', label: 'Nome', icon: User },
    { key: 'phone', label: 'Telefone', icon: Phone },
    { key: 'value', label: 'Valor', icon: Hash },
    { key: 'status', label: 'Status', icon: CircleDot },
  ];

  return (
    <div className="border border-border/50 rounded-lg p-3 bg-muted/30">
      <div className="flex items-center gap-2 mb-2">
        <Pencil className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium text-primary">Demo interativa — Clique nos campos para editar inline</span>
      </div>
      <div className="space-y-1.5">
        {fields.map(({ key, label, icon: Icon }) => (
          <div key={key} className="flex items-center gap-2 group">
            <Icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground w-16 flex-shrink-0">{label}:</span>
            {editing === key ? (
              <div className="flex items-center gap-1 flex-1">
                <input
                  className="flex-1 bg-background border border-primary rounded px-2 py-0.5 text-xs focus:outline-none"
                  defaultValue={values[key as keyof typeof values]}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave(key, e.currentTarget.value);
                    if (e.key === 'Escape') setEditing(null);
                  }}
                  onBlur={(e) => handleSave(key, e.currentTarget.value)}
                />
                <Check className="h-3 w-3 text-green-500 cursor-pointer" onClick={() => setEditing(null)} />
              </div>
            ) : (
              <button
                type="button"
                className="text-xs cursor-pointer hover:text-primary transition-colors flex-1 px-2 py-0.5 rounded hover:bg-primary/5 text-left bg-transparent border-none"
                onClick={() => setEditing(key)}
              >
                {values[key as keyof typeof values]}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Demo de filtro com animação */
function FilterDemo() {
  const [query, setQuery] = useState('');
  const leads = ['Maria Silva', 'João Santos', 'Ana Costa', 'Pedro Oliveira', 'Carla Mendes'];
  const filtered = leads.filter(l => l.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="border border-border/50 rounded-lg p-3 bg-muted/30">
      <div className="flex items-center gap-2 mb-2">
        <Search className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium text-primary">Demo interativa — Busca inteligente em tempo real</span>
      </div>
      <div className="relative mb-2">
        <Search className="absolute left-2 top-1.5 h-3 w-3 text-muted-foreground" />
        <input
          className="w-full bg-background border border-border rounded pl-7 pr-2 py-1 text-xs focus:outline-none focus:border-primary"
          placeholder="Buscar leads..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        {filtered.map((lead) => (
          <div key={lead} className="flex items-center gap-2 px-2 py-1 rounded bg-card/50 text-xs transition-all">
            <User className="h-3 w-3 text-muted-foreground" />
            <span>{lead}</span>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">Nenhum lead encontrado</p>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-1.5">{filtered.length} de {leads.length} leads</p>
    </div>
  );
}

/** Demo de notificações */
function NotificationDemo() {
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'overdue', text: 'Ligar para Maria Silva', read: false },
    { id: 2, type: 'today', text: 'Reunião com João Santos às 14h', read: false },
    { id: 3, type: 'pending', text: 'Enviar proposta para Ana Costa', read: false },
  ]);

  const typeConfig: Record<string, { icon: typeof AlertTriangle; color: string; label: string }> = {
    overdue: { icon: AlertTriangle, color: 'text-red-500', label: 'Atrasada' },
    today: { icon: Clock, color: 'text-orange-500', label: 'Hoje' },
    pending: { icon: CheckCircle2, color: 'text-blue-500', label: 'Pendente' },
  };

  const markRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="border border-border/50 rounded-lg p-3 bg-muted/30">
      <div className="flex items-center gap-2 mb-2">
        <Bell className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium text-primary">Demo interativa — Clique para marcar como lida</span>
        {unreadCount > 0 && (
          <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </div>
      <div className="space-y-1">
        {notifications.map((n) => {
          const cfg = typeConfig[n.type];
          const NotifIcon = cfg.icon;
          return (
            <button
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left transition-all ${
                n.read ? 'opacity-50 bg-card/30' : 'bg-card/50 hover:bg-card'
              }`}
            >
              <NotifIcon className={`h-3.5 w-3.5 ${cfg.color} flex-shrink-0`} />
              <span className="flex-1">{n.text}</span>
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${n.read ? 'opacity-50' : ''}`}>{cfg.label}</Badge>
              {n.read && <Check className="h-3 w-3 text-green-500" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Demo de status customizáveis */
function StatusDemo() {
  const [statuses, setStatuses] = useState([
    { name: 'Novo', color: '#3b82f6', isWon: false, isLost: false },
    { name: 'Contatado', color: '#f59e0b', isWon: false, isLost: false },
    { name: 'Qualificado', color: '#8b5cf6', isWon: false, isLost: false },
    { name: 'Ganho', color: '#22c55e', isWon: true, isLost: false },
    { name: 'Perdido', color: '#ef4444', isWon: false, isLost: true },
  ]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const moveStatus = (from: number, to: number) => {
    setStatuses(prev => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
    setDragIdx(null);
  };

  return (
    <div className="border border-border/50 rounded-lg p-3 bg-muted/30">
      <div className="flex items-center gap-2 mb-2">
        <Palette className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium text-primary">Demo interativa — Arraste para reordenar os status</span>
      </div>
      <div className="space-y-1">
        {statuses.map((s, i) => (
          <div
            key={s.name}
            draggable
            onDragStart={() => setDragIdx(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => { if (dragIdx !== null) moveStatus(dragIdx, i); }}
            onDragEnd={() => setDragIdx(null)}
            className="flex items-center gap-2 px-2 py-1.5 rounded bg-card/50 cursor-grab active:cursor-grabbing text-xs select-none hover:bg-card transition-colors"
          >
            <GripVertical className="h-3 w-3 text-muted-foreground/50" />
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
            <span className="flex-1">{s.name}</span>
            {s.isWon && <Badge variant="outline" className="text-[10px] px-1 py-0 bg-green-500/10 text-green-600 border-green-500/30">Ganho</Badge>}
            {s.isLost && <Badge variant="outline" className="text-[10px] px-1 py-0 bg-red-500/10 text-red-600 border-red-500/30">Perda</Badge>}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Demo de tarefas com prioridade */
function TaskDemo() {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Ligar para Maria Silva', priority: 'urgent' as const, done: false },
    { id: 2, text: 'Enviar proposta comercial', priority: 'high' as const, done: false },
    { id: 3, text: 'Follow-up por WhatsApp', priority: 'medium' as const, done: true },
    { id: 4, text: 'Atualizar notas do lead', priority: 'low' as const, done: false },
  ]);

  const priorityConfig = {
    urgent: { color: 'bg-red-500', label: 'Urgente' },
    high: { color: 'bg-orange-500', label: 'Alta' },
    medium: { color: 'bg-blue-500', label: 'Média' },
    low: { color: 'bg-gray-400', label: 'Baixa' },
  };

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <div className="border border-border/50 rounded-lg p-3 bg-muted/30">
      <div className="flex items-center gap-2 mb-2">
        <ClipboardList className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium text-primary">Demo interativa — Clique para marcar tarefas como concluídas</span>
      </div>
      <div className="space-y-1">
        {tasks.map((task) => {
          const cfg = priorityConfig[task.priority];
          return (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left transition-all ${
                task.done ? 'opacity-50 line-through' : 'hover:bg-card'
              } bg-card/50`}
            >
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                task.done ? 'bg-green-500 border-green-500' : 'border-muted-foreground/30'
              }`}>
                {task.done && <Check className="h-2.5 w-2.5 text-white" />}
              </div>
              <span className="flex-1">{task.text}</span>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${cfg.color}`} />
                <span className="text-[10px] text-muted-foreground">{cfg.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// Componente da seção colapsável
// ==========================================

function CollapsibleSection({
  section,
  isOpen,
  onToggle,
  children,
}: Readonly<{
  section: GuideSection;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}>) {
  const Icon = section.icon;

  return (
    <div className="border border-border/50 rounded-xl overflow-hidden bg-card">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold">{section.title}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
        </div>
        <div className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center transition-all duration-200 ${isOpen ? 'bg-primary/10' : 'bg-muted/80'}`}>
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : 'text-muted-foreground'}`} />
        </div>
      </button>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 space-y-4 border-t border-border/30">
          <div className="pt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Conteúdo de cada seção
// ==========================================

function PrimeirosPassosContent() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FeatureCard icon={LogIn} title="Login">
          <p>Acesse o sistema com seu <strong>e-mail</strong> e <strong>senha</strong> cadastrados.</p>
          <StepList steps={[
            'Acesse a página de login do Touch Run.',
            'Digite seu e-mail e senha.',
            'Clique em "Entrar" para acessar o quadro Kanban.',
          ]} />
          <p className="mt-2">Caso não tenha uma conta, clique em <strong>"Criar conta"</strong> para se cadastrar.</p>
        </FeatureCard>

        <FeatureCard icon={UserPlus} title="Cadastro">
          <p>Crie sua conta preenchendo os dados necessários:</p>
          <StepList steps={[
            'Informe seu nome completo.',
            'Digite um e-mail válido (será usado para login).',
            'Crie uma senha segura (mínimo 6 caracteres).',
            'Informe seu telefone com DDD (formato brasileiro).',
            'Dê um nome para sua conta/organização.',
            'Clique em "Criar conta" — você será redirecionado automaticamente.',
          ]} />
        </FeatureCard>

        <FeatureCard icon={KeyRound} title="Recuperar Senha">
          <p>Esqueceu sua senha? Recupere via <strong>WhatsApp</strong>:</p>
          <StepList steps={[
            'Na tela de login, clique em "Esqueceu a senha?".',
            'Informe o e-mail da sua conta.',
            'Você receberá um código OTP de 6 dígitos no seu WhatsApp.',
            'Digite o código recebido na tela de verificação.',
            'Crie uma nova senha e confirme.',
          ]} />
        </FeatureCard>

        <FeatureCard icon={Smartphone} title="Verificação de Telefone">
          <p>Após o primeiro login, pode ser solicitada a <strong>verificação do seu telefone</strong> via WhatsApp:</p>
          <StepList steps={[
            'Uma janela aparecerá pedindo seu número de telefone.',
            'Informe o número com DDD e clique em "Enviar código".',
            'Um código OTP de 6 dígitos será enviado ao seu WhatsApp.',
            'Digite o código e clique em "Verificar".',
            'Após a verificação, você terá acesso completo ao sistema.',
          ]} />
          <TipCard title="Por que verificar o telefone?">
            A verificação garante a segurança da sua conta e possibilita a recuperação de senha via WhatsApp.
          </TipCard>
        </FeatureCard>
      </div>
    </div>
  );
}

function NavegacaoContent() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        O Touch Run possui uma interface intuitiva com sidebar lateral, cabeçalho superior e área principal de conteúdo.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <FeatureCard icon={Columns3} title="Sidebar (Menu Lateral)">
          <p>O menu lateral esquerdo é o principal meio de navegação:</p>
          <ul className="space-y-1.5">
            <li className="flex items-center gap-2"><LayoutDashboard className="h-3.5 w-3.5 text-primary" /> <strong>Dashboard</strong> — Análises e KPIs</li>
            <li className="flex items-center gap-2"><KanbanSquare className="h-3.5 w-3.5 text-primary" /> <strong>Leads</strong> — Quadro Kanban</li>
            <li className="flex items-center gap-2"><Megaphone className="h-3.5 w-3.5 text-primary" /> <strong>Campanhas</strong> — Marketing</li>
            <li className="flex items-center gap-2"><Users className="h-3.5 w-3.5 text-primary" /> <strong>Usuários</strong> — Equipe</li>
            <li className="flex items-center gap-2"><Settings className="h-3.5 w-3.5 text-primary" /> <strong>Configurações</strong> — Ajustes</li>
            <li className="flex items-center gap-2"><MessageSquare className="h-3.5 w-3.5 text-primary" /> <strong>Inbox</strong> — Central de mensagens (link externo)</li>
            <li className="flex items-center gap-2"><ThumbsUp className="h-3.5 w-3.5 text-primary" /> <strong>Feedbacks</strong> — Sugestões da comunidade</li>
            <li className="flex items-center gap-2"><BookOpen className="h-3.5 w-3.5 text-primary" /> <strong>Guia</strong> — Esta página de ajuda</li>
          </ul>
          <TipCard title="Sidebar colapsável">
            Clique no ícone de seta na parte inferior do sidebar para expandir ou recolher o menu. Quando recolhido, passe o mouse sobre os ícones para ver tooltips com o nome de cada item.
          </TipCard>
        </FeatureCard>

        <div className="space-y-4">
          <FeatureCard icon={Bell} title="Cabeçalho Superior">
            <p>O header contém:</p>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-2"><Bell className="h-3.5 w-3.5 text-primary" /> <strong>Sino de notificações</strong> — Tarefas atrasadas, do dia e pendentes</li>
              <li className="flex items-center gap-2"><Moon className="h-3.5 w-3.5 text-primary" /> <strong>Tema</strong> — Alterne entre modo claro e escuro</li>
              <li className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-primary" /> <strong>Avatar do usuário</strong> — Acesso rápido a Perfil, Planos e Sair</li>
            </ul>
          </FeatureCard>

          <FeatureCard icon={Building2} title="Troca de Conta (Account Switcher)">
            <p>No topo do sidebar, clique no nome da conta ativa para:</p>
            <ul className="space-y-1">
              <li>• Ver todas as contas que você faz parte</li>
              <li>• Trocar entre contas instantaneamente</li>
              <li>• Criar uma nova conta/organização</li>
            </ul>
            <p className="mt-2">Cada conta exibe um badge de papel: <RoleBadge role="owner" /> <RoleBadge role="admin" /> <RoleBadge role="member" /></p>
          </FeatureCard>
        </div>
      </div>
    </div>
  );
}

function KanbanContent() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        O Quadro Kanban é o coração do Touch Run. É aqui que você visualiza, organiza e gerencia todos os seus leads em um fluxo visual de colunas arrastáveis.
      </p>

      {/* Demo interativa de drag & drop */}
      <DragDropDemo />

      <div className="grid gap-4 sm:grid-cols-2">
        <FeatureCard icon={Columns3} title="Colunas do Kanban">
          <p>Cada coluna representa uma <strong>etapa do funil de vendas</strong>. O sistema já vem com uma coluna padrão:</p>
          <ul className="space-y-1">
            <li>• <strong>Leads Entrantes</strong> — Coluna do sistema (não pode ser excluída). Todos os novos leads chegam aqui.</li>
          </ul>
          <p className="mt-2"><strong>Gerenciar colunas:</strong></p>
          <StepList steps={[
            'Clique no botão "+" no final do quadro para criar uma nova coluna.',
            'Defina o nome e escolha uma cor para identificação visual.',
            'Clique no menu "⋮" de uma coluna para editar ou excluir.',
            'Arraste a coluna pela barra superior para reordenar as etapas.',
          ]} />
          <WarningCard title="Colunas especiais">
            Se uma coluna for nomeada como <strong>"Ganho"</strong> ou <strong>"Ganhos"</strong>, leads movidos para ela terão o status automaticamente alterado para <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">Ganho</Badge>. O mesmo vale para <strong>"Perdido"/"Perdidos"</strong>, que marca como <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">Perdido</Badge>.
          </WarningCard>
        </FeatureCard>

        <FeatureCard icon={GripVertical} title="Arrastar e Soltar (Drag & Drop)">
          <p>Mova leads entre colunas de forma intuitiva:</p>
          <StepList steps={[
            'Clique e segure um card de lead.',
            'Arraste-o para a coluna desejada.',
            'Solte para confirmar a movimentação.',
          ]} />
          <p className="mt-2">A movimentação é salva automaticamente e registrada no histórico do lead. Ao mover para uma coluna de <strong>"Perdido"</strong>, um diálogo aparecerá pedindo o <strong>motivo da perda</strong>.</p>
          <TipCard title="Atualização otimista">
            A movimentação é instantânea na tela (0ms de latência percebida). Se houver falha na conexão, o lead volta automaticamente para a posição anterior.
          </TipCard>
        </FeatureCard>

        <FeatureCard icon={Plus} title="Criar Lead">
          <p>Adicione novos leads ao quadro:</p>
          <StepList steps={[
            'Clique no botão "+" em qualquer coluna, ou use o botão "Novo Lead" no topo.',
            'Preencha os campos: nome, telefone, e-mail, mensagem.',
            'Selecione a plataforma de origem (Meta, Google, Instagram, etc.).',
            'Opcionalmente: vincule a uma campanha, defina valor, adicione notas, atribua um responsável.',
            'Escolha a coluna de destino e clique em "Criar".',
          ]} />
          <TipCard title="Deduplicação automática">
            O sistema detecta leads duplicados pelo número de telefone. Se já existir um lead com o mesmo número, ele será atualizado ao invés de criar um novo.
          </TipCard>
        </FeatureCard>

        <FeatureCard icon={Filter} title="Filtros e Busca Inteligente">
          <p>A barra de filtros no topo do quadro permite encontrar leads rapidamente:</p>
          <ul className="space-y-1.5">
            <li><IconLabel icon={Search} label="Busca por nome, e-mail, telefone, campanha ou mensagem" /></li>
            <li><IconLabel icon={Calendar} label="Filtro por período (hoje, 7 dias, mês, personalizado)" /></li>
            <li><IconLabel icon={Globe} label="Filtro por plataforma (Meta, Google, Instagram, etc.)" /></li>
            <li><IconLabel icon={Tag} label="Filtro por tags atribuídas ao lead" /></li>
            <li><IconLabel icon={Hash} label="Filtro por faixa de valor (mín/máx)" /></li>
          </ul>
          <p className="mt-2"><strong>Ordenação:</strong> 10 opções disponíveis — por data de atualização, criação, título, valor, próxima atividade, entre outras.</p>
        </FeatureCard>
      </div>

      {/* Demo de busca */}
      <FilterDemo />

      <FeatureCard icon={StickyNote} title="Card do Lead">
        <p>Cada card no quadro exibe informações resumidas do lead:</p>
        <div className="grid gap-2 sm:grid-cols-2 mt-2">
          <div className="flex items-start gap-2"><User className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /> <div><strong>Nome</strong> — Identificação do lead</div></div>
          <div className="flex items-start gap-2"><Phone className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /> <div><strong>Telefone</strong> — Número formatado</div></div>
          <div className="flex items-start gap-2"><Mail className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /> <div><strong>E-mail</strong> — Quando informado</div></div>
          <div className="flex items-start gap-2"><Hash className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /> <div><strong>Valor</strong> — Em R$ (reais)</div></div>
          <div className="flex items-start gap-2"><Globe className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /> <div><strong>Badge de plataforma</strong> — Ícone da origem</div></div>
          <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /> <div><strong>Badge de tarefas</strong> — Vermelho (atrasada), laranja (hoje), azul (pendente)</div></div>
        </div>
        <p className="mt-3">Clique em qualquer card para abrir o <strong>Modal do Lead</strong> com todos os detalhes.</p>
      </FeatureCard>
    </div>
  );
}

function LeadModalContent() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Ao clicar em um lead no quadro, abre-se o Modal do Lead — uma visão completa com todas as informações, atividades e ferramentas de gerenciamento.
      </p>

      {/* Demo do pipeline */}
      <PipelineDemo />

      <FeatureCard icon={Target} title="Cabeçalho do Pipeline">
        <p>No topo do modal, você encontra a <strong>barra de estágios visuais</strong>:</p>
        <ul className="space-y-1.5">
          <li><IconLabel icon={Columns3} label="Etapas do pipeline — Clique em qualquer etapa para mover o lead diretamente" /></li>
          <li><IconLabel icon={Trophy} label='Botão "Ganhou" — Marca o lead como ganho/convertido' /></li>
          <li><IconLabel icon={AlertTriangle} label='Botão "Perdeu" — Marca como perdido (solicita motivo da perda)' /></li>
          <li><IconLabel icon={Pencil} label="Nome editável — Clique no nome do lead para editar inline" /></li>
          <li><IconLabel icon={Star} label="Favoritar — Marque leads importantes com estrela" /></li>
          <li><IconLabel icon={UserCheck} label="Responsável — Clique no avatar para alterar o responsável" /></li>
          <li><IconLabel icon={Trash2} label="Excluir — Remove o lead permanentemente" /></li>
        </ul>
      </FeatureCard>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-4">
          <FeatureCard icon={FileText} title="Sidebar de Dados (Painel Esquerdo)">
            <p>Todos os campos do lead ficam no painel esquerdo, com <strong>edição inline</strong>:</p>
            <ul className="space-y-1.5">
              <li><IconLabel icon={Phone} label="Telefone — Com validação e formatação automática" /></li>
              <li><IconLabel icon={Mail} label="E-mail — Validação de formato" /></li>
              <li><IconLabel icon={Hash} label="Valor — Em R$ com formatação de moeda" /></li>
              <li><IconLabel icon={Globe} label="Plataforma — Origem do lead" /></li>
              <li><IconLabel icon={Megaphone} label="Campanha — Campanha vinculada" /></li>
              <li><IconLabel icon={CircleDot} label="Status — Status personalizado" /></li>
              <li><IconLabel icon={UserCheck} label="Responsável — Membro da equipe" /></li>
              <li><IconLabel icon={StickyNote} label="Notas — Campo de texto livre" /></li>
              <li><IconLabel icon={Tag} label="Tags — Etiquetas para categorização" /></li>
            </ul>
          </FeatureCard>
          {/* Demo de edição inline */}
          <InlineEditDemo />
        </div>

        <div className="space-y-4">
          <FeatureCard icon={ClipboardList} title="Aba: Atividades / Timeline">
            <p>Registre todas as interações com o lead em ordem cronológica:</p>
            <p className="mt-2"><strong>7 tipos de atividade:</strong></p>
            <div className="grid grid-cols-2 gap-1.5 mt-1">
              <span className="flex items-center gap-1.5 text-xs"><PhoneCall className="h-3 w-3 text-blue-500" /> Ligação</span>
              <span className="flex items-center gap-1.5 text-xs"><Mail className="h-3 w-3 text-green-500" /> E-mail</span>
              <span className="flex items-center gap-1.5 text-xs"><MessageSquare className="h-3 w-3 text-emerald-500" /> WhatsApp</span>
              <span className="flex items-center gap-1.5 text-xs"><Video className="h-3 w-3 text-purple-500" /> Reunião</span>
              <span className="flex items-center gap-1.5 text-xs"><StickyNote className="h-3 w-3 text-yellow-500" /> Nota</span>
              <span className="flex items-center gap-1.5 text-xs"><CheckCircle2 className="h-3 w-3 text-orange-500" /> Tarefa</span>
              <span className="flex items-center gap-1.5 text-xs"><RefreshCw className="h-3 w-3 text-cyan-500" /> Follow-up</span>
            </div>
            <p className="mt-2">Cada atividade pode ter: título, descrição, data agendada, lembrete e duração.</p>
          </FeatureCard>

          <FeatureCard icon={CheckCircle2} title="Aba: Tarefas">
            <p>Gerencie tarefas vinculadas ao lead com 4 prioridades:</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30 text-xs">Urgente</Badge>
              <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30 text-xs">Alta</Badge>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-xs">Média</Badge>
              <Badge variant="outline" className="bg-gray-500/10 text-gray-600 border-gray-500/30 text-xs">Baixa</Badge>
            </div>
            <ul className="space-y-1 mt-2">
              <li>• Filtrar: Todas, Pendentes, Concluídas, Atrasadas, Hoje</li>
              <li>• Marcar como concluída com um clique</li>
              <li>• Configurar lembrete com notificação desktop</li>
            </ul>
          </FeatureCard>
        </div>
      </div>

      {/* Demo de tarefas */}
      <TaskDemo />

      <div className="grid gap-4 sm:grid-cols-2">
        <FeatureCard icon={Users} title="Aba: Contatos">
          <p>Adicione múltiplos contatos ao lead (útil para empresas com vários decisores):</p>
          <ul className="space-y-1">
            <li>• <strong>Nome, e-mail, telefone</strong> do contato adicional</li>
            <li>• <strong>Cargo</strong> e <strong>departamento</strong></li>
            <li>• <strong>Notas</strong> sobre cada contato</li>
            <li>• Marcar um contato como <strong>principal</strong></li>
          </ul>
        </FeatureCard>

        <FeatureCard icon={Upload} title="Aba: Arquivos">
          <p>Anexe documentos ao lead:</p>
          <ul className="space-y-1">
            <li>• <strong>Upload</strong> de arquivos (propostas, contratos, etc.)</li>
            <li>• <strong>Download</strong> e <strong>preview</strong> de documentos</li>
            <li>• Ícone do tipo de arquivo para identificação rápida</li>
            <li>• Status de verificação de vírus</li>
          </ul>
        </FeatureCard>
      </div>

      <FeatureCard icon={Calendar} title="Painel de Agenda">
        <p>No lado direito do modal, existe o <strong>Painel de Agenda</strong> colapsável:</p>
        <ul className="space-y-1">
          <li>• Mostra suas <strong>atividades agendadas</strong> para os próximos dias</li>
          <li>• Navegação por dia (anterior/próximo)</li>
          <li>• Abra ou feche o painel clicando no ícone de calendário</li>
        </ul>
      </FeatureCard>
    </div>
  );
}

function DashboardContent() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        O Dashboard oferece uma visão completa do desempenho da sua operação de vendas com KPIs, gráficos e relatórios interativos.
      </p>

      <FeatureCard icon={TrendingUp} title="KPIs (Indicadores Principais)">
        <p>Cards no topo do dashboard com métricas em tempo real:</p>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="p-2 rounded-lg bg-muted/50 text-center">
            <div className="text-[10px] text-muted-foreground">Total de Leads</div>
            <div className="text-sm font-bold text-primary">—</div>
          </div>
          <div className="p-2 rounded-lg bg-muted/50 text-center">
            <div className="text-[10px] text-muted-foreground">Leads Ganhos</div>
            <div className="text-sm font-bold text-green-500">—</div>
          </div>
          <div className="p-2 rounded-lg bg-muted/50 text-center">
            <div className="text-[10px] text-muted-foreground">Taxa Conversão</div>
            <div className="text-sm font-bold text-purple-500">— %</div>
          </div>
        </div>
      </FeatureCard>

      <div className="grid gap-4 sm:grid-cols-2">
        <FeatureCard icon={BarChart3} title="Gráficos de Performance">
          <ul className="space-y-1.5">
            <li><IconLabel icon={TrendingUp} label="Timeline — Leads e conversões ao longo do tempo" /></li>
            <li><IconLabel icon={BarChart3} label="Vendas — Gráfico de barras por vendedor" /></li>
            <li><IconLabel icon={PieChart} label="Distribuição — Como seus leads estão distribuídos" /></li>
            <li><IconLabel icon={Target} label="Scatter — Atividade vs conversão" /></li>
            <li><IconLabel icon={Clock} label="Timing — Tempo em cada etapa" /></li>
          </ul>
        </FeatureCard>

        <FeatureCard icon={PieChart} title="Relatórios Detalhados">
          <ul className="space-y-1.5">
            <li><IconLabel icon={Target} label="Funil — Taxas de passagem entre etapas" /></li>
            <li><IconLabel icon={ListOrdered} label="Métricas por estágio — Tabela detalhada" /></li>
            <li><IconLabel icon={Trophy} label="Ranking de vendedores — Por leads, conversão e receita" /></li>
            <li><IconLabel icon={AlertTriangle} label="Motivos de perda — Análise dos mais frequentes" /></li>
            <li><IconLabel icon={Clock} label="Leads estagnados — Parados há muito tempo (clicável)" /></li>
          </ul>
        </FeatureCard>
      </div>

      <FeatureCard icon={Filter} title="Filtros do Dashboard">
        <p>Use os filtros no topo para ajustar o período dos dados:</p>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline">Hoje</Badge>
          <Badge variant="outline">7 dias</Badge>
          <Badge variant="outline">Este mês</Badge>
          <Badge variant="outline">Personalizado</Badge>
        </div>
        <p className="mt-2">O filtro afeta todos os gráficos e métricas simultaneamente.</p>
      </FeatureCard>
    </div>
  );
}

function CampanhasContent() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        A seção de Campanhas permite gerenciar suas campanhas de marketing e configurar automações com frases-gatilho para captura de leads via WhatsApp.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <FeatureCard icon={Plus} title="Criar Campanha">
          <StepList steps={[
            'Acesse "Campanhas" no menu lateral.',
            'Clique em "Nova Campanha".',
            'Defina o nome, plataforma e canal.',
            'Opcionalmente, informe o orçamento (budget).',
            'Salve a campanha.',
          ]} />
          <p className="mt-2"><strong>Plataformas suportadas:</strong></p>
          <div className="flex flex-wrap gap-1.5 mt-1">
            <Badge variant="outline" className="text-xs">Meta</Badge>
            <Badge variant="outline" className="text-xs">Google</Badge>
            <Badge variant="outline" className="text-xs">Instagram</Badge>
            <Badge variant="outline" className="text-xs">Facebook</Badge>
            <Badge variant="outline" className="text-xs">WhatsApp</Badge>
            <Badge variant="outline" className="text-xs">YouTube</Badge>
            <Badge variant="outline" className="text-xs">TikTok</Badge>
          </div>
        </FeatureCard>

        <FeatureCard icon={Zap} title="Frases-Gatilho (Trigger Phrases)">
          <p>Conectam mensagens do <strong>WhatsApp</strong> às campanhas:</p>
          <StepList steps={[
            'Abra uma campanha existente.',
            'Clique em "Frases-Gatilho" ou no ícone de raio ⚡.',
            'Adicione frases (ex: "quero saber mais", "promoção verão").',
            'Escolha: correspondência exata ou contém.',
            'Lead será vinculado automaticamente à campanha.',
          ]} />
          <TipCard title="Exemplo prático">
            Mensagem "Olá, vi a promoção verão" + frase-gatilho "promoção verão" (tipo: contém) = lead vinculado automaticamente.
          </TipCard>
        </FeatureCard>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FeatureCard icon={BarChart3} title="Relatórios de Campanha">
          <ul className="space-y-1">
            <li>• <strong>Total de leads</strong> gerados pela campanha</li>
            <li>• <strong>Custo por lead</strong> (budget ÷ leads)</li>
            <li>• <strong>Gráficos de performance</strong></li>
            <li>• <strong>Frases mais efetivas</strong></li>
          </ul>
        </FeatureCard>

        <FeatureCard icon={Filter} title="Filtros e Busca">
          <ul className="space-y-1">
            <li>• <strong>Busca por texto</strong> — Nome da campanha</li>
            <li>• <strong>Filtro por plataforma</strong></li>
            <li>• <strong>Cards de resumo</strong> — Total, ativas, por plataforma</li>
          </ul>
          <p className="mt-2">Clique na campanha para abrir o <strong>painel lateral</strong> com detalhes.</p>
        </FeatureCard>
      </div>
    </div>
  );
}

function UsuariosContent() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Gerencie os membros da sua equipe, defina papéis e permissões, e controle o acesso ao sistema.
      </p>

      <FeatureCard icon={Plus} title="Criar Novo Usuário">
        <StepList steps={[
          'Acesse "Usuários" no menu lateral.',
          'Clique em "Novo Usuário".',
          'Preencha o nome, e-mail e telefone.',
          'Uma senha segura será gerada automaticamente.',
          'Após a criação, um modal exibirá as credenciais — copie e envie ao usuário.',
        ]} />
        <WarningCard title="Atenção">
          As credenciais (e-mail + senha) são exibidas apenas uma vez. Copie-as imediatamente.
        </WarningCard>
      </FeatureCard>

      <FeatureCard icon={Shield} title="Papéis e Permissões">
        <p>3 níveis de acesso hierárquicos:</p>
        <div className="mt-3 space-y-3">
          <div className="p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Crown className="h-4 w-4 text-yellow-600" />
              <strong className="text-sm">Dono (Owner)</strong>
              <RoleBadge role="owner" />
            </div>
            <p className="text-xs text-muted-foreground">Controle total: gerencia usuários, altera funções, gera chaves API, exclui conta.</p>
          </div>
          <div className="p-3 rounded-lg border border-blue-500/30 bg-blue-500/5">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Cog className="h-4 w-4 text-blue-600" />
              <strong className="text-sm">Administrador (Admin)</strong>
              <RoleBadge role="admin" />
            </div>
            <p className="text-xs text-muted-foreground">Cria usuários, reseta senhas, gerencia campanhas e configurações.</p>
          </div>
          <div className="p-3 rounded-lg border border-gray-500/30 bg-gray-500/5">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <User className="h-4 w-4 text-gray-600" />
              <strong className="text-sm">Membro (Member)</strong>
              <RoleBadge role="member" />
            </div>
            <p className="text-xs text-muted-foreground">Acesso padrão: trabalha com leads, visualiza dashboard, registra atividades.</p>
          </div>
        </div>
      </FeatureCard>

      <div className="grid gap-4 sm:grid-cols-3">
        <FeatureCard icon={RefreshCw} title="Resetar Senha">
          <p className="text-xs">Admins e donos podem redefinir a senha de outros membros.</p>
        </FeatureCard>
        <FeatureCard icon={UserCheck} title="Ativar/Desativar">
          <p className="text-xs">Desative para bloquear acesso sem excluir dados.</p>
        </FeatureCard>
        <FeatureCard icon={ArrowUpDown} title="Alterar Função">
          <p className="text-xs">Apenas o <RoleBadge role="owner" /> altera funções.</p>
        </FeatureCard>
      </div>
    </div>
  );
}

function ConfiguracoesContent() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        A página de Configurações é dividida em várias abas, cada uma controlando um aspecto diferente do sistema.
      </p>

      {/* Demo de status */}
      <StatusDemo />

      <div className="grid gap-4 sm:grid-cols-2">
        <FeatureCard icon={User} title="Perfil da Conta">
          <ul className="space-y-1">
            <li>• <strong>Nome</strong> e <strong>nome de exibição</strong></li>
            <li>• <strong>E-mail</strong> de contato</li>
            <li>• <strong>Descrição</strong> da organização</li>
            <li>• <strong>URL do avatar</strong></li>
          </ul>
        </FeatureCard>

        <FeatureCard icon={Palette} title="Status Personalizados">
          <p>Personalize os status dos leads:</p>
          <StepList steps={[
            'Acesse Configurações > aba "Status".',
            'Crie novos status com nome e cor.',
            'Marque flags especiais: "É Ganho" ou "É Perda".',
            'Arraste para reordenar a sequência.',
          ]} />
        </FeatureCard>

        <FeatureCard icon={AlertTriangle} title="Motivos de Perda">
          <p>Configure os motivos quando um lead é perdido:</p>
          <div className="flex flex-wrap gap-1.5 mt-1">
            <Badge variant="outline" className="text-xs">Preço</Badge>
            <Badge variant="outline" className="text-xs">Timing</Badge>
            <Badge variant="outline" className="text-xs">Concorrente</Badge>
            <Badge variant="outline" className="text-xs">Sem Resposta</Badge>
            <Badge variant="outline" className="text-xs">Sem Interesse</Badge>
            <Badge variant="outline" className="text-xs">Outro</Badge>
          </div>
        </FeatureCard>

        <FeatureCard icon={MessageSquare} title="WhatsApp Business">
          <StepList steps={[
            'Acesse Configurações > aba "WhatsApp".',
            'Clique em "Adicionar Conta".',
            'Informe Phone ID e Access Token (Meta Cloud API).',
            'Copie o URL do webhook e configure na Meta.',
            'Use "Testar Webhook" para verificar.',
          ]} />
        </FeatureCard>

        <FeatureCard icon={Bell} title="Notificações">
          <p>Configure quais notificações receber:</p>
          <ul className="space-y-1">
            <li>• <strong>Novos leads</strong> — Quando criados</li>
            <li>• <strong>Webhooks</strong> — Mensagens do WhatsApp</li>
            <li>• <strong>Mudanças de status</strong> — Status alterados</li>
          </ul>
        </FeatureCard>

        <FeatureCard icon={KeyRound} title="Chave API">
          <StepList steps={[
            'Acesse Configurações > aba "API".',
            'Clique em "Gerar Chave API".',
            'Use os botões: revelar/ocultar, copiar ou regenerar.',
          ]} />
          <WarningCard title="Segurança">
            Nunca compartilhe a chave publicamente. Se comprometida, regenere imediatamente.
          </WarningCard>
        </FeatureCard>

        <FeatureCard icon={Download} title="Exportação de Dados">
          <p>Exporte seus dados em CSV ou JSON:</p>
          <ul className="space-y-1">
            <li><IconLabel icon={KanbanSquare} label="Exportar leads" /></li>
            <li><IconLabel icon={Megaphone} label="Exportar campanhas" /></li>
            <li><IconLabel icon={Webhook} label="Exportar logs de webhook" /></li>
          </ul>
          <p className="mt-2">Também: <strong>limpeza de logs antigos</strong>.</p>
        </FeatureCard>
      </div>
    </div>
  );
}

function NotificacoesContent() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        O sistema mantém você informado sobre tarefas, atividades e eventos importantes.
      </p>

      {/* Demo de notificações */}
      <NotificationDemo />

      <div className="grid gap-4 sm:grid-cols-2">
        <FeatureCard icon={Bell} title="Central de Notificações">
          <p>Clique no sino no header para ver:</p>
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center gap-2 text-xs"><AlertTriangle className="h-3.5 w-3.5 text-red-500" /> <strong>Atrasadas</strong> — Tarefas que passaram do prazo</div>
            <div className="flex items-center gap-2 text-xs"><Clock className="h-3.5 w-3.5 text-orange-500" /> <strong>Hoje</strong> — Atividades do dia</div>
            <div className="flex items-center gap-2 text-xs"><CheckCircle2 className="h-3.5 w-3.5 text-blue-500" /> <strong>Pendentes</strong> — Agendadas para os próximos dias</div>
            <div className="flex items-center gap-2 text-xs"><Bell className="h-3.5 w-3.5 text-purple-500" /> <strong>Lembretes</strong> — Notificações desktop</div>
          </div>
        </FeatureCard>

        <FeatureCard icon={MonitorSmartphone} title="Notificações Desktop">
          <StepList steps={[
            'Ao criar uma atividade, ative o "Lembrete".',
            'Escolha quando ser lembrado (ex: 15min antes).',
            'Permita notificações no navegador.',
            'Notificação aparecerá no horário programado.',
          ]} />
        </FeatureCard>
      </div>
    </div>
  );
}

function ContasContent() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        O Touch Run suporta múltiplas contas (multi-tenant), com dados completamente isolados por organização.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <FeatureCard icon={Building2} title="Como Funciona">
          <ul className="space-y-1.5">
            <li>• Cada <strong>conta</strong> é uma organização independente</li>
            <li>• Dados são <strong>isolados por conta</strong></li>
            <li>• Um usuário pode pertencer a <strong>várias contas</strong></li>
            <li>• Papel pode ser <strong>diferente em cada conta</strong></li>
          </ul>
        </FeatureCard>

        <FeatureCard icon={RefreshCw} title="Trocar de Conta">
          <StepList steps={[
            'No topo do sidebar, clique no nome da conta ativa.',
            'Selecione outra conta na lista.',
            'O sistema recarrega todos os dados automaticamente.',
          ]} />
        </FeatureCard>

        <FeatureCard icon={Plus} title="Criar Nova Conta">
          <StepList steps={[
            'No Account Switcher, clique em "Criar nova conta".',
            'Informe o nome e opcionalmente descrição.',
            'Você será o Dono (Owner) automaticamente.',
          ]} />
        </FeatureCard>

        <FeatureCard icon={Shield} title="Papéis por Conta">
          <p>Seus papéis variam entre contas:</p>
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Empresa ABC:</span> <RoleBadge role="owner" />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Cliente XYZ:</span> <RoleBadge role="admin" />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Projeto 123:</span> <RoleBadge role="member" />
            </div>
          </div>
        </FeatureCard>
      </div>
    </div>
  );
}

function PlanosContent() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Visualize os planos disponíveis e gerencie sua assinatura.
      </p>

      <FeatureCard icon={CreditCard} title="Planos Disponíveis">
        <div className="grid grid-cols-4 gap-2 mt-2">
          <div className="p-2 rounded-lg border border-green-500/30 bg-green-500/5 text-center">
            <div className="text-xs font-medium">Beta</div>
            <div className="text-sm font-bold text-green-500">Grátis</div>
          </div>
          <div className="p-2 rounded-lg border border-border text-center opacity-60">
            <div className="text-xs font-medium">Starter</div>
            <div className="text-[10px] text-muted-foreground">Em Breve</div>
          </div>
          <div className="p-2 rounded-lg border border-border text-center opacity-60">
            <div className="text-xs font-medium">Pro</div>
            <div className="text-[10px] text-muted-foreground">Em Breve</div>
          </div>
          <div className="p-2 rounded-lg border border-border text-center opacity-60">
            <div className="text-xs font-medium">Enterprise</div>
            <div className="text-[10px] text-muted-foreground">Em Breve</div>
          </div>
        </div>
      </FeatureCard>

      <div className="grid gap-4 sm:grid-cols-2">
        <FeatureCard icon={CheckCircle2} title="Incluído no Beta">
          <ul className="space-y-1">
            <li className="flex items-center gap-2 text-xs"><CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" /> Leads e usuários ilimitados</li>
            <li className="flex items-center gap-2 text-xs"><CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" /> Todas as funcionalidades</li>
            <li className="flex items-center gap-2 text-xs"><CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" /> Dashboard e integração WhatsApp</li>
            <li className="flex items-center gap-2 text-xs"><CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" /> API, Iframe e exportação de dados</li>
            <li className="flex items-center gap-2 text-xs"><CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" /> Multi-tenant (múltiplas contas)</li>
          </ul>
        </FeatureCard>

        <FeatureCard icon={Info} title="FAQ">
          <div className="space-y-2">
            <div>
              <p className="text-xs font-medium">O beta é realmente gratuito?</p>
              <p className="text-xs text-muted-foreground">Sim, todos os recursos sem custo.</p>
            </div>
            <div>
              <p className="text-xs font-medium">Vou perder meus dados?</p>
              <p className="text-xs text-muted-foreground">Não, dados mantidos na transição.</p>
            </div>
            <div>
              <p className="text-xs font-medium">Posso cancelar depois?</p>
              <p className="text-xs text-muted-foreground">Sim, a qualquer momento.</p>
            </div>
          </div>
        </FeatureCard>
      </div>
    </div>
  );
}

function WhatsAppContent() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        O Touch Run integra-se com o WhatsApp Business API (Meta Cloud API) para capturar leads automaticamente.
      </p>

      <FeatureCard icon={Webhook} title="Fluxo do Webhook">
        <div className="mt-2 space-y-2">
          {[
            { num: 1, color: 'bg-green-500/10 text-green-500', title: 'Cliente envia mensagem', desc: 'Via WhatsApp Business da sua empresa' },
            { num: 2, color: 'bg-blue-500/10 text-blue-500', title: 'Meta envia webhook', desc: 'Dados enviados para o Touch Run' },
            { num: 3, color: 'bg-purple-500/10 text-purple-500', title: 'Sistema processa', desc: 'Identifica conta, texto e frases-gatilho' },
            { num: 4, color: 'bg-orange-500/10 text-orange-500', title: 'Lead criado/atualizado', desc: 'Novo lead ou atualiza existente por telefone' },
            { num: 5, color: 'bg-cyan-500/10 text-cyan-500', title: 'Campanha vinculada', desc: 'Se frase-gatilho corresponder à campanha' },
          ].map(({ num, color, title, desc }) => (
            <div key={num} className="flex items-start gap-3">
              <span className={`flex-shrink-0 w-7 h-7 rounded-full ${color} text-xs font-bold flex items-center justify-center`}>{num}</span>
              <div>
                <p className="text-xs font-medium">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </FeatureCard>

      <div className="grid gap-4 sm:grid-cols-2">
        <FeatureCard icon={Globe} title="Detecção de Plataforma">
          <ul className="space-y-1">
            <li>• <strong>URL de origem</strong> — Facebook, Instagram, Google, etc.</li>
            <li>• <strong>Conteúdo</strong> — Palavras-chave configuradas</li>
            <li>• <strong>Referral</strong> — Anúncios click-to-WhatsApp</li>
          </ul>
        </FeatureCard>

        <FeatureCard icon={Phone} title="Normalização de Telefone">
          <ul className="space-y-1">
            <li>• Formato E.164 internacional</li>
            <li>• Prefixo +55 se ausente (Brasil)</li>
            <li>• Deduplicação automática</li>
          </ul>
          <TipCard title="Exemplo">
            "(11) 99999-8888", "11999998888" e "+5511999998888" = mesmo número.
          </TipCard>
        </FeatureCard>
      </div>
    </div>
  );
}

function IframeContent() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Incorpore o Touch Run em outros sistemas via iframe com autenticação por chave API.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <FeatureCard icon={Code2} title="Como Usar">
          <StepList steps={[
            'Gere uma chave API em Configurações > "API".',
            'Use a URL de embed com o ID do lead.',
            'Adicione um iframe no seu site.',
          ]} />
          <div className="mt-3 p-2 rounded-lg bg-muted font-mono text-[10px] overflow-x-auto">
            <p className="text-muted-foreground">{'<!-- Visualizar lead -->'}</p>
            <p className="break-all">{'<iframe src="/embed/lead-modal/ID?api_key=CHAVE" />'}</p>
            <p className="text-muted-foreground mt-2">{'<!-- Criar lead -->'}</p>
            <p className="break-all">{'<iframe src="/embed/lead-modal/new?api_key=CHAVE&phone=55..." />'}</p>
          </div>
        </FeatureCard>

        <FeatureCard icon={MonitorSmartphone} title="Parâmetros">
          <div className="space-y-2 mt-1">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="text-[10px] flex-shrink-0">api_key</Badge>
              <span className="text-xs text-muted-foreground">Obrigatório. Chave API</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="text-[10px] flex-shrink-0">theme</Badge>
              <span className="text-xs text-muted-foreground">"dark" ou "light"</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="text-[10px] flex-shrink-0">phone</Badge>
              <span className="text-xs text-muted-foreground">Pré-preenche telefone ao criar</span>
            </div>
          </div>
          <TipCard title="Comunicação">
            O iframe envia eventos via postMessage: "lead-created" e "lead-modal-closed".
          </TipCard>
        </FeatureCard>
      </div>
    </div>
  );
}

function FeedbackContent() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Contribua para a evolução do Touch Run enviando sugestões, reportando bugs ou elogiando funcionalidades.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <FeatureCard icon={MessageSquare} title="Widget de Feedback">
          <p>Botão flutuante no canto inferior direito:</p>
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center gap-2">
              <Bug className="h-3.5 w-3.5 text-red-500" /> <span className="text-xs"><strong>Bug</strong> — Reportar um problema</span>
            </div>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-3.5 w-3.5 text-yellow-500" /> <span className="text-xs"><strong>Sugestão</strong> — Propor melhoria</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-3.5 w-3.5 text-pink-500" /> <span className="text-xs"><strong>Elogio</strong> — Algo que gostou</span>
            </div>
          </div>
          <TipCard title="Informações automáticas">
            Navegador, resolução e página atual são enviados junto com o feedback.
          </TipCard>
        </FeatureCard>

        <FeatureCard icon={ThumbsUp} title="Página de Feedbacks">
          <p>Acesse "Feedbacks" no menu lateral para:</p>
          <ul className="space-y-1">
            <li>• Ver feedbacks da comunidade</li>
            <li>• <strong>Votar</strong> nos mais importantes</li>
            <li>• Filtrar por tipo e status</li>
            <li>• Acompanhar implementação</li>
          </ul>
          <p className="mt-2 text-xs text-primary font-medium">Os mais votados têm prioridade na implementação!</p>
        </FeatureCard>
      </div>
    </div>
  );
}

function DicasContent() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Domine o Touch Run com estas dicas e truques:
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <FeatureCard icon={Moon} title="Modo Escuro / Claro">
          <p>Alterne clicando no ícone <IconLabel icon={Sun} label="sol" /> / <IconLabel icon={Moon} label="lua" /> no header. Preferência salva automaticamente.</p>
        </FeatureCard>

        <FeatureCard icon={Search} title="Busca Inteligente">
          <p>Estratégia em 3 etapas:</p>
          <ol className="space-y-1 ml-4 text-xs list-decimal">
            <li><strong>Local-first:</strong> Busca nos dados carregados (instantâneo)</li>
            <li><strong>API fallback:</strong> Consulta o servidor se necessário</li>
            <li><strong>Cache:</strong> Resultados cacheados por 1 minuto</li>
          </ol>
        </FeatureCard>

        <FeatureCard icon={Zap} title="Atualizações Otimistas">
          <ul className="space-y-1">
            <li>• Mudanças aparecem <strong>instantaneamente</strong> (0ms)</li>
            <li>• Erro? <strong>Valor anterior restaurado</strong> automaticamente</li>
            <li>• Funciona em: drag & drop, edição de campos, atividades</li>
          </ul>
        </FeatureCard>

        <FeatureCard icon={Download} title="Exportação de Dados">
          <p>Em Configurações {'>'} Dados:</p>
          <ul className="space-y-1">
            <li>• <strong>CSV</strong> — Para planilhas (Excel, Sheets)</li>
            <li>• <strong>JSON</strong> — Para integrações e backups</li>
          </ul>
        </FeatureCard>

        <FeatureCard icon={Columns3} title="Sidebar Colapsável">
          <ul className="space-y-1">
            <li>• Seta <strong>inferior do sidebar</strong> para recolher</li>
            <li>• Tooltips nos ícones quando recolhido</li>
            <li>• Mais espaço para o quadro Kanban</li>
          </ul>
        </FeatureCard>

        <FeatureCard icon={Star} title="Favoritar Leads">
          <p>Marque leads importantes com estrela para fácil identificação e acompanhamento.</p>
        </FeatureCard>

        <FeatureCard icon={Clock} title="Leads Estagnados">
          <p>No Dashboard, <strong>"Leads Estagnados"</strong> mostra leads parados há muito tempo. Clique para abrir o modal.</p>
        </FeatureCard>

        <FeatureCard icon={Tag} title="Use Tags">
          <p>Adicione tags para categorizar leads. Use o filtro de tags no Kanban para visualizar por categoria.</p>
        </FeatureCard>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            Precisa de mais ajuda?
          </CardTitle>
          <CardDescription>
            Use o <strong>Widget de Feedback</strong> (botão flutuante no canto inferior direito) para entrar em contato.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

// ==========================================
// Mapeamento seção → conteúdo
// ==========================================

const sectionContentMap: Record<string, () => JSX.Element> = {
  'primeiros-passos': PrimeirosPassosContent,
  'navegacao': NavegacaoContent,
  'kanban': KanbanContent,
  'lead-modal': LeadModalContent,
  'dashboard': DashboardContent,
  'campanhas': CampanhasContent,
  'usuarios': UsuariosContent,
  'configuracoes': ConfiguracoesContent,
  'notificacoes': NotificacoesContent,
  'contas': ContasContent,
  'planos': PlanosContent,
  'whatsapp': WhatsAppContent,
  'iframe': IframeContent,
  'feedback': FeedbackContent,
  'dicas': DicasContent,
};

// ==========================================
// Página principal
// ==========================================

export function GuidePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState(guideSections[0].id);
  const [openSections, setOpenSections] = useState<Set<string>>(() => new Set(guideSections.map((s) => s.id)));
  const contentRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Scroll-spy (uses content container as root for proper detection)
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { root: container, rootMargin: '-10% 0px -70% 0px', threshold: 0 }
    );

    const currentRefs = sectionRefs.current;
    currentRefs.forEach((el) => observer.observe(el));

    return () => {
      currentRefs.forEach((el) => observer.unobserve(el));
    };
  }, [searchQuery]);

  // Back to top button visibility
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const handleScroll = () => setShowBackToTop(el.scrollTop > 400);
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const registerSectionRef = useCallback((id: string, el: HTMLElement | null) => {
    if (el) {
      sectionRefs.current.set(id, el);
    } else {
      sectionRefs.current.delete(id);
    }
  }, []);

  const handleSectionClick = useCallback((id: string) => {
    const el = sectionRefs.current.get(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setOpenSections((prev) => new Set(prev).add(id));
    }
  }, []);

  const toggleSection = useCallback((id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const filteredSections = guideSections.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-6 overflow-hidden">
      {/* Sidebar do guia (desktop) */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 border-r border-primary/10 bg-card/60">
        <div className="p-4 pb-2">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
            <h2 className="text-sm font-semibold truncate">Guia do Usuário</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar no guia..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 h-8 text-xs bg-background/80 border-border/60 focus:border-primary/50"
            />
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 pb-4 pt-1">
          {sidebarGroups.map((group) => {
            const groupSections = group.sectionIds
              .map(gid => guideSections.find(s => s.id === gid))
              .filter((s): s is GuideSection =>
                !!s && (s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.description.toLowerCase().includes(searchQuery.toLowerCase()))
              );
            if (groupSections.length === 0) return null;
            return (
              <div key={group.label} className="mb-2">
                <p className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">{group.label}</p>
                <div className="space-y-0.5">
                  {groupSections.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                      <button
                        key={section.id}
                        onClick={() => handleSectionClick(section.id)}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors text-left ${
                          isActive
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                      >
                        <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${isActive ? 'text-primary' : ''}`} />
                        <span className="truncate">{section.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Conteúdo principal */}
      <div className="flex-1 min-w-0 relative overflow-hidden">
        <div ref={contentRef} className="absolute inset-0 overflow-y-auto">
        <div className="p-6 max-w-4xl mx-auto">
          {/* Welcome banner (desktop) */}
          <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/10 hidden lg:block">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-base font-semibold">Bem-vindo ao Guia do Touch Run</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Explore todas as funcionalidades do sistema. Clique nas seções para expandir ou recolher o conteúdo.</p>
              </div>
            </div>
          </div>
          {/* Mobile nav */}
          <div className="lg:hidden mb-4">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Guia do Usuário</h2>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar no guia..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 h-8 text-xs"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {guideSections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSectionClick(section.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] border transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {section.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seções */}
          <div className="space-y-3">
            {filteredSections.map((section) => {
              const ContentComponent = sectionContentMap[section.id];
              return (
                <div key={section.id} ref={(el) => registerSectionRef(section.id, el)}>
                  <SectionWrapper id={section.id}>
                    <CollapsibleSection
                      section={section}
                      isOpen={openSections.has(section.id)}
                      onToggle={() => toggleSection(section.id)}
                    >
                      {ContentComponent && <ContentComponent />}
                    </CollapsibleSection>
                  </SectionWrapper>
                </div>
              );
            })}
          </div>

          {filteredSections.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhuma seção encontrada para "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-primary text-sm mt-2 hover:underline"
              >
                Limpar busca
              </button>
            </div>
          )}
        </div>
        </div>
        {/* Scroll hint */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-muted to-transparent pointer-events-none z-[5]" />
        {/* Back to top */}
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            className="absolute bottom-4 right-6 w-9 h-9 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all z-10"
            title="Voltar ao topo"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
