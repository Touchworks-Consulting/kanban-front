import { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { useAuthStore } from './stores/auth';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { KanbanPage } from './pages/KanbanPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { SettingsPage } from './pages/SettingsPage';
import { UsersPage } from './pages/UsersPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoadingSpinner } from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

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
  </div>
);

function App() {
  const { isAuthenticated, isLoading, refreshAuth, token } = useAuthStore();

  // Desabilita refresh automático agressivo; só tenta uma vez se já há token armazenado
  useEffect(() => {
    if (token) {
      refreshAuth();
    }
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

          <Route
            path="/"
            element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <AppLayout />
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
            {/* Redirect antigo WhatsApp para configurações */}
            <Route path="whatsapp-config" element={<Navigate to="/settings" replace />} />
          </Route>

          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? '/' : '/login'} />}
          />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
