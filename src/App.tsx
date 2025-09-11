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
import { DashboardPage } from './pages/DashboardPage';
import { KanbanPage } from './pages/KanbanPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoadingSpinner } from './components/LoadingSpinner';
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
  const { isAuthenticated, isLoading, refreshAuth } = useAuthStore();

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />}
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/kanban" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="kanban" element={<KanbanPage />} />
          <Route path="campaigns" element={<CampaignsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          {/* Redirect antigo WhatsApp para configurações */}
          <Route path="whatsapp-config" element={<Navigate to="/settings" replace />} />
        </Route>

        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? '/' : '/login'} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
