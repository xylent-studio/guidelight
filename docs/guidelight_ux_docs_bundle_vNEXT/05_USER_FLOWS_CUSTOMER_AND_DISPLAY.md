# 05 — Customer Flows: Display & Interaction

This document focuses on how Guidelight behaves in customer-facing contexts: full-screen displays, kiosks, and staff devices in “present” mode.

---

## Customer View Basics

Customer view shows **one board at a time** in a clean, read-only layout.

Key rules:

- Only **Published boards** are selectable.
- Within those boards, only **Published picks** appear.
- Draft picks, drafts of edits, and unpublished boards never appear here.

The design should feel closer to a **digital poster / slideshow** than a staff dashboard.

---

## Flow 1 — Full-screen display for a single board

Typical for a TV or kiosk.

1. A device opens `/display/:boardId`.
2. Guidelight:
   - Loads the board and its `board_items`.
   - Verifies the board is `published`.
   - Renders items at their saved positions.
   - Renders pick cards using only fields allowed by `visible_fields`.

3. Layout:
   - Board name at top (e.g. “Sleep & Recovery”).
   - Optional subtitle (board description).
   - Cards and text boxes arranged as defined in the canvas editor.

4. Interaction:
   - On a TV (no touch or pointer):
     - Display is passive; content cycles or remains static.
   - On a tablet/phone used as a hand-held display:
     - Tapping a pick card smoothly expands it:
       - Shows more detail (e.g. why I love it, effect tags, time-of-day, intensity).
       - Still respects `visible_fields` — no surprise fields.
     - Tapping again (or tapping outside) collapses it.

5. If the board is **unpublished**:
   - `/display/:boardId` should either:
     - Show a friendly “This board is not published” message (staff usage), or
     - Redirect to a safe default published board (kiosk usage).
   - In store-kiosk scenarios, boards used for display should remain published.

---

## Flow 2 — Switching boards in customer view

On staff-held devices, it’s useful to quickly switch boards while staying in display mode.

1. In full-screen customer view, provide a small **Board selector**:
   - Icon/button in a corner (e.g. “Boards ⌄”).
   - When tapped, opens an overlay list of available boards.

2. The overlay lists only **published boards**, grouped by type:
   - Store boards (auto)
   - Budtender boards (auto)
   - Custom boards (curated)

3. Staff chooses a board:
   - Display view transitions to that board.
   - Layout and content update to the selected board’s `board_items`.

This matches patterns like switching playlists in a music app or switching slide decks.

---

## Flow 3 — Using Guidelight at the counter with a guest

Scenario: A budtender has a guest at the counter and uses a tablet running Guidelight to guide them.

1. Budtender logs in on the tablet and opens a board:
   - e.g. “All Picks – AllDay” or “New Guest Starters”.

2. They tap **Show to customer** to enter full-screen mode:
   - All edit controls disappear.
   - Screen is now safe to show / hand to the guest.

3. During the conversation:
   - Budtender or guest taps picks to expand:
     - Show one-liner, a couple of tags, potency line, etc.
   - If the guest asks about a different theme:
     - Budtender uses the Board selector to switch to:
       - “Sleep & Recovery”
       - “Social Sativas”
       - etc.

4. After the conversation:
   - Budtender exits full-screen mode to go back to edit/canvas or My Picks.

Key UX goals:

- **No clutter** — no visible controls that confuse customers.
- **No surprises** — cards always show the same pattern and information level.
- **Easy to follow** — big titles, clear grouping, not too many cards at once.

---

## Flow 4 — Kiosk / always-on display

For dedicated displays (TVs, wall-mounted tablets):

1. A manager or admin associates a **display endpoint** with a board (now or in the future using a `display_endpoints` concept).
2. The physical device is pointed at `/display/:boardId` (or `/display/:displayEndpointId` in a future design).
3. The display:
   - Loads the board in full-screen mode.
   - Hides any navigation controls (if screen is not meant to be interactive).
   - Respectfully handles:
     - Board updates (layout and content updates as the board changes).
     - Pick updates (when picks are published or visibility toggled).

4. If the board is temporarily unpublished:
   - Kiosk can:
     - Show a neutral fallback (“Display not configured”), or
     - Fallback to a default board.

---

## Flow 5 — How publishing affects customer view

Publishing behavior is consistent:

- **Publish a pick draft**:
  - If the pick is on any published board, its card updates on all displays.
- **Unpublish or archive a pick**:
  - It no longer appears in auto boards or on custom boards (depending on implementation).
- **Publish a board**:
  - It becomes available to:
    - Staff board selector in customer mode.
    - Any kiosk / device that targets that board.
- **Unpublish a board**:
  - It’s removed from customer selectors.
  - Staff can still edit it in canvas mode.

This matches mental models from content platforms (e.g. CMS “draft vs published” status) and avoids the shock of boards changing mid-conversation without intent.

---

## Summary

Customer-facing flows are:

- **Simple** — one board at a time, clean layout, tap-to-expand details.
- **Safe** — only published content appears; drafts are invisible.
- **Familiar** — behaves like a cross between a digital menu and a slide deck.

Implementation details (routes, props) should follow this spec but remain flexible enough to add future enhancements such as:
- autoplay cycles between boards,
- timed slide rotations,
- or per-device board assignments.
