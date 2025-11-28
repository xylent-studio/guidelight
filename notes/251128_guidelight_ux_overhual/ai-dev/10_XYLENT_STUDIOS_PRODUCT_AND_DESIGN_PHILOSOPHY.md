---
**Status:** ✅ Active (Reference)  
**Last Updated:** 2025-11-28  
**Purpose:** Design philosophy and principles for all Guidelight work
---

# 10_XYLENT_STUDIOS_PRODUCT_AND_DESIGN_PHILOSOPHY – v8

Audience: designers, developers, and AI agents working on Guidelight.

This file encodes how we think about product and design so that implementation work aligns with the intent of Xylent Studios and Guidelight.

---

## 1. Product Identity

Guidelight is an **internal tool** for a single dispensary, not a consumer app or marketing site.

Core identity traits:

- **Calm and focused** – each screen should have a clear primary purpose.
- **Human-centered** – optimized for budtenders and managers doing real work.
- **Studio-grade** – cohesive, intentional visual and interaction design.

When in doubt, choose behavior that supports:

- Budtenders in real-time conversations.
- Managers maintaining a clean, professional operation.

---

## 2. Design Values (Operationalized)

1. **Clarity over cleverness**
   - Avoid metaphorical or joke-y labels for core navigation.
   - Prefer “My board”, “Guest View”, “Manage team” over cute names.
   - Tooltips and helper text should be literal and helpful.

2. **Minimal surface area**
   - Minimize always-visible controls (sidebars, toolbars).
   - Use overlays and context menus for second-level functions.
   - Each primary screen should communicate one main idea at a glance.

3. **Consistency over novelty**
   - Do not invent one-off interaction patterns for a single screen.
   - Reuse component patterns (HeaderBar, chips, cards, overlays) whenever possible.
   - Use consistent wording and label sets across all surfaces.

4. **Respect real workflows**
   - Nate is on the floor, juggling guests and product.
   - Alicia juggles staffing, scheduling, and store ops.
   - Avoid flows that require multi-step wizarding for simple tasks.

5. **Safe defaults and progressive disclosure**
   - First-time users should be functional without touching settings.
   - Advanced options (lab visibility, house boards, analytics) should be discoverable, not mandatory.

---

## 3. Visual & Interaction Direction

### 3.1 Visual

- Typography: modern sans-serif, comfortable sizes, good line spacing.
- Layout: generous padding, clear grouping, strong visual hierarchy.
- Color:
  - Core UI uses a calm, neutral base.
  - Accents for states (selected chip, primary buttons).
  - No neon-heavy or overwhelmingly bright core layouts.

### 3.2 Interaction

- Mobile-first:
  - Designed for thumbs; avoid tiny targets.
  - Rely on scroll, tap, and simple overlays.
- Desktop:
  - Maintain the same mental model as mobile, with more breathing room.
  - Avoid drastically different layouts between mobile and desktop.

---

## 4. Professionalism & QA Expectations

1. **No half-implemented features**
   - If a feature is stubbed out but not finished, hide it behind a feature flag or omit the UI entirely.
   - Avoid visible “coming soon” states in core flows.

2. **Error and edge-case handling**
   - All API calls should have visible error handling (banner or inline messages).
   - Empty states must be explicitly designed (no blank white screens).

3. **Copy quality**
   - Copy should be short, correct, and consistent.
   - No lorem ipsum in live surfaces.
   - No slang, memes, or sarcasm in system messages.

4. **Security & privacy basics**
   - Do not expose staff email addresses in customer-facing views.
   - Do not log or display sensitive info in client-side debug UIs.

---

## 5. Collaboration Hints for AI Agents

When modifying or adding features:

- Always check relevant spec files in `ai-dev/` before designing your own flows.
- If a new feature touches many surfaces, update:
  - IA (`02_GUIDELIGHT_INFORMATION_ARCHITECTURE`).
  - Screen specs (`03`, `04`, `05`).
  - Flows and edge cases (`08`).

If you must choose between “shiny new feature” and “maintain coherence with existing flows,” choose coherence.
