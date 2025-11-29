# 04 — Staff Flows: Picks & Boards

This document defines how staff (budtenders, managers) use Guidelight from their perspective.

Patterns are intentionally aligned with familiar tools:
- Picks behave like email drafts/posts.
- Boards behave like playlists / project boards.

---

## Flow 1 — Create a new pick (draft → publish)

**Goal:** Add a new recommendation without impacting customer views until it’s ready.

1. Staff opens **My Picks** (`/picks`).
2. Tap/click **New pick**.
3. Guidelight opens a **Pick editor**:
   - Pre-populates product info if coming from an integration (optional).
   - Shows fields like:
     - Product name (usually read-only)
     - Brand (read-only or selectable)
     - One-liner
     - Why I love it
     - Time of day
     - Effect tags
     - Intensity, budget, etc.
   - Each customer-facing field has an **eye icon** to toggle visibility.

4. As the user types:
   - A **Pick Draft** record is created/updated in the background.
   - Work is autosaved (like Gmail drafts) — they can close the tab and nothing is lost.

5. The pick is not yet visible on boards or to customers. In **My Picks**:
   - It appears in a **Drafts section** or with a “Draft” badge.

6. When ready, the user presses **Publish**:
   - Draft is validated and converted into a `picks` row (status: `published`).
   - Draft entry is deleted.
   - Pick becomes available:
     - In the budtender’s auto board.
     - For selection on custom boards.

7. If they press **Cancel** instead:
   - Draft is deleted.
   - No new pick is created.

---

## Flow 2 — Edit an existing pick (safe draft, stable customer view)

**Goal:** Improve a pick without customers seeing half-finished edits.

1. From **My Picks**, the budtender clicks a **Published** pick.
2. The Pick editor opens in **Edit** mode.

3. Behind the scenes:
   - Guidelight loads any existing draft for this pick.
   - If none exists, it creates a new **Pick Draft** from the current pick data.

4. As they edit text, tags, or visibility:
   - Edits are stored in the draft.
   - The original Pick (in `picks`) stays unchanged.

5. On the rest of the app:
   - Boards and customer views still show the **last published version**.
   - My Picks can indicate:
     - “Published (draft in progress)” badge or icon.

6. When they press **Save / Publish changes**:
   - The pick row is updated with the draft data.
   - Draft is deleted.
   - All boards using that pick update to the new content.

7. If they press **Cancel / Discard draft**:
   - Draft is deleted.
   - Original pick remains as-is everywhere.

---

## Flow 3 — See and manage drafts

**Goal:** Give staff visibility and control over their picks drafts without nagging them.

1. On **My Picks** screen:
   - There is a **Drafts** section or filter:
     - Lists new-pick drafts (“New pick for AllDay”).
     - Lists edit drafts (“Editing: Blue Lobster — draft”).

2. Each draft row offers:
   - **Resume** — opens the Pick editor with draft content.
   - **Discard** — deletes the draft.

3. On login or returning after time away:
   - Guidelight takes the user back to their last meaningful route (via `user_preferences`).
   - Drafts are surfaced **non-intrusively**:
     - A small banner or count (e.g. “You have 2 drafts”).

The system does not aggressively force the user back into an old edit; drafts are a safety net, not a trap.

---

## Flow 4 — Use auto boards (store-wide & per-budtender)

**Goal:** Always have up-to-date boards reflecting all published picks.

Types of auto boards:

- **Store board** — “All Staff Picks”
- **User board** — “All Picks – {BudtenderName}”

1. Staff opens **Boards** (`/boards`).
2. Under **Auto boards**, they see:
   - “All Staff Picks”
   - One “All Picks – {Name}” per active budtender.

3. Opening an auto board:
   - Shows a canvas with cards for all **published picks** in its scope.
   - Layout can still be customized with `board_items`:
     - Staff can move cards, add section text, etc.
     - Items are autosaved.

4. Auto boards typically default to `Published`, but can be set to `Unpublished` if the store doesn’t want them in customer selectors.

---

## Flow 5 — Create a custom board

**Goal:** Curate a specific set of picks for a theme, event, or story.

1. Staff opens **Boards**.
2. Clicks **New board**.
3. Chooses:
   - Name (e.g. “Sleep & Recovery”).
   - Optionally, description.
   - Board type is `custom`.

4. Guidelight creates an empty ‘Draft’ board (status: `unpublished`).

5. In the **Board canvas editor**:
   - Staff uses **Add pick** to search and add cards:
     - Filter by budtender, category, tags, rating, etc.
   - They use **Add text** for titles (“Sleep & Recovery”), section headings (“Flower”, “Edibles”), and notes.
   - They drag and arrange cards and text on a loose grid.

6. As they work:
   - **Board items** and positions are autosaved.
   - There is no draft vs save for layout; every move updates the board in the backend.

7. In the header:
   - Board shows `Draft` (or `Unpublished`) status by default.
   - A toggle or button allows them to **Publish** the board when ready.

8. Publishing the board:
   - Sets `status = published`.
   - Makes this board selectable in customer views and display mode.

---

## Flow 6 — Maintain and publish/unpublish a board

**Goal:** Control what boards are available to customers.

From the **Boards** home screen:

- Each board card shows:
  - Name
  - Type (auto/custom)
  - Status (Published/Unpublished)
  - Last updated

Actions:

1. **Publish / Unpublish**
   - Toggle a board’s status.
   - Published:
     - Appears in customer-facing board selectors.
   - Unpublished:
     - Remains editable in staff view, hidden from customers.

2. **Open**
   - Enters the canvas editor.

3. **Duplicate** (custom boards only)
   - Creates a new custom board with:
     - Same layout
     - Same items
     - Status set to `unpublished` by default
   - Good for seasonal or variant boards.

4. **Delete** (custom boards only)
   - Permanently removes the board and its `board_items`.

Auto boards (`auto_store`, `auto_user`) are not deletable, but can typically be un/published.

---

## Flow 7 — “Show to customer” from staff device

**Goal:** Quickly use Guidelight on a tablet/phone as a guided visual aid.

1. Staff opens a board in canvas view.
2. Tap **Show to customer**.
3. Guidelight opens the full-screen **Display view** for that same board:
   - Read-only.
   - Hides all drag controls and edit icons.
   - Allows tapping a pick card to expand/collapse details.

4. Optionally, a small **Board picker** in display mode:
   - Lists only published boards.
   - Lets the staff switch to another board without leaving display mode.

This matches patterns in slideshow apps: “Edit” vs “Present” modes.

---

These flows should guide both implementation and UI design. The next documents drill into customer flows, persistence, and UI components in more detail.
