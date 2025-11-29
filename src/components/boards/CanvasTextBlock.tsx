import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';

type CanvasTextBlockProps = {
  content: string;
  itemId?: string;  // board_item id for sortable (optional)
  variant?: 'heading' | 'body';
  mode?: 'edit' | 'display';
  onClick?: () => void;
  onUpdate?: (newContent: string) => void;  // Session 08: Inline editing
  onRemove?: () => void;  // Session 08: Remove text block
};

/**
 * Text block component for board canvas.
 * Supports heading and body variants for different text emphasis.
 * Supports drag-drop when itemId is provided.
 * Session 08: Supports inline editing and removal.
 */
export function CanvasTextBlock({ 
  content, 
  itemId, 
  variant = 'body', 
  mode = 'edit',
  onClick,
  onUpdate,
  onRemove,
}: CanvasTextBlockProps) {
  const isEditable = mode === 'edit';
  const isDraggable = isEditable && !!itemId;
  const canEdit = isEditable && !!onUpdate;
  
  // Session 08: Inline editing state
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(content);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  
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
  
  const textClassName = variant === 'heading' 
    ? 'text-xl font-semibold text-foreground'
    : 'text-sm text-muted-foreground';
  
  // Focus input when entering edit mode
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);
  
  // Handle save
  const handleSave = () => {
    setEditing(false);
    if (editValue.trim() !== content && onUpdate) {
      onUpdate(editValue.trim());
    }
  };
  
  // Handle click to edit
  const handleClick = () => {
    if (canEdit && !isDragging) {
      setEditing(true);
    } else if (onClick) {
      onClick();
    }
  };
  
  // Handle keyboard
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setEditing(false);
      setEditValue(content);
    }
  };
  
  return (
    <div 
      ref={isDraggable ? setNodeRef : undefined}
      style={style}
      className={`
        p-3 rounded-lg relative group
        ${isEditable ? 'hover:bg-muted/50 cursor-pointer' : ''}
        ${isDragging ? 'ring-2 ring-primary shadow-lg z-10 bg-card' : ''}
      `}
      onClick={editing ? undefined : handleClick}
    >
      {/* Remove button - only in edit mode with onRemove */}
      {isEditable && onRemove && !editing && (
        <button
          type="button"
          className="
            absolute top-1 right-7 p-1 
            text-muted-foreground hover:text-destructive 
            rounded hover:bg-muted/50
            opacity-0 group-hover:opacity-100 transition-opacity
          "
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X size={14} />
        </button>
      )}
      
      {/* Drag handle - only in edit mode with itemId */}
      {isDraggable && !editing && (
        <button
          {...attributes}
          {...listeners}
          className="
            absolute top-1 right-1 p-1 
            text-muted-foreground hover:text-foreground 
            cursor-grab active:cursor-grabbing
            rounded hover:bg-muted/50
          "
          style={{ touchAction: 'none' }}  /* CRITICAL: Prevents scroll-on-drag on mobile */
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={14} />
        </button>
      )}
      
      {editing ? (
        // Inline edit mode
        variant === 'heading' ? (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-full text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 -ml-1"
            placeholder="Heading text..."
          />
        ) : (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-full text-sm text-muted-foreground bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 -ml-1 resize-none min-h-[3rem]"
            placeholder="Body text..."
            rows={3}
          />
        )
      ) : (
        <p className={`${textClassName} ${isDraggable ? 'pr-10' : ''}`}>{content}</p>
      )}
    </div>
  );
}
