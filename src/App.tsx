import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { AcceptInvitePage } from './components/auth/AcceptInvitePage';
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
  const { user, loading, isManager } = useAuth();
  const [view, setView] = useState<AppView>('customer');
  const [authPage, setAuthPage] = useState<AuthPage>('login');
  const [needsPasswordSetup, setNeedsPasswordSetup] = useState(false);

  // Determine mode for the toggle (customer/staff only)
  const mode: AppMode = view === 'customer' ? 'customer' : 'staff';

  // Check URL hash for auth flow on mount and user changes
  useEffect(() => {
    const { type } = parseAuthHash();
    
    if (type === 'recovery') {
      // Password reset flow
      setAuthPage('reset-password');
    } else if (type === 'invite' && user) {
      // Invite flow - check if user needs to set password
      const hasSetPassword = localStorage.getItem(`password_set_${user.id}`);
      if (!hasSetPassword) {
        setNeedsPasswordSetup(true);
      } else {
        // Clear hash and proceed to app
        window.location.hash = '';
      }
    }
  }, [user]);

  // Clear hash after handling
  function clearHashAndProceed() {
    window.location.hash = '';
    setAuthPage('login');
    setNeedsPasswordSetup(false);
  }

  // Show loading spinner while checking session
  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-text-muted">Loading...</p>
        </div>
      </div>
    );
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
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
