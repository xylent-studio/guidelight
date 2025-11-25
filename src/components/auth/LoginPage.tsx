import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getRememberMe, setRememberMe } from '@/lib/supabaseClient';
import { LogIn } from 'lucide-react';

interface LoginPageProps {
  onForgotPassword?: () => void;
}

export function LoginPage({ onForgotPassword }: LoginPageProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMeState] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved "remember me" preference on mount
  useEffect(() => {
    setRememberMeState(getRememberMe());
  }, []);

  // Update preference when checkbox changes
  function handleRememberMeChange(checked: boolean) {
    setRememberMeState(checked);
    setRememberMe(checked);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await signIn(email, password);
      // AuthContext will handle redirect after successful login
    } catch (err) {
      console.error('Login error:', err);
      // Generic error message to prevent user enumeration
      // Don't reveal whether the email exists or if the password is wrong
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-surface border-border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-text">
            Sign in to Guidelight
          </CardTitle>
          <CardDescription className="text-text-muted">
            State of Mind Staff Portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-text">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@stateofmind.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="bg-bg border-border"
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-text">
                Password
              </Label>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="bg-bg border-border"
                autoComplete="current-password"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => handleRememberMeChange(e.target.checked)}
                disabled={loading}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-bg"
              />
              <Label 
                htmlFor="remember-me" 
                className="text-sm text-text-muted cursor-pointer select-none"
              >
                Remember me on this device
              </Label>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                <p className="text-sm text-destructive font-medium">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                'Signing in...'
              ) : (
                <>
                  <LogIn size={18} className="mr-2" />
                  Sign in
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            {onForgotPassword && (
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
              >
                Forgot your password?
              </button>
            )}
            <p className="text-xs text-text-muted">
              Need help? Ask your manager or ping the team.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
