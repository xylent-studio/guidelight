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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Send, UserPlus } from 'lucide-react';

type BudtenderRole = Database['public']['Tables']['budtenders']['Row']['role'];

interface InviteStaffFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// Predefined locations for State of Mind stores
const LOCATIONS = [
  'Latham',
  'Albany',
  // Add more locations as needed
];

export function InviteStaffForm({ open, onOpenChange, onSuccess }: InviteStaffFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<BudtenderRole>('budtender');
  const [location, setLocation] = useState('');
  const [profileExpertise, setProfileExpertise] = useState('');

  function resetForm() {
    setEmail('');
    setName('');
    setRole('budtender');
    setLocation('');
    setProfileExpertise('');
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
      await inviteStaff({
        email: email.trim(),
        name: name.trim(),
        role,
        location: location.trim() || null,
        profile_expertise: profileExpertise.trim() || null,
      });

      setSuccess(true);
      
      // Wait a moment then close
      setTimeout(() => {
        resetForm();
        onSuccess();
        onOpenChange(false);
      }, 2000);
    } catch (err: unknown) {
      console.error('Failed to invite staff:', err);
      setError(err instanceof Error ? err.message : 'Failed to invite staff member. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus size={20} />
            Invite a New Teammate
          </DialogTitle>
          <DialogDescription>
            Add someone to the team! They'll get an email with everything they need to get started.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8">
            <div className="bg-primary/10 border border-primary/20 rounded-md p-6 text-center">
              <div className="text-4xl mb-3">🎉</div>
              <p className="text-lg font-medium text-text mb-2">
                Invite sent to {name}!
              </p>
              <p className="text-sm text-text-muted">
                They'll get an email at {email} with a magic link to jump in.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Help Text */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-sm space-y-2">
              <p className="font-semibold text-blue-900">How it works:</p>
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

            {/* Role and Location - side by side */}
            <div className="grid grid-cols-2 gap-4">
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
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select value={location} onValueChange={setLocation} disabled={loading}>
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="text-xs text-text-muted -mt-4">
              Managers can invite/manage staff and edit any picks.
            </p>

            {/* Expertise (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="profileExpertise">Expertise (Optional)</Label>
              <Input
                id="profileExpertise"
                type="text"
                placeholder="Edibles for sleep & anxiety"
                value={profileExpertise}
                onChange={(e) => setProfileExpertise(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-text-muted">
                What are they best at helping people with? They can fill out their full profile after accepting the invite.
              </p>
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
                {loading ? (
                  'Sending Invite...'
                ) : (
                  <>
                    <Send size={16} className="mr-1.5" />
                    Send Invite
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
