# Guidelight – Architecture Overview
*Xylent Studios*

This document describes the planned technical architecture for Guidelight: how the app is structured, how it talks to Supabase, and how we organize code for maintainability and future growth.

---

## 1. High-Level Architecture

Guidelight is a **client-side React app** that reads and writes data directly to **Supabase** (Postgres + `supabase-js`). There is no separate custom backend service in the MVP.

- **Frontend:** Vite + React + TypeScript
- **Backend-as-a-service:** Supabase
  - Tables: `budtenders`, `categories`, `picks`
  - Optional later: `packs`, `sessions`, etc.
  - `budtenders` rows map 1:1 with Supabase `auth.users` via a unique `auth_user_id`, and `picks` enforce one active `special_role` per staff member with a partial unique index.
- **Hosting:**
  - Static frontend hosted on Netlify/Vercel (TBD)
  - Supabase hosted in the cloud

The app runs:

- On Windows POS machines (primary) in Chrome/Edge.
- On personal devices for staff testing and updates.

---

## 2. Frontend Structure

Planned `src/` layout:

```text
src/
  lib/
    supabaseClient.ts
    api/
      budtenders.ts
      categories.ts
      picks.ts
  components/
    layout/
    budtenders/
    picks/
    shared/
  views/
    CustomerView.tsx
    StaffView.tsx
  App.tsx
  main.tsx
```

### 2.1 `lib/supabaseClient.ts`

- Creates and exports a single Supabase client using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Used by all API modules.

### 2.2 `lib/api/*`

Each file wraps Supabase calls for a specific domain:

- `budtenders.ts`
  - `getBudtenders()`
  - `getActiveBudtenders()`
  - (Later) `createBudtender`, `updateBudtender`

- `categories.ts`
  - `getCategories()`

- `picks.ts`
  - `getPicksForBudtender(budtenderId)`
  - `getPicksForBudtenderAndCategory(budtenderId, categoryId)`
  - `createPick(data)`
  - `updatePick(id, data)`
  - `deletePick(id)` (or soft delete via `is_active`)

These modules return typed data structures (`Pick`, `Budtender`, etc.) used by views and components.

---

## 3. State Management

For MVP, lightweight React state is enough:

- `App.tsx` holds:
  - Current mode: `customer` or `staff`
  - Selected budtender ID

- Each view (`CustomerView`, `StaffView`) handles its own data fetching and local UI state.

Possible future improvements:

- React Query or SWR for data fetching/caching.
- Central store (Zustand, Redux) if interactions get more complex.

---

## 4. Data Flow

### 4.1 Customer View

1. On load:
   - Fetch active budtenders.
   - Fetch categories.
2. When a budtender is selected:
   - Fetch that budtender’s active picks (single query with joins or two queries).
3. When a category tab is selected:
   - Filter picks client-side to that category.
4. When “Deals” or “Personal” is selected:
   - Filter picks by `special_role`.

Reads are more frequent than writes here. Optimizing for read performance and simple, clear UI is the priority.

On Windows POS machines (Chrome, landscape) the Customer View stays fixed and non-scrolling, showing a limited number of large cards per screen. On phones and tablets it shifts into a responsive layout where vertical scrolling is allowed so the experience matches modern web apps. The staff selector always lists every active staff member (budtender, vault tech, manager) but displays only their names for MVP. Regardless of device, Customer View only runs inside an authenticated session and can be toggled directly from Staff View without logging out.

### 4.2 Staff View

1. On load:
   - Fetch budtenders and categories.
2. When a budtender is selected:
   - Fetch all picks for that budtender.
3. When creating/updating a pick:
   - Call the appropriate API helper.
   - Optimistically update local state or re-fetch picks.

Staff View can tolerate slightly more latency; correctness and clarity are more important than micro-optimizations. Unlike the fixed Customer View, Staff View is fully responsive, can scroll on any device, and should feel comfortable on both POS screens and phones for quick edits away from the counter.

Staff View and Customer View share the same authenticated session/mode toggle inside the SPA; staff can flip between them while remaining logged in so the POS screen can be safely rotated toward customers without exposing edit controls.

---

## 5. Environment & Configuration

Environment variables (Vite):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

These are loaded at build/dev time and used to create the Supabase client.

For local development:

- `.env.local` file (ignored by git).

For production:

- Set env vars in the hosting provider (Netlify/Vercel dashboard).

---

## 6. Error Handling & Empty States

### 6.1 Supabase Errors

- All API helpers should:
  - Catch errors.
  - Log a concise, useful message (for dev tools).
  - Return `null` or throw a controlled error type.

UI handling:

- Show friendly message when data fails to load.
- Provide a “Retry” button where appropriate.

### 6.2 Empty States

Handle cases where:

- A budtender has no picks yet.
- A category has no picks for that budtender.

UX:

- Customer View: “No picks yet in this category.” (Encourage asking the budtender anyway.)
- Staff View: Clear empty state with a prompt: “No picks yet – add your first favorite for this category.”

---

## 7. Security & Auth

Security & Auth (MVP):

- Guidelight is an internal tool; the entire SPA (Customer and Staff modes) is behind Supabase Auth (email/password). There is no anonymous access and no public Customer View URL.
- Roles: `budtender`, `vault_tech`, `manager`. Vault techs are back-of-house inventory staff but they appear identical to budtenders in the UI, and managers are also selectable in Customer View like any other staff member.
- After login, staff can switch between:
  - **Staff View (edit mode):** responsive, scrollable UI where budtenders/vault techs edit only their own profile + picks, while managers can edit any staff profile and manage any picks or `is_active` status.
  - **Customer View (display mode):** read-only mode that stays inside the authenticated session; on POS it is fixed/non-scrolling, while on smaller devices it becomes responsive with scrolling.
- RLS policies:
  - `budtenders`: everyone can `SELECT`; staff may `UPDATE` only their own row; managers can `UPDATE` any row; inserts happen via managers or admin tooling.
  - `categories`: everyone can `SELECT`; mutations are seed/admin-only for MVP.
  - `picks`: everyone can `SELECT`; staff can modify picks tied to their own `budtender_id`; managers can modify picks for any staff member. A partial unique index ensures only one active `special_role` per staff member, while `rank` stays a soft client-side sort key.

Future:

- Refine auth and RLS for multi-store / multi-tenant deployments, add more granular permissions, and introduce store-level separation plus audit logs as Guidelight scales.

---

## 8. Future Considerations

- Introduce a `packs` table to model grouped recommendations (e.g., “Bad Day Reset Pack”).
- Add analytics (which picks are most used / sold).
- Add offline-friendly caching for POS machines (service worker, local storage).
- Migrate shared logic and types into a reusable Xylent “core” package if multiple apps start sharing the same models.

Guidelight is designed to start simple and honest, and grow only as needed. The architecture deliberately favors readability and approachability over over-engineering.
