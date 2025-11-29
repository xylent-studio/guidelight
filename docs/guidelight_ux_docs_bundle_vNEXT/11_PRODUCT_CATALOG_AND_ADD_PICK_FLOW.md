# 11 — Product Catalog & “Add Pick” Flow

This document defines how Guidelight understands products (the actual items on the menu) and how staff attach picks to them in a way that avoids double entry, supports clean search, and sets us up for future menu/POS integrations.

---

## 1. Product catalog as source of truth

### 1.1 Concept

Guidelight maintains a **product catalog** that represents the items on the menu:

- Each product is a unique, stable record (even if its name or price changes).
- Picks attach to a `product_id` instead of relying only on the free-text name.

This prevents:
- Typos and inconsistent naming across picks.
- Orphaned picks when names change.

### 1.2 `products` table (conceptual)

Key fields (MVP):

- `id` (uuid) — primary key.
- `external_id` (nullable, string) — optional ID from Treez/Dispense/etc.
- `name` (string) — current product name as shown on menu.
- `brand` (string).
- `product_type` (enum/string) — `flower | pre_roll | vape | concentrate | edible | beverage | wellness | topical | other`.
- `category_id` (nullable, fk) — optional mapping to menu/category structure.
- `sku` (nullable, string).
- `package_size` (string) — e.g. “3.5g”, “0.5g 5-pack”.
- `potency_summary` (string) — short line: “THC 27%” or “10mg THC per gummy”.
- `strain_name` (nullable, string).
- `strain_type` (nullable, string) — `indica | sativa | hybrid | other` (optional).
- `is_available` (boolean, default true) — whether it’s on the active menu.
- `created_at`, `updated_at`.

We can extend this in the future with lab data, terpenes, etc., but for MVP the goal is simple:

> Make it easy to find and reliably refer to a specific product.

### 1.3 Relationship with picks

Picks store:

- `product_id` (fk → products.id)
- Denormalized fields for snapshotting:
  - `product_name`
  - `brand`
  - `product_type`
  - `package_size`
  - `potency_summary`

**Rule:**

- UI always shows the denormalized fields on the pick (so the pick never surprises staff by changing text under them).
- When a pick is created from a product, those fields are copied from `products` at that moment.
- Future enhancements can offer “Sync with product” actions, but are not required for MVP.

---

## 2. Populating the product catalog

### 2.1 Manual entry (MVP baseline)

Initially, a manager can populate `products` via:

- A simple “New product” form.
- Or a basic CSV import (e.g. exported from menu/POS).

This is enough to get Guidelight live without full integration.

### 2.2 Future: Menu / POS integration

We explicitly allow for:

- Import/sync from Treez, Dispense, or another menu source.
- Using `external_id` to keep products in sync.

MVP leaves the exact integration unspecified, but the model is designed to handle it later.

---

## 3. “Add pick” experience

### 3.1 Entry points

Staff can create a new pick from:

- **My Picks** → “New pick”.
- **Board canvas** → “Add pick”:
  - Option A: choose an existing pick.
  - Option B: create a new pick (which then attaches to a product).

### 3.2 Step 1 — Choose product

When creating a new pick, the first step is **selecting a product**:

- Show a search + filter dialog:
  - Search by product name or brand.
  - Filter by:
    - Product type (flower, pre-roll, etc.).
    - Availability (`is_available`).
- Results list:
  - Product name
  - Brand
  - Product type
  - Package size
  - Potency summary (optional).

Staff choose one product:

- `product_id` is set on the pick draft.
- `product_name`, `brand`, `product_type`, `package_size`, `potency_summary` are prefilled in the pick editor.

### 3.3 Step 2 — Write the pick

Once a product is selected:

- The pick editor opens with product fields locked or lightly editable:
  - Product name and brand should usually be read-only (or clearly marked as coming from catalog).
- Budtender fills in:
  - One-liner.
  - Why I love it.
  - Time of day.
  - Effect tags.
  - Intensity, experience level.
  - Budget level.
  - Rating.

Autosave creates/updates a **pick draft** as usual.

### 3.4 Step 3 — Attach to boards (optional at first)

After publishing the pick:

- It automatically appears in:
  - Auto user board (if `is_active = true`).
  - Auto store board (if is_active & published).
- Staff can also add it to custom boards via:
  - Board canvas → “Add pick” → “Existing pick” picker.

---

## 4. “Add existing pick to board” flow

From a board canvas, when clicking “Add pick” and choosing **Existing pick**:

- Show a picker dialog similar to product search, but for picks:

Filters:

- Budtender (All, Me, specific).
- Product type.
- Time of day.
- Effect tags.
- Rating range.
- Active status (Active only by default).

Each item in the list shows:

- Product name.
- Brand.
- Budtender name.
- Time-of-day chip.
- Rating.

Selecting a pick:

- Adds a card for that pick to the current board canvas.
- For auto boards, this picker is **not** used; content is algorithmically defined (see Decision Log).

---

## 5. Handling unavailable/out-of-catalog products

Sometimes a pick is tied to a product that’s no longer in the catalog (e.g. import issues or future cleanup).

**MVP behavior:**

- If `product_id` is missing but denormalized fields exist:
  - Show the pick using its denormalized data.
  - Mark in staff UI that the product is “Not linked to catalog”.
- Staff can:
  - Re-link the pick to a different product.
  - Or leave it as-is if it’s purely historical.

This prevents crashes and preserves budtender work, even when catalog data is imperfect.

---

## 6. Summary

- Products are the **menu items**; picks are **opinions about those items**.
- Picks attach to a `product_id` and snapshot key product fields.
- “Add pick” is always **product-first**, then budtender story.
- “Add existing pick to board” uses smart search/filter over picks.
- The model supports simple manual population now and clean Treez/Dispense-style integration later.
