import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, User, GripVertical, X } from 'lucide-react';
import type { Database } from '@/types/database';

type Pick = Database['public']['Tables']['picks']['Row'];

type AttributionStyle = 'prominent' | 'subtle' | null;

type CanvasPickCardProps = {
  pick: Pick;
  itemId?: string;  // board_item id for sortable (optional for non-draggable contexts)
  mode?: 'canvas' | 'display';
  onClick?: () => void;
  onRemove?: () => void;  // Session 07: Remove pick from board
  // Attribution for picks from other budtenders (Q1 answer)
  attribution?: {
    budtenderName: string;
    style: AttributionStyle;
  };
};

/**
 * Canvas-optimized pick card for board views.
 * Reuses design patterns from GuestPickCard with canvas-specific styling.
 * Supports drag-drop when itemId is provided.
 */
export function CanvasPickCard({ pick, itemId, mode = 'canvas', onClick, onRemove, attribution }: CanvasPickCardProps) {
  const isCanvas = mode === 'canvas';
  const isDraggable = isCanvas && !!itemId;
  
  // Only use sortable hook if we have an itemId
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: itemId || 'non-draggable', disabled: !isDraggable });
  
  const style = isDraggable ? {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  } : undefined;
  
  return (
    <Card 
      ref={isDraggable ? setNodeRef : undefined}
      style={style}
      className={`
        p-4 relative
        ${isCanvas ? 'cursor-pointer hover:ring-2 hover:ring-primary/20' : ''}
        ${isDragging ? 'ring-2 ring-primary shadow-lg z-10' : ''}
        bg-card
      `}
      onClick={onClick}
    >
      {/* Remove button - only in canvas mode with onRemove */}
      {isCanvas && onRemove && (
        <button
          type="button"
          className="
            absolute top-2 right-8 p-1 
            text-muted-foreground hover:text-destructive 
            rounded hover:bg-muted/50
          "
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X size={16} />
        </button>
      )}
      
      {/* Drag handle - only in canvas mode with itemId */}
      {isDraggable && (
        <button
          {...attributes}
          {...listeners}
          className="
            absolute top-2 right-2 p-1 
            text-muted-foreground hover:text-foreground 
            cursor-grab active:cursor-grabbing
            rounded hover:bg-muted/50
          "
          style={{ touchAction: 'none' }}  /* CRITICAL: Prevents scroll-on-drag on mobile */
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={16} />
        </button>
      )}
      
      {/* Prominent attribution (header style) */}
      {attribution?.style === 'prominent' && (
        <div className="flex items-center gap-1.5 text-sm text-primary mb-2 pb-2 border-b">
          <User size={14} />
          <span className="font-medium">{attribution.budtenderName}'s Pick</span>
        </div>
      )}
      
      {/* Product name and brand */}
      <div className="mb-2 pr-6">
        <h3 className="font-semibold text-base line-clamp-1">
          {pick.product_name}
        </h3>
        {pick.brand && (
          <p className="text-sm text-muted-foreground">{pick.brand}</p>
        )}
      </div>
      
      {/* One-liner */}
      {pick.one_liner && (
        <p className="text-sm text-foreground/80 line-clamp-2 mb-2">
          {pick.one_liner}
        </p>
      )}
      
      {/* Rating and badges */}
      <div className="flex items-center gap-2 flex-wrap">
        {pick.rating && (
          <div className="flex items-center gap-1">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{pick.rating}</span>
          </div>
        )}
        {pick.time_of_day && pick.time_of_day !== 'Anytime' && (
          <Badge variant="secondary" className="text-xs">
            {pick.time_of_day}
          </Badge>
        )}
      </div>
      
      {/* Subtle attribution (footnote style) */}
      {attribution?.style === 'subtle' && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3 pt-2 border-t">
          <User size={12} />
          <span>From {attribution.budtenderName}</span>
        </div>
      )}
    </Card>
  );
}
