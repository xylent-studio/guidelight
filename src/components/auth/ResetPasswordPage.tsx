import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { errors } from '@/lib/copy';

interface ResetPasswordPageProps {
  onSuccess: () => void;
  onBackToLogin: () => void;
}

export function ResetPasswordPage({ onSuccess, onBackToLogin }: ResetPasswordPageProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validation
    if (!password) {
      setError('Please enter a new password');
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
        
        if (updateError.message.includes('expired') || updateError.message.includes('invalid')) {
          setError('This password reset link has expired. Please request a new one.');
        } else {
          setError(updateError.message || errors.failedToSave);
        }
        return;
      }

      setSuccess(true);
      
      // Wait a moment then redirect
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      console.error('Password update error:', err);
      setError(errors.somethingWentWrong);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-bg-app flex items-center justify-center px-4">
        <Card className="w-full max-w-md bg-bg-surface border-border-subtle">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-text-default">
              Password updated!
            </CardTitle>
            <CardDescription className="text-text-muted">
              Your password has been successfully reset.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-primary/10 border border-primary/20 rounded-md p-4 mb-4">
              <p className="text-sm text-text-default">
                You can now sign in with your new password. Redirecting...
              </p>
            </div>
            <Button
              type="button"
              className="w-full"
              onClick={onSuccess}
            >
              Continue to sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-app flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-bg-surface border-border-subtle">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-text-default">
            Set a new password
          </CardTitle>
          <CardDescription className="text-text-muted">
            Enter your new password below. Make sure it's at least 6 characters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-text-default">
                New password
              </Label>
              <PasswordInput
                id="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="bg-bg-app border-border-subtle"
                autoComplete="new-password"
                autoFocus
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-text-default">
                Confirm new password
              </Label>
              <PasswordInput
                id="confirmPassword"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="bg-bg-app border-border-subtle"
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
                💡 Password must be at least 6 characters long
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Updating password...' : 'Update password'}
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

