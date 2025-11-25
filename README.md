# Guidelight

**Guidelight** is an internal web app by **Xylent Studios** that powers budtender-specific product recommendations at State of Mind dispensary.

Each budtender gets a small profile and a curated set of favorites (flower, pre-rolls, vapes, edibles, beverages, concentrates, wellness, deals, and personal wildcards). The app runs in a browser on the POS machines and can also be used on phones.

Guidelight is an internal, authenticated-only app for State of Mind staff. The entire experience requires Supabase Auth (email + password); there is no public or anonymous access. Customers only see the Customer View when a staff member flips the POS screen toward them.

Guidelight is intentionally small, focused, and opinionated: it’s a real, shippable piece of infrastructure that also serves as a prototype for future "favorites" and recommendation features in the broader Xylent / DankDeck ecosystem.

---

## Core Idea

At the counter, customers constantly ask things like:

- “What’s your favorite indica / sativa / hybrid right now?”
- “What do you recommend for sleep?”
- “What’s a good deal that’s actually good?”
- “What would *you* personally smoke or eat tonight?”

Budtenders know the answers, but:

- Memory is limited (especially on busy days).
- Product lineup changes constantly.
- It’s hard to keep recommendations consistent across staff.

**Guidelight** solves this by giving each budtender:

- A small **profile** (name, archetype, ideal high, tolerance).
- A structured set of **favorite slots** (e.g., “Daytime flower”, “Sleep edible”, “Favorite blunt”, “Best value pack”, “Overall current favorite”).
- A simple UI to **edit their picks**.
- A **customer-facing view** you can pull up on the POS, flip the screen, and walk through together.

---

## Features (MVP)

### Customer View

- Select a **budtender** from a list of active staff.
- See that budtender’s favorites, grouped by **product type**:
  - Flower
  - Pre-rolls (with sub-types: regular, infused, minis, packs, blunts)
  - Vapes
  - Edibles
  - Beverages
  - Concentrates
  - Wellness / ratios
  - Topicals
- Within each type, show 1–3 curated picks with:
  - Product name
  - Brand
  - “Vibe” tags (e.g. `chill`, `sleep`, `fun`, `heavy`)
  - Time-of-day context (`Day`, `Evening`, `Night`, `Anytime`)
  - Experience level (`Newbie-safe`, `Regular`, `Heavy`)
  - One line: **“Why I love it”**
- Dedicated “**Deals**” section:
  - Best current deal overall
  - Best pre-roll deal
  - Best edible deal
- “**Personal Favorites**” section:
  - Overall current favorite
  - Comfort product
  - Wildcard / weird favorite

UI goals:  
- Big, clear cards; touch-friendly on POS.  
- Easy to scan while talking; no clutter, no data overload.  
- Fixed, landscape layout (e.g., 1920×1080) with no vertical scrolling; if more than ~9 picks are needed, use simple paging or tabs.  
- Runs only while a staff member is logged in; it’s a read-only mode of the authenticated app, not a public URL.

---

### Staff View

- Dropdown to select **budtender** (auth ties back to Supabase users).
- For the selected budtender:
  - See all their current picks by category.
  - Add, edit, and deactivate picks via simple forms.
- Fields per pick:
  - Product name
  - Brand
  - Product type (flower / pre_roll / vape / edible / beverage / concentrate / wellness / topical)
  - Optional pre-roll subtype (regular_single / infused_single / mini_pack / value_pack / big_blunt_2g)
  - Time of day
  - Vibe tags (comma-separated; stored as array)
  - Experience level
  - Budget level (budget / mid / premium)
  - Special role (e.g., `overall_favorite`, `best_deal_overall`, `sleep_edible`, etc.)
  - Rank (1, 2, 3) for ordering within a category
  - Active toggle

UX goals:  
- Fast to update between customers.  
- Feels like filling a tiny profile, not corporate paperwork.  
- Safe to leave open on POS (no scary admin controls).

**Authentication & User Management:**

All staff authenticate via Supabase Auth (email + password):

- **Login:** Staff log in with their email and password. Session persists across page refreshes.
- **Logout:** Logout button in app header clears session and returns to login page.
- **Invite System (Edge Function):** Managers invite new staff directly from the app with a simple form (email + name + role). A Supabase Edge Function creates the auth user, links a budtender profile, and sends an invite email with a magic link—all in one transaction. New staff click the link, are automatically logged in, and can optionally set a password later. No Supabase Dashboard access required.

**Staff Roles:**

- **Budtenders** – front-of-house staff who manage their own picks and present Customer View.
- **Vault Techs / Inventory Specialists** – back-of-house staff who behave like budtenders in-app but focus on supply-side favorites.
- **Managers** – can invite/manage all staff, edit any staff member's profile and picks, and toggle staff `is_active` status or hard delete with confirmation.

---

## Tech Stack

- **Frontend:**
  - Vite
  - React
  - TypeScript

- **UI / Styling:**
  - **Tailwind CSS** – utility-first CSS framework for rapid, consistent styling.
  - **shadcn/ui** – accessible, composable React components built on Radix UI primitives (components live in `src/components/ui`).
  - **Radix Colors** – semantic color palette (slate neutrals, jade primary) providing a shared design system optimized for both POS displays and mobile devices.

- **Backend / Data:**
  - Supabase (Postgres + `@supabase/supabase-js`)
  - Supabase Auth (email + password) for all staff logins; app talks directly to Supabase using authenticated sessions.

- **Hosting:**
  - Static frontend on Netlify/Vercel (TBD).
  - Supabase hosted in the cloud.

- **Target devices:**
  - Windows POS machines with Chrome/Edge (primary). On desktop POS (Chrome, landscape), the Customer View uses a fixed, non-scrolling layout.
  - Modern mobile browsers (secondary). On phones and tablets, both Staff and Customer views behave like a responsive web app, so layouts adapt to the screen and vertical scrolling is allowed when needed.

---

## Data Model (High-Level)

Core tables:

- `budtenders`
  - Name, nickname, archetype, ideal high, tolerance level, is_active.
- `categories`
  - Product category names (`Flower`, `Pre-rolls`, `Vapes`, `Edibles`, `Beverages`, `Concentrates`, `Wellness`, `Topicals`).
- `picks`
  - One record per favorite slot:
  - Links to `budtenders` and `categories`.
  - Stores product name, brand, product_type, optional pre_roll_subtype.
  - Stores effect/timing/experience/budget tags and `special_role` when applicable.
  - Picks also include tag arrays (such as `effect_tags`) and a short `why_i_love_it` blurb so staff can capture how they actually talk about each product.

For the full, authoritative SQL schema, see `docs/GUIDELIGHT_SPEC.md`.

Guidelight deliberately models what staff say out loud, not the full inventory. SKUs and Treez integration can be layered on later.

---

## Getting Started (Dev)

### Prerequisites

- **Node.js 20.19.0 or newer.** Vite 7 requires Node ≥ 20.19 (22.12+ also supported). The repo includes an `.nvmrc` pinned to `20.19.0`; run `nvm use` (or your preferred version manager) before installing dependencies.
- **npm 10+** (ships with the Node versions above).
- **Supabase project** with the schema from `docs/GUIDELIGHT_SPEC.md` applied.

### Bootstrap: First Manager Setup

Before anyone can use Guidelight, create the first manager account manually via Supabase Dashboard:

1. **Supabase Dashboard → Authentication → Users** → Click "Add user"
2. Enter email + password for the first manager
3. Copy the user's UUID from the `id` column
4. **Table Editor → `budtenders` table** → Insert new row:
   - `auth_user_id`: (paste UUID from step 3)
   - `name`: Manager's name
   - `role`: `manager`
   - `is_active`: `true`
5. Save. This manager can now log in and invite other staff.

**Note:** This is a one-time manual step. After this, all staff are invited through the app.

### Installation

1. **Clone the repo**

   ```bash
   git clone <repo-url> guidelight
   cd guidelight
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment variables**

   Copy `.env.example` to `.env.local` and fill in your Supabase project values:

   ```bash
   cp .env.example .env.local
   # then edit:
   # VITE_SUPABASE_URL=...
   # VITE_SUPABASE_ANON_KEY=...
   ```

   The Supabase anon key is still required for the client SDK, but every request is protected by Supabase Auth + RLS, so only logged-in staff can read or write data.

4. **Run dev server**

   ```bash
   npm run dev
   ```

   Open the URL (usually `http://localhost:5173`).

5. **Build for production**

   ```bash
   npm run build
   ```

   Deploy the contents of `dist/` to Netlify/Vercel.

---

## Project Structure (Planned)

```text
guidelight/
  ├─ src/
  │  ├─ lib/
  │  │  ├─ supabaseClient.ts
  │  │  ├─ api/
  │  │  │  ├─ budtenders.ts
  │  │  │  ├─ categories.ts
  │  │  │  └─ picks.ts
  │  ├─ components/
  │  │  ├─ layout/
  │  │  ├─ budtenders/
  │  │  ├─ picks/
  │  │  └─ shared/
  │  ├─ views/
  │  │  ├─ CustomerView.tsx
  │  │  └─ StaffView.tsx
  │  ├─ App.tsx
  │  └─ main.tsx
  ├─ docs/
  │  └─ GUIDELIGHT_SPEC.md
  ├─ index.html
  ├─ package.json
  ├─ tsconfig.json
  └─ vite.config.ts
```

---

## Status

✅ **Version 1.0.0 - Ready for Production**

MVP Complete:

- [x] Supabase schema created (`budtenders`, `categories`, `picks`)
- [x] Complete authentication & invite system
- [x] Customer View: select budtender → see favorites by category
- [x] Staff View: full CRUD for budtender picks
- [x] Staff Management View: invite, edit, delete staff (manager-only)
- [x] Edge Functions deployed (invite, status, password reset)
- [x] RLS policies for role-based access control
- [x] Ready for Netlify deployment

**Production URL:** `https://guidelight.xylent.studio`

Owner: **Xylent Studios**  
Internal client: **State of Mind dispensary**

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

**Quick Deploy to Netlify:**

1. Push to GitHub: `git push origin main`
2. Connect repository in Netlify
3. Set environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
4. Deploy!

**Post-Deployment:**
- Update Supabase redirect URLs to `https://guidelight.xylent.studio`
- Test authentication flows
- Verify Edge Functions are working
