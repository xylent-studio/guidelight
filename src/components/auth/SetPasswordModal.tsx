import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SetPasswordModalProps {
  open: boolean;
  userEmail: string;
  onPasswordSet?: () => void;
}

export function SetPasswordModal({ open, userEmail, onPasswordSet }: SetPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw updateError;
      }

      alert('Password set successfully! You can now use it to log in.');
      
      // Mark as complete and close modal
      if (onPasswordSet) {
        onPasswordSet();
      }
    } catch (err: any) {
      console.error('Failed to set password:', err);
      setError(err.message || 'Failed to set password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}} modal>
      <DialogContent className="max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to Guidelight!</DialogTitle>
          <DialogDescription>
            Before you start, please set a password for your account ({userEmail}).
            You'll use this password to log in next time.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">
              Password <span className="text-red-600">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              minLength={8}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              Confirm Password <span className="text-red-600">*</span>
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="p-3 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md">
            💡 Password must be at least 8 characters long
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Setting Password...' : 'Set Password & Continue'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

