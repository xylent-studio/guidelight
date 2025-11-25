# Guidelight MVP Screenshots

Screenshots captured for MVP launch documentation. All screenshots feature the demo user "allday" to showcase fully populated profiles and pick data.

**Captured:** November 25, 2025  
**Version:** Guidelight v1.4.0

---

## Quick Navigation

| Section | Light | Dark |
|---------|-------|------|
| [Login](#authentication) | [login-light.png](auth/login-light.png) | [login-dark.png](auth/login-dark.png) |
| [Budtender Cards](#customer-view---budtender-selection) | [budtender-cards-light.png](customer-view/budtender-cards-light.png) | [budtender-cards-dark.png](customer-view/budtender-cards-dark.png) |
| [Flower Picks](#customer-view---product-categories) | [flower-picks-light.png](customer-view/flower-picks-light.png) | [flower-picks-dark.png](customer-view/flower-picks-dark.png) |
| [Pre-rolls](#customer-view---product-categories) | [prerolls-picks-light.png](customer-view/prerolls-picks-light.png) | [prerolls-picks-dark.png](customer-view/prerolls-picks-dark.png) |
| [Vapes](#customer-view---product-categories) | [vapes-picks-light.png](customer-view/vapes-picks-light.png) | [vapes-picks-dark.png](customer-view/vapes-picks-dark.png) |
| [Staff Profile](#staff-view) | [profile-light.png](staff-view/profile-light.png) | [profile-dark.png](staff-view/profile-dark.png) |
| [Picks Management](#staff-view) | [picks-list-light.png](staff-view/picks-list-light.png) | [picks-list-dark.png](staff-view/picks-list-dark.png) |
| [Staff Grid](#staff-management) | [staff-grid-light.png](staff-management/staff-grid-light.png) | [staff-grid-dark.png](staff-management/staff-grid-dark.png) |
| [Feedback Panel](#staff-management) | [feedback-light.png](staff-management/feedback-light.png) | [feedback-dark.png](staff-management/feedback-dark.png) |

---

## Directory Structure

```
docs/screenshots/
├── README.md                 # This file
├── auth/                     # Authentication screens
│   ├── login-light.png
│   └── login-dark.png
├── customer-view/            # Customer-facing interface
│   ├── budtender-cards-*.png
│   ├── flower-picks-*.png
│   ├── prerolls-picks-*.png
│   └── vapes-picks-*.png
├── staff-view/               # Staff pick management
│   ├── profile-*.png
│   ├── picks-list-*.png
│   └── picks-*.png (variations)
└── staff-management/         # Manager admin panel
    ├── staff-grid-*.png
    └── feedback-*.png
```

---

## Authentication

The login page is the entry point for all staff. Email/password authentication via Supabase Auth.

| Screenshot | Theme | Key Features |
|------------|-------|--------------|
| `login-light.png` | Light | Email field, password field, sign-in button, Guidelight branding |
| `login-dark.png` | Dark | Same features with dark theme styling |

**Related Guide:** [Staff Guide - First Login](../USER_GUIDE_STAFF.md#your-first-login)

---

## Customer View - Budtender Selection

The budtender selector shows profile cards for all visible staff. Customers can tap a card to see that budtender's picks.

| Screenshot | Theme | Key Features |
|------------|-------|--------------|
| `budtender-cards-light.png` | Light | Profile cards with name, vibe, expertise; horizontal scroll on mobile |
| `budtender-cards-dark.png` | Dark | Same layout with dark theme |

**Shows:** The "allday" demo user card with full profile data.

**Related Guide:** [Staff Guide - Using Customer View](../USER_GUIDE_STAFF.md#using-customer-view)

---

## Customer View - Product Categories

Each category tab shows the selected budtender's picks with product cards featuring:
- Product name and brand
- Star rating (1-5, half-stars supported)
- "Why I Love It" description
- Best For timing (Day/Evening/Night/Anytime)

### Flower

| Screenshot | Theme | Content |
|------------|-------|---------|
| `flower-picks-light.png` | Light | 4 flower picks from allday (ADK Blue Lobster, Terp Town Cake Pop, etc.) |
| `flower-picks-dark.png` | Dark | Same picks with dark theme styling |

### Pre-rolls

| Screenshot | Theme | Content |
|------------|-------|---------|
| `prerolls-picks-light.png` | Light | 3 pre-roll picks from allday |
| `prerolls-picks-dark.png` | Dark | Same picks with dark theme |

### Vapes

| Screenshot | Theme | Content |
|------------|-------|---------|
| `vapes-picks-light.png` | Light | 3 vape picks from allday |
| `vapes-picks-dark.png` | Dark | Same picks with dark theme |

**Related Guide:** [Staff Guide - Adding Your Picks](../USER_GUIDE_STAFF.md#adding-your-picks)

---

## Staff View

Staff View is where budtenders manage their profile and picks. Only accessible when logged in.

### Profile Section

| Screenshot | Theme | Key Features |
|------------|-------|--------------|
| `profile-light.png` | Light | Profile card with vibe, expertise, tolerance; theme toggle in footer |
| `profile-dark.png` | Dark | Same with dark theme |

**Shows:** allday's fully populated profile with:
- Vibe: "Relaxed, detail-nerdy budtender who loves all-day functional highs..."
- Expertise: "All-day chill without overdoing it"
- Tolerance: "Steady flyer" level

### Picks Management

| Screenshot | Theme | Key Features |
|------------|-------|--------------|
| `picks-list-light.png` | Light | Category tabs, pick cards with edit/delete, "Add Pick" buttons |
| `picks-list-dark.png` | Dark | Same layout with dark theme |

**Additional Files:**
- `picks-overview-light.png` - Viewport-only view of top section
- `picks-categories-light.png` - Category tabs detail

**Related Guide:** [Staff Guide - Managing Your Picks](../USER_GUIDE_STAFF.md#managing-your-picks)

---

## Staff Management

Staff Management is the manager-only admin panel for team oversight.

### Staff Grid

| Screenshot | Theme | Key Features |
|------------|-------|--------------|
| `staff-grid-light.png` | Light | Staff cards with role, status toggles, invite button |
| `staff-grid-dark.png` | Dark | Same with dark theme |

**Shows:**
- "Can sign in" toggle for each staff member
- "Show in Customer View" toggle
- Role badges (Manager, Budtender)
- Invite Staff button

### Feedback Panel

| Screenshot | Theme | Key Features |
|------------|-------|--------------|
| `feedback-light.png` | Light | Feedback submissions list, type badges (bug/suggestion) |
| `feedback-dark.png` | Dark | Same with dark theme |

**Related Guide:** [Manager Guide - Managing Staff](../USER_GUIDE_MANAGER.md#managing-staff)

---

## Theme Support

Guidelight supports three theme modes:
- **Light Mode** — Clean cream/white backgrounds with forest green accents
- **Dark Mode** — Rich dark surfaces with green highlights
- **System Mode** — Follows OS/browser preference

The theme toggle is located in the footer of Staff View and Staff Management screens.

---

## Demo User

The "allday" demo user is configured with:
- **Full profile:** Vibe, expertise, tolerance descriptions
- **22 picks:** Across all 8 categories (Flower, Pre-rolls, Vapes, Edibles, Beverages, Concentrates, Wellness, Topicals)
- **Varied ratings:** 4-5 stars with realistic distribution
- **Detailed descriptions:** Engaging "Why I Love It" text for each pick

**Visibility Control:** The demo user can be hidden from Customer View using the "Show in Customer View" toggle in Staff Management. This allows managers to:
- Show allday during demos and presentations
- Hide allday during normal dispensary operations

---

## Using These Screenshots

### For Documentation
Link to screenshots using relative paths:
```markdown
![Login Screen](screenshots/auth/login-light.png)
```

### For Presentations
All screenshots are full-page captures suitable for:
- Slide decks
- Training materials
- Client presentations
- App store listings (with cropping)

### Naming Convention
`[feature]-[variant]-[theme].png`
- `budtender-cards-light.png`
- `flower-picks-dark.png`
- `staff-grid-light.png`

---

## Related Documentation

- [Staff Guide](../USER_GUIDE_STAFF.md) — Budtender onboarding
- [Manager Guide](../USER_GUIDE_MANAGER.md) — Administrative tasks
- [README](../../README.md) — Project overview
- [Design System](../GUIDELIGHT_DESIGN_SYSTEM.md) — Colors, typography, components

---

*Guidelight v1.4.0 — Xylent Studios for State of Mind*
