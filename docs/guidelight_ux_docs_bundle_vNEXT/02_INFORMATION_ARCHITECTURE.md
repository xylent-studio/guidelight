> ℹ️ **Context**
>
> The core IA for Guidelight (My Picks, Show to customer, Display Mode, Team) is already defined and partially implemented in:
>
> - `notes/251128_guidelight_ux_overhual/ai-dev/02_GUIDELIGHT_INFORMATION_ARCHITECTURE.md`
> - `notes/251128_guidelight_ux_overhual/ai-dev/03_SCREEN_SPECS_STAFF_MOBILE_MY_PICKS_AND_SHOW.md`
> - `notes/251128_guidelight_ux_overhual/ai-dev/04_SCREEN_SPECS_CUSTOMER_DISPLAY_MODE.md`
>
> This vNEXT IA document should be read as an **extension** of that reality-first IA. It adds:
>
> - Boards as first-class entities (auto + custom);
> - Board canvas behavior for staff;
> - Product catalog as a first-class entity;
> - Drafts, activity, and preferences layers.
>
> Wherever this file differs from the existing IA, treat that as a **target state** for the next phase, not a description of what’s already shipped.


# 02 — Information Architecture

This document describes the main entities and top-level navigation structure for Guidelight vNEXT.

---

## Core entities

### 1. User / Budtender

Represents a staff member using Guidelight.

Key properties (conceptual):

- `id`
- `name`
- `role` (budtender, shift lead, manager)
- `email`
- `avatar_url` (optional)
- `is_active`

Used for:

- Ownership of picks and custom boards.
- Auto-generated boards per budtender.
- Displaying “Who’s guiding this board?” in customer view.

---

### 2. Pick (published)

A published recommendation from a specific budtender for a specific product.

Key properties (high level):

- Identity & product info
  - `id`
  - `budtender_id`
  - `product_name`
  - `brand`
  - `product_type` (flower, pre-roll, vape, edible, beverage, concentrate, wellness, topical, other)
  - `category_id` (links to store’s category taxonomy if needed)

- Narrative & context
  - `one_liner` — short hook that can fit on a card
  - `why_i_love_it` — longer explanation, visible in expanded view
  - `time_of_day` — Day / Evening / Night / Anytime
  - `effect_tags` — list of vibe tags (Relaxed, Social, Focus, Sleep, etc.)
  - `intensity` — gentle / moderate / strong (simple scale)
  - `experience_level` — New / Intermediate / Heavy
  - `budget_level` — $ / $$ / $$$ (when used)

- Metrics & quality
  - `rating` — 1–5 stars (float)
  - `potency_summary` — short line like `THC 27% · CBD 1%` or `1:1:1 THC:CBD:CBG`
  - `top_terpenes` — optional short string

- Packaging / format
  - `package_size` — e.g. `3.5g`, `0.5g 5 pack`, `10mg x 20`
  - `is_infused` — boolean
  - `format` — indoor, outdoor, multi-pack, tincture, etc.

- Visibility & lifecycle
  - `status` — `published` or `archived`
  - `visible_fields` — string array of which fields are shown in customer-facing cards
  - `created_at`, `updated_at`

Only **published picks** are visible on auto boards, custom boards, and in customer views.

---

### 3. Pick Draft

Represents in-progress edits or new picks that are not yet published.

Key properties:

- `id`
- `user_id` (budtender working on it)
- `pick_id` (nullable)
  - `null` = brand new pick draft
  - non-null = draft edits for an existing published pick
- `data` (JSON) — entire form state
- `created_at`
- `updated_at`

Behavior:

- Drafts are **auto-saved** as the user types.
- Drafts are visible to that user in the staff UI (e.g. as “Draft” rows).
- Drafts do **not** appear on boards or in any customer-facing view.
- Publishing a draft:
  - For `pick_id = null`: creates a new Pick and deletes the draft.
  - For `pick_id != null`: updates the existing Pick and deletes the draft.
- Cancelling a draft:
  - Deletes the draft.
  - Leaves the existing Pick unchanged (if any).

---

### 4. Board

A named board that can be edited on a canvas and shown to customers.

Board types:

- `auto_store` — the store-wide “All Staff Picks” board.
- `auto_user` — per-budtender “All Picks – {Name}” board.
- `custom` — arbitrary named boards staff create (e.g. “Sleep & Recovery”, “New Guests Starters”).

Key properties:

- `id`
- `name`
- `type` — `auto_store | auto_user | custom`
- `owner_user_id` (for custom boards)
- `description` (optional)
- `status` — `published | unpublished`
- `created_at`, `updated_at`

Published boards are available from customer-facing contexts. Unpublished boards are staff-only.

---

### 5. Board Item

An item placed on a board’s canvas.

Types:

- `pick` — a visual card for a single Pick.
- `text` — a text block (title, section heading, note).
- (Future) `image`, `divider`, etc.

Key properties:

- `id`
- `board_id`
- `type` — `pick | text`
- `pick_id` (nullable; required when type = pick)
- `text_content` (nullable; required when type = text)
- `position_x`, `position_y` — coordinates on the canvas
- `layout_variant` — optional (e.g. `compact | detailed`)
- `created_at`, `updated_at`

Positions are managed by the canvas and autosaved as staff drag and arrange items.

---

### 6. User Preferences

Remembers where the user was and how they prefer to work.

Key properties:

- `user_id`
- `last_route` — last meaningful route (e.g. `/boards/{id}`)
- `last_board_id` — board they were last editing or viewing
- `updated_at`

On login or re-open, Guidelight can use this to restore the user to their last workspace (unless they explicitly choose something else).

---

## Top-level navigation

### Main routes (staff side)

- `/login` — authentication.
- `/boards` — Boards home:
  - Sections for Auto boards, My boards, Shared boards.
  - Entry point to board canvas editor.
- `/boards/:boardId` — Board canvas editor:
  - Drag-and-drop canvas.
  - Add pick / add text.
  - Publish/unpublish toggle.
  - Board picker to jump between boards.
- `/picks` — My Picks list:
  - Published picks and drafts.
  - Create new / edit existing.
- `/picks/:pickId/edit` — Pick editor (or modal).
- `/settings` — (future) personal preferences, theme, etc.

### Main routes (customer / display side)

- `/display/:boardId` — Full-screen customer view for a specific board:
  - Read-only layout.
  - Tap/click expands cards.
  - Only shows published boards and published picks.
- `/display` (optional) — Store display selector:
  - Choose which published board to show on this screen.

---

## Mental model summary

- **Picks** are like individual email messages or blog posts:
  - Can exist as drafts or published.
  - Only published picks show up on boards and in customer view.

- **Boards** are like playlists or project boards:
  - Auto boards for “all picks by X”.
  - Custom boards you name, arrange, and publish.
  - Boards are always autosaved when edited and can be published/unpublished.

- **Customer view** is a clean playback mode:
  - Chooses one published board at a time.
  - Never shows draft picks or unpublished boards.

---

## Update: Accounts, Profile Menu & Guest Mode

### Global profile avatar

- A profile avatar appears in the top-right corner of the authenticated app shell.
- It opens a profile menu with:
  - My Profile
  - Preferences
  - What’s New (release notes)
  - Help & Feedback (ties into the reporting bubble)
  - Sign out
- Managers/Admins may see additional entries (Team & Permissions, Display settings) as features are added.

### Guest mode

- When no auth session exists, users see:
  - A sign-in screen with:
    - Primary: Sign in
    - Secondary: Continue as guest
- Guest mode:
  - Is read-only.
  - Allows viewing published boards/picks in display views.
  - Disables creating/editing picks and boards.
- The guest profile menu clearly labels the session as Guest and offers a Sign in action to upgrade to a full account.
