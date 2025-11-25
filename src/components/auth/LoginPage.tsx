import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface LoginPageProps {
  onForgotPassword?: () => void;
}

export function LoginPage({ onForgotPassword }: LoginPageProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
              {loading ? 'Signing in...' : 'Sign in'}
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
              Need help? Contact your manager or IT support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
