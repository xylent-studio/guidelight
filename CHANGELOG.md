# Changelog

All notable changes to the Guidelight project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [1.1.0] - 2025-11-25

### Added - Profile Enhancement & Landing Screen Polish
- **Budtender Profile Fields Renamed & Enhanced:**
  - `archetype` → `profile_expertise` (What they're best at helping customers with)
  - `ideal_high` → `profile_vibe` (Mini-bio mixing personal life + cannabis preferences)
  - `tolerance_level` → `profile_tolerance` (Honest, relatable tolerance description)
  - Database migration `rename_budtender_profile_fields` preserves all existing data
- **Staff View "My Profile" Section:**
  - Enhanced UX with helper text and example patterns
  - "My vibe" textarea with collapsible example vibes
  - "Expertise" field with clickable example buttons
  - "Tolerance" with selectable band cards (Light rider, Steady flyer, Heavy hitter)
- **EditStaffForm Enhanced UX:**
  - Mirrors Staff View profile editing experience for managers
  - Same helper text, examples, and tolerance cards
- **Customer View Profile Display:**
  - `profile_expertise` shown as subtitle in budtender selector
  - `profile_vibe` displayed when budtender is selected
  - `profile_tolerance` shown with optional high-tolerance hint
- **Landing Screen Polish:**
  - New header: "STATE OF MIND · INTERNAL APP" badge + "Staff Picks & Profiles" title
  - Guidelight explanation: "A guidelight helps you find your way — this one's for SOM."
  - Updated view toggle card descriptions
  - New footer: "Guidelight v1 · Built by Xylent Studios for State of Mind"
  - Easter egg: "If a guest is reading this, someone forgot to switch to Customer View. 😉"

### Changed
- **Database Schema:** Renamed columns via ALTER TABLE (no data loss)
- **TypeScript Types:** Updated `database.ts` with new field names
- **API Layer:** Updated all client-side and Edge Function references
- **Edge Functions Redeployed:**
  - `invite-staff` (v7) - Uses new profile field names
  - `get-staff-with-status` (v2) - Uses new profile field names

### Fixed
- **Database Performance:**
  - Added missing index on `picks.category_id` for better JOIN performance
  - Optimized 12 RLS policies with `(SELECT auth.uid())` wrapper to prevent re-evaluation

### Documentation
- Updated `GUIDELIGHT_SPEC.md` with new field names and semantics
- Updated `ARCHITECTURE_OVERVIEW.md` with profile field descriptions
- Updated `README.md` with new profile terminology
- Updated `GUIDELIGHT_MVP_IMPLEMENTATION_PLAN.md` with new field names

---

## [1.0.0] - 2025-11-25 🎉

### Added - Authentication & Invite System
- **Complete Auth Flow:** Email/password login with Supabase Auth
  - Password visibility toggle on all password fields
  - Generic error messages to prevent user enumeration
  - "Forgot your password?" flow with email link
  - Password reset page with validation
  - Change password while logged in (requires re-authentication)
  - Accept invite page for new users with welcome message
- **Staff Management Dashboard:**
  - Invite status badges (Not Invited, Invite Pending, Active)
  - Last sign-in timestamps for active users
  - Invite sent timestamps for pending invites
  - Status-specific actions (Send Invite, Resend Invite, Reset Password)
  - Manager-initiated password reset for staff members
  - Location field for staff (Latham, Albany)
- **Edge Functions (Deployed & Active):**
  - `invite-staff` (v6) - One-click invite with automatic email
  - `get-staff-with-status` (v1) - Returns staff with auth status
  - `reset-staff-password` (v1) - Manager-initiated password reset
- **Reusable Components:**
  - `PasswordInput` - Accessible password field with show/hide toggle
  - `AcceptInvitePage` - Polished onboarding for invited users
  - `ForgotPasswordPage` - Email-based password recovery
  - `ResetPasswordPage` - New password setup from recovery link
  - `ChangePasswordForm` - In-app password change modal
- **Database Schema:**
  - Added `location` column to `budtenders` table
  - Updated TypeScript types for location field

### Changed
- **App Routing:** Enhanced to handle multiple auth flows via URL hash params
  - `#type=recovery` for password reset
  - `#type=invite` for accept invite
- **AppLayout:** Added "Change Password" button in header, displays user location
- **LoginPage:** Updated with PasswordInput component and forgot password link
- **InviteStaffForm:** Added location dropdown with predefined options
- **EditStaffForm:** Added location field, shows read-only email
- **StaffManagementView:** Complete redesign with status-aware interface
  - 4 stat cards (Total, Active, Pending, Inactive)
  - Status-based filtering tabs
  - Enhanced staff cards with email and timestamps

### Removed
- `SetPasswordModal` - Replaced by more polished `AcceptInvitePage`

### Fixed
- React hooks order error in StaffManagementView (moved useEffect before conditional returns)
- Infinite re-render loop in AuthContext (removed loading from dependency array)
- TypeScript unused variable warning in App.tsx

### Security
- Manager role verification in all Edge Functions
- Self-deletion protection (UI + RLS)
- Generic login error messages
- Password reset emails sent regardless of email existence
- Re-authentication required for password changes

### Documentation
- Added `DEPLOYMENT.md` - Complete deployment guide for Netlify
- Added `netlify.toml` - Netlify configuration
- Updated `package.json` to v1.0.0

---

## [0.3.0] - 2025-11-19

### Added
- **UI Foundation:** Integrated Tailwind CSS + shadcn/ui + Radix Colors
  - Configured `@/` import alias for cleaner imports
  - Added semantic design tokens (`--gl-bg`, `--gl-primary`, etc.)
  - Installed core shadcn components (Button, Card, Input, Label, Textarea, Select, Switch, Badge, Tabs)
  - Created `docs/GUIDELIGHT_DESIGN_SYSTEM.md` with full token reference
- **API Helpers:** Complete CRUD modules for Supabase integration
  - `src/lib/api/auth.ts` - `getCurrentUserProfile()`
  - `src/lib/api/budtenders.ts` - Budtender CRUD
  - `src/lib/api/categories.ts` - Category queries
  - `src/lib/api/picks.ts` - Pick CRUD with special_role constraint handling
- **Live Data Integration:**
  - Customer View now fetches real picks from Supabase (no mock data)
  - Staff View fully wired for pick CRUD (create/edit/toggle active)
  - Form validation and error handling
- **Documentation Overhaul:**
  - Added `docs/INDEX.md` - Central documentation hub
  - Added `notes/MVP_CRITICAL_DECISIONS.md` - Decision log
  - Added `notes/DEV_QUICK_REFERENCE.md` - Code patterns & troubleshooting
  - Added `notes/RLS_MANAGER_POLICIES.sql` - Manager INSERT/DELETE policies
  - Expanded implementation plan with AuthContext, manager features, QA checklist
  - Updated all specs with final auth flow, invite workflow, RLS policies

### Changed
- **App Shell:** Restyled with Tailwind utilities, removed custom CSS
- **Customer View:** Redesigned with shadcn Card/Badge components, 3-column POS layout
- **Staff View:** Form-based pick editing with shadcn primitives
- **README.md:** Added Bootstrap section for first manager setup
- **ARCHITECTURE_OVERVIEW.md:** Added AuthContext section, updated API module list
- **GUIDELIGHT_SPEC.md:** Documented manual invite flow for MVP

### Fixed
- Type errors resolved (verbatimModuleSyntax compliance)
- Build now succeeds with zero TypeScript errors
- Bundle size optimized (524KB JS minified)

---

## [0.2.0] - 2025-11-19

### Added
- Supabase database schema applied via MCP
  - `budtenders` table with roles (budtender, vault_tech, manager)
  - `categories` table with 8 seeded product types
  - `picks` table with special_role partial unique index
  - RLS policies for authenticated staff (SELECT all, staff modify own, managers modify any)
- Environment configuration (`.env.local` with Supabase credentials)
- TypeScript type generation from Supabase schema
- Test data: Manager account and sample picks
- Initial documentation structure

### Changed
- Updated Node.js requirement to >= 20.19.0

---

## [0.1.0] - 2025-11-19

### Added
- Initial project scaffolding with Vite + React + TypeScript
- Basic app shell with Customer/Staff mode toggle
- Placeholder views (CustomerView, StaffView)
- Supabase client setup (`src/lib/supabaseClient.ts`)
- Core documentation:
  - `README.md` - Project overview
  - `docs/GUIDELIGHT_SPEC.md` - Product specification
  - `docs/ARCHITECTURE_OVERVIEW.md` - Technical architecture
  - `docs/AI_ASSISTANCE.md` - AI tooling guide
  - `docs/GUIDELIGHT_DEV_AGENT.md` - Cursor agent instructions
- Git repository initialized and pushed to GitHub

---

## Version History Summary

| Version | Date | Key Changes |
|---------|------|-------------|
| 0.3.0 | 2025-11-19 | UI foundation (Tailwind + shadcn), API helpers, live data, docs overhaul |
| 0.2.0 | 2025-11-19 | Supabase schema, RLS policies, type generation |
| 0.1.0 | 2025-11-19 | Initial scaffolding, placeholder views, core docs |

---

## Legend

- **Added** - New features or files
- **Changed** - Changes to existing functionality
- **Deprecated** - Features marked for removal in future versions
- **Removed** - Features or files deleted
- **Fixed** - Bug fixes
- **Security** - Security-related changes

---

**Note:** Pre-1.0.0 versions may have breaking changes between minor versions. Once 1.0.0 is released, we'll follow strict semantic versioning.

