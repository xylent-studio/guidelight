# Session 00: Spec + Code Alignment / Plan v2

---
**Session Metadata**

| Field | Value |
|-------|-------|
| **Phase** | 0 - Spec Alignment |
| **Estimated Duration** | 2-3 hours |
| **Prerequisites** | None |
| **Output** | Written Plan v2 document, doc updates |
| **Rule** | NO migrations or code changes |

---

## Pre-Session Checklist

Before starting this session, the agent must:

- [ ] Read all canonical docs listed below
- [ ] Inspect current code files listed below
- [ ] Inspect current DB schema via `mcp_supabase_list_tables`
- [ ] Have access to vNEXT bundle docs

---

## Documents to Read

### Canonical Docs (docs/)

1. `docs/GUIDELIGHT_SPEC.md` - Core product + technical spec
2. `docs/GUIDELIGHT_DESIGN_SYSTEM.md` - Visual system, palette, typography
3. `docs/BUDTENDER_PICKS_BOARD_SPEC.md` - Original board layout spec
4. `docs/BUDTENDER_PICKS_BOARD_TECH_DESIGN.md` - Board technical design
5. `docs/UI_STACK.md` - Component library, shadcn/ui usage
6. `docs/ARCHITECTURE_OVERVIEW.md` - Routes, data flow, auth

### Notes (notes/)

7. `notes/251128_guidelight_ux_overhual/ai-dev/*` - All 16 UX overhaul docs
8. `notes/DOCUMENTATION_STANDARDS.md` - Doc format requirements
9. `notes/DOCUMENTATION_MANIFEST.md` - Central doc index

### vNEXT Bundle (docs/guidelight_ux_docs_bundle_vNEXT/)

10. `00_README.md` - Bundle overview
11. `02_INFORMATION_ARCHITECTURE.md` - Entities, routes
12. `03_PICKS_AND_BOARDS_DATA_MODEL.md` - Table definitions
13. `04_USER_FLOWS_STAFF_AND_BOARDS.md` - Staff workflows
14. `05_USER_FLOWS_CUSTOMER_AND_DISPLAY.md` - Customer flows
15. `06_PERSISTENCE_AND_DRAFTS_BEHAVIOR.md` - Autosave, drafts
16. `09_DECISION_LOG_AND_REFINEMENTS.md` - Key decisions
17. `14_DESIGN_SYSTEM_AND_VISUAL_LANGUAGE.md` - Design delta
18. `15_IMPLEMENTATION_CHECKLIST.md` - Phase breakdown

---

## Code Files to Inspect

### Views

- `src/views/MyPicksView.tsx` - Current staff home
- `src/views/DisplayModeView.tsx` - Current display mode
- `src/views/StaffManagementView.tsx` - Team management
- `src/views/BudtenderBoardExampleView.tsx` - Example board view

### Components

- `src/components/picks/PickFormModal.tsx` - Pick editor
- `src/components/picks/MyPickCard.tsx` - Staff pick card
- `src/components/picks/GuestPickCard.tsx` - Customer pick card
- `src/components/BudtenderBoard.tsx` - Board template

### API Helpers

- `src/lib/api/picks.ts` - Picks CRUD
- `src/lib/api/budtenders.ts` - Budtender operations
- `src/lib/api/categories.ts` - Categories

### Types

- `src/types/database.ts` - Generated Supabase types

---

## Database Schema to Inspect

Run `mcp_supabase_list_tables` and examine:

1. **budtenders** - Staff profiles, roles
2. **picks** - Current picks schema, all fields
3. **categories** - Product categories
4. **feedback** - User feedback (for reference)

Pay special attention to:
- Existing enum values for `intensity`, `experience_level`, `budget_level`
- Current `is_active` usage
- Foreign key relationships

---

## Session Goals

1. **Confirm final table/field list** for new tables:
   - `boards` (fields, types, constraints)
   - `board_items` (fields, including sort_index decision)
   - `pick_drafts` (fields, constraints)
   - `products` (fields for minimal catalog)
   - `user_preferences` (fields)

2. **Clarify `picks` schema updates**:
   - `status` enum values and semantics vs `is_active`
   - `visible_fields` type and default behavior
   - `product_id` FK (nullable)

3. **Document auto boards representation**:
   - How `type = 'auto_store' | 'auto_user' | 'custom'` works
   - Whether auto board content uses `board_items` or is computed

4. **State scope decisions**:
   - Which activity/release features are in-scope for vNEXT
   - Which are explicitly deferred

5. **List required doc updates**:
   - Which vNEXT docs need enum corrections
   - Which canonical docs need updates

6. **Identify open questions** for Justin

---

## Acceptance Criteria

- [ ] Plan v2 document written with all sections above
- [ ] `CONFLICTS_AND_DECISIONS.md` updated with any new findings
- [ ] vNEXT doc 09 updated with correct enum values
- [ ] No migrations created
- [ ] No code changes made

---

## Output: Plan v2 Document Structure

Create a document (can be added to `CONFLICTS_AND_DECISIONS.md` or separate) with:

```markdown
## Plan v2: Spec + Code Alignment Summary

### 1. New Tables - Final Schema

#### boards
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| ... | ... | ... | ... |

#### board_items
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| ... | ... | ... | ... |

(etc. for pick_drafts, products, user_preferences)

### 2. picks Table Updates

| Change | Details |
|--------|---------|
| Add `status` | enum: published, archived |
| Add `visible_fields` | text[], NULL = defaults |
| Add `product_id` | FK to products, nullable |

### 3. Auto Boards Representation

(Explanation of how auto boards work)

### 4. In-Scope vs Deferred Features

| Feature | Status | Notes |
|---------|--------|-------|
| ... | In-scope | ... |
| ... | Deferred | ... |

### 5. Required Doc Updates

| Document | Update Needed |
|----------|---------------|
| ... | ... |

### 6. Open Questions for Justin

1. Question 1?
2. Question 2?
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `docs/guidelight_vNEXT_implementation/CONFLICTS_AND_DECISIONS.md` | Add Plan v2 content |
| `docs/guidelight_ux_docs_bundle_vNEXT/09_DECISION_LOG_AND_REFINEMENTS.md` | Fix enum values |

---

## Post-Session Documentation

- [ ] Update `SESSION_LOG.md` with completion status
- [ ] Note any discoveries or surprises
- [ ] List any clarifications needed from Justin before Session 01

---

## Rollback Plan

Not applicable - this session produces only documentation, no code or migrations.

---

## Next Session

After Session 00 is complete and any questions are resolved:
→ **Session 01: Core Tables (boards, board_items, pick_drafts)**

