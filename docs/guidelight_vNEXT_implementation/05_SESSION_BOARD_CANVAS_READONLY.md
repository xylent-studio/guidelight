# Session 05: Board Canvas - Read Only

---
**Session Metadata**

| Field | Value |
|-------|-------|
| **Phase** | 2 - Boards Core |
| **Estimated Duration** | 3 hours |
| **Prerequisites** | Session 04 completed |
| **Output** | BoardEditorView, BoardCanvas, CanvasPickCard, CanvasTextBlock |

---

## Pre-Session Checklist

- [ ] Session 04 completed successfully
- [ ] `/boards` route works
- [ ] `getBoardById()` and `getBoardItems()` API helpers exist
- [ ] Read `docs/guidelight_ux_docs_bundle_vNEXT/07_UI_PATTERNS_AND_COMPONENTS.md` Section D
- [ ] Read existing `BudtenderBoard.tsx` and pick card components

---

## Session Goals

1. Create `BoardEditorView.tsx` (read-only first)
2. Create `BoardCanvas.tsx` component
3. Create `CanvasPickCard.tsx` as variant of existing pick card
4. Create `CanvasTextBlock.tsx`
5. Add `/boards/:boardId` route

---

## Design Constraint

**CanvasPickCard is a VARIANT of existing pick card:**
- Start from `MyPickCard.tsx` or `GuestPickCard.tsx`
- Add `mode="canvas"` prop for canvas-specific styling
- Minimal extra chrome (no drag handles yet - that's Session 06)
- Same typography, colors, spacing as existing cards

---

## Critical Edge Case: Archived/Inactive Picks on Boards

**Problem:** A pick can be added to a custom board, then later archived (`status = 'archived'`) or soft-deleted (`is_active = false`). The `board_item` row still exists with a valid `pick_id` FK.

**Consequences if not handled:**
- Inner join returns no row for that pick → pick data is `null`/`undefined`
- Attempting to render `pick.product_name` crashes or shows empty card
- Board layout breaks with orphaned items

**Solution (defense in depth):**

1. **Query level:** When loading picks for board items, filter by `status = 'published' AND is_active = true`
2. **Render level:** Defensive check in BoardCanvas - skip items where pick is missing or not published
3. **Staff mode:** In edit mode, optionally show a warning placeholder for stale items

**Query rule:** For customer-facing views (Display Mode), ALWAYS filter picks by `status = 'published' AND is_active = true`.

---

## Acceptance Criteria

- [ ] `/boards/:boardId` route works
- [ ] BoardEditorView loads board and items
- [ ] BoardCanvas renders items at their positions
- [ ] CanvasPickCard displays pick info (reusing existing card patterns)
- [ ] CanvasTextBlock displays text content
- [ ] Auto boards show computed content (picks query)
- [ ] Custom boards show board_items content
- [ ] **Archived/inactive picks gracefully hidden in display mode**
- [ ] **Stale pick items show warning placeholder in edit mode**
- [ ] No drag functionality yet (read-only)
- [ ] No errors in `npm run build`

---

## Implementation Steps

### Step 1: Create CanvasPickCard (with attribution support)

Create `src/components/boards/CanvasPickCard.tsx`:

```typescript
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, User } from 'lucide-react';
import { Pick } from '@/lib/api/picks';

type AttributionStyle = 'prominent' | 'subtle' | null;

type CanvasPickCardProps = {
  pick: Pick;
  mode?: 'canvas' | 'display';
  onClick?: () => void;
  // Attribution for picks from other budtenders (Q1 answer)
  attribution?: {
    budtenderName: string;
    style: AttributionStyle;
  };
};

export function CanvasPickCard({ pick, mode = 'canvas', onClick, attribution }: CanvasPickCardProps) {
  // Reuse the same visual patterns as existing pick cards
  const isCanvas = mode === 'canvas';
  
  return (
    <Card 
      className={`
        p-4 
        ${isCanvas ? 'cursor-pointer hover:ring-2 hover:ring-primary/20' : ''}
        bg-card
      `}
      onClick={onClick}
    >
      {/* Prominent attribution (header style) */}
      {attribution?.style === 'prominent' && (
        <div className="flex items-center gap-1.5 text-sm text-primary mb-2 pb-2 border-b">
          <User size={14} />
          <span className="font-medium">{attribution.budtenderName}'s Pick</span>
        </div>
      )}
      
      {/* Product name and brand */}
      <div className="mb-2">
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
            <Star size={14} className="fill-star-filled text-star-filled" />
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
        )}
      </div>
    </Card>
  );
}
```

### Step 2: Create CanvasTextBlock

Create `src/components/boards/CanvasTextBlock.tsx`:

```typescript
type CanvasTextBlockProps = {
  content: string;
  variant?: 'heading' | 'body';
  onClick?: () => void;
};

export function CanvasTextBlock({ content, variant = 'body', onClick }: CanvasTextBlockProps) {
  const className = variant === 'heading' 
    ? 'text-xl font-semibold text-foreground'
    : 'text-sm text-muted-foreground';
  
  return (
    <div 
      className={`p-2 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <p className={className}>{content}</p>
    </div>
  );
}
```

### Step 3: Create StalePickPlaceholder (for edit mode)

Create `src/components/boards/StalePickPlaceholder.tsx`:

```typescript
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
export function StalePickPlaceholder({ pickId, onRemove }: StalePickPlaceholderProps) {
  return (
    <Card className="p-4 border-dashed border-warning bg-warning/5">
      <div className="flex items-start gap-3">
        <AlertTriangle size={20} className="text-warning flex-shrink-0 mt-0.5" />
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
```

### Step 4: Create BoardCanvas

Create `src/components/boards/BoardCanvas.tsx`:

```typescript
import { BoardItem } from '@/lib/api/boards';
import { Pick } from '@/lib/api/picks';
import { CanvasPickCard } from './CanvasPickCard';
import { CanvasTextBlock } from './CanvasTextBlock';
import { StalePickPlaceholder } from './StalePickPlaceholder';

type BoardCanvasProps = {
  items: BoardItem[];
  picks: Pick[];  // Picks data for pick-type items (already filtered by status/is_active)
  mode?: 'edit' | 'display';
  onItemClick?: (item: BoardItem) => void;
  onRemoveItem?: (item: BoardItem) => void;  // For removing stale items
};

export function BoardCanvas({ 
  items, 
  picks, 
  mode = 'edit', 
  onItemClick,
  onRemoveItem,
}: BoardCanvasProps) {
  // Create a map of pick_id to Pick for quick lookup
  const picksMap = new Map(picks.map(p => [p.id, p]));
  
  // Sort items by sort_index for consistent ordering
  const sortedItems = [...items].sort((a, b) => a.sort_index - b.sort_index);
  
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sortedItems.map(item => {
        // Handle pick-type items
        if (item.type === 'pick' && item.pick_id) {
          const pick = picksMap.get(item.pick_id);
          
          // CRITICAL: Handle archived/inactive/missing picks
          // The pick may be missing from picksMap if:
          // - It was archived (status !== 'published')
          // - It was soft-deleted (is_active = false)
          // - It was hard-deleted (pick row no longer exists)
          if (!pick) {
            // In display mode: silently skip - customers should never see stale items
            if (mode === 'display') {
              return null;
            }
            // In edit mode: show warning placeholder so staff can clean up
            return (
              <StalePickPlaceholder
                key={item.id}
                pickId={item.pick_id}
                onRemove={onRemoveItem ? () => onRemoveItem(item) : undefined}
              />
            );
          }
          
          // Additional safety check: verify pick is actually published
          // (This is belt-and-suspenders since query should already filter)
          if (mode === 'display' && pick.status !== 'published') {
            return null;
          }
          
          return (
            <CanvasPickCard
              key={item.id}
              pick={pick}
              mode={mode === 'display' ? 'display' : 'canvas'}
              onClick={() => onItemClick?.(item)}
            />
          );
        }
        
        // Handle text-type items
        if (item.type === 'text' && item.text_content) {
          return (
            <CanvasTextBlock
              key={item.id}
              content={item.text_content}
              onClick={() => onItemClick?.(item)}
            />
          );
        }
        
        // Unknown item type - skip
        return null;
      })}
    </div>
  );
}
```

### Step 5: Add API helper to fetch visible picks by IDs

Add to `src/lib/api/picks.ts`:

```typescript
/**
 * Get picks by IDs, filtered to only visible (published + active) picks.
 * Used for loading pick data for board items.
 * 
 * IMPORTANT: This filters out archived/inactive picks. The board canvas
 * must handle the case where some pick_ids don't return data (stale items).
 */
export async function getVisiblePicksByIds(pickIds: string[]): Promise<Pick[]> {
  if (pickIds.length === 0) return [];
  
  const { data, error } = await supabase
    .from('picks')
    .select('*')
    .in('id', pickIds)
    .eq('status', 'published')  // Only published picks
    .eq('is_active', true);      // Only active picks
  
  if (error) {
    console.error('Error fetching picks by IDs:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get ALL picks by IDs (including archived/inactive) - for staff edit mode.
 * Returns null for picks that have been hard-deleted.
 */
export async function getAllPicksByIds(pickIds: string[]): Promise<Pick[]> {
  if (pickIds.length === 0) return [];
  
  const { data, error } = await supabase
    .from('picks')
    .select('*')
    .in('id', pickIds)
    .eq('is_active', true);  // Still filter soft-deleted
  
  if (error) {
    console.error('Error fetching picks by IDs:', error);
    return [];
  }
  
  return data || [];
}
```

### Step 6: Create BoardEditorView

Create `src/views/BoardEditorView.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HeaderBar } from '@/components/ui/HeaderBar';
import { BoardCanvas } from '@/components/boards/BoardCanvas';
import { CanvasPickCard } from '@/components/boards/CanvasPickCard';
import { getBoardById, getBoardItems, removeBoardItem, Board, BoardItem } from '@/lib/api/boards';
import { getVisiblePicksByIds, getAllPicksByIds, Pick } from '@/lib/api/picks';

export function BoardEditorView() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  
  const [board, setBoard] = useState<Board | null>(null);
  const [items, setItems] = useState<BoardItem[]>([]);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBoard() {
      if (!boardId) return;
      
      setLoading(true);
      
      const boardData = await getBoardById(boardId);
      if (!boardData) {
        navigate('/boards');
        return;
      }
      setBoard(boardData);
      
      // For auto boards, content is computed (all published picks)
      // For custom boards, load board_items
      if (boardData.type === 'auto_store' || boardData.type === 'auto_user') {
        // Load all active picks for auto boards
        const allPicks = await loadAutoboardPicks(boardData);
        setPicks(allPicks);
        // Auto boards don't use board_items - picks ARE the content
        setItems([]);
      } else {
        // Custom board - load items
        const itemsData = await getBoardItems(boardId);
        setItems(itemsData);
        
        // Load pick data for pick-type items
        // In edit mode, we want to see ALL picks (including archived) so
        // staff can see which items are stale and clean them up
        const pickIds = itemsData
          .filter(i => i.type === 'pick' && i.pick_id)
          .map(i => i.pick_id!);
        
        if (pickIds.length > 0) {
          // For edit mode: get all picks (will show stale placeholders for missing)
          const pickData = await getAllPicksByIds(pickIds);
          setPicks(pickData);
        }
      }
      
      setLoading(false);
    }
    
    loadBoard();
  }, [boardId, navigate]);

  // Handle removing stale board items
  const handleRemoveStaleItem = async (item: BoardItem) => {
    const success = await removeBoardItem(item.id);
    if (success) {
      setItems(items.filter(i => i.id !== item.id));
    }
  };

  if (loading || !board) {
    return <div className="p-8">Loading...</div>;
  }

  const isAutoBoard = board.type === 'auto_store' || board.type === 'auto_user';

  return (
    <div className="min-h-screen bg-background">
      <HeaderBar
        leftContent={
          <Button variant="ghost" size="sm" onClick={() => navigate('/boards')}>
            <ArrowLeft size={18} className="mr-2" />
            Boards
          </Button>
        }
        title={board.name}
        rightContent={
          <Badge variant={board.status === 'published' ? 'default' : 'secondary'}>
            {board.status === 'published' ? 'Published' : 'Draft'}
          </Badge>
        }
      />
      
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {board.description && (
          <p className="text-muted-foreground mb-6">{board.description}</p>
        )}
        
        {isAutoBoard ? (
          // Auto board: show picks directly (already filtered to published/active)
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {picks.map(pick => (
              <CanvasPickCard key={pick.id} pick={pick} mode="canvas" />
            ))}
          </div>
        ) : (
          // Custom board: show board items with stale handling
          <BoardCanvas
            items={items}
            picks={picks}
            mode="edit"
            onRemoveItem={handleRemoveStaleItem}
          />
        )}
        
        {!isAutoBoard && items.length === 0 && (
          <div className="text-center py-12 border border-dashed rounded-lg">
            <p className="text-muted-foreground">This board is empty</p>
            <p className="text-sm text-muted-foreground mt-2">
              Use Add pick to add recommendations
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

// Helper to load picks for auto boards
async function loadAutoboardPicks(board: Board): Promise<Pick[]> {
  // TODO: Implement proper loading based on board type
  // For now, return empty - will be implemented with picks API updates
  return [];
}
```

### Step 7: Add route to App.tsx

```typescript
import { BoardEditorView } from './views/BoardEditorView';

// Add route:
<Route 
  path="/boards/:boardId" 
  element={
    <ProtectedRoute>
      <BoardEditorView />
    </ProtectedRoute>
  } 
/>
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/boards/CanvasPickCard.tsx` | Create |
| `src/components/boards/CanvasTextBlock.tsx` | Create |
| `src/components/boards/StalePickPlaceholder.tsx` | Create (handles archived picks) |
| `src/components/boards/BoardCanvas.tsx` | Create (with defensive rendering) |
| `src/views/BoardEditorView.tsx` | Create |
| `src/lib/api/picks.ts` | Add `getVisiblePicksByIds()`, `getAllPicksByIds()` |
| `src/App.tsx` | Add /boards/:boardId route |

---

## Canonical Docs to Update

- [ ] `docs/ARCHITECTURE_OVERVIEW.md` - Add /boards/:boardId route
- [ ] `docs/guidelight_ux_docs_bundle_vNEXT/07_UI_PATTERNS_AND_COMPONENTS.md` - Mark Board Canvas as "Partial"

---

## Post-Session Documentation

- [ ] Update `SESSION_LOG.md` with completion status
- [ ] Test navigation from Boards Home to Board Editor
- [ ] Verify canvas renders items correctly
- [ ] Run `npm run build` to confirm no errors

---

## Rollback Plan

If issues occur:
1. Remove route from App.tsx
2. Delete new component files
3. Revert to Session 04 state

---

## Next Session

→ **Session 06: Board Canvas - Drag & Drop**

