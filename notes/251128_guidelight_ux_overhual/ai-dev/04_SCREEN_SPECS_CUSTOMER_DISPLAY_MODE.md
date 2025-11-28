---
**Status:** ✅ Implemented  
**Last Updated:** 2025-11-28  
**Implementation:** `src/views/DisplayModeView.tsx`
---

# 04_SCREEN_SPECS_CUSTOMER_DISPLAY_MODE – v9.1

This file specifies the full-screen customer-facing Display Mode, which is the public route for POS/kiosk displays.

---

## 1. Display Mode (`/display`)

### 1.1 Purpose

Show a full-screen list/grid of picks on a POS, monitor, or any device—**without requiring login**. This enables:

- POS displays in the shop that customers can view
- Staff showing the app to friends/family without logging in
- Reduced friction for casual browsing

### 1.2 Access

- **Unauthenticated (primary use case):**
  - POS or any browser opens `/display` directly.
  - No login required.
  - Shows "Guest" indicator with path to login.
- **Authenticated:**
  - Staff can navigate to `/display` if needed.
  - Shows user menu instead of "Login" button.

### 1.3 Default Content: House List

By default, Display Mode shows the **House List**—a combined view of top-rated picks from all active staff members.

- Picks are ordered by rating (highest first), then by recency.
- Each pick card shows which budtender recommends it.
- Limited to ~20 picks for scannability.

### 1.4 Layout (Responsive)

```text
┌───────────────────────────────────────────────────────────────┐
│ House picks                               [ Change ] [ Login] │
│ Guest                                                         │
└───────────────────────────────────────────────────────────────┘

[ All ] [ Flower ] [ Vapes ] [ Edibles ] [ Bev ] [ Conc. ] [ Wellness ] [ Other ]

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ ★★★★★           │  │ ★★★★☆           │  │ ★★★★★           │
│ Gary Payton     │  │ Blue Lobster    │  │ Grape Ape       │
│ Pot and Head    │  │ Some Brand      │  │ Another Brand   │
│ Sleep · Social  │  │ Heavy hitter    │  │ Chill · Night   │
│ — Justin        │  │ — Nate          │  │ — Steph         │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

**Responsive breakpoints:**

| Screen Width | Layout | Use Case |
|--------------|--------|----------|
| `< 640px` | 1 column | Phone portrait |
| `640px – 1024px` | 2 columns | Tablet, phone landscape |
| `> 1024px` | 3 columns | POS monitor, desktop |

### 1.5 Header

- **Title:** "House picks" (default) or "{UserName}'s picks" (when filtered)
- **Guest indicator:** Shows "Guest" badge when not logged in
- **`[ Change ]`** button → Staff selector overlay
- **`[ Login ]`** button → Navigates to `/login` (only when not authenticated)
- **Full-screen button:** Uses browser Fullscreen API to hide chrome (optional, nice-to-have)

### 1.6 Category Picker (CategoryChipsRow)

- Horizontal scrollable row of chips.
- **"All"** is first and selected by default.
- Other chips: Flower, Vapes, Edibles, Beverages, Concentrates, Wellness, Other.
- Tapping a chip filters the visible picks.

### 1.7 Staff Selector Overlay

Triggered by `[ Change ]` button:

```text
View picks from:

● House picks (all staff)
○ Justin – Edibles & sleep products
○ Nate – Live resin & terp-heavy carts
○ Steph – Budget-friendly options
```

- **"House picks"** is first option (default).
- Each budtender shows their name and `profile_expertise` as subtitle.
- Selecting a budtender filters to show only their picks.
- When viewing a single budtender, their full profile is shown (see 1.8).

### 1.8 Budtender Profile (when viewing individual)

When a specific budtender is selected (not House picks), show their profile info:

```text
┌───────────────────────────────────────────────────────────────┐
│ Justin's picks                            [ Change ] [ Login] │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│ [Avatar]  Justin                                              │
│           Edibles for sleep & anxiety                         │
│                                                               │
│ "Albany born and raised, dog dad, and live-resin nerd.        │
│  I chase loud terps, smooth highs, and good playlists."       │
│                                                               │
│ Tolerance: Heavy hitter — I smoke every day and usually       │
│ go for strong indicas or infused options.                     │
└───────────────────────────────────────────────────────────────┘
```

Profile fields displayed:
- Name
- `profile_expertise` (subtitle)
- `profile_vibe` (quoted bio)
- `profile_tolerance` (with label)

### 1.9 GuestPickCard Content

Each card shows:

- Product name (large, bold)
- Brand (secondary)
- Star rating (1–5)
- Tags (Sleep, Social, etc.)
- Budtender name (when in House picks mode): "— Justin"
- Optional: THC/CBD line if present (Phase 2+)

No edit controls. Read-only.

### 1.10 Empty States

**No picks in selected view:**
- "No picks to show yet. Ask your budtender for recommendations."

**No active staff:**
- "Guidelight is being set up. Check back soon!"

### 1.11 Login Flow

When guest taps `[ Login ]`:
- Navigate to `/login`
- After successful login, redirect to `/` (My picks) or back to `/display` if they came from there
