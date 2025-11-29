# 06 — Persistence, Drafts & SPA Behavior

This document captures how Guidelight should handle saving and restoring state, across tabs and devices, using patterns familiar from flagship apps (Gmail, Google Docs, Figma, Trello).

---

## Goals

1. **Never lose user work**
   - Drafts should survive:
     - Closing the tab
     - Closing the browser
     - Logging in from another device
   - Board layouts should always be in the same state the user left them.

2. **Stable, predictable live state**
   - Customers never see half-finished edits.
   - Staff understand clearly when something is “draft” vs “live”.

3. **Modern SPA behavior**
   - Navigating within the app never hard-reloads the page.
   - React root is not re-mounted just because a browser tab was backgrounded/foregrounded.

---

## Picks: draft behavior

### Storage

- **Published picks** live in `picks`.
- **In-progress work** (both new picks and edits) lives in `pick_drafts`.

`pick_drafts` is persisted on the backend so drafts follow the user across devices.

Optional: local storage copy for faster initial load, but backend is the source of truth.

### Lifecycle

- When creating a new pick:
  - A draft is created in `pick_drafts` for `user_id` with `pick_id = null`.
  - As the user types, the draft is kept up to date (debounced autosave).
  - The draft appears in My Picks with a “Draft” badge.

- When editing an existing pick:
  - If a draft exists for (`user_id`, `pick_id`), it is loaded.
  - If not, a new draft is created from the current `picks` row.
  - Edits only affect the draft until explicitly published.

- When **Publish** is pressed:
  - New pick:
    - `picks.insert(draft.data...)`
    - `pick_drafts.delete(where user_id, pick_id is null)`
  - Edit:
    - `picks.update(where id = pick_id, set = draft.data...)`
    - `pick_drafts.delete(where user_id, pick_id)`
  - UI reloads data from `picks`.

- When **Cancel / Discard** is pressed:
  - `pick_drafts.delete(...)`
  - UI reverts to the last published pick (or removes the draft from My Picks if it was new).

---

## Boards: autosave behavior

Boards are treated like collaborative canvases (Figma, Miro, Notion pages):

- Any change the user makes on the canvas:
  - Adding/removing a board item.
  - Moving cards or text blocks.
  - Renaming the board.
- Is applied immediately to the local state, and persisted with a **debounced autosave** to `boards` and `board_items`.

There is no separate “Board draft” concept for layout:

- The board itself can be Published or Unpublished, but its content is always synced.
- Staff trust that if they move a card, that move is saved and will be there on another device.

---

## SPA navigation and no hard reloads

To behave like a first-class web app:

- Use client-side routing for all internal navigation:
  - React Router `<Link>` or equivalent.
  - No `window.location` or `location.reload()` for in-app links.
  - Avoid raw `<a href>` for routes inside the app.

- Configure hosting so:
  - Route changes don’t result in a full HTML reload.
  - Static assets are cached sensibly.

Result:

- When a browser tab is backgrounded and resumed, the app resumes where it left off.
- Drafts and board layouts do not disappear due to a hard reload.

---

## Last route / resume behavior

To give users a “pick up where I left off” experience:

- Maintain a `user_preferences` entry per user.
- On each route change:
  - Update `user_preferences.last_route` and, when relevant, `last_board_id`.

On login/app open:

1. Fetch `pick_drafts` for the user:
   - If there are drafts, surface them in the UI (e.g. a small banner or Drafts section).
   - Do **not** forcibly redirect into an old editor; drafts are discoverable but non-blocking.

2. If no special handling is needed:
   - Navigate to `user_preferences.last_route`, if present.
   - Fallback to a default such as `/boards`.

This mirrors behavior from tools like Notion or Figma: on reopen, you generally land in the last workspace or document you were using.

---

## Visibility and “eye” toggles

Field visibility is per-pick and stored in `visible_fields`:

- This avoids complex per-board overrides for now.
- It matches patterns from:
  - Figma layer visibility
  - Photoshop’s eye icon
  - Notion’s “hide/show property” patterns (but at the object level).

Edits to visibility:

- Affect all places where the pick is shown.
- Only apply to the live pick when the draft is published.

---

## Offline / flaky network behavior (nice-to-have)

While not required for MVP, this model can extend to:

- Keeping edits in local state and local storage while in-flight.
- Retrying failed draft saves.
- Showing a small “Saving… / Saved” indicator in the pick editor and board canvas.

Even without full offline support, the main experience should mirror apps like Google Docs:

- Most saves are quiet and fast.
- Occasionally, subtle indicators reassure the user that their work is safe.

---

## Summary

- Picks:
  - Drafts saved server-side until Publish or Cancel.
  - Published picks are the only truth visible to customers and boards.

- Boards:
  - Always autosaved when edited.
  - Published/unpublished controls which boards show up in customer-facing contexts.

- App shell:
  - Behaves like a modern SPA.
  - Remembers where users left off.
  - Never surprises them by losing work or unexpectedly resetting state.
