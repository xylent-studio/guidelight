# 13 — Activity & Audit Log

This document describes a simple yet powerful activity system so managers (and you) can see what changed, when, and by whom, without turning Guidelight into a complex analytics product.

---

## 1. Goals

- Provide a clear **timeline of changes**:
  - New picks created.
  - Picks published/updated.
  - Boards created/updated/published.
- Help debug “why does the board look different today?”
- Support light accountability without feeling like surveillance.

---

## 2. Activity model

### 2.1 `activity_events` table (conceptual)

Fields:

- `id` (uuid).
- `created_at` (timestamp).
- `user_id` (fk → users).
- `event_type` (string/enum).
- `entity_type` (string/enum) — `pick | board | user | other`.
- `entity_id` (uuid).
- `metadata` (jsonb) — small structured payload for extra info.

Recommended `event_type` values (MVP):

- `PICK_CREATED`
- `PICK_PUBLISHED`
- `PICK_UNPUBLISHED` (if we ever add this separately)
- `PICK_UPDATED`
- `PICK_ARCHIVED`
- `BOARD_CREATED`
- `BOARD_UPDATED`
- `BOARD_PUBLISHED`
- `BOARD_UNPUBLISHED`
- `BOARD_ITEM_ADDED`
- `BOARD_ITEM_REMOVED`

Metadata examples:

- For `PICK_PUBLISHED`:
  - `{ "pick_name": "Blue Lobster", "product_type": "flower", "rating": 4.5 }`
- For `BOARD_UPDATED`:
  - `{ "board_name": "Sleep & Recovery", "reason": "layout_change" }`

---

## 3. When events are created

Events are created on significant actions:

- Creating a pick draft → `PICK_CREATED`.
- Publishing a new pick or publishing edits → `PICK_PUBLISHED`.
- Archiving a pick → `PICK_ARCHIVED`.
- Creating a new board → `BOARD_CREATED`.
- Changing board layout (canvas) → `BOARD_UPDATED` (debounced; not per-drag).
- Publishing/unpublishing a board → `BOARD_PUBLISHED` / `BOARD_UNPUBLISHED`.
- Adding/removing a pick from a custom board → `BOARD_ITEM_ADDED` / `BOARD_ITEM_REMOVED`.

We avoid logging micro events (every keystroke). Events are high-level.

---

## 4. Activity UI

### 4.1 Global “Recent activity” view (for managers/admins)

Accessible via:

- Navigation item like **Activity** or under a **Manager** section.
- Shows a reverse-chronological feed:

Each entry:

- Avatar + display_name of user.
- Short description:
  - “AllDay published pick ‘Blue Lobster’ (flower).”
  - “Justin updated board ‘Sleep & Recovery’.”
- Timestamp (relative “2h ago”, with tooltip for full date/time).
- Optional icon for type (star for pick, grid/card icon for board).

Filters:

- By entity_type (Picks/Boards).
- By user.
- By time range (Today, Last 7 days, etc.) — nice to have.

### 4.2 Board-level activity snippet

On a board canvas (`/boards/:boardId`):

- Show a subtle line near the header:

> “Last updated by **Justin** · 2 hours ago”

On click, optionally open a small board-specific activity popover:

- “AllDay added pick ‘Blue Lobster’.”
- “Justin rearranged picks on the canvas.”

### 4.3 Pick-level activity snippet

On pick editor:

- Show “Last updated by {display_name} at {time}” pulled from the latest relevant event.

---

## 5. Permissions

- Budtenders:
  - Can see activity that involves:
    - Their own picks.
    - Boards they have access to.
- Managers/Admins:
  - Can see all activity across the store.

This keeps things transparent without overwhelming budtenders with global noise.

---

## 6. Summary

- `activity_events` gives us a simple, explicit trail of what changed.
- Managers get a global Activity feed to understand the system’s “heartbeat.”
- Boards and picks surface “last updated” info in a friendly, human way.
- We stay away from creepy fine-grained tracking and focus on meaningful events.
