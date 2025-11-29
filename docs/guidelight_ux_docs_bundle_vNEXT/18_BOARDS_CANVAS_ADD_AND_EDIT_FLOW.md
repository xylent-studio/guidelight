# 18 — Boards Canvas: Add Existing Picks & Create New Picks In-Context

This document focuses on the in-board experience from the budtender’s point of view — what it feels like to stand at the counter, in a board, and either drop in an existing pick or create a brand‑new one on the fly.

The goal: **never force staff to leave the board just to add or tweak a recommendation.**

---

## 1. Mental model for staff

When a budtender is looking at a board canvas (custom board or their own auto board in edit mode), their brain is in a **“curate this wall”** mode, not a “navigate the whole app” mode.

From inside a board, they should be able to:

1. **Add an existing pick they already wrote.**
2. **Create a new pick for a product that belongs on this board.**
3. **Edit a pick that’s already on the board.**

All without losing context or jumping through extra screens.

---

## 2. Primary actions on a board

### 2.1 Board toolbar

At the top of the board canvas, include a small toolbar that always has:

- Board name (editable).
- Status: Draft / Published.
- Actions:
  - **Add pick** (primary action for this doc).
  - **Add text** (for headings/notes).
  - “Show to customer” / “Open in display mode” (where appropriate).

On smaller screens, some of these may live in an overflow menu, but **Add pick** should stay one tap away.

---

## 3. “Add pick” from inside a board

Clicking **Add pick** opens a dialog with two tabs or options:

1. **Existing picks**
2. **New pick**

This matches the way budtenders think:
- “I already have something for this.”
- “I need to make a new one for this product.”

### 3.1 Option 1 — Add existing pick

This is the default tab, since usually they’re reusing picks.

**Picker behavior:**

- Search bar:
  - Type product name or brand to filter.
- Filters (chips or dropdowns):
  - Budtender: Me / All / specific person.
  - Product type: Flower, Pre‑rolls, Vapes, etc.
  - Time of day: Anytime, Day, Evening, Night.
  - Rating: 4★+ filter, etc.
  - Status: Active/published only by default.

**List items:**
- Show each pick as a compact card using the existing design system:
  - Product name.
  - Brand.
  - Product type badge.
  - Rating.
  - Key chips (time of day, effect tags).

**Selection:**
- Single‑select by default (tap → “Add to board”).
- Nice‑to‑have: multi‑select (checkmarks) to add several at once.

**After adding:**
- The pick card appears on the canvas in the default “next open slot” in the loose grid.
- Layout is auto‑saved (no explicit “Save layout” button).

### 3.2 Option 2 — Create a new pick (in-board)

Sometimes the right pick doesn’t exist yet. From the same dialog, there’s a **New pick** option:

1. **Step 1: Choose product**
   - Use the product catalog picker:
     - Search product name/brand.
     - Filter by product type, availability.
2. **Step 2: Write the pick**
   - Opens the pick editor (modal or sheet) without leaving the board view behind.
   - Prefilled with product info.
   - Budtender fills in:
     - One‑liner.
     - Why I love it.
     - Time of day, effects, etc.
     - Visibility toggles for customer view.
3. **Step 3: Save & attach**
   - On Save:
     - New pick is created (published or saved as draft depending on rules).
     - The pick is automatically added to the current board’s canvas.
   - On Cancel:
     - No pick is created.
     - Board remains unchanged.

The board canvas is still visible behind the modal the entire time, reinforcing that they are editing **this board**.

---

## 4. Editing and reusing from the board

### 4.1 Edit a pick that’s already on the board

When a budtender clicks a card on the canvas (in staff mode):

- Open the same pick editor modal:
  - Show current values.
  - Autosave to a **draft** while they work.
  - Respect existing and new visibility toggles.

Publishing the changes updates the pick everywhere it appears (including this board and any other boards using the same pick).

Cancelling discards the draft and keeps the board’s pick as‑is.

### 4.2 Removing a pick from the board

Each card on the canvas needs a clear, non‑scary remove affordance:

- On hover / press, show a small “Remove from board” icon in the corner.
- Removing only detaches the pick from **this board**; it does not delete the underlying pick.

This keeps staff from worrying that they’ll “break” someone else’s work.

---

## 5. Behavior for auto vs custom boards

- **Auto boards (per‑budtender, all staff):**
  - Their content is derived automatically from rules (e.g. all active picks for that budtender).
  - Budtenders can still edit individual picks from these boards (click card → edit pick).
  - Manually adding/removing picks is reserved for **custom boards**, so the rules stay predictable.

- **Custom boards:**
  - Fully manual composition:
    - Add existing picks.
    - Create new picks in‑context.
    - Add text blocks.
  - Perfect for:
    - Event walls.
    - Themed boards (Sleep, Wellness, New Drops).
    - One‑off hero boards for vendors or holidays.

---

## 6. From the budtender’s perspective (summary)

When a budtender is inside a board canvas, they should feel like:

> “This is *my wall*. From here I can pull in the picks I already trust, or spin up a new one for this exact moment, without losing my place or closing this board.”

Concretely, that means:

- **One obvious Add pick control** in the board toolbar.
- A simple choice between:
  - Reusing something they’ve already crafted.
  - Creating something new, attached to a specific product.
- Seamless return to the board canvas after creating or editing.
- Auto‑saved layout so they never lose their work.

All of this reuses the existing Guidelight design system (cards, chips, modals) to feel like one cohesive app.
