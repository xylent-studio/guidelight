import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ManagerRouteProps {
  children: React.ReactNode;
}

/**
 * Route guard that requires manager role.
 * Must be used inside a ProtectedRoute (assumes user is authenticated).
 * Redirects to / (My picks) if not a manager.
 */
export function ManagerRoute({ children }: ManagerRouteProps) {
  const { isManager, loading } = useAuth();

  // Show nothing while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to home if not a manager
  if (!isManager) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}



