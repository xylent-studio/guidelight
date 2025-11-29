# Changelog

All notable changes to the Guidelight project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added - User Preferences & Releases (Sessions 18-19)

#### User Preferences System
- **Preference Tracking API:** New `src/lib/api/userPreferences.ts` module
  - `getUserPreferences(userId)` - Fetch user settings
  - `updateLastRoute()`, `updateLastBoard()`, `updateLastSeenRelease()` - Helper functions
- **Route Tracking Hook:** `useRouteTracking` automatically saves last visited route
- **Board Memory:** Display mode remembers last viewed board per user
- **Preferences View:** Full UI showing current user preferences

#### Releases & What's New System
- **Releases Table:** New database table for version notes
  - `id`, `version`, `title`, `summary`, `details_md`, `created_at`
  - RLS: Authenticated users can view, managers can create
- **Releases API:** New `src/lib/api/releases.ts` module
  - `getLatestRelease()`, `getReleases()`, `hasUnseenRelease()`
- **New Release Indicator:** `useNewReleaseIndicator` hook for notification dot
- **What's New View:** Full UI displaying release notes with markdown support
- **Profile Menu Notification:** Red dot indicator when new releases are available

### Changed
- **DisplayModeView:** Now checks user preferences for last_board_id fallback
- **ProfileMenu:** Added notification dot for unseen releases
- **Products API:** Refactored FK joins to use manual join approach for type safety

### Files Added
- `src/lib/api/userPreferences.ts`
- `src/lib/api/releases.ts`
- `src/hooks/useRouteTracking.ts`
- `src/hooks/useNewReleaseIndicator.ts`

---

## [2.1.0] - 2025-11-28

### Added - Category System Overhaul

#### Database Changes
- **New categories:** Deals, Tinctures, Accessories
- **Removed category:** Wellness (picks migrated to Tinctures)
- **New pick fields:**
  - `strain_type` - indica/sativa/hybrid/cbd-dominant/balanced/n-a
  - `intensity` - light/moderate/strong/heavy
  - `format` - category-specific format (indoor, cart, gummy, etc.)
  - `one_liner` - short headline for display
  - `custom_tags` - freeform tags (text array)
  - `package_size`, `potency_summary`, `top_terpenes`, `is_infused`
  - Deal-specific: `deal_title`, `deal_type`, `deal_value`, `deal_applies_to`, `deal_days`, `deal_fine_print`

#### UX Improvements
- **Category tabs in MyPicksView:** Filter picks by category with horizontal scrollable chips
- **Category context for Add Pick:** Clicking "Add pick" from a category tab pre-selects that category
- **Single draft state:** Switching categories in PickFormModal no longer clears form data
- **Effect tags (AIQ/Dispense style):** 17 curated tags with max 3 selection + unlimited custom tags
- **Category-specific fields:** Fields show/hide based on selected category
- **Deals support:** Full deal entry with type, value, applies to, days, fine print

### Changed
- **PickFormModal:** Complete rewrite with single draft state pattern
- **Effect tags:** Moved from suggested list to curated AIQ/Dispense-style tags with 3-tag limit
- **`product_type`:** Hidden from UI (kept in DB for backward compatibility)

### Files Added
- `src/lib/constants/effectTags.ts` - Curated effect tags and category field mappings
- `src/types/pickDraft.ts` - PickDraft type for form state management

### Documentation
- Updated `06_PICKS_AND_LAB_INFO_MODEL.md` to v9.2
- Added Category System decisions to `MVP_CRITICAL_DECISIONS.md`
- Updated `docs/INDEX.md` with UX Overhaul section
- Bumped version to 2.1.0

---

## [2.0.0] - 2025-11-28

### Added - UX Overhaul v2.0
- **React Router:** Proper URL-based navigation with route guards
- **New routes:** `/`, `/display`, `/team`, auth flows
- **Display Mode:** Public house list for POS/kiosk
- **Show to Customer:** Full-screen overlay for staff
- **Component library:** MyPickCard, GuestPickCard, CategoryChipsRow, HeaderBar

### Changed
- **Views:** Replaced StaffView/CustomerView with MyPicksView/DisplayModeView
- **Navigation:** Mode toggle replaced with React Router navigation
- **PickFormModal:** Split into Quick Info + Optional Details sections

### Removed
- `src/views/CustomerView.tsx` (replaced by DisplayModeView)
- `src/views/StaffView.tsx` (replaced by MyPicksView)
- `src/components/layout/AppLayout.tsx` (each view handles own layout)
- `src/components/layout/ModeToggle.tsx` (replaced by routing)

---

## [1.4.0] - 2025-11-25

### Added - Premium Color System & Theme Toggle

#### Color System Overhaul
- **Forest Green Primary (Hue 155):** Natural cannabis leaf green replaces generic jade
- **Warm Cream Backgrounds:** Premium organic feel, not clinical white
- **Gold Rating Stars:** Champagne luxury accents (hue 45)
- **Green-Tinted Dark Mode:** Spotify-inspired depth with brand DNA in every shade

#### Light Mode Palette
- Warm cream app shell (`40 30% 97%`) — inviting, not sterile
- Near-white cards (`40 20% 99%`) with subtle warmth
- Deep forest green (`155 50% 32%`) for buttons and accents
- Warm near-black text (`35 15% 18%`) — organic, not harsh

#### Dark Mode Palette  
- Forest-tinted black (`155 20% 7%`) — brand DNA in backgrounds
- Green-undertone surfaces (`155 15% 11%`) — Spotify-level richness
- Vibrant forest green (`155 55% 48%`) — pops on dark
- Cream-white text (`40 8% 96%`) — warm, not clinical

#### Theme Toggle
- **ThemeContext:** Light/Dark/System mode management with localStorage persistence
- **ThemeToggle Component:** Sun/Monitor/Moon radio group in app footer
- **Staff-Only:** Theme toggle hidden in Customer View
- **Light Default:** New users start in light mode

### Changed
- **`src/styles/theme.css`:** Complete rewrite with HSL triplets (no more Radix Color imports)
- **`tailwind.config.js`:** Added semantic color utilities (`bg-bg-app`, `text-text-muted`, etc.)
- **Button Component:** Updated to use `bg-btn-primary-bg`, `text-btn-primary-text`
- **StarRating Component:** Uses `text-star-filled`, `text-star-half`, `text-star-empty`
- **All Views:** Migrated to semantic color tokens

### Documentation
- **Complete rewrite of `GUIDELIGHT_DESIGN_SYSTEM.md`:**
  - Design philosophy section
  - Full HSL value tables for light and dark modes
  - Semantic token reference
  - Theme implementation guide
  - Tailwind usage examples
  - Color derivation guidelines

---

## [1.3.0] - 2025-11-25

### Added - 5-Star Rating System & Feedback Portal

#### 5-Star Rating System
- **Rating Field:** Added `rating` column to picks table (numeric 0.5-5, half-star increments)
- **StarRating Component:** New reusable component (`src/components/ui/star-rating.tsx`)
  - Displays filled, half-filled, or empty stars
  - Input mode: click left/right half of each star for 0.5 increments
  - Keyboard navigation with arrow keys
  - Click same position twice to clear rating
- **`last_active_at` Timestamp:** Tracks when picks were last in active rotation
- **Sorting Logic:** Active picks sorted by rating (desc) → updated_at (desc); inactive by last_active_at (desc)
- **Staff View:** Shows star ratings next to each pick, dimmed rows for inactive picks
- **Customer View:** Shows star rating on each pick card

#### Feedback & Bug Reporting System
- **Feedback Table:** New `feedback` table with RLS policies
  - Types: bug, suggestion, feature, general, other
  - Urgency levels: noting, nice_to_have, annoying, blocking
  - Anonymous by default, optional name attachment
  - Status workflow: new → reviewed → in_progress → done/wont_fix
- **FeedbackButton:** Floating button in bottom-right corner (all pages)
- **FeedbackModal:** Full submission form with warm SOM-style copy
  - Type selector with descriptions
  - Urgency dropdown
  - Anonymous toggle (default on)
  - Direct contact info (phone: 518.852.8870, email: justinmichalke@gmail.com)
- **FeedbackList:** Manager view in Staff Management
  - New "Feedback" tab with unread badge count
  - Filter by status (All, New, In Progress, Done)
  - Status dropdown to update workflow state
  - Inline internal notes editing
  - Urgency highlighting for blocking issues
- **API Layer:** New `src/lib/api/feedback.ts` module
- **Copy Strings:** Added feedback section to `src/lib/copy.ts`

### Changed
- **Pick Form:** Removed legacy "Rank (1-3)" field, replaced with star rating input
- **Database Schema:** 
  - `picks.rating` changed from integer to `numeric(2,1)` for half-star support
  - `picks.rank` marked as deprecated (kept for backward compatibility)
  - Added check constraint for valid half-star values

### Fixed
- **Rating Column Type:** Fixed migration to properly convert to numeric(2,1)
- **RLS Function Security:** Added explicit `search_path = public` to helper functions
  - `is_current_user_manager()` - now secure
  - `get_current_user_budtender_id()` - now secure

### Security
- Fixed function search_path vulnerability (2 functions)
- Note: Enable "Leaked Password Protection" in Supabase Auth settings for production

### Documentation
- Updated `GUIDELIGHT_SPEC.md` with feedback table schema and rating semantics
- Updated `ARCHITECTURE_OVERVIEW.md` with feedback API module and component structure
- Updated `INDEX.md` to reflect v1.3.0

---

## [1.2.0] - 2025-11-25

### Added - Guidelight-Branded Email Templates & Warm Copy Audit
- **Custom Email Templates:**
  - Created `supabase/templates/` folder with version-controlled email templates
  - `invite.html` / `invite.txt` - Staff invite email with Guidelight branding
  - `recovery.html` / `recovery.txt` - Password reset email with Guidelight branding
  - `magic_link.html` - Magic link login email
  - `confirmation.html` - Email confirmation email
- **Supabase Local Config:**
  - Added `supabase/config.toml` for local development email template configuration
  - Documents template variables and paths for `supabase start`
- **Centralized Copy System:**
  - Created `src/lib/copy.ts` with all in-app messaging strings
  - Warm, SOM-themed microcopy throughout the app
  - Consistent voice: "Clear first, a little stoner, a little playful"
- **Icon System (Lucide React):**
  - Added icons to all major action buttons
  - Documented icon-to-action mapping in `GUIDELIGHT_DESIGN_SYSTEM.md`
- **Pick Form Modal:**
  - Converted inline pick form to modal overlay (`PickFormModal.tsx`)
  - Category shown in modal header: "Add New Pick — Flower"
  - Created `src/components/picks/` folder structure

### Changed
- **All In-App Copy Updated:**
  - Landing hero: "For the people behind the counter" / "Guests trust you to turn a menu into a feeling"
  - Customer View: "Who's guiding this sesh?" / "Tap the budtender that's actually talking with the guest"
  - Staff View: "Who are you managing?" / "This is the 3-second story guests get about you"
  - Staff Management: "Invite new teammates, tune their profiles, and control who can log in"
  - Auth messages: "Session took a little nap" / "Log back in next shift when it's time to talk terps again"
  - Error messages: "The connection spaced out for a sec" / "Well, that wasn't on the menu"
- **DEPLOYMENT.md:** Added email template sync instructions (Dashboard + Management API methods)

### Documentation
- Added "Voice & Tone" section to `GUIDELIGHT_DESIGN_SYSTEM.md`
- Added "Icons" section with Lucide React conventions
- Updated DEPLOYMENT.md v1.1.0 with email template sync guide

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
- **AuthContext Production Reliability Refactor:**
  - Separated session management from profile loading (official Supabase pattern)
  - Removed 10-second timeout hack that masked auth issues
  - Added `profileError` state for graceful error handling
  - Added `refreshProfile()` function for components to sync after updates
  - Created `ProfileErrorScreen` component for "no profile" errors
- **RLS Infinite Recursion Fix:**
  - Created `is_current_user_manager()` SECURITY DEFINER function
  - Created `get_current_user_budtender_id()` SECURITY DEFINER function
  - Fixed manager check policies to use functions instead of inline subqueries

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
| 1.4.0 | 2025-11-25 | Premium color system (forest green + cream), theme toggle, design system docs |
| 1.3.0 | 2025-11-25 | 5-star ratings (half-star support), feedback portal, security fixes |
| 1.2.0 | 2025-11-25 | Custom email templates, centralized copy system, pick form modal |
| 1.1.0 | 2025-11-25 | Profile field enhancements, landing screen polish, RLS fixes |
| 1.0.0 | 2025-11-25 | Auth system, staff management, invite flow, Edge Functions |
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

