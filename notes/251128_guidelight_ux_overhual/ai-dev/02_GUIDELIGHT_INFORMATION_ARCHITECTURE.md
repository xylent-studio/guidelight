---
**Status:** ✅ Implemented  
**Last Updated:** 2025-11-28  
**Implementation:** Routes, entities, and screens implemented in v2.0
---

# 02_GUIDELIGHT_INFORMATION_ARCHITECTURE – Reality-First MVP (v9)

This file describes the IA for the simplified "My picks + Show to customer + Team" MVP.

---

## 1. Core Entities

### 1.1 User

- id
- name
- email
- role: `budtender | manager`
- avatarUrl (optional)
- isActive (boolean)

### 1.2 Pick

A budtender’s recommended product.

- id
- userId (owner)
- productName
- brand
- category: Flower | Vapes | Edibles | Beverages | Concentrates | Wellness | Other
- rating: integer 1–5
- tags: array of strings (Sleep, Social, Newbie-safe, etc.)
- notes: text (staff-only)
- thcPercent: number (optional)
- cbdPercent: number (optional)
- topTerpenes: string (optional, free text)
- coaFileUrl: string or null
- createdAt, updatedAt

There is no explicit Board entity in this MVP UI. A user’s “board” is conceptually just the ordered list of their picks.

Ordering can be:

- `sortIndex` (optional) or
- Derived from `createdAt` and `updatedAt` (implementation detail).

---

## 2. Main Screens / Routes

### 2.1 Login

- `/login`
- Email + password, forgot password.

### 2.2 My picks (staff home)

- `/` (for authenticated users)
- Shows the current user’s list of picks.

### 2.3 Show to customer (customer view)

- Could be `/show` or an internal state toggle from My picks.
- Full-screen view optimized for customers.
- Same data (current user’s picks), different presentation.

### 2.4 Team (manager view)

- `/team`
- Only accessible to users with `role = manager`.
- Shows invites and staff list.

### 2.5 Display Mode (optional)

- `/display`
- Full-screen customer-friendly view similar to Show to customer, but for POS/monitor.
- May show a selected user’s picks or a default user.

---

## 3. Navigation Overview

Unauthenticated:

- `/login` → login form.
- `/display` → public display of a default staff member’s picks or a placeholder message.

Authenticated:

- `/` → My picks (current user)
- `/show` (or mode toggle) → full-screen customer view from current user’s picks
- `/team` → Team view (manager only)
- `/display` → Display Mode (optional, can still be used while logged in)

Return paths:

- From Show to customer → back to My picks.
- From Team → back to My picks.
