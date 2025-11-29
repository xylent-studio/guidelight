# Guidelight UX & Product Spec — vNEXT (Boards + Drafts Layer)

---
**Status:** 📋 Planning Complete | Implementation Roadmap Created  
**Last Updated:** 2025-11-29  
**Implementation Plan:** See `docs/guidelight_vNEXT_implementation/`

---

## Implementation Status

| Area | Status | Sessions |
|------|--------|----------|
| Spec Alignment | ✅ Complete | 00 |
| Data Model | ⬜ Not Started | 01-03 |
| Boards Core | ⬜ Not Started | 04-08 |
| Pick Drafts | ⬜ Not Started | 09-12 |
| Display Mode | ⬜ Not Started | 13-14 |
| Product Catalog | ⬜ Not Started | 15-16 |
| Profile & Prefs | ⬜ Not Started | 17-18 |
| Releases & Activity | ⬜ Not Started | 19-20 |

**Legend:** ⬜ Not Started | 🔄 In Progress | ✅ Complete

---

This bundle sits **on top of** the existing Guidelight product + UX documentation that already lives in the repo:

- `docs/GUIDELIGHT_SPEC.md` — core product + technical spec (MVP);
- `docs/GUIDELIGHT_DESIGN_SYSTEM.md` — full visual system (palette, typography, components);
- `docs/BUDTENDER_PICKS_BOARD_SPEC.md` and `docs/BUDTENDER_PICKS_BOARD_TECH_DESIGN.md` — the original customer-facing Budtender Picks Board;
- `notes/251128_guidelight_ux_overhual/ai-dev/*.md` — the v9 UX overhaul (My Picks, Show to customer, Display Mode, team/auth, etc.).

Those documents describe the **current, implemented reality** of Guidelight v2.0.

This vNEXT bundle assumes all of that exists and is roughly correct, and focuses on the **next layer of functionality and cohesion**:

- Picks are authored and edited via **drafts** that feel like Gmail / blog editors:
  - Work-in-progress is always saved.
  - Nothing changes in the live app until the budtender explicitly publishes.
- Boards become **canvas-like layouts** (similar to Figma / Notion pages):
  - Auto-generated boards for the store and each budtender.
  - Custom boards with names, text blocks, and freely arranged pick cards.
  - Boards are always autosaved and sync across devices.
- Customer-facing views only ever show:
  - **Published picks** on **published boards**.
- The existing **My Picks** and **Display Mode** flows are **extended**, not replaced.

Think of this bundle as: **“How to turn the current Guidelight into the full board + drafts product we’ve been imagining.”**

The rest of the files in this bundle break that down into product vision, information architecture, data model, flows, and implementation notes. Where there is any conflict between this bundle and the repo’s existing docs, treat the older docs as **“current state”** and this bundle as the **“target state / extension.”**

---

# Guidelight UX & Product Spec — vNEXT

This bundle captures the updated product direction for Guidelight based on the current vision:

- Picks are authored and edited via **drafts** that feel like Gmail / blog editors:
  - Work-in-progress is always saved.
  - Nothing changes in the live app until the budtender explicitly publishes.
- Boards are **canvas-like layouts** (similar to Figma / Miro / Notion pages):
  - Auto-generated boards for the store and each budtender.
  - Custom boards with names, text blocks, and freely arranged pick cards.
  - Boards are always autosaved and sync across devices.
- Customer-facing views only ever show:
  - **Published picks** on **Published boards**.

The rest of the files in this bundle break this down into product vision, information architecture, data model, flows, persistence rules, and UI patterns.

---

## Key Files in This Bundle

| File | Purpose | Implementation |
|------|---------|----------------|
| `01_PRODUCT_VISION` | Core principles | Reference only |
| `02_INFORMATION_ARCHITECTURE` | Routes, entities | Sessions 04, 13 |
| `03_PICKS_AND_BOARDS_DATA_MODEL` | Tables, schema | Sessions 01-03, 15 |
| `04_USER_FLOWS_STAFF` | Staff workflows | Sessions 04-08 |
| `05_USER_FLOWS_CUSTOMER` | Customer flows | Sessions 13-14 |
| `06_PERSISTENCE_AND_DRAFTS` | Autosave, drafts | Sessions 09-12, 18 |
| `07_UI_PATTERNS` | Components | Sessions 04-12 |
| `08_NAVIGATION` | Board selector | Session 14 |
| `09_DECISION_LOG` | Decisions | Reference, updated for enum fixes |
| `10_ACCOUNTS_PROFILE` | Profile, releases | Sessions 17, 19 |
| `11_PRODUCT_CATALOG` | Products table | Sessions 15-16 |
| `13_ACTIVITY_LOG` | Activity events | Session 20 |
| `14_DESIGN_SYSTEM` | Visual delta | Reference only |
| `15_IMPLEMENTATION_CHECKLIST` | Checklist | Superseded by session docs |

---

## Known Doc vs Reality Conflicts

See `docs/guidelight_vNEXT_implementation/CONFLICTS_AND_DECISIONS.md` for:
- Enum value mismatches (intensity, experience_level, budget_level)
- `status` vs `is_active` semantics
- `visible_fields` behavior
- Auto boards representation

