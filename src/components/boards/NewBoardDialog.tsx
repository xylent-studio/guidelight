import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type NewBoardDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string) => void;
};

/**
 * Dialog for creating a new custom board.
 * Session 08: Simple form with name and optional description.
 */
export function NewBoardDialog({ open, onClose, onCreate }: NewBoardDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const handleSubmit = async () => {
    if (name.trim()) {
      setCreating(true);
      await onCreate(name.trim(), description.trim() || undefined);
      // Reset state
      setName('');
      setDescription('');
      setCreating(false);
      onClose();
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Board</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name input */}
          <div className="space-y-2">
            <Label htmlFor="name">Board Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Custom Board"
              autoFocus
            />
          </div>

          {/* Description input */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this board for?"
              rows={2}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} disabled={creating}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || creating}>
            {creating ? 'Creating...' : 'Create Board'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}



