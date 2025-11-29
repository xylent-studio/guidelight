# Session 13: Display Mode Board Support

---
**Session Metadata**

| Field | Value |
|-------|-------|
| **Phase** | 4 - Display Mode Enhancement |
| **Estimated Duration** | 2-3 hours |
| **Prerequisites** | Session 12 completed |
| **Output** | Display Mode shows boards, /display/:boardId route |

---

## Pre-Session Checklist

- [ ] Session 12 completed successfully
- [ ] Boards exist in database (auto and custom)
- [ ] Read `docs/guidelight_ux_docs_bundle_vNEXT/05_USER_FLOWS_CUSTOMER_AND_DISPLAY.md`

---

## Session Goals

1. Refactor DisplayModeView to be board-based
2. Add `/display/:boardId` route
3. Show board content (picks or items)
4. Fall back to auto_store board by default

---

## Design

**Display Mode now shows a board:**
- URL: `/display` (default board) or `/display/:boardId` (specific board)
- Default board fallback order:
  1. Board ID from route
  2. `user_preferences.last_board_id` (later session)
  3. `auto_store` board (house list)

---

## Critical Edge Case: Archived/Inactive Picks on Boards

**Problem:** A pick on a custom board may be archived (`status = 'archived'`) or soft-deleted (`is_active = false`). The board_item still references it.

**Solution for Display Mode (customer-facing):**

1. **Query level:** Use `getVisiblePicksByIds()` which filters by `status = 'published' AND is_active = true`
2. **Render level:** Skip any board_item where the pick is not in the returned array
3. **No placeholder:** Customers should never see "unavailable" messages - just hide stale items silently

**Query rule:** Display Mode MUST filter picks by `status = 'published' AND is_active = true`.

---

## Acceptance Criteria

- [ ] `/display` shows default board (auto_store)
- [ ] `/display/:boardId` shows specific board
- [ ] Board header shows board name
- [ ] Auto boards show computed picks
- [ ] Custom boards show board_items
- [ ] **Archived/inactive picks silently hidden (no placeholder)**
- [ ] 404 if board not found
- [ ] No errors in `npm run build`

---

## Implementation Steps

### Step 1: Update DisplayModeView for board support

```typescript
// DisplayModeView.tsx - refactored
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBoardById, getBoardItems, getAutoStoreBoard, Board, BoardItem } from '@/lib/api/boards';
import { getPublishedPicks, getVisiblePicksByIds, getPublishedPicksForBudtender, Pick } from '@/lib/api/picks';
import { GuestPickCard } from '@/components/picks/GuestPickCard';

export function DisplayModeView() {
  const { boardId } = useParams<{ boardId?: string }>();
  
  const [board, setBoard] = useState<Board | null>(null);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [boardItems, setBoardItems] = useState<BoardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBoard() {
      setLoading(true);
      setError(null);
      
      let targetBoard: Board | null = null;
      
      if (boardId) {
        // Specific board requested
        targetBoard = await getBoardById(boardId);
        if (!targetBoard) {
          setError('Board not found');
          setLoading(false);
          return;
        }
      } else {
        // Default to auto_store board
        targetBoard = await getAutoStoreBoard();
        if (!targetBoard) {
          setError('No default board available');
          setLoading(false);
          return;
        }
      }
      
      setBoard(targetBoard);
      
      // Load content based on board type
      if (targetBoard.type === 'auto_store') {
        // House list: all published picks
        const allPicks = await getPublishedPicks();
        setPicks(allPicks);
        setBoardItems([]);
      } else if (targetBoard.type === 'auto_user') {
        // Budtender's picks
        const budtenderPicks = await getPublishedPicksForBudtender(targetBoard.owner_user_id!);
        setPicks(budtenderPicks);
        setBoardItems([]);
      } else {
        // Custom board: load items
        const items = await getBoardItems(targetBoard.id);
        setBoardItems(items);
        
        // Load picks for pick-type items
        // IMPORTANT: Use getVisiblePicksByIds to filter out archived/inactive picks
        // The render logic will silently skip items where the pick is not found
        const pickIds = items.filter(i => i.type === 'pick' && i.pick_id).map(i => i.pick_id!);
        const itemPicks = await getVisiblePicksByIds(pickIds);
        setPicks(itemPicks);
      }
      
      setLoading(false);
    }
    
    loadBoard();
  }, [boardId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  const isAutoBoard = board?.type === 'auto_store' || board?.type === 'auto_user';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b px-4 py-3">
        <h1 className="text-xl font-semibold">{board?.name}</h1>
        {board?.description && (
          <p className="text-sm text-muted-foreground mt-1">{board.description}</p>
        )}
      </header>
      
      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        {isAutoBoard ? (
          // Auto board: show picks directly
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {picks.map(pick => (
              <GuestPickCard key={pick.id} pick={pick} />
            ))}
          </div>
        ) : (
          // Custom board: show board items
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {boardItems.map(item => {
              if (item.type === 'pick' && item.pick_id) {
                const pick = picks.find(p => p.id === item.pick_id);
                
                // CRITICAL: Silently skip items where pick is archived/inactive/deleted
                // The pick won't be in the array because getVisiblePicksByIds filtered it
                // In Display Mode, customers should never see stale item placeholders
                if (!pick) return null;
                
                return <GuestPickCard key={item.id} pick={pick} />;
              }
              if (item.type === 'text' && item.text_content) {
                return (
                  <div key={item.id} className="p-4">
                    <p className={item.layout_variant === 'heading' ? 'text-xl font-semibold' : 'text-sm text-muted-foreground'}>
                      {item.text_content}
                    </p>
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}
        
        {picks.length === 0 && boardItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No picks on this board yet</p>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-2 text-center text-xs text-muted-foreground bg-background/80 backdrop-blur">
        Guidelight
      </footer>
    </div>
  );
}
```

### Step 2: Add route to App.tsx

```typescript
// Update App.tsx routes:
<Route path="/display" element={<DisplayModeView />} />
<Route path="/display/:boardId" element={<DisplayModeView />} />
```

### Step 3: Add API helpers

Add to `src/lib/api/picks.ts`:

```typescript
/**
 * Get all published picks (for house list)
 */
export async function getPublishedPicks(): Promise<Pick[]> {
  const { data, error } = await supabase
    .from('picks')
    .select('*, budtenders(name)')
    .eq('status', 'published')
    .eq('is_active', true)
    .order('rating', { ascending: false })
    .limit(24);
  
  if (error) {
    console.error('Error fetching published picks:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get published picks for a specific budtender
 */
export async function getPublishedPicksForBudtender(budtenderId: string): Promise<Pick[]> {
  const { data, error } = await supabase
    .from('picks')
    .select('*')
    .eq('budtender_id', budtenderId)
    .eq('status', 'published')
    .eq('is_active', true)
    .order('rating', { ascending: false });
  
  if (error) {
    console.error('Error fetching budtender picks:', error);
    return [];
  }
  
  return data || [];
}

// NOTE: getVisiblePicksByIds was added in Session 05.
// It filters by status = 'published' AND is_active = true.
// Use this for Display Mode to ensure archived picks are never shown.
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/views/DisplayModeView.tsx` | Refactor for boards |
| `src/App.tsx` | Add /display/:boardId route |
| `src/lib/api/picks.ts` | Add new query helpers |

---

## Canonical Docs to Update

- [ ] `docs/ARCHITECTURE_OVERVIEW.md` - Update /display routes
- [ ] `docs/guidelight_ux_docs_bundle_vNEXT/05_USER_FLOWS_CUSTOMER_AND_DISPLAY.md` - Mark board display as "Implemented"

---

## Post-Session Documentation

- [ ] Update `SESSION_LOG.md` with completion status
- [ ] Test /display shows auto_store board
- [ ] Test /display/:boardId shows specific board
- [ ] Run `npm run build` to confirm no errors

---

## Rollback Plan

If issues occur:
1. Revert DisplayModeView to previous implementation
2. Remove /display/:boardId route

---

## Next Session

→ **Session 14: Board Selector in Display**

