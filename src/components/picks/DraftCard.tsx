import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { PickDraftRow } from '@/lib/api/drafts';

type DraftCardProps = {
  draft: PickDraftRow;
  onResume: () => void;
  onDelete: () => void;
};

export function DraftCard({ draft, onResume, onDelete }: DraftCardProps) {
  const draftData = draft.data as { product_name?: string; brand?: string } | null;
  const productName = draftData?.product_name || 'Untitled pick';
  const brand = draftData?.brand;
  const isEditing = !!draft.pick_id;
  const timeAgo = formatDistanceToNow(new Date(draft.updated_at), { addSuffix: true });

  return (
    <Card className="bg-muted/50 border-dashed">
      <CardContent className="py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Edit size={14} className="text-muted-foreground flex-shrink-0" />
              <span className="font-medium truncate">{productName}</span>
              {isEditing && (
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
                  Editing
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              {brand && <span className="truncate">{brand}</span>}
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {timeAgo}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Button variant="ghost" size="sm" onClick={onResume}>
              Resume
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

