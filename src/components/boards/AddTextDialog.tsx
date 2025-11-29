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
import { Type, FileText } from 'lucide-react';

type TextVariant = 'heading' | 'body';

type AddTextDialogProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (content: string, variant: TextVariant) => void;
};

/**
 * Dialog for adding text blocks to a board.
 * Session 08: Supports heading and body variants.
 */
export function AddTextDialog({ open, onClose, onAdd }: AddTextDialogProps) {
  const [variant, setVariant] = useState<TextVariant>('heading');
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (content.trim()) {
      onAdd(content.trim(), variant);
      // Reset state
      setContent('');
      setVariant('heading');
      onClose();
    }
  };

  const handleClose = () => {
    setContent('');
    setVariant('heading');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Text Block</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Variant selector */}
          <div className="space-y-2">
            <Label>Text Type</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setVariant('heading')}
                className={`
                  flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border
                  ${variant === 'heading' 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-muted hover:border-muted-foreground/50'}
                `}
              >
                <Type size={18} />
                <span className="font-medium">Heading</span>
              </button>
              <button
                type="button"
                onClick={() => setVariant('body')}
                className={`
                  flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border
                  ${variant === 'body' 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-muted hover:border-muted-foreground/50'}
                `}
              >
                <FileText size={18} />
                <span className="font-medium">Body Text</span>
              </button>
            </div>
          </div>

          {/* Content input */}
          <div className="space-y-2">
            <Label htmlFor="content">
              {variant === 'heading' ? 'Heading Text' : 'Body Text'}
            </Label>
            {variant === 'heading' ? (
              <Input
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter heading..."
                autoFocus
              />
            ) : (
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter body text..."
                rows={3}
                autoFocus
              />
            )}
          </div>

          {/* Preview */}
          {content && (
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">Preview</Label>
              <div className="p-3 rounded-lg bg-muted/30">
                <p className={variant === 'heading' 
                  ? 'text-xl font-semibold text-foreground' 
                  : 'text-sm text-muted-foreground'
                }>
                  {content}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!content.trim()}>
            Add Text
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}



