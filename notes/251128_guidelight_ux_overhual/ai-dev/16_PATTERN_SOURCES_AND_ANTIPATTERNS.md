---
**Status:** ✅ Active (Reference)  
**Last Updated:** 2025-11-28  
**Purpose:** Design pattern inspiration and antipatterns to avoid
---

# 16_PATTERN_SOURCES_AND_ANTIPATTERNS

This doc records the external patterns Guidelight is borrowing from, and the common mistakes we are deliberately avoiding.

The point is to help devs and agents make decisions that feel **familiar and improved**, not random.

---

## 1. My picks (staff home)

### Pattern sources

- **Messaging / email apps** for list-first views (Gmail, iMessage):
  - Simple scrolling list as the core.
  - Tap a row to edit/see details.

- **“Favorites” / playlists** (Spotify, YouTube):
  - A user’s curated set of items.

### Antipatterns to avoid

- **Stale favorites graveyard**
  - Long lists nobody maintains.
  - We mitigate this by:
    - Ordering by rating then recency.
    - Keeping the “add pick” flow very fast.

- **Overcomplicated home**
  - Dashboards with multiple panels and stats.
  - For MVP, My picks is just a list plus a couple of big actions.

---

## 2. Show to customer (full-screen view)

### Pattern sources

- **“View as customer” / preview modes** (Shopify, CMS tools).
- **Full-screen content modes** (YouTube, Google Maps expanded cards).

### Antipatterns to avoid

- **Hidden presentation mode**
  - Buried behind menus, rarely used.
  - We avoid this by using a clearly labeled “Show to customer” control.

- **Dangerous presentation mode**
  - Edit controls or admin actions visible while showing customers.
  - In Guidelight, show mode is strictly read-only for MVP.

---

## 3. Category chips and filters

### Pattern sources

- **Dispense / AIQ** style menus:
  - Horizontal chips for quick filtering.
- **Material Design filter chips**:
  - Scrollable row on mobile.

### Antipatterns to avoid

- **Overdependent on filters**
  - Assuming users will manage filters actively.
  - We offset this by:
    - Making the default “All” view useful (good ordering).
    - Using chips as helpful, not mandatory, controls.

- **Too many rows of filters**
  - Stacking multiple chip rows and toolbars.
  - MVP uses a single chip row in customer-facing views.

---

## 4. Team / admin

### Pattern sources

- Lightweight SaaS “People” pages (Slack, Notion):
  - Single page with list + simple actions.

### Antipatterns to avoid

- **Over-admin’d UI**
  - Too many tabs, role matrices, and settings for a small team.
  - For MVP, Team is one screen with invites + basic status/actions.

- **Invisible admin**
  - Admin only accessible via obscure controls.
  - We keep it behind an intentional action (menu → Team), but may surface gentle hints in the future (e.g., “Invite teammates” card).

---

## 5. Forms and lab info

### Pattern sources

- **Modern forms with clear primary vs advanced sections**
  - Quick top section, optional advanced details below.

### Antipatterns to avoid

- **“Big intimidating form” effect**
  - Too many fields visible at once; users disengage.
  - Guidelight splits EditPickForm into Quick info (required) and Optional details.

- **EHR-style lab tables for non-medical staff**
  - Complex tables of lab values unsuitable for budtender workflows.
  - MVP limits lab inputs to THC, CBD, and top terpenes in a simple block.

---

## 6. Ratings

### Pattern sources

- Ubiquitous 1–5 star ratings in consumer apps.

### Antipatterns to avoid

- **Meaningless 5-star inflation**
  - Everything is 4–5, so the scale loses meaning.
  - MVP keeps 1–5 stars for familiarity, but ordering and future enhancements (e.g., top picks, badges) need to account for this reality.

---

## 7. General layout and chrome

### Pattern sources

- Mobile-first, minimal-chrome apps:
  - Bottom-heavy actions, single-header layouts, overlays for secondary tasks.

### Antipatterns to avoid

- **Permanent sidebars on mobile**
  - Waste screen space and add visual noise.
  - Guidelight uses spare headers and overlays instead.

- **Stacked toolbars and filters**
  - Too many horizontal controls before the main content.
  - MVP keeps My picks very light and reserves chip rows for customer-facing views.

If you introduce new patterns, try to connect them back to at least one known good reference and ensure they don’t fall into any of the antipattern categories above.
