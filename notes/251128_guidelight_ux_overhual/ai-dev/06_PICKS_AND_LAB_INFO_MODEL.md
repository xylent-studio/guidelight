
# 06_PICKS_CATEGORIES_AND_DATA_MODEL – Simplified MVP (v9.2)

This file defines the UX-level model for picks, categories, and lab info in the simplified MVP.

**Last Updated:** 2025-11-28  
**Status:** ✅ Implemented

---

## 1. Categories

### 1.1 Available Categories

The following categories are available for picks:

| Category | Sort Order | Notes |
|----------|------------|-------|
| Flower | 10 | Strain type, format, package size, potency, terpenes |
| Pre-rolls | 20 | Same as Flower + is_infused, pack size |
| Vapes | 30 | Format (cart/disposable/pod), potency |
| Edibles | 40 | Format, package size, potency |
| Beverages | 50 | Format, package size, potency |
| Concentrates | 60 | Format, potency |
| Tinctures | 65 | Format, potency |
| Topicals | 80 | Format, potency |
| Accessories | 85 | Format only |
| **Deals** | 90 | Special deal-specific fields |

**Removed:** Wellness (v2.1) - Picks migrated to Tinctures.

---

## 2. Picks

### 2.1 Required Fields

- `product_name` (string) – Product name or deal title
- `category_id` (uuid) – Foreign key to categories table
- `rating` (1–5 stars) – Staff rating, powers sort order

### 2.2 Core Optional Fields (all categories)

- `brand` (string) – Product brand
- `one_liner` (string) – Short headline for display on pick cards
- `effect_tags` (string[]) – Up to 3 curated effect tags
- `custom_tags` (string[]) – Unlimited freeform tags
- `why_i_love_it` (string) – Staff notes/story
- `is_active` (boolean) – Whether pick is visible to customers

### 2.3 Category-Specific Fields

Fields are stored for all picks but only rendered when relevant to the category.

#### Strain-based categories (Flower, Pre-rolls, Vapes, Edibles, Concentrates)

- `strain_type` – indica, sativa, hybrid, cbd-dominant, balanced, n-a
- `intensity` – light, moderate, strong, heavy

#### Product detail fields

- `format` – Category-specific format (see table below)
- `package_size` – e.g., "3.5g", "5-pack", "1g cart"
- `potency_summary` – e.g., "THC 27%, CBD <1%"
- `top_terpenes` – e.g., "Limonene, Myrcene, Caryophyllene"
- `is_infused` – Boolean, for pre-rolls

#### Deals category

- `deal_title` (required for deals) – e.g., "Buy 2 Get 1 Half-Oz Flower"
- `deal_type` – percent-off, dollar-off, bogo, bundle, tiered, other
- `deal_value` – e.g., "25% off", "$10 off"
- `deal_applies_to` – e.g., "All Vapes", "Kiva brand"
- `deal_days` (string[]) – Days the deal is active (Mon–Sun)
- `deal_fine_print` – e.g., "Limit 1 per guest"

### 2.4 Format Options by Category

| Category | Format Options |
|----------|----------------|
| Flower | Indoor, Outdoor, Greenhouse, Smalls, Pre-ground, Infused |
| Pre-rolls | Single, Multi-pack, Mini, King-size, Blunt |
| Vapes | Cart, Disposable, Pod |
| Edibles | Gummy, Chocolate, Baked, Capsule, Tablet, Hard candy |
| Beverages | Drink, Shot, Powder mix |
| Concentrates | Badder, Shatter, Sugar, Diamonds, Rosin, Sauce, Crumble |
| Tinctures | Oil, Alcohol, Glycerin |
| Topicals | Balm, Lotion, Patch, Roll-on, Cream |
| Accessories | Pipe, Bong, Grinder, Battery, Rolling tray, Storage |

### 2.5 Ordering

- Picks in **My picks** are ordered so that the most relevant items naturally rise to the top.
- Default ordering rule:
  - Primary: `is_active` descending (active picks first)
  - Secondary: `rating` descending (5★ above 4★, etc.)
  - Tertiary: `updated_at` descending (recently edited/added above older)

---

## 3. Effect Tags System

### 3.1 Curated Effect Tags (AIQ/Dispense style)

Limited to **3 selections per pick**. These drive filtering and consistent display.

**Mood/feeling:**
- Relaxed, Calm, Sleepy, Happy, Euphoric, Uplifted
- Energetic, Focused, Creative, Social, Giggly

**Functional/therapeutic:**
- Pain Relief, Stress Relief, Body High, Head High, Clear-minded, Hungry

### 3.2 Custom Tags

Unlimited freeform tags for fun/seasonal/social use cases:
- "Bills game", "Date night", "420 special", "Snow day", etc.

### 3.3 Display Logic

- **Pick cards:** Show up to 3 effect tags + 1-2 custom tags
- **Live Board:** Product/Deal name, Budtender nickname, Star rating, Effect tags

---

## 4. Lab Info UX (Phase 2+)

Lab info fields are stored but minimally displayed in v2.1. Full lab integration planned for Phase 2+.

### 4.1 Available Fields

- `potency_summary` – Free text (e.g., "THC 27%, CBD <1%")
- `top_terpenes` – Free text (e.g., "Limonene, Myrcene")

### 4.2 Display Rules

- **Staff (My picks):** May show compact line below tags
- **Customer views:** May show short line if entered
- **Never show:** Raw lab tables or notes in this MVP

---

## 5. Draft Behavior (Form UX)

The PickFormModal uses a single draft state object. Key behavior:

1. **Category context:** Clicking "Add Pick" from a category view pre-selects that category
2. **Category switching:** Changing category updates only `category_id`, preserves all other fields
3. **No data loss:** If user switches categories by mistake and back, all entered data remains
4. **Conditional rendering:** Category-specific fields show/hide based on selected category

This ensures budtenders never lose work when editing picks.

---

## 6. Legacy Fields (Preserved for Compatibility)

These fields exist in the database but are hidden from the UI:

- `product_type` – Always set to 'flower' (or derived from category)
- `time_of_day` – Always set to 'Anytime'
- `budget_level`, `experience_level`, `special_role` – Not used in v2.x

These may be removed in a future major version after data migration.
