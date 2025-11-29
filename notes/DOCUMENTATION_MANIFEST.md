# Guidelight Documentation Manifest

**Purpose:** Single source of truth for documentation status. Read this first when entering the repo.

**Last Updated:** 2025-11-29  
**Current Version:** v2.1.0 (vNEXT v2.2 Ready for Implementation)

---

## Quick Status

| Area | Status | Key Files |
|------|--------|-----------|
| **Phase 1 MVP** | ✅ Complete | All core features implemented |
| **Phase 2+ Enhancements** | Not started | Future work |
| **Category System** | ✅ Complete | Deals, Tinctures, Accessories added |
| **Effect Tags** | ✅ Complete | AIQ/Dispense-style, 3-tag limit |
| **Documentation** | ✅ Organized | All files have status markers |

---

## For New Agents: Start Here

1. **Understand the app:** Read `docs/GUIDELIGHT_SPEC.md` (note: UX sections superseded)
2. **See what's built:** Read `notes/GUIDELIGHT_MVP_PROGRESS.md` (latest entries at top)
3. **Understand decisions:** Read `notes/MVP_CRITICAL_DECISIONS.md`
4. **Code patterns:** Read `notes/DEV_QUICK_REFERENCE.md`

---

## Documentation Map

### Core Documentation (docs/)

| File | Status | Purpose |
|------|--------|---------|
| `INDEX.md` | ✅ Active | Central hub, links to everything |
| `GUIDELIGHT_SPEC.md` | ⚠️ Partially superseded | Product spec (UX sections replaced by ai-dev/) |
| `ARCHITECTURE_OVERVIEW.md` | ✅ Active | Technical architecture (updated for v2.0) |
| `GUIDELIGHT_DESIGN_SYSTEM.md` | ✅ Active | Colors, typography, theming |
| `UI_STACK.md` | ✅ Active | Component library reference |
| `USER_GUIDE_STAFF.md` | ⚠️ Needs update | Budtender guide (routes changed in v2.x) |
| `USER_GUIDE_MANAGER.md` | ⚠️ Needs update | Manager guide (routes changed in v2.x) |
| `AI_ASSISTANCE.md` | ✅ Active | Guide for AI tools |
| `GUIDELIGHT_DEV_AGENT.md` | ✅ Active | Cursor agent instructions |

### Planning & Decisions (notes/)

| File | Status | Purpose |
|------|--------|---------|
| `GUIDELIGHT_MVP_PROGRESS.md` | ✅ Active | Progress log (READ THIS for history) |
| `MVP_CRITICAL_DECISIONS.md` | ✅ Active | Decision records with rationale |
| `DEV_QUICK_REFERENCE.md` | ✅ Active | Code patterns, quick lookup |
| `DOCUMENTATION_STANDARDS.md` | ✅ Active | How to write docs |
| `GUIDELIGHT_MVP_IMPLEMENTATION_PLAN.md` | ✅ Complete | Original 8-step plan (done) |
| `GUIDELIGHT_MVP_SPRINT_PLAN.md` | 🗄️ Archived | Superseded by implementation plan |

### UX Overhaul Specs (notes/251128_guidelight_ux_overhual/ai-dev/)

| File | Status | Purpose |
|------|--------|---------|
| `01_UX_PRINCIPLES` | ✅ Reference | Principles (read for context) |
| `02_INFORMATION_ARCHITECTURE` | ✅ Implemented | Routes, entities, screens |
| `03_SCREEN_SPECS_STAFF_MOBILE` | ✅ Implemented | My Picks + Show to Customer |
| `04_SCREEN_SPECS_CUSTOMER_DISPLAY` | ✅ Implemented | Display Mode (POS/kiosk) |
| `05_TEAM_AND_AUTH_SPEC` | ✅ Implemented | Team management, auth |
| `06_PICKS_AND_LAB_INFO_MODEL` | ✅ Implemented (v9.2) | Pick data model, categories |
| `07_COMPONENT_LIBRARY` | ✅ Implemented | UI components |
| `08_KEY_USER_FLOWS` | ✅ Implemented | User flows |
| `09_PHASED_ROADMAP` | ✅ Phase 1 Complete | Roadmap (Phase 2+ pending) |
| `10-16` | ✅ Reference | Philosophy, guidelines, patterns |

### Archived (notes/archived/)

| File/Folder | Reason |
|-------------|--------|
| `STEP_7_STAFF_MANAGEMENT_PLAN.md` | Completed in v1.x |
| `RLS_MANAGER_POLICIES.sql` | Applied to production |
| `human-facing/` | Superseded, contains outdated info |

---

## What's Done (v2.1.0)

### Phase 1 MVP - COMPLETE
- [x] My Picks view with category tabs
- [x] Show to Customer overlay
- [x] Display Mode (public POS/kiosk)
- [x] Team management
- [x] React Router navigation
- [x] Category system with Deals support
- [x] Effect tags (17 curated + custom)
- [x] PickFormModal with single draft state

### Not Yet Started
- [ ] Phase 2: Visual enhancements, signature picks
- [ ] Phase 3: Multiple boards, analytics, advanced lab data

---

## vNEXT Implementation (v2.2 - Boards + Drafts)

**Location:** `docs/guidelight_vNEXT_implementation/`  
**Status:** 🚧 Ready for Implementation

| File | Purpose | Status |
|------|---------|--------|
| `PRE_IMPLEMENTATION_CHECKLIST.md` | Pre-flight checks, tool reference | ✅ Ready |
| `00_OVERVIEW.md` | Roadmap, status tracker, key decisions | ✅ Ready |
| `00_SESSION_SPEC_ALIGNMENT.md` | Session 00: Spec + Code Alignment (no code) | ⬜ Not Started |
| `01_SESSION_CORE_TABLES.md` | Session 01: boards, board_items, pick_drafts tables | ⬜ Not Started |
| `02_SESSION_USER_PREFS_PICKS_SCHEMA.md` | Session 02: user_preferences, picks schema updates | ⬜ Not Started |
| `03_SESSION_AUTO_BOARDS.md` | Session 03: Auto board creation | ⬜ Not Started |
| `04_SESSION_BOARDS_HOME.md` | Session 04: BoardsHomeView | ⬜ Not Started |
| `05_SESSION_BOARD_CANVAS_READONLY.md` | Session 05: Board canvas read-only | ⬜ Not Started |
| `06_SESSION_BOARD_CANVAS_DRAGDROP.md` | Session 06: Drag & drop | ⬜ Not Started |
| `07_SESSION_ADD_PICK_TO_BOARD.md` | Session 07: Add pick to board | ⬜ Not Started |
| `08_SESSION_TEXT_BLOCK_BOARD_CRUD.md` | Session 08: Text blocks, board CRUD | ⬜ Not Started |
| `09_SESSION_PICK_DRAFTS_API.md` | Session 09: Pick drafts API | ⬜ Not Started |
| `10_SESSION_PICKFORM_DRAFTS.md` | Session 10: PickFormModal drafts | ⬜ Not Started |
| `11_SESSION_MYPICKS_DRAFTS.md` | Session 11: My Picks drafts integration | ⬜ Not Started |
| `12_SESSION_VISIBLE_FIELDS.md` | Session 12: Visible fields system | ⬜ Not Started |
| `13_SESSION_DISPLAY_BOARDS.md` | Session 13: Display Mode boards | ⬜ Not Started |
| `14_SESSION_BOARD_SELECTOR.md` | Session 14: Board selector | ⬜ Not Started |
| `15_SESSION_PRODUCTS_TABLE.md` | Session 15: Products table | ⬜ Not Started |
| `16_SESSION_PRODUCT_SELECTION.md` | Session 16: Product selection in picks | ⬜ Not Started |
| `17_SESSION_PROFILE_MENU.md` | Session 17: Profile menu | ⬜ Not Started |
| `18_SESSION_USER_PREFS.md` | Session 18: User preferences persistence | ⬜ Not Started |
| `19_SESSION_RELEASES.md` | Session 19: Releases + What's New | ⬜ Not Started |
| `20_SESSION_ACTIVITY_EVENTS.md` | Session 20: Activity events | ⬜ Not Started |
| `CONFLICTS_AND_DECISIONS.md` | Enum conflicts, semantic decisions, known issues | ✅ Ready |
| `SESSION_LOG.md` | Progress tracking between sessions | ✅ Ready |

### vNEXT Source Docs

**Location:** `docs/guidelight_ux_docs_bundle_vNEXT/`

| File | Status |
|------|--------|
| `00_README.md` | ✅ Updated with implementation status |
| `09_DECISION_LOG_AND_REFINEMENTS.md` | ✅ Updated with DB enum reality |
| Other files | 📋 Reference for implementation |

---

## Key Implementation Files

### Views
- `src/views/MyPicksView.tsx` - Staff home
- `src/views/DisplayModeView.tsx` - Public display
- `src/views/StaffManagementView.tsx` - Team management

### Components
- `src/components/picks/PickFormModal.tsx` - Add/edit picks
- `src/components/picks/ShowToCustomerOverlay.tsx` - Customer overlay
- `src/components/ui/CategoryChipsRow.tsx` - Category filter
- `src/components/ui/HeaderBar.tsx` - Flexible header

### Data
- `src/lib/constants/effectTags.ts` - Effect tags, category fields
- `src/types/pickDraft.ts` - Pick form state
- `src/types/database.ts` - Supabase types

---

## How to Update This Manifest

When you complete significant work:
1. Update the "What's Done" section
2. Update file status if changed
3. Add new key files if created
4. Update the version number



