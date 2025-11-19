# AI Assistance & MCP Tools – Guidelight

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

- The architecture and product behavior are defined primarily in:
  - `ARCHITECTURE_OVERVIEW.md`
  - `GUIDELIGHT_SPEC.md`
- The AI assistant should read those documents before making large changes, and
  use MCP tools to *verify* assumptions rather than inventing new patterns.
- The goal is to make Guidelight easier to maintain and evolve, not to turn
  the project into a tooling experiment. If the MCP tools ever get in the way,
  they can be disabled and the app should still be straightforward to work on.
- Assume Guidelight is an internal-only app: every route requires Supabase Auth (email + password), there is no anonymous access, and Customer View is a read-only screen inside the authenticated session.
- Roles are `budtender`, `vault_tech`, and `manager`; managers and vault techs appear in Customer View the same as budtenders, and staff permissions are enforced via Supabase Auth + RLS (budtenders/vault techs can only modify their own data, managers can modify all).
- The Supabase anon key is required by the client SDK for authenticated sessions, but all data access is still gated by Auth + RLS—never rely on hiding the anon key for security.
