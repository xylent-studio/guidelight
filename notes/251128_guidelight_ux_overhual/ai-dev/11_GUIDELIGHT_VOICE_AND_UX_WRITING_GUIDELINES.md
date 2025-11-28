---
**Status:** ✅ Active (Reference)  
**Last Updated:** 2025-11-28  
**Implementation:** `src/lib/copy.ts` follows these guidelines
---

# 11_GUIDELIGHT_VOICE_AND_UX_WRITING_GUIDELINES – v8

This file defines how Guidelight should "sound" in UI copy.

---

## 1. Voice Characteristics

- **Clear** – no jargon where it isn’t needed.
- **Calm** – avoids alarmist or urgent language except for true errors.
- **Professional but warm** – speaks like a competent coworker, not a marketer.

Tone guidelines:

- Use everyday language: “Add pick”, “Show board”, “Invite team member”.
- Avoid slang: no “dope”, “fire”, etc. in core UI.
- Avoid humor as default; if used, keep it extremely light and rare.

---

## 2. Writing Principles

1. **Say the thing directly**
   - ✅ “No picks on this board yet.”
   - ❌ “Looks like you haven’t blessed this board with your favorites.”

2. **Use parallel structures**
   - If one button is “Add pick”, the opposite should be “Remove from board”, not “Delete this thing forever”.

3. **Prefer verbs over nouns**
   - “Manage team” over “Team management hub”.
   - “Send invite” over “Invitation dispatch”.

4. **Keep labels short**
   - Aim for 1–3 words on buttons and nav items.
   - Use help text rather than long button labels when needed.

---

## 3. Common Phrases & Patterns

### 3.1 Boards & Picks

- “My board” – the user’s main board.
- “Pick” – a recommended product.
- “Active on board” – a pick included on the board.

Avoid:

- “Loadout”, “deck”, or metaphorical names in core UI.

### 3.2 States & Empty Messages

- Empty board (staff view):
  - “Your board is empty. Add picks from the row above.”

- Empty board (customer view):
  - “No picks on this board yet. Ask your budtender for recommendations.”

- Network error:
  - “Guidelight can’t load picks right now. Check your connection and try again.”

### 3.3 Manage Team

- “Send invite”
- “Resend invite”
- “Cancel invite”
- “Disable account” / “Enable account”

Avoid technical wording like “deactivate user entity” or “invalidate token” in UI.

---

## 4. Error Messaging

- Be specific but non-technical.
- Suggest next steps when reasonable.

Examples:

- Login failure:
  - “Incorrect email or password.”
- Unknown error:
  - “Something went wrong loading picks. Try again in a moment.”

Avoid:

- Exposing internal error codes or stack traces to end-users.

---

## 5. Microcopy for Sensitive Areas

### 5.1 Lab Info

- Use neutral language:
  - “THC”, “CBD”, “Terpenes”.
- Avoid making medical claims:
  - No “this cures insomnia” language.

### 5.2 Ratings

- Neutral prompts:
  - “How strongly would you recommend this?”
- Avoid implying moral judgment or shame.

---

## 6. Documentation & Comments

When adding new UI, annotate in comments (or design docs) what the copy is trying to accomplish so future changes keep the same intent.
