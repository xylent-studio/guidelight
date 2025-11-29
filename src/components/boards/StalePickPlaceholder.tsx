import { Card } from '@/components/ui/card';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type StalePickPlaceholderProps = {
  pickId: string;
  onRemove?: () => void;
};

/**
 * Placeholder shown in edit mode when a board item references
 * a pick that has been archived or deleted.
 */
export function StalePickPlaceholder({ pickId: _pickId, onRemove }: StalePickPlaceholderProps) {
  return (
    <Card className="p-4 border-dashed border-yellow-500 bg-yellow-500/5">
      <div className="flex items-start gap-3">
        <AlertTriangle size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">Pick unavailable</p>
          <p className="text-xs text-muted-foreground mt-1">
            This pick has been archived or deleted.
          </p>
        </div>
        {onRemove && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 size={16} />
          </Button>
        )}
      </div>
    </Card>
  );
}

