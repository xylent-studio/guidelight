---
**Status:** ✅ Implemented  
**Last Updated:** 2025-11-28  
**Implementation:** `src/views/StaffManagementView.tsx`, `src/contexts/AuthContext.tsx`
---

# 05_TEAM_AND_AUTH_SPEC – v9.1

This file describes authentication and the simplified Team management screen for managers.

---

## 1. Authentication

### 1.1 Login

- Route: `/login`
- Fields:
  - Email
  - Password
- Controls:
  - Show/hide password.
  - “Forgot password?” link.

On success:

- Redirect to `/` (My picks).

On failure:

- Show inline error: “Incorrect email or password.”

### 1.2 Invites

- Managers can send invites from the Team screen.
- Invite fields:
  - Email (required)
  - Name (optional)

Behavior:

- System sends email with secure link for password setup.
- Invites tracked as Pending / Accepted / Expired / Cancelled.

### 1.3 Password reset

- Staff:
  - Use “Forgot password?” on login.
- Managers:
  - Can trigger reset email from the Team screen.

---

## 2. Team Screen (`/team`)

### 2.1 Access

- **Route:** `/team` (protected, manager-only)
- Only users with `role = manager` can access.
- Non-managers attempting to access `/team` are redirected to `/` (My picks).
- From My picks: overflow `⋯` → "Team" menu item (only visible to managers).

### 2.2 Layout (Mobile / Desktop)

```text
Team
────────────────────────────
Invite new staff
[ Email           ] [ Name (optional) ]
[ Send invite ]

Staff
────────────────────────────
Justin    Manager    Active
  justin@example.com
  [ Reset password ] [ Disable ]

Nate      Budtender  Active
  nate@example.com
  [ Reset password ] [ Disable ]

Pending invites
────────────────────────────
alldayairfpv@gmail.com   Pending
  Invited by Justin on 2025-11-20
  [ Resend ] [ Cancel ]
```

### 2.3 Behavior

- **Invite new staff**
  - Validates email.
  - Creates a Pending invite.
  - Sends email.

- **Reset password**
  - Sends password reset email to that user.

- **Disable / Enable**
  - Toggles active state.
  - Disabled users cannot log in.

- **Resend**
  - Sends invite again with a fresh token.

- **Cancel**
  - Marks invite as Cancelled; cannot be used.

There are no other tabs or admin sections in this MVP.

### 2.4 Navigation

- Back button or link returns to `/` (My picks).
- Team screen uses React Router for proper URL-based navigation.

---

## 3. Implementation Notes

The existing implementation (v1.4.0) already includes:

- Edge Function invite system (one-click invites)
- Staff list with active/inactive filtering
- Password reset triggers
- Enable/disable toggles
- Feedback tab for alpha testing

This spec confirms alignment with the existing implementation. The main change in this UX overhaul is moving from state-based view switching to proper React Router routes.
