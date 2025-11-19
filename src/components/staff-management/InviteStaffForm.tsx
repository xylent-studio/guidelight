import { useState } from 'react';
import { inviteStaff } from '@/lib/api/invite';
import type { Database } from '@/types';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type BudtenderRole = Database['public']['Tables']['budtenders']['Row']['role'];

interface InviteStaffFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function InviteStaffForm({ open, onOpenChange, onSuccess }: InviteStaffFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<BudtenderRole>('budtender');
  const [archetype, setArchetype] = useState('');
  const [idealHigh, setIdealHigh] = useState('');
  const [toleranceLevel, setToleranceLevel] = useState('');

  function resetForm() {
    setEmail('');
    setName('');
    setRole('budtender');
    setArchetype('');
    setIdealHigh('');
    setToleranceLevel('');
    setError(null);
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
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const response = await inviteStaff({
        email: email.trim(),
        name: name.trim(),
        role,
        archetype: archetype.trim() || null,
        ideal_high: idealHigh.trim() || null,
        tolerance_level: toleranceLevel.trim() || null,
      });

      alert(response.message || `Success! ${name} has been invited. They will receive an email with login instructions.`);
      resetForm();
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error('Failed to invite staff:', err);
      setError(err.message || 'Failed to invite staff member. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invite Staff Member</DialogTitle>
          <DialogDescription>
            Add a new team member. They'll receive an email with login instructions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Help Text */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-sm space-y-2">
            <p className="font-semibold text-blue-900">ℹ️ How it works:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-800">
              <li>Enter the staff member's email and details below</li>
              <li>Click "Send Invite" - they'll receive an email immediately</li>
              <li>They click the link in the email to set their password</li>
              <li>They can then log in and start using Guidelight</li>
            </ol>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-600">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="alex@stateofmind.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            <p className="text-xs text-text-muted">
              They'll receive an invite email at this address.
            </p>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-red-600">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Alex Chen"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">
              Role <span className="text-red-600">*</span>
            </Label>
            <Select value={role} onValueChange={(v) => setRole(v as BudtenderRole)} disabled={loading}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="budtender">Budtender</SelectItem>
                <SelectItem value="vault_tech">Vault Tech</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-text-muted">
              Managers can invite/manage staff and edit any picks.
            </p>
          </div>

          {/* Archetype (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="archetype">Archetype (Optional)</Label>
            <Input
              id="archetype"
              type="text"
              placeholder="The Explorer"
              value={archetype}
              onChange={(e) => setArchetype(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-text-muted">
              Examples: The Explorer, The Socialite, The Chill Master
            </p>
          </div>

          {/* Ideal High (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="idealHigh">Ideal High (Optional)</Label>
            <Textarea
              id="idealHigh"
              placeholder="Clear-headed creativity with balanced relaxation"
              value={idealHigh}
              onChange={(e) => setIdealHigh(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>

          {/* Tolerance Level (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="toleranceLevel">Tolerance Level (Optional)</Label>
            <Input
              id="toleranceLevel"
              type="text"
              placeholder="Medium"
              value={toleranceLevel}
              onChange={(e) => setToleranceLevel(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* Footer */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Sending Invite...' : 'Send Invite'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

