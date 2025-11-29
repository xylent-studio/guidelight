# 15 — Implementation Checklist (Aligned with Current Codebase)

> **Context:** The existing repo already implements a large portion of the core product:
>
> - My Picks (staff view) with ratings, effect tags, and category filters.
> - Display Mode (customer-ish view) with house list and “pick a budtender” behavior.
> - A first version of the Budtender Picks Board layout wired to example data.
> - The full visual system (design tokens, components) described in `docs/`.
>
> This checklist should be read as a **“from here → to vNEXT”** roadmap, not as if we were starting from zero.
>
> When an item sounds like “implement X”, interpret it as:
>
> - **Audit what already exists in the repo.**
> - **Extend or refactor it** to meet the vNEXT spec (boards, drafts, product catalog, etc.).
> - Preserve existing behavior unless the vNEXT docs explicitly say to change it.
>
> In other words: **treat current code and docs as current state**, and this checklist as the **target extension.**


# 15 — Implementation Checklist (Dev/Agent Guide)

This document turns the UX + data model decisions into a concrete, high-level checklist for implementers (human or AI agents). It does not replace detailed tickets, but it gives the correct sequence and priorities.

---

## Phase 1 — Data model & persistence

1. **Update database schema**
   - Add/confirm:
     - `products`
     - `picks`
     - `pick_drafts`
     - `boards`
     - `board_items`
     - `activity_events`
     - `user_preferences`
   - Ensure picks reference both:
     - `product_id` (fk → products)
     - Denormalized product fields (name, brand, type, etc.).

2. **Add user profile fields**
   - Extend `users` (or profile table) with:
     - `display_name`
     - `avatar_url`
     - `role`
     - `tagline`
     - `specialties` (optional).

3. **Add release tracking**
   - Introduce `releases` collection/table (or equivalent).
   - Add `last_seen_release_id` to `user_preferences`.

4. **Drafts**
   - Implement `pick_drafts`:
     - `user_id`, `pick_id` (nullable), draft data blob, timestamps.
   - Enforce unique (`user_id`, `pick_id`) for edit drafts.

---

## Phase 2 — Picks & drafts UX

5. **Pick editor with autosaved drafts**
   - New pick:
     - Start with product selection (attach `product_id` and snapshot fields).
     - Save as a draft as the user types (debounced autosave).
   - Edit pick:
     - Load or create draft based on existing pick.
   - Cancel:
     - Delete draft, keep published pick unchanged.
   - Publish:
     - Create or update `picks`.
     - Delete draft.

6. **My Picks list**
   - Show:
     - Product name, brand, type, rating, time-of-day, status chip.
   - Filters:
     - Published vs Drafts.
   - Drafts should be clearly labeled and ordered by `updated_at`.

7. **Visibility controls**
   - Implement eye toggles per field in the editor.
   - Store visible fields in `visible_fields`.
   - Ensure both collapsed and expanded customer views respect `visible_fields`.

---

## Phase 3 — Boards & layout

8. **Auto boards (smart grids)**
   - Auto user board:
     - All picks where `budtender_id = user`, `status = published`, `is_active = true`.
   - Auto store board:
     - All published, active picks for the store.
   - Grid layout:
     - Group by product_type.
     - Sort by rating desc, `last_active_at` desc.

9. **Custom boards (canvas)**
   - Boards home:
     - List auto and custom boards with type/status chips.
   - Canvas editor:
     - Draggable pick cards and text blocks.
     - Autosave layout to `board_items`.
   - Add pick to board:
     - Existing pick picker with filters and search.

10. **Board publish/unpublish**
    - Add status toggle for boards.
    - Only published boards appear in customer/display selectors.

---

## Phase 4 — Display mode & customer view

11. **Display route**
    - Implement `/display/:boardId`:
      - Render one board in full-screen, present mode.
      - Cards with collapsed/expanded behavior.
      - Respect `visible_fields`.

12. **Board selector in display mode**
    - For staff-held devices:
      - Add minimal selector for switching between **published** boards.
    - For kiosks:
      - Allow configuration to hide the selector and lock to one board.

13. **“Show to customer” flow**
    - From board editor, add:
      - “Show to customer” button → navigates to display mode.
    - Hide edit controls in display mode.

---

## Phase 5 — SPA behavior & routing

14. **SPA-only navigation**
    - Ensure all internal routes use client-side routing.
    - Remove any `window.location` / `location.reload()` usage for navigation.
    - Fix any behavior where tab switching causes a full reload.

15. **Last route & preferences**
    - Update `user_preferences.last_route` and `last_board_id` on route changes.
    - On login:
      - Restore last route if valid, else `/boards`.

---

## Phase 6 — Profile, guest mode & release notes

16. **Profile avatar & menu**
    - Add avatar top-right with:
      - My Profile
      - Preferences
      - What’s new
      - Help & Feedback
      - Sign out (for authenticated users).

17. **Guest mode**
    - Entry screen:
      - Sign in (primary) + Continue as guest (secondary).
    - Guest:
      - Can only view published boards/picks in display-style views.
      - Profile menu shows “You’re browsing as Guest” + Sign in.

18. **Release notes**
    - Implement `releases` backed “What’s new” panel.
    - Toast on new release if `last_seen_release_id` is outdated.
    - Update `last_seen_release_id` when user views/dismisses.

---

## Phase 7 — Activity & history

19. **Activity logging**
    - Hook into key actions:
      - PICK_CREATED, PICK_PUBLISHED, PICK_ARCHIVED.
      - BOARD_CREATED, BOARD_UPDATED, BOARD_PUBLISHED/UNPUBLISHED.
      - BOARD_ITEM_ADDED/REMOVED.

20. **Activity UI**
    - Manager view: Recent Activity feed with filters.
    - Board header: “Last updated by {name} at {time}”.
    - Pick editor: last updated snippet.

---

## Phase 8 — Polish & visual system

21. **Apply design system**
    - Audit components for:
      - Semantic color tokens.
      - Consistent typography and spacing.
      - Proper use of chips, cards, buttons.
    - Check responsive behavior on:
      - Desktop.
      - Tablet.
      - Phone.
      - 16:9 display.

22. **Empty and error states**
    - Implement friendly empty states for:
      - My Picks (no picks/drafts).
      - Boards (no boards, or no items on a board).
      - Display mode (unpublished/missing board).
    - Implement non-scary error messages for:
      - Failed data loads.
      - Missing entities.

---

## Phase 9 — Future/optional

23. **Product catalog integration**
    - Implement CSV import or POS/menu sync.
    - Use `external_id` to map products to external systems.

24. **Multi-store support (future)**
    - Add `store_id` to picks, boards, users.
    - Scope data per store.

Agents and devs should treat this checklist as the **roadmap** for evolving the current codebase toward the vNEXT Guidelight spec.

---

## Update: Board-level “Add pick” behavior

When implementing steps 8–10 above, ensure that:

- The board canvas toolbar exposes a single **Add pick** entry point.
- Clicking **Add pick** allows the user to either:
  - Choose from **existing picks** (with search + filters), or
  - Create a **new pick in-context**, which:
    - Walks through product selection + pick editor.
    - Automatically attaches the newly saved pick to the current board.
- Editing a pick from the board opens the same pick editor used elsewhere, with draft autosave and publish/cancel behavior.

This keeps the board workflow self-contained so budtenders never have to leave a board just to add, reuse, or tweak a recommendation.
