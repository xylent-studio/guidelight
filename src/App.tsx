import { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LoginPage } from './components/auth/LoginPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { AcceptInvitePage } from './components/auth/AcceptInvitePage';
import { ProfileErrorScreen } from './components/auth/ProfileErrorScreen';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ManagerRoute } from './components/auth/ManagerRoute';
import MyPicksView from './views/MyPicksView';
import StaffManagementView from './views/StaffManagementView';
import DisplayModeView from './views/DisplayModeView';

/**
 * Parse URL hash for auth flow detection
 * Supabase redirects with hash params like:
 * - #type=invite&access_token=...
 * - #type=recovery&access_token=...
 * - #type=signup&access_token=...
 */
function parseAuthHash(): { type: string | null; accessToken: string | null } {
  const hash = window.location.hash.substring(1);
  if (!hash) return { type: null, accessToken: null };
  
  const params = new URLSearchParams(hash);
  return {
    type: params.get('type'),
    accessToken: params.get('access_token'),
  };
}

/**
 * Handles Supabase auth redirects (invite, recovery)
 * Must be inside BrowserRouter to use navigation
 */
function AuthRedirectHandler() {
  const navigate = useNavigate();
  const hasProcessedHash = useRef(false);

  useEffect(() => {
    if (hasProcessedHash.current) return;
    
    const { type, accessToken } = parseAuthHash();
    
    if (!type || !accessToken) return;
    
    hasProcessedHash.current = true;
    console.log('[App] Auth flow detected:', type);
    
    if (type === 'recovery') {
      navigate('/reset-password', { replace: true });
    } else if (type === 'invite') {
      navigate('/accept-invite', { replace: true });
    }
  }, [navigate]);

  return null;
}

/**
 * Login page wrapper - redirects to home if already authenticated
 */
function LoginPageWrapper() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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

  // Redirect to intended destination or home if already logged in
  if (user) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return <LoginPage onForgotPassword={() => navigate('/forgot-password')} />;
}

/**
 * Forgot password page wrapper
 */
function ForgotPasswordPageWrapper() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

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

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <ForgotPasswordPage onBackToLogin={() => navigate('/login')} />;
}

/**
 * Reset password page wrapper
 */
function ResetPasswordPageWrapper() {
  const navigate = useNavigate();

  function handleSuccess() {
    window.location.hash = '';
    navigate('/login', { replace: true });
  }

  function handleBackToLogin() {
    window.location.hash = '';
    navigate('/login', { replace: true });
  }

  return (
    <ResetPasswordPage
      onSuccess={handleSuccess}
      onBackToLogin={handleBackToLogin}
    />
  );
}

/**
 * Accept invite page wrapper
 */
function AcceptInvitePageWrapper() {
  const { user } = useAuth();
  const navigate = useNavigate();

  function handleComplete() {
    if (user) {
      localStorage.setItem(`password_set_${user.id}`, 'true');
    }
    window.location.hash = '';
    navigate('/', { replace: true });
  }

  function handleBackToLogin() {
    window.location.hash = '';
    navigate('/login', { replace: true });
  }

  return (
    <AcceptInvitePage
      onComplete={handleComplete}
      onBackToLogin={handleBackToLogin}
    />
  );
}

/**
 * My picks (staff home) - protected route
 */
function MyPicksPage() {
  const { profileError, user } = useAuth();

  if (user && profileError) {
    return <ProfileErrorScreen message={profileError} />;
  }

  return <MyPicksView />;
}

/**
 * Team management - protected + manager only
 */
function TeamPage() {
  const { profileError, user } = useAuth();

  if (user && profileError) {
    return <ProfileErrorScreen message={profileError} />;
  }

  return <StaffManagementView />;
}

/**
 * Main app routes
 */
function AppRoutes() {
  return (
    <>
      <AuthRedirectHandler />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPageWrapper />} />
        <Route path="/forgot-password" element={<ForgotPasswordPageWrapper />} />
        <Route path="/reset-password" element={<ResetPasswordPageWrapper />} />
        <Route path="/accept-invite" element={<AcceptInvitePageWrapper />} />
        
        {/* Display mode - public, no auth required */}
        <Route path="/display" element={<DisplayModeView />} />
        
        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MyPicksPage />
            </ProtectedRoute>
          }
        />
        
        {/* Manager-only routes */}
        <Route
          path="/team"
          element={
            <ProtectedRoute>
              <ManagerRoute>
                <TeamPage />
              </ManagerRoute>
            </ProtectedRoute>
          }
        />
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'bg-card border-border text-foreground',
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
