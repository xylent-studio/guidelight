import { useState } from 'react';
import { ModeToggle } from './ModeToggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
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
      <header className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-text-muted font-semibold mb-2">
              State of Mind · Guidelight v1
            </p>
            <h1 className="text-3xl font-bold text-text mb-1">
              For the people behind the counter
            </h1>
            <p className="text-sm text-text-muted mb-2">
              For the people guests trust to turn a menu into a feeling.
            </p>
            <p className="text-xs text-text-muted/70 italic">
              A guidelight is a small light that helps you find your way in the dark — this one is for SOM staff and the people you serve.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <p className="text-lg font-semibold text-text">{profile?.name}</p>
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
              {loggingOut ? 'Logging out...' : 'Logout'}
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
      <footer className="mt-auto pt-8 text-center">
        <p className="text-xs text-text-muted">
          Guidelight v1 · Built by Xylent Studios for State of Mind
        </p>
        <p className="text-[10px] text-text-muted/60 italic mt-1">
          If a guest is reading this, someone forgot to switch to Customer View. 😉
        </p>
      </footer>
    </div>
  );
}

export default AppLayout;
