import { useState } from 'react';
import { ModeToggle } from './ModeToggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FeedbackButton } from '@/components/feedback';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Settings, User } from 'lucide-react';
import { landing, auth, errors } from '@/lib/copy';
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

  async function handleLogout() {
    // Use native confirm with our copy
    if (!confirm(`${auth.logout.title}\n\n${auth.logout.body}`)) {
      return;
    }

    setLoggingOut(true);
    
    try {
      await signOut();
      // State will be cleared by onAuthStateChange listener
      // Component will unmount when redirected to login
    } catch (error) {
      console.error('[AppLayout] Logout error:', error);
      alert(errors.signOutFailed);
      setLoggingOut(false); // Only reset if there's an error
    }
  }

  return (
    <div className="min-h-screen bg-bg-app px-4 py-10 sm:px-8 lg:px-16 flex flex-col gap-8">
      <header className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-text-muted font-semibold mb-2">
              {landing.badge}
            </p>
            <h1 className="text-3xl font-bold text-text-default mb-1">
              {landing.title}
            </h1>
            <p className="text-sm text-text-muted mb-2">
              {landing.subline}
            </p>
            <p className="text-xs text-text-muted/70 italic">
              {landing.definition}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <User size={16} className="text-text-muted" />
              <p className="text-lg font-semibold text-text-default">{profile?.name}</p>
            </div>
            <p className="text-xs text-text-muted capitalize">
              {profile?.role?.replace('_', ' ')}
              {profile?.location && ` · ${profile.location}`}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              <LogOut size={14} className="mr-1.5" />
              {loggingOut ? 'Signing out...' : auth.logout.confirm}
            </Button>
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
                <Settings size={16} />
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
      <footer className="mt-auto pt-8">
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-text-muted">
            {landing.footer.line1}
          </p>
          {/* Easter egg only shows when NOT in Customer View (since guests see Customer View) */}
          {mode !== 'customer' && (
            <p className="text-[10px] text-text-muted/60 italic">
              {landing.footer.line2}
            </p>
          )}
          {/* Theme toggle - only visible to staff, not customers */}
          {mode !== 'customer' && (
            <ThemeToggle className="mt-2" />
          )}
        </div>
      </footer>

      {/* Floating feedback button - visible on all views */}
      <FeedbackButton pageContext={mode} />
    </div>
  );
}

export default AppLayout;
