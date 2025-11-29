# Session 01: Core Tables (boards, board_items, pick_drafts)

---
**Session Metadata**

| Field | Value |
|-------|-------|
| **Phase** | 1 - Data Model Foundation |
| **Estimated Duration** | 2-3 hours |
| **Prerequisites** | Session 00 completed |
| **Output** | 3 new tables, RLS policies, TypeScript types |

---

## Pre-Session Checklist

- [ ] Session 00 Plan v2 completed and approved
- [ ] Inspect current DB schema: `mcp_supabase_list_tables`
- [ ] Verify no pending migrations
- [ ] Read `docs/guidelight_ux_docs_bundle_vNEXT/03_PICKS_AND_BOARDS_DATA_MODEL.md`

---

## Session Goals

1. Create `boards` table with proper schema
2. Create `board_items` table with sort_index
3. Create `pick_drafts` table with unique constraint
4. Set up RLS policies for all three tables
5. Regenerate TypeScript types

---

## Acceptance Criteria

- [ ] `boards` table exists with correct schema
- [ ] `board_items` table exists with sort_index column
- [ ] `pick_drafts` table exists with unique constraint on (user_id, pick_id)
- [ ] RLS policies allow budtenders to manage their own data
- [ ] RLS policies allow managers to manage all data
- [ ] TypeScript types regenerated and include new tables
- [ ] No errors in `npm run build`

---

## Implementation Steps

### Step 1: Create boards table

```sql
-- Migration: create_boards_table

CREATE TYPE board_type AS ENUM ('auto_store', 'auto_user', 'custom');
CREATE TYPE board_status AS ENUM ('published', 'unpublished');

CREATE TABLE public.boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type board_type NOT NULL DEFAULT 'custom',
  owner_user_id uuid REFERENCES public.budtenders(id) ON DELETE SET NULL,
  description text,
  status board_status NOT NULL DEFAULT 'unpublished',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for owner lookups
CREATE INDEX boards_owner_user_id_idx ON public.boards(owner_user_id);

-- Index for type filtering
CREATE INDEX boards_type_idx ON public.boards(type);

COMMENT ON TABLE public.boards IS 'Named boards for organizing picks. Types: auto_store (house list), auto_user (per-budtender), custom (staff-created).';
```

### Step 2: Create board_items table

```sql
-- Migration: create_board_items_table

CREATE TYPE board_item_type AS ENUM ('pick', 'text');

CREATE TABLE public.board_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  type board_item_type NOT NULL,
  pick_id uuid REFERENCES public.picks(id) ON DELETE CASCADE,
  text_content text,
  position_x numeric DEFAULT 0,
  position_y numeric DEFAULT 0,
  sort_index integer DEFAULT 0,
  layout_variant text DEFAULT 'default',
  -- Q1 ANSWER: Attribution for picks from other budtenders
  -- null = no attribution (own pick), 'prominent' = header, 'subtle' = footnote
  attribution_style text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Ensure pick_id is set when type is 'pick'
  CONSTRAINT board_items_pick_required CHECK (
    type != 'pick' OR pick_id IS NOT NULL
  ),
  -- Ensure text_content is set when type is 'text'
  CONSTRAINT board_items_text_required CHECK (
    type != 'text' OR text_content IS NOT NULL
  ),
  -- Validate attribution_style values
  CONSTRAINT board_items_attribution_style_check CHECK (
    attribution_style IS NULL OR attribution_style IN ('prominent', 'subtle')
  )
);

-- Index for board lookups
CREATE INDEX board_items_board_id_idx ON public.board_items(board_id);

-- Index for ordering
CREATE INDEX board_items_sort_idx ON public.board_items(board_id, sort_index);

COMMENT ON TABLE public.board_items IS 'Items placed on board canvases. Can be pick cards or text blocks.';
COMMENT ON COLUMN public.board_items.sort_index IS 'Deterministic ordering for list/stack views and responsive layouts.';
```

### Step 3: Create pick_drafts table

```sql
-- Migration: create_pick_drafts_table

CREATE TABLE public.pick_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.budtenders(id) ON DELETE CASCADE,
  pick_id uuid REFERENCES public.picks(id) ON DELETE CASCADE,
  data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Each user can have at most one draft per existing pick
  -- NOTE: This only works for non-NULL pick_id values
  CONSTRAINT pick_drafts_user_pick_unique UNIQUE (user_id, pick_id)
);

-- CRITICAL FIX (Issue 2): Handle NULL pick_id uniqueness
-- PostgreSQL treats NULL as distinct, so the UNIQUE constraint above
-- doesn't prevent multiple (user_id, NULL) rows.
-- This partial index ensures each user has at most ONE "new pick" draft.
CREATE UNIQUE INDEX pick_drafts_user_new_pick_unique 
ON public.pick_drafts(user_id) 
WHERE pick_id IS NULL;

-- Index for user lookups
CREATE INDEX pick_drafts_user_id_idx ON public.pick_drafts(user_id);

COMMENT ON TABLE public.pick_drafts IS 'In-progress pick edits. pick_id NULL = new pick draft, non-null = editing existing pick.';
```

### Step 4: RLS Policies

```sql
-- Enable RLS
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pick_drafts ENABLE ROW LEVEL SECURITY;

-- boards policies (authenticated users)
CREATE POLICY "boards_select_all" ON public.boards
  FOR SELECT TO authenticated USING (true);

-- CRITICAL FIX (Issue 1): Public read access for Display Mode
-- Anonymous users (kiosk/guest) need to read published boards
CREATE POLICY "boards_public_select_published" ON public.boards
  FOR SELECT TO anon 
  USING (status = 'published');

CREATE POLICY "boards_insert_own" ON public.boards
  FOR INSERT TO authenticated
  WITH CHECK (
    owner_user_id = (SELECT id FROM public.budtenders WHERE auth_user_id = auth.uid())
    OR type != 'custom'
    OR (SELECT role FROM public.budtenders WHERE auth_user_id = auth.uid()) = 'manager'
  );

CREATE POLICY "boards_update_own_or_manager" ON public.boards
  FOR UPDATE TO authenticated
  USING (
    owner_user_id = (SELECT id FROM public.budtenders WHERE auth_user_id = auth.uid())
    OR (SELECT role FROM public.budtenders WHERE auth_user_id = auth.uid()) = 'manager'
  );

CREATE POLICY "boards_delete_custom_own_or_manager" ON public.boards
  FOR DELETE TO authenticated
  USING (
    type = 'custom' AND (
      owner_user_id = (SELECT id FROM public.budtenders WHERE auth_user_id = auth.uid())
      OR (SELECT role FROM public.budtenders WHERE auth_user_id = auth.uid()) = 'manager'
    )
  );

-- board_items policies (authenticated users)
CREATE POLICY "board_items_select_all" ON public.board_items
  FOR SELECT TO authenticated USING (true);

-- CRITICAL FIX (Issue 1): Public read access for Display Mode
-- Anonymous users can read items on published boards
CREATE POLICY "board_items_public_select" ON public.board_items
  FOR SELECT TO anon 
  USING (
    EXISTS (
      SELECT 1 FROM public.boards b 
      WHERE b.id = board_id AND b.status = 'published'
    )
  );

CREATE POLICY "board_items_insert_board_owner_or_manager" ON public.board_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.boards b
      WHERE b.id = board_id AND (
        b.owner_user_id = (SELECT id FROM public.budtenders WHERE auth_user_id = auth.uid())
        OR (SELECT role FROM public.budtenders WHERE auth_user_id = auth.uid()) = 'manager'
      )
    )
  );

CREATE POLICY "board_items_update_board_owner_or_manager" ON public.board_items
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.boards b
      WHERE b.id = board_id AND (
        b.owner_user_id = (SELECT id FROM public.budtenders WHERE auth_user_id = auth.uid())
        OR (SELECT role FROM public.budtenders WHERE auth_user_id = auth.uid()) = 'manager'
      )
    )
  );

CREATE POLICY "board_items_delete_board_owner_or_manager" ON public.board_items
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.boards b
      WHERE b.id = board_id AND (
        b.owner_user_id = (SELECT id FROM public.budtenders WHERE auth_user_id = auth.uid())
        OR (SELECT role FROM public.budtenders WHERE auth_user_id = auth.uid()) = 'manager'
      )
    )
  );

-- pick_drafts policies
CREATE POLICY "pick_drafts_select_own" ON public.pick_drafts
  FOR SELECT TO authenticated
  USING (user_id = (SELECT id FROM public.budtenders WHERE auth_user_id = auth.uid()));

CREATE POLICY "pick_drafts_insert_own" ON public.pick_drafts
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT id FROM public.budtenders WHERE auth_user_id = auth.uid()));

CREATE POLICY "pick_drafts_update_own" ON public.pick_drafts
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT id FROM public.budtenders WHERE auth_user_id = auth.uid()));

CREATE POLICY "pick_drafts_delete_own" ON public.pick_drafts
  FOR DELETE TO authenticated
  USING (user_id = (SELECT id FROM public.budtenders WHERE auth_user_id = auth.uid()));
```

### Step 5: Regenerate TypeScript Types

```bash
npx supabase gen types typescript --project-id <project-id> > src/types/database.ts
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/migrations/YYYYMMDD_create_boards_table.sql` | Create |
| `supabase/migrations/YYYYMMDD_create_board_items_table.sql` | Create |
| `supabase/migrations/YYYYMMDD_create_pick_drafts_table.sql` | Create |
| `supabase/migrations/YYYYMMDD_boards_rls_policies.sql` | Create |
| `src/types/database.ts` | Regenerate |

---

## Canonical Docs to Update

| Document | Action | How |
|----------|--------|-----|
| `docs/ARCHITECTURE_OVERVIEW.md` | Add new tables to Section 1 | Add `boards`, `board_items`, `pick_drafts` to data model table |
| `docs/guidelight_ux_docs_bundle_vNEXT/03_PICKS_AND_BOARDS_DATA_MODEL.md` | Mark as "Implemented" | Add `✅ Implemented in Session 01` note to relevant sections |
| `notes/DOCUMENTATION_MANIFEST.md` | Update if needed | Add new tables to "Key Implementation Files" if data section exists |

---

## Post-Session Documentation Checklist

**Required (do all of these):**

- [ ] Update `SESSION_LOG.md`:
  - Change status to `✅ Complete`
  - Fill in Started/Completed timestamps
  - List all files created/modified
  - Note any deviations from plan
  
- [ ] Update `00_OVERVIEW.md`:
  - Change Session 01 status from `⬜` to `✅` in Status Tracker
  
- [ ] Verify migrations applied successfully:
  - Run `mcp_supabase_list_tables` to confirm tables exist
  - Check RLS policies are active
  
- [ ] Run `npm run build` to confirm no type errors

**If significant changes made:**

- [ ] Consider adding entry to `CHANGELOG.md` under `[Unreleased]`:
  ```markdown
  ### Added
  - Database tables: boards, board_items, pick_drafts
  - RLS policies for new tables
  ```

**Documentation standards reminder:**
- Update "Last Updated" date in any docs you modify
- Follow formatting in `notes/DOCUMENTATION_STANDARDS.md`

---

## Rollback Plan

If migrations fail:
1. Use Supabase dashboard to drop tables in reverse order: `pick_drafts`, `board_items`, `boards`
2. Drop enums: `board_item_type`, `board_status`, `board_type`
3. Re-run corrected migrations

---

## Next Session

→ **Session 02: user_preferences + picks schema updates**

