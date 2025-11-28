---
**Status:** ✅ Active (Reference)  
**Last Updated:** 2025-11-28  
**Purpose:** Contribution guidelines for developers and AI agents
---

# 15_CONTRIBUTING_FOR_DEVS_AND_AGENTS

Audience: human developers and AI coding agents working on Guidelight.

The goal of this doc is to make sure everyone builds and changes the app in a way that matches the **reality-first MVP** and the UX docs in this folder.

---

## 1. Read This First (Order of Docs)

When you start work on Guidelight, skim these in this order:

1. `GUIDELIGHT_01_PRODUCT_OVERVIEW.md` (human-facing)
2. `GUIDELIGHT_02_UX_SUMMARY_FOR_STAFF_AND_MANAGERS.md` (human-facing)
3. `01_GUIDELIGHT_UX_PRINCIPLES_AND_CONTEXT.md`
4. `02_GUIDELIGHT_INFORMATION_ARCHITECTURE.md`
5. `03_SCREEN_SPECS_STAFF_MOBILE_MY_PICKS_AND_SHOW.md`
6. `04_SCREEN_SPECS_CUSTOMER_DISPLAY_MODE.md`
7. `05_TEAM_AND_AUTH_SPEC.md`
8. `06_PICKS_AND_LAB_INFO_MODEL.md`
9. `07_COMPONENT_LIBRARY_AND_STATES.md`
10. `08_KEY_USER_FLOWS_AND_EDGE_CASES.md`
11. `09_PHASED_ROADMAP_FOR_GUIDELIGHT_UI.md`

Only after this should you explore the rest of the repo and other docs (design philosophy, voice, accessibility, etc.).

---

## 2. What to Build First (Reality-First MVP)

Unless explicitly told otherwise, all new work should support or refine **Phase 1** MVP:

- My picks (staff home)
- Show to customer (full-screen view with category chips, All first)
- Team (single manager screen)
- Display Mode (full-screen, same content as Show to customer)

Do **not** start adding multiple boards, complex layouts, or analytics unless the roadmap has been updated to promote those items.

---

## 3. Core UX Rules You Must Respect

1. **My picks is home**
   - Authenticated users land on My picks.
   - Don’t introduce a different default home without updating the docs.

2. **Quick add vs optional details**
   - Create/edit forms must keep name/brand/category/rating/tags at the top.
   - Notes, lab info, uploads, etc. must be visually grouped as optional.
   - A budtender should be able to add a pick by filling only the quick section.

3. **Ordering of picks**
   - Defaults: rating desc, then updatedAt desc.
   - Don’t change sort behavior silently; if you do adjust it, update the model doc and screen spec.

4. **One-tap, safe Show to customer**
   - There must be a clearly labeled control to enter the full-screen customer view.
   - The customer view must not contain destructive actions or complex navigation.
   - Getting back to My picks must be obvious and safe.

5. **Minimal chrome**
   - Do not introduce sidebars or additional persistent bars on mobile without a very strong reason.
   - Prefer overlays, sheets, and modals for secondary actions.

6. **Managers are staff first**
   - Managers see and use My picks just like budtenders.
   - Team/admin capabilities live behind an intentional action (menu / Team entry).

---

## 4. When You Make Changes

If you change behavior that touches user experience, you should:

1. Update the corresponding spec file(s) in `ai-dev/`:
   - Screen changes → update screen specs.
   - Data changes → update the model doc.
   - New flows → update the flows doc.

2. Keep human-facing docs in sync where needed:
   - If you make a meaningful UX change, check whether the overview or summary needs a sentence updated.

3. Add a brief note to a `CHANGELOG` (if present) or to your PR description that references which doc sections you aligned with.

Do **not** treat these docs as “nice to have”; they are the source of truth for UX.

---

## 5. Open Questions / Safe Areas for Suggestion

Some areas are intentionally left flexible. You may propose improvements here if they still respect the MVP:

- Exact visual styling within the layouts (colors, spacing, typography within brand constraints).
- Microcopy improvements that keep the same meaning but read more clearly.
- Implementation details of list ordering, as long as:
  - Top-rated and recently edited picks still rise to the top.
  - Behavior is stable from the staff point of view.

If you propose a bigger change (e.g., new concepts like multiple boards, signatures, etc.), capture it in a separate “Future ideas” doc or ticket rather than silently shipping it into the MVP.
