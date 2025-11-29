# Guidelight Canvas & Signage Vision

---
**Document Metadata**

| Field | Value |
|-------|-------|
| **Status** | 📋 Vision Document |
| **Last Updated** | 2025-11-29 |
| **Owner** | Xylent Studios |
| **Audience** | AI Agents, Product, Engineering |
| **Purpose** | Vision + guardrails for the future "Canvas / Canva-mode" layer |

---

> **Role of this doc:** Vision + guardrails for the future "Canvas / Canva-mode" layer of Guidelight.
> It builds on the vNEXT Boards + Drafts work, but is **not** a promise that everything here exists yet.

---

## 1. Purpose

Guidelight is not just "a staff picks app." Long-term, it is **State of Mind's experience engine**:

- Turning **products + picks + expertise** into re-usable **boards**.
- Turning boards into **visual experiences** across multiple channels:
  - In-store TV signage
  - POS side screens
  - Touch/kiosk flows
  - Internal training & onboarding
  - Public web guides
  - Social media / print exports

The **Canvas** / "Canva-mode" is the layer that lets staff and managers:
- Arrange picks, text, and visuals on a board like a mini design tool.
- Apply **templates** (structure) and **themes** (visual style).
- Publish the result to various channels (TV, kiosk, training, web, etc.).

Chalkboard is just one example theme. The system should support multiple looks over time.

---

## 2. Core Concepts

These concepts are the spine of everything:

### 2.1 Product
- Catalog item (from Treez/CSV/etc.): name, brand, type, potency, etc.
- May come from external API or manual entry
- Images can be API-sourced or custom uploaded

### 2.2 Pick
- A budtender's recommendation and reasoning about a product.
- Includes: one-liner, why I love it, time of day, effect tags, intensity, budget, etc.
- May be linked to a product (`product_id`) or freeform.
- Can have custom image override or inherit from product.

### 2.3 Board
- A named surface with a **purpose** (promo, guide, training, internal ops).
- Holds **board items** arranged into a layout.
- Has metadata: name, type (`auto_store`, `auto_user`, `custom`, etc.), theme, status (published/unpublished).

### 2.4 Board Item
- A single element on a board.
- Types (now + future):
  - `pick` – renders a pick card.
  - `text` – heading/body text.
  - `image` – logos, mascots, clipart (Nano Banana, strain art).
  - (future) `shape`, `icon`, `qr_code`, etc.
- Contains layout metadata (position/order/layout variant).

### 2.5 Template
- Reusable **layout structure**: "hero + 3 cards", "grid of 6 cards", "checklist + picks".
- Controls:
  - Where items go (slots).
  - What types are expected in each slot (e.g., hero text, 3 pick cards).
- Does **not** mandate specific content.

### 2.6 Theme
- Reusable **visual style** applied to a board:
  - Colors, background, fonts (within design system rules), card treatments.
- Example themes:
  - **Chalkboard** (dark board, chalk headings, pastel accents).
  - **Clean menu / whiteboard**.
  - **Neon/nightlife**.
  - **Soft wellness/spa**.

### 2.7 Channel
- Where a board is published/displayed:
  - `display_tv` – In-store TV signage (Display Mode)
  - `display_kiosk` – Touch/kiosk flows
  - `web` – Public web guides
  - `internal` – Staff training/onboarding
  - `export` – Social media / print

---

## 3. Data Model Considerations

### 3.1 Current State (vNEXT)
- `boards` table with type, status, nullable theme/purpose/channel
- `board_items` table with type enum (`pick`, `text`, `image`), sort_index
- `media_assets` table for shared asset library
- `products` table API-ready with source tracking

### 3.2 Future Extensions
- `templates` table for reusable layouts
- `themes` table for visual style definitions
- Board versioning / history
- Channel-specific publishing rules

---

## 4. Image Strategy

### 4.1 Pick Images
1. If `image_asset_id` set on pick → use custom uploaded image
2. Else if linked to product with `image_url` → inherit product image
3. Else if product has `image_asset_id` (custom override) → use that
4. Else → no image or category placeholder

### 4.2 Board Images
- Standalone image board items reference `media_assets`
- Can be logos, clipart, backgrounds, etc.

### 4.3 Product Images
- `image_url` from API (Treez, etc.)
- `image_asset_id` for manual override
- `source_data` preserves original API response

---

## 5. Attribution System

When picks from other budtenders are added to a board:
- `board_items.attribution_style`: `'prominent'` | `'subtle'` | `null`
- **Prominent**: "{Budtender Name}'s Pick" as header
- **Subtle**: "From {Budtender Name}" as footnote
- **Null**: No attribution (owner's own picks)

---

## 6. Permission Model

### Current (vNEXT)
- **Owner**: Full edit access to their boards
- **Manager role**: Can edit any board in the store
- **Staff**: Can only edit their own boards

### Future Considerations
- Collaborative editing
- Board sharing between users
- Store-level vs user-level boards

---

## 7. Integration Points

### 7.1 API Integration (Phase 8)
- Treez connector for product sync
- `integrations` table for API credentials
- `sync_logs` for tracking sync operations
- Scheduled sync support

### 7.2 Display Mode
- Board selection via route or preference
- Auto-refresh on board changes
- Channel-specific rendering

---

## 8. Future Capabilities (Not Yet Implemented)

These are aspirational features not yet in scope:

- **Template editor** - Create/edit layout templates
- **Theme editor** - Create/edit visual themes
- **Board versioning** - History and rollback
- **Collaborative editing** - Multiple editors on one board
- **Print/export** - Generate PDFs, images for social
- **Scheduled publishing** - Time-based board switches
- **A/B testing** - Compare board performance
- **Analytics** - Track engagement with boards

---

## 9. Related Documentation

- `docs/guidelight_vNEXT_implementation/00_OVERVIEW.md` - Implementation roadmap
- `docs/GUIDELIGHT_SPEC.md` - Product specification
- `docs/GUIDELIGHT_DESIGN_SYSTEM.md` - Visual design system
- `docs/API_INTEGRATION_DESIGN.md` - Treez/catalog integration notes

---

**Maintained by:** Xylent Studios  
**Last reviewed:** 2025-11-29



