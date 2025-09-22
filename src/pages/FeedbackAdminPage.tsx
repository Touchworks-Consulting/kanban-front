import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { FeedbackVoteButton } from '../components/FeedbackVoteButton';
import { apiService } from '../services/api';
import { API_ENDPOINTS } from '../constants';
// Simple Badge component
const Badge = ({ children, variant = 'default', className = '' }: {
  children: React.ReactNode;
  variant?: 'default' | 'outline';
  className?: string;
}) => (
  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${className}`}>
    {children}
  </span>
);
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  Bug,
  Lightbulb,
  Heart,
  User,
  Calendar,
  Monitor,
  Globe,
  Eye,
  EyeOff,
  Filter,
  Settings,
  Lock,
  ThumbsUp,
  TrendingUp
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Feedback {
  id: string;
  type: 'bug' | 'suggestion' | 'praise';
  message: string;
  user_name: string;
  user_email: string;
  account_name: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  current_page: string;
  screen_resolution: string;
  browser_info: any;
  admin_notes: string;
  votes: number;
  created_at: string;
  updated_at: string;
}

interface Stats {
  total: number;
  by_type: Array<{ type: string; count: number }>;
  by_status: Array<{ status: string; count: number }>;
  recent_week: number;
}

const typeIcons = {
  bug: Bug,
  suggestion: Lightbulb,
  praise: Heart
};

const typeColors = {
  bug: 'text-red-500 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800 dark:text-red-400',
  suggestion: 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-400',
  praise: 'text-green-500 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800 dark:text-green-400'
};

const statusColors = {
  new: 'bg-accent text-accent-foreground',
  in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  resolved: 'bg-accent text-accent-foreground',
  closed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  medium: 'bg-accent text-accent-foreground',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
};

export function FeedbackAdminPage() {
  // Estados para área administrativa
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [adminFeedbacks, setAdminFeedbacks] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Estados para área pública
  const [publicFeedbacks, setPublicFeedbacks] = useState<Feedback[]>([]);
  const [isLoadingPublic, setIsLoadingPublic] = useState(false);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);
  const [filter, setFilter] = useState({ status: '', type: '', sort: 'recent' });
  const [showTechnicalInfo, setShowTechnicalInfo] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'public' | 'admin'>('public');

  const verifyAccessCode = async () => {
    setIsVerifying(true);
    try {
      const response = await apiService.post(API_ENDPOINTS.FEEDBACK_ADMIN_VERIFY_CODE, {
        access_code: accessCode
      });

      const { token } = response.data;
      localStorage.setItem('feedback_admin_token', token);
      setIsAdminAuthenticated(true);
      setCurrentView('admin');
      await loadAdminData();
    } catch (error) {
      alert('Erro ao verificar código');
    } finally {
      setIsVerifying(false);
    }
  };

  const loadPublicData = async () => {
    setIsLoadingPublic(true);
    try {
      const response = await apiService.get(
        `${API_ENDPOINTS.FEEDBACK_PUBLIC_LIST}?status=${filter.status}&type=${filter.type}&sort=${filter.sort}`
      );
      setPublicFeedbacks(response.data.feedbacks);
    } catch (error) {
      console.error('Erro ao carregar dados públicos:', error);
    } finally {
      setIsLoadingPublic(false);
    }
  };

  const loadAdminData = async () => {
    setIsLoadingAdmin(true);
    const token = localStorage.getItem('feedback_admin_token');

    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const [feedbackResponse, statsResponse] = await Promise.all([
        apiService.getAxiosInstance().get(`/api/feedback/admin/list?status=${filter.status}&type=${filter.type}`, {
          headers
        }),
        apiService.getAxiosInstance().get(API_ENDPOINTS.FEEDBACK_ADMIN_STATS, {
          headers
        })
      ]);

      setAdminFeedbacks(feedbackResponse.data.feedbacks);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Erro ao carregar dados administrativos:', error);
    } finally {
      setIsLoadingAdmin(false);
    }
  };

  const updateFeedback = async (id: string, updates: any) => {
    setIsUpdating(true);
    const token = localStorage.getItem('feedback_admin_token');

    try {
      // Usar apiService com token customizado para admin
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await apiService.getAxiosInstance().patch(`/api/feedback/admin/${id}`, updates, {
        headers
      });

      await loadAdminData();
      setSelectedFeedback(null);
    } catch (error) {
      alert('Erro ao atualizar feedback');
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('feedback_admin_token');
    if (token) {
      setIsAdminAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (currentView === 'public') {
      loadPublicData();
    } else if (currentView === 'admin' && isAdminAuthenticated) {
      loadAdminData();
    }
  }, [filter, currentView, isAdminAuthenticated]);

  const handleVoteChange = (feedbackId: string, newVoteCount: number) => {
    setPublicFeedbacks(prevFeedbacks =>
      prevFeedbacks.map(feedback =>
        feedback.id === feedbackId
          ? { ...feedback, votes: newVoteCount }
          : feedback
      )
    );
  };

  const AdminLoginModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Acesso Administrativo</CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            Digite o código de acesso para gerenciar feedbacks
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="access-code">Código de Acesso</Label>
            <Input
              id="access-code"
              type="password"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Digite o código..."
              onKeyPress={(e) => e.key === 'Enter' && verifyAccessCode()}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentView('public')}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={verifyAccessCode}
              disabled={!accessCode || isVerifying}
              className="flex-1"
            >
              {isVerifying ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              {isVerifying ? 'Verificando...' : 'Acessar'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Feedback Beta - Touch RUN</h1>
            <p className="text-muted-foreground">
              {currentView === 'public'
                ? 'Vote e acompanhe feedbacks da comunidade'
                : 'Administração de feedback dos usuários'
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Toggle entre visualizações */}
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={currentView === 'public' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('public')}
                className="rounded-md"
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Público
              </Button>
              <Button
                variant={currentView === 'admin' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  if (!isAdminAuthenticated) {
                    setCurrentView('admin');
                  } else {
                    setCurrentView('admin');
                  }
                }}
                className="rounded-md"
              >
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </div>

            {isAdminAuthenticated && currentView === 'admin' && (
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.removeItem('feedback_admin_token');
                  setIsAdminAuthenticated(false);
                  setCurrentView('public');
                }}
              >
                <Lock className="h-4 w-4 mr-2" />
                Sair Admin
              </Button>
            )}
          </div>
        </div>

        {/* Estatísticas - Apenas no modo admin */}
        {currentView === 'admin' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-accent rounded-full">
                    <User className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-accent rounded-full">
                    <Calendar className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Esta semana</p>
                    <p className="text-2xl font-bold">{stats.recent_week}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Por Tipo</p>
                  {stats.by_type.map((item: any) => (
                    <div key={item.type} className="flex justify-between text-sm">
                      <span className="capitalize">{item.type}</span>
                      <span className="font-medium">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Por Status</p>
                  {stats.by_status.map((item: any) => (
                    <div key={item.status} className="flex justify-between text-sm">
                      <span className="capitalize">{item.status.replace('_', ' ')}</span>
                      <span className="font-medium">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <div className="flex gap-4 flex-wrap">
                {currentView === 'public' && (
                  <div>
                    <Label className="text-sm">Ordenar por</Label>
                    <select
                      value={filter.sort}
                      onChange={(e) => setFilter({ ...filter, sort: e.target.value })}
                      className="ml-2 px-3 py-1 border border-input rounded-md text-sm bg-background text-foreground"
                    >
                      <option value="recent">Mais Recente</option>
                      <option value="votes">Mais Votados</option>
                      <option value="oldest">Mais Antigo</option>
                    </select>
                  </div>
                )}
                <div>
                  <Label className="text-sm">Status</Label>
                  <select
                    value={filter.status}
                    onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                    className="ml-2 px-3 py-1 border border-input rounded-md text-sm bg-background text-foreground"
                  >
                    <option value="">Todos</option>
                    <option value="new">Novo</option>
                    <option value="in_progress">Em Progresso</option>
                    <option value="resolved">Resolvido</option>
                    <option value="closed">Fechado</option>
                  </select>
                </div>
                <div>
                  <Label className="text-sm">Tipo</Label>
                  <select
                    value={filter.type}
                    onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                    className="ml-2 px-3 py-1 border border-input rounded-md text-sm bg-background text-foreground"
                  >
                    <option value="">Todos</option>
                    <option value="bug">Bug</option>
                    <option value="suggestion">Sugestão</option>
                    <option value="praise">Elogio</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Feedbacks */}
        {(currentView === 'public' ? isLoadingPublic : isLoadingAdmin) ? (
          <div className="flex justify-center p-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid gap-4">
            {(currentView === 'public' ? publicFeedbacks : adminFeedbacks).map((feedback) => {
              const TypeIcon = typeIcons[feedback.type];

              return (
                <Card key={feedback.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className={cn("p-2 rounded-lg border", typeColors[feedback.type])}>
                          <TypeIcon className="h-5 w-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className={statusColors[feedback.status]}>
                              {feedback.status.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline" className={priorityColors[feedback.priority]}>
                              {feedback.priority}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(feedback.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>

                          <p className="text-foreground mb-2">{feedback.message}</p>

                          <div className="flex items-center text-sm text-muted-foreground space-x-4">
                            <span>👤 {feedback.user_name}</span>
                            <span>🏢 {feedback.account_name}</span>
                            <span>📱 {feedback.screen_resolution}</span>
                            <span>📍 {feedback.current_page}</span>
                          </div>

                          {showTechnicalInfo === feedback.id && feedback.browser_info && (
                            <div className="mt-3 p-3 bg-accent rounded-lg">
                              <h4 className="font-medium text-sm mb-2">Informações Técnicas:</h4>
                              <pre className="text-xs text-muted-foreground overflow-auto">
                                {JSON.stringify(feedback.browser_info, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {currentView === 'public' ? (
                          // Área pública - mostrar botão de votação
                          <>
                            <FeedbackVoteButton
                              feedbackId={feedback.id}
                              initialVotes={feedback.votes}
                              onVoteChange={(newVotes) => handleVoteChange(feedback.id, newVotes)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowTechnicalInfo(
                                showTechnicalInfo === feedback.id ? null : feedback.id
                              )}
                            >
                              {showTechnicalInfo === feedback.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </>
                        ) : (
                          // Área administrativa - mostrar botões de gerenciamento
                          <>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <ThumbsUp className="h-4 w-4" />
                              <span>{feedback.votes}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowTechnicalInfo(
                                showTechnicalInfo === feedback.id ? null : feedback.id
                              )}
                            >
                              {showTechnicalInfo === feedback.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedFeedback(feedback)}
                            >
                              Gerenciar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Modal de login admin */}
        {currentView === 'admin' && !isAdminAuthenticated && <AdminLoginModal />}

        {/* Modal de Edição - Apenas no modo admin */}
        {selectedFeedback && currentView === 'admin' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Gerenciar Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Status</Label>
                  <select
                    value={selectedFeedback.status}
                    onChange={(e) => setSelectedFeedback({
                      ...selectedFeedback,
                      status: e.target.value as any
                    })}
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  >
                    <option value="new">Novo</option>
                    <option value="in_progress">Em Progresso</option>
                    <option value="resolved">Resolvido</option>
                    <option value="closed">Fechado</option>
                  </select>
                </div>

                <div>
                  <Label>Prioridade</Label>
                  <select
                    value={selectedFeedback.priority}
                    onChange={(e) => setSelectedFeedback({
                      ...selectedFeedback,
                      priority: e.target.value as any
                    })}
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="critical">Crítica</option>
                  </select>
                </div>

                <div>
                  <Label>Notas da Administração</Label>
                  <Textarea
                    value={selectedFeedback.admin_notes || ''}
                    onChange={(e) => setSelectedFeedback({
                      ...selectedFeedback,
                      admin_notes: e.target.value
                    })}
                    placeholder="Adicione notas internas..."
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => updateFeedback(selectedFeedback.id, {
                      status: selectedFeedback.status,
                      priority: selectedFeedback.priority,
                      admin_notes: selectedFeedback.admin_notes
                    })}
                    disabled={isUpdating}
                    className="flex-1"
                  >
                    {isUpdating ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                    {isUpdating ? 'Salvando...' : 'Salvar'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedFeedback(null)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}