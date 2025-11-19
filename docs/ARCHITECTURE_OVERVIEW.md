# Guidelight – Architecture Overview
*Xylent Studios*

---
**Document Metadata**

| Field | Value |
|-------|-------|
| **Status** | ✅ Active |
| **Last Updated** | 2025-11-19 |
| **Owner** | Justin (State of Mind) |
| **Audience** | Engineering |
| **Purpose** | Technical architecture, data flow, API structure, security model, deployment |

---

This document describes the planned technical architecture for Guidelight: how the app is structured, how it talks to Supabase, and how we organize code for maintainability and future growth.

## 1. High-Level Architecture

Guidelight is a **client-side React app** that reads and writes data directly to **Supabase** (Postgres + `supabase-js`). There is no separate custom backend service in the MVP.

- **Frontend:** Vite + React + TypeScript
- **Backend-as-a-service:** Supabase
  - Tables: `budtenders`, `categories`, `picks`
  - Optional later: `packs`, `sessions`, etc.
  - `budtenders` rows map 1:1 with Supabase `auth.users` via a unique `auth_user_id`, include optional `slug` + `picks_note_override` fields, and `picks` enforce one active `special_role` per staff member with a partial unique index plus optional `category_line` + `doodle_key` metadata for the Budtender Board layout.
- **Runtime:** Node.js ≥ 20.19.0 (see `.nvmrc` / README prerequisites).
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
    ui/               # shadcn/ui components (Button, Card, Input, etc.)
    layout/
    budtenders/
    picks/
    shared/
  styles/
    theme.css         # Radix Colors + semantic design tokens
  views/
    CustomerView.tsx
    StaffView.tsx
  App.tsx
  main.tsx
  index.css           # Tailwind imports + global styles
```

### 2.1 UI & Styling

**Tailwind CSS** serves as the base utility system for all styling:
- Imported via `@import 'tailwindcss'` in `src/index.css`
- Configured in `tailwind.config.js` with semantic color mappings

**shadcn/ui** provides accessible, composable React components:
- All UI primitives live in `src/components/ui/` (Button, Card, Input, Label, Textarea, Select, Switch, Badge, Tabs, etc.)
- Built on Radix UI primitives with Tailwind styling
- Installed via `npx shadcn@latest add <component>`

**Radix Colors** defines the base color palette:
- Semantic tokens defined in `src/styles/theme.css`:
  - **Neutrals:** `slate` (backgrounds, surfaces, text, borders)
  - **Primary:** `jade` (brand accent, active states, CTAs)
  - Tokens: `--gl-bg`, `--gl-bg-soft`, `--gl-surface`, `--gl-border`, `--gl-text`, `--gl-text-muted`, `--gl-primary`, `--gl-primary-soft`, `--gl-primary-foreground`, `--gl-accent`
- Exposed as Tailwind utilities: `bg-surface`, `text-muted`, `bg-primary`, `border-border`, etc.
- Designed for both POS displays (high contrast, large touch targets) and mobile devices (responsive, scrollable)

For detailed token reference, see `docs/GUIDELIGHT_DESIGN_SYSTEM.md`.

### 2.2 Auth & User Context

**`src/contexts/AuthContext.tsx`** provides centralized authentication state:

```tsx
interface AuthContextValue {
  user: User | null;              // Supabase auth user
  profile: Budtender | null;      // Matching budtenders row
  loading: boolean;               // True during session check
  isManager: boolean;             // Convenience flag for role checks
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
```

**How it works:**
1. On mount, check for existing Supabase session (`supabase.auth.getSession()`)
2. If session exists, fetch matching budtender profile via `getCurrentUserProfile()`
3. Store `{ user, profile, loading }` in React Context
4. Subscribe to auth state changes (login/logout/token refresh)
5. Expose via `useAuth()` hook for easy consumption in components

**Usage examples:**
- Auto-select logged-in user in Staff View: `const { profile } = useAuth();`
- Show/hide manager features: `const { isManager } = useAuth();`
- Route protection: `if (!user) return <Navigate to="/login" />;`

### 2.3 `lib/supabaseClient.ts`

- Creates and exports a single Supabase client using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Configured with `persistSession: true` to support 12-hour shifts with auto token refresh.
- Used by all API modules and AuthContext.

### 2.4 `lib/api/*`

Each file wraps Supabase calls for a specific domain:

- `auth.ts`
  - `getCurrentUserProfile()` - Fetches budtender profile matching `auth.users.id`

- `budtenders.ts`
  - `getBudtenders()`, `getActiveBudtenders()`, `getBudtenderById()`
  - `updateBudtender(id, data)`
  - `createBudtender(data)` - Manager-only (RLS enforced)
  - `deleteBudtender(id)` - Manager-only, cascades to picks

- `categories.ts`
  - `getCategories()`

- `picks.ts`
  - `getPicksForBudtender()`, `getPicksForBudtenderAndCategory()`, `getActivePicksForBudtender()`
  - `createPick(data)`, `updatePick(id, data)`, `deletePick(id)`, `deactivatePick(id)`

These modules return typed data structures (`Pick`, `Budtender`, etc.) used by views and components. All mutations respect RLS policies (no service role key usage).

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

### 7.1 Authentication Flow

Guidelight is an internal tool; the entire SPA is behind Supabase Auth (email/password). There is no anonymous access.

**Login:**
- Staff navigate to the app and are presented with a login page if not authenticated.
- Enter email + password.
- Supabase validates credentials and returns a session token.
- Session persists in browser storage (Supabase handles this automatically).
- On successful login, redirect to Staff View (or Customer View if that was the last viewed mode).

**Session Management:**
- Session persists across page refreshes via Supabase's built-in persistence.
- Session expiration handled gracefully: if a session expires, redirect to login with a message.
- Logout button in app header calls `supabase.auth.signOut()` and redirects to login page.

**Route Protection:**
- All app routes require authentication.
- `App.tsx` checks for active session on mount.
- If no session, redirect to `/login`.
- Customer View and Staff View are only accessible when authenticated.

### 7.2 User Roles & Permissions

Roles: `budtender`, `vault_tech`, `manager`. Vault techs are back-of-house inventory staff but they appear identical to budtenders in the UI, and managers are also selectable in Customer View like any other staff member.

**Budtenders & Vault Techs:**
- View all staff profiles and picks.
- Edit only their own profile fields.
- Create/update/deactivate only their own picks.

**Managers:**
- All budtender/vault tech permissions, plus:
- **Invite Staff:** Create budtender profile (name, email, role) → Supabase Admin API sends invite email with magic link → New staff sets password.
- **Manage Staff:** View all staff (active + inactive), edit any profile, toggle `is_active`, hard delete with double confirmation.
- Edit any staff member's picks.

**View Modes:**
- After login, staff can switch between:
  - **Staff View (edit mode):** responsive, scrollable UI where budtenders/vault techs edit only their own profile + picks, while managers can edit any staff profile and manage any picks or `is_active` status.
  - **Customer View (display mode):** read-only mode that stays inside the authenticated session; on POS it is fixed/non-scrolling, while on smaller devices it becomes responsive with scrolling.

### 7.3 RLS Policies

- **`budtenders`**: everyone can `SELECT`; staff may `UPDATE` only their own row; managers can `UPDATE` any row; managers can `INSERT` new budtenders (for invite flow); managers can `DELETE` (hard delete with cascades).
- **`categories`**: everyone can `SELECT`; mutations are seed/admin-only for MVP.
- **`picks`**: everyone can `SELECT`; staff can `INSERT`/`UPDATE`/`DELETE` picks tied to their own `budtender_id`; managers can modify picks for any staff member. A partial unique index ensures only one active `special_role` per staff member, while `rank` stays a soft client-side sort key.

Future:

- Refine auth and RLS for multi-store / multi-tenant deployments, add more granular permissions, and introduce store-level separation plus audit logs as Guidelight scales.

---

## 8. Future Considerations

- Introduce a `packs` table to model grouped recommendations (e.g., “Bad Day Reset Pack”).
- Add analytics (which picks are most used / sold).
- Add offline-friendly caching for POS machines (service worker, local storage).
- Migrate shared logic and types into a reusable Xylent “core” package if multiple apps start sharing the same models.

Guidelight is designed to start simple and honest, and grow only as needed. The architecture deliberately favors readability and approachability over over-engineering.
