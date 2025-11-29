# 14 — Design System & Visual Language (Delta for vNEXT)

> **Source of truth:** The canonical design system for Guidelight lives in the repo at:
>
> - `docs/GUIDELIGHT_DESIGN_SYSTEM.md`
> - `docs/UI_STACK.md`
> - `docs/BUDTENDER_PICKS_BOARD_SPEC.md` (for the original board look)
>
> Those documents define the **palette, typography, component patterns, and overall visual philosophy** for the app that already match the current implementation (My Picks, Display Mode, board template).  
> This file is **not** a competing design system. It is a **delta**: guidance for how to extend the existing system to cover boards, drafts, and new flows **without re-skinning the app**.

---

## 1. Non‑negotiables for agents and devs

1. **Do not change the core palette or typography.**
   - Reuse the tokens and classes defined in `GUIDELIGHT_DESIGN_SYSTEM.md` and the Tailwind/theme configuration already in the repo.
   - No new brand colors. If a new status/state is needed, derive it from the existing scales (e.g., darker/lighter shades of existing greens/neutrals).

2. **Do not introduce a second UI kit.**
   - Keep using **Tailwind + shadcn/ui + Radix UI**.
   - New interactions (board canvas, draft badges, profile dropdown, etc.) should be built from these primitives.

3. **Reuse existing card patterns.**
   - The **My Pick card**, **Guest/customer card**, and **Budtender Picks Board cards** should be unified into a small set of reusable card components with **stylistic consistency**, not redesigned independently.

---

## 2. Extensions specific to boards and drafts

### 2.1 Board canvas

When building out board editing and display:

- Use the **existing board visual template** (`BUDTENDER_PICKS_BOARD_SPEC.md`) as the baseline for customer-facing boards.
- For the **staff-side canvas**, keep the same card styles but add:
  - Subtle drag handles or reordering affordances.
  - A slim toolbar at the top (board name, status, Add pick, Add text).
  - Autosave feedback (“Saved · Just now”) using existing typography and subdued colors.

### 2.2 Draft and status indicators

Drafts and edit states should feel native to the current UI:

- Use **small badges/chips** in the existing style to show status:
  - `Draft`, `Published`, `Unpublished board`, etc.
- Use subtle text + icon patterns for “Unsaved / Saving / Saved” instead of new colors or flashy animations.

### 2.3 Display-only vs editable modes

The same card and board components will have two modes:

- **Customer / display mode:**
  - No controls, no hover chrome, no drag handles.
  - Clean, calm, high-contrast text for distance readability.
- **Staff / edit mode:**
  - Minimal, but clearly present controls:
    - Edit on click/tap.
    - Remove from board icon on each card.
    - Add pick in the toolbar.

These modes should be implemented as **props or variants** on shared components, not separate visual designs.

---

## 3. Interaction details to keep consistent

- Respect existing **corner radius, shadows, spacing, and typography scale** from `GUIDELIGHT_DESIGN_SYSTEM.md`.
- Use the same **chip/pill styles** for:
  - Product type, time of day, intensity, infused, budget level (`$ / $$ / $$$`), etc.
- Use **Lucide icons** (as in the current codebase) for:
  - Eye/show-hide toggles.
  - Drag handles (if needed).
  - Draft/status indicators where an icon is helpful.

---

## 4. What agents should actually do

When extending the UI for boards, drafts, and catalog:

1. **Read the existing design docs in `docs/` first.**
2. Implement new screens and states by:
   - Composing existing components.
   - Creating new variants of existing patterns (cards, chips, toolbars, modals).
3. Avoid adding new global styles, colors, or typography unless absolutely necessary and clearly justified.

If in doubt, prefer **“looks like we already shipped it”** over “fresh new concept art.”

---

(For archival purposes, the original vNEXT draft of this file is preserved below.)

---

# 14 — Design System & Visual Language (MVP)

This document sets a baseline visual system so Guidelight feels like a cohesive, flagship app rather than a collection of one-off screens. It doesn’t lock in exact colors/values forever, but defines the **semantic tokens** and patterns that agents and devs must respect.

---

## 1. Foundations

### 1.1 Design stack

- **Framework:** React + Tailwind CSS.
- **Component primitives:** Radix UI under the hood (via shadcn/ui).
- **Component library:** shadcn/ui for buttons, dialogs, dropdowns, etc.
- **Icons:** Lucide.

Goal: build on proven patterns, not reinvent base components.

### 1.2 Layout

- Max content width for main app: ~1200–1280px on desktop.
- Use consistent spacing scale (Tailwind):
  - 4, 8, 12, 16, 24, 32, 40… (1, 2, 3, 4, 6, 8, 10…).
- Prefer flexible layouts with CSS grid and flex; avoid pixel-perfect rigidity.

---

## 2. Color system (semantic)

We use semantic tokens, not raw hex codes in components.

Example semantic tokens (names, not final values):

- **Backgrounds**
  - `bg-app` — overall app background (slightly tinted, low contrast).
  - `bg-surface` — card/sheet background.
  - `bg-subtle` — chip backgrounds, subtle panels.

- **Text**
  - `text-primary` — main text.
  - `text-muted` — secondary labels, helper text.
  - `text-on-accent` — text on primary accent.

- **Accent**
  - `accent-primary` — main brand accent (aligned with store/Xylent palette).
  - `accent-soft` — tinted backgrounds for accent areas.

- **Status**
  - `status-success` — published/ok.
  - `status-warning` — draft, caution states.
  - `status-critical` — error/failed.

- **Borders & Lines**
  - `border-subtle` — card separators, soft outlines.
  - `border-strong` — focus states, selected items.

The actual mapping to HSL/HEX lives in the Tailwind config / CSS variables, but **components must reference these semantic tokens**.

---

## 3. Typography

### 3.1 Type stack

- App UI font: clean, modern sans-serif (e.g. Inter, system fallback if needed).
- Code/tech bits (if used): monospaced (e.g. JetBrains Mono).

### 3.2 Hierarchy

- `heading-1` — screen titles (Boards, My Picks).
- `heading-2` — section titles (Board name in header).
- `heading-3` — card titles (product name).
- `body` — base content.
- `caption` — meta text (time, last updated).

Rules:

- Avoid more than 3–4 font sizes per screen.
- Use weight and size to create clarity, not decoration.

---

## 4. Components & patterns

### 4.1 Buttons

Use consistent button variants:

- Primary:
  - Solid, `accent-primary` background, `text-on-accent` text.
  - For key actions like “Publish”, “New pick”.
- Secondary:
  - Outline or subtle background.
  - For supporting actions, e.g. “Show to customer”.
- Tertiary/text:
  - Minimal, mostly for less-critical actions or inline links.

Buttons should avoid loud gradients or mismatched shapes.

### 4.2 Cards

Pick cards and board cards:

- Rounded corners (e.g. Tailwind `rounded-xl` or `rounded-2xl`).
- Soft shadow or subtle border, not both heavy at once.
- Comfortable padding (e.g. `p-4` on desktop, `p-3` on mobile).
- Clear separation between:
  - Title (product name).
  - Meta (brand, type).
  - Content (one-liner).
  - Footer (chips, rating).

### 4.3 Chips / pills

Used for:

- Time of day.
- Effects.
- Status (Draft, Published).
- Budget (`$`, `$$`, `$$$`).

Style:

- Rounded-full shape.
- Soft background tint.
- Text in `text-muted` or `text-primary` depending on prominence.

### 4.4 Modals & panels

For:

- “What’s new” panel.
- Release notes.
- Confirmations (archive, publish).

Use shadcn dialog/sheet patterns:

- Dim background.
- Rounded panel.
- Clear primary/secondary buttons at the bottom.

---

## 5. Motion & feedback

- Subtle only:
  - Fade/slide for modals.
  - Slight scale/opacity changes on hover.
- No aggressive or distracting animations.
- Keep transitions around 150–250ms.

---

## 6. Visual consistency rules

- No raw inline styles for colors, radii, spacing; use tokens and Tailwind classes mapped to the design system.
- Avoid mixing too many accent colors:
  - One primary accent, a few neutral states.
- Respect whitespace:
  - Better to show fewer cards with breathing room than cram everything.

---

## 7. Future extensions

Later we can add:

- Dark mode.
- Store-specific theming (e.g. State of Mind vs another shop).
- More formal token docs (e.g. in Figma or a separate `tokens.json`).

For now, this guide is enough to keep agents and devs aligned so Guidelight looks like one coherent product.

