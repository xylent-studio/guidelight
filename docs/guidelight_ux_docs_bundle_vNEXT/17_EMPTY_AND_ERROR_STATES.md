# 17 — Empty & Error States

This document defines friendly, predictable empty and error states so Guidelight never feels broken or hostile when there’s “nothing there” or something goes wrong.

---

## 1. Principles

- **Reassuring, not scary**:
  - Use calm language, no red exclamation marks unless truly needed.
- **Actionable**:
  - Whenever possible, show a primary action (e.g. “New pick”).
- **On brand**:
  - Light, conversational tone; respectful of staff time.

---

## 2. Empty states

### 2.1 My Picks — no picks yet

Message:

> “You don’t have any picks yet.”  
> “Tap **New pick** to add your first recommendation.”

Actions:

- Primary button: **New pick**.

If there are drafts but no published picks:

> “You haven’t published any picks yet.”  
> “Finish a draft or create a new pick.”

Show a link/chip to view Drafts.

### 2.2 Boards — no custom boards

For Boards home, if there are no custom boards:

> “You don’t have any custom boards yet.”  
> “Use **New board** to create a curated set for a theme, event, or guest type.”

Auto boards (store, per-budtender) may still exist; they should be shown separately so this empty state only reflects custom boards.

### 2.3 Board canvas — no items on a board

If a board exists but has no items:

> “This board is empty.”  
> “Use **Add pick** to drop in a recommendation, or **Add text** to add a title or notes.”

Buttons:

- **Add pick**
- **Add text**

### 2.4 Display mode — no picks on the board

In `/display/:boardId` when the board has no visible picks:

> “There’s nothing to show on this board yet.”  
> “Ask a budtender to add picks from the Guidelight editor.”

No buttons needed in pure customer/kiosk mode, but staff-held devices could show a hint back to editor.

---

## 3. Error states

### 3.1 Failed to load picks/boards

Generic data load failure:

> “We couldn’t load this right now.”  
> “Check your connection and try again.”

Buttons:

- **Retry**

For repeated failures, optionally show:

> “If this keeps happening, let a manager know.”

### 3.2 Board not found or access denied

If `/boards/:boardId` is invalid or access is restricted:

> “This board isn’t available.”  
> “It may have been deleted, renamed, or you don’t have access.”

Button:

- **Back to boards**

### 3.3 Display mode — missing/unpublished board

If `/display/:boardId` targets:

- A board that doesn’t exist, or
- An unpublished board (for kiosk/TV):

Show:

> “This display is not configured yet.”  
> “Ask a manager to choose a board for this screen.”

In staff-held testing scenarios, you may show:

> “This board isn’t published yet.”  
> “Publish it in the editor to make it available.”

---

## 4. Form-level errors

In pick editor or board editor:

- Inline field errors should be:
  - Short and specific.
  - Color-coded gently (e.g. subtle red text, no harsh blocks).
- Example:
  - Under one-liner: “Keep this under 120 characters.”

Global form errors (e.g. failure to save draft):

> “We couldn’t save your changes.”  
> “Your latest updates might not be stored. Try again in a moment.”

If failure persists:

- Suggest:
  - “Copy important text somewhere safe before closing.”

---

## 5. Network / offline hints (nice-to-have)

If detecting offline:

> “You’re offline.”  
> “Changes will save when you’re back online.” (if we support this), or  
> “Some actions may not work until you’re back online.”

This is optional for MVP but fits well with the persistence document.

---

## 6. Summary

- Empty states guide users toward the next step (“New pick”, “Add pick”, “New board”).
- Error states are calm, honest, and avoid blaming the user.
- Display/Kiosk failures are phrased in terms of configuration rather than “error” screens.
