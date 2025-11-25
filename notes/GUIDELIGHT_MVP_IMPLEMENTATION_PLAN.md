# Guidelight MVP Implementation Plan

---
**Document Metadata**

| Field | Value |
|-------|-------|
| **Status** | ✅ Active |
| **Last Updated** | 2025-11-25 |
| **Owner** | Justin (State of Mind) |
| **Audience** | Engineering |
| **Purpose** | Step-by-step MVP implementation guide (8 steps), execution-ready for Cursor Composer |

---

## Context
- Repo: `guidelight` (Vite + React + TypeScript, Supabase backend).
- Goal: Produce a working MVP that covers Staff View CRUD and Customer View display, aligned with `GUIDELIGHT_SPEC.md` and `ARCHITECTURE_OVERVIEW.md`.
- Current phase: Planning complete (Phase 2 in `GUIDELIGHT_MVP_SPRINT_PLAN.md`). Implementation begins at Step 1 below.

## Today’s Objectives
1. Stand up the application shell with routing/mode toggle.
2. Establish a typed Supabase data layer.
3. Deliver Staff View MVP (basic CRUD).
4. Deliver Customer View MVP (read-only, POS-ready layout).
5. Wire Supabase Auth, perform QA, and document results.

## Execution Steps
1. **App Shell & Routing**
   - **Goal:** Initialize Vite project on a feature branch, configure `App.tsx`/`main.tsx`, and provide Customer vs Staff placeholders.
   - **Files:** `package.json`, `tsconfig.json`, `src/main.tsx`, `src/App.tsx`, `src/components/layout/*`, `src/views/*`.
   - **Prereqs:** `git checkout -b feature/guidelight-mvp`.
   - **Model suggestion:** GPT-5.1 (standard scaffold + routing).

2. **Supabase Client & Shared Types**
   - **Goal:** Add `src/lib/supabaseClient.ts` and shared interfaces that mirror `budtenders`, `categories`, and `picks`.
   - **Files:** `src/lib/supabaseClient.ts`, `src/types/index.ts` (or similar), `.env.example`.
   - **Prereqs:** Run `nvm use` (Node ≥ 20.19.0). Confirm `.env.local` contains `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`; ensure a Supabase Auth test user exists.
   - **Model suggestion:** GPT-5.1 (type-safe setup).

3. **API Helper Modules**
   - **Goal:** Implement `src/lib/api/{budtenders,categories,picks}.ts` for CRUD/read operations, using shared types and confirmed schema.
   - **Files:** `src/lib/api/`.
   - **Notes:** Use Postgres MCP to verify table/column names before coding; document any assumptions if MCP is unavailable.
   - **Model suggestion:** GPT-5.1 (focused data wiring).

4. **Staff View MVP**
   - **Goal:** Provide UI to list/manage picks per budtender, including create/edit/deactivate flows with validation and empty states.
   - **Files:** `src/views/StaffView.tsx`, `src/components/budtenders/`, `src/components/picks/`.
   - **Constraints:** Respect RLS enforcement—UI should handle authorization errors gracefully when editing other users’ data.
   - **Model suggestion:** GPT-5.1 (forms + state management).

5. **Customer View MVP**
   - **Goal:** Read-only, POS-friendly layout showing picks grouped by category, with budtender selector and tabs.
   - **Files:** `src/views/CustomerView.tsx`, `src/components/budtenders/Selector.tsx`, `src/components/picks/PickCard.tsx`.
   - **Constraints:** Enforce fixed, non-scrolling layout on desktop POS; allow responsive scrolling on tablets/phones; Customer View must remain inside authenticated session. Use a lightweight internal “Playground” route or story to preview layouts instead of a full Storybook setup for MVP speed.
   - **Model suggestion:** GPT-5.1 (UI work), escalate to Claude Sonnet 4.5 only if layout refactor needed.

6. **Auth & Session Guard**
   - **Goal:** Implement Supabase email/password login, session persistence, and route protection; ensure Customer View remains inside authenticated session with logout controls.
   - **Files:** `src/components/auth/LoginPage.tsx`, `src/contexts/AuthContext.tsx`, `src/lib/api/auth.ts`, `src/App.tsx`.
   - **Features:**
     - **Login page:** Email + password form with validation and error display.
     - **Auth Context:** React Context provider that:
       - Loads session on mount
       - Fetches current user's budtender profile (matching `auth.users.id`)
       - Stores `{ user, profile, loading }` in context
       - Provides `signIn`, `signOut`, `isManager` helpers
     - **Session persistence:** Supabase handles automatically (12-hour tokens with auto-refresh).
     - **Route protection:** `App.tsx` checks for session, redirects to `/login` if none.
     - **Logout:** Button in app header calls `signOut()`, clears context, redirects to login.
     - **Session expiration:** Supabase auto-refreshes tokens; if refresh fails (e.g., user deleted), redirect to login with message.
     - **Loading states:** Show spinner while checking session on app mount.
   - **API Helpers:**
     - `getCurrentUserProfile()`: Fetches budtender row matching logged-in user's `auth_user_id`.
   - **Notes:** 
     - Context makes role checking easy: `const { isManager } = useAuth();`
     - Auto-select logged-in user's profile in Staff View budtender dropdown.
     - Session tokens last 12 hours and auto-refresh (supports full double shifts).
   - **Model suggestion:** GPT-5.1 (auth wiring).

7. **Budtender Management (Manager-Only)**
   - **Goal:** Enable managers to invite new staff, view/edit all staff profiles, and manage active status.
   - **Files:** `src/views/StaffManagementView.tsx`, `src/lib/api/budtenders.ts` (add createBudtender, deleteBudtender), `src/components/layout/AppLayout.tsx` (add nav link).
   - **Features:**
     - **Manager-only navigation:** "Staff Management" link in app header, only visible if `useAuth().isManager` is true.
     - **Route guard:** If non-manager navigates to `/staff-management`, show 403 message and redirect.
     - **Invite Staff:** 
       - Form: name (required), email (required), role (dropdown), profile_expertise (optional).
       - On submit: Creates budtender profile with `is_active=true`.
       - **Email invite:** For MVP, display a message: "Profile created. Send invite link to: [email]" with copy button. Manager manually sends Supabase invite link via Dashboard or email.
       - Future: Integrate Supabase Admin API to auto-send invite emails.
     - **View All Staff:** 
       - Table/card list of all budtenders (active + inactive).
       - Filter toggles: Show All / Active Only / Inactive Only.
       - Click row to expand edit form inline or navigate to edit page.
     - **Edit Profile:** Inline or modal form to update name, role, profile_vibe, profile_expertise, profile_tolerance.
     - **Toggle Active:** Switch component updates `is_active` (soft deactivate/reactivate).
     - **Hard Delete:** 
       - Red "Delete" button.
       - First confirmation: "Are you sure? This will permanently delete [Name] and all their picks."
       - Second confirmation: "This action cannot be undone. Type DELETE to confirm."
       - Prevent self-deletion: Disable button if trying to delete own profile.
       - On confirm: Calls `deleteBudtender(id)` → Cascades to picks automatically (FK constraint).
       - Show toast: "User deleted successfully."
       - **Error handling:** If budtender is currently being viewed in Customer View, next data fetch will fail gracefully with "Budtender not found" message.
   - **API Helpers:**
     - `createBudtender(data)`: INSERT new budtender row (managers only via RLS).
     - `deleteBudtender(id)`: DELETE budtender (managers only, cascades picks).
   - **RLS Updates Required:**
     - `budtenders` table: Add policy allowing managers to INSERT and DELETE.
   - **Notes:** 
     - Keep invite flow manual for MVP (simpler, no backend needed).
     - Cascade delete is expected behavior (staff leaving = remove all their data).
   - **Model suggestion:** GPT-5.1 (CRUD + role checks).

8. **QA, Documentation, Deployment Prep**
   - **Goal:** Manual QA, run `npm run lint` / `npm run build`, sync README/spec with implementation, and prep Netlify/Vercel config.
   - **Files:** `README.md`, `docs/*`, deployment config, `.env.example`.
   - **QA Checklist:**
     - **As Budtender:**
       - Log in, view own profile auto-selected in Staff View.
       - Add/edit/deactivate own picks across multiple categories.
       - Verify cannot edit other budtenders' profiles or picks.
       - Switch to Customer View, select different budtender, verify picks display correctly.
       - Test responsive layout on tablet (should scroll).
     - **As Manager:**
       - All budtender permissions work.
       - Access Staff Management page (non-managers should not see nav link).
       - Create new budtender profile.
       - View all staff (active + inactive filters).
       - Edit another budtender's profile.
       - Toggle another budtender's `is_active` status.
       - Hard delete a budtender (double confirmation, cannot delete self).
       - Edit another budtender's picks.
     - **Session & Auth:**
       - Logout, verify redirect to login page.
       - Refresh page while logged in, session persists.
       - Let session sit idle for 30 mins, verify auto-refresh works.
       - Try accessing app without login, verify redirect to login.
     - **Build & Lint:**
       - `npm run lint` → 0 errors.
       - `npm run build` → Success, check bundle size.
   - **Documentation Updates:**
     - Sync README with actual implementation (routes, features, etc.).
     - Update ARCHITECTURE_OVERVIEW with AuthContext flow.
     - Create `NEXT_STEPS.md` for post-MVP features.
     - Ensure `.env.example` includes `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
   - **Deployment Prep:**
     - Add `netlify.toml` or `vercel.json` with SPA redirects.
     - Document environment variable setup in README.
     - Verify build output in `dist/` is deployable.
   - **Testing Notes for MVP:**
     - Manual testing only (State of Mind staff will QA in real environment).
     - No automated tests for MVP (can add later if needed).
     - RLS policies tested via real user flows.
   - **Model suggestion:** GPT-5.1 (doc updates).

## Risks & Dependencies
- **Supabase env vars** must be populated locally (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- **RLS policies:** Currently deployed policies cover SELECT and staff-owned UPDATE/INSERT/DELETE. Before Step 7, need to add:
  - `budtenders` INSERT policy for managers.
  - `budtenders` DELETE policy for managers (with self-deletion prevention in UI, not RLS).
  - Ensure API helpers respect RLS (no service role usage) and surface errors in the UI.
- **Partial unique index** on `(budtender_id, special_role)` requires the Staff View to prevent duplicate active slots; handle Supabase error states clearly.
- **Session duration:** Supabase default is 1 hour, but auto-refresh extends to 12+ hours for double shifts. Verify `persistSession: true` is set in `supabaseClient.ts` (already done).
- **Timeboxing:** Each step designed to fit within a single Cursor Composer run to avoid scope creep.

## Validation & Handoff
- After each step: run `npm run dev` and relevant lint/build scripts.
- Use MCP tools to verify schema/data assumptions before or after major changes.
- End of day: summarize status in `NEXT_STEPS.md`, push feature branch, open PR, and capture outstanding follow-ups.


