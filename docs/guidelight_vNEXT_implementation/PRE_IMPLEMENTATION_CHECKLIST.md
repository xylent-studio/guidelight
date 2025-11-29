# Pre-Implementation Checklist

---
**Document Metadata**

| Field | Value |
|-------|-------|
| **Status** | ✅ Active |
| **Last Updated** | 2025-11-29 |
| **Owner** | Xylent Studios |
| **Audience** | AI Agents, Justin |
| **Purpose** | Checklist before beginning vNEXT implementation |

---

## ✅ Before Starting Session 01

This checklist must be complete before any migrations or code changes.

### Documentation Ready

- [x] `00_OVERVIEW.md` - Roadmap created with status tracker
- [x] `SESSION_LOG.md` - Progress tracking template ready
- [x] `CONFLICTS_AND_DECISIONS.md` - All known issues documented
- [x] All 21 session docs (00-20) created with implementation steps
- [x] `docs/INDEX.md` - Updated with vNEXT section
- [x] `notes/DOCUMENTATION_MANIFEST.md` - Updated with vNEXT section

### Critical Issues Addressed

- [x] Issue 1: Public RLS policies added to Session 01
- [x] Issue 2: NULL constraint fix added to Session 01
- [x] Issue 3: Status filter added to Session 02
- [x] Issue 4: `removeBoardItem` moved to Session 03
- [x] Issue 5: `loadAutoboardPicks` added to Session 03
- [x] Issue 6: `PickDraftRow` type rename in Sessions 09, 10, 11

### Questions for Justin (Answered ✅)

| Question | Status | Answer |
|----------|--------|--------|
| Q1: AddPickDialog scope | ✅ Answered | Anyone can use anyone's picks. Show attribution like "Justin's Pick" (prominent) or "From Nate" (subtle). |
| Q2: Auto board name sync | ✅ Answered | Yes, if auto-determined from user info, it should update when user changes that info. |

**Both answers have been incorporated into Sessions 03 and 07.**

### Technical Verification

Before Session 01, verify:

- [ ] Supabase project is accessible
- [ ] `mcp_supabase_list_tables` returns current tables
- [ ] `npm run build` passes with no errors
- [ ] Dev server starts successfully (`npm run dev`)
- [ ] Current DB has `budtenders`, `picks`, `categories` tables

---

## 🔧 Tools Available to Agents

### MCP Tools (Supabase)

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `mcp_supabase_list_tables` | List all tables and columns | Pre-session inspection |
| `mcp_supabase_execute_sql` | Run SELECT queries | Debugging, data verification |
| `mcp_supabase_apply_migration` | Run DDL (CREATE, ALTER) | Session migrations |
| `mcp_supabase_list_migrations` | See applied migrations | Verify migration status |
| `mcp_supabase_generate_typescript_types` | Regenerate `database.ts` | After schema changes |
| `mcp_supabase_get_logs` | Check service logs | Debugging errors |
| `mcp_supabase_get_advisors` | Check for security/performance issues | After RLS changes |

### Terminal Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `npm run dev` | Start dev server | Testing UI changes |
| `npm run build` | Build for production | Verify no TypeScript errors |
| `npm run lint` | Run linter | Check code quality |

### File Operations

| Tool | Purpose |
|------|---------|
| `read_file` | Read existing code/docs |
| `write` | Create new files |
| `search_replace` | Edit existing files |
| `grep` | Search for patterns |
| `codebase_search` | Semantic code search |

---

## 📖 How to Use Documentation (Step-by-Step)

This section explains HOW to actually use the docs and tools - like an intern or new dev would need.

### Starting a New Session

**Step 1: Check what session to work on**
```
1. Read SESSION_LOG.md - find the last completed session
2. Find the next ⬜ Not Started session in 00_OVERVIEW.md
3. Open that session's file (e.g., 01_SESSION_CORE_TABLES.md)
```

**Step 2: Do the Pre-Session Checklist**
```
1. For each "Read doc X" item:
   - Use read_file tool to actually read it
   - Note anything relevant to your session
   
2. For each "Inspect code X" item:
   - Use read_file to read the actual code
   - Don't assume - LOOK at what's there
   
3. For "Inspect DB schema":
   - Call mcp_supabase_list_tables
   - Verify the tables mentioned exist (or don't)
```

**Step 3: Run the implementation**
```
1. Follow the Implementation Steps in order
2. For SQL migrations:
   - Copy the SQL from the session doc
   - Call mcp_supabase_apply_migration with a name and the SQL
   - Verify with mcp_supabase_list_tables that it worked
   
3. For TypeScript code:
   - Use write tool to create new files
   - Use search_replace to edit existing files
   - Run npm run build after significant changes
```

**Step 4: Document your work**
```
1. Update SESSION_LOG.md with:
   - Status: ✅ Complete (or 🔄 In Progress if incomplete)
   - Actual files created/modified
   - Any deviations from the plan
   - Any issues for next session
   
2. Update 00_OVERVIEW.md status tracker:
   - Change ⬜ to ✅ for your session
```

### When You Need to Understand Something

| I need to understand... | Read this... | Tool to use |
|-------------------------|--------------|-------------|
| What Guidelight IS | `docs/GUIDELIGHT_SPEC.md` | `read_file` |
| How the current code works | The actual source files | `read_file` on `src/` |
| What decisions were made | `CONFLICTS_AND_DECISIONS.md` | `read_file` |
| What the DB looks like | - | `mcp_supabase_list_tables` |
| What vNEXT is supposed to do | `docs/guidelight_ux_docs_bundle_vNEXT/` | `read_file` |
| How to think about problems | `PROBLEM_SOLVING_GUIDE.md` | `read_file` |

### When Something Goes Wrong

| Problem | What to do |
|---------|------------|
| Migration fails | Read the error, fix the SQL, try again |
| Build fails | Read the TypeScript error, fix the code |
| Can't find a function | Use `grep` to search for it |
| Not sure if something exists | Use `mcp_supabase_list_tables` or `read_file` to CHECK |
| Session doc is unclear | Check CONFLICTS_AND_DECISIONS.md, then ask |
| Stuck and confused | Read PROBLEM_SOLVING_GUIDE.md |

### Example: Running a Migration

```
1. You see this in the session doc:

   ```sql
   CREATE TABLE public.boards (...);
   ```

2. Call the tool:
   mcp_supabase_apply_migration
   - name: "create_boards_table"
   - query: "CREATE TABLE public.boards (...)"

3. Verify it worked:
   mcp_supabase_list_tables
   - Look for "boards" in the output

4. If it failed:
   - Read the error message
   - Common issues: typo, wrong column type, FK ordering
   - Fix and retry
```

### Example: Creating a Component

```
1. You see this in the session doc:

   Create `src/components/boards/BoardCard.tsx`:
   ```typescript
   export function BoardCard(...) { ... }
   ```

2. Use the write tool:
   write
   - file_path: "02_projects/guidelight/src/components/boards/BoardCard.tsx"
   - contents: (paste the code)

3. Verify it compiles:
   run_terminal_cmd
   - command: "npm run build"

4. If it fails:
   - Read the error
   - Use search_replace to fix
   - Rebuild
```

### Example: Updating SESSION_LOG.md

```
1. After completing Session 01, find the Session 01 entry in SESSION_LOG.md

2. Use search_replace to update:

   Old:
   | **Status** | ⬜ Not Started |
   | **Started** | - |
   | **Completed** | - |

   New:
   | **Status** | ✅ Complete |
   | **Started** | 2025-11-29 10:00 |
   | **Completed** | 2025-11-29 12:30 |

3. Fill in the other sections with what you actually did
```

---

## 📋 Session 00 Output Requirements

Session 00 must produce:

1. **Verified Plan v2** - Confirmation that:
   - All session docs are accurate
   - Dependencies are correctly ordered
   - No blocking issues remain

2. **Updated CONFLICTS_AND_DECISIONS.md** with:
   - Any new findings from code inspection
   - Answers to open questions (if provided)

3. **vNEXT doc 09 enum fixes** - Confirmed enum values match DB reality

4. **NO migrations or code changes**

---

## 🚀 Ready to Begin?

When this checklist is complete and Justin has answered the pending questions:

1. Start with **Session 00** (spec alignment - no code)
2. After Session 00 approval, proceed to **Session 01**
3. Follow the session docs sequentially

---

**Maintained by:** Xylent Studios  
**Last reviewed:** 2025-11-29

