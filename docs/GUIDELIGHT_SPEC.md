# Guidelight – Product & Technical Spec
*Xylent Studios*

---
**Document Metadata**

| Field | Value |
|-------|-------|
| **Status** | ⚠️ Partially Superseded |
| **Last Updated** | 2025-11-28 |
| **Owner** | Xylent Studios |
| **Audience** | Product, Engineering, State of Mind Staff |
| **Purpose** | Complete product specification: features, user flows, data model, permissions, UX guidelines |
| **Version** | v1.0.0 (MVP Complete) |

---

> **📋 UX Overhaul Notice (2025-11-28)**
>
> The UX/UI portions of this spec are being superseded by the v9 UX overhaul documentation:
>
> - **UX Principles:** `notes/251128_guidelight_ux_overhual/ai-dev/01_GUIDELIGHT_UX_PRINCIPLES_AND_CONTEXT.md`
> - **Information Architecture:** `notes/251128_guidelight_ux_overhual/ai-dev/02_GUIDELIGHT_INFORMATION_ARCHITECTURE.md`
> - **My Picks & Show to Customer:** `notes/251128_guidelight_ux_overhual/ai-dev/03_SCREEN_SPECS_STAFF_MOBILE_MY_PICKS_AND_SHOW.md`
> - **Display Mode:** `notes/251128_guidelight_ux_overhual/ai-dev/04_SCREEN_SPECS_CUSTOMER_DISPLAY_MODE.md`
> - **Team & Auth:** `notes/251128_guidelight_ux_overhual/ai-dev/05_TEAM_AND_AUTH_SPEC.md`
>
> The **data model** and **permissions** sections in this document remain authoritative.

---

## 1. Purpose & Goals

### 1.1 Why this exists

At State of Mind, customers regularly ask:

- “What’s your favorite indica / sativa / hybrid right now?”
- “What would you recommend for sleep / fun / focus?”
- “What’s a solid deal that’s actually good?”
- “What would *you* personally grab today?”

Budtenders have opinions and experience, but:

- Memory is fallible (busy shifts, long menus).
- Products rotate frequently.
- Customers want relatability and consistency more than just “top THC %”.

**Guidelight** is a small internal tool that:

- Captures each budtender’s **current favorites** in a structured way.
- Makes those favorites **easy to show** at the register.
- Provides a **data model** that can evolve into user-side favorites in DankDeck and other Xylent products later.

### 1.2 Success Criteria (MVP)

- Budtenders at SOM can:
  - Add/update their own favorites in a few minutes.
  - Pull up their “picks” view on the POS and use it with customers.
- Customers:
  - Feel more confident (“I can see what *you* actually like.”).
  - Get faster recommendations that make sense for their goals.
- Technical:
  - App is stable, fast, and trivial to deploy/update.
  - Data model is clean enough to reuse in future Xylent / DankDeck work.

Non-goals for MVP:

- No live integration with Treez or inventory APIs.
- No per-SKU catalog or price syncing.
- No customer accounts or multi-tenant auth. MVP uses simple Supabase Auth (email + password) for staff only (budtenders, vault techs, managers). The entire web app is behind login; there is no anonymous or public access.

---

## 2. User Roles & Flows

### 2.1 Roles

1. **Budtender**
   - Frontline user.
   - Maintains their own favorites (primarily from shop floor).
   - Uses Customer View with customers.

2. **Vault Tech (Inventory Specialist)**
   - Back-of-house staff who manage ordering, vault inventory, and transfers.
   - Maintains their own picks (often highlighting supply-side context) and can surface them for customers.

3. **Manager**
   - May edit all staff’s picks.
   - Uses the tool to:
     - Understand staff preferences.
     - Align promotions with staff favorites.
     - Toggle `is_active` for staff profiles as needed.

4. **Customer (indirect)**
   - Does not interact with the app as a logged-in user.
   - Sees the Customer View screen and uses it as a conversation anchor.

**Permissions & Auth (MVP):**

- All staff roles authenticate via Supabase Auth (email + password); there is no anonymous access to any route.
- **Login/Logout:**
  - Staff log in with their email + password via a dedicated login page.
  - Session persists across page refreshes.
  - Logout button available in app header; clears session and returns to login.
- **Budtenders & Vault Techs:**
  - View all staff profiles.
  - Edit only their own profile fields.
  - Create/update/deactivate only their own picks.
  - Vault techs are back-of-house inventory specialists but appear the same as other staff in the UI for MVP.
- **Managers:**
  - All budtender/vault tech permissions, plus:
  - **Invite new staff:** Create budtender profile (name, email, role) → Supabase sends invite email with magic link → New staff member sets their own password.
  - **Manage staff:** View all staff (active + inactive), edit any profile, toggle `is_active`, hard delete with double confirmation.
  - View and edit every staff member's picks.
  - Create/update/deactivate picks for any staff member.
- **Customer View** is only available within the authenticated session; staff switch between Staff View (edit) and Customer View (display) without logging out.

---

### 2.2 Key Flows

#### Flow A – Manager invites new staff member

1. Manager logs into Guidelight.
2. Navigates to **Staff Management** (manager-only section).
3. Clicks **"Invite Staff Member"**.
4. Fills out invite form:
   - Name (required)
   - Email (required)
   - Role: budtender, vault_tech, or manager
   - Optional: profile_expertise (what they're best at helping with)
5. Clicks **"Send Invite"**.
6. System creates budtender profile in database.
7. **MVP:** App displays: "Profile created. Send invite link to [email]." Manager manually sends Supabase invite link via Dashboard.
   - **Future:** Integrate Supabase Admin API to auto-send invite emails from the app.
8. New staff member receives invite email, clicks magic link, sets their password (Supabase enforces strength requirements).
9. On first login, their profile is already ready; they can immediately start adding picks.

#### Flow B – Budtender updating their picks

1. Log in to Guidelight with email + password.
2. Switch to **Staff View**.
3. Select their name from the budtender dropdown (auto-selected if it's their profile).
4. For each category they care about:
   - Add or edit a pick using a small form.
   - Set vibe tags, time of day, experience level, budget, and "why I love it".
5. Save. Changes reflect immediately in Customer View.

Expected frequency:

- Initial setup once per budtender.
- Quick adjustments weekly or when menu changes.

#### Flow C – Using Customer View during a sale

1. Budtender opens Guidelight, selects **Customer View**.
2. Selects their name (or the coworker the customer trusts most).
3. Chooses a product type (Flower / Pre-rolls / Vapes / Edibles / etc.).
4. Steps through a fixed set of 1–3 curated picks per screen (no vertical scrolling); if more picks exist, staff use paging or tabs to switch.
5. Taps into:
   - “Deals” if customer asks for specials.
   - “Personal Favorites” if customer says “What do *you* actually use?”

The app serves as:

- Memory support.
- A simple, honest “menu inside a person’s brain”.

---

## 3. Information Architecture

### 3.1 Product Types

Product types (align with common menu categories):

- `flower`
- `pre_roll`
- `vape`
- `edible`
- `beverage`
- `concentrate`
- `wellness`
- `topical`

### 3.2 Pre-roll Subtypes

To differentiate regular vs infused, singles vs packs:

- `regular_single` – standard non-infused joint (usually 1g).
- `infused_single` – any infused single (kief, distillate, rosin).
- `mini_pack` – dogwalker-style small joints in a multipack.
- `value_pack` – multi-joint pack emphasizing value.
- `big_blunt_2g` – large blunts / 2g-style pre-rolls.

### 3.3 Effect / Vibe Tags

Tags applied per pick (multi-select):

- `sleep`
- `chill`
- `fun`
- `social`
- `focus`
- `creative`
- `heavy`
- `functional` (can still do stuff)

### 3.4 Time-of-day

Single choice per pick:

- `Day`
- `Evening`
- `Night`
- `Anytime`

### 3.5 Experience Level

Single choice per pick:

- `newbie_safe`
- `regular`
- `heavy`

### 3.6 Budget Level

Single choice per pick:

- `budget`
- `mid`
- `premium`

### 3.7 Special Roles ("Slots")

Certain picks fill specific “slots” in a budtender’s profile. These are optional flags.

Examples:

- `daytime_flower`
- `evening_flower`
- `night_flower`
- `budget_flower`
- `terp_flower`
- `heavy_flower`

- `regular_preroll_favorite`
- `infused_preroll_favorite`
- `mini_pack_favorite`
- `big_blunt_favorite`
- `preroll_value_pack_favorite`

- `sleep_edible`
- `fun_edible`
- `newbie_edible`
- `microdose_edible`

- `social_beverage`
- `night_beverage`

- `entry_level_concentrate`
- `terp_concentrate`
- `wellness_favorite`

Deals:

- `best_deal_overall`
- `best_deal_preroll`
- `best_deal_edible`

Personal:

- `overall_favorite`
- `comfort`
- `wildcard`

Each pick can have zero or one `special_role` (string or enum). This allows a simple “Deals” view or “Personal favorites” view by filtering on `special_role`.

---

## 4. Data Model (DB-level)

### 4.1 `budtenders`

```sql
create table public.budtenders (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users (id),
  name text not null,
  nickname text,
  slug text unique,
  role text not null default 'budtender'
    check (role in ('budtender','vault_tech','manager')),
  location text,          -- e.g. "Main Store", "North Location" (v1.0.0)
  profile_vibe text,      -- Mini-bio mixing personal life + cannabis preferences (1-3 sentences)
  profile_expertise text, -- What they're best at helping customers with (short phrase)
  profile_tolerance text, -- How much they use and how strong they like things (honest, friendly text)
  picks_note_override text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (auth_user_id)
);
```

Roles:

- `budtender` – front-of-house staff recommending products directly to customers.
- `vault_tech` – back-of-house inventory specialists (vault technicians) who track supply, handle ordering, and maintain their own favorite picks to surface when needed.
- `manager` – staff with full oversight who can manage any staff member’s picks and toggle `is_active` for staff profiles.

Managers are still customer-facing budtenders; in the UI (including Customer View) they look identical to others so customers never see role differences.

`auth_user_id` links each staff profile to the Supabase Auth user record to enforce permissions, and the unique constraint enforces a 1:1 mapping between `auth.users.id` and `budtenders.id`.

`slug` is optional and provides clean URLs (e.g., `/board/justin`). A partial unique index on lowercased slug ensures no duplicates when set. `picks_note_override` lets each budtender customize the intro text for Customer View boards; if null, the default note template is used.

### 4.2 `categories`

```sql
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,   -- "Flower", "Pre-rolls", etc.
  sort_order int not null default 0
);
```

Seed values:

- Flower
- Pre-rolls
- Vapes
- Edibles
- Beverages
- Concentrates
- Wellness
- Topicals

Categories are seed-only for MVP; managers or admins adjust them via migrations or the Supabase dashboard, and there is no in-app UI to add, remove, or rename categories.

### 4.3 `picks`

```sql
create table public.picks (
  id uuid primary key default gen_random_uuid(),

  budtender_id uuid not null
    references public.budtenders(id) on delete cascade,

  category_id uuid not null
    references public.categories(id) on delete cascade,

  product_name text not null,
  brand text,
  category_line text,

  product_type text not null check (
    product_type in (
      'flower','pre_roll','vape','edible','beverage','concentrate','wellness','topical'
    )
  ),

  pre_roll_subtype text check (
    pre_roll_subtype in (
      'regular_single','infused_single','mini_pack','value_pack','big_blunt_2g'
    )
  ),

  time_of_day text not null check (
    time_of_day in ('Day','Evening','Night','Anytime')
  ) default 'Anytime',

  effect_tags text[],         -- e.g. {'sleep','chill'}
  experience_level text check (
    experience_level in ('newbie_safe','regular','heavy')
  ),
  budget_level text check (
    budget_level in ('budget','mid','premium')
  ),

  special_role text,          -- any of the slot labels, nullable
  doodle_key text,

  why_i_love_it text,
  rating numeric(2,1) check (rating is null or (rating >= 0.5 and rating <= 5 and (rating * 2) = floor(rating * 2))),
                              -- Staff-set 0.5-5 star rating (half-star increments); null = unrated
  last_active_at timestamptz, -- When this pick was last active (for sorting inactive picks)
  rank int not null default 1,-- DEPRECATED: Legacy sort field, no longer used in app
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index picks_budtender_category_idx
  on public.picks (budtender_id, category_id);

create unique index picks_active_special_role_unique
  on public.picks (budtender_id, special_role)
  where (special_role is not null and is_active = true);
```

For each staff member, only one active pick can occupy a given `special_role`, enforced by the partial unique index above.

**Ordering:** Picks are sorted by active status first, then rating, then recency:
- **Active picks** appear first, ordered by `rating` descending (5→1, with unrated/null last), then by `updated_at` descending.
- **Inactive picks** appear after all active picks, ordered by `last_active_at` descending (most recently active first, null last), then by `updated_at` descending.

**Rating semantics:**
- `rating` (0.5–5 stars in half-star increments) represents how strongly the staff member recommends this pick. Higher-rated picks appear first in both Staff View and Customer View.
- `null` means unrated; these appear last among active picks.
- New picks default to 4 stars.
- In the UI, staff can click the left or right half of each star to select half-star values (e.g., 3.5).

**`last_active_at` semantics:**
- Set to `now()` when a pick is created as active.
- Refreshed to `now()` when an active pick is edited (indicating it's being actively maintained).
- Refreshed to `now()` when toggling `is_active` from false→true.
- Preserved (not reset) when toggling `is_active` from true→false, so we know when it was last in use.

**Deprecated:** `rank` is a legacy field kept for backward compatibility; it is not used in the UI or sort logic.

`category_line` stores the short descriptive string shown on Customer View cards (e.g., "Indica Hybrid Flower"). `doodle_key` maps to small SVG icons (sun, moon, can, etc.) used on the Budtender Picks board; it is optional.

### 4.4 `feedback`

```sql
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  
  -- What kind of feedback
  type text not null check (type in ('bug', 'suggestion', 'feature', 'general', 'other')),
  
  -- The actual feedback
  description text not null,
  
  -- Optional urgency level
  urgency text check (urgency in ('noting', 'nice_to_have', 'annoying', 'blocking')),
  
  -- Anonymous handling
  is_anonymous boolean not null default true,
  submitter_id uuid references public.budtenders(id) on delete set null,
  submitter_name text,  -- denormalized for convenience, null if anonymous
  
  -- Metadata
  page_context text,  -- which page they were on when submitting
  created_at timestamptz not null default now(),
  
  -- For tracking/response
  status text not null default 'new' check (status in ('new', 'reviewed', 'in_progress', 'done', 'wont_fix')),
  reviewed_at timestamptz,
  notes text  -- internal notes from manager
);
```

**Purpose:** Captures bug reports, feature requests, suggestions, and general feedback from staff during alpha testing and ongoing use. All staff can submit feedback; managers can view and respond.

**Fields:**
- `type` – Category of feedback (bug, suggestion, feature, general, other).
- `urgency` – Optional priority level from "just noting it" to "blocking my work".
- `is_anonymous` – Whether the submitter chose to remain anonymous (default true).
- `submitter_id` / `submitter_name` – If not anonymous, links to the staff member who submitted.
- `page_context` – Which page/view the user was on when submitting (for debugging context).
- `status` – Workflow state: new → reviewed → in_progress → done/wont_fix.
- `notes` – Internal notes for manager tracking.

**RLS:**
- All authenticated staff can `INSERT` (submit feedback).
- Only managers can `SELECT`, `UPDATE` (view feedback and update status/notes).

MVP RLS / security model:

- All access requires Supabase Auth (email + password); there is no anonymous or public read access.
- Authenticated staff (budtenders, vault techs, managers) can `SELECT` all relevant tables (`budtenders`, `categories`, `picks`).
- Budtenders and vault techs can `INSERT`/`UPDATE`/`DELETE` (or deactivate) picks where `picks.budtender_id` matches their own `budtenders.id`.
- Managers can manage picks for any staff member and toggle `is_active` on staff profiles.
- Customer View uses the same authenticated session as Staff View and does not bypass RLS.

---

## 5. Frontend Architecture

### 5.1 Routes / Views

MVP as a single-page app with internal mode toggle:

- `/` – main entry point
  - Mode toggle:
    - `Customer` view
    - `Staff` view

If a router is added later, views become:

- `/customer`
- `/staff`

### 5.2 Customer View

Elements:

- **Budtender selector**
  - Row of buttons or a dropdown of active budtenders.
  - Includes every `is_active` staff member (budtenders, vault techs, managers) and shows their name only for MVP—customers should not see role labels.
  - Shows budtender's expertise as a subtitle (truncated gracefully if long).
  - When selected, displays their "My vibe" (profile_vibe) and tolerance level.

- **Category tabs or pills**
  - `Flower`, `Pre-rolls`, `Vapes`, `Edibles`, `Beverages`, `Concentrates`, `Wellness`, `Topicals`, `Deals`, `Personal`.

- **Card list**
  - For the selected budtender + category:
    - Map each `pick` to a card with:
      - Product name
      - Brand
      - Chips for `effect_tags`
      - Time-of-day + experience + budget
      - One-liner “Why I love it”

- **Special views**
  - “Deals” tab → filter picks where `special_role` starts with `best_deal_`.
  - “Personal” tab → filter `special_role in ('overall_favorite','comfort','wildcard')`.

Layout & responsiveness (Customer View):

- On desktop POS machines (Chrome, landscape), use a fixed 1920×1080-style layout with no vertical scrolling; keep roughly 6–9 large, readable cards per screen and rely on paging or tabs for overflow.
- On phones and tablets, the layout becomes fully responsive, and vertical scrolling is allowed so the experience matches modern web apps while still keeping cards touch-friendly.
- Cards must remain touch-friendly and readable when the POS screen is flipped toward the customer.
- The Customer View is read-only, only available while a staff member is logged in, and uses the same authenticated session as Staff View. Customers never log in; they only see what staff show them.

### 5.3 Staff View

Elements:

- **Budtender selector**
  - Same as Customer View, but also allows manager to pick others.

- **Category sections**
  - For each category:
    - List existing picks (active) with edit/delete controls.
    - “Add pick” button.

- **Pick form fields**
  - Product name (text)
  - Brand (text)
  - Product type (select)
  - If product type = pre_roll → pre_roll_subtype (select)
  - Time of day (select)
  - Effect tags (comma-separated → split to array)
  - Experience level (select)
  - Budget level (select)
  - Special role (select from enum list or none)
  - Why I love it (textarea)
  - Rank (numeric input 1–3)
  - Active toggle

Staff View is allowed to be more “form-like” since it’s staff-only.
It must remain fully responsive, scrollable on any device, and comfortable for both POS machines and mobile browsers so staff can make quick updates away from the counter.

---

## 6. Non-functional Requirements

- **Performance**
  - Low latency for reading list of picks.
  - No heavy animations or unnecessary network chatter.
- **Reliability**
  - Handle empty states (budtender with no picks yet).
  - Graceful UI when Supabase is unreachable (message, retry button).
- **Security (MVP)**
  - Entire app runs behind Supabase Auth (email + password); there is no anonymous or public access, and Customer View stays inside the authenticated session.
  - RLS policies enforce table-level rules:
    - `budtenders`: all authenticated staff can `SELECT`. Staff may `UPDATE` only their own row. Managers can `UPDATE` any row and toggle `is_active`. Inserts happen via managers or admin tooling.
    - `categories`: all authenticated staff can `SELECT`. Inserts/updates/deletes are seed/admin-only for MVP (no in-app UI).
    - `picks`: all authenticated staff can `SELECT`. Staff can `INSERT`/`UPDATE`/`DELETE` (or deactivate) picks where `picks.budtender_id` matches their own profile. Managers can perform those actions for any staff member.
  - These policies ensure budtenders and vault techs manage only their own picks while managers oversee everyone.
- **Maintainability**
  - Supabase access in dedicated API modules.
  - Types in shared TypeScript interfaces.

---

## 7. Future Extensions (Not in MVP)

- Link picks to real SKUs via Treez or an internal product catalog.
- Refine auth and RLS. Extend the basic staff-only Supabase Auth model into multi-store / multi-tenant scenarios, add more granular permissions, and tighten RLS policies as needed (e.g., store-level separation, audit logs).
- Add analytics: which picks are most used / sold the most.
- Extend the model to **customer favorites** (same schema, different user type).
- Source picks automatically from DankDeck profiles.

---

## 8. Ownership

- Product & design: **Xylent Studios** (Justin).  
- Implementation: Xylent internal (or future collaborators).  
- Primary client context: **State of Mind dispensary**.

This spec should stay in sync with the real behavior of Guidelight. When we add or change fields, flows, or UI elements, update here first, then in code.
