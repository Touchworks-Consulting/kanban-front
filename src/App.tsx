import { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { useAuthStore, initializeAuth } from './stores/auth';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { KanbanPage } from './pages/KanbanPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { SettingsPage } from './pages/SettingsPage';
import { UsersPage } from './pages/UsersPage';
import { ProfilePage } from './pages/ProfilePage';
import { PlansPage } from './pages/PlansPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import { FeedbackAdminPage } from './pages/FeedbackAdminPage';
import { EmbedLeadModalPage } from './pages/EmbedLeadModalPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoadingSpinner } from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import { FeedbackWidget } from './components/FeedbackWidget';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { Toaster } from './components/ui/sonner';
import { activityReminderService } from './services/activityReminderService';
import { PhoneVerificationProvider } from './components/PhoneVerificationProvider';

// Componente para agrupar rotas que usam o layout principal
const AppLayout = () => (
  <div className="flex h-screen bg-background text-foreground">
    <Sidebar />
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 bg-muted rounded-tl-lg p-6 overflow-y-auto">
          <Outlet />
      </main>
    </div>
    <FeedbackWidget />
  </div>
);

function App() {
  const { isAuthenticated, isLoading, refreshAuth, token } = useAuthStore();

  // Inicializar auth state e tentar refresh se necessário
  useEffect(() => {
    initializeAuth(); // Inicializa o auth state do localStorage
    if (token) {
      refreshAuth();
    }

    // Inicializar serviço de lembretes de atividades
    activityReminderService.loadPersistedReminders();

    // Listeners para eventos de notificação
    const handleOpenLeadModal = (event: CustomEvent) => {
      const { leadId, activityId } = event.detail;
      console.log(`Abrir modal do lead ${leadId}, atividade ${activityId}`);
      // Aqui você pode implementar a lógica para abrir o modal do lead
      // Por exemplo, navegar para a página ou disparar uma ação no store
    };

    const handleCompleteActivity = (event: CustomEvent) => {
      const { activityId } = event.detail;
      console.log(`Marcar atividade ${activityId} como concluída`);
      // Aqui você pode implementar a lógica para marcar a atividade como concluída
      // Por exemplo, chamar a API de atividades
    };

    window.addEventListener('openLeadModal', handleOpenLeadModal as EventListener);
    window.addEventListener('completeActivity', handleCompleteActivity as EventListener);

    return () => {
      window.removeEventListener('openLeadModal', handleOpenLeadModal as EventListener);
      window.removeEventListener('completeActivity', handleCompleteActivity as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              <ErrorBoundary>
                {isAuthenticated ? <Navigate to="/" /> : <LoginPage />}
              </ErrorBoundary>
            }
          />
          <Route
            path="/register"
            element={
              <ErrorBoundary>
                {isAuthenticated ? <Navigate to="/" /> : <RegisterPage />}
              </ErrorBoundary>
            }
          />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/feedback-admin" element={<FeedbackAdminPage />} />

          {/* Rota pública para iframe (autenticação via API key) */}
          <Route path="/embed/lead-modal/:leadId" element={<EmbedLeadModalPage />} />

          <Route
            path="/"
            element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <PhoneVerificationProvider>
                    <AppLayout />
                  </PhoneVerificationProvider>
                </ProtectedRoute>
              </ErrorBoundary>
            }
          >
            <Route index element={<Navigate to="/kanban" replace />} />
            <Route
              path="dashboard"
              element={
                <ErrorBoundary>
                  <DashboardPage />
                </ErrorBoundary>
              }
            />
            <Route
              path="kanban"
              element={
                <ErrorBoundary>
                  <KanbanPage />
                </ErrorBoundary>
              }
            />
            <Route
              path="campaigns"
              element={
                <ErrorBoundary>
                  <CampaignsPage />
                </ErrorBoundary>
              }
            />
            <Route
              path="settings"
              element={
                <ErrorBoundary>
                  <SettingsPage />
                </ErrorBoundary>
              }
            />
            <Route
              path="users"
              element={
                <ErrorBoundary>
                  <UsersPage />
                </ErrorBoundary>
              }
            />
            <Route
              path="profile"
              element={
                <ErrorBoundary>
                  <ProfilePage />
                </ErrorBoundary>
              }
            />
            <Route
              path="plans"
              element={
                <ErrorBoundary>
                  <PlansPage />
                </ErrorBoundary>
              }
            />
            <Route
              path="feedbacks"
              element={
                <ErrorBoundary>
                  <FeedbackAdminPage />
                </ErrorBoundary>
              }
            />
            {/* Redirect antigo WhatsApp para configurações */}
            <Route path="whatsapp-config" element={<Navigate to="/settings" replace />} />
          </Route>

          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? '/' : '/login'} />}
          />
        </Routes>
        <Toaster />
      </Router>
    </ErrorBoundary>
  );
}

export default App;
