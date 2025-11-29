import { X, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { MediaAsset } from '@/lib/api/assets';

type CanvasImageBlockProps = {
  asset: MediaAsset;
  itemId?: string;  // For sortable
  mode?: 'edit' | 'display';
  onRemove?: () => void;
  onClick?: () => void;
};

export function CanvasImageBlock({ 
  asset, 
  itemId,
  mode = 'edit',
  onRemove,
  onClick,
}: CanvasImageBlockProps) {
  const isDraggable = mode === 'edit' && !!itemId;
  
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

  const isEditable = mode === 'edit';

  return (
    <div 
      ref={isDraggable ? setNodeRef : undefined}
      style={style}
      className={`
        relative group rounded-lg overflow-hidden
        ${isEditable ? 'cursor-pointer' : ''}
        ${isDragging ? 'ring-2 ring-primary z-10' : ''}
      `}
      onClick={onClick}
    >
      <img 
        src={asset.url} 
        alt={asset.label || asset.filename}
        className="w-full h-auto max-h-64 object-contain bg-muted"
      />
      
      {isDraggable && (
        <>
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="
              absolute top-2 right-2 p-1.5
              bg-background/80 backdrop-blur-sm rounded
              text-muted-foreground hover:text-foreground 
              cursor-grab active:cursor-grabbing
              opacity-0 group-hover:opacity-100 transition-opacity
            "
            style={{ touchAction: 'none' }}
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical size={16} />
          </button>
          
          {/* Remove button */}
          {onRemove && (
            <button
              className="
                absolute top-2 right-10 p-1.5
                bg-background/80 backdrop-blur-sm rounded
                text-muted-foreground hover:text-destructive
                opacity-0 group-hover:opacity-100 transition-opacity
              "
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <X size={16} />
            </button>
          )}
        </>
      )}
      
      {/* Label overlay (display mode or hover) */}
      {asset.label && (
        <div className={`
          absolute bottom-0 left-0 right-0 
          bg-gradient-to-t from-black/60 to-transparent
          p-2 pt-6
          ${mode === 'edit' ? 'opacity-0 group-hover:opacity-100 transition-opacity' : ''}
        `}>
          <p className="text-xs text-white truncate">
            {asset.label}
          </p>
        </div>
      )}
    </div>
  );
}

