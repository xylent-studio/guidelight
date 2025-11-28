---
**Status:** ✅ Active (Reference)  
**Last Updated:** 2025-11-28  
**Implementation:** Principles applied throughout v2.x codebase
---

# 01_GUIDELIGHT_UX_PRINCIPLES_AND_CONTEXT – Reality-First MVP (v9)

Audience: designers, developers, and AI coding agents.

This version of the UX spec is intentionally **simplified** to match how budtenders and managers will actually use Guidelight in a real dispensary.

---

## 1. Problem & Scope

Guidelight is an internal web app for a single dispensary.

**MVP scope:**
- Budtenders maintain a personal list of recommended products (**My picks**).
- With one tap, they show these picks to customers in a full-screen view with a category picker.
- Managers manage invites and basic account status from a single **Team** screen.

We are **not** building a complex visual board editor in this version.

---

## 2. Primary Users & Priorities

1. **Budtenders (phones, on the floor) – top priority**
   - Must be able to:
     - See their picks quickly.
     - Add/edit a pick in under a minute.
     - Show picks to a customer via a full-screen view.

2. **Managers (phone or desktop) – secondary**
   - Use the same My picks view as budtenders.
   - Occasionally open the Team screen to invite staff and reset passwords.

3. **Customers (no login) – indirect**
   - See a full-screen list/grid of picks shown by staff on phones or POS/monitor.

Priority order:

1. My picks usability on mobile.
2. Show to customer full-screen behavior.
3. Simple Team management.
4. Everything else (boards, analytics, themes, etc.) comes later.

---

## 3. Core UX Principles (MVP)

1. **My picks, not “boards”**
   - The main concept shown to staff is a **list of picks**, not a board editor.
   - Internally we can still support board-like ideas later, but the UI speaks in simple terms: “My picks”.

2. **One-tap customer view**
   - There must always be a clear, easy-to-hit button that:
     - Goes full-screen.
     - Shows the current user’s picks.
     - Adds a category picker like Dispense (`All` first).

3. **Minimum chrome**
   - No sidebars on mobile.
   - One header bar at most.
   - No nested menus unless strictly necessary.

4. **Fast over fancy**
   - Any change to a pick should be possible in under ~30 seconds.
   - If a feature would slow down common actions, it is probably out of scope for MVP.

5. **Familiar patterns**
   - Use list + detail patterns from Gmail and messaging apps.
   - Use category/filter chips like Dispense/AIQ.
   - Use full-screen, simple canvases for customer views like Google Maps bottom sheet expanded.

6. **Quick add vs optional detail**
   - Every creation/edit form should have a small set of clearly required fields at the top.
   - Richer metadata (notes, lab info, uploads) is visually separated as optional.
   - Budtenders must be able to add a pick quickly without touching optional sections.

---

## 4. Non-Goals (for This MVP)

- No drag-and-drop custom layout editor.
- No multiple named boards per budtender.
- No deep analytics dashboards.
- No per-pick customer visibility toggles.

The design and data model should not block these in the future, but they are not part of this phase.
