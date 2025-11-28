---
**Status:** ✅ Implemented  
**Last Updated:** 2025-11-28  
**Implementation:** `src/views/MyPicksView.tsx`, `src/components/picks/ShowToCustomerOverlay.tsx`
---

# 03_SCREEN_SPECS_STAFF_MOBILE_MY_PICKS_AND_SHOW – v9.1

This file defines the staff-facing mobile screens for this MVP: **My picks** and the **Show to customer** full-screen overlay.

---

## 1. My picks (staff home)

### 1.1 Purpose

Give budtenders a simple list of their recommendations and two big actions:

- Add or edit picks.
- Show picks to a customer.

### 1.2 Layout (Mobile Portrait)

```text
┌─────────────────────────────────────────┐
│ [avatar]  My picks               [⋯]   │
└─────────────────────────────────────────┘

★ Gary Payton – Pot and Head
  Sleep · Social · Newbie-safe

★ Blue Lobster – Brand
  Heavy hitter · Night

[ + Add pick ]
[ Show to customer ]
```

Optional enhancements:

- A simple filter (e.g., dropdown or small chip row) to limit the list by category, but not required for MVP.

### 1.3 Header

- Left: user avatar.
- Title: “My picks”.
- Right: overflow `⋯` with:
  - Team (if manager)
  - Profile & settings (future)
  - Log out

### 1.4 Pick list (MyPickCard)

Each row shows:

- Product name (bold, 1–2 lines max).
- Brand (secondary text).
- Star rating (1–5).
- Tags (Sleep, Social, etc.).

Interactions:

- Tap card → Edit pick.
- Long-press (future) → reorder list.

### 1.5 Primary actions

- **+ Add pick** button:
  - Opens Edit pick screen in create mode.

- **Show to customer** button:
  - Switches to the full-screen customer view, based on the same picks.

### 1.6 Empty state

If no picks exist:

- Show message:
  - “You don’t have any picks yet.”
- Show prominent **“Add your first pick”** button.

### 1.7 Ordering of picks

- The list should reflect the ordering defined in the picks model:
  - Higher-rated picks appear above lower-rated ones.
  - Recently edited/added picks appear above older ones with the same rating.
- This gives budtenders a natural "top picks first" feel without extra work.

---

## 2. Show to customer (full-screen overlay)

### 2.1 Purpose

Full-screen, customer-friendly view of the current user's picks with a familiar category picker.

**Implementation:** This is a full-screen **overlay** (not a route change). The URL stays at `/` while the overlay is open. This enables fast in/out UX—staff can quickly show picks to a customer and return to My picks without page navigation.

### 2.2 Access

- From My picks: tap **Show to customer** button.
- Opens instantly as an overlay covering the entire screen.
- No browser navigation occurs (back button does not affect it).

### 2.3 Layout (Mobile Portrait)

```text
┌─────────────────────────────────────────┐
│ [← Back]  Showing {UserName}'s picks    │
└─────────────────────────────────────────┘

[ All ] [ Flower ] [ Vapes ] [ Edibles ] [ Bev ] [ Conc. ] [ Wellness ] [ Other ]

★ Gary Payton – Pot and Head
  Sleep · Social · Newbie-safe

★ Blue Lobster – Brand
  Heavy hitter · Night
```

### 2.4 Category picker (Dispense-style)

- A horizontal row of chips across the top.
- First chip = **All** (selected by default).
- Other chips correspond to categories present in the data (Flower, Vapes, etc.).
- Behavior:
  - Tap a chip → filter the list below to that category.
  - “All” shows all picks, ordered as in My picks.

### 2.5 Card content (GuestPickCard)

Each card shows:

- Product name.
- Brand.
- Star rating.
- Tags.

Optional:

- A short lab line if THC/CBD are present, e.g. `THC 23% · CBD 1%`.

No edit controls are visible.

### 2.6 Navigation

- Large `Back` or `Done` button closes the overlay and returns to My picks.
- No access to Team or settings from this view.
- The overlay uses the same responsive layout and GuestPickCard component as Display Mode for visual consistency.
