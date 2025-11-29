# 09 — Decision Log & Refinements

This document captures concrete decisions and refinements made after reviewing the vNEXT spec with an explicit “no mush” mindset. It is the single source of truth when something in older docs feels ambiguous or has multiple possible interpretations.

Where this document conflicts with earlier drafts, **this document wins**.

---

## 1. Picks, drafts, and ownership

**Decision 1.1 — Draft ownership**

- Drafts are **per user**:
  - A given user can have:
    - Many “new pick” drafts (`pick_id = null`).
    - At most **one draft per existing pick** (`(user_id, pick_id)` unique).
- There is **no shared, global draft** for a pick across users.
  - If two budtenders edit the same pick, they each have their own draft copy.
  - The last published edit wins, like saving over a shared doc.

**Decision 1.2 — Draft storage**

- Drafts are persisted server-side in `pick_drafts`.
- Local storage may be used for smoothing UX but is not the source of truth.
- Drafts survive:
  - Closing the tab.
  - Logging out/in.
  - Moving to another device.

**Decision 1.3 — What happens on Publish**

- For `pick_id = null` (new pick):
  - Insert into `picks`.
  - Delete the draft.
- For `pick_id != null` (editing published pick):
  - Update that row in `picks`.
  - Delete the draft.
- Any board that references that pick will show the updated content on next render.

**Decision 1.4 — What happens on Cancel / Discard**

- Cancel in the editor means:
  - Delete the draft.
  - Do **not** touch `picks`.
- If it was a new pick draft:
  - The pick never becomes visible anywhere.
- If it was editing a published pick:
  - The pick stays exactly as it was before the edit started.

---

## 2. Field taxonomy & scales

**Decision 2.1 — Time of day**

Stored as one of:

- `day`
- `evening`
- `night`
- `anytime`

Displayed as chips:

- ☀️ Day  
- 🌇 Evening  
- 🌙 Night  
- ∞ Anytime  

**Decision 2.2 — Intensity**

> **⚠️ UPDATED 2025-11-29:** Current DB uses different values than originally specified. DB is source of truth.

Stored as (CURRENT DB):

- `light`
- `moderate`
- `strong`
- `heavy`

~~Originally specified as: `gentle`, `moderate`, `strong`~~ (Not used)

Displayed as:

- Light → "Light" with meter ●○○○  
- Moderate → "Moderate" with meter ●●○○  
- Strong → "Strong" with meter ●●●○
- Heavy → "Heavy" with meter ●●●●  

**Decision 2.3 — Experience level**

> **⚠️ UPDATED 2025-11-29:** Current DB uses different values than originally specified. DB is source of truth.

Stored as (CURRENT DB):

- `newbie_safe`
- `regular`
- `heavy`

~~Originally specified as: `new`, `occasional`, `heavy`~~ (Not used)

Displayed as:

- newbie_safe → "New to cannabis"
- regular → "Regular consumer"
- heavy → "Heavy/experienced"

**Decision 2.4 — Budget level**

> **⚠️ UPDATED 2025-11-29:** Current DB uses different values than originally specified. DB is source of truth.

Stored as (CURRENT DB):

- `budget`
- `mid`
- `premium`

~~Originally specified as: `budget`, `standard`, `premium`~~ (Not used - `standard` → `mid`)

Displayed as:

- budget → `$ · budget-friendly`
- mid → `$$ · mid-range`
- premium → `$$$ · premium`

This keeps the DB descriptive and the UI familiar using `$` symbols.

**Decision 2.5 — Effect tags**

- Use a **curated set** of recommended effect tags:
  - `Chill`, `Social`, `Focus`, `Creative`, `Sleep`, `Relief`, `Uplifted`, `Balanced`.
- Stored as string array in `effect_tags`.
- UI uses chips from this set (with optional “Other”/custom in a future phase).

---

## 3. Card design: collapsed vs expanded

**Decision 3.1 — Collapsed card layout**

Collapsed card shows:

- Product name (always, bold).
- Brand (smaller, under name).
- Product type chip (Flower, Pre-roll, Edible, etc.).
- One-liner (clamped to 2 lines).
- Bottom row:
  - Time-of-day chip.
  - Up to **2** effect tags.
  - Rating stars (compact).
  - Short potency summary (e.g. `THC 27%` or `1:1:1 THC:CBD:CBG`).

**Decision 3.2 — Expanded card layout**

When expanded:

- Everything from the collapsed state, plus:
  - Full “Why I love it”.
  - All effect chips.
  - Intensity (with meter).
  - Experience level.
  - Package size.
  - Budget indicator (`$ / $$ / $$$` with text).
  - Top terpenes (if present).

**Decision 3.3 — Eye visibility behavior**

- `visible_fields` applies to **both collapsed and expanded views**.
- If a field is **not** in `visible_fields`, it is hidden in both states.
- The collapsed/expanded split is purely about hierarchy and space, not visibility rules.
- Default `visible_fields` for new picks includes:
  - product_name, brand, product_type
  - one_liner, why_i_love_it
  - time_of_day, effect_tags
  - rating, potency_summary
  - package_size, budget_level, intensity, experience_level
- top_terpenes and any highly technical fields are **off by default**.

---

## 4. Auto boards vs custom boards

Earlier docs allowed auto boards to behave like full canvases; this section **clarifies and narrows** MVP behavior.

**Decision 4.1 — Auto boards are smart grids, not free canvases (for now)**

- Auto boards (`auto_store`, `auto_user`) are rendered as **structured grids**, not drag-anywhere canvases.
- Layout decisions for auto boards are algorithmic:
  - Group by product type.
  - Sort by rating (desc), then `last_active_at` (desc).
- Staff can’t drag individual cards around on auto boards in MVP.
  - (Custom boards are where drag/drop canvas lives.)

**Decision 4.2 — Custom boards are full canvases**

- Custom boards are the only boards that behave like a free-form canvas:
  - Cards and text blocks can be positioned on a loose grid.
  - Layout is autosaved.
- Custom boards are where staff “design the story” for a theme, event, or promo.

**Decision 4.3 — `is_active` controls auto board inclusion**

- Introduce or reuse boolean `is_active` on picks:
  - `true` means “in my current rotation”.
  - `false` means “keep this pick in my library, but don’t include it in auto boards”.
- Auto user board contents:
  - All picks where:
    - `budtender_id = user`
    - `status = 'published'`
    - `is_active = true`
- Auto store board contents:
  - All picks where:
    - `status = 'published'`
    - `is_active = true`

Custom boards can include any published pick, active or not, at staff discretion.

---

## 5. Deals & promotions

**Decision 5.1 — Deals live on picks (MVP)**

- Deals are modeled as optional metadata **attached to picks**, not standalone objects.
- A pick can have at most one primary deal at a time in MVP.

**Decision 5.2 — Deal fields used**

For now, we use:

- `deal_type` — `percent_off | amount_off | bogo | bundle | other`
- `deal_value` — numeric (e.g. 20 for 20%).
- `deal_title` — short label shown on card.
- `deal_days` — short string (e.g. “Thurs–Sun”).
- `deal_fine_print` — detailed explanation.

**Decision 5.3 — Deal display**

- On collapsed card:
  - If deal is active, show a small pill:
    - `Deal · {deal_title}` or `Deal · 20% Off`
- On expanded card:
  - Show a “Deal” section:
    - Title
    - Days
    - Fine print
- There is **no automatic date-based activation/expiration** in MVP.
  - Staff manually control whether a deal is active by setting/clearing fields or an explicit `deal_active` flag.

---

## 6. Roles & permissions

**Decision 6.1 — Role types**

For a single-store deployment, we support:

- `budtender`
- `manager`
- `admin` (optional; can be treated the same as manager at first)

**Decision 6.2 — Permissions matrix (MVP)**

- **Budtender**
  - Can create/edit/publish their own picks.
  - Can create/edit/publish their own custom boards.
  - Can toggle `is_active` on their own picks.
  - Can use “Show to customer” for any published board.

- **Manager/Admin**
  - Can edit/publish/archive any pick.
  - Can create/edit/publish any board (auto or custom).
  - Can mark boards as kiosk defaults (when display binding is implemented).
  - Can deactivate users if needed (future).

This keeps control simple: budtenders run their own picks; managers curate store-level behavior.

---

## 7. Draft lifetime and cleanup

**Decision 7.1 — No automatic deletion of drafts**

- Drafts are never auto-deleted by time in MVP.
- Users are responsible for cleaning up old drafts.

**Decision 7.2 — Surfacing drafts**

- My Picks has a **Drafts** filter/section showing:
  - New pick drafts.
  - Edit drafts (“Editing: X — Draft”).
- Drafts are sorted by `updated_at` descending.
- Drafts older than a threshold (e.g. 30 days) can be visually marked as “Stale” but not deleted automatically.

**Decision 7.3 — No forced reopen**

- On login/reopen:
  - The app does not hard-redirect users back into an old draft editor.
  - Drafts are surfaced via a small banner/indicator or Drafts view only.

---

## 8. Product availability / out-of-stock

**Decision 8.1 — Manual availability control (MVP)**

- MVP does **not** integrate fully with live menu stock status.
- Out-of-stock is handled by:
  - Budtenders or managers toggling `is_active = false`, or
  - Archiving the pick if it’s long-term gone.

**Decision 8.2 — Future integration**

- Future phases may introduce:
  - `is_available` synced with POS/menu.
  - “Currently unavailable” labels instead of immediate hiding.

For now, the product stays simple and staff-driven.

---

## 9. Navigation, landing, and SPA behavior

**Decision 9.1 — SPA-only internal navigation**

- All internal navigation uses client-side routing.
- No `window.location` or `location.reload()` calls inside the app for normal flows.
- No raw `<a href>` for in-app routes; use SPA link components.

**Decision 9.2 — Last route resume**

- The app updates `user_preferences.last_route` and `last_board_id` on meaningful route changes.
- On login/open:
  - If `last_route` is valid, navigate there.
  - Else navigate to `/boards`.
- If `last_route` or `last_board_id` is invalid:
  - Redirect to `/boards`.
  - Optionally show a small toast.

**Decision 9.3 — Display mode defaults**

- Kiosks/TVs target a specific board id (or display endpoint id in future).
- If a display-targeted board is unpublished or missing:
  - Show a neutral “Display not configured” state or fallback to a configured default board.

---

## 10. Legacy fields & future hooks

Certain fields from older schemas are intentionally **not** used in MVP behavior but remain reserved:

- `doodle_key` — future hook for visual doodles/characters.
- `category_line` — future hook for extra labeling.
- `special_role` — future hook for things like “Medical-focused”, “Dab expert”, etc.

Unless explicitly reintroduced elsewhere, these fields should be:
- Kept in the schema only if they help future stories, or
- Cleaned up during a later refactor to avoid confusion.

---

## 11. Implementation guidance

When in doubt, agents and devs should:

1. Check the relevant functional doc (01–08).
2. Then check this **Decision Log** (09):
   - If something appears underspecified or conflicting, this file is the tie-breaker.
3. Prefer patterns users already know:
   - Treat drafts like Gmail.
   - Treat auto boards like smart playlists/grids.
   - Treat custom boards like Figma/Notion canvases.
   - Treat Published/Unpublished like “draft vs live” in a CMS.

This closes the main gaps and gives Guidelight a coherent, “real app” decision spine.

---

## 12. Profile avatar, guest mode, and release notifications

**Decision 12.1 — Unified profile avatar**

- The profile avatar in the top-right is the **single entry point** for:
  - My Profile
  - Preferences
  - What’s new (release notes)
  - Help & Feedback
  - Sign out
- This matches established patterns in major apps and gives users one obvious place to manage their account.

**Decision 12.2 — Guest mode is read-only**

- Guest sessions are allowed but **cannot modify data**:
  - No creating/editing/publishing picks.
  - No creating/editing boards.
- Guests can:
  - View published boards in Display mode.
  - Browse picks in a read-only way.
- Guest mode is entered explicitly via “Continue as guest” when not signed in.
- The guest profile menu clearly states “You’re browsing as Guest” and offers a Sign in action.

**Decision 12.3 — Release notes via “What’s new”**

- Guidelight maintains a lightweight `releases` concept with versioned notes.
- `user_preferences.last_seen_release_id` tracks what each user has already seen.
- When a new release is available:
  - A **small toast** notifies the user that Guidelight has been updated.
  - The toast links to a “What’s new” panel and can be dismissed.
  - Dismissing or viewing marks the latest release as seen.
- The Profile menu always provides a “What’s new” entry so users can revisit release notes at any time.

**Decision 12.4 — Feedback integration**

- The “What’s new” panel always ends with a gentle pointer to the existing reporting bubble:
  - e.g. “If anything feels off after this update, tap the feedback bubble to send a quick report.”
- This ensures a tight loop between:
  - Changes shipped.
  - Users noticing issues.
  - Feedback getting back to the team.
