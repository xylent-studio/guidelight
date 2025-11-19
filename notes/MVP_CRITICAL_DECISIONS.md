# Guidelight MVP: Critical Decisions Log

**Last Updated:** 2025-11-19

This document captures key architectural and implementation decisions made during MVP planning to ensure consistency across all team members and future development.

---

## Authentication & Authorization

### Session Management
- **Duration:** 12+ hours (supports double shifts)
- **Mechanism:** Supabase Auth with `persistSession: true` and auto token refresh
- **Client-side state:** AuthContext provides `{ user, profile, loading, isManager, signIn, signOut }`
- **Initial user:** First manager created manually via Supabase Dashboard (see README "Bootstrap" section)

### Invite Flow (MVP)
- **Simplified manual flow:** Manager creates profile in app → App displays "Profile created. Send invite link to: [email]" → Manager manually sends Supabase invite link via Dashboard
- **Why manual?** Avoids need for backend/service role key for MVP; keeps complexity low
- **Future enhancement:** Integrate Supabase Admin API to auto-send invite emails

### RLS Policies
**Current policies (already deployed):**
- All authenticated staff can SELECT from all tables
- Staff can UPDATE only their own budtender profile
- Staff can INSERT/UPDATE/DELETE only their own picks
- Managers can UPDATE any budtender profile
- Categories are seed-only (no app mutations for MVP)

**New policies (to be added before Step 7):**
- Managers can INSERT new budtender rows (for invite flow)
- Managers can DELETE budtender rows (for hard delete)
- Self-deletion prevention handled in UI, not RLS

See `notes/RLS_MANAGER_POLICIES.sql` for SQL.

---

## Manager Features

### Staff Management Access
- **Navigation:** "Staff Management" link only visible if `useAuth().isManager` is true
- **Route guard:** Non-managers redirected to Staff View with 403 message if they navigate directly to `/staff-management`
- **UI pattern:** Role-based rendering using `const { isManager } = useAuth();`

### Hard Delete Confirmation
- **First confirmation:** "Are you sure? This will permanently delete [Name] and all their picks."
- **Second confirmation:** "This action cannot be undone. Type DELETE to confirm."
- **Self-deletion:** Disable button if user tries to delete their own profile
- **Cascade behavior:** Picks automatically deleted via FK constraint (expected behavior)
- **Customer View impact:** If deleted budtender is being viewed, next fetch shows "Budtender not found" error (acceptable for MVP)

---

## Data Integrity

### `special_role` Constraint
- **Enforcement:** Partial unique index on `(budtender_id, special_role) WHERE is_active = true`
- **Meaning:** Only ONE active pick per special_role per staff member
- **UI handling:** Staff View must catch Supabase error and show user-friendly message when attempting to create duplicate active special_role pick

### `rank` Field
- **Type:** Soft sort key (integer)
- **Uniqueness:** None enforced by DB; client-side only
- **Usage:** Staff set rank manually; UI sorts picks by rank within category

### Cascade Deletes
- **Budtender deletion:** Cascades to picks automatically (FK constraint `on delete cascade`)
- **Category deletion:** Not allowed in app (seed-only for MVP)
- **Pick deletion:** Handled individually (no cascades)

---

## UX Patterns

### Customer View Layout
- **Desktop/POS (lg+):** Fixed, non-scrolling, 3-column grid, ~6-9 cards visible per category
- **Tablet/Mobile (< lg):** Responsive, scrollable, 1-2 column grid
- **Staff list:** Shows all active staff (budtenders, vault techs, managers), name only, no role labels (MVP)

### Staff View Layout
- **All devices:** Fully responsive, scrollable
- **Auto-selection:** Logged-in user's profile auto-selected in budtender dropdown
- **Manager view:** Managers can select any budtender to edit their picks

### Error Handling (MVP)
- **Method:** `alert()` for errors, `console.log()` for debugging
- **Future enhancement:** Toast notifications (nice to have, not critical for MVP)
- **Network errors:** Show retry button in UI

---

## Testing Strategy (MVP)

### Manual Testing Only
- **QA team:** State of Mind staff (real users in production environment)
- **Test scenarios:** Documented in Step 8 QA checklist (see `GUIDELIGHT_MVP_IMPLEMENTATION_PLAN.md`)
- **No automated tests:** Can add later if needed; keeps MVP scope tight

### RLS Testing
- **Method:** Real user flows with budtender and manager accounts
- **Verify:** Budtenders cannot edit other profiles/picks; managers can edit all
- **Tools:** Use Supabase Dashboard to verify row-level visibility

---

## Deployment

### Environment Variables
- `VITE_SUPABASE_URL` (required)
- `VITE_SUPABASE_ANON_KEY` (required)
- See `.env.example` for template

### Build Output
- **Bundler:** Vite
- **Target:** ES2020, modern browsers
- **Output:** `dist/` directory
- **Size goal:** < 600KB JS (minified)

### Platform
- **Primary:** Netlify or Vercel (SPA mode with redirects)
- **Config:** `netlify.toml` or `vercel.json` with `/* /index.html 200` redirect

---

## Decision Rationale

### Why manual invite flow?
- **Technical Constraint:** `budtenders.auth_user_id` is NOT NULL, but creating auth users requires Admin API (service role key)
- **Security:** Service role key cannot be exposed in client-side code
- **MVP Pragmatism:** Two-step flow (Dashboard invite → App profile) works, despite poor UX
- **Reality:** Managers already have Supabase Dashboard access (State of Mind internal tool)
- **Post-MVP:** Will implement Edge Function for one-click invites (industry standard)

### Why no automated tests?
- **MVP focus:** Real users will QA in production environment
- **Resource optimization:** Time better spent on core features
- **Future:** Can add tests later once user flows are validated

### Why `alert()` instead of toasts?
- **MVP acceptable:** Alerts work, no external dependencies
- **Future:** Easy to swap in toast library (e.g., sonner) later

### Why AuthContext instead of Redux/Zustand?
- **Simplicity:** Context API sufficient for single auth state
- **Bundle size:** Zero dependencies
- **Performance:** Auth state rarely changes (login/logout only)

### Why enforce self-deletion at both UI and RLS?
- **Defense in Depth:** Industry best practice - never trust client-side checks alone
- **UI Check:** Prevents accidental clicks, better UX (disabled button with tooltip)
- **RLS Check:** Prevents malicious bypassing (DevTools, API calls, scripts)
- **Real-world example:** Banks use layered security for all critical operations

---

## Open Questions / Future Enhancements

### Post-MVP Features
- Toast notifications for better UX
- Loading skeletons instead of spinners
- Automated email invites (Supabase Admin API)
- Session expiry warnings (30 seconds before logout)
- Photo upload for budtender profiles
- Drag-to-reorder for pick ranking
- E2E testing with Playwright or Cypress

### Monitoring / Analytics
- Error tracking (Sentry?)
- Usage analytics (staff favorite categories, most active times)
- Performance monitoring (bundle size, load times)

---

**For implementation details, see:**
- `notes/GUIDELIGHT_MVP_IMPLEMENTATION_PLAN.md` - Step-by-step implementation guide
- `notes/GUIDELIGHT_MVP_PROGRESS.md` - Daily progress log
- `docs/GUIDELIGHT_SPEC.md` - Full product specification
- `docs/ARCHITECTURE_OVERVIEW.md` - Technical architecture

