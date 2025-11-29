# Session 03: Auto Board Creation

---
**Session Metadata**

| Field | Value |
|-------|-------|
| **Phase** | 1 - Data Model Foundation |
| **Estimated Duration** | 2 hours |
| **Prerequisites** | Session 02 completed |
| **Output** | Auto boards created, trigger for new budtenders, API helpers |

---

## Pre-Session Checklist

- [ ] Session 02 completed successfully
- [ ] `boards` table exists with `type` enum
- [ ] `budtenders` table accessible
- [ ] Read `CONFLICTS_AND_DECISIONS.md` for auto board semantics

---

## Session Goals

1. Create the `auto_store` board (house list)
2. Create `auto_user` boards for all existing budtenders
3. Create trigger to auto-create `auto_user` board on new budtender
4. Create API helpers for boards

---

## Auto Board Semantics (from CONFLICTS_AND_DECISIONS.md)

- Auto boards ARE rows in `boards` table with `type` field
- `auto_store`: One house list board, `owner_user_id = NULL`
- `auto_user`: One per budtender, `owner_user_id = budtender.id`
- Auto board **content** is computed at render time (not stored in `board_items`)
- Content query: `picks WHERE is_active = true AND status = 'published'`

---

## Acceptance Criteria

- [ ] One `auto_store` board exists (name: "All Staff Picks")
- [ ] One `auto_user` board exists per active budtender
- [ ] Trigger creates `auto_user` board on new budtender insert
- [ ] API helpers work: `getBoards()`, `getBoardById()`, `getBoardItems()`
- [ ] No errors in `npm run build`

---

## Implementation Steps

### Step 1: Create auto_store board

```sql
-- Migration: create_auto_store_board

INSERT INTO public.boards (name, type, owner_user_id, description, status)
VALUES (
  'All Staff Picks',
  'auto_store',
  NULL,
  'Automatically shows all published picks from all staff.',
  'published'
);
```

### Step 2: Create auto_user boards for existing budtenders

```sql
-- Migration: create_auto_user_boards_for_existing

INSERT INTO public.boards (name, type, owner_user_id, description, status)
SELECT 
  name || '''s Picks' AS name,
  'auto_user' AS type,
  id AS owner_user_id,
  'Automatically shows all published picks from ' || name || '.' AS description,
  'published' AS status
FROM public.budtenders
WHERE is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM public.boards b 
    WHERE b.type = 'auto_user' AND b.owner_user_id = budtenders.id
  );
```

### Step 3: Create trigger for new budtenders

```sql
-- Migration: auto_user_board_trigger

CREATE OR REPLACE FUNCTION public.create_auto_user_board()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.boards (name, type, owner_user_id, description, status)
  VALUES (
    NEW.name || '''s Picks',
    'auto_user',
    NEW.id,
    'Automatically shows all published picks from ' || NEW.name || '.',
    'published'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_budtender_created
  AFTER INSERT ON public.budtenders
  FOR EACH ROW
  EXECUTE FUNCTION public.create_auto_user_board();

COMMENT ON FUNCTION public.create_auto_user_board IS 'Creates an auto_user board when a new budtender is created.';

-- Q2 ANSWER: Auto board name sync
-- When a budtender changes their name, update their auto_user board name
CREATE OR REPLACE FUNCTION public.sync_auto_user_board_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Only sync if name actually changed
  IF OLD.name IS DISTINCT FROM NEW.name THEN
    UPDATE public.boards
    SET 
      name = NEW.name || '''s Picks',
      description = 'Automatically shows all published picks from ' || NEW.name || '.',
      updated_at = now()
    WHERE type = 'auto_user' AND owner_user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_budtender_name_changed
  AFTER UPDATE OF name ON public.budtenders
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_auto_user_board_name();

COMMENT ON FUNCTION public.sync_auto_user_board_name IS 'Keeps auto_user board name in sync with budtender name.';
```

### Step 4: Create API helpers

Create `src/lib/api/boards.ts`:

```typescript
import { supabase } from '../supabaseClient';

export type Board = {
  id: string;
  name: string;
  type: 'auto_store' | 'auto_user' | 'custom';
  owner_user_id: string | null;
  description: string | null;
  status: 'published' | 'unpublished';
  created_at: string;
  updated_at: string;
};

export type BoardItem = {
  id: string;
  board_id: string;
  type: 'pick' | 'text';
  pick_id: string | null;
  text_content: string | null;
  position_x: number;
  position_y: number;
  sort_index: number;
  layout_variant: string;
  // Q1 ANSWER: Attribution for picks from other budtenders
  attribution_style: 'prominent' | 'subtle' | null;
  created_at: string;
  updated_at: string;
};

/**
 * Get all boards, optionally filtered by type
 */
export async function getBoards(type?: Board['type']): Promise<Board[]> {
  let query = supabase
    .from('boards')
    .select('*')
    .order('type', { ascending: true })
    .order('name', { ascending: true });
  
  if (type) {
    query = query.eq('type', type);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching boards:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get a single board by ID
 */
export async function getBoardById(boardId: string): Promise<Board | null> {
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('id', boardId)
    .single();
  
  if (error) {
    console.error('Error fetching board:', error);
    return null;
  }
  
  return data;
}

/**
 * Get board items for a board, ordered by sort_index
 */
export async function getBoardItems(boardId: string): Promise<BoardItem[]> {
  const { data, error } = await supabase
    .from('board_items')
    .select('*')
    .eq('board_id', boardId)
    .order('sort_index', { ascending: true });
  
  if (error) {
    console.error('Error fetching board items:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get the auto_store board (house list)
 */
export async function getAutoStoreBoard(): Promise<Board | null> {
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('type', 'auto_store')
    .single();
  
  if (error) {
    console.error('Error fetching auto_store board:', error);
    return null;
  }
  
  return data;
}

/**
 * Get the auto_user board for a specific budtender
 */
export async function getAutoUserBoard(budtenderId: string): Promise<Board | null> {
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('type', 'auto_user')
    .eq('owner_user_id', budtenderId)
    .single();
  
  if (error) {
    console.error('Error fetching auto_user board:', error);
    return null;
  }
  
  return data;
}

// =============================================================
// CRITICAL FIX (Issue 4): Add removeBoardItem early
// This is needed by Session 05 for stale pick handling
// =============================================================

/**
 * Remove an item from a board
 */
export async function removeBoardItem(itemId: string): Promise<boolean> {
  const { error } = await supabase
    .from('board_items')
    .delete()
    .eq('id', itemId);
  
  if (error) {
    console.error('Error removing board item:', error);
    return false;
  }
  
  return true;
}

// =============================================================
// CRITICAL FIX (Issue 5): Add auto board content loading functions
// These are needed by Session 05 to display auto board content
// They rely on getPublishedPicks from picks.ts (added in Session 02)
// =============================================================

import { getPublishedPicks, getPublishedPicksForBudtender, Pick } from './picks';

/**
 * Load picks for auto boards (computed content)
 * Auto boards don't use board_items - their content is computed from picks
 */
export async function loadAutoboardPicks(board: Board): Promise<Pick[]> {
  if (board.type === 'auto_store') {
    // House list: all published picks from all staff
    return getPublishedPicks(50);
  }
  
  if (board.type === 'auto_user' && board.owner_user_id) {
    // Budtender's picks: their published picks only
    return getPublishedPicksForBudtender(board.owner_user_id);
  }
  
  // Custom boards don't use this function - they use board_items
  return [];
}
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/migrations/YYYYMMDD_create_auto_store_board.sql` | Create |
| `supabase/migrations/YYYYMMDD_create_auto_user_boards.sql` | Create |
| `supabase/migrations/YYYYMMDD_auto_user_board_trigger.sql` | Create |
| `src/lib/api/boards.ts` | Create (includes removeBoardItem, loadAutoboardPicks) |

---

## Canonical Docs to Update

- [ ] `docs/ARCHITECTURE_OVERVIEW.md` - Add boards API to Section 2.4

---

## Post-Session Documentation

- [ ] Update `SESSION_LOG.md` with completion status
- [ ] Verify auto_store board exists in DB
- [ ] Verify auto_user boards exist for all active budtenders
- [ ] Test trigger by creating a test budtender (then delete)
- [ ] Run `npm run build` to confirm no errors

---

## Rollback Plan

If migrations fail:
1. Drop trigger: `DROP TRIGGER IF EXISTS on_budtender_created ON public.budtenders;`
2. Drop function: `DROP FUNCTION IF EXISTS public.create_auto_user_board();`
3. Delete auto boards: `DELETE FROM public.boards WHERE type IN ('auto_store', 'auto_user');`

---

## Next Session

→ **Session 04: Boards Home View**

