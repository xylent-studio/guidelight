# 10 — Accounts, Profile Menu & Release Notes

This document specifies how users (including guests) see and manage their identity in Guidelight, and how the app communicates changes (updates/patches) in a way that feels like a modern, trustworthy product.

---

## 1. Unified profile / user icon

### 1.1 Placement and behavior

- On all authenticated staff screens, show a **profile avatar** in the top-right of the app shell:
  - Circle avatar with:
    - User photo if available.
    - Otherwise, initials (e.g. “JM”) on a neutral background.
- Clicking/tapping the avatar opens a **Profile menu** (small dropdown or popover).

### 1.2 Profile menu options (budtender)

Default items for a standard budtender account:

1. **My profile**
   - Shows:
     - Name
     - Email
     - Role (Budtender)
   - Mostly read-only in MVP.
   - Future: allow changing avatar.

2. **Preferences**
   - Core preferences (MVP):
     - Default landing view (Boards vs My Picks).
     - Default board when opening Display mode (optional).
   - Future: theme, density, language.

3. **What’s new**
   - Opens the Release Notes panel (see section 3).

4. **Help & feedback**
   - Explains the existing reporting bubble:
     - e.g. “Tap the feedback bubble in the corner to report an issue or suggest an improvement.”
   - May open a “How to report issues” tooltip or simply highlight the bubble.

5. **Sign out**
   - Logs the user out via auth provider (Supabase).

### 1.3 Profile menu options (manager/admin)

Managers/admins see everything above plus:

- **Team & permissions** (future)
  - Link to manage users, roles, and store-level settings.
- **Display / kiosk settings** (future)
  - Bind boards to physical displays (once that feature exists).

---

## 2. Guest mode

Guidelight is primarily a staff tool, but there are valid use cases for a **guest session**:

- Demo for a visiting vendor.
- Quick exploration without tying changes to a staff member.
- Future: limited read-only access from outside the store.

### 2.1 Entry into guest mode

If there is no active auth session:

- Show a simple landing screen with:
  - Primary action: **Sign in** (email/password or magic link, etc.).
  - Secondary action: **Continue as guest**.

Choosing **Continue as guest**:

- Creates an in-memory “guest session”.
- Does **not** require an email or password.

### 2.2 Capabilities in guest mode (MVP)

Guest capabilities are intentionally limited:

- Can:
  - View **published boards** in Display mode.
  - Browse published picks in read-only form (e.g. via a simplified Boards/Display navigation).
- Cannot:
  - Create, edit, or publish picks.
  - Create or edit boards.
  - Change store-level settings.

Guest mode should always feel safely read-only: no accidental data changes.

### 2.3 Guest profile menu

In guest mode, the top-right avatar icon:

- Shows a generic silhouette or “G” icon.
- Clicking reveals a simpler menu:

1. **You’re browsing as Guest**
   - Short explanation: “You can view boards, but you’ll need to sign in to create or edit.”

2. **Sign in**
   - Takes them to full auth flow.
   - On successful sign-in, redirects to `/boards` or the last route.

3. **Help & feedback**
   - Same as staff: explains the feedback bubble and how to report issues.

No “Sign out” entry is needed for guest; closing the tab effectively ends the guest session.

---

## 3. Release notes & update notifications

The goal is to have a **lightweight “What’s new” system** that:

- Lets users know when Guidelight has changed.
- Encourages them to give feedback if something feels off.
- Does not spam or block normal work.

### 3.1 Data model (conceptual)

Add a conceptual `releases` collection/table (exact implementation is flexible):

- `id` (uuid or incrementing)
- `version` (string, e.g. "2025.11.28")
- `title` (short, e.g. "Draft picks & custom boards")
- `summary` (short paragraph)
- `details_md` (longer markdown for full notes)
- `created_at` (timestamp)

Extend `user_preferences`:

- `last_seen_release_id` (nullable, fk to `releases`)

### 3.2 On-load behavior

On app load after login:

1. Fetch the latest release from `releases`.
2. Fetch the current user’s `user_preferences.last_seen_release_id`.
3. If `latest.id != last_seen_release_id`:
   - Show a **non-blocking “What’s new” toast**:
     - Example copy: “Guidelight has been updated — tap to see what’s new.”
   - Toast offers:
     - **View details** → opens Release Notes panel.
     - **Dismiss** → marks `last_seen_release_id = latest.id` so it won’t reappear.

If `last_seen_release_id` matches the latest release:

- No toast is shown.
- User can still manually access release notes via **Profile → What’s new**.

### 3.3 Release Notes panel

When a user opens **What’s new** (either from toast or from the Profile menu):

- Show a modal or side panel with:
  - Title: “What’s new in Guidelight”
  - Current version label (“Version 2025.11.28” or similar)
  - Bulleted list of key changes, pulled from `summary`/`details_md`:
    - e.g. “Draft picks now auto-save while you edit.”
    - “Custom boards now support drag-and-drop layout.”
    - “Only published picks on published boards appear in customer view.”

At the bottom of the panel, include a small section:

> “Notice anything off after this update?  
> Tap the feedback bubble in the corner to send a quick report.”

This directly connects **updates** to the existing **reporting bubble** for issues.

### 3.4 Historical release notes (nice-to-have)

Optionally, the panel can show a short “Recent updates” timeline:

- Latest release expanded.
- Previous versions collapsed under a “Show previous updates” toggle.

This is not required for MVP but helps when users ask, “What changed recently?”

---

## 4. Visual and interaction style

- The profile avatar + menu should mirror familiar patterns from:
  - Google Drive / Gmail (avatar top-right).
  - Figma / Notion (profile menu as account hub).
- The “What’s new” toast and panel should feel similar to:
  - Slack’s or Figma’s update notes:
    - Small, friendly, and easy to dismiss.
    - Not a full-screen takeover.

Consistency goals:

- The **Profile avatar** is the **one obvious place** users think to go for:
  - Account details.
  - Preferences.
  - Release notes.
  - Sign out.

- The **What’s new** system is:
  - Informative but respectful of their time.
  - Tightly linked to the feedback/reporting bubble so issues flow naturally back to you.
