# Session 02: user_preferences + picks schema updates

---
**Session Metadata**

| Field | Value |
|-------|-------|
| **Phase** | 1 - Data Model Foundation |
| **Estimated Duration** | 2 hours |
| **Prerequisites** | Session 01 completed |
| **Output** | user_preferences table, picks schema updates |

---

## Pre-Session Checklist

- [ ] Session 01 completed successfully
- [ ] Inspect `boards`, `board_items`, `pick_drafts` tables exist
- [ ] Inspect current `picks` table schema
- [ ] Read `CONFLICTS_AND_DECISIONS.md` for status vs is_active semantics

---

## Session Goals

1. Create `user_preferences` table
2. Add `status` enum column to `picks`
3. Add `visible_fields` text[] column to `picks`
4. Set up RLS policies for user_preferences
5. Regenerate TypeScript types

---

## Key Semantics (from CONFLICTS_AND_DECISIONS.md)

### status vs is_active

- **`is_active`** (boolean): Low-level soft-delete flag. FALSE = not queryable in normal flows.
- **`status`** (enum): Customer-facing state. `published` | `archived`
- **Query rule**: Customer views use `WHERE status = 'published' AND is_active = true`

### visible_fields

- **Type**: `text[]` with known field keys
- **NULL behavior**: UI uses sensible defaults (NOT "hide everything")
- **Known keys**: `one_liner`, `why_i_love_it`, `effect_tags`, `deal_badge`, `time_of_day`, `rating`, `potency_summary`, `intensity`, `experience_level`, `budget_level`, `package_size`, `top_terpenes`

---

## Acceptance Criteria

- [ ] `user_preferences` table exists with correct schema
- [ ] `picks.status` column added with enum type
- [ ] `picks.visible_fields` column added as text[]
- [ ] Existing picks default to `status = 'published'`
- [ ] RLS policies for user_preferences work correctly
- [ ] TypeScript types regenerated
- [ ] No errors in `npm run build`

---

## Implementation Steps

### Step 1: Create user_preferences table

```sql
-- Migration: create_user_preferences_table

CREATE TABLE public.user_preferences (
  user_id uuid PRIMARY KEY REFERENCES public.budtenders(id) ON DELETE CASCADE,
  last_route text,
  last_board_id uuid REFERENCES public.boards(id) ON DELETE SET NULL,
  last_seen_release_id uuid,  -- FK added later when releases table exists
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.user_preferences IS 'Per-user preferences for last route, board, and release tracking.';
COMMENT ON COLUMN public.user_preferences.last_route IS 'Last meaningful route visited (e.g., /boards/abc123).';
COMMENT ON COLUMN public.user_preferences.last_board_id IS 'Last board viewed/edited, for Display Mode fallback.';
```

### Step 2: Add status column to picks

```sql
-- Migration: add_status_to_picks

-- Create the enum type
CREATE TYPE pick_status AS ENUM ('published', 'archived');

-- Add the column with default
ALTER TABLE public.picks 
ADD COLUMN status pick_status NOT NULL DEFAULT 'published';

-- Add comment explaining semantics
COMMENT ON COLUMN public.picks.status IS 'Customer-facing state: published (visible in customer views) or archived (hidden). Works alongside is_active for soft-delete.';

-- Create index for common query pattern
CREATE INDEX picks_status_is_active_idx ON public.picks(status, is_active) WHERE is_active = true;
```

### Step 3: Add visible_fields column to picks

```sql
-- Migration: add_visible_fields_to_picks

ALTER TABLE public.picks 
ADD COLUMN visible_fields text[];

COMMENT ON COLUMN public.picks.visible_fields IS 'Array of field keys visible in customer views. NULL = use default visibility rules. Keys: one_liner, why_i_love_it, effect_tags, deal_badge, time_of_day, rating, potency_summary, intensity, experience_level, budget_level, package_size, top_terpenes.';
```

### Step 4: RLS Policies for user_preferences

```sql
-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only see/modify their own preferences
CREATE POLICY "user_preferences_select_own" ON public.user_preferences
  FOR SELECT TO authenticated
  USING (user_id = (SELECT id FROM public.budtenders WHERE auth_user_id = auth.uid()));

CREATE POLICY "user_preferences_insert_own" ON public.user_preferences
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT id FROM public.budtenders WHERE auth_user_id = auth.uid()));

CREATE POLICY "user_preferences_update_own" ON public.user_preferences
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT id FROM public.budtenders WHERE auth_user_id = auth.uid()));

-- Managers can view all preferences (for debugging)
CREATE POLICY "user_preferences_select_manager" ON public.user_preferences
  FOR SELECT TO authenticated
  USING ((SELECT role FROM public.budtenders WHERE auth_user_id = auth.uid()) = 'manager');
```

### Step 5: Regenerate TypeScript Types

```bash
npx supabase gen types typescript --project-id <project-id> > src/types/database.ts
```

### Step 6: Update picks API for status filter (CRITICAL FIX - Issue 3)

**Problem:** Existing `getActivePicksForBudtender()` only filters by `is_active = true`. After adding `status`, archived picks could leak into customer views.

Update `src/lib/api/picks.ts`:

```typescript
/**
 * Fetch only PUBLISHED picks for a budtender (for Customer View)
 * Returns picks sorted by rating (high to low), then updated_at
 * 
 * IMPORTANT: This is the customer-facing query.
 * Rule: status = 'published' AND is_active = true
 */
export async function getActivePicksForBudtender(budtenderId: string): Promise<Pick[]> {
  const { data, error } = await fetchWithTimeout(
    supabase
      .from('picks')
      .select('*')
      .eq('budtender_id', budtenderId)
      .eq('is_active', true)
      .eq('status', 'published'),  // <-- ADD THIS LINE
    API_TIMEOUT_MS
  );

  if (error) {
    console.error('Error fetching active picks:', error);
    throw new Error(`Failed to fetch active picks: ${error.message}`);
  }

  return sortActivePicks(data || []);
}

/**
 * Get ALL published picks (for house list / auto_store board)
 * Used by Display Mode and auto boards
 */
export async function getPublishedPicks(limit = 24): Promise<Pick[]> {
  const { data, error } = await supabase
    .from('picks')
    .select('*, budtenders(name)')
    .eq('status', 'published')
    .eq('is_active', true)
    .order('rating', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching published picks:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get published picks for a specific budtender (for auto_user board)
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
```

**Why this matters:** Without this fix, `getActivePicksForBudtender` would show archived picks in customer views.

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/migrations/YYYYMMDD_create_user_preferences_table.sql` | Create |
| `supabase/migrations/YYYYMMDD_add_status_to_picks.sql` | Create |
| `supabase/migrations/YYYYMMDD_add_visible_fields_to_picks.sql` | Create |
| `supabase/migrations/YYYYMMDD_user_preferences_rls.sql` | Create |
| `src/types/database.ts` | Regenerate |
| `src/lib/api/picks.ts` | Update with status filter + new functions |

---

## Canonical Docs to Update

- [ ] `docs/GUIDELIGHT_SPEC.md` - Update Section 4 (Data Model) with new columns
- [ ] `docs/guidelight_ux_docs_bundle_vNEXT/03_PICKS_AND_BOARDS_DATA_MODEL.md` - Mark picks updates as "Implemented"

---

## Post-Session Documentation

- [ ] Update `SESSION_LOG.md` with completion status
- [ ] Verify all existing picks have `status = 'published'`
- [ ] Run `npm run build` to confirm no type errors

---

## Rollback Plan

If migrations fail:
1. `ALTER TABLE public.picks DROP COLUMN visible_fields;`
2. `ALTER TABLE public.picks DROP COLUMN status;`
3. `DROP TYPE pick_status;`
4. `DROP TABLE public.user_preferences;`

---

## Next Session

→ **Session 03: Auto Board Creation**

