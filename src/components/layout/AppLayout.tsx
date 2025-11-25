import { useState } from 'react';
import { ModeToggle } from './ModeToggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';
import type { PropsWithChildren } from 'react';
import type { AppMode } from './ModeToggle';

interface AppLayoutProps extends PropsWithChildren {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onStaffManagementClick?: () => void;
  isStaffManagementActive?: boolean;
}

export function AppLayout({ 
  children, 
  mode, 
  onModeChange, 
  onStaffManagementClick,
  isStaffManagementActive = false 
}: AppLayoutProps) {
  const { profile, signOut } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  async function handleLogout() {
    if (!confirm('Are you sure you want to log out?')) {
      return;
    }

    setLoggingOut(true);
    
    try {
      await signOut();
      // State will be cleared by onAuthStateChange listener
      // Component will unmount when redirected to login
    } catch (error) {
      console.error('[AppLayout] Logout error:', error);
      alert('Failed to log out. Please try again.');
      setLoggingOut(false); // Only reset if there's an error
    }
  }

  return (
    <div className="min-h-screen bg-bg px-4 py-10 sm:px-8 lg:px-16 flex flex-col gap-8">
      {/* Change Password Modal */}
      <ChangePasswordForm
        open={showChangePassword}
        onOpenChange={setShowChangePassword}
      />

      <header className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-text-muted font-semibold mb-1">
              Guidelight MVP
            </p>
            <h1 className="text-3xl font-bold text-text mb-2">
              State of Mind Staff Toolkit
            </h1>
            <p className="text-text-muted max-w-3xl leading-relaxed">
              Internal-only web app built with Vite + React + Supabase. Use the toggle below to switch between Customer and
              Staff flows while staying authenticated.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <p className="text-sm font-semibold text-text">{profile?.name}</p>
              <p className="text-xs text-text-muted capitalize">
                {profile?.role?.replace('_', ' ')}
                {profile?.location && ` · ${profile.location}`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChangePassword(true)}
              >
                Change Password
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? 'Logging out...' : 'Logout'}
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="flex-1 w-full">
            <ModeToggle mode={mode} onChange={onModeChange} />
          </div>
          {onStaffManagementClick && (
            <Button
              variant={isStaffManagementActive ? 'default' : 'outline'}
              size="lg"
              onClick={onStaffManagementClick}
              className="shrink-0 h-auto py-4 px-5"
            >
              <span className="flex items-center gap-2">
                Staff Management
                <Badge variant="secondary" className="text-xs">
                  Manager
                </Badge>
              </span>
            </Button>
          )}
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="mt-auto text-text-muted text-sm">
        <p>
          Spec alignment: see <code className="px-1.5 py-0.5 bg-surface rounded text-xs">README.md</code>,{' '}
          <code className="px-1.5 py-0.5 bg-surface rounded text-xs">GUIDELIGHT_SPEC.md</code>, and{' '}
          <code className="px-1.5 py-0.5 bg-surface rounded text-xs">ARCHITECTURE_OVERVIEW.md</code>.
        </p>
      </footer>
    </div>
  );
}

export default AppLayout;
