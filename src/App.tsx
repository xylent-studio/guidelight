import { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LoginPage } from './components/auth/LoginPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { AcceptInvitePage } from './components/auth/AcceptInvitePage';
import { ProfileErrorScreen } from './components/auth/ProfileErrorScreen';
import AppLayout from './components/layout/AppLayout';
import type { AppMode } from './components/layout/ModeToggle';
import CustomerView from './views/CustomerView';
import StaffView from './views/StaffView';
import StaffManagementView from './views/StaffManagementView';

export type AppView = 'customer' | 'staff' | 'staff-management';
type AuthPage = 'login' | 'forgot-password' | 'reset-password' | 'accept-invite';

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

function AppContent() {
  const { user, loading, isManager, profileError } = useAuth();
  const [view, setView] = useState<AppView>('customer');
  const [authPage, setAuthPage] = useState<AuthPage>('login');
  const [needsPasswordSetup, setNeedsPasswordSetup] = useState(false);
  const hasProcessedHash = useRef(false);

  // Determine mode for the toggle (customer/staff only)
  const mode: AppMode = view === 'customer' ? 'customer' : 'staff';

  // Handle auth flow from URL hash on mount
  // This runs BEFORE user state is available to handle invite/recovery links
  useEffect(() => {
    // Only process once per page load
    if (hasProcessedHash.current) return;
    
    const { type, accessToken } = parseAuthHash();
    
    if (!type || !accessToken) return;
    
    hasProcessedHash.current = true;
    console.log('[App] Auth flow detected:', type);
    
    if (type === 'recovery') {
      // Password reset flow - show reset page
      setAuthPage('reset-password');
    } else if (type === 'invite') {
      // Invite flow - Supabase has already exchanged the token for a session
      // The new invited user is now logged in (replacing any previous session)
      // Show password setup page
      setNeedsPasswordSetup(true);
    }
  }, []);

  // Also check when user changes (for invite flow after session is established)
  useEffect(() => {
    const { type } = parseAuthHash();
    
    if (type === 'invite' && user) {
      // User is logged in from invite - check if they need to set password
      const hasSetPassword = localStorage.getItem(`password_set_${user.id}`);
      if (!hasSetPassword) {
        setNeedsPasswordSetup(true);
      } else {
        // Already set password, clear hash and proceed
        window.location.hash = '';
      }
    }
  }, [user]);

  // Clear hash after handling
  function clearHashAndProceed() {
    window.location.hash = '';
    setAuthPage('login');
    setNeedsPasswordSetup(false);
    hasProcessedHash.current = false;
  }

  // Show loading spinner while checking session
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-app flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  // Show profile error screen if user is logged in but profile couldn't load
  if (user && profileError) {
    return <ProfileErrorScreen message={profileError} />;
  }

  // Handle password reset flow (can happen when not logged in)
  if (authPage === 'reset-password') {
    return (
      <ResetPasswordPage
        onSuccess={() => {
          clearHashAndProceed();
        }}
        onBackToLogin={() => {
          clearHashAndProceed();
        }}
      />
    );
  }

  // Show invite acceptance page for new users who need to set password
  if (user && needsPasswordSetup) {
    return (
      <AcceptInvitePage
        onComplete={() => {
          if (user) {
            localStorage.setItem(`password_set_${user.id}`, 'true');
          }
          clearHashAndProceed();
        }}
        onBackToLogin={() => {
          clearHashAndProceed();
        }}
      />
    );
  }

  // Show login or forgot password page if not authenticated
  if (!user) {
    if (authPage === 'forgot-password') {
      return (
        <ForgotPasswordPage
          onBackToLogin={() => setAuthPage('login')}
        />
      );
    }
    
    return (
      <LoginPage
        onForgotPassword={() => setAuthPage('forgot-password')}
      />
    );
  }

  // Handler for mode toggle (customer/staff only)
  function handleModeChange(newMode: AppMode) {
    setView(newMode);
  }

  // Handler for Staff Management navigation
  function handleStaffManagementClick() {
    setView('staff-management');
  }

  // Show main app if authenticated
  return (
    <AppLayout
      mode={mode}
      onModeChange={handleModeChange}
      onStaffManagementClick={isManager ? handleStaffManagementClick : undefined}
      isStaffManagementActive={view === 'staff-management'}
    >
      {view === 'customer' && <CustomerView />}
      {view === 'staff' && <StaffView />}
      {view === 'staff-management' && <StaffManagementView />}
    </AppLayout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
