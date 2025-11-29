# 03 — Data Model (Conceptual)

This document defines a conceptual data model for Guidelight vNEXT. Exact column names and types can be adapted to Supabase / Postgres conventions, but the semantics should stay consistent.

---

## Picks

**Table: `picks`**

Represents published picks only. Drafts live in `pick_drafts`.

Suggested fields:

- `id` (uuid, pk)
- `budtender_id` (uuid, fk → users)
- `category_id` (uuid, optional fk to product category)
- `product_name` (text)
- `brand` (text)
- `product_type` (text)
- `time_of_day` (text) — `day | evening | night | anytime`
- `effect_tags` (text[]) — array of short strings
- `intensity` (text) — `gentle | moderate | strong`
- `experience_level` (text) — `new | intermediate | heavy`
- `budget_level` (text) — `$ | $$ | $$$` (or just a short string)
- `one_liner` (text)
- `why_i_love_it` (text)
- `rating` (numeric or float)
- `potency_summary` (text) — short single-line string
- `top_terpenes` (text)
- `package_size` (text)
- `is_infused` (boolean)
- `format` (text) — e.g. indoor, multi-pack, tincture, nano, etc.
- `status` (text) — `published | archived`
- `visible_fields` (text[]) — which fields are included in customer-facing cards
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

`visible_fields` defines which properties show in the customer card / expanded view. Example:

```json
[
  "product_name",
  "brand",
  "product_type",
  "one_liner",
  "time_of_day",
  "effect_tags",
  "rating",
  "potency_summary",
  "package_size"
]
```

In the UI, this is controlled by an “eye” icon per field in the pick editor.

---

## Pick Drafts

**Table: `pick_drafts`**

Stores in-progress work for creating or editing picks. Drafts are user-specific and are not visible to customers.

Fields:

- `id` (uuid, pk)
- `user_id` (uuid, fk → users)
- `pick_id` (uuid, nullable, fk → picks)
  - `null` when creating a completely new pick.
  - non-null when editing an existing pick.
- `data` (jsonb) — full form state, usually matching the shape of a pick plus any UI-only metadata.
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

Constraints:

- Unique constraint on `(user_id, pick_id)` so each user has at most one draft per pick.
- For `pick_id` null drafts, uniqueness can be per-user or use a separate convention if multiple “new” drafts are allowed.

Behavior:

- Drafts are auto-saved as the user types (debounced).
- On **Save**:
  - If `pick_id` is null → create a new `picks` row and delete the draft.
  - If `pick_id` is set → update that `picks` row and delete the draft.
- On **Cancel**:
  - Delete the draft.
  - Leave the `picks` row untouched.

---

## Boards

**Table: `boards`**

Stores metadata about all boards.

Fields:

- `id` (uuid, pk)
- `name` (text)
- `type` (text) — `auto_store | auto_user | custom`
- `owner_user_id` (uuid, fk → users, nullable for auto boards)
- `description` (text, nullable)
- `status` (text) — `published | unpublished`
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

Behavior by type:

- `auto_store`
  - Programmatically derived from all published picks.
  - May still have board_items to control layout.
- `auto_user`
  - Derived from published picks for a given `budtender_id`.
- `custom`
  - Fully authored by staff; contents are defined entirely by `board_items`.

Published boards appear in customer-facing selectors. Unpublished boards do not.

---

## Board Items

**Table: `board_items`**

Represents items placed on the board canvas.

Fields:

- `id` (uuid, pk)
- `board_id` (uuid, fk → boards)
- `type` (text) — `pick | text`
- `pick_id` (uuid, nullable, fk → picks) — required when type = `pick`
- `text_content` (text, nullable) — required when type = `text`
- `position_x` (numeric) — canvas coordinate
- `position_y` (numeric) — canvas coordinate
- `layout_variant` (text, nullable) — `compact | detailed | hero` (extendable)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

Notes:

- Positions are in canvas units (pixels or an abstract grid).
- Layout variant can be used to render some cards bigger (hero picks) and some smaller.

---

## Users

Guidelight can rely on the host authentication (Supabase auth) but conceptually:

**Table: `users`** (or use auth.users)

- `id` (uuid)
- `name` (text)
- `email` (text)
- `role` (text: `budtender | manager | admin`)
- `avatar_url` (text)
- `is_active` (boolean)
- `created_at`, `updated_at`

---

## User Preferences

**Table: `user_preferences`**

Remembers where the user was and other small preferences.

- `user_id` (uuid, pk, fk → users)
- `last_route` (text, nullable)
- `last_board_id` (uuid, nullable)
- `updated_at` (timestamptz)

Usage:

- On route changes, update `last_route` (and `last_board_id` when applicable).
- On login / app open, restore the user to `last_route` if no drafts require attention.

---

## Display / Device Binding (future)

If the app needs to remember which board is pinned to which physical screen:

**Table: `display_endpoints`** (optional future)

- `id` (uuid, pk)
- `name` (text) — e.g. “Front TV”, “Window Kiosk”
- `board_id` (uuid, fk → boards)
- `created_at`, `updated_at`

Devices could hit `/display/:displayEndpointId` and the backend uses this to load the correct board.

---

## Summary

- **Picks**: the authoritative record of live recommendations.
- **Pick Drafts**: safe, per-user sandboxes for in-progress creation and edits.
- **Boards**: named canvases (auto or custom) with a published/unpublished status.
- **Board Items**: the layout of picks and text on those canvases.
- **User Preferences**: a small layer of convenience to restore the user’s last workspace.

This model is intentionally simple and maps closely onto familiar content tools (Gmail drafts, Notion pages, Trello boards), while supporting Guidelight’s specific needs around staff picks and board-based displays.

---

## Update: User Preferences fields (release notes)

In addition to `last_route` and `last_board_id`, `user_preferences` also tracks which release notes a user has seen:

- `last_seen_release_id` (uuid, nullable, fk → releases)

This allows Guidelight to show a "What’s new" toast when a new release is available and hide it after the user has either viewed or dismissed the notes.
