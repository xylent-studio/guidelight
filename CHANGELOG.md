# Changelog

All notable changes to the Guidelight project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned (MVP Scope)
- Email/password authentication with Supabase Auth
- Session management (12-hour support with auto-refresh)
- Customer View (read-only product picks display)
- Staff View (budtender CRUD for picks)
- Staff Management View (manager-only, invite/edit/delete staff)
- RLS policies for role-based access control
- Responsive layout (POS-optimized + mobile-friendly)

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

