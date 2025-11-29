# 12 — Budtender Identity & “Guided by” Experience

This document defines how Guidelight surfaces budtender identity in a consistent, relatable way that makes boards feel human-led, not just like generic menus.

---

## 1. Budtender profile fields

Extend the user profile with fields that matter at the counter:

- `display_name` (string) — what shows to other staff and guests.  
  - Example: “AllDay”, “Justin”, “Nate”.
- `full_name` (string) — for internal use (e.g. “Justin Michalke”).
- `avatar_url` (nullable, string) — profile photo or simple generated avatar.
- `role` (enum) — `budtender | manager | admin`.
- `tagline` (nullable, string) — short 1-liner:
  - e.g. “Sativa sage + edible nerd.”
- `specialties` (nullable, string array) — freeform or from a curated list:
  - e.g. `["Dabs", "Sleep", "Wellness"]`.

These fields are managed via **My Profile** (for user-visible bits) and/or manager tools (for role, store tying).

---

## 2. “Guided by” in staff views

### 2.1 Auto user boards

For auto user boards (per-budtender):

- Board header shows:
  - Avatar.
  - “Guided by {display_name}”.
  - Optional tagline.
- Example:

> [AllDay avatar]  
> Guided by **AllDay**  
> “Happy hybrids & social sativas.”

This appears:

- In Boards home card for the auto board.
- At the top of the board canvas editor.
- In Display mode when showing that auto board.

### 2.2 Custom boards with a curator

Custom boards can optionally have a primary curator:

- Add optional `curated_by_user_id` on boards.
- In staff UI, when creating/editing a custom board:
  - Default curated_by is the creator.
  - Managers can change it to another budtender.

Header shows:

- “Curated by {display_name}” with avatar.
- Example:

> Curated by **Justin** — “Sleep & Recovery Favorites”

If there’s no curator set:

- Fall back to a store-level identity:
  - e.g. “Curated by State of Mind Staff.”

---

## 3. “Who’s guiding this sesh?” in customer view

In Display mode for boards that have a clear guide:

- Show a small identity strip near the top:

For an auto user board or custom board with curator:

> [avatar] Guided by **{display_name}**  
> {tagline or specialties}

For a store auto board (multi-budtender):

- Use a store-level identity:
  - e.g. “Guided by State of Mind Budtenders”.

Rules:

- The strip is visible but not overwhelming — small enough to feel like a signature, not a giant hero block.
- On mobile/tablet, it can collapse to just avatar + name.

---

## 4. My Picks & attribution

Wherever picks are shown to staff, we:

- Always show the owner’s display_name and avatar (or initials).
- For managers/admins:
  - It’s clear who wrote each pick.
- For budtenders:
  - Their own picks can be highlighted (e.g. “My Picks” filter).

This keeps ownership clear without clogging the customer view with extra noise.

---

## 5. Identity in activity/history

When we log activity (next doc), we use:

- `user_id` → display in UI as `display_name` + avatar.
- Example entry:
  - “AllDay published a new pick: Blue Lobster.”
  - “Justin updated board ‘Sleep & Recovery’.”

This makes the activity feed readable and human, not just IDs.

---

## 6. Summary

- Budtenders aren’t invisible — they’re explicitly surfaced as **guides**.
- Auto user boards and curated boards say “Guided by {display_name}”.
- Customer view gets a lightweight identity strip that reinforces relatability without clutter.
- Internally, display_name + avatar are always used instead of bare email/IDs.
