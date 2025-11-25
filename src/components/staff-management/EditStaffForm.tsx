import { useState, useEffect } from 'react';
import { updateBudtender } from '@/lib/api/budtenders';
import { setStaffPassword } from '@/lib/api/staff-management';
import type { StaffWithStatus } from '@/lib/api/staff-management';
import type { Database } from '@/types';
import { PasswordInput } from '@/components/ui/password-input';
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

interface EditStaffFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  staff: StaffWithStatus | null;
}

// Predefined locations for State of Mind stores
const LOCATIONS = [
  'Latham',
  'Albany',
  // Add more locations as needed
];

// Tolerance band definitions
const TOLERANCE_BANDS = [
  {
    id: 'light',
    label: 'Light rider',
    description: 'You feel things easily and prefer gentle, controlled highs.',
    example: 'Light rider — one hit or a low-dose gummy and I\'m feeling it.',
  },
  {
    id: 'steady',
    label: 'Steady flyer',
    description: 'You use pretty often but don\'t always need the strongest stuff.',
    example: 'Steady flyer — I use most days, but regular-strength products still work well for me.',
  },
  {
    id: 'heavy',
    label: 'Heavy hitter',
    description: 'You go through a lot and need stronger options to feel it.',
    example: 'Heavy hitter — I smoke every day and usually go for strong indicas or infused options.',
  },
] as const;

// Example expertise phrases
// Sentinel value for "no location" since Radix Select doesn't allow empty strings
const NO_LOCATION = '_none';

const EXPERTISE_EXAMPLES = [
  'Edibles for sleep & anxiety',
  'Budget pre-rolls that still hit',
  'Live resin vapes & terp-heavy carts',
  'Beginner-friendly flower and low-dose gummies',
  'Heavy indicas and "knockout" night options',
  'Social sativas and talkative highs',
  'CBD/ratio products for pain and tension',
  'Concentrates and dabs for experienced smokers',
];

// Example vibe phrases
const VIBE_EXAMPLES = [
  'Upstate hiker and home cook who loves bright, talkative sativas for daytime and cozy, heavy indicas for movie nights.',
  'Albany born and raised, dog dad, and live-resin nerd. I chase loud terps, smooth highs, and good playlists.',
  'Former barista turned budtender. I\'m all about balanced hybrids, chill social highs, and anything that pairs well with coffee and conversation.',
  'Gamer, gym rat, and dab dragon. I like heavy hitters after long days and functional vapes when I still need to get things done.',
];

export function EditStaffForm({ open, onOpenChange, onSuccess, staff }: EditStaffFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVibeExamples, setShowVibeExamples] = useState(false);

  const [name, setName] = useState('');
  const [role, setRole] = useState<BudtenderRole>('budtender');
  const [location, setLocation] = useState(NO_LOCATION);
  const [profileVibe, setProfileVibe] = useState('');
  const [profileExpertise, setProfileExpertise] = useState('');
  const [profileTolerance, setProfileTolerance] = useState('');
  const [selectedToleranceBand, setSelectedToleranceBand] = useState<string | null>(null);

  // Password setting state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Populate form when staff prop changes
  useEffect(() => {
    if (staff) {
      setName(staff.name);
      setRole(staff.role as BudtenderRole);
      setLocation(staff.location || NO_LOCATION);
      setProfileVibe(staff.profile_vibe || '');
      setProfileExpertise(staff.profile_expertise || '');
      setProfileTolerance(staff.profile_tolerance || '');
      setSelectedToleranceBand(null);
      setShowVibeExamples(false);
      setError(null);
      // Reset password section
      setShowPasswordSection(false);
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError(null);
      setPasswordSuccess(false);
    }
  }, [staff]);

  function handleClose() {
    if (!loading && !passwordLoading) {
      setError(null);
      setPasswordError(null);
      setPasswordSuccess(false);
      setShowPasswordSection(false);
      setNewPassword('');
      setConfirmPassword('');
      onOpenChange(false);
    }
  }

  async function handleSetPassword() {
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!staff) {
      setPasswordError('No staff member selected.');
      return;
    }

    if (!newPassword) {
      setPasswordError('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordLoading(true);

    try {
      await setStaffPassword(staff.id, newPassword);
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      // Hide success message after 3 seconds
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: unknown) {
      console.error('Failed to set password:', err);
      setPasswordError(err instanceof Error ? err.message : 'Failed to set password. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  }

  function handleToleranceBandSelect(bandId: string) {
    const band = TOLERANCE_BANDS.find(b => b.id === bandId);
    if (band) {
      setSelectedToleranceBand(bandId);
      setProfileTolerance(band.example);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!staff) {
      setError('No staff member selected.');
      return;
    }

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    setLoading(true);

    try {
      await updateBudtender(staff.id, {
        name: name.trim(),
        role,
        location: location === NO_LOCATION ? null : location.trim() || null,
        profile_vibe: profileVibe.trim() || null,
        profile_expertise: profileExpertise.trim() || null,
        profile_tolerance: profileTolerance.trim() || null,
      });

      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      console.error('Failed to update budtender:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!staff) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Staff Profile</DialogTitle>
          <DialogDescription>
            Update {staff.name}'s profile information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email (read-only) */}
          {staff.email && (
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={staff.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-text-muted">
                Email cannot be changed after invite is sent.
              </p>
            </div>
          )}

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">
              Name <span className="text-red-600">*</span>
            </Label>
            <Input
              id="edit-name"
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
              <Label htmlFor="edit-role">
                Role <span className="text-red-600">*</span>
              </Label>
              <Select value={role} onValueChange={(v) => setRole(v as BudtenderRole)} disabled={loading}>
                <SelectTrigger id="edit-role">
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
              <Label htmlFor="edit-location">Location</Label>
              <Select value={location} onValueChange={setLocation} disabled={loading}>
                <SelectTrigger id="edit-location">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_LOCATION}>No location</SelectItem>
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
            Changing roles affects permissions immediately.
          </p>

          {/* Divider */}
          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold text-text mb-4">Profile Details</h3>
          </div>

          {/* My vibe (profile_vibe) */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="edit-profileVibe">My vibe</Label>
              <p className="text-xs text-text-muted mt-1">
                A couple short lines about them and how they like to live &amp; light up. Mix real life (hometown, hobbies, pets) with how they sesh and the vibes they love.
              </p>
            </div>
            
            <div className="p-3 bg-bg-soft border border-border rounded-md text-xs text-text-muted space-y-2">
              <p className="font-medium text-text">Try one of these patterns (1–3 sentences is perfect):</p>
              <ul className="list-disc list-inside space-y-1">
                <li>"I'm a [hometown] [role/hobby] who loves [product type] for [kind of night]."</li>
                <li>"When I'm not at SOM, I'm usually [hobby], and my go-tos are [product] for [situation]."</li>
                <li>"I'm the friend who always brings [product type] for [vibe], especially when [detail]."</li>
              </ul>
            </div>

            <Textarea
              id="edit-profileVibe"
              placeholder="Albany born and raised, dog dad, and live-resin nerd. I chase loud terps, smooth highs, and good playlists."
              value={profileVibe}
              onChange={(e) => setProfileVibe(e.target.value)}
              disabled={loading}
              rows={3}
              className="resize-none"
            />

            <button
              type="button"
              onClick={() => setShowVibeExamples(!showVibeExamples)}
              className="text-xs text-primary hover:underline"
            >
              {showVibeExamples ? 'Hide example vibes' : 'Show example vibes'}
            </button>

            {showVibeExamples && (
              <div className="p-3 bg-primary-soft/30 border border-primary/20 rounded-md text-xs space-y-2">
                {VIBE_EXAMPLES.map((example, idx) => (
                  <p key={idx} className="text-text-muted italic">"{example}"</p>
                ))}
              </div>
            )}
          </div>

          {/* Expertise (profile_expertise) */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="edit-profileExpertise">Expertise</Label>
              <p className="text-xs text-text-muted mt-1">
                What are they best at helping people with? Think product types, effects, or goals where they're the go-to person.
              </p>
            </div>

            <Input
              id="edit-profileExpertise"
              type="text"
              placeholder="Edibles for sleep & anxiety"
              value={profileExpertise}
              onChange={(e) => setProfileExpertise(e.target.value)}
              disabled={loading}
            />

            <div className="flex flex-wrap gap-1.5">
              {EXPERTISE_EXAMPLES.map((example, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setProfileExpertise(example)}
                  className="px-2 py-1 text-xs bg-bg-soft border border-border rounded hover:border-primary hover:bg-primary-soft/20 transition-colors"
                  disabled={loading}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Tolerance (profile_tolerance) */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="edit-profileTolerance">Tolerance</Label>
              <p className="text-xs text-text-muted mt-1">
                How much they usually use and how strong they like things. Be honest — this helps customers understand how their picks compare to their level.
              </p>
            </div>

            {/* Tolerance band cards */}
            <div className="grid grid-cols-3 gap-2">
              {TOLERANCE_BANDS.map((band) => (
                <button
                  key={band.id}
                  type="button"
                  onClick={() => handleToleranceBandSelect(band.id)}
                  disabled={loading}
                  className={`p-3 text-left border rounded-lg transition-all ${
                    selectedToleranceBand === band.id
                      ? 'border-primary bg-primary-soft/30 ring-1 ring-primary'
                      : 'border-border hover:border-primary/50 hover:bg-bg-soft'
                  }`}
                >
                  <p className="font-medium text-sm text-text">{band.label}</p>
                  <p className="text-xs text-text-muted mt-1">{band.description}</p>
                </button>
              ))}
            </div>

            <Input
              id="edit-profileTolerance"
              type="text"
              placeholder="Steady flyer — I use most days, but regular-strength products still work well for me."
              value={profileTolerance}
              onChange={(e) => {
                setProfileTolerance(e.target.value);
                setSelectedToleranceBand(null);
              }}
              disabled={loading}
            />
            <p className="text-xs text-text-muted">
              Select a band above to get started, then edit the text to make it their own.
            </p>
          </div>

          {/* Password Setting Section (Manager-only) */}
          {staff.auth_user_id && (
            <div className="border-t border-border pt-4 space-y-3">
              <button
                type="button"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="flex items-center gap-2 text-sm font-semibold text-text hover:text-primary"
              >
                <span>{showPasswordSection ? '▼' : '▶'}</span>
                Set New Password
              </button>

              {showPasswordSection && (
                <div className="space-y-4 pl-4 border-l-2 border-border">
                  <p className="text-xs text-text-muted">
                    Directly set a new password for {staff.name}. They will not receive an email notification.
                  </p>

                  <div className="space-y-2">
                    <Label htmlFor="edit-newPassword">New password</Label>
                    <PasswordInput
                      id="edit-newPassword"
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={passwordLoading}
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-confirmPassword">Confirm password</Label>
                    <PasswordInput
                      id="edit-confirmPassword"
                      placeholder="Re-enter the password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={passwordLoading}
                      autoComplete="new-password"
                    />
                  </div>

                  {passwordError && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                      {passwordError}
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                      ✓ Password updated successfully
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleSetPassword}
                    disabled={passwordLoading || !newPassword || !confirmPassword}
                  >
                    {passwordLoading ? 'Setting password...' : 'Set Password'}
                  </Button>
                </div>
              )}
            </div>
          )}

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
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
