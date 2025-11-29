# Session 08: Add Text Block + Board CRUD + Schema Extensions

---
**Session Metadata**

| Field | Value |
|-------|-------|
| **Phase** | 2 - Boards Core |
| **Estimated Duration** | 3-4 hours |
| **Prerequisites** | Session 07 completed |
| **Output** | AddTextDialog, text editing, board CRUD, schema extensions, bug fixes |

---

## Pre-Session Checklist

- [ ] Session 07 completed successfully
- [ ] AddPickDialog working
- [ ] Read `docs/guidelight_ux_docs_bundle_vNEXT/04_USER_FLOWS_STAFF_AND_BOARDS.md` (custom boards section)
- [ ] Verify `attribution_style` column exists in `board_items`
- [ ] Verify current `board_item_type` enum values

---

## Session Goals

1. **Schema Extensions (Future-proofing)**
   - Add `theme`, `purpose`, `channel` columns to `boards` (nullable, for Canvas phase)
   - Add `image` to `board_item_type` enum (preparation for images)
   - Add `asset_id` column to `board_items` (for image items)
   - Add `image_asset_id` column to `picks` (for pick images)

2. **Bug Fixes**
   - Fix attribution display in BoardCanvas (data model ready, UI doesn't render it)
   - Add permission check in BoardEditorView (owner + manager can edit)

3. **Core Features (Original Session 08)**
   - Create `AddTextDialog.tsx` component
   - Enable inline text editing on CanvasTextBlock
   - Create board API (custom boards)
   - Delete board API (with confirmation)
   - Duplicate board API

---

## Acceptance Criteria

- [ ] `boards` table has `theme`, `purpose`, `channel` columns (nullable)
- [ ] `board_item_type` enum includes `image`
- [ ] `board_items.asset_id` column exists
- [ ] `picks.image_asset_id` column exists
- [ ] Attribution displays correctly on CanvasPickCard (when `attribution_style` set)
- [ ] Only owner or manager can see edit controls on boards
- [ ] "Add text" button opens AddTextDialog
- [ ] Can add heading or body text to board
- [ ] Text blocks editable by clicking
- [ ] "New board" button creates custom board
- [ ] Can delete custom boards (with confirmation)
- [ ] Can duplicate boards
- [ ] Auto boards cannot be deleted
- [ ] No errors in `npm run build`

---

## Implementation Steps

### Step 1: Migration - Future-proofing columns on boards

```sql
-- Migration: add_board_future_columns

-- Add columns for Canvas phase (theme, purpose, channel)
ALTER TABLE public.boards
  ADD COLUMN theme TEXT DEFAULT NULL,
  ADD COLUMN purpose TEXT DEFAULT NULL,
  ADD COLUMN channel TEXT DEFAULT NULL;

COMMENT ON COLUMN public.boards.theme IS 'Visual theme for canvas rendering (e.g., chalkboard, clean). Reserved for Canvas phase.';
COMMENT ON COLUMN public.boards.purpose IS 'Board purpose (promo, guide, training, internal). Reserved for Canvas phase.';
COMMENT ON COLUMN public.boards.channel IS 'Target channel (tv, pos, kiosk, web). Reserved for Canvas phase.';
```

### Step 2: Migration - Prepare for images

```sql
-- Migration: add_image_support

-- Add 'image' to board_item_type enum
ALTER TYPE board_item_type ADD VALUE IF NOT EXISTS 'image';

-- Add asset_id column to board_items for image items
ALTER TABLE public.board_items 
  ADD COLUMN asset_id UUID DEFAULT NULL;

COMMENT ON COLUMN public.board_items.asset_id IS 'Reference to media_assets for image-type items. Reserved for Session 08b.';

-- Add image support to picks (custom uploaded images)
ALTER TABLE public.picks 
  ADD COLUMN image_asset_id UUID DEFAULT NULL;

COMMENT ON COLUMN public.picks.image_asset_id IS 'Custom uploaded image for this pick. If NULL and linked to product, inherits product image.';
```

### Step 3: Fix attribution display in BoardCanvas

Update `src/components/boards/BoardCanvas.tsx` to pass attribution data to CanvasPickCard:

```typescript
// In renderItem() for pick-type items, after getting the pick:

// Determine attribution for CanvasPickCard
const attribution = item.attribution_style 
  ? { 
      budtenderName: pick.budtenders?.name || 'Unknown', 
      style: item.attribution_style as 'prominent' | 'subtle' 
    }
  : undefined;

return (
  <CanvasPickCard
    key={item.id}
    itemId={mode === 'edit' ? item.id : undefined}
    pick={pick}
    mode={mode === 'display' ? 'display' : 'canvas'}
    onClick={() => onItemClick?.(item)}
    onRemove={mode === 'edit' && onRemoveItem ? () => onRemoveItem(item) : undefined}
    attribution={attribution}  // ADD THIS
  />
);
```

Also update picks loading in `BoardEditorView.tsx` to join budtenders:

```typescript
// When loading picks, ensure budtender name is included
const pickData = await getAllPicksByIds(pickIds);
// The picks should already have budtenders joined via the API
```

### Step 4: Add permission check in BoardEditorView

```typescript
// In BoardEditorView.tsx, after loading board and profile:

// Determine if current user can edit this board
const canEdit = useMemo(() => {
  if (!board || !profile) return false;
  // Owner can always edit their boards
  if (board.owner_user_id === profile.id) return true;
  // Managers can edit any custom board
  if (profile.role === 'manager') return true;
  return false;
}, [board, profile]);

// Use canEdit to conditionally render edit controls:
// - "Add pick" button
// - "Add text" button  
// - Name editing input
// - Status toggle button
// - Remove buttons on cards
```

### Step 5: Create AddTextDialog

Create `src/components/boards/AddTextDialog.tsx`:

```typescript
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type AddTextDialogProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (content: string, variant: 'heading' | 'body') => void;
};

export function AddTextDialog({ open, onClose, onAdd }: AddTextDialogProps) {
  const [content, setContent] = useState('');
  const [variant, setVariant] = useState<'heading' | 'body'>('heading');

  const handleSubmit = () => {
    if (content.trim()) {
      onAdd(content.trim(), variant);
      setContent('');
      setVariant('heading');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add text block</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Style</Label>
            <div className="space-y-2">
              <div 
                className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer ${variant === 'heading' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setVariant('heading')}
              >
                <div className={`h-4 w-4 rounded-full border border-primary flex items-center justify-center ${variant === 'heading' ? 'bg-primary' : ''}`}>
                  {variant === 'heading' && <div className="h-2 w-2 rounded-full bg-white" />}
                </div>
                <Label className="flex-1 cursor-pointer font-normal">
                  Heading (large, bold)
                </Label>
              </div>
              <div 
                className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer ${variant === 'body' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setVariant('body')}
              >
                <div className={`h-4 w-4 rounded-full border border-primary flex items-center justify-center ${variant === 'body' ? 'bg-primary' : ''}`}>
                  {variant === 'body' && <div className="h-2 w-2 rounded-full bg-white" />}
                </div>
                <Label className="flex-1 cursor-pointer font-normal">
                  Body text (smaller, regular)
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            {variant === 'heading' ? (
              <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Section title..."
              />
            ) : (
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Add a note or description..."
                rows={3}
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!content.trim()}>
            Add text
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Step 6: Make CanvasTextBlock editable

Update `src/components/boards/CanvasTextBlock.tsx` to support inline editing:

```typescript
import { useState, useRef, useEffect } from 'react';
import { X, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type CanvasTextBlockProps = {
  content: string;
  variant?: 'heading' | 'body';
  itemId?: string;  // For sortable
  mode?: 'edit' | 'display';
  onUpdate?: (content: string) => void;
  onRemove?: () => void;
  onClick?: () => void;
};

export function CanvasTextBlock({ 
  content, 
  variant = 'body',
  itemId,
  mode = 'edit',
  onUpdate,
  onRemove,
  onClick,
}: CanvasTextBlockProps) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  
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

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  useEffect(() => {
    setEditContent(content);
  }, [content]);

  const handleSave = () => {
    if (editContent.trim() && editContent !== content) {
      onUpdate?.(editContent.trim());
    }
    setEditing(false);
  };

  const className = variant === 'heading' 
    ? 'text-xl font-semibold text-foreground'
    : 'text-sm text-muted-foreground';

  const isEditable = mode === 'edit';

  if (editing && isEditable) {
    return (
      <div 
        ref={isDraggable ? setNodeRef : undefined}
        style={style}
        className="p-2 relative group"
      >
        {variant === 'heading' ? (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className={`${className} w-full bg-transparent border-b border-primary focus:outline-none`}
          />
        ) : (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onBlur={handleSave}
            className={`${className} w-full bg-transparent border border-primary rounded p-1 focus:outline-none resize-none`}
            rows={2}
          />
        )}
      </div>
    );
  }

  return (
    <div 
      ref={isDraggable ? setNodeRef : undefined}
      style={style}
      className={`
        p-2 relative group 
        ${isEditable ? 'cursor-pointer hover:bg-accent/50 rounded' : ''}
        ${isDragging ? 'ring-2 ring-primary' : ''}
      `}
      onClick={() => {
        if (isEditable) {
          setEditing(true);
        }
        onClick?.();
      }}
    >
      {isDraggable && (
        <button
          {...attributes}
          {...listeners}
          className="
            absolute top-1 right-1 p-1 
            text-muted-foreground hover:text-foreground 
            cursor-grab active:cursor-grabbing
            rounded hover:bg-muted/50
            opacity-0 group-hover:opacity-100 transition-opacity
          "
          style={{ touchAction: 'none' }}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={14} />
        </button>
      )}
      <p className={className}>{content}</p>
      {isEditable && onRemove && (
        <button
          className="absolute top-1 right-7 p-1 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
```

### Step 7: Board CRUD API helpers

Add to `src/lib/api/boards.ts`:

```typescript
/**
 * Create a new custom board
 */
export async function createBoard(name: string, ownerId: string, description?: string): Promise<Board | null> {
  const { data, error } = await supabase
    .from('boards')
    .insert({
      name,
      type: 'custom',
      owner_user_id: ownerId,
      description,
      status: 'unpublished',
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating board:', error);
    return null;
  }
  
  return data;
}

/**
 * Delete a board (custom only)
 */
export async function deleteBoard(boardId: string): Promise<boolean> {
  const { error } = await supabase
    .from('boards')
    .delete()
    .eq('id', boardId)
    .eq('type', 'custom');  // Safety: only delete custom boards
  
  if (error) {
    console.error('Error deleting board:', error);
    return false;
  }
  
  return true;
}

/**
 * Duplicate a board with all its items
 */
export async function duplicateBoard(boardId: string, newName: string, ownerId: string): Promise<Board | null> {
  // Get original board
  const original = await getBoardById(boardId);
  if (!original) return null;
  
  // Create new board
  const newBoard = await createBoard(newName, ownerId, original.description);
  if (!newBoard) return null;
  
  // Copy board items
  const items = await getBoardItems(boardId);
  if (items.length > 0) {
    const newItems = items.map(item => ({
      board_id: newBoard.id,
      type: item.type,
      pick_id: item.pick_id,
      text_content: item.text_content,
      position_x: item.position_x,
      position_y: item.position_y,
      sort_index: item.sort_index,
      layout_variant: item.layout_variant,
      attribution_style: item.attribution_style,
      asset_id: item.asset_id,
    }));
    
    await supabase.from('board_items').insert(newItems);
  }
  
  return newBoard;
}

/**
 * Add a text block to a board
 */
export async function addTextToBoard(boardId: string, content: string, variant: string = 'body'): Promise<BoardItem | null> {
  const { data: existing } = await supabase
    .from('board_items')
    .select('sort_index')
    .eq('board_id', boardId)
    .order('sort_index', { ascending: false })
    .limit(1);
  
  const nextSortIndex = existing && existing.length > 0 ? (existing[0].sort_index ?? 0) + 1 : 0;
  
  const { data, error } = await supabase
    .from('board_items')
    .insert({
      board_id: boardId,
      type: 'text',
      text_content: content,
      sort_index: nextSortIndex,
      layout_variant: variant,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding text to board:', error);
    return null;
  }
  
  return data;
}

/**
 * Update a text block's content
 */
export async function updateTextBlock(itemId: string, content: string): Promise<boolean> {
  const { error } = await supabase
    .from('board_items')
    .update({ text_content: content, updated_at: new Date().toISOString() })
    .eq('id', itemId);
  
  if (error) {
    console.error('Error updating text block:', error);
    return false;
  }
  
  return true;
}
```

### Step 8: Create NewBoardDialog

Create `src/components/boards/NewBoardDialog.tsx`:

```typescript
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type NewBoardDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string) => void;
};

export function NewBoardDialog({ open, onClose, onCreate }: NewBoardDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (name.trim()) {
      onCreate(name.trim(), description.trim() || undefined);
      setName('');
      setDescription('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new board</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Board name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Sleep & Recovery"
            />
          </div>

          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this board for?"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            Create board
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Step 9: Regenerate TypeScript types

```bash
npx supabase gen types typescript --project-id <project-id> > src/types/database.ts
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| Migration: `add_board_future_columns` | Create via MCP |
| Migration: `add_image_support` | Create via MCP |
| `src/components/boards/AddTextDialog.tsx` | Create |
| `src/components/boards/NewBoardDialog.tsx` | Create |
| `src/components/boards/CanvasTextBlock.tsx` | Update with editing |
| `src/components/boards/BoardCanvas.tsx` | Fix attribution display |
| `src/lib/api/boards.ts` | Add CRUD helpers |
| `src/views/BoardsHomeView.tsx` | Add new board button |
| `src/views/BoardEditorView.tsx` | Add permission check, text button, delete menu |
| `src/types/database.ts` | Regenerate |

---

## Canonical Docs to Update

- [ ] `docs/guidelight_ux_docs_bundle_vNEXT/04_USER_FLOWS_STAFF_AND_BOARDS.md` - Mark custom board CRUD as "Implemented"

---

## Post-Session Documentation

- [ ] Update `SESSION_LOG.md` with completion status
- [ ] Test attribution display on boards with other users' picks
- [ ] Test permission check (only owner/manager can edit)
- [ ] Test creating new boards
- [ ] Test adding text blocks
- [ ] Test deleting/duplicating boards
- [ ] Run `npm run build` to confirm no errors

---

## Rollback Plan

If issues occur:
1. Revert migrations (remove columns if needed)
2. Remove new dialog components
3. Revert API helper additions
4. Revert view changes

---

## Next Session

→ **Session 08a: Asset/Media Library**

