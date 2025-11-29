# 07 — UI Patterns & Components

This document describes the key UI patterns and components for Guidelight, referencing familiar designs from major apps to keep interactions intuitive.

---

## Global patterns

### 1. Edit vs Present modes

Mirroring tools like Google Slides, Figma, and Keynote:

- **Edit mode**:
  - Canvas shows drag handles, selection outlines.
  - Controls for adding picks and text.
  - Board header shows type, status, and actions.
  - Visible eye icons (for pick fields) and layout controls.

- **Present / Display mode**:
  - No edit controls.
  - Larger typography and spacing.
  - Tap/click to expand cards.
  - Small, minimal board selector (if present).

Transition between modes is explicit via a button like **“Show to customer” / “Exit display”**.

---

### 2. Status indicators

Use compact, color-coded **pills** to show status:

- Picks:
  - `Draft` — grey pill.
  - `Published` — green pill.
  - `Archived` — muted pill (if used).

- Boards:
  - `Published` — green pill.
  - `Unpublished` / `Draft` — grey pill.
  - Type icons:
    - 🏬 Store (auto_store)
    - 👤 Budtender (auto_user)
    - ⭐ Custom

These mirror patterns from email clients (labels), CMS dashboards, and project tools.

---

## Key screens & components

### A. My Picks List

**Goal:** let staff quickly see and manage their picks and drafts.

Layout:

- Search bar and filters (by category, product type, status).
- Tab or filter chips:
  - All
  - Published
  - Drafts

Each row shows:

- Product name
- Brand
- Product type icon
- Rating stars
- Time-of-day icon or chip
- Status pill (Draft / Published)
- Actions:
  - Edit (opens pick editor)
  - More (…) for Archive or Duplicate (future)

Draft rows might show a small “Draft” label next to the name, similar to Gmail’s “(Draft)” next to email subjects.

---

### B. Pick Editor

**Inspiration:** Email composer + CMS post editor.

Sections:

1. **Header**
   - Context: “New pick” or “Editing: Product Name”
   - Subtle “Saving…” / “Saved” indicator.

2. **Core fields**
   - Product name (read-only or selectable from a catalog).
   - Brand.
   - Product type.
   - Time of day (chip selector).
   - Rating (star picker, 1–5).

3. **Narrative**
   - One-liner (short text, with character count).
   - “Why I love it” (multi-line text).

4. **Context & tags**
   - Effect tags (chip selector).
   - Intensity (radio or chip).
   - Experience level (radio or chip).
   - Budget ($ / $$ / $$$).

5. **Pack / potency**
   - Package size.
   - Potency summary.
   - Infused toggle.
   - Format.

6. **Visibility controls**
   - For customer-facing fields, show an **eye icon** in the right edge of each row.
   - Eye on = included in `visible_fields`.
   - Eye off = hidden from customer cards.

7. **Footer actions**
   - Left: “Delete draft” or “Discard changes” (where applicable).
   - Right: “Cancel” and primary “Publish” button.

Behavior:

- All changes update the **draft**, not the live pick, until Publish.
- The UI should reassure users that drafts are auto-saved.

---

### C. Boards Home

**Goal:** Manage multiple boards like playlists or projects.

Layout:

- Top-level tabs or filters:
  - All
  - Auto boards
  - Custom boards
- “New board” button.

Board cards show:

- Board name.
- Type icon (🏬, 👤, ⭐).
- Status pill (Published/Unpublished).
- Last updated.
- Optional count of picks on the board.

Actions on card:

- Open.
- Quick Publish/Unpublish toggle.
- Duplicate (custom only).
- Delete (custom only, via menu).

This mirrors Trello’s board picker and Notion’s workspace list.

---

### D. Board Canvas Editor

**Goal:** Arrange picks and text on a visual canvas.

Header:

- Board name (inline editable for custom).
- Type + status pill (e.g. “Custom · Draft”).
- Publish/Unpublish toggle.
- Primary actions:
  - Add pick.
  - Add text.
- Secondary:
  - “Show to customer” (go to display mode).
  - Board picker dropdown.

Canvas:

- Cards and text blocks on a loose grid.
- Drag-and-drop interactions similar to:
  - Trello cards
  - Figma frames
  - Miro sticky notes

Board items:

- **Pick card (edit mode)**
  - Compact display:
    - Product name
    - Brand
    - Rating
    - Time-of-day icon
  - Handles:
    - Drag handle.
    - “…” for remove from board.
    - Clicking can open pick in editor.

- **Text block**
  - Simple text with in-place editing.
  - Typographic hierarchy:
    - Large for board titles and section headers.
    - Smaller for notes.

Autosave:

- As cards move or content changes, a small “Saved” indicator confirms persistence.

---

### E. Display Mode (Customer View)

**Goal:** Show a board cleanly and clearly to customers.

Design:

- Full-screen canvas, no scrolling if possible (or simple vertical scroll).
- Large board title at the top.
- Cards with:
  - Product name
  - Brand
  - One-liner
  - Clear tags (time-of-day, effect chips)
  - Optional rating (small stars).

Interactions:

- Tap/click on a card:
  - Expands into a larger panel or drawer.
  - Shows “Why I love it” and any extra fields permitted by `visible_fields`.
- Tap outside or back:
  - Collapses detail view.

Controls:

- Minimal on-screen chrome:
  - Optional small button for board selector.
  - Exit icon to go back to editor when used by staff.

This should feel more like a **digital menu** (restaurants, streaming apps) than a productivity tool.

---

## Micro-patterns

### Icons

Use widely recognized icon metaphors:

- Pencil / edit.
- Eye open/closed for visibility.
- Star for rating.
- Plus for add.
- Ellipsis (`…`) for more actions.

### Chips & tags

Use pill-shaped chips for:

- Time of day (Day / Night / Anytime).
- Effect tags (Relaxed, Social, Focus, etc.).
- Intensity (Gentle / Moderate / Strong).

These mirror patterns from email labels, filters, and modern design systems.

---

## Responsiveness

Must work on:

- Backroom PCs (desktop layout).
- Tablets at the counter.
- Phones in staff pockets.

Patterns:

- On smaller screens:
  - Boards home collapses into a list with a simple filter bar.
  - Board picker becomes a full-screen overlay.
  - Pick editor uses stacked sections with progressive disclosure.

The overall experience should still feel “app-like” and consistent with modern mobile-first design.

