---
**Status:** ✅ Active (Reference)  
**Last Updated:** 2025-11-28  
**Purpose:** Accessibility guidelines for all UI work
---

# 12_GUIDELIGHT_ACCESSIBILITY_AND_INCLUSIVE_DESIGN – v8

This file outlines key accessibility and inclusivity considerations for Guidelight.

---

## 1. Visual Accessibility

- **Contrast:** Ensure text meets at least WCAG AA contrast guidelines on customer-facing surfaces.
- **Font sizes:** Use sufficiently large text on Display Mode and Guest View so it is readable at a distance.
- **Color usage:**
  - Never rely on color alone to indicate state (e.g., use icons/labels + color).
  - Avoid red/green-only distinctions for status.

---

## 2. Touch Targets & Spacing

- Minimum hit size: 44x44 px for tappable elements on mobile.
- Avoid tightly packed tap targets, especially for:
  - Category chips.
  - Icon buttons (overflow, staff switcher).

---

## 3. Language & Cognitive Load

- Plain language wherever possible.
- Short sentences; avoid long, complex instructions.
- Customer-facing views should be easily understood even if someone is tired or under the influence.

Examples:

- Use “Sleep” instead of “nocturnal sedation support.”
- Use “Newbie-safe” instead of “low-threshold experiential entry.”

---

## 4. Keyboard & Screen Reader Considerations (Desktop)

- All interactive elements should be reachable by keyboard (tab order).
- Provide proper labels for controls (aria-labels, etc.) where appropriate.
- Avoid hover-only interactions for core functionality; ensure click/tap alternatives.

---

## 5. Inclusive Content Guidelines

- Avoid stereotypes in text or visuals (e.g., assumptions about who uses cannabis).
- Do not make medical claims or judgments about use.
- Treat staff and customers as adults making informed choices with guidance.

---

## 6. Error States

- Errors should be detectable both visually and programmatically.
- Use clear text explaining the issue and how to resolve it.

Example:

- “Your session expired. Please log in again.”

Avoid:

- Color-only cues like “field border turns red” with no accompanying text.
