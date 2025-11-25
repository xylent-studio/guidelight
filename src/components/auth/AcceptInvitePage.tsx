import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { errors } from '@/lib/copy';

interface AcceptInvitePageProps {
  onComplete: () => void;
  onBackToLogin: () => void;
}

interface UserProfile {
  name: string;
  role: string;
  location: string | null;
}

export function AcceptInvitePage({ onComplete, onBackToLogin }: AcceptInvitePageProps) {
  const { user, profile } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Load user profile info from metadata or budtenders table
  useEffect(() => {
    async function loadProfile() {
      if (profile) {
        setUserProfile({
          name: profile.name,
          role: profile.role,
          location: profile.location,
        });
      } else if (user?.user_metadata) {
        // Fall back to user metadata from invite
        setUserProfile({
          name: user.user_metadata.name || 'Team Member',
          role: user.user_metadata.role || 'budtender',
          location: null,
        });
      }
    }
    loadProfile();
  }, [user, profile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validation
    if (!password) {
      setError('Please enter a password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);

      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        console.error('Password update error:', updateError);
        setError(updateError.message || errors.failedToSave);
        return;
      }

      setSuccess(true);
      
      // Mark as complete in localStorage
      if (user) {
        localStorage.setItem(`password_set_${user.id}`, 'true');
      }

      // Wait a moment then redirect
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (err) {
      console.error('Password setup error:', err);
      setError(errors.somethingWentWrong);
    } finally {
      setLoading(false);
    }
  }

  const roleDisplay = userProfile?.role?.replace('_', ' ') || 'Team Member';
  const locationDisplay = userProfile?.location ? ` - ${userProfile.location}` : '';

  if (success) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <Card className="w-full max-w-md bg-surface border-border">
          <CardHeader className="space-y-1 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <CardTitle className="text-2xl font-bold text-text">
              Welcome to Guidelight!
            </CardTitle>
            <CardDescription className="text-text-muted">
              Your account is all set up.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-primary/10 border border-primary/20 rounded-md p-4 mb-4 text-center">
              <p className="text-sm text-text">
                Redirecting you to the app...
              </p>
            </div>
            <Button
              type="button"
              className="w-full"
              onClick={onComplete}
            >
              Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-surface border-border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-text">
            Welcome to Guidelight!
          </CardTitle>
          <CardDescription className="text-text-muted">
            You've been invited to join the team. Set up your password to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* User Info Card */}
          {userProfile && (
            <div className="bg-primary/5 border border-primary/20 rounded-md p-4 mb-6">
              <p className="text-lg font-semibold text-text mb-1">
                {userProfile.name}
              </p>
              <p className="text-sm text-text-muted capitalize">
                {roleDisplay}{locationDisplay}
              </p>
              <p className="text-xs text-text-muted mt-2">
                State of Mind Staff Portal
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-text">
                Create a password
              </Label>
              <PasswordInput
                id="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="bg-bg border-border"
                autoComplete="new-password"
                autoFocus
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-text">
                Confirm password
              </Label>
              <PasswordInput
                id="confirmPassword"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="bg-bg border-border"
                autoComplete="new-password"
                required
              />
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                <p className="text-sm text-destructive font-medium">{error}</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                💡 Your password must be at least 6 characters long. You'll use this to sign in next time.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Setting up...' : 'Set Password & Continue'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-sm text-text-muted hover:text-text transition-colors"
            >
              Already have an account? Sign in
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

