import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { SetPasswordModal } from './components/auth/SetPasswordModal';
import AppLayout from './components/layout/AppLayout';
import type { AppMode } from './components/layout/ModeToggle';
import CustomerView from './views/CustomerView';
import StaffView from './views/StaffView';
import StaffManagementView from './views/StaffManagementView';

export type AppView = 'customer' | 'staff' | 'staff-management';

function AppContent() {
  const { user, loading, isManager } = useAuth();
  const [view, setView] = useState<AppView>('customer');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Determine mode for the toggle (customer/staff only)
  const mode: AppMode = view === 'customer' ? 'customer' : 'staff';

  // Check if user needs to set password (first login from invite)
  useEffect(() => {
    if (user) {
      // Check if this is a new user who hasn't set a password yet
      // Supabase invite users have a specific user metadata flag
      const hasSetPassword = localStorage.getItem(`password_set_${user.id}`);
      
      // If user came from invite link and hasn't set password yet
      if (!hasSetPassword && user.app_metadata?.provider === 'email') {
        // Check if they have a recovery token (means they came from invite)
        const urlParams = new URLSearchParams(window.location.hash.substring(1));
        const hasInviteToken = urlParams.get('type') === 'invite' || urlParams.get('type') === 'recovery';
        
        if (hasInviteToken) {
          setShowPasswordModal(true);
        }
      }
    }
  }, [user]);

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

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage />;
  }

  // Handle password modal close (mark as set)
  function handlePasswordSet() {
    if (user) {
      localStorage.setItem(`password_set_${user.id}`, 'true');
      setShowPasswordModal(false);
    }
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
    <>
      {/* Password setup modal for new users */}
      {showPasswordModal && user?.email && (
        <SetPasswordModal 
          open={showPasswordModal} 
          userEmail={user.email}
          onPasswordSet={handlePasswordSet}
        />
      )}

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
    </>
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
