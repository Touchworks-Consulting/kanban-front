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
  Eye,
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
  ChevronUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';

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

// ==========================================
// Sub-componentes reutilizáveis
// ==========================================

function SectionWrapper({ id, children }: Readonly<{ id: string; children: React.ReactNode }>) {
  return (
    <section id={id} className="scroll-mt-6">
      {children}
    </section>
  );
}

function StepList({ steps }: Readonly<{ steps: string[] }>) {
  return (
    <ol className="space-y-2 ml-1">
      {steps.map((step) => (
        <li key={step.slice(0, 40)} className="flex gap-3 items-start">
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
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          {title}
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
      <Icon className="h-3.5 w-3.5 text-primary" />
      <span>{label}</span>
    </span>
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
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        )}
      </button>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 pt-0 space-y-4 border-t border-border/30">
          <div className="pt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Sidebar do Guia (índice lateral)
// ==========================================

function GuideSidebarNav({
  sections,
  activeSection,
  searchQuery,
  onSearchChange,
  onSectionClick,
}: Readonly<{
  sections: GuideSection[];
  activeSection: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSectionClick: (id: string) => void;
}>) {
  const filteredSections = sections.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-64 flex-shrink-0 hidden lg:block">
      <div className="sticky top-0 space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold">Guia do Usuário</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar no guia..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <ScrollArea className="h-[calc(100vh-220px)]">
          <nav className="space-y-0.5 pr-3">
            {filteredSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => onSectionClick(section.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-primary' : ''}`} />
                  <span className="truncate">{section.title}</span>
                </button>
              );
            })}
          </nav>
        </ScrollArea>
      </div>
    </div>
  );
}

// ==========================================
// Mobile: índice horizontal
// ==========================================

function MobileSectionNav({
  sections,
  activeSection,
  onSectionClick,
}: Readonly<{
  sections: GuideSection[];
  activeSection: string;
  onSectionClick: (id: string) => void;
}>) {
  return (
    <div className="lg:hidden sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border pb-2 mb-4 -mx-2 px-2">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-bold">Guia do Usuário</h1>
      </div>
      <ScrollArea className="w-full">
        <div className="flex gap-1.5 pb-1">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => onSectionClick(section.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition-colors ${
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
      </ScrollArea>
    </div>
  );
}

// ==========================================
// Conteúdo de cada seção
// ==========================================

function PrimeirosPassosContent() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
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

      <div className="grid gap-4 md:grid-cols-2">
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

      <div className="grid gap-4 md:grid-cols-2">
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
          <TipCard title="Busca local-first">
            A busca primeiro procura nos dados já carregados (resposta instantânea). Se não encontrar, automaticamente consulta a API para resultados mais completos. Os resultados são cacheados por 1 minuto.
          </TipCard>
        </FeatureCard>
      </div>

      <FeatureCard icon={StickyNote} title="Card do Lead">
        <p>Cada card no quadro exibe informações resumidas do lead:</p>
        <div className="grid gap-2 sm:grid-cols-2 mt-2">
          <div className="flex items-start gap-2"><User className="h-4 w-4 text-primary mt-0.5" /> <div><strong>Nome</strong> — Identificação do lead</div></div>
          <div className="flex items-start gap-2"><Phone className="h-4 w-4 text-primary mt-0.5" /> <div><strong>Telefone</strong> — Número formatado</div></div>
          <div className="flex items-start gap-2"><Mail className="h-4 w-4 text-primary mt-0.5" /> <div><strong>E-mail</strong> — Quando informado</div></div>
          <div className="flex items-start gap-2"><Hash className="h-4 w-4 text-primary mt-0.5" /> <div><strong>Valor</strong> — Em R$ (reais)</div></div>
          <div className="flex items-start gap-2"><Globe className="h-4 w-4 text-primary mt-0.5" /> <div><strong>Badge de plataforma</strong> — Ícone da origem</div></div>
          <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5" /> <div><strong>Badge de tarefas</strong> — Vermelho (atrasada), laranja (hoje), azul (pendente)</div></div>
          <div className="flex items-start gap-2"><UserCheck className="h-4 w-4 text-primary mt-0.5" /> <div><strong>Avatar do responsável</strong> — Quem cuida desse lead</div></div>
        </div>
        <p className="mt-3">Clique em qualquer card para abrir o <strong>Modal do Lead</strong> com todos os detalhes.</p>
      </FeatureCard>

      <FeatureCard icon={ArrowUpDown} title="Informações das Colunas">
        <p>Cada coluna exibe no topo:</p>
        <ul className="space-y-1">
          <li>• <strong>Contagem de leads</strong> — Quantos leads estão naquele estágio</li>
          <li>• <strong>Valor total</strong> — Soma dos valores de todos os leads da coluna (em R$)</li>
        </ul>
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

      <div className="grid gap-4 md:grid-cols-2">
        <FeatureCard icon={FileText} title="Sidebar de Dados (Painel Esquerdo)">
          <p>Todos os campos do lead ficam no painel esquerdo, com <strong>edição inline</strong>:</p>
          <ul className="space-y-1.5">
            <li><IconLabel icon={Phone} label="Telefone — Com validação e formatação automática" /></li>
            <li><IconLabel icon={Mail} label="E-mail — Validação de formato" /></li>
            <li><IconLabel icon={Hash} label="Valor — Em R$ com formatação de moeda" /></li>
            <li><IconLabel icon={Globe} label="Plataforma — Origem do lead (Meta, Google, etc.)" /></li>
            <li><IconLabel icon={Megaphone} label="Campanha — Campanha vinculada" /></li>
            <li><IconLabel icon={CircleDot} label="Status — Status personalizado da conta" /></li>
            <li><IconLabel icon={UserCheck} label="Responsável — Membro da equipe" /></li>
            <li><IconLabel icon={StickyNote} label="Notas — Campo de texto livre para anotações" /></li>
            <li><IconLabel icon={Tag} label="Tags — Etiquetas para categorização" /></li>
          </ul>
          <TipCard title="Edição inline instantânea">
            Clique em qualquer campo, edite e pressione Enter ou clique fora para salvar. A atualização aparece instantaneamente (otimista) — se falhar, o valor anterior é restaurado automaticamente.
          </TipCard>
        </FeatureCard>

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
            <p>Gerencie tarefas vinculadas ao lead:</p>
            <ul className="space-y-1">
              <li>• Criar tarefas com título, descrição, data limite e prioridade</li>
              <li>• <strong>4 níveis de prioridade:</strong></li>
            </ul>
            <div className="flex flex-wrap gap-1.5 mt-1 ml-4">
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

      <div className="grid gap-4 md:grid-cols-2">
        <FeatureCard icon={Users} title="Aba: Contatos">
          <p>Adicione múltiplos contatos ao lead (útil para empresas com vários decisores):</p>
          <ul className="space-y-1">
            <li>• <strong>Nome, e-mail, telefone</strong> do contato adicional</li>
            <li>• <strong>Cargo</strong> e <strong>departamento</strong></li>
            <li>• <strong>Notas</strong> sobre cada contato</li>
            <li>• Marcar um contato como <strong>principal</strong></li>
            <li>• Editar ou remover contatos a qualquer momento</li>
          </ul>
        </FeatureCard>

        <FeatureCard icon={Upload} title="Aba: Arquivos">
          <p>Anexe documentos ao lead:</p>
          <ul className="space-y-1">
            <li>• <strong>Upload</strong> de arquivos (propostas, contratos, apresentações)</li>
            <li>• <strong>Download</strong> de arquivos anexados</li>
            <li>• <strong>Preview</strong> de imagens e documentos</li>
            <li>• Ícone do tipo de arquivo para identificação rápida</li>
            <li>• Status de verificação de vírus dos arquivos</li>
          </ul>
        </FeatureCard>
      </div>

      <FeatureCard icon={Calendar} title="Painel de Agenda">
        <p>No lado direito do modal, existe o <strong>Painel de Agenda</strong> colapsável:</p>
        <ul className="space-y-1">
          <li>• Mostra suas <strong>atividades agendadas</strong> para os próximos dias</li>
          <li>• Navegação por dia (anterior/próximo)</li>
          <li>• Abra ou feche o painel clicando no ícone de calendário</li>
          <li>• Ajuda a ter visão geral da sua agenda sem sair do lead</li>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
          <div className="p-2 rounded-lg bg-muted/50 text-center">
            <div className="text-xs text-muted-foreground">Total de Leads</div>
            <div className="text-lg font-bold text-primary">—</div>
          </div>
          <div className="p-2 rounded-lg bg-muted/50 text-center">
            <div className="text-xs text-muted-foreground">Leads Recentes</div>
            <div className="text-lg font-bold text-blue-500">—</div>
          </div>
          <div className="p-2 rounded-lg bg-muted/50 text-center">
            <div className="text-xs text-muted-foreground">Leads Ganhos</div>
            <div className="text-lg font-bold text-green-500">—</div>
          </div>
          <div className="p-2 rounded-lg bg-muted/50 text-center">
            <div className="text-xs text-muted-foreground">Taxa de Conversão</div>
            <div className="text-lg font-bold text-purple-500">— %</div>
          </div>
          <div className="p-2 rounded-lg bg-muted/50 text-center">
            <div className="text-xs text-muted-foreground">Receita Total</div>
            <div className="text-lg font-bold text-emerald-500">R$ —</div>
          </div>
          <div className="p-2 rounded-lg bg-muted/50 text-center">
            <div className="text-xs text-muted-foreground">MQL %</div>
            <div className="text-lg font-bold text-cyan-500">— %</div>
          </div>
        </div>
      </FeatureCard>

      <div className="grid gap-4 md:grid-cols-2">
        <FeatureCard icon={BarChart3} title="Gráficos de Performance">
          <p>Visualizações interativas dos seus dados:</p>
          <ul className="space-y-1.5">
            <li><IconLabel icon={TrendingUp} label="Timeline de leads — Leads e conversões ao longo do tempo" /></li>
            <li><IconLabel icon={BarChart3} label="Performance de vendas — Gráfico de barras por vendedor" /></li>
            <li><IconLabel icon={PieChart} label="Distribuição por status — Como seus leads estão distribuídos" /></li>
            <li><IconLabel icon={Target} label="Scatter atividade vs conversão — Correlação entre esforço e resultado" /></li>
            <li><IconLabel icon={Clock} label="Tempo por estágio — Quanto tempo leads ficam em cada etapa" /></li>
          </ul>
        </FeatureCard>

        <FeatureCard icon={PieChart} title="Relatórios Detalhados">
          <ul className="space-y-1.5">
            <li><IconLabel icon={Target} label="Funil de conversão — Visualize as taxas de passagem entre etapas" /></li>
            <li><IconLabel icon={ListOrdered} label="Métricas por estágio — Tabela detalhada com dados de cada coluna" /></li>
            <li><IconLabel icon={Trophy} label="Ranking de vendedores — Classificação por leads, conversão e receita" /></li>
            <li><IconLabel icon={AlertTriangle} label="Motivos de perda — Análise dos motivos mais frequentes de perda" /></li>
            <li><IconLabel icon={Clock} label="Leads estagnados — Leads parados há muito tempo (clique para abrir o lead)" /></li>
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
        <p className="mt-2">O filtro de datas afeta todos os gráficos e métricas simultaneamente, permitindo análises comparativas precisas.</p>
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

      <div className="grid gap-4 md:grid-cols-2">
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
          <p>As frases-gatilho conectam mensagens recebidas no <strong>WhatsApp</strong> às campanhas:</p>
          <StepList steps={[
            'Abra uma campanha existente.',
            'Clique em "Frases-Gatilho" ou no ícone de raio ⚡.',
            'Adicione frases que identificam a campanha (ex: "quero saber mais", "promoção verão").',
            'Escolha o tipo de correspondência: exata ou contém.',
            'Quando uma mensagem do WhatsApp contiver a frase, o lead será vinculado a essa campanha automaticamente.',
          ]} />
          <TipCard title="Como funciona na prática?">
            Quando alguém envia "Olá, vi a promoção verão" no WhatsApp e você tem a frase-gatilho "promoção verão" (tipo: contém), o sistema cria o lead e associa automaticamente à campanha.
          </TipCard>
        </FeatureCard>

        <FeatureCard icon={BarChart3} title="Relatórios de Campanha">
          <p>Acompanhe o desempenho de cada campanha:</p>
          <ul className="space-y-1">
            <li>• <strong>Total de leads</strong> gerados pela campanha</li>
            <li>• <strong>Custo por lead</strong> calculado automaticamente (budget ÷ leads)</li>
            <li>• <strong>Gráficos de performance</strong> ao longo do tempo</li>
            <li>• <strong>Frases mais efetivas</strong> — Quais frases-gatilho geram mais leads</li>
          </ul>
        </FeatureCard>

        <FeatureCard icon={Filter} title="Filtros e Busca">
          <p>Encontre campanhas rapidamente:</p>
          <ul className="space-y-1">
            <li>• <strong>Busca por texto</strong> — Pesquise pelo nome da campanha</li>
            <li>• <strong>Filtro por plataforma</strong> — Veja apenas campanhas de uma plataforma</li>
            <li>• <strong>Cards de resumo</strong> — Total de campanhas, ativas e por plataforma no topo</li>
          </ul>
          <p className="mt-2">Clique em uma campanha para abrir o <strong>painel lateral</strong> com todos os detalhes, métricas e configurações.</p>
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
          As credenciais (e-mail + senha) são exibidas apenas uma vez após a criação. Copie-as imediatamente usando o botão de cópia.
        </WarningCard>
      </FeatureCard>

      <FeatureCard icon={Shield} title="Papéis e Permissões">
        <p>O sistema possui 3 níveis de acesso hierárquicos:</p>
        <div className="mt-3 space-y-3">
          <div className="p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
            <div className="flex items-center gap-2 mb-1">
              <Crown className="h-4 w-4 text-yellow-600" />
              <strong className="text-sm">Dono (Owner)</strong>
              <RoleBadge role="owner" />
            </div>
            <p className="text-xs text-muted-foreground">Controle total: gerencia todos os usuários, altera funções, gera chaves API, exclui conta. Primeira pessoa a criar a conta recebe este papel automaticamente.</p>
          </div>
          <div className="p-3 rounded-lg border border-blue-500/30 bg-blue-500/5">
            <div className="flex items-center gap-2 mb-1">
              <Cog className="h-4 w-4 text-blue-600" />
              <strong className="text-sm">Administrador (Admin)</strong>
              <RoleBadge role="admin" />
            </div>
            <p className="text-xs text-muted-foreground">Pode criar usuários, resetar senhas de outros membros, gerenciar campanhas e configurações. Não pode alterar funções nem excluir a conta.</p>
          </div>
          <div className="p-3 rounded-lg border border-gray-500/30 bg-gray-500/5">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-gray-600" />
              <strong className="text-sm">Membro (Member)</strong>
              <RoleBadge role="member" />
            </div>
            <p className="text-xs text-muted-foreground">Acesso padrão: trabalha com leads, visualiza dashboard, registra atividades. Não pode gerenciar outros usuários nem configurações avançadas.</p>
          </div>
        </div>
      </FeatureCard>

      <div className="grid gap-4 md:grid-cols-3">
        <FeatureCard icon={RefreshCw} title="Resetar Senha">
          <p className="text-xs">Administradores e donos podem redefinir a senha de outros membros da equipe. Uma nova senha segura é gerada automaticamente.</p>
          <WarningCard title="Restrição">
            Você não pode resetar sua própria senha por aqui. Use "Esqueceu a senha?" na tela de login.
          </WarningCard>
        </FeatureCard>

        <FeatureCard icon={UserCheck} title="Ativar/Desativar">
          <p className="text-xs">Desative usuários para bloquear o acesso sem excluí-los. Os dados e histórico permanecem intactos. Reative a qualquer momento.</p>
        </FeatureCard>

        <FeatureCard icon={ArrowUpDown} title="Alterar Função">
          <p className="text-xs">Apenas o <RoleBadge role="owner" /> pode alterar funções de outros usuários entre Membro e Admin via o dropdown na listagem.</p>
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

      <div className="grid gap-4 md:grid-cols-2">
        <FeatureCard icon={User} title="Perfil da Conta">
          <p>Edite as informações da sua organização:</p>
          <ul className="space-y-1">
            <li>• <strong>Nome</strong> e <strong>nome de exibição</strong> da conta</li>
            <li>• <strong>E-mail</strong> de contato</li>
            <li>• <strong>Descrição</strong> da organização</li>
            <li>• <strong>URL do avatar</strong> da conta</li>
          </ul>
        </FeatureCard>

        <FeatureCard icon={Palette} title="Status Personalizados">
          <p>Personalize os status dos leads para se adaptar ao seu fluxo:</p>
          <StepList steps={[
            'Acesse Configurações > aba "Status".',
            'Veja os status padrão: Novo, Contatado, Qualificado, Proposta, Ganho, Perdido.',
            'Clique no "+" para criar um novo status.',
            'Defina: nome, cor e se é status de ganho ou perda.',
            'Arraste para reordenar a sequência dos status.',
            'Edite ou exclua status existentes (exceto os marcados como sistema).',
          ]} />
          <div className="mt-2">
            <p className="text-xs font-medium mb-1">Flags especiais:</p>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30 text-xs">✓ É Ganho</Badge>
              <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30 text-xs">✗ É Perda</Badge>
            </div>
          </div>
        </FeatureCard>

        <FeatureCard icon={AlertTriangle} title="Motivos de Perda">
          <p>Configure os motivos de perda que aparecem quando um lead é marcado como perdido:</p>
          <div className="flex flex-wrap gap-1.5 mt-1">
            <Badge variant="outline" className="text-xs">Preço</Badge>
            <Badge variant="outline" className="text-xs">Timing</Badge>
            <Badge variant="outline" className="text-xs">Concorrente</Badge>
            <Badge variant="outline" className="text-xs">Sem Resposta</Badge>
            <Badge variant="outline" className="text-xs">Sem Interesse</Badge>
            <Badge variant="outline" className="text-xs">Outro</Badge>
          </div>
          <p className="mt-2">Adicione, edite ou remova motivos de acordo com a realidade do seu negócio.</p>
        </FeatureCard>

        <FeatureCard icon={MessageSquare} title="WhatsApp Business">
          <p>Conecte contas do WhatsApp Business para automação:</p>
          <StepList steps={[
            'Acesse Configurações > aba "WhatsApp".',
            'Clique em "Adicionar Conta".',
            'Informe o Phone ID e Access Token da API do WhatsApp Business (Meta Cloud API).',
            'Copie o URL do webhook exibido e configure-o no painel da Meta.',
            'Use "Testar Webhook" para verificar a conexão.',
            'Acesse "Logs do Webhook" para monitorar eventos recebidos.',
          ]} />
        </FeatureCard>

        <FeatureCard icon={Bell} title="Notificações">
          <p>Configure quais notificações deseja receber:</p>
          <ul className="space-y-1">
            <li>• <strong>Novos leads</strong> — Quando um lead é criado</li>
            <li>• <strong>Webhooks</strong> — Quando mensagens chegam via WhatsApp</li>
            <li>• <strong>Mudanças de status</strong> — Quando status de leads mudam</li>
          </ul>
          <p className="mt-2">Ative ou desative cada tipo usando os toggles.</p>
        </FeatureCard>

        <FeatureCard icon={KeyRound} title="Chave API">
          <p>Gere uma chave API para integrações externas (iframe/embed):</p>
          <StepList steps={[
            'Acesse Configurações > aba "API".',
            'Clique em "Gerar Chave API".',
            'A chave será exibida (parcialmente oculta por padrão).',
            'Use os botões para: revelar/ocultar, copiar, ou regenerar.',
          ]} />
          <WarningCard title="Segurança">
            A chave API dá acesso aos dados da conta. Nunca compartilhe publicamente. Se comprometida, regenere imediatamente.
          </WarningCard>
        </FeatureCard>

        <FeatureCard icon={Download} title="Exportação de Dados">
          <p>Exporte seus dados em formato CSV ou JSON:</p>
          <ul className="space-y-1">
            <li><IconLabel icon={KanbanSquare} label="Exportar leads — Todos os leads com seus dados" /></li>
            <li><IconLabel icon={Megaphone} label="Exportar campanhas — Dados de todas as campanhas" /></li>
            <li><IconLabel icon={Webhook} label="Exportar logs de webhook — Histórico de eventos" /></li>
          </ul>
          <p className="mt-2">Também disponível: <strong>limpeza de logs antigos</strong> para manutenção do sistema.</p>
        </FeatureCard>
      </div>
    </div>
  );
}

function NotificacoesContent() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        O sistema de notificações do Touch Run mantém você informado sobre tarefas, atividades e eventos importantes — tudo acessível pelo sino no cabeçalho.
      </p>

      <FeatureCard icon={Bell} title="Central de Notificações">
        <p>Clique no <IconLabel icon={Bell} label="sino no header" /> para abrir o painel de notificações:</p>
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-red-500/5 border border-red-500/20">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-xs font-medium">Tarefas Atrasadas</p>
              <p className="text-xs text-muted-foreground">Tarefas que passaram do prazo e precisam de atenção urgente</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg bg-orange-500/5 border border-orange-500/20">
            <Clock className="h-4 w-4 text-orange-500" />
            <div>
              <p className="text-xs font-medium">Tarefas de Hoje</p>
              <p className="text-xs text-muted-foreground">Atividades programadas para o dia de hoje</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-500/5 border border-blue-500/20">
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs font-medium">Tarefas Pendentes</p>
              <p className="text-xs text-muted-foreground">Atividades agendadas para os próximos dias</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg bg-purple-500/5 border border-purple-500/20">
            <Bell className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-xs font-medium">Lembretes de Atividade</p>
              <p className="text-xs text-muted-foreground">Notificações da área de trabalho para lembretes agendados</p>
            </div>
          </div>
        </div>
      </FeatureCard>

      <div className="grid gap-4 md:grid-cols-2">
        <FeatureCard icon={Eye} title="Ações nas Notificações">
          <ul className="space-y-1">
            <li>• <strong>Marcar como lida</strong> — Clique na notificação individual</li>
            <li>• <strong>Marcar todas como lidas</strong> — Botão no topo do painel</li>
            <li>• <strong>Dispensar</strong> — Remove a notificação da lista</li>
            <li>• <strong>Contagem no badge</strong> — O número no sino mostra quantas não-lidas</li>
          </ul>
          <TipCard title="Persistência">
            O estado de lido/dispensado é salvo localmente no navegador, então suas notificações mantêm o estado entre sessões.
          </TipCard>
        </FeatureCard>

        <FeatureCard icon={MonitorSmartphone} title="Notificações Desktop">
          <p>O sistema pode enviar <strong>notificações da área de trabalho</strong> (via API de Notificações do navegador) para lembretes de atividades:</p>
          <StepList steps={[
            'Ao criar uma atividade, ative o "Lembrete".',
            'Escolha quando deseja ser lembrado (ex: 15min antes).',
            'Permita notificações do navegador quando solicitado.',
            'Uma notificação aparecerá na área de trabalho no horário programado.',
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
        O Touch Run suporta múltiplas contas (multi-tenant), permitindo que um mesmo usuário participe de diferentes organizações com dados completamente isolados.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <FeatureCard icon={Building2} title="Como Funciona o Multi-Tenant">
          <ul className="space-y-1.5">
            <li>• Cada <strong>conta</strong> é uma organização independente</li>
            <li>• Dados (leads, campanhas, colunas) são <strong>isolados por conta</strong></li>
            <li>• Um usuário pode pertencer a <strong>várias contas</strong></li>
            <li>• Cada conta tem seu próprio <strong>plano de assinatura</strong></li>
            <li>• O papel do usuário pode ser <strong>diferente em cada conta</strong> (Dono em uma, Membro em outra)</li>
          </ul>
        </FeatureCard>

        <FeatureCard icon={RefreshCw} title="Trocar de Conta">
          <StepList steps={[
            'No topo do sidebar, clique no nome da conta ativa.',
            'Selecione outra conta na lista.',
            'O sistema recarrega todos os dados automaticamente.',
            'Agora você está trabalhando no contexto da conta selecionada.',
          ]} />
          <TipCard title="Troca instantânea">
            Ao trocar de conta, todos os dados (quadro Kanban, dashboard, campanhas) são recarregados para refletir a conta selecionada.
          </TipCard>
        </FeatureCard>

        <FeatureCard icon={Plus} title="Criar Nova Conta">
          <StepList steps={[
            'No Account Switcher (topo do sidebar), clique em "Criar nova conta".',
            'Informe o nome da conta e opcionalmente um nome de exibição e descrição.',
            'Selecione o plano desejado.',
            'Confirme — você será o Dono (Owner) da nova conta.',
          ]} />
        </FeatureCard>

        <FeatureCard icon={Shield} title="Papéis por Conta">
          <p>Seus papéis podem variar entre contas:</p>
          <div className="mt-2 space-y-2">
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
        Visualize os planos disponíveis e gerencie sua assinatura na página de Planos, acessível pelo menu do avatar no header.
      </p>

      <FeatureCard icon={CreditCard} title="Planos Disponíveis">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
          <div className="p-3 rounded-lg border border-green-500/30 bg-green-500/5 text-center">
            <div className="text-xs font-medium">Beta</div>
            <div className="text-lg font-bold text-green-500">Grátis</div>
            <div className="text-xs text-muted-foreground mt-1">Todos os recursos</div>
          </div>
          <div className="p-3 rounded-lg border border-border text-center opacity-60">
            <div className="text-xs font-medium">Starter</div>
            <div className="text-xs text-muted-foreground mt-1">Em Breve</div>
          </div>
          <div className="p-3 rounded-lg border border-border text-center opacity-60">
            <div className="text-xs font-medium">Professional</div>
            <div className="text-xs text-muted-foreground mt-1">Em Breve</div>
          </div>
          <div className="p-3 rounded-lg border border-border text-center opacity-60">
            <div className="text-xs font-medium">Enterprise</div>
            <div className="text-xs text-muted-foreground mt-1">Em Breve</div>
          </div>
        </div>
      </FeatureCard>

      <div className="grid gap-4 md:grid-cols-2">
        <FeatureCard icon={CheckCircle2} title="O que está incluído no Beta?">
          <ul className="space-y-1">
            <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Leads ilimitados</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Usuários ilimitados</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Todas as funcionalidades</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Dashboard completo</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Integração WhatsApp</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> API e Iframe/Embed</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Exportação de dados</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Multi-tenant (múltiplas contas)</li>
          </ul>
        </FeatureCard>

        <FeatureCard icon={Info} title="FAQ (Perguntas Frequentes)">
          <div className="space-y-2">
            <div>
              <p className="text-xs font-medium">O beta é realmente gratuito?</p>
              <p className="text-xs text-muted-foreground">Sim! Durante o período beta, todos os recursos estão disponíveis sem custo.</p>
            </div>
            <div>
              <p className="text-xs font-medium">Vou perder meus dados quando sair do beta?</p>
              <p className="text-xs text-muted-foreground">Não. Seus dados serão mantidos na transição para os planos pagos.</p>
            </div>
            <div>
              <p className="text-xs font-medium">Posso cancelar a qualquer momento?</p>
              <p className="text-xs text-muted-foreground">Sim. Após o beta, os planos pagos poderão ser cancelados a qualquer momento.</p>
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
        O Touch Run integra-se com o WhatsApp Business API (Meta Cloud API) para capturar leads automaticamente a partir de mensagens recebidas.
      </p>

      <FeatureCard icon={Webhook} title="Como Funciona o Fluxo de Webhook">
        <p>O fluxo completo de captura de lead via WhatsApp:</p>
        <div className="mt-3 space-y-2">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/10 text-green-500 text-xs font-bold flex items-center justify-center">1</span>
            <div>
              <p className="text-xs font-medium">Cliente envia mensagem</p>
              <p className="text-xs text-muted-foreground">O cliente escreve no WhatsApp Business da sua empresa</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold flex items-center justify-center">2</span>
            <div>
              <p className="text-xs font-medium">Meta envia webhook</p>
              <p className="text-xs text-muted-foreground">A Meta (Facebook) envia os dados da mensagem para o Touch Run</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/10 text-purple-500 text-xs font-bold flex items-center justify-center">3</span>
            <div>
              <p className="text-xs font-medium">Sistema processa</p>
              <p className="text-xs text-muted-foreground">O sistema identifica a conta do WhatsApp, extrai o texto e verifica frases-gatilho</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold flex items-center justify-center">4</span>
            <div>
              <p className="text-xs font-medium">Lead é criado ou atualizado</p>
              <p className="text-xs text-muted-foreground">Se o telefone já existe, atualiza a mensagem. Senão, cria um novo lead na coluna "Leads Entrantes"</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-500 text-xs font-bold flex items-center justify-center">5</span>
            <div>
              <p className="text-xs font-medium">Campanha vinculada</p>
              <p className="text-xs text-muted-foreground">Se a mensagem contém uma frase-gatilho, o lead é vinculado automaticamente à campanha</p>
            </div>
          </div>
        </div>
      </FeatureCard>

      <div className="grid gap-4 md:grid-cols-2">
        <FeatureCard icon={Globe} title="Detecção Automática de Plataforma">
          <p>O sistema detecta automaticamente a origem do lead com base em:</p>
          <ul className="space-y-1">
            <li>• <strong>URL de origem</strong> (source_url) — Identifica Facebook, Instagram, Google, YouTube, LinkedIn, TikTok</li>
            <li>• <strong>Conteúdo da mensagem</strong> — Palavras-chave configuradas no PlatformConfig</li>
            <li>• <strong>Referral do anúncio</strong> (click-to-WhatsApp) — Captura a "frase efetiva" do anúncio que gerou o contato</li>
          </ul>
        </FeatureCard>

        <FeatureCard icon={Phone} title="Normalização de Telefone">
          <p>Todos os números de telefone são normalizados automaticamente:</p>
          <ul className="space-y-1">
            <li>• Formato E.164 padrão internacional</li>
            <li>• Prefixo +55 adicionado se ausente (Brasil)</li>
            <li>• Deduplicação de leads pelo telefone normalizado</li>
          </ul>
          <TipCard title="Exemplo">
            "(11) 99999-8888", "11999998888" e "+5511999998888" são todos reconhecidos como o mesmo número.
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
        O Touch Run pode ser incorporado em outros sistemas (sites, aplicações internas) via iframe usando autenticação por chave API.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <FeatureCard icon={Code2} title="Como Usar o Iframe/Embed">
          <StepList steps={[
            'Gere uma chave API em Configurações > aba "API".',
            'Use a URL de embed com o ID do lead ou modo de criação.',
            'Adicione um iframe no seu site apontando para a URL.',
            'O modal do lead será renderizado dentro do iframe.',
          ]} />
          <div className="mt-3 p-3 rounded-lg bg-muted font-mono text-xs overflow-x-auto">
            <p className="text-muted-foreground mb-1">{'<!-- Visualizar lead existente -->'}</p>
            <p>{'<iframe src="https://seudominio.com/embed/lead-modal/LEAD_ID?api_key=SUA_CHAVE&theme=dark" />'}</p>
            <p className="text-muted-foreground mt-3 mb-1">{'<!-- Criar novo lead -->'}</p>
            <p>{'<iframe src="https://seudominio.com/embed/lead-modal/new?api_key=SUA_CHAVE&phone=5511999998888" />'}</p>
          </div>
        </FeatureCard>

        <FeatureCard icon={MonitorSmartphone} title="Parâmetros Disponíveis">
          <div className="space-y-2 mt-1">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="text-xs flex-shrink-0">api_key</Badge>
              <span className="text-xs text-muted-foreground">Obrigatório. Sua chave API gerada nas configurações</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="text-xs flex-shrink-0">theme</Badge>
              <span className="text-xs text-muted-foreground">Opcional. "dark" ou "light" (padrão: segue o sistema)</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="text-xs flex-shrink-0">phone</Badge>
              <span className="text-xs text-muted-foreground">Opcional. Pré-preenche o telefone ao criar lead</span>
            </div>
          </div>
          <TipCard title="Comunicação com a página pai">
            O iframe envia eventos via <code className="text-xs">postMessage</code> para comunicar com o sistema externo: <code className="text-xs">lead-created</code> e <code className="text-xs">lead-modal-closed</code>.
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
        O sistema de feedback permite que você contribua diretamente para a evolução do Touch Run, enviando sugestões, reportando bugs ou elogiando funcionalidades.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <FeatureCard icon={MessageSquare} title="Widget de Feedback (Botão Flutuante)">
          <p>Um botão flutuante no canto inferior direito de qualquer página permite enviar feedback rápido:</p>
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2">
              <Bug className="h-4 w-4 text-red-500" />
              <div>
                <span className="text-xs font-medium">Bug</span>
                <span className="text-xs text-muted-foreground ml-1">— Reportar um problema encontrado</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              <div>
                <span className="text-xs font-medium">Sugestão</span>
                <span className="text-xs text-muted-foreground ml-1">— Propor uma melhoria ou nova função</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-500" />
              <div>
                <span className="text-xs font-medium">Elogio</span>
                <span className="text-xs text-muted-foreground ml-1">— Algo que você gostou no sistema</span>
              </div>
            </div>
          </div>
          <TipCard title="Informações automáticas">
            Junto com seu feedback, o sistema envia automaticamente informações técnicas (navegador, resolução da tela, página atual) para ajudar na análise.
          </TipCard>
        </FeatureCard>

        <FeatureCard icon={ThumbsUp} title="Página de Feedbacks da Comunidade">
          <p>Acesse <strong>"Feedbacks"</strong> no menu lateral para:</p>
          <ul className="space-y-1">
            <li>• Ver todos os feedbacks enviados pela comunidade</li>
            <li>• <strong>Votar</strong> nos feedbacks que você considera mais importantes (polegar para cima)</li>
            <li>• Filtrar por tipo (bug, sugestão, elogio) e status</li>
            <li>• Acompanhar o progresso de implementação dos feedbacks</li>
          </ul>
          <p className="mt-2">Os feedbacks mais votados têm prioridade na implementação!</p>
        </FeatureCard>
      </div>
    </div>
  );
}

function DicasContent() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Domine o Touch Run com estas dicas e truques que vão acelerar seu dia a dia:
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <FeatureCard icon={Moon} title="Modo Escuro / Claro">
          <p>Alterne entre o modo escuro e claro clicando no ícone <IconLabel icon={Sun} label="sol" /> / <IconLabel icon={Moon} label="lua" /> no cabeçalho. Sua preferência é salva automaticamente para as próximas sessões.</p>
        </FeatureCard>

        <FeatureCard icon={Search} title="Busca Inteligente">
          <p>A busca no Kanban usa uma estratégia inteligente:</p>
          <ol className="space-y-1 ml-4 text-xs list-decimal">
            <li><strong>Local-first:</strong> Busca nos dados já carregados (instantâneo)</li>
            <li><strong>API fallback:</strong> Se não encontrar, consulta o servidor</li>
            <li><strong>Cache:</strong> Resultados são cacheados por 1 minuto</li>
          </ol>
          <p className="mt-1">Busque por nome, e-mail, telefone, campanha ou mensagem do lead.</p>
        </FeatureCard>

        <FeatureCard icon={Zap} title="Atualizações Otimistas">
          <p>O sistema usa <strong>atualizações otimistas</strong> em todas as operações:</p>
          <ul className="space-y-1">
            <li>• As mudanças aparecem <strong>instantaneamente</strong> na tela (0ms de latência percebida)</li>
            <li>• Se houver erro de conexão, o <strong>valor anterior é restaurado</strong> automaticamente</li>
            <li>• Funciona para: arrastar leads, editar campos, criar atividades, etc.</li>
          </ul>
        </FeatureCard>

        <FeatureCard icon={Download} title="Exportação de Dados">
          <p>Exporte seus dados a qualquer momento em Configurações {'>'} Dados:</p>
          <ul className="space-y-1">
            <li>• <strong>CSV</strong> — Ideal para planilhas (Excel, Google Sheets)</li>
            <li>• <strong>JSON</strong> — Ideal para integrações e backups</li>
            <li>• Todos os leads, campanhas e logs disponíveis para exportação</li>
          </ul>
        </FeatureCard>

        <FeatureCard icon={Columns3} title="Sidebar Colapsável">
          <p>Ganhe mais espaço na tela recolhendo o sidebar:</p>
          <ul className="space-y-1">
            <li>• Clique na seta na parte <strong>inferior do sidebar</strong></li>
            <li>• Quando recolhido, passe o mouse nos ícones para ver <strong>tooltips</strong></li>
            <li>• A página ganha toda a largura disponível para o quadro Kanban</li>
          </ul>
        </FeatureCard>

        <FeatureCard icon={Star} title="Favoritar Leads">
          <p>Marque leads importantes com a estrela no modal do lead. Leads favoritados ficam mais fáceis de identificar e acompanhar.</p>
        </FeatureCard>

        <FeatureCard icon={Clock} title="Leads Estagnados">
          <p>No Dashboard, a seção <strong>"Leads Estagnados"</strong> mostra leads parados há muito tempo em uma etapa. Clique neles para abrir direto no modal e tomar uma ação.</p>
        </FeatureCard>

        <FeatureCard icon={Tag} title="Use Tags para Organizar">
          <p>Adicione tags aos leads para criar uma categorização personalizada. Depois, use o filtro de tags no quadro Kanban para visualizar apenas os leads de uma categoria específica.</p>
        </FeatureCard>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            Precisa de mais ajuda?
          </CardTitle>
          <CardDescription>
            Se tiver dúvidas ou sugestões, use o <strong>Widget de Feedback</strong> (botão flutuante no canto inferior direito) para entrar em contato. Estamos aqui para ajudar!
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

  // Scroll-spy: detecta seção visível
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );

    const currentRefs = sectionRefs.current;
    currentRefs.forEach((el) => observer.observe(el));

    return () => {
      currentRefs.forEach((el) => observer.unobserve(el));
    };
  }, [searchQuery]);

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
      // Garantir que a seção está aberta
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

  // Filtrar seções pela busca
  const filteredSections = guideSections.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex gap-6 h-full -m-6">
      {/* Sidebar de navegação (desktop) */}
      <div className="hidden lg:block w-64 flex-shrink-0 border-r border-border bg-background p-4 overflow-y-auto">
        <GuideSidebarNav
          sections={guideSections}
          activeSection={activeSection}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSectionClick={handleSectionClick}
        />
      </div>

      {/* Conteúdo principal */}
      <div ref={contentRef} className="flex-1 overflow-y-auto p-6">
        {/* Header mobile */}
        <MobileSectionNav
          sections={guideSections}
          activeSection={activeSection}
          onSectionClick={handleSectionClick}
        />

        {/* Barra de busca mobile */}
        <div className="lg:hidden mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar no guia..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        {/* Banner de boas-vindas */}
        <div className="mb-6 hidden lg:block">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Guia do Usuário</h1>
              <p className="text-sm text-muted-foreground">
                Aprenda a usar todas as funcionalidades do Touch Run CRM
              </p>
            </div>
          </div>
        </div>

        {/* Seções */}
        <div className="space-y-3 max-w-4xl">
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

        {/* Rodapé */}
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
  );
}
