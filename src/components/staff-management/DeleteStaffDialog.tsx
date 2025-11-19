import { useState, useEffect } from 'react';
import { deleteBudtender, getBudtenderPickCount } from '@/lib/api/budtenders';
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

type Budtender = Database['public']['Tables']['budtenders']['Row'];

interface DeleteStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  staff: Budtender | null;
}

export function DeleteStaffDialog({ open, onOpenChange, onSuccess, staff }: DeleteStaffDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const [pickCount, setPickCount] = useState<number>(0);

  // Fetch pick count when dialog opens
  useEffect(() => {
    if (open && staff) {
      loadPickCount();
    } else {
      // Reset state when dialog closes
      setShowFinalConfirm(false);
      setError(null);
      setPickCount(0);
    }
  }, [open, staff]);

  async function loadPickCount() {
    if (!staff) return;

    try {
      const count = await getBudtenderPickCount(staff.id);
      setPickCount(count);
    } catch (err) {
      console.error('Failed to load pick count:', err);
      setPickCount(0); // Continue with 0 if fetch fails
    }
  }

  function handleClose() {
    if (!loading) {
      setShowFinalConfirm(false);
      setError(null);
      onOpenChange(false);
    }
  }

  function handleInitialConfirm() {
    setShowFinalConfirm(true);
  }

  function handleCancel() {
    if (showFinalConfirm) {
      // Go back to first confirmation
      setShowFinalConfirm(false);
      setError(null);
    } else {
      // Close dialog
      handleClose();
    }
  }

  async function handleFinalConfirm() {
    if (!staff) {
      setError('No staff member selected.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await deleteBudtender(staff.id);
      alert(`${staff.name} has been permanently deleted.`);
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error('Failed to delete budtender:', err);
      setError(err.message || 'Failed to delete staff member. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!staff) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {!showFinalConfirm ? (
          <>
            {/* First Confirmation */}
            <DialogHeader>
              <DialogTitle>Delete {staff.name}?</DialogTitle>
              <DialogDescription>
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-900">
                  <strong>⚠️ Warning:</strong> This will permanently delete:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-red-800">
                  <li>{staff.name}'s profile</li>
                  <li>All {pickCount} of their pick{pickCount !== 1 ? 's' : ''}</li>
                  <li>All associated data</li>
                </ul>
              </div>

              <p className="text-sm text-text-muted">
                Are you sure you want to continue?
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCancel} disabled={loading}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleInitialConfirm} disabled={loading}>
                Yes, Continue
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            {/* Second/Final Confirmation */}
            <DialogHeader>
              <DialogTitle className="text-red-600">Final Confirmation</DialogTitle>
              <DialogDescription>
                Last chance to cancel. This action is permanent.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="p-4 bg-red-100 border-2 border-red-300 rounded-md">
                <p className="text-sm font-semibold text-red-900 mb-2">
                  You are about to permanently delete:
                </p>
                <p className="text-lg font-bold text-red-900">{staff.name}</p>
                {pickCount > 0 && (
                  <p className="text-sm text-red-800 mt-1">
                    and {pickCount} pick{pickCount !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              <p className="text-sm text-text font-semibold">
                Are you absolutely sure?
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCancel} disabled={loading}>
                No, Go Back
              </Button>
              <Button variant="destructive" onClick={handleFinalConfirm} disabled={loading}>
                {loading ? 'Deleting...' : 'Yes, Delete Permanently'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

