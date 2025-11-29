# Conflicts and Decisions Log

---
**Document Metadata**

| Field | Value |
|-------|-------|
| **Status** | 🚧 In Progress |
| **Last Updated** | 2025-11-29 |
| **Owner** | Xylent Studios |
| **Audience** | AI Agents, Engineering |
| **Purpose** | Record all conflicts between vNEXT docs and current code, with resolutions |

---

## Policy

**When enum conflicts are discovered between vNEXT docs and the current database:**

1. **Do NOT change existing DB values** for this vNEXT pass
2. Update the vNEXT docs (e.g., doc 09) to match the real DB enums
3. Record the discrepancy and resolution in this file

**DB is source of truth; docs adapt.**

---

## Enum Conflicts

### 1. `intensity` field on picks

| Aspect | Value |
|--------|-------|
| **vNEXT Doc 09 Says** | `gentle`, `moderate`, `strong` |
| **Current DB Has** | `light`, `moderate`, `strong`, `heavy` |
| **Resolution** | Keep current DB values |
| **Action Required** | Update vNEXT doc 09 Section 2.2 to match DB |
| **Date Recorded** | 2025-11-29 |

### 2. `experience_level` field on picks

| Aspect | Value |
|--------|-------|
| **vNEXT Doc 09 Says** | `new`, `occasional`, `heavy` |
| **Current DB Has** | `newbie_safe`, `regular`, `heavy` |
| **Resolution** | Keep current DB values |
| **Action Required** | Update vNEXT doc 09 Section 2.3 to match DB |
| **Date Recorded** | 2025-11-29 |

### 3. `budget_level` field on picks

| Aspect | Value |
|--------|-------|
| **vNEXT Doc 09 Says** | `budget`, `standard`, `premium` |
| **Current DB Has** | `budget`, `mid`, `premium` |
| **Resolution** | Keep current DB values |
| **Action Required** | Update vNEXT doc 09 Section 2.4 to match DB |
| **Date Recorded** | 2025-11-29 |

---

## Semantic Decisions

### 4. `status` vs `is_active` on picks

| Aspect | Decision |
|--------|----------|
| **Context** | vNEXT docs propose adding `status` enum; current code uses `is_active` boolean |
| **Decision** | Add `status` ALONGSIDE `is_active`, not replacing it |
| **Semantics** | |
| - `is_active` | Low-level "is this record usable/soft-deleted" flag |
| - `status` | Customer-facing state: `published` or `archived` |
| **Query Rule** | Customer views use `WHERE status = 'published' AND is_active = true` |
| **Date Decided** | 2025-11-29 |

### 5. `visible_fields` behavior

| Aspect | Decision |
|--------|----------|
| **Type** | `text[]` containing known field keys |
| **NULL Behavior** | UI uses sensible default visibility (NOT "hide everything") |
| **Known Keys** | `one_liner`, `why_i_love_it`, `effect_tags`, `deal_badge`, `time_of_day`, `rating`, `potency_summary`, `intensity`, `experience_level`, `budget_level`, `package_size`, `top_terpenes` |
| **Default Visible** | product_name, brand, product_type, one_liner, time_of_day, effect_tags, rating, potency_summary |
| **Date Decided** | 2025-11-29 |

### 6. Auto boards representation

| Aspect | Decision |
|--------|----------|
| **Context** | How to represent auto boards (store-wide, per-budtender) |
| **Decision** | Auto boards ARE rows in `boards` table with `type` field |
| **Type Values** | `auto_store`, `auto_user`, `custom` |
| **Content** | Auto board content is computed at render time (not stored in `board_items` for MVP) |
| **Query** | Filter picks by `is_active = true AND status = 'published'` |
| **Date Decided** | 2025-11-29 |

### 7. `sort_index` on board_items

| Aspect | Decision |
|--------|----------|
| **Context** | Need deterministic ordering for list/stack views and responsive layouts |
| **Decision** | Add `sort_index integer` to `board_items` alongside `position_x`, `position_y` |
| **Rationale** | Ensures consistent ordering even when freeform x/y layout exists |
| **Date Decided** | 2025-11-29 |

### 8. Stale picks on boards (archived/inactive picks)

| Aspect | Decision |
|--------|----------|
| **Context** | A pick added to a custom board can later be archived or soft-deleted. The `board_item` row still exists with a valid FK. |
| **Problem** | Rendering breaks if code tries to access `pick.product_name` when pick is `null`. |
| **Solution** | Defense in depth: |
| **Query Level** | Use `getVisiblePicksByIds()` which filters `status = 'published' AND is_active = true` |
| **Render Level** | Check `if (!pick) return null;` in render loops |
| **Edit Mode** | Show `StalePickPlaceholder` component so staff can remove orphaned items |
| **Display Mode** | Silently skip - customers never see stale items or placeholders |
| **Sessions Affected** | Session 05 (BoardCanvas), Session 13 (DisplayModeView) |
| **Date Decided** | 2025-11-29 |

### 9. Board layout: Grid with sort_index (not freeform)

| Aspect | Decision |
|--------|----------|
| **Context** | `board_items` table has `position_x`, `position_y` (freeform) AND `sort_index` (grid) columns |
| **Decision** | MVP uses CSS Grid with `sort_index` only |
| **Unused Columns** | `position_x`, `position_y` exist but are not read/written - reserved for future freeform canvas |
| **Rationale** | Grid is simpler, more responsive, better UX for MVP |
| **Rule** | All ordering logic uses `sort_index`. Do not read/write position columns. |
| **Sessions Affected** | Session 06 (drag-drop) |
| **Date Decided** | 2025-11-29 |

### 10. Mobile drag-drop requires touch-action: none

| Aspect | Decision |
|--------|----------|
| **Context** | `@dnd-kit` on mobile can conflict with native scroll |
| **Problem** | Without configuration, scrolling triggers accidental drag events |
| **Solution** | Add `touch-action: none` CSS to drag handles + `TouchSensor` with delay constraint |
| **Implementation** | Style attribute on drag handle button, TouchSensor with 200ms delay |
| **Sessions Affected** | Session 06 (drag-drop) |
| **Date Decided** | 2025-11-29 |

---

## Deferred Features

### Activity Feed UI (Manager View)

| Aspect | Value |
|--------|-------|
| **Feature** | Full Activity feed view for managers to see all events |
| **Status** | Explicitly deferred |
| **Reason** | Scope - MVP includes event logging and snippets, not full UI |
| **In Scope** | activity_events table, "Last updated by" snippets |
| **Out of Scope** | Dedicated Activity view with filters |
| **Date Deferred** | 2025-11-29 |

### Full Profile Menu

| Aspect | Value |
|--------|-------|
| **Feature** | Fancy avatar ProfileMenu with full menu items |
| **Status** | Stretch goal |
| **Minimum** | Basic entry point to Preferences/What's New in existing header |
| **Stretch** | Full ProfileMenu.tsx with avatar, My Profile, Preferences, etc. |
| **Date Decided** | 2025-11-29 |

---

## 🔴 Critical Plan Issues (Pre-Implementation Review)

**Date Identified:** 2025-11-29  
**Status:** Pending fix before implementation begins

These issues were identified during critical review of the vNEXT plan. They MUST be addressed in the relevant sessions.

### Issue 1: Missing public RLS policies for Display Mode

| Aspect | Details |
|--------|---------|
| **Problem** | Session 01 creates RLS policies only for `authenticated` users. Display Mode serves unauthenticated users (kiosk/guest). |
| **Impact** | Anonymous users cannot SELECT from `boards` or `board_items` - Display Mode will fail. |
| **Fix Location** | Session 01 |
| **Fix** | Add anon policies: `boards_public_select_published`, `board_items_public_select` |

### Issue 2: Draft unique constraint doesn't handle NULL pick_id

| Aspect | Details |
|--------|---------|
| **Problem** | PostgreSQL treats NULL as distinct. Two rows with `(user_id=X, pick_id=NULL)` are NOT duplicates. |
| **Impact** | Users can create multiple "new pick" drafts, violating one-draft-per-pick behavior. |
| **Fix Location** | Session 01 |
| **Fix** | Add partial unique index: `CREATE UNIQUE INDEX pick_drafts_user_new_pick_unique ON pick_drafts(user_id) WHERE pick_id IS NULL;` |

### Issue 3: Existing picks API doesn't filter by `status`

| Aspect | Details |
|--------|---------|
| **Problem** | `getActivePicksForBudtender()` only filters `is_active = true`, not `status = 'published'`. |
| **Impact** | Archived picks could leak into customer views after Session 02 adds status. |
| **Fix Location** | Session 02 (add step) |
| **Fix** | Update `src/lib/api/picks.ts` to add `.eq('status', 'published')` to customer-facing queries |

### Issue 4: `removeBoardItem` used before it's created

| Aspect | Details |
|--------|---------|
| **Problem** | Session 05 uses `removeBoardItem()` but it's created in Session 07. |
| **Impact** | Compilation error in Session 05. |
| **Fix Location** | Session 03 or Session 05 |
| **Fix** | Move `removeBoardItem` to Session 03 when creating boards API, OR remove stale item handling from Session 05 |

### Issue 5: Auto board content TODO is never filled

| Aspect | Details |
|--------|---------|
| **Problem** | `loadAutoboardPicks()` in Session 05 returns empty array with TODO comment. `getPublishedPicks()` isn't defined until Session 13. |
| **Impact** | Auto boards show empty until Session 13. |
| **Fix Location** | Session 05 |
| **Fix** | Define `getPublishedPicks` and `getPublishedPicksForBudtender` in Session 03 when creating picks API updates |

### Issue 6: PickDraft type collision

| Aspect | Details |
|--------|---------|
| **Problem** | Session 09 creates `PickDraft` type in `drafts.ts`, but `src/types/pickDraft.ts` already has a `PickDraft` interface. |
| **Impact** | TypeScript confusion, import conflicts. |
| **Fix Location** | Session 09 |
| **Fix** | Rename DB draft type to `PickDraftRow` or `DbPickDraft` |

---

## 🟡 Moderate Plan Issues

### Issue 7: Race condition in addPickToBoard sort_index

| Aspect | Details |
|--------|---------|
| **Session** | Session 07 |
| **Problem** | Two concurrent users could get same sort_index |
| **Fix** | Use DB-side `COALESCE((SELECT MAX(sort_index) + 1 ...), 0)` in INSERT |

### Issue 8: First render triggers autosave

| Aspect | Details |
|--------|---------|
| **Session** | Session 10 |
| **Problem** | Opening modal immediately creates draft even if closed without changes |
| **Fix** | Add `isInitialMount` ref to skip first render |

### Issue 9: AddPickDialog only shows user's own picks

| Aspect | Details |
|--------|---------|
| **Session** | Session 07 |
| **Problem** | Managers can't add other budtenders' picks to custom boards |
| **Status** | Needs product decision - is this intentional? |

---

## Open Questions

### ✅ Answered by Justin (2025-11-29):

#### Q1: AddPickDialog scope

**Question:** Should managers be able to add ANY published pick to a custom board, or only their own picks?

**Answer:** **Anyone can use anyone's picks for boards.** When showing another user's pick on a board, display an attribution:
- Examples: "Justin's pick", "From Nate", "Alicia's Fave"
- Can be **prominent** (header-style) or **subtle** (footnote-style)
- Let the board creator choose the display style

**Implementation:** Update Session 07 to:
- Load ALL published picks in AddPickDialog (not just user's own)
- Add `attribution_style` field to `board_items` (optional: 'prominent' | 'subtle' | null)
- Show attribution on CanvasPickCard when pick owner ≠ board owner

#### Q2: Auto board name sync

**Question:** When a budtender changes their name, should their auto board name update automatically?

**Answer:** **Yes.** If a board name, title, or message is automatically determined by user info, it should update when the user changes that info.

**Implementation:** Update Session 03 to:
- Add UPDATE trigger on budtenders that updates the auto_user board name
- Pattern: `NEW.name || '''s Picks'`

---

## Plan v2: Spec + Code Alignment Summary

**Session:** 00  
**Date:** 2025-11-29  
**Status:** ✅ Complete

This section documents the final alignment between vNEXT specs and current code/DB reality.

---

### 1. New Tables - Final Schema

#### boards

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, default gen_random_uuid() | |
| name | text | NOT NULL | e.g. "Sleep & Recovery" |
| type | text | NOT NULL, CHECK (auto_store, auto_user, custom) | Board type |
| owner_user_id | uuid | FK budtenders(id), nullable | NULL for auto boards |
| description | text | nullable | Optional subtitle |
| status | text | NOT NULL, default 'published', CHECK (published, unpublished) | Visibility |
| created_at | timestamptz | NOT NULL, default now() | |
| updated_at | timestamptz | NOT NULL, default now() | |

**RLS Notes:** Must include anon SELECT policy for published boards (Display Mode).

#### board_items

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, default gen_random_uuid() | |
| board_id | uuid | FK boards(id) ON DELETE CASCADE, NOT NULL | |
| type | text | NOT NULL, CHECK (pick, text) | Item type |
| pick_id | uuid | FK picks(id) ON DELETE CASCADE, nullable | Required when type=pick |
| text_content | text | nullable | Required when type=text |
| sort_index | integer | NOT NULL, default 0 | For grid ordering (MVP) |
| position_x | numeric | nullable | Reserved for future freeform |
| position_y | numeric | nullable | Reserved for future freeform |
| layout_variant | text | nullable | compact, detailed, hero |
| attribution_style | text | nullable, CHECK (prominent, subtle) | For picks from other budtenders |
| created_at | timestamptz | NOT NULL, default now() | |
| updated_at | timestamptz | NOT NULL, default now() | |

**RLS Notes:** Must include anon SELECT policy (Display Mode).

#### pick_drafts

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, default gen_random_uuid() | |
| user_id | uuid | FK budtenders(id) ON DELETE CASCADE, NOT NULL | Draft owner |
| pick_id | uuid | FK picks(id) ON DELETE CASCADE, nullable | NULL = new pick draft |
| data | jsonb | NOT NULL | Full form state |
| created_at | timestamptz | NOT NULL, default now() | |
| updated_at | timestamptz | NOT NULL, default now() | |

**Constraints:**
- `UNIQUE (user_id, pick_id)` - One draft per existing pick per user
- Partial unique index: `CREATE UNIQUE INDEX pick_drafts_user_new_pick_unique ON pick_drafts(user_id) WHERE pick_id IS NULL;` - One "new pick" draft per user

#### products (minimal)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, default gen_random_uuid() | |
| external_id | text | nullable, unique | For POS integration |
| name | text | NOT NULL | |
| brand | text | nullable | |
| product_type | text | NOT NULL | Same values as picks.product_type |
| is_available | boolean | NOT NULL, default true | |
| created_at | timestamptz | NOT NULL, default now() | |
| updated_at | timestamptz | NOT NULL, default now() | |

#### user_preferences

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| user_id | uuid | PK, FK budtenders(id) ON DELETE CASCADE | |
| last_route | text | nullable | e.g. /boards/123 |
| last_board_id | uuid | FK boards(id) ON DELETE SET NULL, nullable | |
| last_seen_release_id | uuid | nullable | For "What's New" |
| updated_at | timestamptz | NOT NULL, default now() | |

---

### 2. picks Table Updates

| Change | Details |
|--------|---------|
| Add `status` | text, NOT NULL, default 'published', CHECK (published, archived) |
| Add `visible_fields` | text[], nullable (NULL = use defaults from Decision 5) |
| Add `product_id` | uuid, FK products(id) ON DELETE SET NULL, nullable |

**Migration Order:** Add `status` in Session 02 after tables exist. Add `product_id` in Session 15 when products table is created.

---

### 3. Auto Boards Representation

Auto boards ARE rows in the `boards` table:

| Type | Description | Content Source |
|------|-------------|----------------|
| `auto_store` | Store-wide "All Staff Picks" | Computed: all published + active picks |
| `auto_user` | Per-budtender "[Name]'s Picks" | Computed: user's published + active picks |
| `custom` | Staff-created themed boards | Explicit: `board_items` rows |

**Key Rules:**
- Auto boards do NOT use `board_items` for content in MVP
- Content is computed at render time by filtering picks
- Query pattern: `WHERE is_active = true AND status = 'published'`
- Auto boards are created automatically (Session 03): one `auto_store`, one `auto_user` per budtender
- Auto board names sync when budtender name changes (via DB trigger)

---

### 4. In-Scope vs Deferred Features

| Feature | Status | Session | Notes |
|---------|--------|---------|-------|
| boards table + API | In-scope | 01 | |
| board_items table + API | In-scope | 01 | |
| pick_drafts table + API | In-scope | 01, 09 | |
| Auto board creation | In-scope | 03 | With name sync trigger |
| Board canvas UI (read) | In-scope | 05 | |
| Board canvas UI (drag-drop) | In-scope | 06 | |
| Add pick to board | In-scope | 07 | All published picks, with attribution |
| Add text block + board CRUD | In-scope | 08 | |
| Pick drafts API | In-scope | 09 | Type renamed to `PickDraftRow` |
| PickFormModal draft refactor | In-scope | 10 | |
| My Picks drafts integration | In-scope | 11 | |
| Visible fields system | In-scope | 12 | |
| Display mode board support | In-scope | 13 | |
| Board selector in display | In-scope | 14 | |
| products table (minimal) | In-scope | 15 | |
| Product selection in pick flow | In-scope | 16 | |
| Profile menu (basic) | In-scope | 17 | Entry point only |
| user_preferences persistence | In-scope | 18 | |
| Releases/What's New | In-scope | 19 | |
| Activity events (minimal) | In-scope | 20 | Table + snippets only |
| Full Activity feed UI | **Deferred** | - | Manager view for all events |
| Full Profile Menu | **Stretch** | 17 | Avatar + full dropdown |
| Freeform canvas layout | **Deferred** | - | position_x/y reserved but unused |

---

### 5. Verified Enum Values

All enum values in vNEXT doc 09 have been verified against the actual database:

| Field | DB Values | Doc 09 Status |
|-------|-----------|---------------|
| `intensity` | light, moderate, strong, heavy | ✅ Updated |
| `experience_level` | newbie_safe, regular, heavy | ✅ Updated |
| `budget_level` | budget, mid, premium | ✅ Updated |
| `time_of_day` | Day, Evening, Night, Anytime | ✅ Correct |

---

### 6. Open Questions Status

| Question | Status | Answer |
|----------|--------|--------|
| Q1: AddPickDialog scope | ✅ Answered | Anyone can use anyone's picks with attribution |
| Q2: Auto board name sync | ✅ Answered | Yes, sync via DB trigger |

**No new questions identified during Session 00.**

---

**Maintained by:** Xylent Studios  
**Last reviewed:** 2025-11-29

