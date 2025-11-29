# 08 — Navigation & Board Selection

This document focuses on how users move between boards and how published/unpublished status interacts with navigation on both staff and customer sides.

---

## 1. Staff navigation between boards

### Boards Entry Point

- The main entry is **Boards** (`/boards`).
- Boards home functions as a hub:
  - Auto boards (store + per-budtender).
  - Custom boards (mine, shared).
  - New board button.

### Board Picker in Canvas Editor

Inside `/boards/:boardId`:

- The header contains a **Board picker** control:
  - Clicking the board name or a small arrow opens an overlay.
  - The overlay shows:
    - Search input.
    - Pinned/favorites.
    - Auto boards.
    - Custom boards.

- Each entry shows:
  - Name.
  - Type icon (🏬, 👤, ⭐).
  - Status pill (Published/Unpublished).

Selecting another board:

- Switches the canvas to that board.
- Updates `last_board_id` and `last_route` in `user_preferences`.

This is similar to switching documents in Google Drive or boards in Trello.

---

## 2. Customer-side board selection

### Board Selector in Display Mode

In `/display/:boardId` display mode:

- If the screen is meant to be staff-operated (e.g. on a tablet):
  - Provide a **Board selector**:
    - Small button labeled “Board” or an icon (like a layers or list icon).
    - Tapping opens an overlay listing **only published boards**.
      - Grouped by Store / Budtender / Custom.
  - Choosing a board:
    - Navigates internally to `/display/:otherBoardId`.
    - Updates the content without showing edit controls.

- If the screen is a fixed kiosk/TV:
  - Board selector can be hidden via configuration.
  - The device always shows one configured board.

This mirrors playlist or profile selection experiences on consumer apps.

---

## 3. Published vs Unpublished in navigation

Rules:

- **Boards Home (staff)**:
  - Staff see all boards they have permission for.
  - Published boards show with a green `Published` pill.
  - Unpublished boards show with a grey `Draft` or `Unpublished` pill.
  - Both are fully accessible for editing.

- **Display Mode (customer)**:
  - Only boards with `status = published` appear in selectors.
  - Direct navigation to an unpublished board:
    - Either shows a “Not published” message (for staff testing).
    - Or redirects to a safe default published board (for kiosks).

This keeps mental models aligned with content systems: “draft pages/posts are not visible to the public.”

---

## 4. Default landing behavior

On login:

- Guidelight restores:
  - `last_route` (e.g. `/boards/{id}`) if available.
  - Otherwise, `/boards` as a default home.

In the context of boards:

- If `last_route` points to a board that no longer exists or is unavailable:
  - Redirect to `/boards`.
  - Optionally show a small toast: “Board not found, showing your boards instead.”

This ensures users aren’t left on broken or confusing screens.

---

## 5. Fallbacks & error states

To avoid dead ends:

- If a user tries to open a board they don’t have access to:
  - ‘You don’t have access to this board’ with a link back to `/boards`.

- If `/display/:boardId` is opened with an ID that doesn’t exist:
  - Show a neutral message: “This display is not configured yet.”
  - Optionally, let staff choose a board if logged in.

---

## 6. Summary

- Staff navigate boards via:
  - Boards home.
  - The header board picker in canvas mode.

- Customers see boards via:
  - Display mode for a specific board.
  - Optional board selector listing only published boards.

- Published/unpublished status drives **where a board appears**, not whether it can be edited:
  - Staff can always edit and flip the status.
  - Customers only ever see published content.

This creates a simple, powerful mental model that matches widely used content and project tools, while fitting Guidelight’s specific use case around staff picks and curated boards.
