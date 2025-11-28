
# Guidelight Product Overview – Reality-First MVP (v9)

Guidelight is an internal web app for a single cannabis dispensary, built by Xylent Studios.

The **first job** of this app is simple:

> Let each budtender keep a clean list of their favorite products (“My picks”) and show that list to customers in a full-screen, easy-to-read view.

Everything else comes later.

---

## 1. What Guidelight Does in This MVP

For this version, Guidelight focuses on three things:

1. **My picks (staff view on phones)**  
   - Each budtender has a personal list of recommended products.  
   - They can add, edit, and remove picks in seconds.
   - Higher-rated and recently updated picks naturally float to the top of the list.

2. **Show to customer (full-screen view)**  
   - A single tap turns “My picks” into a customer-facing, full-screen view.  
   - A category picker across the top (like Dispense) lets staff quickly filter:  
     `All, Flower, Vapes, Edibles, Beverages, Concentrates, Wellness, Other`.

3. **Team management (for managers)**  
   - Managers can invite staff, see who’s active, and reset passwords.  
   - All from one simple “Team” screen.

There is no complex “board builder” in this MVP. The main mental model is:

> “These are my picks” → “Now I’m showing them to a customer.”

---

## 2. Who Uses Guidelight

### 2.1 Budtenders (primary users)

- Use their own phones.
- Open Guidelight in short bursts during a shift.
- Reality: they will only use it if it’s **fast and obvious**.

For them, Guidelight is:

- A short list of their favorite products.
- A big “Show to customer” button.
- A fast way to add or tweak a pick.

### 2.2 Managers

- Also use “My picks” like budtenders.
- Occasionally open the **Team** view to:
  - Send or resend invites.
  - Reset a staff member’s password.
  - Disable an account.

They do not see a heavy admin dashboard; just a straightforward team list.

### 2.3 Customers (indirect users)

- Never log in.
- Only see a **full-screen customer view** when staff tap “Show to customer” or when Display Mode is open on a POS/monitor.
- The customer view shows:
  - Product name and brand.
  - Star rating (1–5, familiar).
  - Simple tags like Sleep, Social, Newbie-safe.
  - Optionally, a small line like “THC 23% · CBD 1%” if entered.

---

## 3. Devices & Environment

### 3.1 Staff Phones

- Modern Android / iOS devices.
- Mostly portrait orientation.
- Used one-handed while talking to customers.

Design implications:

- Home screen is a **scrolling list**, not a complex layout.
- Big tap targets for “Add pick” and “Show to customer”.
- No sidebars; minimal header.

### 3.2 POS / Display

- Browser on a POS terminal or small PC, sometimes hooked to a monitor.
- Runs a **Display Mode** that shows a full-screen version of the picks list with the same category picker.

Design implications:

- Large, legible text.
- High contrast.
- No controls or chrome that distract customers.

---

## 4. Core Surfaces in This MVP

### 4.1 My Picks (staff home)

What budtenders see after login.

Rough layout (mobile):

```text
[ Avatar ]  My picks                [ ⋯ ]

────────────────────────────────────────
★ Gary Payton – Pot and Head
  Sleep · Social · Newbie-safe

★ Blue Lobster – Brand
  Heavy hitter · Night

[ + Add pick ]
[ Show to customer ]
```

From here, staff can:

- Tap a pick to edit it.
- Tap **+ Add pick** to create a new one.
- Tap **Show to customer** to switch into full-screen customer mode.

### 4.2 Customer View (Show to customer)

A full-screen view that starts from the current user’s picks and adds:

- A **category picker** at the top, like Dispense’s filters, with an “All” option first.
- Auto layout of cards:
  - On phones: single-column vertical list.
  - On larger screens: multi-column grid, but same content.

Example (mobile):

```text
[ Back ]  Showing Justin's picks

[ All ] [ Flower ] [ Vapes ] [ Edibles ] ...

★ Gary Payton – Pot and Head
  Sleep · Social · Newbie-safe

★ Blue Lobster – Brand
  Heavy hitter · Night
```

No edit controls are shown here.

### 4.3 Display Mode (POS / monitor)

- Uses the same idea as “Show to customer”, but:
  - Always full-screen.
  - May show a selected staff member’s picks or, later, a house list.
- Includes the same category picker row (`All` first) for quick filtering.

### 4.4 Team (manager view)

A single, simple screen:

- Invite new staff (email + optional name).
- List all staff with:
  - Name, email, role (budtender/manager), status (active/disabled).
  - Actions: reset password, disable/enable.
- List of pending invites with actions: resend, cancel.

No separate tabs are needed in this MVP.

---

## 5. Picks, Stars, and Lab Info (Simplified)

### 5.1 Picks

Each pick stores:

- Product name & brand.
- Category (Flower, Vapes, etc.).
- Star rating (1–5).
- Tags (Sleep, Social, Newbie-safe, etc.).
- Optional staff notes (staff-only).
- Optional THC and CBD values.
- Optional “top terpenes” text.
- Optional COA PDF.

This is enough for meaningful recommendations without overwhelming staff.

### 5.2 Ratings

- Simple, familiar 1–5 star control.
- In the future, we may add a “Signature pick” badge or tiers, but not in this MVP.

### 5.3 Lab Info

- Entry UI focuses on:
  - THC (%)
  - CBD (%)
  - Optional free-text “Top terpenes”.
- Detailed lab rows (individual cannabinoids/terpenes) are considered future enhancements.

Customer views:

- Show at most a short line like: `THC 23% · CBD 1%` if provided.
- All detailed lab content remains staff-only.

---

## 6. Onboarding & Daily Use

### Onboarding

- Staff receive an invite email and set a password.
- On first login:
  - Confirm their name (and optionally add a photo).
  - Land directly on **My picks**.

No long wizard. The empty state of My picks gently encourages them to add a couple of products.

### Daily Use

For budtenders:

1. Open Guidelight.
2. See “My picks” list.
3. Tap **Show to customer** during a conversation, use the category picker if needed.
4. Occasionally add or edit picks between customers.

For managers:

- Occasionally open the **Team** screen to handle invites and basic account maintenance.

This is the level of simplicity we are intentionally targeting for the first real, usable version.
