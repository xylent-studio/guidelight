---
**Status:** ✅ Implemented  
**Last Updated:** 2025-11-28  
**Implementation:** All flows functional in v2.x
---

# 08_KEY_USER_FLOWS_AND_EDGE_CASES – Simplified MVP (v9)

This file captures the primary flows and key edge cases for the MVP.

---

## 1. Key Flows

### 1.1 New staff – from invite to first pick

1. Manager opens Team screen.
2. Enters new staff email (and optional name), sends invite.
3. Staff receives email, sets password via secure link.
4. Staff opens Guidelight, logs in.
5. Staff lands on My picks (empty state).
6. Staff taps “Add your first pick”.
7. Staff fills out minimal fields and saves.
8. My picks now shows at least one pick.

### 1.2 Budtender – during a shift

1. Staff opens Guidelight (already logged in or logs in quickly).
2. See My picks.
3. If they want to show recommendations:
   - Tap **Show to customer**.
   - Optionally tap a category chip (e.g., Flower) to filter.
   - Scroll with customer and talk through options.
4. When finished, tap Back to return to My picks.
5. Between customers, they may add or tweak picks.

### 1.3 Manager – managing the team

1. Manager logs in and lands on My picks.
2. Opens overflow `⋯` → Team.
3. Sees staff list and pending invites.
4. Sends a new invite, resends or cancels a pending one, or resets a password.
5. Returns to My picks when done.

### 1.4 Display Mode (optional)

1. POS opens `/display`.
2. App shows a full-screen list of picks for a default staff member or a placeholder if none selected.
3. Staff can use `Change` to select which staff’s picks to show.
4. Category chips filter visible picks for customers in line.

---

## 2. Edge Cases

### 2.1 No picks

- My picks:
  - Show clear empty state with “Add your first pick” button.
- Show to customer:
  - If no picks exist, show a polite message:
    - “No picks to show yet. Ask your budtender for recommendations.”
- Display Mode:
  - Same as Show to customer when no data.

### 2.2 Network / Supabase errors

- Show an inline banner on affected screens:
  - “Guidelight can’t load picks right now. Check your connection and try again.”
- If error occurs while editing a pick:
  - Show a clear error and avoid losing user input where possible.

### 2.3 Unauthorized access

- If a non-manager attempts to access `/team`:
  - Redirect to My picks and optionally show a simple message:
    - “You don’t have access to that page.”

### 2.4 Invite issues

- Expired invite links:
  - Show a friendly message and suggest asking a manager to resend.
- Already accepted invites:
  - Direct user to login.

### 2.5 Display Mode with no configured staff

- If `/display` has no default user or that user has no picks:
  - Show placeholder text:
    - “No picks set up for display yet.”
