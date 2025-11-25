import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { errors } from '@/lib/copy';

interface ForgotPasswordPageProps {
  onBackToLogin: () => void;
}

export function ForgotPasswordPage({ onBackToLogin }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get the current URL origin for the redirect
      const redirectTo = `${window.location.origin}/#type=recovery`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (resetError) {
        console.error('Password reset error:', resetError);
        // Don't reveal if the email exists or not - just show success
      }

      // Always show success message to prevent user enumeration
      setSubmitted(true);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(errors.somethingWentWrong);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <Card className="w-full max-w-md bg-surface border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-text">
              Check your email
            </CardTitle>
            <CardDescription className="text-text-muted">
              If an account exists for {email}, we've sent a password reset link.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-primary/10 border border-primary/20 rounded-md p-4">
              <p className="text-sm text-text">
                Click the link in the email to reset your password. The link will expire in 24 hours.
              </p>
            </div>
            
            <p className="text-sm text-text-muted">
              Didn't receive an email? Check your spam folder or make sure you entered the correct email address.
            </p>

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSubmitted(false);
                  setEmail('');
                }}
              >
                Try a different email
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={onBackToLogin}
              >
                Back to sign in
              </Button>
            </div>
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
            Forgot your password?
          </CardTitle>
          <CardDescription className="text-text-muted">
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-text">
                Email address
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
                autoFocus
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
              {loading ? 'Sending...' : 'Send reset link'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
            >
              Back to sign in
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

