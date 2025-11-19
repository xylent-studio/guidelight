import { useState, useEffect } from 'react';
import { updateBudtender } from '@/lib/api/budtenders';
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

type Budtender = Database['public']['Tables']['budtenders']['Row'];
type BudtenderRole = Budtender['role'];

interface EditStaffFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  staff: Budtender | null;
}

export function EditStaffForm({ open, onOpenChange, onSuccess, staff }: EditStaffFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [role, setRole] = useState<BudtenderRole>('budtender');
  const [archetype, setArchetype] = useState('');
  const [idealHigh, setIdealHigh] = useState('');
  const [toleranceLevel, setToleranceLevel] = useState('');

  // Populate form when staff prop changes
  useEffect(() => {
    if (staff) {
      setName(staff.name);
      setRole(staff.role);
      setArchetype(staff.archetype || '');
      setIdealHigh(staff.ideal_high || '');
      setToleranceLevel(staff.tolerance_level || '');
      setError(null);
    }
  }, [staff]);

  function handleClose() {
    if (!loading) {
      setError(null);
      onOpenChange(false);
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
        archetype: archetype.trim() || null,
        ideal_high: idealHigh.trim() || null,
        tolerance_level: toleranceLevel.trim() || null,
      });

      alert(`Success! ${name}'s profile has been updated.`);
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error('Failed to update budtender:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
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
            <p className="text-xs text-text-muted">
              Changing roles affects permissions immediately.
            </p>
          </div>

          {/* Archetype */}
          <div className="space-y-2">
            <Label htmlFor="edit-archetype">Archetype (Optional)</Label>
            <Input
              id="edit-archetype"
              type="text"
              placeholder="The Explorer"
              value={archetype}
              onChange={(e) => setArchetype(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Ideal High */}
          <div className="space-y-2">
            <Label htmlFor="edit-idealHigh">Ideal High (Optional)</Label>
            <Textarea
              id="edit-idealHigh"
              placeholder="Clear-headed creativity with balanced relaxation"
              value={idealHigh}
              onChange={(e) => setIdealHigh(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>

          {/* Tolerance Level */}
          <div className="space-y-2">
            <Label htmlFor="edit-toleranceLevel">Tolerance Level (Optional)</Label>
            <Input
              id="edit-toleranceLevel"
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
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

