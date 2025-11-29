# 16 — Layout & Responsive Guidelines

This document sets practical layout and responsive rules so Guidelight feels good on desktops, tablets, phones, and TVs, without a ton of guesswork.

---

## 1. Target devices

Guidelight must work well on:

- **Backroom desktop PCs** — typical 16:9 or 16:10 monitors.
- **Tablets at the counter** — e.g. iPad or similar (~768–1024px width).
- **Phones** — staff checking picks in their pocket.
- **TVs / wall displays** — 16:9 landscape, 1080p+ resolution.

---

## 2. Breakpoints (reference)

Use Tailwind-style mental model (exact names can differ):

- **Mobile**: `< 640px`
- **Small tablet**: `640–768px`
- **Tablet**: `768–1024px`
- **Desktop**: `>= 1024px`
- **Wide desktop / TV**: `>= 1280px`

---

## 3. Key screens

### 3.1 My Picks

- Desktop:
  - Table or card list with:
    - Columns: Product, Brand, Type, Rating, Time-of-day, Status, Actions.
  - Optional filters row above.
- Tablet:
  - Tighten columns; hide less critical ones under an overflow menu.
- Mobile:
  - Stacked cards:
    - Product name + brand.
    - Badges for type, time-of-day, rating, status.
    - Edit button.

### 3.2 Boards home

- Desktop:
  - Grid of board cards (2–3 per row).
- Tablet:
  - 2 per row or a tight list.
- Mobile:
  - Single-column list.

Each card should remain comfortably tappable (min 44px height for touch targets).

### 3.3 Board canvas

- Desktop:
  - Centered canvas with padding.
  - Side or top toolbar for “Add pick”, “Add text”, Publish toggle, etc.
- Tablet:
  - Canvas full-width with smaller padding.
  - Toolbar condensed; some options may move into overflow menus.
- Mobile:
  - Canvas interaction limited:
    - Editing on phones is possible but secondary.
    - Focus on viewing boards; heavy editing is for larger screens.

---

## 4. Card grid in display mode

### 4.1 Desktop & TV (landscape)

- Use a responsive grid like:
  - 3–4 columns max depending on width.
- Respect safe margins:
  - 32–48px margin on left/right on large screens.
- Avoid more than 8–10 cards on screen at once if possible:
  - Excess cards can scroll or be paginated.

### 4.2 Tablet

- 2–3 columns:
  - Larger cards to ensure readability at arm’s length.
- Maintain enough gap between cards for touch.

### 4.3 Phone

- 1–2 columns:
  - 1 column for narrow screens.
  - 2 columns only if cards remain readable and touch-friendly.

---

## 5. Safe zones for TVs

For always-on displays (TVs):

- Assume 16:9, 1920×1080 as baseline.
- Keep critical UI (board title, key cards) within a **safe frame**:
  - 5–10% inset from each edge:
    - ~96–192px inset horizontally, 54–108px vertically.
- Avoid tiny fonts:
  - Use larger type for card titles and board headers.
- Prefer static or gently changing content:
  - No wild animations or fast auto-scrolling.

---

## 6. Touch targets & spacing

- Minimum tap target: 44×44px for all interactive elements.
- Maintain vertical rhythm:
  - Use consistent top/bottom spacing between sections.
- Don’t cram:
  - Leave space around chips and buttons so they can be reliably tapped.

---

## 7. Canvas drag behavior on touch

- On touch devices:
  - Drag handles should be clear and large enough.
  - Consider:
    - Tap to select a card.
    - Then drag from a dedicated handle or long-press to move.
- Avoid accidental drags when trying to scroll on mobile:
  - On smaller screens, editing could be limited or gated behind an explicit “Edit layout” mode.

---

## 8. Summary

- The layout should gracefully scale from pocket to TV.
- Grids and lists adjust columns/count based on width.
- Cards remain readable and tappable in all contexts.
- TVs use safe margins to avoid cut-offs on overscanned displays.
