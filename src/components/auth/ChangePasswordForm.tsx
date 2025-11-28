import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Key, Check, Info } from 'lucide-react';
import { auth, errors } from '@/lib/copy';

interface ChangePasswordFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordForm({ open, onOpenChange }: ChangePasswordFormProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function resetForm() {
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(false);
  }

  function handleClose() {
    if (!loading) {
      resetForm();
      onOpenChange(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validation
    if (!newPassword) {
      setError('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);

      // Update password directly (no re-auth needed for logged-in user)
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        console.error('Password update error:', updateError);
        setError(updateError.message || errors.failedToSave);
        return;
      }

      setSuccess(true);
      
      // Close after a moment
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      console.error('Password change error:', err);
      setError(errors.somethingWentWrong);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{auth.passwordChange.title}</DialogTitle>
          <DialogDescription>
            {auth.passwordChange.description}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-6">
            <div className="bg-primary/10 border border-primary/20 rounded-md p-4 flex items-center justify-center gap-2">
              <Check size={18} className="text-primary" />
              <p className="text-sm text-foreground font-medium">
                {auth.passwordChange.success}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">
                New password <span className="text-red-600">*</span>
              </Label>
              <PasswordInput
                id="newPassword"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">
                Confirm password <span className="text-red-600">*</span>
              </Label>
              <PasswordInput
                id="confirmNewPassword"
                placeholder="Type it again to make sure"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
                required
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <div className="p-3 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md flex items-start gap-2">
              <Info size={16} className="shrink-0 mt-0.5" />
              <span>{auth.passwordChange.hint}</span>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  'Updating...'
                ) : (
                  <>
                    <Key size={16} className="mr-1.5" />
                    Update password
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
