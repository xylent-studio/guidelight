---
**Status:** ✅ Implemented  
**Last Updated:** 2025-11-28  
**Implementation:** `src/components/ui/`, `src/components/picks/`
---

# 07_COMPONENT_LIBRARY_AND_STATES – Simplified MVP (v9)

This file lists the core UI components needed for the "My picks + Show to customer + Team" MVP.

---

## 1. HeaderBar

Used on My picks, Show to customer, Team, and Display Mode (with slight variations).

Props (conceptual):

- `title`
- `subtitle?`
- `showAvatar?`
- `showBackButton?`
- `showOverflow?`
- `rightActions?` (e.g., Login, Change)

States:

- My picks: avatar + title + overflow.
- Show to customer: back + title.
- Team: title only + back (optional).
- Display: title + Change + Login.

---

## 2. MyPickCard

Used in My picks list.

Content:

- Product name
- Brand
- Star rating
- Tags
- Optional compact lab line

States:

- Normal
- Loading skeleton
- Error fallback

Interactions:

- Tap → Edit pick.

---

## 3. GuestPickCard

Used in Show to customer and Display Mode.

Content:

- Product name
- Brand
- Star rating
- Tags
- Optional short lab line (THC/CBD)

States:

- Normal
- Compact if space-constrained

No interactions (read-only).

---

## 4. CategoryChipsRow

Used in Show to customer and Display Mode.

- Chips:
  - All, Flower, Vapes, Edibles, Beverages, Concentrates, Wellness, Other.
- Behavior:
  - All is selected by default.
  - Chips are tappable and scrollable horizontally on small screens.

---

## 5. Primary Buttons

- **Add pick** – opens edit form in create mode.
- **Show to customer** – switches to customer view.

Buttons should be large and easy to tap on mobile.

---

## 6. EditPickForm

The EditPickForm is designed so that **quick add** is fast and obvious, with richer detail clearly optional.

Fields (grouped):

- **Quick info (required)**
  - Name
  - Brand
  - Category
  - Star rating
  - Tags (multi-select or free text chips)

- **Optional details**
  - Notes (multi-line, staff-only)
  - Lab info (THC, CBD, top terpenes)
  - COA upload

States:

- Create mode
- Edit mode
- Validation errors

The visual layout should make it clear that a pick can be created by filling out only the Quick info section; Optional details can be skipped without any warnings.

---

## 7. TeamScreen Components

- Invite form:
  - Email, name inputs
  - Send invite button

- Staff list:
  - Rows with name, email, role, status, row actions.

- Pending invites list:
  - Rows with email, invited by, status, row actions.

---

## 8. DisplayModeLayout

- Header with title, Change, and Login actions.
- CategoryChipsRow.
- Grid/list of GuestPickCards.

On mobile-width screens, this can collapse to a single-column list layout.
