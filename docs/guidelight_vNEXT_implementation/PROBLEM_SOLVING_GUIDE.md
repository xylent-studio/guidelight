# Problem-Solving Guide for vNEXT Implementation

---
**Document Metadata**

| Field | Value |
|-------|-------|
| **Status** | ✅ Active |
| **Last Updated** | 2025-11-29 |
| **Owner** | Xylent Studios |
| **Audience** | AI Agents |
| **Purpose** | How to think and problem-solve like a Xylent dev |

---

## Core Principles (from `xylent_dev_thinking.md`)

### 1. Reality-First Development

Always anchor decisions in real-world use:
- **Budtenders:** On a busy floor, one hand on phone, talking to customer
- **Managers:** At a desk, quickly checking status
- **Customers:** Seeing a screen for a few seconds, deciding if they feel comfortable

If a clever idea doesn't survive the reality check, simplify or park it.

### 2. Pattern-Mining from Real Systems

Before implementing, ask:
- Who already solved something like this?
- What exactly did they do that works well?
- What obviously annoys users in similar tools?

Good patterns to reference for Guidelight:
- **Gmail/Notion** - Drafts, autosave, publish flow
- **Figma/Miro** - Canvas layouts, drag-drop
- **Dispense/AIQ** - Cannabis menus, category chips
- **Slack/Discord** - Profile surfaces, member lists

### 3. Multiple Perspectives

Think from three lenses:

| Perspective | Questions to Ask |
|-------------|------------------|
| **User Experience** | Does this work on a busy floor? Is it obvious? |
| **System & Data** | Does the schema make sense? Are types in sync? |
| **Team & Future Devs** | Can another dev understand this? Is naming consistent? |

---

## When You Get Stuck

### Step 1: Clarify Intent
- Restate what you think the goal is
- Call out assumptions you're making
- Check if you're solving the right problem

### Step 2: Inspect Current Reality
- Look at existing code (don't assume)
- Check the actual DB schema
- Verify what the app currently does

### Step 3: Scan Patterns
- What would Gmail do?
- What would Notion do?
- What's the simplest thing that could work?

### Step 4: Sketch Options
- Quick/simple option
- More thorough option
- Note pros/cons of each

### Step 5: Choose and Implement
- If one option is clearly better, do it
- If tradeoffs are non-trivial, document and ask Justin

---

## Common Scenarios

### "The plan says X but the code does Y"

1. **Check which is correct** - Inspect actual code/DB
2. **If plan is wrong** - Update the plan, document in SESSION_LOG.md
3. **If code is wrong** - Fix the code, document the deviation
4. **If unclear** - Ask Justin before proceeding

### "I found a bug in a previous session's work"

1. **Document it** - Add to CONFLICTS_AND_DECISIONS.md
2. **Assess impact** - Does it block current session?
3. **Fix if small** - If it's a quick fix, do it
4. **Defer if large** - Create a follow-up item, continue with current session

### "A dependency isn't ready yet"

1. **Check if truly blocked** - Can you work around it?
2. **Mock it** - Create a stub/mock to continue
3. **Document** - Note the dependency in SESSION_LOG.md
4. **Re-order if needed** - Some sessions can be done in parallel

### "The session instructions are unclear"

1. **Read the referenced docs** - Pre-session checklist points to source docs
2. **Check CONFLICTS_AND_DECISIONS.md** - Decision may already be made
3. **Look at similar patterns** - How did previous sessions handle this?
4. **Ask if truly stuck** - Leave a clear question in SESSION_LOG.md

---

## Error Recovery

### If a migration fails

1. **Don't panic** - Supabase migrations are transactional
2. **Read the error** - Usually tells you exactly what's wrong
3. **Fix the SQL** - Common issues: typos, wrong column types, FK ordering
4. **Retry** - Use `mcp_supabase_apply_migration` again

### If the build breaks

1. **Read the TypeScript error** - Usually points to exact file/line
2. **Check type regeneration** - Did you run `mcp_supabase_generate_typescript_types`?
3. **Check imports** - Are you using the right types/functions?
4. **Revert if needed** - Document what went wrong

### If you need to stop mid-session

1. **Update SESSION_LOG.md immediately**
2. **List what's done** - Be specific about files created/modified
3. **List what remains** - Be specific about steps not completed
4. **Note any partial state** - Migrations applied? Code incomplete?

---

## Quality Checklist (Before Marking Session Complete)

- [ ] All acceptance criteria met
- [ ] `npm run build` passes
- [ ] Migrations applied successfully
- [ ] Types regenerated (if schema changed)
- [ ] SESSION_LOG.md updated
- [ ] 00_OVERVIEW.md status updated
- [ ] Any referenced docs marked as "Implemented"
- [ ] No TODOs left in code (unless intentional)

---

## When to Push Back on the Plan

Per `xylent_dev_thinking.md`, you should NOT blindly follow bad instructions.

Push back if:
- **Technically unsafe** - Security hole, data loss risk
- **Architecturally weak** - Will cause problems later
- **UX-hostile** - Confusing for users
- **Clearly outdated** - Conflicts with current code reality

How to push back:
1. Explain the problem clearly
2. Propose a better alternative
3. Document your reasoning
4. Ask Justin if uncertain

---

**Remember:** Your job is to think, design, and implement like a real senior teammate. Be smarter than the prompt when you can justify it.

---

**Maintained by:** Xylent Studios  
**Last reviewed:** 2025-11-29

