# Budtender Picks Board – Product & UX Spec
*Xylent Studios – Guidelight*

---

## 1. Purpose

The **Budtender Picks Board** is a customer-facing view in Guidelight.

It is a reusable, template-based board that:

- Shows a single budtender’s **personal favorite products** in a warm, relatable way.
- Feels visually consistent with **State of Mind’s** bright, clean menu aesthetic.
- Is easy to scan on a POS screen, with no visible controls (customers just read it).
- Can be used for any budtender (e.g., Justin, Alicia, Nate) with the same layout.

The board is **not** a separate product or feature per budtender – it’s one **universal layout** whose content comes from the existing `budtenders` and `picks` models in Guidelight.

---

## 2. Success Criteria

### 2.1 Customer

- Immediately understands:
  - Whose picks they are (budtender name).
  - That these are that budtender’s **actual favorites**, not generic house picks.
- Can quickly see:
  - Different product types (flower, pre-roll, vapes, edibles, beverages, topicals, etc.).
  - The vibe or use-case through the budtender’s own short notes.
- Feels invited into a human conversation:
  - “Ask me why I like this.”

### 2.2 Budtender

- Can point to the board and say “these are the things I actually grab for myself.”
- Can keep the text **honest and current** through Guidelight Staff View (later phase).
- Doesn’t need to remember every detail mid-rush; the board backs them up.

### 2.3 Manager / Owner

- Sees a consistent, on-brand presentation for any budtender’s picks.
- Can use this as a pattern:
  - For rotating “Featured Budtender” screens.
  - For social posts or print-outs of staff favorites.

### 2.4 Technical

- Implemented entirely inside the existing Guidelight stack:
  - Vite + React + TypeScript
  - Supabase (Postgres) as data source
- No additional backend service or external image generation required.
- Works reliably on POS machines and modern mobile browsers.

---

## 3. User Stories

### 3.1 As a customer

> I want to see what **this specific budtender** actually likes and why,  
> so I can trust their recommendations and find something that fits my vibe.

### 3.2 As a budtender

> I want a screen that shows my favorites in my own words,  
> so I can start conversations faster and remember my go-to products.

### 3.3 As a manager

> I want a simple, reusable favorites board layout for all staff,  
> so the shop feels personal and consistent without extra design work.

---

## 4. Content & Layout

### 4.1 Overall Layout

The layout is **generic** and populated per budtender.

**Top section**

- Big title: `[Budtender Name]’s Picks`
  - Example: `Justin’s Picks`, `Alicia’s Picks`.
- Smaller sub-label near it: `Guidelight`
- Short handwritten-style note bubble, parameterized by budtender but with a default template:
  - Default template text:
    - “Hey, I’m [Name]. These are the things I actually grab for myself – ask me why.”
  - This message can be:
    - Generated from a template at runtime, or
    - Stored as a customizable field on the budtender record.

**Main grid**

- Up to **9 products** for that budtender.
- Default layout: 3×3 grid on desktop/POS.
- Each product is a **card** with:
  - Product name (larger, hand-lettered look).
  - Short category line in quotes (e.g., “Indica Hybrid Flower”).
  - Budtender’s one-line note in first person:
    - “Why I like this / when I use it.”
  - Optional small doodle/icon in a corner (e.g., sun, dropper, can).

**Footer**

- Small credit in a corner:
  - `Xylent Studios`
- Acts like an artist signature; subtle, non-intrusive.

---

## 5. Content Model

### 5.1 Per-pick fields

Each card on the board is powered by a `pick` record and has:

- `product_name` – text (full menu-like name).
- `category_line` – short descriptive line in quotes.
  - Example: `"Indica Hybrid Flower"`, `"2:1 Beverage"`.
- `why_i_love_it` – short first-person note in quotes.
  - Example: `"My go-to hybrid flower when I want to unwind and feel cozy."`
- `doodle_key` – optional; references a small icon/doodle.
  - Example: `'sun'`, `'moon'`, `'dropper'`, `'can'`, `'diamond'`, `'zzz'`.

These map directly to fields in the existing `picks` table (with `doodle_key` add-on if needed).

### 5.2 Per-budtender fields (board-level)

The board uses the active budtender’s record to render:

- `name` – used in `[Name]’s Picks` title.
- Optional:
  - `picks_note_override` – custom message; if null, we use the default template.

**Default note template:**

> “Hey, I’m [Name]. These are the things I actually grab for myself – ask me why.”

### 5.3 Example Seed (Justin)

For the first live use, the board can be seeded with Justin’s favorites. These are stored as `picks` belonging to Justin’s `budtender_id`. Other budtenders can later use the same layout by adding their own picks; no new spec is required.

---

## 6. Visual Style

### 6.1 Theme

- Background: **white / off-white**, to visually flow from itssom.com.
- Vibe: **notebook / sketchbook**, but clean and shop-ready.
- Should feel:
  - Friendly, personal, human.
  - Clean enough that it looks at home next to a professional menu.
  - Slightly playful (hand-drawn lines, doodles).

### 6.2 Typography & Colors

- Primary text color: near-black (`#111827` / `#1F2933`).
- Accent colors:
  - Soft teal (align loosely with State of Mind brand)
  - Warm yellow
  - Muted pink
  - Pale green
- Fonts:
  - Title: casual display / handwritten style.
  - Body: highly legible sans-serif or neat handwritten font.

### 6.3 Doodles / Clipart

Doodles are **small SVG icons**:

- Examples: sun, moon, stars, cloud, arrows, pre-roll, dropper, can, jar, diamond, zzz.
- Usage:
  - Hint at **product form** (tincture, beverage, topical).
  - Reinforce **vibe** (sleepy, social, bright, cozy).
- Rules:
  - Do not compromise text legibility.
  - Default to no doodle if `doodle_key` is not set.

---

## 7. Behavior & Navigation

- **Customer View only:**
  - The board itself is read-only.
  - No visible edit controls or forms.
- **Selection of budtender:**
  - Either:
    - A global **Customer View** where you select a budtender, then see that budtender’s board; or
    - A dedicated route per budtender (e.g., `/board/justin`).
- **Responsive behavior:**
  - Desktop/POS: 3×3 grid.
  - Tablet: 2 columns.
  - Mobile: 1 or 2 columns stacked.
- **Empty state:**
  - If a budtender has fewer than 9 picks, show only existing ones.
  - If a budtender has no picks, show a friendly message:
    - “No picks yet – ask [Name] to set up their favorites in Guidelight.”

---

## 8. Future Extensions

- Rotate between budtenders on a timer (e.g., every 30 seconds).
- Add subtle animations (e.g., doodles wiggle slightly on load).
- Add a “Deals” variant using the same board template but filtered to `special_role` or `best_deal_*` picks.
- Add a “Download as image” action (DOM-to-image) for social media and print usage.

---

## 9. Non-Goals (For Now)

- No per-budtender **custom layouts** beyond content and optional doodles.
- No on-screen editing; all edits go through Guidelight Staff View.
- No backend image rendering or AI-driven graphics. Everything is DOM + CSS + local assets.
