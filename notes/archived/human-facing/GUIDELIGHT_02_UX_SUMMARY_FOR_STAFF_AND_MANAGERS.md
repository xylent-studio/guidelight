
# Guidelight UX Summary – Reality-First MVP (v9)

This document summarizes how Guidelight feels to use in its first real version, from the perspective of staff and managers.

---

## 1. Budtenders – Day-to-Day

### 1.1 Starting a shift

- Nate unlocks his phone and opens Guidelight.
- He logs in once; after that, it remembers him.
- He lands on **My picks**:

```text
My picks
────────────────────────
★ Gary Payton – Pot and Head
  Sleep · Social · Newbie-safe

★ Blue Lobster – Brand
  Heavy hitter · Night

[ + Add pick ]
[ Show to customer ]
```

He can see at a glance:

- What he’s currently recommending.
- Which products he might want to update or remove.

### 1.2 Adding a new pick (quick)

- Nate taps **+ Add pick**.
- Simple form:
  - Product name
  - Brand
  - Category (dropdown)
  - 1–5 stars
  - Tags (Sleep, Social, etc.)
  - Optional: THC/CBD, top terpenes, notes
- He taps **Save** and it appears in his list.

Total time: well under a minute once he’s familiar.

### 1.3 Showing picks to a customer

- With a customer at the counter, Nate taps **Show to customer**.
- The screen goes full-screen and clean:

```text
[ Back ]  Showing Nate's picks

[ All ] [ Flower ] [ Vapes ] [ Edibles ] ...

★ Gary Payton – Pot and Head
  Sleep · Social · Newbie-safe

★ Blue Lobster – Brand
  Heavy hitter · Night
```

He can:

- Tap **Flower** to focus just on flower picks.
- Scroll with the customer to talk through options.

There are no edit icons or admin clutter in this view.

### 1.4 Going back to editing

- When done, Nate taps **Back**.
- He’s back on **My picks**, where he can edit or add.

---

## 2. Managers – Day-to-Day

### 2.1 Using Guidelight as a budtender

- Alicia logs in and sees **My picks** just like Nate.
- She uses the same UI to maintain her own recommendations.

There is no separate “manager home.”

### 2.2 Managing the team

From **My picks**, Alicia opens the menu (`⋯`) and taps **Team**.

She sees:

```text
Team
────────────────────────
[ Invite new staff ]

Justin   Manager    Active
  [ Reset password ] [ Disable ]

Nate     Budtender  Active
  [ Reset password ] [ Disable ]

Pending invites
alldayairfpv@gmail.com   Pending
  [ Resend ] [ Cancel ]
```

She can:

- Invite new staff by email.
- Resend or cancel invites.
- Reset passwords.
- Disable or re-enable accounts.

When she’s done, she goes back to **My picks**.

---

## 3. Display Mode (Optional Storefront Display)

If the store wants a monitor showing picks:

- They open Guidelight’s Display URL on a POS or small PC.
- A full-screen view appears with:

  - Category picker across the top (`All` first).  
  - A nicely laid-out list or grid of picks (similar content to customer view).

- Staff can choose which budtender’s picks to show (and later, a house list).

Customers in line see:

- Clean, readable product names.
- Simple tags that describe effects or use cases.

---

## 4. What’s Deliberately *Not* in This MVP

To keep this version simple and usable, we are **not** shipping:

- Complex “board canvas” editing tools.
- Drag-and-drop layout editing.
- Multiple named boards per budtender.
- Per-pick customer visibility switches.
- Heavy lab-data tables in the main UI.
- Multi-tab admin dashboards.

Those ideas can come later. For now, the focus is:

> “My picks” list → “Show to customer” full-screen view → simple Team management.
