# Session 06: Board Canvas - Drag & Drop

---
**Session Metadata**

| Field | Value |
|-------|-------|
| **Phase** | 2 - Boards Core |
| **Estimated Duration** | 3 hours |
| **Prerequisites** | Session 05 completed |
| **Output** | Drag-drop functionality, position persistence, board toolbar |

---

## Pre-Session Checklist

- [ ] Session 05 completed successfully
- [ ] BoardEditorView and BoardCanvas exist
- [ ] Read `docs/guidelight_ux_docs_bundle_vNEXT/18_BOARDS_CANVAS_ADD_AND_EDIT_FLOW.md`
- [ ] Verify board_items table has position_x, position_y, sort_index columns

---

## Session Goals

1. Install @dnd-kit for drag-drop
2. Add drag handles to CanvasPickCard
3. Implement drag-drop on BoardCanvas
4. Persist positions (debounced autosave)
5. Add board toolbar (name edit, status toggle)

---

## Design Constraint

**Drag handles should be minimal:**
- Small drag icon in card corner
- Only visible in edit mode
- Match existing icon sizes and colors

---

## Layout Approach: Grid with sort_index (not freeform)

**Important clarification:**

The `board_items` table has `position_x` and `position_y` columns (for future freeform canvas support), but **this implementation uses CSS Grid with `sort_index` only**.

| Column | Usage in This Session |
|--------|----------------------|
| `sort_index` | ✅ Used - determines item order in grid |
| `position_x` | ❌ Unused - reserved for future freeform layouts |
| `position_y` | ❌ Unused - reserved for future freeform layouts |

**Why Grid?**
- Simpler implementation for MVP
- Better responsive behavior
- Works naturally with CSS Grid's auto-placement
- `sort_index` provides deterministic ordering

**Rule:** All ordering logic in this session uses `sort_index`. Do not read/write `position_x`/`position_y`.

---

## Mobile Touch Support

**Critical for mobile drag-drop:**

`@dnd-kit` requires specific configuration for mobile:

1. **Add `TouchSensor`** to the sensors array
2. **Add `touch-action: none`** CSS to draggable elements (prevents scroll-on-drag conflict)
3. Use appropriate activation constraints to distinguish tap from drag

Without `touch-action: none`, scrolling the page on mobile will accidentally trigger drag events.

---

## Acceptance Criteria

- [ ] Cards can be dragged and reordered
- [ ] `sort_index` persists after drag (autosaved)
- [ ] Drag indicator shows during drag
- [ ] **Mobile: Touch-drag works without triggering scroll**
- [ ] **Mobile: Tap still opens card (not drag)**
- [ ] Board name is editable inline
- [ ] Status toggle (publish/unpublish) works
- [ ] Autosave indicator shows "Saving..." / "Saved"
- [ ] No errors in `npm run build`

---

## Implementation Steps

### Step 1: Install @dnd-kit

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Step 2: Update CanvasPickCard with drag handle

```typescript
// Add to CanvasPickCard.tsx
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

type CanvasPickCardProps = {
  pick: Pick;
  itemId: string;  // board_item id for sortable
  mode?: 'canvas' | 'display';
  onEdit?: () => void;
};

export function CanvasPickCard({ pick, itemId, mode = 'canvas', onEdit }: CanvasPickCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: itemId });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  
  const isCanvas = mode === 'canvas';
  
  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={`
        p-4 relative
        ${isCanvas ? 'cursor-pointer hover:ring-2 hover:ring-primary/20' : ''}
        ${isDragging ? 'ring-2 ring-primary shadow-lg' : ''}
        bg-card
      `}
      onClick={onEdit}
    >
      {/* Drag handle - only in canvas mode */}
      {isCanvas && (
        <button
          {...attributes}
          {...listeners}
          className="
            absolute top-2 right-2 p-1 
            text-muted-foreground hover:text-foreground 
            cursor-grab active:cursor-grabbing
            touch-action-none
          "
          style={{ touchAction: 'none' }}  /* CRITICAL: Prevents scroll-on-drag on mobile */
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={16} />
        </button>
      )}
      
      {/* Rest of card content... */}
    </Card>
  );
}
```

### Step 3: Update BoardCanvas with DndContext

```typescript
// BoardCanvas.tsx
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,  // CRITICAL: Required for mobile drag support
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

type BoardCanvasProps = {
  items: BoardItem[];
  picks: Pick[];
  mode?: 'edit' | 'display';
  onReorder?: (items: BoardItem[]) => void;
  onItemClick?: (item: BoardItem) => void;
};

export function BoardCanvas({ items, picks, mode = 'edit', onReorder, onItemClick }: BoardCanvasProps) {
  // IMPORTANT: Include TouchSensor for mobile support
  // Distance constraint helps distinguish tap from drag intent
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,     // Prevent accidental drags - must hold 200ms
        tolerance: 5,   // Allow slight movement during delay
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const picksMap = new Map(picks.map(p => [p.id, p]));
  const sortedItems = [...items].sort((a, b) => a.sort_index - b.sort_index);
  
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = sortedItems.findIndex(i => i.id === active.id);
      const newIndex = sortedItems.findIndex(i => i.id === over.id);
      
      const newItems = arrayMove(sortedItems, oldIndex, newIndex).map((item, index) => ({
        ...item,
        sort_index: index,
      }));
      
      onReorder?.(newItems);
    }
  }
  
  if (mode === 'display') {
    // Read-only mode - no drag
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* ... render items without drag */}
      </div>
    );
  }
  
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={sortedItems.map(i => i.id)} strategy={rectSortingStrategy}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedItems.map(item => {
            if (item.type === 'pick' && item.pick_id) {
              const pick = picksMap.get(item.pick_id);
              if (!pick) return null;
              
              return (
                <CanvasPickCard
                  key={item.id}
                  itemId={item.id}
                  pick={pick}
                  mode="canvas"
                  onEdit={() => onItemClick?.(item)}
                />
              );
            }
            // ... text blocks
            return null;
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
```

### Step 4: Add autosave to BoardEditorView

```typescript
// Add to BoardEditorView.tsx
import { useCallback, useRef } from 'react';
import { updateBoardItemsOrder } from '@/lib/api/boards';

// In the component:
const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
const saveTimeoutRef = useRef<NodeJS.Timeout>();

const handleReorder = useCallback(async (newItems: BoardItem[]) => {
  // Optimistically update local state
  setItems(newItems);
  setSaveStatus('saving');
  
  // Debounce save to avoid hammering the API during rapid drags
  if (saveTimeoutRef.current) {
    clearTimeout(saveTimeoutRef.current);
  }
  
  saveTimeoutRef.current = setTimeout(async () => {
    // Only updates sort_index - position_x/position_y unused in grid layout
    await updateBoardItemsOrder(boardId!, newItems);
    setSaveStatus('saved');
    
    // Reset to idle after 2s
    setTimeout(() => setSaveStatus('idle'), 2000);
  }, 500);
}, [boardId]);
```

### Step 5: Add board toolbar

```typescript
// Add to BoardEditorView header:
<div className="flex items-center gap-4">
  {/* Editable board name */}
  <input
    type="text"
    value={board.name}
    onChange={(e) => handleNameChange(e.target.value)}
    className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-2"
  />
  
  {/* Status toggle */}
  <Button
    variant={board.status === 'published' ? 'default' : 'outline'}
    size="sm"
    onClick={handleToggleStatus}
  >
    {board.status === 'published' ? 'Published' : 'Publish'}
  </Button>
  
  {/* Save status */}
  {saveStatus !== 'idle' && (
    <span className="text-sm text-muted-foreground">
      {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
    </span>
  )}
</div>
```

---

## API Helpers to Add

Add to `src/lib/api/boards.ts`:

```typescript
/**
 * Update board items sort order.
 * 
 * NOTE: Only updates sort_index. position_x/position_y columns exist in DB
 * but are reserved for future freeform canvas layouts - not used in this implementation.
 */
export async function updateBoardItemsOrder(boardId: string, items: BoardItem[]): Promise<boolean> {
  // Only update sort_index - we're using CSS Grid, not freeform positions
  const updates = items.map((item, index) => ({
    id: item.id,
    board_id: boardId,
    sort_index: index,
    // NOTE: Do NOT update position_x, position_y - unused in grid layout
  }));
  
  const { error } = await supabase
    .from('board_items')
    .upsert(updates, { onConflict: 'id' });
  
  if (error) {
    console.error('Error updating board items order:', error);
    return false;
  }
  
  return true;
}

/**
 * Update board metadata (name, status)
 */
export async function updateBoard(boardId: string, updates: Partial<Board>): Promise<Board | null> {
  const { data, error } = await supabase
    .from('boards')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', boardId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating board:', error);
    return null;
  }
  
  return data;
}
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `package.json` | Add @dnd-kit dependencies |
| `src/components/boards/CanvasPickCard.tsx` | Add drag handle with `touch-action: none` |
| `src/components/boards/BoardCanvas.tsx` | Add DndContext with TouchSensor |
| `src/views/BoardEditorView.tsx` | Add autosave, toolbar |
| `src/lib/api/boards.ts` | Add updateBoardItemsOrder (sort_index only), updateBoard |

---

## Canonical Docs to Update

- [ ] `docs/guidelight_ux_docs_bundle_vNEXT/18_BOARDS_CANVAS_ADD_AND_EDIT_FLOW.md` - Mark drag-drop as "Implemented"

---

## Post-Session Documentation

- [ ] Update `SESSION_LOG.md` with completion status
- [ ] Test drag-drop on desktop (mouse)
- [ ] **Test drag-drop on mobile/tablet (touch)** - verify no scroll interference
- [ ] **Test tap-to-edit on mobile** - verify tap doesn't trigger drag
- [ ] Verify autosave persists `sort_index` correctly
- [ ] Run `npm run build` to confirm no errors

---

## Rollback Plan

If issues occur:
1. `npm uninstall @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
2. Revert component changes to Session 05 state

---

## Next Session

→ **Session 07: Add Pick to Board**

