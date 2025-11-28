---
**Status:** ✅ Active (Reference)  
**Last Updated:** 2025-11-28  
**Purpose:** QA checklist for UI changes
---

# 13_GUIDELIGHT_UI_QUALITY_CHECKLIST – v8

This file provides a checklist for developers, designers, and reviewers to use before shipping changes.

---

## 1. Functionality

- [ ] All buttons and links on the changed screen work as expected.
- [ ] No visible “TODO”, placeholder, or lorem ipsum text.
- [ ] Error states have been tested (network fail, empty data, etc.).
- [ ] Feature flags or incomplete features are hidden from normal users.

## 2. Consistency

- [ ] Component usage matches patterns in existing screens (HeaderBar, cards, chips).
- [ ] Labels and terms match existing documentation (e.g., “My board”, “Guest View”, “Manage team”).
- [ ] Icons and colors follow the existing design language.

## 3. Copy

- [ ] All visible text has been reviewed for clarity and tone.
- [ ] No internal jargon or implementation detail is exposed to end-users.
- [ ] Error messages are specific and non-technical.

## 4. Layout & Responsiveness

- [ ] Screen works at typical phone widths (portrait) without horizontal scrolling.
- [ ] Behavior at larger widths (tablet/desktop) is reasonable and preserves the mental model.
- [ ] No overlapping or clipped text at common breakpoints.

## 5. Accessibility

- [ ] Tap targets are large enough on mobile.
- [ ] Text is readable in customer-facing contexts (Guest/Display).
- [ ] Color is not the only way to convey critical information.
- [ ] Basic keyboard navigation works on desktop.

## 6. Data & Privacy

- [ ] No staff emails or sensitive data appear in customer-facing views.
- [ ] Lab info is displayed responsibly and without exaggerated claims.
- [ ] Debug logging does not expose secrets or sensitive user data.

---

Use this checklist before merging PRs or shipping builds. If an item cannot be met, document why and whether it affects budtenders, managers, or customers.
