# AI Assistance & MCP Tools – Guidelight

---
**Document Metadata**

| Field | Value |
|-------|-------|
| **Status** | ✅ Active |
| **Last Updated** | 2025-11-19 |
| **Owner** | Justin (State of Mind) |
| **Audience** | Engineering |
| **Purpose** | Guidelines for AI assistant behavior and MCP tool usage in Guidelight |

---

We use AI assistants (primarily in Cursor) to help with repetitive tasks,
refactors, and keeping types/schemas honest. This document explains how those
assistants are expected to behave on **Guidelight**.

## Goals

- Keep TypeScript types, Supabase queries, and the actual database schema **in sync**.
- Avoid guessing API response shapes; always verify against a real endpoint when possible.
- Make small, coherent changes with clear commit messages.
- Respect the existing architecture, conventions, and tone of the app.

## Tools

### Postgres MCP

- **Scope:** Development Supabase/Postgres database only (read-only).
- **Use cases:**
  - Inspect table definitions (e.g. `budtenders`, `categories`, `picks`).
  - Verify column names and types before changing TS interfaces or queries.
  - Sanity-check assumptions about relationships or constraints.
- **Guideline:** Before editing DB-related types or query code, ask the AI
  to use the Postgres MCP to confirm the schema instead of guessing. Keep TS
  types, query code, and schema consistent.

### API / HTTP MCP

- **Scope:** Local dev endpoints (e.g. `http://localhost:3000/api/...`) and
  relevant Supabase REST endpoints.
- **Use cases:**
  - Confirm that API responses match our TypeScript interfaces.
  - Test Guidelight flows end-to-end (e.g. fetching picks, categories, or
    budtender data) from within Cursor.
  - Validate request/response changes after refactors.
- **Guideline:** After changing request/response handling code, ask the AI
  to call the relevant endpoint with the API MCP and ensure the response still
  matches the expected shape.

## Safety & Environment

- MCP tools must point only to **development** databases and services.
- Schema changes (migrations) should still be reviewed and applied by a human,
  even if the AI drafts them.
- Production credentials must never be wired into MCP configuration.
- Treat AI suggestions as proposals; you are still responsible for reviewing
  diffs, running tests, and validating behavior on a real build.

## How this fits into Guidelight

### Documentation reference

- **Start here:** `docs/INDEX.md` - Central hub for all documentation
- **Product behavior:** `docs/GUIDELIGHT_SPEC.md`
- **Technical architecture:** `docs/ARCHITECTURE_OVERVIEW.md` (includes AuthContext, RLS policies, API structure)
- **Design system:** `docs/GUIDELIGHT_DESIGN_SYSTEM.md` (Tailwind, shadcn/ui, Radix Colors)
- **Code patterns:** `notes/DEV_QUICK_REFERENCE.md`
- **Decisions log:** `notes/MVP_CRITICAL_DECISIONS.md`

The AI assistant should read those documents before making large changes, and
use MCP tools to *verify* assumptions rather than inventing new patterns.

### Core principles

- **Goal:** Make Guidelight easier to maintain and evolve, not turn it into a tooling experiment. If MCP tools get in the way, they can be disabled—the app should still be straightforward to work on.
- **Access model:** Guidelight is an internal-only app. Every route requires Supabase Auth (email + password). There is no anonymous access. Customer View is a read-only mode inside the authenticated session.
- **Roles:** `budtender`, `vault_tech`, `manager`
  - Managers and vault techs appear in Customer View the same as budtenders (no role labels shown to customers)
  - Vault techs are back-of-house inventory staff but behave like budtenders in the app
- **Permissions (enforced via Supabase Auth + RLS):**
  - Budtenders/vault techs: View all staff/picks, modify only their own profile and picks
  - Managers: All budtender permissions, plus:
    - **INSERT** new budtenders (for invite flow)
    - **UPDATE** any budtender profile
    - **DELETE** budtenders (hard delete with UI confirmation)
    - Modify any staff member's picks
- **Security:** The Supabase anon key is required by the client SDK for authenticated sessions, but all data access is gated by Auth + RLS—never rely on hiding the anon key for security.

### Current implementation status

- ✅ Database schema + RLS policies deployed (see `notes/RLS_MANAGER_POLICIES.sql` for pending manager INSERT/DELETE policies)
- ✅ UI foundation complete (Tailwind + shadcn/ui + Radix Colors)
- ✅ API helpers implemented (budtenders, categories, picks)
- ✅ Customer View + Staff View wired to live data
- 🚧 **Next:** Auth & Session Guard (Step 6), Staff Management (Step 7), QA (Step 8)

See `notes/GUIDELIGHT_MVP_PROGRESS.md` for detailed progress log.
