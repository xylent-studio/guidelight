# Guidelight vNEXT Implementation Roadmap

---
**Document Metadata**

| Field | Value |
|-------|-------|
| **Status** | 🚧 In Progress |
| **Last Updated** | 2025-11-29 |
| **Owner** | Xylent Studios |
| **Audience** | AI Agents (Cursor/Claude), Engineering |
| **Purpose** | Session-based implementation roadmap for Boards + Drafts layer |
| **Version** | v2.0 |

---

## 🚨 For New Agents: Start Here

**If you're an AI agent starting work on vNEXT, follow this checklist:**

1. **Read `PRE_IMPLEMENTATION_CHECKLIST.md`** - Tool reference, pre-flight checks
2. **Read this file completely** - Understand the roadmap and key decisions
3. **Check `SESSION_LOG.md`** - See which sessions are complete, in progress, or blocked
4. **Read `CONFLICTS_AND_DECISIONS.md`** - Understand decisions and known issues
5. **Find your session** - Look at the Status Tracker below, find the next `⬜ Not Started` session
6. **Read that session's doc** - e.g., `01_SESSION_CORE_TABLES.md`
7. **Follow the Pre-Session Checklist** in the session doc - Don't skip reading/inspecting steps
8. **Document as you go** - Update SESSION_LOG.md after completing

**Critical:** If a session is `🔄 In Progress`, read the SESSION_LOG.md entry to see what was done and what remains.

**Tools:** See `PRE_IMPLEMENTATION_CHECKLIST.md` for available MCP tools and terminal commands.

---

## 📋 Documentation Standards

All documentation in this project follows `notes/DOCUMENTATION_STANDARDS.md`. Key rules:

- Update "Last Updated" dates when modifying docs
- Add frontmatter to new docs
- Update `docs/INDEX.md` when adding new docs
- Update `notes/DOCUMENTATION_MANIFEST.md` when adding major files
- Update `CHANGELOG.md` after significant features

---

## Critical Rule

~~**Do not run migrations or make code changes until Session 00 (Plan v2) is completed.**~~

**✅ Session 00 Complete (2025-11-29)** - Migrations and code changes may now proceed with Session 01.

---

## Overview

Session-based implementation plan for AI agents (Claude Opus 4.5). Each session is scoped for 2-4 hours of focused, high-quality work in a single planning-then-acting loop.

**Total Sessions:** 25 (Session 00 + Sessions 01-22, including 08a and 08b)

**Important:** These session docs are **execution logs**, not the product spec of record. The canonical spec remains `docs/*` and the vNEXT bundle docs.

---

## Status Tracker

| Phase | Session | Description | Status |
|-------|---------|-------------|--------|
| 0 | 00 | Spec + Code Alignment / Plan v2 | ✅ Complete |
| 1 | 01 | Core Tables (boards, board_items, pick_drafts) | ✅ Complete |
| 1 | 02 | user_preferences + picks schema updates | ✅ Complete |
| 1 | 03 | Auto Board Creation | ✅ Complete |
| 2 | 04 | Boards Home View | ✅ Complete |
| 2 | 05 | Board Canvas - Read Only | ✅ Complete |
| 2 | 06 | Board Canvas - Drag & Drop | ✅ Complete |
| 2 | 07 | Add Pick to Board | ✅ Complete |
| 2 | 08 | Add Text Block + Board CRUD + Fixes (expanded) | ✅ Complete |
| 2 | 08a | Asset/Media Library (NEW) | ✅ Complete |
| 2 | 08b | Image Board Items (NEW) | ✅ Complete |
| 3 | 09 | Pick Drafts API | ✅ Complete |
| 3 | 10 | PickFormModal Draft Refactor | ✅ Complete |
| 3 | 11 | My Picks Drafts Integration | ✅ Complete |
| 3 | 12 | Visible Fields System | ✅ Complete |
| 4 | 13 | Display Mode Board Support | ✅ Complete |
| 4 | 14 | Board Selector in Display | ✅ Complete |
| 5 | 15 | Products Table (API-ready) (REDESIGNED) | ✅ Complete |
| 5 | 16 | Product Selection in Pick Flow | ✅ Complete |
| 6 | 17 | Profile Menu (stretch) + Prefs entry | ✅ Complete |
| 6 | 18 | User Preferences Persistence | ✅ Complete |
| 7 | 19 | Releases + What's New | ✅ Complete |
| 7 | 20 | Activity Events (minimal) | ⬜ Not Started |
| 8 | 21 | API Integration Layer Design (NEW) | ⬜ Not Started |
| 8 | 22 | Treez Connector (NEW) | ⬜ Not Started |

**Legend:** ⬜ Not Started | 🔄 In Progress | ✅ Complete | ⏸️ Blocked

---

## Key Decisions

| Decision | Choice |
|----------|--------|
| Priority | Boards first |
| `status` vs `is_active` | Add `status` alongside `is_active` (see semantics below) |
| Product catalog | Minimal (table exists, picks CAN link) |
| Auto boards | DB rows in `boards` table with `type` field |
| Session length | 2-4 hours |
| Implementers | AI agents (Cursor/Claude) |

---

## Semantics: `status` vs `is_active` on picks

- **`is_active`** (boolean): Low-level "is this record usable/soft-deleted" flag. FALSE = soft-deleted, not queryable in normal flows.
- **`status`** (enum: `published` | `archived`): Customer-facing state. Only `published` picks appear in customer views.
- **Customer-facing query rule**: `WHERE status = 'published' AND is_active = true`

---

## Semantics: `visible_fields` on picks

- **Type**: `text[]` containing known field keys (e.g., `['one_liner', 'why_i_love_it', 'effect_tags', 'deal_badge']`)
- **NULL behavior**: If `visible_fields` is NULL, UI uses sensible default visibility rules for that view (NOT "hide everything")
- **Eye toggles**: Set/clear entries in `visible_fields` array
- **Consumer views**: GuestPickCard, Show-to-Customer, Display Mode consult `visible_fields` where present; fall back to defaults otherwise

**Default visible fields** (when NULL): product_name, brand, product_type, one_liner, time_of_day, effect_tags, rating, potency_summary

---

## Enum Conflict Policy

When enum conflicts are discovered between vNEXT docs and the current database:
1. **Do NOT change existing DB values** for this vNEXT pass
2. Update the vNEXT docs (e.g., doc 09) to match the real DB enums
3. Record the discrepancy and resolution in `CONFLICTS_AND_DECISIONS.md`

**DB is source of truth; docs adapt.**

---

## Design System Constraint

**All board UI must reuse the existing design system and components:**
- Start from `BudtenderBoard.tsx` and existing pick card components
- `CanvasPickCard` = variant of existing pick card (via `variant` or `mode` prop) with minimal extra chrome (drag handle, remove button), NOT a totally new card
- Typography, colors, spacing, radii, shadows, chips/pills drawn from:
  - `GUIDELIGHT_DESIGN_SYSTEM.md`
  - Current Tailwind theme (`src/styles/theme.css`, `tailwind.config.js`)
  - shadcn/ui / Radix primitives already in use

---

## Display Mode Routing Behavior

**Primary route:** `/display` (same view as today)
**Optional board targeting:** `/display/:boardId` OR `/display?board=:boardId`

**Board selection fallback order:**
1. If `boardId` provided via route/param/query → show that board
2. Else if `user_preferences.last_board_id` is set → show that board
3. Else → fall back to default auto board (`auto_store` / house list)

---

## Phase Breakdown

### Phase 0: Spec Alignment
- Session 00: Spec + Code Alignment / Plan v2 (NO CODE)

### Phase 1: Data Model Foundation
- Session 01: Core Tables (boards, board_items, pick_drafts)
- Session 02: user_preferences + picks schema updates
- Session 03: Auto Board Creation

### Phase 2: Boards Core
- Session 04: Boards Home View
- Session 05: Board Canvas - Read Only
- Session 06: Board Canvas - Drag & Drop
- Session 07: Add Pick to Board
- Session 08: Add Text Block + Board CRUD + Fixes (expanded)
- Session 08a: Asset/Media Library (NEW)
- Session 08b: Image Board Items (NEW)

### Phase 3: Pick Drafts Layer
- Session 09: Pick Drafts API
- Session 10: PickFormModal Draft Refactor
- Session 11: My Picks Drafts Integration
- Session 12: Visible Fields System

### Phase 4: Display Mode Enhancement
- Session 13: Display Mode Board Support
- Session 14: Board Selector in Display

### Phase 5: Product Catalog
- Session 15: Products Table (API-ready) (REDESIGNED)
- Session 16: Product Selection in Pick Flow

### Phase 6: Profile & Preferences
- Session 17: Profile Menu (stretch) + Prefs entry point
- Session 18: User Preferences Persistence

### Phase 7: Releases & Activity
- Session 19: Releases + What's New
- Session 20: Activity Events (minimal)

### Phase 8: API Integration (Future)
- Session 21: API Integration Layer Design (NEW)
- Session 22: Treez Connector (NEW)

---

## Files in This Folder

| File | Purpose |
|------|---------|
| `00_OVERVIEW.md` | This file - roadmap and status tracker |
| `PRE_IMPLEMENTATION_CHECKLIST.md` | **Start here** - Pre-flight checklist, tool reference |
| `PROBLEM_SOLVING_GUIDE.md` | How to think and problem-solve like a Xylent dev |
| `00_SESSION_SPEC_ALIGNMENT.md` | Session 00 instructions |
| `01_SESSION_CORE_TABLES.md` | Session 01 instructions |
| `02_SESSION_USER_PREFS_PICKS_SCHEMA.md` | Session 02 instructions |
| ... | (one file per session: 03-20) |
| `08a_SESSION_ASSET_LIBRARY.md` | Asset/Media Library (NEW) |
| `08b_SESSION_IMAGE_BOARD_ITEMS.md` | Image Board Items (NEW) |
| `21_SESSION_API_INTEGRATION_LAYER.md` | API Integration Layer Design (NEW) |
| `22_SESSION_TREEZ_CONNECTOR.md` | Treez Connector (NEW) |
| `CONFLICTS_AND_DECISIONS.md` | Enum resolutions, doc vs code conflicts, known issues |
| `SESSION_LOG.md` | Progress tracking between sessions |

---

## Partial Completion Handling

**If a session is interrupted or only partially completed:**

1. **Update SESSION_LOG.md immediately** with:
   - Status: `🔄 In Progress` (not `✅ Complete`)
   - What was completed
   - What remains to be done
   - Any blockers or issues
   - Files that were created/modified so far

2. **Do NOT update the Status Tracker** in this file to `✅` until fully complete

3. **Leave clear handoff notes** in SESSION_LOG.md for the next agent

4. **If migrations were partially applied:**
   - Document which migrations succeeded
   - Document which failed or weren't run
   - Note rollback steps taken (if any)

5. **If code was partially written:**
   - Note which files are incomplete
   - Note any `// TODO` comments left in code
   - Consider reverting incomplete changes if they break the build

---

## Documentation Update Procedures

**After completing a session, update these docs:**

### Always Update:

| Document | What to Update |
|----------|----------------|
| `SESSION_LOG.md` | Mark session complete, add completion notes |
| This file (`00_OVERVIEW.md`) | Change status from ⬜ to ✅ in Status Tracker |

### When Adding New Views/Components:

| Document | What to Update |
|----------|----------------|
| `notes/DOCUMENTATION_MANIFEST.md` | Add to "Key Implementation Files" section |
| `docs/ARCHITECTURE_OVERVIEW.md` | Add new routes to route table |

### When Adding New Tables:

| Document | What to Update |
|----------|----------------|
| `docs/ARCHITECTURE_OVERVIEW.md` | Add to "Data Model" section |
| Regenerate `src/types/database.ts` | Run type generation command |

### When Completing Major Features:

| Document | What to Update |
|----------|----------------|
| `CHANGELOG.md` | Add entry under `[Unreleased]` |
| `package.json` | Consider version bump |
| vNEXT source doc | Mark feature as "✅ Implemented" |

### How to Mark vNEXT Docs as "Implemented":

In the relevant `docs/guidelight_ux_docs_bundle_vNEXT/*.md` file:
1. Find the section describing the feature you implemented
2. Add `✅` emoji before the heading or item
3. Or add a note: `**Status:** ✅ Implemented in Session XX`

---

## Session Document Template

Each session doc includes:
- **Pre-session checklist** (what to inspect before starting)
- **Goals and acceptance criteria**
- **Files to create/modify**
- **Implementation steps**
- **Canonical docs to update** (specific list per session)
- **Post-session documentation requirements**
- **Rollback plan**

---

## Related Documentation

- **Canonical Spec:** `docs/GUIDELIGHT_SPEC.md`
- **Design System:** `docs/GUIDELIGHT_DESIGN_SYSTEM.md`
- **Architecture:** `docs/ARCHITECTURE_OVERVIEW.md`
- **vNEXT Bundle:** `docs/guidelight_ux_docs_bundle_vNEXT/`
- **UX Overhaul:** `notes/251128_guidelight_ux_overhual/ai-dev/`

---

**Maintained by:** Xylent Studios  
**Last reviewed:** 2025-11-29

