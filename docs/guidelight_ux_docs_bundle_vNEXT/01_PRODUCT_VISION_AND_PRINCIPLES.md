# 01 — Product Vision & Principles

## What Guidelight is now

Guidelight is an internal tool for cannabis dispensaries that turns budtender recommendations into clear, trustworthy, and easily-presented **boards**:

- Budtenders create and maintain **picks** (their favorite products, with context).
- Picks are placed onto **boards** — canvas-like layouts they can arrange, label, and present.
- Customers see **clean, stable boards**, not work-in-progress edits.

Think of it as a mix of:

- **Gmail Drafts** — nothing is “live” until you hit Send / Save.
- **Trello / Notion / Figma boards** — flexible boards/canvases you can arrange visually.
- **Spotify playlists** — curated sets that are easy to switch, browse, and share.

---

## Core outcomes

1. **Guided, confident choices for customers**
   - Customers should be able to glance at a board and quickly see:
     - Which budtender is guiding them
     - A handful of clearly-differentiated picks
     - Simple, familiar cues (stars, tags, potency line)
   - No dense menu pages, no walls of text.

2. **Zero data loss for staff**
   - Any pick being created or edited is **always recoverable** until it’s explicitly saved or cancelled.
   - Any board layout is **autosaved** as they move things around.
   - Staff never feel punished for switching devices, closing a tab, or being interrupted.

3. **Stable, predictable customer view**
   - Customers only ever see:
     - **Published picks**
     - On **Published boards**
   - Drafts and ongoing edits never leak into customer-facing displays.

4. **Familiar patterns from flagship apps**
   - Drafts behave like **email drafts** (Gmail / Outlook).
   - Boards behave like **project boards / canvases** (Trello, Notion, Miro, Figma).
   - Navigation uses common patterns:
     - Board list like a playlists / workspace list.
     - Board picker like a document switcher.
     - Status and visibility toggles like “Published / Draft” in content tools.

---

## Product principles

1. **Progressive disclosure**
   - Staff see as much detail as they need.
   - Customers see only the essentials by default, with deeper info on tap/click.

2. **Separation of “editing” vs “presenting”**
   - Edit modes are clearly distinct (forms, handles, eye icons).
   - Customer modes are clean, big-text, and tap-to-expand, with no controls.

3. **Single source of truth**
   - Pick content lives in one place.
   - Boards reference picks; they don’t duplicate content.
   - Visibility (“eye”) is defined on the pick, not per-board, to keep expectations simple.

4. **No dead ends**
   - Drafts are always recoverable until discarded.
   - Boards are never in a weird half-applied state — what you see is what’s saved.

5. **Friction only where it matters**
   - Publishing a pick or board is intentional.
   - Day-to-day arranging on a board is frictionless and automatically saved.

---

## Scope of this vNEXT spec

This spec covers:

- Updated **information architecture** for picks, drafts, boards, and display.
- The **data model** for picks, pick_drafts, boards, board_items, and user preferences.
- **Staff flows** (create/edit picks, manage boards, publish/unpublish).
- **Customer flows** (view boards, switch boards, expand/collapse cards).
- **Persistence & drafts behavior** across devices.
- **UI patterns** aligned with familiar apps and usable on both mobile and desktop.

It is written for:
- AI coding agents (Cursor, ChatGPT Agent Mode, etc.).
- Human developers joining the project.
- Product/UX collaborators who need a clear mental model of how Guidelight should behave.
