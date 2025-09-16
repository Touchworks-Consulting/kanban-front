import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores';
import { LoginForm } from '../components/login-form';

export function LoginPage() {
  const { login, isLoading, error, isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (email: string, password: string) => {
    try {
      await login({ email, password });
    } catch (error) {
      // O erro já é tratado pelo store, mas vamos garantir que não quebre
      console.error('Login error:', error);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm
          onSubmit={handleLogin}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
}
